import { useNavigate } from "react-router-dom";
import { CustomAccordion } from "../ui/CustomAccordion";
import { CustomRadioGroup } from "../ui/CustomRadioGroup";
import { TagIcon } from "@/Icons";
import { ThemeToggle } from "@/setup/theme";
import { HiXMark } from "react-icons/hi2";
import { FaCartArrowDown } from "react-icons/fa";

interface SidePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SidePanel = ({ isOpen = true, onClose }: SidePanelProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`max-lg:fixed top-0 z-50 left-0 h-full w-[300px] min-w-[300px] bg-base-alt p-4 pr-0 relative transition-transform duration-300 ease-in-out ${
        isOpen
          ? "max-lg:translate-x-0"
          : "max-lg:-translate-x-full max-sm:invisible"
      }`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-4 lg:hidden text-primary hover:text-accent transition-colors"
          aria-label="Close menu"
        >
          <HiXMark size={24} />
        </button>
      )}
      <h1 className="text-3xl md:text-center font-bold">
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
                  { label: "Marcas", path: "/product/brand" },
                ]}
                handleChange={handleNavigation}
              />
            ),
          },
          {
            title: "Ventas",
            value: "sales",
            startContent: <FaCartArrowDown />,
            content: (
              <CustomRadioGroup
                items={[
                  {
                    label: "Venta Touch",
                    path: "/sales/venta-touch",
                  },
                  {
                    label: "Cuentas por cobrar",
                    path: "/sales/accounts-receivable",
                  },
                ]}
                handleChange={handleNavigation}
              />
            ),
          },
        ]}
      />

      <ThemeToggle />
    </aside>
  );
};
