/* The desk: the answer is found in the documents and flown into place.
   HTML is rendered at rest in its end state (pages listed, highlights on, answer complete); this only replays it.
   Per document: the page turns to the passage, a scan passes over it, the highlight lands,
   the passage lifts out and lands in the answer with its pin and page. Last, the open point.
   On a phone, or with reduced motion, there is no animation: the pages show their passage. */
(function () {
  var dataEl = document.getElementById('demo-data');
  var desk = document.getElementById('desk');
  if (!dataEl || !desk) return;
  var data = JSON.parse(dataEl.textContent);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function phone() { return window.matchMedia && window.matchMedia('(max-width: 820px)').matches; }
  var askText = document.getElementById('ask-text');
  var docsEl = document.getElementById('docs');
  var answerEl = document.getElementById('answer');
  var timers = [];
  var run = 0;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; document.querySelectorAll('.fly').forEach(function (f) { f.remove(); }); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render(s) {
    askText.textContent = s.question;
    docsEl.innerHTML = s.docs.map(function (d, i) {
      return '<div class="doc" id="doc-' + (i + 1) + '"><div class="doc-head"><b>' + esc(d.title) + '</b><span>' + esc(d.loc) + '</span></div>' +
        '<div class="doc-win"><div class="doc-body"><p>' + esc(d.before) + '<mark class="on" id="mark-' + (i + 1) + '">' + esc(d.quote) + '</mark>' + esc(d.after) + '</p></div><i class="scan" aria-hidden="true"></i></div></div>';
    }).join('');
    var head = answerEl.querySelector('.answer-head').outerHTML;
    answerEl.innerHTML = head + s.docs.map(function (d, i) {
      return '<div class="qt on" data-doc="' + (i + 1) + '" tabindex="0"><span class="pin">' + (i + 1) + '</span><div><q>' + esc(d.quote) + '</q><span class="src">' + esc(d.title) + ', ' + esc(d.loc.toLowerCase()) + '</span></div></div>';
    }).join('') + '<div class="gap on" id="gap"><b>' + esc(s.gap.lead) + '</b> ' + esc(s.gap.text) + '</div>';
    wireHover();
  }

  /* bring the passage into the page's window */
  function scrollTo(doc, mark, instant) {
    var win = doc.querySelector('.doc-win'), body = doc.querySelector('.doc-body');
    win.classList.add('view');
    var max = Math.max(0, body.scrollHeight - win.clientHeight);
    var y = Math.min(max, Math.max(0, mark.offsetTop - (win.clientHeight - mark.offsetHeight) / 2));
    if (instant) body.style.transition = 'none';
    body.style.transform = 'translateY(' + (-y) + 'px)';
    if (instant) { void body.offsetHeight; body.style.transition = ''; }
  }

  /* the passage lifts out of the page and lands on its line in the answer */
  function fly(mark, qt, done) {
    var rects = mark.getClientRects();
    var r1 = rects.length ? rects[0] : mark.getBoundingClientRect();
    var r2 = qt.getBoundingClientRect();
    var el = document.createElement('span');
    el.className = 'fly';
    el.textContent = mark.textContent;
    el.style.left = r1.left + 'px';
    el.style.top = r1.top + 'px';
    el.style.width = Math.max(140, Math.min(r1.width, 380)) + 'px';
    document.body.appendChild(el);
    var dx = (r2.left + 38) - r1.left, dy = (r2.top + 10) - r1.top;
    if (!el.animate) { el.remove(); done(); return; }
    var a = el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 24) + 'px) scale(1.03)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.98)', opacity: 0.95, offset: 0.9 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.98)', opacity: 0 }
    ], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    a.onfinish = function () { el.remove(); done(); };
  }

  function play(s) {
    clear();
    var my = ++run;
    var docs = Array.prototype.slice.call(desk.querySelectorAll('.doc'));
    var marks = desk.querySelectorAll('.doc mark');
    var qts = desk.querySelectorAll('.qt');
    var gap = document.getElementById('gap');
    if (reduce || phone()) {                                   // no motion: the end state, passage in view
      docs.forEach(function (d, k) { scrollTo(d, marks[k], true); });
      return;
    }
    docs.forEach(function (d) { var w = d.querySelector('.doc-win'); w.classList.add('view'); d.querySelector('.doc-body').style.transform = 'translateY(0)'; });
    marks.forEach(function (m) { m.classList.remove('on'); });
    qts.forEach(function (q) { q.classList.remove('on'); });
    if (gap) gap.classList.remove('on');
    askText.textContent = '';
    askText.classList.add('typing');
    var q = s.question, i = 0, t = 0, step = 8;   // the founder, 15 Sep: a very fast animation, with a gap between each quote
    for (i = 1; i <= q.length; i++) {
      (function (n) { later(function () { if (my === run) askText.textContent = q.slice(0, n); }, t); })(i);
      t += step;
    }
    t += 150;
    later(function () { if (my === run) askText.classList.remove('typing'); }, t);
    docs.forEach(function (d, k) {
      var m = marks[k], qt = qts[k];
      t += 120;
      later(function () { if (my === run) scrollTo(d, m); }, t);              // the page turns to the passage
      t += 240;
      later(function () { if (my !== run) return; var sc = d.querySelector('.scan'); sc.classList.remove('go'); void sc.offsetWidth; sc.classList.add('go'); }, t); // the scan passes
      t += 240;
      later(function () { if (my === run) m.classList.add('on'); }, t);      // the highlight lands
      t += 150;
      later(function () { if (my === run) fly(m, qt, function () { if (my === run && qt) qt.classList.add('on'); }); }, t); // it flies into the answer
      t += 320 + 500;   // the quote lands, then a gap before the next document
    });
    t += 300;
    later(function () { if (my === run && gap) gap.classList.add('on'); }, t);
  }

  function wireHover() {
    desk.querySelectorAll('.qt').forEach(function (q) {
      var m = document.getElementById('mark-' + q.getAttribute('data-doc'));
      if (!m) return;
      var d = m.closest('.doc');
      function on() { m.classList.add('hot'); if (d.querySelector('.doc-win.view')) scrollTo(d, m); }
      function off() { m.classList.remove('hot'); }
      q.addEventListener('mouseenter', on); q.addEventListener('mouseleave', off);
      q.addEventListener('focus', on); q.addEventListener('blur', off);
    });
  }

  var tabs = document.querySelectorAll('.demo-tabs .tab[aria-controls="desk"]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      tab.setAttribute('aria-selected', 'true');
      var s = data.scenarios[+tab.getAttribute('data-scenario')];
      desk.setAttribute('aria-labelledby', tab.id);
      render(s);
      play(s);
    });
  });

  wireHover();
  var started = false;
  function start() { if (started) return; started = true; play(data.scenarios[0]); }
  if ('IntersectionObserver' in window && !reduce && !phone()) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } }); }, { threshold: 0.35 });
    io.observe(desk);
  } else { start(); }
})();
