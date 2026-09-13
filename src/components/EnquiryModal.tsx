import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, Send, ArrowUpRight } from 'lucide-react';
import { projectData, WHATSAPP_NUMBER } from '../data/projectData';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: {
    type?: string;
    size?: string;
  };
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, prefill }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [apartmentType, setApartmentType] = useState('Studio');
  const [preferredSize, setPreferredSize] = useState('337 sq ft');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sizeOptions = [
    '337 sq ft',
    '372 sq ft',
    '416 sq ft',
    '436 sq ft',
    '474 sq ft',
    '587 sq ft',
    '669 sq ft',
    '690 sq ft',
    '773 sq ft',
    '1040 sq ft',
  ];

  // Update prefill values when opened with specific selection
  useEffect(() => {
    if (prefill?.type) setApartmentType(prefill.type);
    if (prefill?.size) setPreferredSize(prefill.size);
  }, [prefill, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!phone.trim()) errs.phone = 'Contact phone number is required';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Direct WhatsApp message formatting
    const formattedText = encodeURIComponent(
      `Hello, I would like to request official project information regarding AMEER HEIGHTS TOWER 10 (Main BZU Chowk, Multan).\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      (email ? `Email: ${email}\n` : '') +
      `Apartment Type: ${apartmentType}\n` +
      `Preferred Size: ${preferredSize}\n` +
      (message ? `Note: ${message}\n` : '')
    );

    // If real WhatsApp number is configured, open WhatsApp in new tab
    if (WHATSAPP_NUMBER && WHATSAPP_NUMBER !== '923000000000') {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${formattedText}`, '_blank');
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      id="enquiry-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#111315]/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[#181B1D] border border-[#B59A6A]/40 shadow-2xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#8C8C87] hover:text-[#FAF9F6] transition-colors focus:outline-none"
          aria-label="Close enquiry modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="border-b border-[#242526] pb-6 mb-8">
              <span className="font-mono text-xs text-[#B59A6A] tracking-[0.22em] uppercase block mb-1">
                Project Consultation
              </span>
              <h3 id="enquiry-modal-title" className="font-serif text-2xl sm:text-3xl text-[#FAF9F6] uppercase tracking-wide">
                Enquire On Ameer Heights
              </h3>
              <p className="text-xs text-[#8C8C87] mt-1 font-mono">
                Selling Rate: PKR 15,000 / SQ FT · Main BZU Chowk, Multan
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#D8D3CA] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-4 py-3 bg-[#111315] border border-[#242526] focus:border-[#B59A6A] text-sm text-[#FAF9F6] placeholder-[#8C8C87]/50 focus:outline-none transition-colors"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1 font-mono">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#D8D3CA] mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 bg-[#111315] border border-[#242526] focus:border-[#B59A6A] text-sm text-[#FAF9F6] placeholder-[#8C8C87]/50 focus:outline-none transition-colors"
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1 font-mono">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#D8D3CA] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-[#111315] border border-[#242526] focus:border-[#B59A6A] text-sm text-[#FAF9F6] placeholder-[#8C8C87]/50 focus:outline-none transition-colors"
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1 font-mono">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#D8D3CA] mb-1.5">
                    Apartment Type
                  </label>
                  <select
                    value={apartmentType}
                    onChange={(e) => setApartmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111315] border border-[#242526] focus:border-[#B59A6A] text-sm text-[#FAF9F6] focus:outline-none transition-colors"
                  >
                    <option value="Studio">Studio</option>
                    <option value="1 Bedroom">1 Bedroom</option>
                    <option value="2 Bedroom">2 Bedroom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#D8D3CA] mb-1.5">
                    Preferred Size
                  </label>
                  <select
                    value={preferredSize}
                    onChange={(e) => setPreferredSize(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111315] border border-[#242526] focus:border-[#B59A6A] text-sm text-[#FAF9F6] focus:outline-none transition-colors"
                  >
                    {sizeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#D8D3CA] mb-1.5">
                  Message / Special Enquiries
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inquire regarding floor allocation, unit availability, or scheduling a site visit..."
                  className="w-full px-4 py-3 bg-[#111315] border border-[#242526] focus:border-[#B59A6A] text-sm text-[#FAF9F6] placeholder-[#8C8C87]/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 text-xs font-mono uppercase tracking-[0.2em] text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <span>Request Information</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] font-mono text-[#8C8C87] text-center">
                Your contact details are used exclusively for official project communication.
              </p>
            </form>
          </div>
        ) : (
          <div className="py-12 text-center space-y-6">
            <div className="w-14 h-14 border border-[#B59A6A] flex items-center justify-center mx-auto text-[#B59A6A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl uppercase tracking-wider text-[#FAF9F6]">
                Enquiry Recorded
              </h3>
              <p className="text-sm text-[#8C8C87] font-light max-w-md mx-auto">
                Thank you, <span className="text-[#FAF9F6] font-medium">{name}</span>. Your interest in <span className="text-[#B59A6A]">{apartmentType} ({preferredSize})</span> has been received. Our project advisory team will reach out via <span className="text-[#FAF9F6]">{phone}</span> shortly.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-[#111315] bg-[#F3F0E9] hover:bg-[#B59A6A] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
