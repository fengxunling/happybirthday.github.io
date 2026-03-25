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

/**
 * 背景音乐：打开页面即尝试自动播放并循环（loop）。
 * 部分浏览器会拦截「未经过点击」的有声自动播放，此时可用右下角按钮或任意一次点击页面启动。
 */
(function () {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("music-toggle");
  if (!audio || !btn) return;

  audio.volume = 0.55;
  audio.loop = true;

  const labelPlay = "播放背景音乐";
  const labelPause = "暂停背景音乐";

  function syncUi() {
    const playing = !audio.paused;
    btn.classList.toggle("music-toggle--playing", playing);
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute("aria-label", playing ? labelPause : labelPlay);
  }

  function tryPlay() {
    return audio.play().then(syncUi).catch(syncUi);
  }

  btn.addEventListener("click", function () {
    if (audio.paused) {
      tryPlay();
    } else {
      audio.pause();
      syncUi();
    }
  });

  audio.addEventListener("play", syncUi);
  audio.addEventListener("pause", syncUi);

  // 自动播放被拦截时，用户第一次点击/触摸页面后开始播放（仍可用按钮控制）
  let gestureUnlockAttached = false;
  function attachGestureUnlock() {
    if (gestureUnlockAttached || !audio.paused) return;
    gestureUnlockAttached = true;
    const once = function () {
      tryPlay();
      document.removeEventListener("click", once);
      document.removeEventListener("touchstart", once);
    };
    document.addEventListener("click", once, { passive: true });
    document.addEventListener("touchstart", once, { passive: true });
  }

  window.addEventListener("load", function () {
    tryPlay().then(function () {
      if (audio.paused) attachGestureUnlock();
    });
  });

  syncUi();
})();

/**
 * 通用“出现动画”（图片/文字区域滚动进入视口才出现）
 */
(function () {
  const targets = Array.from(
    document.querySelectorAll(
      ".photo-grid__item, .place-list__item, .wish-list__item"
    )
  );
  if (!targets.length) return;

  // 先标记为隐藏态，并设置错落延迟
  targets.forEach((el, i) => {
    el.classList.add("reveal-el");
    // 控制延迟不要太大，避免后面元素拖太久
    const delayMs = Math.min(i, 25) * 120;
    el.style.setProperty("--reveal-delay", `${delayMs}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("revealed");
        io.unobserve(entry.target);
      }
    },
    {
      threshold: 0.15,
    }
  );

  targets.forEach((el) => io.observe(el));
})();
