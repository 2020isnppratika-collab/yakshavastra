import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Costume, SlotType } from "../types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalSubtotal: number;
  totalDeposit: number;
  estimatedTaxes: number;
  estimatedTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("yaksha_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("yaksha_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    // Check if duplicate configuration already in cart
    const existingIndex = cart.findIndex(
      (c) =>
        c.costume.id === newItem.costume.id &&
        c.size === newItem.size &&
        c.start_at === newItem.start_at &&
        c.end_at === newItem.end_at &&
        c.slot === newItem.slot
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + newItem.quantity;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].item_subtotal = updated[existingIndex].unit_price * updated[existingIndex].days * newQty;
      updated[existingIndex].item_deposit = updated[existingIndex].costume.security_deposit * newQty;
      setCart(updated);
    } else {
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = quantity;
    updated[index].item_subtotal = updated[index].unit_price * updated[index].days * quantity;
    updated[index].item_deposit = updated[index].costume.security_deposit * quantity;
    setCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("yaksha_cart");
  };

  const totalSubtotal = cart.reduce((acc, item) => acc + item.item_subtotal, 0);
  const totalDeposit = cart.reduce((acc, item) => acc + item.item_deposit, 0);
  const estimatedTaxes = Math.round(totalSubtotal * 0.05 * 100) / 100;
  const estimatedTotal = Math.round((totalSubtotal + totalDeposit + estimatedTaxes) * 100) / 100;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalSubtotal,
        totalDeposit,
        estimatedTaxes,
        estimatedTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
