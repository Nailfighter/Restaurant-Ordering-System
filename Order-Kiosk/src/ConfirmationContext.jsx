import React, { createContext, useState } from "react";

export const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState(null);

  const triggerConfirmation = (orderNum) => {
    setConfirmedOrderNumber(orderNum);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setConfirmedOrderNumber(null);
    }, 5000);
  };

  return (
    <ConfirmationContext.Provider
      value={{ showConfirmation, confirmedOrderNumber, triggerConfirmation }}
    >
      {children}
    </ConfirmationContext.Provider>
  );
};
