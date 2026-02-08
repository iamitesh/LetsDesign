import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AngularWidgetWrapper from './components/AngularWidgetWrapper.jsx';

const ReactWidget = lazy(() => import('reactRemote/ReactWidget'));

const Nav = () => {
  const location = useLocation();
  const navStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  };
  const linkStyle = (path) => ({
    padding: '10px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '15px',
    color: location.pathname === path ? '#fff' : '#333',
    background: location.pathname === path ? '#333' : '#f0f0f0',
    transition: 'all 0.2s',
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle('/')}>🏠 Home</Link>
      <Link to="/react" style={linkStyle('/react')}>⚛️ React</Link>
      <Link to="/angular" style={linkStyle('/angular')}>🅰️ Angular</Link>
    </nav>
  );
};

const Home = () => (
  <section style={{ marginTop: '24px' }}>
    <h2 style={{ color: '#555' }}>Welcome</h2>
    <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.6 }}>
      This is the host shell application. Use the navigation above to load
      micro-frontends from independently deployed React and Angular remote apps.
    </p>
    <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
      <Link to="/react" style={{
        padding: '16px 32px', borderRadius: '12px', background: '#61dafb22',
        border: '2px solid #61dafb', textDecoration: 'none', color: '#333', fontWeight: 600,
      }}>
        ⚛️ View React Remote
      </Link>
      <Link to="/angular" style={{
        padding: '16px 32px', borderRadius: '12px', background: '#dd003122',
        border: '2px solid #dd0031', textDecoration: 'none', color: '#333', fontWeight: 600,
      }}>
        🅰️ View Angular Remote
      </Link>
    </div>
  </section>
);

const ReactPage = () => (
  <section style={{ marginTop: '24px' }}>
    <h2 style={{ color: '#61dafb' }}>⚛️ React Remote Micro-Frontend</h2>
    <Suspense fallback={<p>Loading React Remote Widget...</p>}>
      <ReactWidget />
    </Suspense>
  </section>
);

const AngularPage = () => (
  <section style={{ marginTop: '24px' }}>
    <h2 style={{ color: '#dd0031' }}>🅰️ Angular Remote Micro-Frontend</h2>
    <AngularWidgetWrapper />
  </section>
);

const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #333', paddingBottom: '10px', margin: 0 }}>
        🏠 Host Shell App
      </h1>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/react" element={<ReactPage />} />
        <Route path="/angular" element={<AngularPage />} />
      </Routes>
    </div>
  );
};

export default App;
