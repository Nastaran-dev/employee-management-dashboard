# Roster · Employee Management Dashboard

A responsive admin dashboard for viewing, searching, filtering, creating and editing employee records. It runs entirely in the browser against a mock API that is designed to be swapped for a real REST backend without touching the UI.

## Key features

- Summary cards (total / active / on leave / inactive) derived from the employee data, plus a proportional headcount bar.
- Employee table with search (name, full name, email), department and status filters, sortable columns, configurable page size (5 / 10 / 20), a visible result count and a clear-filters action.
- Create and edit through an accessible modal (bottom sheet on small screens) with schema validation, whitespace trimming and case-insensitive duplicate-email prevention.
- Explicit loading (skeleton), empty, no-results and error (with retry) states.
- Success and error toasts for every mutation; the dialog stays open on failure so nothing has to be retyped.
- Responsive layout: fixed sidebar on desktop, drawer on mobile, horizontally scrolling table with a sticky name column.

Deletion is intentionally not implemented (it was optional in the brief).

## Tech stack and why

| Choice | Rationale |
| --- | --- |
| React 18 + TypeScript (strict) | Required stack; strict mode plus a shared `Employee` / `EmployeeInput` model keeps types, schema and API consistent. |
| Vite | Fast dev server and builds with minimal configuration. |
| Tailwind CSS v3 | Design tokens (colors, radii, animations) live in `tailwind.config.ts`; no custom CSS framework needed. |
| Radix Dialog + hand-written shadcn-style components | Radix gives focus trapping, focus return and Escape handling. The `components/ui` files follow the shadcn/ui pattern (cva + `cn`) but were written by hand, without the shadcn CLI. |
| Native `<select>` for filters and form fields | Free keyboard support, mobile pickers and screen-reader behavior; fewer moving parts than a custom listbox. |
| TanStack Query | Server state: caching, cancellation via `AbortSignal`, retries, invalidation after mutations. |
| React Hook Form + Zod | Uncontrolled forms with one validation schema shared with the mock API. |
| Sonner | Small, accessible toast library. |
| Lucide React | Icons. |
| Vitest + React Testing Library + Playwright | Unit/integration tests and one end-to-end journey. |

No router: there is a single screen, so React Router would add nothing.

## Prerequisites

- Node.js 18.18 or newer
- npm

## Getting started

```bash
npm install        
npm run dev         
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check, then produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` for the app and for tool configs |
| `npm run lint` | ESLint (flat config, `typescript-eslint`, react-hooks) |
| `npm test` | Run unit and component tests once with Vitest |
| `npm run test:watch` | Vitest in watch mode |
| `npm run e2e` | Playwright end-to-end tests (see below) |

End-to-end tests need a browser binary once: `npx playwright install chromium`. Playwright starts the dev server itself.

## Project structure

```
src/
  app/                    App shell wiring: App.tsx, providers.tsx
  components/
    ui/                   Button, Input, Select, Dialog, FormField, Skeleton...
    layout/               AppShell (topbar, drawer), SidebarNav
    feedback/             EmptyState, ErrorState
  features/employees/
    api/                  EmployeeApi contract, mock adapter, errors, delay, URL config
    components/           Table, toolbar, stats, pagination, form, dialog, badge
    hooks/                useEmployees (queries/mutations), useEmployeeTableState
    pages/                EmployeesPage (composes everything)
    schemas/              Zod schema shared by form and API
    types/                Employee model, table/filter types
    utils/                Pure functions: filter, sort, paginate, stats, email
  lib/                    cn(), query client factory
  mocks/                  20 seed employees
  styles/                 Tailwind entry + base styles
  test/                   Test setup, fixtures, render helper
e2e/                      Playwright specs
```

## State management

State is split by what it is, and nothing is stored that can be derived:

- **Server state** lives in TanStack Query (`useEmployeesQuery`, `useCreateEmployee`, `useUpdateEmployee`). Components never hold a copy of the list.
- **Local UI state** (search text, filters, sort, page, page size, which dialog is open) is plain `useState` in `useEmployeeTableState` and `EmployeesPage`.
- **Form state** is owned by React Hook Form inside `EmployeeForm`, validated by Zod.
- **Derived state**: filtered, sorted and paged rows, the result count and the summary cards are computed during render from server data plus UI state. They are not wrapped in `useMemo` because the work is trivial at this scale.

**Mutation strategy: pessimistic.** The cache is not touched until the server confirms. On success the list is invalidated and refetched, and the mutation stays pending until fresh data arrives, so the dialog never closes over stale rows.

**Summary cards describe the whole organization and ignore table filters.** The result count above the table reflects the filters ("3 of 20 employees").

## API architecture and persistence

The UI depends only on the `EmployeeApi` interface (`list`, `create`, `update`), provided through React context. `createBrowserEmployeeApi()` in `features/employees/api/index.ts` chooses the adapter.

The mock adapter (`mockEmployeeApi.ts`):

- Simulates latency (500 ms by default) and honors `AbortSignal`.
- Validates input with the same Zod schema as the form and enforces unique emails case-insensitively, so it behaves like a server that does not trust the client.
- Persists to `localStorage` under `roster:employees:v1`. Stored data is re-validated on load; invalid JSON or the wrong shape falls back to the seed data. If a write fails (quota, blocked storage) it keeps working in memory.
- **This is browser-local persistence, not a server.** Data is per browser profile, is not shared between users or tabs in real time, and can be cleared by the user.

Development switches via the URL:

| URL | Effect |
| --- | --- |
| `/?latency=0` | No simulated latency |
| `/?simulate=list` | Every list request fails (shows the error state) |
| `/?simulate=create` or `update` | Every create or update fails (shows the error toast) |
| `/?simulate=create-once` | Only the first create fails |

The query client retries a failed query once on its own, so `list-once` recovers silently; use `simulate=list` to see the error state.

### Replacing the mock with a REST API

1. Implement `EmployeeApi` with `fetch`, mapping HTTP failures to `ApiError` (409 → `DUPLICATE_EMAIL`, 404 → `NOT_FOUND`, 422 → `VALIDATION`, anything else → `NETWORK`) and passing `signal` through:

   ```ts
   export function createHttpEmployeeApi(baseUrl: string): EmployeeApi {
     return {
       async list({ signal } = {}) {
         const response = await fetch(`${baseUrl}/employees`, { signal });
         if (!response.ok) throw new ApiError('NETWORK', `GET /employees failed: ${response.status}`);
         return storedEmployeesSchema.parse(await response.json());
       },
       
     };
   }
   ```

2. Return it from `createBrowserEmployeeApi()` (for example from `import.meta.env.VITE_API_URL`; add a `.env.example` at that point).
3. No component, hook or test fixture changes are required.

For a large dataset, move search, filter, sort and pagination to the server: extend `list` with query parameters and include them in the query key. The current design fetches everything and filters client-side, which is appropriate for this scale.

## Validation and error handling

- One Zod schema (`employeeSchema.ts`) is used by the form resolver and the mock API. It trims whitespace before length checks, requires names and email, validates email format and restricts department and status to the allowed lists.
- Duplicate emails are checked twice: instantly in the form against the loaded list (no round trip), and authoritatively in the API. If the API rejects with `DUPLICATE_EMAIL`, the message appears on the email field.
- `ApiError` carries a machine-readable `code`; `getErrorMessage` maps codes to user-facing copy while the raw `message` stays available for debugging.
- Submit is disabled while a request is in flight, and the dialog cannot be dismissed (Escape, overlay, close button) during that time.
- The form is keyed by employee id, so create and edit always start from fresh values.

## Responsive design and accessibility

- Layout: fixed sidebar from the `lg` breakpoint, a Radix-powered drawer below it; filters stack on small screens; the dialog is a bottom sheet on mobile and a centered modal from `sm`.
- The table scrolls horizontally on narrow screens inside a focusable, labelled region, with the employee column sticky.
- Semantics: real `<table>` with caption, `scope` headers and `aria-sort`; sortable headers are buttons; the result count is a live region; errors use `role="alert"`.
- Forms: visible labels, `aria-invalid` and `aria-describedby` linked to error text, `noValidate` so Zod messages are shown consistently, focus moves to the first invalid field on submit.
- Dialogs trap focus, close on Escape and return focus to the trigger (Radix).
- Visible focus rings on all interactive elements; status is conveyed by text, not color alone; reduced-motion preferences are respected; a skip link is provided.

## Design problems the implementation addresses

- **Stale responses:** queries run through TanStack Query with the abort signal forwarded to the API, so a superseded request is cancelled rather than overwriting newer data.
- **Page out of range:** every change to filters, sort or page size resets to page 1, and `paginate` also clamps the page, so a shrinking result set can never show an empty page.
- **Dialog state:** the form is remounted per employee and unmounted on close, which removes any chance of stale defaults when switching between create and edit.
- **Email uniqueness on edit:** the conflict check excludes the employee being edited so keeping one's own address is allowed.

## Testing

- `utils/employeeUtils.test.ts`: filtering, sorting, pagination, stats, email conflict logic.
- `schemas/employeeSchema.test.ts`: required fields, trimming, email format, enums.
- `api/mockEmployeeApi.test.ts`: create/update rules, duplicates, not-found, server-side validation, failure injection, persistence, corrupted storage, cancellation, URL config parsing.
- `pages/EmployeesPage.test.tsx`: list and summary rendering, loading / empty / error + retry, search by name and email, department and status filters, clearing filters, no-results state, sorting, pagination reset, page size, form validation, create, edit, duplicate prevention, mutation failure.
- `e2e/employees.spec.ts`: add → search → edit → reload journey, and the load-failure state.

## Known limitations

- Single screen and a single navigation item; there is no routing, authentication or roles.
- Persistence is `localStorage` only (see above); no multi-user behavior.
- No delete, bulk actions or CSV export.
- Search is applied on every keystroke without debounce (fine for client-side filtering of a small list).
- Filtering, sorting and pagination are client-side, so the full list is loaded up front.
- No web font is bundled; the UI uses Inter if installed, otherwise the system font.
- Automated accessibility auditing (axe) is not set up; accessibility relies on semantic markup and Radix.

## Next improvements

1. Real HTTP adapter plus server-side search, sort and pagination.
2. Delete with a confirmation dialog, error handling and tests.
3. Persist filters and page in the URL so views are shareable.
4. Add axe checks to the Playwright suite and run a mobile project.
5. Optimistic updates for edits, with rollback, once there is a real backend to justify them.
