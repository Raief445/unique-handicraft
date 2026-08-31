"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  productId: string;
  name: string;
  productCode: string;
  image: string;
  quantity: number;
};

type EnquiryCartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const EnquiryCartContext = createContext<EnquiryCartContextType | undefined>(undefined);

export function EnquiryCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("enquiry_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("enquiry_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.productId === newItem.productId);
      if (existing) {
        return current.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: Math.min(1000, i.quantity + newItem.quantity) }
            : i
        );
      }
      return [...current, newItem];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safeQty = Math.max(1, Math.min(1000, quantity));
    setItems((current) =>
      current.map((i) => (i.productId === productId ? { ...i, quantity: safeQty } : i))
    );
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <EnquiryCartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, itemCount, isCartOpen, openCart, closeCart }}
    >
      {children}
    </EnquiryCartContext.Provider>
  );
}

export function useEnquiryCart() {
  const context = useContext(EnquiryCartContext);
  if (context === undefined) {
    throw new Error("useEnquiryCart must be used within an EnquiryCartProvider");
  }
  return context;
}
