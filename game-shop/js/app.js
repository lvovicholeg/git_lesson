(function () {
  "use strict";

  const PRODUCTS = window.PRODUCTS || [];
  const PAGE_SIZE = 12;
  const NEW_DAYS = 120; // скільки днів товар вважається «новинкою»
  const TODAY = new Date();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n) => n.toLocaleString("uk-UA").replace(/,/g, " ") + " ₴";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* приватний режим */ }
    }
  };

  // ---------- Стан ----------
  const state = {
    query: "",
    quick: "all",
    sort: "popular",
    priceMin: null,
    priceMax: null,
    stock: new Set(),
    condition: new Set(),
    genre: new Set(),
    lang: new Set(),
    age: new Set(),
    shown: PAGE_SIZE
  };
  let cart = store.get("pp_cart", {});       // { id: qty }
  let favs = new Set(store.get("pp_favs", [])); // [id]

  const isNew = (p) => {
    const d = new Date(p.release);
    const diff = (TODAY - d) / 86400000;
    return diff >= 0 && diff <= NEW_DAYS;
  };
  const discount = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

  // ---------- Обкладинка-заглушка (SVG) ----------
  function cover(p) {
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`;
    const [a, b] = p.colors || ["#2f5bff", "#8a5cff"];
    const words = p.title.toUpperCase().split(" ");
    const lines = [];
    words.forEach((w) => {
      const last = lines[lines.length - 1];
      if (last && (last + " " + w).length <= 11) lines[lines.length - 1] = last + " " + w;
      else lines.push(w);
    });
    const gid = "g" + p.id + Math.random().toString(36).slice(2, 6);
    const text = lines.slice(0, 3).map((l, i) =>
      `<text x="20" y="${300 - (lines.slice(0, 3).length - 1 - i) * 30}" font-family="Manrope, sans-serif" font-weight="800" font-size="26" fill="#fff">${esc(l)}</text>`
    ).join("");
    return `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.title)}">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      </defs>
      <rect width="240" height="320" fill="url(#${gid})"/>
      <circle cx="190" cy="90" r="70" fill="#fff" opacity=".08"/>
      <circle cx="40" cy="150" r="110" fill="#000" opacity=".12"/>
      <rect x="0" y="200" width="240" height="120" fill="#000" opacity=".25"/>
      ${text}
    </svg>`;
  }

  // ---------- Фільтрація ----------
  function filtered() {
    const q = state.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.genre.toLowerCase().includes(q)) return false;
      if (state.quick === "new" && !isNew(p)) return false;
      if (state.quick === "sale" && !p.oldPrice) return false;
      if (state.quick === "preorder" && p.stock !== "preorder") return false;
      if (state.quick === "used" && p.condition !== "used") return false;
      if (state.priceMin != null && p.price < state.priceMin) return false;
      if (state.priceMax != null && p.price > state.priceMax) return false;
      if (state.stock.size && !state.stock.has(p.stock)) return false;
      if (state.condition.size && !state.condition.has(p.condition)) return false;
      if (state.genre.size && !state.genre.has(p.genre)) return false;
      if (state.lang.size && !state.lang.has(p.lang)) return false;
      if (state.age.size && !state.age.has(String(p.age))) return false;
      return true;
    });

    const byStock = (p) => (p.stock === "out" ? 1 : 0); // відсутні — в кінець
    const sorters = {
      popular: (a, b) => b.rating - a.rating,
      new: (a, b) => b.release.localeCompare(a.release),
      cheap: (a, b) => a.price - b.price,
      expensive: (a, b) => b.price - a.price,
      discount: (a, b) => discount(b) - discount(a)
    };
    list.sort((a, b) => byStock(a) - byStock(b) || sorters[state.sort](a, b));
    return list;
  }

  // ---------- Рендер картки ----------
  function card(p) {
    const labels = [];
    if (p.oldPrice) labels.push(`<span class="label label--sale">−${discount(p)}%</span>`);
    if (p.stock === "preorder") labels.push(`<span class="label label--pre">Передзамовлення</span>`);
    else if (isNew(p)) labels.push(`<span class="label label--new">Новинка</span>`);
    if (p.condition === "used") labels.push(`<span class="label label--used">Б/в</span>`);

    const stockText = { in: "В наявності", preorder: "Реліз " + new Date(p.release).toLocaleDateString("uk-UA"), out: "Немає в наявності" }[p.stock];
    const inCart = !!cart[p.id];
    const fav = favs.has(p.id);

    return `<article class="card" data-id="${p.id}">
      <a href="#" class="card__media" aria-label="${esc(p.title)}">
        <div class="card__labels">${labels.join("")}</div>
        ${cover(p)}
      </a>
      <button class="card__fav ${fav ? "is-active" : ""}" data-action="fav" aria-label="В обране" aria-pressed="${fav}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.4 4 7.3 4c2 0 3.6 1.1 4.7 2.6C13.1 5.1 14.7 4 16.7 4 20.6 4 23 8 21.5 11.7 19.5 16.4 12 21 12 21z"/></svg>
      </button>
      <div class="card__body">
        <span class="card__platform">PlayStation 5</span>
        <a href="#" class="card__title">${esc(p.title)}</a>
        <div class="card__meta"><span>${esc(p.genre)}</span><span>${p.lang === "ua" ? "UA" : "EN"}</span><span>${p.age}+</span></div>
        <span class="stock stock--${p.stock}">${stockText}</span>
        <div class="card__bottom">
          <div class="price ${p.oldPrice ? "price--sale" : ""}">
            ${p.oldPrice ? `<span class="price__old">${fmt(p.oldPrice)}</span>` : ""}
            <span class="price__now">${fmt(p.price)}</span>
          </div>
          <button class="buy ${inCart ? "is-in-cart" : ""}" data-action="buy" ${p.stock === "out" ? "disabled" : ""}
            aria-label="${inCart ? "У кошику" : "Купити"}">
            ${inCart
              ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m5 12 5 5 9-10"/></svg>`
              : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/></svg>`}
          </button>
        </div>
      </div>
    </article>`;
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function render() {
    const list = filtered();
    const visible = list.slice(0, state.shown);
    $("#productGrid").innerHTML = visible.map(card).join("");
    $("#resultCount").textContent = `Знайдено ${list.length} ${plural(list.length, "товар", "товари", "товарів")}`;
    $("#emptyState").hidden = list.length > 0;
    $(".more").hidden = list.length <= state.shown;
    renderActiveTags();
    renderCounts();
  }

  // ---------- Активні фільтри ----------
  const LABELS = {
    stock: { in: "В наявності", preorder: "Передзамовлення" },
    condition: { new: "Новий", used: "Вживаний" },
    lang: { ua: "Українська", en: "Англійська" }
  };
  function renderActiveTags() {
    const tags = [];
    ["stock", "condition", "genre", "lang", "age"].forEach((key) => {
      state[key].forEach((v) => {
        const text = LABELS[key]?.[v] ?? (key === "age" ? v + "+" : v);
        tags.push(`<button class="tag" data-key="${key}" data-val="${esc(v)}">${esc(text)}</button>`);
      });
    });
    if (state.priceMin != null || state.priceMax != null) {
      tags.push(`<button class="tag" data-key="price">${state.priceMin ?? 0} – ${state.priceMax ?? "∞"} ₴</button>`);
    }
    if (state.query) tags.push(`<button class="tag" data-key="query">«${esc(state.query)}»</button>`);
    $("#activeFilters").innerHTML = tags.join("");
  }

  // ---------- Динамічні списки фільтрів ----------
  function buildFacet(containerId, name, values, labelFn = (v) => v) {
    $(containerId).innerHTML = values.map((v) =>
      `<label class="check"><input type="checkbox" name="${name}" value="${esc(v)}"><span>${esc(labelFn(v))}</span><em data-count="${name}:${esc(v)}"></em></label>`
    ).join("");
  }
  function renderCounts() {
    // Скільки товарів у кожному жанрі (без урахування самого фільтра жанру)
    const saved = new Set(state.genre);
    state.genre.clear();
    const base = filtered();
    saved.forEach((g) => state.genre.add(g));
    $$('[data-count^="genre:"]').forEach((el) => {
      const g = el.dataset.count.slice(6);
      el.textContent = base.filter((p) => p.genre === g).length;
    });
  }

  const genres = [...new Set(PRODUCTS.map((p) => p.genre))].sort((a, b) => a.localeCompare(b, "uk"));
  const ages = [...new Set(PRODUCTS.map((p) => p.age))].sort((a, b) => a - b).map(String);
  buildFacet("#genreList", "genre", genres);
  buildFacet("#ageList", "age", ages, (v) => v + "+");

  // ---------- Події: фільтри ----------
  $("#filters").addEventListener("change", (e) => {
    const input = e.target;
    if (input.type === "checkbox" && state[input.name]) {
      input.checked ? state[input.name].add(input.value) : state[input.name].delete(input.value);
      state.shown = PAGE_SIZE;
      render();
    }
  });

  let priceTimer;
  ["#priceMin", "#priceMax"].forEach((sel) => {
    $(sel).addEventListener("input", () => {
      clearTimeout(priceTimer);
      priceTimer = setTimeout(() => {
        const min = $("#priceMin").value, max = $("#priceMax").value;
        state.priceMin = min === "" ? null : Number(min);
        state.priceMax = max === "" ? null : Number(max);
        state.shown = PAGE_SIZE;
        render();
      }, 300);
    });
  });

  function resetAll() {
    ["stock", "condition", "genre", "lang", "age"].forEach((k) => state[k].clear());
    state.priceMin = state.priceMax = null;
    state.query = "";
    state.quick = "all";
    state.shown = PAGE_SIZE;
    $$("#filters input[type=checkbox]").forEach((i) => (i.checked = false));
    $("#priceMin").value = $("#priceMax").value = "";
    $("#searchInput").value = "";
    $$("#quickChips .chip").forEach((c) => c.classList.toggle("is-active", c.dataset.quick === "all"));
    render();
  }
  $("#resetFilters").addEventListener("click", resetAll);
  $("#emptyReset").addEventListener("click", resetAll);

  $("#activeFilters").addEventListener("click", (e) => {
    const tag = e.target.closest(".tag");
    if (!tag) return;
    const { key, val } = tag.dataset;
    if (key === "price") {
      state.priceMin = state.priceMax = null;
      $("#priceMin").value = $("#priceMax").value = "";
    } else if (key === "query") {
      state.query = "";
      $("#searchInput").value = "";
    } else {
      state[key].delete(val);
      const box = $(`#filters input[name="${key}"][value="${CSS.escape(val)}"]`);
      if (box) box.checked = false;
    }
    render();
  });

  $("#quickChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.quick = chip.dataset.quick;
    state.shown = PAGE_SIZE;
    $$("#quickChips .chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    render();
  });

  $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

  let searchTimer;
  $("#searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.query = e.target.value; state.shown = PAGE_SIZE; render(); }, 200);
  });

  $("#loadMore").addEventListener("click", () => { state.shown += PAGE_SIZE; render(); });

  // Мобільні фільтри
  const openFilters = (open) => {
    $("#filters").classList.toggle("is-open", open);
    $("#filtersBackdrop").classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  $("#filtersOpen").addEventListener("click", () => openFilters(true));
  $("#filtersClose").addEventListener("click", () => openFilters(false));
  $("#filtersBackdrop").addEventListener("click", () => openFilters(false));
  $("#applyFilters").addEventListener("click", () => openFilters(false));

  // Мега-меню
  const mega = $("#megaMenu");
  $("#catalogBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    mega.hidden = !mega.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!mega.hidden));
  });
  document.addEventListener("click", (e) => {
    if (!mega.hidden && !mega.contains(e.target)) {
      mega.hidden = true;
      $("#catalogBtn").setAttribute("aria-expanded", "false");
    }
  });

  // ---------- Кошик і обране ----------
  function saveCart() { store.set("pp_cart", cart); updateBadges(); renderCart(); }
  function updateBadges() {
    const count = Object.values(cart).reduce((s, q) => s + q, 0);
    $("#cartCount").textContent = count;
    $("#cartCount").dataset.zero = count === 0;
    $("#favCount").textContent = favs.size;
    $("#favCount").dataset.zero = favs.size === 0;
  }

  function renderCart() {
    const ids = Object.keys(cart);
    const box = $("#cartItems");
    if (!ids.length) {
      box.innerHTML = `<div class="drawer__empty">Кошик порожній 🎮</div>`;
      $("#cartTotal").textContent = fmt(0);
      $("#checkoutBtn").disabled = true;
      return;
    }
    let total = 0;
    box.innerHTML = ids.map((id) => {
      const p = PRODUCTS.find((x) => String(x.id) === id);
      if (!p) return "";
      const q = cart[id];
      total += p.price * q;
      return `<div class="cart-item" data-id="${p.id}">
        <div class="cart-item__img">${cover(p)}</div>
        <div>
          <div class="cart-item__title">${esc(p.title)}</div>
          <div class="cart-item__price">${fmt(p.price)}</div>
          <div class="qty"><button data-cart="dec" aria-label="Менше">−</button><span>${q}</span><button data-cart="inc" aria-label="Більше">+</button></div>
        </div>
        <button class="cart-item__remove" data-cart="remove">Видалити</button>
      </div>`;
    }).join("");
    $("#cartTotal").textContent = fmt(total);
    $("#checkoutBtn").disabled = false;
  }

  const openCart = (open) => {
    $("#cartDrawer").classList.toggle("is-open", open);
    $("#cartDrawer").setAttribute("aria-hidden", String(!open));
    $("#cartBackdrop").classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  $("#cartBtn").addEventListener("click", () => openCart(true));
  $("#cartClose").addEventListener("click", () => openCart(false));
  $("#cartBackdrop").addEventListener("click", () => openCart(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { openCart(false); openFilters(false); mega.hidden = true; }
  });

  $("#cartItems").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cart]");
    if (!btn) return;
    const id = btn.closest(".cart-item").dataset.id;
    const act = btn.dataset.cart;
    if (act === "inc") cart[id]++;
    if (act === "dec") cart[id]--;
    if (act === "remove" || cart[id] <= 0) delete cart[id];
    saveCart();
    render();
  });

  $("#checkoutBtn").addEventListener("click", () => {
    toast("Демо: тут буде сторінка оформлення замовлення");
  });

  $("#productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) {
      if (e.target.closest("a")) e.preventDefault(); // демо-посилання
      return;
    }
    const id = Number(btn.closest(".card").dataset.id);
    const p = PRODUCTS.find((x) => x.id === id);
    if (btn.dataset.action === "buy") {
      if (cart[id]) { openCart(true); return; }
      cart[id] = 1;
      saveCart();
      toast(`«${p.title}» додано в кошик`);
    } else if (btn.dataset.action === "fav") {
      favs.has(id) ? favs.delete(id) : favs.add(id);
      store.set("pp_favs", [...favs]);
      updateBadges();
      toast(favs.has(id) ? "Додано в обране" : "Прибрано з обраного");
    }
    render();
  });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 2200);
  }

  $("#year").textContent = TODAY.getFullYear();

  // ---------- Старт ----------
  updateBadges();
  renderCart();
  render();
})();
