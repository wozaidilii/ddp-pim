/* eslint-disable @next/next/no-img-element */
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { DppQrCode } from "~/app/_components/dpp-qr-code";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Product Passport",
};

/** Sustainability metric card */
function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  if (value === null || value === "") return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-xs tracking-wide text-stone-500 uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold text-stone-900">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-stone-500">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

export default async function DppPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const product = await api.product.byPublicId({ publicId });
  if (!product) notFound();

  const certifications = (product.certifications ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Header */}
      <div className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <p className="text-xs font-medium tracking-widest text-emerald-200 uppercase">
            Digital Product Passport
          </p>
          <div className="mt-3 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="mt-1 text-emerald-100">{product.brand}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-emerald-200">
                <span>SKU: {product.sku}</span>
                {product.gtin && <span>GTIN: {product.gtin}</span>}
              </div>
            </div>
            <DppQrCode />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 pt-8">
        {/* Product image and description */}
        {(product.imageUrl ?? product.description) && (
          <section className="flex gap-6 rounded-xl border border-stone-200 bg-white p-6">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-32 w-32 shrink-0 rounded-lg object-cover"
              />
            )}
            {product.description && (
              <p className="text-sm leading-relaxed text-stone-600">
                {product.description}
              </p>
            )}
          </section>
        )}

        {/* Sustainability metrics */}
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500 uppercase">
            Sustainability
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Carbon Footprint"
              value={product.carbonFootprintKg}
              unit="kg CO2e"
            />
            <MetricCard
              label="Recyclability"
              value={product.recyclabilityPct}
              unit="%"
            />
            <MetricCard
              label="Durability"
              value={product.durabilityYears}
              unit="years"
            />
            <MetricCard
              label="Repairability"
              value={product.repairabilityScore}
              unit="/ 10"
            />
          </div>
          {product.countryOfOrigin && (
            <p className="mt-3 text-sm text-stone-500">
              Country of origin:{" "}
              <span className="font-medium text-stone-700">
                {product.countryOfOrigin}
              </span>
            </p>
          )}
        </section>

        {/* Material composition */}
        {product.materials.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500 uppercase">
              Material Composition
            </h2>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              {product.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between border-b border-stone-100 px-4 py-3 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-stone-800">
                      {material.name}
                    </span>
                    {material.recycled && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Recycled
                      </span>
                    )}
                    {material.origin && (
                      <span className="ml-2 text-xs text-stone-400">
                        {material.origin}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(Math.max(material.percentage, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-sm text-stone-600">
                      {material.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Supply chain journey */}
        {product.supplyChain.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500 uppercase">
              Supply Chain Journey
            </h2>
            <ol className="space-y-0">
              {product.supplyChain.map((step, index) => (
                <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline connector */}
                  {index < product.supplyChain.length - 1 && (
                    <span className="absolute top-8 left-[15px] h-full w-px bg-stone-200" />
                  )}
                  <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                    <p className="text-sm font-medium text-stone-800">
                      {step.stage}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {[step.facility, step.location]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    {step.description && (
                      <p className="mt-1 text-xs text-stone-400">
                        {step.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Certifications and care */}
        {(certifications.length > 0 || product.careInstructions) && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {certifications.length > 0 && (
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <span
                      key={cert}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.careInstructions && (
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Care Instructions
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  {product.careInstructions}
                </p>
              </div>
            )}
          </section>
        )}

        <footer className="border-t border-stone-200 pt-6 text-center text-xs text-stone-400">
          Passport ID: {product.publicId}
          {product.publishedAt && (
            <> · Published {product.publishedAt.toISOString().slice(0, 10)}</>
          )}
        </footer>
      </div>
    </div>
  );
}
