import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { RequireSession } from "./components/RequireSession";
import { AuthPage } from "@/pages/AuthPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/*"
        element={
          <RequireSession>
            <PrivateRoutes />
          </RequireSession>
        }
      />
    </Routes>
  );
};
