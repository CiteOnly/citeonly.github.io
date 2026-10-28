(function() {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TOTAL = {
    pay: [ '<span class="rs">₹</span>61.68 lakh', "All 60 shipments pay duty." ],
    typical: [ '<span class="rs">₹</span>18.31 lakh', '17 of 60 shipments pay duty, on 2 licences. 2.4 times <span translate="no">CiteOnly</span>\'s cost.' ],
    best: [ '<span class="rs">₹</span>7.58 lakh', "Proven optimal. Claude Opus 5.5's plan: ₹18.31 lakh, 2.4 times ours. Paying every duty: ₹61.68 lakh." ]
  };
  function group(dock, buttons, onShow) {
    var timers = [];
    function show(name) {
      dock.dataset.show = name;
      buttons.forEach(function(b) {
        b.setAttribute("aria-pressed", String(b.dataset.show === name));
      });
      if (onShow) onShow(name);
    }
    buttons.forEach(function(b) {
      b.addEventListener("click", function() {
        timers.forEach(clearTimeout);
        show(b.dataset.show);
      });
    });
    return {
      show: show,
      play: function(seq, gap) {
        seq.forEach(function(n, k) {
          timers.push(setTimeout(function() {
            show(n);
          }, k * gap));
        });
      }
    };
  }
  var dock = document.getElementById("dock");
  var rows = dock.querySelectorAll(".ledger [data-for]");
  var y = group(dock, Array.prototype.slice.call(dock.querySelectorAll(".plans [data-show]")), function(name) {
    document.getElementById("sum").innerHTML = TOTAL[name][0];
    document.getElementById("what").innerHTML = TOTAL[name][1];
    rows.forEach(function(r) {
      r.classList.toggle("on", r.dataset.for === name);
    });
  });
  if (!reduce && window.matchMedia("(min-width: 900px)").matches) {
    y.show("pay");
    y.play([ "pay", "typical", "best" ], 1800);
  }
  var dr = document.getElementById("dock-r");
  group(dr, Array.prototype.slice.call(document.querySelectorAll(".switch [data-show]")));
  var chart = document.getElementById("chart"), tip = document.getElementById("tip");
  function at(li) {
    tip.textContent = li.dataset.tip;
    var c = chart.getBoundingClientRect(), r = li.getBoundingClientRect();
    tip.style.left = Math.max(10, Math.min(c.width - 350, r.left - c.left + 180)) + "px";
    tip.style.top = r.bottom - c.top + 6 + "px";
    tip.classList.add("on");
  }
  chart.querySelectorAll(".rows li").forEach(function(li) {
    li.addEventListener("mouseenter", function() {
      at(li);
    });
    li.addEventListener("focus", function() {
      at(li);
    });
    li.addEventListener("mouseleave", function() {
      tip.classList.remove("on");
    });
    li.addEventListener("blur", function() {
      tip.classList.remove("on");
    });
  });
})();
