import React, { useState } from 'react';
import { Check, ChevronDown, Minus, Plus, RefreshCw, ShieldCheck, Star, Truck } from 'lucide-react';
import {
  EDITORIAL_IMAGES,
  FLAVORS,
  FLAVOR_MAP,
  FlavorId,
  TESTIMONIALS,
} from '../data/blendyData';
import { useStore } from '../context/StoreContext';
import { SpriteCrop } from '../components/SpriteCrop';
import { VibeBadges } from '../components/VibeBadges';
import { Blendy3DShowcase } from '../components/Blendy3DShowcase';

interface ProductDetailPageProps {
  flavorId: FlavorId;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ flavorId }) => {
  const { navigate, addToCart, setActiveFlavor } = useStore();
  const flavour = FLAVOR_MAP[flavorId];

  const [galleryTab, setGalleryTab] = useState<number>(0);
  const [purchaseType, setPurchaseType] = useState<'subscription' | 'one-time'>('subscription');
  const [packSize, setPackSize] = useState<'single' | '6-pack' | '12-pack'>('6-pack');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedPulse, setAddedPulse] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('ingredients');

  const packOptions = [
    {
      id: 'single' as const,
      label: 'Single',
      bottles: 1,
      basePrice: flavour.singlePrice,
    },
    {
      id: '6-pack' as const,
      label: '6-Pack',
      bottles: 6,
      basePrice: flavour.sixPackPrice,
    },
    {
      id: '12-pack' as const,
      label: '12-Pack',
      bottles: 12,
      basePrice: flavour.twelvePackPrice,
    },
  ];

  const selectedPack = packOptions.find((p) => p.id === packSize)!;
  const effectiveUnitPrice =
    purchaseType === 'subscription'
      ? Number((selectedPack.basePrice * 0.85).toFixed(2))
      : selectedPack.basePrice;
  const totalPrice = (effectiveUnitPrice * quantity).toFixed(2);
  const perBottle = (effectiveUnitPrice / selectedPack.bottles).toFixed(2);

  const handleAddToCart = () => {
    setAddedPulse(true);
    window.setTimeout(() => setAddedPulse(false), 600);
    addToCart({
      flavorId: flavour.id,
      title: `${flavour.fullName} ${selectedPack.label}`,
      packSize,
      purchaseType,
      baseUnitPrice: selectedPack.basePrice,
      quantity,
    });
  };

  const galleryThumbs = [
    { id: 0, label: 'Bottle Studio' },
    { id: 1, label: '3D 360°' },
    { id: 2, label: 'Smoothie Pour', img: EDITORIAL_IMAGES.pourGlass },
    { id: 3, label: 'Morning Serve', img: EDITORIAL_IMAGES.lifestyleSip },
    { id: 4, label: 'Fresh Splash', img: EDITORIAL_IMAGES.splashStory },
  ];

  return (
    <div
      className="pt-24 pb-28 sm:pb-24 min-h-screen page-enter theme-transition"
      style={{ backgroundColor: flavour.tintBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#5C554E] mb-6" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate('/')} className="hover:text-[#1E1B18] cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button type="button" onClick={() => navigate('/shop')} className="hover:text-[#1E1B18] cursor-pointer">
            Shop
          </button>
          <span>/</span>
          <span className="font-semibold text-[#1E1B18]">{flavour.fullName}</span>
        </nav>

        {/* Main Buy Box Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: High-Res Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {galleryTab === 1 ? (
              <Blendy3DShowcase
                flavorId={flavour.id}
                onSelectFlavor={(nextId) => {
                  setActiveFlavor(nextId);
                  navigate(`/product/${nextId}`, nextId);
                }}
                heightClass="h-[380px] sm:h-[520px]"
              />
            ) : (
              <div
                className="relative rounded-[2rem] overflow-hidden aspect-[4/3] sm:aspect-[5/4] flex items-center justify-center theme-transition"
                style={{ backgroundColor: flavour.bg }}
              >
                {galleryTab === 0 ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute text-[120px] sm:text-[170px] font-bold tracking-tight text-white/30 leading-none"
                    >
                      {flavour.name}
                    </span>
                    <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-white/30 liquid-blob" />

                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[1]}
                      width={84}
                      className="absolute left-6 sm:left-12 top-10 sm:top-14 float-gentle"
                    />
                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[2]}
                      width={78}
                      className="absolute right-8 sm:right-14 top-16 float-gentle"
                    />
                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[3]}
                      width={86}
                      className="absolute right-10 bottom-10 float-gentle"
                    />

                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[0]}
                      width={190}
                      className="relative z-10 sm:scale-110"
                    />
                  </>
                ) : (
                  <img
                    src={galleryThumbs[galleryTab].img}
                    alt={`${flavour.fullName} — ${galleryThumbs[galleryTab].label}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {galleryThumbs.map((thumb) => (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => setGalleryTab(thumb.id)}
                  className={`relative rounded-2xl overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer ${
                    galleryTab === thumb.id
                      ? 'border-[#1E1B18] scale-[0.98]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      thumb.id === 0
                        ? flavour.bg
                        : thumb.id === 1
                        ? flavour.softBg
                        : '#EEECE6',
                  }}
                >
                  {thumb.id === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <SpriteCrop sheet={flavour.sheet} box={flavour.items[0]} width={32} />
                    </div>
                  ) : thumb.id === 1 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#1E1B18]">
                      <span className="text-xs font-bold">3D</span>
                      <span className="text-[10px] font-medium text-[#5C554E]">360° View</span>
                    </div>
                  ) : (
                    <img
                      src={thumb.img}
                      alt={thumb.label}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Sticky Conversion Buy Box */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            {/* Flavour Quick Swatches */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {FLAVORS.map((f) => {
                  const active = f.id === flavour.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setActiveFlavor(f.id);
                        navigate(`/product/${f.id}`, f.id);
                      }}
                      title={f.fullName}
                      aria-label={`Switch to ${f.fullName}`}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        active ? 'scale-115 ring-2 ring-[#1E1B18] ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: f.bg }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-[#1E1B18]" />
                <span className="tabular-nums">4.9</span>
                <span className="text-[#5C554E] font-normal">(284 reviews)</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
                {flavour.fullName}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#5C554E] leading-relaxed">
                {flavour.tagline}
              </p>
            </div>

            {/* Persistent Vibe & Vitality Spec Sheet */}
            <VibeBadges />

            {/* Purchase Options (Subscribe & Save Pre-Selected) */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C554E]">
                Purchase Option
              </div>

              {/* Subscribe & Save Option */}
              <button
                type="button"
                onClick={() => setPurchaseType('subscription')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  purchaseType === 'subscription'
                    ? 'border-[#1E1B18]'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
                style={{
                  backgroundColor:
                    purchaseType === 'subscription' ? flavour.softBg : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        purchaseType === 'subscription'
                          ? 'bg-[#1E1B18] border-[#1E1B18] text-white'
                          : 'border-black/30 bg-white'
                      }`}
                    >
                      {purchaseType === 'subscription' && (
                        <Check className="w-3 h-3" strokeWidth={3} />
                      )}
                    </span>
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Subscribe &amp; Save (15% Off)
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    ${(selectedPack.basePrice * 0.85).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-[#5C554E] mt-1.5 pl-7">
                  Delivered every 4 weeks · Swap flavours or cancel anytime
                </p>
              </button>

              {/* One-Time Option */}
              <button
                type="button"
                onClick={() => setPurchaseType('one-time')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  purchaseType === 'one-time'
                    ? 'border-[#1E1B18] bg-white'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        purchaseType === 'one-time'
                          ? 'bg-[#1E1B18] border-[#1E1B18] text-white'
                          : 'border-black/30 bg-white'
                      }`}
                    >
                      {purchaseType === 'one-time' && (
                        <Check className="w-3 h-3" strokeWidth={3} />
                      )}
                    </span>
                    <span className="text-sm font-bold">One-Time Purchase</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    ${selectedPack.basePrice.toFixed(2)}
                  </span>
                </div>
              </button>
            </div>

            {/* Pack Size Selector */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C554E]">
                Pack Size
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {packOptions.map((opt) => {
                  const unitPrice =
                    purchaseType === 'subscription'
                      ? opt.basePrice * 0.85
                      : opt.basePrice;
                  const perBtl = (unitPrice / opt.bottles).toFixed(2);
                  const active = packSize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPackSize(opt.id)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        active
                          ? 'border-[#1E1B18] bg-[#1E1B18] text-white'
                          : 'border-black/10 bg-white text-[#1E1B18] hover:border-black/30'
                      }`}
                    >
                      <div className="text-sm font-bold">{opt.label}</div>
                      <div
                        className={`text-xs mt-0.5 tabular-nums ${
                          active ? 'text-white/80' : 'text-[#5C554E]'
                        }`}
                      >
                        ${perBtl}/btl
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper + Add to Cart */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center h-14 px-2 rounded-full border border-black/15 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 h-14 rounded-full bg-[#1E1B18] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-transform duration-200 cursor-pointer ${
                  addedPulse ? 'scale-[0.97]' : 'hover:opacity-90'
                }`}
              >
                {addedPulse ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={3} />
                    <span>Added to Box!</span>
                  </>
                ) : (
                  <span className="tabular-nums">
                    Add to Cart · ${totalPrice} ({perBottle}/btl)
                  </span>
                )}
              </button>
            </div>

            {/* Expandable Information Accordions */}
            <div className="border-t border-black/10 divide-y divide-black/10">
              {/* Ingredients & Nutrition */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(openAccordion === 'ingredients' ? '' : 'ingredients')
                  }
                  aria-expanded={openAccordion === 'ingredients'}
                  className="w-full py-4 flex items-center justify-between text-sm font-bold text-left cursor-pointer"
                >
                  <span>Ingredients &amp; Nutrition</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'ingredients' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'ingredients' && (
                  <div className="pb-5 space-y-4 text-sm text-[#5C554E]">
                    <ul className="space-y-1 text-[#1E1B18]">
                      {flavour.ingredients.map((ing) => (
                        <li key={ing}>· {ing}</li>
                      ))}
                    </ul>
                    <p className="text-xs font-medium bg-white p-3 rounded-xl border border-black/8">
                      <strong className="text-[#1E1B18]">Allergens:</strong> {flavour.allergens}
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-black/8">
                        <div className="text-base font-bold text-[#1E1B18] tabular-nums">
                          {flavour.nutrition.calories}
                        </div>
                        <div className="text-[11px]">Calories</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-black/8">
                        <div className="text-base font-bold text-[#1E1B18] tabular-nums">
                          {flavour.nutrition.addedSugar}
                        </div>
                        <div className="text-[11px]">Added Sugar</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-black/8">
                        <div className="text-base font-bold text-[#1E1B18] tabular-nums">
                          {flavour.nutrition.vitaminC}
                        </div>
                        <div className="text-[11px]">Vitamin C</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tasting Notes & Pairings */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(openAccordion === 'tasting' ? '' : 'tasting')
                  }
                  aria-expanded={openAccordion === 'tasting'}
                  className="w-full py-4 flex items-center justify-between text-sm font-bold text-left cursor-pointer"
                >
                  <span>Tasting Notes &amp; Pairings</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'tasting' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'tasting' && (
                  <div className="pb-5 space-y-3 text-sm text-[#5C554E]">
                    <p className="text-[#1E1B18] leading-relaxed">{flavour.tastingNotes}</p>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1.5">
                        Best Paired With
                      </div>
                      <ul className="space-y-1">
                        {flavour.pairings.map((pair) => (
                          <li key={pair}>· {pair}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')
                  }
                  aria-expanded={openAccordion === 'shipping'}
                  className="w-full py-4 flex items-center justify-between text-sm font-bold text-left cursor-pointer"
                >
                  <span>Shipping &amp; Returns</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'shipping' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-5 space-y-2.5 text-sm text-[#5C554E]">
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-[#1E1B18] mt-0.5 shrink-0" />
                      <span>
                        Ships chilled in 100% curbside-recyclable insulated liners within 48 hours. Free shipping over $45.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#1E1B18] mt-0.5 shrink-0" />
                      <span>
                        100% Happiness Guarantee—if a bottle arrives warm or isn&apos;t your vibe, we refund or replace it immediately.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Gallery & Reviews */}
        <section className="mt-20 pt-16 border-t border-black/10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
            In the wild &amp; customer reviews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              { img: EDITORIAL_IMAGES.pourGlass, caption: 'Velvety cold-pressed pour' },
              { img: EDITORIAL_IMAGES.lifestyleSip, caption: 'Morning ritual on sunlit linen' },
              { img: EDITORIAL_IMAGES.splashStory, caption: 'Whole fruit, zero shortcuts' },
            ].map((shot) => (
              <div key={shot.caption} className="rounded-3xl overflow-hidden bg-white border border-black/8">
                <img
                  src={shot.img}
                  alt={shot.caption}
                  loading="lazy"
                  className="w-full h-60 object-cover"
                />
                <div className="px-4 py-3 text-xs font-medium text-[#5C554E]">{shot.caption}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-3xl bg-white border border-black/8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-[#1E1B18]" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#5C554E]">Verified Buyer</span>
                </div>
                <p className="text-sm text-[#1E1B18] leading-relaxed">“{t.quote}”</p>
                <div className="text-xs font-bold">
                  {t.name} · <span className="font-normal text-[#5C554E]">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Buy Bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 backdrop-blur-md border-t border-black/10 px-4 py-3 flex items-center justify-between gap-3 theme-transition"
        style={{ backgroundColor: `color-mix(in srgb, ${flavour.softBg} 92%, transparent)` }}
      >
        <div>
          <div className="text-xs font-bold text-[#1E1B18]">
            {flavour.fullName} · {selectedPack.label}
          </div>
          <div className="text-xs text-[#5C554E] tabular-nums">
            ${totalPrice} ({purchaseType === 'subscription' ? 'Sub -15%' : 'One-Time'})
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="px-6 py-3 rounded-full bg-[#1E1B18] text-white text-xs font-semibold cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
