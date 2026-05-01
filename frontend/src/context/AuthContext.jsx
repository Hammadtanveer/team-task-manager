import { createContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.me();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch {
        // Token invalid – clear everything
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { access_token, user: userData } = data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  }, []);

  const signup = useCallback(async (name, email, password, role = "MEMBER") => {
    const { data } = await authAPI.signup({ name, email, password, role });
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
