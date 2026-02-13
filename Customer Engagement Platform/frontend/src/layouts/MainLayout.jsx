import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  const location = useLocation();
  const hideHeaderFooterOn = ['/login', '/register', '/forgot-password', '/admin/login'];
  const shouldHideHeaderFooter = hideHeaderFooterOn.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {!shouldHideHeaderFooter && <Header />}
      <main className={`flex-1 ${!shouldHideHeaderFooter ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
      {location.pathname === '/' && <Footer />}
    </div>
  );
};

export default MainLayout;
