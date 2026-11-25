# ProductHub — Redux Toolkit, PWA & Firebase Authentication

React Router project with Firebase Authentication, a PWA layer, and global server-data state managed by **Redux Toolkit** (TanStack Query was removed).

## Run locally
1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Firebase web app configuration.
4. Run `npm run dev` and open the Vite URL.
5. Create a production build with `npm run build`.

## Firebase setup
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Open **Build → Authentication → Get started → Sign-in method**.
3. Enable **Email/Password** and **Google** providers.
4. In Project settings, register a Web App and copy its config values into `.env.local` using the variable names from `.env.example`.
5. In Authentication → Settings → Authorized domains, ensure `localhost` and your deployed domain are listed.
6. Restart Vite after changing environment variables. Never commit `.env.local`.

Vite exposes only variables prefixed with `VITE_` to browser code. Firebase web configuration identifies the project; configure Firebase Security Rules for any database or storage resources added later.

## Routes
- `/` — home
- `/about` — project information
- `/products` — searchable, filterable and paginated catalogue
- `/products/:id` — product details
- `/dashboard` — catalogue analytics
- `/login` — email/password and Google sign-in
- `/signup` — email registration with password confirmation
- `/profile` — protected Firebase user profile and logout

The product catalogue keeps its URL-based search, category/price filters, sorting and pagination. Unauthenticated users are redirected from `/profile` to `/login`; after successful login they return to the originally requested page.

## Authentication architecture
- `src/services/firebase.js` initializes Firebase from Vite environment variables and configures browser-local persistence.
- `src/services/authService.js` contains Firebase authentication operations.
- `src/context/AuthContext.jsx` exposes `AuthProvider` and `useAuth`, tracks sessions with `onAuthStateChanged`, and exposes loading and error state.
- `src/components/ProtectedRoute.jsx` protects private routes.

## Redux Toolkit architecture

```
src/
  app/store.js                       configureStore (3 reducers) — wrapped by <Provider> in main.jsx
  features/
    cache.js                         5-minute freshness helper + offline-aware error text
    selectors.js                     all reusable selectors
    products/productsThunks.js       fetchProducts, createProduct, updateProduct, deleteProduct
    products/productsSlice.js        product list + mutation state
    productDetails/productDetailsSlice.js   fetchProductById + per-id cache
    categories/categoriesSlice.js    fetchCategories + category list
  services/service.js                fetch API calls only (no Redux), one retry for GET
  hooks/                             useProducts, useProduct, useCategories, useProductMutations, useDebouncedParam
  pages/, components/                UI only (useSelector / hooks)
  context/AuthContext.jsx            Firebase auth — intentionally NOT moved to Redux
```

### Slices
| Slice | State | Purpose |
|---|---|---|
| `products` | `items, status, error, lastFetched, currentRequestId, mutation` | Catalogue list used by the catalogue and dashboard; create/update/delete status. |
| `productDetails` | `byId[id] = { data, status, error, lastFetched, requestId }` | One cached entry per product; entries are removed when that product is updated or deleted. |
| `categories` | `items, status, error, lastFetched, currentRequestId` | Category options for the filter dropdown. |

Search text, category, price range, sorting and page are **not** duplicated in Redux: they live in the URL (`useSearchParams`) so links, reloads and back/forward keep working. Text inputs are debounced (400 ms) before being written to the URL. Temporary UI state (menu, dashboard category select) stays in local `useState`; authentication stays in `AuthContext`.

### Thunks (`createAsyncThunk`)
| Thunk | Type | Notes |
|---|---|---|
| `fetchProducts` | list fetch | `condition` skips the request when data is < 5 min old or a request is already running; `force: true` is used by Retry and after mutations. |
| `fetchProductById` | details fetch | `condition` skips when that id is cached and fresh or already loading. |
| `fetchCategories` | list fetch | Same caching rule. |
| `createProduct`, `updateProduct`, `deleteProduct` | mutations | On success they dispatch `fetchProducts({ force: true })`; `productDetails` removes the affected entry via `extraReducers`. DummyJSON only simulates writes, so refreshed data comes back unchanged. |

All thunks are handled in `extraReducers` for `pending`, `fulfilled` and `rejected`.

- **Loading / error / empty**: the spinner or error appears only when there is nothing to show; previously loaded (or Service-Worker-cached) data stays visible if a refresh fails. Error boxes have a **Retry** button.
- **Stale requests**: each reducer stores the latest `requestId` and ignores responses from older requests.
- **Retries**: `service.js` retries GET requests once on network errors / 5xx while online; users can also retry manually.
- **Offline**: errors become “You are offline and this data is not cached yet.” when `navigator.onLine` is false. The Service Worker is unchanged and still serves cached public API responses.

### Selectors (`src/features/selectors.js`)
- Plain: `selectAllProducts`, `selectProductsStatus`, `selectProductsError`, `selectProductDetailEntry`, `selectMutationState`.
- Memoized with `createSelector`: `selectCategoryOptions`, `selectProductCategories`, `selectFilteredProducts` (search + category + price + sort), `selectDashboardStats` (averages, stock, category counts, rating breakdown).

## Deployment
Deploy the repository to Vercel or Netlify. Add the same `VITE_FIREBASE_*` values in the hosting provider's environment-variable settings, then redeploy. Add the deployed hostname to Firebase Authentication's authorized domains. SPA rewrite configuration is included for Vercel and Netlify.

## Previous functionality retained
Nested React Router layout, lazy-loaded pages, dynamic product details, product search, filters, sorting, URL query parameters, pagination, dashboard statistics, loading/error/empty states, responsive design and custom 404 page.

## Practice 7 — Progressive Web App (PWA)

This version adds an installable PWA layer while preserving the existing ProductHub routes and Firebase authentication.

### PWA features
- `public/manifest.webmanifest` defines the app name, scope, standalone display, colors and 192/512 PNG icons.
- `sw.js` is generated during `vite build`. The custom Vite plugin injects the exact hashed production JS/CSS and other build assets into the shell precache.
- Versioned shell, static and public API caches are used. Old `producthub-*` caches are removed during activation.
- Static same-origin assets use cache-first. Public DummyJSON product list/category/detail GET requests use network-first and fall back to cached responses offline.
- The public API cache is limited to 50 entries (oldest entries are removed first). Only `GET https://dummyjson.com/products...` is cached. Firebase authentication, tokens, private data, and non-GET requests are not placed in runtime caches.
- When an API response is served from the offline cache, the service worker sends a message to the app and the status bar displays “Viewing cached data”.
- Navigation failures show the pre-cached `offline.html`; the React `/offline` route provides an in-app offline screen.
- A waiting service-worker update is announced with an Update button. Pressing it activates the new worker and reloads the app.
- The status bar shows online/offline state. Supported browsers can show an Install app action.
- Responsive navigation and layout support narrow mobile screens, including 320px widths and landscape orientation.

### Build and test
```bash
npm install
npm run dev
npm run build
npm run preview
```

For service-worker and installation testing, use the production preview or the deployed HTTPS site (service workers require a secure context, except localhost). In Chrome DevTools → Application, inspect Manifest, Service Workers and Cache Storage. To test offline, first load the catalogue and one product detail while online, then switch DevTools Network to Offline and reload/navigate. Public API data that was fetched before going offline should be served from the service-worker cache.

### Deployment
Push the project to GitHub and import the repository into Vercel. Keep the included `vercel.json` SPA rewrite. Add the existing `VITE_FIREBASE_*` environment variables in Vercel Project Settings → Environment Variables, then redeploy. Add the deployed domain to Firebase Authentication → Settings → Authorized domains.
