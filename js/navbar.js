// js/navbar.js
export function setupNavbar() {
    const profileBtn = document.getElementById('profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        window.addEventListener('click', () => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }

    updateCartCount();
}

export function updateCartCount() {
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        const cart = JSON.parse(localStorage.getItem('agripool_cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
        cartCountEl.textContent = totalItems > 99 ? '99+' : totalItems;
    }
}
