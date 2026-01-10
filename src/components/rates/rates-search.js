export default function init({ rootId, dataUrl }) {
  const root = document.getElementById(rootId);
  if (!root) return;

  // allow dataUrl fallback from root's data attribute
  const dataUrlFinal =
    dataUrl || root.getAttribute("data-rates-url") || "/data/calls-voip.json";

  const input = root.querySelector(`#${rootId}-search`);
  const grid = root.querySelector(`#${rootId}-grid`);
  const noResults = root.querySelector(`#${rootId}-no-results`);

  async function loadData() {
    try {
      const res = await fetch(dataUrlFinal, { cache: "no-store" });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (e) {
      console.error("Failed to load rates data", e);
      return [];
    }
  }

  function createArticle(item) {
    const article = document.createElement("article");
    article.className = "p-4 rounded-lg border bg-slate-800 text-white";
    const operatorText = item.operator ? "Operador: " + item.operator : "";
    const typeText = item.type
      ? (item.operator ? " | " : "") + "Tipo: " + item.type
      : "";
    article.innerHTML =
      '<h4 class="font-semibold text-white">' +
      item.title +
      "</h4>" +
      '<div class="mt-2 text-lg font-bold text-white">' +
      item.price +
      "</div>" +
      (operatorText || typeText
        ? '<p class="mt-2 text-sm text-slate-200">' +
          operatorText +
          typeText +
          "</p>"
        : "") +
      '<div class="mt-4"><a class="btn text-primary decoration-white" href="/contact/es">Lo quiero!</a></div>';
    return article;
  }

  function render(list) {
    if (!grid) return;
    grid.innerHTML = "";
    list.forEach((i) => grid.appendChild(createArticle(i)));
  }

  function normalize(s) {
    return (s || "").toLowerCase().trim();
  }
  function filterData(list, q) {
    const qn = normalize(q);
    return list.filter(
      (r) =>
        normalize(
          r.title + " " + r.operator + " " + r.type + " " + r.price,
        ).indexOf(qn) !== -1,
    );
  }

  // Initialize
  (async () => {
    const data = await loadData();
    // initial render: first 4
    render(data.slice(0, 4));

    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value || "";
      const matches = q.trim() === "" ? data.slice(0, 4) : filterData(data, q);
      render(matches);
      if (noResults)
        noResults.style.display =
          matches.length === 0 && q.trim() !== "" ? "block" : "none";
    });
  })();
}

export function autoInit() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-rates-url]").forEach((el) => {
    const rootId = el.id;
    const dataUrl = el.getAttribute("data-rates-url");
    try {
      init({ rootId, dataUrl });
    } catch (e) {
      console.error("init error", e);
    }
  });
}
