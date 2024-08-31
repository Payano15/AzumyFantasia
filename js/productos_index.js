document.addEventListener('DOMContentLoaded', inicializarPagina);

// Función principal para inicializar la página
function inicializarPagina() {
    inicializarCarrito(); // Reinicia el carrito al cargar la página
    cargarDatosProductos(); // Carga los productos desde el archivo PHP
}

// Función para inicializar el carrito (borrar contenido del carrito)
function inicializarCarrito() {
    localStorage.setItem('carrito', JSON.stringify([])); // Inicializa el carrito como un array vacío
    console.log('Carrito reiniciado');
}

// Función para obtener el carrito desde localStorage
function getCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
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
        <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div class="card producto-card">
                <img id="image-${producto.id}" src="${rutaBase}${producto.urlimagen}" class="card-img-top producto-img" alt="${producto.articulo}">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title producto-title">${producto.articulo}</h6>
                    <p class="card-text producto-desc">${producto.desc_articulo}</p>
                    <p class="card-text producto-price">$${producto.precio}</p>
                    <div class="d-flex justify-content-between align-items-center w-100">
                        <input type="number" id="quantity-${producto.id}" class="form-control form-control-sm w-50 producto-quantity" value="1" min="1">
                        <button class="btn btn-pink ms-2" onclick="handleAddToCart('${producto.id}', '${producto.articulo}', '${producto.desc_articulo}', '${producto.precio}', '${rutaBase}${producto.urlimagen}')">
                            <img src='./img/iconos/anadir-a-la-cesta.png' class="icon" alt="icono"> Añadir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
} 

function handleAddToCart(product_id, name, description, price, image_url) {
    const quantity = document.getElementById(`quantity-${product_id}`).value;
    fetch('../php/add_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product_id,
            name,
            description,
            price,
            quantity,
            image_url
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
        // Actualiza el carrito o la interfaz de usuario según sea necesario
        actualizarTotalCarrito();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function actualizarTotalCarrito() {
    // Implementar lógica para actualizar el total del carrito basado en la respuesta del servidor
    // Este método puede consultar el servidor para obtener el total actualizado
    // Ejemplo:
    fetch('../php/get_cart_total.php') // Crear este archivo para obtener el total
        .then(response => response.json())
        .then(data => {
            // Actualizar la UI con el total del carrito
            console.log(data.total);
        })
        .catch(error => console.error('Error:', error));
}