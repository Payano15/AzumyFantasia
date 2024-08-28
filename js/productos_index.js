// Función para inicializar el carrito
function inicializarCarrito() {
    // Limpia el carrito al cargar la página
    localStorage.removeItem('carrito');
    console.log('Carrito inicializado y limpiado');
}

// Función para actualizar el total del carrito
function actualizarTotalCarrito() {
    const carrito = getCarrito();
    const total = carrito.reduce((acc, item) => {
        const precio = parseFloat(item.price.replace('$', ''));
        return acc + (precio * item.quantity);
    }, 0);
    const totalCarritoElement = document.getElementById('total-price');

    if (totalCarritoElement) {
        totalCarritoElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.error('Elemento total-price no encontrado en el DOM.');
    }
}

// Función para cargar los datos de productos desde el servidor
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

// Función para renderizar los productos en HTML
function renderProductos(productos) {
    if (!Array.isArray(productos)) {
        console.error('Los datos de productos están mal estructurados.');
        return '';
    }
    const rutaBase = './uploads/'; // Ruta base relativa, puede ser una URL absoluta si es necesario

    return productos.map(producto => `
<<<<<<< HEAD
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4"> <!-- Ajusta el tamaño para diferentes dispositivos -->
            <div class="card border-0 shadow-sm">
                <img id="image-${producto.id}" src="${rutaBase}${producto.urlimagen}" class="card-img-top" alt="${producto.articulo}" style="object-fit: cover; height: 180px; border-bottom: 1px solid #ddd;">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title mb-2">${producto.articulo}</h6>
                    <p class="card-text mb-3" style="font-size: 0.9rem; color: #555; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${producto.desc_articulo}</p>
                    <p class="card-text text-success mb-3" style="font-size: 1rem;">$${producto.precio}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <input type="number" id="quantity-${producto.id}" class="form-control form-control-sm w-50" value="1" min="1">
                        <button class="btn btn-primary btn-sm ms-2" onclick="handleAddToCart('${producto.id}', '${producto.articulo}', '${producto.desc_articulo}', '${producto.precio}', '${producto.urlimagen}')">Añadir</button>
                    </div>

                </div>
            </article>
        </div>
    `).join('');
}

// Función para manejar el clic en "Añadir al carrito"
function handleAddToCart(id, name, desc, price, imageUrl) {
    const quantity = parseInt(document.getElementById(`quantity-${id}`).value, 10);
    console.log(`Botón clicado: ID=${id}, Nombre=${name}, Descripción=${desc}, Precio=${price}, Cantidad=${quantity}, Imagen=${imageUrl}`);
    addToCart(id, name, desc, price, quantity, imageUrl);
    actualizarTotalCarrito(); // Actualiza el total del carrito después de añadir un producto
}

// Función para añadir un producto al carrito
function addToCart(id, name, desc, price, quantity, imageUrl) {
    let carrito = getCarrito();
    
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.quantity += quantity;
    } else {
        carrito.push({ id, name, desc, price, quantity, imageUrl });
    }
    
    saveCarrito(carrito);
    console.log('Producto añadido al carrito:', { id, name, desc, price, quantity, imageUrl });
}

// Función para guardar el carrito en localStorage
function saveCarrito(carrito) {
    if (Array.isArray(carrito) && carrito.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.desc === 'string' && typeof item.price === 'string' && typeof item.quantity === 'number' && typeof item.imageUrl === 'string')) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } else {
        console.error('Datos del carrito no válidos:', carrito);
    }
}

// Función para obtener el carrito desde localStorage
function getCarrito() {
    const carritoString = localStorage.getItem('carrito');
    try {
        return carritoString ? JSON.parse(carritoString) : [];
    } catch (error) {
        console.error('Error al parsear el carrito desde localStorage:', error);
        localStorage.removeItem('carrito'); // Limpia el carrito si hay un error
        return [];
    }
}

// Función para cargar el carrito desde localStorage y actualizar la UI
function loadCart() {
    console.log('loadCart called');
    const cartItemsElement = document.getElementById('cart-items');
    
    if (cartItemsElement) {
        const cart = getCarrito();
        console.log('Loaded cart', cart);
        updateCartUI(cart); // Actualiza la interfaz del carrito
    } else {
        console.error('Elemento cart-items no encontrado en el DOM.');
    }
}

// Función para validar los datos de un artículo del carrito
function validateCartItem(item) {
    return typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '' &&
           typeof item.name === 'string' && item.name.trim() !== '' &&
           typeof item.desc === 'string' && item.desc.trim() !== '' &&
           typeof item.price === 'string' && !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0 &&
           typeof item.quantity === 'number' && item.quantity > 0;
}

// Función para actualizar la interfaz del carrito
function updateCartUI(cart) {
    const cartItemsElement = document.getElementById('cart-items');

    if (!cartItemsElement) {
        console.error('Elemento cart-items no encontrado en el DOM.');
        return;
    }

    if (!Array.isArray(cart)) {
        console.error('El carrito no es un array:', cart);
        return;
    }

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p>No hay artículos en el carrito.</p>';
        return;
    }

    const cartItemsHTML = cart.map(item => {
        if (!item || typeof item !== 'object') {
            console.error('Artículo nulo o inválido:', item);
            return ''; // Omite este ítem
        }

        // Validar cada campo del artículo
        const validImageUrl = typeof item.imageUrl === 'string' && isValidURL(item.imageUrl);
        const validName = typeof item.name === 'string' && item.name.trim() !== '';
        const validDesc = typeof item.desc === 'string' && item.desc.trim() !== '';
        const validPrice = typeof item.price === 'string' && !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0;
        const validQuantity = typeof item.quantity === 'number' && item.quantity > 0;

        return `
            <div class="cart-item d-flex align-items-center mb-3">
                <img src="${item.imageUrl}" alt="${item.name}" style="object-fit: cover; height: 50px; width: 50px; margin-right: 10px;">
                <div>
                    <h6>${item.name}</h6>
                    <p>${item.desc}</p>
                    <p>${item.price}</p>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
            </div>
        `;
    }).join('');

    cartItemsElement.innerHTML = cartItemsHTML;
}

// Validar si una URL es válida
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

// Inicializa el carrito al cargar la página
inicializarCarrito();
loadCart();
cargarDatosProductos(); // Cargar los datos de productos al cargar la página
