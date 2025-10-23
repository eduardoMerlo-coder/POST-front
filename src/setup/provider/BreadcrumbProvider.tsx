import type { ReactNode } from "react";
import { BreadCrumbContext } from "../context/BreadcrumbContext";

export const BreadCrumbProvider = ({ children }: { children: ReactNode }) => {
  return (
    <BreadCrumbContext.Provider value={{}}>
      {children}
    </BreadCrumbContext.Provider>
  );
};
