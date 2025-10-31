import { HStack, RadioGroup } from "@chakra-ui/react";
import type { SelectType } from "./ui.types";

export const CustomRadio = ({
  handleChange,
  value,
  items,
}: {
  handleChange: () => void;
  value: string | null;
  items: SelectType[];
}) => {
  return (
    <RadioGroup.Root value={value} onValueChange={handleChange}>
      <HStack gap="6">
        {items.map((item) => (
          <RadioGroup.Item key={item.value} value={item.value}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </HStack>
    </RadioGroup.Root>
  );
};
