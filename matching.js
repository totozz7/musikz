// Comparaison tolérante aux fautes entre une proposition et la bonne réponse.
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)|\[.*?\]/g, ' ')             // (feat. X), [Remastered]
    .replace(/\s[-–—]\s.*$/, ' ')                  // " - Remastered 2011", " - Générique"
    .replace(/\b(feat|ft|featuring)\b.*$/, ' ')
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/^(the|le|la|les|l) /, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Renvoie un score : 'ok', 'close' ou null
function match(guess, target) {
  const g = norm(guess), t = norm(target);
  if (!g || !t) return null;
  const gs = g.replace(/ /g, ''), ts = t.replace(/ /g, '');
  if (gs === ts) return 'ok';
  // les nombres doivent être exacts ("Les 4 Fantastiques" ≠ "Les 3 Fantastiques")
  const digits = (x) => (x.match(/\d+/g) || []).join(',');
  if (digits(t) && digits(g) !== digits(t) && !(` ${g} `).includes(` ${t} `)) return null;
  const tol = ts.length <= 3 ? 0 : ts.length <= 6 ? 1 : ts.length <= 12 ? 2 : Math.floor(ts.length * 0.2);
  const d = lev(gs, ts);
  if (d <= tol) return 'ok';
  // titre long : accepter le début s'il couvre au moins 65 % (ex. "bohemian rhapsody" pour "bohemian rhapsody remastered")
  if (gs.length >= 5 && ts.startsWith(gs) && gs.length >= ts.length * 0.65) return 'ok';
  // le joueur a tapé artiste + titre d'un coup : "queen bohemian rhapsody"
  if (ts.length >= 4 && gs.length > ts.length && (` ${g} `).includes(` ${t} `)) return 'ok';
  if (d <= tol + 2 && ts.length >= 5) return 'close';
  return null;
}

function artistVariants(name) {
  const parts = String(name).split(/\s*(?:,|&| et | and | x | feat\.? | ft\.? )\s*/i).filter(Boolean);
  return [name, ...(parts.length > 1 ? parts : [])];
}

function checkGuess(text, track) {
  const res = { artist: false, title: false, close: false };
  if (track.artist) for (const a of artistVariants(track.artist)) {
    const m = match(text, a); if (m === 'ok') res.artist = true; else if (m === 'close') res.close = true;
  }
  for (const t of [track.title, track.fullTitle, ...(track.alts || [])].filter(Boolean)) {
    const m = match(text, t); if (m === 'ok') res.title = true; else if (m === 'close') res.close = true;
  }
  return res;
}

module.exports = { checkGuess, norm, match };
