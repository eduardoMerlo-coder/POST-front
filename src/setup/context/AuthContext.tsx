import { createContext, useReducer, useContext, type ReactNode } from "react";
import {
  ActionEnum,
  type ActionType,
  type AuthContextType,
} from "../auth.types";

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  role: null,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

const authReducer = (state: AuthContextType, action: ActionType) => {
  switch (action.type) {
    case ActionEnum.Login: {
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("user", action.payload.user.name);
      localStorage.setItem("role", action.payload.user.role);
      return { ...state, ...action.payload };
    }
    case ActionEnum.Logout: {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      return { ...state, accessToken: null };
    }

    default:
      return state;
  }
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, dispatch] = useReducer(authReducer, {
    accessToken: localStorage.getItem("accessToken"),
    user: localStorage.getItem("user"),
    role: localStorage.getItem("role"),
  });

  console.log(authState);

  return (
    <AuthContext.Provider value={{ ...authState, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
