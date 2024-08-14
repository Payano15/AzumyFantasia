// Función para inicializar el carrito (borrar contenido del carrito)
function inicializarCarrito() {
    localStorage.setItem('carrito', JSON.stringify([])); // Reinicia el carrito como un array vacío
    console.log('Carrito reiniciado a un array vacío');
}

// Función para actualizar el total del carrito en la interfaz
function actualizarTotalCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalCarritoElement = document.getElementById('total-price'); // Cambiado a 'total-price'

    // Verifica si el elemento existe antes de intentar acceder a su propiedad
    if (totalCarritoElement) {
        totalCarritoElement.textContent = `${total.toFixed(2)}`;
    } else {
        console.error('Elemento total-price no encontrado en el DOM.');
    }
}

// Función para cargar los datos del producto
async function cargarDatosProductos() {
    try {
        const response = await fetch('../json/productos.json'); // Asegúrate de que la ruta sea correcta
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json();
        return productos;
    } catch (error) {
        console.error('Error al cargar los datos del producto:', error);
    }
}

// Función para actualizar los productos en el DOM
function actualizarProductosEnDOM(productos) {
    const featuredProductsContainer = document.getElementById('featured-products');
    const lovedProductsContainer = document.getElementById('loved-products');

    productos.forEach(producto => {
        const cardHtml = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${producto.image}" class="card-img-top" alt="${producto.name}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.name}</h5>
                        <p class="card-text">${producto.description}</p>
                        <p class="card-text">$${producto.price.toFixed(2)}</p>
                        <input type="number" min="1" value="1" id="quantity-${producto.id}" class="form-control mb-2" style="width: 80px;">
                        <button class="btn btn-primary" onclick="handleAddToCart('${producto.id}', '${producto.name}', ${producto.price})">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;

        if (producto.name.includes('Producto 1') || producto.name.includes('Producto 2') || producto.name.includes('Producto 3')) {
            featuredProductsContainer.innerHTML += cardHtml;
        } else {
            lovedProductsContainer.innerHTML += cardHtml;
        }
    });
}

// Función para manejar la adición de un producto al carrito
function handleAddToCart(id, name, price) {
    const quantity = document.getElementById(`quantity-${id}`).value;
    console.log(`Botón clicado: ID=${id}, Nombre=${name}, Precio=${price}, Cantidad=${quantity}`); // Verifica que se imprima
    addToCart({ id, name, price, quantity });
    actualizarTotalCarrito(); // Actualiza el total del carrito después de añadir un producto
}

// Función para añadir productos al carrito y guardarlos en localStorage
function addToCart(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(producto);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Producto añadido al carrito:', producto);
}

// Evento para inicializar el carrito y cargar los productos
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito(); // Reinicia el carrito al cargar la página
    cargarDatosProductos().then(productos => {
        if (productos) {
            actualizarProductosEnDOM(productos);
            actualizarTotalCarrito(); // Actualiza el total del carrito después de que se hayan añadido los productos
        }
    });
});