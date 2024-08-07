import React, { useRef, useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CartContext } from "../Cart.jsx";
import Order_Item from "./Order_Item.jsx";
import { ConfirmationContext } from "../ConfirmationContext.jsx";
import { useWidth } from "../WidthContext";

import "../styles/scss/Order_Review.scss";

const apiURL = import.meta.env.VITE_API_URL;

function generateOrderPayload(cart, total, note) {
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
    cart: orderItems,
  });
}

function addOrderToDB(cart, total, note) {
  fetch(apiURL + "/api/kiosk/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: generateOrderPayload(cart, total, note),
  }).then((response) => response.json());
}

const OrderReview = () => {
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState("");

  const { setShowConfirmation } = useContext(ConfirmationContext);

  const generateOrderItems = () => {
    if (cart.length === 0) {
      return <span className="empty-cart">Cart is empty</span>;
    }

    return cart.map((item, index) => {
      return (
        <Order_Item
          key={index}
          quantity={item.quantity}
          name={item.name}
          price={item.price * item.quantity}
        />
      );
    });
  };

  const handleNote = (event) => {
    setNote(event.target.value);
  };

  const handleConfirm = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    addOrderToDB(cart, total, note);
    setNote("");
    clearCart();
    handleScreen();
  };

  const handleCancel = () => {
    clearCart();
    setNote("");
  };

  const handleScreen = () => {
    setTimeout(() => {
      setShowConfirmation(true);
    }, 250);

    setTimeout(() => {
      setShowConfirmation(false);
    }, 5000);
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

  const h1Ref = useRef(null);

  useEffect(() => {
    const adjustFontSize = () => {
      const element = h1Ref.current;
      let fontSize = 54;
      element.style.fontSize = fontSize + "px";
      element.style.whiteSpace = "nowrap"; // Prevent initial wrapping for measurement
      while (element.scrollWidth > element.clientWidth && fontSize > 20) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
      }
      element.style.whiteSpace = "";
    };
    adjustFontSize();
    window.addEventListener("resize", adjustFontSize);
    return () => {
      window.removeEventListener("resize", adjustFontSize);
    };
  });

  return (
    <div className="order" ref={orderRef}>
      <h1 ref={h1Ref}>Current Order</h1>
      <div className="order-items">{generateOrderItems()}</div>
      <div className="footer">
        <div className="footer-top">
          <img src="/Image/Dash.png" alt="Dash Line" />
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
        <textarea
          className="note"
          value={note}
          onChange={handleNote}
          placeholder="Add a note..."
        ></textarea>
        <div className="buttons">
          <motion.button
            className="buttons-cancel"
            onClick={handleCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="/Icon/Undo.png" alt="Cancel" />
          </motion.button>
          <motion.button
            className="buttons-confirm"
            onClick={handleConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Place Order
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
