import React, { createContext, useState } from "react";

export const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <ConfirmationContext.Provider
      value={{ showConfirmation, setShowConfirmation }}
    >
      {children}
    </ConfirmationContext.Provider>
  );
};
