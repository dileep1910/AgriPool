import { setupNavbar } from './navbar.js';
import { initAuth } from './auth.js';
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


initAuth(false, false); // guests can track if they have the ID
setupNavbar();

document.getElementById('track-btn').addEventListener('click', async () => {
    const orderId = document.getElementById('track-id').value.trim();
    if (!orderId) return;
    
    const resultDiv = document.getElementById('tracking-result');
    const errDiv = document.getElementById('tracking-error');
    const trackBtn = document.getElementById('track-btn');
    
    trackBtn.textContent = 'Searching...';
    trackBtn.disabled = true;

    let order = null;
    
    try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            order = docSnap.data();
        } else {
            throw new Error('Not found');
        }
    } catch(e) {
        // Fallback Mock Logic
        let orders = JSON.parse(localStorage.getItem('agripool_orders')) || [];
        order = orders.find(o => o.orderId === orderId);
    }

    trackBtn.textContent = 'Track';
    trackBtn.disabled = false;

    if (order) {
        errDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        document.getElementById('t-status').textContent = order.status || 'Processing';
        
        const stepsContainer = document.querySelector('.tracking-steps');
        stepsContainer.innerHTML = '';
        
        const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
        let currentStepIdx = 1; // Default Processing
        if(order.status === 'Shipped') currentStepIdx = 2;
        if(order.status === 'Delivered') currentStepIdx = 3;

        steps.forEach((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const li = document.createElement('li');
            li.style.position = 'relative';
            li.style.paddingLeft = '30px';
            li.style.marginBottom = '20px';
            li.style.color = isCompleted ? 'var(--text-dark)' : 'var(--text-light)';
            li.style.fontWeight = isCompleted ? '600' : '400';
            
            li.innerHTML = `
                <div style="position:absolute; left:0; top:2px; width:15px; height:15px; border-radius:50%; background:${isCompleted? 'var(--primary-green)':'#ddd'}; transition: background 0.3s ease;"></div>
                ${step}
            `;
            // Add a connecting line for visual flair
            if (idx < steps.length - 1) {
                const line = document.createElement('div');
                line.style.position = 'absolute';
                line.style.left = '7px';
                line.style.top = '17px';
                line.style.width = '2px';
                line.style.height = '20px';
                line.style.background = idx < currentStepIdx ? 'var(--primary-green)' : '#ddd';
                li.appendChild(line);
            }
            
            stepsContainer.appendChild(li);
        });
    } else {
        resultDiv.style.display = 'none';
        errDiv.style.display = 'block';
    }
});

// Auto track if param is present
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
if (id) {
    document.getElementById('track-id').value = id;
    document.getElementById('track-btn').click();
}
