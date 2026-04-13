document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.body.classList.add("js-ready");

  const cursor = document.querySelector(".custom-cursor");
  let cursorFrame = null;
  let cursorX = 0;
  let cursorY = 0;

  function isInteractiveTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest("a, button, .doc-item, .sort-options span, .hero-tags span, video, .ticket"));
  }

  if (cursor && finePointer) {
    document.body.classList.add("custom-cursor-active");

    function renderCursor() {
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      cursorFrame = null;
    }

    document.addEventListener(
      "pointermove",
      (event) => {
        cursorX = event.clientX;
        cursorY = event.clientY;
        cursor.classList.add("is-visible");

        const target = event.target;
        cursor.classList.toggle("is-hover", isInteractiveTarget(target));

        if (!cursorFrame) {
          cursorFrame = window.requestAnimationFrame(renderCursor);
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerdown", () => {
      cursor.classList.add("is-active");
    });

    document.addEventListener("pointerup", () => {
      cursor.classList.remove("is-active");
    });

    document.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-visible");
    });

    window.addEventListener("blur", () => {
      cursor.classList.remove("is-visible", "is-active", "is-hover");
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navMap = new Map(
    navLinks
      .map((link) => {
        const targetId = link.getAttribute("href");
        if (!targetId || !targetId.startsWith("#")) {
          return null;
        }
        return [targetId.slice(1), link];
      })
      .filter(Boolean)
  );

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!siteNav || !navToggle) {
        return;
      }
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  function setActiveSection(section) {
    if (!section) {
      return;
    }

    const sectionId = section.getAttribute("id");
    navLinks.forEach((item) => item.classList.remove("is-active"));

    const activeLink = sectionId ? navMap.get(sectionId) : null;
    if (activeLink) {
      activeLink.classList.add("is-active");
    }

    document.body.classList.remove("phase-service", "phase-recovery", "phase-neutral");
    document.body.classList.add(`phase-${section.dataset.phase || "neutral"}`);
  }

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target);
        }
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0.2, 0.35, 0.55]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
    setActiveSection(sections[0]);
  }

  const revealSelectors = [
    ".hero-copy > *",
    ".ledger-item",
    ".hero-summary article",
    ".section-intro > *",
    ".cycle-map",
    ".compare-card",
    ".phase-story",
    ".interface-panel",
    ".detail-card",
    ".ticket",
    ".sort-options span",
    ".logic-card",
    ".decision-card",
    ".video-showcase",
    ".doc-item",
    ".about-panel",
    ".link-tile",
    ".footer-block > *"
  ];

  function typeLine(element) {
    if (!element || element.dataset.typed === "true") {
      return;
    }

    const original = element.dataset.typeSource || element.textContent.trim();
    const speed = Number(element.dataset.typeSpeed || 18);
    element.dataset.typeSource = original;

    if (reducedMotion) {
      element.textContent = original;
      element.dataset.typed = "true";
      element.classList.add("is-typed");
      return;
    }

    element.textContent = "";
    element.classList.add("is-typing");
    let index = 0;

    const step = () => {
      index += 1;
      element.textContent = original.slice(0, index);

      if (index < original.length) {
        window.setTimeout(step, speed);
        return;
      }

      element.classList.remove("is-typing");
      element.classList.add("is-typed");
      element.dataset.typed = "true";
    };

    window.setTimeout(step, 40);
  }

  function animateCount(element) {
    if (!element || element.dataset.counted === "true") {
      return;
    }

    const target = Number(element.dataset.target || 0);
    if (reducedMotion || target <= 1) {
      element.textContent = String(target);
      element.dataset.counted = "true";
      return;
    }

    const duration = 640;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      element.textContent = String(target);
      element.dataset.counted = "true";
    }

    window.requestAnimationFrame(tick);
  }

  sections.forEach((section) => {
    const items = Array.from(section.querySelectorAll(revealSelectors.join(",")));
    items.forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-index", String(index));

      if (item.matches(".detail-card, .ticket")) {
        item.dataset.revealStyle = "stack";
      } else if (item.matches(".sort-options span, .doc-item")) {
        item.dataset.revealStyle = "ink";
      } else {
        item.dataset.revealStyle = "rise";
      }
    });
  });

  if (sections.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const section = entry.target;
          const items = Array.from(section.querySelectorAll(".reveal-item"));
          section.classList.add("is-reading");

          const graceDelay = reducedMotion ? 0 : 170;
          window.setTimeout(() => {
            section.classList.add("is-ready");
            items.forEach((item, index) => {
              const itemDelay = reducedMotion ? 0 : Math.min(index * 55, 420);
              window.setTimeout(() => {
                item.classList.add("is-visible");
              }, itemDelay);
            });

            section.querySelectorAll(".count-number").forEach((counter) => animateCount(counter));
            section.querySelectorAll(".type-ink").forEach((target) => typeLine(target));
          }, graceDelay);

          observer.unobserve(section);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.14
      }
    );

    sections.forEach((section) => revealObserver.observe(section));
  }

  const docItems = Array.from(document.querySelectorAll(".doc-item"));
  const lightbox = document.querySelector(".media-lightbox");
  const lightboxMedia = document.querySelector(".lightbox-media");
  const lightboxType = document.querySelector(".lightbox-type");
  const lightboxTitle = document.querySelector(".lightbox-title");
  const lightboxCaption = document.querySelector(".lightbox-caption");
  const lightboxDismiss = document.querySelector(".lightbox-dismiss");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");
  let activeMediaIndex = 0;

  function renderLightboxItem(index) {
    if (!lightbox || !lightboxMedia || !lightboxType || !lightboxTitle || !lightboxCaption) {
      return;
    }

    const item = docItems[index];
    if (!item) {
      return;
    }

    const skin = item.dataset.mediaSkin || "";
    lightboxMedia.className = "lightbox-media";
    if (skin) {
      lightboxMedia.classList.add(skin);
    }

    const mediaSrc = item.dataset.mediaSrc || "";
    lightboxMedia.style.backgroundImage = mediaSrc ? `url("${mediaSrc}")` : "";
    lightboxMedia.classList.remove("is-ready");
    window.requestAnimationFrame(() => {
      lightboxMedia.classList.add("is-ready");
    });

    lightboxType.textContent = item.dataset.mediaType || "";
    lightboxTitle.textContent = item.dataset.mediaLabel || "";
    lightboxCaption.textContent = item.dataset.mediaCaption || "";
  }

  function openLightbox(index) {
    if (!lightbox || !docItems.length) {
      return;
    }

    activeMediaIndex = (index + docItems.length) % docItems.length;
    renderLightboxItem(activeMediaIndex);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function stepLightbox(direction) {
    if (!docItems.length) {
      return;
    }

    activeMediaIndex = (activeMediaIndex + direction + docItems.length) % docItems.length;
    renderLightboxItem(activeMediaIndex);
  }

  docItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  if (lightboxDismiss) {
    lightboxDismiss.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => stepLightbox(-1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => stepLightbox(1));
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    if (!lightbox || lightbox.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
    }

    if (event.key === "ArrowRight") {
      stepLightbox(1);
    }
  });

  const canvas = document.getElementById("particleCanvas");
  if (!canvas) {
    return;
  }

  const shell = canvas.parentElement;
  const context = canvas.getContext("2d");
  if (!shell || !context) {
    return;
  }

  const palette = {
    lime: "#8ab248",
    amber: "#fbb118",
    forest: "#305542"
  };

  const pointer = {
    x: null,
    y: null,
    radius: 84
  };

  let particles = [];
  let animationFrame = null;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  class Particle {
    constructor(originX, originY, tone) {
      this.originX = originX;
      this.originY = originY;
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.max(width, height) * (0.42 + Math.random() * 0.28);
      this.x = width / 2 + Math.cos(angle) * spread;
      this.y = height / 2 + Math.sin(angle) * spread;
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 1.8 + 1.3;
      this.tone = tone;
      this.phase = Math.random() * Math.PI * 2;
      this.entryDelay = Math.random() * 70;
    }

    update(frame) {
      const settle = Math.max(0, frame - this.entryDelay);
      const swayX = Math.cos(frame * 0.012 + this.phase) * 0.22;
      const swayY = Math.sin(frame * 0.01 + this.phase) * 0.22;
      const pullX = (this.originX - this.x) * (settle < 80 ? 0.016 : 0.038);
      const pullY = (this.originY - this.y) * (settle < 80 ? 0.016 : 0.038);

      this.vx += pullX + swayX;
      this.vy += pullY + swayY;

      if (pointer.x !== null && pointer.y !== null) {
        const dx = this.x - pointer.x;
        const dy = this.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < pointer.radius) {
          const force = (pointer.radius - distance) / pointer.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 1.6;
          this.vy += Math.sin(angle) * force * 1.6;
        }
      }

      this.vx *= 0.88;
      this.vy *= 0.88;
      this.x += this.vx;
      this.y += this.vy;
    }

    draw(frame) {
      const pulse = 0.7 + Math.sin(frame * 0.04 + this.phase) * 0.18;
      const reveal = Math.min(1, Math.max(0.18, frame / 90));
      context.beginPath();
      context.fillStyle = this.tone;
      context.shadowBlur = 16;
      context.shadowColor = this.tone;
      context.globalAlpha = pulse * reveal;
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fill();
    }
  }

  function getTone(index) {
    if (index % 6 === 0) {
      return palette.amber;
    }
    if (index % 5 === 0) {
      return palette.forest;
    }
    return palette.lime;
  }

  function buildParticleTargets() {
    const offscreen = document.createElement("canvas");
    const offscreenContext = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offscreenContext) {
      return [];
    }

    offscreen.width = width;
    offscreen.height = height;

    const fontSize = Math.min(width * 0.19, 150);
    offscreenContext.fillStyle = "#000";
    offscreenContext.textAlign = "center";
    offscreenContext.textBaseline = "middle";
    offscreenContext.font = `700 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
    offscreenContext.fillText("CYCORA", width / 2, height / 2);

    const image = offscreenContext.getImageData(0, 0, width, height).data;
    const gap = Math.max(5, Math.round(width / 120));
    const nextParticles = [];

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const alpha = image[(y * width + x) * 4 + 3];
        if (alpha > 120) {
          nextParticles.push(new Particle(x, y, getTone(nextParticles.length)));
        }
      }
    }

    return nextParticles;
  }

  function drawField(frame) {
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(
      width * 0.5,
      height * 0.34,
      width * 0.08,
      width * 0.5,
      height * 0.42,
      width * 0.52
    );
    gradient.addColorStop(0, "rgba(251, 177, 24, 0.08)");
    gradient.addColorStop(0.45, "rgba(138, 178, 72, 0.08)");
    gradient.addColorStop(1, "rgba(48, 85, 66, 0)");
    context.globalAlpha = 1;
    context.shadowBlur = 0;
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(48, 85, 66, 0.08)";
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(width * 0.5, height * 0.34, width * 0.34, height * 0.16, 0, 0, Math.PI * 2);
    context.stroke();
  }

  function render(frame = 0) {
    drawField(frame);

    particles.forEach((particle) => {
      particle.update(frame);
      particle.draw(frame);
    });

    context.globalAlpha = 1;
    context.shadowBlur = 0;

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const shellBounds = shell.getBoundingClientRect();
    width = Math.max(320, Math.min(Math.floor(shellBounds.width), 928));
    height = Math.max(220, Math.min(Math.floor(shellBounds.height * 0.42), 312));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = buildParticleTargets();

    if (reducedMotion) {
      drawField(0);
      particles.forEach((particle) => particle.draw(0));
    }
  }

  shell.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  });

  shell.addEventListener("pointerleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeCanvas();
    if (!reducedMotion) {
      render();
    }
  });

  resizeCanvas();
  if (!reducedMotion) {
    render();
  }
});
