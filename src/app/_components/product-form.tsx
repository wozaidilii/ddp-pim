"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

/** The form keeps numeric fields as strings and converts them safely on submit */
type MaterialRow = {
  name: string;
  percentage: string;
  recycled: boolean;
  origin: string;
};

type SupplyChainRow = {
  stage: string;
  facility: string;
  location: string;
  description: string;
};

type FormState = {
  name: string;
  sku: string;
  gtin: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  countryOfOrigin: string;
  carbonFootprintKg: string;
  recyclabilityPct: string;
  durabilityYears: string;
  repairabilityScore: string;
  careInstructions: string;
  certifications: string;
  materials: MaterialRow[];
  supplyChain: SupplyChainRow[];
};

const emptyForm: FormState = {
  name: "",
  sku: "",
  gtin: "",
  brand: "",
  category: "",
  description: "",
  imageUrl: "",
  countryOfOrigin: "",
  carbonFootprintKg: "",
  recyclabilityPct: "",
  durabilityYears: "",
  repairabilityScore: "",
  careInstructions: "",
  certifications: "",
  materials: [],
  supplyChain: [],
};

/** Returns undefined for empty or invalid numbers so NaN never leaks into the data */
function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export type ProductFormInitial = FormState & { id: string };

export function ProductForm({ initial }: { initial?: ProductFormInitial }) {
  const router = useRouter();
  const utils = api.useUtils();
  const [form, setForm] = useState<FormState>(initial ?? emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSuccess = async () => {
    await utils.product.invalidate();
    router.push("/");
    router.refresh();
  };
  const onError = (error: { message: string }) =>
    setErrorMessage(error.message);

  const createProduct = api.product.create.useMutation({ onSuccess, onError });
  const updateProduct = api.product.update.useMutation({ onSuccess, onError });
  const isPending = createProduct.isPending || updateProduct.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setMaterial = (index: number, patch: Partial<MaterialRow>) =>
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));

  const setStep = (index: number, patch: Partial<SupplyChainRow>) =>
    setForm((prev) => ({
      ...prev,
      supplyChain: prev.supplyChain.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const payload = {
      name: form.name,
      sku: form.sku,
      gtin: form.gtin || undefined,
      brand: form.brand || undefined,
      category: form.category || undefined,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      countryOfOrigin: form.countryOfOrigin || undefined,
      carbonFootprintKg: parseOptionalNumber(form.carbonFootprintKg),
      recyclabilityPct: parseOptionalNumber(form.recyclabilityPct),
      durabilityYears: parseOptionalNumber(form.durabilityYears),
      repairabilityScore: parseOptionalNumber(form.repairabilityScore),
      careInstructions: form.careInstructions || undefined,
      certifications: form.certifications || undefined,
      // Rows without a name are treated as blank and skipped
      materials: form.materials
        .filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          percentage: parseOptionalNumber(m.percentage) ?? 0,
          recycled: m.recycled,
          origin: m.origin || undefined,
        })),
      supplyChain: form.supplyChain
        .filter((s) => s.stage.trim() !== "")
        .map((s) => ({
          stage: s.stage,
          facility: s.facility || undefined,
          location: s.location || undefined,
          description: s.description || undefined,
        })),
    };

    if (initial) {
      updateProduct.mutate({ id: initial.id, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
  const labelClass = "mb-1 block text-xs font-medium text-stone-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Basic information */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-stone-500 uppercase">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Product Name *</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>SKU *</label>
            <input
              className={inputClass}
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>GTIN / Barcode</label>
            <input
              className={inputClass}
              value={form.gtin}
              onChange={(e) => set("gtin", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              className={inputClass}
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Apparel, Electronics"
            />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              className={inputClass}
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Sustainability data */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-stone-500 uppercase">
          Sustainability (DPP)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Country of Origin</label>
            <input
              className={inputClass}
              value={form.countryOfOrigin}
              onChange={(e) => set("countryOfOrigin", e.target.value)}
              placeholder="e.g. Taiwan"
            />
          </div>
          <div>
            <label className={labelClass}>Carbon Footprint (kg CO2e)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step="any"
              value={form.carbonFootprintKg}
              onChange={(e) => set("carbonFootprintKg", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Recyclability (%)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              step="any"
              value={form.recyclabilityPct}
              onChange={(e) => set("recyclabilityPct", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Expected Lifetime (years)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step={1}
              value={form.durabilityYears}
              onChange={(e) => set("durabilityYears", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Repairability Score (0-10)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              max={10}
              step="any"
              value={form.repairabilityScore}
              onChange={(e) => set("repairabilityScore", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Certifications (comma-separated)</label>
            <input
              className={inputClass}
              value={form.certifications}
              onChange={(e) => set("certifications", e.target.value)}
              placeholder="GOTS, OEKO-TEX"
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Care Instructions</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.careInstructions}
              onChange={(e) => set("careInstructions", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Material composition */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            Material Composition
          </h2>
          <button
            type="button"
            onClick={() =>
              set("materials", [
                ...form.materials,
                { name: "", percentage: "", recycled: false, origin: "" },
              ])
            }
            className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
          >
            + Add Material
          </button>
        </div>
        {form.materials.length === 0 ? (
          <p className="text-sm text-stone-400">No materials added yet</p>
        ) : (
          <div className="space-y-3">
            {form.materials.map((material, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-end gap-3 rounded-lg bg-stone-50 p-3 sm:grid-cols-[1fr_100px_1fr_auto_auto]"
              >
                <div>
                  <label className={labelClass}>Material Name</label>
                  <input
                    className={inputClass}
                    value={material.name}
                    onChange={(e) =>
                      setMaterial(index, { name: e.target.value })
                    }
                    placeholder="e.g. Organic Cotton"
                  />
                </div>
                <div>
                  <label className={labelClass}>Share %</label>
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={material.percentage}
                    onChange={(e) =>
                      setMaterial(index, { percentage: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Origin</label>
                  <input
                    className={inputClass}
                    value={material.origin}
                    onChange={(e) =>
                      setMaterial(index, { origin: e.target.value })
                    }
                  />
                </div>
                <label className="flex items-center gap-1.5 pb-2 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={material.recycled}
                    onChange={(e) =>
                      setMaterial(index, { recycled: e.target.checked })
                    }
                    className="accent-emerald-600"
                  />
                  Recycled
                </label>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "materials",
                      form.materials.filter((_, i) => i !== index),
                    )
                  }
                  className="pb-2 text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Supply chain */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            Supply Chain
          </h2>
          <button
            type="button"
            onClick={() =>
              set("supplyChain", [
                ...form.supplyChain,
                { stage: "", facility: "", location: "", description: "" },
              ])
            }
            className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
          >
            + Add Step
          </button>
        </div>
        {form.supplyChain.length === 0 ? (
          <p className="text-sm text-stone-400">No supply chain steps added yet</p>
        ) : (
          <div className="space-y-3">
            {form.supplyChain.map((step, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-end gap-3 rounded-lg bg-stone-50 p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {index + 1}
                </span>
                <div>
                  <label className={labelClass}>Stage</label>
                  <input
                    className={inputClass}
                    value={step.stage}
                    onChange={(e) => setStep(index, { stage: e.target.value })}
                    placeholder="e.g. Manufacturing"
                  />
                </div>
                <div>
                  <label className={labelClass}>Facility</label>
                  <input
                    className={inputClass}
                    value={step.facility}
                    onChange={(e) =>
                      setStep(index, { facility: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    value={step.location}
                    onChange={(e) =>
                      setStep(index, { location: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "supplyChain",
                      form.supplyChain.filter((_, i) => i !== index),
                    )
                  }
                  className="pb-2 text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : initial ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-lg px-4 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
