````markdown
# **API – Sales Catalog System**

HTTP backend for the **Sales Catalog System**.

---

## 🚀 Quick Start

1. **Copy the environment variables**

   ```bash
   cd apps/api
   cp ../../.env.example .env.dev
   # Edit .env.dev with your Azure and Azure AD B2C values
````

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Generate the Prisma client and apply migrations**

   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

4. **Run in development mode**

   ```bash
   pnpm dev
   ```

   By default, the API listens at **[http://localhost:4000](http://localhost:4000)**.

---

## Available Scripts

| Command         | Purpose                                |
| --------------- | -------------------------------------- |
| `pnpm dev`      | Hot-reload server with **ts-node-dev** |
| `pnpm build`    | Compile TypeScript to `dist/`          |
| `pnpm lint`     | Run ESLint on `src/`                   |
| `pnpm test`     | Execute Jest unit tests                |
| `pnpm migrate`  | Create new Prisma migrations           |
| `pnpm generate` | Regenerate the Prisma client           |
| `pnpm seed`     | Run the data-seeding script            |

---

## 🗂 Project Structure

```
apps/api/
├── prisma/                  # Database schema & migrations
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── env.ts           # Environment-variable validation & export
│   ├── index.ts             # Express entry point
│   ├── routes/              # REST route definitions
│   ├── controllers/         # Route handlers (controllers)
│   ├── services/            # Business logic (SOLID, transactions)
│   ├── repositories/        # Data access via Prisma
│   ├── middleware/          # JWT auth, sanitisation, error handling
│   └── utils/               # Hashing, JWT helpers, logger
└── jest.config.js
```

```
```
