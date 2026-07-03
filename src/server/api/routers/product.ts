import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/** Material input, percentage constrained to 0-100 */
const materialInput = z.object({
  name: z.string().trim().min(1, "Material name is required"),
  percentage: z.number().min(0).max(100),
  recycled: z.boolean().default(false),
  origin: z.string().trim().optional(),
});

/** Supply chain step input */
const supplyChainStepInput = z.object({
  stage: z.string().trim().min(1, "Stage name is required"),
  facility: z.string().trim().optional(),
  location: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

/** Product fields shared by create and update */
const productFields = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  gtin: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z
    .string()
    .trim()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("")),
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

/** Normalize empty strings to null so the database never stores meaningless blanks */
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      return product;
    }),

  /** Public DPP page lookup, only returns published products */
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
          message: `SKU "${input.sku}" already exists`,
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
          message: `SKU "${rest.sku}" is already used by another product`,
        });
      }

      // Materials and supply chain are rebuilt wholesale; MVP avoids complex diff logic
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

  /** Toggle publish state; once published the public DPP page becomes accessible */
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
