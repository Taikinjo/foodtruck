import { addToCart, updateCartBadge, formatMoney } from "./app.js";

async function loadMenu() {
  const res = await fetch("./data/menu.json");
  if (!res.ok) throw new Error("Failed to load menu.json");
  return res.json();
}

function renderMenu(data) {
  const root = document.getElementById("menuRoot");
  root.innerHTML = "";

  data.categories.forEach(cat => {
    const section = document.createElement("section");
    section.className = "card menu-cat";
    section.innerHTML = `<h2>${cat.name}</h2>`;

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "items";

    cat.items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card item";
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p class="desc">${item.desc || ""}</p>
        <div class="row">
          <div class="price">${formatMoney(item.price)}</div>
          <button class="btn primary" data-add="${item.id}">Add to cart</button>
        </div>
        ${item.note ? `<div class="small" style="margin-top:10px">${item.note}</div>` : ""}
      `;

      card.querySelector("[data-add]").addEventListener("click", () => {
        addToCart({ id: item.id, name: item.name, price: item.price });
        updateCartBadge();
      });

      itemsWrap.appendChild(card);
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
