// Generator for group "theropods": node phase2/gen/theropods.js
const fs = require('fs'), path = require('path');
const L = require('../lib');
const art = {};
const labels = {};
function reg(id, label, inner) { art[id] = L.wrap(id, inner, { label }); }

const only = process.argv[2];
const A = require('./theropods-a');
const mods = [['./theropods-a', A]];
try { mods.push(['./theropods-b', require('./theropods-b')]); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
try { mods.push(['./theropods-c', require('./theropods-c')]); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
const LAB = {
  trex: 'Tyrannosaurus rex, a huge tyrannosaur with a giant head and two-fingered arms',
  tyrannosaur: 'A fuzzy tyrannosaur like Yutyrannus',
  allosaurus: 'Allosaurus, a Jurassic hunter with three-fingered hands and brow crests',
  coelophysis: 'Coelophysis, a slim early theropod',
  velociraptor: 'Velociraptor, a feathered turkey-sized raptor with a raised sickle claw',
  microraptor: 'Microraptor, a four-winged glider with iridescent black feathers',
  coelurosaur: 'A Sinosauropteryx-like coelurosaur with a ringed tail and downy fuzz',
  maniraptoran: 'A Caudipteryx-like maniraptoran with wing quills and a fan tail',
  theropod: 'A theropod with a smaller faded sibling',
  dinosaur: 'An early small dinosaur like Eoraptor with a faded question-mark ancestor',
  'skeleton-bird-vs-trex': 'Skeletons compared: T. rex on the left and a pigeon on the right'
};
const ids = Object.keys(LAB);
mods.forEach(([, m]) => { Object.keys(m).forEach(k => { const id = k.replace(/_/g, '-'); if (LAB[id]) reg(id, LAB[id], m[k]()); }); });
L.writeFile('theropods', art);

// contact sheet
const cell = id => `<div class="c"><div class="big">${art[id]}</div><div class="sm">${art[id]}</div><b>${id} ${Math.round(art[id].length / 1024 * 10) / 10}KB</b></div>`;
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#e9ecf3;font:12px sans-serif}.g{display:flex;flex-wrap:wrap;gap:10px;padding:10px}.c{background:#fff;border-radius:8px;padding:6px;width:${only ? 600 : 560}px;position:relative}.big svg{width:100%;height:auto;background:#cfe6f2}.sm{position:absolute;right:10px;top:10px;width:120px}.sm svg{width:120px;height:auto;background:#cfe6f2}</style><div class="g">${(only ? only.split(',') : ids).filter(i => art[i]).map(cell).join('')}</div>`;
fs.mkdirSync(path.join(__dirname, '..', 'sheets'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'sheets', 'theropods.html'), html);
