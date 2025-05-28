```markdown
# Sales & Catalog Web App

A React-based front-end for the Sales & Catalog Management System, providing an intuitive UI for managing products, clients, discounts, sales and reports. This project emphasizes modular architecture, SOLID principles, and modern React best practices.

---

## 🏗️ Folder Structure

```

apps/web
├── public/
│   └── index.html
└── src/
├── assets/               # Images, global styles, fonts
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Card, FormField)
│   └── layout/           # Layout components (Header, Sidebar, Footer)
├── features/             # “Feature” modules
│   ├── products/
│   ├── clients/
│   ├── discounts/
│   ├── sales/
│   └── reports/
├── hooks/                # Custom hooks (useAuth, useFetch, useForm)
├── pages/                # Top-level pages (ProductsPage, Dashboard, etc.)
├── routes/               # React Router setup
├── services/             # Non-UI logic (authService, notificationService)
├── store/                # Global state (Zustand stores)
├── utils/                # Helpers (formatDate, calculateTotals)
├── i18n/                 # Internationalization setup (i18next)
├── App.tsx               # Root component
└── index.tsx             # Entry point

````

---

## 🚀 Tech Stack

- **React 18** – UI library  
- **TypeScript** – Static typing for safety  
- **Zustand** – Lightweight, composable state management  
- **React Router v6** – Client-side routing  
- **Zod** – Runtime schema validation for forms  
- **Tailwind CSS** – Utility-first styling  
- **Axios** – HTTP client for API calls  
- **i18next** – Internationalization  
- **Jest & React Testing Library** – Unit & integration tests  
- **Cypress** – End-to-end testing  
- **ESLint & Prettier** – Code linting & formatting  

---

## 🎯 Key Patterns & Practices

- **Feature-based modules**: Each domain (products, clients, etc.) has its own folder with components, state, and API logic.  
- **SOLID & DRY**: Components and hooks follow single-responsibility; common logic abstracted into utilities and custom hooks.  
- **Zustand stores**: Centralized state per feature, with devtools and middleware for persistence.  
- **Custom hooks**: `useAuth` for authentication flow, `useFetch` for data fetching with built-in loading/error handling, `useForm` for Zod-driven form validation.  
- **API layer**: `services/*Api.ts` files encapsulate all HTTP calls; errors and tokens handled centrally.  
- **Responsive layout**: Mobile-first design using Tailwind’s utility classes.  

---

## 📥 Getting Started

1. **Install dependencies**  
   ```bash
   cd apps/web
   pnpm install
````

2. **Environment variables**
   Create a `.env.local`:

   ```env
   VITE_API_URL=https://api.example.com
   ```

3. **Run in development**

   ```bash
   pnpm dev
   ```

4. **Build for production**

   ```bash
   pnpm build
   ```

5. **Run tests**

   * Unit tests: `pnpm test`
   * E2E tests: `pnpm e2e` (opens Cypress)

---

## 🔄 Scripts

* `pnpm dev` – Start Vite dev server
* `pnpm build` – Production build
* `pnpm preview` – Preview production build
* `pnpm lint` – Run ESLint
* `pnpm test` – Run Jest tests
* `pnpm e2e` – Run Cypress tests

---

## 🤝 Contributing

1. Fork the repo and create a branch: `feature/your-feature`
2. Implement your changes, add tests, run `pnpm lint && pnpm test`
3. Open a Pull Request against the `main` branch
4. Ensure at least one review and all CI checks pass

---

