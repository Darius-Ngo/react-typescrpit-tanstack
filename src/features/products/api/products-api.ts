import { apiClient } from "@/lib/api-client";
import type { PageParams } from "@/types/common";
import type { ProductsResponse } from "../types";

export async function fetchProducts(params: PageParams, search: string) {
  const endpoint = search ? "/products/search" : "/products";
  const { data } = await apiClient.get<ProductsResponse>(endpoint, {
    params: { ...params, q: search || undefined },
  });
  return data;
}
