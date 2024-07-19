import React from "react";
import "../styles/scss/Tag.scss";
import { color } from "framer-motion";

const Tag = (props) => {
  const tags = props.tags;
  const tagDict = {
    Spicy: ["Spicy", "/Spicy.png", "#ff3826", "#ffc0b0"],
    Hot: ["Hot", "/Hot.png", "#FF9706", "#FFE2B9"],
    Mild: ["Mild", "/Mild.png", "#A8BA13", "#E4EBA0"],
    DairyFree: ["Dairy Free", "/DiaryFree.png", "#02A1CA", "#87e4fe"],
  };

  const allTags = tags.map((tag, index) => {
    return (
      <div
        className="tag-container"
        style={{ backgroundColor: tagDict[tag][3], color: tagDict[tag][2] }}
        key={index}
      >
        <img src={tagDict[tag][1]} />
        <span>{tagDict[tag][0]}</span>
      </div>
    );
  });

  return allTags;
};

export default Tag;
