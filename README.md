# Pizzaria

Landing page e cardápio online de uma pizzaria fictícia. O cliente monta o pedido (tamanho, sabores, borda e bebidas) e envia pelo WhatsApp.

## Como abrir

Abra `index.html` no navegador (ou use a extensão Live Server do VS Code). Não precisa instalar nada.

## Estrutura

- `index.html` — landing page
- `cardapio.html` — montador de pedido e checkout
- `css/` — estilos (`style.css` base, `home.css` landing, `cardapio.css` cardápio)
- `js/` — scripts (`dados.js` configuração e cardápio, `main.js` comportamentos comuns, `cardapio.js` pedido)
- `img/` — imagens e logo

## Configuração

Tudo que muda com frequência fica em `js/dados.js`:

- `whatsapp`: número que recebe os pedidos (55 + DDD + número, só dígitos)
- `taxaEntrega`, `pedidoMinimo`, `chavePix`
- `funcionamento`: dias e horário (fora dele o cardápio fica apagado; use `cardapio.html?teste` para testar)
- sabores, preços, bordas e bebidas
