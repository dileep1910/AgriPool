// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace with your app's actual Firebase project configuration from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_API_KEY_HERE_FOR_TESTING",
  authDomain: "agripool-test.firebaseapp.com",
  projectId: "agripool-test",
  storageBucket: "agripool-test.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
