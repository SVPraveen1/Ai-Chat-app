import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-1 pt-16"> {/* Added pt-16 to account for the header height */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
