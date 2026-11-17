import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Leaf, RefreshCw, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import {
  EDITORIAL_IMAGES,
  FLAVORS,
  PRESS_QUOTES,
  TESTIMONIALS,
} from '../data/blendyData';
import { useStore } from '../context/StoreContext';
import { HeroSlider } from '../components/HeroSlider';
import { SpriteCrop } from '../components/SpriteCrop';
import { VibeBadges } from '../components/VibeBadges';
import { BundleBuilder } from '../components/BundleBuilder';

export const HomePage: React.FC = () => {
  const { navigate, addToCart, activeFlavorSpec, setActiveFlavor } = useStore();

  const [whyVisible, setWhyVisible] = useState(false);
  const whyRef = useRef<HTMLElement | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Scroll-triggered reveal for "Why Blendy" stats
  useEffect(() => {
    const el = whyRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setWhyVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleStartSubscription = () => {
    addToCart({
      flavorId: activeFlavorSpec.id,
      title: `${activeFlavorSpec.fullName} Starter Club (12-Pack)`,
      packSize: '12-pack',
      purchaseType: 'subscription',
      baseUnitPrice: activeFlavorSpec.twelvePackPrice,
      quantity: 1,
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
  };

  const sortedTestimonials = [
    ...TESTIMONIALS.filter((t) => t.flavor === activeFlavorSpec.id),
    ...TESTIMONIALS.filter((t) => t.flavor !== activeFlavorSpec.id),
  ];

  return (
    <div>
      {/* 1. Signature Full-Viewport Hero Slider */}
      <HeroSlider />

      {/* 2. The Flavor Collection (Sensory Shop Grid) */}
      <section
        id="collection"
        className="py-20 sm:py-28 theme-transition"
        style={{ backgroundColor: activeFlavorSpec.tintBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span
                className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold mb-3 theme-transition"
                style={{
                  backgroundColor: activeFlavorSpec.bg,
                  color: activeFlavorSpec.ink,
                }}
              >
                The Flavor Collection · Now Featuring {activeFlavorSpec.fullName}
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
                Four real-fruit moods.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E1B18] hover:opacity-70 transition-opacity cursor-pointer self-start sm:self-auto"
            >
              <span>Explore full catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Live Slider-Synced Active Flavour Spotlight Strip */}
          <div
            className="mb-10 rounded-3xl p-5 sm:p-6 bg-white/85 border border-black/8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 theme-transition shadow-xs"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 theme-transition"
                style={{ backgroundColor: activeFlavorSpec.bg }}
              >
                <SpriteCrop
                  sheet={activeFlavorSpec.sheet}
                  box={activeFlavorSpec.items[0]}
                  width={34}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C554E]">
                    Active Mood
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold theme-transition"
                    style={{
                      backgroundColor: activeFlavorSpec.softBg,
                      color: activeFlavorSpec.ink,
                    }}
                  >
                    {activeFlavorSpec.nutrition.calories} kcal · {activeFlavorSpec.nutrition.vitaminC} Vit C
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1E1B18] mt-0.5">
                  {activeFlavorSpec.fullName} — {activeFlavorSpec.tagline}
                </h3>
                <p className="text-xs text-[#5C554E] mt-1 line-clamp-1">
                  {activeFlavorSpec.tastingNotes}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate(`/product/${activeFlavorSpec.id}`, activeFlavorSpec.id)}
                className="px-4 py-2.5 rounded-full border border-black/15 bg-white text-xs font-semibold text-[#1E1B18] hover:border-black/40 transition-colors cursor-pointer"
              >
                Explore {activeFlavorSpec.name}
              </button>
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    flavorId: activeFlavorSpec.id,
                    title: `${activeFlavorSpec.fullName} 6-Pack`,
                    packSize: '6-pack',
                    purchaseType: 'subscription',
                    baseUnitPrice: activeFlavorSpec.sixPackPrice,
                    quantity: 1,
                  })
                }
                className="px-5 py-2.5 rounded-full bg-[#1E1B18] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Quick Add · ${(activeFlavorSpec.sixPackPrice * 0.85).toFixed(2)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLAVORS.map((flavour) => {
              const isSelected = flavour.id === activeFlavorSpec.id;
              return (
                <div
                  key={flavour.id}
                  onClick={() => navigate(`/product/${flavour.id}`, flavour.id)}
                  onMouseEnter={() => setActiveFlavor(flavour.id)}
                  className={`group relative rounded-3xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[430px] border-2 ${
                    isSelected ? 'border-[#1E1B18] shadow-lg -translate-y-0.5' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: flavour.bg }}
                >
                  {/* Giant Background Typography Echo */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute -top-2 left-1/2 -translate-x-1/2 text-[74px] font-bold tracking-tight text-white/30 whitespace-nowrap leading-none"
                  >
                    {flavour.name}
                  </span>

                  {/* Top row: Badges */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/85"
                      style={{ color: flavour.ink }}
                    >
                      6-Pack · ${flavour.sixPackPrice.toFixed(0)}
                    </span>
                    <span className="text-xs font-semibold text-white/95">
                      {isSelected ? 'Selected' : '100% Fruit'}
                    </span>
                  </div>

                  {/* Centerpiece: Liquid Blob + Cut-out Bottle + Floating Fruit */}
                  <div className="relative z-10 my-5 h-52 flex items-center justify-center">
                    <div className="absolute w-40 h-40 bg-white/30 liquid-blob" />

                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[1]}
                      width={46}
                      className="absolute left-2 top-3 float-gentle"
                    />
                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[2]}
                      width={44}
                      className="absolute right-2 bottom-4 float-gentle"
                    />

                    <SpriteCrop
                      sheet={flavour.sheet}
                      box={flavour.items[0]}
                      width={118}
                      className="relative z-10 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Bottom: Title, Vibe Markers & Quick Add */}
                  <div className="relative z-10 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#1E1B18]">{flavour.fullName}</h3>
                      <p className="text-xs text-[#1E1B18]/80 line-clamp-2 mt-0.5">
                        {flavour.tagline}
                      </p>
                    </div>

                    <VibeBadges compact />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          flavorId: flavour.id,
                          title: `${flavour.fullName} 6-Pack`,
                          packSize: '6-pack',
                          purchaseType: 'subscription',
                          baseUnitPrice: flavour.sixPackPrice,
                          quantity: 1,
                        });
                      }}
                      className="w-full py-3 rounded-full bg-[#1E1B18] text-white text-xs font-semibold tracking-wide hover:bg-black transition-colors cursor-pointer"
                    >
                      Quick Add 6-Pack · ${(flavour.sixPackPrice * 0.85).toFixed(2)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. The "Why Blendy" Story */}
      <section
        ref={whyRef}
        className="py-16 sm:py-24 theme-transition"
        style={{ backgroundColor: activeFlavorSpec.softBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Large Tall Fruit Splash Photograph */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-lg aspect-[3/4] max-h-[680px] w-full">
              <img
                src={EDITORIAL_IMAGES.splashStory}
                alt="Fresh berries, kiwi, banana, and strawberries splashing into smoothie cream"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-7 sm:p-9 text-white">
                <span
                  className="inline-block self-start px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#1E1B18] mb-3 theme-transition"
                  style={{ backgroundColor: activeFlavorSpec.bg }}
                >
                  In the Bottle · {activeFlavorSpec.fullName}
                </span>
                <p className="text-xl sm:text-2xl font-bold leading-snug max-w-md">
                  Whole orchards in every bottle—never concentrates, never syrups, never heat-pasteurized.
                </p>
              </div>
            </div>

            {/* Story Copy + Scroll-Revealed Stats + Live Flavour Craft Notes */}
            <div className="lg:col-span-6 space-y-7">
              <div>
                <span
                  className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold mb-3 theme-transition"
                  style={{
                    backgroundColor: activeFlavorSpec.bg,
                    color: activeFlavorSpec.ink,
                  }}
                >
                  Why Blendy
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18] leading-[1.1]">
                  Real fruit, pressed cold and bottled the same morning.
                </h2>
                <p className="mt-4 text-base text-[#5C554E] leading-relaxed">
                  {activeFlavorSpec.tastingNotes} We partner directly with organic farms, high-pressure chill every batch of <strong className="text-[#1E1B18]">{activeFlavorSpec.fullName}</strong>, and pour straight into recyclable glass.
                </p>
              </div>

              {/* Active Flavour Blend Breakdown */}
              <div
                className="p-5 rounded-2xl border border-black/10 bg-white/85 theme-transition"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#5C554E] mb-2">
                  Inside {activeFlavorSpec.fullName}
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFlavorSpec.ingredients.slice(0, 3).map((ing) => (
                    <span
                      key={ing}
                      className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#1E1B18] border border-black/8"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: '100%', label: 'Real Whole Fruit', sub: 'Zero concentrates or purees' },
                  { stat: '0g', label: 'Added Sugar', sub: 'Sweetened purely by fruit' },
                  { stat: '24 hrs', label: 'Orchard to Bottle', sub: 'Peak-ripeness cold pressing' },
                  { stat: '100%', label: 'Recyclable Glass', sub: 'Plastic-free chilled delivery' },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`p-5 rounded-2xl bg-white border border-black/8 transition-all duration-700 ${
                      whyVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <div
                      className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums mb-1 theme-transition"
                      style={{ color: activeFlavorSpec.ink }}
                    >
                      {item.stat}
                    </div>
                    <div className="text-sm font-bold text-[#1E1B18]">{item.label}</div>
                    <div className="text-xs text-[#5C554E] mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate('/story')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1E1B18] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Build-Your-Own Variety Pack */}
      <BundleBuilder />

      {/* 5. Subscription Spotlight */}
      <section
        className="py-16 sm:py-24 theme-transition"
        style={{ backgroundColor: activeFlavorSpec.softBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-[2rem] p-8 sm:p-14 relative overflow-hidden theme-transition border border-black/8 shadow-sm"
            style={{ backgroundColor: activeFlavorSpec.bg }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/85 text-xs font-semibold text-[#1E1B18]">
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Subscribe &amp; Save · {activeFlavorSpec.fullName}
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B18] leading-[1.08]">
                  Keep your fridge effortlessly stocked. Save 15% on every drop.
                </h2>
                <p className="text-base text-[#1E1B18]/85 max-w-xl">
                  Start with <strong className="text-[#1E1B18]">{activeFlavorSpec.fullName}</strong> and get cold-pressed smoothies delivered on your schedule—with complete control over every flavour rotation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {[
                    { icon: Sparkles, text: '15% off every recurring order' },
                    { icon: RefreshCw, text: 'Swap flavours before any delivery' },
                    { icon: ShieldCheck, text: 'Skip, pause, or cancel in one click' },
                    { icon: Truck, text: 'Free chilled express shipping' },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs"
                    >
                      <Icon className="w-4 h-4 text-[#1E1B18] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[#1E1B18]">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleStartSubscription}
                    className="px-7 py-4 rounded-full bg-[#1E1B18] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Start Your Subscription · ${(activeFlavorSpec.twelvePackPrice * 0.85).toFixed(2)}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${activeFlavorSpec.id}`, activeFlavorSpec.id)}
                    className="px-6 py-4 rounded-full bg-white/85 text-[#1E1B18] text-sm font-semibold hover:bg-white transition-colors cursor-pointer"
                  >
                    Customize {activeFlavorSpec.name} Plan
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex items-center justify-center relative min-h-[300px]">
                <div className="absolute w-64 h-64 bg-white/35 liquid-blob" />
                <SpriteCrop
                  sheet={activeFlavorSpec.sheet}
                  box={activeFlavorSpec.items[1]}
                  width={76}
                  className="absolute left-4 top-6 float-gentle"
                />
                <SpriteCrop
                  sheet={activeFlavorSpec.sheet}
                  box={activeFlavorSpec.items[3]}
                  width={74}
                  className="absolute right-4 bottom-6 float-gentle"
                />
                <SpriteCrop
                  sheet={activeFlavorSpec.sheet}
                  box={activeFlavorSpec.items[0]}
                  width={170}
                  className="relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Social Proof & Press */}
      <section
        className="py-20 sm:py-24 theme-transition"
        style={{ backgroundColor: activeFlavorSpec.tintBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* As Seen In Bar */}
          <div className="text-center pb-14 border-b border-black/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5C554E] mb-6">
              As Seen In
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-[#1E1B18]/75">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Bon Appétit</span>
              <span className="text-xl sm:text-2xl font-bold tracking-widest uppercase">Vogue</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Monocle</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Design Milk</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Goop</span>
            </div>
          </div>

          {/* Press Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-14 border-b border-black/10">
            {PRESS_QUOTES.map((item) => (
              <blockquote key={item.outlet} className="space-y-3">
                <p className="text-base sm:text-lg font-medium text-[#1E1B18] leading-relaxed">
                  {item.quote}
                </p>
                <footer className="text-xs font-bold uppercase tracking-wider text-[#5C554E]">
                  — {item.outlet}
                </footer>
              </blockquote>
            ))}
          </div>

          {/* Customer Reviews (Auto-sorted so active slider flavour is featured first) */}
          <div className="pt-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Loved by 18,000+ daily sippers
                </h3>
                <p className="text-xs text-[#5C554E] mt-1">
                  Highlighting verified <strong className="text-[#1E1B18]">{activeFlavorSpec.fullName}</strong> reviews first
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-semibold">
                <Star className="w-4 h-4 fill-[#1E1B18]" />
                <span className="tabular-nums">4.9 / 5.0 average</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sortedTestimonials.map((t) => {
                const f = FLAVORS.find((x) => x.id === t.flavor)!;
                const isFeatured = t.flavor === activeFlavorSpec.id;
                return (
                  <div
                    key={t.name}
                    className={`p-6 rounded-3xl bg-white flex flex-col justify-between gap-4 transition-all duration-300 ${
                      isFeatured ? 'border-2 border-[#1E1B18] shadow-md' : 'border border-black/8'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: t.rating }).map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-3.5 h-3.5 fill-[#1E1B18] text-[#1E1B18]"
                            />
                          ))}
                        </div>
                        {isFeatured && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: f.bg, color: f.ink }}
                          >
                            {f.name} Pick
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#1E1B18] leading-relaxed">“{t.quote}”</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-black/6">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: f.bg, color: f.ink }}
                      >
                        {t.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{t.name}</div>
                        <div className="text-[11px] text-[#5C554E] truncate">{t.role}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter Signup Banner */}
      <section
        className="py-16 sm:py-20 theme-transition"
        style={{ backgroundColor: activeFlavorSpec.softBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden theme-transition border border-black/8"
            style={{ backgroundColor: activeFlavorSpec.bg }}
          >
            <div className="max-w-xl mx-auto relative z-10">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-3 theme-transition"
                style={{ color: activeFlavorSpec.ink }}
              >
                <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Blendy Dispatch · {activeFlavorSpec.fullName}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18] mb-3">
                Get 10% off your first box.
              </h2>
              <p className="text-sm text-[#1E1B18]/85 mb-7">
                Seasonal {activeFlavorSpec.name.toLowerCase()} orchard drops, limited micro-batches, and fresh recipes—no spam, ever.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  disabled={newsletterSubmitted}
                  className="flex-1 px-5 py-3.5 rounded-full bg-white border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                />
                <button
                  type="submit"
                  className={`px-7 py-3.5 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                    newsletterSubmitted
                      ? 'bg-emerald-700 text-white scale-105'
                      : 'bg-[#1E1B18] text-white hover:opacity-90'
                  }`}
                >
                  {newsletterSubmitted ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.8} />
                      <span>BLENDY10 Sent</span>
                    </>
                  ) : (
                    <span>Claim 10% Off</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
