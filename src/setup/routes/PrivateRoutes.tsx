import { ModuleLayout } from "@/components/layouts/ModuleLayout";
import { ModuleShow } from "@/modules/ModuleShow";
import { MainPage } from "@/pages/HomePage";
import { Route, Routes } from "react-router-dom";
import { ModalProvider } from "../provider/ModalProvider";

export const PrivateRoutes = () => {
  return (
    <ModalProvider>
      <Routes>
        <Route index element={<MainPage />} />
        <Route element={<ModuleLayout />}>
          <Route path="/:moduleId" element={<ModuleShow />}></Route>
        </Route>
      </Routes>
    </ModalProvider>
  );
};
