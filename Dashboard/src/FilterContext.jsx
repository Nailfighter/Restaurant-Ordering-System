import React, { createContext, useState } from "react";
import dayjs from "dayjs";

// Create context
export const FilterContext = createContext();

// Create a provider component
export const FilterProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedItem, setItem] = useState("All");
  const [startTime, setStartTime] = useState(dayjs("8:00 AM", "hh:mm A"));
  const [endTime, setEndTime] = useState(dayjs("10:00 PM", "hh:mm A"));

  return (
    <FilterContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedItem,
        setItem,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
