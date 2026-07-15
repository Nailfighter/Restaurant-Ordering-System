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

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, name) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
      },
    });

  const signOut = () => supabase.auth.signOut();

  const refreshProfile = () =>
    session ? fetchProfile(session.user.id) : Promise.resolve(null);

  const approved = Boolean(profile?.approved);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        approved,
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
