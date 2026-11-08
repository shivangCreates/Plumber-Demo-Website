(() => {
  "use strict";

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-ready");

  function setupHeroVideo() {
    const video = document.querySelector("#hero-video");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!video || window.matchMedia("(max-width: 599px)").matches) return;

    const loadVideo = () => {
      if (motionPreference.matches || document.documentElement.classList.contains("motion-paused") ||
          window.matchMedia("(max-width: 599px)").matches || video.dataset.loaded) return;
      const sources = [...video.querySelectorAll("source[data-src]")];
      sources.forEach(source => {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
      });
      if (!sources.length) return;
      video.dataset.loaded = "true";
      video.load();
    };
    const resumeVideo = () => {
      if (video.dataset.loaded && video.paused && !motionPreference.matches) {
        video.play().catch(error => {
          if (error.name !== "AbortError") console.error("Could not resume hero video playback.", error);
        });
      } else if (!video.dataset.loaded) {
        loadVideo();
      }
    };
    const scheduleLoad = () => {
      window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(loadVideo, { timeout: 2500 });
        } else {
          loadVideo();
        }
      }, 2500);
    };

    if (!motionPreference.matches) {
      if (document.readyState === "complete") scheduleLoad();
      else window.addEventListener("load", scheduleLoad, { once: true });
    }
    window.addEventListener("resume-site-motion", resumeVideo);
    const handleMotionChange = event => {
      if (event.matches) {
        video.pause();
      } else {
        resumeVideo();
      }
    };
    if ("addEventListener" in motionPreference) motionPreference.addEventListener("change", handleMotionChange);
    else motionPreference.addListener(handleMotionChange);
  }

  function setupMobileCallBar() {
    const contact = document.querySelector("#contact");
    if (!contact || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle("contact-visible", entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(contact);
  }

  function setupMotionToggle() {
    const toggle = document.querySelector("[data-motion-toggle]");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const paused = !document.documentElement.classList.contains("motion-paused");
      document.documentElement.classList.toggle("motion-paused", paused);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "Resume motion" : "Pause motion";
      const video = document.querySelector("#hero-video");
      if (paused) video?.pause();
      else window.dispatchEvent(new Event("resume-site-motion"));
    });
  }

  function setupHeader() {
    const header = document.querySelector("#site-header");
    const toggle = document.querySelector("#menu-toggle");
    const nav = document.querySelector("#primary-nav");
    const backdrop = document.querySelector("#menu-backdrop");
    if (!header || !toggle || !nav || !backdrop) return;

    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (open) nav.querySelector("a")?.focus();
    });
    backdrop.addEventListener("click", () => {
      closeMenu();
      toggle.focus();
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      closeMenu();
      const target = link.hash && document.querySelector(link.hash);
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }));
    nav.addEventListener("keydown", event => {
      if (event.key !== "Tab" || !nav.classList.contains("is-open")) return;
      const links = [...nav.querySelectorAll("a")];
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(item => observer.observe(item));
  }

  function setupCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length || !("IntersectionObserver" in window)) return;
    const format = counter => {
      const target = Number(counter.dataset.target);
      const decimals = Number(counter.dataset.decimals || 0);
      const duration = prefersReducedMotion() ? 0 : 1400;
      const start = performance.now();
      const tick = now => {
        const progress = prefersReducedMotion() || !duration ? 1 : Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased / (decimals ? 10 : 1);
        counter.textContent = decimals ? value.toFixed(1) : Math.round(value).toLocaleString("en-US");
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          format(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(counter => observer.observe(counter));
  }

  function setupProcessLine() {
    const track = document.querySelector("#process-track");
    if (!track) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      track.classList.add("is-active");
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        track.classList.add("is-active");
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(track);
  }

  function setupCompareSlider() {
    document.querySelectorAll("[data-compare]").forEach(compare => {
      const range = compare.querySelector(".compare-range");
      const before = compare.querySelector(".compare-before-wrap");
      const handle = compare.querySelector(".compare-handle");
      if (!range || !before || !handle) return;
      const update = () => {
        before.style.width = `${range.value}%`;
        handle.style.left = `${range.value}%`;
      };
      range.addEventListener("input", update);
      update();
    });
  }

  function setupReviews() {
    const track = document.querySelector("#review-track");
    const cards = track ? [...track.children] : [];
    const position = document.querySelector("#carousel-position");
    const previous = document.querySelector("[data-review-prev]");
    const next = document.querySelector("[data-review-next]");
    if (!track || !cards.length || !position || !previous || !next) return;
    let index = 0;
    const visibleCount = () => window.matchMedia("(max-width: 640px)").matches ? 1 :
      window.matchMedia("(max-width: 900px)").matches ? 2 : 3;
    const render = () => {
      const max = Math.max(0, cards.length - visibleCount());
      index = Math.min(index, max);
      const step = cards[0].getBoundingClientRect().width + 16;
      track.style.transform = `translateX(-${index * step}px)`;
      position.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
      previous.disabled = index === 0;
      next.disabled = index >= max;
    };
    previous.addEventListener("click", () => { index = Math.max(0, index - 1); render(); });
    next.addEventListener("click", () => { index = Math.min(cards.length - visibleCount(), index + 1); render(); });
    window.addEventListener("resize", render, { passive: true });
    render();
  }

  function setupMarqueeToggle() {
    const marquee = document.querySelector(".credential-marquee");
    const toggle = document.querySelector(".marquee-toggle");
    if (!marquee || !toggle) return;
    toggle.addEventListener("click", () => {
      const paused = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "Resume badge motion" : "Pause badge motion";
      marquee.classList.toggle("is-paused", paused);
    });
  }

  function setupFaq() {
    const questions = document.querySelectorAll(".faq-question");
    questions.forEach(button => {
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") === "true";
        const answer = document.getElementById(button.getAttribute("aria-controls"));
        button.setAttribute("aria-expanded", String(!open));
        if (!answer) return;
        answer.hidden = false;
        if (open) {
          answer.style.height = `${answer.scrollHeight}px`;
          requestAnimationFrame(() => { answer.style.height = "0px"; });
          window.setTimeout(() => { answer.hidden = true; answer.style.height = ""; }, prefersReducedMotion() ? 0 : 220);
        } else {
          answer.style.height = "0px";
          requestAnimationFrame(() => { answer.style.height = `${answer.scrollHeight}px`; });
          window.setTimeout(() => { answer.style.height = "auto"; }, prefersReducedMotion() ? 0 : 230);
        }
      });
    });
  }

  function setupMascot() {
    const m = document.querySelector("#mascot-helper");
    if (!m) return;
    const q = s => document.querySelector(s), c = m.classList, b = q(".mascot-bubble");
    const fig = q(".mascot-figure"), arm = q("#mascot-arm-right"), hand = q("#mascot-point-finger");
    const call = q(".header-call-button"), mobile = q(".mobile-call-bar"), menu = q("#menu-toggle");
    let active = false, pulse, idleTimer, pulseTimer, blinkTimer;
    const anchor = () => call.getBoundingClientRect().width ? call : menu;
    const target = () => call.getBoundingClientRect().width ? call : matchMedia("(max-width: 640px)").matches ? mobile : menu;
    const position = () => {
      const a = anchor(), t = target();
      m.style.right = `${Math.max(0, m.parentElement.getBoundingClientRect().right - a.getBoundingClientRect().left + 10)}px`;
      if (c.contains("is-pointing") && t) {
        const h = hand.getBoundingClientRect(), r = t.getBoundingClientRect();
        arm.style.setProperty("--mascot-point-angle", `${Math.atan2(r.top + r.height / 2 - h.top - h.height / 2, r.left + r.width / 2 - h.left - h.width / 2) * 180 / Math.PI - 30}deg`);
      }
    };
    const stop = () => {
      [idleTimer, pulseTimer, blinkTimer].forEach(clearTimeout);
      c.remove("is-idle", "is-blinking"); pulse?.classList.remove("mascot-call-pulse");
    };
    const play = replay => {
      if (active || document.hidden || prefersReducedMotion()) return;
      stop(); active = true;
      c.remove("is-static", "is-bubble-visible", "is-bubble-fading", "is-waving", "is-pointing", "is-relaxing");
      c.toggle("is-replay", replay); c.add("is-entering");
    };
    try { if (localStorage.getItem("copperflow-mascot-hidden")) { m.hidden = true; return; } }
    catch (e) { console.warn(e); }
    m.addEventListener("animationend", e => {
      if (e.target === fig && e.animationName === "mascot-pop") {
        c.remove("is-entering", "is-replay"); c.add("is-waving", "is-bubble-visible", "is-blinking");
        b.textContent = "Hello! 👋"; blinkTimer = setTimeout(() => c.remove("is-blinking"), 220);
      } else if (e.target === arm && e.animationName === "mascot-wave") {
        c.remove("is-waving"); c.add("is-pointing"); b.textContent = "Need a plumber? Call now!";
        position(); pulse = target(); pulse?.classList.add("mascot-call-pulse");
        pulseTimer = setTimeout(() => {
          pulse?.classList.remove("mascot-call-pulse"); c.remove("is-pointing"); c.add("is-relaxing", "is-bubble-fading");
        }, 6000);
      } else if (e.target === arm && e.animationName === "mascot-relax") {
        c.remove("is-relaxing", "is-bubble-visible", "is-bubble-fading"); c.add("is-idle"); active = false;
        idleTimer = setTimeout(() => c.remove("is-idle"), 30000);
      }
    });
    q(".mascot-close").addEventListener("click", () => {
      stop(); active = false;
      try { localStorage.setItem("copperflow-mascot-hidden", "1"); }
      catch (e) { console.warn(e); }
      m.hidden = true;
    });
    const hit = q("[data-mascot-hit]");
    hit.addEventListener("pointerenter", () => play(true));
    hit.addEventListener("click", () => play(true));
    window.addEventListener("resize", position, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { stop(); active = false; c.remove("is-entering", "is-waving", "is-pointing", "is-relaxing", "is-bubble-visible", "is-bubble-fading"); }
    });
    position();
    if (prefersReducedMotion()) {
      c.add("is-static", "is-bubble-visible");
      setTimeout(() => c.add("is-bubble-fading"), 4200);
      return;
    }
    try {
      if (sessionStorage.getItem("copperflow-mascot-played") === "1") c.add("is-static");
      else { sessionStorage.setItem("copperflow-mascot-played", "1"); play(false); }
    } catch (e) { console.warn(e); play(false); }
  }

  function setupForm() {
    const form = document.querySelector("#quote-form");
    if (!form) return;
    const fields = [
      { input: form.elements.name, error: "name-error", message: "Please enter your name." },
      { input: form.elements.phone, error: "phone-error", message: "Enter a valid phone number." },
      { input: form.elements.service, error: "service-error", message: "Please choose a service." }
    ];
    const status = document.querySelector("#form-status");
    const button = document.querySelector("#submit-button");
    const validate = field => {
      const value = field.input.value.trim();
      let message = "";
      if (!value) message = field.message;
      else if (field.input === form.elements.phone && value.replace(/\D/g, "").length < 10) message = field.message;
      field.input.setAttribute("aria-invalid", String(Boolean(message)));
      document.getElementById(field.error).textContent = message;
      return !message;
    };
    fields.forEach(field => field.input.addEventListener("blur", () => validate(field)));
    form.elements.email.addEventListener("blur", () => {
      const email = form.elements.email;
      const invalid = Boolean(email.value.trim()) && !email.validity.valid;
      email.setAttribute("aria-invalid", String(invalid));
      document.querySelector("#email-error").textContent = invalid ? "Enter a valid email address." : "";
    });
    form.elements.consent.addEventListener("change", () => {
      const accepted = form.elements.consent.checked;
      document.querySelector("#consent-error").textContent = accepted ? "" : "Please agree before sending your request.";
      form.elements.consent.setAttribute("aria-invalid", String(!accepted));
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");
      const valid = fields.map(validate).every(Boolean);
      const emailValid = !form.elements.email.value.trim() || form.elements.email.validity.valid;
      const consentValid = form.elements.consent.checked;
      if (!emailValid) {
        form.elements.email.setAttribute("aria-invalid", "true");
        document.querySelector("#email-error").textContent = "Enter a valid email address.";
      }
      if (!consentValid) {
        form.elements.consent.setAttribute("aria-invalid", "true");
        document.querySelector("#consent-error").textContent = "Please agree before sending your request.";
      }
      if (!valid || !emailValid || !consentValid) {
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      if (form.elements._gotcha.value) return;

      button.disabled = true;
      button.querySelector(".submit-label").hidden = true;
      button.querySelector(".submit-loading").hidden = false;
      try {
        if (form.action.includes("your-form-id")) {
          status.textContent = "Demo form is ready. Add a real Formspree endpoint to enable submissions.";
          status.classList.add("is-error");
        } else {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
          });
          if (!response.ok) throw new Error(`Form submission failed (${response.status}).`);
          form.reset();
          fields.forEach(field => {
            field.input.removeAttribute("aria-invalid");
            document.getElementById(field.error).textContent = "";
          });
          status.textContent = "Thanks! Your request is on its way. We’ll be in touch soon.";
        }
      } catch (error) {
        status.textContent = "We couldn’t send your request right now. Please call us at (214) 555-0147.";
        status.classList.add("is-error");
        console.error(error);
      } finally {
        button.disabled = false;
        button.querySelector(".submit-label").hidden = false;
        button.querySelector(".submit-loading").hidden = true;
      }
    });
  }

  setupHeader();
  setupHeroVideo();
  setupMotionToggle();
  setupMobileCallBar();
  setupReveal();
  setupCounters();
  setupProcessLine();
  setupCompareSlider();
  setupReviews();
  setupMarqueeToggle();
  setupFaq();
  setupMascot();
  setupForm();
})();
