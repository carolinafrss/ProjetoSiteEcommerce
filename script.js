/* === Inicialização de Variáveis === */
let allProducts = [];
let displayedProductsCount = 0;
const productsPerLoad = 10;
const produtoCardContainer = document.getElementById("produto-card");
const loadMoreBtn = document.getElementById("load-more-btn");
const carrinhoModal = document.getElementById("carrinho-modal");
const compraModal = document.getElementById("compra-modal");
const sideMenu = document.getElementById('side-menu');
const carrinhoIcon = document.getElementById('carrinho-icon');

/* === Funções de E-commerce === */

/** * Função para carregar e exibir os produtos na tela 
 * @param {number} startIndex - Índice inicial do array de produtos
 * @param {number} count - Número de produtos a serem carregados
 */
function displayProducts(startIndex, count) {
    const end = Math.min(startIndex + count, allProducts.length);
    for (let i = startIndex; i < end; i++) {
        const item = allProducts[i];
        const cardHTML = `
            <div class="card" data-product-title="${item.title}">
                <img src="${item.thumbnail}" alt="${item.title}">
                <h2>${item.title}</h2>
                <p>${item.description}</p>
                <div class="price">Preço: R$ ${item.price.toFixed(2)}</div>
                <div class="rating">Avaliação: ${item.rating} / 5</div>
                <div class="button-group">
                    <button class="btn-comprar" data-product-id="${item.id}">Comprar</button>
                    <button class="btn-carrinho" data-product-id="${item.id}" data-product-name="${item.title}">Adicionar ao Carrinho</button>
                </div>
            </div>`;
        produtoCardContainer.innerHTML += cardHTML;
        displayedProductsCount++;
    }

    // Oculta o botão se todos os produtos foram carregados
    if (displayedProductsCount >= allProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

/** Busca os dados da api e inicia a primeira carga ***/
fetch("https://dummyjson.com/products?limit=100")
    .then(res => res.json())
    .then(data => {
        allProducts = data.products;
        displayProducts(0, productsPerLoad);
    })
    /** tratamento de exeções **/
    .catch(error => {
        console.error("Erro ao carregar produto:", error);
        produtoCardContainer.innerHTML = '<p>Erro ao carregar os produtos. Tente novamente mais tarde.</p>';
        loadMoreBtn.style.display = 'none';
    });

/* === Funcionalidade: Carregar Mais Produtos === */
loadMoreBtn.addEventListener('click', () => {
    displayProducts(displayedProductsCount, productsPerLoad);
});

/* === Funcionalidade: Ações dos Cards e Modais === */

document.addEventListener('click', function (event) {
    // 1. Ao clicar nos cards dos produtos, exibir um alerta com o nome do produto clicado.
    if (event.target.closest('.card') && !event.target.closest('button')) {
        const card = event.target.closest('.card');
        const productTitle = card.dataset.productTitle;
        alert(`Você clicou no produto: ${productTitle}`);
    }

    // 3. Ao clicar no Adicionar ao Carrinho, exibir modal.
    if (event.target.classList.contains('btn-carrinho')) {
        carrinhoModal.style.display = 'block';
        const productName = event.target.dataset.productName;
        addToCart(productName);
    }

    // 5. Ao clicar no Comprar, exibir modal com QRCode.
    if (event.target.classList.contains('btn-comprar')) {
        const productId = event.target.dataset.productId;
        const product = allProducts.find(p => p.id == productId);

        // Abre o modal de compra
        compraModal.style.display = 'block';

        // Gera o QR Code
        const qrCodeContainer = document.getElementById('qrcode');
        qrCodeContainer.innerHTML = ''; // Limpa o conteúdo anterior
        // Usando a biblioteca QRCode.js (importada no index.html)
        new QRCode(qrCodeContainer, {
            text: `Compra do produto: ${product.title}. Valor: R$ ${product.price.toFixed(2)}. Chave Pix: 12345678900`,
            width: 150,
            height: 150,
            colorDark: "#ff4e18",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Fecha o modal ao clicar no 'x'
    if (event.target.classList.contains('close-btn')) {
        event.target.closest('.modal').style.display = 'none';
    }
});

// 4. Ao clicar fora do modal, ele deve fechar.
window.onclick = function (event) {
    if (event.target === carrinhoModal) {
        carrinhoModal.style.display = "none";
    }
    if (event.target === compraModal) {
        compraModal.style.display = "none";
    }
    // Fecha o menu lateral do carrinho ao clicar fora dele
    if (event.target.id !== 'carrinho-icon' && !sideMenu.contains(event.target) && sideMenu.style.width !== '0px') {
        sideMenu.style.width = '0';
    }
}

/* === Funcionalidade: Menu Lateral do Carrinho (Função 8) === */

let carrinho = [];

function addToCart(productName) {
    // Adiciona o produto ao array/simulação de carrinho
    carrinho.push(productName);
    updateCartMenu();
}

function updateCartMenu() {
    const carrinhoProdutosDiv = document.getElementById('carrinho-produtos');
    carrinhoProdutosDiv.innerHTML = '';

    if (carrinho.length === 0) {
        carrinhoProdutosDiv.innerHTML = '<p>Nenhum produto adicionado.</p>';
        return;
    }

    carrinho.forEach(name => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        itemDiv.innerHTML = `<span>${name}</span>`;
        carrinhoProdutosDiv.appendChild(itemDiv);
    });
}

// Abre o menu lateral
if (carrinhoIcon) {
    carrinhoIcon.addEventListener('click', function (e) {
        e.stopPropagation(); // Evita que o evento de fechar seja acionado imediatamente
        sideMenu.style.width = '300px';
    });
}
// Fecha o menu lateral
const closeCarrinhoBtn = document.getElementById('close-carrinho-btn');
if (closeCarrinhoBtn) {
    closeCarrinhoBtn.addEventListener('click', function () {
        sideMenu.style.width = '0';
    });
}


/* === Funcionalidade: Geolocalização com Leaflet (Função 9) === */
function initLeafletMap() {
    // Coordenadas da Loja (Simulação: Avenida Paulista, São Paulo)
    const lojaLat = -23.56135;
    const lojaLng = -46.65651;
    const lojaLocation = [lojaLat, lojaLng];

    // Inicializa o mapa
    const map = L.map('map').setView(lojaLocation, 14);

    // Adiciona o tile layer (Mapa OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/go/M5uThFwU-">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Adiciona marcador da Loja
    L.marker(lojaLocation).addTo(map)
        .bindPopup('<b>E-Commerce Shop de Beleza</b><br>Aqui está nossa loja principal.')
        .openPopup();



    // Obtém e exibe a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const userLocation = [userLat, userLng];

                // Adiciona marcador do Usuário
                L.marker(userLocation, { icon: L.divIcon({ className: 'user-marker', html: '<span class="material-symbols-outlined" style="color:#007bff; font-size:30px;">person_pin_circle</span>', iconSize: [30, 30], iconAnchor: [15, 30] }) })
                    .addTo(map)
                    .bindPopup('Você está aqui!')
                    .openPopup();

                // Ajusta o zoom para mostrar ambas as localizações
                const bounds = L.latLngBounds([lojaLocation, userLocation]);
                map.fitBounds(bounds);
            },
            () => {
                console.log("Geolocalização do usuário indisponível.");
            }
        );
    } else {
        console.log("Geolocalização não é suportada por este navegador.");
    }
}
// Roda no final para garantir que o elemento 'map' esteja carregado
document.addEventListener('DOMContentLoaded', initLeafletMap);


/* === Funcionalidade: Gráfico de Vendas (Chart.js) (Função 8) === */
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('salesChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Protetor Solar', 'Sérum Facial', 'Hidratante Corporal', 'Máscara Capilar', 'Shampoo', 'Batom'],
                datasets: [{
                    label: 'Unidades Vendidas (Milhares)',
                    data: [12, 19, 30, 25, 40, 35],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Milhares de Unidades'
                        }
                    }
                }
            }
        });
    }
});


/* === Funcionalidade: Chat WebSocket (Função 11) === */

const chatContainer = document.getElementById('chat-websocket');
const chatInput = document.getElementById('chat-input');
let socket;

function initWebSocket() {
    if (chatContainer && chatInput) {
        try {
            // Echo server é usado apenas para simulação. Em produção, seria o servidor real.
            socket = new WebSocket('wss://echo.websocket.org');

            socket.addEventListener('open', function (event) {
                console.log('Conexão WebSocket aberta');
                const msg = document.createElement('div');
                msg.textContent = 'Sistema: Bem-vindo ao chat! Como podemos ajudar?';
                chatContainer.appendChild(msg);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });

            socket.addEventListener('message', function (event) {
                const messageElement = document.createElement('div');
                messageElement.textContent = `Atendente: ${event.data}`;
                messageElement.style.color = 'blue';
                chatContainer.appendChild(messageElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });

            socket.addEventListener('error', function (event) {
                console.error('WebSocket Error:', event);
                const msg = document.createElement('div');
                msg.textContent = 'Sistema: Erro na conexão do chat.';
                msg.style.color = 'red';
                chatContainer.appendChild(msg);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });

            chatInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && chatInput.value.trim() !== '') {
                    const message = chatInput.value.trim();
                    socket.send(message);

                    const userMessage = document.createElement('div');
                    userMessage.textContent = `Você: ${message}`;
                    userMessage.style.textAlign = 'right';
                    chatContainer.appendChild(userMessage);

                    chatInput.value = '';
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });

        } catch (error) {
            console.error("Erro ao iniciar WebSocket:", error);
            chatContainer.innerHTML = '<div>Chat indisponível no momento.</div>';
        }
    }
}
document.addEventListener('DOMContentLoaded', initWebSocket);


/* === Utilitários === */
// Spript para mostrar o ano atual no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();