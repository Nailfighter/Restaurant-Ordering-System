require("dotenv").config();
const mysql = require("mysql2"); // For MySQL database

// Database connection configuration
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

//Queries

async function getAllOrders() {
  const query = "SELECT * FROM Orders";
  const [results] = await promisePool.query(query); // Only destructure results
  return results;
}

async function addOrder(order) {
  const orderNum = await insertOrder(order);
  await insertOrderItems(orderNum, order.cart);
  return orderNum;
}

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

const payLoad = {
  status: "Preparing",
  totalPrice: 42,
  note: "This is a test order",

  cart: [
    {
      itemID: 1,
      itemName: "Chicken Curry with Rice + Naan",
      quantity: 2,
      itemPrice: 24,
    },
    {
      itemID: 2,
      itemName: "Tandoori Chicken",
      quantity: 3,
      itemPrice: 18,
    },
  ],
};

async function test() {
  return "Test";
}

(async () => {
  const num = await getAllOrders();
  console.log(num);
  await pool.end();
})();

module.exports = {
  getAllOrders,
  addOrder,
  test,
};
