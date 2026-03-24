import { initAuth } from './auth.js';
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

initAuth(true, false);

let currentUser = null;
let currentDistance = 0;
let currentCost = 0;

// ✅ LOAD USER
document.addEventListener('DOMContentLoaded', () => {
    currentUser = JSON.parse(localStorage.getItem('agripool_user'));
});

// ✅ REAL DISTANCE FUNCTION
const API_KEY_OC = "1b7f11b5d9d8474bbfdbffac0a1de484"; // already done

// 🔍 AUTOCOMPLETE FUNCTION
async function getSuggestions(query, boxId, inputId) {
    if (query.length < 3) {
        document.getElementById(boxId).innerHTML = "";
        return;
    }

    try {
        const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${API_KEY_OC}&countrycode=in&limit=5`);
        const data = await res.json();

        const box = document.getElementById(boxId);
        box.innerHTML = "";

        data.results.forEach(place => {
            const div = document.createElement("div");

            // ✅ cleaner village display
            div.textContent = place.components.village || place.components.town || place.components.city || place.formatted;

            div.onclick = () => {
                document.getElementById(inputId).value = place.formatted;
                box.innerHTML = "";
            };

            box.appendChild(div);
        });

    } catch (err) {
        console.log("Autocomplete error:", err);
    }
}

// 🧠 INPUT LISTENERS
document.getElementById("pickup").addEventListener("input", (e) => {
    getSuggestions(e.target.value, "pickup-suggestions", "pickup");
});

document.getElementById("dropoff").addEventListener("input", (e) => {
    getSuggestions(e.target.value, "dropoff-suggestions", "dropoff");
});


// VEHICLE SELECT UI
document.querySelectorAll('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        card.querySelector('input').checked = true;
    });
});
// ✅ FORM SUBMIT
document.getElementById('transport-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const pickup = document.getElementById('pickup').value.trim();
    const dropoff = document.getElementById('dropoff').value.trim();
    const vehicle = document.querySelector('input[name="vehicle"]:checked');

    const resultBox = document.getElementById('result-box');

    if (!vehicle) {
        alert("Select vehicle");
        return;
    }

    const distance = await getRealDistance(pickup, dropoff);
    if (!distance) return;

    resultBox.style.display = "block";

    // ❌ TOO FAR
    if (distance > 250) {
        resultBox.className = "result-box error";
        resultBox.innerHTML = `
            <h3>❌ Service Not Available</h3>
            <p><strong>Distance:</strong> ${distance.toFixed(2)} km</p>
            <p>Sorry, destination is too far. We currently support only up to 250 km.</p>
        `;
        return;
    }

    // ✅ VEHICLE COST
    let rate = 15;
    if (vehicle.value === "mini") rate = 20;
    if (vehicle.value === "truck") rate = 30;
    if (vehicle.value === "tractor") rate = 10;

    const baseCost = distance * rate;

    // 📊 STATE TYPE
    let type = distance <= 300 ? "In-State" : "Out-of-State";

    // EXTRA CHARGES
    let loading = 800;
    let toll = distance > 300 ? distance * 3 : 0;

    const total = baseCost + loading + toll;

    resultBox.className = "result-box success";
    resultBox.innerHTML = `
        <h3>✅ Transport Estimate</h3>

        <p><strong>📍 Distance:</strong> ${distance.toFixed(2)} km</p>
        <p><strong>🚛 Vehicle:</strong> ${vehicle.value.toUpperCase()}</p>
        <p><strong>📦 Transport Type:</strong> ${type}</p>

        <hr>

        <p><strong>💰 Base Cost:</strong> ₹${baseCost.toFixed(0)}</p>
        <p><strong>📦 Loading Charges:</strong> ₹${loading}</p>
        <p><strong>🛣 Toll Charges:</strong> ₹${toll.toFixed(0)}</p>

        <hr>

        <h2>Total Cost: ₹${total.toFixed(0)}</h2>
    `;
});