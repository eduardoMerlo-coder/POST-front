import { type FormEvent } from "react";
import { useLogin } from "./hook/useAuth";

export const Login = () => {
  const { mutate, isPending, isError } = useLogin();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) return;
    mutate({ email, password });
  };

  return (
    <div className="bg-[url(/images/market.jpg)] bg-cover bg-no-repeat bg-center h-dvh w-full relative">
      {/* Capa de opacidad */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenido del formulario */}
      <div
        className={`bg-white backdrop-blur-sm w-4/5 rounded-lg px-6 py-10 shadow-lg absolute  left-1/2 top-1/2 -translate-1/2`}
      >
        <div className="text-2xl font-bold w-full text-center">Bienvenido</div>
        {isError && (
          <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 text-center"
            role="alert"
          >
            Credenciales invalidas
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full p-3 rounded-md bg-white outline-none !text-sm border border-gray-200 focus:border-[#7f7f7f] transition-colors text-black"
              placeholder="Ingresa tu email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              className="w-full p-3 rounded-md bg-white outline-none !text-sm border border-gray-200 focus:border-[#7f7f7f] transition-colors text-black"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full text-md font-bold bg-[#f05656] hover:bg-[#f05656] py-3 px-8 rounded-lg transition-colors cursor-pointer mt-2 text-white`}
            disabled={isPending}
          >
            {!isPending ? "Ingresar" : "Procesando..."}
          </button>
        </form>
      </div>
    </div>
  );
};
