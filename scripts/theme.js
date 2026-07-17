// ---------- Theme: toggle + persistence + system detection ----------
(function () {
    const root = document.documentElement;
    const toggles = document.querySelectorAll(".theme-toggle");

    function currentTheme() {
        return root.getAttribute("data-theme") === "light" ? "light" : "dark";
    }

    function applyTheme(theme, persist) {
        root.setAttribute("data-theme", theme);
        if (persist) {
            try { localStorage.setItem("theme", theme); } catch (e) { /* ignore */ }
        }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "light" ? "#e8eef7" : "#0a0e17");
    }

    toggles.forEach((btn) => {
        btn.addEventListener("click", () => {
            applyTheme(currentTheme() === "light" ? "dark" : "light", true);
        });
    });

    // Follow the OS theme only while the user hasn't chosen one explicitly.
    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
            let stored = null;
            try { stored = localStorage.getItem("theme"); } catch (err) { /* ignore */ }
            if (!stored) applyTheme(e.matches ? "light" : "dark", false);
        });
    }

    applyTheme(currentTheme(), false);
})();

// ---------- Scroll reveal (replays every time an element enters view) ----------
(function () {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            } else if (entry.boundingClientRect.top > 0) {
                // reset only when it leaves below the viewport, so scrolling
                // back up re-plays the animation (a lively, "live" feel)
                entry.target.classList.remove("is-visible");
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    items.forEach((el) => io.observe(el));
})();

// ---------- Scroll progress bar ----------
(function () {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;
    let ticking = false;
    function update() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        bar.style.width = pct + "%";
        ticking = false;
    }
    window.addEventListener("scroll", () => {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
})();

// ---------- Active nav link on scroll ----------
(function () {
    const links = document.querySelectorAll("#nav-menu .nav-link[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    const map = {};
    links.forEach((l) => { map[l.getAttribute("href").slice(1)] = l; });
    const sections = Object.keys(map)
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                links.forEach((l) => l.classList.remove("active"));
                const active = map[entry.target.id];
                if (active) active.classList.add("active");
            }
        });
    }, { threshold: 0.3, rootMargin: "-20% 0px -50% 0px" });

    sections.forEach((s) => io.observe(s));
})();
