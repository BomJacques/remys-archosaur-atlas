// Converts the reference chicken (make_chicken.js output) into the site art format.
const fs = require('fs'), path = require('path');
const L = require('../lib');
require('../make_chicken.js');
let svg = fs.readFileSync(path.join(__dirname, '..', 'chicken-test.svg'), 'utf8');
svg = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
L.writeFile('chicken', { chicken: L.wrap('chicken', svg, { label: 'A rooster' }) });
