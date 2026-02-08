# Micro-Frontend with Module Federation

A micro-frontend architecture using **Module Federation** (via Vite) to combine a **React** remote app and an **Angular** remote app into a single **Host Shell** application.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                 Host Shell App                    │
│              (Vite + React, port 5000)            │
│                                                   │
│  ┌─────────────────────┐  ┌────────────────────┐ │
│  │  React Remote Widget│  │ Angular Remote      │ │
│  │  (from port 5001)   │  │ Widget              │ │
│  │                     │  │ (from port 5002)    │ │
│  └─────────────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Apps

| App | Tech Stack | Port | Role |
|-----|-----------|------|------|
| `host-app` | Vite + React | 5000 | Shell/Container that loads remote micro-frontends |
| `react-remote-app` | Vite + React | 5001 | Remote app exposing a React component |
| `angular-remote-app` | Vite + Angular | 5002 | Remote app exposing an Angular component as a web component |

## Prerequisites

- Node.js >= 18
- npm >= 9

## Getting Started

### 1. Install dependencies for all apps

```bash
# Install dependencies for the React remote app
cd react-remote-app
npm install

# Install dependencies for the Angular remote app
cd ../angular-remote-app
npm install

# Install dependencies for the host app
cd ../host-app
npm install
```

### 2. Build and serve remote apps

The remote apps must be built and served first, as the host app fetches their `remoteEntry.js` files at runtime.

**Terminal 1 – React Remote App:**
```bash
cd react-remote-app
npm run build
npm run preview
```

**Terminal 2 – Angular Remote App:**
```bash
cd angular-remote-app
npm run build
npm run preview
```

### 3. Build and serve the host app

**Terminal 3 – Host App:**
```bash
cd host-app
npm run build
npm run preview
```

### 4. Open the app

Visit [http://localhost:5000](http://localhost:5000) in your browser.

You should see the Host Shell App with both the React remote widget and the Angular remote widget loaded via Module Federation.

## How It Works

- **Module Federation** (`@originjs/vite-plugin-federation`) allows each app to be built independently and share modules at runtime.
- The **React Remote App** exposes a `ReactWidget` component via its `remoteEntry.js`.
- The **Angular Remote App** exposes an `AngularWidget` via `@angular/elements`, registering it as a custom element (web component). This allows the React host to seamlessly consume it.
- The **Host App** is configured to consume both remote entry points and dynamically imports the exposed components.

## Development

Each app can also be run in development mode independently:

```bash
cd react-remote-app && npm run dev   # http://localhost:5001
cd angular-remote-app && npm run dev # http://localhost:5002
cd host-app && npm run dev           # http://localhost:5000
```

> **Note:** For Module Federation to work correctly, use `npm run build && npm run preview` instead of `npm run dev`, as the federation plugin generates the `remoteEntry.js` during the build step.
