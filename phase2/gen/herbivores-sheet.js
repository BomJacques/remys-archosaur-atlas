// writes phase2/sheets/herbivores.html (contact sheet; loads ../out/art2-herbivores.js)
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'sheets');
fs.mkdirSync(dir, { recursive: true });
const html = `<!doctype html><meta charset="utf-8"><title>herbivores sheet</title>
<style>body{margin:0;background:#cfd9e4;font:12px sans-serif}
#g{display:grid;grid-template-columns:repeat(auto-fill,minmax(760px,1fr));gap:10px;padding:10px}
.c{background:linear-gradient(#e9f1f7,#c3d2de);border-radius:8px;padding:4px;position:relative}
.c b{position:absolute;left:8px;top:4px;color:#345}
.c svg{width:100%;display:block}
#s{display:flex;flex-wrap:wrap;gap:8px;padding:10px;background:#1c2540}
#s div{width:120px;background:#2b3760;border-radius:6px}#s svg{width:120px;display:block}
</style><div id="g"></div><div id="s"></div>
<script src="../out/art2-herbivores.js"></script>
<script>
var ids=(location.hash.slice(1)||Object.keys(ART).join(',')).split(',');
ids.forEach(function(id){if(!ART[id])return;var d=document.createElement('div');d.className='c';d.innerHTML='<b>'+id+' '+Math.round(ART[id].length/1024)+'KB</b>'+ART[id];g.appendChild(d);
var e=document.createElement('div');e.innerHTML=ART[id];s.appendChild(e);});
</script>`;
fs.writeFileSync(path.join(dir, 'herbivores.html'), html);
console.log('sheet written');
