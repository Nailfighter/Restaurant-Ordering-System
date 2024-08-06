import React, { useState, useEffect, useContext } from "react";
import { Howl, Howler } from "howler";
import OrderCard from "./Order_Card";
import { TabsContext } from "./Tabs";

const apiURL = import.meta.env.VITE_API_URL;

const fetchJson = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const getPendingOrders = () => fetchJson(`${apiURL}/api/kitchen/preparing`);
const getDelayedOrders = () => fetchJson(`${apiURL}/api/kitchen/delayed`);
const getCompletedOrders = () => fetchJson(`${apiURL}/api/kitchen/completed`);
const getOrderItemsByNum = (num) =>
  fetchJson(`${apiURL}/api/kiosk/order-items/order/${num}`);

const ActiveOrders = () => {
  const sound = new Howl({
    src: ["/Notification.mp3"],
  });

  const { activeTab } = useContext(TabsContext);
  const [orders, setOrders] = useState({
    pending: [],
    delayed: [],
    completed: [],
  });
  const [orderItems, setOrderItems] = useState({});

  const fetchOrdersAndItems = async () => {
    const [pending, delayed, completed] = await Promise.all([
      getPendingOrders(),
      getDelayedOrders(),
      getCompletedOrders(),
    ]);

    const newOrders = { pending, delayed, completed };

    const allOrders = [...pending, ...delayed, ...completed];
    const itemsPromises = allOrders.map((order) =>
      getOrderItemsByNum(order.order_num).then((items) => ({
        order_num: order.order_num,
        items,
      }))
    );

    const itemsArray = await Promise.all(itemsPromises);
    const itemsObject = itemsArray.reduce((acc, { order_num, items }) => {
      acc[order_num] = items;
      return acc;
    }, {});

    setOrders(newOrders);
    setOrderItems(itemsObject);
  };

  useEffect(() => {
    fetchOrdersAndItems();

    const ws = new WebSocket("wss://api.osafood.online");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_ORDER") {
        sound.play();
      }
      if (data.type === "ORDER_STATUS_CHANGE" || data.type === "NEW_ORDER") {
        fetchOrdersAndItems();
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  if (activeTab === "History") {
    if (orders.completed.length === 0) {
      return (
        <div className="no-active-order">
          <h3>No Completed Orders</h3>
        </div>
      );
    }
    return (
      <div className="active-orders">
        {orders.completed.map((order) => (
          <OrderCard
            key={order.order_num}
            order={order}
            items={orderItems[order.order_num] || []}
          />
        ))}
      </div>
    );
  }

  if (
    activeTab === "Active" &&
    orders.pending.length === 0 &&
    orders.delayed.length === 0
  ) {
    return (
      <div className="no-active-order">
        <h3>No Active Orders</h3>
      </div>
    );
  }

  return (
    <div className="active-orders">
      {activeTab === "Active" &&
        orders.pending.map((order) => (
          <OrderCard
            key={order.order_num}
            order={order}
            items={orderItems[order.order_num] || []}
          />
        ))}
      {activeTab === "Active" &&
        orders.delayed.map((order) => (
          <OrderCard
            key={order.order_num}
            order={order}
            items={orderItems[order.order_num] || []}
          />
        ))}
    </div>
  );
};

export default ActiveOrders;
