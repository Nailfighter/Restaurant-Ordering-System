// 'use client';
import React, { useState, useEffect, useContext } from "react";
import { AreaChart, Card } from "@tremor/react";
import { getOrdersByHour } from "../Fetch_Data";
import { FilterContext } from "../FilterContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}




const valueFormatter = (number, type) =>
  `${type === "Sales" ? "$" : ""}${Intl.NumberFormat("us")
    .format(number)
    .toString()}`;

export default function Line_Info({ type }) {
  const { selectedDate } = useContext(FilterContext);
  const [data, setData] = useState([]);

  // Fetch data when selectedDate changes
  useEffect(() => {
    async function fetchData() {
      const result = await getOrdersByHour(
        selectedDate
      ); // Replace with actual URL and selectedDate
      setData(result);
    }

    fetchData();
  }, [selectedDate]);

  const categories = type === "Sales" ? ["RevenuePerHour"] : ["OrderPerHour"];
  const colors = type === "Sales" ? ["purple"] : ["indigo"];

  return (
    <Card>
      <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {type === "Sales" ? "Sales" : "Orders"} Per Hour
      </h3>

      <AreaChart
        data={data}
        index="time"
        categories={categories}
        colors={colors}
        valueFormatter={(number) => valueFormatter(number, type)}
        className="mt-6 hidden h-48 sm:block"
        intervalType="time"
        showAnimation={true}
        animationDuration={3000}
        curveType="linear"
        showLegend={false}
      />
    </Card>
  );
}
