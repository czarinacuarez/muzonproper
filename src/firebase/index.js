import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const FirebaseConfig = {
  apiKey: "AIzaSyDLpo2XUB69LWmUpQrq2bqth69D9lITMQ0",
  authDomain: "muzonproperproject.firebaseapp.com",
  projectId: "muzonproperproject",
  storageBucket: "muzonproperproject.appspot.com",
  messagingSenderId: "1025186803211",
  appId: "1:1025186803211:web:5793a9f6f4bcaed94c610e",
};

// // temporary firebase
// const FirebaseConfig = {
//   apiKey: "AIzaSyBSEmGmNv03_NOOJAhVGRD02co2d8TXN2w",
//   authDomain: "muzonproperproject-draft.firebaseapp.com",
//   projectId: "muzonproperproject-draft",
//   storageBucket: "muzonproperproject-draft.appspot.com",
//   messagingSenderId: "32111878639",
//   appId: "1:32111878639:web:fad96ac6191cb9fde0961a",
// };

// Initialize Firebase
export const MainFirebaseApp = initializeApp(FirebaseConfig);

export const FirebaseAuth = getAuth(MainFirebaseApp);

export const FirebaseFirestore = getFirestore(MainFirebaseApp);

export const FirebaseStorage = getStorage(MainFirebaseApp);
