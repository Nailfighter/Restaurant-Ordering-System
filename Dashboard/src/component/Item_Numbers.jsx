import { useState } from "react";
import { BarList, Card } from "@tremor/react";
import dummyData from "../Food_List"; // Update the path to where your dummyData is located
import { colors } from "../Food_List"; // Update the path to where your colors are located

const modColors = colors.map((color) => color.split("-")[1]);

const data = dummyData.map((item) => ({
  name: item.name,
  value: item.quantity, // Assuming quantity represents the number of items bought
}));

const valueFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

export default function ItemNumberBarChart() {
  return (
    <div className="flex-1 ">
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-tremor-border p-6 dark:border-dark-tremor-border">
          <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Number of Items Bought
          </p>
          <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
            Quantity
          </p>
        </div>
        <div className={`overflow-hidden p-6 "max-h-[300px]"`}>
          <BarList
            color="indigo"
            data={data}
            valueFormatter={valueFormatter}
            className="max-h-[auto]"
            showAnimation={true}
          />
        </div>

        <div
          className={`flex justify-center ${"absolute inset-x-0 bottom-0 rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent py-7 dark:from-dark-tremor-background"}`}
        ></div>
      </Card>
    </div>
  );
}
