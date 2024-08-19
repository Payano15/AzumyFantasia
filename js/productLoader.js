// Función para inicializar el carrito (borrar contenido del carrito)
function inicializarCarrito() {
    localStorage.setItem('carrito', JSON.stringify([])); // Reinicia el carrito como un array vacío
    console.log('Carrito reiniciado a un array vacío');
}

// Función para actualizar el total del carrito en la interfaz
function actualizarTotalCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((acc, item) => acc + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);
    const totalCarritoElement = document.getElementById('total-price'); // Cambiado a 'total-price'

    // Verifica si el elemento existe antes de intentar acceder a su propiedad
    if (totalCarritoElement) {
        totalCarritoElement.textContent = `$${total.toFixed(2)}`;
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
        const data = await response.json();
        // Asegúrate de que `data.productos` es un array
        return Array.isArray(data.productos) ? data.productos : [];
    } catch (error) {
        console.error('Error al cargar los datos del producto:', error);
        return [];
    }
}

// Función para actualizar los productos en el DOM
function actualizarProductosEnDOM(productos) {
    const featuredProductsContainer = document.getElementById('featured-products');
    const lovedProductsContainer = document.getElementById('loved-products');
    
    const fragmentFeatured = document.createDocumentFragment();
    const fragmentLoved = document.createDocumentFragment();

    productos.forEach(producto => {
        const nombreProducto = producto.name || 'Nombre no disponible';
        const descripcionProducto = producto.descripcion || 'Descripción no disponible';
        const precioProducto = producto.precio ? parseFloat(producto.precio.replace('$', '')) : 0;
        const imagenProducto = producto.image || '../img/placeholder.jpg'; // Imagen por defecto si no hay

        const cardHtml = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${imagenProducto}" class="card-img-top" alt="${nombreProducto}">
                    <div class="card-body">
                        <h5 class="card-title">${nombreProducto}</h5>
                        <p class="card-text">${descripcionProducto}</p>
                        <p class="card-text">$${precioProducto.toFixed(2)}</p>
                        <input type="number" min="1" value="1" id="quantity-${producto.id}" class="form-control mb-2" style="width: 80px;">
                        <button class="btn btn-primary" onclick="handleAddToCart('${producto.id}', '${nombreProducto}', ${precioProducto})">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;

        if (nombreProducto.includes('Producto 1') || nombreProducto.includes('Producto 2') || nombreProducto.includes('Producto 3')) {
            fragmentFeatured.appendChild(createElementFromHTML(cardHtml));
        } else {
            fragmentLoved.appendChild(createElementFromHTML(cardHtml));
        }
    });

    featuredProductsContainer.appendChild(fragmentFeatured);
    lovedProductsContainer.appendChild(fragmentLoved);
}

// Función auxiliar para convertir HTML string a un elemento del DOM
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// Función para manejar la adición de un producto al carrito
function handleAddToCart(id, name, price) {
    const quantity = parseInt(document.getElementById(`quantity-${id}`).value, 10);
    console.log(`Botón clicado: ID=${id}, Nombre=${name}, Precio=${price}, Cantidad=${quantity}`);
    addToCart({ id, name, price: `$${price.toFixed(2)}`, quantity });
    actualizarTotalCarrito(); // Actualiza el total del carrito después de añadir un producto
}

// Función para añadir productos al carrito y guardarlos en localStorage
function addToCart(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verifica si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        // Si el producto ya está en el carrito, actualiza la cantidad
        productoExistente.quantity += producto.quantity;
    } else {
        // Si el producto no está en el carrito, añade uno nuevo
        carrito.push(producto);
    }
    
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