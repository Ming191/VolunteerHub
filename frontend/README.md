# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Reproducible frontend build

Prerequisites: Node.js 22+, npm, and Java (required by OpenAPI Generator CLI).

```bash
npm ci
npm run lint
npm run build
```

The `prebuild` / `predev` scripts generate `src/api-client` from the checked-in `openapi.snapshot.json`. The generator version is pinned in `openapitools.json`. A production build no longer depends on a running backend. When backend API signatures change, regenerate `openapi.snapshot.json` from the backend's `/v3/api-docs` endpoint and review the diff before committing it.

The obsolete `@omergulcicek/password-input` dependency was removed because its pinned tarball is unavailable from npm and there are no application imports of it.

## Local browser E2E smoke tests

Run the backend against a **disposable test** PostgreSQL, Redis and RabbitMQ environment, without production data or credentials. Configure a fresh local JWT secret and test-only cloud credentials to allow the server to start. Never commit secrets or DB backups.

Start the frontend with `npm run dev` on `http://localhost:5173` and ensure the API is available at `http://127.0.0.1:8080`. Use `localhost` for the frontend origin: the backend's current development CORS allowlist does not include `127.0.0.1:5173`.

```bash
npm run test:e2e
```

The test script uses Edge in headless mode on Windows, Chromium on other platforms (install it with `npx playwright install chromium`). It tests live OpenAPI access, rejection of a public ADMIN registration, omission of Admin from signup UI, volunteer signup, login, and authorization denial for an admin endpoint. It creates accounts only in the disposable test database; it **does not test** email deliverability, Firebase, cloud uploads, event-management workflows, or production deploys. Those remain for the complete E2E suite.

Override origins when needed with `E2E_WEB_URL` and `E2E_API_URL` environment variables.
