document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito(); // Reinicia el carrito al cargar la página
    cargarDatosProductos(); // Carga los productos desde el archivo PHP
});

// Función para inicializar el carrito (borrar contenido del carrito)
function inicializarCarrito() {
    localStorage.setItem('carrito', ''); // Reinicia el carrito
    console.log('Carrito reiniciado');
}

// Función para actualizar el total del carrito en la interfaz
function actualizarTotalCarrito() {
    const carrito = getCarrito();
    const total = carrito.reduce((acc, item) => acc + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);
    const totalCarritoElement = document.getElementById('total-price');

    if (totalCarritoElement) {
        totalCarritoElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.error('Elemento total-price no encontrado en el DOM.');
    }
}

// Función para cargar los datos del producto desde un archivo PHP
async function cargarDatosProductos() {
    try {
        const response = await fetch('../php/productos_index.php'); // Cambia la ruta a tu archivo PHP
        console.log('Respuesta de fetch:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        console.log('HTML recibido:', html);
        document.getElementById('product-container').innerHTML = html; // Suponiendo que hay un contenedor con el ID 'product-container'
    } catch (error) {
        console.error('Error al cargar los datos del producto:', error);
    }
}

// Función para manejar la adición de un producto al carrito
function handleAddToCart(id, name, price) {
    const quantity = parseInt(document.getElementById(`quantity-${id}`).value, 10);
    console.log(`Botón clicado: ID=${id}, Nombre=${name}, Precio=${price}, Cantidad=${quantity}`);
    addToCart(id, name, price, quantity);
    actualizarTotalCarrito(); // Actualiza el total del carrito después de añadir un producto
}

// Función para añadir productos al carrito y guardarlos en localStorage
function addToCart(id, name, price, quantity) {
    let carrito = getCarrito();
    
    // Verifica si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        // Si el producto ya está en el carrito, actualiza la cantidad
        productoExistente.quantity += quantity;
    } else {
        // Si el producto no está en el carrito, añade uno nuevo
        carrito.push({ id, name, price, quantity });
    }
    
    localStorage.setItem('carrito', serializeCarrito(carrito));
    console.log('Producto añadido al carrito:', { id, name, price, quantity });
}

// Función para obtener el carrito desde localStorage
function getCarrito() {
    const carritoString = localStorage.getItem('carrito');
    return carritoString ? deserializeCarrito(carritoString) : [];
}

// Función para serializar el carrito para almacenamiento
function serializeCarrito(carrito) {
    return carrito.map(item => `${item.id}|${item.name}|${item.price}|${item.quantity}`).join(';');
}

// Función para deserializar el carrito desde almacenamiento
function deserializeCarrito(carritoString) {
    return carritoString.split(';').map(item => {
        const [id, name, price, quantity] = item.split('|');
        return { id, name, price, quantity: parseInt(quantity, 10) };
    });
}
