import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/** 材料輸入,佔比限制在 0-100 */
const materialInput = z.object({
  name: z.string().trim().min(1, "材料名稱不能為空"),
  percentage: z.number().min(0).max(100),
  recycled: z.boolean().default(false),
  origin: z.string().trim().optional(),
});

/** 供應鏈步驟輸入 */
const supplyChainStepInput = z.object({
  stage: z.string().trim().min(1, "階段名稱不能為空"),
  facility: z.string().trim().optional(),
  location: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

/** 產品欄位,建立與更新共用 */
const productFields = z.object({
  name: z.string().trim().min(1, "產品名稱不能為空"),
  sku: z.string().trim().min(1, "SKU 不能為空"),
  gtin: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().url("圖片必須是有效網址").optional().or(z.literal("")),
  countryOfOrigin: z.string().trim().optional(),
  carbonFootprintKg: z.number().min(0).optional(),
  recyclabilityPct: z.number().min(0).max(100).optional(),
  durabilityYears: z.number().int().min(0).optional(),
  repairabilityScore: z.number().min(0).max(10).optional(),
  careInstructions: z.string().trim().optional(),
  certifications: z.string().trim().optional(),
  materials: z.array(materialInput).default([]),
  supplyChain: z.array(supplyChainStepInput).default([]),
});

/** 將空字串正規化為 null,避免資料庫存入無意義的空值 */
const emptyToNull = (value: string | undefined) =>
  value && value.length > 0 ? value : null;

function toProductData(input: z.infer<typeof productFields>) {
  return {
    name: input.name,
    sku: input.sku,
    gtin: emptyToNull(input.gtin),
    brand: emptyToNull(input.brand),
    category: emptyToNull(input.category),
    description: emptyToNull(input.description),
    imageUrl: emptyToNull(input.imageUrl),
    countryOfOrigin: emptyToNull(input.countryOfOrigin),
    carbonFootprintKg: input.carbonFootprintKg ?? null,
    recyclabilityPct: input.recyclabilityPct ?? null,
    durabilityYears: input.durabilityYears ?? null,
    repairabilityScore: input.repairabilityScore ?? null,
    careInstructions: emptyToNull(input.careInstructions),
    certifications: emptyToNull(input.certifications),
  };
}

export const productRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { materials: true },
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          materials: true,
          supplyChain: { orderBy: { order: "asc" } },
        },
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "找不到該產品" });
      }
      return product;
    }),

  /** DPP 公開頁查詢,只回傳已發佈的產品 */
  byPublicId: publicProcedure
    .input(z.object({ publicId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findFirst({
        where: { publicId: input.publicId, status: "PUBLISHED" },
        include: {
          materials: true,
          supplyChain: { orderBy: { order: "asc" } },
        },
      });
    }),

  create: publicProcedure
    .input(productFields)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.product.findUnique({
        where: { sku: input.sku },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `SKU「${input.sku}」已存在`,
        });
      }
      return ctx.db.product.create({
        data: {
          ...toProductData(input),
          materials: { create: input.materials },
          supplyChain: {
            create: input.supplyChain.map((step, index) => ({
              ...step,
              order: index,
            })),
          },
        },
      });
    }),

  update: publicProcedure
    .input(productFields.extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, materials, supplyChain, ...rest } = input;

      const duplicated = await ctx.db.product.findFirst({
        where: { sku: rest.sku, NOT: { id } },
      });
      if (duplicated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `SKU「${rest.sku}」已被其他產品使用`,
        });
      }

      // 材料與供應鏈整批重建,MVP 階段避免複雜的 diff 邏輯
      return ctx.db.product.update({
        where: { id },
        data: {
          ...toProductData({ ...rest, materials, supplyChain }),
          materials: { deleteMany: {}, create: materials },
          supplyChain: {
            deleteMany: {},
            create: supplyChain.map((step, index) => ({
              ...step,
              order: index,
            })),
          },
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.product.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /** 切換發佈狀態,發佈後 DPP 公開頁即可存取 */
  setPublished: publicProcedure
    .input(z.object({ id: z.string().min(1), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.id },
        data: {
          status: input.published ? "PUBLISHED" : "DRAFT",
          publishedAt: input.published ? new Date() : null,
        },
      });
    }),
});
