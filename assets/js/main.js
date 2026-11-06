/**
 * Yeongmin Lee Portfolio — main script
 * - Sidebar drawer (mobile)
 * - Timecode timeline: 스크롤 위치를 60초 영상의 타임코드로 표시
 * - Works hover preview (썸네일이 있을 때만)
 * - YouTube click-to-load embeds (data-youtube-id)
 * - Showreel dialog (data-showreel-id)
 * - Copy email, scroll-top
 */
(function () {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1200px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;
  const FPS = 24;
  const END_SEC = 60;

  /* ---------------------------------------------------------
   * Sidebar drawer (mobile / tablet)
   * ------------------------------------------------------- */
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.querySelector('.menu-toggle');
  const closeBtn = document.querySelector('.sidebar-close');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const outside = ['#main', '.topbar', '.scroll-top']
    .map((sel) => document.querySelector(sel))
    .filter(Boolean);

  const isOpen = () => body.classList.contains('nav-open');

  function setNav(open, restoreFocus) {
    if (!sidebar || !toggleBtn) return;
    body.classList.toggle('nav-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    outside.forEach((el) => { el.inert = open; });
    if (open) (closeBtn || sidebar).focus();
    else if (restoreFocus) toggleBtn.focus();
  }

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => setNav(!isOpen(), false));
    if (closeBtn) closeBtn.addEventListener('click', () => setNav(false, true));
    if (backdrop) backdrop.addEventListener('click', () => setNav(false, true));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setNav(false, true);
    });
    sidebar.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => { if (isOpen()) setNav(false, false); });
    });
    desktop.addEventListener('change', (e) => { if (e.matches && isOpen()) setNav(false, false); });
  }

  /* ---------------------------------------------------------
   * Timecode timeline
   *  - 각 메뉴의 data-in(초)은 그 섹션의 시작 타임코드입니다.
   *  - 섹션 상단에 도착하면 정확히 그 타임코드가 표시되고,
   *    페이지 끝에서 00:01:00:00 이 됩니다.
   *  - 상세 페이지에서는 Works 구간 안에서 진행됩니다.
   * ------------------------------------------------------- */
  const timeline = document.querySelector('.timeline');
  const track = document.querySelector('.timeline-track');
  const fill = document.querySelector('.timeline-fill');
  const playhead = document.querySelector('.playhead');
  const tcOutputs = document.querySelectorAll('[data-tc-live]');
  const progressBar = document.querySelector('.topbar-progress');

  const marks = Array.from(document.querySelectorAll('.timeline a[data-in]')).map((link) => {
    const href = link.getAttribute('href') || '';
    return {
      link,
      sec: parseFloat(link.getAttribute('data-in')) || 0,
      section: href.charAt(0) === '#' ? document.querySelector(href) : null
    };
  });
  const onIndex = marks.some((m) => m.section);

  let anchors = [];   // [{ y: scrollY, sec }]
  let markY = [];     // [{ sec, y: px within track }]
  let ticking = false;

  function formatTC(sec) {
    const total = Math.max(0, Math.floor(sec * FPS + 1e-6));
    const ff = total % FPS;
    const s = Math.floor(total / FPS);
    const parts = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, ff];
    return parts.map((n) => String(n).padStart(2, '0')).join(':');
  }

  function interpolate(points, key, value, outKey) {
    if (!points.length) return 0;
    if (value <= points[0][key]) return points[0][outKey];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (value <= b[key]) {
        const span = b[key] - a[key] || 1;
        return a[outKey] + (b[outKey] - a[outKey]) * ((value - a[key]) / span);
      }
    }
    return points[points.length - 1][outKey];
  }

  function measure() {
    const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);

    if (onIndex) {
      anchors = marks
        .filter((m) => m.section)
        .map((m) => {
          // 모바일 상단 바 높이(scroll-margin-top)만큼 보정 — 메뉴로 이동했을 때 정확히 그 타임코드가 되도록
          const margin = parseFloat(getComputedStyle(m.section).scrollMarginTop) || 0;
          const y = m.section.getBoundingClientRect().top + window.scrollY - margin;
          return { y: Math.max(0, Math.round(y)), sec: m.sec };
        })
        .filter((a) => a.y < maxScroll - 1);
      anchors.push({ y: maxScroll, sec: END_SEC });
    } else {
      const current = marks.findIndex((m) => m.link.classList.contains('is-active'));
      const start = current >= 0 ? marks[current].sec : 0;
      const end = current >= 0 && marks[current + 1] ? marks[current + 1].sec : END_SEC;
      anchors = [{ y: 0, sec: start }, { y: maxScroll, sec: end }];
    }

    if (timeline && track && marks.length) {
      markY = marks.map((m) => {
        const tc = m.link.querySelector('.tc') || m.link;
        return { sec: m.sec, y: tc.offsetTop + tc.offsetHeight / 2 };
      });
      const last = markY[markY.length - 1];
      markY.push({ sec: END_SEC, y: last.y + 28 }); // 'End' 지점
      const top = markY[0].y;
      track.style.top = top + 'px';
      track.style.height = (markY[markY.length - 1].y - top) + 'px';
    }
  }

  function render() {
    ticking = false;
    const sec = interpolate(anchors, 'y', window.scrollY, 'sec');
    const tc = formatTC(sec);
    tcOutputs.forEach((el) => { if (el.textContent !== tc) el.textContent = tc; });
    if (progressBar) progressBar.style.transform = 'scaleX(' + (sec / END_SEC).toFixed(4) + ')';

    if (markY.length && track) {
      const y = interpolate(markY, 'sec', sec, 'y') - markY[0].y;
      if (playhead) playhead.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
      if (fill) fill.style.height = y.toFixed(1) + 'px';
    }

    if (onIndex) {
      // 화면 상단 35% 지점을 지난 마지막 섹션을 현재 위치로 표시
      const line = window.scrollY + window.innerHeight * 0.35;
      let active = null;
      marks.forEach((m) => {
        if (m.section && m.section.getBoundingClientRect().top + window.scrollY <= line) active = m;
      });
      if (window.scrollY >= root.scrollHeight - window.innerHeight - 2) active = marks[marks.length - 1];
      marks.forEach((m) => {
        const on = m === active;
        m.link.classList.toggle('is-active', on);
        if (on) m.link.setAttribute('aria-current', 'true');
        else m.link.removeAttribute('aria-current');
      });
    }
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  }

  function refresh() {
    measure();
    render();
  }

  if (marks.length || tcOutputs.length) {
    refresh();
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  /* ---------------------------------------------------------
   * About 사진 — 화면에 고정(sticky)되어 있는 동안만 컬러
   *  - PC: sticky 위치에 붙는 순간 컬러, 고정이 풀려 위로 밀려나면(더 내려가면)
   *        다시 흑백. 위로 되돌아가 떨어져도 흑백.
   *  - 모바일(고정 없음): 사진이 화면 위쪽 구간(20~35%)을 지나는 동안만 컬러
   * ------------------------------------------------------- */
  const aboutPhoto = document.querySelector('.about-photo');
  if (aboutPhoto) {
    let photoTicking = false;
    const checkPhoto = () => {
      photoTicking = false;
      const style = getComputedStyle(aboutPhoto);
      const rect = aboutPhoto.getBoundingClientRect();
      let on;
      if (style.position === 'sticky') {
        const stickTop = parseFloat(style.top) || 0;
        on = Math.abs(rect.top - stickTop) <= 1.5;   // 정확히 붙어 있을 때만
      } else {
        const vh = window.innerHeight;
        on = rect.top <= vh * 0.35 && rect.bottom >= vh * 0.2;
      }
      aboutPhoto.classList.toggle('is-stuck', on);
    };
    const requestPhoto = () => {
      if (!photoTicking) {
        photoTicking = true;
        window.requestAnimationFrame(checkPhoto);
      }
    };
    window.addEventListener('scroll', requestPhoto, { passive: true });
    window.addEventListener('resize', requestPhoto);
    checkPhoto();
  }

  /* ---------------------------------------------------------
   * YouTube helpers
   * ------------------------------------------------------- */
  function ytThumbSrc(id) {
    return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  }

  function ytIframe(id, title, autoplay) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0' + (autoplay ? '&autoplay=1' : '');
    iframe.title = title || 'YouTube 영상';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    return iframe;
  }

  /* ---------------------------------------------------------
   * Works hover preview — 썸네일이 연결된 항목에서만 동작
   * ------------------------------------------------------- */
  function previewOf(row) {
    const id = (row.getAttribute('data-youtube-id') || '').trim();
    if (YT_ID.test(id)) return { src: ytThumbSrc(id), ratio: '16x9' };
    const img = (row.getAttribute('data-preview-img') || '').trim();
    if (img) return { src: img, ratio: row.getAttribute('data-preview-ratio') || '4x3' };
    return null;
  }

  const previewRows = Array.from(document.querySelectorAll('.work-row')).filter(previewOf);

  if (previewRows.length && finePointer.matches) {
    const box = document.createElement('div');
    box.className = 'work-preview';
    box.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    box.appendChild(img);
    body.appendChild(box);

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, visible = false;

    const step = () => {
      const k = reduceMotion.matches ? 1 : 0.18;
      x += (tx - x) * k;
      y += (ty - y) * k;
      box.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = (visible && (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3)) ? requestAnimationFrame(step) : 0;
    };

    const move = (e) => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      tx = Math.min(e.clientX + 28, window.innerWidth - w - 16);
      ty = Math.min(Math.max(e.clientY - h / 2, 16), window.innerHeight - h - 16);
      if (!raf) raf = requestAnimationFrame(step);
    };

    previewRows.forEach((row) => {
      const data = previewOf(row);
      row.addEventListener('pointerenter', (e) => {
        if (img.getAttribute('src') !== data.src) img.src = data.src;
        box.classList.toggle('is-4x3', data.ratio === '4x3');
        if (!visible) { x = tx = e.clientX + 28; y = ty = e.clientY; }
        visible = true;
        box.classList.add('is-visible');
        move(e);
      });
      row.addEventListener('pointermove', move);
      row.addEventListener('pointerleave', () => {
        visible = false;
        box.classList.remove('is-visible');
      });
    });
  }

  /* ---------------------------------------------------------
   * Works 클립 등장 — 목록이 화면에 들어오면 구분선이 그어지고 항목이 나타남 (1회)
   * ------------------------------------------------------- */
  const workLists = document.querySelectorAll('.work-list');
  if (workLists.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const list = entry.target;
        list.classList.add('is-in');
        list.querySelectorAll('.work-row').forEach((row) => row.classList.add('is-in'));
        obs.unobserve(list);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    workLists.forEach((list) => {
      const rows = list.querySelectorAll('.work-row');
      rows.forEach((row, i) => row.style.setProperty('--i', i));
      list.style.setProperty('--n', rows.length);
      list.classList.add('reveal-ready');
      revealObserver.observe(list);
    });
  }

  /* ---------------------------------------------------------
   * YouTube embed on detail pages — .media-frame[data-youtube-id]
   *  data-mode="embed" : 썸네일 + 클릭 시 플레이어 로드
   * ------------------------------------------------------- */
  document.querySelectorAll('.media-frame[data-youtube-id]').forEach((frame) => {
    const id = (frame.getAttribute('data-youtube-id') || '').trim();
    if (!YT_ID.test(id)) return; // 비어 있으면 'Media Offline' 틀 유지

    const title = frame.getAttribute('data-title') || '';
    frame.replaceChildren();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'yt-poster';
    btn.setAttribute('aria-label', (title ? title + ' ' : '') + '영상 재생');
    const thumb = document.createElement('img');
    thumb.src = ytThumbSrc(id);
    thumb.alt = '';
    thumb.loading = 'lazy';
    btn.appendChild(thumb);
    const play = document.createElement('span');
    play.className = 'yt-play';
    play.setAttribute('aria-hidden', 'true');
    play.innerHTML = '<i class="bi bi-play-fill"></i>';
    btn.appendChild(play);
    btn.addEventListener('click', () => {
      const iframe = ytIframe(id, title, true);
      frame.replaceChildren(iframe);
      iframe.focus();
    }, { once: true });
    frame.appendChild(btn);
  });

  /* ---------------------------------------------------------
   * Showreel dialog — #home[data-showreel-id]
   * ------------------------------------------------------- */
  const hero = document.querySelector('[data-showreel-id]');
  const reelId = hero ? (hero.getAttribute('data-showreel-id') || '').trim() : '';
  const reelBtn = document.querySelector('.showreel-open');
  const reelDialog = document.querySelector('.reel-dialog');

  if (YT_ID.test(reelId) && reelBtn && reelDialog && typeof reelDialog.showModal === 'function') {
    const reelFrame = reelDialog.querySelector('.reel-frame');
    reelBtn.hidden = false;
    reelBtn.addEventListener('click', () => {
      reelFrame.replaceChildren(ytIframe(reelId, '이영민 쇼릴', true));
      reelDialog.showModal();
    });
    reelDialog.querySelector('.reel-close').addEventListener('click', () => reelDialog.close());
    reelDialog.addEventListener('click', (e) => { if (e.target === reelDialog) reelDialog.close(); });
    reelDialog.addEventListener('close', () => {
      reelFrame.replaceChildren(); // 재생 중지
      reelBtn.focus();
    });
  }

  /* ---------------------------------------------------------
   * Copy email
   * ------------------------------------------------------- */
  document.querySelectorAll('.copy-email').forEach((btn) => {
    const status = btn.parentElement.querySelector('.copy-status');
    let timer;
    btn.addEventListener('click', async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(btn.getAttribute('data-copy'));
        ok = true;
      } catch (err) {
        ok = false;
      }
      if (status) {
        status.textContent = ok ? '이메일 주소를 복사했습니다.' : '복사하지 못했습니다. 주소를 직접 선택해 주세요.';
        clearTimeout(timer);
        timer = setTimeout(() => { status.textContent = ''; }, 3000);
      }
    });
  });

  /* ---------------------------------------------------------
   * Scroll top
   * ------------------------------------------------------- */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const onScroll = () => scrollTop.classList.toggle('is-visible', window.scrollY > 600);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }
})();
