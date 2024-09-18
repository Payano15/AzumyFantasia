document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    loadInvoice(); // Cargar la factura desde el servidor al iniciar la página
});




function updateInvoiceUI(cart) {
    console.log('updateInvoiceUI called', cart);
    const invoiceItemsElem = document.getElementById('invoice-items').querySelector('tbody');
    const invoiceTotalElem = document.getElementById('invoice-total');

    if (!invoiceItemsElem || !invoiceTotalElem) {
        console.error("Elementos del DOM no encontrados.");
        return;
    }

    if (cart.length === 0) {
        // Si el carrito está vacío
        invoiceItemsElem.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos en el carrito.</td></tr>';
        invoiceTotalElem.innerText = 'Total: $0.00';
        return;
    }

    let totalPrice = 0;
    const rutaBase = '../uploads/';  //${rutaBase}$
    //const imageUrl = product.image_url ? encodeURIComponent(product.image_url) : product.image_url;

    invoiceItemsElem.innerHTML = cart.map(product => {
        const price = parseFloat(product.price); // Esto es el precio unitario
        const subtotal = price * product.quantity; // Esto es el subtotal
        totalPrice += subtotal;
    
        const imageUrl = product.image_url ? encodeURIComponent(product.image_url) : 'imagen-predeterminada.jpg'; // Asignar imagen predeterminada si no existe
    
        return `        
            <tr>
                <td>
                    <img src="${rutaBase}${imageUrl}" alt="${product.name}" style="width: 50px; height: auto; vertical-align: middle;">
                    <span style="display: inline-block; margin-left: 10px; vertical-align: middle;">${product.name}</span>
                </td> <!-- Imagen y nombre del producto en la misma celda -->
                <td>${product.quantity}</td> <!-- Aquí va la cantidad -->
                <td>$${price.toFixed(2)}</td> <!-- Aquí va el precio unitario -->
                <td>$${subtotal.toFixed(2)}</td> <!-- Aquí va el subtotal -->
            </tr>
        `;
    }).join('');

    totalPrice = Math.round(totalPrice * 100) / 100;
    invoiceTotalElem.innerText = `Total: $${totalPrice.toFixed(2)}`;
}

function loadInvoice() {
    console.log('loadInvoice called');
    let session_id = localStorage.getItem('session_id');
    if (session_id) {
        // Generar y almacenar el número de pedido si aún no está en localStorage
        if (!localStorage.getItem('invoice_number')) {
            localStorage.setItem('invoice_number', session_id); // Usar el session_id como número de pedido
        }

        // Mostrar el número de pedido desde localStorage
        document.getElementById('invoice-number').innerText = 'Pedido #' + localStorage.getItem('invoice_number');
        document.getElementById('invoice-date').innerText = 'Fecha: ' + new Date().toLocaleDateString();
        
        obtenerDatosDelCarrito(session_id); // Obtener datos del carrito desde el servidor
    } else {
        console.error('No se encontró session_id en localStorage');
    }
}

function obtenerDatosDelCarrito(session_id) {
    fetch(`../php/serch_cart.php?session_id=${session_id}`)
        .then(response => response.text()) 
        .then(text => {
            try {
                const cart = JSON.parse(text); 
                if (Array.isArray(cart) && cart.length > 0) {
                    updateInvoiceUI(cart); 
                } else {
                    console.log('El carrito está vacío o no se encontraron datos.');
                }
            } catch (error) {
                console.error('Error al analizar JSON:', error);
            }
        })
        .catch(error => {
            console.error('Error al obtener el carrito:', error);
        });
}

// // Esta función elimina el cache de la página
// window.onload = function () {
//     // Verificar si la caché ya ha sido limpiada
//     if (!sessionStorage.getItem('cacheCleared')) {
//         sessionStorage.setItem('cacheCleared', 'true');

//         // Forzar la limpieza de la caché
//         if ('caches' in window) {
//             caches.keys().then(function (names) {
//                 for (let name of names) {
//                     caches.delete(name);
//                 }
//             }).then(function () {
//                 console.log('Caché eliminada');
//             }).catch(function (error) {
//                 console.error('Error al eliminar la caché:', error);
//             });
//         }
//     }
// };
