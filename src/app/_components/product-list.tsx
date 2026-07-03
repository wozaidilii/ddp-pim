"use client";

import Link from "next/link";

import { api } from "~/trpc/react";

/** Product status badge */
function StatusBadge({ status }: { status: string }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        published
          ? "bg-emerald-100 text-emerald-700"
          : "bg-stone-100 text-stone-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-emerald-500" : "bg-stone-400"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function ProductList() {
  const utils = api.useUtils();
  const { data: products, isLoading, error } = api.product.list.useQuery();

  const setPublished = api.product.setPublished.useMutation({
    onSuccess: () => utils.product.list.invalidate(),
  });
  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => utils.product.list.invalidate(),
  });

  if (isLoading) {
    return <p className="py-12 text-center text-stone-400">Loading…</p>;
  }
  if (error) {
    return (
      <p className="py-12 text-center text-red-500">
        Failed to load: {error.message}
      </p>
    );
  }
  if (!products || products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
        <p className="text-stone-500">No products yet</p>
        <Link
          href="/products/new"
          className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Create your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs tracking-wide text-stone-500 uppercase">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Materials</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/products/${product.id}`}
                  className="font-medium text-stone-900 hover:text-emerald-700"
                >
                  {product.name}
                </Link>
                {product.brand && (
                  <span className="ml-2 text-xs text-stone-400">
                    {product.brand}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-stone-500">
                {product.sku}
              </td>
              <td className="px-4 py-3 text-stone-500">
                {product.materials.length > 0
                  ? product.materials.map((m) => m.name).join(", ")
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={product.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {product.status === "PUBLISHED" && (
                    <Link
                      href={`/dpp/${product.publicId}`}
                      target="_blank"
                      className="rounded-md px-2 py-1 text-xs text-emerald-700 transition hover:bg-emerald-50"
                    >
                      View DPP
                    </Link>
                  )}
                  <button
                    onClick={() =>
                      setPublished.mutate({
                        id: product.id,
                        published: product.status !== "PUBLISHED",
                      })
                    }
                    disabled={setPublished.isPending}
                    className="rounded-md px-2 py-1 text-xs text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
                  >
                    {product.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${product.name}"?`)) {
                        deleteProduct.mutate({ id: product.id });
                      }
                    }}
                    disabled={deleteProduct.isPending}
                    className="rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
