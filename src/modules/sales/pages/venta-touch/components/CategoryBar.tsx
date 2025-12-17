import type { CategoryItem } from "@/modules/product/product.type";
import { FaChevronRight } from "react-icons/fa";

interface CategoryBarProps {
  categories: CategoryItem[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  categoriesScrollRef: React.RefObject<HTMLDivElement | null>;
  showScrollIndicator: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const CategoryBar = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoriesScrollRef,
  showScrollIndicator,
  onScroll,
}: CategoryBarProps) => {
  return (
    <div className="flex-shrink-0 relative">
      <div className="relative">
        <div
          ref={categoriesScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={onScroll}
        >
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border-1 transition-colors ${
              selectedCategoryId === null
                ? "bg-accent border-accent text-white"
                : "bg-surface border-border text-primary hover:bg-surface-alt"
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-1 transition-colors whitespace-nowrap ${
                selectedCategoryId === category.id
                  ? "bg-accent border-accent text-white"
                  : "bg-surface border-border text-primary hover:bg-surface-alt"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {showScrollIndicator && (
          <div className="hidden lg:block absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-base-alt to-transparent pointer-events-none flex items-center justify-end pr-2">
            <FaChevronRight className="text-accent" size={16} />
          </div>
        )}
      </div>
    </div>
  );
};
