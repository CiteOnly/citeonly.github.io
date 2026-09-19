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

  /* figures: dots fill, bars grow, rings draw, when the section comes into view.
     The printed figure never moves. It used to count up from zero, so until a section
     was scrolled to it read 0%, and on the way up it read a number the page does not
     claim. The picture animates; the number is the number. */
  var sections = document.querySelectorAll('[data-anim]');
  if (!sections.length || reduce || !('IntersectionObserver' in window)) return;
  function prepare(sec) {
    sec.querySelectorAll('.dots i.x').forEach(function (i) { i.classList.remove('x'); i.classList.add('will'); });
    sec.querySelectorAll('.bar i').forEach(function (i) { i.dataset.w = i.style.width; i.style.width = '0'; });
    sec.querySelectorAll('.ring .arc').forEach(function (a) { a.dataset.v = a.style.getPropertyValue('--v'); a.style.setProperty('--v', '0'); });
  }
  function go(sec) {
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
