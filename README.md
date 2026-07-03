# DPP PIM

A **PIM (Product Information Management)** MVP centered on **Digital Product Passport (DPP)** features, built with the [T3 Stack](https://create.t3.gg/).

## Features

- **Product management**: create, edit, and delete products with core PIM fields such as SKU, GTIN, brand, and category
- **DPP data**: carbon footprint, recyclability, expected lifetime, repairability score, certifications, and care instructions
- **Material composition**: multiple materials with share percentage, recycled flag, and origin
- **Supply chain journey**: ordered steps covering raw material, manufacturing, distribution, and more
- **One-click publishing**: publishing generates a public DPP page (`/dpp/[publicId]`) with a QR code that consumers can scan

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [tRPC](https://trpc.io)
- [Prisma](https://prisma.io) + SQLite
- [Tailwind CSS](https://tailwindcss.com)
- TypeScript

## Getting Started

```bash
npm install
npm run db:push   # create the SQLite database
npm run db:seed   # load demo data (optional)
npm run dev       # start the dev server at http://localhost:3000
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Prisma Studio to inspect data |
| `npm run typecheck` | TypeScript type checking |

## Pages

| Path | Description |
| --- | --- |
| `/` | Product list (admin) |
| `/products/new` | Create a product |
| `/products/[id]` | Edit a product |
| `/dpp/[publicId]` | Public DPP page (published products only) |

## Beyond the MVP

- User authentication and multi-tenancy (NextAuth)
- Image uploads (currently external URLs only)
- Aligning DPP fields with EU ESPR regulatory requirements
- Batch import / export (CSV)
- Product version history and audit logs
# ddp-pim
