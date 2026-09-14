/* The three parts of an answer, wired to the answer itself. Draws a dashed line from each label
   to the part it names; hovering a label lights the part. Without this file the labels still read in order. */
(function () {
  var root = document.querySelector('.parts');
  if (!root) return;
  var svg = root.querySelector('.wires');
  var parts = root.querySelectorAll('.part');
  if (!svg || !parts.length) return;
  var NS = 'http://www.w3.org/2000/svg';
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) return;
    var R = root.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
    parts.forEach(function (p) {
      var target = document.getElementById(p.getAttribute('data-target'));
      var head = p.querySelector('summary') || p;
      if (!target) return;
      var a = target.getBoundingClientRect(), b = head.getBoundingClientRect();
      var x1 = a.right - R.left + 6, y1 = a.top - R.top + Math.min(a.height / 2, 14);
      var x2 = b.left - R.left - 12, y2 = b.top - R.top + b.height / 2;
      var mx = (x1 + x2) / 2;
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2);
      svg.appendChild(path);
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', x1); dot.setAttribute('cy', y1); dot.setAttribute('r', 4.5);
      svg.appendChild(dot);
      var end = document.createElementNS(NS, 'circle');
      end.setAttribute('cx', x2); end.setAttribute('cy', y2); end.setAttribute('r', 3);
      svg.appendChild(end);
    });
  }
  parts.forEach(function (p) {
    var target = document.getElementById(p.getAttribute('data-target'));
    if (!target) return;
    function on() { target.classList.add('hot'); }
    function off() { target.classList.remove('hot'); }
    p.addEventListener('mouseenter', on); p.addEventListener('mouseleave', off);
    p.addEventListener('focusin', on); p.addEventListener('focusout', off);
    p.addEventListener('toggle', draw, true);
  });
  root.querySelectorAll('details').forEach(function (d) { d.addEventListener('toggle', function () { requestAnimationFrame(draw); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  window.addEventListener('resize', draw);
  window.addEventListener('load', draw);
  draw();
})();
