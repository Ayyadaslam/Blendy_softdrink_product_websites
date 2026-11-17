import React, { useMemo, useState } from 'react';
import { Check, GripVertical, Minus, Package, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { FLAVORS, FLAVOR_MAP, FlavorId } from '../data/blendyData';
import { useStore } from '../context/StoreContext';
import { SpriteCrop } from './SpriteCrop';

export const BundleBuilder: React.FC = () => {
  const { addToCart, activeFlavorSpec, setActiveFlavor } = useStore();

  const [packSize, setPackSize] = useState<'6-pack' | '12-pack'>('6-pack');
  const [counts, setCounts] = useState<Record<FlavorId, number>>({
    berry: 2,
    kiwi: 1,
    banana: 1,
    strawberry: 2,
  });
  const [isSubscription, setIsSubscription] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const capacity = packSize === '6-pack' ? 6 : 12;
  const totalSelected = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );
  const remaining = Math.max(0, capacity - totalSelected);

  const retailPrice = capacity * 5.5;
  const bundleBasePrice = packSize === '6-pack' ? 28.5 : 52.0;
  const finalPrice = isSubscription
    ? Number((bundleBasePrice * 0.85).toFixed(2))
    : bundleBasePrice;
  const perBottle = (finalPrice / capacity).toFixed(2);
  const totalSaved = (retailPrice - finalPrice).toFixed(2);

  const switchPackSize = (nextSize: '6-pack' | '12-pack') => {
    setPackSize(nextSize);
    if (nextSize === '6-pack' && totalSelected > 6) {
      // Trim proportionally back down to 6
      setCounts({ berry: 2, kiwi: 1, banana: 1, strawberry: 2 });
    }
  };

  const adjustFlavor = (id: FlavorId, delta: number) => {
    setActiveFlavor(id);
    setCounts((prev) => {
      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      if (delta > 0 && currentTotal >= capacity) return prev;
      const nextVal = Math.max(0, prev[id] + delta);
      return { ...prev, [id]: nextVal };
    });
  };

  const fillRainbow = () => {
    if (packSize === '6-pack') {
      setCounts({ berry: 2, kiwi: 1, banana: 1, strawberry: 2 });
    } else {
      setCounts({ berry: 3, kiwi: 3, banana: 3, strawberry: 3 });
    }
  };

  // Build slot array for the visual box
  const slots = useMemo(() => {
    const filled: FlavorId[] = [];
    FLAVORS.forEach((f) => {
      for (let i = 0; i < counts[f.id]; i++) {
        if (filled.length < capacity) filled.push(f.id);
      }
    });
    return Array.from({ length: capacity }, (_, idx) => filled[idx] ?? null);
  }, [counts, capacity]);

  const handleDropOnBox = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const flavorId = e.dataTransfer.getData('text/plain') as FlavorId;
    if (flavorId && flavorId in FLAVOR_MAP) {
      adjustFlavor(flavorId, 1);
    }
  };

  const handleAddBox = () => {
    if (remaining > 0) return;
    // Pick dominant flavour for cart badge accent
    const dominant = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'berry') as FlavorId;

    addToCart({
      flavorId: dominant,
      title: `Custom ${capacity}-Pack Variety Box`,
      packSize,
      purchaseType: isSubscription ? 'subscription' : 'one-time',
      baseUnitPrice: bundleBasePrice,
      quantity: 1,
      customMix: { ...counts },
    });
  };

  return (
    <section
      id="bundle-builder"
      className="py-20 sm:py-28 theme-transition"
      style={{ backgroundColor: activeFlavorSpec.tintBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span
              className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold mb-3 theme-transition"
              style={{
                backgroundColor: activeFlavorSpec.bg,
                color: activeFlavorSpec.ink,
              }}
            >
              Build Your Own Variety Pack · {activeFlavorSpec.fullName} Theme
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              Mix your perfect chilled box.
            </h2>
            <p className="mt-3 text-base text-[#5C554E] max-w-xl">
              Drag flavours into your crate or tap to add. Featuring <strong className="text-[#1E1B18]">{activeFlavorSpec.fullName}</strong>—save up to 21% on 12-packs, plus 15% off with Subscribe &amp; Save.
            </p>
          </div>

          {/* Pack Size Toggle */}
          <div className="inline-flex p-1.5 rounded-full bg-black/[0.06] self-start">
            <button
              type="button"
              onClick={() => switchPackSize('6-pack')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                packSize === '6-pack'
                  ? 'bg-[#1E1B18] text-white shadow-sm'
                  : 'text-[#5C554E] hover:text-[#1E1B18]'
              }`}
            >
              6-Pack · Save 14%
            </button>
            <button
              type="button"
              onClick={() => switchPackSize('12-pack')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                packSize === '12-pack'
                  ? 'bg-[#1E1B18] text-white shadow-sm'
                  : 'text-[#5C554E] hover:text-[#1E1B18]'
              }`}
            >
              12-Pack · Save 21%
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Flavor Pickers (Draggable + Clickable) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FLAVORS.map((f) => {
              const qty = counts[f.id];
              const isSpotlight = f.id === activeFlavorSpec.id;
              return (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', f.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => setActiveFlavor(f.id)}
                  className={`group relative rounded-3xl p-5 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-grab active:cursor-grabbing ${
                    isSpotlight ? 'border-[#1E1B18] shadow-md' : 'border-black/8'
                  }`}
                  style={{ backgroundColor: isSpotlight ? f.tintBg : '#FFFFFF' }}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-[#5C554E] mb-3">
                    <span className="inline-flex items-center gap-1">
                      <GripVertical className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                      Drag to box
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: f.bg, color: f.ink }}
                    >
                      {qty} in box
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-24 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: f.bg }}
                    >
                      <SpriteCrop
                        sheet={f.sheet}
                        box={f.items[0]}
                        width={44}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-[#1E1B18]">{f.fullName}</h3>
                      <p className="text-xs text-[#5C554E] line-clamp-2 mt-0.5 mb-3">
                        {f.tagline}
                      </p>

                      <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 border border-black/10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustFlavor(f.id, -1);
                          }}
                          disabled={qty === 0}
                          aria-label={`Remove one ${f.name}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustFlavor(f.id, 1);
                          }}
                          disabled={remaining === 0}
                          aria-label={`Add one ${f.name}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Interactive Visual Crate & Summary */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDropOnBox}
            className={`lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white border-2 transition-all duration-300 shadow-sm ${
              isDragOver ? 'border-[#1E1B18] scale-[1.01]' : 'border-black/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1E1B18]" aria-hidden="true" />
                <h3 className="text-lg font-bold">
                  Your {capacity}-Bottle Crate
                </h3>
              </div>
              <button
                type="button"
                onClick={fillRainbow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C554E] hover:text-[#1E1B18] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Auto-fill Mix</span>
              </button>
            </div>

            {/* Segmented Fill Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-medium text-[#5C554E] mb-1.5">
                <span className="tabular-nums">
                  {totalSelected} / {capacity} bottles selected
                </span>
                <span>
                  {remaining === 0 ? 'Box Ready!' : `${remaining} slot${remaining > 1 ? 's' : ''} left`}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-black/8 overflow-hidden flex gap-0.5 p-0.5">
                {slots.map((slotFlavor, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: slotFlavor ? FLAVOR_MAP[slotFlavor].bg : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Visual Crate Grid */}
            <div
              className={`grid ${
                packSize === '6-pack' ? 'grid-cols-3' : 'grid-cols-4'
              } gap-2.5 p-3.5 rounded-2xl bg-[#FDFBF7] border border-dashed border-black/15 mb-6`}
            >
              {slots.map((slotFlavor, idx) => {
                if (!slotFlavor) {
                  return (
                    <div
                      key={idx}
                      className="h-20 rounded-xl border border-dashed border-black/15 flex items-center justify-center text-[11px] text-[#5C554E]"
                    >
                      Drop
                    </div>
                  );
                }
                const f = FLAVOR_MAP[slotFlavor];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => adjustFlavor(slotFlavor, -1)}
                    title={`Remove ${f.name}`}
                    aria-label={`Remove ${f.name} from slot ${idx + 1}`}
                    className="h-20 rounded-xl flex items-center justify-center relative group transition-transform hover:scale-95 cursor-pointer"
                    style={{ backgroundColor: f.bg }}
                  >
                    <SpriteCrop sheet={f.sheet} box={f.items[0]} width={26} />
                    <span className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center">
                      ×
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subscription Toggle */}
            <button
              type="button"
              onClick={() => setIsSubscription((v) => !v)}
              className="w-full p-3.5 rounded-2xl border border-black/12 flex items-center justify-between gap-3 mb-5 text-left transition-colors cursor-pointer"
              style={{
                backgroundColor: isSubscription ? activeFlavorSpec.softBg : '#FFFFFF',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSubscription
                      ? 'bg-[#1E1B18] border-[#1E1B18] text-white'
                      : 'border-black/30 bg-white'
                  }`}
                >
                  {isSubscription && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    Subscribe &amp; Save (15% Off)
                  </div>
                  <div className="text-xs text-[#5C554E]">
                    Flexible rotation · Skip or cancel anytime
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#1E1B18] tabular-nums">
                Save ${totalSaved}
              </span>
            </button>

            {/* Pricing & CTA */}
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-xs text-[#5C554E]">Box Total</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums">
                    ${finalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-[#5C554E] line-through tabular-nums">
                    ${retailPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-[#5C554E] tabular-nums">
                ${perBottle} / bottle
              </div>
            </div>

            <button
              type="button"
              disabled={remaining > 0}
              onClick={handleAddBox}
              className="w-full py-4 rounded-full bg-[#1E1B18] text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {remaining > 0
                ? `Add ${remaining} more bottle${remaining > 1 ? 's' : ''} to fill box`
                : `Add Custom ${capacity}-Pack to Cart · $${finalPrice.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
