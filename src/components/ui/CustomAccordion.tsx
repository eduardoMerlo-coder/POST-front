import { Accordion, Span } from "@chakra-ui/react";
import type { ReactNode } from "react";

export const CustomAccordion = ({
  items,
}: {
  items: { title: string; value: string; content: ReactNode }[];
}) => {
  return (
    <Accordion.Root multiple defaultValue={["b"]}>
      {items.map((item, index) => (
        <Accordion.Item key={index} value={item.value}>
          <Accordion.ItemTrigger>
            <Span flex="1">{item.title}</Span>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>{item.content}</Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};
