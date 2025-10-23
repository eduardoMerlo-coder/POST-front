import { useState, type ReactNode } from "react";
import { ModalContext } from "../context/ModalContext";

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  return (
    <ModalContext.Provider value={{ content, setContent }}>
      {children}
    </ModalContext.Provider>
  );
};
