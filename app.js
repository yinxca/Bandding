(() => {
  const wrap = document.getElementById('snapWrap');
  const slides = Array.from(wrap.querySelectorAll('.snap-slide'));
  const canvases = [
    'v1082_9822','v1082_9681','v1082_9750','v1082_9947','v1082_9887',
    'v1082_9978','v1082_10007','v1082_10156','v1082_10063','v1082_10114',
    'v1082_10184'
  ].map(c => document.querySelector('.' + c)).filter(Boolean);

  /* ---------- scale the fixed 1440px canvas down on narrow viewports ---------- */
  function applyScale(){
    const s = Math.min(1, (window.innerWidth - 24) / 1440);
    canvases.forEach(el => { el.style.transform = s < 1 ? `scale(${s})` : ''; });
  }
  applyScale();
  window.addEventListener('resize', applyScale);

  /* ---------- side dots ---------- */
  const dotsHost = document.getElementById('dots');
  slides.forEach((slide, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', slide.id);
    b.addEventListener('click', () => goToIndex(i));
    dotsHost.appendChild(b);
  });
  const dotButtons = Array.from(dotsHost.children);

  let currentIndex = 0;
  let isAnimating = false;

  function setActive(index){
    currentIndex = index;
    dotButtons.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function goToIndex(index){
    index = Math.max(0, Math.min(slides.length - 1, index));
    isAnimating = true;
    slides[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(index);
    window.clearTimeout(goToIndex._t);
    goToIndex._t = window.setTimeout(() => { isAnimating = false; }, 700);
  }

  /* ---------- one wheel tick = one section ---------- */
  let wheelLock = false;
  let wheelAccum = 0;
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelLock) return;
    wheelAccum += e.deltaY;
    if (Math.abs(wheelAccum) < 12) return;
    const dir = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    wheelLock = true;
    goToIndex(currentIndex + dir);
    window.setTimeout(() => { wheelLock = false; }, 750);
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

  /* ---------- touch swipe ---------- */
  let touchStartY = null;
  wrap.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive:true });
  wrap.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    touchStartY = null;
    if (Math.abs(dy) < 40 || wheelLock) return;
    wheelLock = true;
    goToIndex(currentIndex + (dy > 0 ? 1 : -1));
    window.setTimeout(() => { wheelLock = false; }, 750);
  }, { passive:true });

  /* ---------- keep dots in sync if the user scrolls some other way ---------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        const idx = slides.indexOf(entry.target);
        if (idx !== -1) setActive(idx);
      }
    });
  }, { root: wrap, threshold: [0.6] });
  slides.forEach(s => observer.observe(s));

  setActive(0);
})();
