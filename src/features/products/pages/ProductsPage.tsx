import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProducts } from "../hooks/use-products";
import { ProductFormModal } from "../components/ProductFormModal";
import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "../hooks/use-product-mutations";
import type { ProductFormValues } from "../schema";
import type { Product } from "../types";
const PAGE_SIZE = 10;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search: string = searchParams.get("q") ?? "";
  const [page, setPage] = useState<number>(0);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 1000);
  type ModalState =
    | { mode: "closed" }
    | { mode: "create" }
    | { mode: "edit"; product: Product };

  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  function handleSubmit(values: ProductFormValues) {
    if (modalState.mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => setModalState({ mode: "closed" }),
      });
    } else if (modalState.mode === "edit") {
      updateMutation.mutate(
        { id: modalState.product.id, payload: values },
        { onSuccess: () => setModalState({ mode: "closed" }) },
      );
    }
  }

  function handleDelete(id: number) {
    if (confirm("Delete this product?")) {
      deleteMutation.mutate(id);
    }
  }

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) {
        next.set("q", debouncedSearch);
      } else {
        next.delete("q");
      }
      return next;
    });
  }, [debouncedSearch, setSearchParams]);

  const { data, isPending, isError, isFetching } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });

  if (isPending) {
    return <p className="text-sm text-slate-500">Loading products…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load products. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Products
        </h1>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          placeholder="Search products…"
          className="rounded-md border border-orange-300 active:border-orange-300 focus-visible:border-orange-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Add product
        </button>
        {isFetching && (
          <span className="text-xs text-slate-400">Refreshing…</span>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2">{product.title}</td>
                <td className="px-4 py-2 text-slate-500">{product.category}</td>
                <td className="px-4 py-2">${product.price}</td>
                <td className="px-4 py-2">{product.stock}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => setModalState({ mode: "edit", product })}
                    className="mr-3 text-slate-600 hover:underline dark:text-slate-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    disabled={
                      deleteMutation.isPending &&
                      deleteMutation.variables === product.id
                    }
                    className="text-red-600 hover:underline disabled:opacity-40"
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === product.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
        >
          Previous
        </button>
        <span className="text-slate-500">
          Page {page + 1} of {Math.ceil(data.total / PAGE_SIZE)}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={(page + 1) * PAGE_SIZE >= data.total}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
        >
          Next
        </button>
      </div>
      {modalState.mode !== "closed" && (
        <ProductFormModal
          defaultValues={
            modalState.mode === "edit" ? modalState.product : undefined
          }
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onClose={() => setModalState({ mode: "closed" })}
        />
      )}
    </div>
  );
}
