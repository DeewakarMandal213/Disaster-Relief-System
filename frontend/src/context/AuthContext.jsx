import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // RESTORE LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const response = await API.get("/auth/profile");

        setUser(response.data.user || response.data);
      } catch (error) {
        console.error(
          "Failed to restore authentication:",
          error
        );

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (email, password) => {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token);

    setUser(user);

    return user;
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (userData) => {
    const response = await API.post(
      "/auth/register",
      userData
    );

    return response.data;
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const updateProfile = async (profileData) => {
    const response = await API.put(
      "/auth/profile",
      profileData
    );

    const updatedUser =
      response.data.user || response.data;

    // Update global logged-in user immediately
    setUser(updatedUser);

    return updatedUser;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // =========================================================
  // CONTEXT
  // =========================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// =========================================================
// USE AUTH HOOK
// =========================================================

export function useAuth() {
  return useContext(AuthContext);
}