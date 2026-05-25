const traceButton = document.getElementById("traceClickButton");
const traceCount = document.getElementById("traceCountNumber");

const TRACE_API_URL = "/api/trace";
const VISITOR_ID_KEY = "carickatVisitorIdV1";
const CLICKED_KEY = "carickatTraceClickedV3";

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

function setButtonClicked() {
  traceButton.innerText = "✓";
  traceButton.classList.add("trace-clicked");
  traceButton.disabled = true;
}

async function sendTraceClick() {
  if (!traceButton || !traceCount) return;

  if (localStorage.getItem(CLICKED_KEY) === "true") {
    setButtonClicked();
    return;
  }

  traceButton.disabled = true;
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

    const data = await response.json();

    if (data && data.count !== undefined) {
      traceCount.textContent = String(data.count).padStart(3, "0");
    }

    if (data && data.total !== undefined) {
      traceCount.textContent = String(data.total).padStart(3, "0");
    }

    localStorage.setItem(CLICKED_KEY, "true");
    setButtonClicked();

  } catch (error) {
    console.error("Erreur compteur trace :", error);
    traceButton.disabled = false;
    traceButton.innerText = "+1";
  }
}

traceButton.addEventListener("click", sendTraceClick);
