// Lantway Immigrant Inc. — interactions (vanilla JS, no dependencies)
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  $("#year").textContent = new Date().getFullYear();

  // ---------- Mobile navigation ----------
  const toggle = $(".nav-toggle");
  const nav = $("#primary-nav");

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  $$("a", nav).forEach((link) =>
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    })
  );

  // ---------- Header shadow + back-to-top ----------
  const header = $(".header");
  const backToTop = $(".back-to-top");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    backToTop.classList.toggle("is-visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  );

  // ---------- Active nav link on scroll ----------
  const navLinks = $$('.nav a[href^="#"]:not(.btn)');
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  // ---------- Reveal on scroll ----------
  const revealTargets = $$(".section-head, .stat, .card, .step, .faq details, .cta__box, .form");
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -40px 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  // Safety net: never leave content hidden if an intersection event is missed
  window.addEventListener("load", () =>
    setTimeout(() => revealTargets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
    }), 300)
  );
  window.addEventListener("scroll", () => {
    revealTargets.forEach((el) => {
      if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
      }
    });
  }, { passive: true });

  // ---------- Animated counters ----------
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  $$(".stat__num").forEach((el) => counterObserver.observe(el));

  // ---------- Service filter tabs ----------
  const tabs = $$(".tab");
  const cards = $$(".card");

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("is-visible");
      });
    })
  );

  // ---------- Stories slider ----------
  const quotes = $$(".quote");
  const dotsWrap = $(".slider__dots");
  let current = 0;
  let timer;

  const dots = quotes.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Show story ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    current = (index + quotes.length) % quotes.length;
    quotes.forEach((q, i) => q.classList.toggle("is-active", i === current));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  }

  function restart() {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => goTo(current + 1), 6000);
  }

  $$(".slider__btn").forEach((btn) =>
    btn.addEventListener("click", () => { goTo(current + Number(btn.dataset.dir)); restart(); })
  );
  restart();

  // ---------- Intake form validation ----------
  const form = $("#intake-form");
  const message = $("#message");
  const charCount = $("#char-count");

  message.addEventListener("input", () => { charCount.textContent = message.value.length; });

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    phone: (v) => (v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a valid phone number."),
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address."),
    service: (v) => (v ? "" : "Please choose a service."),
  };

  const validateField = (name) => {
    const input = form.elements[name];
    const error = validators[name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(error));
    $(".field__error", field).textContent = error;
    input.setAttribute("aria-invalid", String(Boolean(error)));
    return !error;
  };

  Object.keys(validators).forEach((name) => {
    form.elements[name].addEventListener("blur", () => validateField(name));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(validators).map(validateField);
    if (results.every(Boolean)) {
      $(".form__success", form).hidden = false;
      form.reset();
      charCount.textContent = "0";
    } else {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
    }
  });

  // ---------- Donation amount selector ----------
  const amounts = $$(".amount");
  const donateBtn = $(".donate-btn");
  amounts.forEach((btn) =>
    btn.addEventListener("click", () => {
      amounts.forEach((b) => b.classList.toggle("is-active", b === btn));
      donateBtn.textContent = `Donate ${btn.textContent}`;
    })
  );

  // ---------- Newsletter ----------
  $("#newsletter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $("button", e.target);
    btn.textContent = "Subscribed ✓";
    btn.disabled = true;
    e.target.reset();
  });
})();
