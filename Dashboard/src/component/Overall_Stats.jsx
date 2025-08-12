import React, { useContext, useState, useEffect } from "react";
import { Card, LineChart } from "@tremor/react";
import Bar_Graph from "./Bar_Graph";
import Small_Line_Graph from "./Small_Line_Graph";
import {
  getTotalSales,
  getSalesByDay,
  getTotalOrderNum,
  getOrdersByDay,
  getAvgOrderTime,
  getAvgOrderTimeByDay,
} from "../Fetch_Data";

import { FilterContext } from "../FilterContext";
import LineInfo from "./Line_Info";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const categories = ["Sales", "Orders", "Time"];

const OverallStats = () => {
  const { selectedDate } = useContext(FilterContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const sales =
        selectedDate === "All"
          ? await getTotalSales()
          : await getSalesByDay(selectedDate);

      const orderNum =
        selectedDate === "All"
          ? await getTotalOrderNum()
          : await getOrdersByDay(selectedDate);

      setData([
        {
          name: "Total Sales Revenue",
          stat: formatCurrency(sales),
        },
        {
          name: "Total Number of Orders",
          stat: orderNum,
        },
      ]);
    };

    fetchData();
  }, [selectedDate]);

  return (
    <>
      <dl className="containner">
        {data.map((item, index) => (
          <div className="overall" key={index}>
            <Card className="card" decoration="top" decorationColor="indigo">
              <div className="flex items-center justify-between">
                <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                  {item.name}
                </dt>
              </div>
              <dd className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {item.stat}
              </dd>
            </Card>
            {/* {selectedDate === "All" && <Bar_Graph type={categories[index]} />} */}
          </div>
        ))}
      </dl>

      {selectedDate != "All" && (
        <div className="flex gap-5 justify-between">
          <LineInfo type={categories[0]} />
          <LineInfo type={categories[1]} />
        </div>
      )}
    </>
  );
};

export default OverallStats;
