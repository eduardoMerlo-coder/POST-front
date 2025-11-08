import { Radio, RadioGroup } from "@heroui/react";
export const CustomRadioGroup = ({
  handleChange,
  value,
  items,
  title,
}: {
  handleChange: (e: string) => void;
  value?: string | null;
  items: { label: string; path: string }[];
  title?: string;
}) => {
  return (
    <RadioGroup
      label={title}
      onChange={(e) => handleChange(e.target.value)}
      value={value}
      color="secondary"
      classNames={{
        wrapper: "w-full",
        base: "w-full",
      }}
    >
      {items.map((item) => (
        <Radio
          value={item.path}
          size="sm"
          className="hover:bg-secondary/10 w-full max-w-none"
          classNames={{
            base: "border-zinc-600",
            description: "text-zinc-600",
            label: "text-zinc-600",

            wrapper: "border-zinc-600",
            control:
              "border-zinc-600 bg-zinc-600 opacity-100 scale-100 group-data-[selected=true]:bg-secondary",
          }}
        >
          {item.label}
        </Radio>
      ))}
    </RadioGroup>
  );
};
