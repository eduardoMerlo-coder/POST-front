import { AuthPage } from "@/pages/AuthPage";
import { Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { useAuth } from "../context/AuthContext";

export const AppRoutes = () => {
  const { accessToken } = useAuth();

  console.log("accessToken", accessToken);
  return (
    <Routes>
      {accessToken ? (
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
