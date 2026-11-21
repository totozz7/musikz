// PlayZup — célébrations DIVINES (✹) : 🚀 Décollage, ⚡ Colère de Zeus, 🐉 Dragon céleste
// Chacune est une petite scène plein écran (~6 s) jouée par burst() quand on gagne.
(() => {
  const r = (a, b) => a + Math.random() * (b - a);
  const later = (ms, fn) => setTimeout(() => { try { fn(); } catch (e) { console.warn(e); } }, ms);
  const S = (n, v, t) => later(t, () => sfx(n, v));
  const say = (txt, t, opt = {}) => later(t, () => { const u = new SpeechSynthesisUtterance(txt); u.lang = opt.lang || 'fr-FR'; u.rate = opt.rate || 1.05; u.pitch = opt.pitch || 1; u.volume = 1; speechSynthesis.speak(u); });
  const shake = (ms = 600) => { document.body.classList.add('sn-shake'); later(ms, () => document.body.classList.remove('sn-shake')); };
  const scene = (cls, html, life) => { const el = fxEl('dv-scene ' + cls, {}, html, life); return el; };
  const small = () => innerWidth < 700;
  const title = (word, sub, cls) => { let i = 0; return `<div class="dv-title ${cls}"><div class="dv-word">${word.split(' ').map(w => `<b class="dv-w">${[...w].map(c => `<span style="--i:${i++}">${c}</span>`).join('')}</b>`).join('')}</div><small>${sub}</small></div>`; };
  // gerbe de particules (réutilise les .fw-p du feu d'artifice)
  const firework = (x, y, colors, n = 34, spread = 1) => {
    fxEl('fw-flash dv-fwp', { left: x + 'px', top: y + 'px', '--c': colors[0] }, '', 700);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r(-.1, .1), d = r(.55, 1) * spread * Math.min(innerWidth, innerHeight) * .32; fxEl('fw-p dv-fwp', { left: x + 'px', top: y + 'px', '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d + 'px', '--c': colors[i % colors.length] }, '', 1500); }
  };

  // ═══════════════════ 🚀 DÉCOLLAGE ═══════════════════
  const O = '#1c1530';
  const ROCKET = `<svg viewBox="0 0 120 240" class="rk-svg">
      <path d="M28 128 L4 170 L4 200 L30 184Z" fill="#ff3b5c" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M92 128 L116 170 L116 200 L90 184Z" fill="#d81e45" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M38 176 L82 176 L88 204 L32 204Z" fill="#7a83a6" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M44 182 h32" stroke="#b9c0dc" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 6 C88 34 94 74 92 124 L92 178 L28 178 L28 124 C26 74 32 34 60 6Z" fill="#fff" stroke="${O}" stroke-width="5"/>
      <path d="M78 60 C86 90 86 130 84 176 L92 176 L92 124 C93 96 90 74 84 58Z" fill="#d7dcef"/>
      <path d="M60 6 C76 22 84 40 88 58 L32 58 C36 40 44 22 60 6Z" fill="#ff3b5c" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M48 30 Q54 20 60 16" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
      <circle cx="60" cy="96" r="19" fill="#ffd23f" stroke="${O}" stroke-width="5"/><circle cx="60" cy="96" r="12" fill="#3fd0ff" stroke="${O}" stroke-width="3"/><circle cx="55" cy="91" r="4" fill="#fff"/>
      <path d="M36 66 v104" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
      <path d="M52 136 L68 136 L67 204 L53 204Z" fill="#ff3b5c" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <text x="60" y="160" text-anchor="middle" font-family="Bungee,sans-serif" font-size="15" fill="${O}">PZ</text>
    </svg>`;
  const TOWER = `<svg viewBox="0 0 80 300" preserveAspectRatio="none" class="rk-tw"><path d="M10 300 V20 H70 V300" fill="none" stroke="#3a2f52" stroke-width="7"/>${Array.from({ length: 14 }, (_, i) => `<path d="M10 ${30 + i * 20} L70 ${50 + i * 20} M70 ${30 + i * 20} L10 ${50 + i * 20}" stroke="#3a2f52" stroke-width="3"/>`).join('')}<path d="M70 70 H96 M70 150 H96" stroke="#3a2f52" stroke-width="7"/><circle cx="40" cy="12" r="7" fill="#ff3b5c" class="rk-beacon"/></svg>`;
  function rocket() {
    const sm = small();
    scene('rk', `<div class="rk-sky"></div><div class="rk-space"></div><div class="rk-stars">${Array.from({ length: sm ? 50 : 110 }, () => `<i style="left:${r(0, 100)}%;top:${r(0, 75)}%;--s:${r(1, 3)}px;animation-delay:${r(0, 2)}s"></i>`).join('')}</div>
      <div class="rk-streaks">${Array.from({ length: 34 }, () => `<i style="left:${r(0, 100)}%;--h:${r(6, 22)}vh;animation-delay:${r(0, .4)}s;animation-duration:${r(.25, .45)}s"></i>`).join('')}</div>
      <div class="rk-world"><div class="rk-moon"></div><div class="rk-hills b"></div><div class="rk-hills"></div>
        <div class="rk-tower">${TOWER}</div><div class="rk-pad"></div>
        <div class="rk-smokes">${Array.from({ length: sm ? 22 : 36 }, (_, i) => { const side = i % 2 ? 1 : -1; return `<i style="--x:${side * r(4, 46)}vw;--y:${r(-14, 2)}vh;--sz:${r(9, 20)}vmin;animation-delay:${1.65 + i * .035}s"></i>`; }).join('')}</div></div>
      <div class="rk-ship"><div class="rk-lift"><div class="rk-shake"><div class="rk-trail"></div><div class="rk-flame"><i></i><i></i><i></i></div>${ROCKET}</div></div></div>
      <div class="rk-count"><b style="--d:.3s">3</b><b style="--d:.9s">2</b><b style="--d:1.5s">1</b><b class="go" style="--d:2.05s">DÉCOLLAGE !</b></div>
      <div class="dv-fl rk-fl"></div>
      ${title('VERS LES ÉTOILES', '✹ CÉLÉBRATION DIVINE ✹', 'rk-t')}`, 6000);
    [300, 900, 1500].forEach((t, i) => S('beep', 1, t));
    S('beep2', 1, 2050);
    S('tick', 1, 1300); S('tick', 1, 1420); S('swell', .7, 1100); S('crackle', .6, 1650); S('whoosh', 1, 2100); S('roar', .7, 2150);
    S('clunk', 1, 1600); S('rumble', 1, 1600); S('boom', .8, 2050); S('swell', .8, 3000); S('whoosh', 1, 3300);
    later(1650, () => shake(400)); later(2100, () => shake(700));
    // explosion en feu d'artifice tout là-haut
    later(4400, () => {
      const W = innerWidth, H = innerHeight;
      S('boom', 1, 0); S('bang', 1, 0); S('crackle', 1, 250); S('legend', 1, 300); S('crackle', .8, 900); S('crackle', .8, 1300);
      firework(W / 2, H * .3, ['#ffffff', '#ffd23f', '#ff3b5c', '#3fd0ff'], sm ? 44 : 70, 1.25);
      later(320, () => firework(W * .22, H * .22, ['#7dff8a', '#ffffff', '#ffd23f'], 30, .7));
      later(520, () => firework(W * .8, H * .26, ['#ff7ae6', '#ffffff', '#c6a8ff'], 30, .7));
      later(820, () => firework(W * .35, H * .5, ['#ffd23f', '#ff8a1f'], 26, .6));
      later(1000, () => firework(W * .68, H * .48, ['#3fd0ff', '#ffffff'], 26, .6));
      for (let i = 0; i < (sm ? 50 : 100); i++) fxEl('sv-conf', { left: r(0, 100) + 'vw', background: ['#ffd23f', '#fff', '#ff3b5c', '#3fd0ff', '#7dff8a'][i % 5], '--d': r(2, 3.2) + 's', '--mx': r(-120, 120) + 'px', '--r': r(360, 1440) + 'deg', animationDelay: r(.1, .7) + 's', width: r(6, 12) + 'px', height: r(10, 18) + 'px' }, '', 3400);
    });
  }

  // ═══════════════════ ⚡ COLÈRE DE ZEUS ═══════════════════
  // éclair « fractal » : déplacement aléatoire du milieu des segments + branches
  function boltPts(x0, y0, x1, y1, disp, out = []) {
    if (disp < 6) { out.push([x1, y1]); return out; }
    const mx = (x0 + x1) / 2 + r(-.5, .5) * disp, my = (y0 + y1) / 2 + r(-.15, .15) * disp;
    boltPts(x0, y0, mx, my, disp / 2, out); boltPts(mx, my, x1, y1, disp / 2, out); return out;
  }
  function boltSVG(x, yEnd, W, H, thick = 1) {
    const main = [[x, -20], ...boltPts(x, -20, x + r(-80, 80), yEnd, 220)];
    let br = '';
    for (let k = 0; k < 4; k++) { const p = main[Math.floor(r(.2, .7) * main.length)]; const b = [p, ...boltPts(p[0], p[1], p[0] + r(-200, 200), p[1] + r(80, 220), 90)]; br += `<polyline points="${b.map(q => q.join(',')).join(' ')}" class="zb-br"/>`; }
    const pts = main.map(q => q.join(',')).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts}" class="zb-glow" style="stroke-width:${18 * thick}px"/>${br}<polyline points="${pts}" class="zb-core" style="stroke-width:${4 * thick}px"/></svg>`;
  }
  function arcSVG(cx, cy, W, H) {
    let s = '';
    for (let k = 0; k < 7; k++) { const a = r(0, Math.PI * 2), a2 = a + r(-.9, .9), d1 = r(20, 60), d2 = r(90, 260); const p = [[cx + Math.cos(a) * d1, cy + Math.sin(a) * d1 * .45], ...boltPts(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1 * .45, cx + Math.cos(a2) * d2, cy + Math.sin(a2) * d2 * .45 - r(0, 120), 70)]; s += `<polyline points="${p.map(q => q.join(',')).join(' ')}"/>`; }
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${s}</svg>`;
  }
  function zeus() {
    const W = innerWidth, H = innerHeight, sm = small(), gy = H * .8;
    const el = scene('zs', `<div class="zs-dark"></div>
      <div class="zs-clouds">${Array.from({ length: sm ? 7 : 11 }, (_, i) => `<i style="left:${-10 + i * (sm ? 17 : 11)}%;--w:${r(26, 44)}vw;--h:${r(14, 24)}vh;--t:${r(-8, 6)}vh;--from:${i % 2 ? 60 : -60}vw;animation-delay:${r(0, .35)}s"></i>`).join('')}</div>
      <div class="zs-rain">${Array.from({ length: sm ? 70 : 150 }, () => `<i style="left:${r(-10, 110)}%;--h:${r(5, 12)}vh;animation-delay:${r(0, .6)}s;animation-duration:${r(.35, .55)}s;opacity:${r(.3, .8)}"></i>`).join('')}</div>
      <div class="zs-bolts"></div>
      <div class="zs-vortex"></div><div class="zs-beam"></div>
      <div class="zs-land"><svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet" class="zs-temple"><path d="M60 120 L60 108 L340 108 L340 120Z M75 108 V100 H325 V108Z M90 100 V96 H310 V96Z" /><path d="M95 50 L200 14 L305 50Z"/><rect x="92" y="50" width="216" height="8"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${104 + k * 36}" y="60" width="16" height="36" rx="2"/>`).join('')}</svg></div>
      <div class="zs-ground"><div class="zs-crater"></div><svg viewBox="-300 -100 600 200" class="zs-cracks">${Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + r(-.2, .2); let x = 0, y = 0, d = `M0 0`; for (let k = 0; k < 5; k++) { x += Math.cos(a + r(-.5, .5)) * r(30, 55); y += Math.sin(a + r(-.5, .5)) * r(10, 22); d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; } return `<path d="${d}" style="animation-delay:${3.35 + i * .02}s"/>`; }).join('')}</svg></div>
      <div class="zs-mega"><svg viewBox="0 0 200 600" preserveAspectRatio="none"><path d="M120 0 L40 260 L105 250 L45 600 L170 200 L100 215 L160 0Z" class="zm-glow"/><path d="M120 0 L40 260 L105 250 L45 600 L170 200 L100 215 L160 0Z" class="zm-core"/></svg></div>
      <div class="zs-arcs"></div>
      <div class="dv-fl zs-fl"></div>
      ${title('FOUDROYANT', '✹ CÉLÉBRATION DIVINE ✹', 'zs-t')}`, 5800);
    S('rain', 1, 150); S('swell', .6, 0);
    const bolts = el.querySelector('.zs-bolts'), fl = el.querySelector('.zs-fl');
    const flash = (o = 1) => { fl.style.setProperty('--o', o); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); el.classList.remove('lit'); void el.offsetWidth; el.classList.add('lit'); };
    [[900, .2], [1350, .75], [1750, .45], [2150, .88], [2500, .3], [2750, .62]].forEach(([t, fx], i) => later(t, () => {
      const d = document.createElement('div'); d.className = 'zs-bolt'; d.innerHTML = boltSVG(W * fx, r(H * .55, H * .85), W, H, sm ? .7 : 1); bolts.appendChild(d); later(700, () => d.remove());
      flash(.55); S('thunder', .8 + i * .03, 60); if (i % 2) S('zap', .8, 0);
    }));
    // l'éclair divin
    later(3050, () => { S('swell', 1, 0); S('zap', 1, 150); });
    later(3330, () => {
      flash(1); shake(900); S('thunder', 1.3, 0); S('boom', 1.2, 0); S('bang', 1, 0); S('legend', 1, 350); S('crackle', 1, 200); S('roar', .6, 300);
      const arcs = el.querySelector('.zs-arcs'); let n = 0;
      const iv = setInterval(() => { if (++n > 18 || !el.isConnected) return clearInterval(iv); arcs.innerHTML = arcSVG(W / 2, gy, W, H); if (n % 4 === 0) S('zap', .5, 0); }, 85);
      for (let i = 0; i < (sm ? 30 : 60); i++) { const a = r(-Math.PI, 0), d = r(80, 360); fxEl('zs-spark', { left: W / 2 + 'px', top: gy + 'px', '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d * .9 + 'px', animationDelay: r(0, .25) + 's' }, '', 1500); }
    });
  }

  // ═══════════════════ 🐉 DRAGON CÉLESTE ═══════════════════
  const DH = `<svg viewBox="0 0 220 140" class="dg-headsvg">
      <path d="M40 54 C10 30 -6 34 2 50 C-6 52 -4 66 8 66 C-2 76 10 86 26 78" fill="#2fd3a0" stroke="#3a0a0a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 40 C40 6 14 0 6 8 C26 10 40 24 46 46Z" fill="#ffd23f" stroke="#3a0a0a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M58 42 C48 14 30 4 22 10 C36 16 44 28 46 48Z" fill="#ffe98a"/>
      <path d="M36 70 C40 34 90 26 140 38 C170 44 196 50 212 62 C216 70 210 76 200 76 L150 76 C120 78 96 84 70 96 C50 104 34 92 36 70Z" fill="#e8262f" stroke="#3a0a0a" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M70 96 C96 86 126 84 156 86 L196 88 C190 104 170 114 140 114 C110 114 86 110 66 104Z" fill="#c7121d" stroke="#3a0a0a" stroke-width="4.5" stroke-linejoin="round" class="dg-jaw"/>
      <path d="M150 76 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10" fill="#fff" stroke="#3a0a0a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M158 88 l5 -8 l5 8 l5 -8 l5 8" fill="#fff" stroke="#3a0a0a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M78 70 C100 60 140 60 180 66" stroke="#ffd23f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="112" cy="50" rx="17" ry="12" fill="#fff" stroke="#3a0a0a" stroke-width="4"/><ellipse cx="116" cy="50" rx="7" ry="9" fill="#ffb800"/><ellipse cx="117" cy="50" rx="2.5" ry="7" fill="#1a0505"/><circle cx="112" cy="46" r="3" fill="#fff"/>
      <path d="M94 38 Q114 26 134 38" stroke="#3a0a0a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="198" cy="58" r="4" fill="#3a0a0a"/>
      <path d="M190 72 C160 96 120 120 70 128 C40 132 20 124 6 112" stroke="#ffd23f" stroke-width="4" fill="none" stroke-linecap="round" class="dg-wh"/>
      <path d="M186 62 C170 30 140 18 100 18" stroke="#ffd23f" stroke-width="3.5" fill="none" stroke-linecap="round" class="dg-wh b"/>
    </svg>`;
  const CLAW = `<svg viewBox="0 0 60 60" class="dg-claw"><path d="M30 0 C26 20 22 30 14 40" stroke="#c7121d" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M30 0 C26 20 22 30 14 40" stroke="#ffd23f" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/><path d="M14 40 l-8 14 M14 40 l2 16 M14 40 l12 10" stroke="#fff6c9" stroke-width="4" stroke-linecap="round"/></svg>`;
  function celeste() {
    const W = innerWidth, H = innerHeight, sm = small();
    const cx = W / 2, cy = H * .44, R = Math.min(W, H) * (sm ? .33 : .3);
    const f = (n) => n.toFixed(1);
    const P = `M${f(-.2 * W)} ${f(.95 * H)} C${f(.12 * W)} ${f(1.1 * H)} ${f(cx - R)} ${f(cy + .45 * H)} ${f(cx - R)} ${f(cy)} A${f(R)} ${f(R)} 0 0 1 ${f(cx + R)} ${f(cy)} A${f(R)} ${f(R)} 0 0 1 ${f(cx - R)} ${f(cy)} A${f(R)} ${f(R)} 0 0 1 ${f(cx + R)} ${f(cy)} C${f(cx + R)} ${f(cy + .32 * H)} ${f(.98 * W)} ${f(.25 * H)} ${f(1.3 * W)} ${f(-.25 * H)}`;
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path'); tmp.setAttribute('d', P); const L = tmp.getTotalLength();
    const T = 3.9, D0 = .45, N = sm ? 44 : 58, sp = .026, base = Math.max(26, Math.min(W, H) * .085);
    let body = '';
    for (let i = N; i >= 1; i--) {
      const k = i / N, s = base * (1 - .7 * Math.pow(k, 1.3));
      const extra = (i === 7 || i === 9 || i === Math.round(N * .55) || i === Math.round(N * .55) + 2) ? CLAW.replace('class="dg-claw"', `class="dg-claw ${i % 2 ? 'up' : ''}"`) : i === N ? '<b class="dg-tail"></b>' : '';
      body += `<div class="dg-seg ${i % 2 ? 'o' : ''}" style="--s:${f(s)}px;animation-delay:${(D0 + i * sp).toFixed(3)}s">${extra}<em></em></div>`;
    }
    body += `<div class="dg-seg dg-head" style="--s:${f(base * 2.3)}px;animation-delay:${D0}s">${DH}</div>`;
    const cloud = (x, y, s, fl) => `<svg viewBox="0 0 200 90" class="dg-cloud" style="left:${x}%;top:${y}%;--sc:${s};--fl:${fl}"><path d="M10 80 C0 60 20 44 40 52 C38 28 70 20 84 40 C92 14 136 14 140 44 C160 30 196 44 186 70 C196 78 190 86 180 86 L18 86 C12 86 8 84 10 80Z" fill="#fff4d6" stroke="#e0a526" stroke-width="5"/><path d="M60 70 q14 -16 28 0 M110 66 q12 -14 24 0" stroke="#e0a526" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
    const el = scene('dg', `<div class="dg-sky"></div><div class="dg-sun"></div>
      ${cloud(-6, 70, 1.4, 1)}${cloud(72, 76, 1.2, -1)}${cloud(78, 8, .9, -1)}${cloud(2, 12, .8, 1)}${cloud(40, 84, 1, 1)}
      <div class="dg-lanterns">${Array.from({ length: sm ? 9 : 16 }, () => `<i style="left:${r(2, 96)}%;--sz:${r(.7, 1.3)};animation-delay:${r(0, 2.5)}s;animation-duration:${r(4.5, 6.5)}s"><b></b></i>`).join('')}</div>
      <div class="dg-pearl" style="left:${cx}px;top:${cy}px"><i></i></div>
      <div class="dg-body" style="--p:path('${P}');--T:${T}s">${body}</div>
      <div class="dg-rays" style="left:${cx}px;top:${cy}px"></div>
      <div class="dv-fl dg-fl"></div>
      ${title("L'ÉVEIL DU DRAGON", '✹ CÉLÉBRATION DIVINE ✹', 'dg-t')}`, 6400);
    S('gong', 1, 0); S('swell', .7, 200); S('dragon', 1, 900); S('whoosh', 1, 800); S('whoosh', .8, 1900); S('whoosh', .8, 2900);
    // étincelles dorées derrière la tête
    const t0 = performance.now();
    const iv = setInterval(() => {
      const t = (performance.now() - t0) / 1000 - D0; if (t > T || !el.isConnected) return clearInterval(iv); if (t < 0) return;
      const p = tmp.getPointAtLength(L * t / T);
      if (p.x > -40 && p.x < W + 40 && p.y > -40 && p.y < H + 40) for (let k = 0; k < 2; k++) fxEl('dg-spark', { left: p.x + r(-20, 20) + 'px', top: p.y + r(-20, 20) + 'px', '--dx': r(-50, 50) + 'px', '--dy': r(-50, 40) + 'px' }, k ? '✦' : '', 1100);
    }, 55);
    // la perle éclate quand le dragon l'a encerclée
    later(3300, () => {
      el.classList.add('burst'); shake(700);
      S('gong', 1.2, 0); S('boom', 1, 0); S('dragon', 1, 100); S('legend', 1, 300); S('crackle', 1, 400); S('crackle', 1, 900);
      firework(cx, cy, ['#ffd23f', '#fff6c9', '#ff3b3b', '#ffb800'], sm ? 40 : 64, 1.3);
      for (let i = 0; i < (sm ? 26 : 46); i++) fxEl('dg-coin', { left: cx + 'px', top: cy + 'px', '--dx': r(-.45, .45) * W + 'px', '--dy': r(-.35, .2) * H + 'px', '--r': r(-720, 720) + 'deg', animationDelay: r(0, .2) + 's' }, i % 3 ? '🪙' : '🧧', 1900);
      later(500, () => firework(W * .2, H * .3, ['#ff3b3b', '#ffd23f'], 26, .6));
      later(750, () => firework(W * .8, H * .3, ['#ff3b3b', '#ffd23f'], 26, .6));
    });
  }


  // ═══════════════════ effets de victoire RARES / ÉPIQUES / LÉGENDAIRES (v29) ═══════════════════
  const COLS = ['#ff2e4d', '#ffc21a', '#00e5ff', '#7dff8a', '#ff4fa3', '#c13cff', '#ff8a1f'];
  // 🫧 Bulles (rare) : des bulles irisées montent et éclatent
  function bubbles() {
    const n = small() ? 22 : 36;
    for (let i = 0; i < n; i++) {
      const life = r(1.6, 2.4), sz = r(26, 70), d = r(0, .7);
      fxEl('cb-bub', { left: r(2, 95) + 'vw', width: sz + 'px', height: sz + 'px', '--h': r(35, 85) + 'vh', '--sw': r(-40, 40) + 'px', animationDuration: life + 's', animationDelay: d + 's' }, '', (life + d) * 1000 + 400);
      if (i % 4 === 0) S('pop', .5, (d + life * .95) * 1000);
    }
  }
  // 🎊 Canons à confettis (rare)
  function cannon() {
    ['l', 'r'].forEach(side => {
      fxEl('cn-gun ' + side, {}, '🎉', 2300);
      for (let i = 0; i < (small() ? 34 : 60); i++) {
        const x = (side === 'l' ? 1 : -1) * r(20, 70), up = r(45, 90), life = r(1.4, 2.1);
        fxEl('cn-p ' + side, { '--mx': x + 'vw', '--up': -up + 'vh', animationDuration: life + 's', animationDelay: r(0, .25) + 's' }, `<i style="background:${COLS[i % COLS.length]};--r:${r(360, 1440)}deg;animation-duration:${life}s"></i>`, life * 1000 + 400);
      }
    });
    S('bang', 1, 0); S('crackle', .8, 80); S('pop', .8, 120);
  }
  // 🎈 Lâcher de ballons (épique)
  function balloons() {
    const n = small() ? 14 : 24;
    for (let i = 0; i < n; i++) {
      const c = COLS[i % COLS.length], life = r(2.4, 3), d = r(0, .5);
      fxEl('bl-b', { left: r(0, 94) + 'vw', '--c': c, '--sw': r(-30, 30) + 'px', '--sz': r(.7, 1.25), animationDuration: life + 's', animationDelay: d + 's' }, '<b></b><i></i>', (life + d) * 1000 + 300);
    }
    fxEl('bl-banner', {}, '<div class="bl-trio"><b style="--c:#ff2e4d"></b><b style="--c:#ffc21a"></b><b style="--c:#00e5ff"></b></div><span>BRAVO !</span>', 3000);
    S('whoosh', .7, 100); S('legend', .8, 900); S('pop', 1, 2300); S('pop', .8, 2450);
    later(2350, () => firework(innerWidth / 2, innerHeight * .4, COLS, 26, .6));
  }
  // 🪩 Boule disco (épique)
  function disco() {
    scene('dc', `<div class="dc-dim"></div><div class="dc-beams">${[0, 1, 2, 3, 4, 5].map(k => `<i style="--a:${k * 60}deg;--c:${COLS[k]}"></i>`).join('')}</div>
      <div class="dc-ball"><s></s><div class="dc-orb"></div></div>
      <div class="dc-spots">${Array.from({ length: small() ? 16 : 30 }, (_, k) => `<i style="left:${r(0, 100)}%;top:${r(30, 100)}%;--c:${COLS[k % COLS.length]};animation-delay:${r(0, 1)}s"></i>`).join('')}</div>
      ${title('DANCE !', '🪩 Boule disco', 'dc-t')}`, 3200);
    [0, 400, 800, 1200, 1600, 2000, 2400].forEach((t, i) => { S('boom', .45, t); S('tick', .9, t + 200); if (i % 2) S('tick', .7, t + 300); });
    S('swell', .6, 0);
  }
  // 🌌 Aurore boréale (légendaire)
  function aurora() {
    scene('au', `<div class="au-sky"></div><div class="au-stars">${Array.from({ length: small() ? 40 : 90 }, () => `<i style="left:${r(0, 100)}%;top:${r(0, 70)}%;--s:${r(1, 2.6)}px;animation-delay:${r(0, 2)}s"></i>`).join('')}</div>
      <div class="au-band a"></div><div class="au-band b"></div><div class="au-band c"></div>
      <div class="au-shoot" style="--y:14vh;animation-delay:.8s"></div><div class="au-shoot" style="--y:30vh;animation-delay:1.9s"></div>
      <div class="au-hills"></div>
      ${title('MAGNIFIQUE', '🌌 Aurore boréale', 'au-t')}`, 3600);
    S('swell', .8, 0); S('legend', .7, 900); S('whoosh', .5, 800); S('whoosh', .5, 1900);
  }
  // 🏆 Champion (légendaire)
  const CUP = `<svg viewBox="0 0 200 240" class="ch-cup"><defs><linearGradient id="cupG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8860b"/><stop offset=".35" stop-color="#fff3b0"/><stop offset=".55" stop-color="#ffc21a"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>
      <path d="M48 30 C10 30 8 90 58 104 M152 30 C190 30 192 90 142 104" fill="none" stroke="#5a3a00" stroke-width="16" stroke-linecap="round"/><path d="M48 30 C10 30 8 90 58 104 M152 30 C190 30 192 90 142 104" fill="none" stroke="url(#cupG)" stroke-width="9" stroke-linecap="round"/>
      <path d="M44 18 H156 C156 90 136 126 100 132 C64 126 44 90 44 18Z" fill="url(#cupG)" stroke="#5a3a00" stroke-width="6" stroke-linejoin="round"/>
      <path d="M62 30 C64 76 76 104 96 116" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
      <rect x="88" y="130" width="24" height="40" fill="url(#cupG)" stroke="#5a3a00" stroke-width="5"/>
      <path d="M62 170 H138 L148 206 H52Z" fill="url(#cupG)" stroke="#5a3a00" stroke-width="6" stroke-linejoin="round"/>
      <rect x="40" y="204" width="120" height="26" rx="5" fill="#3a2a5a" stroke="#1a1030" stroke-width="5"/><text x="100" y="223" text-anchor="middle" font-family="Bungee,sans-serif" font-size="15" fill="#ffd23f">N°1</text>
      <text x="100" y="80" text-anchor="middle" font-size="40">⭐</text></svg>`;
  function champion() {
    scene('cp', `<div class="cp-dim"></div><div class="cp-spot"></div><div class="cp-rays"></div>
      <div class="cp-laurel l">🌿</div><div class="cp-laurel r">🌿</div>
      <div class="cp-cup">${CUP}<i class="cp-glint"></i></div>
      ${title('CHAMPION !', '🏆 Le meilleur, tout simplement', 'cp-t')}`, 3600);
    for (let i = 0; i < (small() ? 50 : 90); i++) fxEl('sv-conf', { left: r(0, 100) + 'vw', background: ['#ffd23f', '#fff', '#ffe98a', '#ff2e4d', '#00e5ff'][i % 5], '--d': r(2, 3) + 's', '--mx': r(-100, 100) + 'px', '--r': r(360, 1440) + 'deg', animationDelay: r(.9, 1.6) + 's', width: r(6, 11) + 'px', height: r(10, 18) + 'px' }, '', 3600);
    S('swell', .8, 0); S('boom', .8, 900); S('roar', .8, 950); S('legend', 1, 1000); S('crackle', .7, 1100);
    later(1000, () => shake(400));
  }
  Object.assign(CELEBRATIONS, { bubbles, cannon, balloons, disco, aurora, champion });
  Object.assign(CELEBRATIONS, { rocket, zeus, celeste });
})();
