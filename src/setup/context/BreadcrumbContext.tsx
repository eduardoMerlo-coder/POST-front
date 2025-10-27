import { createContext, useContext, type ReactNode } from "react";

export const BreadCrumbContext = createContext(null);

export const useBreadcrumb = () => useContext(BreadCrumbContext);

export const BreadCrumbProvider = ({ children }: { children: ReactNode }) => {
  return (
    <BreadCrumbContext.Provider value={null}>
      {children}
    </BreadCrumbContext.Provider>
  );
};
