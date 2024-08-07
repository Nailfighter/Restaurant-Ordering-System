"use client";

import { AreaChart, Card } from "@tremor/react";
import { useContext, useEffect, useState } from "react";
import { FilterContext } from "../FilterContext";
import { getDateFromServer } from "../Fetch_Data";

const data = [
  {
    time: "8:00 AM",
    RevenuePerHour: 0,
    OrderPerHour: 25,
  },
  {
    time: "9:00 AM",
    RevenuePerHour: 200,
    OrderPerHour: 20,
  },
  {
    time: "10:00 AM",
    RevenuePerHour: 300,
    OrderPerHour: 12,
  },
  {
    time: "11:00 AM",
    RevenuePerHour: 100,
    OrderPerHour: 30,
  },
  {
    time: "12:00 AM",
    RevenuePerHour: 450,
    OrderPerHour: 30,
  },
];

const valueFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function Small_Line_Graph({ type }) {
  const { selectedDate } = useContext(FilterContext);
  const [date, setDate] = useState("");

  const categories = type === "Sales" ? ["RevenuePerHour"] : ["OrderPerHour"];

  useEffect(() => {
    const fetchDate = async () => {
      const dateFromServer = await getDateFromServer(selectedDate);
      setDate(formatDate(dateFromServer));
    };

    fetchDate();
  }, [selectedDate]);

  return (
    <>
      <Card className="w-full h-full">
        <AreaChart
          data={data}
          index="time"
          categories={categories}
          colors={["purple"]}
          valueFormatter={valueFormatter}
          yAxisWidth={60}
          className="mt-6 h-32"
          intervalType="preserveStartEnd"
          showGradient={true}
          showYAxis={false}
          showAnimation={true}
          animationDuration={3000}
          curveType="natural"
          showLegend={false}
        />
      </Card>
    </>
  );
}
