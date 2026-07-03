import { ProductList } from "~/app/_components/product-list";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  void api.product.list.prefetch();

  return (
    <HydrateClient>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-stone-500">
          Manage product information and publish a Digital Product Passport
          (DPP) for each product
        </p>
      </div>
      <ProductList />
    </HydrateClient>
  );
}
