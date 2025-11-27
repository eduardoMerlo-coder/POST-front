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
import { FaCamera } from "react-icons/fa";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { IoIosBarcode } from "react-icons/io";
import { HiMiniXMark } from "react-icons/hi2";
import { PiFileImage } from "react-icons/pi";

interface IconsProps {
  className?: string;
  style?: any;
  onClick?: () => void;
}

export const ImageIcon = ({ className, style }: IconsProps) => (
  <PiFileImage className={className} style={style} />
);
export const XIcon = ({ className, style }: IconsProps) => (
  <HiMiniXMark className={className} style={style} />
);

export const CameraIcon = ({ className, style }: IconsProps) => (
  <FaCamera className={className} style={style} />
);

export const BarcodeIcon = ({ className, style }: IconsProps) => (
  <IoIosBarcode className={className} style={style} />
);

export const UploadeIcon = ({ className, style }: IconsProps) => (
  <AiOutlineCloudUpload className={className} style={style} />
);

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

export const EyeIcon = ({ className, style, onClick }: IconsProps) => (
  <IoEyeOutline className={className} style={style} onClick={onClick} />
);

export const TrashIcon = ({ className, style, onClick }: IconsProps) => (
  <FaRegTrashCan className={className} style={style} onClick={onClick} />
);

export const TagIcon = ({ className, style }: IconsProps) => (
  <FaTag className={className} style={style} />
);

export const SearchIcon = ({ className, style }: IconsProps) => (
  <IoSearch className={className} style={style} />
);
