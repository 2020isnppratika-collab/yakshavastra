import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Crown,
  Search,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Zap
} from "lucide-react";
import { Costume, CategoryInfo } from "../types";
import { api } from "../api/client";
import { CostumeCard } from "../components/CostumeCard";
import { useLanguage } from "../context/LanguageContext";

export const Home: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredCostumes, setFeaturedCostumes] = useState<Costume[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickDate, setQuickDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.costumes.list({ limit: 6, sort: "popular" }),
      api.costumes.getCategories(),
    ])
      .then(([costumesRes, catRes]) => {
        setFeaturedCostumes(costumesRes.items || []);
        setCategories(catRes.categories || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery.trim());
    if (quickDate) {
      params.append("available_from", quickDate);
      params.append("available_to", quickDate);
    }
    navigate(`/costumes?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section with Cultural Yakshagana Backdrop */}
      <section className="relative min-h-[580px] bg-gradient-to-br from-[#7F1D1D] via-[#5A1212] to-stone-950 text-white flex items-center overflow-hidden border-b border-amber-500/30">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "kn" ? "ಕರ್ನಾಟಕದ ಹೆಮ್ಮೆಯ ರಂಗ ಪರಂಪರೆ" : "Coastal Karnataka Traditional Theatre Rentals"}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-amber-100 leading-[1.15]">
              {t("hero_title")}
            </h1>

            <p className="text-base sm:text-lg text-amber-100/80 leading-relaxed font-sans max-w-2xl">
              {t("hero_subtitle")}
            </p>

            {/* Quick Search & Availability Box */}
            <form
              onSubmit={handleQuickSearch}
              className="mt-8 bg-stone-900/90 border border-amber-500/40 p-3 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-800 text-amber-50 placeholder-stone-400 text-sm rounded-xl border border-stone-700 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="relative sm:w-56">
                <Calendar className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-800 text-amber-50 text-sm rounded-xl border border-stone-700 focus:border-amber-400 focus:outline-none"
                  title="Check specific date"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-red-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0"
              >
                <span>{t("cta_browse")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-amber-200/80">
              <span className="font-semibold text-amber-300">Popular:</span>
              {["Raja Vesha", "Ravana", "Damayanthi", "Hanuman", "Kireeta", "Bhujakeerthi"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/costumes?q=${tag}`)}
                  className="px-2.5 py-1 rounded-full bg-red-950/60 border border-amber-600/30 hover:border-amber-400 text-amber-200 text-xs transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            {lang === "kn" ? "ವೇಷಭೂಷಣ ವಿಭಾಗಗಳು" : "Browse by Category"}
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Select a complete character ensemble or individual stage props and ornaments.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories
            .filter((c) => c.id !== "all")
            .map((cat) => (
              <Link
                key={cat.id}
                to={`/costumes?category=${cat.id}`}
                className="group bg-white p-5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-red-900 group-hover:bg-red-900 group-hover:text-amber-200 transition-colors">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-900 group-hover:text-red-900 transition-colors">
                    {cat.label}
                  </h4>
                  <span className="text-xs text-stone-400 block mt-0.5">{cat.count} items</span>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Featured Costumes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
              Handcrafted Stage Sets
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Featured Yakshagana Costumes
            </h2>
          </div>
          <Link
            to="/costumes"
            className="text-sm font-semibold text-red-900 hover:text-red-700 flex items-center space-x-1 shrink-0"
          >
            <span>View All ({categories[0]?.count || 36}+ items)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCostumes.map((costume) => (
              <CostumeCard key={costume.id} costume={costume} />
            ))}
          </div>
        )}
      </section>

      {/* How Rental Works Section */}
      <section className="bg-gradient-to-b from-stone-900 to-stone-950 text-white py-16 border-y border-amber-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              Simple 4-Step Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mt-1">
              How YakshaVastra Works
            </h2>
            <p className="text-sm text-stone-400 mt-2">
              Engineered specifically for troupe directors, school organizers, and Yakshagana artists.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 relative">
              <div className="w-10 h-10 rounded-full bg-red-900 text-amber-300 font-bold flex items-center justify-center mb-4 text-base border border-amber-400/30">
                1
              </div>
              <h3 className="font-semibold text-base text-amber-200">1. Browse & Select Costume</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Choose character sets: Raja, Rakshasa, Stree, Hanuman, or individual crowns and ornaments.
              </p>
            </div>

            <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 relative">
              <div className="w-10 h-10 rounded-full bg-red-900 text-amber-300 font-bold flex items-center justify-center mb-4 text-base border border-amber-400/30">
                2
              </div>
              <h3 className="font-semibold text-base text-amber-200">2. Live Slot Availability</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Check dates and time slots (Morning, Evening, or Night show). Instant availability check prevents double-booking.
              </p>
            </div>

            <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 relative">
              <div className="w-10 h-10 rounded-full bg-red-900 text-amber-300 font-bold flex items-center justify-center mb-4 text-base border border-amber-400/30">
                3
              </div>
              <h3 className="font-semibold text-base text-amber-200">3. Secure Checkout</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Provide event details. Pay securely with Razorpay test mode or instant mock payment sandbox.
              </p>
            </div>

            <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 relative">
              <div className="w-10 h-10 rounded-full bg-red-900 text-amber-300 font-bold flex items-center justify-center mb-4 text-base border border-amber-400/30">
                4
              </div>
              <h3 className="font-semibold text-base text-amber-200">4. Pickup & Refund</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Collect from Udupi, Mangaluru, or Bengaluru hub. Security deposit refunded within 24 hours of return.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Heritage Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 rounded-3xl p-8 sm:p-12 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-900 text-amber-200 text-xs font-semibold">
              <Crown className="w-3.5 h-3.5" />
              <span>Badagu & Tenku Thittu Heritage</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-red-950">
              Need Costumes for an Entire Troupe or Play?
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              We specialize in full Prasanga sets (Devi Mahatme, Sudhanva Kalaga, Keechaka Vadhe, etc.). Get bundled character costumes with matching accessories.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/costumes?category=full_set"
                className="px-6 py-3 rounded-xl bg-red-900 text-amber-100 font-bold text-xs uppercase tracking-wider hover:bg-red-800 transition-colors shadow-md"
              >
                Browse Full Sets
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 rounded-xl bg-white text-stone-800 border border-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-stone-900">
            <img
              src="/images/costumes/hero_banner.jpg"
              alt="Yakshagana Heritage Performance"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
