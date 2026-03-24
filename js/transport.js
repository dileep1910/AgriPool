import { setupNavbar } from './navbar.js';
import { initAuth } from './auth.js';
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

initAuth(true, false);
setupNavbar();

let currentUser = null;
let currentDistance = 0;
let currentCost = 0;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = JSON.parse(localStorage.getItem('agripool_user'));
});

document.getElementById('transport-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const vehicle = document.querySelector('input[name="vehicle"]:checked');
    const resultDiv = document.getElementById('distance-result');
    const costDiv = document.getElementById('calc-cost');
    const btnConfirm = document.getElementById('confirm-booking-btn');
    const checkBtn = document.getElementById('check-btn');

    if (!vehicle) {
        alert("Please select a vehicle type");
        return;
    }

    // Mock distance API (Generate random between 50 and 350 km to allow testing both >250 and <250 limits easily)
    currentDistance = Math.floor(Math.random() * 300) + 50;
    
    resultDiv.style.display = 'block';
    costDiv.style.display = 'none';
    btnConfirm.style.display = 'none';

    if (currentDistance > 250) {
        resultDiv.style.color = '#d32f2f';
        resultDiv.textContent = `Distance is ${currentDistance} km. Distance is too far. We cannot provide transport. Sorry for inconvenience.`;
        checkBtn.textContent = 'Recalculate (Demo)';
    } else {
        resultDiv.style.color = '#1565c0';
        resultDiv.textContent = `Estimated Distance: ${currentDistance} km.`;
        
        let rate = 1.5;
        if (vehicle.value === 'Truck') rate = 3.0;
        if (vehicle.value === 'Tractor') rate = 2.0;
        
        currentCost = currentDistance * rate + 50; // base fare
        costDiv.textContent = `Estimated Cost: $${currentCost.toFixed(2)}`;
        costDiv.style.display = 'block';
        btnConfirm.style.display = 'inline-block';
        checkBtn.style.display = 'none'; 
    }
});

document.getElementById('confirm-booking-btn').addEventListener('click', async () => {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    const crop = document.getElementById('crop').value;
    const vehicle = document.querySelector('input[name="vehicle"]:checked').value;
    
    const driverNames = ['Ramesh Singh', 'Ashok Kumar', 'Rajesh Sharma', 'Dilip Yadav'];
    const driver = driverNames[Math.floor(Math.random() * driverNames.length)];
    const phone = '98' + Math.floor(Math.random() * 90000000 + 10000000);
    const plate = 'HR ' + Math.floor(Math.random()*90+10) + ' AB ' + Math.floor(Math.random()*9000+1000);
    
    const bookingData = {
        uid: currentUser ? currentUser.uid : 'guest',
        pickup,
        dropoff,
        crop,
        vehicle,
        distance: currentDistance,
        cost: currentCost,
        driverName: driver,
        driverPhone: phone,
        vehiclePlate: plate,
        date: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, `users/${bookingData.uid}/bookings`), bookingData);
    } catch(e) {
        console.log('Mock firestore save error', e);
        let bookings = JSON.parse(localStorage.getItem('agripool_bookings')) || [];
        bookings.push(bookingData);
        localStorage.setItem('agripool_bookings', JSON.stringify(bookings));
    }

    document.getElementById('transport-form').style.display = 'none';
    const successDiv = document.getElementById('booking-success');
    document.getElementById('s-driver').textContent = driver;
    document.getElementById('s-phone').textContent = phone;
    document.getElementById('s-vehicle').textContent = vehicle;
    document.getElementById('s-plate').textContent = plate;
    successDiv.style.display = 'block';
});
