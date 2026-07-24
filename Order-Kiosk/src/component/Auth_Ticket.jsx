import React, { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useAuth } from "../AuthContext";

import "../styles/scss/Auth_Ticket.scss";

const springSnappy = { type: "spring", stiffness: 400, damping: 30 };

// The ticket prints in: revealed top-to-bottom with a gentle settle
const printOut = {
  initial: { clipPath: "inset(0% 0% 100% 0%)", y: -30 },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    transition: { duration: 1.0, ease: [0.25, 0.9, 0.3, 1], delay: 0.2 },
  },
  exit: { opacity: 0, y: 40, transition: { duration: 0.25 } },
};

const errorShake = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    x: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.4 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const Barcode = () => (
  <div className="ticket-barcode">
    <div className="ticket-barcode-bars"></div>
    <span>STAFF &middot; ACCESS &middot; ONLY</span>
  </div>
);

const AuthTicket = () => {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(username, password);
        if (error) setError(error.message);
      } else {
        const { data, error } = await signUp(username, password, name.trim());
        if (error) {
          setError(error.message);
        } else if (data?.user && !data.session) {
          setAwaitingConfirm(true);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="ticket-screen">
        <AnimatePresence mode="wait">
          {awaitingConfirm ? (
            <motion.div
              className="ticket"
              key="confirm"
              variants={printOut}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="ticket-stub">
                <span className="ticket-stub-eyebrow">Almost there</span>
                <h2>Account Created</h2>
              </div>

              <div className="ticket-perforation"></div>

              <div className="ticket-body">
                <p className="ticket-line">
                  <span>Username</span>
                  <span className="ticket-line-dots"></span>
                  <strong>{username}</strong>
                </p>
                <p className="ticket-hint">
                  Ask an admin to approve the operator account, then come back
                  and sign in.
                </p>

                <button
                  className="ticket-submit"
                  onClick={() => {
                    setAwaitingConfirm(false);
                    switchMode("signin");
                  }}
                >
                  Back to Sign In
                </button>

                <Barcode />
              </div>
              <div className="ticket-tear"></div>
            </motion.div>
          ) : (
            <motion.div
              className="ticket"
              key="form"
              variants={printOut}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="ticket-stub">
                <span className="ticket-stub-eyebrow">Order Kiosk</span>
                <h2>
                  {mode === "signin" ? "Start of Shift" : "New Operator"}
                </h2>
              </div>

              <div className="ticket-perforation"></div>

              <div className="ticket-body">
                <div className="ticket-tabs">
                  {["signin", "signup"].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={mode === value ? "active" : ""}
                      onClick={() => switchMode(value)}
                    >
                      {mode === value && (
                        <motion.div
                          className="ticket-tabs-pill"
                          layoutId="ticket-tab-pill"
                          transition={springSnappy}
                        />
                      )}
                      <span>{value === "signin" ? "Sign In" : "Register"}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <AnimatePresence initial={false}>
                    {mode === "signup" && (
                      <motion.label
                        className="ticket-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={springSnappy}
                      >
                        <span>Name</span>
                        <input
                          type="text"
                          placeholder="Operator name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                        />
                      </motion.label>
                    )}
                  </AnimatePresence>

                  <label className="ticket-field">
                    <span>Username</span>
                    <input
                      type="text"
                      placeholder="nailfighter"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </label>

                  <label className="ticket-field">
                    <span>Password</span>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      minLength={6}
                      required
                    />
                  </label>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="ticket-error"
                        variants={errorShake}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    className="ticket-submit"
                    type="submit"
                    disabled={busy}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {busy
                      ? "Please wait..."
                      : mode === "signin"
                      ? "Open the Kiosk"
                      : "Register Operator"}
                  </motion.button>
                </form>

                <Barcode />
              </div>
              <div className="ticket-tear"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default AuthTicket;
