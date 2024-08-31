
 


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