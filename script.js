// script.js - funcionalidades principais (cards, modal, carrinho, geolocalização, cursor)

const produtosContainer = document.getElementById('produto-card');
const contadorCarrinhoEl = document.getElementById('contador-carrinho');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const anoEl = document.getElementById('ano');
const cartIcon = document.getElementById('cart-icon');
const sideCart = document.getElementById('side-cart');
const sideCartItems = document.getElementById('side-cart-items');
const closeSideCartBtn = document.getElementById('close-side-cart');
const sideCartTotal = document.getElementById('side-cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const geoOutput = document.getElementById('geo-output');

anoEl.innerText = new Date().getFullYear();

/* Cursor customizado */
const cursorSmall = document.getElementById('cursor-small');
const cursorBig = document.getElementById('cursor-big');

window.addEventListener('mousemove', (e) => {
    const x = e.clientX, y = e.clientY;
    cursorSmall.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursorBig.style.transform = `translate3d(${x}px, ${y}px, 0)`;
});

/* Modal helpers */
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
modalClose.addEventListener('click', closeModal);

function openModal(htmlContent) {
    modalContent.innerHTML = htmlContent;
    modalOverlay.classList.remove('hidden');
}
function closeModal() {
    modalOverlay.classList.add('hidden');
    modalContent.innerHTML = '';
}

/* Carrinho (armazenado em memória) */
let cart = [];
function atualizarContador() {
    contadorCarrinhoEl.innerText = cart.length;
}
function adicionarAoCarrinho(prod) {
    cart.push(prod);
    atualizarContador();
    renderSideCartItems();
}
function calcularTotal() {
    const total = cart.reduce((s, p) => s + Number(p.price || 0), 0);
    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Side cart (abrir/fechar) */
function abrirSideCart() {
    sideCart.classList.remove('hidden');
    sideCart.classList.add('visible');
    sideCart.setAttribute('aria-hidden', 'false');
}
function fecharSideCart() {
    sideCart.classList.remove('visible');
    sideCart.classList.add('hidden');
    sideCart.setAttribute('aria-hidden', 'true');
}

cartIcon.addEventListener('click', () => {
    abrirSideCart();
});
closeSideCartBtn.addEventListener('click', fecharSideCart);

function renderSideCartItems() {
    sideCartItems.innerHTML = '';
    if (cart.length === 0) {
        sideCartItems.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
        cart.forEach((p, i) => {
            const item = document.createElement('div');
            item.className = 'side-cart-item';
            item.innerHTML = `
                <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" />
                <div style="flex:1">
                  <div style="font-weight:700">${escapeHtml(p.title)}</div>
                  <div style="font-size:.9rem;color:#555">${escapeHtml(p.description)}</div>
                  <div style="margin-top:6px;color:#ff4e18;font-weight:700">${Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
                <button data-i="${i}" class="btn btn-remove">Remover</button>
            `;
            sideCartItems.appendChild(item);
        });

        // Add remove handlers
        sideCartItems.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = Number(e.currentTarget.getAttribute('data-i'));
                cart.splice(idx, 1);
                atualizarContador();
                renderSideCartItems();
            });
        });
    }
    sideCartTotal.innerText = 'Total: ' + calcularTotal();
}

/* Geração do QR Code via API pública */
function gerarQRCodeUrl(texto) {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(texto)}&size=250x250`;
}

/* Carregar produtos da API e filtrar por categorias de 'beleza' */
fetch('https://dummyjson.com/products')
    .then(res => res.json())
    .then(data => {
        let produtos = data.products || [];
        const beautyRegex = /skin|fragrance|fragrances|makeup|beauty|skincare|hair|cosmetic|perfume/i;
        let produtosBeleza = produtos.filter(p => beautyRegex.test(p.category || ''));
        if (produtosBeleza.length < 10) {
            const extra = produtos.filter(p => beautyRegex.test(p.title + ' ' + p.description));
            produtosBeleza = [...new Set([...produtosBeleza, ...extra])];
        }
        if (produtosBeleza.length < 10) {
            produtosBeleza = produtos.slice(0, 12);
        }
        produtosBeleza = produtosBeleza.slice(0, Math.max(10, Math.min(30, produtosBeleza.length)));
        montarCards(produtosBeleza);
    })
    .catch(err => {
        console.error('Erro ao buscar produtos:', err);
        produtosContainer.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
    });

/* Monta os cards dinamicamente */
function montarCards(lista) {
    produtosContainer.innerHTML = '';
    lista.forEach((p, idx) => {
        const priceBRL = Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const thumb = p.thumbnail || (p.images && p.images[0]) || 'https://via.placeholder.com/300x200?text=Sem+imagem';

        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
      <img src="${thumb}" alt="${escapeHtml(p.title)}" loading="lazy"/>
      <h2>${escapeHtml(p.title)}</h2>
      <p>${escapeHtml(p.description)}</p>
      <div class="price">${priceBRL}</div>
      <div class="buttons">
        <button class="btn btn-comprar" data-index="${idx}">Comprar</button>
        <button class="btn btn-adicionar" data-index="${idx}">Adicionar ao Carrinho</button>
      </div>
    `;

        // Alert quando clicar no card (exceto em botões)
        card.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'button') return; // ignore clicks nos botões
            alert(`Você clicou em: ${p.title}`);
        });

        // Botão adicionar
        const btnAdicionar = card.querySelector('.btn-adicionar');
        btnAdicionar.addEventListener('click', (ev) => {
            ev.stopPropagation();
            adicionarAoCarrinho(p);
            openModal(`<h3>Produto adicionado ao carrinho</h3><p>${escapeHtml(p.title)}</p>`);
        });

        // Botão comprar
        const btnComprar = card.querySelector('.btn-comprar');
        btnComprar.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const info = `${p.title} - ${p.price}`;
            const qrUrl = gerarQRCodeUrl(info);
            openModal(`<h3>Pagamento - ${escapeHtml(p.title)}</h3>
                 <p>${priceBRL}</p>
                 <img src="${qrUrl}" alt="QR Code para pagamento" style="max-width:100%;height:auto;margin-top:12px;display:block;margin-left:auto;margin-right:auto;">
                 <p style="font-size:.85rem;margin-top:10px;color:#555">Abra seu app de pagamento e escaneie o QR Code.</p>`);
        });

        produtosContainer.appendChild(card);
    });
}

/* util: escapando HTML simples (proteção mínima) */
function escapeHtml(str = '') {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/* Checkout: ao clicar em comprar no side cart, exibe QR code com o resumo */
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        openModal('<h3>Seu carrinho está vazio</h3>');
        return;
    }
    const resumo = cart.map(p => `${p.title} — R$ ${Number(p.price).toFixed(2)}`).join('\n');
    const total = calcularTotal();
    const qrUrl = gerarQRCodeUrl(`Pagamento: ${resumo} | Total: ${total}`);
    openModal(`<h3>Pagamento</h3><p>Total: ${total}</p><img src="${qrUrl}" alt="QR Code para pagamento" style="max-width:100%;height:auto;margin-top:12px;display:block;margin-left:auto;margin-right:auto;"></p><p style="font-size:.85rem;margin-top:10px;color:#555">Escaneie o QR Code com seu app de pagamento.</p>`);
});

/* Geolocalização: pega lat/long e exibe */
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        geoOutput.innerText = `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;
    }, (err) => {
        geoOutput.innerText = 'Não foi possível obter a localização. Verifique as permissões do navegador.';
    });
} else {
    geoOutput.innerText = 'Geolocalização não suportada neste navegador.';
}

/* Inicializar side cart vazio */
renderSideCartItems();
