/* ==========================================================
   Homepage background video.
   The real <video> element is hidden (tiny and invisible) and its picture is painted onto a <canvas>.
   A canvas can never show a player: no play button, no controls, no picture-in-picture, in any browser.
   Until the video is really playing, you just see the still image (assets/poster.jpg).
   ========================================================== */
(function () {
  var v = document.querySelector('.bg-video');
  var c = document.querySelector('.bg-canvas');
  if (!v || !c || !c.getContext) return;
  var ctx = c.getContext('2d', { alpha: false });
  if (!ctx) return;

  /* make sure the video can never have controls */
  v.controls = false; v.removeAttribute('controls');
  v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
  v.setAttribute('playsinline', ''); v.setAttribute('disablepictureinpicture', '');

  var running = false, shown = false;

  function size() {                                    /* canvas resolution = screen size (max 1280 wide, plenty for this soft clip) */
    var w = Math.min(1280, Math.max(2, Math.round(innerWidth)));
    var h = Math.max(2, Math.round(w * innerHeight / innerWidth));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  }
  function draw() {
    if (v.readyState < 2 || !v.videoWidth) return;
    var cw = c.width, ch = c.height, vw = v.videoWidth, vh = v.videoHeight;
    var s = Math.max(cw / vw, ch / vh), sw = cw / s, sh = ch / s;      /* "cover": fill the screen, crop the overflow */
    ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, cw, ch);
    if (!shown && !v.paused) { shown = true; c.classList.add('is-playing'); }
  }
  function loop() {
    if (!running) return;
    draw();
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(loop); else requestAnimationFrame(loop);
  }
  function start() { if (running) return; running = true; size(); loop(); }

  v.addEventListener('playing', start);
  v.addEventListener('pause', function () { running = false; });
  v.addEventListener('ended', function () { running = false; });
  window.addEventListener('resize', function () { size(); draw(); });

  function tryPlay() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  tryPlay();
  v.addEventListener('canplay', tryPlay);
  if (!v.paused && v.readyState > 2) start();
  ['touchstart', 'pointerdown', 'keydown', 'scroll'].forEach(function (t) {
    window.addEventListener(t, tryPlay, { once: true, passive: true });   /* some phones only allow playback after the first touch */
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { tryPlay(); if (!v.paused) start(); } });
  window.addEventListener('pageshow', function () { tryPlay(); if (!v.paused) start(); });
})();
