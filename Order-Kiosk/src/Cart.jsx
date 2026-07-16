import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const getItemQuantity = (id) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (item, quantity) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      if (existingIndex !== -1) {
        if (quantity <= 0) {
          const updated = [...prevCart];
          updated.splice(existingIndex, 1);
          return updated;
        } else {
          const updated = [...prevCart];
          updated[existingIndex] = { ...updated[existingIndex], quantity };
          return updated;
        }
      } else {
        if (quantity <= 0) return prevCart;
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const changeQuantity = (item, delta) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      if (existingIndex !== -1) {
        const newQty = prevCart[existingIndex].quantity + delta;
        if (newQty <= 0) {
          const updated = [...prevCart];
          updated.splice(existingIndex, 1);
          return updated;
        } else {
          const updated = [...prevCart];
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
          return updated;
        }
      } else {
        if (delta <= 0) return prevCart;
        return [...prevCart, { ...item, quantity: delta }];
      }
    });
  };

  const getTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        getItemQuantity,
        updateQuantity,
        changeQuantity,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
