# Low-Level Design (LLD) — Micro Frontend Architecture

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Host App — Detailed Design](#2-host-app--detailed-design)
3. [React Remote App — Detailed Design](#3-react-remote-app--detailed-design)
4. [Angular Remote App — Detailed Design](#4-angular-remote-app--detailed-design)
5. [Module Federation Configuration](#5-module-federation-configuration)
6. [Cross-Framework Integration (Angular → React)](#6-cross-framework-integration-angular--react)
7. [Shared Dependency Resolution](#7-shared-dependency-resolution)
8. [Build & Serve Pipeline](#8-build--serve-pipeline)
9. [Sequence Diagrams](#9-sequence-diagrams)
10. [File-Level Component Map](#10-file-level-component-map)
11. [Error Handling](#11-error-handling)
12. [Configuration Reference](#12-configuration-reference)

---

## 1. Project Structure

```
LetsDesign/
├── docs/
│   ├── HLD.md
│   └── LLD.md
│
├── host-app/                    # Shell — React 18 + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # React entry — createRoot
│       ├── App.jsx              # Root component — composes remotes
│       ├── App.css
│       └── components/
│           └── AngularWidgetWrapper.jsx   # React ↔ Angular bridge
│
├── react-remote-app/            # Remote — React 18 + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # Standalone dev entry
│       └── components/
│           ├── ReactWidget.jsx  # Exposed widget component
│           └── ReactWidget.css
│
├── angular-remote-app/          # Remote — Angular 19 + Vite (Analog)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── src/
│       ├── main.ts              # Standalone dev entry
│       ├── bootstrap.ts         # Federation entry — mount() + cleanup
│       └── app/
│           ├── angular-widget.component.ts   # Widget component
│           └── angular-widget.component.css
│
├── my-angular/                  # (Legacy — webpack-based, superseded)
└── react-app/                   # (Legacy — superseded by react-remote-app)
```

---

## 2. Host App — Detailed Design

### 2.1 Technology Stack

| Layer        | Technology                                |
|--------------|-------------------------------------------|
| Framework    | React 18.3.1                              |
| Bundler      | Vite 7.3.1                                |
| Federation   | `@originjs/vite-plugin-federation` 1.4.1  |
| React Plugin | `@vitejs/plugin-react` 4.5.2              |

### 2.2 `vite.config.js` — Federation Host Configuration

```js
federation({
  name: 'hostApp',
  remotes: {
    reactRemote:  'http://localhost:5001/assets/remoteEntry.js',
    angularRemote: 'http://localhost:5002/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
})
```

- **`remotes`**: URL-based resolution; the host fetches `remoteEntry.js` at runtime from each remote's preview server.
- **`shared`**: `react` and `react-dom` are shared with `reactRemote` to avoid duplicate React runtimes.

### 2.3 `App.jsx` — Root Component

```
<App>
├── <h1> "Micro Frontend Host"
├── <Suspense fallback="Loading React Widget...">
│   └── <ReactWidget />          ← lazy(() => import('reactRemote/ReactWidget'))
├── <hr />
└── <AngularWidgetWrapper />     ← imperative mount/unmount
```

**Key Patterns:**
- `React.lazy` + `Suspense` for React remote (code-split with fallback).
- `AngularWidgetWrapper` uses `useEffect` + `useRef` for imperative DOM manipulation.

### 2.4 `AngularWidgetWrapper.jsx` — Cross-Framework Bridge

This is the critical integration component:

```
┌─────────────────────────────────────────┐
│ AngularWidgetWrapper (React Component)  │
│                                         │
│  useRef(containerDiv) ──────────────┐   │
│                                     │   │
│  useEffect(() => {                  │   │
│    1. import('angularRemote/        │   │
│           AngularWidget')           │   │
│    2. module.mount(containerDiv) ───┘   │
│    3. return cleanup()                  │
│  }, [])                                 │
└─────────────────────────────────────────┘
```

**Lifecycle:**
1. Component mounts → `useEffect` fires
2. Dynamic `import()` fetches Angular remote's `bootstrap.ts`
3. Calls `mount(containerRef.current)` — Angular bootstraps inside the React-owned `<div>`
4. On React unmount → calls cleanup function returned by `mount()` to destroy Angular app

---

## 3. React Remote App — Detailed Design

### 3.1 Technology Stack

| Layer        | Technology                                |
|--------------|-------------------------------------------|
| Framework    | React 18.3.1                              |
| Bundler      | Vite 7.3.1                                |
| Federation   | `@originjs/vite-plugin-federation` 1.4.1  |

### 3.2 `vite.config.js` — Federation Remote Configuration

```js
federation({
  name: 'reactRemote',
  filename: 'remoteEntry.js',
  exposes: {
    './ReactWidget': './src/components/ReactWidget.jsx',
  },
  shared: ['react', 'react-dom'],
})
```

- **`exposes`**: Maps the public module path `./ReactWidget` to the internal file.
- **`shared`**: React/ReactDOM will be provided by the host at runtime (singleton).

### 3.3 `ReactWidget.jsx` — Exposed Component

```
<div class="react-widget">
  ├── <h2> "⚛️ React Remote Widget"
  └── <p> "This widget is loaded from the React remote app!"
```

- Pure presentational component.
- No internal state or side effects — designed to be composed by any host.
- Can be developed and tested independently at `http://localhost:5001`.

### 3.4 Standalone Development

`src/main.jsx` renders `<ReactWidget />` directly into `#root`, so the remote can run as a standalone app:

```bash
cd react-remote-app && npm run build && npm run preview
# → http://localhost:5001
```

---

## 4. Angular Remote App — Detailed Design

### 4.1 Technology Stack

| Layer            | Technology                                   |
|------------------|----------------------------------------------|
| Framework        | Angular 19.2.18                              |
| Bundler          | Vite 7.3.1                                   |
| Angular Compiler | `@analogjs/vite-plugin-angular` 2.2.3        |
| Web Components   | `@angular/elements` 19.2.8                   |
| Zone.js          | `zone.js` 0.15.1                             |
| Federation       | `@originjs/vite-plugin-federation` 1.4.1     |

### 4.2 `vite.config.ts` — Federation Remote Configuration

```ts
import angular from '@analogjs/vite-plugin-angular';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    angular(),           // Compiles Angular with Vite (no Webpack needed)
    federation({
      name: 'angularRemote',
      filename: 'remoteEntry.js',
      exposes: {
        './AngularWidget': './src/bootstrap.ts',
      },
      shared: [],        // Angular is self-contained — no shared deps
    }),
  ],
});
```

### 4.3 `bootstrap.ts` — Federation Entry Point (mount/unmount API)

```
export function mount(el: HTMLElement): () => void
```

**Detailed Flow:**

```
mount(hostElement)
│
├── 1. createApplication({ providers: [provideZoneChangeDetection()] })
│      → Returns ApplicationRef
│
├── 2. createCustomElement(AngularWidgetComponent, { injector })
│      → Wraps Angular component as a standard Custom Element
│
├── 3. customElements.define('angular-widget', AngularWidgetEl)
│      → Registers <angular-widget> in the browser's Custom Elements registry
│      → Guarded by customElements.get() to prevent duplicate registration
│
├── 4. document.createElement('angular-widget')
│      → Creates the Custom Element instance
│
├── 5. hostElement.appendChild(widgetEl)
│      → Inserts into the React-owned DOM container
│
└── 6. return cleanup()
       → cleanup removes widgetEl from DOM and destroys ApplicationRef
```

### 4.4 `angular-widget.component.ts` — The Widget

```ts
@Component({
  selector: 'app-angular-widget',
  standalone: true,
  template: `
    <div class="angular-widget">
      <h2>🅰️ Angular Remote Widget</h2>
      <p>Current time: {{ currentTime }}</p>
      <button (click)="updateTime()">Update Time</button>
    </div>
  `,
})
export class AngularWidgetComponent {
  currentTime = new Date().toLocaleTimeString();
  updateTime() { this.currentTime = new Date().toLocaleTimeString(); }
}
```

- **Standalone component** (Angular 19) — no `NgModule` required.
- Has internal state (`currentTime`) and an interactive button, demonstrating that Angular change detection works correctly inside the React host.
- Styled with Angular's theme colors (`#dd0031`).

### 4.5 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "experimentalDecorators": true,  // Required for Angular decorators
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 5. Module Federation Configuration

### 5.1 Configuration Matrix

| Property     | host-app         | react-remote-app          | angular-remote-app        |
|-------------|------------------|---------------------------|---------------------------|
| `name`      | `hostApp`        | `reactRemote`             | `angularRemote`           |
| `filename`  | —                | `remoteEntry.js`          | `remoteEntry.js`          |
| `remotes`   | ✅ (2 remotes)   | —                         | —                         |
| `exposes`   | —                | `./ReactWidget`           | `./AngularWidget`         |
| `shared`    | `react, react-dom` | `react, react-dom`      | `[]` (none)               |
| Port        | 5000             | 5001                      | 5002                      |

### 5.2 Remote Entry Resolution

```
Host App (build)
│
├── Discovers remotes from vite.config.js
│
├── At runtime, fetches:
│   ├── GET http://localhost:5001/assets/remoteEntry.js
│   │   └── Contains module map for reactRemote
│   └── GET http://localhost:5002/assets/remoteEntry.js
│       └── Contains module map for angularRemote
│
├── For reactRemote/ReactWidget:
│   └── Resolves to ./src/components/ReactWidget.jsx (pre-bundled)
│
└── For angularRemote/AngularWidget:
    └── Resolves to ./src/bootstrap.ts (pre-bundled, exports mount())
```

### 5.3 `remoteEntry.js` Generation

Generated **only during `vite build`** at `dist/assets/remoteEntry.js`. Contains:

- Module map (exposed module name → chunk file)
- Shared scope initialization
- Factory functions for lazy chunk loading

---

## 6. Cross-Framework Integration (Angular → React)

### 6.1 The Problem

React and Angular have incompatible component models:
- React uses JSX + virtual DOM + hooks
- Angular uses decorators + zone.js + change detection

They cannot render each other's components natively.

### 6.2 The Solution: Web Components Bridge

```
┌─────────────────────────────────────────────────────────┐
│                    HOST (React)                          │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │ ReactWidget           │  │ AngularWidgetWrapper     │ │
│  │ (React Component)     │  │ (React Component)        │ │
│  │                       │  │                          │ │
│  │ Loaded via:           │  │ Contains:                │ │
│  │ React.lazy(() =>      │  │  <div ref={containerRef}>│ │
│  │   import('reactRemote │  │    ↓ mount() inserts:    │ │
│  │   /ReactWidget'))     │  │    <angular-widget />    │ │
│  │                       │  │      ↑ Custom Element    │ │
│  │ Renders as normal     │  │      ↑ Created by        │ │
│  │ React component       │  │      ↑ @angular/elements │ │
│  └──────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Integration Layers

```
Layer 1: Module Federation
    import('angularRemote/AngularWidget')
    → Resolves bootstrap.ts from remote server

Layer 2: Mount API
    module.mount(containerElement)
    → Angular bootstraps an ApplicationRef

Layer 3: Custom Elements
    createCustomElement(AngularWidgetComponent)
    → Wraps Angular component in a standard HTML element

Layer 4: DOM Insertion
    container.appendChild(document.createElement('angular-widget'))
    → Standard DOM API — framework-agnostic

Layer 5: React Lifecycle
    useEffect cleanup → destroys Angular app
    → Prevents memory leaks when React unmounts
```

### 6.4 Memory Management

```
React mount:
  useEffect(() => {
    const cleanup = module.mount(div);  // Angular app created
    return () => cleanup();             // Angular app destroyed
  }, []);

Angular cleanup function:
  () => {
    widgetEl.remove();    // Remove Custom Element from DOM
    appRef.destroy();     // Destroy Angular ApplicationRef
  }
```

---

## 7. Shared Dependency Resolution

### 7.1 React Sharing (Host ↔ React Remote)

```
Build Time:
  Host:         shared: ['react', 'react-dom']
  ReactRemote:  shared: ['react', 'react-dom']

Runtime:
  1. Host loads, initializes shared scope with react@18.3.1
  2. ReactRemote's remoteEntry.js checks shared scope
  3. Finds compatible react → reuses host's instance
  4. Result: single React runtime in the page ✅
```

### 7.2 Angular Isolation (Angular Remote)

```
Build Time:
  AngularRemote:  shared: []    // Nothing shared

Runtime:
  1. Angular remote bundles everything: @angular/core, zone.js, etc.
  2. Loaded as self-contained chunk(s)
  3. No dependency on host's shared scope
  4. Result: Angular runs independently ✅
```

**Rationale:** Angular and React cannot share a runtime. Angular's change detection (zone.js) and dependency injection are fundamentally different. Sharing would cause conflicts.

---

## 8. Build & Serve Pipeline

### 8.1 Build Commands

```bash
# Build all apps (must be done before serving)
cd react-remote-app && npm run build    # → dist/ with remoteEntry.js
cd angular-remote-app && npm run build  # → dist/ with remoteEntry.js
cd host-app && npm run build            # → dist/ (fetches remotes at runtime)
```

### 8.2 Serve Commands (Preview Mode)

```bash
# Terminal 1 — React Remote
cd react-remote-app && npm run preview  # → http://localhost:5001

# Terminal 2 — Angular Remote
cd angular-remote-app && npm run preview  # → http://localhost:5002

# Terminal 3 — Host
cd host-app && npm run preview  # → http://localhost:5000
```

### 8.3 Build Order

```
react-remote-app ──build──┐
                           ├── host-app ──build── preview
angular-remote-app ──build─┘

Remotes MUST be built first (or at least their preview servers must
be running) before the host can successfully load them at runtime.
```

### 8.4 Why Not `vite dev`?

`@originjs/vite-plugin-federation` does **not** generate `remoteEntry.js` during `vite dev`. The file is only produced during `vite build`. Running `vite dev` will result in 404 errors for `remoteEntry.js`.

---

## 9. Sequence Diagrams

### 9.1 Page Load — Full Sequence

```
Browser              Host(:5000)        ReactRemote(:5001)    AngularRemote(:5002)
  │                     │                     │                      │
  │──GET /──────────────►│                     │                      │
  │◄─────index.html──────│                     │                      │
  │                      │                     │                      │
  │──GET /assets/main.js►│                     │                      │
  │◄─────JS bundle───────│                     │                      │
  │                      │                     │                      │
  │  React renders <App/>│                     │                      │
  │  ┌───────────────────┤                     │                      │
  │  │ Suspense: lazy    │                     │                      │
  │  │ import(reactRemote│                     │                      │
  │  │ /ReactWidget)     │                     │                      │
  │  └──────────┬────────┤                     │                      │
  │             │        │──GET remoteEntry.js─►│                     │
  │             │        │◄────module map───────│                     │
  │             │        │──GET ReactWidget.js──►│                     │
  │             │        │◄────component────────│                     │
  │  ┌──────────┘        │                     │                      │
  │  │ Renders ReactWidget                     │                      │
  │  └───────────────────┤                     │                      │
  │                      │                     │                      │
  │  AngularWidgetWrapper│                     │                      │
  │  useEffect fires     │                     │                      │
  │  ┌───────────────────┤                     │                      │
  │  │ import(angular    │                     │                      │
  │  │ Remote/Angular    │                     │                      │
  │  │ Widget)           │──GET remoteEntry.js─┼──────────────────────►│
  │  │                   │◄────module map──────┼──────────────────────│
  │  │                   │──GET bootstrap.js───┼──────────────────────►│
  │  │                   │◄────mount()─────────┼──────────────────────│
  │  │                   │                     │                      │
  │  │ mount(container)  │                     │                      │
  │  │ → createApplication()                   │                      │
  │  │ → createCustomElement()                 │                      │
  │  │ → <angular-widget/> appended            │                      │
  │  └───────────────────┤                     │                      │
  │                      │                     │                      │
  │◄─── Full UI rendered─┤                     │                      │
```

### 9.2 Angular Widget Unmount

```
React unmount (navigation, conditional render, etc.)
  │
  ├── useEffect cleanup fires
  │   ├── widgetEl.remove()      → Custom Element removed from DOM
  │   └── appRef.destroy()       → Angular ApplicationRef destroyed
  │       ├── Zone.js unpatched
  │       ├── Change detection stopped
  │       └── Component instance garbage collected
  │
  └── Container div removed by React
```

---

## 10. File-Level Component Map

### 10.1 Host App

| File                           | Purpose                                   | Exports                |
|-------------------------------|-------------------------------------------|------------------------|
| `vite.config.js`              | Vite + federation host config             | default config         |
| `src/main.jsx`                | React 18 createRoot entry                 | —                      |
| `src/App.jsx`                 | Root component, composes remotes          | `App` (default)        |
| `src/App.css`                 | Root component styles                     | —                      |
| `src/components/AngularWidgetWrapper.jsx` | React↔Angular bridge           | `AngularWidgetWrapper` |

### 10.2 React Remote

| File                                | Purpose                         | Exports                        |
|------------------------------------|----------------------------------|--------------------------------|
| `vite.config.js`                   | Vite + federation remote config  | default config                 |
| `src/main.jsx`                     | Standalone dev entry             | —                              |
| `src/components/ReactWidget.jsx`   | **Exposed** widget component     | `ReactWidget` (default)        |
| `src/components/ReactWidget.css`   | Widget styles                    | —                              |

### 10.3 Angular Remote

| File                                    | Purpose                              | Exports              |
|-----------------------------------------|---------------------------------------|-----------------------|
| `vite.config.ts`                        | Vite + Analog + federation config     | default config        |
| `tsconfig.json`                         | TypeScript project config             | —                     |
| `src/main.ts`                           | Standalone dev entry (calls bootstrap)| —                     |
| `src/bootstrap.ts`                      | **Exposed** — mount/unmount API       | `mount()`             |
| `src/app/angular-widget.component.ts`   | Widget component                      | `AngularWidgetComponent` |
| `src/app/angular-widget.component.css`  | Widget styles                         | —                     |

---

## 11. Error Handling

### 11.1 Remote Load Failure (React Remote)

```jsx
// App.jsx
<Suspense fallback={<div>Loading React Widget...</div>}>
  <ReactWidget />
</Suspense>
```

If `reactRemote/ReactWidget` fails to load (network error, 404), React's `Suspense` boundary shows the fallback. Adding an `ErrorBoundary` wrapper would enable graceful error recovery.

### 11.2 Remote Load Failure (Angular Remote)

```jsx
// AngularWidgetWrapper.jsx
import(...)
  .then(module => module.mount(ref.current))
  .catch(err => console.error('Failed to load Angular widget', err));
```

The dynamic import is wrapped in a try/catch pattern. Failure is logged but does not crash the host.

### 11.3 Duplicate Custom Element Registration

```ts
// bootstrap.ts
if (!customElements.get('angular-widget')) {
  customElements.define('angular-widget', AngularWidgetEl);
}
```

Prevents `DOMException: Failed to execute 'define'` if the Custom Element is already registered (e.g., HMR or remount scenarios).

---

## 12. Configuration Reference

### 12.1 Port Allocation

| Port | App                  | Mode    |
|------|----------------------|---------|
| 5000 | host-app (preview)   | Preview |
| 5001 | react-remote-app     | Preview |
| 5002 | angular-remote-app   | Preview |

### 12.2 Package Versions (Pinned)

| Package                              | Version  | Used In              |
|--------------------------------------|----------|----------------------|
| `vite`                               | 7.3.1    | All apps             |
| `react`                              | 18.3.1   | host, react-remote   |
| `react-dom`                          | 18.3.1   | host, react-remote   |
| `@angular/core`                      | 19.2.18  | angular-remote       |
| `@angular/elements`                  | 19.2.8   | angular-remote       |
| `@analogjs/vite-plugin-angular`      | 2.2.3    | angular-remote       |
| `@originjs/vite-plugin-federation`   | 1.4.1    | All apps             |
| `@vitejs/plugin-react`               | 4.5.2    | host, react-remote   |
| `zone.js`                            | 0.15.1   | angular-remote       |

### 12.3 Build Outputs

```
host-app/dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css

react-remote-app/dist/
├── index.html
└── assets/
    ├── remoteEntry.js         ← Federation manifest
    ├── ReactWidget-[hash].js  ← Exposed module chunk
    └── ...

angular-remote-app/dist/
├── index.html
└── assets/
    ├── remoteEntry.js         ← Federation manifest
    ├── bootstrap-[hash].js    ← Exposed module chunk (mount fn)
    └── ...
```
