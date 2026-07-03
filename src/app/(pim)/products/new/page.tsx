import { ProductForm } from "~/app/_components/product-form";

export default function NewProductPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Product</h1>
        <p className="mt-1 text-sm text-stone-500">
          填寫產品資訊與 DPP 所需的永續性資料
        </p>
      </div>
      <ProductForm />
    </>
  );
}
