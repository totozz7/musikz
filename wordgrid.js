// PlayZup — générateur de grilles de mots fléchés
// Chaque mot commence juste après une case « définition » (à gauche pour → , au-dessus pour ↓).
// Une case définition peut contenir deux définitions (une → et une ↓).
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function attempt(W, H, dict, maxLen) {
  const L = Array.from({ length: H }, () => Array(W).fill(null));      // lettres
  const C = Array.from({ length: H }, () => Array(W).fill(null));      // cases définition {h, v}
  const dirs = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ h: false, v: false })));
  const placed = [];
  const used = new Set();
  const inb = (r, c) => r >= 0 && c >= 0 && r < H && c < W;

  function check(word, r, c, d) {
    const [dr, dc] = d === 'h' ? [0, 1] : [1, 0];
    const cr = r - dr, cc = c - dc;                    // case définition
    if (!inb(cr, cc) || L[cr][cc] || (C[cr][cc] && C[cr][cc][d] != null)) return -1;
    const er = r + dr * word.length, ec = c + dc * word.length;  // case après le mot
    if (inb(er, ec) && L[er][ec]) return -1;
    let cross = 0;
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i, cc2 = c + dc * i;
      if (!inb(rr, cc2) || C[rr][cc2]) return -1;
      if (rr === cr && cc2 === cc) return -1;
      const ch = L[rr][cc2];
      if (ch) {
        if (ch !== word[i] || dirs[rr][cc2][d]) return -1;
        cross++;
      } else {
        // pas de lettre collée sur les côtés (sinon on créerait des mots involontaires)
        const [pr1, pc1, pr2, pc2] = d === 'h' ? [rr - 1, cc2, rr + 1, cc2] : [rr, cc2 - 1, rr, cc2 + 1];
        if ((inb(pr1, pc1) && L[pr1][pc1]) || (inb(pr2, pc2) && L[pr2][pc2])) return -1;
      }
    }
    return cross;
  }

  function place(entry, r, c, d) {
    const word = entry.word;
    const [dr, dc] = d === 'h' ? [0, 1] : [1, 0];
    const cr = r - dr, cc = c - dc;
    C[cr][cc] = C[cr][cc] || { h: null, v: null };
    C[cr][cc][d] = placed.length;
    for (let i = 0; i < word.length; i++) { L[r + dr * i][c + dc * i] = word[i]; dirs[r + dr * i][c + dc * i][d] = true; }
    placed.push({ entry, r, c, d, cr, cc });
    used.add(word);
  }

  const pool = dict.filter(e => e.word.length <= maxLen);
  // premier mot : horizontal, plutôt long, sur une ligne au hasard
  const firsts = shuffle(pool.filter(e => e.word.length >= Math.min(5, W - 2) && e.word.length <= W - 1));
  const f = firsts[0];
  if (!f) return null;
  const fr = 1 + Math.floor(Math.random() * (H - 2));
  const fc = 1 + Math.floor(Math.random() * (W - f.word.length));
  place(f, fr, fc, 'h');

  let fails = 0;
  while (fails < 60) {
    // on cherche, pour un lot de mots au hasard, toutes les positions qui croisent la grille
    const options = [];
    for (const e of shuffle([...pool]).slice(0, 120)) {
      if (used.has(e.word)) continue;
      const w = e.word;
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const ch = L[r][c]; if (!ch) continue;
        for (let k = 0; k < w.length; k++) {
          if (w[k] !== ch) continue;
          for (const d of ['h', 'v']) {
            if (dirs[r][c][d]) continue;
            const sr = d === 'h' ? r : r - k, sc = d === 'h' ? c - k : c;
            const x = check(w, sr, sc, d);
            if (x > 0) options.push({ e, r: sr, c: sc, d, x, score: x * 3 + w.length + Math.random() * 2 });
          }
        }
      }
      if (options.length > 40) break;
    }
    if (!options.length) { fails++; continue; }
    options.sort((a, b) => b.score - a.score);
    const o = options[Math.floor(Math.random() * Math.min(3, options.length))];
    place(o.e, o.r, o.c, o.d);
    fails = 0;
  }
  const letters = L.flat().filter(Boolean).length;
  return { L, C, placed, letters, density: letters / (W * H) };
}

// Génère plusieurs grilles et garde la plus remplie
function generateGrid(W, H, dict, { maxLen = 9, tries = 25, clue = 'easy' } = {}) {
  let best = null;
  for (let t = 0; t < tries; t++) {
    const g = attempt(W, H, dict, maxLen);
    if (g && (!best || g.letters + g.placed.length * 2 > best.letters + best.placed.length * 2)) best = g;
  }
  const { L, C, placed } = best;
  // mise à plat pour le client
  const cells = [], sol = {};
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const i = r * W + c;
    if (L[r][c]) { cells.push({ t: 'l' }); sol[i] = L[r][c]; }
    else if (C[r][c]) {
      const clues = [];
      if (C[r][c].h != null) clues.push({ dir: 'r', w: C[r][c].h });
      if (C[r][c].v != null) clues.push({ dir: 'd', w: C[r][c].v });
      cells.push({ t: 'c', clues });
    } else cells.push({ t: 'x' });
  }
  const words = placed.map(p => {
    const [dr, dc] = p.d === 'h' ? [0, 1] : [1, 0];
    return {
      dir: p.d === 'h' ? 'r' : 'd', len: p.entry.word.length, clue: p.cr * W + p.cc,
      cells: Array.from({ length: p.entry.word.length }, (_, k) => (p.r + dr * k) * W + (p.c + dc * k)),
      text: clue === 'hard' ? p.entry.hard : p.entry.easy, word: p.entry.word,
    };
  });
  for (const cell of cells) if (cell.t === 'c') cell.clues.forEach(cl => { cl.text = words[cl.w].text; });
  return { W, H, cells, words, sol };
}

module.exports = { generateGrid };
