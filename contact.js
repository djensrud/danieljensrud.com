/* ==========================================================
   Contact form: sends the message without leaving the page.
   The messages are delivered by the free FormSubmit service to the address below.
   (First message ever: FormSubmit emails hello@danieljensrud.com a one-time "activate" link. Click it once and you're set.)
   ========================================================== */
(function () {
  var TO = 'hello@danieljensrud.com';                         /* where messages go */
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  var wrap = document.getElementById('form-wrap');
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('status');
  var sent = document.getElementById('sent');
  var btn = form.querySelector('.send');
  var label = btn.querySelector('.send-text');

  function setBusy(busy) {
    btn.disabled = busy;
    label.textContent = busy ? 'Sending…' : 'Send message';
  }
  function showError() {
    statusEl.textContent = '';
    statusEl.appendChild(document.createTextNode("That didn't go through. Please try again, or email me at "));
    var a = document.createElement('a');
    a.href = 'mailto:' + TO;
    a.textContent = TO;
    statusEl.appendChild(a);
    statusEl.appendChild(document.createTextNode('.'));
  }
  function showSent() {
    statusEl.textContent = '';
    wrap.classList.add('is-sent');
    document.querySelector('.contact').classList.add('is-done');
    sent.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    statusEl.textContent = '';
    var f = form.elements;
    if (f._honey && f._honey.value) { showSent(); return; }     /* a robot filled the hidden field: pretend it worked */

    var subject = f.subject.value.trim();
    var payload = {
      email: f.email.value.trim(),
      subject: subject,
      message: f.message.value.trim(),
      _subject: 'New message from danieljensrud.com: ' + subject,
      _template: 'table',
      _captcha: 'false'
    };

    setBusy(true);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, j: j }; }); })
      .then(function (r) {
        if (r.ok && (r.j.success === true || r.j.success === 'true')) { form.reset(); showSent(); }
        else showError();
      })
      .catch(showError)
      .then(function () { clearTimeout(timer); setBusy(false); });
  });

  document.getElementById('again').addEventListener('click', function () {
    wrap.classList.remove('is-sent');
    document.querySelector('.contact').classList.remove('is-done');
    form.elements.email.focus();
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) setBusy(false); });
})();
