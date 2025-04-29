// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYuN5klc8rF76L8Sk2dyaf629cjBeYQ2w",
  authDomain: "minisocialchatdb.firebaseapp.com",
  projectId: "minisocialchatdb",
  storageBucket: "minisocialchatdb.firebasestorage.app",
  messagingSenderId: "707872141542",
  appId: "1:707872141542:web:8e850541e13def04510b27",
  measurementId: "G-8SY70WW2TH"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
console.log('app', app);

const db = getFirestore(app)

export default db;