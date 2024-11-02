// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADftFQC3LaH3vrgbn2K8GNuQR1OKCFvPA",
  authDomain: "elearn-9650c.firebaseapp.com",
  projectId: "elearn-9650c",
  storageBucket: "elearn-9650c.appspot.com",
  messagingSenderId: "385415405389",
  appId: "1:385415405389:web:451e79633c883e79c8a104",
  measurementId: "G-G8C5ZC5SMP"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// export default app;