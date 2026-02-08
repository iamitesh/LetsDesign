import React, { useEffect, useRef } from 'react';

const AngularWidgetWrapper = () => {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadAngularWidget = async () => {
      try {
        const { mount } = await import('angularRemote/AngularWidget');
        if (mounted && containerRef.current) {
          cleanupRef.current = await mount(containerRef.current);
        }
      } catch (error) {
        console.error('Failed to load Angular widget:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<p style="color: red;">Failed to load Angular Remote Widget. Make sure the Angular remote app is running on port 5002.</p>';
        }
      }
    };

    loadAngularWidget();

    return () => {
      mounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return <div ref={containerRef} />;
};

export default AngularWidgetWrapper;
