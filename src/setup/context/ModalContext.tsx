import { createContext, useContext, useState, type ReactNode } from "react";

interface ModalProps {
  content: ReactNode | null;
  setContent?: any;
}

export const ModalContext = createContext<ModalProps>({
  content: null,
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  return (
    <ModalContext.Provider value={{ content, setContent }}>
      {children}
    </ModalContext.Provider>
  );
};
