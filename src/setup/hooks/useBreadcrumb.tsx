import { useContext } from "react";
import { BreadCrumbContext } from "../context/BreadcrumbContext";

export const useBreadcrumb = () => useContext(BreadCrumbContext);
