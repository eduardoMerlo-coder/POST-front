import { useTheme } from "./context/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors absolute bottom-4 left-4"
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? " Modo Claro" : " Modo Oscuro"}
    </button>
  );
};
