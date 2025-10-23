import type { ReactNode } from "react";

export const Modal = ({ content }: { content: ReactNode | null }) => {
  return (
    <div
      className={`fixed inset-0 bg-black/80 items-center justify-center z-50 ${
        !content && "hidden"
      }`}
    >
      {content}
    </div>
  );
};
