import React, { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { FLAVORS } from '../data/blendyData';
import { useStore } from '../context/StoreContext';

export const SiteHeader: React.FC = () => {
  const {
    route,
    navigate,
    activeFlavor,
    setActiveFlavor,
    activeFlavorSpec,
    cartCount,
    setIsCartOpen,
    setIsRegisterOpen,
  } = useStore();

  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.78;
      setScrolledPastHero(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isVisible = route.page !== 'home' || scrolledPastHero;

  const navLinks = [
    { label: 'Shop', path: '/shop', active: route.page === 'shop' },
    { label: 'Bundle Builder', path: '/#bundle-builder', active: false },
    { label: 'Our Story', path: '/story', active: route.page === 'story' },
    { label: 'Contact', path: '/contact', active: route.page === 'contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="backdrop-blur-md border-b border-black/10 theme-transition"
        style={{ backgroundColor: `color-mix(in srgb, ${activeFlavorSpec.softBg} 90%, transparent)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-brand text-3xl tracking-[-0.02em] text-[#1E1B18] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 rounded"
          >
            Blendy
          </button>

          {/* Zone 2: Nav Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer relative py-1 ${
                  link.active
                    ? 'text-[#1E1B18]'
                    : 'text-[#5C554E] hover:text-[#1E1B18]'
                }`}
              >
                {link.label}
                {link.active && (
                  <span
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full theme-transition"
                    style={{ backgroundColor: activeFlavorSpec.ink }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Theme Swatches + Cart + Register */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Flavor Theme Switcher Swatches */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.05]"
              role="group"
              aria-label="Switch flavour theme"
            >
              {FLAVORS.map((f) => {
                const isActive = f.id === activeFlavor;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setActiveFlavor(f.id);
                      if (route.page === 'product') {
                        navigate(`/product/${f.id}`, f.id);
                      }
                    }}
                    title={`Switch theme to ${f.name}`}
                    aria-label={`Switch theme to ${f.name}`}
                    aria-pressed={isActive}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      isActive ? 'scale-125 ring-2 ring-[#1E1B18] ring-offset-1' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: f.bg }}
                  />
                );
              })}
              <span
                className="text-[11px] font-bold pl-1 hidden lg:inline theme-transition"
                style={{ color: activeFlavorSpec.ink }}
              >
                {activeFlavorSpec.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart with ${cartCount} items`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold text-[#1E1B18] theme-transition cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: activeFlavorSpec.bg }}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
              <span>Cart</span>
              <span className="tabular-nums">({cartCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="hidden sm:inline-flex text-sm font-medium text-[#5C554E] hover:text-[#1E1B18] whitespace-nowrap cursor-pointer"
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg text-[#1E1B18] hover:bg-black/5 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-black/10 px-4 py-4 space-y-3 theme-transition"
            style={{ backgroundColor: activeFlavorSpec.softBg }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-base font-medium text-[#1E1B18]"
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-base font-medium text-[#5C554E]"
              >
                Register / Sign In
              </button>
            </div>
            <div className="pt-2 border-t border-black/8 flex items-center justify-between">
              <span className="text-xs font-medium text-[#5C554E]">Flavour Theme</span>
              <div className="flex items-center gap-2">
                {FLAVORS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setActiveFlavor(f.id);
                      if (route.page === 'product') {
                        navigate(`/product/${f.id}`, f.id);
                      }
                    }}
                    aria-label={`Switch theme to ${f.name}`}
                    className={`w-6 h-6 rounded-full ${
                      f.id === activeFlavor ? 'ring-2 ring-[#1E1B18] ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: f.bg }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
