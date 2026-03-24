// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace with your app's actual Firebase project configuration from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD1c_KCZWMjOr7banlCrtNhLkEoUHgb680",
  authDomain: "agripool-33.firebaseapp.com",
  projectId: "agripool-33",
  storageBucket: "agripool-33.firebasestorage.app",
  messagingSenderId: "925855716787",
  appId: "1:925855716787:web:13d961758455fe1b4067c6",
  measurementId: "G-N50HEQS824"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
