// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- NUEVO: Lógica para el Modo Oscuro/Claro ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme'); // Obtener el tema guardado

    // Función que aplica o quita el modo oscuro
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            
            body.classList.add('dark-mode');
            // Cambia el icono de Luna (noche) a Sol (día)
            themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon'); 
        } else {
            body.classList.remove('dark-mode');
            // Cambia el icono de Sol (día) a Luna (noche)
            themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun'); 
        }
    }

    // 1. Cargar el tema al iniciar la página
    if (currentTheme === 'dark') {
        applyTheme(true);
    } else {
        // Si no hay preferencia guardada o es 'light', usa el modo claro
        applyTheme(false); 
    }

    // 2. Listener del botón para alternar el tema
    themeToggleBtn.addEventListener('click', () => {
        const isCurrentlyDark = body.classList.contains('dark-mode');
        
        if (isCurrentlyDark) {
            // Está oscuro -> Cambiar a modo CLARO
            applyTheme(false);
            localStorage.setItem('theme', 'light');
        } else {
            // Está claro -> Cambiar a modo OSCURO
            applyTheme(true);
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- 1. Variables Globales y Selectores de DOM ---
    // ... el resto de tu código JavaScript ...

// --- NUEVO: Función para ocultar el Preloader ---
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // Añade la clase 'hidden' para iniciar la transición CSS
            preloader.classList.add('hidden');
        }
    }
    
    // Ocultar el preloader tan pronto como la página esté lista
    // setTimeout se usa aquí solo para garantizar que el efecto sea visible,
    // puedes ajustar o eliminar el tiempo según tus necesidades.
    window.addEventListener('load', () => {
        // Garantiza al menos 1 segundo para que la gente vea el logo
        setTimeout(hidePreloader, 1000); 
    });


    // --- 1. Variables Globales y Selectores de DOM ---
    
    //... fin del preloader...

    // --- 1. Variables Globales y Selectores de DOM ---
    const JSON_URL = 'vehiculos.json'; // URL local para los datos
    
    // Almacenamiento de datos
    let allVehiclesData = []; // La lista original de vehículos
    let cart = [];             // El carrito de compras
    let currentVehicle = null; // El vehículo seleccionado para añadir al carrito
    
    // Selectores de elementos del DOM
    const productsContainer = document.getElementById('productsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Selectores de Búsqueda
    const searchInput = document.getElementById('searchInput'); // Búsqueda Desktop
    const mobileSearchInput = document.getElementById('mobileSearchInput'); // Búsqueda Móvil

    // Selectores para el Modal de Detalles
    const detailsModalImage = document.getElementById('detailsModalImage');
    const detailsModalTitle = document.getElementById('detailsModalTitle');
    const detailsModalList = document.getElementById('detailsModalList');
    const detailsModalAddToCartBtn = document.getElementById('detailsModalAddToCartBtn');

    // Selectores para el Modal de Cantidad
    const quantityInput = document.getElementById('quantityInput');
    const confirmAddToCartBtn = document.getElementById('confirmAddToCartBtn');

    // Selectores para el Modal de Pago
    const checkoutBtn = document.getElementById('checkoutBtn');
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const paymentForm = document.getElementById('paymentForm');

    // Instancias de Modales de Bootstrap
    const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));

    // Instancias de Offcanvas
    const mainOffcanvasElement = document.getElementById('mainOffcanvas');
    const offcanvasRacingElement = document.getElementById('offcanvasRacing');
    const offcanvasSportsCarsElement = document.getElementById('offcanvasSportsCars');
    
    let mainOffcanvas = mainOffcanvasElement ? new bootstrap.Offcanvas(mainOffcanvasElement) : null;
    let offcanvasRacing = offcanvasRacingElement ? new bootstrap.Offcanvas(offcanvasRacingElement) : null;
    let offcanvasSportsCars = offcanvasSportsCarsElement ? new bootstrap.Offcanvas(offcanvasSportsCarsElement) : null;

    // --- 2. Carga y Muestra de Datos ---

    /**
     * Carga los datos de los vehículos desde el JSON usando fetch y async/await.
     */
    async function loadVehicles() {
        showLoading(true);
        try {
            const response = await fetch('vehiculos.json');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            allVehiclesData = data.vehiculos || []; 
            displayVehicles(allVehiclesData);
        } catch (error) {
            console.error('Error al cargar los vehículos:', error);
            productsContainer.innerHTML = `<p class="text-center text-danger">Error al cargar los vehículos. Asegúrese de que el archivo 'vehiculos.json' exista y se esté ejecutando en un Live Server.</p>`;
        } finally {
            showLoading(false);
        }
    }

    /**
     * Muestra u oculta el spinner de carga.
     * @param {boolean} isLoading - True para mostrar, false para ocultar.
     */
    function showLoading(isLoading) {
        if (loadingSpinner) {
            loadingSpinner.style.display = isLoading ? 'block' : 'none';
        }
    }

    /**
     * Renderiza las tarjetas de los vehículos en el DOM.
     * @param {Array} vehicles - El array de vehículos a mostrar.
     */
    function displayVehicles(vehicles) {
        productsContainer.innerHTML = ''; // Limpiar el contenedor

        if (vehicles.length === 0) {
            productsContainer.innerHTML = `<p class="text-center text-muted">No se encontraron vehículos que coincidan con su búsqueda.</p>`;
            return;
        }

        vehicles.forEach(vehicle => {
            const cleanTipo = vehicle.tipo ? vehicle.tipo.replace(/[^\w\s]/gi, '').trim() : 'No especificado';
            
            const vehicleCard = `
                <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                    <div class="card h-100">
                        <img src="${vehicle.imagen}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}" loading="lazy">
                        <div class="card-body">
                            <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                            <p class="card-text category">${vehicle.categoria}</p>
                            <p class="card-text tipo">${cleanTipo}</p>
                            <h6 class="card-price">${formatPrice(vehicle.precio_venta)}</h6>
                        </div>
                        <div class="card-footer text-center">
                            <button class="btn btn-primary w-100 view-details-btn" data-codigo="${vehicle.codigo}" 
                                    aria-label="Ver detalles de ${vehicle.marca} ${vehicle.modelo}">
                                <i class="fas fa-eye me-1"></i> Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += vehicleCard;
        });
    }

    /**
     * Formatea un número como moneda.
     * @param {number} price - El precio a formatear.
     * @returns {string} - El precio formateado.
     */
    function formatPrice(price) {
        // Asumiendo que la moneda local es el Peso Dominicano (DOP)
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
        }).format(price);
    }

    // --- 3. Filtrado ---

    /**
     * Filtra los vehículos basados en el texto de búsqueda.
     */
    function filterVehicles() {
        // Usamos el valor del input de escritorio como fuente principal
        const query = searchInput.value.toLowerCase().trim();
        
        const filteredVehicles = allVehiclesData.filter(vehicle => 
            vehicle.marca.toLowerCase().includes(query) ||
            vehicle.modelo.toLowerCase().includes(query) ||
            vehicle.categoria.toLowerCase().includes(query)
        );
        
        displayVehicles(filteredVehicles);
    }

    // --- 4. Lógica de Modales y Carrito ---

    /**
     * Manejador de clics en el contenedor de productos (Event Delegation).
     * @param {Event} e - El objeto de evento.
     */
    function handleProductClick(e) {
        const detailsButton = e.target.closest('.view-details-btn');
        
        if (detailsButton) {
            const codigo = parseInt(detailsButton.dataset.codigo);
            const vehicle = allVehiclesData.find(v => v.codigo === codigo);
            if (vehicle) {
                showDetailsModal(vehicle);
            }
        }
    }

    /**
     * Muestra el modal de detalles con la información del vehículo.
     * @param {object} vehicle - El objeto del vehículo.
     */
    function showDetailsModal(vehicle) {
        currentVehicle = vehicle; // Almacena el vehículo actual
        
        detailsModalImage.src = vehicle.imagen;
        detailsModalImage.alt = `${vehicle.marca} ${vehicle.modelo}`;
        detailsModalTitle.textContent = `${vehicle.marca} ${vehicle.modelo}`;
        
        detailsModalList.innerHTML = `
            <li class="list-group-item"><strong>Categoría:</strong> ${vehicle.categoria}</li>
            <li class="list-group-item"><strong>Tipo:</strong> ${vehicle.tipo.replace(/[^\w\s]/gi, '').trim()}</li>
            <li class="list-group-item"><strong>Año:</strong> ${vehicle.anio_fabricacion}</li>
            <li class="list-group-item"><strong>Precio:</strong> <span class="fw-bold text-primary">${formatPrice(vehicle.precio_venta)}</span></li>
        `;
        
        detailsModal.show();
    }

    /**
     * Añade un item al carrito o actualiza su cantidad.
     * @param {object} vehicle - El vehículo a añadir.
     * @param {number} quantity - La cantidad a añadir.
     */
    function addItemToCart(vehicle, quantity) {
        if (!vehicle || quantity <= 0) return;

        const existingItem = cart.find(item => item.codigo === vehicle.codigo);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                codigo: vehicle.codigo,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                precio: vehicle.precio_venta,
                imagen: vehicle.imagen,
                logo: vehicle.logo_marca,
                quantity: quantity
            });
        }
        
        updateCartUI();
        animateCartIcon();
    }

    /**
     * Actualiza la UI del carrito (modal y contador).
     */
    function updateCartUI() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-muted">Tu carrito está vacío.</p>';
            cartCount.textContent = '0';
            cartTotal.textContent = formatPrice(0);
            return;
        }

        cartItems.innerHTML = ''; // Limpiar items
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            const subtotal = item.precio * item.quantity;
            total += subtotal;
            totalItems += item.quantity;

            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.imagen}" alt="${item.marca}">
                    <div class="cart-item-details">
                        <h6>${item.marca} ${item.modelo}</h6>
                        <p>Cantidad: ${item.quantity}</p>
                        <p class="fw-bold">Subtotal: ${formatPrice(subtotal)}</p>
                    </div>
                    <img src="${item.logo}" alt="${item.marca} logo" style="width: 40px; height: 40px; object-fit: contain; margin-left: 10px;">
                </div>
            `;
        });

        cartTotal.textContent = formatPrice(total);
        cartCount.textContent = totalItems;
    }

    /**
     * Añade una animación de "pulse" al ícono del carrito.
     */
    function animateCartIcon() {
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 500); // Duración de la animación
    }

    // --- 5. Lógica de Pago y Factura ---

    /**
     * Procesa el pago (simulación) y genera la factura.
     */
    function processPayment() {
        const name = document.getElementById('paymentName').value;
        const card = document.getElementById('paymentCard').value;
        if (!name || !card) {
            alert('Por favor, complete todos los campos de pago.');
            return;
        }

        alert('¡Pago procesado exitosamente! Generando su factura.');

        generateInvoice();

        cart = [];
        currentVehicle = null;
        updateCartUI();
        paymentForm.reset();

        paymentModal.hide();
        cartModal.hide();
    }

    /**
     * Genera una factura en PDF con los detalles de la compra.
     */
    function generateInvoice() {
        if (!window.jspdf) {
            console.error('jsPDF no está cargado.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const a4Width = doc.internal.pageSize.getWidth();
        const a4Height = doc.internal.pageSize.getHeight();
        const margin = 20;
        let y = margin; 

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURA - GARAGEONLINE', a4Width / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-DO')}`, margin, y);
        y += 10;
        doc.text(`Cliente: ${document.getElementById('paymentName').value || 'Cliente Final'}`, margin, y);
        y += 15;

        doc.line(margin, y, a4Width - margin, y);
        y += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Vehículo', margin, y);
        doc.text('Cantidad', a4Width / 2 - 20, y, { align: 'center' });
        doc.text('Precio Unit.', a4Width / 2 + 30, y, { align: 'center' });
        doc.text('Subtotal', a4Width - margin, y, { align: 'right' });
        y += 7;
        doc.line(margin, y, a4Width - margin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        let total = 0;
        const tempCart = [...cart]; // Copia del carrito para la factura
        tempCart.forEach(item => {
            if (y > a4Height - 40) {
                doc.addPage();
                y = margin;
            }
            const subtotal = item.precio * item.quantity;
            total += subtotal;
            doc.text(`${item.marca} ${item.modelo}`, margin, y);
            doc.text(item.quantity.toString(), a4Width / 2 - 20, y, { align: 'center' });
            doc.text(formatPrice(item.precio), a4Width / 2 + 30, y, { align: 'center' });
            doc.text(formatPrice(subtotal), a4Width - margin, y, { align: 'right' });
            y += 10;
        });

        y += 10;
        doc.line(a4Width / 2, y, a4Width - margin, y);
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('TOTAL:', a4Width / 2 + 30, y);
        doc.text(formatPrice(total), a4Width - margin, y, { align: 'right' });

        doc.save(`factura-garageonline-${Date.now()}.pdf`);
    }

    // --- 6. Event Listeners ---

    // Sincronizar barras de búsqueda
    searchInput.addEventListener('input', () => {
        mobileSearchInput.value = searchInput.value;
        filterVehicles();
    });
    mobileSearchInput.addEventListener('input', () => {
        searchInput.value = mobileSearchInput.value;
        filterVehicles();
    });

    // Event Delegation para los botones "Ver Detalles"
    productsContainer.addEventListener('click', handleProductClick);

    // Botón "Añadir al Carrito" (Modal Detalles)
    detailsModalAddToCartBtn.addEventListener('click', () => {
        detailsModal.hide();
        quantityInput.value = '1';
        quantityModal.show();
    });

    // Botón "Confirmar" (Modal Cantidad)
    confirmAddToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (quantity > 0 && currentVehicle) {
            addItemToCart(currentVehicle, quantity);
            quantityModal.hide();
            currentVehicle = null;
        } else {
            alert('Por favor, ingrese una cantidad válida.');
        }
    });

    // Botón "Pagar" (Modal Carrito)
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Tu carrito está vacío. Añade un vehículo antes de pagar.');
            return;
        }
        cartModal.hide();
        paymentModal.show();
    });

    // Botón "Procesar Pago" (Modal Pago)
    processPaymentBtn.addEventListener('click', processPayment);
    

    /* ======================================================== */
    /* == Lógica para cerrar Offcanvas al hacer clic en enlaces == */
    /* ======================================================== */
    
    /**
     * Configura los listeners para cerrar un Offcanvas al hacer clic en sus enlaces internos.
     * @param {HTMLElement} element - El elemento DOM del Offcanvas.
     * @param {bootstrap.Offcanvas} instance - La instancia de Bootstrap Offcanvas.
     */
    function setupOffcanvasClose(element, instance) {
        if (!element || !instance) return;

        // Seleccionar todos los enlaces dentro del cuerpo del Offcanvas
        const links = element.querySelectorAll('a');
        
        links.forEach(link => {
            link.addEventListener('click', () => {
                // Un pequeño retraso asegura que el desplazamiento de ancla ocurra antes de cerrar
                setTimeout(() => {
                    instance.hide();
                }, 100); 
            });
        });
    }

    // Configurar los listeners para cada Offcanvas
    setupOffcanvasClose(mainOffcanvasElement, mainOffcanvas);
    setupOffcanvasClose(offcanvasRacingElement, offcanvasRacing);
    setupOffcanvasClose(offcanvasSportsCarsElement, offcanvasSportsCars);

    // --- 7. Inicialización ---
    loadVehicles();
});