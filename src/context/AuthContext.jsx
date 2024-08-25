import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { FirebaseAuth, FirebaseFirestore } from "../firebase";
import LoadingPage from "../pages/LoadingPage";


export const UserDataContext = createContext({
  user: null,
  userType: null,
  userInfo:null,
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
    const authStateListener = onAuthStateChanged(FirebaseAuth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(FirebaseFirestore, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
          setUserType(userDoc.data().type); // Assuming the user type is stored as `type`
        } else {
          console.error("No such document!");
        }
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
    <UserDataContext.Provider value={{ user, userType , userInfo }}>
      {isLoading ? <LoadingPage /> : children}
    </UserDataContext.Provider>
  );
};
