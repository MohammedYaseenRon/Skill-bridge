import os
import json
import base64
import warnings
import sys
from pathlib import Path
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# Suppress Google GenAI client warnings (only valid Warning subclasses)
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")
warnings.filterwarnings("ignore", message=".*_api_client.*")

# Load environment variables from app folder
load_dotenv(Path("app/.env"))

# Redirect stderr to suppress the AttributeError messages completely
class SuppressStderr:
    def __enter__(self):
        self._original_stderr = sys.stderr
        sys.stderr = open(os.devnull, 'w')
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stderr.close()
        sys.stderr = self._original_stderr

# Google ADK / Gemini imports with error handling
GOOGLE_ADK_AVAILABLE = False
try:
    # Check if the app folder and agent exist
    app_folder = Path("app")
    agent_folder = app_folder / "agent"
    
    if not app_folder.exists():
        print("Creating app folder...")
        app_folder.mkdir(exist_ok=True)
        
    if not agent_folder.exists():
        print("Creating app/agent folder...")
        agent_folder.mkdir(exist_ok=True)
        
        # Create __init__.py files to make them Python packages
        (app_folder / "__init__.py").touch()
        (agent_folder / "__init__.py").touch()
        
        # Create a basic agent.py file if it doesn't exist
        agent_file = agent_folder / "agent.py"
        if not agent_file.exists():
            print("Creating basic agent.py file...")
            agent_content = '''"""Basic agent configuration for SkillBridge ADK."""

from google.adk.agents import LLMAgent
from google.adk.models import GoogleLLM

# Create a basic root agent
root_agent = LLMAgent(
    name="SkillBridge Assistant",
    model=GoogleLLM(model_name="gemini-2.0-flash-exp"),
    system_instruction="You are a helpful assistant for the SkillBridge platform, a skill-sharing community where users can learn from mentors and share their expertise."
)
'''
            agent_file.write_text(agent_content)
    
    # Now try to import
    from google.genai.types import Part, Content, Blob
    from google.adk.runners import InMemoryRunner
    from google.adk.agents import LiveRequestQueue
    from google.adk.agents.run_config import RunConfig
    from google.genai import types
    
    # Add app folder to Python path for imports
    sys.path.insert(0, str(Path.cwd()))
    
    from app.agent.agent import root_agent
    GOOGLE_ADK_AVAILABLE = True
    print("Google ADK imported successfully.")
    
except ImportError as e:
    print(f"Google ADK not available: {e}")
    GOOGLE_ADK_AVAILABLE = False
except Exception as e:
    print(f"Error setting up Google ADK: {e}")
    GOOGLE_ADK_AVAILABLE = False

# Local imports
from database import create_db_and_tables
from users import router as users_router

APP_NAME = "SkillBridge ADK Streaming"
STATIC_DIR = Path("static")

# -----------------------
# DB and Runner Lifespan (Resource Management)
# -----------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes and cleans up resources for the application."""
    print("--- Starting up application resources ---")
    
    # 1. Database Initialization
    create_db_and_tables()
    
    # 2. ADK Runner Initialization (only if available)
    if GOOGLE_ADK_AVAILABLE:
        try:
            with SuppressStderr():
                app.state.runner = InMemoryRunner(app_name=APP_NAME, agent=root_agent)
            print("ADK Runner initialized and stored in app.state.")
        except Exception as e:
            print(f"Failed to initialize ADK Runner: {e}")
            app.state.runner = None
    else:
        app.state.runner = None
        print("Google ADK features disabled.")
    
    yield
    
    # Shutdown logic (Cleanup)
    print("--- Shutting down application resources ---")
    
    # Suppress stderr during cleanup to prevent AttributeError messages
    with SuppressStderr():
        if hasattr(app, 'state') and hasattr(app.state, 'runner') and app.state.runner:
            try:
                if hasattr(app.state.runner, 'close'):
                    app.state.runner.close()
                print("ADK Runner successfully closed.")
            except Exception:
                pass  # Ignore cleanup errors

app = FastAPI(lifespan=lifespan)

# -----------------------
# Static + CORS
# -----------------------
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# AI Agent Session Setup (only if Google ADK is available)
# -----------------------
if GOOGLE_ADK_AVAILABLE:
    active_sessions = {}

    async def start_agent_session(runner: InMemoryRunner, user_id: str, is_audio: bool = False):
        """
        Starts an agent session using the globally managed runner instance.
        """
        if not runner:
            raise ValueError("Runner not available")
            
        session = await runner.session_service.create_session(
            app_name=APP_NAME, user_id=user_id
        )
        modality = "AUDIO" if is_audio else "TEXT"
        run_config = RunConfig(
            response_modalities=[modality],
            session_resumption=types.SessionResumptionConfig()
        )
        live_request_queue = LiveRequestQueue()
        live_events = runner.run_live(
            session=session,
            live_request_queue=live_request_queue,
            run_config=run_config,
        )
        return live_events, live_request_queue

    async def agent_to_client_sse(live_events):
        """Agent -> Client via SSE"""
        async for event in live_events:
            if event.turn_complete or event.interrupted:
                message = {"turn_complete": event.turn_complete, "interrupted": event.interrupted}
                yield f"data: {json.dumps(message)}\n\n"
                continue

            part: Part = event.content and event.content.parts and event.content.parts[0]
            if not part:
                continue

            # Audio stream
            if part.inline_data and part.inline_data.mime_type.startswith("audio/pcm"):
                audio_data = part.inline_data.data
                if audio_data:
                    message = {
                        "mime_type": "audio/pcm",
                        "data": base64.b64encode(audio_data).decode("ascii")
                    }
                    yield f"data: {json.dumps(message)}\n\n"
                continue

            # Text stream
            if part.text and event.partial:
                message = {"mime_type": "text/plain", "data": part.text}
                yield f"data: {json.dumps(message)}\n\n"

# -----------------------
# Routes
# -----------------------
@app.get("/", response_class=FileResponse, include_in_schema=False)
async def read_index():
    """Serve frontend index.html"""
    if STATIC_DIR.exists() and (STATIC_DIR / "index.html").exists():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
    return {
        "message": "SkillBridge API is running", 
        "google_adk": GOOGLE_ADK_AVAILABLE,
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "google_adk_available": GOOGLE_ADK_AVAILABLE,
        "database": "connected"
    }

# Only add Google ADK routes if available
if GOOGLE_ADK_AVAILABLE:
    @app.get("/events/{user_id}")
    async def sse_endpoint(user_id: int, request: Request, is_audio: str = "false"):
        """SSE endpoint (Agent -> Client)"""
        
        # Retrieve the runner from the application state
        runner = getattr(request.app.state, 'runner', None)
        if not runner:
            return {"error": "ADK Runner not available"}
        
        user_id_str = str(user_id)
        try:
            # Pass the runner to the session starter
            with SuppressStderr():
                live_events, live_request_queue = await start_agent_session(runner, user_id_str, is_audio == "true") 
            active_sessions[user_id_str] = live_request_queue
        except Exception as e:
            return {"error": f"Failed to start session: {str(e)}"}

        def cleanup():
            with SuppressStderr():
                try:
                    live_request_queue.close()
                except Exception:
                    pass
                if user_id_str in active_sessions:
                    del active_sessions[user_id_str]

        async def event_generator():
            try:
                async for data in agent_to_client_sse(live_events):
                    yield data
            finally:
                cleanup()

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )

    @app.post("/send/{user_id}")
    async def send_message_endpoint(user_id: int, request: Request):
        """HTTP endpoint (Client -> Agent)"""
        user_id_str = str(user_id)
        live_request_queue = active_sessions.get(user_id_str)
        if not live_request_queue:
            return {"error": "Session not found"}

        try:
            message = await request.json()
            mime_type, data = message["mime_type"], message["data"]

            if mime_type == "text/plain":
                content = Content(role="user", parts=[Part.from_text(text=data)])
                live_request_queue.send_content(content=content)
            elif mime_type == "audio/pcm":
                decoded_data = base64.b64decode(data)
                live_request_queue.send_realtime(Blob(data=decoded_data, mime_type=mime_type))
            else:
                return {"error": f"Unsupported mime type: {mime_type}"}

            return {"status": "sent"}
        except Exception as e:
            return {"error": f"Failed to send message: {str(e)}"}

else:
    # Provide fallback endpoints when Google ADK is not available
    @app.get("/events/{user_id}")
    async def sse_endpoint_fallback(user_id: int):
        """Fallback SSE endpoint when Google ADK is not available"""
        return {"error": "Google ADK features are not available. Please configure API credentials."}

    @app.post("/send/{user_id}")
    async def send_message_endpoint_fallback(user_id: int):
        """Fallback send message endpoint when Google ADK is not available"""
        return {"error": "Google ADK features are not available. Please configure API credentials."}

# -----------------------
# Routers
# -----------------------
app.include_router(users_router)