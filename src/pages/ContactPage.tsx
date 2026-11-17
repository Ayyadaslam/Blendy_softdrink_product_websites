import React, { useMemo, useState } from 'react';
import { Check, Clock, Mail, MapPin, Search } from 'lucide-react';
import { FLAVOR_MAP, STOCKISTS } from '../data/blendyData';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { activeFlavorSpec, navigate } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const [cityFilter, setCityFilter] = useState<string>('All');
  const [storeSearch, setStoreSearch] = useState('');

  const cities = ['All', 'New York', 'Los Angeles', 'Austin', 'Chicago'];

  const filteredStockists = useMemo(() => {
    const q = storeSearch.trim().toLowerCase();
    return STOCKISTS.filter((s) => {
      if (cityFilter !== 'All' && s.city !== cityFilter) return false;
      if (q) {
        const hay = `${s.name} ${s.neighborhood} ${s.city} ${s.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cityFilter, storeSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <div
      className="pt-24 pb-24 min-h-screen page-enter theme-transition"
      style={{ backgroundColor: activeFlavorSpec.tintBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Top Contact Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span
              className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold theme-transition"
              style={{
                backgroundColor: activeFlavorSpec.bg,
                color: activeFlavorSpec.ink,
              }}
            >
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1E1B18]">
              Say hello to the Blendy team.
            </h1>
            <p className="text-base text-[#5C554E] leading-relaxed">
              Questions about wholesale coolers, subscription boxes, or orchard partnerships? Drop us a note and we’ll reply within one business day.
            </p>

            <div className="p-6 rounded-3xl bg-white border border-black/8 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1E1B18]" />
                <div>
                  <div className="text-xs text-[#5C554E]">Direct Email</div>
                  <a
                    href="mailto:hello@drinkblendy.com"
                    className="text-sm font-bold text-[#1E1B18] underline underline-offset-4"
                  >
                    hello@drinkblendy.com
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-black/8 flex items-center gap-5 text-xs font-semibold text-[#1E1B18]">
                <a href="#instagram" onClick={(e) => e.preventDefault()} className="hover:opacity-65">
                  Instagram
                </a>
                <a href="#tiktok" onClick={(e) => e.preventDefault()} className="hover:opacity-65">
                  TikTok
                </a>
                <a href="#pinterest" onClick={(e) => e.preventDefault()} className="hover:opacity-65">
                  Pinterest
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-7 sm:p-10 rounded-3xl bg-white border border-black/8">
            {sent ? (
              <div className="py-10 text-center space-y-4">
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                  style={{ backgroundColor: activeFlavorSpec.bg }}
                >
                  <Check className="w-6 h-6 text-[#1E1B18]" />
                </div>
                <h2 className="text-2xl font-bold">Message received!</h2>
                <p className="text-sm text-[#5C554E] max-w-sm mx-auto">
                  Thanks for reaching out, {name || 'friend'}. Our customer care crew will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="px-6 py-3 rounded-full bg-[#1E1B18] text-white text-xs font-semibold cursor-pointer"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c-name" className="block text-xs font-semibold mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                    />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="block text-xs font-semibold mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="c-msg" className="block text-xs font-semibold mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="c-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#1E1B18] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Searchable Stockists Finder */}
        <section className="pt-14 border-t border-black/10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1E1B18]">
                Find Blendy in Store
              </h2>
              <p className="text-sm text-[#5C554E] mt-1">
                Stocked chilled daily at select grocers and botanical markets.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#5C554E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search city or neighborhood..."
                aria-label="Search stockists"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setCityFilter(city)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  cityFilter === city
                    ? 'bg-[#1E1B18] text-white'
                    : 'bg-white border border-black/10 text-[#5C554E] hover:text-[#1E1B18]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStockists.map((store) => (
              <div
                key={store.id}
                className="p-6 rounded-3xl bg-white border border-black/8 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#5C554E]">
                    <span>{store.city}</span>
                    <span>{store.neighborhood}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1E1B18]">{store.name}</h3>
                  <div className="flex items-start gap-2 text-xs text-[#5C554E]">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5C554E]">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/8 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#5C554E]">Flavours chilled:</span>
                  <div className="flex items-center gap-1.5">
                    {store.flavorsInStock.map((fid) => (
                      <button
                        key={fid}
                        type="button"
                        onClick={() => navigate(`/product/${fid}`, fid)}
                        title={FLAVOR_MAP[fid].fullName}
                        aria-label={`View ${FLAVOR_MAP[fid].fullName}`}
                        className="w-4 h-4 rounded-full border border-black/10 cursor-pointer"
                        style={{ backgroundColor: FLAVOR_MAP[fid].bg }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
