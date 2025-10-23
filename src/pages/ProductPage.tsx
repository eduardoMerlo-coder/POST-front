import { ProductIndex } from "@/modules/product/ProductIndex";
import { Route, Routes } from "react-router-dom";

export const ProductPage = () => {
  return (
    <Routes>
      <Route index element={<ProductIndex />} />
    </Routes>
  );
};
