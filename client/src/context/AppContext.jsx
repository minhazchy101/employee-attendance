import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebase/firebase.config";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);       // minimal Firebase info
  const [profile, setProfile] = useState(null); // full backend profile
  const [token, setToken] = useState(null);     // backend JWT
  const [loading, setLoading] = useState(true);

  // Fetch detailed user profile from backend
  const fetchUserProfile = async (email) => {
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

  useEffect(() => {
    const savedToken = localStorage.getItem("access-token");
    if (savedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      setToken(savedToken);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          name: currentUser.displayName || null,
          photo: currentUser.photoURL || null,
        });

        try {
          // Request backend JWT
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/jwt`, {
            email: currentUser.email,
          });

          localStorage.setItem("access-token", data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          setToken(data.token);

          // Fetch backend profile
          fetchUserProfile(currentUser.email);
        } catch (err) {
          console.error("JWT fetch failed:", err);
          setProfile(null);
          setToken(null);
        }
      } else {
        // User logged out — cleanup
        setUser(null);
        setProfile(null);
        setToken(null);
        localStorage.removeItem("access-token");
        delete axios.defaults.headers.common["Authorization"];
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem("access-token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    showLogin,
    setShowLogin,
    user,
    profile,
    token,
    loading,
    logout,
    fetchUserProfile, // expose to allow manual refresh
  };

  return (
    <AppContext.Provider value={value}>
      {!loading && children}
    </AppContext.Provider>
  );
};

// Custom hook to consume context
export const useAppContext = () => useContext(AppContext);
