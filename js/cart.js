import { setupNavbar, updateCartCount } from './navbar.js';
import { initAuth } from './auth.js';

initAuth(true, false);
setupNavbar();

function renderCart() {
    let cart = JSON.parse(localStorage.getItem('agripool_cart')) || [];
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<h2>Your cart is empty</h2>';
        document.getElementById('subtotal').textContent = '$0.00';
        document.getElementById('shipping').textContent = '$0.00';
        document.getElementById('total').textContent = '$0.00';
        document.getElementById('checkout-btn').disabled = true;
        return;
    }

    container.innerHTML = `<h2>Cart Items (${cart.reduce((s,i)=>s+parseInt(i.quantity),0)})</h2>`;
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        // Add inline flex styles if missing from CSS
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '20px';
        div.style.padding = '20px 0';
        div.style.borderBottom = '1px solid #eee';

        div.innerHTML = `
            <div class="cart-item-img" style="width:80px; height:80px; background:rgba(76,175,80,0.1); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:2rem; color:var(--primary-green);">
                <i class="fa-solid ${item.img}"></i>
            </div>
            <div class="cart-item-details" style="flex:1;">
                <div class="cart-item-title" style="font-weight:600; margin-bottom:5px;">${item.name}</div>
                <div class="cart-item-price" style="color:var(--primary-green);">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions" style="display:flex; align-items:center; gap:15px;">
                <button class="quantity-btn dec-btn" data-id="${item.id}" style="padding: 5px 10px; cursor: pointer;">-</button>
                <input type="text" value="${item.quantity}" class="quantity-input" readonly style="width:40px; text-align:center;">
                <button class="quantity-btn inc-btn" data-id="${item.id}" style="padding: 5px 10px; cursor: pointer;">+</button>
                <button class="cart-item-remove remove-btn" data-id="${item.id}" title="Remove" style="color:#f44336; background:none; border:none; cursor:pointer; font-size:1.2rem;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });

    const shipping = subtotal > 0 ? 15.00 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('shipping').textContent = '$' + shipping.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
    document.getElementById('checkout-btn').disabled = false;

    attachCartListeners();
}

function attachCartListeners() {
    document.querySelectorAll('.dec-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateQuantity(parseInt(e.currentTarget.dataset.id), -1);
        });
    });
    document.querySelectorAll('.inc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateQuantity(parseInt(e.currentTarget.dataset.id), 1);
        });
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeFromCart(parseInt(e.currentTarget.dataset.id));
        });
    });
}

function updateQuantity(id, change) {
    let cart = JSON.parse(localStorage.getItem('agripool_cart')) || [];
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        localStorage.setItem('agripool_cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('agripool_cart')) || [];
    cart = cart.filter(idx => idx.id !== id);
    localStorage.setItem('agripool_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

document.getElementById('checkout-btn')?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
});

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
