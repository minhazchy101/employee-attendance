import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebase/firebase.config";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null); // Firebase Auth user
  const [profile, setProfile] = useState(null); // App-specific user data
  const [token, setToken] = useState(null); // Firebase ID token
  const [loading, setLoading] = useState(true);

  // 🔹 Initialize and manage Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // ✅ Get a fresh Firebase ID token
          const idToken = await currentUser.getIdToken(true);

          // Save token
          localStorage.setItem("access-token", idToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
          setToken(idToken);

          // Fetch profile from backend
          await fetchUserProfile(currentUser.email);
        } catch (error) {
          console.error("Error getting Firebase ID token:", error);
          clearAuth();
        }
      } else {
        clearAuth();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔄 Automatically refresh ID token when Firebase rotates it
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        localStorage.setItem("access-token", idToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
        setToken(idToken);
      }
    });

    return () => unsubscribe();
  }, []);
  // ✅ Fetch fresh user profile when token updates
useEffect(() => {
  if (user?.email) fetchUserProfile(user.email);
}, [token]);

  // 🔹 Fetch the user's profile data from your backend
  const fetchUserProfile = async (email) => {
    if (!email) return;

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/profile/${email}`
      );
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setProfile(null);
    }
  };

  // 🔹 Logout handler
  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      clearAuth();
    }
  };

  // 🔹 Helper to clear all auth data
  const clearAuth = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem("access-token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    navigate,
    showLogin,
    setShowLogin,
    user,
    profile,
    token,
    loading,
    logout,
    fetchUserProfile,
  };

  return (
    <AppContext.Provider value={value}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
