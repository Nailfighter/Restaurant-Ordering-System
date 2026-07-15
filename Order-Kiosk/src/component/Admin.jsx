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

const SERVICES = [
  { key: "access_kiosk", label: "Kiosk" },
  { key: "access_dashboard", label: "Dashboard" },
  { key: "access_kitchen", label: "Kitchen" },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const hasNoAccess = (operator) =>
  !operator.access_kiosk &&
  !operator.access_dashboard &&
  !operator.access_kitchen;

const Admin = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [operators, setOperators] = useState([]);
  const [busyKey, setBusyKey] = useState(null);

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

  const toggleAccess = async (operator, key) => {
    setBusyKey(operator.id + key);
    await supabase
      .from("operator_profiles")
      .update({ [key]: !operator[key] })
      .eq("id", operator.id);
    await loadOperators();
    setBusyKey(null);
  };

  const waitingCount = operators.filter(
    (operator) => operator.role !== "admin" && hasNoAccess(operator)
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
              {waitingCount === 0
                ? "No one waiting for access"
                : `${waitingCount} waiting for access`}
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

                {operator.role === "admin" ? (
                  <span className="admin-status admin-status-admin">
                    {operator.id === profile?.id
                      ? "Admin · You"
                      : "Admin · Full Access"}
                  </span>
                ) : (
                  <div className="admin-chips">
                    {SERVICES.map((service) => (
                      <button
                        key={service.key}
                        className={`admin-chip ${
                          operator[service.key] ? "admin-chip-on" : ""
                        }`}
                        disabled={busyKey === operator.id + service.key}
                        onClick={() => toggleAccess(operator, service.key)}
                      >
                        <span className="admin-chip-dot"></span>
                        {service.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <p className="admin-footnote">
            Tap a service to grant or revoke access. Operators with no services
            stay on the waiting screen.
          </p>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default Admin;
