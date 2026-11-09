import React from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, MapPin, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const About: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Intro */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-900 text-amber-200 text-xs font-semibold">
          <Crown className="w-3.5 h-3.5" />
          <span>Coastal Karnataka Theatre Heritage</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 leading-tight">
          The Sacred Splendour of Yakshagana Costumes
        </h1>

        <p className="text-base text-stone-600 leading-relaxed font-sans">
          Yakshagana (ಯಕ್ಷಗಾನ) is an ancient, vibrant theatrical dance-drama from coastal Karnataka. Its visual soul lies in its towering wooden Kireetas, gleaming golden Bhujakeerthis, intricate Chutti makeup, and kaleidoscopic pleated flared skirts.
        </p>
      </div>

      {/* Two Major Traditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Northern Coastal Tradition
          </span>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Badagu-thittu (ಬಡಗುತಿಟ್ಟು)
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Prevalent across Udupi, Kundapura, and Uttara Kannada. Known for its towering circular wooden crowns, elaborate gold foil leaf ornaments, heavy waist daabus, and magnificent high-energy turns and jumps on stage.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
            Featured in our catalogue: Arjuna, Dasharatha, Ravana Asura sets.
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Southern Coastal Tradition
          </span>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Tenku-thittu (ತೆಂಕುತಿಟ್ಟು)
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Flourishes across Dakshina Kannada, Mangaluru, and Kasaragod. Characterized by pre-formed Pagadi / Mundasu headgear, radiant aureoles for heroes like Karna, and continuous high-speed knee spins and percussive rhythm.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
            Featured in our catalogue: Karna Sun Crest set, Mahishasura horned sets, Pagadis.
          </div>
        </div>
      </div>

      {/* Craftsmanship Section */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-12 border border-amber-800/40 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Artisanal Excellence
          </span>
          <h2 className="font-serif text-3xl font-bold text-amber-100">
            Handcrafted with Sacred Heritage
          </h2>
          <p className="text-sm text-stone-400">
            Every piece in our inventory is made by traditional master craftsmen in Udupi and Kundapura using indigenous materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-300">
          <div className="bg-stone-800/60 p-5 rounded-2xl border border-stone-700 space-y-2">
            <h4 className="font-bold text-sm text-amber-300">Shivani Wood Carving</h4>
            <p>
              Lightweight, fragrant Shivani wood is meticulously carved by hand so performers can leap freely for hours without neck strain.
            </p>
          </div>

          <div className="bg-stone-800/60 p-5 rounded-2xl border border-stone-700 space-y-2">
            <h4 className="font-bold text-sm text-amber-300">Pure Gold Leaf & Glass Mirror</h4>
            <p>
              Traditional brass and gold foil leaf are inlaid with hand-cut mirror glass that catches stage oil lamps and spotlights dynamically.
            </p>
          </div>

          <div className="bg-stone-800/60 p-5 rounded-2xl border border-stone-700 space-y-2">
            <h4 className="font-bold text-sm text-amber-300">Rigorous Cleaning & Repair</h4>
            <p>
              Every costume undergoes strict sanitization, dry cleaning, and ornament inspection during its mandatory buffer day gap between bookings.
            </p>
          </div>
        </div>
      </div>

      {/* Store Location Banner */}
      <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Visit Our Store & Workshop
          </span>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Yakshakesari Yakshagana Costumes
          </h3>
          <p className="text-xs text-stone-600 max-w-xl">
            5th Main Rd, Marathahalli Village, Marathahalli, Bengaluru, Karnataka 560037 &bull; Helpline: +91 80733 77289
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://maps.app.goo.gl/xCEzwpuNuxr6HnR18?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center space-x-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Google Maps</span>
          </a>
          <Link
            to="/contact"
            className="px-5 py-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Contact Details
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/costumes"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
        >
          <span>Explore Costumes Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
