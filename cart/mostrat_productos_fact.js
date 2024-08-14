// Función para mostrar los productos en el carrito
function mostrarProductosEnCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    // Limpia el contenedor de productos del carrito
    cartItemsContainer.innerHTML = '';

    // Inicializa el subtotal total
    let totalSubtotal = 0;

    // Recorre cada producto en el carrito y crea una fila en la tabla
    carrito.forEach(producto => {
        const subtotal = producto.price * producto.quantity;
        totalSubtotal += subtotal;

        const itemHtml = `
            <div class="row cart-item align-items-center">
                <div class="col-md-6 d-flex align-items-center">
                    <img src="${producto.image}" alt="${producto.name}" class="img-fluid" style="width: 80px; margin-right: 10px;">
                    <div>
                        <h5>${producto.name}</h5>
                        <p>${producto.description}</p>
                    </div>
                </div>
                <div class="col-md-2">$${producto.price.toFixed(2)}</div>
                <div class="col-md-2">${producto.quantity}</div>
                <div class="col-md-2">$${subtotal.toFixed(2)}</div>
            </div>
        `;

        cartItemsContainer.innerHTML += itemHtml;
    });

    // Actualiza el total del carrito
    totalPriceElement.textContent = `$${totalSubtotal.toFixed(2)}`;
}

// Evento para cargar los productos del carrito cuando la página esté lista
document.addEventListener('DOMContentLoaded', mostrarProductosEnCarrito);