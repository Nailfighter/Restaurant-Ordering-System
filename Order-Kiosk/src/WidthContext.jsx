import React, { createContext, useState, useContext } from "react";

const WidthContext = createContext();

export const WidthProvider = ({ children }) => {
  const [width, setWidth] = useState("auto");

  return (
    <WidthContext.Provider value={{ width, setWidth }}>
      {children}
    </WidthContext.Provider>
  );
};

export const useWidth = () => useContext(WidthContext);
