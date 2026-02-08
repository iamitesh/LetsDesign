import React, { Suspense, lazy } from 'react';
import AngularWidgetWrapper from './components/AngularWidgetWrapper.jsx';

const ReactWidget = lazy(() => import('reactRemote/ReactWidget'));

const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        🏠 Host Shell App (Module Federation)
      </h1>
      <p style={{ color: '#666', fontSize: '16px' }}>
        This is the host/shell application that loads micro-frontends from both
        React and Angular remote apps using Vite Module Federation.
      </p>

      <section style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#555' }}>React Remote Micro-Frontend</h2>
        <Suspense fallback={<p>Loading React Remote Widget...</p>}>
          <ReactWidget />
        </Suspense>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#555' }}>Angular Remote Micro-Frontend</h2>
        <AngularWidgetWrapper />
      </section>
    </div>
  );
};

export default App;
