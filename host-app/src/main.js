import './style.css'
import viteLogo from '/vite.svg'

// Set up the app structure
document.querySelector('#app').innerHTML = `
  <div>
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="${viteLogo}" class="logo" alt="Vite logo" style="height: 6em; padding: 1.5em;" />
      <h1>Module Federation Demo</h1>
      <p class="read-the-docs">
        This host app integrates React and Angular micro frontends using Module Federation
      </p>
    </div>
    
    <div id="react-container" style="margin: 20px 0;">
      <div style="padding: 20px; background: #f0f0f0; border-radius: 8px;">
        <p>Loading React component...</p>
      </div>
    </div>
    
    <div id="angular-container" style="margin: 20px 0;">
      <div style="padding: 20px; background: #f0f0f0; border-radius: 8px;">
        <p>Loading Angular component...</p>
      </div>
    </div>
  </div>
`

// Load React component
async function loadReactComponent() {
  try {
    const { default: ReactButton } = await import('reactApp/ReactButton');
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    
    const container = document.getElementById('react-container');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(ReactButton));
  } catch (error) {
    console.error('Error loading React component:', error);
    document.getElementById('react-container').innerHTML = `
      <div style="padding: 20px; background: #ffcccc; border-radius: 8px; color: #cc0000;">
        <h3>Error Loading React Component</h3>
        <p>${error.message}</p>
        <p style="font-size: 12px;">Make sure the React app is running on port 5001</p>
      </div>
    `;
  }
}

// Load Angular component
async function loadAngularComponent() {
  try {
    const { AngularButton } = await import('angularApp/AngularButton');
    const { createApplication } = await import('@angular/platform-browser');
    
    const container = document.getElementById('angular-container');
    container.innerHTML = '<app-angular-button></app-angular-button>';
    
    const app = await createApplication({
      providers: []
    });
    
    await app.bootstrap(AngularButton, 'app-angular-button');
  } catch (error) {
    console.error('Error loading Angular component:', error);
    document.getElementById('angular-container').innerHTML = `
      <div style="padding: 20px; background: #ffcccc; border-radius: 8px; color: #cc0000;">
        <h3>Error Loading Angular Component</h3>
        <p>${error.message}</p>
        <p style="font-size: 12px;">Make sure the Angular app is running on port 5002</p>
      </div>
    `;
  }
}

// Load components
loadReactComponent();
loadAngularComponent();
