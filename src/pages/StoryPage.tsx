import React from 'react';
import { ArrowRight, Droplets, Leaf, Recycle } from 'lucide-react';
import { EDITORIAL_IMAGES } from '../data/blendyData';
import { useStore } from '../context/StoreContext';

export const StoryPage: React.FC = () => {
  const { activeFlavorSpec, navigate } = useStore();

  return (
    <div
      className="pt-16 min-h-screen page-enter theme-transition"
      style={{ backgroundColor: activeFlavorSpec.tintBg }}
    >
      {/* Immersive Full-Width Hero */}
      <section className="relative h-[70vh] min-h-[460px] flex items-end overflow-hidden">
        <img
          src={EDITORIAL_IMAGES.blendingHero}
          alt="Vibrant pastel fruit smoothie swirling in a glass vortex surrounded by berries, kiwi, and banana"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 text-white">
          <span
            className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold mb-4 text-[#1E1B18]"
            style={{ backgroundColor: activeFlavorSpec.bg }}
          >
            Our Story
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.06]">
            Born in an orchard, cold-pressed for everyday joy.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/85 max-w-xl">
            We set out to replace syrupy, heat-cooked smoothies with something alive, bright, and unmistakably real.
          </p>
        </div>
      </section>

      {/* Scrollytelling Alternating Editorial Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-24">
        {/* Chapter 01 */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-md">
            <img
              src={EDITORIAL_IMAGES.orchardSourcing}
              alt="Farmers sorting freshly harvested strawberries, blackberries, and bananas at sunrise"
              loading="lazy"
              className="w-full h-[380px] sm:h-[440px] object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5C554E]">
              <Leaf className="w-4 h-4" />
              <span>01. Direct-Trade Orchards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              Picked at peak sweetness—never unripe for freight.
            </h2>
            <p className="text-base text-[#5C554E] leading-relaxed">
              Commercial juice brands buy bruised, under-ripe fruit and mask the flatness with cane syrup or natural flavourings. Blendy works directly with regenerative berry, kiwi, and banana growers so every harvest hits the press within 24 hours of picking.
            </p>
          </div>
        </article>

        {/* Chapter 02 */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 lg:order-2 rounded-3xl overflow-hidden shadow-md">
            <img
              src={EDITORIAL_IMAGES.splashStory}
              alt="Whole berries, kiwi slices, and banana coins splashing into chilled puree"
              loading="lazy"
              className="w-full h-[420px] sm:h-[480px] object-cover"
            />
          </div>
          <div className="lg:col-span-6 lg:order-1 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5C554E]">
              <Droplets className="w-4 h-4" />
              <span>02. Cold-Pressed &amp; High-Pressure Chilled</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              Zero heat, zero concentrates, 100% vibrant colour.
            </h2>
            <p className="text-base text-[#5C554E] leading-relaxed">
              Instead of boiling away vitamin C and aroma, we use gentle cold high-pressure processing (HPP). That keeps the lilac of wild blackberries, the emerald snap of Hayward kiwi, and the creamy texture of ripe Cavendish banana intact.
            </p>
          </div>
        </article>

        {/* Chapter 03 */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-md">
            <img
              src={EDITORIAL_IMAGES.pourGlass}
              alt="Thick cold-pressed berry smoothie poured into a chilled glass"
              loading="lazy"
              className="w-full h-[380px] sm:h-[440px] object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5C554E]">
              <Recycle className="w-4 h-4" />
              <span>03. Glass-First Sustainability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1B18]">
              Plastic-free bottles and carbon-neutral chilled routes.
            </h2>
            <p className="text-base text-[#5C554E] leading-relaxed">
              Every Blendy bottle is infinitely recyclable glass sealed with plant-based inks and shipped in curbside-compostable thermal liners. Taste the fruit, leave zero plastic behind.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1E1B18] text-white text-sm font-semibold hover:opacity-90 cursor-pointer"
              >
                <span>Shop All Flavours</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
