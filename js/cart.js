// cart.js

let cart = [];

function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    saveCart();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const totalPriceElem = document.getElementById('total-price');

    const totalItems = cart.reduce((total, product) => total + product.quantity, 0);
    cartCount.innerText = totalItems;

    const totalPrice = cart.reduce((total, product) => total + (product.price * product.quantity), 0);
    totalPriceElem.innerText = totalPrice.toFixed(2);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

document.addEventListener('DOMContentLoaded', loadCart);