import { ChevronDownIcon, LogoutIcon } from "@/Icons";
import { useEffect, useRef, useState } from "react";
import { useLogout } from "../auth/hook/useAuth";
import { RoleType } from "@/app.types";

interface UserProfile {
  name: string;
  role: string;
  avatar: string;
}

interface ProfileOptionsProps {
  onClose: () => void;
}

export const Profile = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with actual user data from auth context or API
  const userProfile: UserProfile = {
    name: localStorage.getItem("user") || "user@test.com",
    role: RoleType[localStorage.getItem("role") || "1"],
    avatar: "https://preview.cruip.com/mosaic/images/user-64-01.jpg",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleClose = () => {
    setShowOptions(false);
  };

  return (
    <div
      ref={profileRef}
      className="flex items-center justify-center gap-2 border-l-2 border-l-border px-4 relative cursor-pointer"
      onClick={toggleOptions}
    >
      <img
        className="rounded-full size-10"
        src={userProfile.avatar}
        alt={`${userProfile.name} avatar`}
      />
      <div className="flex flex-col">
        <h2 className="text-sm justify-center">{userProfile.name}</h2>
        <span className="text-[10px] font-semibold">{userProfile.role}</span>
      </div>
      <ChevronDownIcon
        className={`size-3 ml-2 transition-transform duration-200 ${showOptions ? "rotate-180" : ""
          }`}
      />
      {showOptions && <ProfileOptions onClose={handleClose} />}
    </div>
  );
};

const ProfileOptions = ({ onClose }: ProfileOptionsProps) => {
  const { mutate } = useLogout();

  const handleLogout = () => {
    mutate();
    onClose();
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="absolute top-[140%] right-0 z-50 bg-base-alt rounded-lg shadow-lg border-1 border-border w-full overflow-hidden">
      <ul className="flex flex-col">
        <li
          className="flex gap-2 items-center cursor-pointer hover:bg-secondary/10 p-2"
          onClick={() => handleMenuItemClick(() => console.log("Mi cuenta"))}
        >
          {/* TODO: Replace with appropriate icon */}
          <LogoutIcon className="text-secondary size-5" />
          <span className="text-xs font-semibold">Mi cuenta</span>
        </li>
        <li
          className="flex gap-2 items-center cursor-pointer hover:bg-secondary/10 p-2"
          onClick={() => handleMenuItemClick(() => console.log("Empresa"))}
        >
          {/* TODO: Replace with appropriate icon */}
          <LogoutIcon className="text-secondary size-5" />
          <span className="text-xs font-semibold">Empresa</span>
        </li>
        <li
          className="flex gap-2 items-center cursor-pointer hover:bg-secondary/10 p-2"
          onClick={handleLogout}
        >
          <LogoutIcon className="text-secondary size-5" />
          <span className="text-xs font-semibold">Logout</span>
        </li>
      </ul>
    </div>
  );
};
