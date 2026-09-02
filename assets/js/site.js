// Progressive enhancement only. Every page reads and works without this file.

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation ------------------------------------------------------

  var navBtn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (navBtn && nav) {
    navBtn.closest(".masthead").classList.add("js-nav");
    navBtn.hidden = false;
    function setNav(open) {
      nav.classList.toggle("open", open);
      navBtn.setAttribute("aria-expanded", String(open));
    }
    navBtn.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });
    // Escape closes the menu and hands focus back to the button; a click or
    // tap anywhere outside the masthead closes it too
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false);
        navBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !navBtn.closest(".masthead").contains(e.target)) {
        setNav(false);
      }
    });
  }

  // Source binding ---------------------------------------------------------
  // A mark in the text and its entry in the margin light up together, so the
  // link between a statement and its source is visible before you click it.

  function bind(mark) {
    var note = document.getElementById((mark.getAttribute("href") || "").slice(1));
    if (!note) return;
    var pair = [mark, note];
    function on() { pair.forEach(function (el) { el.classList.add("lit"); }); }
    function off() { pair.forEach(function (el) { el.classList.remove("lit"); }); }

    mark.addEventListener("mouseenter", on);
    mark.addEventListener("mouseleave", off);
    mark.addEventListener("focus", on);
    mark.addEventListener("blur", off);
    note.addEventListener("mouseenter", on);
    note.addEventListener("mouseleave", off);

    mark.addEventListener("click", function (e) {
      e.preventDefault();
      note.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      on();
      window.setTimeout(off, 1800);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".src"), bind);

  // First-view reveal ------------------------------------------------------

  var rising = document.querySelectorAll(".rise");
  if (!rising.length) return;

  if (reduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(rising, function (el) { el.classList.add("seen"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("seen");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });

  Array.prototype.forEach.call(rising, function (el) { io.observe(el); });
})();
