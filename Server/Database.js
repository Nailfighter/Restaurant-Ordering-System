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

//#region  API FUNCTIONS: /api/dashboard

async function getTotalSales() {
  const query = "SELECT SUM(total_price) as total_sales FROM Orders";
  const [results] = await promisePool.query(query);
  return results;
}

async function getSalesByDate(date) {
  const query =
    "SELECT SUM(total_price) as total_sales FROM Orders WHERE DATE(CONVERT_TZ(created_time, '+00:00', '-04:00')) = ?";
  const [results] = await promisePool.query(query, [date]);
  return results;
}

async function getNumOfOrdersByDate(date) {
  const query =
    "SELECT COUNT(*) as total_orders FROM Orders WHERE DATE(CONVERT_TZ(created_time, '+00:00', '-04:00')) = ?";
  const [results] = await promisePool.query(query, [date]);
  return results;
}

async function getTotalSalesByItem() {
  const query = `WITH Totals AS (
    SELECT 
        SUM(price) AS total_amount,
        SUM(quantity) AS total_quantity
    FROM Order_Items
),
ItemShares AS (
    SELECT 
        item_id,
        item_name AS name,
        SUM(price) AS amount,
        SUM(quantity) AS quantity
    FROM Order_Items
    GROUP BY item_id, item_name
)
SELECT 
    item_id,
    name,
    amount,
    quantity,
    CONCAT(ROUND((amount / total_amount) * 100, 2), "%") AS amountShare,
    ROUND((quantity / total_quantity) * 100, 2) AS quantityShare
FROM ItemShares, Totals
ORDER BY item_id;`;
  const [results] = await promisePool.query(query);
  return results;
}

async function getSalesByItemByDay(date) {
  const query = `
    WITH Totals AS (
      SELECT 
          SUM(oi.price) AS total_amount,
          SUM(oi.quantity) AS total_quantity
      FROM Order_Items oi
      JOIN Orders o ON oi.order_num = o.order_num
      WHERE DATE(CONVERT_TZ(o.created_time, '+00:00', '-04:00')) = ?
    ),
    ItemShares AS (
      SELECT 
          oi.item_id,
          oi.item_name AS name,
          SUM(oi.price) AS amount,
          SUM(oi.quantity) AS quantity
      FROM Order_Items oi
      JOIN Orders o ON oi.order_num = o.order_num
      WHERE DATE(CONVERT_TZ(o.created_time, '+00:00', '-04:00')) = ?
      GROUP BY oi.item_id, oi.item_name
    )
    SELECT 
        item_id,
        name,
        amount,
        quantity,
        CONCAT(ROUND((amount / total_amount) * 100, 2), "%") AS amountShare,
        ROUND((quantity / total_quantity) * 100, 2) AS quantityShare
    FROM ItemShares, Totals;
  `;

  // Use date twice, once for filtering totals and once for filtering item shares
  const [results] = await promisePool.query(query, [date, date]);
  return results;
}


async function getOrdersByItems() {
  const query = `SELECT item_name as name, SUM(quantity) as value FROM Order_Items GROUP BY item_id;`;
  const [results] = await promisePool.query(query);
  return results;
}

async function getOrdersByItemsByDay(date) {
  const query = `
    SELECT item_name AS name, SUM(quantity) AS value
    FROM Order_Items oi
    JOIN Orders o ON oi.order_num = o.order_num
    WHERE DATE(CONVERT_TZ(o.created_time, '+00:00', '-04:00')) = ?
    GROUP BY item_name;
  `;
  const [results] = await promisePool.query(query, [date]);
  return results;
}



async function getAverageRevenuePerOrder() {
  const query = `SELECT ROUND(SUM(total_price) / COUNT(*),2) as ARO FROM Orders;`;
  const [results] = await promisePool.query(query);
  return results;
}

async function getAverageOrderSize() {
  const query = `SELECT 
    ROUND(AVG(order_size),1) AS AOS
FROM (
    SELECT 
        order_num, 
        SUM(quantity) AS order_size
    FROM Order_Items
    GROUP BY order_num
) AS order_sizes;`;
  const [results] = await promisePool.query(query);
  return results;
}

async function getHourlyInfo() {
  const query = `WITH HourRange AS (
    SELECT '08:00:00' AS hour_start
    UNION ALL SELECT '09:00:00'
    UNION ALL SELECT '10:00:00'
    UNION ALL SELECT '11:00:00'
    UNION ALL SELECT '12:00:00'
    UNION ALL SELECT '13:00:00'
    UNION ALL SELECT '14:00:00'
    UNION ALL SELECT '15:00:00'
    UNION ALL SELECT '16:00:00'
    UNION ALL SELECT '17:00:00'
    UNION ALL SELECT '18:00:00'
    UNION ALL SELECT '19:00:00'
    UNION ALL SELECT '20:00:00'
    UNION ALL SELECT '21:00:00'
    UNION ALL SELECT '22:00:00'
    UNION ALL SELECT '23:00:00'
),
OrderCounts AS (
    SELECT
        DATE(CONVERT_TZ(created_time, '+00:00', '-04:00')) AS order_date, -- Convert UTC to EDT
        DATE_FORMAT(CONVERT_TZ(created_time, '+00:00', '-04:00'), '%H:00:00') AS order_hour,
        COUNT(*) AS number_of_orders
    FROM Orders
    WHERE TIME(CONVERT_TZ(created_time, '+00:00', '-04:00')) >= '08:00:00'
      AND TIME(CONVERT_TZ(created_time, '+00:00', '-04:00')) <= '23:00:00'
    GROUP BY DATE(CONVERT_TZ(created_time, '+00:00', '-04:00')), DATE_FORMAT(CONVERT_TZ(created_time, '+00:00', '-04:00'), '%H:00:00')
)
SELECT
    CONCAT(oc.order_date, ' ', hr.hour_start) AS hour_range,
    COALESCE(oc.number_of_orders, 0) AS number_of_orders
FROM HourRange hr
LEFT JOIN OrderCounts oc ON oc.order_hour = hr.hour_start
ORDER BY oc.order_date, hr.hour_start;`;
  const [results] = await promisePool.query(query);
  return results;
}

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

  getSalesByDate,
  getTotalSales,
  getNumOfOrdersByDate,

  getTotalSalesByItem,
  getOrdersByItems,

  getAverageRevenuePerOrder,
  getAverageOrderSize,

  getHourlyInfo,

  getOrdersByItemsByDay,
  getSalesByItemByDay,
  test,
};
