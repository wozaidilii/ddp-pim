-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "gtin" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "countryOfOrigin" TEXT,
    "carbonFootprintKg" DOUBLE PRECISION,
    "recyclabilityPct" DOUBLE PRECISION,
    "durabilityYears" INTEGER,
    "repairabilityScore" DOUBLE PRECISION,
    "careInstructions" TEXT,
    "certifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "recycled" BOOLEAN NOT NULL DEFAULT false,
    "origin" TEXT,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyChainStep" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "facility" TEXT,
    "location" TEXT,
    "description" TEXT,

    CONSTRAINT "SupplyChainStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_publicId_key" ON "Product"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Material_productId_idx" ON "Material"("productId");

-- CreateIndex
CREATE INDEX "SupplyChainStep_productId_idx" ON "SupplyChainStep"("productId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainStep" ADD CONSTRAINT "SupplyChainStep_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
