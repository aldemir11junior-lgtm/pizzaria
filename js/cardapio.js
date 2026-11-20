/* =========================================================
   CARDÁPIO — montador de pizza, carrinho e envio p/ WhatsApp
   ========================================================= */
const CART_KEY = "fornoNero.cart";
const CLIENT_KEY = "fornoNero.cliente";

const build = { tamanho: null, sabores: [], borda: "sem" };
let cart = load(CART_KEY, []);
let filtroCat = "todas";

function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }
function save() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

const getTam = (id) => TAMANHOS.find((t) => t.id === id);
const getSabor = (id) => SABORES.find((s) => s.id === id);
const getBorda = (id) => BORDAS.find((b) => b.id === id);
const getBebida = (id) => BEBIDAS.find((b) => b.id === id);

// Preço da pizza = sabor mais caro no tamanho + borda
function precoPizza(tam, sabores, borda) {
  if (!tam || !sabores.length) return 0;
  const base = Math.max(...sabores.map((id) => PRECOS[getSabor(id).cat][tam]));
  return base + getBorda(borda).preco;
}
const fracao = (n) => (n === 1 ? "Inteira" : `1/${n}`);

/* ---------------- PASSO 1: tamanhos ---------------- */
function renderTamanhos() {
  $("#sizes").innerHTML = TAMANHOS.map((t, i) => {
    const d = 54 + i * 12;
    const min = Math.min(...Object.values(PRECOS).map((p) => p[t.id]));
    return `
      <button class="opt size ${build.tamanho === t.id ? "selected" : ""}" data-id="${t.id}" style="animation:fadeUp .5s ${i * 80}ms both">
        <span class="check">✓</span>
        <div class="s-wrap"><img class="s-circle" src="img/pizza-p1.jpg" alt="" width="${d}" height="${d}" style="width:${d}px;height:${d}px"></div>
        <strong>${t.nome}</strong>
        <small>${t.fatias} fatias · ${t.cm}cm</small>
        <small>até ${t.maxSabores} sabor${t.maxSabores > 1 ? "es" : ""}</small>
        <div class="s-from">a partir de ${brl(min)}</div>
      </button>`;
  }).join("");
}
$("#sizes").addEventListener("click", (e) => {
  const b = e.target.closest(".size");
  if (!b) return;
  build.tamanho = b.dataset.id;
  const max = getTam(build.tamanho).maxSabores;
  if (build.sabores.length > max) {
    build.sabores = build.sabores.slice(0, max);
    toast(`Esse tamanho aceita até ${max} sabor${max > 1 ? "es" : ""}. Ajustamos sua seleção.`);
  }
  renderTamanhos();
  updateAll();
  if (!build.sabores.length) setTimeout(() => $("#step2").scrollIntoView({ behavior: "smooth", block: "start" }), 250);
});

/* ---------------- PASSO 2: sabores ---------------- */
function renderSabores() {
  const lista = SABORES.filter((s) => filtroCat === "todas" || s.cat === filtroCat);
  const max = build.tamanho ? getTam(build.tamanho).maxSabores : 1;
  const cheio = build.sabores.length >= max && max > 1;
  $("#flavors").innerHTML = lista.map((s, i) => {
    const sel = build.sabores.includes(s.id);
    const preco = build.tamanho ? brl(PRECOS[s.cat][build.tamanho]) : `a partir de ${brl(PRECOS[s.cat].broto)}`;
    return `
      <button class="opt flavor ${sel ? "selected" : ""} ${cheio && !sel ? "disabled" : ""}" data-id="${s.id}" style="--i:${i}">
        <span class="check">✓</span>
        <img src="${s.img}" alt="" loading="lazy">
        <div>
          <h4>${s.nome}${s.tag ? `<span class="f-tag">${s.tag}</span>` : ""}</h4>
          <p>${s.desc}</p>
          <span class="f-price">${preco}</span>
        </div>
        ${sel && build.sabores.length > 1 ? `<span class="fraction">${fracao(build.sabores.length)}</span>` : ""}
      </button>`;
  }).join("");
}
$("#flavors").addEventListener("click", (e) => {
  const b = e.target.closest(".flavor");
  if (!b) return;
  const id = b.dataset.id;
  const max = getTam(build.tamanho).maxSabores;
  if (build.sabores.includes(id)) {
    build.sabores = build.sabores.filter((x) => x !== id);
  } else if (max === 1) {
    build.sabores = [id];
  } else if (build.sabores.length >= max) {
    toast(`Máximo de ${max} sabores para pizza ${getTam(build.tamanho).nome}. Desmarque um para trocar.`);
    return;
  } else {
    build.sabores.push(id);
  }
  updateAll();
});
$("#tabs").addEventListener("click", (e) => {
  const t = e.target.closest(".tab");
  if (!t) return;
  filtroCat = t.dataset.cat;
  $$(".tab").forEach((x) => x.classList.toggle("active", x === t));
  renderSabores();
});

/* ---------------- PASSO 3: bordas ---------------- */
function renderBordas() {
  $("#borders").innerHTML = BORDAS.map((b) => `
    <button class="opt border-opt ${build.borda === b.id ? "selected" : ""}" data-id="${b.id}">
      <span class="check">✓</span>
      <strong>${b.nome}</strong>
      <small>${b.preco ? "+ " + brl(b.preco) : "Grátis"}</small>
    </button>`).join("");
}
$("#borders").addEventListener("click", (e) => {
  const b = e.target.closest(".border-opt");
  if (!b) return;
  build.borda = b.dataset.id;
  renderBordas();
  updatePreview();
});

/* ---------------- Preview da pizza em montagem ---------------- */
function updatePreview() {
  const tam = build.tamanho && getTam(build.tamanho);
  const n = build.sabores.length;
  const mini = $("#miniPizza");
  mini.innerHTML = build.sabores.map((id, i) => {
    const step = 360 / n;
    const mask = n === 1 ? "none" : `conic-gradient(from ${i * step}deg, #000 0 ${step}deg, transparent ${step}deg)`;
    return `<div class="slice" style="background-image:url('${getSabor(id).img}');-webkit-mask:${mask};mask:${mask}"></div>`;
  }).join("");

  $("#ppTitle").textContent = tam ? `Pizza ${tam.nome} · ${tam.fatias} fatias` : "Sua pizza";
  const partes = [];
  if (n) partes.push(build.sabores.map((id) => (n > 1 ? fracao(n) + " " : "") + getSabor(id).nome).join(" + "));
  if (build.borda !== "sem") partes.push("Borda " + getBorda(build.borda).nome);
  $("#ppDesc").textContent = partes.join(" · ") || (tam ? "Agora escolha o(s) sabor(es)" : "Escolha tamanho e sabores");
  $("#ppPrice").textContent = brl(precoPizza(build.tamanho, build.sabores, build.borda));
  $("#addPizza").disabled = !(tam && n);
}

/* ---------------- Progresso e bloqueio de passos ---------------- */
function updateSteps() {
  const s1 = !!build.tamanho, s2 = build.sabores.length > 0;
  $("#step2").classList.toggle("locked", !s1);
  $("#step3").classList.toggle("locked", !s2);
  const pct = s2 ? 1 : s1 ? .5 : .1;
  $("#progressFill").style.transform = `scaleX(${pct})`;
  $$(".step-dot").forEach((d) => {
    const n = +d.dataset.step;
    d.classList.toggle("done", (n === 1 && s1) || (n === 2 && s2));
    d.classList.toggle("active", (n === 1 && !s1) || (n === 2 && s1 && !s2) || (n === 3 && s2));
  });
  const max = s1 ? getTam(build.tamanho).maxSabores : 0;
  $("#flavorHint").textContent = s1
    ? `${build.sabores.length}/${max} selecionado${max > 1 ? "s" : ""} · cobramos pelo sabor de maior valor`
    : "";
}

function updateAll() { renderSabores(); updateSteps(); updatePreview(); }

/* ---------------- Adicionar pizza ---------------- */
$("#addPizza").addEventListener("click", () => {
  const item = {
    uid: Date.now().toString(36),
    tipo: "pizza",
    tamanho: build.tamanho,
    sabores: [...build.sabores],
    borda: build.borda,
    obs: $("#pizzaObs").value.trim(),
    preco: precoPizza(build.tamanho, build.sabores, build.borda),
    qtd: 1,
  };
  cart.push(item);
  save();
  $("#miniPizza").classList.remove("spin"); void $("#miniPizza").offsetWidth; $("#miniPizza").classList.add("spin");
  toast("🍕 Pizza adicionada ao pedido!");
  // reinicia o montador mantendo o tamanho
  build.sabores = []; build.borda = "sem"; $("#pizzaObs").value = "";
  renderBordas(); updateAll(); renderCart();
  setTimeout(() => {
    if (confirmDrinks()) $("#bebidas").scrollIntoView({ behavior: "smooth" });
  }, 400);
});
const confirmDrinks = () => !cart.some((i) => i.tipo === "bebida");

/* ---------------- Bebidas ---------------- */
function qtdBebida(id) { return cart.find((i) => i.tipo === "bebida" && i.id === id)?.qtd || 0; }
function setBebida(id, qtd) {
  const idx = cart.findIndex((i) => i.tipo === "bebida" && i.id === id);
  if (qtd <= 0) { if (idx > -1) cart.splice(idx, 1); }
  else if (idx > -1) cart[idx].qtd = qtd;
  else cart.push({ uid: "b-" + id, tipo: "bebida", id, preco: getBebida(id).preco, qtd });
  save(); renderDrinks(); renderCart();
}
function renderDrinks() {
  $("#drinks").innerHTML = BEBIDAS.map((b, i) => {
    const q = qtdBebida(b.id);
    return `
      <div class="drink ${q ? "has" : ""}" style="animation:fadeUp .45s ${i * 50}ms both">
        <div class="d-info"><strong>${b.nome}</strong><small>${brl(b.preco)}</small></div>
        <div class="qty">
          <button data-drink="${b.id}" data-d="-1" aria-label="Remover ${b.nome}">−</button>
          <span>${q}</span>
          <button data-drink="${b.id}" data-d="1" aria-label="Adicionar ${b.nome}">+</button>
        </div>
      </div>`;
  }).join("");
}
$("#drinks").addEventListener("click", (e) => {
  const b = e.target.closest("[data-drink]");
  if (!b) return;
  const id = b.dataset.drink;
  setBebida(id, qtdBebida(id) + +b.dataset.d);
});

/* ---------------- Carrinho ---------------- */
const isEntrega = () => ($("input[name=tipo]:checked")?.value || "entrega") === "entrega";
function totais() {
  const subtotal = cart.reduce((s, i) => s + i.preco * i.qtd, 0);
  const taxa = cart.length && isEntrega() ? CONFIG.taxaEntrega : 0;
  return { subtotal, taxa, total: subtotal + taxa, itens: cart.reduce((s, i) => s + i.qtd, 0) };
}
function descPizza(i) {
  const n = i.sabores.length;
  const s = i.sabores.map((id) => (n > 1 ? fracao(n) + " " : "") + getSabor(id).nome).join(", ");
  return s + (i.borda !== "sem" ? ` · Borda ${getBorda(i.borda).nome}` : "") + (i.obs ? ` · Obs: ${i.obs}` : "");
}
function renderCart() {
  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = "";
  } else {
    // pizzas primeiro, depois bebidas
    const ordenado = [...cart].sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "pizza" ? -1 : 1));
    box.innerHTML = ordenado.map((i) => {
      const titulo = i.tipo === "pizza" ? `Pizza ${getTam(i.tamanho).nome}` : getBebida(i.id).nome;
      const desc = i.tipo === "pizza" ? `<span class="ci-desc">${descPizza(i)}</span>` : "";
      return `
        <div class="cart-item">
          <strong>${titulo}</strong>
          <span class="ci-price">${brl(i.preco * i.qtd)}</span>
          ${desc}
          <div class="ci-actions">
            <div class="qty">
              <button data-uid="${i.uid}" data-d="-1" aria-label="Diminuir">−</button>
              <span>${i.qtd}</span>
              <button data-uid="${i.uid}" data-d="1" aria-label="Aumentar">+</button>
            </div>
            <button class="ci-remove" data-remove="${i.uid}">remover</button>
          </div>
        </div>`;
    }).join("");
  }
  $("#cart").classList.toggle("vazio", !cart.length);
  const t = totais();
  $("#subtotal").textContent = brl(t.subtotal);
  $("#taxa").textContent = t.taxa ? brl(t.taxa) : (cart.length && !isEntrega() ? "Retirada" : "—");
  $("#total").textContent = brl(t.total);
  const minOk = t.subtotal >= CONFIG.pedidoMinimo;
  $("#goCheckout").disabled = !cart.length || !minOk;
  let warn = $(".min-warn");
  if (cart.length && !minOk) {
    if (!warn) { warn = document.createElement("p"); warn.className = "min-warn"; $("#goCheckout").before(warn); }
    warn.textContent = `Pedido mínimo: ${brl(CONFIG.pedidoMinimo)}`;
  } else if (warn) warn.remove();

  const cc = $("#cartCount");
  if (cc.textContent !== String(t.itens)) { cc.classList.remove("bump"); void cc.offsetWidth; cc.classList.add("bump"); }
  cc.textContent = t.itens;
  $("#mbCount").textContent = t.itens;
  $("#mbTotal").textContent = brl(t.total);
  $("#mobileBar").classList.toggle("show", aberta && cart.length > 0);
  renderCkSummary();
}
$("#cartItems").addEventListener("click", (e) => {
  const rem = e.target.closest("[data-remove]");
  const q = e.target.closest("[data-uid]");
  if (rem) cart = cart.filter((i) => i.uid !== rem.dataset.remove);
  else if (q) {
    const it = cart.find((i) => i.uid === q.dataset.uid);
    it.qtd += +q.dataset.d;
    if (it.qtd <= 0) cart = cart.filter((i) => i !== it);
  } else return;
  save(); renderCart(); renderDrinks();
});
$("#clearCart").addEventListener("click", () => {
  if (!cart.length || !confirm("Remover todos os itens do pedido?")) return;
  cart = []; save(); renderCart(); renderDrinks();
});

// Gaveta do carrinho no mobile
const openCart = () => { $("#cart").classList.add("open"); $("#backdrop").classList.add("show"); };
const closeCart = () => { $("#cart").classList.remove("open"); $("#backdrop").classList.remove("show"); };
$("#cartOpen").addEventListener("click", () => (innerWidth <= 1000 ? openCart() : $("#cart").scrollIntoView({ behavior: "smooth" })));
$("#mbOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#backdrop").addEventListener("click", closeCart);

/* ---------------- Checkout ---------------- */
const modal = $("#checkout");
const form = $("#ckForm");
function openCheckout() {
  closeCart();
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#nome").focus(), 300);
}
function closeCheckout() { modal.classList.remove("open"); document.body.style.overflow = ""; }
$("#goCheckout").addEventListener("click", openCheckout);
$("#ckClose").addEventListener("click", closeCheckout);
modal.addEventListener("click", (e) => { if (e.target === modal) closeCheckout(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCheckout(); closeCart(); } });

function renderCkSummary() {
  const t = totais();
  $("#ckSummary").innerHTML = `
    <div class="row"><span>${t.itens} ite${t.itens === 1 ? "m" : "ns"}</span><span>${brl(t.subtotal)}</span></div>
    <div class="row"><span>Entrega</span><span>${t.taxa ? brl(t.taxa) : "Retirada no balcão"}</span></div>
    <div class="row total"><span>Total</span><span>${brl(t.total)}</span></div>`;
}

// Entrega x retirada
form.addEventListener("change", (e) => {
  if (e.target.name === "tipo") {
    $("#enderecoBox").hidden = !isEntrega();
    renderCart();
  }
  if (e.target.name === "pagamento") updatePagamento();
});
function updatePagamento() {
  const p = $("input[name=pagamento]:checked").value;
  $("#trocoBox").hidden = p !== "Dinheiro";
  $("#cartaoInfo").hidden = !p.startsWith("Cartão");
  $("#pixInfo").textContent = p === "Pix" ? `Chave Pix: ${CONFIG.chavePix} · envie o comprovante no WhatsApp.` : "";
}

// Máscaras
$("#tel").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  e.target.value = v;
});
$("#cep").addEventListener("input", async (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 8);
  e.target.value = v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v;
  const hint = $("#cepHint");
  if (v.length !== 8) { hint.textContent = ""; return; }
  hint.textContent = "Buscando endereço...";
  try {
    const r = await fetch(`https://viacep.com.br/ws/${v}/json/`);
    const d = await r.json();
    if (d.erro) throw 0;
    $("#rua").value = d.logradouro || $("#rua").value;
    $("#bairro").value = d.bairro || $("#bairro").value;
    hint.textContent = `✓ ${d.localidade}/${d.uf}`;
    $("#numero").focus();
  } catch { hint.textContent = "CEP não encontrado, preencha manualmente."; }
});

// Lembra os dados do cliente neste aparelho
function restoreCliente() {
  const c = load(CLIENT_KEY, null);
  if (!c) return;
  ["nome", "tel", "cep", "rua", "numero", "bairro", "comp", "ref"].forEach((k) => { if (c[k]) $("#" + k).value = c[k]; });
}

function validar() {
  let ok = true;
  const obrig = ["nome", "tel"].concat(isEntrega() ? ["rua", "numero", "bairro"] : []);
  $$(".input", form).forEach((i) => i.classList.remove("invalid"));
  obrig.forEach((id) => {
    const el = $("#" + id);
    if (!el.value.trim()) { el.classList.add("invalid"); ok = false; }
  });
  if ($("#tel").value.replace(/\D/g, "").length < 10) { $("#tel").classList.add("invalid"); ok = false; }
  if (!ok) { toast("Preencha os campos obrigatórios destacados."); form.querySelector(".invalid")?.focus(); }
  return ok;
}

function montarMensagem() {
  const f = Object.fromEntries(new FormData(form));
  const t = totais();
  const num = Date.now().toString().slice(-5);
  const L = [];
  L.push(`*🍕 NOVO PEDIDO · ${CONFIG.nome.toUpperCase()}*`);
  L.push(`Pedido nº ${num}`);
  L.push("━━━━━━━━━━━━━━");

  const pizzas = cart.filter((i) => i.tipo === "pizza");
  const bebidas = cart.filter((i) => i.tipo === "bebida");
  if (pizzas.length) {
    L.push("*PIZZAS*");
    pizzas.forEach((p) => {
      const tam = getTam(p.tamanho);
      const n = p.sabores.length;
      L.push(`▪️ ${p.qtd}x Pizza ${tam.nome} (${tam.fatias} fatias) · ${brl(p.preco * p.qtd)}`);
      p.sabores.forEach((id) => L.push(`    ${n > 1 ? fracao(n) + " " : ""}${getSabor(id).nome}`));
      L.push(`    Borda: ${getBorda(p.borda).nome}`);
      if (p.obs) L.push(`    Obs: ${p.obs}`);
    });
  }
  if (bebidas.length) {
    L.push("", "*BEBIDAS*");
    bebidas.forEach((b) => L.push(`▪️ ${b.qtd}x ${getBebida(b.id).nome} · ${brl(b.preco * b.qtd)}`));
  }
  L.push("━━━━━━━━━━━━━━");
  L.push(`Subtotal: ${brl(t.subtotal)}`);
  L.push(`Entrega: ${t.taxa ? brl(t.taxa) : "Retirada no balcão"}`);
  L.push(`*TOTAL: ${brl(t.total)}*`);
  L.push("", "*👤 CLIENTE*", `Nome: ${f.nome.trim()}`, `Telefone: ${f.tel}`);

  if (isEntrega()) {
    L.push("", "*📍 ENDEREÇO DE ENTREGA*");
    L.push(`${f.rua.trim()}, ${f.numero.trim()}${f.comp.trim() ? " · " + f.comp.trim() : ""}`);
    L.push(`Bairro: ${f.bairro.trim()}${f.cep ? " · CEP " + f.cep : ""}`);
    if (f.ref.trim()) L.push(`Referência: ${f.ref.trim()}`);
  } else {
    L.push("", "*🏪 RETIRADA NO BALCÃO*");
  }

  L.push("", "*💳 PAGAMENTO*", f.pagamento);
  if (f.pagamento === "Dinheiro") {
    const troco = parseFloat(String(f.troco).replace(",", "."));
    if (troco > t.total) L.push(`Troco para ${brl(troco)} (levar ${brl(troco - t.total)})`);
    else L.push("Não precisa de troco");
  }
  if (f.pagamento === "Pix") L.push(`Chave: ${CONFIG.chavePix}`);
  if (f.obs.trim()) L.push("", "*📝 OBSERVAÇÕES*", f.obs.trim());
  return L.join("\n");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!aberta) return toast("Estamos fechados no momento. Horário: " + CONFIG.horario);
  if (!cart.length) return toast("Seu pedido está vazio.");
  if (!validar()) return;
  const f = Object.fromEntries(new FormData(form));
  localStorage.setItem(CLIENT_KEY, JSON.stringify(f));

  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(montarMensagem())}`;
  const win = window.open(url, "_blank");
  if (!win) location.href = url;

  cart = []; save(); renderCart(); renderDrinks(); closeCheckout();
  toast("✅ Pedido enviado! Confirme o envio no WhatsApp.", 4000);
});

/* ---------------- Status da loja ---------------- */
const paraMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
// Para testar fora do horário, abra o cardápio com ?teste na URL (ex.: cardapio.html?teste)
function lojaAberta() {
  if (new URLSearchParams(location.search).has("teste")) return true;
  const f = CONFIG.funcionamento, d = new Date(), min = d.getHours() * 60 + d.getMinutes();
  return !f.diasFechado.includes(d.getDay()) && min >= paraMin(f.abre) && min <= paraMin(f.fecha);
}
let aberta = true;
function statusLoja() {
  aberta = lojaAberta();
  $(".menu-layout").classList.toggle("fechado", !aberta);
  $("#avisoFechado").hidden = aberta;
  $("#mobileBar").classList.toggle("show", aberta && cart.length > 0);
}

/* ---------------- Inicialização ---------------- */
(function init() {
  // vindo da landing com ?sabor=xxx: pré-seleciona tamanho Grande + sabor
  const pre = new URLSearchParams(location.search).get("sabor");
  if (pre && getSabor(pre)) { build.tamanho = "grande"; build.sabores = [pre]; }
  // vindo com #tradicional, #premium...: abre a aba
  const hash = location.hash.slice(1);
  if (PRECOS[hash]) { filtroCat = hash; $$(".tab").forEach((x) => x.classList.toggle("active", x.dataset.cat === hash)); }

  renderTamanhos(); renderBordas(); renderDrinks(); updateAll(); renderCart();
  restoreCliente(); updatePagamento(); statusLoja();
  setInterval(statusLoja, 60000); // reavalia o horário a cada minuto
  if (pre) setTimeout(() => $("#step3").scrollIntoView({ behavior: "smooth", block: "center" }), 500);
})();
