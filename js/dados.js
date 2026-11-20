/* =========================================================
   CONFIGURAÇÃO E DADOS DO CARDÁPIO — edite aqui!
   ========================================================= */
const CONFIG = {
  nome: "Pizzaria Real",
  // Número do WhatsApp que recebe os pedidos: DDI + DDD + número, só dígitos
  whatsapp: "5567996896426", // (67) 99689-6426 · número que recebe os pedidos (DDI 55 + DDD + número, só dígitos)
  taxaEntrega: 7.00,
  pedidoMinimo: 30.00,
  chavePix: "pedidos@pizzariareal.com.br",
  horario: "Ter a Dom · 18h às 23h30",
  // Funcionamento (o cardápio fica apagado fora desse horário)
  // diasFechado: 0 = domingo, 1 = segunda ... 6 = sábado
  funcionamento: { diasFechado: [1], abre: "18:00", fecha: "23:30" },
};

// Tamanhos: maxSabores = quantos sabores a pizza pode ter
const TAMANHOS = [
  { id: "broto",   nome: "Broto",   fatias: 4,  cm: 25, maxSabores: 1 },
  { id: "media",   nome: "Média",   fatias: 6,  cm: 30, maxSabores: 2 },
  { id: "grande",  nome: "Grande",  fatias: 8,  cm: 35, maxSabores: 3 },
  { id: "familia", nome: "Família", fatias: 12, cm: 40, maxSabores: 4 },
];

// Preço por categoria x tamanho. Pizza com vários sabores = preço do sabor mais caro.
const PRECOS = {
  tradicional: { broto: 29.9, media: 44.9, grande: 54.9, familia: 69.9 },
  especial:    { broto: 34.9, media: 52.9, grande: 64.9, familia: 79.9 },
  premium:     { broto: 39.9, media: 59.9, grande: 72.9, familia: 89.9 },
  doce:        { broto: 29.9, media: 44.9, grande: 54.9, familia: 69.9 },
};

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

const SABORES = [
  // Tradicionais
  { id: "mussarela", nome: "Mussarela", cat: "tradicional", desc: "Molho de tomate artesanal, mussarela e orégano.", img: IMG("photo-1513104890138-7c749659a591"), tag: "" },
  { id: "calabresa", nome: "Calabresa", cat: "tradicional", desc: "Calabresa fatiada, cebola roxa e azeitonas pretas.", img: IMG("photo-1628840042765-356cda07504e"), tag: "Mais pedida" },
  { id: "margherita", nome: "Margherita", cat: "tradicional", desc: "Mussarela, tomate fresco e manjericão.", img: IMG("photo-1574071318508-1cdbab80d002"), tag: "Veggie" },
  { id: "napolitana", nome: "Napolitana", cat: "tradicional", desc: "Mussarela, tomate, parmesão e alho dourado.", img: IMG("photo-1595854341625-f33ee10dbf94"), tag: "" },
  { id: "frango-catupiry", nome: "Frango c/ Catupiry", cat: "tradicional", desc: "Frango desfiado temperado e Catupiry original.", img: IMG("photo-1565299624946-b28f40a0ae38"), tag: "" },
  // Especiais
  { id: "portuguesa", nome: "Portuguesa", cat: "especial", desc: "Presunto, ovos, cebola, ervilha, azeitona e mussarela.", img: IMG("photo-1593560708920-61dd98c46a4e"), tag: "" },
  { id: "pepperoni", nome: "Pepperoni", cat: "especial", desc: "Pepperoni crocante, mussarela e orégano.", img: IMG("photo-1534308983496-4fabb1a015ee"), tag: "Picante" },
  { id: "quatro-queijos", nome: "Quatro Queijos", cat: "especial", desc: "Mussarela, provolone, gorgonzola e parmesão.", img: IMG("photo-1571407970349-bc81e7e96d47"), tag: "" },
  { id: "bacon-cheddar", nome: "Bacon & Cheddar", cat: "especial", desc: "Bacon crocante, cheddar cremoso e cebolinha.", img: IMG("photo-1590947132387-155cc02f3212"), tag: "" },
  // Premium
  { id: "nero", nome: "Nero da Casa", cat: "premium", desc: "Massa de carvão vegetal, burrata, presunto parma e rúcula.", img: IMG("photo-1604382354936-07c5d9983bd3"), tag: "Assinatura" },
  { id: "costela", nome: "Costela BBQ", cat: "premium", desc: "Costela desfiada 12h, molho barbecue e cebola crispy.", img: IMG("photo-1594007654729-407eedc4be65"), tag: "Novidade" },
  { id: "camarao", nome: "Camarão", cat: "premium", desc: "Camarão salteado no alho, Catupiry e tomate-cereja.", img: IMG("photo-1588315029754-2dd089d39a1a"), tag: "" },
  // Doces
  { id: "chocolate", nome: "Chocolate c/ Morango", cat: "doce", desc: "Chocolate ao leite e morangos frescos.", img: IMG("photo-1605478371310-a9f1e96b4ff4"), tag: "" },
  { id: "romeu-julieta", nome: "Romeu & Julieta", cat: "doce", desc: "Goiabada cascão derretida com queijo minas.", img: IMG("photo-1601924582970-9238bcb495d9"), tag: "" },
];

const BORDAS = [
  { id: "sem", nome: "Sem borda recheada", preco: 0 },
  { id: "catupiry", nome: "Catupiry", preco: 9 },
  { id: "cheddar", nome: "Cheddar", preco: 9 },
  { id: "cream-cheese", nome: "Cream cheese", preco: 10 },
  { id: "chocolate", nome: "Chocolate", preco: 11 },
];

const BEBIDAS = [
  { id: "coca-2l", nome: "Coca-Cola 2L", preco: 15, icon: "🥤" },
  { id: "coca-lata", nome: "Coca-Cola lata 350ml", preco: 6.5, icon: "🥫" },
  { id: "coca-zero-2l", nome: "Coca-Cola Zero 2L", preco: 15, icon: "🥤" },
  { id: "guarana-2l", nome: "Guaraná Antarctica 2L", preco: 12, icon: "🥤" },
  { id: "guarana-lata", nome: "Guaraná lata 350ml", preco: 6, icon: "🥫" },
  { id: "suco", nome: "Suco natural 500ml", preco: 10, icon: "🧃" },
  { id: "agua", nome: "Água mineral 500ml", preco: 4, icon: "💧" },
  { id: "agua-gas", nome: "Água com gás 500ml", preco: 4.5, icon: "💧" },
];

const CAT_LABEL = { tradicional: "Tradicionais", especial: "Especiais", premium: "Premium", doce: "Doces" };

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
