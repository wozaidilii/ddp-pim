# DPP PIM

一個以 **Digital Product Passport(數位產品護照)** 為核心功能的 **PIM(產品資訊管理)** MVP,使用 [T3 Stack](https://create.t3.gg/) 構建。

## 功能

- **產品管理**:建立、編輯、刪除產品,涵蓋 SKU、GTIN、品牌、分類等 PIM 基本欄位
- **DPP 資料**:碳足跡、可回收比例、耐用年限、可修復性評分、認證、保養說明
- **材料組成**:多筆材料、佔比、回收料標記、來源地
- **供應鏈旅程**:依序記錄原料、製造、配送等步驟
- **一鍵發佈**:發佈後產生公開的 DPP 頁面(`/dpp/[publicId]`),附 QR code,消費者掃碼即可查看

## 技術棧

- [Next.js](https://nextjs.org)(App Router)
- [tRPC](https://trpc.io)
- [Prisma](https://prisma.io) + SQLite
- [Tailwind CSS](https://tailwindcss.com)
- TypeScript

## 開始使用

```bash
npm install
npm run db:push   # 建立 SQLite 資料庫
npm run db:seed   # 匯入示範資料(可選)
npm run dev       # 啟動開發伺服器 http://localhost:3000
```

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 正式環境 build |
| `npm run db:push` | 同步 Prisma schema 到資料庫 |
| `npm run db:seed` | 匯入示範資料 |
| `npm run db:studio` | 開啟 Prisma Studio 檢視資料 |
| `npm run typecheck` | TypeScript 型別檢查 |

## 頁面結構

| 路徑 | 說明 |
| --- | --- |
| `/` | 產品列表(管理後台) |
| `/products/new` | 建立產品 |
| `/products/[id]` | 編輯產品 |
| `/dpp/[publicId]` | 公開 DPP 頁面(僅已發佈產品可見) |

## MVP 之後的方向

- 使用者認證與多租戶(NextAuth)
- 圖片上傳(目前僅支援外部網址)
- DPP 欄位對齊 EU ESPR 法規要求
- 批次匯入 / 匯出(CSV)
- 產品版本歷史與稽核紀錄
