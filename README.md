# Module Federation Demo

This project demonstrates a micro frontend architecture using Module Federation with:
- **React App** (running on port 5001) - A React micro frontend built with Vite
- **Angular App** (running on port 5002) - An Angular micro frontend using Native Federation
- **Host App** (running on port 5000) - The container app that loads both micro frontends

## Architecture

The project uses Module Federation to enable the host app to dynamically load components from the React and Angular apps at runtime. Each app runs independently and can be developed, built, and deployed separately.

### Technology Stack

- **React App**: Vite + React + @originjs/vite-plugin-federation
- **Angular App**: Angular 19+ + @angular-architects/native-federation
- **Host App**: Vite + Module Federation (consumes both React and Angular)

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

### 1. Install Dependencies

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

### 2. Start the Applications

You need to start all three applications in separate terminal windows. **Important**: Start the remote apps (React and Angular) before starting the host app.

#### Terminal 1 - React App (Port 5001)
```bash
cd react-app
npm run dev
```

#### Terminal 2 - Angular App (Port 5002)
```bash
cd angular-app
npm start
```

#### Terminal 3 - Host App (Port 5000)
```bash
cd host-app
npm run dev
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

You should see the host app with both React and Angular components loaded via Module Federation.

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

The host app consumes both remotes:

```javascript
federation({
  name: 'host-app',
  remotes: {
    reactApp: 'http://localhost:5001/assets/remoteEntry.js',
    angularApp: {
      external: 'http://localhost:5002/remoteEntry.json',
      format: 'esm',
      from: 'vite'
    }
  },
  shared: ['react', 'react-dom']
})
```

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

### Component not loading

1. Make sure all three apps are running
2. Check that the ports are correct (React: 5001, Angular: 5002, Host: 5000)
3. Check the browser console for error messages
4. Ensure dependencies are installed in all apps

### Port conflicts

If you have port conflicts, you can change the ports in:
- React app: `package.json` scripts section
- Angular app: `angular.json` serve options
- Host app: `vite.config.js` server configuration

### Build Issues

If you encounter build issues:
1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
2. Clear Vite cache: `rm -rf .vite`
3. Make sure you're using compatible versions of Node.js

## Resources

- [Module Federation with Vite](https://github.com/originjs/vite-plugin-federation)
- [Angular Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation)
- [Micro Frontend Module Federation Setup in Vite](https://amberfung.medium.com/micro-frontend-module-federation-setup-in-vite-71b323bd90a4)

## License

MIT
