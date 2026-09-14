/* Other AI tools vs CiteOnly. Rendered at rest in its end state; nothing animates (founder, round 3).
   This file lays the margin out against the rendered text (a stamp per invented part, a line to the part) and re-renders on tab. */
(function () {
  var root = document.getElementById('compare');
  var dataEl = document.getElementById('demo-data');
  if (!root || !dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var typed = document.getElementById('cmp-typed');
  var rail = document.getElementById('cmp-rail');
  var list = document.getElementById('cmp-stamps');
  var leaders = document.getElementById('cmp-leaders');
  var guard = document.getElementById('cmp-guard');
  var gs = document.getElementById('cmp-gs');
  var score = document.getElementById('cmp-score'), score2 = document.getElementById('cmp-score2');
  var nEl = document.getElementById('cmp-n'), qEl = document.getElementById('cmp-q');
  var answer = document.getElementById('cmp-answer');
  var NS = 'http://www.w3.org/2000/svg';
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function wide() { return !(window.matchMedia && window.matchMedia('(max-width: 900px)').matches); }
  root.classList.add('js');

  function render(c) {
    document.getElementById('cmp-ask').textContent = c.question;
    document.getElementById('cmp-ask2').textContent = c.question;
    var n = 0;
    typed.innerHTML = c.fluent.map(function (f) {
      if (!f.bad) return '<span>' + esc(f.text) + '</span>';
      n++;
      return '<span class="bad on" data-tag="' + esc(f.tag) + '">' + esc(f.text) + '</span><sup class="mk on">' + n + '</sup>';
    }).join('');
    list.innerHTML = c.fluent.filter(function (f) { return f.bad; }).map(function (f, i) { return '<span class="stampx on"><i>' + (i + 1) + '</i>' + esc(f.tag) + '</span>'; }).join('');
    answer.innerHTML = c.docs.map(function (d, i) {
      return '<div class="qt on"><span class="pin">' + (i + 1) + '</span><div><q' + (i === 0 ? ' id="cmp-q1"' : '') + '>' + esc(d.quote) + '</q><span class="src"' + (i === 0 ? ' id="cmp-src1"' : '') + '>' + esc(d.title) + ', ' + esc(d.loc.toLowerCase()) + '</span></div></div>';
    }).join('') + '<div class="gap on" id="cmp-gap"><b>' + esc(c.gap.lead) + '</b> ' + esc(c.gap.text) + '</div>';
    nEl.textContent = String(n);
    qEl.textContent = String(c.docs.length);
    gs.textContent = 'Caught 0 of ' + n + ' hallucinated parts';
    buildRail();
  }

  /* the stamps on the rail, one per invented part, each with a dashed line to the part */
  function buildRail() {
    rail.innerHTML = '';
    while (leaders.firstChild) leaders.removeChild(leaders.firstChild);
    if (!wide()) return;
    var R = root.getBoundingClientRect();
    leaders.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
    var bads = typed.querySelectorAll('.bad');
    var lastBottom = -100;
    bads.forEach(function (b, i) {
      var rects = b.getClientRects();
      var r = rects.length ? rects[rects.length - 1] : b.getBoundingClientRect();   // the line where the part ends
      var y = r.top - R.top + r.height / 2;
      var top = Math.max(y - 16, lastBottom + 10);
      var st = document.createElement('span');
      st.className = 'stampx on';
      st.innerHTML = '<i>' + (i + 1) + '</i>' + esc(b.getAttribute('data-tag') || '');
      st.style.top = top + 'px';
      rail.appendChild(st);
      lastBottom = top + st.offsetHeight;
      var x1 = rail.getBoundingClientRect().right - R.left - 2, y1 = top + st.offsetHeight / 2;
      var x2 = x1 + 34, y2 = r.top - R.top + r.height / 2;                        // short: toward the part's line, not to the text
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2);
      path.classList.add('on');
      leaders.appendChild(path);
      var ang = Math.atan2(y2 - y1, x2 - x1), hx = x2, hy = y2, L = 9, W = 4.5;   // the arrowhead, along the line
      var bx = hx - L * Math.cos(ang), by = hy - L * Math.sin(ang);
      var px = -Math.sin(ang), py = Math.cos(ang);
      var head = document.createElementNS(NS, 'path');
      head.setAttribute('d', 'M' + (bx + px * W) + ' ' + (by + py * W) + ' L' + hx + ' ' + hy + ' L' + (bx - px * W) + ' ' + (by - py * W) + ' Z');
      head.classList.add('head');
      if (st.classList.contains('on')) head.classList.add('on');
      leaders.appendChild(head);
    });
  }
  /* the right margin: three callouts pointing into the CiteOnly panel, a short line each, mirrored from the left */
  var railR = document.getElementById('cmp-rail-right');
  function buildRight() {
    if (!railR) return;
    railR.innerHTML = '';
    if (!wide()) return;
    var R = root.getBoundingClientRect();
    var items = [['Word for word', 'cmp-q1'], ['Document, section, page', 'cmp-src1'], ['Says what is missing', 'cmp-gap']];
    var lastBottom = -100, tilt = [2, -2, 3];
    items.forEach(function (it, i) {
      var t = document.getElementById(it[1]); if (!t) return;
      var rects = t.getClientRects();
      var r = rects.length ? rects[0] : t.getBoundingClientRect();
      var y = r.top - R.top + r.height / 2;
      var el = document.createElement('span');
      el.className = 'callout on';
      el.style.setProperty('--tilt', tilt[i] + 'deg');
      el.textContent = it[0];
      railR.appendChild(el);
      var top = Math.max(y - el.offsetHeight / 2, lastBottom + 10);
      el.style.top = top + 'px';
      lastBottom = top + el.offsetHeight;
      var rr = railR.getBoundingClientRect();
      var x1 = rr.left - R.left + 2, y1 = top + el.offsetHeight / 2;              // from the callout's left edge
      var x2 = x1 - 34, y2 = y;                                                   // short, toward the part's line
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2);
      path.classList.add('on'); path.classList.add('good');
      leaders.appendChild(path);
      var ang = Math.atan2(y2 - y1, x2 - x1), L = 9, W = 4.5;
      var bx = x2 - L * Math.cos(ang), by = y2 - L * Math.sin(ang), px = -Math.sin(ang), py = Math.cos(ang);
      var head = document.createElementNS(NS, 'path');
      head.setAttribute('d', 'M' + (bx + px * W) + ' ' + (by + py * W) + ' L' + x2 + ' ' + y2 + ' L' + (bx - px * W) + ' ' + (by - py * W) + ' Z');
      head.classList.add('head'); head.classList.add('on'); head.classList.add('good');
      leaders.appendChild(head);
    });
  }

  function light(i) {
    var st = rail.children[i]; if (st) st.classList.add('on');
    var ls = list.children[i]; if (ls) ls.classList.add('on');
    leaders.querySelectorAll('path').forEach(function (x) { x.classList.add('on'); });
  }

  var tabs = document.querySelectorAll('.demo-tabs .tab[aria-controls="compare"]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      tab.setAttribute('aria-selected', 'true');
      root.setAttribute('aria-labelledby', tab.id);
      render(data.scenarios[+tab.getAttribute('data-scenario')]);
    });
  });
  var _buildRail = buildRail;
  buildRail = function () { _buildRail(); buildRight(); };
  window.addEventListener('resize', buildRail);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildRail);
  window.addEventListener('load', buildRail);
  buildRail();
})();
