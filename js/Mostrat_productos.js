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
                    idarticulo: product.idarticulo, // Asegúrate de usar idarticulo
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
                                        <p class="card-text">${product.descripcion}</p>
                                        <p class="card-text price">$${formattedPrice}</p>
                                        <div class="card-actions">
                                            <input type="number" id="quantity-${product.idarticulo}" class="quantity-input" min="1" value="1" aria-label="Cantidad">
                                            <button class="btn buy-button btn-pink" onclick="handleAddToCart('${product.idarticulo}', '${product.desc_articulo}', '${product.descripcion}', '${formattedPrice}', '${product.urlimagen || 'default-product.jpg'}')"> 
                                                <img src='../img/iconos/anadir-a-la-cesta.png' class="icon" alt="icono"> Comprar
                                            </button>
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

    // Función para manejar el clic en el botón de añadir al carrito
    window.handleAddToCart = function(idarticulo, name, description, price, image_url) {
        console.log('Producto a añadir:', idarticulo, name); // Verificar qué producto se está añadiendo
        agregarAlCarrito(idarticulo, name, description, price, image_url);
    }

    // Función para obtener el session_id
    const obtenerSessionID = async () => {
        let session_id = localStorage.getItem('session_id');
        
        if (session_id) {
            // Si existe en el localStorage, devolverlo
            console.log('Session ID from localStorage:', session_id);
            return session_id;
        } 

        // Si no existe, obtener uno nuevo desde el servidor
        try {
            const response = await fetch('../php/get_session_id.php'); // Ajusta la ruta según tu configuración
            if (!response.ok) {
                throw new Error('Error al obtener session_id');
            }
            const data = await response.json();
            session_id = data.session_id;

            // Guardar el nuevo session_id en el localStorage
            localStorage.setItem('session_id', session_id);
            console.log('New Session ID:', session_id);
            return session_id;
        } catch (error) {
            console.error('Error al obtener session_id:', error);
            return null;
        }
    };

    // Función para agregar productos al carrito
    const agregarAlCarrito = async (idarticulo, name, description, price, image_url) => {
        const quantity = parseInt(document.getElementById(`quantity-${idarticulo}`).value, 10);

        // Validar que la cantidad sea un número válido
        if (isNaN(quantity) || quantity <= 0) {
            console.error('Cantidad no válida:', quantity);
            alert('Por favor, introduce una cantidad válida.');
            return;
        }

        console.log('Cantidad seleccionada:', quantity);

        // Obtener el session_id
        const session_id = await obtenerSessionID();
        if (!session_id) {
            console.error('No se pudo obtener un session_id válido.');
            return;
        }

        const payload = {
            product_id: idarticulo, // Asegúrate de que se está pasando el idarticulo
            name,
            description,
            price,
            quantity,
            image_url,
            session_id
        };

        // Mostrar los datos en consola antes de enviarlos
        console.log('Datos que se están enviando al servidor:', payload);

        // Realizar la petición fetch al servidor
        return fetch('../php/add_cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // Convertir el objeto a JSON
        })
        .then(response => {
            console.log('Response status:', response.status); // Verificar el estado de la respuesta
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Mostrar la respuesta del servidor en consola
            console.log('Respuesta del servidor:', data);
            if (data.status === 'success') {
                alert('Producto añadido al carrito con éxito');
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error al enviar los datos al servidor:', error);
        });
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
}
