/*
 * Ember & Oak — ordering interface logic.
 * Demonstrations only: category switching, search, filters, add-to-cart.
 * All state is client-side; replace cart actions with your Laravel flow later.
 */

import { MENU, CATEGORIES, BRANCHES } from "./menu-data.js";

const $ = (id) => document.getElementById(id);

const els = {
  header: $("siteHeader"),
  categoryRail: $("categoryRail"),
  searchInput: $("searchInput"),
  searchClear: $("searchClear"),
  vegToggle: $("vegToggle"),
  sortSelect: $("sortSelect"),
  resultsCount: $("resultsCount"),
  menuGrid: $("menuGrid"),
  emptyState: $("emptyState"),
  resetFilters: $("resetFilters"),
  cartButton: $("cartButton"),
  cartCount: $("cartCount"),
  cartDrawer: $("cartDrawer"),
  cartBackdrop: $("cartBackdrop"),
  cartClose: $("cartClose"),
  cartItems: $("cartItems"),
  cartEmpty: $("cartEmpty"),
  cartFoot: $("cartFoot"),
  cartTotal: $("cartTotal"),
  checkoutBtn: $("checkoutBtn"),
  toastStack: $("toastStack"),
  menuToggle: $("menuToggle"),
  mobileNav: $("mobileNav"),
  branchButton: $("branchButton"),
  branchMenu: $("branchMenu"),
  branchLabel: $("branchLabel"),
};

const state = {
  category: "all",
  search: "",
  vegOnly: false,
  sort: "featured",
  cart: new Map(), // id -> quantity
};

/* ============ Icons (reused while rendering) ============ */

const ICONS = {
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  leaf:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  drumstick:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.4 15.4 18 18l-.6 2.4a2 2 0 1 0 2.2 2.2L22 22l-1.4-1.4a2 2 0 1 0-2.2-2.2L16 17.8"/><path d="m15.4 15.4-2-2M8 3l5 5M5 8l5 5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="m8.5 8.5 3-3M5 8l3 3"/></svg>',
  plus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  grid:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/></svg>',
};

const money = (n) => `$${n.toFixed(2)}`;

/* ============ Category rail ============ */

function categoryCount(id) {
  if (id === "all") return MENU.length;
  return MENU.filter((item) => item.category === id).length;
}

function renderCategories() {
  els.categoryRail.innerHTML = CATEGORIES.map((cat) => {
    const thumb = cat.thumb
      ? `<img class="cat-thumb" src="${cat.thumb}" alt="" width="48" height="48" loading="lazy" />`
      : `<span class="cat-thumb cat-thumb-icon" aria-hidden="true">${ICONS.grid}</span>`;
    const selected = state.category === cat.id ? "true" : "false";
    return `
      <button type="button" class="category-pill${state.category === cat.id ? " is-active" : ""}"
              data-category="${cat.id}" role="tab" aria-selected="${selected}">
        ${thumb}
        <span class="cat-meta">
          <span class="cat-name">${cat.name}</span>
          <span class="cat-count">${categoryCount(cat.id)} items</span>
        </span>
      </button>`;
  }).join("");
}

function onCategoryChange(categoryId) {
  state.category = categoryId;
  renderCategories();
  renderMenu();
  // Keep the active pill in view on mobile rails.
  const active = els.categoryRail.querySelector(".is-active");
  if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

/* ============ Filtering / sorting ============ */

function getVisibleItems() {
  const term = state.search.trim().toLowerCase();
  let items = MENU.filter((item) => {
    const inCategory = state.category === "all" || item.category === state.category;
    const matchesTerm =
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term);
    const matchesVeg = !state.vegOnly || item.isVeg;
    return inCategory && matchesTerm && matchesVeg;
  });

  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    featured: (a, b) => b.featured - a.featured,
  };
  return items.slice().sort(sorters[state.sort] || sorters.featured);
}

/* ============ Menu grid ============ */

function dishCard(item) {
  const dietBadge = item.isVeg
    ? `<span class="diet-badge is-veg" title="Vegetarian">${ICONS.leaf}<span>Vegetarian</span></span>`
    : `<span class="diet-badge is-nonveg" title="Non-vegetarian">${ICONS.drumstick}<span>Non-veg</span></span>`;
  const inCart = state.cart.get(item.id) || 0;

  return `
    <article class="dish-card" data-id="${item.id}">
      <div class="dish-media">
        <img src="${item.image}" alt="${item.name}" width="400" height="300" loading="lazy" />
        <span class="prep-chip">${ICONS.clock}<span>${item.prepTime} min</span></span>
      </div>
      <div class="dish-body">
        <div class="dish-top">
          <h3 class="dish-name">${item.name}</h3>
          <span class="dish-rating" aria-label="Rated ${item.rating} out of 5">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.9 6.9-1z"/></svg>
            ${item.rating.toFixed(1)}
          </span>
        </div>
        <p class="dish-desc">${item.description}</p>
        <div class="dish-meta">${dietBadge}</div>
        <div class="dish-foot">
          <span class="dish-price">${money(item.price)}</span>
          <button type="button" class="btn-add${inCart ? " is-added" : ""}" data-add="${item.id}"
                  aria-label="Add ${item.name} to cart">
            ${inCart ? `<span class="btn-add-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>
                </span><span class="btn-add-count">${inCart} in cart</span>`
              : `${ICONS.plus}<span>Add to Cart</span>`}
          </button>
        </div>
      </div>
    </article>`;
}

function renderMenu() {
  const items = getVisibleItems();
  els.menuGrid.innerHTML = items.map(dishCard).join("");
  els.emptyState.hidden = items.length > 0;
  els.resultsCount.textContent = items.length === MENU.length
    ? `Showing all ${items.length} dishes`
    : `Showing ${items.length} of ${MENU.length} dishes`;
}

/* ============ Cart ============ */

function cartTotalQty() {
  let n = 0;
  state.cart.forEach((qty) => (n += qty));
  return n;
}

function cartTotalPrice() {
  let total = 0;
  state.cart.forEach((qty, id) => {
    const item = MENU.find((m) => m.id === id);
    if (item) total += item.price * qty;
  });
  return total;
}

function syncCartCount() {
  const n = cartTotalQty();
  els.cartCount.hidden = n === 0;
  els.cartCount.textContent = String(n);
}

function renderCart() {
  const entries = [...state.cart.entries()].map(([id, qty]) => {
    const item = MENU.find((m) => m.id === id);
    return item ? { item, qty } : null;
  }).filter(Boolean);

  els.cartEmpty.hidden = entries.length > 0;
  els.cartFoot.hidden = entries.length === 0;
  els.cartItems.hidden = entries.length === 0;

  els.cartItems.innerHTML = entries.map(({ item, qty }) => `
    <div class="cart-line" data-id="${item.id}">
      <img class="cart-line-img" src="${item.image}" alt="" width="56" height="56" loading="lazy" />
      <div class="cart-line-info">
        <span class="cart-line-name">${item.name}</span>
        <span class="cart-line-price">${money(item.price)}</span>
      </div>
      <div class="qty-stepper" aria-label="Quantity of ${item.name}">
        <button type="button" data-qty="-1" data-id="${item.id}" aria-label="Remove one ${item.name}">−</button>
        <span class="qty-value">${qty}</span>
        <button type="button" data-qty="1" data-id="${item.id}" aria-label="Add one ${item.name}">+</button>
      </div>
    </div>`).join("");

  els.cartTotal.textContent = money(cartTotalPrice());
  syncCartCount();
}

function addToCart(id) {
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  const item = MENU.find((m) => m.id === id);
  if (item) showToast(`${item.name} added to cart`);
  renderCart();
  renderMenu(); // refresh add-button state
}

function changeQty(id, delta) {
  const next = (state.cart.get(id) || 0) + delta;
  if (next <= 0) state.cart.delete(id);
  else state.cart.set(id, next);
  renderCart();
  renderMenu();
}

function openCart() {
  els.cartDrawer.hidden = false;
  els.cartBackdrop.hidden = false;
  requestAnimationFrame(() => {
    els.cartDrawer.classList.add("is-open");
    els.cartBackdrop.classList.add("is-visible");
  });
}

function closeCart() {
  els.cartDrawer.classList.remove("is-open");
  els.cartBackdrop.classList.remove("is-visible");
  setTimeout(() => {
    els.cartDrawer.hidden = true;
    els.cartBackdrop.hidden = true;
  }, 250);
}

/* ============ Toast ============ */

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>
    </span>${message}`;
  els.toastStack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

/* ============ Branch selector ============ */

function renderBranches() {
  els.branchMenu.innerHTML = BRANCHES.map(
    (b) => `<li role="option" aria-selected="${els.branchLabel.textContent === b.name}" data-branch="${b.id}">
      <span class="branch-name">${b.name}</span>
      <span class="branch-address">${b.address}</span>
    </li>`
  ).join("");
}

function toggleBranchMenu(force) {
  const open = force !== undefined ? force : els.branchMenu.hidden;
  els.branchMenu.hidden = !open;
  els.branchButton.setAttribute("aria-expanded", String(open));
}

/* ============ Mobile nav ============ */

function toggleMobileNav(force) {
  const open = force !== undefined ? force : els.mobileNav.hidden;
  els.mobileNav.hidden = !open;
  els.menuToggle.setAttribute("aria-expanded", String(open));
  els.menuToggle.classList.toggle("is-open", open);
}

/* ============ Events ============ */

function bindEvents() {
  els.categoryRail.addEventListener("click", (e) => {
    const pill = e.target.closest("[data-category]");
    if (pill) onCategoryChange(pill.dataset.category);
  });

  let debounceTimer;
  els.searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = els.searchInput.value;
      els.searchClear.hidden = state.search.length === 0;
      renderMenu();
    }, 150);
  });

  els.searchClear.addEventListener("click", () => {
    els.searchInput.value = "";
    state.search = "";
    els.searchClear.hidden = true;
    els.searchInput.focus();
    renderMenu();
  });

  els.vegToggle.addEventListener("change", () => {
    state.vegOnly = els.vegToggle.checked;
    renderMenu();
  });

  els.sortSelect.addEventListener("change", () => {
    state.sort = els.sortSelect.value;
    renderMenu();
  });

  els.resetFilters.addEventListener("click", () => {
    state.category = "all";
    state.search = "";
    state.vegOnly = false;
    els.searchInput.value = "";
    els.searchClear.hidden = true;
    els.vegToggle.checked = false;
    els.sortSelect.value = "featured";
    state.sort = "featured";
    renderCategories();
    renderMenu();
  });

  // Add-to-cart (delegated, survives re-render)
  els.menuGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(btn.dataset.add);
  });

  els.cartButton.addEventListener("click", openCart);
  els.cartClose.addEventListener("click", closeCart);
  els.cartBackdrop.addEventListener("click", closeCart);

  els.cartItems.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-qty]");
    if (btn) changeQty(btn.dataset.id, Number(btn.dataset.qty));
  });

  els.checkoutBtn.addEventListener("click", () => {
    showToast("Demo only — connect your ordering flow here");
  });

  document.querySelectorAll("[data-call-waiter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      toggleMobileNav(false);
      showToast("A waiter is on the way to your table");
    })
  );

  els.branchButton.addEventListener("click", () => toggleBranchMenu());
  els.branchMenu.addEventListener("click", (e) => {
    const option = e.target.closest("[data-branch]");
    if (!option) return;
    const branch = BRANCHES.find((b) => b.id === option.dataset.branch);
    if (branch) els.branchLabel.textContent = branch.name;
    renderBranches();
    toggleBranchMenu(false);
    showToast(`Switched to ${branch.name}`);
  });

  document.addEventListener("click", (e) => {
    if (!els.branchMenu.hidden && !e.target.closest("#branchSelect")) toggleBranchMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!els.cartDrawer.hidden) closeCart();
      if (!els.branchMenu.hidden) toggleBranchMenu(false);
      toggleMobileNav(false);
    }
  });

  els.menuToggle.addEventListener("click", () => toggleMobileNav());
  els.mobileNav.addEventListener("click", (e) => {
    if (e.target.closest(".mobile-link")) toggleMobileNav(false);
  });

  // Header shadow on scroll
  const onScroll = () => els.header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ============ Init ============ */

renderCategories();
renderBranches();
renderMenu();
renderCart();
bindEvents();
