document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    // Función para buscar productos
    const searchProducts = async (query) => {
        try {
            const response = await fetch('../php/most_productos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    textosearch: query
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.status === 'success') {
                displayResults(data.data);
            } else {
                resultsContainer.innerHTML = '<p>No se encontraron productos.</p>';
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            resultsContainer.innerHTML = '<p>Error al buscar productos. Intenta de nuevo más tarde.</p>';
        }
    };

    // Función para mostrar los resultados en el HTML
    const displayResults = (products) => {
        if (!products || products.length === 0) {
            resultsContainer.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        resultsContainer.innerHTML = products.map(product => {
            const price = parseFloat(product.precio);
            const formattedPrice = isNaN(price) ? 'N/A' : price.toFixed(2);

            return `
                <div class="card mb-3">
                    <img src="../uploads/${product.urlimagen || 'default-product.jpg'}" class="card-img-top" alt="${product.descripcion}">
                    <div class="card-body">
                        <h5 class="card-title">${product.articulo}</h5>
                        <p class="card-text">${product.descripcion}</p>
                        <p class="card-text">Precio: $${formattedPrice}</p>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Realizar una búsqueda inicial para cargar todos los productos
    searchProducts('0');

    // Evento para búsqueda en tiempo real
    searchInput.addEventListener('input', () => {
        let query = searchInput.value.trim();
        // Si el campo está vacío, enviar '0'
        if (query.length === 0) {
            query = '0';
        }
        searchProducts(query);
    });
});
