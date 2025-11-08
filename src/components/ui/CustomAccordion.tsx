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
  console.log(location.pathname);
  return (
    <Accordion selectionMode="multiple" showDivider>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          aria-label={item.title}
          title={
            <div
              className={`flex gap-4 items-center text-sm text-gray-500 ${
                location.pathname.includes(item.value) && "text-sky-300"
              }`}
            >
              <TagIcon />
              {item.title}
            </div>
          }
        >
          {item.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
