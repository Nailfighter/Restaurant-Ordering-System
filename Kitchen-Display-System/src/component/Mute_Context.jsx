import React, { createContext, useState, useContext } from "react";

const MuteContext = createContext();

export const MuteProvider = ({ children }) => {
  const [mute, setMute] = useState(false);

  const toggleMute = () => setMute((prevMute) => !prevMute);

  return (
    <MuteContext.Provider value={{ mute, toggleMute }}>
      {children}
    </MuteContext.Provider>
  );
};

export const useMute = () => useContext(MuteContext);
