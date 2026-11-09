import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { Home } from "./pages/Home";
import { Catalogue } from "./pages/Catalogue";
import { CostumeDetail } from "./pages/CostumeDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { BookingConfirmation } from "./pages/BookingConfirmation";
import { MyBookings } from "./pages/MyBookings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { About } from "./pages/About";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCostumes } from "./pages/admin/AdminCostumes";
import { AdminBookings } from "./pages/admin/AdminBookings";
import { AdminCalendar } from "./pages/admin/AdminCalendar";

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-stone-900 selection:bg-amber-300 selection:text-red-950 font-sans">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/costumes" element={<Catalogue />} />
                  <Route path="/costumes/:id" element={<CostumeDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/booking/success/:code" element={<BookingConfirmation />} />
                  <Route path="/account/bookings" element={<MyBookings />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/costumes"
                    element={
                      <AdminRoute>
                        <AdminCostumes />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/bookings"
                    element={
                      <AdminRoute>
                        <AdminBookings />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/calendar"
                    element={
                      <AdminRoute>
                        <AdminCalendar />
                      </AdminRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
