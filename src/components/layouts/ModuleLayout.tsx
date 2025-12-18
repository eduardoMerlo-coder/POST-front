import { Outlet } from "react-router-dom";
import { Profile } from "./Profile";
import { Modal } from "../modal/Modal";
import { SidePanel } from "../panel/SidePanel";
import { Breadcrumb } from "./Breadcrumb";
import { useModal } from "@/setup/context/ModalContext";
import { IoMenuSharp } from "react-icons/io5";
import { useState } from "react";

export const ModuleLayout = () => {
  const { content } = useModal();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
  };

  return (
    <div className="relative h-full w-full bg-base flex">
      <SidePanel isOpen={isSidePanelOpen} onClose={closeSidePanel} />
      {isSidePanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidePanel}
        />
      )}
      <main className="p-4 w-full flex flex-col bg-base">
        <header className="h-16 mb-4 flex items-center justify-between gap-2 rounded-lg shadow-md bg-base-alt px-4">
          <button
            onClick={toggleSidePanel}
            className="lg:hidden cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Toggle menu"
          >
            <IoMenuSharp size={20} />
          </button>
          <Breadcrumb />
          <Profile />
        </header>
        <div className="bg-base-alt shadow-md p-4 rounded-lg flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </main>
      <Modal content={content} />
    </div>
  );
};
