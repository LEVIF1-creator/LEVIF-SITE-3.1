export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const data = req.body;

  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    const path = "actualites.js";
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1. Lire le fichier actuel
    const getFile = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    let existingData = [];
    let sha = null;

    if (getFile.status === 200) {
      const file = await getFile.json();
      sha = file.sha;

      const decoded = Buffer.from(file.content, 'base64').toString('utf-8');

      const match = decoded.match(/window\.ACTUALITES\s*=\s*(\[.*\])/s);
      if (match) {
        existingData = JSON.parse(match[1]);
      }
    }

    // 2. Ajouter la nouvelle actu
    const newActu = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      date: data.date || new Date().toISOString().slice(0, 10)
    };

    const updated = [newActu, ...existingData].slice(0, 50);

    // 3. Recréer le fichier JS
    const newContent =
      "window.ACTUALITES = " +
      JSON.stringify(updated, null, 2) +
      ";";

    const encoded = Buffer.from(newContent).toString('base64');

    // 4. Envoyer à GitHub
    const updateFile = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: "update actualites",
        content: encoded,
        sha: sha || undefined
      })
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
