let globalCount = 248;

export default async function handler(req, res) {
  if (req.method === "POST") {
    globalCount++;
  }

  res.status(200).json({
    count: globalCount
  });
}
