// Simulation de partie en mode test (MOCK=1) : 2 joueurs, saisie libre puis QCM
const { io } = require('socket.io-client');
const URL = 'http://localhost:3999';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const emit = (s, ev, d) => new Promise(r => s.emit(ev, d, r));

(async () => {
  const a = io(URL), b = io(URL);
  const log = []; let lastRoom;
  a.on('room', r => { lastRoom = r; });
  a.on('reveal', r => log.push('reveal ' + r.track.title + ' ' + JSON.stringify(r.results.map(x => x.gained))));
  a.on('end', () => log.push('END'));
  a.on('toast', t => log.push('toast ' + t.text));
  b.on('chat', m => m.text && log.push('chat: ' + m.text));
  const ra = await emit(a, 'create', { name: 'Thomas', avatar: '🦊', pid: 'p1' });
  const rb = await emit(b, 'join', { code: ra.code, name: 'Léa', avatar: '🐼', pid: 'p2' });
  console.log('room', ra.code, rb.ok);
  b.emit('settings', { rounds: 50 }); // pas hôte → ignoré
  a.emit('settings', { categories: ['da-fr', 'rock'], rounds: 5, duration: 10 });
  await wait(100);
  console.log('settings', lastRoom.settings.rounds, lastRoom.settings.categories);
  let cur;
  a.on('round', r => cur = r);
  a.emit('start');
  await wait(3800);
  // la bonne réponse n'est pas envoyée au client : on teste avec le format mock connu
  const t = `${cur.cat === 'da-fr' ? 'Dessins animés FR' : 'Rock'} chanson`;
  b.emit('chat', 'Dorothée ?'); // pourrait être bloqué si c'est la réponse
  const g1 = await emit(a, 'guess', 'zzzz');
  console.log('wrong guess', g1);
  // force: deviner tous artistes possibles
  for (const art of ['Dorothée', 'Jean-Jacques Goldman', 'Daft Punk', 'Céline Dion', 'Stromae', 'Indochine', 'IAM', 'Queen', 'ABBA', 'Michael Jackson', 'Angèle', 'Noir Désir']) {
    const r = await emit(a, 'guess', art); if (r.artist) { console.log('artist found', art, r.gained); break; }
  }
  for (let i = 1; i <= 30; i++) { const r = await emit(a, 'guess', `${t} ${i}`); if (r.title) { console.log('title found', i, r.gained); break; } }
  await wait(12000);
  console.log(log.join('\n'));
  console.log('scores', lastRoom.players.map(p => p.name + ':' + p.score));
  a.emit('stop'); await wait(100);
  a.emit('settings', { mode: 'qcm', rounds: 5 }); await wait(50);
  let q; a.on('round', r => q = r); a.emit('start'); await wait(3700);
  console.log('qcm choices', q.choices.length, q.choices.map(c => c.artist));
  await emit(a, 'choose', q.choices[0].id); await emit(b, 'choose', q.choices[1].id);
  await wait(800);
  console.log('phase after all answered', lastRoom.phase, lastRoom.players.map(p => p.name + ':' + p.score));
  process.exit(0);
})();
