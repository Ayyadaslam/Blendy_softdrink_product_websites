import React, { useState } from 'react';
import { Check, Minus, Plus, RefreshCw, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { FLAVORS, FLAVOR_MAP } from '../data/blendyData';
import { useStore } from '../context/StoreContext';
import { SpriteCrop } from './SpriteCrop';

const FREE_SHIPPING_THRESHOLD = 45;

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeCartItem,
    upgradeToSubscription,
    addToCart,
    clearCart,
    getEffectivePrice,
    activeFlavorSpec,
    navigate,
  } = useStore();

  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'confirmed'>('idle');
  const [checkoutMethod, setCheckoutMethod] = useState<string>('');

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const progressPct = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleExpressCheckout = (method: string) => {
    if (cart.length === 0) return;
    setCheckoutMethod(method);
    setCheckoutState('processing');
    window.setTimeout(() => {
      setCheckoutState('confirmed');
      clearCart();
    }, 650);
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setCheckoutState('idle');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full sm:max-w-md h-full bg-[#FDFBF7] text-[#1E1B18] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            <h2 className="text-lg font-bold tracking-tight">
              Your Box <span className="text-[#5C554E] font-medium tabular-nums">({cartCount})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-6 py-3.5 bg-white border-b border-black/8">
          <div className="flex items-center gap-2 text-xs font-medium text-[#1E1B18] mb-2">
            <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
            {remainingForFreeShipping > 0 ? (
              <span>
                You&apos;re{' '}
                <strong className="font-bold tabular-nums">
                  ${remainingForFreeShipping.toFixed(2)}
                </strong>{' '}
                away from free chilled shipping!
              </span>
            ) : (
              <span className="font-semibold">
                Free chilled 48-hour shipping unlocked!
              </span>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-black/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor: activeFlavorSpec.bg,
              }}
            />
          </div>
        </div>

        {/* Express Checkout Top Section (when items exist) */}
        {cart.length > 0 && checkoutState === 'idle' && (
          <div className="px-6 pt-4 pb-3 border-b border-black/8 bg-white/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5C554E] mb-2.5">
              Express Checkout
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleExpressCheckout('Apple Pay')}
                className="h-10 rounded-xl bg-[#1E1B18] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Apple Pay
              </button>
              <button
                type="button"
                onClick={() => handleExpressCheckout('Google Pay')}
                className="h-10 rounded-xl bg-white border border-black/15 text-[#1E1B18] text-xs font-semibold hover:bg-black/5 transition-colors cursor-pointer"
              >
                G Pay
              </button>
              <button
                type="button"
                onClick={() => handleExpressCheckout('Shop Pay')}
                className="h-10 rounded-xl bg-[#5A31F4] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Shop Pay
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {checkoutState === 'confirmed' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: activeFlavorSpec.bg }}
              >
                <Check className="w-7 h-7 text-[#1E1B18]" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-2">Order Confirmed!</h3>
              <p className="text-sm text-[#5C554E] max-w-xs mb-6">
                Thank you for ordering via {checkoutMethod}. Your chilled smoothies are being packed with zero-waste insulation.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  navigate('/shop');
                }}
                className="px-6 py-3 rounded-full bg-[#1E1B18] text-white text-sm font-semibold cursor-pointer"
              >
                Continue Exploring
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-5 liquid-blob"
                style={{ backgroundColor: activeFlavorSpec.softBg }}
              >
                <SpriteCrop
                  sheet={activeFlavorSpec.sheet}
                  box={activeFlavorSpec.items[0]}
                  width={42}
                />
              </div>
              <h3 className="text-lg font-bold mb-1">Your fridge box is empty</h3>
              <p className="text-sm text-[#5C554E] mb-6 max-w-xs">
                Start with a fan-favorite 6-pack or mix and match your own chilled variety box.
              </p>
              <div className="w-full space-y-2.5">
                {FLAVORS.slice(0, 2).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      addToCart({
                        flavorId: f.id,
                        title: `${f.fullName} 6-Pack`,
                        packSize: '6-pack',
                        purchaseType: 'subscription',
                        baseUnitPrice: f.sixPackPrice,
                        quantity: 1,
                      })
                    }
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-black/10 bg-white hover:border-black/25 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: f.bg }}
                      >
                        <SpriteCrop sheet={f.sheet} box={f.items[0]} width={22} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">{f.fullName} 6-Pack</div>
                        <div className="text-xs text-[#5C554E]">Subscribe & Save (-15%)</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                      +${(f.sixPackPrice * 0.85).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const flavour = FLAVOR_MAP[item.flavorId];
              const effectivePrice = getEffectivePrice(item);
              const lineTotal = effectivePrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-black/8 space-y-3"
                >
                  <div className="flex gap-3.5">
                    <div
                      className="w-16 h-20 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: flavour.bg }}
                    >
                      <SpriteCrop sheet={flavour.sheet} box={flavour.items[0]} width={36} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#1E1B18] truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#5C554E] capitalize">
                            {item.packSize} ·{' '}
                            {item.purchaseType === 'subscription'
                              ? 'Subscribe & Save (15% off)'
                              : 'One-Time Purchase'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="p-1 text-[#5C554E] hover:text-[#1E1B18] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.customMix && (
                        <p className="text-[11px] text-[#5C554E] mt-1">
                          Mix:{' '}
                          {Object.entries(item.customMix)
                            .filter(([, count]) => count > 0)
                            .map(([k, count]) => `${count}× ${FLAVOR_MAP[k as keyof typeof FLAVOR_MAP].name}`)
                            .join(', ')}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-black/12 rounded-full">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-l-full cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-r-full cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          {item.purchaseType === 'subscription' && (
                            <span className="text-xs text-[#5C554E] line-through mr-1.5 tabular-nums">
                              ${(item.baseUnitPrice * item.quantity).toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm font-bold tabular-nums">
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Soft One-Click Subscription Upsell */}
                  {item.purchaseType === 'one-time' && (
                    <button
                      type="button"
                      onClick={() => upgradeToSubscription(item.id)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: flavour.softBg,
                        color: flavour.ink,
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Switch to Subscribe & Save and get 15% off this order</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && checkoutState !== 'confirmed' && (
          <div className="p-6 border-t border-black/8 bg-white space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5C554E]">
                <span>Chilled Shipping</span>
                <span className="font-medium tabular-nums">
                  {remainingForFreeShipping === 0 ? 'FREE' : '$6.00'}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1E1B18]">
                <span>Subtotal</span>
                <span className="tabular-nums">${cartSubtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={checkoutState === 'processing'}
              onClick={() => handleExpressCheckout('Blendy Checkout')}
              className="w-full py-3.5 rounded-full bg-[#1E1B18] text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
            >
              {checkoutState === 'processing' ? 'Preparing your chilled order…' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
