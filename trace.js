export default async function handler(req, res) {

  const response = await fetch("https://hook.eu1.make.com/fw2lb6cqupenxbq2jmfq6p6669kcy7sp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();

  res.status(200).json(data);
}
