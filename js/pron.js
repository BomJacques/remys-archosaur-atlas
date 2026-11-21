/* pron.js: phonetic pronunciations for animal names, plus a "Say it" button.
   Capital letters = the stressed syllable. These are the usual English ways to say the names; scientists differ a little. */
(function () {
  'use strict';

  var BY_ID = {
    'luca': 'LOO-kuh', 'microbial-mat': 'stroh-MAT-uh-lyte', 'pikaia': 'pih-KY-uh', 'tiktaalik': 'tik-TAH-lik', 'acanthostega': 'uh-KAN-thoh-STEE-guh',
    'amniote': 'AM-nee-oht', 'synapsid': 'sih-NAP-sid', 'dimetrodon': 'dy-MET-roh-don', 'cynodont': 'SY-noh-dont',
    'sauropsid': 'sawr-OP-sid', 'lepidosaur': 'LEP-ih-doh-sawr', 'gecko': 'GEK-oh', 'tuatara': 'too-uh-TAH-ruh', 'mosasaur': 'MOH-zuh-sawr',
    'tortoise': 'TOR-tus', 'archosaur': 'AR-koh-sawr', 'pseudosuchian': 'soo-doh-SOO-kee-un', 'postosuchus': 'POHST-oh-SOO-kus',
    'crocodylomorph': 'krok-oh-DY-loh-morf', 'crocodile': 'KROK-uh-dyle', 'alligator': 'AL-ih-gay-ter',
    'avemetatarsalian': 'AY-vee-MET-uh-TAR-say-lee-un', 'pterosaur': 'TAIR-oh-sawr', 'quetzalcoatlus': 'KET-sul-koh-AT-lus',
    'dinosauromorph': 'dy-noh-SAWR-oh-morf', 'dinosaur': 'DY-noh-sawr', 'ornithischian': 'or-nih-THIS-kee-un', 'stegosaurus': 'STEG-oh-SAWR-us',
    'triceratops': 'try-SAIR-uh-tops', 'ankylosaurus': 'ANG-kih-loh-SAWR-us', 'parasaurolophus': 'PAIR-uh-sawr-OL-uh-fus',
    'saurischian': 'sawr-ISS-kee-un', 'sauropodomorph': 'SAWR-oh-POD-oh-morf', 'plateosaurus': 'PLAT-ee-oh-SAWR-us', 'brachiosaurus': 'BRAK-ee-oh-SAWR-us',
    'argentinosaurus': 'AR-jen-TEE-noh-SAWR-us', 'theropod': 'THAIR-oh-pod', 'coelophysis': 'SEE-loh-FY-sis', 'allosaurus': 'AL-oh-SAWR-us',
    'tyrannosaur': 'tih-RAN-oh-sawr', 'trex': 'tih-RAN-oh-SAWR-us rex', 'coelurosaur': 'seh-LOOR-oh-sawr', 'maniraptoran': 'MAN-ih-RAP-tor-un',
    'velociraptor': 'veh-LOSS-ih-RAP-ter', 'microraptor': 'MY-kroh-RAP-ter', 'avialan': 'ay-vee-AY-lan', 'archaeopteryx': 'AR-kee-OP-ter-iks',
    'neornithine': 'nee-OR-nih-theen', 'ostrich': 'OSS-trich', 'passerine': 'PASS-uh-ryne', 'carnotaurus': 'KAR-noh-TOR-us', 'diplodocus': 'dih-PLOD-uh-kus',
    'pteranodon': 'ter-AN-oh-don', 'plesiosaur': 'PLEE-see-oh-sawr', 'ichthyosaur': 'IK-thee-oh-sawr', 'europasaurus': 'yoo-ROH-puh-SAWR-us'
  };
  /* names that are not in the family tree (journeys, etc.), lower case */
  var BY_NAME = {
    'asteriornis': 'ass-TEER-ee-OR-nis', 'bernissartia': 'BER-nis-SAR-tee-uh', 'hesperosuchus': 'HESS-per-oh-SOO-kus', 'messelopython': 'MESS-el-oh-PY-thon',
    'najash': 'NAH-hash', 'hylonomus': 'hy-LON-uh-mus', 'eurotrochilus': 'YOOR-oh-TROK-ih-lus', 'eocypselus': 'EE-oh-sip-SEL-us',
    'teilhardina': 'TAY-har-DEE-nuh', 'australopithecus afarensis': 'AW-strah-loh-PITH-ih-kus af-uh-REN-sis', 'homo erectus': 'HOH-moh ee-REK-tus',
    'tiktaalik': 'tik-TAH-lik', 'acanthostega': 'uh-KAN-thoh-STEE-guh', 'pikaia': 'pih-KY-uh', 'luca': 'LOO-kuh', 'archaeopteryx': 'AR-kee-OP-ter-iks',
    'microbial mats': 'MY-kroh-bee-ul MATS', 'homo sapiens': 'HOH-moh SAY-pee-enz', 'carnotaurus': 'KAR-noh-TOR-us', 'diplodocus': 'dih-PLOD-uh-kus',
    'tyrannosaurus rex': 'tih-RAN-oh-SAWR-us rex', 'pteranodon': 'ter-AN-oh-don'
  };
  var ERAS = {
    hadean: 'HAY-dee-un', archean: 'ar-KEE-un', proterozoic: 'PROH-ter-oh-ZOH-ik', cambrian: 'KAM-bree-un', ordovician: 'or-doh-VISH-un', silurian: 'sih-LOOR-ee-un',
    devonian: 'dih-VOH-nee-un', carboniferous: 'KAR-buh-NIF-er-us', permian: 'PER-mee-un', triassic: 'try-ASS-ik', jurassic: 'juh-RASS-ik',
    cretaceous: 'krih-TAY-shus', paleogene: 'PAY-lee-oh-jeen', pangaea: 'pan-JEE-uh'
  };
  window.PRON = { id: BY_ID, name: BY_NAME, era: ERAS };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var canSpeak = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);

  function lookup(key) {
    if (!key) return '';
    var k = String(key);
    if (BY_ID[k]) return BY_ID[k];
    var n = k.toLowerCase().replace(/\s*\(.*$/, '').trim();
    return BY_NAME[n] || BY_ID[n] || ERAS[n] || '';
  }
  function html(key) {
    var p = lookup(key);
    if (!p) return '';
    return '<span class="pron"><span class="pron-t" title="How to say it">' + esc(p) + '</span>' +
      (canSpeak ? '<button type="button" class="pron-say" data-say="' + esc(p) + '" aria-label="Hear how to say it">Say it</button>' : '') + '</span>';
  }
  function speak(p) {
    if (!canSpeak) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(p).replace(/-/g, ' ').toLowerCase());
      u.rate = 0.72; u.lang = (navigator.language || 'en-AU');
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  window.UI = window.UI || {};
  window.UI.pronHtml = html;
  window.UI.pron = lookup;

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-say]');
    if (b) { e.preventDefault(); e.stopPropagation(); speak(b.getAttribute('data-say')); }
  }, true);

  /* a guide in the Words drawer */
  if (window.DATA && window.DATA.glossary) {
    window.DATA.glossary.push({ term: 'Pronunciation guide', def: 'Names are shown like "tih-RAN-oh-SAWR-us". Say each chunk in turn and say the CAPITAL chunk the loudest. "sawr" sounds like "saw", "y" sounds like the word "eye", and "ee" sounds like the word "see". Scientists sometimes say names slightly differently.' });
  }
})();
