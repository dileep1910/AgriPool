// 🔥 IMPORTS (ONLY ONCE, AT TOP)
import { auth, db } from './firebase-config.js';

import {
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let authInitialized = false;


// 🔐 AUTH STATE HANDLER
export function initAuth(requireAuth = false, redirectIfLoggedIn = false) {

    // ⛔ Prevent multiple listeners
    if (authInitialized) return;
    authInitialized = true;

    // 👀 Hide UI until auth loads (prevents flicker)
    document.body.style.visibility = "hidden";

    onAuthStateChanged(auth, async (user) => {

        if (user) {

            // ✅ Prevent access to login/register if already logged in
            if (redirectIfLoggedIn) {
                window.location.href = 'index.html';
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));

                let userData;

                if (userDoc.exists()) {
                    userData = userDoc.data();
                } else {
                    userData = {
                        name: user.email.split('@')[0],
                        email: user.email
                    };
                }

                // 💾 Store user locally
                localStorage.setItem(
                    'agripool_user',
                    JSON.stringify({ uid: user.uid, ...userData })
                );

                updateProfileUI(userData);

            } catch (e) {
                console.log("Firestore error:", e);

                const fallback = {
                    name: "Demo User",
                    email: user.email
                };

                localStorage.setItem(
                    'agripool_user',
                    JSON.stringify({ uid: user.uid, ...fallback })
                );

                updateProfileUI(fallback);
            }

        } else {
            // ❌ Not logged in
            localStorage.removeItem('agripool_user');

            if (requireAuth) {
                window.location.href = 'login.html';
                return;
            }

            updateProfileUI(null);
        }

        // 👀 Show UI after auth check
        document.body.style.visibility = "visible";
    });
}


// 👤 UPDATE NAVBAR UI
function updateProfileUI(userData) {
    const profileBtn = document.getElementById('profile-btn');
    const loginBtn = document.getElementById('nav-login-btn');

    if (profileBtn && userData) {
        profileBtn.innerHTML = `
            <div class="profile-initial">
                ${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
        `;
        profileBtn.style.display = 'block';

        if (loginBtn) loginBtn.style.display = 'none';

        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');

        if (dropdownName) dropdownName.textContent = userData.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = userData.email || '';

    } else {
        if (profileBtn) profileBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'flex';
    }
}


// 🚪 LOGOUT
export function logout() {
    signOut(auth)
        .then(() => {
            localStorage.removeItem('agripool_user');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
}


// 📝 REGISTER
export async function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        throw new Error("Please fill all fields");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
        name,
        email
    });

    // 🔁 Redirect to login
    window.location.href = "login.html";
}


// 🔐 LOGIN
export async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        throw new Error("Please enter email and password");
    }

    await signInWithEmailAndPassword(auth, email, password);

    // ❗ Redirect handled by initAuth
}


// 🌍 GLOBAL ACCESS
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logout;