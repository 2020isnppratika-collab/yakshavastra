import React from "react";
import { Link } from "react-router-dom";
import { Crown, MapPin, Phone, Mail, ShieldCheck, RefreshCw, Sparkles, ExternalLink, MessageCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-amber-800/40 mt-20">
      {/* Trust Highlights */}
      <div className="border-b border-stone-800 bg-stone-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-left">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2.5 sm:p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-amber-200">Authentic Coastal Artistry</h4>
                <p className="text-[11px] sm:text-xs text-stone-400">Master-crafted Shivani wood crowns, gold foil & Badagu/Tenku grade</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2.5 sm:p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-amber-200">100% Refundable Deposit</h4>
                <p className="text-[11px] sm:text-xs text-stone-400">Security deposit held safely & refunded within 24 hours of return inspection</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2.5 sm:p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-amber-200">Zero Double-Booking Guarantee</h4>
                <p className="text-[11px] sm:text-xs text-stone-400">Real-time availability locks + automatic cleaning buffer gaps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="font-serif text-xl font-bold text-amber-200">
                {lang === "kn" ? "ಯಕ್ಷಕೇಸರಿ" : "YakshaKesari"}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dedicated to preserving and powering Yakshagana traditional theatre troupes across Bengaluru, Udupi, and Dakshina Kannada with premium rental sets.
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>ಕಲಾಮಾತೆಯ ಸೇವೆಯಲ್ಲಿ ಸದಾ ಸನ್ನದ್ಧ</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-amber-200 text-sm uppercase tracking-wider mb-4">Costume Categories</h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/costumes?category=full_set" className="hover:text-amber-300">Raja Vesha Sets (ರಾಜ ವೇಷ)</Link></li>
              <li><Link to="/costumes?category=full_set" className="hover:text-amber-300">Rakshasa & Bannada (ರಾಕ್ಷಸ ವೇಷ)</Link></li>
              <li><Link to="/costumes?category=full_set" className="hover:text-amber-300">Stree Vesha Saree Sets (ಸ್ತ್ರೀ ವೇಷ)</Link></li>
              <li><Link to="/costumes?category=crown" className="hover:text-amber-300">Kireeta & Mundasu Headgear</Link></li>
              <li><Link to="/costumes?category=ornament" className="hover:text-amber-300">Carved Bhujakeerthi & Ornaments</Link></li>
              <li><Link to="/contact" className="hover:text-amber-300 text-amber-400 font-semibold">Contact & Enquiry Page &rarr;</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-amber-200 text-sm uppercase tracking-wider mb-4">Store Location & Maps</h5>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 block text-xs">Yakshakesari Yakshagana Costumes</strong>
                  <span>5th Main Rd, Marathahalli Village, Marathahalli, Bengaluru, Karnataka 560037</span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="https://maps.app.goo.gl/xCEzwpuNuxr6HnR18?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-amber-200 text-sm uppercase tracking-wider mb-4">Contact & Helpline</h5>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:8073377289" className="text-amber-200 hover:text-amber-300 font-bold text-sm tracking-wide">
                  +91 80733 77289
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href="https://wa.me/918073377289?text=Namaskara%20YakshaKesari,%20I%20am%20inquiring%20about%20costume%20rentals."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline font-semibold"
                >
                  WhatsApp Direct Chat
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>contact@yakshakesari.com</span>
              </li>
              <li className="pt-1">
                <Link
                  to="/contact"
                  className="inline-block text-amber-300 hover:underline text-xs font-semibold"
                >
                  Visit Contact Us Page &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 YakshaKesari Heritage Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-stone-400">Preserving Coastal Karnataka Theatre Heritage &bull; ಕರಾವಳಿಯ ಯಕ್ಷಗಾನ ಪರಂಪರೆ</p>
        </div>
      </div>
    </footer>
  );
};
