import { Route, Routes } from "react-router-dom";
import { AccountsReceivableIndex } from "@/modules/sales/pages/AccountsReceivableIndex";
import { VentaTouchIndex } from "@/modules/sales/pages/VentaTouchIndex";

export const SalesPage = () => {
  return (
    <Routes>
      <Route path="accounts-receivable" element={<AccountsReceivableIndex />} />
      <Route path="venta-touch" element={<VentaTouchIndex />} />
    </Routes>
  );
};
