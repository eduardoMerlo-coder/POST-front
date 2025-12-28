import { Route, Routes } from "react-router-dom";
import { SalesListIndex } from "@/modules/sales/pages/SalesListIndex";
import { VentaTouchIndex } from "@/modules/sales/pages/VentaTouchIndex";

export const SalesPage = () => {
  return (
    <Routes>
      <Route path="list" element={<SalesListIndex />} />
      <Route path="venta-touch" element={<VentaTouchIndex />} />
    </Routes>
  );
};
