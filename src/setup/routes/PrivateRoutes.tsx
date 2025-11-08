import { ModuleLayout } from "@/components/layouts/ModuleLayout";
import { MainPage } from "@/pages/HomePage";
import { Route, Routes } from "react-router-dom";
import { ModalProvider } from "../context/ModalContext";
import { PosPage } from "@/pages/PosPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { ProductPage } from "@/pages/ProductPage";

export const PrivateRoutes = () => {
  return (
    <ModalProvider>
      <Routes>
        <Route element={<ModuleLayout />}>
          <Route index element={<MainPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="product/*" element={<ProductPage />} />
        </Route>
      </Routes>
    </ModalProvider>
  );
};
