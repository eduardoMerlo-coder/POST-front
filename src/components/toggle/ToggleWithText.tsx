export const ToggleWithText = ({ text }: { text: string }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" />
      <div className="relative w-8 h-4 bg-gray-300 rounded-full peer peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-secondary"></div>
      <span className="ms-2 text-sm font-medium text-gray-900">{text}</span>
    </label>
  );
};
