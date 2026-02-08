import React, { useEffect, useState } from 'react';

const NextWidgetWrapper = () => {
  const [Widget, setWidget] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadNextWidget = async () => {
      try {
        const module = await import('nextRemote/NextWidget');
        if (mounted) {
          setWidget(() => module.default);
        }
      } catch (err) {
        console.error('Failed to load Next.js widget:', err);
        if (mounted) {
          setError(err);
        }
      }
    };

    loadNextWidget();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <p style={{ color: 'red' }}>
        Failed to load Next.js Remote Widget. Make sure the Next.js remote app is running on port 5003.
      </p>
    );
  }

  if (!Widget) {
    return <p>Loading Next.js Remote Widget...</p>;
  }

  return <Widget />;
};

export default NextWidgetWrapper;
