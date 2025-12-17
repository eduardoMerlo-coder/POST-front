import { createContext, useReducer, useContext, type ReactNode } from "react";
import {
  ActionEnum,
  type ActionType,
  type AuthContextType,
} from "../auth.types";

export const AuthContext = createContext<AuthContextType>({
  user_id: null,
  role: null,
  user: null,
  business_type_id: null,
});

export const useAuth = () => useContext(AuthContext);

const authReducer = (state: AuthContextType, action: ActionType) => {
  switch (action.type) {
    case ActionEnum.Login: {
      localStorage.setItem("user", action.payload.user.email);
      localStorage.setItem("user_id", action.payload.user.id);
      localStorage.setItem("role", action.payload.user.user_metadata.role_id);
      localStorage.setItem(
        "business_type_id",
        action.payload.user.user_metadata.business_type_id
      );
      return { ...state, ...action.payload };
    }
    case ActionEnum.Logout: {
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("role");
      localStorage.removeItem("business_type_id");
      return { ...state, user: null, role: null, user_id: null };
    }

    default:
      return state;
  }
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, dispatch] = useReducer(authReducer, {
    user: localStorage.getItem("user"),
    role: localStorage.getItem("role"),
    user_id: localStorage.getItem("user_id"),
    business_type_id: localStorage.getItem("business_type_id"),
  });

  return (
    <AuthContext.Provider value={{ ...authState, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
