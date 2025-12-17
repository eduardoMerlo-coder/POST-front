import { Radio, RadioGroup } from "@heroui/react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const CustomRadioGroup = ({
  handleChange,
  items,
  title,
}: {
  handleChange: (e: string) => void;
  items: { label: string; path: string }[];
  title?: string;
}) => {
  const { pathname } = useLocation();

  // Encontrar el item que coincide exactamente con la ruta actual
  const selectedValue = useMemo(() => {
    const matchingItem = items.find((item) => item.path === pathname);
    return matchingItem ? matchingItem.path : "";
  }, [pathname, items]);

  return (
    <RadioGroup
      label={title}
      onChange={(e) => handleChange(e.target.value)}
      value={selectedValue}
      classNames={{
        wrapper: "w-full gap-3",
        base: "w-full",
      }}
    >
      {items.map((item) => {
        const isSelected = selectedValue === item.path;
        return (
          <Radio
            key={item.path}
            value={item.path}
            size="sm"
            className="hover:bg-secondary/10 w-full max-w-none rounded-sm"
            classNames={{
              base: "border-secondary",
              description: "text-secondary",
              label: "text-secondary ",
              wrapper:
                "border-secondary/50 group-data-[selected=true]:border-accent/50",
              control:
                "border-secondary bg-secondary/50 opacity-100 scale-100 group-data-[selected=true]:bg-accent",
            }}
          >
            <span
              className={`text-sm font-semibold pl-2 ${
                isSelected ? "text-accent" : "text-secondary"
              }`}
            >
              {item.label}
            </span>
          </Radio>
        );
      })}
    </RadioGroup>
  );
};
