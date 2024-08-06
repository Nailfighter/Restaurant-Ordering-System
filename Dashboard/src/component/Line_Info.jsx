// 'use client';

import {
  LineChart,
  Card,
} from "@tremor/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const generateDummyData = () => {
  const data = [];
  const startHour = 8;
  const endHour = 22;

  for (let hour = startHour; hour <= endHour; hour++) {
    const time =
      hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`;
    const entry = {
      time,
      "Aug 7": Math.floor(Math.random() * 10) + 5, // Random number of orders between 5 and 10 for Aug 7
      "Aug 8": Math.floor(Math.random() * 24) + 5, // Random number of orders between 5 and 10 for Aug 8
      "Aug 9": Math.floor(Math.random() * 15) + 5, // Random number of orders between 5 and 10 for Aug 9
    };
    data.push(entry);
  }

  return data;
};

const data = generateDummyData();


const valueFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const categories = ["Aug 7", "Aug 8", "Aug 9"];

export default function Line_Info() {
  return (
    <Card>
      <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        No of Orders Over Time
      </h3>
      <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Orders Fullfilled: 45
      </p>
      <LineChart
        data={data}
        index="time"
        categories={categories}
        colors={["blue", "violet", "fuchsia"]}
        valueFormatter={valueFormatter}
        yAxisWidth={60}
        className="mt-6 hidden h-96 sm:block"
        intervalType="hour"
        showAnimation={true}
        animationDuration={3000}
        curveType="natural"
        
      />
    </Card>
  );
}
