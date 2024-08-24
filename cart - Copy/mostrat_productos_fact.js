// Variable para almacenar los productos después de cargarlos del JSON
let productos = []; 

// Cargar productos desde un archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('../json/productos.json');
        
        if (!response.ok) {
            throw new Error(`Error al obtener productos: ${response.status}`);
        }
        
        const data = await response.json();

        // Verificar si data es un objeto y contiene una propiedad "productos" que es un array
        if (data && Array.isArray(data.productos)) {
            productos = data.productos;
        } else {
            throw new Error('Los datos cargados no contienen un array de productos.');
        }

        console.log('Productos cargados:', productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Buscar producto por ID en el array de productos
function buscarProductoPorId(id) {
    if (!Array.isArray(productos)) {
        console.error('La variable "productos" no es un array.');
        return null;
    }
    return productos.find(producto => producto.id === id);
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

        const { precio, descripcion, image } = producto;
        const cantidad = itemCarrito.cantidad;

        // Eliminar el símbolo `$` y las comas del precio y convertir a número
        const precioNumerico = parseFloat(precio.replace(/[$,]/g, ''));

        if (isNaN(precioNumerico)) {
            console.error('El precio no es un número válido:', precioNumerico);
            return;
        }

        const subtotal = precioNumerico * cantidad;
        totalSubtotal += subtotal;

        const itemHtml = `
            <div class="row cart-item align-items-center" style="margin-bottom: 15px;"> <!-- Añadido margen inferior -->
                <div class="col-md-6 d-flex align-items-center">
                    <img src="${image || './img/default.jpg'}" class="img-fluid" style="width: 80px; margin-right: 10px;">
                    <div>
                        <h5>${descripcion}</h5>
                    </div>
                </div>
                <div class="col-md-2">$${precioNumerico.toFixed(2)}</div>
                <div class="col-md-2">${cantidad}</div>
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
    await cargarProductos(); // Asegúrate de que los productos se cargan antes de mostrar el carrito
    mostrarProductosEnCarrito(); // Mostrar los productos en el carrito
});
// Variable para almacenar los productos después de cargarlos del JSON
let productos = []; 

// Cargar productos desde un archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('../json/productos.json');
        
        if (!response.ok) {
            throw new Error(`Error al obtener productos: ${response.status}`);
        }
        
        const data = await response.json();

        // Verificar si data es un objeto y contiene una propiedad "productos" que es un array
        if (data && Array.isArray(data.productos)) {
            productos = data.productos;
        } else {
            throw new Error('Los datos cargados no contienen un array de productos.');
        }

        console.log('Productos cargados:', productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Buscar producto por ID en el array de productos
function buscarProductoPorId(id) {
    if (!Array.isArray(productos)) {
        console.error('La variable "productos" no es un array.');
        return null;
    }
    return productos.find(producto => producto.id === id);
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

        const { precio, descripcion, image } = producto;
        const cantidad = itemCarrito.cantidad;

        // Eliminar el símbolo `$` y las comas del precio y convertir a número
        const precioNumerico = parseFloat(precio.replace(/[$,]/g, ''));

        if (isNaN(precioNumerico)) {
            console.error('El precio no es un número válido:', precioNumerico);
            return;
        }

        const subtotal = precioNumerico * cantidad;
        totalSubtotal += subtotal;

        const itemHtml = `
            <div class="row cart-item align-items-center" style="margin-bottom: 15px;"> <!-- Añadido margen inferior -->
                <div class="col-md-6 d-flex align-items-center">
                    <img src="${image || './img/default.jpg'}" class="img-fluid" style="width: 80px; margin-right: 10px;">
                    <div>
                        <h5>${descripcion}</h5>
                    </div>
                </div>
                <div class="col-md-2">$${precioNumerico.toFixed(2)}</div>
                <div class="col-md-2">${cantidad}</div>
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
    await cargarProductos(); // Asegúrate de que los productos se cargan antes de mostrar el carrito
    mostrarProductosEnCarrito(); // Mostrar los productos en el carrito
});
