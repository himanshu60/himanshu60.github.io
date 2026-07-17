// ============================================================
//  Premium micro-interactions — additive, dependency-free.
//  Respects prefers-reduced-motion.
// ============================================================
(function () {
    "use strict";

    var reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- preloader ----------
    function hidePreloader() {
        var pre = document.getElementById("preloader");
        if (!pre) return;
        pre.classList.add("hidden");
        setTimeout(function () { pre.remove(); }, 700);
    }
    if (document.readyState === "complete") {
        hidePreloader();
    } else {
        window.addEventListener("load", hidePreloader);
        // safety fallback so it never sticks
        setTimeout(hidePreloader, 2500);
    }

    // ---------- scroll-to-top ----------
    (function () {
        var btn = document.getElementById("scroll-top");
        if (!btn) return;
        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                btn.classList.toggle("show", window.scrollY > 480);
                ticking = false;
            });
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        btn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        });
        onScroll();
    })();

    // ---------- ripple on buttons ----------
    (function () {
        var sel = ".btn, .nav-link button, #resume-button-1, " +
            ".project-github-link>button, .project-deployed-link>button, .social-pill, #scroll-top";
        document.querySelectorAll(sel).forEach(function (el) {
            el.addEventListener("click", function (e) {
                var rect = el.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var span = document.createElement("span");
                span.className = "ripple";
                span.style.width = span.style.height = size + "px";
                span.style.left = (e.clientX - rect.left - size / 2) + "px";
                span.style.top = (e.clientY - rect.top - size / 2) + "px";
                el.appendChild(span);
                setTimeout(function () { span.remove(); }, 600);
            });
        });
    })();

    if (reduce) return; // skip the motion-heavy interactions below

    // ---------- magnetic primary buttons ----------
    (function () {
        document.querySelectorAll(".btn-primary").forEach(function (el) {
            el.addEventListener("mousemove", function (e) {
                var r = el.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2;
                var y = e.clientY - r.top - r.height / 2;
                el.style.transform = "translate(" + x * 0.18 + "px," + y * 0.28 + "px)";
            });
            el.addEventListener("mouseleave", function () {
                el.style.transform = "";
            });
        });
    })();

    // ---------- 3D tilt on project cards ----------
    (function () {
        var MAX = 6; // degrees
        document.querySelectorAll(".project-card").forEach(function (card) {
            card.addEventListener("mousemove", function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform =
                    "perspective(900px) rotateY(" + (px * MAX) + "deg) rotateX(" +
                    (-py * MAX) + "deg) translateY(-8px)";
            });
            card.addEventListener("mouseleave", function () {
                card.style.transform = "";
            });
        });
    })();

    // ---------- count-up when stat cards enter view ----------
    (function () {
        var counters = document.querySelectorAll(".counter");
        if (!counters.length || !("IntersectionObserver" in window)) return;

        function run(el) {
            var target = parseInt(el.getAttribute("data-count"), 10) || 0;
            var suffix = el.getAttribute("data-suffix") || "";
            var start = null;
            var dur = 1400;
            function tick(ts) {
                if (start === null) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                el.textContent = Math.round(eased * target) + suffix;
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = target + suffix;
            }
            requestAnimationFrame(tick);
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    run(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(function (c) { io.observe(c); });
    })();
})();
