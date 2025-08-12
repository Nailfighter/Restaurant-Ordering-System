const {
  cleanUp,

  addOrder,
  getAllOrders,
  getOrderByNum,
  getLastOrderNum,

  getAllOrderItems,
  getOrderItemsByNum,

  getPreparingOrders,
  getCompletedOrders,
  getDelayedOrders,
  setPreparingOrder,
  setCompletedOrder,
  setDelayedOrder,

  getTotalSales,
  getSalesByDate,
  getNumOfOrdersByDate,

  getTotalSalesByItem,
  getOrdersByItems,

  getAverageRevenuePerOrder,
  getAverageOrderSize,

  getHourlyInfo,
  getSalesByItemByDay,

  getOrdersByItemsByDay,

  test,
} = require("./Database");

const { checkValidOrder } = require("./Payload_Validation");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const port = 5000 || process.env.PORT;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const getDateByNum = (num) => {
  let date = null;

  switch (num) {
    case "1":
      date = "2025-08-06";
      break;
    case "2":
      date = "2025-08-07";
      break;
    case "3":
      date = "2025-08-08";
      break;
    default:
      date = "2025-08-06";
      break;
  }

  return date;
};

//region API ROUTES: /api/clean-up

app.delete("/api/clean", async (req, res) => {
  await cleanUp();
  res.send({ message: "Database cleaned up!" });
});

//endregion

//#region API ROUTES: /api/kiosk/orders

app.get("/api/kiosk/orders", async (req, res) => {
  const tes = await getAllOrders();
  res.send(tes);
});

app.post("/api/kiosk/orders", async (req, res) => {
  const error = checkValidOrder(req.body);

  if (error != undefined) {
    res.status(400);
    res.send({
      message: "Invalid order payload",
      error: error.details,
    });
    return;
  }

  res.status(201);
  const order = req.body;
  await addOrder(order);

  const orderNum = await getLastOrderNum();

  broadcast({ type: "NEW_ORDER", orderNum, order });

  res.send({
    message: "Order created successfully!",
  });
});

app.get("/api/kiosk/orders/order/:num", async (req, res) => {
  const { num } = req.params;
  const order = await getOrderByNum(num);
  res.send(order);
});

app.get("/api/kiosk/orders/last", async (req, res) => {
  const orderNum = await getLastOrderNum();
  res.send({ order_num: orderNum });
});

//#endregion

//#region API ROUTES: /api/kiosk/order-items

app.get("/api/kiosk/order-items", async (req, res) => {
  const orderItems = await getAllOrderItems();
  res.send(orderItems);
});

app.get("/api/kiosk/order-items/order/:num", async (req, res) => {
  const { num } = req.params;
  const orderItems = await getOrderItemsByNum(num);
  res.send(orderItems);
});

//#endregion

//#region API ROUTES: /api/kitchen

app.get("/api/kitchen/preparing", async (req, res) => {
  const pending = await getPreparingOrders();
  res.send(pending);
});

app.get("/api/kitchen/completed", async (req, res) => {
  const done = await getCompletedOrders();
  res.send(done);
});

app.get("/api/kitchen/delayed", async (req, res) => {
  const delayed = await getDelayedOrders();
  res.send(delayed);
});

app.put("/api/kitchen/preparing/order/:num", async (req, res) => {
  const { num } = req.params;
  await setPreparingOrder(num);
  broadcast({ type: "ORDER_STATUS_CHANGE" });
  res.send({ message: "Order status updated!" });
});

app.put("/api/kitchen/completed/order/:num", async (req, res) => {
  const { num } = req.params;
  await setCompletedOrder(num);
  broadcast({ type: "ORDER_STATUS_CHANGE" });
  res.send({ message: "Order status updated!" });
});

app.put("/api/kitchen/delayed/order/:num", async (req, res) => {
  const { num } = req.params;
  await setDelayedOrder(num);
  broadcast({ type: "ORDER_STATUS_CHANGE" });
  res.send({ message: "Order status updated!" });
});

//#endregion

//#region API ROUTES: /api/dashboard

app.get("/api/dashboard/sales/total", async (req, res) => {
  const totalSales = await getTotalSales();
  res.send(totalSales[0]);
});

app.get("/api/dashboard/sales/:num", async (req, res) => {
  const { num } = req.params;
  const date = getDateByNum(num);
  const sales = await getSalesByDate(date);
  res.send(sales[0]);
});

app.get("/api/dashboard/orders/total", async (req, res) => {
  const orders = await getAllOrders();
  res.send({ total_orders: orders.length });
});

app.get("/api/dashboard/orders/:num", async (req, res) => {
  const { num } = req.params;
  const date = getDateByNum(num);
  const numOfOrders = await getNumOfOrdersByDate(date);
  res.send(numOfOrders[0]);
});

app.get("/api/dashboard/items/sale/total", async (req, res) => {
  const items = await getTotalSalesByItem();
  res.send(items);
});

app.get("/api/dashboard/items/sale/:num", async (req, res) => {
  const { num } = req.params;
  const date = getDateByNum(num);
  const items = await getSalesByItemByDay(date);
  res.send(items);
});

app.get("/api/dashboard/items/order/total", async (req, res) => {
  const items = await getOrdersByItems();
  res.send(items);
});

app.get("/api/dashboard/items/order/:num", async (req, res) => {
  const { num } = req.params;
  const date = getDateByNum(num);
  const items = await getOrdersByItemsByDay(date);
  res.send(items);
});

app.get("/api/dashboard/stat/aro", async (req, res) => {
  const stat = await getAverageRevenuePerOrder();
  res.send(stat[0]);
});

app.get("/api/dashboard/stat/aos", async (req, res) => {
  const stat = await getAverageOrderSize();
  res.send(stat[0]);
});

app.get("/api/dashboard/hourly", async (req, res) => {
  const hourly = await getHourlyInfo();
  res.send(hourly);
});

app.get("/api/dashboard/date/:num", async (req, res) => {
  const { num } = req.params;
  const date = getDateByNum(num);
  res.send({ date });
});

app.get("/api/dashboard/orders/date/:num", async (req, res) => {
  const { num } = req.params;
  const date = getDateByNum(num);
  const orders = await getAllOrders();
  const filteredOrders = orders.filter(
    (order) => order.created_time.toISOString().split("T")[0] === date
  );
  res.send(filteredOrders);
});

app.get("/api/test", async (req, res) => {
  const tes = await test();
  res.send({ message: tes });
});
