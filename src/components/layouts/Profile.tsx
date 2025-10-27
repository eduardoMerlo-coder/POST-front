import { ChevronDownIcon, LogoutIcon } from "@/Icons";
import { useState } from "react";
import { useLogout } from "../auth/hook/useAuth";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  return (
    <div
      className="flex items-center justify-center gap-2 border-l-2 border-l-gray-300 px-4 relative cursor-pointer"
      onClick={() => setShowOptions((prev) => !prev)}
    >
      <img
        className="rounded-full size-10"
        src="https://preview.cruip.com/mosaic/images/user-64-01.jpg"
        alt="User 01"
      />
      <div className="flex flex-col">
        <h2 className="text-sm justify-center">Eduardo</h2>
        <span className="text-[10px] font-semibold">Admin</span>
      </div>
      <ChevronDownIcon className="size-3 ml-2" />
      {showOptions && <ProfileOptions />}
    </div>
  );
};

const ProfileOptions = () => {
  const { mutateAsync } = useLogout();
  const navigate = useNavigate();
  const handleLogout = () => {
    mutateAsync();
    navigate("/");
  };
  return (
    <div className="absolute top-[140%] right-0 z-50 bg-white rounded-lg shadow-lg border-1 border-gray-300/50 w-full overflow-hidden">
      <ul className="flex flex-col ">
        <li className="flex gap-2 items-center cursor-pointer hover:bg-sky-100/50 p-2">
          <LogoutIcon className="text-gray-500" />
          <span className="text-[10px] font-semibold">Mi cuenta</span>
        </li>
        <li className="flex gap-2 items-center cursor-pointer hover:bg-sky-100/50 p-2">
          <LogoutIcon className="text-gray-500" />
          <span className="text-[10px] font-semibold">Empresa</span>
        </li>
        <li
          className="flex gap-2 items-center cursor-pointer hover:bg-sky-100/50 p-2"
          onClick={handleLogout}
        >
          <LogoutIcon className="text-gray-500" />
          <span className="text-[10px] font-semibold">Logout</span>
        </li>
      </ul>
    </div>
  );
};
