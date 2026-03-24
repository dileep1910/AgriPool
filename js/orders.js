import { setupNavbar } from './navbar.js';
import { initAuth } from './auth.js';
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Keep this protected
initAuth(true, false);
setupNavbar();

document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('orders-list');
    const user = JSON.parse(localStorage.getItem('agripool_user'));

    if (!user) {
        list.innerHTML = '<p>Please log in.</p>';
        return;
    }

    try {
        // Query Firestore if configured
        const q = query(collection(db, "orders"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({id: doc.id, ...doc.data()});
        });

        renderOrders(orders, list);
    } catch(e) {
        console.log("Mock Firestore error: falling back to local storage.", e);
        const localOrders = JSON.parse(localStorage.getItem('agripool_orders')) || [];
        const userOrders = localOrders.filter(o => o.uid === user.uid);
        renderOrders(userOrders, list);
    }
});

function renderOrders(orders, container) {
    if (orders.length === 0) {
        container.innerHTML = '<p>No orders found. <a href="shop.html">Start shopping!</a></p>';
        return;
    }

    container.innerHTML = '';
    
    // Sort descending by date
    orders.sort((a,b) => new Date(b.date) - new Date(a.date));

    orders.forEach(order => {
        const div = document.createElement('div');
        div.style.background = 'white';
        div.style.padding = '20px';
        div.style.borderRadius = '12px';
        div.style.boxShadow = 'var(--shadow)';
        div.style.marginBottom = '20px';
        
        const dateStr = new Date(order.date).toLocaleDateString();
        
        let itemsHtml = order.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('');

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="color: var(--primary-green);">Order #${order.orderId}</h3>
                <span style="font-weight: 500; color: #ffb300;">Status: ${order.status}</span>
            </div>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)} (${order.paymentMethod})</p>
            <div style="margin-top: 15px;">
                <strong>Items:</strong>
                <ul style="margin-left: 20px; color: var(--text-light); font-size: 0.95rem;">
                    ${itemsHtml}
                </ul>
            </div>
            <div style="margin-top: 15px;">
                <a href="track.html?id=${order.orderId}" class="btn btn-secondary" style="text-decoration: none; font-size: 0.9rem; padding: 5px 15px;">Track Order</a>
            </div>
        `;
        container.appendChild(div);
    });
}
