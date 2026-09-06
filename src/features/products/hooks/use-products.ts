import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../api/products-api";

interface UseProductsParams {
  page: number;
  pageSize: number;
  search: string;
}

function productsQueryOptions({ page, pageSize, search }: UseProductsParams) {
  return queryOptions({
    queryKey: ["products", { page, pageSize, search }] as const,
    queryFn: () =>
      fetchProducts({ limit: pageSize, skip: page * pageSize }, search),
  });
}

export function useProducts(params: UseProductsParams) {
  return useQuery(productsQueryOptions(params));
}
