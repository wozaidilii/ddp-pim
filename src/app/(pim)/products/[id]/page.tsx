import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ProductForm,
  type ProductFormInitial,
} from "~/app/_components/product-form";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

/** Convert database null and numeric fields into the strings the form uses */
const toText = (value: string | number | null) =>
  value === null ? "" : String(value);

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await api.product.byId({ id }).catch(() => null);
  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    gtin: toText(product.gtin),
    brand: toText(product.brand),
    category: toText(product.category),
    description: toText(product.description),
    imageUrl: toText(product.imageUrl),
    countryOfOrigin: toText(product.countryOfOrigin),
    carbonFootprintKg: toText(product.carbonFootprintKg),
    recyclabilityPct: toText(product.recyclabilityPct),
    durabilityYears: toText(product.durabilityYears),
    repairabilityScore: toText(product.repairabilityScore),
    careInstructions: toText(product.careInstructions),
    certifications: toText(product.certifications),
    materials: product.materials.map((m) => ({
      name: m.name,
      percentage: String(m.percentage),
      recycled: m.recycled,
      origin: toText(m.origin),
    })),
    supplyChain: product.supplyChain.map((s) => ({
      stage: s.stage,
      facility: toText(s.facility),
      location: toText(s.location),
      description: toText(s.description),
    })),
  };

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Edit product information and DPP data
          </p>
        </div>
        {product.status === "PUBLISHED" && (
          <Link
            href={`/dpp/${product.publicId}`}
            target="_blank"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            View public DPP →
          </Link>
        )}
      </div>
      <ProductForm initial={initial} />
    </>
  );
}
