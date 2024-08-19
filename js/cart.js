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
    const cartCountElem = document.getElementById('cart-count');

    if (!totalPriceElem) {
        console.error("Elemento 'total-price' no encontrado en el DOM.");
        return;
    }

    let totalPrice = 0;
    let totalQuantity = 0;

    cart.forEach(product => {
        // Asegúrate de que `product.price` sea un número antes de realizar operaciones
        const price = parseFloat(product.price.replace('$', ''));
        if (isNaN(price)) {
            console.error(`Precio inválido para el producto con ID ${product.id}: ${product.price}`);
            return;
        }
        const subtotal = price * product.quantity;
        totalPrice += subtotal;
        totalQuantity += product.quantity; // Contar la cantidad total de productos
    });

    // Redondear el precio total a dos decimales
    totalPrice = Math.round(totalPrice * 100) / 100;

    // Formatear el precio total con dos decimales
    totalPriceElem.innerText = `Total: $${totalPrice.toFixed(2)}`;

    // Actualiza y muestra el contador solo si hay productos en el carrito
    if (cartCountElem) {
        if (totalQuantity > 0) {
            cartCountElem.innerText = totalQuantity;
            cartCountElem.style.display = 'inline'; // Muestra el contador
        } else {
            cartCountElem.style.display = 'none'; // Oculta el contador si no hay productos
        }
    }
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