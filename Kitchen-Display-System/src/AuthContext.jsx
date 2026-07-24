import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("operator_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
    return data ?? null;
  };

  useEffect(() => {
    if (!session) return;
    fetchProfile(session.user.id).finally(() => setLoading(false));
  }, [session?.user?.id]);

  const USERNAME_EMAIL_DOMAIN = "operators.local";
  const usernameToEmail = (username) =>
    `${username.trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`;

  const signIn = async (username, password) => {
    const { data: email, error: lookupError } = await supabase.rpc(
      "get_email_by_username",
      { p_username: username.trim() }
    );
    if (lookupError || !email) {
      return { error: { message: "Invalid username or password" } };
    }
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = (username, password, name) =>
    supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: { display_name: name, username: username.trim().toLowerCase() },
      },
    });

  const signOut = () => supabase.auth.signOut();

  const refreshProfile = () =>
    session ? fetchProfile(session.user.id) : Promise.resolve(null);

  const isAdmin = profile?.role === "admin";

  const access = {
    kiosk: isAdmin || Boolean(profile?.access_kiosk),
    dashboard: isAdmin || Boolean(profile?.access_dashboard),
    kitchen: isAdmin || Boolean(profile?.access_kitchen),
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isAdmin,
        access,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
