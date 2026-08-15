import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  // ============================================================
  // Get Current Session
  // ============================================================

  useEffect(() => {

    const getSession = async () => {

      try {

        const {
          data,
          error,
        } = await supabase.auth.getSession();


        if (error) {
          console.error(
            "Session error:",
            error
          );
        }


        setUser(
          data?.session?.user || null
        );

      } catch (error) {

        console.error(
          "Failed to get session:",
          error
        );

        setUser(null);

      } finally {

        setLoading(false);

      }

    };


    getSession();


    // ==========================================================
    // Listen For Authentication Changes
    // ==========================================================

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(
          session?.user || null
        );

      }
    );


    return () => {

      authListener?.subscription?.unsubscribe();

    };

  }, []);


  // ============================================================
  // Register
  // ============================================================

  const signUp = async (
    email,
    password,
    fullName
  ) => {

    const {
      data,
      error,
    } = await supabase.auth.signUp({

      email,

      password,

      options: {
        data: {
          full_name: fullName,
        },
      },

    });


    if (error) {
      throw error;
    }


    return data;

  };


  // ============================================================
  // Login
  // ============================================================

  const signIn = async (
    email,
    password
  ) => {

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({

      email,

      password,

    });


    if (error) {
      throw error;
    }


    setUser(
      data?.user || null
    );


    return data;

  };


  // ============================================================
  // Logout
  // ============================================================

  const signOut = async () => {

    const {
      error,
    } = await supabase.auth.signOut();


    if (error) {
      throw error;
    }


    setUser(null);

  };


  // ============================================================
  // Context
  // ============================================================

  const value = {

    user,

    loading,

    signUp,

    signIn,

    signOut,

  };


  return (
    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>
  );

}


// ============================================================
// useAuth Hook
// ============================================================

export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}