const apiUrl = import.meta.env.VITE_API_URL;

// #region Helper Functions

function convertStringIntsToJsonInts(obj) {
  const isStringInt = (str) => {
    return (
      typeof str === "string" && !isNaN(str) && Number.isInteger(Number(str))
    );
  };

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        convertStringIntsToJsonInts(obj[key]);
      } else if (isStringInt(obj[key])) {
        obj[key] = parseInt(obj[key], 10);
      }
    }
  }

  return obj;
}

// #endregion

const fetchJson = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export async function getDateFromServer(num) {
  const url = `${apiUrl}/api/dashboard/date/${num}`;
  const dates = await fetchJson(url);
  return dates.date;
}

export async function getTotalSales() {
  const url = `${apiUrl}/api/dashboard/sales/total`;
  const total = await fetchJson(url);
  return total.total_sales;
}

export async function getSalesByDay(num) {
  const url = `${apiUrl}/api/dashboard/sales/${num}`;
  const total = await fetchJson(url);
  return total.total_sales;
}

export async function getTotalOrderNum() {
  const url = `${apiUrl}/api/dashboard/orders/total`;
  const total = await fetchJson(url);
  return total.total_orders;
}

export async function getOrdersByDay(num) {
  const url = `${apiUrl}/api/dashboard/orders/${num}`;
  const total = await fetchJson(url);
  return total.total_orders;
}

export async function getAvgOrderTimeByDay() {
  return 2;
}

export async function getAvgOrderTime() {
  return 5.5;
}

export async function getTotalSalesByItem() {
  const url = `${apiUrl}/api/dashboard/items/sale/total`;
  const total = await fetchJson(url);
  return convertStringIntsToJsonInts(total);
}

export async function getSalesByItemByDay(num) {
  const url = `${apiUrl}/api/dashboard/items/sale/${num}`;
  const total = await fetchJson(url);
  return convertStringIntsToJsonInts(total);
}

export async function getOrderByItems() {
  const url = `${apiUrl}/api/dashboard/items/order/total`;
  const total = await fetchJson(url);
  return convertStringIntsToJsonInts(total);
}

export async function getOrdersByItemsByDay(num) {
  const url = `${apiUrl}/api/dashboard/items/order/${num}`;
  const total = await fetchJson(url);
  return convertStringIntsToJsonInts(total);
}


export async function getInsight() {
  let url = `${apiUrl}/api/dashboard/stat/aro`;
  const AvRO = await fetchJson(url);
  url = `${apiUrl}/api/dashboard/stat/aos`;
  const AvgOS = await fetchJson(url);

  const insight = { ARO: AvRO.ARO, AOS: AvgOS.AOS };
  return insight;
}

export async function getOrdersByHour(num) {
  try {
    const response = await fetch(`${apiUrl}/api/dashboard/orders/date/${num}`);
    const orders = convertStringIntsToJsonInts(await response.json());

    const hoursRange = {};
    for (let hour = 8; hour <= 22; hour++) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = `${hour % 12 || 12} ${ampm}`;
      hoursRange[formattedHour] = {
        count: 0,
        totalPrice: 0,
      };
    }

    orders.forEach((order) => {
      const localDate = new Date(order.created_time);
      const hours = localDate.getUTCHours();
      const localHour = (hours - 4 + 24) % 24; // Adjusting for EDT (UTC-4), use -5 for EST

      const ampm = localHour >= 12 ? "PM" : "AM";
      const formattedHour = `${localHour % 12 || 12} ${ampm}`;

      if (hoursRange.hasOwnProperty(formattedHour)) {
        hoursRange[formattedHour].count++;
        hoursRange[formattedHour].totalPrice += order.total_price;
      }
    });

    const result = Object.keys(hoursRange).map((hour) => ({
      time: hour,
      RevenuePerHour: hoursRange[hour].totalPrice,
      OrderPerHour: hoursRange[hour].count,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching or processing orders:", error);
    return [];
  }
}
