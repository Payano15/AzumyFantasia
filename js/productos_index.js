document.addEventListener('DOMContentLoaded', inicializarPagina);

function inicializarPagina() {
    inicializarCarrito(); // Reinicia el carrito al cargar la página
    cargarDatosProductos(); // Carga los productos desde el archivo PHP
    actualizarTotalCarrito(); // Actualiza el total del carrito al iniciar
    asegurarSessionID(); // Verifica o crea el session_id
}

function inicializarCarrito() {
    localStorage.setItem('carrito', JSON.stringify([])); // Reinicia el carrito
    console.log('Carrito reiniciado');
}

function actualizarTotalCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((acc, item) => acc + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);
    const totalCarritoElement = document.getElementById('total-price');

    if (totalCarritoElement) {
        totalCarritoElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.error('Elemento total-price no encontrado en el DOM.');
    }
}

async function cargarDatosProductos() {
    try {
        const response = await fetch('./php/productos_index.php'); // Cambia la ruta a tu archivo PHP
        console.log('Respuesta de fetch:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json(); // Suponiendo que el archivo PHP devuelve JSON
        console.log('Datos de productos:', productos);

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

function renderProductos(productos) {
    if (!Array.isArray(productos)) {
        console.error('Los datos de productos están mal estructurados.');
        return '';
    }
    const rutaBase = './uploads/';

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
                        <button class="btn btn-pink ms-2" onclick="handleAddToCart('${producto.id}', '${producto.articulo}', '${producto.desc_articulo}', '${producto.precio}', '${producto.urlimagen}')">
                            <img src='./img/iconos/anadir-a-la-cesta.png' class="icon" alt="icono"> Añadir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function handleAddToCart(product_id, name, description, price, image_url) {
    agregarAlCarrito(product_id, name, description, price, image_url);
}

function agregarAlCarrito(product_id, name, description, price, image_url) {
    const quantity = parseInt(document.getElementById(`quantity-${product_id}`).value, 10);

    // Asegúrate de que session_id se obtiene del localStorage correctamente
    let session_id = localStorage.getItem('session_id');

    if (!session_id) {
        // Si no existe un session_id en localStorage, obtén uno nuevo desde el servidor
        return obtenerSessionID()
            .then(new_session_id => {
                if (new_session_id) {
                    // Almacenar el nuevo session_id en localStorage
                    localStorage.setItem('session_id', new_session_id);
                    session_id = new_session_id;

                    // Ahora que tenemos el session_id, enviar los datos al servidor
                    return enviarDatosAlServidor(product_id, name, description, price, quantity, image_url, session_id);
                } else {
                    throw new Error('No se pudo obtener un session_id válido.');
                }
            })
            .catch(error => {
                console.error('Error al obtener un session_id:', error);
            });
    } else {
        // Si session_id ya está en localStorage, simplemente enviar los datos al servidor
        return enviarDatosAlServidor(product_id, name, description, price, quantity, image_url, session_id);
    }
}

// Función para enviar datos al servidor
function enviarDatosAlServidor(product_id, name, description, price, quantity, image_url, session_id) {
    return fetch('./php/add_cart.php', {
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
            image_url,
            invoice_number: 123, // Aquí debes proporcionar el número de factura si es necesario
            session_id  // Incluimos el session_id en los datos enviados
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        if (data.status === 'success') {
            alert('Producto añadido al carrito con éxito');
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para obtener un nuevo session_id desde el servidor y almacenarlo en localStorage
function obtenerSessionID() {
    return fetch('./php/get_session_id.php')
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos del servidor:', data);
            if (data.session_id) {
                // Almacenar el session_id en localStorage como una cadena
                localStorage.setItem('session_id', data.session_id);
                return data.session_id;
            } else {
                throw new Error('El session_id recibido del servidor no es válido.');
            }
        })
        .catch(error => {
            console.error('Error al obtener session_id:', error);
            return null;
        });
}

// Asegura que haya un session_id válido en localStorage
function asegurarSessionID() {
    let session_id = localStorage.getItem('session_id');

    if (!session_id) {
        obtenerSessionID().then(newSessionID => {
            if (newSessionID) {
                console.log('Session ID almacenado en localStorage:', newSessionID);
            } else {
                console.log('No se pudo obtener un session_id válido.');
            }
        });
    } else {
        console.log('Session ID desde localStorage:', session_id);
    }
}

// Esta función elimina el cache de la página
window.onload = function () {
    // Verificar si la caché ya ha sido limpiada
    if (!sessionStorage.getItem('cacheCleared')) {
        sessionStorage.setItem('cacheCleared', 'true');

        // Forzar la limpieza de la caché
        if ('caches' in window) {
            caches.keys().then(function (names) {
                for (let name of names) {
                    caches.delete(name);
                }
            }).then(function () {
                console.log('Caché eliminada');
            }).catch(function (error) {
                console.error('Error al eliminar la caché:', error);
            });
        }
    }
};
