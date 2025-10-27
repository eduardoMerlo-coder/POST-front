import { axiosPrivate } from "@/lib/axios";
import { ActionEnum } from "@/setup/auth.types";
import { useAuth } from "@/setup/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { name: string; password: string }) =>
      axiosPrivate.post("/login", data),
    onSuccess: (res: any) => {
      dispatch?.({ type: ActionEnum.Login, payload: res.data });
      navigate("/product", { replace: true });
    },
  });
};

export const useLogout = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => axiosPrivate.post("/logout"),
    onSuccess: () => {
      dispatch?.({ type: ActionEnum.Logout });
      navigate("/login", { replace: true });
    },
  });
};
