document.addEventListener('DOMContentLoaded', inicializarPagina);

// Función principal para inicializar la página
function inicializarPagina() {
    inicializarCarrito(); // Reinicia el carrito al cargar la página
    cargarDatosProductos(); // Carga los productos desde el archivo PHP
}

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
        const response = await fetch('./php/productos_index.php'); // Cambia la ruta a tu archivo PHP
        console.log('Respuesta de fetch:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json(); // Suponiendo que el archivo PHP devuelve JSON
        console.log('Datos de productos:', productos);

        // Asegúrate de que los elementos existen antes de intentar modificar sus propiedades
        const newProductsElement = document.getElementById('new-products');
        const featuredProductsElement = document.getElementById('featured-products');
        const lovedProductsElement = document.getElementById('loved-products');

        if (newProductsElement) {
            newProductsElement.innerHTML = renderProductos(productos.nuevos);
        } else {
            console.error('Elemento new-products no encontrado en el DOM.');
        }

        if (featuredProductsElement) {
            featuredProductsElement.innerHTML = renderProductos(productos.destacados);
        } else {
            console.error('Elemento featured-products no encontrado en el DOM.');
        }

        if (lovedProductsElement) {
            lovedProductsElement.innerHTML = renderProductos(productos.queridos);
        } else {
            console.error('Elemento loved-products no encontrado en el DOM.');
        }
    } catch (error) {
        console.error('Error al cargar los datos del producto:', error);
    }
}

// Función para renderizar los productos en HTML
function renderProductos(productos) {
    if (!Array.isArray(productos)) {
        console.error('Los datos de productos están mal estructurados.');
        return '';
    }
    const rutaBase = './uploads/'; // Ruta base relativa, puede ser una URL absoluta si es necesario

return productos.map(producto => `
    <div class="col-lg-4 col-md-6 col-sm-12 mb-4"> <!-- Ajuste en las clases de las columnas -->
            <div class="card producto-card">
                <img id="image-${producto.id}" src="${rutaBase}${producto.urlimagen}" class="card-img-top producto-img" alt="${producto.articulo}">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title producto-title">${producto.articulo}</h6>
                    <p class="card-text producto-desc">${producto.desc_articulo}</p>
                    <p class="card-text producto-price">$${producto.precio}</p>
                    <div class="d-flex justify-content-between align-items-center w-100">
                        <input type="number" id="quantity-${producto.id}" class="form-control form-control-sm w-50 producto-quantity" value="1" min="1">
                        <button class="btn btn-pink ms-2" onclick="handleAddToCart('${producto.id}', '${producto.articulo}', '${producto.desc_articulo}', '${producto.precio}', '${producto.urlimagen}')"> <img src='./img/iconos/anadir-a-la-cesta.png' class="icon" alt="icono"> Añadir</button>
                    
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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
