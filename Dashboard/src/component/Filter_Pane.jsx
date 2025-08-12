import React, { useContext, useEffect } from "react";
import { Card, Divider, Select, SelectItem } from "@tremor/react";
import { FilterContext } from "../FilterContext";

const DayFilter = ({ value, setValue }) => (
  <Select
    id="day"
    name="Day Filter"
    value={value}
    onValueChange={setValue}
    className="mt-2"
  >
    <SelectItem value="All">All Days</SelectItem>
    <SelectItem value="1">Aug 6, 2025</SelectItem>
    <SelectItem value="2">Aug 7, 2025</SelectItem>
    <SelectItem value="3">Aug 8, 2025</SelectItem>
  </Select>
);

const FilterPane = () => {
  const {
    selectedDate,
    setSelectedDate,
  } = useContext(FilterContext);


  return (
    <div>
      <Card className="mx-auto max-w-xs filter-plane">
        <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
          Choose Day
        </p>
        <Divider />
        <p className="mt-[5px] text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        </p>
        <DayFilter value={selectedDate} setValue={setSelectedDate} />
      </Card>
    </div>
  );
};

export default FilterPane;
