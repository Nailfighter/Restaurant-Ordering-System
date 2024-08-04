import React from "react";
import "../styles/Card_Buttons.scss";

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

  const handleAction = (newStatus) => {
    fetch(`${apiURL}/api/kitchen/${newStatus}/order/${orderNum}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <div className="order-buttons">
      <button onClick={() => handleAction(template.primaryAction)}>
        <img src={`/Icon/${template.primaryAction}.png`} alt="done" />
        <span>{template.primaryText}</span>
      </button>
      {template.secondaryText && (
        <button onClick={() => handleAction(template.secondaryAction)}>
          <img src={`/Icon/${template.secondaryAction}.png`} alt="done" />
          <span>{template.secondaryText}</span>
        </button>
      )}
    </div>
  );
};

export default CardButtons;
