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
    const cartItemsElem = document.getElementById('cart-items');

    if (!totalPriceElem) {
        console.error("Elemento 'total-price' no encontrado en el DOM.");
        return;
    }

    let totalPrice = 0;
    let totalQuantity = 0;

    // Mostrar los productos en el contenedor del carrito
    cartItemsElem.innerHTML = cart.map(product => {
        const price = parseFloat(product.price.replace('$', ''));
        if (isNaN(price)) {
            console.error(`Precio inválido para el producto con ID ${product.id}: ${product.price}`);
            return '';
        }
        const subtotal = price * product.quantity;
        totalPrice += subtotal;
        totalQuantity += product.quantity;

        return `
            <div class="card mb-3">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <img src="./uploads/${product.urlimagen}" class="card-img" alt="${product.articulo}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${product.articulo}</h5>
                            <p class="card-text">${product.desc_articulo}</p>
                            <p class="card-text text-success">$${price.toFixed(2)}</p>
                            <p class="card-text">Cantidad: ${product.quantity}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    totalPrice = Math.round(totalPrice * 100) / 100;
    totalPriceElem.innerText = `Total: $${totalPrice.toFixed(2)}`;
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