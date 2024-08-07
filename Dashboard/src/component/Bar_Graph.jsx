import React, { useState, useEffect, useContext } from "react";
import { BarChart, Card, Divider } from "@tremor/react";
import {
  getSalesByDay,
  getOrdersByDay,
  getAvgOrderTimeByDay,
  getDateFromServer,
} from "../Fetch_Data";

import { FilterContext } from "../FilterContext";
// Value formatter function
function valueFormatter(number, type) {
  if (type === "Date") {
    const date = new Date(number + "T12:00:00");
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  if (type === "Time") {
    return `${number} min`;
  }

  if (type === "Orders") {
    return number;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    minimumFractionDigits: 0,
    currency: "USD",
  });

  return formatter.format(number);
}

export default function Bar_Graph({ type }) {
  const { selectedDate, setSelectedDate } = useContext(FilterContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let data = {
        Sales: [],
        Orders: [],
        Time: [],
      };

      for (let i = 1; i < 4; i++) {
        const date = valueFormatter(await getDateFromServer(i), "Date");
        const sales = await getSalesByDay(i);
        const orders = await getOrdersByDay(i);
        const time = await getAvgOrderTimeByDay(i);
        data.Sales.push({ date, Sales: sales });
        data.Orders.push({ date, Orders: orders });
        data.Time.push({ date, Time: time });
      }

      setChartData(data);
    };

    fetchData();
  }, [type]);

  const title =
    type === "Sales"
      ? "Total Sales Over Time"
      : type === "Orders"
      ? "Total Orders Over Time"
      : "Average Order Fulfillment Time Over Time";

  const categories = [type];

  return (
    <Card className="sm:mx-auto sm:max-w-2xl">
      <h3 className="ml-1 mr-1 font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {title}
      </h3>
      <Divider />
      <BarChart
        data={chartData[type]}
        index="date"
        categories={categories}
        colors={["indigo"]}
        valueFormatter={(number) => valueFormatter(number, type)}
        yAxisWidth={50}
        className="mt-6 hidden h-60 sm:block"
        showLegend={false}
        showTooltip={true}
      />
    </Card>
  );
}
