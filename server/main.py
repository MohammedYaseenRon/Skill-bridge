import os
import json
import base64
import warnings
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# ── Suppress noisy pydantic / google-genai warnings ──────────────────────────
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")
warnings.filterwarnings("ignore", message=".*_api_client.*")

# ── Load .env from the app sub-folder ────────────────────────────────────────
# Use dotenv only when the file actually exists to avoid silent failures.
_env_path = Path("app/.env")
if _env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(_env_path)

# ── Stderr suppressor ─────────────────────────────────────────────────────────
# ISSUE FIXED: The original class used open(os.devnull, 'w') but never closed
# the handle if an exception escaped __exit__.  Using os.open + os.fdopen is
# cleaner; but simplest correct fix is to store the handle and always close it.
class SuppressStderr:
    def __enter__(self):
        self._original_stderr = sys.stderr
        self._devnull = open(os.devnull, "w")
        sys.stderr = self._devnull
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stderr = self._original_stderr
        self._devnull.close()   # ← was missing; caused handle leak
        return False            # never swallow exceptions


# ── Google ADK / Gemini – optional dependency ────────────────────────────────
GOOGLE_ADK_AVAILABLE = False
root_agent = None  # ISSUE FIXED: was referenced before assignment when import failed

try:
    app_folder = Path("app")
    agent_folder = app_folder / "agent"

    # Create missing package skeleton only when needed
    if not agent_folder.exists():
        app_folder.mkdir(exist_ok=True)
        agent_folder.mkdir(exist_ok=True)
        (app_folder / "__init__.py").touch()
        (agent_folder / "__init__.py").touch()

    agent_file = agent_folder / "agent.py"
    if not agent_file.exists():
        agent_file.write_text(
            '"""Basic agent configuration for SkillBridge ADK."""\n\n'
            "from google.adk.agents import LLMAgent\n"
            "from google.adk.models import GoogleLLM\n\n"
            'root_agent = LLMAgent(\n'
            '    name="SkillBridge Assistant",\n'
            '    model=GoogleLLM(model_name="gemini-2.0-flash-exp"),\n'
            '    system_instruction=(\n'
            '        "You are a helpful assistant for the SkillBridge platform, "\n'
            '        "a skill-sharing community where users can learn from mentors "\n'
            '        "and share their expertise."\n'
            '    ),\n'
            ')\n'
        )

    from google.genai.types import Part, Content, Blob
    from google.adk.runners import InMemoryRunner
    from google.adk.agents import LiveRequestQueue
    from google.adk.agents.run_config import RunConfig
    from google.genai import types

    # ISSUE FIXED: sys.path manipulation must happen BEFORE the local import
    if str(Path.cwd()) not in sys.path:
        sys.path.insert(0, str(Path.cwd()))

    from app.agent.agent import root_agent  # noqa: F811
    GOOGLE_ADK_AVAILABLE = True
    print("Google ADK imported successfully.")

except ImportError as e:
    print(f"Google ADK not available: {e}")
except Exception as e:
    print(f"Error setting up Google ADK: {e}")


# ── Local application imports ─────────────────────────────────────────────────
# ISSUE FIXED: original code imported `create_db_and_tables` and `engine`
# at module level, but used them inside lifespan – that's fine.  What was
# broken is that `models` and `seed` were imported only inside functions
# without ensuring the DB engine is available.  Keep them at module level
# where possible so import errors surface early.
from database import create_db_and_tables, engine
from users import router as users_router

RECOMMENDATIONS_AVAILABLE = False
try:
    from api.recommendation import router as recommendations_router
    RECOMMENDATIONS_AVAILABLE = True
    print("Recommendations module imported successfully.")
except ImportError as e:
    print(f"Recommendations module not available: {e}")

SESSIONS_AVAILABLE = False
try:
    from api.sessions import router as sessions_router
    SESSIONS_AVAILABLE = True
    print("Sessions module imported successfully.")
except ImportError as e:
    print(f"Sessions module not available: {e}")

MESSAGES_AVAILABLE = False
try:
    from api.messages import router as messages_router
    MESSAGES_AVAILABLE = True
    print("Messages module imported successfully.")
except ImportError as e:
    print(f"Messages module not available: {e}")


APP_NAME = "SkillBridge ADK Streaming"
STATIC_DIR = Path("static")


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Starting up application resources ---")

    # 1. Database
    print("Initializing database…")
    create_db_and_tables()
    print("Database initialized.")

    # 2. Verify / seed data
    # ISSUE FIXED: deferred imports inside lifespan are fine but using
    # top-level imports here avoids repeated attribute look-ups and makes
    # missing modules fail loudly at startup rather than at first request.
    from sqlmodel import Session, select
    from models import UserProfile

    try:
        with Session(engine) as session:
            mentors  = session.exec(select(UserProfile).where(UserProfile.is_mentor == True)).all()   # noqa: E712
            learners = session.exec(select(UserProfile).where(UserProfile.is_mentor == False)).all()  # noqa: E712
            print(f"  DB: {len(mentors)} mentor(s), {len(learners)} learner(s)")

            if not mentors:
                print("WARNING: No mentors – running seeder…")
                try:
                    from seed import main as run_seeder
                    run_seeder()
                    print("Seeder completed.")
                except ImportError:
                    print("ERROR: seed.py not found.")
                except Exception as exc:
                    print(f"ERROR running seeder: {exc}")
    except Exception as exc:
        print(f"DB verification failed: {exc}")

    # 3. ADK Runner
    if GOOGLE_ADK_AVAILABLE:
        try:
            with SuppressStderr():
                app.state.runner = InMemoryRunner(app_name=APP_NAME, agent=root_agent)
            print("ADK Runner initialised.")
        except Exception as exc:
            print(f"Failed to initialise ADK Runner: {exc}")
            app.state.runner = None
    else:
        app.state.runner = None
        print("Google ADK features disabled.")

    yield

    # Shutdown
    print("--- Shutting down ---")
    with SuppressStderr():
        runner = getattr(app.state, "runner", None)
        if runner:
            try:
                if hasattr(runner, "close"):
                    runner.close()
                print("ADK Runner closed.")
            except Exception:
                pass


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SkillBridge API",
    description="A platform connecting learners with mentors for skill development",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Static files ──────────────────────────────────────────────────────────────
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(users_router, prefix="/api/users", tags=["Users"])

if RECOMMENDATIONS_AVAILABLE:
    app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendations"])
    print("Recommendations endpoints registered.")

if SESSIONS_AVAILABLE:
    app.include_router(sessions_router, prefix="/api/sessions", tags=["Sessions"])
    print("Sessions endpoints registered.")

if MESSAGES_AVAILABLE:
    app.include_router(messages_router, prefix="/api/messages", tags=["Messages"])
    print("Messages endpoints registered.")


# ── Debug endpoints ───────────────────────────────────────────────────────────
# ISSUE FIXED: these handlers returned raw dicts on error, which FastAPI
# serialises as 200 OK.  Use JSONResponse with an appropriate status code
# so clients can distinguish success from failure.

@app.get("/api/debug/mentors")
async def debug_mentors():
    from sqlmodel import Session, select
    from models import UserProfile
    try:
        with Session(engine) as session:
            mentors = session.exec(
                select(UserProfile).where(UserProfile.is_mentor == True)  # noqa: E712
            ).all()
            return {
                "total_mentors": len(mentors),
                "mentors": [
                    {
                        "id": m.id,
                        "name": m.full_name,
                        "email": m.email,
                        "skills": m.skills,
                        "expertise": m.expertise,
                        "experience_years": m.experience_years,
                        "hourly_rate": m.hourly_rate,
                        "location": m.location,
                    }
                    for m in mentors[:5]
                ],
            }
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})


@app.get("/api/debug/learners")
async def debug_learners():
    from sqlmodel import Session, select
    from models import UserProfile
    try:
        with Session(engine) as session:
            learners = session.exec(
                select(UserProfile).where(UserProfile.is_mentor == False)  # noqa: E712
            ).all()
            return {
                "total_learners": len(learners),
                "learners": [
                    {
                        "id": l.id,
                        "name": l.full_name,
                        "email": l.email,
                        "skills_interested": l.skills_interested,
                        "current_skills": l.current_skills,
                        "learning_goal": l.learning_goal,
                        "experience_level": l.experience_level,
                        "location": l.location,
                    }
                    for l in learners[:5]
                ],
            }
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})


# ── Core routes ───────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def read_index():
    index_file = STATIC_DIR / "index.html"
    if STATIC_DIR.exists() and index_file.exists():
        return FileResponse(index_file)
    # ISSUE FIXED: returning a plain dict when FileResponse was declared as
    # response_class causes a type mismatch.  Removed the misleading
    # `response_class` annotation so FastAPI auto-serialises the dict.
    return {
        "message": "SkillBridge API is running",
        "google_adk": GOOGLE_ADK_AVAILABLE,
        "recommendations": RECOMMENDATIONS_AVAILABLE,
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "google_adk_available": GOOGLE_ADK_AVAILABLE,
        "recommendations_available": RECOMMENDATIONS_AVAILABLE,
        "database": "connected",
    }


# ── Google ADK live-session helpers (only when available) ─────────────────────
if GOOGLE_ADK_AVAILABLE:

    # ISSUE FIXED: active_sessions dict was defined only inside the `if` block
    # but was referenced from both endpoint functions.  Ensure it is created
    # before both endpoint definitions reference it.
    active_sessions: dict = {}

    async def start_agent_session(
        runner: "InMemoryRunner", user_id: str, is_audio: bool = False
    ):
        session = await runner.session_service.create_session(
            app_name=APP_NAME, user_id=user_id
        )
        modality = "AUDIO" if is_audio else "TEXT"
        run_config = RunConfig(
            response_modalities=[modality],
            session_resumption=types.SessionResumptionConfig(),
        )
        live_request_queue = LiveRequestQueue()
        live_events = runner.run_live(
            session=session,
            live_request_queue=live_request_queue,
            run_config=run_config,
        )
        return live_events, live_request_queue

    async def agent_to_client_sse(live_events):
        async for event in live_events:
            if event.turn_complete or event.interrupted:
                yield f"data: {json.dumps({'turn_complete': event.turn_complete, 'interrupted': event.interrupted})}\n\n"
                continue

            # ISSUE FIXED: chained `and` short-circuits but returns the last
            # falsy value, not None.  Explicit checks are clearer and safer.
            if not (event.content and event.content.parts):
                continue
            part: "Part" = event.content.parts[0]

            if part.inline_data and part.inline_data.mime_type.startswith("audio/pcm"):
                if part.inline_data.data:
                    yield f"data: {json.dumps({'mime_type': 'audio/pcm', 'data': base64.b64encode(part.inline_data.data).decode('ascii')})}\n\n"
                continue

            if part.text and event.partial:
                yield f"data: {json.dumps({'mime_type': 'text/plain', 'data': part.text})}\n\n"

    @app.get("/events/{user_id}")
    async def sse_endpoint(user_id: int, request: Request, is_audio: str = "false"):
        runner = getattr(request.app.state, "runner", None)
        if not runner:
            # ISSUE FIXED: returning a plain dict from an endpoint that is
            # intended to stream SSE results in a confusing 200 JSON response.
            # Return a proper error response instead.
            return JSONResponse(
                status_code=503,
                content={"error": "ADK Runner not available"},
            )

        user_id_str = str(user_id)
        try:
            with SuppressStderr():
                live_events, live_request_queue = await start_agent_session(
                    runner, user_id_str, is_audio.lower() == "true"
                )
            active_sessions[user_id_str] = live_request_queue
        except Exception as exc:
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to start session: {exc}"},
            )

        def cleanup():
            with SuppressStderr():
                try:
                    live_request_queue.close()
                except Exception:
                    pass
            active_sessions.pop(user_id_str, None)  # ISSUE FIXED: safe pop

        async def event_generator():
            try:
                async for data in agent_to_client_sse(live_events):
                    yield data
            finally:
                cleanup()

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    @app.post("/send/{user_id}")
    async def send_message_endpoint(user_id: int, request: Request):
        user_id_str = str(user_id)
        live_request_queue = active_sessions.get(user_id_str)
        if not live_request_queue:
            return JSONResponse(
                status_code=404,
                content={"error": "Session not found"},
            )

        try:
            message = await request.json()
            mime_type = message["mime_type"]
            data = message["data"]

            if mime_type == "text/plain":
                content = Content(role="user", parts=[Part.from_text(text=data)])
                live_request_queue.send_content(content=content)
            elif mime_type == "audio/pcm":
                live_request_queue.send_realtime(
                    Blob(data=base64.b64decode(data), mime_type=mime_type)
                )
            else:
                return JSONResponse(
                    status_code=415,
                    content={"error": f"Unsupported mime type: {mime_type}"},
                )

            return {"status": "sent"}
        except KeyError as exc:
            # ISSUE FIXED: missing keys in the payload caused an unhandled
            # KeyError that propagated as a 500.  Catch and return 422.
            return JSONResponse(
                status_code=422,
                content={"error": f"Missing field in request body: {exc}"},
            )
        except Exception as exc:
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to send message: {exc}"},
            )

else:
    # ── Fallback endpoints ────────────────────────────────────────────────────
    @app.get("/events/{user_id}")
    async def sse_endpoint_fallback(user_id: int):
        return JSONResponse(
            status_code=503,
            content={"error": "Google ADK features are not available."},
        )

    @app.post("/send/{user_id}")
    async def send_message_endpoint_fallback(user_id: int):
        return JSONResponse(
            status_code=503,
            content={"error": "Google ADK features are not available."},
        )