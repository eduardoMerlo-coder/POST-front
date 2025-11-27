import { TagIcon } from "@/Icons";
import { Accordion, AccordionItem } from "@heroui/react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export const CustomAccordion = ({
  items,
}: {
  items: {
    title: string;
    value: string;
    startContent: ReactNode;
    content: ReactNode;
  }[];
}) => {
  const location = useLocation();
  return (
    <Accordion selectionMode="multiple" showDivider>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          aria-label={item.title}
          title={
            <div
              className={`flex gap-4 items-center font-semibold text-sm ${location.pathname.includes(item.value) ? "text-primary" : "text-secondary"}`}
            >
              <TagIcon className="text-accent" />
              {item.title}
            </div>
          }
          classNames={{
            indicator: "text-primary",
            trigger: "pr-4"
          }}
        >
          {item.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
