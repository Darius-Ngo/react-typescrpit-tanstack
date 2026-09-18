import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../api/products-api";
import type { ProductFormValues } from "../schema";
import type { ProductsResponse } from "../types";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            products: [newProduct, ...old.products],
            total: old.total + 1,
          };
        },
      );
      toast.success("Product created");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductFormValues }) =>
      updateProduct(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            products: old.products.map((p) =>
              p.id === updated.id ? { ...p, ...updated } : p,
            ),
          };
        },
      );
      toast.success("Product updated");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            products: old.products.filter((p) => p.id !== id),
            total: old.total - 1,
          };
        },
      );
      toast.success("Product deleted");
    },
  });
}
