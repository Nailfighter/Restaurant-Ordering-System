import React, { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useAuth } from "../AuthContext";

import "../styles/scss/Auth.scss";

// ---------------------------- Motion variants ----------------------------

const springSoft = { type: "spring", stiffness: 260, damping: 22 };
const springSnappy = { type: "spring", stiffness: 400, damping: 30 };

// Brand copy: container staggers headline, then tagline
const copyStagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const copyItem = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: springSoft },
};

const questionMark = {
  initial: { opacity: 0, scale: 0, rotate: -25 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 500, damping: 14, delay: 0.55 },
  },
};

// Food cards: dealt from a stacked pile at the bottom center
const dealCard = (item, index) => ({
  initial: { opacity: 0, y: 150, rotate: 0, scale: 0.7 },
  animate: {
    opacity: 1,
    y: 0,
    rotate: item.rotate,
    scale: 1,
    transition: { ...springSoft, delay: 0.5 + index * 0.14 },
  },
});

const cardHover = {
  y: -12,
  rotate: 0,
  scale: 1.06,
  transition: springSnappy,
};

// Form card: children cascade in
const formStagger = {
  initial: { opacity: 0, scale: 0.94, y: 24 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...springSoft, staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 24,
    transition: { duration: 0.25 },
  },
};

const formItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: springSoft },
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

// Confirmation: ticket drops in like it was just printed
const ticketDrop = {
  initial: { opacity: 0, y: -90, rotate: -10 },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

const bounceButton = {
  initial: { scale: 1 },
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.95 },
};

// ---------------------------- Showcase data ----------------------------

const showcase = [
  {
    image: "Image/Samosa.jpg",
    name: "Samosa",
    price: "$3",
    tags: ["Vegan", "Gluten"],
    rotate: -8,
    delay: 0,
  },
  {
    image: "Image/Chicken Tikka.jpg",
    name: "Chicken Butter Masala",
    price: "$12",
    tags: ["Dairy", "Nuts"],
    rotate: 3,
    delay: 0.6,
  },
  {
    image: "Image/Lassi.jpg",
    name: "Mango Lassi",
    price: "$4",
    tags: ["Dairy", "Cold"],
    rotate: 9,
    delay: 1.2,
  },
];

const ShowcaseCard = ({ item, index }) => (
  <motion.div
    className="auth-brand-card"
    variants={dealCard(item, index)}
    initial="initial"
    animate="animate"
    whileHover={cardHover}
  >
    <div className="auth-brand-card-inner" style={{ "--delay": `${item.delay}s` }}>
      <img src={item.image} alt={item.name} />
      <div className="auth-brand-card-info">
        <h6>{item.name}</h6>
        <div className="tags">
          {item.tags.map((tag) => (
            <div className={`tag-${tag}`} key={tag}>
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-brand-card-price">{item.price}</div>
    </div>
  </motion.div>
);

// ---------------------------- Auth screen ----------------------------

const Auth = () => {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        const { data, error } = await signUp(email, password, name.trim());
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
      <div className="auth">
        <div className="auth-brand">
          <motion.div
            className="auth-brand-copy"
            variants={copyStagger}
            initial="initial"
            animate="animate"
          >
            <motion.h1 variants={copyItem}>
              Hungry
              <motion.span variants={questionMark} style={{ display: "inline-block" }}>
                ?
              </motion.span>
            </motion.h1>
            <motion.p variants={copyItem}>
              Fresh Indian street food, made to order. Sign in, tap what you
              crave, and skip the line.
            </motion.p>
          </motion.div>
          <div className="auth-brand-cards">
            {showcase.map((item, index) => (
              <ShowcaseCard item={item} index={index} key={item.name} />
            ))}
          </div>
        </div>

        <div className="auth-panel">
          <AnimatePresence mode="wait">
            {awaitingConfirm ? (
              <motion.div
                className="auth-card auth-confirm"
                key="confirm"
                variants={formStagger}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.img
                  className="auth-confirm-icon"
                  src="Icon/Ticket.png"
                  alt=""
                  variants={ticketDrop}
                />
                <motion.h2 variants={formItem}>Check Your Email</motion.h2>
                <motion.p variants={formItem}>
                  We sent a confirmation link to
                  <span> {email}</span>
                </motion.p>
                <motion.p className="auth-confirm-hint" variants={formItem}>
                  Tap the button in the email to activate your account, then
                  come back and sign in.
                </motion.p>
                <motion.button
                  className="auth-submit"
                  variants={formItem}
                  whileHover={bounceButton.whileHover}
                  whileTap={bounceButton.whileTap}
                  onClick={() => {
                    setAwaitingConfirm(false);
                    switchMode("signin");
                  }}
                >
                  Back to Sign In
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className="auth-card"
                key="form"
                variants={formStagger}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.h2 variants={formItem}>Welcome</motion.h2>
                <motion.p className="auth-subtitle" variants={formItem}>
                  {mode === "signin"
                    ? "Staff sign in to open the kiosk"
                    : "Register a new operator account"}
                </motion.p>

                <motion.div className="auth-tabs" variants={formItem}>
                  {["signin", "signup"].map((value) => (
                    <button
                      key={value}
                      className={mode === value ? "active" : ""}
                      onClick={() => switchMode(value)}
                      type="button"
                    >
                      {mode === value && (
                        <motion.div
                          className="auth-tabs-pill"
                          layoutId="auth-tab-pill"
                          transition={springSnappy}
                        />
                      )}
                      <span>{value === "signin" ? "Sign In" : "Sign Up"}</span>
                    </button>
                  ))}
                </motion.div>

                <form onSubmit={handleSubmit}>
                  <AnimatePresence initial={false}>
                    {mode === "signup" && (
                      <motion.div
                        className="auth-field"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={springSnappy}
                      >
                        <input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div className="auth-field" variants={formItem}>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </motion.div>

                  <motion.div className="auth-field" variants={formItem}>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      minLength={6}
                      required
                    />
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="auth-error"
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
                    className="auth-submit"
                    type="submit"
                    disabled={busy}
                    variants={formItem}
                    whileHover={bounceButton.whileHover}
                    whileTap={bounceButton.whileTap}
                    animate={
                      busy
                        ? { opacity: [0.65, 1, 0.65] }
                        : formItem.animate
                    }
                    transition={
                      busy
                        ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                    }
                  >
                    {busy
                      ? "Please wait..."
                      : mode === "signin"
                      ? "Open the Kiosk"
                      : "Register Operator"}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};

export default Auth;
