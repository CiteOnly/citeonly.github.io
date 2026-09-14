/* Progressive enhancement only. The page is complete without this file. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* menu */
  var t = document.querySelector('.nav-toggle');
  var l = document.getElementById('nav-list');
  if (t && l) t.addEventListener('click', function () {
    var open = t.getAttribute('aria-expanded') === 'true';
    t.setAttribute('aria-expanded', String(!open));
    l.classList.toggle('open', !open);
  });

  /* reveals: open on hover with a fine pointer, close when the pointer leaves unless clicked; tap toggles */
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('details.reveal').forEach(function (d) {
      var sum = d.querySelector('summary');
      if (!sum) return;
      var pinned = false, byHover = false, tm;
      d.addEventListener('mouseenter', function () {
        clearTimeout(tm);
        tm = setTimeout(function () { if (!d.open) { d.open = true; byHover = true; } }, 90);
      });
      d.addEventListener('mouseleave', function () {
        clearTimeout(tm);
        if (d.open && byHover && !pinned) d.open = false;
        byHover = false;
      });
      sum.addEventListener('click', function (e) {
        if (d.open && byHover && !pinned) { e.preventDefault(); pinned = true; byHover = false; return; } // keep it open
        pinned = !d.open;                                                                                // opening by click pins it
      });
    });
  }

  /* figures: count up, dots fill, bars grow, rings draw, when the section comes into view */
  var sections = document.querySelectorAll('[data-anim]');
  if (!sections.length || reduce || !('IntersectionObserver' in window)) return;
  var NUM = /^([^\d]*)([\d,]+)(.*)$/;
  function ease(x) { return 1 - Math.pow(1 - x, 3); }
  function prepare(sec) {
    sec.querySelectorAll('.count').forEach(function (el) {
      var m = NUM.exec(el.textContent.trim());
      if (!m) return;
      el.dataset.final = el.textContent;
      el.dataset.pre = m[1]; el.dataset.val = m[2].replace(/,/g, ''); el.dataset.post = m[3]; el.dataset.comma = m[2].indexOf(',') >= 0 ? '1' : '';
      el.textContent = m[1] + '0' + m[3];
    });
    sec.querySelectorAll('.dots i.x').forEach(function (i) { i.classList.remove('x'); i.classList.add('will'); });
    sec.querySelectorAll('.bar i').forEach(function (i) { i.dataset.w = i.style.width; i.style.width = '0'; });
    sec.querySelectorAll('.ring .arc').forEach(function (a) { a.dataset.v = a.style.getPropertyValue('--v'); a.style.setProperty('--v', '0'); });
  }
  function fmt(n, comma) { var s = String(n); return comma ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s; }
  function go(sec) {
    sec.querySelectorAll('.count').forEach(function (el) {
      if (!el.dataset.final) return;
      var v = +el.dataset.val, t0 = null, dur = 1100;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = el.dataset.pre + fmt(Math.round(v * ease(p)), el.dataset.comma) + el.dataset.post;
        if (p < 1) requestAnimationFrame(frame); else el.textContent = el.dataset.final;
      }
      requestAnimationFrame(frame);
    });
    sec.querySelectorAll('.dots').forEach(function (g) {
      g.querySelectorAll('i.will').forEach(function (i, k) { setTimeout(function () { i.classList.remove('will'); i.classList.add('x'); }, 250 + k * 28); });
    });
    sec.querySelectorAll('.bar i').forEach(function (i) { i.style.width = i.dataset.w; });
    sec.querySelectorAll('.ring .arc').forEach(function (a) { a.style.setProperty('--v', a.dataset.v); });
  }
  sections.forEach(prepare);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { go(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.3 });
  sections.forEach(function (s) { io.observe(s); });
})();
