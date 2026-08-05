import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const apiURL = import.meta.env.VITE_API_URL;

function convertDate(dateString) {
  if (!dateString) return new Date();
  const isoDateString = dateString.replace(" ", "T");
  return new Date(isoDateString);
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

const VenmoLogo = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.772 13.119c-.267 0-.381-.251-.38-.655 0-.533.121-1.575.712-1.575.267 0 .357.243.357.598 0 .533-.13 1.632-.689 1.632Zm.502-3.377c-1.677 0-2.405 1.285-2.405 2.658 0 1.042.421 1.874 1.693 1.874 1.717 0 2.438-1.406 2.438-2.763 0-1.025-.462-1.769-1.726-1.769Zm-3.833 0c-.558 0-.964.17-1.393.477-.154-.275-.462-.477-.932-.477-.542 0-.947.219-1.247.437l-.04-.364H13.54l-.688 4.354h1.506l.479-3.053c.129-.065.323-.154.518-.154.145 0 .267.049.267.267 0 .056-.016.145-.024.218l-.429 2.722h1.498l.478-3.053c.138-.073.324-.154.51-.154.146 0 .268.049.268.267 0 .056-.017.145-.025.218l-.429 2.722h1.499l.461-2.908c.025-.153.049-.388.049-.549 0-.582-.267-.97-1.037-.97Zm-6.871 0c-.575 0-.98.219-1.287.421l-.017-.348H8.962l-.689 4.354H9.78l.478-3.053c.13-.065.324-.154.518-.154.147 0 .268.049.268.242 0 .081-.024.227-.032.299l-.422 2.666h1.499l.462-2.908c.024-.153.049-.388.049-.549 0-.582-.268-.97-1.03-.97Zm-5.631 1.834c.041-.485.413-.824.697-.824.162 0 .299.097.299.291 0 .404-.713.533-.996.533Zm.843-1.834c-1.604 0-2.382 1.39-2.382 2.698 0 1.01.478 1.817 1.814 1.817.527 0 1.07-.113 1.418-.282l.186-1.26c-.494.25-.874.347-1.271.347-.365 0-.64-.194-.64-.687.826-.008 2.252-.347 2.252-1.453 0-.687-.494-1.18-1.377-1.18Zm-4.239.267c.089.186.146.412.146.743 0 .606-.429 1.494-.777 2.06l-.373-2.989L0 9.969l.705 4.2h1.757c.77-1.01 1.718-2.448 1.718-3.554 0-.347-.073-.622-.235-.889l-1.402.283Z" />
  </svg>
);

const ZelleLogo = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-2.765H5.638a.667.667 0 0 1-.666-.666v-2.234a.67.67 0 0 1 .142-.412l8.139-10.382h-7.25a.667.667 0 0 1-.667-.667V3.914c0-.367.299-.666.666-.666h4.23V.483c0-.266.217-.483.483-.483h2.841c.266 0 .483.217.483.483v2.765h4.323c.367 0 .666.299.666.666v2.137a.67.67 0 0 1-.141.41l-8.19 10.481h7.665c.367 0 .666.299.666.666v2.477a.667.667 0 0 1-.666.667h-4.32v2.765a.483.483 0 0 1-.483.483Z" />
  </svg>
);

const Header = () => {
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [paymentQR, setPaymentQR] = useState(null); // "venmo" | "zelle" | null

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
        {paymentQR && (
          <div
            className="order-overlay payment-overlay"
            onClick={() => setPaymentQR(null)}
          >
            <motion.div
              className={`payment-modal payment-modal--${paymentQR}`}
              variants={bounce}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="close">
                <motion.button
                  onClick={() => setPaymentQR(null)}
                  aria-label="Close QR code"
                  variants={bounceButton}
                  initial="initial"
                  whileHover="whileHover"
                  whileTap="whileTap"
                >
                  <img src="Icon/cross.png" alt="Close" />
                </motion.button>
              </div>
              <div className="payment-modal-header">
                <span className="payment-modal-badge">
                  {paymentQR === "venmo" ? (
                    <VenmoLogo className="payment-modal-badge-icon" />
                  ) : (
                    <ZelleLogo className="payment-modal-badge-icon" />
                  )}
                </span>
                <h1>{paymentQR === "venmo" ? "Venmo" : "Zelle"}</h1>
                <p>Scan with your phone's camera to pay</p>
              </div>
              <div className="payment-qr-card">
                <img
                  className="payment-qr-image"
                  src={
                    paymentQR === "venmo"
                      ? "Image/Venmo_QR.jpeg"
                      : "Image/Zelle_QR.jpeg"
                  }
                  alt={paymentQR === "venmo" ? "Venmo QR code" : "Zelle QR code"}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOrder && (
          <div className="order-overlay">
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
                  aria-label="Close order details"
                  variants={bounceButton}
                  initial="initial"
                  whileHover="whileHover"
                  whileTap="whileTap"
                >
                  <img src="Icon/cross.png" alt="Close" />
                </motion.button>
              </div>
              <div className="order-info-scroll">
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
                  <img src="Image/Dash.png" alt="Dash Line" />
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
                  <img src="Image/Dash.png" alt="Dash Line" />
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
                  {fetchedOrder.orderInfo[0]?.created_by_name && (
                    <h3>
                      Created By:
                      <span>{fetchedOrder.orderInfo[0].created_by_name}</span>
                    </h3>
                  )}
                  {fetchedOrder.orderInfo[0]?.updated_by_name && (
                    <h3>
                      Last Updated By:
                      <span>{fetchedOrder.orderInfo[0].updated_by_name}</span>
                    </h3>
                  )}
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
              </div>
            </motion.div>
          </div>
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
          src="Icon/Search.png"
          alt="Search"
          variants={searchIconAnimation}
          initial="initial"
          animate="animate"
          whileHover="whileHover"
          whileTap="whileTap"
        />
        <input
          className="search-input"
          type="text"
          inputMode="numeric"
          aria-label="Search for order number"
          placeholder="Search for order number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </motion.div>
      <motion.button
        className="payment-button payment-button--venmo"
        onClick={() => setPaymentQR("venmo")}
        variants={searchBoxAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Venmo</span>
      </motion.button>
      <motion.button
        className="payment-button payment-button--zelle"
        onClick={() => setPaymentQR("zelle")}
        variants={searchBoxAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Zelle</span>
      </motion.button>
      {isAdmin && (
        <motion.button
          className="signout-button"
          onClick={() => navigate("/admin")}
          variants={searchBoxAnimation}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Admin</span>
        </motion.button>
      )}
      <motion.button
        className="signout-button"
        onClick={signOut}
        variants={searchBoxAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Sign Out</span>
      </motion.button>
    </div>
  );
};

export default Header;
