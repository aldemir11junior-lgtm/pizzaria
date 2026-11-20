/* =========================================================
   Comportamentos compartilhados (landing + cardápio)
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Imagem reserva caso alguma foto externa não carregue
const FALLBACK_IMG = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#d98a0b"/><circle cx="50" cy="50" r="40" fill="#f5c26b"/><g fill="#c8321f"><circle cx="35" cy="35" r="7"/><circle cx="62" cy="30" r="6"/><circle cx="66" cy="60" r="7"/><circle cx="38" cy="65" r="6"/><circle cx="50" cy="48" r="5"/></g></svg>`
);
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName === "IMG" && img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
}, true);

function toast(msg, ms = 2600) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), ms);
}

// Revela elementos ao entrar na tela
function observeReveal(root = document) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        const el = en.target;
        el.classList.add("show");
        io.unobserve(el);
        // após a entrada, zera o atraso da cascata para hovers responderem na hora
        setTimeout(() => el.style.setProperty("transition-delay", "0s", "important"), 1400);
      }
    });
  }, { threshold: .15 });
  $$(".reveal, .reveal-left, .reveal-right", root).forEach((el) => io.observe(el));
}

// Animação 25 — Onda no clique
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".ripple, .btn");
  if (!btn || reduceMotion) return;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const wave = document.createElement("span");
  wave.className = "ripple-wave";
  wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  btn.appendChild(wave);
  setTimeout(() => wave.remove(), 650);
});

// Animação 24 — Inclinar em 3D (máx. 10°)
function enableTilt(selector) {
  if (reduceMotion || matchMedia("(hover: none)").matches) return;
  $$(selector).forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

// Animação 18 — Contador
function animateCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || "";
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("pt-BR") + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: .5 });
  $$(".counter").forEach((c) => io.observe(c));
}

document.addEventListener("DOMContentLoaded", () => {
  // Header encolhe ao rolar
  const header = $("#header");
  if (header) addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 40), { passive: true });

  // Menu mobile
  const nav = $("#nav"), toggle = $("#menuToggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.textContent = "☰"; }));
  }

  // Links de WhatsApp e infos do CONFIG
  $$(".js-wa-link").forEach((a) => {
    a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de fazer um pedido 🍕")}`;
  });
  $$(".js-horario").forEach((el) => (el.textContent = CONFIG.horario));
  const ano = $("#ano"); if (ano) ano.textContent = new Date().getFullYear();

  // Pizzas populares (landing) — painéis que expandem
  const grid = $("#popularGrid");
  if (grid) {
    const ids = ["calabresa", "margherita", "pepperoni", "quatro-queijos", "nero", "costela"];
    grid.innerHTML = ids.map((id, i) => {
      const s = SABORES.find((x) => x.id === id);
      const tagCls = s.tag === "Veggie" ? "veggie" : s.tag === "Assinatura" ? "gold" : "";
      return `
        <article class="p ${i === 0 ? "aberto" : ""}" tabindex="0" aria-label="Pizza ${s.nome}">
          <img src="${s.img}" alt="Pizza ${s.nome}" loading="lazy">
          <span class="rot">${s.nome}</span>
          <div class="info">
            ${s.tag ? `<span class="tag ${tagCls}">${s.tag}</span>` : ""}
            <h3>${s.nome}</h3>
            <p>${s.desc}</p>
            <div class="price"><small>a partir de</small>${brl(PRECOS[s.cat].broto)}</div>
            <a href="cardapio.html?sabor=${s.id}" class="btn btn-gold btn-sm">Pedir agora</a>
          </div>
        </article>`;
    }).join("");
    // Um painel abre e os outros cedem espaço: o JS só troca a classe, o CSS divide o espaço
    const paineis = $$(".p", grid);
    const abrir = (alvo) => paineis.forEach((o) => o.classList.toggle("aberto", o === alvo));
    paineis.forEach((p) => {
      p.addEventListener("click", () => abrir(p));
      p.addEventListener("mouseenter", () => abrir(p));
      p.addEventListener("focus", () => abrir(p));
    });
  }

  // Duplica depoimentos para a esteira ficar contínua
  $$(".testimonials .marquee-track").forEach((t) => (t.innerHTML += t.innerHTML));

  // Newsletter (demo)
  const news = $("#newsForm");
  if (news) news.addEventListener("submit", (e) => { e.preventDefault(); news.reset(); toast("🎉 Inscrição feita! Fique de olho no seu e-mail."); });

  // Destaca link do menu conforme a seção visível
  const links = $$(".nav a[href^='#']");
  if (links.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const sec = $(l.getAttribute("href")); if (sec) spy.observe(sec); });
  }

  // Pausa animações contínuas das seções que não estão visíveis (economiza CPU/GPU)
  const pausaIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.target.classList.toggle("offscreen", !en.isIntersecting));
  });
  $$(".hero, .menu-hero, .testimonials, .combos").forEach((el) => pausaIO.observe(el));

  observeReveal();
  animateCounters();
});
