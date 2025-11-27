import { NewProduct } from "@/modules/product/pages/NewProduct";
import { ProductIndex } from "@/modules/product/pages/ProductIndex";
import { EditProduct } from "@/modules/product/pages/EditProduct";
import { Route, Routes } from "react-router-dom";

export const ProductPage = () => {
  return (
    <Routes>
      <Route index element={<ProductIndex />} />
      <Route path="new-product" element={<NewProduct />} />
      <Route path=":id" element={<EditProduct />} />
    </Routes>
  );
};
