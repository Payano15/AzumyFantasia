// productLoader.js

async function cargarDatosProductos() {
    try {
        const response = await fetch('../json/productos.json'); // Asegúrate de que la ruta es correcta
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json();
        return productos;
    } catch (error) {
        console.error('Error al cargar los datos del producto:', error);
    }
}

function actualizarProductosEnDOM(productos) {
    const featuredProductsContainer = document.getElementById('featured-products');
    const lovedProductsContainer = document.getElementById('loved-products');

    productos.forEach(producto => {
        const cardHtml = `
            <div class="col-md-4">
                <div class="card">
                    <img src="${producto.image}" class="card-img-top" alt="${producto.name}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.name}</h5>
                        <p class="card-text">${producto.description}</p>
                        <p class="card-text">${producto.price}</p>
                        <button class="btn btn-primary" onclick="addToCart({ id: '${producto.id}', name: '${producto.name}', price: ${producto.price} })">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;

        if (producto.name.includes('Producto 1') || producto.name.includes('Producto 2') || producto.name.includes('Producto 3')) {
            featuredProductsContainer.innerHTML += cardHtml;
        } else {
            lovedProductsContainer.innerHTML += cardHtml;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosProductos().then(productos => {
        if (productos) {
            actualizarProductosEnDOM(productos);
        }
    });
});