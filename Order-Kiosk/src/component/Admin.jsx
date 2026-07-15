import React, { useState, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

import "../styles/scss/Admin.scss";

const listStagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const rowItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusOf = (operator) => {
  if (operator.role === "admin") return "Admin";
  return operator.approved ? "Approved" : "Pending";
};

const Admin = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [operators, setOperators] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const loadOperators = async () => {
    const { data } = await supabase
      .from("operator_profiles")
      .select("*")
      .order("created_at");
    setOperators(data ?? []);
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const setApproval = async (id, approved) => {
    setBusyId(id);
    await supabase.from("operator_profiles").update({ approved }).eq("id", id);
    await loadOperators();
    setBusyId(null);
  };

  const pendingCount = operators.filter(
    (operator) => !operator.approved
  ).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="admin-screen">
        <div className="admin-bar">
          <motion.button
            className="admin-back"
            onClick={() => navigate("/app")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Kiosk</span>
          </motion.button>
        </div>

        <motion.div
          className="admin-panel"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 260, damping: 22 },
          }}
        >
          <div className="admin-panel-header">
            <h1>Operators</h1>
            <span className="admin-pending-count">
              {pendingCount === 0
                ? "No approvals waiting"
                : `${pendingCount} waiting for approval`}
            </span>
          </div>

          <motion.div
            className="admin-list"
            variants={listStagger}
            initial="initial"
            animate="animate"
          >
            {operators.map((operator) => (
              <motion.div
                className="admin-row"
                key={operator.id}
                variants={rowItem}
              >
                <div className="admin-row-who">
                  <h5>{operator.display_name || operator.email}</h5>
                  <span className="admin-row-email">{operator.email}</span>
                </div>

                <span className="admin-row-date">
                  {formatDate(operator.created_at)}
                </span>

                <span
                  className={`admin-status admin-status-${statusOf(
                    operator
                  ).toLowerCase()}`}
                >
                  {statusOf(operator)}
                </span>

                {operator.role !== "admin" &&
                  (operator.approved ? (
                    <motion.button
                      className="admin-action admin-action-revoke"
                      disabled={busyId === operator.id}
                      onClick={() => setApproval(operator.id, false)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Revoke Access
                    </motion.button>
                  ) : (
                    <motion.button
                      className="admin-action admin-action-approve"
                      disabled={busyId === operator.id}
                      onClick={() => setApproval(operator.id, true)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Approve
                    </motion.button>
                  ))}

                {operator.role === "admin" && (
                  <span className="admin-action-spacer">
                    {operator.id === profile?.id ? "That's you" : ""}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default Admin;
