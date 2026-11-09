import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Crown,
  Sparkles,
  ShieldCheck,
  Calendar as CalendarIcon,
  ShoppingBag,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import { Costume, SlotType, CartItem } from "../types";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { formatCurrency, getDaysAheadDateString } from "../lib/utils";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { SlotPicker } from "../components/SlotPicker";
import { useLanguage } from "../context/LanguageContext";

export const CostumeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();

  const [costume, setCostume] = useState<Costume | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("Free");
  const [quantity, setQuantity] = useState<number>(1);
  const [rentalMode, setRentalMode] = useState<"day" | "slot">("day");
  const [selectedSlot, setSelectedSlot] = useState<SlotType>("full_day");

  // Dates defaults: tomorrow to day-after-tomorrow
  const [startDate, setStartDate] = useState<string>(() => getDaysAheadDateString(1));
  const [endDate, setEndDate] = useState<string>(() => getDaysAheadDateString(2));

  const [addedToast, setAddedToast] = useState(false);
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.costumes
      .getById(id)
      .then((data) => {
        setCostume(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.rental_mode === "slot") {
          setRentalMode("slot");
          setSelectedSlot("night");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Check live availability whenever dates or quantity change
  useEffect(() => {
    if (!costume || !startDate || !endDate) return;
    api.costumes
      .getAvailability(costume.id, {
        start: startDate,
        end: endDate,
        slot: selectedSlot,
        quantity,
      })
      .then((res) => {
        if (!res.is_available) {
          setAvailabilityWarning(
            `Only ${res.available_units} unit(s) remaining for selected dates/slot (${quantity} requested).`
          );
        } else {
          setAvailabilityWarning(null);
        }
      })
      .catch(() => {});
  }, [costume, startDate, endDate, selectedSlot, quantity]);

  if (loading || !costume) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading costume details...</p>
      </div>
    );
  }

  // Calculate pricing breakdown
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const daysDiff = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  let unitPrice = costume.price_per_day;
  if (rentalMode === "slot") {
    if (selectedSlot === "morning") unitPrice = costume.price_per_slot?.morning || 700;
    else if (selectedSlot === "evening") unitPrice = costume.price_per_slot?.evening || 800;
    else if (selectedSlot === "night") unitPrice = costume.price_per_slot?.night || 1200;
  }

  const itemSubtotal = unitPrice * daysDiff * quantity;
  const itemDeposit = costume.security_deposit * quantity;
  const estimatedTax = Math.round(itemSubtotal * 0.05 * 100) / 100;
  const totalPayable = itemSubtotal + itemDeposit + estimatedTax;

  const buildCartItem = (): CartItem => ({
    costume,
    size: selectedSize,
    quantity,
    rental_mode: rentalMode,
    start_at: startDate,
    end_at: endDate,
    slot: selectedSlot,
    unit_price: unitPrice,
    item_subtotal: itemSubtotal,
    item_deposit: itemDeposit,
    days: daysDiff,
  });

  const handleAddToCart = () => {
    addToCart(buildCartItem());
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBookNow = () => {
    addToCart(buildCartItem());
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <Link
        to="/costumes"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-stone-500 hover:text-red-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Costumes Catalogue</span>
      </Link>

      {/* Top Details & Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-lg relative">
            <img
              src={selectedImage || costume.images[0]}
              alt={costume.name}
              className="w-full h-full object-cover object-center"
            />
            {costume.kannada_name && (
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-amber-200 text-xs font-medium">
                {costume.kannada_name}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {costume.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {costume.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? "border-red-900 ring-2 ring-amber-400"
                      : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Includes badge box */}
          {costume.includes && costume.includes.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>What's Included in this Ensemble</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {costume.includes.map((inc, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Specifications & Live Booking Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-900 text-amber-200">
                {costume.character_type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                SKU: {costume.sku}
              </span>
              <span className="text-xs text-stone-500">
                Total Inventory: {costume.total_units} unit(s)
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              {costume.name}
            </h1>

            {costume.kannada_name && (
              <p className="text-base text-amber-800 font-medium mt-1">
                {costume.kannada_name}
              </p>
            )}

            <p className="text-sm text-stone-600 mt-3 leading-relaxed">
              {costume.description}
            </p>
          </div>

          {/* Size & Quantity Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200">
            {costume.sizes && costume.sizes.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {costume.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === sz
                          ? "bg-red-900 text-amber-200 border-red-950 shadow-sm"
                          : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                Quantity (Costume Units)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-bold text-base text-stone-900 w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= costume.total_units}
                  onClick={() => setQuantity(Math.min(costume.total_units, quantity + 1))}
                  className="w-10 h-10 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 disabled:opacity-40"
                >
                  +
                </button>
                <span className="text-xs text-stone-400">max {costume.total_units}</span>
              </div>
            </div>
          </div>

          {/* Slot Selection */}
          <div className="pt-4 border-t border-stone-200">
            <SlotPicker
              costume={costume}
              rentalMode={rentalMode}
              onRentalModeChange={setRentalMode}
              selectedSlot={selectedSlot}
              onSlotChange={setSelectedSlot}
            />
          </div>

          {/* Availability warning banner */}
          {availabilityWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{availabilityWarning}</span>
            </div>
          )}

          {/* Live Price Calculator Summary Card */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600">
              Live Price & Deposit Breakdown
            </h4>

            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>
                  Rental Rate ({formatCurrency(unitPrice)} &times; {daysDiff} days &times; {quantity} units):
                </span>
                <span className="font-semibold text-stone-900">{formatCurrency(itemSubtotal)}</span>
              </div>

              <div className="flex justify-between text-amber-900">
                <span className="flex items-center space-x-1" title="Returned within 24 hours of return">
                  <span>Security Deposit (100% Refundable):</span>
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <span className="font-semibold">{formatCurrency(itemDeposit)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>{formatCurrency(estimatedTax)}</span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-base font-bold text-stone-900 block">
                    Estimated Total Payable
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Includes {formatCurrency(itemDeposit)} refundable deposit
                  </span>
                </div>
                <span className="font-serif text-2xl font-black text-red-900">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={Boolean(availabilityWarning)}
                className="py-3 px-4 rounded-xl bg-white border border-red-900 text-red-900 font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t("add_to_cart")}</span>
              </button>

              <button
                type="button"
                onClick={handleBookNow}
                disabled={Boolean(availabilityWarning)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-900 to-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider hover:from-red-800 hover:to-red-700 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{t("book_now")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Costume added to your booking cart!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Month Availability Calendar */}
      <section className="space-y-4 pt-8 border-t border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
            Check Blocked & Open Dates
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
            Availability Calendar for {costume.name}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Click on any available date to set your rental window. Blocked dates show existing bookings or cleaning buffer gaps.
          </p>
        </div>

        <AvailabilityCalendar
          costumeId={costume.id}
          startDate={startDate}
          endDate={endDate}
          selectedSlot={selectedSlot}
          onSelectRange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          bufferDays={costume.buffer_days}
        />
      </section>
    </div>
  );
};
