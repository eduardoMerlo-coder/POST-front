import { InventoryIndex } from "@/modules/inventory/InventoryIndex";
import { Route, Routes } from "react-router-dom";

export const InventoryPage = () => {
  return (
    <Routes>
      <Route index element={<InventoryIndex />} />
    </Routes>
  );
};
