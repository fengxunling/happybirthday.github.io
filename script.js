/**
 * 轻量彩纸效果（Canvas），不依赖第三方库
 */
(function () {
  const canvas = document.getElementById("confetti");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let rafId = 0;

  const COLORS = ["#e8b86d", "#f5e6d3", "#c9a227", "#9b7ed9", "#ffffff"];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height * 0.4 - height * 0.2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 5 + 3,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.15,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: Math.random() * 0.5 + 0.35,
    };
  }

  function initParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
    }
    rafId = requestAnimationFrame(draw);
  }

  function startBurst() {
    resize();
    const count = Math.min(80, Math.floor((width * height) / 18000));
    initParticles(Math.max(40, count));
    cancelAnimationFrame(rafId);
    draw();
  }

  window.addEventListener("resize", () => {
    resize();
  });

  // 首屏加载后短暂爆发，之后维持飘落
  window.addEventListener("load", startBurst);

  // 图片加载失败时隐藏破损图标，显示纯色块（本地无图时更体面）
  document.querySelectorAll(".photo-grid img").forEach((img) => {
    img.addEventListener("error", function () {
      this.style.opacity = "0";
      this.alt = "";
    });
  });
})();

/**
 * 世界地图：优先检测城市标点，其次整块陆地；悬浮说明跟随指针
 */
(function () {
  const wrap = document.getElementById("world-map");
  const tooltip = document.getElementById("map-tooltip");
  if (!wrap || !tooltip) return;

  const labelEl = tooltip.querySelector(".map-tooltip__label");
  const textEl = tooltip.querySelector(".map-tooltip__text");
  let lastHit = null;

  function clientXY(e) {
    if (e.touches && e.touches.length) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function hitAtPoint(x, y) {
    const stack = document.elementsFromPoint(x, y);
    for (let i = 0; i < stack.length; i++) {
      const el = stack[i];
      if (!wrap.contains(el)) continue;
      const marker = el.closest && el.closest(".map-marker");
      if (marker && wrap.contains(marker)) return marker;
      if (el.classList && el.classList.contains("map-region")) return el;
      const region = el.closest && el.closest(".map-region");
      if (region && wrap.contains(region)) return region;
    }
    return null;
  }

  function setHovered(node) {
    if (lastHit === node) return;
    wrap.querySelectorAll(".map-region, .map-marker").forEach((n) => n.classList.remove("is-hovered"));
    if (node) node.classList.add("is-hovered");
    lastHit = node;
  }

  function positionTooltip(x, y) {
    const pad = 14;
    const margin = 10;
    tooltip.removeAttribute("hidden");
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let left = x + pad;
    let top = y + pad;
    if (left + tw > window.innerWidth - margin) left = x - tw - pad;
    if (top + th > window.innerHeight - margin) top = y - th - pad;
    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - th - margin));
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function onPointerLike(e) {
    const { x, y } = clientXY(e);
    const hit = hitAtPoint(x, y);
    if (hit) {
      const label = hit.getAttribute("data-map-label") || "";
      const tip = hit.getAttribute("data-map-tip") || "";
      labelEl.textContent = label;
      textEl.textContent = tip;
      labelEl.hidden = !label;
      setHovered(hit);
      positionTooltip(x, y);
    } else {
      setHovered(null);
      tooltip.setAttribute("hidden", "");
    }
  }

  wrap.addEventListener("mousemove", onPointerLike);
  wrap.addEventListener("touchstart", onPointerLike, { passive: true });
  wrap.addEventListener("touchmove", onPointerLike, { passive: true });

  wrap.addEventListener("mouseleave", () => {
    setHovered(null);
    tooltip.setAttribute("hidden", "");
  });

  wrap.addEventListener("touchend", () => {
    setHovered(null);
    tooltip.setAttribute("hidden", "");
  });
})();
