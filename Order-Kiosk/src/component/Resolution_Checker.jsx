import React, { useState, useEffect } from "react";
import "../styles/scss/App.scss";

const ResolutionChecker = () => {
  const [resolution, setResolution] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const updateResolution = () => {
    setResolution({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", updateResolution);
    return () => {
      window.removeEventListener("resize", updateResolution);
    };
  }, []);

  return (
    <div className="debug">
      <span>
        Website Resolution: {resolution.width} x {resolution.height}
      </span>
    </div>
  );
};

export default ResolutionChecker;
