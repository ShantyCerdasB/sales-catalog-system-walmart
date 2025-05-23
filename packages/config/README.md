````markdown
# **@sales-catalog/config**

Shared configuration package for **ESLint, Prettier, Jest, and Vitest** in the **Sales Catalog System** monorepo.  
Keeping these settings in one place guarantees consistent code quality, formatting, and testing standards for every workspace.

---

## Installation

Add the package as a development dependency at the monorepo root:

```bash
pnpm add -D @sales-catalog/config -w
````

---

## Contents

| File                     | Purpose                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| **`eslint.config.js`**   | Base ESLint configuration for TypeScript, including recommended rule sets. |
| **`prettier.config.js`** | Formatting rules (e.g., `printWidth`, `tabWidth`, `singleQuote`).          |
| **`jest.config.js`**     | Jest preset configured with **ts-jest** for TypeScript test suites.        |
| **`vitest.config.ts`**   | Vitest preset targeting browser / JSDOM environments.                      |

---

## Usage in each workspace

### ESLint

Add the config in your app’s `package.json` (or create an `.eslintrc.js`):

```jsonc
// package.json
{
  "eslintConfig": {
    "extends": ["@sales-catalog/config/eslint.config.js"]
  }
}
```

```js
// .eslintrc.js
module.exports = require("@sales-catalog/config/eslint.config.js");
```

### Prettier

Reference the shared Prettier rules:

```jsonc
// package.json
{
  "prettier": "@sales-catalog/config/prettier.config.js"
}
```

```js
// .prettierrc.js
module.exports = require("@sales-catalog/config/prettier.config.js");
```

### Jest

In a back-end or Node project:

```js
// jest.config.js
module.exports = require("@sales-catalog/config/jest.config.js");
```

### Vitest

For a front-end or React Native project:

```ts
// vitest.config.ts
import baseConfig from "@sales-catalog/config/vitest.config";
export default baseConfig;
```

