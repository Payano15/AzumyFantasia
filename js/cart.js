let cart = [];

// Función para agregar un producto al carrito
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    const quantity = parseInt(product.quantity);

    if (existingProduct) {
        existingProduct.quantity += quantity; // Sumar la cantidad si ya existe
    } else {
        cart.push({ ...product, quantity }); // Agregar nuevo producto al carrito
    }

    updateCartUI(); // Actualizar la interfaz del carrito
    saveCart(); // Guardar el carrito en localStorage
}

// Función para actualizar la interfaz del carrito
function updateCartUI() {
    const totalPriceElem = document.getElementById('total-price');
    let totalPrice = 0;

    cart.forEach(product => {
        const subtotal = product.price * product.quantity;
        totalPrice += subtotal;
    });

    totalPriceElem.innerText = `Total: $${totalPrice.toFixed(2)}`;
    document.getElementById('cart-count').innerText = cart.length; // Actualizar el contador del carrito
}

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para cargar el carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Cargar el carrito al iniciar la página
document.addEventListener('DOMContentLoaded', loadCart);