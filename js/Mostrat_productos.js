document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    // Función para buscar productos
    const searchProducts = async (query) => {
        console.log('Searching for:', query); // Verifica qué se está buscando
        try {
            // Agregar un parámetro único para evitar el caché
            const cacheBuster = new Date().getTime();
            const response = await fetch(`../php/most_productos.php?cacheBuster=${cacheBuster}`, {
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
            console.log('Data received:', data); // Verifica los datos recibidos

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
    
        // Agrupar productos por idarticulo y codarticulo
        const groupedProducts = products.reduce((acc, product) => {
            const key = `${product.idarticulo}-${product.cod_articulo}`;
            if (!acc[key]) {
                acc[key] = {
                    idarticulo: product.idarticulo,
                    cod_articulo: product.cod_articulo,
                    articulo: product.articulo,
                    items: []
                };
            }
            acc[key].items.push(product);
            return acc;
        }, {});
    
        // Construir HTML a partir de la agrupación
        resultsContainer.innerHTML = Object.values(groupedProducts).map(group => {
            return `
                <div class="group">
                    <h4>${group.articulo}</h4>
                    <div class="cards-container">
                        ${group.items.map(product => {
                            const price = parseFloat(product.precio);
                            const formattedPrice = isNaN(price) ? 'N/A' : price.toFixed(2);
    
                            return `
                                <div class="card">
                                    <img src="../uploads/${product.urlimagen || 'default-product.jpg'}" class="card-img-top" alt="${product.descripcion}">
                                    <div class="card-body">
                                        <p class="card-title">${product.desc_articulo}</p>
                                        <p class="card-text"> ${product.descripcion}</p>
                                        <p class="card-text price">$${formattedPrice}</p>
                                        <div class="card-actions">
                                            <input type="number" class="quantity-input" min="1" value="1" aria-label="Cantidad">
                                            <button class="btn buy-button btn-pink"> 
                                            <img src='../img/iconos/anadir-a-la-cesta.png' class="icon" alt="icono"> Comprar</button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    };

    // Realizar una búsqueda inicial para cargar todos los productos
    searchProducts('');

    // Evento para búsqueda en tiempo real
    searchInput.addEventListener('input', async () => {
        let query = searchInput.value.trim();
        // Si el campo está vacío, enviar una cadena vacía
        if (query.length === 0) {
            query = '';
        }

        console.log('Search input changed to:', query); // Verifica el valor del input

        // Realizar la búsqueda con el nuevo valor
        await searchProducts(query);

        // Verificar si los resultados están vacíos
        if (resultsContainer.innerHTML.trim() === '<p>No se encontraron productos.</p>') {
            // Si los resultados están vacíos, realizar la búsqueda para todos los productos
            console.log('No products found, searching for all products');
            await searchProducts('');
        }
    });
});


// esta funcion elimina el cache de la pagina
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