import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRl4xShy7iiq1T7KuuVATjVEpDRZkOptg",
  authDomain: "mimemo-439b5.firebaseapp.com",
  projectId: "mimemo-439b5",
  storageBucket: "mimemo-439b5.appspot.com", // fixed typo
  messagingSenderId: "399054463407",
  appId: "1:399054463407:web:ba2cc5d572abf5a53d4f5a",
  measurementId: "G-10068G4G7E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
