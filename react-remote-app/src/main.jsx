import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactWidget from './components/ReactWidget.jsx';

const App = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>React Remote App (Standalone)</h1>
    <ReactWidget />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
