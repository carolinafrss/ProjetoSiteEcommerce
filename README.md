# ProjetoSiteEcommerce

# ✨ Zênite Store - Protótipo

Este repositório contém o protótipo de um e-commerce de vários produtos desenvolvido com **HTML, CSS e JavaScript** (Vanilla JS) para simular as principais funcionalidades de uma loja online.

## 🚀 Funcionalidades Implementadas

O protótipo atende aos seguintes requisitos do sistema:

1.  **Cabeçalho e Navegação:**
    * Header fixo com ícones do Google Fonts (Home e Carrinho).
    * Links de navegação para **Home, Contato e Sobre**.
2.  **Cards de Produtos:**
    * Carregamento inicial de produtos via **API DummyJSON** (`https://dummyjson.com/products`).
    * Exibição de imagem, nome, descrição, preço e avaliação.
    * **Efeito Hover** nos cards.
3.  **Funcionalidades de Interação:**
    * **Alerta ao Clicar no Card:** Exibe o nome do produto ao clicar no card (fora dos botões).
    * **Modal 'Adicionar ao Carrinho':** Exibe um modal de confirmação.
    * **Modal 'Comprar' (QRCode):** Exibe um modal com um **QR Code** de simulação de pagamento, gerado pela biblioteca **QRCode.js**.
    * **Fechamento de Modais:** Os modais fecham ao clicar no 'X' ou fora da área de conteúdo (fora do modal).
4.  **Carrinho de Compras (Menu Lateral):**
    * Ao clicar no ícone do carrinho, um **menu lateral** se abre, exibindo os produtos adicionados.
5.  **Páginas Secundárias:**
    * **`contact.html`:** Página com um formulário de contato.
    * **`about.html`:** Página "Sobre Nós".
    * ** Product.html`:** Página "Produto".
6.  **Carregamento de Conteúdo:**
    * Botão **"Carregar Mais Produtos"** que exibe itens adicionais da API (Simulação de paginação).
7.  **Visualização de Dados:**
    * **Gráfico de Vendas:** Integração com a biblioteca **Chart.js** para exibir um gráfico de barras de vendas simuladas.
    * **Mapa de Geolocalização:** Integração com a **API Leaflet** para exibir a localização da loja e a localização do usuário (se permitido).
8.  **Comunicação:**
    * **Chat WebSocket:** Simulação de chat de atendimento em tempo real, conectado a um servidor de eco público.
9.  **Promoção:**
    * **Banner** de Promoção de Natal.
10. **Rodapé:**
    * Direitos autorais com o ano atualizado dinamicamente.

## 📦 Dependências Externas (APIs e Bibliotecas)

O projeto utiliza as seguintes bibliotecas externas, importadas via CDN no `index.html`:

| Biblioteca / API | Função |
| :--- | :--- |
| **DummyJSON** | Fornece dados simulados de produtos (GET Request). |
| **Google Fonts** | Ícones do cabeçalho (`Material Symbols Outlined`). |
| **QRCode.js** | Geração do QR Code para a simulação de pagamento. |
| **Chart.js** | Geração de gráficos de vendas. |
| **Leaflet API** | Geração do mapa de geolocalização. |
| **WebSockets (wss://echo.websocket.org)** | Simulação de chat em tempo real. |
