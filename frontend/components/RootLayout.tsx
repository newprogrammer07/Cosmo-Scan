import React, { Suspense, lazy } from 'react';

const ThreeBackground = lazy(() => import('./ThreeBackground'));
const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-space-black text-white font-sans flex flex-col">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
      <div className="noise-overlay"></div>
      {children}
    </div>
  );
};

export default RootLayout;
