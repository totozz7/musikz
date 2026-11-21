// PLAYZUP — client « Mini-golf » : vue de dessus en SVG, eau qui ondule, vent, sable, glace, moulins, bumpers, portails,
// visée à la fronde (on tire en arrière), trajectoires rejouées depuis le serveur, balles fantômes des autres joueurs.
(function () {
  const P = (id) => state?.players.find(p => p.id === id);
  const EMOTES = ['👏', '😱', '😂', '🔥', '😭', '🐐', '🫣', '🏌️'];
  const NS = 'http://www.w3.org/2000/svg';
  let V = null, key = null, holeKey = null, off = 0, raf = 0, aim = null, played = {}, rot = false, lastFx = 0, ended = false, scoreShown = null, iv = 0;
  const now = () => Date.now() + off;
  const pts = (poly) => poly.map(p => p.join(',')).join(' ');
  const COLORS = ['#ff4d6d', '#4dabff', '#ffd23f', '#7dff8a', '#c77dff', '#ff9a3c', '#3cf0e0', '#ff7ae6'];
  const colOf = (p) => COLORS[Math.max(0, V.players.indexOf(p)) % COLORS.length];

  function build() {
    $('#v-golf').innerHTML = `
      <div class="gf-room" id="gf-room">
        <div class="gf-head">
          <div class="gf-logo"><span class="gf-flag">⛳</span>MINI<b>GOLF</b></div>
          <div class="gf-hud"><span id="gf-hole"></span><span id="gf-par"></span><span id="gf-time"></span><button class="btn btn-ghost btn-sm" id="gf-card">📋 Carte</button></div>
        </div>
        <div class="gf-me" id="gf-me"></div>
        <div class="gf-courtwrap" id="gf-wrap"><svg class="gf-svg" id="gf-svg"></svg><div class="gf-banner hidden" id="gf-banner"></div><div class="gf-help" id="gf-help">👆 Tire en arrière depuis n'importe où, puis lâche pour frapper !</div></div>
        <div class="gf-players" id="gf-players"></div>
        <div class="gf-tools"><div class="gf-emotes">${EMOTES.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div><button class="btn btn-ghost btn-sm hidden" id="gf-skip">⏭ Passer le trou</button><button class="btn btn-ghost btn-sm hidden" id="gf-stop">⏹ Terminer</button></div>
        <div class="gf-score hidden" id="gf-score"></div>
        <div id="gf-end"></div>
      </div>`;
    $$('#gf-room .gf-emotes button').forEach(b => b.onclick = () => gAct('emote', { e: b.dataset.e }));
    $('#gf-score').onclick = e => { if (e.target.id === 'gf-score') e.target.classList.add('hidden'); };
    $('#gf-card').onclick = () => { const s = $('#gf-score'); s.classList.toggle('hidden'); if (!s.classList.contains('hidden')) scorecard(V, true); };
    $('#gf-skip').onclick = () => { if (confirm('Passer au trou suivant ?')) gAct('skip'); };
    $('#gf-stop').onclick = () => { if (confirm('Terminer la partie ?')) gAct('end'); };
    const svg = $('#gf-svg');
    svg.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    holeKey = null;
  }

  // ───────── dessin du trou ─────────
  // thèmes : couleurs du gazon (g1/g2), du décor autour (bg + taches), et type de danger (eau / lave / vide)
  const THEMES = {
    garden: { g1: '#4caf3e', g2: '#56bd47', bg: '#1f5e2a', b1: '#28733a', b2: '#256b35', b3: '#2d7e3f', f1: '#ff7ab0', f2: '#fff6a0' },
    desert: { g1: '#7cb342', g2: '#89c34c', bg: '#e2b45e', b1: '#d6a24a', b2: '#ecc47a', b3: '#c99140', f1: '#a86b2d', f2: '#fff0c0' },
    beach: { g1: '#43b54a', g2: '#4fc457', bg: '#f3d68e', b1: '#ead08a', b2: '#fbe4a6', b3: '#e3c271', f1: '#ffffff', f2: '#ff9e7a' },
    snow: { g1: '#5fae7c', g2: '#6abb88', bg: '#e9f4ff', b1: '#d6e9f8', b2: '#ffffff', b3: '#c6def3', f1: '#9fd0ff', f2: '#ffffff' },
    jungle: { g1: '#2e9a3e', g2: '#37a948', bg: '#0f3d1d', b1: '#17592a', b2: '#13492a', b3: '#1f6e33', f1: '#ff5d8f', f2: '#ffcf3d' },
    candy: { g1: '#ff8fc8', g2: '#ff9fd3', bg: '#7b3fa0', b1: '#9450bd', b2: '#6c3590', b3: '#a865cf', f1: '#ffe14d', f2: '#7dffe6' },
    volcano: { g1: '#5f7f3b', g2: '#688a41', bg: '#2a1a14', b1: '#3b2418', b2: '#24150f', b3: '#4a2c1b', f1: '#ff6a1f', f2: '#ffb23d', haz: 'lava' },
    space: { g1: '#3c51b9', g2: '#465cc6', bg: '#0b0a2a', b1: '#15134a', b2: '#0f0d38', b3: '#1d1a5c', f1: '#ffffff', f2: '#c6a8ff', haz: 'void' },
    night: { g1: '#1d7a50', g2: '#22885a', bg: '#0d1630', b1: '#14224a', b2: '#0f1a3c', b3: '#1a2c5c', f1: '#7dfff0', f2: '#ff7ae6' },
    castle: { g1: '#4caf3e', g2: '#56bd47', bg: '#6f6f7c', b1: '#82828f', b2: '#5d5d69', b3: '#8e8e9b', f1: '#4a4a55', f2: '#a9a9b6' },
    felt: { g1: '#0f7d4c', g2: '#118452', bg: '#6b3a1c', b1: '#7d4521', b2: '#5c3117', b3: '#8a4f27', f1: '#a0642f', f2: '#4a2611' },
  };
  function drawHole(v) {
    const h = v.hole, svg = $('#gf-svg'), T = THEMES[h.theme] || THEMES.garden, haz = T.haz || 'water';
    rot = $('#gf-wrap').clientWidth < 560 && innerHeight > innerWidth;
    svg.setAttribute('viewBox', rot ? '0 0 600 1000' : '0 0 1000 600');
    $('#gf-wrap').classList.toggle('rot', rot);
    const id = (s) => `gf${s}`;
    const water = (h.water || []).map((p, i) => `<clipPath id="${id('wc' + i)}"><polygon points="${pts(p)}"/></clipPath>
        <polygon points="${pts(p)}" fill="url(#gfWater)" class="gf-water gf-${haz}"/>
        <g clip-path="url(#${id('wc' + i)})"><g class="gf-waves">${Array.from({ length: 14 }, (_, k) => `<path d="M-200 ${k * 45} q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" class="gf-wave" style="animation-delay:${-k * .7}s"/>`).join('')}</g>
        ${Array.from({ length: 6 }, (_, k) => `<circle cx="${p[0][0] + 40 + k * 70}" cy="${p[0][1] + 50 + (k % 3) * 60}" r="4" class="gf-glint" style="animation-delay:${k * .5}s"/>`).join('')}</g>
        <polygon points="${pts(p)}" class="gf-shore"/>`).join('');
    const islands = (h.islands || []).map(p => `<polygon points="${pts(p)}" class="gf-shoreland"/><polygon points="${pts(p)}" fill="url(#gfGrass)" class="gf-island"/>`).join('');
    const bridges = (h.bridges || []).map((p, i) => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); const a = p[0], b = p[1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      return `<clipPath id="${id('br' + i)}"><polygon points="${pts(p)}"/></clipPath><polygon points="${pts(p)}" class="gf-bridge ${haz}"/><g clip-path="url(#${id('br' + i)})"><g transform="translate(${(Math.min(...xs) + Math.max(...xs)) / 2} ${(Math.min(...ys) + Math.max(...ys)) / 2}) rotate(${Math.abs(ang) > 45 && Math.abs(ang) < 135 ? ang : 0})">${Array.from({ length: 40 }, (_, k) => `<line x1="${-400 + k * 20}" y1="-300" x2="${-400 + k * 20}" y2="300" class="gf-plank"/>`).join('')}</g></g><polygon points="${pts(p)}" class="gf-bridgeedge"/>`; }).join('');
    const slopes = (h.slopes || []).map((w, i) => { const xs = w.poly.map(p => p[0]), ys = w.poly.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const ang = Math.atan2(w.dir[1], w.dir[0]) * 180 / Math.PI; const big = Math.hypot(x1 - x0, y1 - y0);
      const rows = Math.ceil(big / 46) + 2, cols = Math.ceil(big / 60) + 2;
      return `<clipPath id="${id('sl' + i)}"><polygon points="${pts(w.poly)}"/></clipPath><polygon points="${pts(w.poly)}" class="gf-slope"/>
        <g clip-path="url(#${id('sl' + i)})"><g transform="translate(${(x0 + x1) / 2} ${(y0 + y1) / 2}) rotate(${ang})"><g class="gf-chev" style="animation-duration:${(700 / w.f).toFixed(2)}s">${Array.from({ length: rows * cols }, (_, k) => { const r = Math.floor(k / cols) - rows / 2, c = k % cols - cols / 2; return `<path d="M${c * 60 - 8} ${r * 46 - 12} l12 12 l-12 12" class="gf-chv"/>`; }).join('')}</g></g></g>`; }).join('');
    const sand = (h.sand || []).map(p => `<polygon points="${pts(p)}" fill="url(#gfSand)" class="gf-sand"/>`).join('');
    const ice = (h.ice || []).map((p, i) => `<clipPath id="${id('ic' + i)}"><polygon points="${pts(p)}"/></clipPath><polygon points="${pts(p)}" fill="url(#gfIce)" class="gf-ice"/><g clip-path="url(#${id('ic' + i)})"><rect x="-300" y="0" width="160" height="1000" class="gf-iceshine" transform="skewX(-25)"/>${Array.from({ length: 8 }, (_, k) => `<path d="M${p[0][0] + 60 + k * 85} ${p[0][1] + 30 + (k * 53) % 180} l14 6 l-6 10" class="gf-scratch"/>`).join('')}</g>`).join('');
    const wind = (h.wind || []).map((w, i) => { const xs = w.poly.map(p => p[0]), ys = w.poly.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const ang = Math.atan2(w.dir[1], w.dir[0]) * 180 / Math.PI;
      return `<clipPath id="${id('wd' + i)}"><polygon points="${pts(w.poly)}"/></clipPath><polygon points="${pts(w.poly)}" class="gf-windzone"/>
        <g clip-path="url(#${id('wd' + i)})"><g transform="translate(${(x0 + x1) / 2} ${(y0 + y1) / 2}) rotate(${ang})">${Array.from({ length: 22 }, (_, k) => `<line x1="0" y1="0" x2="${30 + (k % 4) * 14}" y2="0" class="gf-streak" style="--y:${((k * 37) % 100) - 50}%;--yy:${(((k * 53) % 260) - 130)}px;animation-delay:${-(k * .23)}s;animation-duration:${.9 + (k % 3) * .25}s"/>`).join('')}</g></g>
        <g transform="translate(${(x0 + x1) / 2} ${(y0 + y1) / 2}) rotate(${ang})" class="gf-windicon"><path d="M-30 -14 h40 l-10 -10 M-30 0 h55 l-10 -10 M-30 14 h40 l-10 10" /></g>`; }).join('');
    const boosts = (h.boosts || []).map(b => `<g transform="translate(${b.x} ${b.y}) rotate(${Math.atan2(b.dir[1], b.dir[0]) * 180 / Math.PI})" class="gf-boost"><rect x="-32" y="-26" width="64" height="52" rx="10"/>${[0, 1, 2].map(k => `<path d="M${-16 + k * 13} -14 l12 14 l-12 14" style="animation-delay:${k * .15}s"/>`).join('')}</g>`).join('');
    const portals = (h.portals || []).map((p, i) => ['a', 'b'].map(s => `<g transform="translate(${p[s][0]} ${p[s][1]})" class="gf-portal ${s}"><circle r="26" class="pr0"/><circle r="20" class="pr1"/><circle r="12" class="pr2"/><g class="gf-swirl"><path d="M0 -22 a22 22 0 0 1 22 22" /><path d="M0 22 a22 22 0 0 1 -22 -22"/></g></g>`).join('')).join('');
    const bumpers = (h.bumpers || []).map((b, i) => `<g transform="translate(${b.x} ${b.y})"><g class="gf-bumper" id="gfb${i}"><circle r="${b.r + 4}" class="bk"/><circle r="${b.r}" class="b0"/><circle r="${b.r * .62}" class="b1"/><text y="1" class="bs" font-size="${b.r * .8}">★</text></g></g>`).join('');
    const mills = (h.mills || []).map((m, i) => `<g transform="translate(${m.x} ${m.y})"><rect x="-26" y="-26" width="52" height="52" rx="6" class="gf-millhouse"/><path d="M-30 -24 L0 -46 L30 -24 Z" class="gf-millroof"/>
        <g id="gfm${i}" class="gf-blades">${Array.from({ length: m.n }, (_, k) => `<g transform="rotate(${k * 360 / m.n})"><rect x="14" y="-7" width="${m.r - 12}" height="14" rx="3" class="gf-blade"/><rect x="${m.r * .45}" y="-14" width="${m.r * .5}" height="28" rx="2" class="gf-sail"/></g>`).join('')}<circle r="12" class="gf-hub"/></g></g>`).join('');
    const sliders = (h.sliders || []).map((s, i) => `<line x1="${s.a[0]}" y1="${s.a[1]}" x2="${s.b[0]}" y2="${s.b[1]}" class="gf-rail"/><g id="gfs${i}"><rect x="${-s.w / 2}" y="${-s.h / 2}" width="${s.w}" height="${s.h}" rx="6" class="gf-slider"/><path d="M${-s.w / 2 + 8} 0 h${s.w - 16}" class="gf-sliderline"/></g>`).join('');
    const walls = (h.walls || []).map(w => `<line x1="${w[0]}" y1="${w[1]}" x2="${w[2]}" y2="${w[3]}" class="gf-wall2s"/><line x1="${w[0]}" y1="${w[1]}" x2="${w[2]}" y2="${w[3]}" class="gf-wall2"/>`).join('');
    const deco = (h.deco || []).map(d => `<text x="${d.x}" y="${d.y}" font-size="${d.s}" class="gf-deco ${d.float ? 'float' : ''}">${d.e}</text>`).join('');
    const [cx, cy] = h.cup;
    svg.innerHTML = `<defs>
        <pattern id="gfGrass" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="${T.g1}"/><rect width="40" height="80" fill="${T.g2}"/><circle cx="12" cy="20" r="1.4" fill="#0002"/><circle cx="58" cy="60" r="1.4" fill="#fff3"/></pattern>
        <pattern id="gfHedge" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${T.bg}"/><circle cx="15" cy="15" r="16" fill="${T.b1}"/><circle cx="45" cy="40" r="18" fill="${T.b2}"/><circle cx="10" cy="50" r="10" fill="${T.b3}"/><circle cx="20" cy="10" r="3" fill="${T.f1}"/><circle cx="48" cy="30" r="2.5" fill="${T.f2}"/></pattern>
        <pattern id="gfSand" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#f1d58a"/><circle cx="5" cy="6" r="1.3" fill="#d9b762"/><circle cx="17" cy="15" r="1.1" fill="#c9a24a"/><circle cx="11" cy="21" r=".9" fill="#fff3c4"/></pattern>
        ${haz === 'lava' ? `<linearGradient id="gfWater" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd23d"/><stop offset=".45" stop-color="#ff6a1f"/><stop offset="1" stop-color="#c0221a"/></linearGradient>`
          : haz === 'void' ? `<radialGradient id="gfWater"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#160a33"/><stop offset=".85" stop-color="#5b2bb3"/><stop offset="1" stop-color="#d9a8ff"/></radialGradient>`
          : `<linearGradient id="gfWater" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4fd3ff"/><stop offset=".6" stop-color="#1f8fe0"/><stop offset="1" stop-color="#1667b8"/></linearGradient>`}
        <linearGradient id="gfIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eafcff"/><stop offset=".5" stop-color="#bfefff"/><stop offset="1" stop-color="#a6dcf5"/></linearGradient>
        <radialGradient id="gfBall" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f1f1f1"/><stop offset="1" stop-color="#c9c9c9"/></radialGradient>
        <filter id="gfShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter>
      </defs>
      <g id="gf-root" class="th-${h.theme || 'garden'} hz-${haz}" ${rot ? 'transform="translate(600 0) rotate(90)"' : ''}>
        <rect x="-40" y="-40" width="1080" height="680" fill="url(#gfHedge)"/>
        ${deco}
        <polygon points="${pts(h.outline)}" class="gf-wallshadow"/>
        <polygon points="${pts(h.outline)}" fill="url(#gfGrass)" class="gf-green"/>
        <polygon points="${pts(h.outline)}" class="gf-innershade"/>
        <clipPath id="gfOut"><polygon points="${pts(h.outline)}"/></clipPath><g clip-path="url(#gfOut)">${ice}${sand}${water}${islands}${bridges}${slopes}${wind}</g>${boosts}${portals}
        <circle cx="${h.start[0]}" cy="${h.start[1]}" r="18" class="gf-tee"/>
        <g class="gf-cupg" transform="translate(${cx} ${cy})"><circle r="22" class="gf-cupring"/><circle r="15" class="gf-cup"/><ellipse cx="0" cy="-3" rx="13" ry="10" class="gf-cupin"/>
          <g class="gf-flagpole"><line x1="0" y1="0" x2="0" y2="-70" /><path d="M0 -70 q18 6 34 0 q-8 9 0 18 q-16 6 -34 0z" class="gf-flagcloth"/></g></g>
        ${bumpers}${sliders}${mills}
        <polygon points="${pts(h.outline)}" class="gf-wall"/>
        <polygon points="${pts(h.outline)}" class="gf-wallhi"/>
        ${walls}
        <g id="gf-aim"></g>
        <g id="gf-trails"></g>
        <g id="gf-balls"></g>
        <g id="gf-fx"></g>
      </g>`;
  }
  const svgPoint = (e) => { const svg = $('#gf-svg'), g = $('#gf-root'); const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(g.getScreenCTM().inverse()); };

  // ───────── visée à la fronde ─────────
  const myBall = () => V?.balls?.[pid];
  const canShoot = () => { const b = myBall(); return V && V.stage === 'play' && b && !b.done && now() >= (b.until || 0); };
  function down(e) {
    if (!canShoot()) return;
    e.preventDefault();
    const p = svgPoint(e);
    aim = { x0: p.x, y0: p.y, ang: 0, pow: 0 };
    $('#gf-help').classList.add('gone');
  }
  function move(e) {
    if (!aim) return;
    const p = svgPoint(e), dx = aim.x0 - p.x, dy = aim.y0 - p.y, L = Math.hypot(dx, dy);
    aim.ang = Math.atan2(dy, dx); aim.pow = Math.min(1, L / 260);
    drawAim();
  }
  async function up() {
    if (!aim) return;
    const a = aim; aim = null; $('#gf-aim').innerHTML = '';
    if (a.pow < .04) return;
    sfx('putt');
    const r = await gAct('shoot', { ang: a.ang, pow: a.pow });
    if (r?.error) toast(r.error, 'error');
  }
  function drawAim() {
    const b = myBall(); if (!b || !aim) return;
    const L = 40 + aim.pow * 230, ex = b.x + Math.cos(aim.ang) * L, ey = b.y + Math.sin(aim.ang) * L;
    const bx = b.x - Math.cos(aim.ang) * (30 + aim.pow * 70), by = b.y - Math.sin(aim.ang) * (30 + aim.pow * 70);
    const col = aim.pow < .4 ? '#7dff8a' : aim.pow < .75 ? '#ffd23f' : '#ff4d6d';
    $('#gf-aim').innerHTML = `<line x1="${b.x}" y1="${b.y}" x2="${ex}" y2="${ey}" class="gf-aimline" stroke="${col}"/>
      <circle cx="${ex}" cy="${ey}" r="7" fill="${col}" class="gf-aimdot"/>
      <line x1="${b.x}" y1="${b.y}" x2="${bx}" y2="${by}" class="gf-club"/>
      <g transform="translate(${b.x} ${b.y - 36})"><rect x="-40" y="-7" width="80" height="14" rx="7" class="gf-powbg"/><rect x="-38" y="-5" width="${76 * aim.pow}" height="10" rx="5" fill="${col}"/></g>`;
  }

  // ───────── balles & trajectoires ─────────
  function ballPos(pidB, b, t) {
    const s = b.shot;
    if (!s) return { x: b.x, y: b.y, moving: false };
    const el = (t - s.at) / 1000;
    if (el < 0) return { x: s.from[0], y: s.from[1], moving: false };
    const fr = s.frames, i = el * 30;
    if (i >= fr.length - 1 || el > s.dur + .05) {
      if (s.result === 'water') return { x: s.from[0], y: s.from[1], moving: false, sunk: el < s.dur + .9 };
      const last = fr[fr.length - 1]; return { x: last[0], y: last[1], moving: false, holed: s.result === 'hole' };
    }
    let k = Math.floor(i); const a = fr[k] || fr[k + 1], b2 = fr[k + 1] || fr[k + 2] || a;
    if (!a) return { x: b.x, y: b.y, moving: false };
    const f = i - k;
    return { x: a[0] + (b2[0] - a[0]) * f, y: a[1] + (b2[1] - a[1]) * f, moving: true };
  }
  function loop() {
    cancelAnimationFrame(raf);
    const step = () => {
      if (!V || !$('#gf-root')) return;
      const t = now(), ht = (t - V.holeStart) / 1000, h = V.hole;
      (h.mills || []).forEach((m, i) => { const el = $('#gfm' + i); if (el) el.setAttribute('transform', `rotate(${m.w * ht * 180 / Math.PI})`); });
      (h.sliders || []).forEach((s, i) => { const f = (1 - Math.cos(2 * Math.PI * ht / s.period)) / 2; const el = $('#gfs' + i); if (el) el.setAttribute('transform', `translate(${s.a[0] + (s.b[0] - s.a[0]) * f} ${s.a[1] + (s.b[1] - s.a[1]) * f})`); });
      const balls = $('#gf-balls');
      let html = '';
      const order = V.players.slice().sort((a, b) => (a === pid) - (b === pid));
      for (const p of order) {
        const b = V.balls[p]; if (!b) continue;
        const ps = ballPos(p, b, t);
        events(p, b, t);
        if (ps.holed && !ps.moving) continue;
        const me = p === pid, c = colOf(p), pl = P(p);
        html += `<g transform="translate(${ps.x} ${ps.y})"><g class="gf-ball ${me ? 'me' : 'ghost'} ${ps.sunk ? 'sunk' : ''}">
          <ellipse cx="3" cy="6" rx="9" ry="5" class="gf-bshadow"/><circle r="9" fill="url(#gfBall)" stroke="${c}" stroke-width="${me ? 3 : 2.5}"/><circle cx="-3" cy="-3" r="2.2" fill="#fff"/>
          ${!me ? `<text y="-16" class="gf-bname" fill="${c}" ${rot ? 'transform="rotate(-90)"' : ''}>${esc((pl?.name || '').slice(0, 10))}</text>` : ''}
          ${me && !ps.moving && canShoot() && !aim ? `<circle r="20" class="gf-ready" stroke="${c}"/>` : ''}</g></g>`;
        // traînée
        if (ps.moving && b.shot) {
          const i = Math.floor((t - b.shot.at) / 1000 * 30), fr = b.shot.frames.slice(Math.max(0, i - 8), i + 1).filter(Boolean);
          if (fr.length > 1) html = `<polyline points="${fr.map(q => q.join(',')).join(' ')} ${ps.x},${ps.y}" class="gf-trail" stroke="${c}"/>` + html;
        }
      }
      balls.innerHTML = html;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function events(p, b, t) {
    const s = b.shot; if (!s) return;
    const done = (played[p] = played[p] || {});
    if (done.k !== s.k) { done.k = s.k; done.i = 0; if (p !== pid && t - s.at < 500) sfx('putt', .5); }
    const el = (t - s.at) / 1000;
    while (done.i < s.ev.length && s.ev[done.i].t <= el) {
      const e = s.ev[done.i++]; if (t - s.at - e.t * 1000 > 1500) continue; // trop vieux (rechargement)
      const vol = p === pid ? 1 : .45;
      const ps = ballPos(p, b, s.at + e.t * 1000);
      if (e.k === 'wall') sfx('wall', vol * (.4 + e.v * .6));
      else if (e.k === 'mill') { sfx('wall', vol); fx(ps.x, ps.y, '💨'); }
      else if (e.k === 'bumper') { sfx('boing', vol * .6); const bm = $('#gfb' + e.i); if (bm) { bm.classList.remove('hit'); void bm.getBoundingClientRect(); bm.classList.add('hit'); } }
      else if (e.k === 'boost') { sfx('whoosh', vol); fx(ps.x, ps.y, '⚡'); }
      else if (e.k === 'portal') { sfx('whoosh', vol); fx(ps.x, ps.y, '✨'); }
      else if (e.k === 'sand') { sfx('sand', vol); fx(ps.x, ps.y, '', 'puff'); }
      else if (e.k === 'splash') { sfx('splash', vol); splash(e.x, e.y); if (p === pid) toast({ lava: '🔥 Grillée dans la lave ! +1 coup', void: '🕳️ Aspirée par le vide ! +1 coup' }[THEMES[V.hole.theme]?.haz] || '💦 Plouf ! +1 coup de pénalité'); }
      else if (e.k === 'hole') {
        sfx('hole', vol); holeFx(p, b);
      }
    }
  }
  function fx(x, y, txt, cls = '') {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<g class="gf-pop ${cls}">${cls === 'puff' ? [0, 1, 2, 3, 4].map(k => `<circle r="6" class="gf-puff" style="--a:${k * 72}deg"/>`).join('') : `<text ${rot ? 'transform="rotate(-90)"' : ''}>${txt}</text>`}</g>`;
    $('#gf-fx')?.appendChild(g); setTimeout(() => g.remove(), 1100);
  }
  function splash(x, y) {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<g class="gf-splash ${THEMES[V.hole.theme]?.haz || ''}"><circle r="10" class="r1"/><circle r="10" class="r2"/><circle r="10" class="r3"/>${Array.from({ length: 10 }, (_, k) => `<circle r="4" class="drop" style="--a:${k * 36}deg;--d:${20 + (k % 3) * 12}px"/>`).join('')}</g>`;
    $('#gf-fx')?.appendChild(g); setTimeout(() => g.remove(), 1600);
  }
  function holeFx(p, b) {
    const [x, y] = V.hole.cup;
    const g = document.createElementNS(NS, 'g'); g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<g class="gf-holed"><circle r="15" class="ring"/>${Array.from({ length: 14 }, (_, k) => `<rect x="-3" y="-6" width="6" height="12" rx="2" class="conf" style="--a:${k * 25.7}deg;fill:${COLORS[k % COLORS.length]}"/>`).join('')}</g>`;
    $('#gf-fx')?.appendChild(g); setTimeout(() => g.remove(), 1600);
    $('.gf-flagpole')?.classList.remove('pop'); void $('.gf-flagpole')?.getBoundingClientRect(); $('.gf-flagpole')?.classList.add('pop');
    if (p === pid) {
      const ban = $('#gf-banner'), ace = b.strokes === 1;
      ban.innerHTML = `<div class="gf-bn ${ace ? 'ace' : ''}"><b>${esc(b.label || 'Dans le trou !')}</b><small>${b.strokes} coup${b.strokes > 1 ? 's' : ''} · par ${V.hole.par}</small></div>`;
      ban.classList.remove('hidden'); setTimeout(() => ban.classList.add('hidden'), 2600);
      if (ace) { divineFlash?.(); sfx('legend'); burst('supernova', 40); } else if (b.strokes < V.hole.par) { sfx('legend'); burst('fireworks', 24); } else burst('party', 12);
    }
  }

  // ───────── interface ─────────
  function hud(v) {
    $('#gf-hole').innerHTML = `${['🌳', '🗺️', '🔥'][v.hole.course] || '⛳'} Trou <b>${v.n + 1}</b>/${v.total} · ${esc(v.hole.name)}`;
    $('#gf-par').textContent = `Par ${v.hole.par}`;
    const b = myBall();
    $('#gf-me').innerHTML = b ? `<span class="gf-strokes">🏌️ ${b.strokes} coup${b.strokes > 1 ? 's' : ''}</span>${b.done ? `<span class="gf-done">${b.capped ? '⛔ Maximum atteint' : '✅ ' + esc(b.label || 'Dans le trou')}</span>` : `<span class="muted">max ${v.cap}</span>`}` : '<span class="muted">Tu regardes 👀</span>';
    $('#gf-players').innerHTML = v.players.map(p => { const pl = P(p), bb = v.balls[p]; if (!pl || !bb) return ''; const tot = (v.cards[p] || []).reduce((a, x) => a + (x || 0), 0); return `<div class="gf-pl ${p === pid ? 'me' : ''} ${bb.done ? 'done' : ''}"><i style="background:${colOf(p)}"></i>${avatarHTML(pl, 26)}<b>${esc(pl.name)}</b><span>${bb.done ? (bb.capped ? '⛔' : '⛳') : '🏌️'} ${bb.strokes}</span><em>Σ ${tot}</em></div>`; }).join('');
    clearInterval(iv);
    if (v.stage === 'play') { const end = Date.now() + v.left; const tick = () => { const s = Math.max(0, Math.ceil((end - Date.now()) / 1000)); const el = $('#gf-time'); if (el) { el.textContent = `⏱️ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('low', s < 15); } }; tick(); iv = setInterval(tick, 500); }
    else $('#gf-time').textContent = '';
    $('#gf-skip').classList.toggle('hidden', !isHost() || v.stage !== 'play');
    $('#gf-stop').classList.toggle('hidden', !isHost() || v.stage === 'over');
    $('#gf-wrap').classList.toggle('can', !!canShoot());
  }
  function scorecard(v, manual, inline) {
    const el = $('#gf-score');
    const head = `<tr><th>Trou</th>${v.pars.map((_, i) => `<th class="${i === v.n ? 'cur' : ''}">${i + 1}</th>`).join('')}<th>Total</th></tr><tr class="par"><td>Par</td>${v.pars.map(p => `<td>${p}</td>`).join('')}<td>${v.pars.reduce((a, b) => a + b, 0)}</td></tr>`;
    const rows = v.players.slice().sort((a, b) => (v.cards[a] || []).reduce((x, y) => x + (y || 0), 0) - (v.cards[b] || []).reduce((x, y) => x + (y || 0), 0)).map(p => {
      const pl = P(p); const c = v.cards[p] || []; const tot = c.reduce((a, x) => a + (x || 0), 0);
      return `<tr class="${p === pid ? 'me' : ''}"><td><i style="background:${colOf(p)}"></i>${esc(pl?.name || '?')}</td>${v.pars.map((par, i) => { const s = c[i]; const cls = s == null ? '' : s === 1 ? 'ace' : s < par ? 'under' : s === par ? 'par' : 'over'; return `<td class="${cls}">${s ?? ''}</td>`; }).join('')}<td class="tot">${tot}</td></tr>`;
    }).join('');
    el.innerHTML = `<div class="gf-sc"><h3>📋 Carte de score ${v.stage === 'score' && !manual ? `<small>· trou suivant dans quelques secondes…</small>` : ''}</h3><div class="gf-scroll"><table>${head}${rows}</table></div>${inline ? '' : '<button class="btn btn-ghost btn-sm" onclick="this.closest(\'.gf-score\').classList.add(\'hidden\')">Fermer</button>'}</div>`;
  }
  function render(v) {
    if (v.gameKey !== key) { key = v.gameKey; build(); ended = false; played = {}; scoreShown = null; }
    off = v.now - Date.now();
    V = v;
    const hk = v.gameKey + ':' + v.n + ':' + (innerHeight > innerWidth);
    if (hk !== holeKey && v.hole) { holeKey = hk; drawHole(v); loop(); $('#gf-help').classList.remove('gone'); played = {}; for (const [p, b] of Object.entries(v.balls)) if (b.shot) played[p] = { k: b.shot.k, i: b.shot.ev.filter(e => b.shot.at + e.t * 1000 < now()).length }; }
    hud(v);
    if (v.stage === 'score' && scoreShown !== v.n) { scoreShown = v.n; setTimeout(() => { if (V?.stage === 'score') { scorecard(V); $('#gf-score').classList.remove('hidden'); } }, 1200); }
    if (v.stage === 'play' && scoreShown === v.n - 1) { $('#gf-score').classList.add('hidden'); }
    if (v.fx && v.fx.k !== lastFx) { lastFx = v.fx.k; const b = v.balls[v.fx.pid]; if (b) fx(b.x, b.y - 30, v.fx.e); }
    if (v.stage === 'over' && !ended) {
      ended = true; cancelAnimationFrame(raf);
      $('#gf-score').classList.add('hidden'); scorecard(v, false, true);
      $('#gf-end').innerHTML = `<div class="pz-end"><h2>⛳ ${v.ranking?.[0]?.pid === pid && v.ranking.length > 1 ? 'Roi du green !' : 'Partie terminée'}</h2>${podium((v.ranking || []).map(r => ({ pid: r.pid, pts: r.pts, unit: 'coups' })))}${v.coins ? `<p class="gp-coins">+${v.coins.coins} 🪙</p>` : ''}<div class="gf-endcard">${$('#gf-score').innerHTML}</div>${endBtns('gf')}</div>`;
      endWire('gf', v.ranking || []);
    }
  }
  addEventListener('resize', () => { if (V && $('#gf-svg')) { const r = $('#gf-wrap').clientWidth < 560 && innerHeight > innerWidth; if (r !== rot) { holeKey = null; render(V); } } });
  window.GOLF = { render };
})();
