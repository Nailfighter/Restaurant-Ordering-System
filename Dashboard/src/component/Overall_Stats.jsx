import { Card, LineChart } from "@tremor/react";
import LineInfo from "./Line_Info";
import Bar_Graph from "./Bar_Graph";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const data = [
  {
    name: "Total Sales Revenue",
    stat: "$3,450",
    change: "+7.7%",
    changeType: "positive",
  },
  {
    name: "Total Number of Orders",
    stat: "1,342",
    change: "+7.7%",
    changeType: "positive",
  },
  {
    name: "Average Order Fulfillment Time",
    stat: "5.2 min",
    change: "+7.7%",
    changeType: "positive",
  },
];

const categories = ["Sales","Orders","Time"];

export default function OverallStats() {
  return (
    <>
      <dl className="containner">
        {data.map((item, index) => (
          <div className="overall">
            <Card
              className="card"
              key={item.name}
              decoration="top"
              decorationColor="indigo"
            >
              <div className="flex items-center justify-between">
                <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                  {item.name}
                </dt>
                <span
                  className={classNames(
                    item.changeType === "positive"
                      ? "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
                      : "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20",
                    "inline-flex items-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset"
                  )}
                >
                  {item.change}
                </span>
              </div>
              <dd className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {item.stat}
              </dd>
            </Card>

            <Bar_Graph type={categories[index]} />
          </div>
        ))}
      </dl>
    </>
  );
}
