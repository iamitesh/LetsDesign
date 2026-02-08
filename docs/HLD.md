# High-Level Design (HLD) — Micro Frontend Architecture

## 1. Overview

**LetsDesign** is a micro frontend platform built using **Module Federation** via **Vite**. It composes a unified UI shell from independently developed, deployed, and versioned frontend applications built with **React** and **Angular**.

```
┌──────────────────────────────────────────────────────────────────┐
│                        End User (Browser)                        │
│                      http://localhost:5000                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     HOST SHELL APP (React)                        │
│                    Port 5000 + React Router                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Nav:  [🏠 Home]  [⚛️ React]  [🅰️ Angular]               │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Routes:                                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /         → Home page (navigation cards)                   │  │
│  │ /react    → ReactWidget (lazy-loaded via MF)               │  │
│  │ /angular  → AngularWidgetWrapper (mount via MF + WC)       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└───────────┬──────────────────────────────────┬───────────────────┘
            │ remoteEntry.js                   │ remoteEntry.js
            ▼                                  ▼
┌────────────────────┐            ┌─────────────────────────┐
│  REACT REMOTE APP  │            │  ANGULAR REMOTE APP     │
│     Port 5001      │            │     Port 5002           │
│  (Vite + React)    │            │  (Vite + Angular/Analog)│
└────────────────────┘            └─────────────────────────┘
```

---

## 2. Architecture Style

| Aspect              | Choice                                              |
|----------------------|-----------------------------------------------------|
| Pattern              | **Micro Frontends** (runtime composition)           |
| Integration          | **Module Federation** (Vite Plugin Federation)      |
| Shell/Host           | React 18 SPA with **React Router** (client-side routing) |
| Routing              | `/` Home · `/react` React Remote · `/angular` Angular Remote |
| Remote 1             | React 18 SPA (shared runtime with host)             |
| Remote 2             | Angular 19 (bridged via Web Components / Angular Elements) |
| Bundler              | **Vite 7** across all apps                          |
| Module Format        | ESM (`target: esnext`)                              |
| Cross-framework glue | Angular Elements (`@angular/elements`) → Custom Element |

---

## 3. Application Inventory

| App                  | Role     | Framework     | Port  | Federation Name   |
|----------------------|----------|---------------|-------|-------------------|
| `host-app`           | Shell    | React 18      | 5000  | `hostApp`         |
| `react-remote-app`   | Remote   | React 18      | 5001  | `reactRemote`     |
| `angular-remote-app` | Remote   | Angular 19    | 5002  | `angularRemote`   |

---

## 4. Key Design Decisions

### 4.1 Unified Bundler (Vite)

All three applications use **Vite** as the bundler, which avoids the Webpack ↔ Vite module system incompatibility that plagued earlier approaches. The Angular remote uses `@analogjs/vite-plugin-angular` to compile Angular with Vite natively.

### 4.2 Module Federation via `@originjs/vite-plugin-federation`

- Remotes produce a `remoteEntry.js` manifest at build time
- Host declares remotes by URL to their `remoteEntry.js`
- Shared dependencies (`react`, `react-dom`) are deduplicated at runtime

### 4.3 Angular ↔ React Bridge via Web Components

Since Angular and React have incompatible component models, the Angular remote wraps its component using `@angular/elements` (Custom Elements API):

```
Angular Component → createCustomElement() → <angular-widget> → DOM
                                                ↑
                                     React ref container mounts it
```

### 4.4 Build + Preview (Not Dev) for Federation

`@originjs/vite-plugin-federation` generates `remoteEntry.js` **only during `vite build`**. All apps must run in `preview` mode (or be served from `dist/`) for cross-app loading to work.

---

## 5. Communication Flow

```
┌──────────────────────────────────────────────────────────┐
│                    HOST APP                               │
│                                                          │
│  1. Browser loads host at :5000                          │
│  2. React renders <BrowserRouter> → <App />              │
│  3. <Nav /> renders navigation links: Home, React, Angular│
│  4. <Routes> matches current path:                       │
│                                                          │
│     /         → <Home /> landing page with nav cards     │
│                                                          │
│     /react    → <ReactPage />                            │
│                 <Suspense> lazy-loads ReactWidget         │
│                 → fetches :5001/assets/remoteEntry.js     │
│                 → resolves ./ReactWidget module           │
│                 → renders as normal React component       │
│                                                          │
│     /angular  → <AngularPage />                          │
│                 <AngularWidgetWrapper /> mounts           │
│                 → import('angularRemote/AngularWidget')   │
│                 → fetches :5002/assets/remoteEntry.js     │
│                 → calls mount(containerDiv)               │
│                 → Angular bootstraps custom element       │
│                                                          │
│  5. Route change → React Router unmounts previous page   │
│     → Angular cleanup runs if leaving /angular           │
│     → Remote only loaded when user navigates to route    │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Deployment Model

```
                    ┌──────────────┐
                    │   CDN / LB   │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Host App │    │ React    │    │ Angular  │
   │ (static) │    │ Remote   │    │ Remote   │
   │  :5000   │    │ (static) │    │ (static) │
   │          │    │  :5001   │    │  :5002   │
   └──────────┘    └──────────┘    └──────────┘
```

Each app is **independently deployable** as static assets. The host resolves remotes by URL at runtime — no rebuild of the host needed when a remote is updated (as long as the exposed module contract is maintained).

---

## 7. Shared Dependencies Strategy

| Dependency          | Shared Between          | Strategy                    |
|---------------------|-------------------------|-----------------------------|
| `react`             | Host ↔ React Remote     | Singleton, same version     |
| `react-dom`         | Host ↔ React Remote     | Singleton, same version     |
| `react-router-dom`  | Host (only)             | Shared scope, host-only     |
| `zone.js`           | Angular Remote only     | Not shared (self-contained) |
| `@angular/*`        | Angular Remote only     | Not shared (self-contained) |

Angular remote does **not** share dependencies with the host because frameworks are incompatible. It is fully self-contained.

---

## 8. Non-Functional Requirements

| NFR                 | Approach                                                    |
|---------------------|-------------------------------------------------------------|
| **Independent Deploy** | Each app has its own build pipeline and served separately |
| **Fault Isolation**    | Host shows fallback UI if a remote fails to load          |
| **Tech Diversity**     | React & Angular coexist via Custom Elements bridge        |
| **Performance**        | Shared React runtime avoids duplicate downloads           |
| **Security**           | CORS headers required for cross-origin federation         |

---

## 9. Risks & Mitigations

| Risk                                        | Mitigation                                              |
|---------------------------------------------|---------------------------------------------------------|
| Vite federation plugin has limited dev mode support | Use `build + preview` workflow                  |
| Shared dependency version mismatch           | Pin versions, use `singleton: true`                    |
| Angular bundle size in host                  | Angular remote is self-contained, loaded on demand     |
| Custom Element name collision                | Guard with `customElements.get()` before defining      |
| Remote app unavailable                       | Error boundary / fallback UI in host                   |
