// Shared cart helpers + nav badge
const CART_KEY = "foodtruck_cart_v1";
const CURRENCY_SYMBOL = "$"; // change to "¥" if you want

export function getCurrency() {
  return CURRENCY_SYMBOL;
}

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

export function cartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(x => x.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
}

export function setQty(itemId, qty) {
  const cart = getCart().map(i => {
    if (i.id !== itemId) return i;
    return { ...i, qty };
  }).filter(i => i.qty > 0);
  saveCart(cart);
}

export function removeItem(itemId) {
  const cart = getCart().filter(i => i.id !== itemId);
  saveCart(cart);
}

export function calcTotal(cart) {
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

export function formatMoney(n) {
  return `${CURRENCY_SYMBOL}${n.toFixed(2)}`;
}

export function updateCartBadge() {
  const el = document.querySelector("[data-cart-badge]");
  if (!el) return;
  const count = cartCount();
  el.textContent = count;
  el.style.display = count > 0 ? "inline-flex" : "none";
}

// Highlight active nav link + initialize badge
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
});
