import { AuthPage } from "@/pages/AuthPage";
import { Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { useAuth } from "../hooks/useAuth";

export const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      {token ? (
        <>
          <Route path="/*" element={<PrivateRoutes />} />
          <Route path="/login" element={<Navigate to={"/"} replace />} />
        </>
      ) : (
        <>
          <Route path="*" element={<Navigate to={"/login"} replace />} />
          <Route path="/login" element={<AuthPage />} />
        </>
      )}
    </Routes>
  );
};
