import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD1c_KCZWMjOr7banlCrtNhLkEoUHgb680",
    authDomain: "agripool-33.firebaseapp.com",
    projectId: "agripool-33",
    storageBucket: "agripool-33.appspot.com",
    messagingSenderId: "925855716787",
    appId: "1:925855716787:web:13d961758455fe1b4067c6",
    measurementId: "G-N50HEQS824"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);