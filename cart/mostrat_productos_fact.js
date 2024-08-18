// Variable para almacenar los productos después de cargarlos del JSON
let productos = []; 

// Cargar productos desde un archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('../json/productos.json');
        
        if (!response.ok) {
            throw new Error(`Error al obtener productos: ${response.status}`);
        }
        
        productos = await response.json();
        console.log('Productos cargados:', productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Buscar producto por ID en el array de productos
function buscarProductoPorId(id) {
    return productos.find(producto => producto.id === id);
}

// Mostrar los detalles del producto en el DOM
function mostrarDetallesProducto(producto) {
    const productDetailsContainer = document.getElementById('product-details');

    if (!producto) {
        productDetailsContainer.innerHTML = '<p>Producto no encontrado.</p>';
        return;
    }

    const { name, description, image, price } = producto;

    productDetailsContainer.innerHTML = `
        <p>${description}</p>
        <img src="${image || './img/default.jpg'}" alt="${name}">
        <p>Precio: $${price.toFixed(2)}</p>
    `;
}

// Manejar la búsqueda del producto por ID
function buscarYMostrarProducto() {
    const id = parseInt(document.getElementById('product-id').value, 10);
    const producto = buscarProductoPorId(id);

    mostrarDetallesProducto(producto);
}

// Agregar un producto al carrito
function agregarAlCarrito(id, cantidad) {
    const producto = buscarProductoPorId(id);

    if (!producto) {
        console.error('Producto no encontrado:', id);
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(p => p.id === id);

    if (index !== -1) {
        carrito[index].quantity += cantidad;
    } else {
        const productoEnCarrito = {
            id: id,
            name: producto.name,
            description: producto.description,
            image: producto.image,
            price: producto.price,
            quantity: cantidad
        };
        carrito.push(productoEnCarrito);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Producto añadido al carrito:', producto);
}

// Mostrar los productos en el carrito
function mostrarProductosEnCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartItemsContainer || !totalPriceElement) {
        console.error('Elementos del carrito o precio no encontrados en el DOM.');
        return;
    }

    cartItemsContainer.innerHTML = '';

    let totalSubtotal = 0;

    carrito.forEach(itemCarrito => {
        // Buscar el producto en el array de productos usando el ID del carrito
        const producto = buscarProductoPorId(itemCarrito.id);

        if (!producto) {
            console.error('Producto no encontrado en el array de productos:', itemCarrito.id);
            return;
        }

        const { price = 0, description = 'Descripción no disponible', quantity = 1, image = './img/default.jpg' } = producto;

        const subtotal = price * itemCarrito.quantity;
        totalSubtotal += subtotal;

        const itemHtml = `
            <div class="row cart-item align-items-center">
                <div class="col-md-6 d-flex align-items-center">
                    <img src="${image}" class="img-fluid" style="width: 80px; margin-right: 10px;">
                    <div>
                        <h5>${producto.name}</h5>
                        <p>${description}</p>
                    </div>
                </div>
                <div class="col-md-2">$${price.toFixed(2)}</div>
                <div class="col-md-2">${itemCarrito.quantity}</div>
                <div class="col-md-2">$${subtotal.toFixed(2)}</div>
            </div>
        `;

        cartItemsContainer.innerHTML += itemHtml;
    });

    // Actualiza el total del carrito
    totalPriceElement.textContent = `$${totalSubtotal.toFixed(2)}`;
}

// Cargar los productos del JSON cuando la página esté lista
document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    mostrarProductosEnCarrito();

    // Asignar el manejador de eventos al botón de búsqueda si es necesario
    // document.getElementById('search-product').addEventListener('click', buscarYMostrarProducto);
});