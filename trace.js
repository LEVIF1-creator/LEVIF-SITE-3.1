document.addEventListener("DOMContentLoaded", () => {
  const traceButton = document.getElementById("traceClickButton");
  const traceCount = document.getElementById("traceCountNumber");

  if (!traceButton || !traceCount) {
    alert("Bouton compteur introuvable");
    return;
  }

  const TRACE_API_URL = "https://hook.eu1.make.com/fw2lb6cqupenxbq2jmfq6p6669kcy7sp";

  const VISITOR_ID_KEY = "carickatVisitorIdV1";
  const CLICKED_KEY = "carickatTraceClickedV3";
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
          visitor_id: getVisitorId(),
          page: window.location.pathname,
          source: "trace_button",
          user_agent: navigator.userAgent
        })
      });

      let data = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        data = {};
      }

      const total = data.total ?? data.count ?? null;

      if (total !== null) {
        traceCount.textContent = String(total).padStart(3, "0");
      } else {
        const current = parseInt(traceCount.textContent || "0", 10) || 0;
        traceCount.textContent = String(current + 1).padStart(3, "0");
      }

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
});
