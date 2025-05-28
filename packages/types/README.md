````markdown
# **@sales-catalog/types**

Shared TypeScript models and Zod schemas used across the **Sales Catalog System** monorepo.

---

## Installation

Add the package to the workspace root:

```bash
pnpm add @sales-catalog/types -w
````

---

## Contents

```
src/
├── product.ts
├── client.ts
├── discount.ts
├── saleItem.ts
├── sale.ts
└── index.ts   # Barrel export
```

---

## Usage

```ts
import {
  ProductSchema,
  ClientSchema,
  DiscountSchema,
  SaleItemSchema,
  SaleSchema,
  Product,
  Client,
  Discount,
  SaleItem,
  Sale,
} from '@sales-catalog/types';

/* Example: validate incoming data with Zod */

const raw = {
  id: 'c3f890aa-e2d9-4d3e-80f2-5fa4d8c2fe44',
  name: 'Wireless Mouse',
  price: 29.99,
  discountId: null,
  createdAt: '2025-05-20T18:30:12.000Z',
  updatedAt: '2025-05-20T18:30:12.000Z',
};

const product: Product = ProductSchema.parse(raw);
```

The package re-exports both **schemas** and their corresponding **TypeScript types** (`z.infer<...>`), so you can rely on the same source of truth for validation and static type checking.

