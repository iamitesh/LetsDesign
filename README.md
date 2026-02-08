# Module Federation Demo

This project demonstrates a micro frontend architecture using Module Federation with:
- **React App** (running on port 5001) - A React micro frontend built with Vite ✅ **Working**
- **Angular App** (running on port 5002) - An Angular micro frontend using Webpack Module Federation
- **Host App** (running on port 5000) - The container app that loads the React micro frontend

## Architecture

The project uses Module Federation to enable the host app to dynamically load components from the React app at runtime. Each app runs independently and can be developed, built, and deployed separately.

### Technology Stack

- **React App**: Vite + React + @originjs/vite-plugin-federation ✅
- **Angular App**: Angular 19+ + @angular-architects/module-federation (Webpack-based)
- **Host App**: Vite + Module Federation (consumes React remote)

## Current Status

✅ **React Module Federation**: Fully working! The React component is successfully loaded and functional in the host app.

⚠️ **Angular Module Federation**: There's a known compatibility issue when mixing Webpack-based module federation (Angular) with Vite-based module federation (host app). This is a technical limitation due to different module systems.

### Working Features
- ✅ React app exposes and shares components via Module Federation
- ✅ Host app successfully loads React components dynamically
- ✅ Independent development and deployment of React micro frontend
- ✅ Shared dependencies (React, React-DOM) between host and React remote
- ✅ Interactive components with state management working across federation boundary

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

### Quick Start (Recommended)

The easiest way to see the working Module Federation demo is to use the built/preview mode:

#### 1. Install Dependencies

Install dependencies for all three apps:

```bash
# Install React app dependencies
cd react-app
npm install

# Install Angular app dependencies  
cd ../angular-app
npm install

# Install Host app dependencies
cd ../host-app
npm install
```

#### 2. Build the Apps

```bash
# Build React app
cd react-app
npm run build

# Build Host app
cd ../host-app
npm run build
```

#### 3. Start the Applications

You need to start the apps in preview/serve mode. **Important**: Start the remote apps before the host app.

**Terminal 1 - React App (Port 5001)**
```bash
cd react-app
npm run preview
```

**Terminal 2 - Angular App (Port 5002)** - Optional, for development
```bash
cd angular-app
npm start
```

**Terminal 3 - Host App (Port 5000)**
```bash
cd host-app
npm run preview
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

You should see the host app with the React component loaded via Module Federation. The React button counter should be fully functional!

## Development Mode

Note: In development mode (`npm run dev`), Vite's module federation works differently than in build mode. For the best demonstration of Module Federation, use the build + preview mode as shown above.

## Development

### React App (Port 5001)

The React app exposes a `ReactButton` component that can be consumed by other applications.

**Exposed Modules:**
- `./ReactButton` - A React component with a counter

**Development:**
```bash
cd react-app
npm run dev
```

**Build:**
```bash
cd react-app
npm run build
```

### Angular App (Port 5002)

The Angular app exposes an `AngularButton` component using Native Federation.

**Exposed Modules:**
- `./AngularButton` - An Angular standalone component with a counter

**Development:**
```bash
cd angular-app
npm start
```

**Build:**
```bash
cd angular-app
npm run build
```

### Host App (Port 5000)

The host app consumes components from both React and Angular apps.

**Development:**
```bash
cd host-app
npm run dev
```

**Build:**
```bash
cd host-app
npm run build
```

## Module Federation Configuration

### React App Configuration

The React app uses `@originjs/vite-plugin-federation` configured in `vite.config.js`:

```javascript
federation({
  name: 'react-app',
  filename: 'remoteEntry.js',
  exposes: {
    './ReactButton': './src/ReactButton.jsx',
  },
  shared: ['react', 'react-dom']
})
```

### Angular App Configuration

The Angular app uses `@angular-architects/native-federation` configured in `federation.config.js`:

```javascript
exposes: {
  './AngularButton': './src/app/angular-button/angular-button.ts',
}
```

### Host App Configuration

The host app consumes the React remote:

```javascript
federation({
  name: 'host-app',
  remotes: {
    reactApp: 'http://localhost:5001/assets/remoteEntry.js',
    // Note: Angular component currently has compatibility issues
    angularApp: 'http://localhost:5002/remoteEntry.js'
  },
  shared: ['react', 'react-dom']
})
```

## Demo Screenshots

### Module Federation in Action

![Module Federation Demo](https://github.com/user-attachments/assets/bc39efd8-fae0-45ae-bba5-2829c910b26e)

The screenshot above shows:
- ✅ Host app running on port 5000
- ✅ React micro frontend component successfully loaded via Module Federation
- ✅ Interactive button with state management working across federation boundary
- ⚠️ Angular component with compatibility note

## Project Structure

```
LetsDesign/
├── react-app/          # React micro frontend
│   ├── src/
│   │   ├── ReactButton.jsx    # Exposed component
│   │   └── ...
│   └── vite.config.js
├── angular-app/        # Angular micro frontend
│   ├── src/
│   │   └── app/
│   │       └── angular-button/  # Exposed component
│   └── federation.config.js
├── host-app/           # Container/Host app
│   ├── src/
│   │   └── main.js    # Loads both remotes
│   └── vite.config.js
└── README.md
```

## Troubleshooting

### React Component not loading

1. Make sure the React app is built: `cd react-app && npm run build`
2. Make sure React app is running in preview mode: `cd react-app && npm run preview`
3. Check that port 5001 is accessible
4. Check the browser console for error messages

### Angular Component Issues

The Angular component currently has compatibility issues when mixing Webpack-based module federation with Vite-based federation. This is a known limitation. Possible solutions:
- Use the same bundler (all Webpack or all Vite) for all apps
- Use a different approach like Web Components for Angular
- Wait for better interoperability between Webpack and Vite module federation

### Port conflicts

If you have port conflicts, you can change the ports in:
- React app: `package.json` scripts section (--port 5001)
- Angular app: `angular.json` serve options (port: 5002)
- Host app: `vite.config.js` server configuration (port: 5000)

### Build Issues

If you encounter build issues:
1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
2. Clear Vite cache: `rm -rf .vite`
3. Make sure you're using compatible versions of Node.js (v18+)

## Resources

- [Module Federation with Vite](https://github.com/originjs/vite-plugin-federation)
- [Angular Module Federation](https://www.npmjs.com/package/@angular-architects/module-federation)
- [Micro Frontend Module Federation Setup in Vite](https://amberfung.medium.com/micro-frontend-module-federation-setup-in-vite-71b323bd90a4)
- [Module Federation Official Docs](https://module-federation.github.io/)

## Key Achievements

✅ Successfully implemented Module Federation with Vite and React  
✅ Created independent micro frontend architecture  
✅ Demonstrated runtime component loading across applications  
✅ Implemented shared dependencies to avoid duplication  
✅ Created comprehensive documentation and setup instructions  

## Known Limitations

- Angular and Vite module federation interoperability requires same bundler type
- Dev mode behavior differs from production build for Vite federation
- CORS policies may need configuration for cross-origin scenarios

## License

MIT
