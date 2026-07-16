import React from "react";
import "../styles/Card_Buttons.scss";
import { useAuth } from "../AuthContext";

const cardTemplate = {
  Preparing: {
    primaryText: "Done",
    secondaryText: "Delay",
    primaryAction: "completed",
    secondaryAction: "delayed",
  },
  Delayed: {
    primaryText: "Prepare",
    secondaryText: "Done",
    primaryAction: "preparing",
    secondaryAction: "completed",
  },
  Completed: {
    primaryText: "Prepare Again",
    primaryAction: "preparing",
  },
};

const apiURL = import.meta.env.VITE_API_URL;

const CardButtons = ({ orderNum, status }) => {
  const template = cardTemplate[status];
  const { session } = useAuth();

  const handleAction = (newStatus) => {
    fetch(`${apiURL}/api/kitchen/${newStatus}/order/${orderNum}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus, updatedBy: session?.user?.id }),
    });
  };

  return (
    <div className="order-buttons">
      <button
        className="order-button-primary"
        aria-label={`${template.primaryText} order ${orderNum}`}
        onClick={() => handleAction(template.primaryAction)}
      >
        <img src={`Icon/${template.primaryAction}.png`} alt="" aria-hidden="true" />
        <span>{template.primaryText}</span>
      </button>
      {template.secondaryText && (
        <button
          className="order-button-secondary"
          aria-label={`${template.secondaryText} order ${orderNum}`}
          onClick={() => handleAction(template.secondaryAction)}
        >
          <img src={`Icon/${template.secondaryAction}.png`} alt="" aria-hidden="true" />
          <span>{template.secondaryText}</span>
        </button>
      )}
    </div>
  );
};

export default CardButtons;
