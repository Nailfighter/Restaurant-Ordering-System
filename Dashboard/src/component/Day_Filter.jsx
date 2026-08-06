import React, { useContext } from "react";
import { Select, SelectItem } from "@tremor/react";
import { FilterContext } from "../FilterContext";
import EVENT_DAYS from "../Event_Days";

const DayFilter = () => {
  const { selectedDate, setSelectedDate } = useContext(FilterContext);

  return (
    <Select
      id="day"
      name="Day Filter"
      value={selectedDate}
      onValueChange={setSelectedDate}
      className="dash-header-day-filter"
    >
      <SelectItem value="All">All Days</SelectItem>
      {EVENT_DAYS.map((day) => (
        <SelectItem key={day.value} value={day.value}>
          {day.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default DayFilter;
