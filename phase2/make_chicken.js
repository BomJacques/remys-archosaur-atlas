// Generates phase2/chicken-test.svg  (node make_chicken.js)
const fs = require('fs');
const f = n => Math.round(n * 10) / 10;
let o = [];
const add = s => o.push(s);

add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="A stylised illustration of a rooster">`);
add(`<defs>
<radialGradient id="bg" cx="50%" cy="42%" r="65%"><stop offset="0" stop-color="#3a4a8f"/><stop offset=".6" stop-color="#232d63"/><stop offset="1" stop-color="#141a3d"/></radialGradient>
<linearGradient id="body" x1="0.2" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#E4743A"/><stop offset=".55" stop-color="#C4492A"/><stop offset="1" stop-color="#8A2F2E"/></linearGradient>
<linearGradient id="wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B3411F"/><stop offset="1" stop-color="#7A2A28"/></linearGradient>
<linearGradient id="hack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC247"/><stop offset="1" stop-color="#EE8A2E"/></linearGradient>
<linearGradient id="tealF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E3F78"/><stop offset=".5" stop-color="#1F8E8A"/><stop offset="1" stop-color="#35C9A8"/></linearGradient>
<linearGradient id="blueF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A2A78"/><stop offset=".55" stop-color="#2A5FA8"/><stop offset="1" stop-color="#3FB6D8"/></linearGradient>
<linearGradient id="rustF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A2A28"/><stop offset="1" stop-color="#D8643A"/></linearGradient>
<linearGradient id="comb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5F7A"/><stop offset="1" stop-color="#D42648"/></linearGradient>
<linearGradient id="leg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F7C04A"/><stop offset="1" stop-color="#D98F26"/></linearGradient>
<clipPath id="bodyClip"><path id="bodyShape" d="M258,318 C250,250 320,215 405,222 C465,228 505,235 525,205 C543,180 551,165 556,150 L626,150 C640,200 652,250 648,300 C652,380 590,445 470,458 C360,470 268,432 258,318 Z"/></clipPath>
<clipPath id="wingClip"><path d="M300,285 C380,248 485,268 505,342 C498,402 412,436 335,408 C284,382 274,322 300,285 Z"/></clipPath>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>`);

// backdrop (separate group so the app can drop it)
add(`<g id="backdrop"><circle cx="400" cy="300" r="290" fill="url(#bg)"/>`);
const stars = [[130,130,3],[190,80,2],[620,70,3],[690,170,2],[110,330,2],[700,380,3],[160,470,2],[640,500,2],[300,60,2],[520,40,2]];
stars.forEach(([x,y,r]) => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="#9fb3ff" opacity=".55"/>`));
add(`</g>`);

// ground shadow
add(`<ellipse cx="420" cy="566" rx="230" ry="24" fill="#0a0e26" opacity=".55"/>`);

// ---------- tail fan ----------
function feather(ox, oy, ang, L, w, bend, fill, lite) {
  const p = `M0,0 C${f(L*.22)},${f(-w*1.15)} ${f(L*.72)},${f(-w*1.0 + bend*.5)} ${f(L)},${f(bend)} C${f(L*.78)},${f(w*.9 + bend*.55)} ${f(L*.26)},${f(w*1.1)} 0,0 Z`;
  add(`<g transform="translate(${ox} ${oy}) rotate(${ang})"><path d="${p}" fill="${fill}"/>` +
      `<path d="M${f(L*.06)},0 Q${f(L*.55)},${f(bend*.35)} ${f(L*.96)},${f(bend*.97)}" stroke="${lite}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>` +
      [0.25,0.4,0.55,0.7,0.84].map(t => {
        const x = L*t, y = bend*t*t*0.9;
        return `<path d="M${f(x)},${f(y)} l${f(L*.06)},${f(-w*.55)} M${f(x)},${f(y)} l${f(L*.06)},${f(w*.55)}" stroke="${lite}" stroke-width="2" opacity=".35" fill="none" stroke-linecap="round"/>`;
      }).join('') + `</g>`);
}
const TX = 268, TY = 312;
feather(TX, TY, 244, 150, 24, 30, 'url(#rustF)', '#F4A56A');
feather(TX, TY, 150+60, 160, 26, 36, 'url(#rustF)', '#F4A56A');
feather(TX, TY, 238, 235, 30, 62, 'url(#blueF)', '#8FE3F5');
feather(TX, TY, 222, 255, 32, 66, 'url(#tealF)', '#9BF2D6');
feather(TX, TY, 206, 262, 30, 58, 'url(#blueF)', '#8FE3F5');
feather(TX, TY, 190, 235, 28, 44, 'url(#tealF)', '#9BF2D6');
feather(TX, TY, 174, 190, 24, 24, 'url(#blueF)', '#8FE3F5');

// ---------- legs ----------
// far leg (shade) is drawn first, a little higher and with shorter toes so it sits BEHIND the near foot without crossing it
function leg(x, shade, dy, ts) {
  const c1 = shade ? '#C98A2A' : 'url(#leg)';
  const toe = shade ? '#B87A22' : '#EBA935';
  const claw = shade ? '#6E4A18' : '#8F5F1A';
  const g = [];
  const foot = 536 - dy;
  g.push(`<path d="M${x-10},425 L${x+10},425 L${x+7},${foot} L${x-8},${foot} Z" fill="${c1}"/>`);
  for (let y = 440; y < foot - 4; y += 11) g.push(`<path d="M${x-8},${y} Q${x},${y+5} ${x+8},${y}" stroke="${shade?'#9C6A1E':'#C98A2A'}" stroke-width="2" fill="none" opacity=".8"/>`);
  const tx = x - 1, ty = foot + 1;
  const toes = [[54*ts,16*ts],[42*ts,27*ts],[48*ts,2*ts]];
  toes.forEach(([dx,dy2]) => g.push(`<path d="M${tx},${ty} L${f(tx+dx)},${f(ty+dy2)}" stroke="${toe}" stroke-width="${shade?11:13}" stroke-linecap="round"/>`));
  g.push(`<path d="M${tx},${ty} L${f(tx-26*ts)},${f(ty+12*ts)}" stroke="${toe}" stroke-width="${shade?9:11}" stroke-linecap="round"/>`);
  toes.forEach(([dx,dy2]) => g.push(`<circle cx="${f(tx+dx+3)}" cy="${f(ty+dy2+1)}" r="${shade?4.6:5.5}" fill="${claw}"/>`));
  g.push(`<circle cx="${f(tx-28*ts)}" cy="${f(ty+13*ts)}" r="4.4" fill="${claw}"/>`);
  g.push(`<circle cx="${x}" cy="${foot}" r="${shade?9:10}" fill="${toe}"/>`);
  return g.join('');
}
add(leg(366, true, 9, 0.8));
add(leg(446, false, 0, 1));

// ---------- body ----------
add(`<use href="#bodyShape" fill="url(#body)"/>`);
add(`<g clip-path="url(#bodyClip)">`);
add(`<ellipse cx="450" cy="470" rx="230" ry="80" fill="#5b1f33" opacity=".45"/>`);
add(`<ellipse cx="400" cy="205" rx="170" ry="34" fill="#FFB267" opacity=".5" filter="url(#soft)"/>`);
for (let r = 0; r < 6; r++) {
  for (let c = 0; c < 6; c++) {
    const x = 470 + c * 30 + (r % 2) * 15, y = 300 + r * 26;
    if (x > 640 || x < 300) continue;
    add(`<path d="M${x-13},${y} Q${x},${y+17} ${x+13},${y}" stroke="#FF9A5A" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".75"/>`);
  }
}
add(`</g>`);

// ---------- thigh ----------
add(`<ellipse cx="440" cy="428" rx="62" ry="50" fill="#A53A25"/>`);
for (let i = 0; i < 4; i++) add(`<path d="M${392+i*26},${418+ (i%2)*8} q13,22 26,0" stroke="#E27A3F" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`);
add(`<path d="M388,440 q50,40 105,0" stroke="#6b2230" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`);

// ---------- wing ----------
add(`<path d="M300,285 C380,248 485,268 505,342 C498,402 412,436 335,408 C284,382 274,322 300,285 Z" fill="url(#wing)"/>`);
add(`<g clip-path="url(#wingClip)">`);
for (let r = 6; r >= 0; r--) {
  for (let c = 0; c < 7; c++) {
    const x = 300 + c * 31 + (r % 2) * 15.5, y = 268 + r * 24;
    const fillc = ['#D25E2E','#C65229','#BA4823','#AE4121','#A23B23','#963628','#8A3030'][r];
    add(`<path d="M${x-15},${y-20} L${x+15},${y-20} L${x+15},${y} C${x+15},${y+14} ${x+6},${y+22} ${x},${y+28} C${x-6},${y+22} ${x-15},${y+14} ${x-15},${y} Z" fill="${fillc}" stroke="#5E2024" stroke-opacity=".45" stroke-width="2"/>`);
    add(`<path d="M${x-11},${y+2} C${x-11},${y+12} ${x-5},${y+18} ${x-1},${y+22}" stroke="#FF9F5E" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="${(0.7 - r*0.07).toFixed(2)}"/>`);
  }
}
add(`<ellipse cx="395" cy="270" rx="95" ry="14" fill="#FFB267" opacity=".35" filter="url(#soft)"/>`);
add(`</g>`);
add(`<path d="M300,285 C380,248 485,268 505,342" stroke="#FF9A5A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`);

// ---------- tail coverts + saddle hackles ----------
for (let i = 0; i < 6; i++) {
  const x = 326 + i * 24, y = 234 - i * 1.5;
  add(`<g transform="translate(${x} ${y}) rotate(${166 + i * 2})"><path d="M0,0 C18,-15 52,-14 80,1 C52,14 18,15 0,0 Z" fill="${i % 2 ? '#F58F2F' : '#FFB43A'}"/><path d="M6,0 L70,1" stroke="#FFE08A" stroke-width="1.8" opacity=".55" stroke-linecap="round"/></g>`);
}
feather(TX + 14, TY - 4, 196, 96, 21, 16, 'url(#tealF)', '#9BF2D6');
feather(TX + 14, TY - 2, 216, 100, 22, 20, 'url(#blueF)', '#8FE3F5');
feather(TX + 14, TY, 238, 84, 20, 18, 'url(#tealF)', '#9BF2D6');
// ---------- neck hackles ----------
function hackle(x, y, ang, L, w, fill) {
  add(`<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0,0 C${f(L*.3)},${f(-w)} ${f(L*.8)},${f(-w*.7)} ${f(L)},0 C${f(L*.8)},${f(w*.7)} ${f(L*.3)},${f(w)} 0,0 Z" fill="${fill}"/><path d="M${f(L*.1)},0 L${f(L*.9)},0" stroke="#FFE08A" stroke-width="2" opacity=".7" stroke-linecap="round"/></g>`);
}
const neck = [];
for (let row = 0; row < 5; row++) {
  for (let i = 0; i < 6; i++) {
    const x = 540 + i * 16 + (row % 2) * 8 - row * 2;
    const y = 168 + row * 28;
    neck.push([x, y, 78 + (i - 3) * 3, 58 - row * 2, 17]);
  }
}
neck.forEach(([x,y,a,L,w], i) => hackle(x, y, a, L, w, i % 3 === 0 ? '#FFB43A' : 'url(#hack)'));
for (let i = 0; i < 7; i++) hackle(470 + i * 14, 235 + (i % 2) * 10, 70 + i * 4, 56, 16, i % 2 ? '#F58F2F' : 'url(#hack)');

// ---------- head ----------
add(`<circle cx="594" cy="118" r="46" fill="#E24B2C"/>`);
add(`<path d="M566,96 C575,70 610,66 628,92" stroke="#FF9A5A" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`);
add(`<g fill="url(#comb)"><circle cx="566" cy="80" r="17"/><circle cx="588" cy="67" r="19"/><circle cx="612" cy="70" r="18"/><circle cx="630" cy="86" r="14"/><path d="M556,88 L640,92 L632,112 L560,108 Z"/></g>`);
add(`<path d="M575,70 q10,-8 22,-4 M605,66 q10,0 16,6" stroke="#FFB0BE" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`);
add(`<ellipse cx="606" cy="122" rx="30" ry="26" fill="#F25A3A"/>`);
add(`<ellipse cx="588" cy="140" rx="9" ry="13" fill="#F6E7D0"/>`);
add(`<path d="M628,102 L682,122 L630,129 Z" fill="#FFCE4A"/><path d="M630,129 L672,136 L634,145 Z" fill="#E9A92B"/>`);
add(`<path d="M640,116 l8,2" stroke="#B9791A" stroke-width="3" stroke-linecap="round"/><path d="M632,129 L676,129" stroke="#B9791A" stroke-width="2.5" opacity=".6"/>`);
add(`<path d="M632,142 C656,148 658,190 636,196 C616,190 614,158 632,142 Z" fill="#D42648"/><path d="M634,152 C645,160 644,178 636,184" stroke="#FF7C93" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`);
add(`<circle cx="610" cy="108" r="12" fill="#FFC247"/><circle cx="611" cy="108" r="7.5" fill="#1a1630"/><circle cx="614" cy="105" r="2.8" fill="#fff"/><path d="M597,98 Q610,92 622,99" stroke="#8a2a22" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`);

add(`<path d="M648,300 C652,380 590,445 470,458" stroke="#FF9A5A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`);
add(`</svg>`);
fs.writeFileSync(__dirname + '/chicken-test.svg', o.join('\n'));
console.log('written', o.join('\n').length, 'bytes');
