import React, { createContext, useState } from "react";
import dayjs from "dayjs";

// Create context
export const FilterContext = createContext();

// Create a provider component
export const FilterProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState("All");

  return (
    <FilterContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
