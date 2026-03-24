import { setupNavbar } from './navbar.js';
import { initAuth } from './auth.js';
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

initAuth(true, false);
setupNavbar();

const btnOrders = document.getElementById('tab-orders');
const btnTransport = document.getElementById('tab-transport');
const list = document.getElementById('activity-list');
let user = null;

document.addEventListener('DOMContentLoaded', () => {
    user = JSON.parse(localStorage.getItem('agripool_user'));
    if (!user) {
        list.innerHTML = '<p>Please log in.</p>';
        return;
    }
    loadOrders();
});

btnOrders.addEventListener('click', () => {
    btnOrders.className = 'btn';
    btnOrders.style.backgroundColor = 'var(--primary-green)';
    btnOrders.style.color = '#fff';
    
    btnTransport.className = 'btn btn-secondary';
    btnTransport.style.backgroundColor = 'transparent';
    btnTransport.style.color = 'var(--primary-green)';
    loadOrders();
});

btnTransport.addEventListener('click', () => {
    btnTransport.className = 'btn';
    btnTransport.style.backgroundColor = 'var(--primary-green)';
    btnTransport.style.color = '#fff';

    btnOrders.className = 'btn btn-secondary';
    btnOrders.style.backgroundColor = 'transparent';
    btnOrders.style.color = 'var(--primary-green)';
    loadTransport();
});

async function loadOrders() {
    list.innerHTML = '<p>Loading orders...</p>';
    try {
        const q = query(collection(db, "orders"), where("uid", "==", user.uid));
        const qs = await getDocs(q);
        const orders = [];
        qs.forEach((d) => orders.push({id: d.id, ...d.data()}));
        renderOrders(orders);
    } catch(e) {
        let orders = JSON.parse(localStorage.getItem('agripool_orders')) || [];
        renderOrders(orders.filter(o => o.uid === user.uid));
    }
}

async function loadTransport() {
    list.innerHTML = '<p>Loading bookings...</p>';
    try {
        const q = query(collection(db, `users/${user.uid}/bookings`));
        const qs = await getDocs(q);
        const bookings = [];
        qs.forEach((d) => bookings.push({id: d.id, ...d.data()}));
        renderTransport(bookings);
    } catch(e) {
        let bks = JSON.parse(localStorage.getItem('agripool_bookings')) || [];
        renderTransport(bks.filter(o => o.uid === user.uid));
    }
}

function renderOrders(orders) {
    if (orders.length === 0) { list.innerHTML = '<p>No orders found.</p>'; return; }
    list.innerHTML = '';
    orders.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(order => {
        const div = document.createElement('div');
        div.style.background = 'white'; div.style.padding = '20px'; div.style.borderRadius = '12px'; div.style.boxShadow = 'var(--shadow)'; div.style.marginBottom = '20px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <h3 style="color:var(--primary-green);">Order #${order.orderId}</h3>
                <span>${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        `;
        list.appendChild(div);
    });
}

function renderTransport(bookings) {
    if (bookings.length === 0) { list.innerHTML = '<p>No transport bookings found.</p>'; return; }
    list.innerHTML = '';
    bookings.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(b => {
        const div = document.createElement('div');
        div.style.background = 'white'; div.style.padding = '20px'; div.style.borderRadius = '12px'; div.style.boxShadow = 'var(--shadow)'; div.style.marginBottom = '20px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <h3 style="color:var(--primary-green);"><i class="fa-solid fa-truck"></i> Transport Booking</h3>
                <span>${new Date(b.date).toLocaleDateString()}</span>
            </div>
            <p style="margin-top:10px;"><strong>Route:</strong> ${b.pickup} &rarr; ${b.dropoff}</p>
            <p><strong>Distance & Cost:</strong> ${b.distance} km | $${b.cost.toFixed(2)}</p>
            <p><strong>Driver:</strong> ${b.driverName} (${b.driverPhone})</p>
            <p><strong>Vehicle:</strong> ${b.vehicle} - ${b.vehiclePlate}</p>
        `;
        list.appendChild(div);
    });
}
