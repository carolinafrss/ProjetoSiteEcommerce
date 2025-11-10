# ProjetoSiteEcommerce

# Protótipo E-Commerce Beauty Shop

Protótipo de loja online (front-end) com HTML, CSS e JavaScript. Funcionalidades:

- Header com título e ícones (Google Material Symbols)
- Cards dinâmicos (mínimo 10 produtos) buscados pela API `https://dummyjson.com/products`
- Ao clicar no card (fora dos botões) mostra `alert` com o nome do produto
- Botão **Adicionar ao Carrinho**: adiciona item ao carrinho em memória e abre modal confirmando
- Botão **Comprar**: abre modal com QR Code para pagamento
- Carrinho (menu lateral) que mostra itens adicionados, possibilita remover itens e ver total
- Modal fecha ao clicar fora ou no botão fechar
- Cursor personalizado (duas camadas)
- Exibição da geolocalização (latitude/longitude) no rodapé da página

## Estrutura do repositório
/ (raiz) ├─ index.html ├─ style.css ├─ script.js ├─ README.md └─ .gitignore

## Como rodar

1. Clone o repositório
2. Abra `index.html` no navegador (ou use um servidor local como `live-server` ou `http-server`)
3. Permita geolocalização quando o navegador solicitar (para ver coordenadas)

## Observações

- O protótipo utiliza `https://api.qrserver.com` para gerar QR Codes públicos (apenas para demonstração).
- Os dados dos produtos vêm de `https://dummyjson.com/products` (API de demonstração).

