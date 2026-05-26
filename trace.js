document.addEventListener("DOMContentLoaded", () => {
  const traceButton = document.getElementById("traceClickButton");
  const traceCount = document.getElementById("traceCountNumber");

  if (!traceButton || !traceCount) {
    alert("Bouton compteur introuvable");
    return;
  }

  const TRACE_API_URL = "https://hook.eu1.make.com/fw2lb6cqupenxbq2jmfq6p6669kcy7sp";

  const VISITOR_ID_KEY = "carickatVisitorIdV2";
  const CLICKED_KEY = "carickatTraceClickedV4";

  function updateCount(total) {
    if (total === undefined || total === null || total === "") return;
    traceCount.textContent = String(total).padStart(3, "0");
  }

  async function loadCurrentTotal() {
    try {
      const response = await fetch(TRACE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "get_total",
          page: window.location.pathname,
          source: "page_load",
          user_agent: navigator.userAgent
        })
      });

      const data = await response.json();
      updateCount(data.total);

    } catch (error) {
      console.error("Erreur chargement total :", error);
    }
  }

  if (localStorage.getItem(CLICKED_KEY) === "true") {
    traceButton.innerText = "✓";
    traceButton.classList.add("trace-clicked");
    traceButton.disabled = true;
  }

  function getVisitorId() {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);

    if (!visitorId) {
      visitorId =
        "visitor_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2);

      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    return visitorId;
  }

  traceButton.addEventListener("click", async () => {
    if (localStorage.getItem(CLICKED_KEY) === "true") {
      traceButton.innerText = "✓";
      traceButton.classList.add("trace-clicked");
      traceButton.disabled = true;
      return;
    }

    traceButton.innerText = "...";

    try {
      const response = await fetch(TRACE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "click",
          visitor_id: getVisitorId(),
          page: window.location.pathname,
          source: "trace_button",
          user_agent: navigator.userAgent
        })
      });

      const data = await response.json();

      updateCount(data.total);

      localStorage.setItem(CLICKED_KEY, "true");

      traceButton.innerText = "✓";
      traceButton.classList.add("trace-clicked");
      traceButton.disabled = true;

    } catch (error) {
      console.error("Erreur trace :", error);

      traceButton.innerText = "+1";
      traceButton.disabled = false;

      alert("Erreur : le webhook Make n'a pas été joint.");
    }
  });

  loadCurrentTotal();
});
