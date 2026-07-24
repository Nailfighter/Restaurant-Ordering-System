import React, { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useAuth } from "../AuthContext";

import "../styles/scss/Auth_Ticket.scss";

const printOut = {
  initial: { clipPath: "inset(0% 0% 100% 0%)", y: -30 },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    transition: { duration: 1.0, ease: [0.25, 0.9, 0.3, 1], delay: 0.2 },
  },
};

const ApprovalPending = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="ticket-screen">
        <motion.div
          className="ticket"
          variants={printOut}
          initial="initial"
          animate="animate"
        >
          <div className="ticket-stub">
            <span className="ticket-stub-eyebrow">Order Kiosk</span>
            <h2>Hold Tight</h2>
          </div>

          <div className="ticket-perforation"></div>

          <div className="ticket-body">
            <p className="ticket-line">
              <span>Operator</span>
              <span className="ticket-line-dots"></span>
              <strong>{profile?.display_name || profile?.username}</strong>
            </p>
            <p className="ticket-hint">
              Your operator account is registered but not approved yet. The
              admin needs to approve it before you can open the kiosk.
            </p>

            <motion.button
              className="ticket-submit"
              onClick={handleCheck}
              disabled={checking}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              {checking ? "Checking..." : "Check Approval"}
            </motion.button>

            <button className="ticket-signout" onClick={signOut}>
              Sign out and come back later
            </button>
          </div>
          <div className="ticket-tear"></div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default ApprovalPending;
