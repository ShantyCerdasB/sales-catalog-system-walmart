```markdown
# Sales & Catalog API

A Node.js + Express backend for the Sales & Catalog Management System.  
Provides RESTful endpoints for Products, Clients, Discounts, Sales, Reports and Authentication. Built with TypeScript, Prisma ORM, and industry-standard security & quality practices.

---

## 🏗️ Project Structure

```

apps/api
├── prisma/                 # Prisma schema & migrations
├── src/
│   ├── controllers/        # Express route handlers (Swagger-annotated)
│   ├── services/           # Business logic
│   ├── repositories/       # Data access via Prisma
│   ├── middleware/         # Global Express middleware
│   ├── routes/             # Route registration
│   ├── docs/               # Swagger setup
│   ├── config/             # Environment & configuration
│   ├── utils/              # Helpers (logger, password hashing, JWT)
│   └── index.ts            # App bootstrap
├── jest.config.js          # Unit test configuration
└── tsconfig.json

````

---

## 🚀 Tech Stack

- **Node.js & Express** – HTTP server  
- **TypeScript** – Static typing & safety  
- **Prisma** – Type-safe ORM for MySQL / SQL Server  
- **Zod** – Request payload validation  
- **JWT** – JSON Web Tokens for authentication  
- **bcrypt** – Password hashing  
- **Helmet** – Secure HTTP headers  
- **cors** – Cross-origin resource sharing  
- **rate-limit** – Brute-force protection  
- **Swagger (OpenAPI)** – Interactive API docs  
- **Jest** – Unit testing  
- **ESLint & Prettier** – Code linting & formatting  

---

## 🔐 Security & Middleware

1. **Authentication**  
   - **JWT**: Upon login, issues an access token (short-lived) and refresh token (long-lived).  
   - **`jwtAuth` middleware**: Verifies token, attaches `req.user`.  
   - **`rbac` middleware**: Checks user’s roles (via `UserRole`) to guard sensitive routes.

2. **Input Validation**  
   - **`validateRequest`**: Uses Zod schemas to validate `req.body`, `req.params`, `req.query`.  
   - Returns `400 Bad Request` on schema violations.

3. **Rate Limiting & CORS**  
   - **`rateLimiter`**: Limits requests per IP to mitigate brute-force.  
   - **`cors`**: Restricts which origins can call the API.

4. **Security Headers**  
   - **`helmet`**: Sets HTTP headers (HSTS, XSS protection, content security policy).

5. **Correlation IDs & Logging**  
   - **`correlationId`**: Generates a unique ID per request, logs it with `morgan`/`winston`.  
   - All errors and requests include this ID for traceability.

6. **Error Handling**  
   - **`errorHandler`**: Catches thrown errors, logs stack traces, and sends standardized JSON error responses.

---

## 🛠️ Getting Started

1. **Install dependencies**  
   ```bash
   cd apps/api
   pnpm install
````

2. **Configure environment**
   Create a `.env` file:

   ```env
   DATABASE_URL="mysql://user:pass@localhost:3306/sales_catalog"
   JWT_SECRET="your-very-secure-secret"
   JWT_EXPIRES_IN="15m"
   REFRESH_TOKEN_EXPIRES_IN="7d"
   ```

3. **Run Prisma migrations**

   ```bash
   pnpm prisma migrate deploy
   ```

4. **Start the server**

   ```bash
   pnpm dev
   # or
   pnpm build && pnpm start
   ```

5. **Explore Swagger UI**
   Open `http://localhost:3000/docs` for interactive API documentation.

---

## 📦 Available Scripts

* `pnpm dev` – Run in development mode (with nodemon)
* `pnpm build` – Compile TypeScript
* `pnpm start` – Run the compiled app
* `pnpm test` – Run Jest unit tests
* `pnpm lint` – Run ESLint
* `pnpm prisma:migrate` – Apply database migrations

---

## 🧪 Testing

* **Unit tests** cover services and utility functions.
* **Integration tests** (optional) can spin up a test database to exercise controllers & repositories.

