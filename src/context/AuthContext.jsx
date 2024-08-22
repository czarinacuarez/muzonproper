import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { FirebaseAuth } from "../firebase";
import LoadingPage from "../pages/LoadingPage";

export const UserDataContext = createContext({
  user: null,
});

export const useUser = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = onAuthStateChanged(FirebaseAuth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      authStateListener();
    };
  }, []);

  return (
    <UserDataContext.Provider value={{ user }}>
      {isLoading ? <LoadingPage /> : children}
    </UserDataContext.Provider>
  );
};
