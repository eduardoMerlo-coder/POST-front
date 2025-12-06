import { type FormEvent, useState } from "react";
import { useLogin } from "./hook/useAuth";
import { MdMail, MdLock } from "react-icons/md";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export const Login = () => {
  const { mutate, isPending, isError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    mutate({ email, password });
  };

  return (
    <div className="bg-[url(/images/market.jpg)] bg-cover bg-no-repeat bg-center h-dvh w-full relative flex items-center justify-center">
      {/* Capa de opacidad */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenido del formulario */}
      <div className=" w-11/12 lg:w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10 ">
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2 text-3xl font-bold">
            Iniciar sesion
          </h1>
        </div>

        {isError && (
          <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-center"
            role="alert"
          >
            Credenciales invalidas
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 mb-2 font-semibold text-sm"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <MdMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f31260] text-black ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 mb-2 text-sm font-semibold"
            >
              Contraseña
            </label>
            <div className="relative">
              <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f31260] text-black ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <IoEyeOffOutline className="w-5 h-5" />
                ) : (
                  <IoEyeOutline className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#f31260] border-gray-300 rounded focus:ring-[#f31260]"
              />
              <span className="ml-2 text-gray-700 text-xs font-semibold">
                Recuérdame
              </span>
            </label>
            <a
              href="#"
              className="text-[#f31260] hover:text-[#c10e4d] text-xs font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#f31260] text-white py-3 rounded-lg hover:bg-[#c10e4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
          >
            {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs font-semibold">
            ¿No tienes una cuenta?{" "}
            <a
              href="#"
              className="text-[#f31260] hover:text-[#c10e4d] text-xs font-semibold"
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
