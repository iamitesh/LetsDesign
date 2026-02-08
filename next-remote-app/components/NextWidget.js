import React from 'react';

const NextWidget = () => {
  return (
    <div
      style={{
        padding: '20px',
        margin: '10px',
        border: '2px solid #000',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>▲ Next.js Remote Widget</h2>
      <p>This component is served from the <strong>Next.js Remote App</strong> (port 5003).</p>
      <p>It is loaded into the host shell via Module Federation.</p>
    </div>
  );
};

export default NextWidget;
