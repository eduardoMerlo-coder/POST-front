import { BarCodeIcon, PlusIcon } from "@/Icons";
import { useModal } from "@/setup/context/ModalContext";
import { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export const PosIndex = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [listProducts, setListProducts] = useState<any[]>([]);
  const { setContent } = useModal();

  return (
    <div>
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="focus:ring-blue-500 focus:border-blue-500 flex items-center border border-gray-300 rounded-lg">
        <input
          type="search"
          id="default-search"
          className="block w-full p-4 text-sm text-gray-900 bg-gray-50 rounded-lg outline-none"
          placeholder="Buscar producto ..."
        />
        <button
          className="w-14 flex justify-center"
          onClick={() => {
            setContent(
              <div>
                <BarcodeScannerComponent
                  width={500}
                  height={200}
                  onUpdate={(err, result) => {
                    if (result) {
                      setBarcode(result.getText());
                      setContent(null);
                    } else {
                      setBarcode("Not Found");
                    }
                  }}
                />
              </div>
            );
          }}
        >
          <BarCodeIcon className="size-8" />
        </button>
      </div>

      <div className="grid grid-cols-2 pt-4">
        {listProducts.map((product) => (
          <article className="bg-white flex flex-col p-2 justify-center items-center rounded-lg text-[#064b4d]">
            <img
              src="/images/default-card.jpg"
              alt="default image"
              className="h-36"
            />
            <span className="text-lg font-semibold">Coca Cola</span>
            <span className="text-sm font-medium"> 2 unidades disp.</span>
            <span className="text-sm font-medium text-[#757579]">500ml</span>
            <p className="text-2xl font-bold flex items-start my-2">
              18.<span className="text-base">50$</span>
            </p>
            <div className="bg-[#f0f4ea] bg-[#baea70] p-3 relative button-curved w-full flex justify-center rounded-lg">
              <PlusIcon className="size-5 text-[#064b4d]" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
