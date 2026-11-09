import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Crown, User as UserIcon, Shield, Menu, X, Globe, Calendar, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#7F1D1D] text-amber-50 shadow-lg border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform">
              <Crown className="w-7 h-7 text-red-950" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-wide text-amber-200 block leading-tight">
                {t("brand_name")}
              </span>
              <span className="text-xs text-amber-300/80 font-sans tracking-wider uppercase block">
                {lang === "kn" ? "ಯಕ್ಷಗಾನ ವೇಷಭೂಷಣ ಬಾಡಿಗೆ" : "Yakshagana Costume Rentals"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/" className="hover:text-amber-300 transition-colors">
              {t("nav_home")}
            </Link>
            <Link to="/costumes" className="hover:text-amber-300 transition-colors flex items-center space-x-1">
              <span>{t("nav_catalogue")}</span>
            </Link>
            <Link to="/about" className="hover:text-amber-300 transition-colors">
              {t("nav_about")}
            </Link>
            {user && (
              <Link to="/account/bookings" className="hover:text-amber-300 transition-colors flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{t("nav_my_bookings")}</span>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 hover:bg-amber-500/30 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t("nav_admin")}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Switch */}
            <button
              onClick={toggleLang}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-900/60 border border-amber-600/40 text-xs font-medium text-amber-200 hover:bg-red-800 transition-colors"
              title="Toggle English / ಕನ್ನಡ"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "en" ? "ಕನ್ನಡ" : "English"}</span>
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-red-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-red-900/60 border border-amber-500/30"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-red-950 font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-amber-600/30 rounded-xl shadow-xl py-2 z-50 text-stone-200">
                    <div className="px-4 py-2 border-b border-stone-800">
                      <p className="text-sm font-semibold text-amber-300 truncate">{user.name}</p>
                      <p className="text-xs text-stone-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/account/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-stone-800 hover:text-amber-300"
                    >
                      {t("nav_my_bookings")}
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-stone-800 hover:text-amber-300"
                      >
                        {t("nav_admin")}
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-stone-800 flex items-center space-x-2 border-t border-stone-800"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("nav_logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-red-950 font-semibold text-xs tracking-wider uppercase shadow-md hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t("nav_login")}</span>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-amber-200 hover:bg-red-900/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-red-950 border-t border-amber-600/30 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-amber-100 hover:text-amber-300"
          >
            {t("nav_home")}
          </Link>
          <Link
            to="/costumes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-amber-100 hover:text-amber-300"
          >
            {t("nav_catalogue")}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-amber-100 hover:text-amber-300"
          >
            {t("nav_about")}
          </Link>
          {user && (
            <Link
              to="/account/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-amber-100 hover:text-amber-300"
            >
              {t("nav_my_bookings")}
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-amber-300"
            >
              {t("nav_admin")}
            </Link>
          )}
          {!user && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-2.5 rounded-lg bg-amber-500 text-red-950 font-bold"
            >
              {t("nav_login")}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
