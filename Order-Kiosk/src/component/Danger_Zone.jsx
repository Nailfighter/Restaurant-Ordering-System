import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

const bounce = {
  initial: { scale: 0.9, opacity: 0, y: 20 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  exit: { scale: 0.9, opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const DangerZone = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("warning"); // warning | pin | done
  const [counts, setCounts] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setOpen(false);
    setStep("warning");
    setCounts(null);
    setPin("");
    setError("");
    setBusy(false);
  };

  const openModal = async () => {
    setOpen(true);
    setBusy(true);
    const [{ count: orderCount }, { count: itemCount }] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("order_items").select("*", { count: "exact", head: true }),
    ]);
    setCounts({ orders: orderCount ?? 0, items: itemCount ?? 0 });
    setBusy(false);
  };

  const handlePinSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const { error: deleteError } = await supabase.rpc("admin_delete_all_data", {
      pin,
    });

    setBusy(false);

    if (deleteError) {
      setError(deleteError.message.replace(/^.*?:\s*/, ""));
      return;
    }

    setStep("done");
  };

  return (
    <>
      <motion.button
        className="admin-action-danger"
        onClick={openModal}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Delete All Data
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="danger-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="danger-modal"
              variants={bounce}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {step === "warning" && (
                <>
                  <h2>Are You Sure?</h2>
                  {counts ? (
                    <p className="danger-modal-text">
                      This will permanently delete{" "}
                      <strong>{counts.orders}</strong> orders and{" "}
                      <strong>{counts.items}</strong> order items. This cannot
                      be undone.
                    </p>
                  ) : (
                    <p className="danger-modal-text">Checking what's there...</p>
                  )}
                  <div className="danger-modal-buttons">
                    <button className="danger-modal-cancel" onClick={reset}>
                      Cancel
                    </button>
                    <button
                      className="danger-modal-continue"
                      disabled={!counts || busy}
                      onClick={() => setStep("pin")}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {step === "pin" && (
                <form onSubmit={handlePinSubmit}>
                  <h2>Enter the Delete PIN</h2>
                  <p className="danger-modal-text">
                    This confirms it's really you before anything is erased.
                  </p>
                  <input
                    className="danger-modal-input danger-modal-code"
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                    autoFocus
                  />
                  {error && <p className="danger-modal-error">{error}</p>}
                  <div className="danger-modal-buttons">
                    <button
                      type="button"
                      className="danger-modal-cancel"
                      onClick={reset}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="danger-modal-continue danger-modal-danger"
                      disabled={pin.length < 4 || busy}
                    >
                      {busy ? "Deleting..." : "Delete Everything"}
                    </button>
                  </div>
                </form>
              )}

              {step === "done" && (
                <>
                  <h2>All Data Deleted</h2>
                  <p className="danger-modal-text">
                    Every order and order item has been permanently erased.
                  </p>
                  <div className="danger-modal-buttons">
                    <button className="danger-modal-continue" onClick={reset}>
                      Done
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DangerZone;
