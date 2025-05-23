````markdown
# Sales Catalog System

Monorepo for the Sales Catalog System, containing three applications (API, Web, Mobile) and shared packages for configuration, types, and UI components.

## 🔧 Prerequisites

- Node.js ≥ 16.x  
- pnpm ≥ 8.x (or Yarn 3+)  
- Azure CLI  
- Expo CLI (if using the mobile app)  
- Git  

## 🚀 Quick Start

1. **Clone the repo**  
   ```bash
   git clone https://github.com/ShantyCerdasB/sales-catalog-system.git
   cd sales-catalog-system
````

2. **Environment**

   ```bash
   cp .env.example .env.dev
   # Edit .env.dev with your values (Azure, B2C, Database, Service Bus, etc.)
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Run in development**

   ```bash
   pnpm dev
   ```

   This will start all three apps in parallel:

   * **API** on `http://localhost:4000`
   * **Web** on `http://localhost:5173`
   * **Mobile** on Expo (QR code)

5. **Build for production**

   ```bash
   pnpm build
   ```

6. **Lint & Test**

   ```bash
   pnpm lint
   pnpm test
   ```

## 📂 Repository Structure

```
/
├── apps/
│   ├── api/       # Node.js + Express + Prisma backend
│   ├── web/       # React + Vite frontend
│   └── mobile/    # React Native (Expo) mobile app
├── packages/
│   ├── config/    # ESLint, Prettier, Jest/Vitest presets
│   ├── types/     # Shared TypeScript interfaces & Zod schemas
│   └── ui/        # Optional: shared React/Tailwind components
├── infra/         # Azure CLI provisioning scripts
├── scripts/       # Dev utilities (seed-db, start-all)
├── docs/          # Architecture, naming, roles & auth
├── .github/       # CI/CD & performance test workflows
├── .env.example   # Template for environment variables
├── turbo.json     # Turborepo pipeline configuration
├── tsconfig.json  # Root TypeScript settings
├── package.json   # Monorepo root manifest & scripts
└── .gitignore     # Ignored files & folders
```

## ⚙️ Root Scripts

* `pnpm dev`
  Starts API, Web and Mobile in parallel via Turborepo.

* `pnpm build`
  Builds all apps and packages in dependency order.

* `pnpm lint`
  Runs ESLint across all workspaces.

* `pnpm test`
  Executes Jest (API) and Vitest (Web/Mobile) tests.

* `pnpm prepare`
  Installs Husky Git hooks.

## 📋 Workspaces

Defined in `package.json`:

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

This ensures a single lockfile and shared dependencies.

---

For detailed guides on each app and package, see the individual `README.md` files under `apps/` and `packages/`. Happy coding!\`\`\`
