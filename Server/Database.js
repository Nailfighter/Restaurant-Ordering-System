require("dotenv").config();
const mysql = require("mysql2"); // For MySQL database

//#region Database connection configuration
const dbConfig = {
  host: process.env.RDB_HOST,
  port: process.env.RDB_PORT,
  user: process.env.RDB_USER,
  password: process.env.RDB_PASSWORD,
  database: process.env.RDB_DATABASE,
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Database connected!");
    connection.release();
  }
});

//#endregion

//#region  HELPER FUNCTIONS

async function insertOrder(order) {
  const { status = "Pending", totalPrice, note = null } = order;

  const query = `
    INSERT INTO Orders (status, total_price, note)
    VALUES (?, ?, ?);
  `;
  const [results] = await promisePool.query(query, [status, totalPrice, note]);
  return results.insertId;
}

async function insertOrderItems(orderNum, cart) {
  const query = `
    INSERT INTO Order_Items (order_num, item_id, item_name, quantity, price) 
    VALUES (?, ?, ?, ?, ?);
  `;

  for (const item of cart) {
    const { itemID, itemName, quantity, itemPrice } = item;
    await promisePool.query(query, [
      orderNum,
      itemID,
      itemName,
      quantity,
      itemPrice,
    ]);
  }
}

//#endregion

// Clean up the database
async function cleanUp() {
  await promisePool.query("TRUNCATE TABLE Orders");
  await promisePool.query("TRUNCATE TABLE Order_Items");
}

//#region  API FUNCTIONS: /api/kiosk/orders
async function getLastOrderNum() {
  const query = "SELECT MAX(order_num) AS order_num FROM Orders";
  const [results] = await promisePool.query(query);
  return results[0].order_num;
}

async function getAllOrders() {
  const query = "SELECT * FROM Orders";
  const [results] = await promisePool.query(query); // Only destructure results
  return results;
}

async function getOrderByNum(num) {
  const query = "SELECT * FROM Orders WHERE order_num = ?";
  const [results] = await promisePool.query(query, [num]);
  return results;
}

async function addOrder(order) {
  const orderNum = await insertOrder(order);
  await insertOrderItems(orderNum, order.cart);
  return orderNum;
}

//#endregion

//#region  API FUNCTIONS: /api/kiosk/order-items

async function getAllOrderItems() {
  const query = "SELECT * FROM Order_Items";
  const [results] = await promisePool.query(query);
  return results;
}

async function getOrderItemsByNum(num) {
  const query = "SELECT * FROM Order_Items WHERE order_num = ?";
  const [results] = await promisePool.query(query, [num]);
  return results;
}

//#endregion

//#region  API FUNCTIONS: /api/kitchen

async function getPreparingOrders() {
  const query = "SELECT * FROM Orders WHERE status = 'Preparing'";
  const [results] = await promisePool.query(query);
  return results;
}

async function getCompletedOrders() {
  const query = "SELECT * FROM Orders WHERE status = 'Completed'";
  const [results] = await promisePool.query(query);
  return results;
}

async function getDelayedOrders() {
  const query = "SELECT * FROM Orders WHERE status = 'Delayed'";
  const [results] = await promisePool.query(query);
  return results;
}

async function setPreparingOrder(orderNum) {
  const query = "UPDATE Orders SET status = 'Preparing' WHERE order_num = ?";
  await promisePool.query(query, [orderNum]);
}

async function setCompletedOrder(orderNum) {
  const query = "UPDATE Orders SET status = 'Completed' WHERE order_num = ?";
  await promisePool.query(query, [orderNum]);
}

async function setDelayedOrder(orderNum) {
  const query = "UPDATE Orders SET status = 'Delayed' WHERE order_num = ?";
  await promisePool.query(query, [orderNum]);
}

//#endregion

async function test() {
  return "API Test is Working!";
}

// (async () => {
//   const num = await addOrder(payLoad);
//   await pool.end();
// })();

module.exports = {
  cleanUp,

  getLastOrderNum,
  getAllOrders,
  getOrderByNum,
  addOrder,

  getAllOrderItems,
  getOrderItemsByNum,

  getPreparingOrders,
  getCompletedOrders,
  getDelayedOrders,
  setPreparingOrder,
  setCompletedOrder,
  setDelayedOrder,

  test,
};
