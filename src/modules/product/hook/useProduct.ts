import { axiosPrivate } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../ProductIndex";

export const useGetAllBaseProducts = () => {
  return useQuery({
    queryKey: ["all-base-products"],
    queryFn: () =>
      axiosPrivate.get<Product[]>("/base-products").then((res) => res.data),
    initialData: [],
  });
};
