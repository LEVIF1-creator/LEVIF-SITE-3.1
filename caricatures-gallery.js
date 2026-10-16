/* KARIKAT — galerie pilotée par catalogue ; nouvelles oeuvres en premier. */
(() => {
  'use strict';

  const grid = document.getElementById('caricatures-grid');
  const moreRow = document.getElementById('caricatures-more-row');
  const moreButton = document.getElementById('caricatures-more');
  if (!grid || !moreRow || !moreButton) return;

  const PAGE_SIZE = 18;
  const IMAGE_NAME = /^caricature-[0-9]+\.(?:jpg|jpeg|png|webp|avif)$/i;
  let artworks = [];
  let shown = 0;

  function isDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  }

  function parseCatalogue(data) {
    if (!data || !Array.isArray(data.oeuvres) || data.oeuvres.length === 0) {
      throw new Error('Catalogue vide ou invalide.');
    }
    const ids = new Set();
    const images = new Set();
    return data.oeuvres.map((raw, index) => {
      if (!raw || typeof raw.id !== 'string' || !raw.id.trim() ||
          typeof raw.titre !== 'string' || !raw.titre.trim() ||
          typeof raw.image !== 'string' || !IMAGE_NAME.test(raw.image) ||
          (raw.date_publication != null && !isDate(raw.date_publication)) ||
          (raw.description != null && typeof raw.description !== 'string') ||
          (raw.alt != null && typeof raw.alt !== 'string') ||
          !Number.isSafeInteger(raw.ordre_ajout) || raw.ordre_ajout < 1 ||
          ids.has(raw.id) || images.has(raw.image)) {
        throw new Error(`Entrée ${index + 1} incorrecte / doublon. La galerie historique est conservée.`);
      }
      ids.add(raw.id);
      images.add(raw.image);
      return { ...raw, _index: index };
    }).sort((a, b) => {
      // date_publication = date de MISE EN LIGNE ; l'absence de date place les archives après les nouveautés.
      const dateDelta = String(b.date_publication || '').localeCompare(String(a.date_publication || ''));
      if (dateDelta) return dateDelta;
      if (a.date_publication && b.date_publication) return b.ordre_ajout - a.ordre_ajout;
      return a._index - b._index; // conserver l'ordre des 13 anciennes cartes.
    });
  }

  function cardFor(art, position) {
    const card = document.createElement('article');
    card.className = 'art-card carickat-reveal is-visible';
    card.dataset.artworkId = art.id;

    const image = document.createElement('img');
    image.src = `./${art.image}`;
    image.alt = art.alt || `Caricature originale Carickat — ${art.titre}`;
    image.loading = position < 4 ? 'eager' : 'lazy';
    image.decoding = 'async';

    const title = document.createElement('h3');
    title.textContent = art.titre;
    const meta = document.createElement('p');
    meta.className = 'art-meta';
    meta.textContent = art.description || '';

    card.append(image, title, meta);
    return card;
  }

  function showNext() {
    const batch = artworks.slice(shown, shown + PAGE_SIZE);
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < batch.length; i += 1) {
      fragment.appendChild(cardFor(batch[i], shown + i));
    }
    grid.appendChild(fragment);
    shown += batch.length;
    moreRow.hidden = shown >= artworks.length;
  }

  moreButton.addEventListener('click', showNext);

  fetch('./caricatures.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      // Préparer/valider avant de supprimer les 13 cartes de secours inscrites dans le HTML.
      artworks = parseCatalogue(data);
      grid.replaceChildren();
      shown = 0;
      showNext();
    })
    .catch(error => {
      console.warn('[KARIKAT] Catalogue indisponible : cartes HTML d’origine conservées.', error);
      moreRow.hidden = true;
    });
})();
