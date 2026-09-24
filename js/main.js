(function () {
  'use strict';

  var S = window.SITE || {};
  function $(id) { return document.getElementById(id); }

  /* ---------- Apply settings.js ---------- */
  var ig = String(S.instagram || '').replace(/^@/, '').trim();
  if (ig && $('ig-link')) $('ig-link').href = 'https://instagram.com/' + encodeURIComponent(ig);

  var mail = String(S.email || '').trim();
  if (mail && $('mail-link')) $('mail-link').href = 'mailto:' + mail;

  var status = $('status-text');
  if (status && typeof S.availability === 'string') {
    if (S.availability.trim() === '') status.parentNode.hidden = true;
    else status.textContent = S.availability;
  }

  /* ---------- Discord window ---------- */
  var dUser = String(S.discordUsername || '').trim();
  var dId = String(S.discordId || '').replace(/\D/g, '');
  var btn = $('discord-btn'), dlg = $('discord-dlg');

  if (btn && dlg) {
    var copyBtn = $('dlg-copy'), openLink = $('dlg-open');
    $('dlg-name').textContent = dUser;
    if (!dUser) copyBtn.hidden = true;
    if (dId) { openLink.href = 'https://discord.com/users/' + dId; openLink.hidden = false; }

    btn.addEventListener('click', function () {
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else window.prompt('My Discord username (copy it):', dUser);
    });

    // close: CLOSE button, or a click on the dark area outside the window
    dlg.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-close]')) { dlg.close(); return; }
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
    });

    var timer;
    var label = copyBtn.textContent;
    function flash(t) {
      copyBtn.textContent = t;
      clearTimeout(timer);
      timer = setTimeout(function () { copyBtn.textContent = label; }, 1800);
    }
    function legacyCopy(t) {
      var a = document.createElement('textarea');
      a.value = t; a.setAttribute('readonly', ''); a.style.cssText = 'position:fixed;top:0;opacity:0';
      dlg.appendChild(a); a.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) {}
      dlg.removeChild(a);
      return ok ? Promise.resolve() : Promise.reject();
    }
    function copyText(t) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(t).catch(function () { return legacyCopy(t); });
      }
      return legacyCopy(t);
    }
    copyBtn.addEventListener('click', function () {
      copyText(dUser).then(function () { flash('Copied'); }, function () { flash('Select the name above'); });
    });
  }

  /* ---------- Footer year ---------- */
  var y = $('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Nav background after a little scroll ---------- */
  var nav = $('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal images as they enter the viewport ---------- */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
