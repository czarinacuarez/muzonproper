import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { FirebaseAuth, FirebaseFirestore } from "../firebase";
import LoadingPage from "../pages/LoadingPage";

export const UserDataContext = createContext({
  user: null,
  userType: null,
  userInfo: null,
  userVerify: null,
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
  const [userInfo, setUserInfo] = useState(null);
  const [userVerify, setUserVerify] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = onAuthStateChanged(
      FirebaseAuth,
      (authUser) => {
        if (authUser) {
          console.log("User authenticated:", authUser);
          setUser(authUser);
          const userDocRef = doc(FirebaseFirestore, "users", authUser.uid);

          const unsubscribe = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setUserVerify(data.verified);
                setUserInfo(data);
                setUserType(data.type);
                setIsLoading(false); // Set loading to false once data is fetched
              } else {
                console.error("No such document!");
                setUserInfo(null);
                setUserType(null);
                setUserVerify(null);
                setIsLoading(false); // Ensure loading is set to false if no document is found
              }
            },
            (error) => {
              console.error("Error fetching user data:", error);
              setUserInfo(null);
              setUserType(null);
              setUserVerify(null);
              setIsLoading(false); // Ensure loading is set to false on Firestore error
            },
          );

          return () => {
            console.log("Unsubscribing from Firestore listener");
            unsubscribe(); // Cleanup Firestore listener
          };
        } else {
          console.log("No authenticated user");
          setUser(null);
          setUserType(null);
          setUserVerify(null);
          setIsLoading(false); // Set loading to false if no user is authenticated
        }
      },
      (error) => {
        console.error("Error with authentication state listener:", error);
        setUser(null);
        setUserType(null);
        setUserVerify(null);
        setIsLoading(false); // Ensure loading is set to false on authentication error
      },
    );

    return () => {
      console.log("Unsubscribing from auth state listener");
      authStateListener(); // Cleanup auth state listener
    };
  }, []);

  return (
    <UserDataContext.Provider value={{ user, userType, userInfo, userVerify }}>
      {isLoading ? (
        <LoadingPage /> // Replace with your loading indicator or component
      ) : (
        children
      )}
    </UserDataContext.Provider>
  );
};
