import { Outlet } from "react-router-dom";
import { Profile } from "./Profile";
import { Modal } from "../modal/Modal";
import { SidePanel } from "../panel/SidePanel";
import { useModal } from "@/setup/context/ModalContext";

export const ModuleLayout = () => {
  const { content } = useModal();
  return (
    <div className="relative h-full w-full bg-[#f7f7f7] flex">
      <SidePanel />
      <main className="p-4 w-full flex flex-col">
        <header className="h-16 mb-4 bg-white flex items-center justify-end gap-2 rounded-lg shadow-md">
          <Profile />
        </header>
        <div className="bg-white shadow-md p-4 rounded-lg flex-1">
          <Outlet />
        </div>
      </main>
      <Modal content={content} />
    </div>
  );
};
