import type { Dispatch } from "react";

export const ActionEnum = {
  Login: "LOGIN",
  Logout: "LOGOUT",
  AuthIsReady: "AUTH_IS_READY",
} as const;

export type ActionType =
  | { type: typeof ActionEnum.Login; payload: Record<string, any> }
  | { type: typeof ActionEnum.Logout };

export interface AuthState {
  accessToken: string | null;
  user: string | null;
  role: string | null;
}

export interface DispatchFunctionType {
  dispatch?: Dispatch<ActionType>;
}

export type AuthContextType = AuthState & DispatchFunctionType;
