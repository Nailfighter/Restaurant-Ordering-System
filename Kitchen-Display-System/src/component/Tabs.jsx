import React, { createContext, useState } from "react";

export const TabsContext = createContext();

export const TabsProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Active");

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};
