(() => {
  const wrap = document.getElementById('snapWrap');
  const panels = Array.from(wrap.querySelectorAll('.panel'));
  const dotsHost = document.getElementById('dots');
  const navButtons = Array.from(document.querySelectorAll('.nav__menu button, .nav__cta'));

  /* ---------- build side dots ---------- */
  panels.forEach((panel, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', panel.id);
    b.addEventListener('click', () => goToIndex(i));
    dotsHost.appendChild(b);
  });
  const dotButtons = Array.from(dotsHost.children);

  let currentIndex = 0;
  let isAnimating = false;

  function setActive(index) {
    currentIndex = index;
    dotButtons.forEach((d, i) => d.classList.toggle('is-active', i === index));
    const id = panels[index].id;
    navButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.target === id);
    });
  }

  function goToIndex(index) {
    index = Math.max(0, Math.min(panels.length - 1, index));
    if (index === currentIndex && !isAnimating) { /* still fine */ }
    isAnimating = true;
    panels[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(index);
    window.clearTimeout(goToIndex._t);
    goToIndex._t = window.setTimeout(() => { isAnimating = false; }, 750);
  }

  /* ---------- one-wheel-tick = one section ---------- */
  let wheelLock = false;
  let wheelAccum = 0;
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelLock) return;
    wheelAccum += e.deltaY;
    if (Math.abs(wheelAccum) < 12) return; // ignore tiny trackpad noise
    const dir = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    wheelLock = true;
    goToIndex(currentIndex + dir);
    window.setTimeout(() => { wheelLock = false; }, 800);
  }, { passive: false });

  /* ---------- keyboard ---------- */
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      if (!wheelLock) goToIndex(currentIndex + 1);
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      if (!wheelLock) goToIndex(currentIndex - 1);
    }
  });

  /* ---------- touch swipe (mobile) ---------- */
  let touchStartY = null;
  wrap.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  wrap.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    touchStartY = null;
    if (Math.abs(dy) < 40) return;
    if (wheelLock) return;
    wheelLock = true;
    goToIndex(currentIndex + (dy > 0 ? 1 : -1));
    window.setTimeout(() => { wheelLock = false; }, 800);
  }, { passive: true });

  /* ---------- track active section while scrolling (fallback / sync) ---------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        const idx = panels.indexOf(entry.target);
        if (idx !== -1) setActive(idx);
      }
    });
  }, { root: wrap, threshold: [0.6] });
  panels.forEach(p => observer.observe(p));

  /* ---------- nav clicks ---------- */
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const idx = panels.findIndex(p => p.id === targetId);
      if (idx !== -1) goToIndex(idx);
    });
  });

  /* ---------- footer links ---------- */
  document.querySelectorAll('.footer__col a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const idx = panels.findIndex(p => p.id === id);
      if (idx !== -1) { e.preventDefault(); goToIndex(idx); }
    });
  });

  setActive(0);

  /* ---------- forms (no backend — just friendly feedback) ---------- */
  const heroForm = document.getElementById('heroForm');
  const heroMsg = document.getElementById('heroMsg');
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    heroMsg.textContent = '알림 신청이 완료됐어요. 곧 반띵 소식을 전해드릴게요!';
    heroForm.reset();
  });

  const ctaForm = document.getElementById('ctaForm');
  const ctaMsg = document.getElementById('ctaMsg');
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    ctaMsg.textContent = '사전 신청이 완료됐어요. 반띵과 함께해주셔서 감사해요!';
  });
})();
