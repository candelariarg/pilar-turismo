// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDzEJQy09Y0FifTQK5ynh3eTufMxBZG65I",
    authDomain: "pilar-turismo.firebaseapp.com",
    projectId: "pilar-turismo",
    storageBucket: "pilar-turismo.firebasestorage.app",
    messagingSenderId: "35224874939",
    appId: "1:35224874939:web:e24ba75c8fae49b8039e9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);