// 'use client';

import { RiExternalLinkLine } from "@remixicon/react";
import { Card, Tab, TabGroup, TabList } from "@tremor/react";
import { info } from "autoprefixer";

const usage = [
  {
    id: 1,
    title: "Average Revenue per Order",
    info: "$7.2",
    sub: "‎ ",
  },
  {
    id: 2,
    title: "Average Order Size",
    info: "1.2",
    sub: "‎ items",
  },
];

export default function Insights() {
  return (
    <Card className="p-0 sm:mx-auto sm:max-w-lg">
      <div className="flex items-center justify-between border-b border-tremor-border p-6 dark:border-dark-tremor-border">
        <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Insights
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:max-w-3xl sm:grid-cols-2 p-6">
        {usage.map((item) => (
          <Card
            key={item.id}
            className="p-4 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
          >
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              {item.title}
            </p>
            <p className="mt-3 flex items-end">
              <span className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {item.info}
              </span>
              <span className="font-semibold text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                {item.sub}
              </span>
            </p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
