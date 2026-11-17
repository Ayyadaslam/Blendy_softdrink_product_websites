import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const RegisterModal: React.FC = () => {
  const { isRegisterOpen, setIsRegisterOpen, activeFlavorSpec } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isRegisterOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  const close = () => {
    setIsRegisterOpen(false);
    setSubmitted(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Blendy Club Registration"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={close} />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#FDFBF7] p-8 shadow-2xl border border-black/8">
        <button
          type="button"
          onClick={close}
          aria-label="Close registration modal"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: activeFlavorSpec.bg }}
            >
              <Check className="w-6 h-6 text-[#1E1B18]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to Blendy Club</h3>
            <p className="text-sm text-[#5C554E] mb-6">
              Your member code <strong className="text-[#1E1B18]">BLENDY10</strong> is ready for 10% off your first box.
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full py-3 rounded-full bg-[#1E1B18] text-white text-sm font-semibold cursor-pointer"
            >
              Start Sipping
            </button>
          </div>
        ) : (
          <>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{
                backgroundColor: activeFlavorSpec.softBg,
                color: activeFlavorSpec.ink,
              }}
            >
              Blendy Club Member Perks
            </span>
            <h3 className="text-2xl font-bold tracking-tight mb-1.5">
              Create your Blendy account
            </h3>
            <p className="text-sm text-[#5C554E] mb-6">
              Manage flavour rotations, skip deliveries anytime, and unlock 10% off your first box.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold mb-1.5">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maya Lin"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold mb-1.5">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-black/12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#1E1B18] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Join Blendy Club
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
