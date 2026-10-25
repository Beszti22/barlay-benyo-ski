/* Barlay Benyó Ski — shared interactive behavior */

document.addEventListener("DOMContentLoaded", () => {
  /* Inject SITE constants (phone/email/social) into elements */
  document.querySelectorAll("[data-site]").forEach(el => {
    const key = el.getAttribute("data-site");
    if (typeof SITE !== "undefined" && SITE[key] !== undefined) {
      if (el.tagName === "A") {
        if (key === "email") el.href = "mailto:" + SITE.email;
        else if (key === "phoneHref") el.href = "tel:" + SITE.phoneHref;
        else if (key === "whatsapp") el.href = SITE.whatsapp;
        else if (key === "facebook") el.href = SITE.facebook;
        else if (key === "instagram") el.href = SITE.instagram;
        else el.href = SITE[key];
      }
      if (el.hasAttribute("data-site-text")) el.textContent = SITE[key];
    }
  });

  /* Mobile nav toggle */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Background workshop videos — pause looping autoplay for users who prefer reduced motion */
  const bgVideos = document.querySelectorAll(".section-video-bg video, .video-tile video");
  if (bgVideos.length) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      bgVideos.forEach(v => { v.removeAttribute("autoplay"); v.pause(); });
    }
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  /* Gallery lightbox */
  const triggers = Array.from(document.querySelectorAll("[data-lightbox-trigger]"));
  const lightbox = document.getElementById("lightbox");
  if (triggers.length && lightbox) {
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    let current = 0;

    const show = (i) => {
      current = (i + triggers.length) % triggers.length;
      const t = triggers[current];
      lightboxImg.src = t.getAttribute("data-full");
      lightboxImg.alt = t.querySelector("img") ? t.querySelector("img").alt : "";
    };
    const open = (i) => {
      show(i);
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    };
    const close = () => {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      lightboxImg.src = "";
      triggers[current].focus();
    };

    triggers.forEach((t, i) => t.addEventListener("click", () => open(i)));
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(current - 1));
    nextBtn.addEventListener("click", () => show(current + 1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* Contact form — currently logs locally; wire to /api/contact (Resend) once deployed */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) return; // bot caught

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "..."; }

      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        form.setAttribute("data-state", "success");
      } catch (err) {
        form.setAttribute("data-state", "error");
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      }
    });
  }
});
