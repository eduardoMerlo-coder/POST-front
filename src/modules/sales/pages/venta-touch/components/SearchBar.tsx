import { Input } from "@heroui/react";
import { HiMagnifyingGlass } from "react-icons/hi2";

interface SearchBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
}

export const SearchBar = ({
  inputRef,
  value,
  onChange,
  onEnter,
}: SearchBarProps) => {
  return (
    <div className="flex-shrink-0">
      <Input
        ref={inputRef}
        value={value}
        placeholder="Buscar productos o escanear código de barras..."
        startContent={<HiMagnifyingGlass className="text-secondary" />}
        classNames={{
          base: "w-full",
          input: "text-sm",
          inputWrapper:
            "bg-surface border-1 border-border hover:border-border data-[hover=true]:border-border",
        }}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          }
        }}
      />
    </div>
  );
};
