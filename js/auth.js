import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check authentication state globally
export function initAuth(requireAuth = false, redirectIfLoggedIn = false) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            if (redirectIfLoggedIn) {
                window.location.href = 'index.html';
            }
            
            try {
                // Store user data in local storage for easy access across pages
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    localStorage.setItem('agripool_user', JSON.stringify({ uid: user.uid, ...userDoc.data() }));
                    updateProfileUI(userDoc.data());
                } else {
                    const fallbackData = { name: user.email.split('@')[0], email: user.email };
                    localStorage.setItem('agripool_user', JSON.stringify({ uid: user.uid, ...fallbackData }));
                    updateProfileUI(fallbackData);
                }
            } catch(e) {
                console.log("Firestore error on mock config (Expected if keys are wrong): ", e);
                const mockData = { name: "Demo User", email: user.email };
                localStorage.setItem('agripool_user', JSON.stringify({ uid: user.uid, ...mockData }));
                updateProfileUI(mockData);
            }
        } else {
            // No user is signed in.
            localStorage.removeItem('agripool_user');
            if (requireAuth) {
                window.location.href = 'login.html';
            }
            updateProfileUI(null);
        }
    });
}

function updateProfileUI(userData) {
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn && userData) {
        profileBtn.innerHTML = `<div class="profile-initial">${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</div>`;
        profileBtn.style.display = 'block';
        
        // Hide login button if logged in
        const loginBtn = document.getElementById('nav-login-btn');
        if (loginBtn) loginBtn.style.display = 'none';

        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');
        if (dropdownName) dropdownName.textContent = userData.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = userData.email || '';
    } else {
        if (profileBtn) profileBtn.style.display = 'none';
        const loginBtn = document.getElementById('nav-login-btn');
        if (loginBtn) loginBtn.style.display = 'flex';
    }
}

export function logout() {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Sign out error", error);
    });
}

// Global attachment for HTML buttons like "Logout"
window.logoutUser = logout;
