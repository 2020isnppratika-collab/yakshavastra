import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Calendar, Clock, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency, formatDate } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalSubtotal, totalDeposit, estimatedTaxes, estimatedTotal, itemCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-red-900 border border-amber-200 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">{t("cart_empty")}</h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Explore our authentic Yakshagana costumes and reserve characters or ornaments for your upcoming performance.
        </p>
        <Link
          to="/costumes"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-red-900 text-amber-100 font-bold text-xs uppercase tracking-wider hover:bg-red-800 transition-colors shadow-md"
        >
          <span>Explore Costumes Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-end justify-between pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">{t("cart_title")}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {itemCount} item(s) selected for booking
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-stone-500 hover:text-red-700 flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item, idx) => (
            <div
              key={`${item.costume.id}-${idx}`}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start justify-between"
            >
              {/* Costume image & basic info */}
              <div className="flex space-x-4 items-start w-full sm:w-auto">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200">
                  <img
                    src={item.costume.images?.[0] || "/images/costumes/raja_arjuna_1.jpg"}
                    alt={item.costume.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-900 text-amber-200 px-2 py-0.5 rounded-full inline-block">
                    {item.costume.character_type}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-900">{item.costume.name}</h3>
                  {item.costume.kannada_name && (
                    <p className="text-xs text-amber-800 font-medium">{item.costume.kannada_name}</p>
                  )}
                  <p className="text-xs text-stone-500">Size: <strong>{item.size}</strong></p>

                  {/* Rental Dates & Slot */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                    <span className="flex items-center space-x-1 bg-stone-100 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3 text-red-900" />
                      <span>{formatDate(item.start_at)} – {formatDate(item.end_at)} ({item.days} d)</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span className="capitalize">{item.slot.replace("_", " ")}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity, Pricing & Remove */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="text-right">
                  <span className="text-lg font-bold font-serif text-red-900 block">
                    {formatCurrency(item.item_subtotal)}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    + {formatCurrency(item.item_deposit)} deposit
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold bg-stone-50 hover:bg-stone-100 text-stone-700"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-xs font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.costume.total_units}
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold bg-stone-50 hover:bg-stone-100 text-stone-700 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-1.5 text-stone-400 hover:text-red-700 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Booking Billing Summary
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Total Rental Subtotal:</span>
                <span className="font-semibold text-stone-900">{formatCurrency(totalSubtotal)}</span>
              </div>

              <div className="flex justify-between text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <div>
                  <span className="font-semibold block">Refundable Security Deposit:</span>
                  <span className="text-[10px] text-amber-700">100% credited back after return inspection</span>
                </div>
                <span className="font-bold text-sm">{formatCurrency(totalDeposit)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>{formatCurrency(estimatedTaxes)}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-base font-bold text-stone-900 block">Total Payable Now</span>
                  <span className="text-[10px] text-stone-400">Rent + Deposit + Taxes</span>
                </div>
                <span className="font-serif text-2xl font-black text-red-900">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-amber-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>{t("checkout_btn")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>10-Minute Hold Lock:</strong> Once you proceed, your items are locked exclusively for you during checkout.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
