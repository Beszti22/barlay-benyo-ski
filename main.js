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
