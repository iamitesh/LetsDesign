import React from 'react';

const ReactWidget = () => {
  return (
    <div
      style={{
        padding: '20px',
        margin: '10px',
        border: '2px solid #61dafb',
        borderRadius: '8px',
        backgroundColor: '#20232a',
        color: '#61dafb',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>⚛️ React Remote Widget</h2>
      <p>This component is served from the <strong>React Remote App</strong> (port 5001).</p>
      <p>It is loaded into the host shell via Module Federation.</p>
    </div>
  );
};

export default ReactWidget;
