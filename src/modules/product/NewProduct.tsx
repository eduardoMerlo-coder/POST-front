import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomSwitch } from "@/components/ui/CustomSwitch";
import { ImageUploader } from "@/components/uploader/ImageUploader";

export const NewProduct = () => {
  return (
    <div className="h-full ">
      <form className="">
        <div className="flex flex-col gap-2 items-end">
          <ImageUploader />
          <CustomSwitch />
        </div>
        <div className="flex flex-col">
          <CustomInput />
          <CustomInput />
          <CustomSelect items={[{ label: "React.js", value: "react" }]} />
          <CustomInput />
        </div>
        <div>
          <CustomInput />
          <CustomInput />
        </div>
      </form>
    </div>
  );
};
