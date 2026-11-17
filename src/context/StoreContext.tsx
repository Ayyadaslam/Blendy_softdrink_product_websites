import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FLAVORS, FLAVOR_MAP, FlavorId, FlavorSpec } from '../data/blendyData';

export interface CartItem {
  id: string;
  flavorId: FlavorId;
  title: string;
  packSize: 'single' | '6-pack' | '12-pack';
  purchaseType: 'subscription' | 'one-time';
  baseUnitPrice: number;
  quantity: number;
  customMix?: Record<FlavorId, number>;
}

export type AppRoute =
  | { page: 'home' }
  | { page: 'shop' }
  | { page: 'product'; flavorId: FlavorId }
  | { page: 'story' }
  | { page: 'contact' };

interface StoreContextValue {
  route: AppRoute;
  navigate: (path: string, flavorOverride?: FlavorId) => void;
  activeFlavor: FlavorId;
  setActiveFlavor: (flavorId: FlavorId) => void;
  activeFlavorSpec: FlavorSpec;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateCartQty: (id: string, delta: number) => void;
  removeCartItem: (id: string) => void;
  upgradeToSubscription: (id: string) => void;
  clearCart: () => void;
  getEffectivePrice: (item: CartItem) => number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function parseRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/shop') return { page: 'shop' };
  if (clean === '/story') return { page: 'story' };
  if (clean === '/contact') return { page: 'contact' };
  if (clean.startsWith('/product/')) {
    const slug = clean.slice('/product/'.length).toLowerCase() as FlavorId;
    if (slug in FLAVOR_MAP) {
      return { page: 'product', flavorId: slug };
    }
    return { page: 'product', flavorId: 'berry' };
  }
  return { page: 'home' };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));
  const [activeFlavor, setActiveFlavorState] = useState<FlavorId>(() => {
    const initial = parseRoute(window.location.pathname);
    return initial.page === 'product' ? initial.flavorId : 'berry';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Preload all 4 higgs image sheets once on boot
  useEffect(() => {
    FLAVORS.forEach((f) => {
      const img = new Image();
      img.src = f.sheet;
    });
  }, []);

  // Sync CSS custom properties on :root whenever activeFlavor changes
  useEffect(() => {
    const spec = FLAVOR_MAP[activeFlavor];
    const root = document.documentElement;
    root.style.setProperty('--blendy-accent', spec.bg);
    root.style.setProperty('--blendy-accent-tint', spec.tintBg);
    root.style.setProperty('--blendy-accent-soft', spec.softBg);
    root.style.setProperty('--blendy-accent-ink', spec.ink);
  }, [activeFlavor]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const next = parseRoute(window.location.pathname);
      setRoute(next);
      if (next.page === 'product') {
        setActiveFlavorState(next.flavorId);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setActiveFlavor = useCallback((flavorId: FlavorId) => {
    setActiveFlavorState(flavorId);
  }, []);

  const navigate = useCallback((path: string, flavorOverride?: FlavorId) => {
    const [pathname, hash] = path.split('#');
    const targetPath = pathname || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath + (hash ? '#' + hash : ''));
    }
    const next = parseRoute(targetPath);
    setRoute(next);

    if (flavorOverride) {
      setActiveFlavorState(flavorOverride);
    } else if (next.page === 'product') {
      setActiveFlavorState(next.flavorId);
    }

    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const getEffectivePrice = useCallback((item: CartItem) => {
    return item.purchaseType === 'subscription'
      ? Number((item.baseUnitPrice * 0.85).toFixed(2))
      : item.baseUnitPrice;
  }, []);

  const addToCart = useCallback((incoming: Omit<CartItem, 'id'>) => {
    const mixKey = incoming.customMix
      ? JSON.stringify(incoming.customMix)
      : '';
    const itemId = `${incoming.flavorId}-${incoming.packSize}-${incoming.purchaseType}-${mixKey}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + incoming.quantity } : i
        );
      }
      return [...prev, { ...incoming, id: itemId }];
    });
    setActiveFlavorState(incoming.flavorId);
    setIsCartOpen(true);
  }, []);

  const updateCartQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeCartItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const upgradeToSubscription = useCallback((id: string) => {
    setCart((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target || target.purchaseType === 'subscription') return prev;
      const newId = `${target.flavorId}-${target.packSize}-subscription-${
        target.customMix ? JSON.stringify(target.customMix) : ''
      }`;
      const existingSub = prev.find((i) => i.id === newId);
      if (existingSub) {
        return prev
          .filter((i) => i.id !== id)
          .map((i) =>
            i.id === newId ? { ...i, quantity: i.quantity + target.quantity } : i
          );
      }
      return prev.map((i) =>
        i.id === id ? { ...i, id: newId, purchaseType: 'subscription' } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + getEffectivePrice(item) * item.quantity,
        0
      ),
    [cart, getEffectivePrice]
  );

  const activeFlavorSpec = FLAVOR_MAP[activeFlavor];

  const value: StoreContextValue = {
    route,
    navigate,
    activeFlavor,
    setActiveFlavor,
    activeFlavorSpec,
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    isRegisterOpen,
    setIsRegisterOpen,
    addToCart,
    updateCartQty,
    removeCartItem,
    upgradeToSubscription,
    clearCart,
    getEffectivePrice,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
