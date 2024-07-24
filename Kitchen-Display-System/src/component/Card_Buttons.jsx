import React from "react";
import "../styles/Card_Buttons.scss";

const cardTemplate = {
  Preparing: {
    primaryColor: "#79BF7F",
    primaryText: "Done",
    secondaryColor: "#f3726c",
    secondaryText: "Delay",
    primaryAction: "completed",
    secondaryAction: "delayed",
  },
  Delayed: {
    primaryColor: "#F3B55E",
    primaryText: "Prepare",
    secondaryColor: "#79BF7F",
    secondaryText: "Done",
    primaryAction: "preparing",
    secondaryAction: "completed",
  },
  Completed: {
    primaryColor: "#F3B55E",
    primaryText: "Prepare Again",
    primaryAction: "preparing",
  },
};

const CardButtons = ({ orderNum, status }) => {
  const template = cardTemplate[status];

  const handleAction = (newStatus) => {
    fetch(
      `http://localhost:5000/api/kitchen/${newStatus}/order/${orderNum}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );
  };

  return (
    <div className="order-buttons">
      <button
        className="order-button-primary"
        style={{ backgroundColor: template.primaryColor }}
        onClick={() => handleAction(template.primaryAction)}
      >
        {template.primaryText}
      </button>
      {template.secondaryText && (
        <button
          className="order-button-secondary"
          style={{
            color: template.secondaryColor,
            border: `2.5px solid ${template.secondaryColor}`,
          }}
          onClick={() => handleAction(template.secondaryAction)}
        >
          {template.secondaryText}
        </button>
      )}
    </div>
  );
};

export default CardButtons;
