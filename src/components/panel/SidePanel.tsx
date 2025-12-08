import { useNavigate } from "react-router-dom";
import { CustomAccordion } from "../ui/CustomAccordion";
import { CustomRadioGroup } from "../ui/CustomRadioGroup";
import { TagIcon, CartIcon } from "@/Icons";
import { ThemeToggle } from "@/setup/theme";

export const SidePanel = () => {
  const navigate = useNavigate();
  return (
    <aside className="max-sm:fixed top-0 z-50 left-0 h-full lg:w-[300px] lg:min-w-[300px] bg-base-alt p-4 pr-0 relative">
      <h1 className="text-3xl text-center font-bold">
        Smart <span className="text-accent">POS</span>{" "}
      </h1>

      <CustomAccordion
        items={[
          {
            title: "Productos",
            value: "product",
            startContent: <TagIcon />,
            content: (
              <CustomRadioGroup
                items={[
                  { label: "Listado de productos", path: "/product" },
                  { label: "Categorias", path: "/product/category" },
                ]}
                handleChange={(value) => navigate(value)}
              />
            ),
          },
          {
            title: "VENTAS",
            value: "sales",
            startContent: <CartIcon />,
            content: (
              <CustomRadioGroup
                items={[
                  {
                    label: "Cuentas por cobrar",
                    path: "/sales/accounts-receivable",
                  },
                ]}
                handleChange={(value) => navigate(value)}
              />
            ),
          },
        ]}
      />

      <ThemeToggle />
    </aside>
  );
};
