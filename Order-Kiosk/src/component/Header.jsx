import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const apiURL = import.meta.env.VITE_API_URL;

function convertDate(dateString) {
  const isoDateString = dateString.replace(" ", "T");
  let date = new Date(isoDateString);
  date.setHours(date.getHours() - 4);
  return date;
}

function formatOrderNumber(orderNumber) {
  return orderNumber.toString().padStart(3, "0");
}

const bounce = {
  initial: { scale: 0.9, opacity: 0, y: 20 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  exit: { scale: 0.9, opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const bounceButton = {
  initial: { scale: 1 },
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 },
};

const searchBoxAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

const searchIconAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 },
};

const Header = () => {
  const [inputValue, setInputValue] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState(null);

  const handleBlur = () => {
    setInputValue("");
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      if (!inputValue || inputValue === "0" || isNaN(inputValue)) {
        return;
      }

      await findOrderDetails(inputValue);
      setShowOrder(true);
    }
  };

  const handleClose = () => {
    setShowOrder(false);
    setFetchedOrder(null);
  };

  const fetchJson = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  const findOrderDetails = async (num) => {
    try {
      const [orderInfo, orderItems] = await Promise.all([
        fetchJson(`${apiURL}/api/kiosk/orders/order/${num}`),
        fetchJson(`${apiURL}/api/kiosk/order-items/order/${num}`),
      ]);

      if (orderInfo && orderItems) {
        setFetchedOrder({
          orderInfo: Array.isArray(orderInfo) ? orderInfo : [orderInfo],
          orderItems,
        });
      } else {
        setFetchedOrder(null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setFetchedOrder(null);
    }
  };

  return (
    <div className="header">
      <AnimatePresence>
        {showOrder && (
          <motion.div
            className="order-overlay"
            initial={{ opacity: 1, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="order-info"
              variants={bounce}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="close">
                <motion.button
                  onClick={handleClose}
                  variants={bounceButton}
                  initial="initial"
                  whileHover="whileHover"
                  whileTap="whileTap"
                >
                  <img src="/Icon/cross.png" alt="Close" />
                </motion.button>
              </div>
              {fetchedOrder && fetchedOrder.orderInfo.length > 0 ? (
                <>
                  <h1>
                    Order #
                    {formatOrderNumber(fetchedOrder.orderInfo[0]?.order_num) ||
                      "N/A"}
                  </h1>
                  <div className="order-datetime">
                    <h3>
                      {convertDate(
                        fetchedOrder.orderInfo[0]?.created_time
                      ).toLocaleDateString() || "N/A"}
                    </h3>
                    <h3>
                      {convertDate(
                        fetchedOrder.orderInfo[0]?.created_time
                      ).toLocaleTimeString() || "N/A"}
                    </h3>
                  </div>
                  <img src="/Image/Dash.png" alt="Dash Line" />
                  <div className="order-list">
                    {fetchedOrder.orderItems?.map((item, index) => (
                      <motion.div
                        className="order-list-item"
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3>{item.item_name}</h3>
                        <h5>x {item.quantity}</h5>
                      </motion.div>
                    ))}
                  </div>
                  <img src="/Image/Dash.png" alt="Dash Line" />
                  <div className="order-datetime">
                    <h3>Last Updated:</h3>
                    <h3>
                      {convertDate(
                        fetchedOrder.orderInfo[0]?.updated_time
                      ).toLocaleTimeString() || "N/A"}
                    </h3>
                  </div>
                  <h3>
                    Order Status:
                    <span>{fetchedOrder.orderInfo[0]?.status || "N/A"}</span>
                  </h3>
                </>
              ) : (
                <div className="not-found">
                  <h1>Order #{formatOrderNumber(inputValue) || "N/A"}</h1>
                  <h3>
                    Order Status:
                    <span>Not Created</span>
                  </h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="search-box"
        variants={searchBoxAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.img
          src="/Icon/Search.png"
          alt="Search"
          variants={searchIconAnimation}
          initial="initial"
          animate="animate"
          whileHover="whileHover"
          whileTap="whileTap"
        />
        <input
          className="search-input"
          placeholder="Search for order number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </motion.div>
    </div>
  );
};

export default Header;
