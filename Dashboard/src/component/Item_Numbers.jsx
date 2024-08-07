import { useEffect, useState, useContext } from "react";
import { BarList, Card } from "@tremor/react";
import { getOrdersByItemsByDay, getOrderByItems } from "../Fetch_Data";
import { FilterContext } from "../FilterContext";

const valueFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

export default function ItemNumberBarChart() {
  const [data, setData] = useState([]);
  const { selectedDate } = useContext(FilterContext);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData =
          selectedDate === "All"
            ? await getOrderByItems()
            : await getOrdersByItemsByDay(selectedDate);
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [selectedDate]);

  return (
    <div className="flex-1">
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-tremor-border p-6 dark:border-dark-tremor-border">
          <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Number of Items Bought
          </p>
          <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
            Quantity
          </p>
        </div>
        <div className="p-6 ">
          <BarList
            color="indigo"
            data={data}
            valueFormatter={valueFormatter}
            className="h-[auto]"
            showAnimation={true}
          />
        </div>

        
      </Card>
    </div>
  );
}
