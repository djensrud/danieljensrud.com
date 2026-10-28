/* ==========================================================
   Hamburger menu (phones). Opens/closes the menu and keeps it tidy.
   ========================================================== */
(function () {
  var html = document.documentElement;
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    html.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    var firstLink = menu.querySelector('a');
    if (open && firstLink) firstLink.setAttribute('tabindex', '0');
  }

  toggle.addEventListener('click', function () { setOpen(!html.classList.contains('menu-open')); });

  /* tapping the empty background, or a link to the page you're already on, closes it */
  menu.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a || a.getAttribute('aria-current') === 'page') setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && html.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
  });
  /* rotating the phone / widening the window, or coming back with the Back button */
  window.addEventListener('resize', function () { if (innerWidth > 860) setOpen(false); });
  window.addEventListener('pageshow', function () { setOpen(false); });
})();
