import React from "react";
import { Sun, Sunset, Moon, Calendar, Sparkles } from "lucide-react";
import { SlotType, Costume } from "../types";
import { formatCurrency } from "../lib/utils";

interface SlotPickerProps {
  costume: Costume;
  rentalMode: "day" | "slot";
  onRentalModeChange: (mode: "day" | "slot") => void;
  selectedSlot: SlotType;
  onSlotChange: (slot: SlotType) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  costume,
  rentalMode,
  onRentalModeChange,
  selectedSlot,
  onSlotChange,
}) => {
  const supportsBoth = costume.rental_mode === "both";
  const supportsSlot = costume.rental_mode === "slot" || supportsBoth;

  const slotOptions = [
    {
      id: "full_day" as SlotType,
      name: "Full Day Rental",
      time: "24 Hours (6:00 AM – 6:00 AM next day)",
      price: costume.price_per_day,
      icon: Calendar,
      badge: "Standard",
    },
    {
      id: "morning" as SlotType,
      name: "Morning Slot",
      time: "6:00 AM – 2:00 PM (8 hrs)",
      price: costume.price_per_slot?.morning || 700,
      icon: Sun,
      badge: "Rehearsal & Rituals",
    },
    {
      id: "evening" as SlotType,
      name: "Evening Slot",
      time: "2:00 PM – 10:00 PM (8 hrs)",
      price: costume.price_per_slot?.evening || 800,
      icon: Sunset,
      badge: "Stage Shows",
    },
    {
      id: "night" as SlotType,
      name: "All-Night Performance Slot",
      time: "6:00 PM – 6:00 AM (12 hrs overnight)",
      price: costume.price_per_slot?.night || 1200,
      icon: Moon,
      badge: "Traditional Overnight (ಇಡೀ ರಾತ್ರಿ ಆಟ)",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Switch Tabs (Day vs Slot) */}
      {supportsBoth && (
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => {
              onRentalModeChange("day");
              onSlotChange("full_day");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              rentalMode === "day"
                ? "bg-white text-red-900 shadow-sm border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Day-Based Rental (Daily)
          </button>
          <button
            type="button"
            onClick={() => {
              onRentalModeChange("slot");
              if (selectedSlot === "full_day") onSlotChange("night");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              rentalMode === "slot"
                ? "bg-white text-red-900 shadow-sm border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Slot-Based Rental (Per Slot)
          </button>
        </div>
      )}

      {/* Slots selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
          {rentalMode === "day" ? "Rental Coverage" : "Choose Yakshagana Performance Slot"}
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {slotOptions
            .filter((opt) => (rentalMode === "day" ? opt.id === "full_day" : opt.id !== "full_day"))
            .map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedSlot === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSlotChange(opt.id)}
                  className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isSelected
                      ? "bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-500"
                      : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                        isSelected ? "bg-red-900 text-amber-200" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-sm text-stone-900">{opt.name}</span>
                        {opt.badge && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSelected
                                ? "bg-amber-200 text-red-950"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">{opt.time}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-10 sm:pl-0 shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-stone-100">
                    <span className="text-sm sm:text-base font-bold text-red-900 block font-serif">
                      {formatCurrency(opt.price)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {rentalMode === "day" ? "/ day" : "/ slot"}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
