import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";

// Configuración centralizada de rutas y sus labels
const ROUTE_CONFIG: Record<string, string> = {
  "/": "Inicio",
  "/pos": "POS",
  "/inventory": "Inventario",
  "/product": "Productos",
  "/product/new-product": "Nuevo Producto",
  "/product/category": "Categorias",
  "/sales": "Ventas",
  "/sales/venta-touch": "Venta Touch",
  "/sales/accounts-receivable": "Cuentas por cobrar",
};

// Rutas que deben omitir el nivel intermedio (no mostrar "Productos" en el medio)
const FLAT_ROUTES: Record<string, { label: string; path: string }> = {
  "/product/category": { label: "Categorias", path: "/product/category" },
  "/sales/accounts-receivable": {
    label: "Cuentas por cobrar",
    path: "/sales/accounts-receivable",
  },
};

/**
 * Obtiene el label para una ruta específica
 */
const getRouteLabel = (
  path: string,
  pathnames: string[],
  currentIndex: number
): string => {
  // 1. Verificar si existe en la configuración directa
  if (ROUTE_CONFIG[path]) {
    return ROUTE_CONFIG[path];
  }

  // 2. Manejar rutas especiales dentro de /product
  if (pathnames[0] === "product" && pathnames.length > 1) {
    const secondSegment = pathnames[1];

    // Si es "category", retornar "Categorias"
    if (secondSegment === "category") {
      return "Categorias";
    }

    // Si es "new-product", retornar "Nuevo Producto"
    if (secondSegment === "new-product") {
      return "Nuevo Producto";
    }

    // 3. Si es un ID numérico (ruta dinámica), es "Editar Producto"
    if (currentIndex === pathnames.length - 1 && /^\d+$/.test(secondSegment)) {
      return "Editar Producto";
    }
  }

  // 2.1. Manejar rutas especiales dentro de /sales
  if (pathnames[0] === "sales" && pathnames.length > 1) {
    const secondSegment = pathnames[1];

    // Si es "venta-touch", retornar "Venta Touch"
    if (secondSegment === "venta-touch") {
      return "Venta Touch";
    }

    // Si es "accounts-receivable", retornar "Cuentas por cobrar"
    if (secondSegment === "accounts-receivable") {
      return "Cuentas por cobrar";
    }
  }

  // 4. Capitalizar la primera letra como fallback
  const segment = pathnames[currentIndex];
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

/**
 * Construye el path completo para un segmento
 */
const buildPath = (pathnames: string[], endIndex: number): string => {
  if (endIndex === -1) return "/";
  return `/${pathnames.slice(0, endIndex + 1).join("/")}`;
};

/**
 * Determina si una ruta debe mostrar todos los niveles o solo el nivel raíz y el actual
 */
const shouldFlattenRoute = (pathnames: string[]): boolean => {
  const fullPath = `/${pathnames.join("/")}`;
  return fullPath in FLAT_ROUTES;
};

export const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Construir los breadcrumbs
  const breadcrumbs: Array<{ label: string; path: string }> = (() => {
    const base = [{ label: "Inicio", path: "/" }];

    // Si es una ruta "flat" (como category), solo mostrar Inicio > Label actual
    if (shouldFlattenRoute(pathnames)) {
      const fullPath = `/${pathnames.join("/")}`;
      const flatRoute = FLAT_ROUTES[fullPath];
      if (flatRoute) {
        return [...base, flatRoute];
      }
    }

    // Construcción normal: mostrar todos los niveles
    const pathBreadcrumbs = pathnames.map((_, index) => {
      const path = buildPath(pathnames, index);
      const label = getRouteLabel(path, pathnames, index);
      return { label, path };
    });

    return [...base, ...pathBreadcrumbs];
  })();

  return (
    <Breadcrumbs>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <BreadcrumbItem
            key={`${crumb.path}-${index}`}
            isCurrent={isLast}
            {...(isLast
              ? {}
              : {
                  className:
                    "cursor-pointer hover:opacity-80 transition-opacity",
                  onClick: () => navigate(crumb.path),
                })}
          >
            {crumb.label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
};
