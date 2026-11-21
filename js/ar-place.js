/* ar-place.js: tap-to-place camera mode (works on iPad Safari, no Quick Look needed).
   A live camera behind a transparent 3D model drawn at its true apparent size.
   The virtual camera uses the same field of view as the real one (about 62 degrees along the long side of the screen)
   and looks down at the floor from hand-held height, so the size is believable at the chosen distance.
   Needs window.ARCore from ar.js: { BASE, esc, loadViewer }. */
(function () {
  'use strict';
  var placeEl = null, placeStream = null, onResize = null;

  function closePlace() {
    if (onResize) { window.removeEventListener('resize', onResize); onResize = null; }
    if (placeStream) { placeStream.getTracks().forEach(function (t) { t.stop(); }); placeStream = null; }
    if (placeEl) { placeEl.remove(); placeEl = null; }
    document.body.classList.remove('ar-open');
  }

  window.openPlace = function (m) {
    var C = window.ARCore; if (!C) return;
    var esc = C.esc, BASE = C.BASE;
    closePlace();
    var LONG_FOV = 62, EYE = 1.4, RAD = Math.PI / 180;
    var st = { x: 0, y: 0, D: Math.max(3, Math.min(60, m.len * 1.2)), theta: -90 };
    placeEl = document.createElement('div');
    placeEl.className = 'ar-place';
    placeEl.setAttribute('role', 'dialog'); placeEl.setAttribute('aria-modal', 'true'); placeEl.setAttribute('aria-label', 'Place ' + m.name + ' in your room');
    placeEl.innerHTML =
      '<video class="ar-place-video" playsinline muted autoplay></video>' +
      '<div class="ar-place-stage"></div>' +
      '<div class="ar-place-hint">Point your camera at the floor, then <b>tap</b> where the ' + esc(m.nick) + ' should stand.<br>Drag to move it. Pinch to change the distance.</div>' +
      '<div class="ar-place-hud">' +
      '<div class="ar-place-row"><button type="button" class="ar-pbtn" data-a="close">✕ Close</button>' +
      '<button type="button" class="ar-pbtn" data-a="left" aria-label="Turn left">⟲ Turn</button><button type="button" class="ar-pbtn" data-a="right" aria-label="Turn right">Turn ⟳</button>' +
      '<button type="button" class="ar-pbtn" data-a="photo">📸 Photo</button></div>' +
      '<label class="ar-place-dist"><span>Distance: <b class="ar-dist-val"></b></span><input type="range" min="2" max="60" step="0.5" aria-label="Distance to the dinosaur in metres"></label>' +
      '<div class="ar-place-clips"></div><p class="ar-place-msg" aria-live="polite"></p></div>';
    document.body.appendChild(placeEl);
    document.body.classList.add('ar-open');
    var video = placeEl.querySelector('video'), stage = placeEl.querySelector('.ar-place-stage'), msg = placeEl.querySelector('.ar-place-msg');
    var range = placeEl.querySelector('input[type=range]'), distEl = placeEl.querySelector('.ar-dist-val'), clipsEl = placeEl.querySelector('.ar-place-clips');
    var W = 0, H = 0, S = 0, mv = null;

    function layout() {
      if (!placeEl) return;
      W = placeEl.clientWidth; H = placeEl.clientHeight; S = Math.round(2.2 * Math.max(W, H));
      var vfov = H >= W ? LONG_FOV : 2 * Math.atan(Math.tan(LONG_FOV / 2 * RAD) * H / W) / RAD;
      var fovEl = 2 * Math.atan((S / H) * Math.tan(vfov / 2 * RAD)) / RAD;
      if (mv) {
        mv.style.width = S + 'px'; mv.style.height = S + 'px';
        mv.style.left = Math.round(st.x - S / 2) + 'px'; mv.style.top = Math.round(st.y - S / 2) + 'px';
        var phi = 90 - Math.atan(EYE / st.D) / RAD, R = Math.sqrt(st.D * st.D + EYE * EYE);
        mv.setAttribute('field-of-view', Math.min(150, fovEl).toFixed(1) + 'deg');
        mv.setAttribute('camera-orbit', st.theta + 'deg ' + phi.toFixed(1) + 'deg ' + R.toFixed(2) + 'm');
        if (mv.jumpCameraToGoal) mv.jumpCameraToGoal();
      }
      range.value = st.D; distEl.textContent = st.D.toFixed(1) + ' m away';
    }
    onResize = layout; window.addEventListener('resize', onResize);

    st.x = placeEl.clientWidth / 2; st.y = placeEl.clientHeight * 0.6;

    C.loadViewer().then(function () {
      if (!placeEl) return;
      mv = document.createElement('model-viewer');
      mv.setAttribute('src', BASE + m.id + '.glb');
      mv.setAttribute('autoplay', ''); mv.setAttribute('animation-name', m.def);
      mv.setAttribute('camera-target', '0m 0m 0m');
      mv.setAttribute('min-camera-orbit', 'auto 0deg 0.1m'); mv.setAttribute('max-camera-orbit', 'auto 180deg 500m');
      mv.setAttribute('min-field-of-view', '5deg'); mv.setAttribute('max-field-of-view', '160deg');
      mv.setAttribute('shadow-intensity', '1'); mv.setAttribute('shadow-softness', '0.9'); mv.setAttribute('exposure', '1.05');
      mv.setAttribute('alt', 'A 3D ' + m.name + ' on your camera view');
      mv.className = 'ar-place-mv';
      stage.appendChild(mv);
      clipsEl.innerHTML = m.clips.length > 1 ? m.clips.map(function (n) {
        return '<button type="button" class="ar-pbtn' + (n === m.def ? ' on' : '') + '" data-clip="' + esc(n) + '">' + esc(n) + '</button>';
      }).join('') : '';
      layout();
    }).catch(function () { msg.textContent = 'The 3D viewer could not load.'; });
    layout();

    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(function (s) {
      if (!placeEl) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      placeStream = s; video.srcObject = s; video.play().catch(function () { });
    }).catch(function () {
      msg.textContent = 'The camera is blocked. On iPad: Settings, Safari, Camera, and allow it for this site. You can still move the dinosaur around.';
      if (placeEl) placeEl.classList.add('no-cam');
    });

    /* touch: tap/drag moves it, two fingers change the distance */
    var ptr = {}, pinch0 = null;
    function count() { return Object.keys(ptr).length; }
    function pts() { return Object.keys(ptr).map(function (k) { return ptr[k]; }); }
    stage.addEventListener('pointerdown', function (e) {
      if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (x) { } }
      ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
      placeEl.classList.add('placed');
      if (count() === 1) { st.x = e.clientX; st.y = e.clientY; layout(); }
      else if (count() === 2) { var p = pts(); pinch0 = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), D: st.D }; }
      e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!ptr[e.pointerId]) return;
      ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (count() === 1) { st.x = e.clientX; st.y = e.clientY; layout(); }
      else if (count() === 2 && pinch0) {
        var p = pts(), d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        st.D = Math.max(2, Math.min(60, pinch0.D * pinch0.d / Math.max(20, d))); layout();
      }
      e.preventDefault();
    });
    function up(e) { delete ptr[e.pointerId]; if (count() < 2) pinch0 = null; }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    range.addEventListener('input', function () { st.D = parseFloat(range.value); layout(); });

    function snap() {
      var c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      var g = c.getContext('2d'); g.scale(dpr, dpr);
      g.fillStyle = '#222'; g.fillRect(0, 0, W, H);
      if (video.videoWidth) {
        var s = Math.max(W / video.videoWidth, H / video.videoHeight), vw = video.videoWidth * s, vh = video.videoHeight * s;
        g.drawImage(video, (W - vw) / 2, (H - vh) / 2, vw, vh);
      }
      return Promise.resolve(mv && mv.toBlob ? mv.toBlob({ mimeType: 'image/png', idealAspect: false }) : null)
        .then(function (blob) { return blob ? createImageBitmap(blob) : null; })
        .then(function (bmp) {
          if (bmp) g.drawImage(bmp, st.x - S / 2, st.y - S / 2, S, S);
          return new Promise(function (res) { c.toBlob(res, 'image/jpeg', 0.92); });
        });
    }
    placeEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a],[data-clip]'); if (!b) return;
      var a = b.getAttribute('data-a'), clip = b.getAttribute('data-clip');
      if (a === 'close') { closePlace(); }
      else if (a === 'left') { st.theta -= 25; layout(); }
      else if (a === 'right') { st.theta += 25; layout(); }
      else if (a === 'photo') {
        msg.textContent = 'Taking a photo…';
        snap().then(function (blob) {
          if (!blob) { msg.textContent = 'Could not take the photo.'; return; }
          var file = new File([blob], m.id + '-in-my-room.jpg', { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) { return navigator.share({ files: [file], title: m.name }).then(function () { msg.textContent = ''; }); }
          window.open(URL.createObjectURL(blob), '_blank'); msg.textContent = 'Photo opened in a new tab. Press and hold it to save.';
        }).catch(function () { msg.textContent = 'Could not save the photo here.'; });
      } else if (clip && mv) {
        mv.animationName = clip; mv.play();
        Array.prototype.forEach.call(clipsEl.children, function (x) { x.classList.toggle('on', x === b); });
      }
    });
  };
})();
