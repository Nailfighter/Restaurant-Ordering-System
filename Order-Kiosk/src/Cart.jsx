import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const checkIfItemInCart = (item) => {
    return cart.findIndex((cartItem) => cartItem.name === item.name);
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const itemIndex = checkIfItemInCart(item, prevCart);
      if (itemIndex !== -1) {
        if (item.quantity === 0) {
          return removeFromCart(prevCart, itemIndex);
        }
        const updatedCart = [...prevCart];
        updatedCart[itemIndex].quantity = item.quantity;
        return updatedCart;
      }
      
      if (item.quantity === 0) {
        return prevCart;
      }

      return [...prevCart, item];
    });
  };

  const getTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const removeFromCart = (cart, itemIndex) => {
    const updatedCart = [...cart];
    updatedCart.splice(itemIndex, 1);
    return updatedCart;
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, getTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
