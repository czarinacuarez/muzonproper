import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const FirebaseConfig = {
    apiKey: "AIzaSyCI2MRPQ_jdpnx5LXeNBfLjFMPNzyAZUJQ",
    authDomain: "templates-42069.firebaseapp.com",
    projectId: "templates-42069",
    storageBucket: "templates-42069.appspot.com",
    messagingSenderId: "663188134",
    appId: "1:663188134:web:c951fc7033c48542deba67",
  };
  
// Initialize Firebase
export const MainFirebaseApp = initializeApp(FirebaseConfig);

export const FirebaseAuth = getAuth(MainFirebaseApp);

export const FirebaseFirestore = getFirestore(MainFirebaseApp);
