import { getCart, setQty, removeItem, calcTotal, formatMoney } from "./app.js";

function formatOrderForEmail(cart, customerName, pickupTime, notes) {
  const lines = cart.map(i => `- ${i.qty} x ${i.name} (${formatMoney(i.price * i.qty)})`);
  const total = formatMoney(calcTotal(cart));
  return [
    `Customer: ${customerName}`,
    `Pickup time: ${pickupTime}`,
    notes ? `Notes: ${notes}` : "Notes: (none)",
    "",
    "Order:",
    ...lines,
    "",
    `Total: ${total}`,
    "Payment: Pay at truck"
  ].join("\n");
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById("cartList");
  const empty = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");

  list.innerHTML = "";

  if (cart.length === 0) {
    empty.style.display = "block";
    totalEl.textContent = formatMoney(0);
    return;
  }

  empty.style.display = "none";

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-line";

    row.innerHTML = `
      <div>
        <div class="name">${item.name}</div>
        <div class="small">${formatMoney(item.price)} each</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" data-minus>-</button>
        <div class="qty-pill">${item.qty}</div>
        <button class="qty-btn" data-plus>+</button>
        <button class="btn danger" data-remove style="padding:10px 12px">Remove</button>
      </div>
    `;

    row.querySelector("[data-minus]").addEventListener("click", () => setQty(item.id, item.qty - 1));
    row.querySelector("[data-plus]").addEventListener("click", () => setQty(item.id, item.qty + 1));
    row.querySelector("[data-remove]").addEventListener("click", () => removeItem(item.id));

    list.appendChild(row);
  });

  totalEl.textContent = formatMoney(calcTotal(cart));
}

function buildPickupOptions() {
  const select = document.getElementById("pickup_time");
  if (!select) return;

  // ASAP + next 3 hours, 15-min increments (local time)
  const now = new Date();
  const roundUp = (d) => {
    const ms = 15 * 60 * 1000;
    return new Date(Math.ceil(d.getTime() / ms) * ms);
  };

  const start = roundUp(now);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  select.innerHTML = "";
  const asap = document.createElement("option");
  asap.value = "ASAP (15–20 min)";
  asap.textContent = "ASAP (15–20 min)";
  select.appendChild(asap);

  for (let t = new Date(start); t <= end; t = new Date(t.getTime() + 15 * 60 * 1000)) {
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    const label = `${hh}:${mm}`;
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    select.appendChild(opt);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildPickupOptions();
  renderCart();

  // Re-render if cart changes in this tab
  window.addEventListener("storage", renderCart);

  const form = document.getElementById("orderForm");
  const status = document.getElementById("orderStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      status.textContent = "Your cart is empty.";
      return;
    }

    const customerName = form.customer_name.value.trim();
    const pickupTime = form.pickup_time.value.trim();
    const notes = form.notes.value.trim();

    const orderText = formatOrderForEmail(cart, customerName, pickupTime, notes);
    document.getElementById("order_details").value = orderText;

    status.textContent = "Sending order…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        localStorage.removeItem("foodtruck_cart_v1");
        status.textContent = "Order sent!";
        window.location.href = "./success.html";
      } else {
        status.textContent = "Couldn’t send order. Try again.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "Network error. Try again.";
    }
  });

  // Simple “clear cart” button
  document.getElementById("clearCart").addEventListener("click", () => {
    localStorage.removeItem("foodtruck_cart_v1");
    renderCart();
    document.getElementById("orderStatus").textContent = "";
  });
});
