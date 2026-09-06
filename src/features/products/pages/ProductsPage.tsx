import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProducts } from "../hooks/use-products";

const PAGE_SIZE = 10;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search: string = searchParams.get("q") ?? "";
  const [page, setPage] = useState<number>(0);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 1000);

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
    setPage(0);
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Products
        </h1>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          className="rounded-md border border-orange-300 active:border-orange-300 focus-visible:border-orange-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2">{product.title}</td>
                <td className="px-4 py-2 text-slate-500">{product.category}</td>
                <td className="px-4 py-2">${product.price}</td>
                <td className="px-4 py-2">{product.stock}</td>
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
    </div>
  );
}
