import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

  
  const FirebaseConfig = {
    apiKey: "AIzaSyDLpo2XUB69LWmUpQrq2bqth69D9lITMQ0",
    authDomain: "muzonproperproject.firebaseapp.com",
    projectId: "muzonproperproject",
    storageBucket: "muzonproperproject.appspot.com",
    messagingSenderId: "1025186803211",
    appId: "1:1025186803211:web:5793a9f6f4bcaed94c610e"
  };

  
// Initialize Firebase
export const MainFirebaseApp = initializeApp(FirebaseConfig);

export const FirebaseAuth = getAuth(MainFirebaseApp);

export const FirebaseFirestore = getFirestore(MainFirebaseApp);
