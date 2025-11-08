import { Select, SelectItem } from "@heroui/react";
import type { SelectType } from "./ui.types";

export const CustomSelect = ({
  items,
  title,
}: {
  items: SelectType[];
  title: string;
}) => {
  return (
    <Select className="max-w-xs" label={title}>
      {items.map((animal) => (
        <SelectItem key={animal.value}>{animal.label}</SelectItem>
      ))}
    </Select>
  );
};
