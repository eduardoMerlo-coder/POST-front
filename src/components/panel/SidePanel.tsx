import { TagIcon } from "@/Icons";

export const SidePanel = () => {
  return (
    <aside className="max-sm:fixed top-0 z-50 left-0 h-full w-1/4 bg-white p-2">
      <div className="flex justify-center w-full">
        <img src="images/brand.png" alt="brand" className="h-20" />
      </div>
      <details name="my-accordion">
        <summary className="!m-0">
          <div className="flex items-center gap-4">
            <TagIcon />
            <span className="text-sm font-normal">Productos</span>
          </div>
        </summary>
        <div className="flex flex-col px-3">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-sky-100/50">
            <input id="product-list" name="plan" type="radio" />
            <label
              className="w-full hover:cursor-pointer "
              data-color="silver"
              htmlFor="product-list"
            >
              <span className="text-xs font-normal">Listado de productos</span>
            </label>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-sky-100/50">
            <input id="category" name="plan" type="radio" />
            <label
              className="w-full hover:cursor-pointer "
              data-color="silver"
              htmlFor="category"
            >
              <span className="text-xs font-normal">Categorias</span>
            </label>
          </div>

          <div className="glass-glider-vertical"></div>
        </div>
      </details>
    </aside>
  );
};
