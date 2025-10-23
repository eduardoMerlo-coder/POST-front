import { PosIndex } from "@/modules/pos/PosIndex";
import { Route, Routes } from "react-router-dom";

export const PosPage = () => {
  return (
    <Routes>
      <Route index element={<PosIndex />} />
    </Routes>
  );
};
