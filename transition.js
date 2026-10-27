/* ==========================================================
   Page transitions. Two versions:
     "home" : plays when you click the logo to go back to the homepage
     "page" : plays for every other internal link (homepage buttons, etc.)
   How it works: when you click a link, the exit animation plays, then the next page opens and plays the
   matching "arrive" animation. Nothing is stored on your computer except a tiny flag in window.name.
   To make a link use the "home" version, give it  data-transition="home".
   To skip the animation on a link, give it  data-transition="none".
   People with "reduce motion" turned on in their system settings get no animation.
   ========================================================== */
(function () {
  var html = document.documentElement;
  var TAG = 'dj-tr:';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false;

  /* Did the previous page leave us a note? It is passed three ways (some browsers, like Firefox, drop one or two of
     them when you open local files), so we accept whichever arrives: the address (#dj-tr=...), window.name, or sessionStorage. */
  var pending = null;
  var m = /(?:^|[#&])dj-tr=(home|page)/.exec(location.hash);
  if (m) {
    pending = m[1];
    try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {}   // tidy the address bar
  }
  if (window.name.indexOf(TAG) === 0) { if (!pending) pending = window.name.slice(TAG.length); window.name = ''; }
  try {
    var saved = sessionStorage.getItem(TAG);
    if (saved) { sessionStorage.removeItem(TAG); if (!pending) pending = saved; }
  } catch (e) {}
  if (pending !== 'home' && pending !== 'page') pending = null;
  if (pending && !reduce) html.classList.add('tr-enter');   // keeps the page hidden until the cover is ready

  var NS = 'http://www.w3.org/2000/svg';
  var PIECES = [   /* the three pieces of the logo mark, traced from the logo file */
    '178,59 191,59 287,238 222,238 152,109',
    '42,306 107,306 168,194 136,137',
    '137,306 326,306 300,260 163,260'
  ];
  var OFFSETS = [[70, -90], [-100, 50], [80, 100]];   /* where each piece flies in from / out to (px) */
  var EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.25, 1)';
  var FADE_MS = 700;   /* length of the soft fade-in after a transition (bigger = slower) */
  var EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  function el(cls, parent) {
    var d = document.createElement('div');
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }
  function svgPiece(points) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '34 50 300 264');
    s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'polygon');
    p.setAttribute('points', points);
    s.appendChild(p);
    return s;
  }
  function run(node, frames, opts) {
    opts.fill = 'both';
    return node.animate(frames, opts).finished;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- building blocks ---------- */
  function makeOverlay() {
    var ov = el('tr');
    ov.setAttribute('aria-hidden', 'true');
    ov.style.setProperty('--s', Math.round(innerHeight * 0.56) + 'px');
    html.appendChild(ov);
    return ov;
  }
  function addSlide(ov) {
    var slide = el('tr-slide', ov);
    el('tr-panel', slide);
    el('tr-glow', slide).appendChild(el('tr-line tr-line-lead'));
    el('tr-glow', slide).appendChild(el('tr-line tr-line-trail'));
    return slide;
  }
  function addPieces(ov) {
    var mark = el('tr-mark', ov);
    return PIECES.map(function (pts) { var s = svgPiece(pts); mark.appendChild(s); return s; });
  }
  function addWholeMark(ov) {
    var mark = el('tr-mark', ov);
    PIECES.forEach(function (pts) { mark.appendChild(svgPiece(pts)); });
    return mark;
  }
  function slideX(px) { return 'translateX(' + px + 'px)'; }
  function sOf(ov) { return parseFloat(ov.style.getPropertyValue('--s')); }

  /* ---------- "page": exit + arrive ---------- */
  function pageExit() {
    var ov = makeOverlay(), s = sOf(ov), W = innerWidth + 2 * s;
    var slide = addSlide(ov), pieces = addPieces(ov);
    var jobs = [run(slide, [{ transform: slideX(-W) }, { transform: slideX(-s) }], { duration: 520, easing: EASE_IN_OUT })];
    pieces.forEach(function (p, i) {
      var o = OFFSETS[i];
      jobs.push(run(p, [
        { opacity: 0, transform: 'translate(' + o[0] + 'px,' + o[1] + 'px)' },
        { opacity: 1, transform: 'translate(0,0)' }
      ], { duration: 340, delay: 230 + i * 55, easing: EASE_OUT }));
    });
    return Promise.all(jobs).then(function () { return wait(60); });
  }
  function pageArrive(ov) {
    var s = sOf(ov);
    var slide = ov.querySelector('.tr-slide'), pieces = [].slice.call(ov.querySelectorAll('.tr-mark svg'));
    var jobs = [run(slide, [{ transform: slideX(-s) }, { transform: slideX(innerWidth) }], { duration: 640, delay: 170, easing: EASE_IN_OUT })];
    pieces.forEach(function (p, i) {
      var o = OFFSETS[i];
      jobs.push(run(p, [
        { opacity: 1, transform: 'translate(0,0)' },
        { opacity: 0, transform: 'translate(' + (-o[0]) + 'px,' + (-o[1]) + 'px)' }
      ], { duration: 300, delay: i * 45, easing: 'ease-in' }));
    });
    return Promise.all(jobs);
  }
  function pageCover() {
    var ov = makeOverlay(), s = sOf(ov);
    var slide = addSlide(ov); addPieces(ov);
    slide.style.transform = slideX(-s);
    return ov;
  }

  /* ---------- "home": exit + arrive ---------- */
  function homeExit(link) {
    var r = link.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var ov = makeOverlay();
    var iris = el('tr-iris', ov), mark = addWholeMark(ov);
    var R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 60;
    var markW = mark.getBoundingClientRect().width;
    var s0 = (r.width * 0.8) / markW;
    var dx = cx - innerWidth / 2, dy = cy - innerHeight / 2;
    var ease = 'cubic-bezier(0.7, 0, 0.2, 1)';
    return Promise.all([
      run(iris, [{ clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)' }, { clipPath: 'circle(' + R + 'px at ' + cx + 'px ' + cy + 'px)' }], { duration: 680, easing: ease }),
      run(mark, [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s0 + ')' }, { transform: 'translate(0,0) scale(1)' }], { duration: 680, easing: ease })
    ]).then(function () { return wait(60); });
  }
  function homeCover() {
    var ov = makeOverlay();
    var hole = el('tr-hole', ov); addWholeMark(ov);
    return ov;
  }
  function homeArrive(ov) {
    var hole = ov.querySelector('.tr-hole'), mark = ov.querySelector('.tr-mark');
    var size = Math.max(innerWidth, innerHeight) * 1.8;
    return Promise.all([
      run(hole, [{ width: '2px', height: '2px' }, { width: size + 'px', height: size + 'px' }], { duration: 820, delay: 120, easing: 'cubic-bezier(0.55, 0, 0.2, 1)' }),
      run(mark, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(7)', opacity: 0 }], { duration: 760, delay: 60, easing: 'cubic-bezier(0.6, 0, 0.9, 0.4)' })
    ]);
  }

  /* ---------- arriving on a new page ---------- */
  function arrive() {
    var ov = pending === 'home' ? homeCover() : pageCover();
    var kind = pending;
    html.classList.remove('tr-enter');
    var ready = Promise.race([window.document.fonts ? document.fonts.ready : Promise.resolve(), wait(700)]);
    ready.then(function () { return wait(80); })
      .then(function () {
        /* the page itself fades in softly while the cover clears, so nothing pops in at the end */
        document.body.animate([{ opacity: 0 }, { opacity: 1 }],
          { duration: FADE_MS, delay: kind === 'home' ? 260 : 220, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', fill: 'backwards' });
        return kind === 'home' ? homeArrive(ov) : pageArrive(ov);
      })
      .then(function () { ov.remove(); }, function () { ov.remove(); });
  }
  function onReady() { if (pending && !reduce) arrive(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady); else onReady();

  /* ---------- leaving: intercept clicks on internal links ---------- */
  document.addEventListener('click', function (e) {
    if (reduce || busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var mode = a.getAttribute('data-transition');
    if (mode === 'none') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0 && url.protocol !== 'file:') return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page / #anchor
    e.preventDefault();
    busy = true;
    var kind = mode === 'home' ? 'home' : 'page';
    var go = function () {
      window.name = TAG + kind;
      try { sessionStorage.setItem(TAG, kind); } catch (err) {}
      var next = new URL(url.href);
      next.hash = 'dj-tr=' + kind;
      location.href = next.href;
    };
    var failsafe = setTimeout(go, 1600);
    (kind === 'home' ? homeExit(a) : pageExit()).then(function () { clearTimeout(failsafe); go(); }, go);
  });

  /* Coming back with the browser's Back button: clear any leftover cover. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      busy = false;
      html.classList.remove('tr-enter');
      [].forEach.call(document.querySelectorAll('.tr'), function (n) { n.remove(); });
    }
  });
})();
