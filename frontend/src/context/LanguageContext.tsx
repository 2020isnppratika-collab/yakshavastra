import React, { createContext, useContext, useState } from "react";

type Language = "en" | "kn";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    brand_name: "YakshaKesari",
    brand_tagline: "Authentic Yakshagana Costume Rentals",
    nav_home: "Home",
    nav_catalogue: "Costumes",
    nav_how_it_works: "How It Works",
    nav_about: "About Yakshagana",
    nav_contact: "Contact Us",
    nav_my_bookings: "My Bookings",
    nav_admin: "Admin Portal",
    nav_login: "Login",
    nav_logout: "Logout",
    hero_title: "Sacred Costumes for Divine Performances",
    hero_subtitle: "Reserve complete Yakshagana sets, handcrafted wooden Kireetas, gold-leaf Bhujakeerthis, and classical stage ornaments for your troupe.",
    cta_browse: "Explore Catalogue",
    cta_check_avail: "Check Date Availability",
    price_per_day: "per day",
    security_deposit: "Refundable Deposit",
    book_now: "Book Costume",
    add_to_cart: "Add to Booking",
    filter_all: "All Categories",
    filter_characters: "Character Roles",
    search_placeholder: "Search Raja, Rakshasa, Kireeta, Bhujakeerthi...",
    select_dates: "Select Performance Dates",
    select_slot: "Choose Time Slot",
    slot_full_day: "Full Day (24 hrs)",
    slot_morning: "Morning (6 AM - 2 PM)",
    slot_evening: "Evening (2 PM - 10 PM)",
    slot_night: "Night Show (6 PM - 6 AM)",
    cart_title: "Your Costume Booking Cart",
    cart_empty: "Your booking cart is empty.",
    checkout_btn: "Proceed to Checkout",
    deposit_note: "Security deposit is 100% refunded within 24 hours of return inspection.",
  },
  kn: {
    brand_name: "ಯಕ್ಷಕೇಸರಿ",
    brand_tagline: "ಪ್ರಾಮಾಣಿಕ ಯಕ್ಷಗಾನ ವೇಷಭೂಷಣ ಬಾಡಿಗೆ",
    nav_home: "ಮುಖಪುಟ",
    nav_catalogue: "ವೇಷಗಳು",
    nav_how_it_works: "ಬಳಸುವುದು ಹೇಗೆ",
    nav_about: "ಯಕ್ಷಗಾನ ಪರಿಚಯ",
    nav_contact: "ಸಂಪರ್ಕಿಸಿ",
    nav_my_bookings: "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು",
    nav_admin: "ಆಡಳಿತ ಮಂಡಳಿ",
    nav_login: "ಲಾಗಿನ್",
    nav_logout: "ನಿರ್ಗಮಿಸಿ",
    hero_title: "ರಂಗದ ದೈವಿಕ ಪಾತ್ರಗಳಿಗೆ ಭವ್ಯ ವೇಷಭೂಷಣಗಳು",
    hero_subtitle: "ಬಡಗು ಹಾಗೂ ತೆಂಕುತಿಟ್ಟಿನ ಭವ್ಯ ಕಿರೀಟಗಳು, ಭುಜಕೀರ್ತಿಗಳು, ಕಚ್ಚೆ ಲಂಗಗಳು ಹಾಗೂ ರಂಗ ಪರಿಕರಗಳನ್ನು ಸುಲಭವಾಗಿ ಮುಂಗಡ ಕಾಯ್ದಿರಿಸಿ.",
    cta_browse: "ವೇಷಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    cta_check_avail: "ದಿನಾಂಕ ಲಭ್ಯತೆ ಪರಿಶೀಲಿಸಿ",
    price_per_day: "ಪ್ರತಿದಿನಕ್ಕೆ",
    security_deposit: "ಮರುಪಾವತಿಸಬಹುದಾದ ಠೇವಣಿ",
    book_now: "ಈಗಲೇ ಕಾಯ್ದಿರಿಸಿ",
    add_to_cart: "ಬುಕಿಂಗ್‌ಗೆ ಸೇರಿಸಿ",
    filter_all: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
    filter_characters: "ಪಾತ್ರಗಳ ವಿವರ",
    search_placeholder: "ರಾಜ, ರಾಕ್ಷಸ, ಕಿರೀಟ, ಭುಜಕೀರ್ತಿ ಹುಡುಕಿ...",
    select_dates: "ಪ್ರದರ್ಶನ ದಿನಾಂಕಗಳನ್ನು ಆರಿಸಿ",
    select_slot: "ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ",
    slot_full_day: "ಪೂರ್ಣ ದಿನ (೨೪ ಗಂಟೆ)",
    slot_morning: "ಬೆಳಗಿನ ಸ್ಲಾಟ್ (೬:೦೦ - ೨:೦೦)",
    slot_evening: "ಸಂಜೆಯ ಸ್ಲಾಟ್ (೨:೦೦ - ೧೦:೦೦)",
    slot_night: "ಇಡೀ ರಾತ್ರಿ ಆಟ (೬:೦೦ - ೬:೦೦)",
    cart_title: "ನಿಮ್ಮ ವೇಷ ಬುಕಿಂಗ್ ಕಾರ್ಟ್",
    cart_empty: "ನಿಮ್ಮ ಕಾರ್ಟ್‌ನಲ್ಲಿ ಯಾವುದೇ ವೇಷಗಳಿಲ್ಲ.",
    checkout_btn: "ಮುಂದುವರಿಯಿರಿ",
    deposit_note: "ವೇಷವನ್ನು ಮರಳಿಸಿದ ೨೪ ಗಂಟೆಯೊಳಗೆ ನಿಮ್ಮ ಭದ್ರತಾ ಠೇವಣಿಯನ್ನು ಪೂರ್ಣವಾಗಿ ಮರುಪಾವತಿಸಲಾಗುತ್ತದೆ.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("yaksha_lang") as Language) || "en";
  });

  const toggleLang = () => {
    const next = lang === "en" ? "kn" : "en";
    setLang(next);
    localStorage.setItem("yaksha_lang", next);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
