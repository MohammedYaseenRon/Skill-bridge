"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginCredentials, RegisterData, Token } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "auth_token";

// Types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ user: User; access_token: string }>;
  register: (data: RegisterData) => Promise<{ user: User; access_token: string }>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: Partial<User> };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check existing session
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case "AUTH_ERROR":
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case "AUTH_LOGOUT":
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "UPDATE_USER":
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    default:
      return state;
  }
};

// Normalize user: ensure both role and is_mentor are always set
function normalizeUser(userData: any): User {
  const is_mentor = userData.is_mentor ?? (userData.role === "mentor");
  return {
    ...userData,
    is_mentor,
    role: is_mentor ? "mentor" : "learner",
  };
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        dispatch({ type: "AUTH_LOGOUT" });
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          dispatch({ type: "AUTH_SUCCESS", payload: normalizeUser(userData) });
        } else {
          localStorage.removeItem(TOKEN_KEY);
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    checkAuthStatus();
  }, []);

  // Refresh user from server
  const refreshUser = async (): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        dispatch({ type: "AUTH_SUCCESS", payload: normalizeUser(userData) });
      }
    } catch {
      // Silently fail
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ user: User; access_token: string }> => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store token
      localStorage.setItem(TOKEN_KEY, data.access_token);

      const normalizedUser = normalizeUser(data.user);
      dispatch({ type: "AUTH_SUCCESS", payload: normalizedUser });

      return { ...data, user: normalizedUser };
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<{ user: User; access_token: string }> => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Registration failed");
      }

      localStorage.setItem(TOKEN_KEY, result.access_token);
      const normalizedUser = normalizeUser(result.user);
      dispatch({ type: "AUTH_SUCCESS", payload: normalizedUser });

      return { ...result, user: normalizedUser };
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: "AUTH_LOGOUT" });
  };

  const clearError = (): void => dispatch({ type: "CLEAR_ERROR" });

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper to get the stored token
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};