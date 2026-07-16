import React, { useRef, useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CartContext } from "../Cart.jsx";
import Order_Item from "./Order_Item.jsx";
import { ConfirmationContext } from "../ConfirmationContext.jsx";
import { useWidth } from "../WidthContext";
import { useAuth } from "../AuthContext";

import "../styles/scss/Order_Review.scss";

const apiURL = import.meta.env.VITE_API_URL;

function generateOrderPayload(cart, total, note, createdBy) {
  const orderItems = cart.map((item) => {
    return {
      itemID: item.id,
      itemName: item.name,
      quantity: item.quantity,
      itemPrice: item.price * item.quantity,
    };
  });

  return JSON.stringify({
    status: "Preparing",
    totalPrice: total,
    note: note,
    createdBy: createdBy,
    cart: orderItems,
  });
}

async function addOrderToDB(cart, total, note, createdBy) {
  const response = await fetch(apiURL + "/api/kiosk/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: generateOrderPayload(cart, total, note, createdBy),
  });
  if (!response.ok) {
    throw new Error(`Failed to place order: ${response.statusText}`);
  }
  return await response.json();
}

const OrderReview = ({ isOffline }) => {
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState("");
  // UI-only: mobile bottom-sheet open state (the bar/backdrop only render via CSS <=900px)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const { triggerConfirmation } = useContext(ConfirmationContext);
  const { session } = useAuth();

  const generateOrderItems = () => {
    if (cart.length === 0) {
      return (
        <div className="empty-cart">
          <span>Cart is empty</span>
          <span className="empty-cart-hint">
            Tap + on an item to add it to the order
          </span>
        </div>
      );
    }

    return cart.map((item) => {
      return (
        <Order_Item
          key={item.id}
          item={item}
        />
      );
    });
  };

  const handleNote = (event) => {
    setNote(event.target.value);
  };

  const handleConfirm = async () => {
    if (cart.length === 0 || isOffline || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await addOrderToDB(cart, total, note, session?.user?.id);
      const orderNum = result?.orderNum;

      setNote("");
      clearCart();
      setIsSheetOpen(false);

      if (orderNum) {
        triggerConfirmation(orderNum);
      } else {
        triggerConfirmation(0);
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      setSubmitError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearCart();
    setNote("");
    setIsSheetOpen(false);
  };

  useEffect(() => {
    setTotal(getTotal());
  }, [cart]);

  const { width } = useWidth();
  const orderRef = useRef(null);

  useEffect(() => {
    if (orderRef.current) {
      orderRef.current.style.width = width;
    }
  }, [width]);

  return (
    <>
      <button
        className="cart-bar"
        onClick={() => setIsSheetOpen((open) => !open)}
        aria-expanded={isSheetOpen}
        aria-controls="order-panel"
      >
        <span className="cart-bar-label">
          {isSheetOpen ? "Close" : "View Order"}
        </span>
        <span className="cart-bar-count">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <span className="cart-bar-total">${total}</span>
      </button>
      {isSheetOpen && (
        <div
          className="cart-backdrop"
          onClick={() => setIsSheetOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`order${isSheetOpen ? " order--open" : ""}`}
        id="order-panel"
        ref={orderRef}
      >
      <h1>Current Order</h1>
      <div className="order-items">{generateOrderItems()}</div>
      <div className="footer">
        <div className="footer-top">
          <img src="Image/Dash.png" alt="Dash Line" />
          <div className="total">
            <span>Total</span>
            <motion.h5
              key={total}
              initial={{ scale: 0.8, opacity: 0 }} // Start smaller and fade in
              animate={{ scale: 1, opacity: 1 }} // Scale to normal size and full opacity
              exit={{ scale: 0.8, opacity: 0 }} // Scale down and fade out
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              ${total}
            </motion.h5>
          </div>
        </div>
        {submitError && (
          <div className="submit-error">
            {submitError}
          </div>
        )}
        <textarea
          className="note"
          value={note}
          onChange={handleNote}
          disabled={isSubmitting}
          aria-label="Order note"
          placeholder="Add a note..."
        ></textarea>
        <div className="buttons">
          <motion.button
            className="buttons-cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
            aria-label="Cancel order and clear cart"
            whileHover={!isSubmitting ? { scale: 1.1 } : {}}
            whileTap={!isSubmitting ? { scale: 0.9 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="Icon/Undo.png" alt="" aria-hidden="true" />
          </motion.button>
          <motion.button
            className="buttons-confirm"
            onClick={handleConfirm}
            disabled={cart.length === 0 || isOffline || isSubmitting}
            whileHover={cart.length > 0 && !isOffline && !isSubmitting ? { scale: 1.05 } : {}}
            whileTap={cart.length > 0 && !isOffline && !isSubmitting ? { scale: 0.9 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {isSubmitting ? "Placing..." : "Place Order"}
          </motion.button>
        </div>
      </div>
      </div>
    </>
  );
};

export default OrderReview;
