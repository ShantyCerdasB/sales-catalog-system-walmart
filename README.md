```markdown
# Sales & Catalog Monorepo

This monorepo contains three front-end and back-end applications plus shared packages and infrastructure code:

- **apps/api** — Express-based REST API (Node.js, TypeScript, Prisma)  
- **apps/web** — React Single-Page App (Vite, TypeScript, Tailwind CSS)  
- **apps/mobile** — React Native mobile client  

Shared code lives under **packages/**, and infrastructure scripts under **infra/**.  

---

## 🔗 How Our Cloud Elements Relate

We host everything in Azure under a single **Subscription** (`SUBSCRIPTION_ID`) and **Resource Group** (`rg-salescat-dev`) in `westus2`. Within that group we deploy:

1. **API App Service**  
   - Hosts `apps/api` as a Linux web app  
   - Exposes REST endpoints at `https://api-salescat-dev.azurewebsites.net/api/*`  
   - Secured by Azure AD B2C (policies in `B2C_*` variables)  
   - Fronted by Azure API Management (`APIM_URL`)  
   - Reads secrets (DB creds, JWT keys) from Key Vault (`KEYVAULT_URI`)

2. **Static Web App**  
   - Serves the built `apps/web` bundle from Azure Static Web Apps or App Service  
   - Base URL `https://api-salescat-dev.azurewebsites.net` with client-side routing under `/`  
   - Reads its API base path from `VITE_API_BASE_URL=/api` in environment  
   - Uses **Tailwind CSS** for all styling

3. **Azure Functions**  
   - **EmailQueueTrigger**: Listens to Service Bus queue (`QUEUE_NAME`) to send transactional emails via SendGrid  
   - **ReportsBlobTrigger**: Scheduled or blob-triggered reports that generate sales analytics and write them to Blob Container (`BLOB_CONTAINER_REPORTS`)  
   - Both functions share the same Storage Account (`stsalescatdev`) and use `AZURE_WEB_JOBS_STORAGE`  

Additional Azure components:

- **Azure Container Registry** (`ACR_LOGIN_SERVER`) stores Docker images for API and Functions.  
- **SQL Server & Database** (`SQL_SERVER_FQDN`, `SQL_DATABASE`) for persistent transactional data, accessed by Prisma via `DATABASE_URL` & `SHADOW_DATABASE_URL`.  
- **Azure AD B2C** for user sign-up/sign-in and JWT issuance, configured via `B2C_*` variables.  
- **Application Insights** (`APP_INSIGHTS_KEY`) for telemetry across all apps.  

The flow is:

1. **User** signs in via B2C in the **Web** or **Mobile** app.  
2. **Web/Mobile** app calls the **API** (through **APIM**), passing the B2C JWT.  
3. **API** reads/writes data in **SQL DB**, triggers **Functions** via Service Bus or Blob events for emails & reports.  
4. **Static Web** and **Mobile** share UI components styled with Tailwind, consume the same REST API.

---

## 📦 Monorepo Structure

```

/
├── apps/
│   ├── api/
│   ├── web/
│   └── mobile/
├── packages/
│   └── types/             # shared Zod schemas & TS types
├── infra/                 # ARM templates, Terraform, or Bicep scripts
├── .github/workflows/     # CI/CD pipelines
├── scaffold-web.ps1       # scaffold script for web app
├── pnpm-workspace.yaml
└── README.md              # ← you are here

````

---

## 🚀 Getting Started

1. Clone and install dependencies:
   ```bash
   pnpm install
````

2. Provision Azure resources (in `infra/`):

   ```bash
   cd infra
   az deployment group create \
     --resource-group rg-salescat-dev \
     --template-file main.bicep \
     --parameters @params.json
   ```

3. Deploy API, Web, and Functions via CI/CD (see `.github/workflows/ci-cd.yml`).

4. Update `.env` files in each app with the corresponding Azure connection strings and keys.

---

## 🏗️ Technologies

* **Backend**: Node.js, Express, Prisma ORM, Zod validation
* **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, Zustand
* **Mobile**: React Native, Expo (or CLI)
* **Auth**: Azure AD B2C (JWT)
* **Infrastructure**: Azure App Service, Functions, Storage, SQL, Key Vault, API Management

---


