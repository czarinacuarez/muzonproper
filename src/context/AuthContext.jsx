import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { FirebaseAuth, FirebaseFirestore } from "../firebase";
import LoadingPage from "../pages/LoadingPage";

export const UserDataContext = createContext({
  user: null,
  userType: null,
  userInfo: null,
});

export const useUser = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUser must be used within a UserDataProvider");
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // Add userType state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = onAuthStateChanged(FirebaseAuth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(FirebaseFirestore, "users", authUser.uid);

        // Set up real-time listener for the user's document
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setUserInfo(data);
            setUserType(data.type); // Assuming the user type is stored as `type`
          } else {
            console.error("No such document!");
          }
        });

        return () => unsubscribe(); // Cleanup the listener when component unmounts
      } else {
        setUser(null);
        setUserType(null);
      }
      setIsLoading(false);
    });

    return () => {
      authStateListener();
    };
  }, []);

  return (
    <UserDataContext.Provider value={{ user, userType, userInfo }}>
      {isLoading ? <LoadingPage /> : children}
    </UserDataContext.Provider>
  );
};
