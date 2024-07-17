import React from "react";
import "../styles/scss/Tag.scss";

const Tag = (props) => {
  return (
    <div className="tag-container">
      <img src="public/Spicy.png" />
      <span>{props.text}</span>
    </div>
  );
};

export default Tag;
