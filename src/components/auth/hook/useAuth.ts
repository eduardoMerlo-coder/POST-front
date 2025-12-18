import { supabase } from "@/lib/supabaseClient";
import { ActionEnum } from "@/setup/auth.types";
import { useAuth } from "@/setup/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      console.log(authData);

      if (error) throw error;
      return authData;
    },
    onSuccess: (authData) => {
      dispatch?.({ type: ActionEnum.Login, payload: authData });
      navigate("/product", { replace: true });
    },
  });
};

export const useLogout = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      dispatch?.({ type: ActionEnum.Logout });
      navigate("/login", { replace: true });
    },
  });
};
