// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: "profiles-ed50e.firebaseapp.com",
    databaseURL: "https://profiles-ed50e-default-rtdb.firebaseio.com",
    projectId: "profiles-ed50e",
    storageBucket: "profiles-ed50e.appspot.com",
    messagingSenderId: "1096963073403",
    appId: "1:1096963073403:web:a4ae39836dbeee34d689de",
    measurementId: "G-KLGEC0359M"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

if (location.hostname === "localhost") {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    connectFirestoreEmulator(db, '192.168.0.103', 8080);
    connectAuthEmulator(auth, "http://192.168.0.103:9099", { disableWarnings: true });
    // Point to the Storage emulator running on localhost.
    connectStorageEmulator(storage, "192.168.0.103", 9199);
}