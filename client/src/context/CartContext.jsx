import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("ruang_namu_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableInfo, setTableInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("ruang_namu_table");
      return saved ? JSON.parse(saved) : { tableNumber: "", token: "" };
    } catch {
      return { tableNumber: "", token: "" };
    }
  });

  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem("ruang_namu_customer_name") || "";
  });

  useEffect(() => {
    localStorage.setItem("ruang_namu_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("ruang_namu_table", JSON.stringify(tableInfo));
  }, [tableInfo]);

  useEffect(() => {
    localStorage.setItem("ruang_namu_customer_name", customerName);
  }, [customerName]);

  const addItem = (product, quantity = 1, notes = "") => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          alert(`Stok tidak mencukupi (Maksimal: ${product.stock})`);
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        if (notes) updated[existingIdx].notes = notes;
        return updated;
      } else {
        if (quantity > product.stock) {
          alert(`Stok tidak mencukupi (Maksimal: ${product.stock})`);
          return prev;
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image_url: product.image_url,
            quantity,
            notes
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          if (newQty > i.stock) {
            alert(`Stok maksimal: ${i.stock}`);
            return i;
          }
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const updateNotes = (productId, notes) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, notes } : i))
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    tableInfo,
    customerName,
    setTableInfo,
    setCustomerName,
    addItem,
    updateQuantity,
    updateNotes,
    removeItem,
    clearCart,
    cartSubtotal,
    cartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
