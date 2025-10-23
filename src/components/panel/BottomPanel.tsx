import { HomeIcon, MenuIcon } from "@/Icons";

export const BottomPanel = () => {
  const footerItems = [
    {
      icon: MenuIcon,
      name: "Menu",
    },
    {
      icon: HomeIcon,
      name: "Inicio",
    },
    {
      icon: HomeIcon,
      name: "Inicio",
    },
    {
      icon: HomeIcon,
      name: "Inicio",
    },
    {
      icon: HomeIcon,
      name: "Inicio",
    },
  ];
  return (
    <footer className="fixed bottom-0 bg-white h-14 p-2 rounded-t-[8px] w-full flex items-center justify-around">
      {footerItems.map((item) => (
        <div
          className={`flex flex-col flex-1 rounded-lg h-full items-center justify-center gap-1 text-[#27272a] ${
            item.name === "Inicio" && "text-[#f05656]"
          }`}
        >
          <item.icon />
          <span className={`text-[10px] leading-none font-black font-satoshi`}>
            {item.name}
          </span>
        </div>
      ))}
    </footer>
  );
};
