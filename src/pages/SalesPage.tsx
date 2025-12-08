import { Route, Routes } from "react-router-dom";
import { AccountsReceivableIndex } from "@/modules/sales/pages/AccountsReceivableIndex";

export const SalesPage = () => {
  return (
    <Routes>
      <Route path="accounts-receivable" element={<AccountsReceivableIndex />} />
    </Routes>
  );
};
