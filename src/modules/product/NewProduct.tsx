import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomSwitch } from "@/components/ui/CustomSwitch";
import { ImageUploader } from "@/components/uploader/ImageUploader";
import { Button, Input } from "@heroui/react";
import { useForm, type SubmitHandler } from "react-hook-form";

type ProductForm = {
  name: string;
  internalCode: string;
  uom: string;
  barcode: string;
  price: string;
  minStock: string;
};

export const NewProduct = () => {
  const { handleSubmit, register } = useForm<ProductForm>();
  const onSubmit: SubmitHandler<ProductForm> = (data) => {
    console.log(data);
  };
  return (
    <div className="pt-10">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 items-end">
            <ImageUploader />
            <CustomSwitch title="activo" />
          </div>
          <div className="flex flex-col gap-4">
            <Input {...register("name")} label="Nombre de producto*" required />
            <Input {...register("internalCode")} label="Codigo interno*" />
            <CustomSelect
              {...register("uom")}
              items={[{ label: "Metro", value: "m" }]}
              title="Und. medida"
            />
            <Input
              {...register("barcode")}
              label="Codigo de barras"
              endContent={<></>}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Input {...register("price")} label="Precio de venta" />
            <Input {...register("minStock")} label="Stock minimo" />
          </div>
        </div>
        <div className="flex gap-4 justify-end">
          <Button color="primary" type="submit">
            Guardar
          </Button>
          <Button color="default">Cancelar</Button>
        </div>
      </form>
    </div>
  );
};
