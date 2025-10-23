import { IoHome } from "react-icons/io5";
import { MdMenuOpen } from "react-icons/md";
import { IoCartSharp } from "react-icons/io5";
import { TbFilterSearch } from "react-icons/tb";
import { IoBarcodeOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaTag } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { FaChevronUp } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";

interface IconsProps {
  className?: string;
  style?: any;
}

export const HomeIcon = ({ className, style }: IconsProps) => (
  <IoHome className={className} style={style} />
);

export const LogoutIcon = ({ className, style }: IconsProps) => (
  <IoLogOutOutline className={className} style={style} />
);

export const ChevronUpIcon = ({ className, style }: IconsProps) => (
  <FaChevronUp className={className} style={style} />
);

export const ChevronDownIcon = ({ className, style }: IconsProps) => (
  <FaChevronDown className={className} style={style} />
);

export const MenuIcon = ({ className, style }: IconsProps) => (
  <MdMenuOpen className={className} style={style} />
);

export const CartIcon = ({ className, style }: IconsProps) => (
  <IoCartSharp className={className} style={style} />
);
export const FilterIcon = ({ className, style }: IconsProps) => (
  <TbFilterSearch className={className} style={style} />
);

export const BarCodeIcon = ({ className, style }: IconsProps) => (
  <IoBarcodeOutline className={className} style={style} />
);

export const PlusIcon = ({ className, style }: IconsProps) => (
  <FaPlus className={className} style={style} />
);

export const EyeIcon = ({ className, style }: IconsProps) => (
  <IoEyeOutline className={className} style={style} />
);

export const TrashIcon = ({ className, style }: IconsProps) => (
  <FaRegTrashCan className={className} style={style} />
);

export const TagIcon = ({ className, style }: IconsProps) => (
  <FaTag className={className} style={style} />
);

export const SearchIcon = ({ className, style }: IconsProps) => (
  <IoSearch className={className} style={style} />
);
