import React from "react";
import { Link } from "react-router-dom";
import { Crown, MapPin, Phone, Mail, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-amber-800/40 mt-20">
      {/* Trust Highlights */}
      <div className="border-b border-stone-800 bg-stone-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-200">Authentic Coastal Artistry</h4>
                <p className="text-xs text-stone-400">Master-crafted Shivani wood crowns, gold foil foil & Badagu/Tenku grade</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-200">100% Refundable Deposit</h4>
                <p className="text-xs text-stone-400">Security deposit held safely & refunded within 24 hours of return inspection</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-200">Zero Double-Booking Guarantee</h4>
                <p className="text-xs text-stone-400">Real-time availability locks + automatic cleaning buffer gaps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="font-serif text-xl font-bold text-amber-200">YakshaVastra</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dedicated to preserving and powering Yakshagana traditional theatre troupes across Udupi, Dakshina Kannada, Uttara Kannada, and Bengaluru with premium rental sets.
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
              <li><Link to="/costumes?category=weapon" className="hover:text-amber-300">Weapons: Gada, Dhanus & Swords</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-amber-200 text-sm uppercase tracking-wider mb-4">Rental Hubs & Pickup</h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Udupi Main Hub:</strong> Car Street, Near Sri Krishna Temple, Udupi - 576101</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Mangaluru Hub:</strong> Kadri Temple Road, Mangaluru - 575002</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Bengaluru Centre:</strong> Malleshwaram 8th Cross, Bengaluru - 560003</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-amber-200 text-sm uppercase tracking-wider mb-4">Troupe Helpline</h5>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+91 98800 12345 / 99001 54321</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>bookings@yakshavastra.org</span>
              </li>
              <li className="pt-2">
                <div className="p-3 bg-red-950/60 border border-amber-600/30 rounded-lg text-amber-200 text-xs">
                  <strong>Client Demo Mode:</strong> Test Razorpay checkout & Mock sandbox payments active.
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 YakshaVastra Heritage Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-stone-400">Preserving Coastal Karnataka Theatre Heritage &bull; ಕರಾವಳಿಯ ಯಕ್ಷಗಾನ ಪರಂಪರೆ</p>
        </div>
      </div>
    </footer>
  );
};
