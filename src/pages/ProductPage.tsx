import { ProductIndex } from "@/modules/product/pages/ProductIndex";
import { EditProduct } from "@/modules/product/pages/EditProduct";
import { Route, Routes } from "react-router-dom";
import { NewProductUser } from "@/modules/product/pages/NewProductUser";

export const ProductPage = () => {
  return (
    <Routes>
      <Route index element={<ProductIndex />} />
      <Route path="new-product" element={<NewProductUser />} />
      <Route path=":id" element={<EditProduct />} />
    </Routes>
  );
};
