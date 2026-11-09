import React, { useState } from "react";
import { MapPin, Phone, MessageCircle, Mail, Clock, ExternalLink, Send, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Contact: React.FC = () => {
  const { lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    troupe: "",
    eventDate: "",
    message: ""
  });

  const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/xCEzwpuNuxr6HnR18?g_st=ic";
  const PHONE_NUMBER = "8073377289";
  const FORMATTED_PHONE = "+91 80733 77289";
  const ADDRESS = "Yakshakesari Yakshagana Costumes, 5th Main Rd, Marathahalli Village, Marathahalli, Bengaluru, Karnataka 560037";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-900/10 text-red-900 border border-red-900/20 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-600" />
          <span>{lang === "kn" ? "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ" : "Get In Touch"}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900">
          {lang === "kn" ? "ಯಕ್ಷಕೇಸರಿ ವೇಷಭೂಷಣ ಕೇಂದ್ರ" : "YakshaKesari Costume Hub"}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {lang === "kn"
            ? "ಯಕ್ಷಗಾನ ಪ್ರಸಂಗಗಳಿಗೆ ಬೇಕಾದ ಎಲ್ಲಾ ಬಗೆಯ ಬಡಗು ಮತ್ತು ತೆಂಕುತಿಟ್ಟಿನ ವೇಷಭೂಷಣಗಳು, ಕಿರೀಟಗಳು, ಭುಜಕೀರ್ತಿಗಳ ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆಗೆ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ."
            : "Reserve complete traditional Badagu & Tenku thittu costumes, master-crafted wooden Kireetas, breastplates, and stage accessories directly from our Bengaluru store."}
        </p>
      </div>

      {/* Main Grid: Location / Contact Cards + Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info & Google Maps Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Action Banner */}
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-600/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>{lang === "kn" ? "ನೇರ ಸಂಪರ್ಕ" : "Direct Troupe Hotline"}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
                {lang === "kn" ? "ಯಾವುದೇ ವಿಚಾರಣೆಗೆ ಕರೆ ಮಾಡಿ" : "Call or Visit Our Workshop"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                {lang === "kn"
                  ? "ವೇಷಗಳ ಆಯ್ಕೆ, ದಿನಾಂಕಗಳ ಲಭ್ಯತೆ ಮತ್ತು ವಿಶೇಷ ಪ್ಯಾಕೇಜ್‌ಗಳಿಗಾಗಿ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
                  : "Check costume availability, custom troupe packages, or pick up your reserved sets in person."}
              </p>

              {/* Direct Buttons: Call, WhatsApp, Google Maps */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-red-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {FORMATTED_PHONE}</span>
                </a>

                <a
                  href={`https://wa.me/91${PHONE_NUMBER}?text=Namaskara%20YakshaKesari,%20I%20am%20inquiring%20about%20costume%20rentals.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                </a>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-800" />
              <span>{lang === "kn" ? "ವಿಳಾಸ ಮತ್ತು ಮಾಹಿತಿ" : "Location & Contact Information"}</span>
            </h3>

            <div className="space-y-4 text-sm text-stone-700">
              {/* Address */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <MapPin className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-sm">
                    {lang === "kn" ? "ಮುಖ್ಯ ಕೇಂದ್ರ / ಮಳಿಗೆ ವಿಳಾಸ:" : "Main Store & Workshop Location:"}
                  </p>
                  <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                    {ADDRESS}
                  </p>
                  <div className="pt-2">
                    <a
                      href={GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-800 hover:text-red-900 underline underline-offset-4"
                    >
                      <span>📍 {lang === "kn" ? "ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ" : "Open in Google Maps Application"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center space-x-2 text-stone-500 text-xs font-medium">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span>{lang === "kn" ? "ದೂರವಾಣಿ ಸಂಖ್ಯೆ" : "Phone Number"}</span>
                  </div>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="block font-bold text-stone-900 text-base hover:text-red-800"
                  >
                    {FORMATTED_PHONE}
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center space-x-2 text-stone-500 text-xs font-medium">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{lang === "kn" ? "ಕಾರ್ಯಾಚರಣೆಯ ಸಮಯ" : "Working Hours"}</span>
                  </div>
                  <p className="font-bold text-stone-900 text-sm">
                    9:00 AM – 9:00 PM <span className="text-xs font-normal text-stone-500">(All 7 Days)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troupe Enquiry Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {lang === "kn" ? "ವೇಷ ವಿಚಾರಣೆ ಅರ್ಜಿ" : "Troupe Booking Enquiry"}
            </h3>
            <p className="text-xs text-stone-500">
              {lang === "kn"
                ? "ನಿಮ್ಮ ಪ್ರಸಂಗದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ, ನಾವು ತಕ್ಷಣ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ."
                : "Send your performance requirements and our team will get back to you immediately."}
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="font-bold text-green-900 text-base">
                {lang === "kn" ? "ವಿಚಾರಣೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ!" : "Enquiry Received!"}
              </h4>
              <p className="text-xs text-green-800 leading-relaxed">
                {lang === "kn"
                  ? `ಧನ್ಯವಾದಗಳು! ನಮ್ಮ ಯಕ್ಷಕೇಸರಿ ತಂಡವು ${formData.phone || FORMATTED_PHONE} ಸಂಖ್ಯೆಗೆ ಶೀಘ್ರದಲ್ಲೇ ಕರೆ ಮಾಡಲಿದೆ.`
                  : `Thank you! Our YakshaKesari team will contact you shortly at ${formData.phone || FORMATTED_PHONE}.`}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs font-bold text-green-800 underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === "kn" ? "ನಿಮ್ಮ ಹೆಸರು *" : "Your Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagaraj Bhat"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === "kn" ? "ಸಂಪರ್ಕ ದೂರವಾಣಿ ಸಂಖ್ಯೆ *" : "Contact Phone Number *"}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 8073377289"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none text-stone-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === "kn" ? "ಮೇಳ / ತಂಡದ ಹೆಸರು" : "Mela / Troupe Name"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saligrama Mela"
                    value={formData.troupe}
                    onChange={(e) => setFormData({ ...formData, troupe: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === "kn" ? "ಪ್ರದರ್ಶನ ದಿನಾಂಕ" : "Performance Date"}
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === "kn" ? "ಪಾತ್ರಗಳು / ವೇಷಗಳ ಅಗತ್ಯತೆ" : "Required Costumes / Notes"}
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Need 2 Raja Vesha (Arjuna, Karna), 1 Stree Vesha, and 1 Hanuman costume set."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none text-stone-900 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === "kn" ? "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" : "Submit Rental Enquiry"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
