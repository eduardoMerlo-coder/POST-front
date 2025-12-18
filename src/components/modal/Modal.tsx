import type { ReactNode } from "react";
import { useModal } from "@/setup/context/ModalContext";

export const Modal = ({ content }: { content: ReactNode | null }) => {
  const { setContent } = useModal();

  if (!content) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && setContent) {
      setContent(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      {content}
    </div>
  );
};
