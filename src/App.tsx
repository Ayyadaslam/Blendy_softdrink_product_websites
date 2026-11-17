/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { CartDrawer } from './components/CartDrawer';
import { RegisterModal } from './components/RegisterModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StoryPage } from './pages/StoryPage';
import { ContactPage } from './pages/ContactPage';

const AppShell: React.FC = () => {
  const { route } = useStore();

  return (
    <div
      className="min-h-screen flex flex-col text-[#1E1B18] theme-transition"
      style={{ backgroundColor: 'var(--blendy-accent-tint)' }}
    >
      <SiteHeader />

      <main className="flex-1">
        {route.page === 'home' && <HomePage />}
        {route.page === 'shop' && <ShopPage />}
        {route.page === 'product' && <ProductDetailPage flavorId={route.flavorId} />}
        {route.page === 'story' && <StoryPage />}
        {route.page === 'contact' && <ContactPage />}
      </main>

      <SiteFooter />
      <CartDrawer />
      <RegisterModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
