import { NewProductAdmin } from "@/modules/product/pages/NewProductAdmin";
import { ProductIndex } from "@/modules/product/pages/ProductIndex";
import { EditProduct } from "@/modules/product/pages/EditProduct";
import { Route, Routes } from "react-router-dom";
import { RoleType } from "@/app.types";
import { NewProductUser } from "@/modules/product/pages/NewProductUser";

export const ProductPage = () => {
  const role = RoleType[localStorage.getItem("role") || "1"]
  return (
    <Routes>
      <Route index element={<ProductIndex />} />
      <Route path="new-product" element={role !== RoleType.ADMIN ? <NewProductAdmin /> : <NewProductUser />} />
      <Route path=":id" element={<EditProduct />} />
    </Routes>
  );
};
