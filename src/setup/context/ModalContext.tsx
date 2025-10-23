import { createContext, type ReactNode } from "react";

interface ModalProps {
  content: ReactNode | null;
  setContent?: any;
}

export const ModalContext = createContext<ModalProps>({
  content: null,
});
