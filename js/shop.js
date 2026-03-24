import { setupNavbar } from './navbar.js';
import { initAuth } from './auth.js';

initAuth(true, false);
setupNavbar();

const products = [
    { id: 1, name: "Organic NPK Blend 50kg", price: 45.00, category: "fertilizer", img: "fa-flask" },
    { id: 2, name: "Heavy Duty Steel Hoe", price: 22.50, category: "tool", img: "fa-hammer" },
    { id: 3, name: "Premium Wheat Seeds 10kg", price: 30.00, category: "seed", img: "fa-seedling" },
    { id: 4, name: "Professional Pruning Shears", price: 18.99, category: "tool", img: "fa-scissors" },
    { id: 5, name: "Knapsack Sprayer 16L", price: 65.00, category: "tool", img: "fa-spray-can" },
    { id: 6, name: "Liquid Micro-Nutrients 5L", price: 35.50, category: "fertilizer", img: "fa-droplet" }
];

function renderProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    products.filter(p => filter === 'all' || p.category === filter).forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="product-image">
                <i class="fa-solid ${product.img}"></i>
            </div>
            <div class="product-details">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn add-to-cart-btn" data-id="${product.id}">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(div);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            addToCart(products.find(p => p.id === id));
        });
    });
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('agripool_cart')) || [];
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('agripool_cart', JSON.stringify(cart));
    
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
        cartCountEl.textContent = totalItems > 99 ? '99+' : totalItems;
    }
    
    const btn = document.querySelector(`.add-to-cart-btn[data-id="${product.id}"]`);
    const origText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
    bt.style.backgroundColor = '#81C784';
    setTimeout(() => {
        btn.innerHTML = origText;
        btn.style.backgroundColor = '';
    }, 1000);
}

document.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        renderProducts(e.target.value);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});
