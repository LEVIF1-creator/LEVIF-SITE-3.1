const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/fw2lb6cqupenxbq2jmfq6p6669kcy7sp";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      total: 0,
      message: "API trace active"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      total: 0,
      error: "Method not allowed"
    });
  }

  const action = req.body?.action || "";

  try {
    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body || {})
    });

    const rawText = await makeResponse.text();

    let makeData = null;

    try {
      makeData = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
      makeData = null;
    }

    if (makeData && makeData.success === true) {
      return res.status(200).json({
        success: true,
        total: makeData.total ?? 0,
        action: action
      });
    }

    return res.status(200).json({
      success: false,
      total: 0,
      action: action,
      error: "Make response invalid",
      make_status: makeResponse.status,
      make_raw: rawText
    });

  } catch (error) {
    return res.status(200).json({
      success: false,
      total: 0,
      action: action,
      error: "Make webhook unreachable"
    });
  }
}
