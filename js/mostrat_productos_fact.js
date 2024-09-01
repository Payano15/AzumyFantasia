document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // Verifica si el evento se dispara
    loadCart(); // Cargar el carrito desde el servidor al iniciar la página
});

function updateCartUI(cart) {
    console.log('updateCartUI called', cart); // Verifica si la función se llama correctamente
    const totalPriceElem = document.getElementById('total-price');
    const cartItemsElem = document.getElementById('cart-items');

    if (!totalPriceElem || !cartItemsElem) {
        console.error("Elementos del DOM no encontrados.");
        return;
    }

    if (cart.length === 0) {
        // Si el carrito está vacío, no mostrar nada
        cartItemsElem.innerHTML = ''; // No mostrar nada
        totalPriceElem.innerText = ''; // No mostrar el total
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

        // Verificar si image_url está definido y no es vacío
        const imageUrl = product.image_url ? `../uploads/${product.image_url}` : '';
        const subtotal = price * product.quantity; // Calcular el subtotal
        totalPrice += subtotal;

        return `
            <div class="card mb-3">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <img src="${imageUrl}" class="card-img" alt="${product.name}" style="max-width: 150px; max-height: 150px; ${imageUrl ? '' : 'display:none;'}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description}</p>
                            <p class="card-text text-success">$${price.toFixed(2)}</p>
                            <p class="card-text">Cantidad: ${product.quantity}</p>
                            <p class="card-text">Subtotal: $${subtotal.toFixed(2)}</p> <!-- Mostrar el subtotal -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    totalPrice = Math.round(totalPrice * 100) / 100;
    totalPriceElem.innerText = `Total: $${totalPrice.toFixed(2)}`;
}

function loadCart() {
    console.log('loadCart called'); // Verifica si la función se llama correctamente
    let session_id = localStorage.getItem('session_id');
    if (session_id) {
        obtenerDatosDelCarrito(session_id); // Obtener datos del carrito desde el servidor
    } else {
        console.error('No se encontró session_id en localStorage');
    }
}

// Función para obtener los datos del carrito desde el servidor
function obtenerDatosDelCarrito(session_id) {
    fetch(`../php/serch_cart.php?session_id=${session_id}`)
        .then(response => response.text()) // Lee la respuesta como texto
        .then(text => {
            try {
                const cart = JSON.parse(text); // Intenta parsear el texto como JSON
                if (Array.isArray(cart) && cart.length > 0) {
                    updateCartUI(cart); // Actualiza la interfaz con los datos obtenidos
                } else {
                    // Si el carrito está vacío o no se encontraron datos, no hacer nada
                    console.log('El carrito está vacío o no se encontraron datos.');
                    document.getElementById('cart-items').innerHTML = '';
                    document.getElementById('total-price').innerText = '';
                }
            } catch (error) {
                // Maneja errores de parseo
                console.error('Error al analizar JSON:', error);
                document.getElementById('cart-items').innerHTML = '';
                document.getElementById('total-price').innerText = '';
            }
        })
        .catch(error => {
            console.error('Error al obtener el carrito:', error);
            document.getElementById('cart-items').innerHTML = '';
            document.getElementById('total-price').innerText = '';
        });
}


document.addEventListener('DOMContentLoaded', () => {
    // Establece la conexión WebSocket
    const ws = new WebSocket('ws://localhost:8080'); // Reemplaza con la URL de tu servidor WebSocket

    // Manejo de eventos de WebSocket
    ws.addEventListener('open', () => {
        console.log('Conexión WebSocket abierta');
    });

    ws.addEventListener('message', (event) => {
        console.log('Mensaje recibido del servidor:', event.data);
    });

    ws.addEventListener('error', (error) => {
        console.error('Error WebSocket:', error);
    });

    ws.addEventListener('close', () => {
        console.log('Conexión WebSocket cerrada');
    });

    // Función para enviar los datos de la factura por WebSocket
    document.getElementById('final_button').addEventListener('click', () => {
        // Obtener los datos del carrito
        const cartItems = getCartItems();

        // Crear los datos de la factura
        const invoiceData = {
            invoiceNumber: generateInvoiceNumber(), // Genera un número de factura único
            items: cartItems,
            totalPrice: calculateTotalPrice(cartItems) // Calcula el total del carrito
        };

        // Enviar los datos por WebSocket
        ws.send(JSON.stringify(invoiceData));
    });

    // Función para obtener los datos del carrito
    function getCartItems() {
        // Aquí debes implementar la lógica para obtener los datos del carrito
        // Por ejemplo, podrías leer los datos del carrito del DOM o de una variable global
        return [
            { id: 1, name: 'Producto 1', quantity: 2, price: 10.00 },
            { id: 2, name: 'Producto 2', quantity: 1, price: 20.00 }
            // Agrega más productos según sea necesario
        ];
    }

    // Función para generar un número de factura único
    function generateInvoiceNumber() {
        return Math.floor(Math.random() * 10000);
    }

    // Función para calcular el total del carrito
    function calculateTotalPrice(cartItems) {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
});