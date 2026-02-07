
import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const PublicLayout: React.FC = () => {
  return (
    <>
      <main className="relative z-10 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
