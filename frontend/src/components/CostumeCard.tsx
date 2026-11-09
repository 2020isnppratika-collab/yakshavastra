import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, ShieldCheck, ChevronRight } from "lucide-react";
import { Costume } from "../types";
import { formatCurrency } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";

interface CostumeCardProps {
  costume: Costume;
}

const characterColors: Record<string, string> = {
  raja: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  rakshasa: "bg-red-950/80 text-red-200 border-red-700/60",
  bannada: "bg-purple-900/60 text-purple-200 border-purple-600/40",
  stree: "bg-rose-900/60 text-rose-200 border-rose-600/40",
  hanuman: "bg-orange-950/80 text-orange-200 border-orange-600/40",
  rishi: "bg-amber-900/60 text-amber-200 border-amber-600/40",
  comic: "bg-emerald-950/80 text-emerald-200 border-emerald-600/40",
  general: "bg-stone-800 text-stone-300 border-stone-600/40",
};

export const CostumeCard: React.FC<CostumeCardProps> = ({ costume }) => {
  const { lang } = useLanguage();
  const image = costume.images && costume.images.length > 0
    ? costume.images[0]
    : "/images/costumes/raja_arjuna_1.jpg";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-stone-200 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image container with badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
        <img
          src={image}
          alt={costume.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-80" />

        {/* Character Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${
              characterColors[costume.character_type] || characterColors.general
            }`}
          >
            {costume.character_type}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/60 text-amber-200 border border-white/20 backdrop-blur-md">
            {costume.category.replace("_", " ")}
          </span>
        </div>

        {/* Stock status indicator */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-sm">
            {costume.total_units > 1 ? `${costume.total_units} units` : "1 exclusive set"}
          </span>
        </div>

        {/* Kannada title overlay if present */}
        {costume.kannada_name && (
          <div className="absolute bottom-3 left-3 right-3 text-amber-200 text-sm font-medium drop-shadow truncate">
            {costume.kannada_name}
          </div>
        )}
      </div>

      {/* Details body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-red-900 transition-colors line-clamp-1">
              {costume.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {costume.description}
          </p>

          {/* Includes preview */}
          {costume.includes && costume.includes.length > 0 && (
            <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-stone-600 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Includes: {costume.includes.slice(0, 3).join(", ")}</span>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-xs text-stone-400 block">Rental rate</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-red-900 font-serif">
                  {formatCurrency(costume.price_per_day)}
                </span>
                <span className="text-xs text-stone-500">/ day</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">Security Deposit</span>
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 inline-block">
                {formatCurrency(costume.security_deposit)}
              </span>
            </div>
          </div>

          <Link
            to={`/costumes/${costume.id}`}
            className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-900 to-red-800 text-amber-100 font-semibold text-xs tracking-wider uppercase hover:from-red-800 hover:to-red-700 transition-all shadow-md group-hover:shadow-lg"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Check Dates & Rent</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
          </Link>
        </div>
      </div>
    </div>
  );
};
