import { addToCart, updateCartBadge, formatMoney } from "./app.js";

const FALLBACK_IMG = "./assets/menu/placeholder.png";

async function loadMenu() {
  const res = await fetch("./data/menu.json");
  if (!res.ok) throw new Error("Failed to load menu.json");
  return res.json();
}

function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "card item";

  // Image (placeholder for now)
  const thumb = document.createElement("div");
  thumb.className = "thumb";

  const img = document.createElement("img");
  img.className = "item-img";
  img.src = FALLBACK_IMG; // later: item.img || FALLBACK_IMG
  img.alt = item.name;
  img.loading = "lazy";
  img.addEventListener("error", () => {
    img.src = FALLBACK_IMG;
  });

  thumb.appendChild(img);

  // Body
  const body = document.createElement("div");
  body.className = "item-body";
  body.innerHTML = `
    <h3>${item.name}</h3>
    <p class="desc">${item.desc || ""}</p>
    <div class="row">
      <div class="price">${formatMoney(item.price)}</div>
      <button class="btn primary" data-add="${item.id}">Add to cart</button>
    </div>
    ${item.note ? `<div class="small" style="margin-top:10px">${item.note}</div>` : ""}
  `;

  card.appendChild(thumb);
  card.appendChild(body);

  // Add to cart
  card.querySelector("[data-add]").addEventListener("click", () => {
    addToCart({ id: item.id, name: item.name, price: item.price });
    updateCartBadge();
  });

  return card;
}

function renderMenu(data) {
  const root = document.getElementById("menuRoot");
  root.innerHTML = "";

  data.categories.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "card menu-cat";
    section.innerHTML = `<h2>${cat.name}</h2>`;

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "items";

    cat.items.forEach((item) => {
      itemsWrap.appendChild(createItemCard(item));
    });

    section.appendChild(itemsWrap);
    root.appendChild(section);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("menuStatus");

  try {
    const data = await loadMenu();
    renderMenu(data);
    status.textContent = "";
  } catch (e) {
    console.error(e);
    status.textContent = "Couldn’t load the menu. Check data/menu.json.";
  }
});
