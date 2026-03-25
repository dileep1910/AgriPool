import { initAuth } from './auth.js';
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

initAuth(true, false);

let currentUser = null;
let currentDistance = 0;
let currentCost = 0;

// LOAD USER
document.addEventListener('DOMContentLoaded', () => {
    currentUser = JSON.parse(localStorage.getItem('agripool_user'));
});

const API_KEY_OC = "1b7f11b5d9d8474bbfdbffac0a1de484";   // dropdown
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExMzNkMDJiYmVlYTQ2MDI5NzU3MTFmYjQ0NDhmYjgwIiwiaCI6Im11cm11cjY0In0=";      // distance
// ================= AUTOCOMPLETE =================
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

            div.textContent =
                place.components.village ||
                place.components.town ||
                place.components.city ||
                place.formatted;

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

// INPUT LISTENERS
document.getElementById("pickup").addEventListener("input", (e) => {
    getSuggestions(e.target.value, "pickup-suggestions", "pickup");
});

document.getElementById("dropoff").addEventListener("input", (e) => {
    getSuggestions(e.target.value, "dropoff-suggestions", "dropoff");
});

// ================= DISTANCE =================
async function getCoords(place) {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${API_KEY_OC}`);
    const data = await res.json();

    if (!data.results.length) return null;
    return data.results[0].geometry;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getRealDistance(pickup, dropoff) {
    try {
        const p1 = await getCoords(pickup);
        const p2 = await getCoords(dropoff);

        if (!p1 || !p2) return null;

        const res = await fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${p1.lng},${p1.lat}&end=${p2.lng},${p2.lat}`
        );

        const data = await res.json();

        if (!data.features || !data.features.length) return null;

        const distanceMeters = data.features[0].properties.summary.distance;

        return distanceMeters / 1000; // km

    } catch (err) {
        console.error(err);
        return null;
    }
}

// ================= VEHICLE SELECT =================
document.querySelectorAll('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        card.querySelector('input').checked = true;
    });
});

// ================= FORM =================
document.getElementById('transport-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const pickup = document.getElementById('pickup').value.trim();
    const dropoff = document.getElementById('dropoff').value.trim();
    const vehicle = document.querySelector('input[name="vehicle"]:checked');

    const resultBox = document.getElementById('result-box');
    const confirmBtn = document.getElementById("confirm-booking-btn");

    confirmBtn.style.display = "none";

    if (!vehicle) {
        alert("Select vehicle");
        return;
    }

    const distance = await getRealDistance(pickup, dropoff);

    if (!distance) {
        resultBox.style.display = "block";
        resultBox.className = "result-box error";
        resultBox.innerHTML = "❌ Unable to calculate distance";
        return;
    }

    resultBox.style.display = "block";

    if (distance > 250) {
        resultBox.className = "result-box error";
        resultBox.innerHTML = `
            <h3>❌ Too Far</h3>
            <p>${distance.toFixed(2)} km (Max 250 km)</p>
        `;
        return;
    }

    let rate = 15;
    if (vehicle.value === "mini") rate = 20;
    if (vehicle.value === "truck") rate = 30;
    if (vehicle.value === "tractor") rate = 10;

    const baseCost = distance * rate;
    const loading = 800;
    const toll = distance > 150 ? distance * 3 : 0;

    const total = baseCost + loading + toll;

    currentDistance = distance;
    currentCost = total;

    resultBox.className = "result-box success";
    resultBox.innerHTML = `
        <h3>✅ Estimate</h3>
        <p>Distance: ${distance.toFixed(2)} km</p>
        <p>Vehicle: ${vehicle.value}</p>
        <hr>
        <p>Base: ₹${baseCost.toFixed(0)}</p>
        <p>Loading: ₹800</p>
        <p>Toll: ₹${toll.toFixed(0)}</p>
        <hr>
        <h2>Total: ₹${total.toFixed(0)}</h2>
    `;

    confirmBtn.style.display = "block";
});

// ================= CONFIRM =================
document.getElementById("confirm-booking-btn").addEventListener("click", async () => {

    try {
        await addDoc(collection(db, "transport_bookings"), {
            pickup: document.getElementById('pickup').value,
            dropoff: document.getElementById('dropoff').value,
            distance: currentDistance,
            cost: currentCost,
            createdAt: new Date()
        });

        alert("✅ Booking Done");
        window.location.href = "orders.html";

    } catch (err) {
        console.error(err);
        alert("❌ Error saving booking");
    }
});