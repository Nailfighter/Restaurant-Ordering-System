require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { createClient } = require("@supabase/supabase-js");

//#region Database connection configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { error } = await supabase.from("orders").select("order_num").limit(1);
    if (error) throw error;
    console.log("Database connected successfully to Supabase");
    return true;
  } catch (err) {
    console.error("Error connecting to Supabase:", err.message);
    console.error("   Check SUPABASE_URL and SUPABASE_KEY in your .env file");
    return false;
  }
}

// Test connection on startup
testConnection();

//#endregion

//#region  HELPER FUNCTIONS

// Retry mechanism for cloud database operations
async function executeWithRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(
        `Database operation failed, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function insertOrder(order) {
  const { status = "Pending", totalPrice, note = null, createdBy = null } = order;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      status,
      total_price: totalPrice,
      note,
      created_by: createdBy,
      updated_by: createdBy,
    })
    .select("order_num")
    .single();

  if (error) throw error;
  return data.order_num;
}

async function insertOrderItems(orderNum, cart) {
  const rows = cart.map(({ itemID, itemName, quantity, itemPrice }) => ({
    order_num: orderNum,
    item_id: itemID,
    item_name: itemName,
    quantity,
    price: itemPrice,
  }));

  const { error } = await supabase.from("order_items").insert(rows);
  if (error) throw error;
}

//#endregion

// Clean up the database
async function cleanUp() {
  const { error } = await supabase.rpc("clean_up_orders");
  if (error) throw error;
}

//#region  API FUNCTIONS: /api/kiosk/orders
async function getLastOrderNum() {
  const { data, error } = await supabase
    .from("orders")
    .select("order_num")
    .order("order_num", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? data.order_num : null;
}

async function getAllOrders() {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) throw error;
  return data;
}

async function getOrderByNum(num) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_num", num);
  if (error) throw error;

  if (data && data.length > 0) {
    const { data: opData } = await supabase.rpc("get_order_operator_info", {
      p_order_num: Number(num),
    });
    const info = opData && opData[0];
    if (info) {
      data[0].created_by_name = info.created_by_name || info.created_by_username || null;
      data[0].updated_by_name = info.updated_by_name || info.updated_by_username || null;
    }
  }

  return data;
}

async function addOrder(order) {
  const orderNum = await insertOrder(order);
  await insertOrderItems(orderNum, order.cart);
  return orderNum;
}

//#endregion

//#region  API FUNCTIONS: /api/kiosk/order-items

async function getAllOrderItems() {
  const { data, error } = await supabase.from("order_items").select("*");
  if (error) throw error;
  return data;
}

async function getOrderItemsByNum(num) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_num", num);
  if (error) throw error;
  return data;
}

//#endregion

//#region  API FUNCTIONS: /api/kitchen

async function getPreparingOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "Preparing");
  if (error) throw error;
  return data;
}

async function getCompletedOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "Completed");
  if (error) throw error;
  return data;
}

async function getDelayedOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "Delayed");
  if (error) throw error;
  return data;
}

async function setPreparingOrder(orderNum, updatedBy = null) {
  const update = { status: "Preparing" };
  if (updatedBy) update.updated_by = updatedBy;

  const { error } = await supabase.from("orders").update(update).eq("order_num", orderNum);
  if (error) throw error;
}

async function setCompletedOrder(orderNum, updatedBy = null) {
  const update = { status: "Completed" };
  if (updatedBy) update.updated_by = updatedBy;

  const { error } = await supabase.from("orders").update(update).eq("order_num", orderNum);
  if (error) throw error;
}

async function setDelayedOrder(orderNum, updatedBy = null) {
  const update = { status: "Delayed" };
  if (updatedBy) update.updated_by = updatedBy;

  const { error } = await supabase.from("orders").update(update).eq("order_num", orderNum);
  if (error) throw error;
}

//#endregion

//#region  API FUNCTIONS: /api/dashboard

async function getTotalSales() {
  const { data, error } = await supabase.rpc("get_total_sales");
  if (error) throw error;
  return [{ total_sales: data }];
}

async function getSalesByDate(date) {
  const { data, error } = await supabase.rpc("get_sales_by_date", {
    p_date: date,
  });
  if (error) throw error;
  return [{ total_sales: data }];
}

async function getNumOfOrdersByDate(date) {
  const { data, error } = await supabase.rpc("get_num_of_orders_by_date", {
    p_date: date,
  });
  if (error) throw error;
  return [{ total_orders: data }];
}

async function getTotalSalesByItem() {
  const { data, error } = await supabase.rpc("get_total_sales_by_item");
  if (error) throw error;
  return data;
}

async function getSalesByItemByDay(date) {
  const { data, error } = await supabase.rpc("get_sales_by_item_by_day", {
    p_date: date,
  });
  if (error) throw error;
  return data;
}

async function getOrdersByItems() {
  const { data, error } = await supabase.rpc("get_orders_by_items");
  if (error) throw error;
  return data;
}

async function getOrdersByItemsByDay(date) {
  const { data, error } = await supabase.rpc("get_orders_by_items_by_day", {
    p_date: date,
  });
  if (error) throw error;
  return data;
}

async function getAverageRevenuePerOrder() {
  const { data, error } = await supabase.rpc("get_average_revenue_per_order");
  if (error) throw error;
  return [{ ARO: data }];
}

async function getAverageOrderSize() {
  const { data, error } = await supabase.rpc("get_average_order_size");
  if (error) throw error;
  return [{ AOS: data }];
}

async function getHourlyInfo() {
  const { data, error } = await supabase.rpc("get_hourly_info");
  if (error) throw error;
  return data;
}

//#endregion

async function test() {
  return "Backend Connection is Working!";
}

module.exports = {
  cleanUp,
  testConnection,
  executeWithRetry,

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
