# Frontend Architecture & Refactoring Report
*Date Assessment: May 2026*

## 1. Executive Summary
The frontend React application (`my-app-main-4`) relies heavily on React 18, React Router v6, Tailwind CSS, and various UI libraries. While functional and incorporating techniques like lazy loading, the codebase suffers from severe architectural bottlenecks, unoptimized performance practices, UI library conflicts, and suboptimal React usage.

## 2. Issues Discovered

### 2.1 Performance & Data Fetching (Severity: HIGH)
- **Issue:** Processing massive datasets on the client-side. In `ProductList.tsx`, the `fetchProductLines` function attempts to fetch all sales lines, purchase lines, and return lines across all contexts just to calculate stats for a "Top 10" chart. 
- **Impact:** Exponential slow-down as the database grows, freezing the browser and exhausting memory.
- **Solution:** Move aggregations to the backend. The API should expose a `/api/products/stats/top10` endpoint that runs a SQL aggregation. The frontend should only receive the aggregated JSON.

### 2.2 Duplication & Architectural Fragmentation (Severity: HIGH)
- **Issue:** Duplicate `axios` configurations. `authService.tsx` redefined its own `axiosInstance` with hardcoded gateway URLs (`http://localhost:9055`) and duplicated token interceptors, ignoring the global `axiosInstance` mapped to `.env` variables located in `axiosBasec/axiosInstance.tsx`.
- **Solution:** Centralized data fetching configuration. All services should import from the single `axiosInstance` to ensure uniform error handling, interceptor logic, and correct environment routing. *(Fixed during refactor)*

### 2.3 UI Frameworks Conflict (Severity: MEDIUM)
- **Issue:** `package.json` contains `tailwindcss`, `bootstrap`, and `@mui/material`.
- **Impact:** Large bundle size, style collisions resulting in CSS conflicts, unpredictable styling behavior, and developer confusion.
- **Solution:** Pick one design ecosystem. We strongly recommend removing Bootstrap and standardizing on **Tailwind CSS + Headless UI / Lucide React**.

### 2.4 Unoptimized React Practices & TypeScript Usage (Severity: MEDIUM)
- **Issue:** Redundant casting and state management issues. e.g., `const darkModeContext = useDarkMode() as DarkModeContextType;` inside `ProductList.tsx` when `useDarkMode` is already comprehensively typed. 
- **Issue:** "God components" containing both intense data manipulation and UI rendering.
- **Solution:** Rely on inferred types, separate logic into distinct custom hooks (`useProductData`, `useTopProductsStats`). *(Partially fixed during refactor)*.

### 2.5 Hardcoded API Values
- **Issue:** Instead of relying thoroughly on `process.env.REACT_APP_BACKEND_URL`, some API files have localhost hardcoded. This will break docker-compose environments (like in `my-app-mainPublic-6`).

## 3. Refactoring Roadmap (Action Plan)

### Step 1: Clean Up Axios & Services (Completed)
Merged duplicate `axios` instances. `authService` now imports standard API base configuration.

### Step 2: Extract Presentation vs Data Logic
Components like `ProductList.tsx` need hooks. Abstract out the `onDelete`, `onFetch`, and mapping logic into a `useProducts` hook. We advise transitioning to `React Query` (or `SWR`) for caching & invalidation out-of-the-box instead of `useEffect`.

### Step 3: Standardize the Design System
Remove Bootstrap references in `App.tsx`:
```tsx
// Remove
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
```
Replace the layouts entirely with Tailwind layouts to ensure consistency.

### Step 4: Component Splitting
Turn inline large components into composed bits.

## 4. Git Operations
A new branch `frontend-refactor-improvements` has been created and changes are being incrementally tracked.
