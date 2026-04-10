export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const data = req.body;

  console.log('Nouvelle actu reçue :', data);

  return res.status(200).json({
    success: true
  });
}
