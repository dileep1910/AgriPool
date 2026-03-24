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

// ✅ FORM SUBMIT
document.getElementById('transport-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const pickup = document.getElementById('pickup').value.trim();
    const dropoff = document.getElementById('dropoff').value.trim();
    const vehicle = document.querySelector('input[name="vehicle"]:checked');

    const resultDiv = document.getElementById('distance-result');
    const costDiv = document.getElementById('calc-cost');
    const confirmBtn = document.getElementById('confirm-booking-btn');

    if (!vehicle) {
        alert("Select vehicle");
        return;
    }

    // ✅ REAL DISTANCE
    const distance = await getRealDistance(pickup, dropoff);
    if (!distance) return;

    currentDistance = distance;

    resultDiv.style.display = 'block';
    resultDiv.style.color = '#1565c0';
    resultDiv.textContent = `Distance: ${distance.toFixed(2)} km`;

    // ❌ TOO FAR
    if (distance > 250) {
        resultDiv.style.color = '#d32f2f';
        resultDiv.textContent =
            `Sorry, drop point is too far (${distance.toFixed(2)} km). We can't provide service.`;

        costDiv.style.display = 'none';
        confirmBtn.style.display = 'none';
        return;
    }

    // ✅ COST
    let rate = 2;
    if (vehicle.value === 'Truck') rate = 4;
    if (vehicle.value === 'Mini Truck') rate = 3;
    if (vehicle.value === 'Tractor') rate = 2.5;

    currentCost = (distance * rate) + 100;

    costDiv.style.display = 'block';
    costDiv.textContent = `Cost: ₹${currentCost.toFixed(2)}`;

    confirmBtn.style.display = 'inline-block';
});