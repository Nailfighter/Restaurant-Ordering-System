import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";

import "../styles/Auth_Ticket.scss";

export const SERVICE = {
  key: "dashboard",
  label: "the Dashboard",
  eyebrow: "Dashboard",
  action: "Open the Dashboard",
};

export const SignOutFab = () => {
  const { signOut } = useAuth();
  return (
    <motion.button
      className="dash-header-signout"
      onClick={signOut}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>Sign Out</span>
    </motion.button>
  );
};
