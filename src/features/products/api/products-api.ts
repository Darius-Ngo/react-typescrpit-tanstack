import { apiClient } from "@/lib/api-client";
import type { PageParams } from "@/types/common";
import type { Product, ProductsResponse } from "../types";
import type { ProductFormValues } from "../schema";

export async function fetchProducts(params: PageParams, search: string) {
  const endpoint = search ? "/products/search" : "/products";
  const { data } = await apiClient.get<ProductsResponse>(endpoint, {
    params: { ...params, q: search || undefined },
  });
  return data;
}

export async function createProduct(payload: ProductFormValues) {
  const { data } = await apiClient.post<Product>("/products/add", payload);
  return data;
}

export async function updateProduct(id: number, payload: ProductFormValues) {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await apiClient.delete<Product>(`/products/${id}`);
  return data;
}
