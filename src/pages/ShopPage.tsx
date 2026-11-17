import React, { useMemo, useState } from 'react';
import { RefreshCw, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { FLAVORS, FLAVOR_MAP, FlavorId, SHOP_PRODUCTS } from '../data/blendyData';
import { useStore } from '../context/StoreContext';
import { SpriteCrop } from '../components/SpriteCrop';
import { VibeBadges } from '../components/VibeBadges';

const DIETARY_OPTIONS = ['Sugar-Free', 'Vegan', 'Gluten-Free'] as const;
const BUNDLE_OPTIONS = ['Single Bottle', '6-Pack', '12-Pack', 'Subscription'] as const;

export const ShopPage: React.FC = () => {
  const { activeFlavor, setActiveFlavor, activeFlavorSpec, navigate, addToCart } = useStore();

  const [selectedFlavor, setSelectedFlavor] = useState<FlavorId | 'all'>('all');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleBundle = (bundle: string) => {
    setSelectedBundles((prev) =>
      prev.includes(bundle) ? prev.filter((b) => b !== bundle) : [...prev, bundle]
    );
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = SHOP_PRODUCTS.filter((p) => {
      if (selectedFlavor !== 'all' && p.flavorId !== selectedFlavor) return false;
      if (selectedDietary.length > 0) {
        const hasAll = selectedDietary.every((d) =>
          p.dietary.includes(d as (typeof p.dietary)[number])
        );
        if (!hasAll) return false;
      }
      if (selectedBundles.length > 0 && !selectedBundles.includes(p.bundleType)) {
        return false;
      }
      if (q) {
        const hay = `${p.title} ${p.subtitle} ${p.bundleType} ${FLAVOR_MAP[p.flavorId].tagline}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [selectedFlavor, selectedDietary, selectedBundles, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((v) => v + 6);
      setIsLoadingMore(false);
    }, 350);
  };

  const clearAllFilters = () => {
    setSelectedFlavor('all');
    setSelectedDietary([]);
    setSelectedBundles([]);
    setSearchQuery('');
  };

  const filterSidebarContent = (
    <div className="space-y-7">
      {/* Live Search */}
      <div>
        <label htmlFor="shop-search" className="block text-xs font-bold uppercase tracking-wider text-[#5C554E] mb-2.5">
          Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#5C554E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="shop-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Berry, 6-Pack..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
          />
        </div>
      </div>

      {/* Flavor Swatches (Visual color circles) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#5C554E] mb-3">
          Flavour Swatch
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedFlavor('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              selectedFlavor === 'all'
                ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                : 'bg-white text-[#1E1B18] border-black/15 hover:border-black/40'
            }`}
          >
            All
          </button>
          {FLAVORS.map((f) => {
            const isSelected = selectedFlavor === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedFlavor(f.id);
                  setActiveFlavor(f.id);
                }}
                aria-label={`Filter by ${f.name}`}
                aria-pressed={isSelected}
                title={f.fullName}
                className={`w-9 h-9 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'scale-110 ring-2 ring-[#1E1B18] ring-offset-2'
                    : 'hover:scale-105 border border-black/10'
                }`}
                style={{ backgroundColor: f.bg }}
              >
                <span className="sr-only">{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Toggles */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#5C554E] mb-3">
          Dietary
        </div>
        <div className="space-y-2">
          {DIETARY_OPTIONS.map((tag) => {
            const active = selectedDietary.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDietary(tag)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-medium flex items-center justify-between border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                    : 'bg-white text-[#1E1B18] border-black/10 hover:border-black/25'
                }`}
              >
                <span>{tag}</span>
                <span className="text-xs opacity-75">{active ? 'On' : '+'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bundle Type */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#5C554E] mb-3">
          Bundle Type
        </div>
        <div className="space-y-2">
          {BUNDLE_OPTIONS.map((bundle) => {
            const active = selectedBundles.includes(bundle);
            return (
              <button
                key={bundle}
                type="button"
                onClick={() => toggleBundle(bundle)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-medium flex items-center justify-between border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                    : 'bg-white text-[#1E1B18] border-black/10 hover:border-black/25'
                }`}
              >
                <span>{bundle}</span>
                <span className="text-xs opacity-75">{active ? 'Selected' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {(selectedFlavor !== 'all' ||
        selectedDietary.length > 0 ||
        selectedBundles.length > 0 ||
        searchQuery) && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full py-2.5 rounded-full border border-black/15 text-xs font-semibold hover:bg-black/5 cursor-pointer"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div
      className="pt-24 pb-24 min-h-screen page-enter theme-transition"
      style={{ backgroundColor: activeFlavorSpec.tintBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Banner */}
        <div
          className="rounded-3xl p-8 sm:p-12 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 theme-transition border border-black/8"
          style={{ backgroundColor: activeFlavorSpec.bg }}
        >
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 theme-transition"
              style={{ backgroundColor: activeFlavorSpec.softBg, color: activeFlavorSpec.ink }}
            >
              Cold-Pressed Shop · {activeFlavorSpec.fullName}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              Shop Real Fruit Smoothies
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#5C554E] max-w-xl">
              Single bottles, chilled 6-packs, and 12-pack subscriptions. Pick a flavour swatch to preview its palette.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-black/12 text-sm font-semibold cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products"
              className="px-4 py-2.5 rounded-full bg-white border border-black/12 text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 p-6 rounded-3xl bg-white border border-black/8">
            {filterSidebarContent}
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="mb-5 flex items-center justify-between text-xs font-medium text-[#5C554E]">
              <span className="tabular-nums">
                Showing {visibleProducts.length} of {filteredProducts.length} products
              </span>
              {selectedFlavor !== 'all' && (
                <span>Theme: {FLAVOR_MAP[selectedFlavor].fullName}</span>
              )}
            </div>

            {visibleProducts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-black/8 text-center">
                <h3 className="text-lg font-bold mb-2">No smoothies match those filters</h3>
                <p className="text-sm text-[#5C554E] mb-5">
                  Try clearing one of your dietary or bundle filters to view the full lineup.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-full bg-[#1E1B18] text-white text-sm font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleProducts.map((product) => {
                  const flavour = FLAVOR_MAP[product.flavorId];
                  const isCurrentAccent = product.flavorId === activeFlavor;
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.flavorId}`, product.flavorId)}
                      className={`group rounded-3xl bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col justify-between cursor-pointer ${
                        isCurrentAccent ? 'border-[#1E1B18]/25' : 'border-black/8'
                      }`}
                    >
                      {/* Sensory Top Stage */}
                      <div
                        className="relative h-64 flex items-center justify-center overflow-hidden p-5"
                        style={{ backgroundColor: flavour.bg }}
                      >
                        <div className="absolute w-36 h-36 bg-white/30 liquid-blob" />

                        {product.subscribeEligible && (
                          <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold text-[#1E1B18]">
                            <RefreshCw className="w-3 h-3" aria-hidden="true" />
                            Subscribe &amp; Save 15%
                          </span>
                        )}

                        <SpriteCrop
                          sheet={flavour.sheet}
                          box={flavour.items[1]}
                          width={42}
                          className="absolute right-4 top-10 float-gentle"
                        />

                        <SpriteCrop
                          sheet={flavour.sheet}
                          box={flavour.items[0]}
                          width={106}
                          className="relative z-10 transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Hover Quick Actions */}
                        <div className="absolute inset-x-4 bottom-4 z-20 flex gap-2 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-200">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${product.flavorId}`, product.flavorId);
                            }}
                            className="flex-1 py-2.5 rounded-full bg-white/95 text-[#1E1B18] text-xs font-semibold hover:bg-white cursor-pointer"
                          >
                            Quick View
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                flavorId: product.flavorId,
                                title: product.title,
                                packSize: product.packSize,
                                purchaseType: product.subscribeEligible
                                  ? 'subscription'
                                  : 'one-time',
                                baseUnitPrice: product.price,
                                quantity: 1,
                              });
                            }}
                            className="flex-1 py-2.5 rounded-full bg-[#1E1B18] text-white text-xs font-semibold hover:bg-black cursor-pointer"
                          >
                            Quick Add
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-bold text-[#1E1B18]">
                              {product.title}
                            </h3>
                            <p className="text-xs text-[#5C554E] mt-0.5">{product.subtitle}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-bold tabular-nums">
                              ${product.price.toFixed(2)}
                            </div>
                            {product.compareAtPrice && (
                              <div className="text-xs text-[#5C554E] line-through tabular-nums">
                                ${product.compareAtPrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-black/6">
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-[#1E1B18]" />
                            <span className="tabular-nums">{product.rating.toFixed(1)}</span>
                            <span className="text-[#5C554E] font-normal tabular-nums">
                              ({product.reviewCount})
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-[#5C554E]">
                            {product.bundleType}
                          </span>
                        </div>

                        <VibeBadges compact />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3.5 rounded-full bg-[#1E1B18] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                >
                  {isLoadingMore ? 'Loading more flavours…' : 'Load More Smoothies'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Off-Canvas Filter Drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-xs h-full p-6 overflow-y-auto shadow-2xl theme-transition"
            style={{ backgroundColor: activeFlavorSpec.softBg }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filter Smoothies</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-full hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterSidebarContent}
          </div>
        </div>
      )}
    </div>
  );
};
