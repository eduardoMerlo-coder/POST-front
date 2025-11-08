import { useNavigate } from "react-router-dom";
import { CustomAccordion } from "../ui/CustomAccordion";
import { CustomRadioGroup } from "../ui/CustomRadioGroup";
import { TagIcon } from "@/Icons";

export const SidePanel = () => {
  const navigate = useNavigate();
  return (
    <aside className="max-sm:fixed top-0 z-50 left-0 h-full w-1/4 bg-white p-2">
      <div className="flex justify-center w-full">
        <img src="images/brand.png" alt="brand" className="h-20" />
      </div>
      <CustomAccordion
        items={[
          {
            title: "Productos",
            value: "product",
            startContent: <TagIcon />,
            content: (
              <>
                <CustomRadioGroup
                  items={[
                    { label: "Listado de productos", path: "/product" },
                    { label: "Categorias", path: "/product/category" },
                  ]}
                  handleChange={(value) => navigate(value)}
                />
              </>
            ),
          },
        ]}
      />
    </aside>
  );
};
