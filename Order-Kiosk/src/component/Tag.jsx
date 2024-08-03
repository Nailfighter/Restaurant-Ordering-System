import React from "react";
import "../styles/scss/Tag.scss";

const Tag = (props) => {
  const tags = props.tags;

  const allTags = tags.map((tag,index) => {
    return (
      <div className={`tag-${tag}`} key={index}>
        <span>{tag}</span>
      </div>
    );
  });

  return allTags;
};

export default Tag;
