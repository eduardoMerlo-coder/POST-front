import { ModuleLayout } from "@/components/layouts/ModuleLayout";
import { MainPage } from "@/pages/HomePage";
import { Route, Routes } from "react-router-dom";
import { ModalProvider } from "../context/ModalContext";
import { InventoryPage } from "@/pages/InventoryPage";
import { ProductPage } from "@/pages/ProductPage";
import { SalesPage } from "@/pages/SalesPage";

export const PrivateRoutes = () => {
  return (
    <ModalProvider>
      <Routes>
        <Route element={<ModuleLayout />}>
          <Route index element={<MainPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="product/*" element={<ProductPage />} />
          <Route path="sales/*" element={<SalesPage />} />
        </Route>
      </Routes>
    </ModalProvider>
  );
};
