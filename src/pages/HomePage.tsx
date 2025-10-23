import { CartIcon } from "@/Icons";
import { useNavigate } from "react-router-dom";

export const MainPage = () => {
  const user = JSON.parse(localStorage.getItem("user") ?? "");
  const modules: {
    id: string;
    name: string;
    icon: any;
    color: string;
    canAdd?: boolean;
  }[] = [
    {
      id: "pos",
      name: "Punto de venta",
      icon: CartIcon,
      color: "#af3a94",
      canAdd: true,
    },
    {
      id: "inventory",
      name: "Inventario",
      icon: CartIcon,
      color: "#d62026",
      canAdd: true,
    },
    { id: "sales", name: "Lista de ventas", icon: CartIcon, color: "#07b151" },
    {
      id: "purchases",
      name: "Compras",
      icon: CartIcon,
      color: "#2fbbb3",
      canAdd: true,
    },
    {
      id: "finance",
      name: "Finanzas",
      icon: CartIcon,
      color: "#f6851e",
      canAdd: true,
    },
  ];
  const navigate = useNavigate();
  return (
    <div className="p-4 pt-20">
      <h2 className="text-3xl font-semibold ">Hola, {user.name}</h2>
      <span className="text-sm mt-4">Que quieres hacer ahora?</span>
      <section className="grid grid-cols-2 justify-between h-full gap-8 pt-10">
        {modules.map((elem) => (
          <div
            className="flex-1 h-24 p-2 rounded-lg text-white flex flex-col justify-end gap-1 relative"
            style={{ backgroundColor: elem.color }}
            key={elem.id}
            onClick={() => {
              navigate(`/${elem.id}`);
            }}
          >
            <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
              <elem.icon className="size-6" style={{ color: elem.color }} />
            </div>
            <span className="font-medium">{elem.name}</span>
            {elem.canAdd && (
              <button
                className="absolute top-2 right-2 text-white text-xs border-white border-1 p-1 px-3 rounded-full font-medium cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${elem.id}/new`);
                }}
              >
                Agregar
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};
