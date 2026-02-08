import { useState } from 'react';
import './ReactButton.css';

const ReactButton = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="react-component">
      <h2>React Micro Frontend</h2>
      <p>This component is loaded from the React app using Module Federation</p>
      <button onClick={() => setCount(count + 1)}>
        React Count: {count}
      </button>
    </div>
  );
};

export default ReactButton;
