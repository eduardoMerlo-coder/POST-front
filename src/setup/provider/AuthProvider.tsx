import { useState, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const login = (newToken: string) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
  };
  const logout = () => {
    setToken("");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
