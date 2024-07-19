const {
  cleanUp,

  addOrder,
  getAllOrders,
  getOrderByNum,
  getLastOrderNum,

  getAllOrderItems,
  getOrderItemsByNum,
  test,
} = require("./Database");

const { checkValidOrder } = require("./Payload_Validation");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 5000 || process.env.PORT;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


//region API ROUTES: /api/clean-up

app.delete("/api/clean-up", async (req, res) => {
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

app.get("/api/test", async (req, res) => {
  const tes = await test();
  res.send(tes);
});
