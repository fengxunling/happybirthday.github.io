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

  document.querySelectorAll(".place-list__thumb img").forEach((img) => {
    img.addEventListener("error", function () {
      this.style.opacity = "0";
      const thumb = this.closest(".place-list__thumb");
      if (thumb) thumb.classList.add("place-list__thumb--empty");
    });
  });
})();
