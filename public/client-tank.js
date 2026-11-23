// PLAYZUP — client « Tank Arena » : rendu Canvas 2D (carte pré-dessinée, eau/lave animées, chenilles, particules),
// interpolation des instantanés du serveur, clavier + souris, et deux joysticks tactiles sur téléphone.
(function () {
  const T = 50, W = 32, H = 20, WW = W * T, WH = H * T, VW = 1040, VH = 650; // VW × VH = zone visible (la caméra suit ton tank)
  let camX = 0, camY = 0, zoom = 1;
  const P = (id) => state?.players.find(p => p.id === id);
  const THEMES = {
    grass: { g: ['#5aa845', '#63b24c', '#539c40'], wall: '#7a8399', brick: '#b5562c', bush: ['#2f7a2a', '#3f9a36', '#57b84a'], dark: '#1b4a18' },
    desert: { g: ['#e3c07a', '#dcb56b', '#e9c988'], wall: '#9a7b52', brick: '#c98a4a', bush: ['#7a8f3a', '#93a84a', '#a9bd5a'], dark: '#8a6a3a', mud: '#c9a25a' },
    ice: { g: ['#e9f6ff', '#dbeefc', '#f4fbff'], wall: '#8aa4c0', brick: '#b8d4ec', bush: ['#3f7a6a', '#4f9a84', '#6ab89e'], dark: '#7aa0c4' },
    city: { g: ['#7d828c', '#757a84', '#868b95'], wall: '#4a4f5c', brick: '#a8573a', bush: ['#3a6a30', '#4a8a3c', '#5aa04a'], dark: '#3a3e48' },
    volcano: { g: ['#3d2c26', '#352620', '#46332b'], wall: '#2a2226', brick: '#6a3a2a', bush: ['#4a3a20', '#5a4a28', '#6a5a30'], dark: '#1a100c' },
    maze: { g: ['#2b3150', '#272c48', '#30365a'], wall: '#5a6aa8', brick: '#6a5aa8', bush: ['#2a6a5a', '#3a8a74', '#4aa08a'], dark: '#141830' },
    jungle: { g: ['#3e7a36', '#44843b', '#386f31'], wall: '#5a5040', brick: '#8a5a32', bush: ['#1f5a1c', '#2c7a26', '#3f9a32'], dark: '#163d12', mud: '#6a4a2a' },
    neon: { g: ['#140b2a', '#110926', '#180e32'], wall: '#2a1f4a', brick: '#5a2a7a', bush: ['#2a1a5a', '#3a2a7a', '#4a3a9a'], dark: '#05020f' },
    base: { g: ['#7d8a58', '#748150', '#869360'], wall: '#5a6048', brick: '#b8a878', bush: ['#3a5a28', '#4a6e32', '#5a823c'], dark: '#3a4228' },
    port: { g: ['#a08a6a', '#968062', '#aa9474'], wall: '#5a6070', brick: '#8a5a30', bush: ['#3a6a40', '#4a7a4a', '#5a8a5a'], dark: '#5a4a34' },
  };
  const PUI = { heal: ['❤️', '#ff3b5c'], shield: ['🛡️', '#3fa9ff'], speed: ['⚡', '#ffc21a'], power: ['🔥', '#ff6a1f'], cloak: ['👻', '#c9b8ff'] };
  let V = null, key = null, cv, ctx, bg, bgDirty = true, grid = null, hp = {}, snaps = [], offset = null, raf = 0, parts = [], decals = null, dctx, shake = 0;
  let inp = { mx: 0, my: 0, ax: 1, ay: 0, f: 0 }, keys = {}, mouse = { x: 0, y: 0, in: false, down: false }, joyL = null, joyR = null, lastSend = 0, rot = false, scale = 1, dpr = 1;
  let feed = [], myIdx = -1, lastHp = 100, deadUntil = 0, killer = null, stageK = null, endK = null, pickK = null, tread = {}, flames = {};
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ── structure ──
  function build() {
    $('#v-tank').innerHTML = `<div class="tk-room" id="tk-room">
      <div class="tk-head"><div class="tk-logo"><span>💥</span><b>TANK</b><em>ARENA</em></div><div class="tk-chips"><span id="tk-map"></span><span id="tk-clock"></span></div></div>
      <div class="tk-stage" id="tk-stage"><canvas id="tk-cv"></canvas>
        <div class="tk-hud" id="tk-hud"></div><div class="tk-feed" id="tk-feed"></div>
        <div class="tk-big hidden" id="tk-big"></div><div class="tk-dead hidden" id="tk-dead"></div>
        <div class="tk-joy l" id="tk-jl"><i></i></div><div class="tk-joy r" id="tk-jr"><i></i><b>🎯</b></div>
      </div>
      <div class="tk-pick hidden" id="tk-pick"></div>
      <div class="tk-pl" id="tk-pl"></div>
      <div class="tk-tools" id="tk-tools"></div>
      <div id="tk-end"></div></div>`;
    cv = $('#tk-cv'); ctx = cv.getContext('2d');
    bg = document.createElement('canvas'); bg.width = WW; bg.height = WH;
    decals = document.createElement('canvas'); decals.width = WW; decals.height = WH; dctx = decals.getContext('2d');
    wire(); resize();
  }
  function resize() {
    if (!cv) return;
    const st = $('#tk-stage'); if (!st) return;
    const w = st.clientWidth;
    rot = innerWidth < 700 && innerHeight > innerWidth * 1.15;
    const lw = rot ? VH : VW, lh = rot ? VW : VH;
    const h = Math.min(w * lh / lw, rot ? innerHeight * .72 : innerHeight * .78);
    const cw = h * lw / lh;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.style.width = cw + 'px'; cv.style.height = h + 'px';
    cv.width = Math.round(cw * dpr); cv.height = Math.round(h * dpr);
    scale = cw / lw;
    st.classList.toggle('rot', rot);
  }
  addEventListener('resize', () => { if (V) resize(); });

  // ── carte pré-dessinée ──
  function th() { return THEMES[V?.map?.theme] || THEMES.grass; }
  function drawBg() {
    const b = bg.getContext('2d'), C = th(), theme = V.map.theme;
    b.clearRect(0, 0, WW, WH);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const x = c * T, y = r * T, s = r * W + c;
      b.fillStyle = C.g[Math.floor(rnd(s) * 3)]; b.fillRect(x, y, T, T);
      for (let k = 0; k < 6; k++) { b.fillStyle = rnd(s * 9 + k) > .5 ? '#ffffff10' : '#00000012'; b.fillRect(x + rnd(s + k) * T, y + rnd(s * 3 + k) * T, 3 + rnd(k + s) * 4, 2 + rnd(s - k) * 3); }
      if (theme === 'city' && (r % 6 === 3) && c % 2 === 0) { b.fillStyle = '#e8e2c855'; b.fillRect(x + 8, y + T / 2 - 2, 26, 4); }
      if (theme === 'neon') { b.strokeStyle = '#ff2e9a22'; b.lineWidth = 1; b.strokeRect(x + .5, y + .5, T - 1, T - 1); }
      if (theme === 'maze') { b.strokeStyle = '#5a6aa822'; b.strokeRect(x + 4.5, y + 4.5, T - 9, T - 9); }
      if (theme === 'volcano' && rnd(s * 7) > .7) { b.strokeStyle = '#ff5a0033'; b.lineWidth = 2; b.beginPath(); b.moveTo(x + rnd(s) * T, y); b.lineTo(x + rnd(s + 1) * T, y + T * .6); b.lineTo(x + rnd(s + 2) * T, y + T); b.stroke(); }
    }
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) staticTile(b, grid[r][c], c * T, r * T, r * W + c, C, theme);
    bgDirty = false;
  }
  function bevel(b, x, y, w, h, base, hi, lo) {
    b.fillStyle = lo; b.fillRect(x, y, w, h); b.fillStyle = hi; b.fillRect(x, y, w - 4, h - 4); b.fillStyle = base; b.fillRect(x + 4, y + 4, w - 8, h - 8);
  }
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, bl = n & 255; const f = (v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(r)},${f(g)},${f(bl)})`; }
  function staticTile(b, ch, x, y, s, C, theme) {
    if (ch === '#') {
      if (theme === 'jungle' || theme === 'desert') { b.fillStyle = shade(C.wall, -.3); b.beginPath(); b.arc(x + T / 2, y + T / 2 + 3, T * .48, 0, 7); b.fill(); b.fillStyle = C.wall; b.beginPath(); b.arc(x + T / 2 - 2, y + T / 2, T * .45, 0, 7); b.fill(); b.fillStyle = shade(C.wall, .25); b.beginPath(); b.arc(x + T / 2 - 8, y + T / 2 - 8, T * .16, 0, 7); b.fill(); return; }
      bevel(b, x, y, T, T, C.wall, shade(C.wall, .3), shade(C.wall, -.4));
      b.fillStyle = shade(C.wall, -.3); [[10, 10], [T - 10, 10], [10, T - 10], [T - 10, T - 10]].forEach(([a, c]) => { b.beginPath(); b.arc(x + a, y + c, 2.6, 0, 7); b.fill(); });
      if (theme === 'neon' || theme === 'maze') { b.strokeStyle = theme === 'neon' ? '#00f0ff' : '#9fb0ff'; b.lineWidth = 2; b.shadowColor = b.strokeStyle; b.shadowBlur = 10; b.strokeRect(x + 3, y + 3, T - 6, T - 6); b.shadowBlur = 0; }
    } else if (ch === 'i') {
      b.fillStyle = '#bfe6ffcc'; b.fillRect(x, y, T, T); b.strokeStyle = '#ffffffaa'; b.lineWidth = 2; b.beginPath(); b.moveTo(x + 8, y + T - 8); b.lineTo(x + 22, y + 10); b.moveTo(x + 26, y + T - 6); b.lineTo(x + 34, y + 24); b.stroke();
    } else if (ch === 'm') {
      b.fillStyle = C.mud || '#6a4a2a'; b.fillRect(x, y, T, T); b.fillStyle = '#00000022'; b.beginPath(); b.ellipse(x + 18, y + 20, 12, 7, 0, 0, 7); b.ellipse(x + 34, y + 34, 9, 5, 0, 0, 7); b.fill();
    } else if (ch === ',') { // gravats
      b.fillStyle = '#00000025'; b.fillRect(x + 2, y + 2, T - 4, T - 4);
      for (let k = 0; k < 9; k++) { b.fillStyle = k % 2 ? shade(C.brick, -.3) : shade(C.brick, .1); b.fillRect(x + rnd(s + k) * (T - 8), y + rnd(s * 2 + k) * (T - 8), 5 + rnd(k) * 5, 4 + rnd(k + 2) * 4); }
    } else if (ch === '_') { const gr = b.createRadialGradient(x + T / 2, y + T / 2, 2, x + T / 2, y + T / 2, T * .6); gr.addColorStop(0, '#000a'); gr.addColorStop(1, '#0000'); b.fillStyle = gr; b.fillRect(x - 10, y - 10, T + 20, T + 20); }
    else if ('1234'.includes(ch)) {
      b.fillStyle = '#0a0a1a'; b.beginPath(); b.arc(x + T / 2, y + T / 2, T * .46, 0, 7); b.fill();
      b.strokeStyle = '#7d4dff'; b.lineWidth = 3; b.shadowColor = '#b46bff'; b.shadowBlur = 12; b.beginPath(); b.arc(x + T / 2, y + T / 2, T * .4, 0, 7); b.stroke(); b.shadowBlur = 0;
    }
  }
  // tuiles dessinées à chaque image (cassables, animées)
  function dynTiles(now) {
    const C = th(), theme = V.map.theme;
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = grid[r][c], x = c * T, y = r * T, k = r * W + c;
      if (ch === 'b') {
        const h = hp[k] ?? 3;
        ctx.fillStyle = shade(C.brick, -.45); ctx.fillRect(x, y, T, T);
        for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
          const bx = x + col * 17 - (row % 2 ? 8 : 0) + 1, by = y + row * 12.5 + 1;
          ctx.fillStyle = shade(C.brick, (rnd(k * 13 + row * 3 + col) - .5) * .25); ctx.fillRect(Math.max(x + 1, bx), by, Math.min(15, x + T - 1 - Math.max(x + 1, bx)), 10.5);
        }
        if (h < 3) { ctx.strokeStyle = '#000a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 10, y + 6); ctx.lineTo(x + 22, y + 22); ctx.lineTo(x + 18, y + 34); if (h < 2) { ctx.moveTo(x + 40, y + 8); ctx.lineTo(x + 30, y + 26); ctx.lineTo(x + 42, y + 44); } ctx.stroke(); }
      } else if (ch === 'o') {
        ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(x + T / 2 + 3, y + T / 2 + 5, 18, 18, 0, 0, 7); ctx.fill();
        const gr = ctx.createRadialGradient(x + 18, y + 16, 2, x + 25, y + 25, 22); gr.addColorStop(0, '#ff7a5a'); gr.addColorStop(.6, '#d8261f'); gr.addColorStop(1, '#7a0c0c');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x + T / 2, y + T / 2, 18, 0, 7); ctx.fill();
        ctx.strokeStyle = '#3a0505'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#ffc21a'; ctx.beginPath(); ctx.moveTo(x + 25, y + 13); ctx.lineTo(x + 35, y + 31); ctx.lineTo(x + 15, y + 31); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#000'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', x + 25, y + 30);
      } else if (ch === '~') {
        const gr = ctx.createLinearGradient(x, y, x + T, y + T); gr.addColorStop(0, '#2fa8e8'); gr.addColorStop(1, '#1766b8'); ctx.fillStyle = gr; ctx.fillRect(x, y, T, T);
        ctx.strokeStyle = '#ffffff44'; ctx.lineWidth = 2; ctx.beginPath();
        for (let w = 0; w < 2; w++) { const yy = y + 14 + w * 20, ph = now / 500 + c * .7 + r * .3 + w; ctx.moveTo(x + 4, yy + Math.sin(ph) * 3); ctx.quadraticCurveTo(x + T / 2, yy - 5 + Math.sin(ph + 1) * 3, x + T - 4, yy + Math.sin(ph + 2) * 3); }
        ctx.stroke();
        if (grid[r - 1]?.[c] !== '~') { ctx.fillStyle = '#ffffff55'; ctx.fillRect(x, y, T, 3); }
      } else if (ch === 'L') {
        const p = Math.sin(now / 300 + c + r * 1.3) * .5 + .5;
        const gr = ctx.createRadialGradient(x + T / 2, y + T / 2, 4, x + T / 2, y + T / 2, T * .75); gr.addColorStop(0, `rgb(255,${200 + p * 50},80)`); gr.addColorStop(.5, '#ff6a1f'); gr.addColorStop(1, '#b3201a'); ctx.fillStyle = gr; ctx.fillRect(x, y, T, T);
        const bt = (now / 900 + rnd(k)) % 1; ctx.fillStyle = `rgba(255,240,160,${1 - bt})`; ctx.beginPath(); ctx.arc(x + 10 + rnd(k) * 30, y + 10 + rnd(k + 1) * 30, 2 + bt * 5, 0, 7); ctx.fill();
      } else if (ch === 'B') {
        const p = Math.sin(now / 250 + k) * .5 + .5;
        ctx.fillStyle = '#1a0a3a'; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, T - 6, T - 6, 12); ctx.fill();
        ctx.strokeStyle = `rgb(255,${60 + p * 80},${180 + p * 50})`; ctx.lineWidth = 4; ctx.shadowColor = '#ff2e9a'; ctx.shadowBlur = 10 + p * 12; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#00f0ff99'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x + 10, y + 10, T - 20, T - 20, 6); ctx.stroke();
      } else if ('1234'.includes(ch)) {
        ctx.save(); ctx.translate(x + T / 2, y + T / 2); ctx.rotate(now / 400);
        for (let a = 0; a < 3; a++) { ctx.strokeStyle = ['#b46bff', '#7dfff0', '#ff7ae6'][a]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 8 + a * 6, a * 2, a * 2 + 3.5); ctx.stroke(); }
        ctx.restore();
      }
    }
  }
  function bushes(meT) {
    const C = th();
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      if (grid[r][c] !== '%') continue;
      const x = c * T, y = r * T, k = r * W + c;
      const inside = meT && Math.floor(meT.x / T) === c && Math.floor(meT.y / T) === r;
      ctx.globalAlpha = inside ? .45 : 1;
      for (let i = 0; i < 5; i++) {
        const bx = x + 8 + rnd(k * 5 + i) * 34, by = y + 8 + rnd(k * 7 + i) * 34, br = 13 + rnd(k + i) * 8;
        ctx.fillStyle = C.bush[0]; ctx.beginPath(); ctx.arc(bx + 2, by + 3, br, 0, 7); ctx.fill();
        ctx.fillStyle = C.bush[1]; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill();
        ctx.fillStyle = C.bush[2]; ctx.beginPath(); ctx.arc(bx - br * .3, by - br * .3, br * .45, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  // ── tanks ──
  const GUNDRAW = {
    std: (c) => { barrel(c, 0, 30, 9); }, heavy: (c) => { barrel(c, 0, 26, 16); c.fillStyle = '#0006'; c.fillRect(20, -9, 6, 18); },
    mg: (c) => { barrel(c, -5, 30, 5); barrel(c, 5, 30, 5); }, sniper: (c) => { barrel(c, 0, 44, 6); c.fillStyle = '#222'; c.fillRect(36, -5, 6, 10); },
    shotgun: (c) => { c.fillStyle = '#3a3a44'; c.beginPath(); c.moveTo(8, -7); c.lineTo(28, -12); c.lineTo(28, 12); c.lineTo(8, 7); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 2; c.stroke(); },
    ricochet: (c) => { barrel(c, 0, 32, 8); c.strokeStyle = '#00e5ff'; c.lineWidth = 3; c.beginPath(); c.arc(26, 0, 7, 0, 7); c.stroke(); },
    flame: (c) => { barrel(c, 0, 24, 8); c.fillStyle = '#ff6a1f'; c.beginPath(); c.arc(28, 0, 6, 0, 7); c.fill(); c.fillStyle = '#ffc21a'; c.fillRect(-14, -14, 10, 8); },
    missile: (c) => { c.fillStyle = '#4a4f5c'; c.fillRect(2, -12, 24, 24); c.strokeStyle = '#111'; c.lineWidth = 2; c.strokeRect(2, -12, 24, 24); c.fillStyle = '#ff3b5c'; [-6, 6].forEach(y => { c.beginPath(); c.arc(24, y, 4, 0, 7); c.fill(); }); },
  };
  function barrel(c, y, len, w) { c.fillStyle = '#2a2d36'; c.fillRect(6, y - w / 2 - 1.5, len + 2, w + 3); c.fillStyle = '#5a5f6e'; c.fillRect(6, y - w / 2, len, w); c.fillStyle = '#ffffff33'; c.fillRect(6, y - w / 2, len, w * .3); }
  function drawTank(t, info, now, me) {
    const col = info.color;
    ctx.save(); ctx.translate(t.x, t.y);
    // ombre
    ctx.fillStyle = '#0004'; ctx.beginPath(); ctx.ellipse(4, 6, 24, 20, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.rotate(t.a);
    const tr = (tread[info.pid] || 0);
    // chenilles
    [-1, 1].forEach(sd => {
      ctx.fillStyle = '#1c1e24'; ctx.beginPath(); ctx.roundRect(-22, sd * 14 - 6, 44, 12, 4); ctx.fill();
      ctx.fillStyle = '#3a3e48'; for (let i = 0; i < 7; i++) { const xx = -20 + ((i * 7 + tr) % 42); ctx.fillRect(xx, sd * 14 - 5, 3, 10); }
    });
    // caisse
    ctx.fillStyle = shade(col, -.35); ctx.beginPath(); ctx.roundRect(-19, -12, 38, 24, 6); ctx.fill();
    const gr = ctx.createLinearGradient(0, -12, 0, 12); gr.addColorStop(0, shade(col, .25)); gr.addColorStop(1, col);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(-17, -10, 34, 20, 5); ctx.fill();
    ctx.fillStyle = '#0003'; ctx.fillRect(10, -8, 4, 16);
    ctx.restore();
    // tourelle
    ctx.save(); ctx.rotate(t.ta);
    (GUNDRAW[info.gun] || GUNDRAW.std)(ctx);
    ctx.fillStyle = shade(col, -.4); ctx.beginPath(); ctx.arc(0, 0, 11.5, 0, 7); ctx.fill();
    ctx.fillStyle = shade(col, .1); ctx.beginPath(); ctx.arc(0, 0, 9.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffffff55'; ctx.beginPath(); ctx.arc(-3, -3, 3.5, 0, 7); ctx.fill();
    ctx.restore();
    // effets
    if (t.fl & 1) { ctx.strokeStyle = '#7fd0ff'; ctx.lineWidth = 3; ctx.globalAlpha = .55 + Math.sin(now / 120) * .25; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.stroke(); ctx.fillStyle = '#7fd0ff22'; ctx.fill(); ctx.globalAlpha = 1; }
    if (t.fl & 4) { ctx.shadowColor = '#ff3b1f'; ctx.shadowBlur = 20; ctx.strokeStyle = '#ff6a1f88'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 25, 0, 7); ctx.stroke(); ctx.shadowBlur = 0; }
    ctx.restore();
    // nom + vie
    const w = 44;
    ctx.fillStyle = '#000a'; ctx.beginPath(); ctx.roundRect(t.x - w / 2 - 1, t.y - 40, w + 2, 7, 3); ctx.fill();
    ctx.fillStyle = t.hp > 50 ? '#3dd68c' : t.hp > 25 ? '#ffc21a' : '#ff3b5c'; ctx.fillRect(t.x - w / 2, t.y - 39, w * t.hp / 100, 5);
    ctx.font = 'bold 14px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3.5; ctx.strokeStyle = '#000c';
    const label = (me ? '▼ ' : '') + info.name; ctx.strokeText(label, t.x, t.y - 45); ctx.fillStyle = me ? '#ffe14d' : '#fff'; ctx.fillText(label, t.x, t.y - 45);
    // fumée quand il est abîmé
    if (t.hp < 35 && Math.random() < .3) parts.push({ k: 'smoke', x: t.x + (Math.random() - .5) * 14, y: t.y + (Math.random() - .5) * 14, vx: (Math.random() - .5) * 10, vy: -20, life: 1.2, max: 1.2, r: 6 + Math.random() * 6 });
  }
  // ── obus ──
  const BCOL = { std: '#ffe14d', heavy: '#ff8a1f', mg: '#fff6a8', sniper: '#7dfff0', shotgun: '#ffd23f', ricochet: '#00e5ff', flame: '#ff6a1f', missile: '#ff3b5c' };
  function drawBullet(b, now) {
    const [, x, y, gun, a] = b;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    const c = BCOL[gun] || '#fff';
    if (gun === 'flame') {
      const f = flames[b[0]] = (flames[b[0]] || 0) + 1, r = 6 + Math.min(16, f * 1.3);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(.4, '#ffb23dcc'); gr.addColorStop(1, '#ff3b1f00'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    } else if (gun === 'sniper') {
      ctx.shadowColor = c; ctx.shadowBlur = 14; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(6, 0); ctx.stroke();
    } else if (gun === 'missile') {
      ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.roundRect(-10, -4, 18, 8, 4); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(13, 0); ctx.lineTo(8, 4); ctx.fill();
      ctx.fillStyle = '#ffb23d'; ctx.beginPath(); ctx.arc(-12, 0, 3 + Math.random() * 3, 0, 7); ctx.fill();
      if (Math.random() < .7) parts.push({ k: 'smoke', x: x - Math.cos(a) * 14, y: y - Math.sin(a) * 14, vx: 0, vy: 0, life: .8, max: .8, r: 5 });
    } else if (gun === 'heavy') {
      ctx.fillStyle = '#2a2d36'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(4, 0, 6, 5, 0, 0, 7); ctx.fill();
      ctx.shadowColor = c; ctx.shadowBlur = 12; ctx.strokeStyle = '#ff8a1f88'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-10, 0); ctx.stroke();
    } else {
      const r = gun === 'mg' || gun === 'shotgun' ? 3 : 5;
      ctx.shadowColor = c; ctx.shadowBlur = 10;
      const gr = ctx.createLinearGradient(-22, 0, 0, 0); gr.addColorStop(0, c + '00'); gr.addColorStop(1, c);
      ctx.strokeStyle = gr; ctx.lineWidth = r * 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(0, 0); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  // ── particules ──
  function boom(x, y, R, big) {
    shake = Math.max(shake, big ? 14 : 6);
    parts.push({ k: 'flash', x, y, life: .25, max: .25, r: R * 1.4 });
    parts.push({ k: 'ring', x, y, life: .45, max: .45, r: R });
    for (let i = 0; i < (big ? 26 : 12); i++) { const a = Math.random() * 7, v = 60 + Math.random() * 220; parts.push({ k: 'fire', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .5 + Math.random() * .4, max: .9, r: 8 + Math.random() * 12 }); }
    for (let i = 0; i < (big ? 14 : 6); i++) { const a = Math.random() * 7, v = 20 + Math.random() * 80; parts.push({ k: 'smoke', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 1.2 + Math.random(), max: 2, r: 10 + Math.random() * 14 }); }
    for (let i = 0; i < 10; i++) { const a = Math.random() * 7, v = 150 + Math.random() * 300; parts.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .4 + Math.random() * .3, max: .7 }); }
    dctx.fillStyle = '#0000003a'; dctx.beginPath(); dctx.arc(x, y, R * .7, 0, 7); dctx.fill();
  }
  function sparks(x, y, c = '#ffe14d', n = 6) { for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = 80 + Math.random() * 200; parts.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .25 + Math.random() * .2, max: .45, c }); } }
  function stepParts(dt) {
    for (const p of parts) { p.life -= dt; if (p.vx !== undefined) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .92; p.vy *= .92; } }
    parts = parts.filter(p => p.life > 0); if (parts.length > 900) parts.splice(0, parts.length - 900);
  }
  function drawParts(top) {
    for (const p of parts) {
      const k = p.life / p.max;
      if (top !== (p.k === 'text')) continue;
      if (p.k === 'smoke') { ctx.fillStyle = `rgba(60,60,70,${.35 * k})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.8 - k), 0, 7); ctx.fill(); }
      else if (p.k === 'fire') { const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); gr.addColorStop(0, `rgba(255,250,200,${k})`); gr.addColorStop(.4, `rgba(255,150,40,${k * .9})`); gr.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      else if (p.k === 'flash') { const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); gr.addColorStop(0, `rgba(255,255,255,${k})`); gr.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      else if (p.k === 'ring') { ctx.strokeStyle = `rgba(255,230,180,${k})`; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - k), 0, 7); ctx.stroke(); }
      else if (p.k === 'spark') { ctx.strokeStyle = p.c || '#ffe14d'; ctx.globalAlpha = k; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.stroke(); ctx.globalAlpha = 1; }
      else if (p.k === 'muzzle') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = k; ctx.fillStyle = '#fff6a8'; ctx.beginPath(); ctx.moveTo(0, -p.r * .5); ctx.lineTo(p.r * 1.6, 0); ctx.lineTo(0, p.r * .5); ctx.fill(); ctx.fillStyle = '#ffb23d'; ctx.beginPath(); ctx.arc(0, 0, p.r * .6, 0, 7); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
      else if (p.k === 'tp') { ctx.strokeStyle = `rgba(180,107,255,${k})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 40 * (1.3 - k), 0, 7); ctx.stroke(); }
      else if (p.k === 'text') { ctx.globalAlpha = Math.min(1, k * 2); ctx.font = `900 ${p.s || 16}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.strokeText(p.t, p.x, p.y - (1 - k) * 30); ctx.fillStyle = p.c || '#fff'; ctx.fillText(p.t, p.x, p.y - (1 - k) * 30); ctx.globalAlpha = 1; }
    }
  }
  // ── instantanés ──
  function onSnap(s) {
    if (!V || V.stage === 'over') return;
    const now = performance.now();
    const off = now - s.t; offset = offset === null ? off : Math.min(offset + .5, off); // horloge serveur ≈ la plus favorable
    snaps.push({ ...s, at: now }); if (snaps.length > 30) snaps.shift();
    events(s.e || []);
  }
  function events(ev) {
    for (const e of ev) {
      const k = e[0];
      if (k === 'shot') { const i = V.tanks.findIndex(t => t.pid === e[1]), t = cur()?.k?.[i]; if (t) { if (e[2] !== 'flame') parts.push({ k: 'muzzle', x: t.x + Math.cos(t.ta) * 36, y: t.y + Math.sin(t.ta) * 36, a: t.ta, life: .08, max: .08, r: e[2] === 'heavy' ? 18 : 11 }); }
        const S = { heavy: 'tkheavy', mg: 'tkmg', sniper: 'tksnipe', flame: 'tkflame', missile: 'tkmissile' }[e[2]] || 'tkshot';
        if (e[2] !== 'flame' || Math.random() < .25) sfx(S, e[1] === pid ? .55 : .3); }
      else if (k === 'hit') { const i = V.tanks.findIndex(t => t.pid === e[1]), t = cur()?.k?.[i]; if (t) { sparks(t.x, t.y, '#fff', 4); if (e[2] >= 5) parts.push({ k: 'text', t: '-' + e[2], x: t.x + (Math.random() - .5) * 20, y: t.y - 20, life: .8, max: .8, c: e[1] === pid ? '#ff5a6a' : '#ffe14d', s: e[2] > 30 ? 22 : 15 }); }
        if (e[1] === pid) { shake = Math.max(shake, 5); sfx('tkhit', .5); $('#tk-stage')?.classList.remove('hurt'); void $('#tk-stage')?.offsetWidth; $('#tk-stage')?.classList.add('hurt'); } else if (e[2] >= 5) sfx('tkhit', .2); }
      else if (k === 'boom') { boom(e[1], e[2], e[3], e[3] >= 80); sfx('tkboom', e[3] >= 80 ? .8 : .45); }
      else if (k === 'impact') { sparks(e[1], e[2], BCOL[e[3]]); }
      else if (k === 'bounce') { sparks(e[1], e[2], '#7dfff0', 4); sfx('tkbounce', .25); }
      else if (k === 'tile') { const r = Math.floor(e[1] / W), c = e[1] % W; if (e[3]) hp[e[1]] = e[3]; else { delete hp[e[1]]; grid[r][c] = e[2]; bgDirty = true; for (let i = 0; i < 10; i++) { const a = Math.random() * 7; parts.push({ k: 'spark', x: c * T + 25, y: r * T + 25, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, life: .5, max: .5, c: '#c98a4a' }); } } }
      else if (k === 'kill') {
        const v = V.tanks.find(t => t.pid === e[1]), by = V.tanks.find(t => t.pid === e[2]);
        boom(e[4], e[5], 90, true); sfx('tkboom', 1);
        feed.unshift({ at: Date.now(), html: by && by !== v ? `<b style="color:${by.color}">${esc(by.name)}</b> ${gunE(by.gun)} <b style="color:${v.color}">${esc(v.name)}</b>` : `<b style="color:${v?.color}">${esc(v?.name || '?')}</b> ${{ lave: '🌋', mine: '💣', baril: '🛢️' }[e[3]] || '💀'}` });
        feed = feed.slice(0, 5); drawFeed();
        if (e[1] === pid) { killer = by && by.pid !== pid ? by.name : null; deadUntil = Date.now() + 2600; sfx('buzzer', .4); }
        if (e[2] === pid && e[1] !== pid) { parts.push({ k: 'text', t: '💀 +1', x: e[4], y: e[5] - 30, life: 1.4, max: 1.4, c: '#ffe14d', s: 26 }); sfx('legend', .5); }
      }
      else if (k === 'tp') { parts.push({ k: 'tp', x: e[1], y: e[2], life: .5, max: .5 }, { k: 'tp', x: e[3], y: e[4], life: .5, max: .5 }); sfx('tktp', .4); }
      else if (k === 'pick') { const i = V.tanks.findIndex(t => t.pid === e[1]), t = cur()?.k?.[i]; if (t) parts.push({ k: 'text', t: { heal: '+50 ❤️', shield: 'BOUCLIER 🛡️', speed: 'TURBO ⚡', power: 'PUISSANCE 🔥', cloak: 'INVISIBLE 👻' }[e[2]], x: t.x, y: t.y - 30, life: 1.3, max: 1.3, c: PUI[e[2]][1], s: 16 }); if (e[1] === pid) sfx('tkpick', .6); }
      else if (k === 'shield') sparks(...(() => { const i = V.tanks.findIndex(t => t.pid === e[1]), t = cur()?.k?.[i]; return t ? [t.x, t.y, '#7fd0ff', 5] : [0, 0]; })());
      else if (k === 'mine') { const r = Math.floor(e[1] / W), c = e[1] % W; dctx.fillStyle = '#000a'; dctx.beginPath(); dctx.arc(c * T + 25, r * T + 25, 26, 0, 7); dctx.fill(); }
      else if (k === 'spawn') { const i = V.tanks.findIndex(t => t.pid === e[1]); setTimeout(() => { const t = cur()?.k?.[i]; if (t) parts.push({ k: 'tp', x: t.x, y: t.y, life: .6, max: .6 }); }, 120); }
    }
  }
  const gunE = (g) => V.guns[g]?.emoji || '💥';
  function unpack(s) { return { t: s.t, k: s.k.map(a => ({ x: a[0], y: a[1], a: a[2], ta: a[3], hp: a[4], alive: a[5], lives: a[6], fl: a[7], kills: a[8], v: a[9] })), b: s.b, p: s.p }; }
  let curCache = null;
  function cur() { return curCache; }
  function lerpAng(a, b, k) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; }
  function sample(now) {
    if (!snaps.length) return null;
    const rt = now - offset - 110; // on affiche avec ~110 ms de retard pour lisser
    let i = snaps.length - 1; while (i > 0 && snaps[i - 1].t > rt) i--;
    const s1 = snaps[i], s0 = snaps[i - 1] || s1;
    const k = s1.t === s0.t ? 1 : Math.max(0, Math.min(1.2, (rt - s0.t) / (s1.t - s0.t)));
    const A = unpack(s0), B = unpack(s1);
    const tanks = B.k.map((b, j) => { const a = A.k[j] || b; if (!b.alive || !a.alive) return b; return { ...b, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, a: lerpAng(a.a, b.a, k), ta: lerpAng(a.ta, b.ta, k) }; });
    // mon tank : position la plus récente (plus réactif), viseur local
    const last = unpack(snaps[snaps.length - 1]);
    if (myIdx >= 0 && last.k[myIdx]?.alive) { tanks[myIdx] = { ...last.k[myIdx], ta: Math.atan2(inp.ay, inp.ax) }; }
    const am = new Map(A.b.map(b => [b[0], b]));
    const bullets = B.b.map(b => { const a = am.get(b[0]); return a ? [b[0], a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, b[3], b[4], b[5]] : b; });
    return { k: tanks, b: bullets, p: B.p };
  }
  // ── boucle d'affichage ──
  let lastFrame = 0;
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (!V || !cv || !document.contains(cv)) return;
    const dt = Math.min(.05, (ts - (lastFrame || ts)) / 1000); lastFrame = ts;
    if (bgDirty && grid) drawBg();
    const S = sample(performance.now()) || (V.snap ? unpack(V.snap) : null);
    curCache = S;
    sendInput();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const sk = shake > .3 ? shake : 0; shake *= .88;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    if (rot) { ctx.translate(VH, 0); ctx.rotate(Math.PI / 2); }
    // caméra : suit mon tank (vivant), sinon vue d'ensemble de toute la carte
    const meNow = S && myIdx >= 0 ? S.k[myIdx] : null;
    if (meNow && meNow.alive && ['play', 'count'].includes(V.stage)) {
      zoom += (1 - zoom) * .12;
      const M = 110, tx = Math.max(-M, Math.min(WW - VW / zoom + M, meNow.x - VW / zoom / 2)), ty = Math.max(-M, Math.min(WH - VH / zoom + M, meNow.y - VH / zoom / 2));
      camX += (tx - camX) * .18; camY += (ty - camY) * .18;
    } else { zoom += (VW / WW - zoom) * .08; camX += (0 - camX) * .1; camY += (0 - camY) * .1; }
    ctx.scale(zoom, zoom); ctx.translate(-camX, -camY);
    if (sk) ctx.translate((Math.random() - .5) * sk, (Math.random() - .5) * sk);
    ctx.drawImage(bg, 0, 0); ctx.drawImage(decals, 0, 0);
    const now = performance.now();
    dynTiles(now);
    if (S) {
      // bonus
      for (const p of S.p || []) { const [, x, y, ty] = p, b = Math.sin(now / 250 + p[0]) * 3; ctx.save(); ctx.translate(x, y + b); ctx.fillStyle = PUI[ty][1] + '44'; ctx.beginPath(); ctx.arc(0, 0, 20 + Math.sin(now / 200) * 2, 0, 7); ctx.fill(); ctx.strokeStyle = PUI[ty][1]; ctx.lineWidth = 3; ctx.stroke(); ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(PUI[ty][0], 0, 1); ctx.textBaseline = 'alphabetic'; ctx.restore(); }
      const me = myIdx >= 0 ? S.k[myIdx] : null;
      // traces de chenilles
      S.k.forEach((t, i) => { if (!t.alive) return; const info = V.tanks[i]; if (!info) return; const prev = tread['p' + info.pid]; if (prev) { const d = Math.hypot(t.x - prev[0], t.y - prev[1]); tread[info.pid] = (tread[info.pid] || 0) + d * .7; if (d > 6) { dctx.save(); dctx.translate(t.x, t.y); dctx.rotate(t.a); dctx.fillStyle = '#00000014'; dctx.fillRect(-4, -20, 6, 8); dctx.fillRect(-4, 12, 6, 8); dctx.restore(); tread['p' + info.pid] = [t.x, t.y]; } } else tread['p' + info.pid] = [t.x, t.y]; });
      S.b.forEach(b => drawBullet(b, now));
      S.k.forEach((t, i) => {
        const info = V.tanks[i]; if (!info || !t.alive) return;
        const mine = i === myIdx;
        let alpha = 1;
        const near = me && me.alive && Math.hypot(me.x - t.x, me.y - t.y) < 130;
        if (!mine && (t.fl & 8) && !near) alpha = (t.fl & 64) ? .25 : 0;
        else if (!mine && (t.fl & 32) && !near && !(t.fl & 64)) alpha = 0; // caché dans un buisson
        if (mine && (t.fl & 8)) alpha = .45;
        if (t.fl & 16) alpha *= .45 + .45 * Math.sin(now / 60);
        if (alpha <= 0) return;
        ctx.globalAlpha = alpha; drawTank(t, info, now, mine); ctx.globalAlpha = 1;
        if ((t.fl & 2) && Math.random() < .5) parts.push({ k: 'spark', x: t.x - Math.cos(t.a) * 20, y: t.y - Math.sin(t.a) * 20, vx: -Math.cos(t.a) * 60, vy: -Math.sin(t.a) * 60, life: .3, max: .3, c: '#ffe14d' });
      });
      stepParts(dt); drawParts(false);
      bushes(me);
      // viseur
      if (me && me.alive && V.stage === 'play' && !('ontouchstart' in window && !mouse.in)) {
        const ax = me.x + Math.cos(Math.atan2(inp.ay, inp.ax)) * 90, ay = me.y + Math.sin(Math.atan2(inp.ay, inp.ax)) * 90;
        ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(me.x + Math.cos(me.ta) * 30, me.y + Math.sin(me.ta) * 30); ctx.lineTo(ax, ay); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(ax, ay, 7, 0, 7); ctx.stroke();
      }
      drawParts(true);
      hud(S);
      minimap(S);
    }
    // lumière d'ambiance
    if (V.map.theme === 'volcano' || V.map.theme === 'neon') { ctx.setTransform(1, 0, 0, 1, 0, 0); const gr = ctx.createRadialGradient(cv.width / 2, cv.height / 2, cv.width * .2, cv.width / 2, cv.height / 2, cv.width * .7); gr.addColorStop(0, '#0000'); gr.addColorStop(1, V.map.theme === 'neon' ? '#14003a66' : '#3a050055'); ctx.fillStyle = gr; ctx.fillRect(0, 0, cv.width, cv.height); }
  }
  // ── mini-carte (quand la caméra suit ton tank) ──
  function minimap(S) {
    if (zoom < .95) return;
    const w = 130 * (rot ? .8 : 1), h = w * WH / WW, sc = w / WW;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = cv.width / dpr, chh = cv.height / dpr;
    // si mon tank passe sous la mini-carte, elle devient transparente
    const me = S.k[myIdx]; let under = false;
    if (me && !rot) { const sx = (me.x - camX) * zoom * scale, sy = (me.y - camY) * zoom * scale; under = sx > cw - w - 40 && sy > chh - h - 40; }
    ctx.save();
    if (rot) { ctx.translate(cw - 8, chh - h - 8 - 120); } else ctx.translate(cw - w - 8, chh - h - 8);
    ctx.globalAlpha = under ? .18 : .8; ctx.fillStyle = '#000a'; ctx.fillRect(-3, -3, w + 6, h + 6);
    if (rot) { ctx.translate(0, 0); ctx.rotate(Math.PI / 2); }
    ctx.drawImage(bg, 0, 0, w, h);
    ctx.strokeStyle = '#fff8'; ctx.lineWidth = 1; ctx.strokeRect(camX * sc, camY * sc, VW * sc, VH * sc);
    S.k.forEach((t, i) => { if (!t.alive) return; const info = V.tanks[i]; if (!info) return; if (i !== myIdx && ((t.fl & 8) || ((t.fl & 32) && !(t.fl & 64)))) return; ctx.fillStyle = info.color; ctx.beginPath(); ctx.arc(t.x * sc, t.y * sc, i === myIdx ? 4 : 3, 0, 7); ctx.fill(); if (i === myIdx) { ctx.strokeStyle = '#fff'; ctx.stroke(); } });
    ctx.restore(); ctx.globalAlpha = 1;
  }
  // ── HUD ──
  let hudK = '';
  function hud(S) {
    const me = myIdx >= 0 ? S.k[myIdx] : null, info = V.tanks[myIdx];
    const k = me ? [me.hp, me.lives, me.fl & 15, me.kills, me.alive, V.stage].join(':') : 'spec';
    if (k !== hudK) {
      hudK = k;
      $('#tk-hud').innerHTML = me ? `<div class="tk-me" style="--c:${info.color}"><span class="tk-gun">${gunE(info.gun)}</span><div><div class="tk-hp"><i style="width:${me.hp}%"></i><b>${me.hp}</b></div><div class="tk-lives">${'❤️'.repeat(Math.max(0, me.lives))}${'🖤'.repeat(Math.max(0, V.lives - me.lives))}</div></div><span class="tk-k">💀 ${me.kills}</span>${['shield', 'speed', 'power', 'cloak'].map((n, i) => me.fl & (1 << [0, 1, 2, 3][i]) ? `<span class="tk-pu">${PUI[n][0]}</span>` : '').join('')}</div>` : '<div class="tk-me spec">👀 Spectateur</div>';
      $('#tk-stage').classList.toggle('low', !!(me && me.alive && me.hp < 30));
      lastHp = me?.hp ?? 100;
    }
    const d = $('#tk-dead');
    if (me && !me.alive && V.stage === 'play') {
      const out = me.lives <= 0;
      d.classList.remove('hidden');
      d.innerHTML = out ? `<b>💀 ÉLIMINÉ</b><small>${killer ? 'par ' + esc(killer) : ''} · tu regardes la fin de la bataille</small>` : `<b>💥 DÉTRUIT !</b><small>${killer ? 'par ' + esc(killer) + ' · ' : ''}retour dans ${Math.max(0, Math.ceil((deadUntil - Date.now()) / 1000))} s</small>`;
    } else d.classList.add('hidden');
    // scoreboard
    const sb = S.k.map((t, i) => ({ t, i, info: V.tanks[i] })).filter(x => x.info);
    const sk = sb.map(x => x.t.kills + ':' + x.t.lives + ':' + x.t.alive).join('|');
    if (sk !== drawScore.k) { drawScore.k = sk; $('#tk-pl').innerHTML = sb.sort((a, b) => (b.t.lives > 0) - (a.t.lives > 0) || b.t.kills - a.t.kills).map(x => `<span class="tk-pli ${x.t.lives <= 0 ? 'out' : ''} ${x.i === myIdx ? 'me' : ''}" style="--c:${x.info.color}"><i></i>${gunE(x.info.gun)} ${esc(x.info.name)} <b>💀${x.t.kills}</b> <small>${'❤'.repeat(Math.max(0, x.t.lives))}</small></span>`).join(''); }
  }
  function drawScore() {}
  function drawFeed() { $('#tk-feed').innerHTML = feed.filter(f => Date.now() - f.at < 6000).map(f => `<div>${f.html}</div>`).join(''); }
  setInterval(() => { if (V && $('#tk-feed')) drawFeed(); }, 1000);
  // ── commandes ──
  function wire() {
    const st = $('#tk-stage');
    const toWorld = (cx, cy) => { const r = cv.getBoundingClientRect(); let x = (cx - r.left) / scale, y = (cy - r.top) / scale; if (rot) { const t = x; x = y; y = VH - t; } return [x / zoom + camX, y / zoom + camY]; };
    cv.addEventListener('mousemove', (e) => { mouse.in = true; const [x, y] = toWorld(e.clientX, e.clientY); mouse.x = x; mouse.y = y; });
    cv.addEventListener('mousedown', (e) => { mouse.down = true; e.preventDefault(); });
    addEventListener('mouseup', () => { mouse.down = false; });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    // joysticks tactiles
    const joy = (el, side) => {
      let id = null, ox = 0, oy = 0;
      const move = (t) => { const dx = t.clientX - ox, dy = t.clientY - oy, l = Math.min(1, Math.hypot(dx, dy) / 50), a = Math.atan2(dy, dx); el.querySelector('i').style.transform = `translate(${Math.cos(a) * l * 40}px,${Math.sin(a) * l * 40}px)`; let vx = Math.cos(a) * l, vy = Math.sin(a) * l; if (rot) { const t2 = vx; vx = vy; vy = -t2; } if (side === 'l') joyL = { x: vx, y: vy }; else joyR = { x: vx, y: vy, f: l > .45 }; };
      el.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.changedTouches[0]; id = t.identifier; const r = el.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2; move(t); el.classList.add('on'); }, { passive: false });
      el.addEventListener('touchmove', (e) => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === id) move(t); }, { passive: false });
      const endT = (e) => { for (const t of e.changedTouches) if (t.identifier === id) { id = null; el.querySelector('i').style.transform = ''; el.classList.remove('on'); if (side === 'l') joyL = null; else joyR = joyR ? { ...joyR, f: false, x: joyR.x, y: joyR.y, rel: true } : null; } };
      el.addEventListener('touchend', endT); el.addEventListener('touchcancel', endT);
    };
    joy($('#tk-jl'), 'l'); joy($('#tk-jr'), 'r');
    if ('ontouchstart' in window) st.classList.add('touch');
  }
  addEventListener('keydown', (e) => { if (!V || V.stage !== 'play' || !$('#v-tank')?.classList.contains('active') || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return; keys[e.key.toLowerCase()] = 1; if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault(); });
  addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = 0; });
  addEventListener('blur', () => { keys = {}; mouse.down = false; });
  function sendInput() {
    if (!V || V.stage !== 'play' || myIdx < 0) return;
    const S = curCache, me = S?.k?.[myIdx];
    let mx = (keys.d || keys.arrowright ? 1 : 0) - (keys.q || keys.a || keys.arrowleft ? 1 : 0), my = (keys.s || keys.arrowdown ? 1 : 0) - (keys.z || keys.w || keys.arrowup ? 1 : 0);
    if (rot && (mx || my)) { const t = mx; mx = my; my = -t; }
    if (joyL) { mx = joyL.x; my = joyL.y; }
    let ax = inp.ax, ay = inp.ay, f = mouse.down || keys[' '] ? 1 : 0;
    if (mouse.in && me) { ax = mouse.x - me.x; ay = mouse.y - me.y; }
    if (joyR && (Math.abs(joyR.x) + Math.abs(joyR.y) > .05)) { ax = joyR.x; ay = joyR.y; f = joyR.f ? 1 : 0; if (joyR.rel) joyR = null; }
    else if (!mouse.in && (mx || my) && !joyR) { ax = mx; ay = my; } // sans souris : on vise devant soi
    const l = Math.hypot(ax, ay) || 1;
    const n = { mx: +mx.toFixed(2), my: +my.toFixed(2), ax: +(ax / l).toFixed(3), ay: +(ay / l).toFixed(3), f };
    const now = performance.now();
    if (n.mx !== inp.mx || n.my !== inp.my || n.f !== inp.f || Math.abs(n.ax - inp.ax) + Math.abs(n.ay - inp.ay) > .02 || now - lastSend > 120) {
      if (now - lastSend > 33) { inp = n; lastSend = now; (socket.volatile || socket).emit('gi', n); }
    }
  }
  // ── écrans ──
  function render(v) {
    if (v.gameKey !== key) {
      key = v.gameKey; V = v; build(); snaps = []; offset = null; parts = []; feed = []; tread = {}; flames = {}; hudK = ''; drawScore.k = ''; endK = null; pickK = null; stageK = null;
      grid = v.grid.map(r => [...r]); hp = { ...v.hp }; bgDirty = true; dctx.clearRect(0, 0, WW, WH);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    }
    V = v; myIdx = v.tanks.findIndex(t => t.pid === pid);
    $('#tk-map').innerHTML = `${v.map.emoji} ${esc(v.map.name)}`;
    if (v.snap && !snaps.length) curCache = unpack(v.snap);
    if (v.stage !== stageK) {
      stageK = v.stage;
      if (v.stage === 'count') { big(['3', '2', '1', 'GO !']); sfx('swell', .5); }
      if (v.stage === 'play' || v.stage === 'count') setTimeout(resize, 30);
      if (v.stage === 'over') { grid = v.grid.map(r => [...r]); bgDirty = true; }
    }
    pick(v); clock(v); tools(v);
    if (v.stage === 'over') end(v); else $('#tk-end').innerHTML = '';
  }
  function big(seq) { const el = $('#tk-big'); el.classList.remove('hidden'); seq.forEach((s, i) => setTimeout(() => { el.innerHTML = `<b class="${s.length > 2 ? 'go' : ''}">${s}</b>`; sfx(s.length > 2 ? 'horn' : 'tick', s.length > 2 ? .4 : .9); if (i === seq.length - 1) setTimeout(() => el.classList.add('hidden'), 800); }, i * 800)); }
  let clockIv = null;
  function clock(v) {
    clearInterval(clockIv);
    const el = $('#tk-clock');
    if (v.stage === 'play' && v.time) { const end = Date.now() + v.left; const t = () => { const l = Math.max(0, end - Date.now()); el.textContent = '⏱️ ' + Math.floor(l / 60000) + ':' + String(Math.floor(l / 1000) % 60).padStart(2, '0'); el.classList.toggle('hot', l < 30000); }; t(); clockIv = setInterval(t, 500); }
    else if (v.stage === 'pick') { const end = Date.now() + v.left; const t = () => { el.textContent = '⏳ ' + Math.ceil(Math.max(0, end - Date.now()) / 1000) + ' s'; }; t(); clockIv = setInterval(t, 500); }
    else el.textContent = v.stage === 'over' ? '🏁 Terminé' : '';
  }
  function stat(G) {
    const dps = (G.dmg * (G.pellets || 1)) / G.rate, range = G.speed * G.life;
    return [['Dégâts', Math.min(1, (G.dmg * (G.pellets || 1)) / 65)], ['Cadence', Math.min(1, .12 / G.rate * 1.2 + .08)], ['Portée', Math.min(1, range / 1900)], ['Vitesse', Math.min(1, G.speed / 1500)], ['DPS', Math.min(1, dps / 80)]];
  }
  function pick(v) {
    const el = $('#tk-pick');
    $('#tk-stage').classList.toggle('hidden', v.stage === 'pick');
    if (v.stage !== 'pick') { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const me = v.tanks[myIdx];
    const k = JSON.stringify(v.tanks.map(t => [t.gun, t.ready]));
    if (k === pickK) return; pickK = k;
    el.innerHTML = `<div class="tk-pickbox"><h3>🎯 Choisis ton canon</h3><p class="muted">Carte : <b>${v.map.emoji} ${esc(v.map.name)}</b> — ${esc(v.map.desc)}</p>
      <div class="tk-guns">${Object.entries(v.guns).map(([id, G], i) => `<button class="tk-gunc ${me?.gun === id ? 'on' : ''}" data-g="${id}" style="--i:${i}"><canvas width="120" height="80" data-prev="${id}"></canvas><b>${G.emoji} ${esc(G.name)}</b><small>${esc(G.desc)}</small>
        <div class="tk-bars">${stat(G).map(([n, x]) => `<div><span>${n}</span><i><em style="width:${Math.round(x * 100)}%"></em></i></div>`).join('')}</div></button>`).join('')}</div>
      <div class="tk-pickfoot"><div class="tk-who">${v.tanks.map(t => `<span style="--c:${t.color}" class="${t.ready || t.bot ? 'ok' : ''}"><i></i>${esc(t.name)} ${t.gun ? v.guns[t.gun].emoji : '…'} ${t.ready || t.bot ? '✅' : ''}</span>`).join('')}</div>
        ${me ? `<button class="btn btn-primary" id="tk-ready" ${me.ready ? 'disabled' : ''}>${me.ready ? '✅ Prêt !' : '👍 Je suis prêt'}</button>` : ''}${isHost() ? '<button class="btn btn-yellow" id="tk-go">🚀 Lancer maintenant</button>' : ''}</div></div>`;
    $$('#tk-pick [data-g]').forEach(b => b.onclick = () => { gAct('gun', { gun: b.dataset.g }); sfx('pop', .5); });
    $('#tk-ready')?.addEventListener('click', () => { gAct('ready'); sfx('stamp', .5); });
    $('#tk-go')?.addEventListener('click', () => gAct('go'));
    // petits aperçus des tanks
    $$('#tk-pick canvas[data-prev]').forEach(c => { const g = c.getContext('2d'), save = ctx; ctx = g; g.translate(60, 42); g.scale(1.25, 1.25); drawTank({ x: 0, y: 0, a: 0, ta: -.35, hp: 100, fl: 0 }, { color: me?.color || '#ff3b5c', gun: c.dataset.prev, name: '', pid: 'x' }, 0, false); ctx = save; });
  }
  function tools(v) {
    $('#tk-tools').innerHTML = isHost() && v.stage === 'play' ? '<button class="btn btn-ghost btn-sm" id="tk-stop">⏹ Terminer la bataille</button>' : '';
    $('#tk-stop')?.addEventListener('click', () => { if (confirm('Terminer la bataille ?')) gAct('end'); });
  }
  function end(v) {
    if (endK === v.gameKey) return; endK = v.gameKey;
    const rk = v.ranking || [];
    $('#tk-end').innerHTML = `<div class="pz-end"><h2>💥 ${rk[0]?.pid === pid ? 'Dernier tank debout !' : rk[0] ? esc(rk[0].name) + ' gagne la bataille' : 'Fin'}</h2>
      ${podium(rk.filter(r => !r.bot).map(r => ({ pid: r.pid, pts: r.kills, unit: 'kills' })))}
      <table class="tk-tab"><tr><th></th><th>Tank</th><th>💀</th><th>☠️</th><th>💥</th></tr>${rk.map((r, i) => `<tr class="${r.pid === pid ? 'me' : ''}"><td>${i + 1}</td><td><i style="background:${r.color}"></i>${v.guns[r.gun]?.emoji || ''} ${esc(r.name)}</td><td>${r.kills}</td><td>${r.deaths}</td><td>${r.dmg}</td></tr>`).join('')}</table>
      ${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}${endBtns('tk')}</div>`;
    endWire('tk', rk.filter(r => !r.bot));
  }
  socket.on('tk', onSnap);
  window.TANK = { render };
})();
