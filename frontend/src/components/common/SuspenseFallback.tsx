import React from 'react';

export const SuspenseFallback: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-background"
      aria-busy="true"
      aria-label="Loading page"
    >
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Loading…
      </span>
    </div>
  )
};

export default SuspenseFallback;
