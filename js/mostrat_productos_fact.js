document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // Verifica si el evento se dispara
    loadCart(); // Cargar el carrito desde localStorage al iniciar la página
});

function addToCart(product) {
    console.log('addToCart called', product); // Verifica si la función se llama correctamente
    let cart = getCart(); // Obtiene el carrito desde localStorage
    const existingProduct = cart.find(item => item.id === product.id);
    const quantity = parseInt(product.quantity);

    if (existingProduct) {
        existingProduct.quantity += quantity; // Sumar la cantidad si ya existe
    } else {
        cart.push({ ...product, quantity }); // Agregar nuevo producto al carrito
    }

    updateCartUI(cart); // Actualizar la interfaz del carrito
    saveCart(cart); // Guardar el carrito en localStorage
}

function updateCartUI(cart) {
    console.log('updateCartUI called', cart); // Verifica si la función se llama correctamente
    const totalPriceElem = document.getElementById('total-price');
    const cartItemsElem = document.getElementById('cart-items');

    if (!totalPriceElem || !cartItemsElem) {
        console.error("Elementos del DOM no encontrados.");
        return;
    }

    let totalPrice = 0;

    cartItemsElem.innerHTML = cart.map(product => {
        const priceStr = product.price ? product.price : '0.00'; 
        const price = parseFloat(priceStr.replace('$', '')); 

        if (isNaN(price)) {
            console.error(`Precio inválido para el producto con ID ${product.id}: ${priceStr}`);
            return ''; // Evita que se genere HTML incorrecto
        }

        const rutaBase = '../uploads/'; // Ruta base relativa
        const subtotal = price * product.quantity;
        totalPrice += subtotal;

        return `
            <div class="card mb-3">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <img src="${rutaBase}${product.urlimagen}" class="card-img" alt="${product.articulo}">
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

function saveCart(cart) {
    console.log('saveCart called', cart); // Verifica si la función se llama correctamente
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCart() {
    const savedCart = localStorage.getItem('cart');
    console.log('getCart called', savedCart); // Verifica si el carrito se recupera correctamente
    if (savedCart) {
        return JSON.parse(savedCart);
    }
    return [];
}

function loadCart() {
    console.log('loadCart called'); // Verifica si la función se llama correctamente
    const cart = getCart();
    updateCartUI(cart); // Actualiza la interfaz del carrito con los datos del carrito cargado
}
