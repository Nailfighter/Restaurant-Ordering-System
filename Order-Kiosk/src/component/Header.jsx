import React, { useState, useEffect } from "react";

const apiURL = import.meta.env.VITE_API_URL;

function convertDate(dateString) {
  const isoDateString = dateString.replace(" ", "T");
  let date = new Date(isoDateString);
  date.setHours(date.getHours()); // Adjust time as needed
  return date;
}

function formatOrderNumber(orderNumber) {
  return orderNumber.toString().padStart(3, "0");
}

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
      {showOrder && (
        <div className="order-overlay">
          <div className="order-info">
            <div className="close">
              <button onClick={handleClose}>
                <img src="/Icon/cross.png" alt="Close" />
              </button>
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
                    <div className="order-list-item" key={index}>
                      <h3>{item.item_name}</h3>
                      <h5>x {item.quantity}</h5>
                    </div>
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
          </div>
        </div>
      )}
      <div className="search-box">
        <img src="/Icon/Search.png" alt="Search" />
        <input
          className="search-input"
          placeholder="Search for order number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default Header;
