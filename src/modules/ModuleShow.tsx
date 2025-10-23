import { InventoryPage } from "@/pages/InventoryPage";
import { PosPage } from "@/pages/PosPage";
import { ProductPage } from "@/pages/ProductPage";
import { useParams } from "react-router-dom";

export const ModuleShow = () => {
  const { moduleId } = useParams();
  switch (moduleId) {
    case "pos":
      return <PosPage />;
    case "inventory":
      return <InventoryPage />;
    case "product":
      return <ProductPage />;
    default:
      return <>Default Page</>;
  }
};
