function formatDate(iso) {
  // iso: YYYY-MM-DD
  const [y,m,d] = iso.split("-").map(Number);
  const dt = new Date(y, m-1, d);
  return dt.toLocaleDateString(undefined, { weekday:"short", year:"numeric", month:"short", day:"numeric" });
}

async function loadSchedule() {
  const res = await fetch("./data/schedule.json");
  if (!res.ok) throw new Error("Failed to load schedule.json");
  return res.json();
}

function renderSchedule(items) {
  const root = document.getElementById("scheduleRoot");
  root.innerHTML = "";

  if (!items.length) {
    root.innerHTML = `<div class="notice">No locations posted yet. Check back soon.</div>`;
    return;
  }

  items
    .slice()
    .sort((a,b) => a.date.localeCompare(b.date))
    .forEach(ev => {
      const card = document.createElement("div");
      card.className = "card section";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-weight:900;font-size:18px">${formatDate(ev.date)}</div>
            <div class="muted">${ev.time || ""}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:800">${ev.location || ""}</div>
            ${ev.notes ? `<div class="small">${ev.notes}</div>` : `<div class="small">&nbsp;</div>`}
          </div>
        </div>
      `;
      root.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("scheduleStatus");
  try {
    const data = await loadSchedule();
    renderSchedule(data);
    status.textContent = "";
  } catch (e) {
    console.error(e);
    status.textContent = "Couldn’t load the schedule. Check data/schedule.json.";
  }
});
