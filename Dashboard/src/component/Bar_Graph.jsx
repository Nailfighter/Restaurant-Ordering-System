// 'use client';
import { useState } from "react";
import { BarChart, Card, Divider } from "@tremor/react";

// Define data with types
const data = {
  Sales: [
    { date: "Aug 7", Sales: 1523 },
    { date: "Aug 8", Sales: 2933 },
    { date: "Aug 9", Sales: 2533 },
  ],
  Orders: [
    { date: "Aug 7", Orders: 450 },
    { date: "Aug 8", Orders: 345 },
    { date: "Aug 9", Orders: 253 },
  ],
  Time: [
    { date: "Aug 7", Time: 5.2 },
    { date: "Aug 8", Time: 5.3 },
    { date: "Aug 9", Time: 8 },
  ],
};

// Value formatter function
function valueFormatter(number, type) {
  // Use a different format for different types
  if (type === "Time") {
    return `${number} min`;
  }

  if (type === "Orders") {
    return number;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "USD",
  });

  return formatter.format(number);
}

// Bar_Graph component
export default function Bar_Graph({ type }) {
  // Define chart title based on type
  const title =
    type === "Sales"
      ? "Total Sales Over Time"
      : type === "Orders"
      ? "Total Orders Over Time"
      : "Average Order Fulfillment Time Over Time";

  // Determine chart data and categories based on type
  const chartData = data[type];
  let categories;
  switch (type) {
    case "Time":
      categories = ["Time"];
      break;
    case "Orders":
      categories = ["Orders"];
      break;
    default:
      categories = ["Sales"];
      break;
  }

  return (
    <Card
      className="sm:mx-auto sm:max-w-2xl"
    >
      <h3 className="ml-1 mr-1 font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {title}
      </h3>
      <Divider />
      <BarChart
        data={chartData}
        index="date"
        categories={categories}
        colors={["indigo"]}
        valueFormatter={(number) => valueFormatter(number, type)}
        yAxisWidth={50}
        className="mt-6 hidden h-60 sm:block"
        animationDuration={1000}
        showAnimation={true}
        showLegend={false}
        showTooltip={true}
        showYAxis={false}
      />
    </Card>
  );
}
