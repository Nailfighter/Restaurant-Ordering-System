// 'use client';
import { Card, DonutChart, List, ListItem } from "@tremor/react";
import dummyData from "../Food_List";
import { colors } from "../Food_List";

const modColors = colors.map((color) => color.split("-")[1]);

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const data = dummyData;

const currencyFormatter = (number) => {
  return "$" + Intl.NumberFormat("us").format(number).toString();
};

export default function ItemSalePie() {
  return (
    <div className="flex-1 ">
      <Card className="h-[100%]">
        <h3 className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Total Sales by Each Item
        </h3>
        <DonutChart
          className="mt-8"
          data={data}
          category="amount"
          index="name"
          valueFormatter={currencyFormatter}
          showTooltip={true}
          colors={modColors}
          animationDuration={1000}
          showAnimation={true}
        />
        <p className="mt-8 flex items-center justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
          <span>Item Name</span>
          <span>Amount / Share</span>
        </p>
        <List className="mt-2">
          {data.map((item) => (
            <ListItem key={item.name} className="space-x-6">
              <div className="flex items-center space-x-2.5 truncate">
                <span
                  className={classNames(
                    item.color,
                    "size-2.5 shrink-0 rounded-sm"
                  )}
                  aria-hidden={true}
                />
                <span className="truncate dark:text-dark-tremor-content-emphasis">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  {currencyFormatter(item.amount)}
                </span>
                <span className="rounded-tremor-small bg-tremor-background-subtle px-1.5 py-0.5 text-tremor-label font-medium tabular-nums text-tremor-content-emphasis dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis">
                  {item.amountShare}
                </span>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>
    </div>
  );
}
