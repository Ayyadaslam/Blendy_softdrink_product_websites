import React from 'react';
import { FLAVORS } from '../data/blendyData';
import { useStore } from '../context/StoreContext';

export const SiteFooter: React.FC = () => {
  const { navigate, activeFlavor, setActiveFlavor, activeFlavorSpec } = useStore();

  return (
    <footer className="bg-[#1E1B18] text-white pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/12">
          <div className="md:col-span-1 space-y-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-brand text-4xl tracking-[-0.02em] text-white cursor-pointer"
            >
              Blendy
            </button>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Cold-pressed real fruit smoothies with zero added sugar, bottled daily for bright mornings and easy afternoons.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {FLAVORS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFlavor(f.id)}
                  aria-label={`Set site accent to ${f.name}`}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    f.id === activeFlavor ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#1E1B18]' : ''
                  }`}
                  style={{ backgroundColor: f.bg }}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              Flavours
            </h4>
            <ul className="space-y-2.5 text-sm">
              {FLAVORS.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${f.id}`, f.id)}
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    {f.fullName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  Shop All Smoothies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/#bundle-builder')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  Build a Variety Pack
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/story')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  Our Story &amp; Sourcing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  Contact &amp; Stockists
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              Care &amp; Freshness
            </h4>
            <p className="text-sm text-white/70 leading-relaxed mb-3">
              Questions about subscriptions or retail stockists? Reach our fruit team anytime.
            </p>
            <a
              href="mailto:hello@drinkblendy.com"
              className="inline-block text-sm font-semibold underline underline-offset-4"
              style={{ color: activeFlavorSpec.bg }}
            >
              hello@drinkblendy.com
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Blendy Co. All rights reserved. Real fruit, zero added sugar.</p>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => navigate('/story')} className="hover:text-white cursor-pointer">
              Sustainability
            </button>
            <button type="button" onClick={() => navigate('/contact')} className="hover:text-white cursor-pointer">
              Stockists
            </button>
            <button type="button" onClick={() => navigate('/shop')} className="hover:text-white cursor-pointer">
              Subscribe &amp; Save
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
