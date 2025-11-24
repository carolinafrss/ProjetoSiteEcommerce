/* === Inicialização de Variáveis === */
/* (mantido do seu arquivo original) */
let allProducts = [];
let displayedProductsCount = 0;
const productsPerLoad = 10;

// referências DOM — em algumas páginas os IDs podem não existir, verificamos antes de usar
const produtoCardContainer = document.getElementById("produto-card");
const loadMoreBtn = document.getElementById("load-more-btn");
const carrinhoModal = document.getElementById("carrinho-modal");
const compraModal = document.getElementById("compra-modal");
const sideMenu = document.getElementById('side-menu');
// cors: carrinho icon pode ter id diferente nas páginas
const carrinhoIcon = document.getElementById('carrinho-icon') || document.getElementById('carrinho-icon-product') || document.getElementById('carrinho-icon-about') || document.getElementById('carrinho-icon-contact');

/* === Função: exibe produtos na index (cards) === */
function displayProducts(startIndex, count) {
    if (!produtoCardContainer) return;
    const end = Math.min(startIndex + count, allProducts.length);
    for (let i = startIndex; i < end; i++) {
        const item = allProducts[i];
        const cardHTML = `
            <!-- card: produto -->
            <div class="card" data-product-title="${item.title}" data-product-id="${item.id}">
                <img src="${item.thumbnail}" alt="${item.title}">
                <h2>${item.title}</h2>
                <p>${item.description}</p>
                <div class="price">Preço: R$ ${item.price.toFixed(2)}</div>
                <div class="rating">Avaliação: ${item.rating} / 5</div>
                <div class="button-group">
                    <!-- Comprar redireciona para product.html?id= -->
                    <button class="btn-comprar" data-product-id="${item.id}">Comprar</button>
                    <button class="btn-carrinho" data-product-id="${item.id}" data-product-name="${item.title}">Adicionar ao Carrinho</button>
                </div>
            </div>`;
        produtoCardContainer.innerHTML += cardHTML;
        displayedProductsCount++;
    }

    // Esconde botão se todos carregados
    if (displayedProductsCount >= allProducts.length) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    } else {
        if (loadMoreBtn) loadMoreBtn.style.display = 'block';
    }
}

/* === Fetch dos produtos (API) === */
fetch("https://dummyjson.com/products?limit=100")
    .then(res => res.json())
    .then(data => {
        allProducts = data.products;
        displayProducts(0, productsPerLoad);
    })
    .catch(error => {
        console.error("Erro ao carregar produto:", error);
        if (produtoCardContainer) produtoCardContainer.innerHTML = '<p>Erro ao carregar os produtos. Tente novamente mais tarde.</p>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    });

/* === Carregar mais === */
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        displayProducts(displayedProductsCount, productsPerLoad);
    });
}

/* === Ações gerais de clique (cards, modais, botões) === */
document.addEventListener('click', function (event) {
    // 1) Clicar no card (exceto nos botões) mostra alerta com nome do produto
    if (event.target.closest('.card') && !event.target.closest('button')) {
        const card = event.target.closest('.card');
        const productTitle = card.dataset.productTitle;
        alert(`Você clicou no produto: ${productTitle}`);
    }

    // 3) Ao clicar em 'Adicionar ao Carrinho'
    if (event.target.classList.contains('btn-carrinho')) {
        if (carrinhoModal) {
            carrinhoModal.style.display = 'block';
            carrinhoModal.setAttribute('aria-hidden', 'false');
            const productName = event.target.dataset.productName;
            addToCartById(event.target.dataset.productId || null, productName);
            // preenche mensagem modal
            const msg = document.getElementById('carrinho-modal-msg');
            if (msg) msg.textContent = productName;
            // link para abrir a página do produto
            const verLink = document.getElementById('ver-produto-link');
            if (verLink && event.target.dataset.productId) {
                verLink.href = `product.html?id=${event.target.dataset.productId}`;
            }
        }
    }

    // 5) Ao clicar em 'Comprar' do card: abre modal com QRCode (ou redireciona para product.html)
    if (event.target.classList.contains('btn-comprar')) {
        const productId = event.target.dataset.productId;
        // redireciona para product.html?id= para mostrar detalhes (requisito 6/7)
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            // redireciona
            window.location.href = `product.html?id=${productId}`;
            return;
        }

        // se estiver na página onde existe o modal global, abre o modal
        if (compraModal) {
            const product = allProducts.find(p => p.id == productId);
            compraModal.style.display = 'block';
            compraModal.setAttribute('aria-hidden', 'false');

            const qrCodeContainer = document.getElementById('qrcode');
            qrCodeContainer && (qrCodeContainer.innerHTML = '');
            if (product && qrCodeContainer) {
                // Gera QRCode com informação (string simples; em produção usar gateway)
                new QRCode(qrCodeContainer, {
                    text: `PIX - Zênite Store | Produto: ${product.title} | Valor: R$ ${product.price.toFixed(2)} | Chave: 123.456.789-00`,
                    width: 180,
                    height: 180
                });
                const info = document.getElementById('qrcode-info');
                if (info) info.textContent = `Pague R$ ${product.price.toFixed(2)} via PIX (chave demonstrativa).`;
            }
        }
    }

    // Fecha modais ao clicar no 'x'
    if (event.target.classList.contains('close-btn')) {
        const modal = event.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }
});

/* === Fecha modal ao clicar fora (requisito 5) === */
window.addEventListener('click', function (event) {
    if (event.target === carrinhoModal) {
        carrinhoModal.style.display = "none";
        carrinhoModal.setAttribute('aria-hidden', 'true');
    }
    if (event.target === compraModal) {
        compraModal.style.display = "none";
        compraModal.setAttribute('aria-hidden', 'true');
    }

    // Fecha menu lateral se clicar fora
    if (sideMenu && sideMenu.style.width && sideMenu.style.width !== '0px') {
        if (!event.target.closest('.side-menu') && event.target.id !== 'carrinho-icon') {
            sideMenu.style.width = '0';
            sideMenu.setAttribute('aria-hidden', 'true');
        }
    }
});

/* === Carrinho lateral e funções de adicionar === */
let carrinho = [];

function addToCartById(productId, productName) {
    // Adiciona objeto com id + nome (para futuros usos)
    const product = allProducts.find(p => p.id == productId);
    const name = product ? product.title : (productName || 'Produto');
    carrinho.push({ id: productId, title: name, price: product ? product.price : 0 });
    updateCartMenu();
}

function addToCart(productName) {
    // compatibilidade com versão anterior
    carrinho.push({ id: null, title: productName, price: 0 });
    updateCartMenu();
}

function updateCartMenu() {
    const carrinhoProdutosDiv = document.getElementById('carrinho-produtos');
    if (!carrinhoProdutosDiv) return;
    carrinhoProdutosDiv.innerHTML = '';

    if (carrinho.length === 0) {
        carrinhoProdutosDiv.innerHTML = '<p>Nenhum produto adicionado.</p>';
        document.getElementById('cart-total') && (document.getElementById('cart-total').textContent = 'Total: R$ 0.00');
        return;
    }

    let total = 0;
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        itemDiv.innerHTML = `<span>${item.title}</span><span>R$ ${(item.price || 0).toFixed(2)}</span>`;
        carrinhoProdutosDiv.appendChild(itemDiv);
        total += (item.price || 0);
    });

    // frete grátis condicional
    const freteMsg = document.createElement('div');
    if (total >= 100) {
        freteMsg.innerHTML = '<small>Entrega grátis aplicada (compras a partir de R$100).</small>';
    } else {
        freteMsg.innerHTML = `<small>Entrega grátis a partir de R$100. Falta R$ ${(100 - total).toFixed(2)}</small>`;
    }
    carrinhoProdutosDiv.appendChild(freteMsg);

    document.getElementById('cart-total') && (document.getElementById('cart-total').textContent = `Total: R$ ${total.toFixed(2)}`);
}

/* Abre o menu lateral ao clicar no ícone do carrinho */
if (carrinhoIcon) {
    carrinhoIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sideMenu) {
            sideMenu.style.width = '320px';
            sideMenu.setAttribute('aria-hidden', 'false');
            updateCartMenu();
        }
    });
}

/* Fecha menu lateral ao clicar no botão de fechar */
const closeCarrinhoBtn = document.getElementById('close-carrinho-btn');
if (closeCarrinhoBtn) {
    closeCarrinhoBtn.addEventListener('click', function () {
        if (sideMenu) {
            sideMenu.style.width = '0';
            sideMenu.setAttribute('aria-hidden', 'true');
        }
    });
}

/* === LEAFLET MAP (geolocalização) === */
function initLeafletMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return; // só roda se elemento existir
    const lojaLat = -23.56135;
    const lojaLng = -46.65651;
    const lojaLocation = [lojaLat, lojaLng];

    const map = L.map('map').setView(lojaLocation, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker(lojaLocation).addTo(map).bindPopup('<b>Zênite Store</b><br>Loja principal');

    // Geolocalização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const userMarker = L.marker([userLat, userLng]).addTo(map).bindPopup('Você está aqui!');
            // ajusta bounds
            const bounds = L.latLngBounds([[userLat, userLng], lojaLocation]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }, () => {
            console.log("Permissão de geolocalização negada ou indisponível.");
        });
    } else {
        console.log("Geolocalização não suportada.");
    }
}

/* === Chart.js (vendas) === */
function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Protetor', 'Sérum', 'Hidratante', 'Máscara', 'Shampoo', 'Batom'],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [12, 19, 30, 25, 40, 35],
                /* cores ficam por estilo padrão */
            }]
        },
        options: {
            responsive: true
        }
    });
}

/* === Chat WebSocket (simulado) === */
function initWebSocket() {
    const chatContainer = document.getElementById('chat-websocket');
    const chatInput = document.getElementById('chat-input');
    if (!chatContainer || !chatInput) return;

    try {
        socket = new WebSocket('wss://echo.websocket.events'); // echo de teste
        socket.addEventListener('open', () => {
            const msg = document.createElement('div');
            msg.textContent = 'Sistema: Bem-vindo ao chat!';
            chatContainer.appendChild(msg);
        });
        socket.addEventListener('message', (evt) => {
            const msg = document.createElement('div');
            msg.textContent = `Atendente: ${evt.data}`;
            msg.style.color = 'blue';
            chatContainer.appendChild(msg);
        });
        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && chatInput.value.trim() !== '') {
                socket.send(chatInput.value.trim());
                const me = document.createElement('div');
                me.textContent = `Você: ${chatInput.value.trim()}`;
                me.style.textAlign = 'right';
                chatContainer.appendChild(me);
                chatInput.value = '';
            }
        });
    } catch (err) {
        chatContainer.innerHTML = '<div>Chat indisponível.</div>';
    }
}

/* === GERAL: inicializações DOMContentLoaded === */
document.addEventListener('DOMContentLoaded', function () {
    // mapa
    initLeafletMap();
    // chart
    initSalesChart();
    // chat
    initWebSocket();

    // mostra ano no footer principal (se existir)
    const ano = document.getElementById("ano");
    if (ano) ano.textContent = new Date().getFullYear();

    // carregar detalhes do product.html se estivermos nessa página
    if (window.location.pathname.endsWith('product.html')) {
        loadProductDetailFromQuery();
    }
});

/* === Função: carrega detalhe do produto em product.html via ?id= === */
function loadProductDetailFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    // Se os produtos já foram carregados via fetch, usa; caso contrário, busca product específico
    if (allProducts && allProducts.length) {
        const p = allProducts.find(x => x.id == id);
        fillProductDetail(p);
    } else {
        // busca produto individual na API
        fetch(`https://dummyjson.com/products/${id}`)
            .then(r => r.json())
            .then(p => fillProductDetail(p))
            .catch(err => {
                console.error('Erro ao carregar produto:', err);
            });
    }
}

/* Preenche elementos do product.html */
function fillProductDetail(p) {
    if (!p) return;
    const title = document.getElementById('produto-title');
    const img = document.getElementById('produto-img');
    const desc = document.getElementById('produto-desc');
    const price = document.getElementById('produto-price');

    if (title) title.textContent = p.title;
    if (img) img.src = p.thumbnail || (p.images && p.images[0]) || '';
    if (desc) desc.textContent = p.description;
    if (price) price.textContent = `Preço: R$ ${p.price.toFixed(2)}`;

    // botão qrcode na product.html
    const qBtn = document.getElementById('product-qrcode-btn');
    if (qBtn) {
        qBtn.addEventListener('click', function () {
            const modal = document.getElementById('compra-modal-product');
            if (modal) {
                const qContainer = document.getElementById('qrcode-product');
                qContainer && (qContainer.innerHTML = '');
                new QRCode(qContainer, {
                    text: `PIX - Zênite Store | Produto: ${p.title} | Valor: R$ ${p.price.toFixed(2)} | Chave: 123.456.789-00`,
                    width: 180,
                    height: 180
                });
                const info = document.getElementById('qrcode-product-info');
                if (info) info.textContent = `Pague R$ ${p.price.toFixed(2)} via PIX (exemplo).`;
                modal.style.display = 'block';
            }
        });
    }

    // fechar modal product.html
    document.addEventListener('click', function (ev) {
        if (ev.target.classList && ev.target.classList.contains('close-btn')) {
            const mm = ev.target.closest('.modal');
            mm && (mm.style.display = 'none');
        }
    });

    // fechar ao clicar fora
    window.addEventListener('click', function (ev) {
        const modal = document.getElementById('compra-modal-product');
        if (modal && ev.target === modal) modal.style.display = 'none';
    });
}
