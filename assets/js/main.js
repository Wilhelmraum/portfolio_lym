/**
 * Yeongmin Lee Portfolio — main.js
 *
 * 모든 기능은 init* 함수 하나씩으로 나뉘어 있고, 파일 맨 아래에서 차례로 실행됩니다.
 * 각 함수는 필요한 요소가 페이지에 없으면 아무것도 하지 않으므로
 * index.html과 상세 페이지에서 같은 파일을 그대로 씁니다.
 *
 *  initNavDrawer      모바일 메뉴 열기·닫기
 *  initTimeline       스크롤 위치를 60초 영상의 타임코드로 표시 (사이드바 파형 · 상단 바 · Home 모니터)
 *  initAboutPhoto     프로필 사진이 고정되어 있는 동안만 컬러
 *  initWorkReveal     Works 목록 등장 효과
 *  initWorkPreview    Works 목록 마우스 미리보기
 *  initPlayCursor     Works 목록 위 원형 커서 (PLAY · VIEW · SOON)
 *  initSectionWipe    배경색이 바뀌는 섹션의 와이프 전환
 *  initCredits        Contact 엔딩 크레딧 등장
 *  initVideoEmbeds    상세 페이지 YouTube 플레이어
 *  initShowreel       쇼릴 다이얼로그
 *  initCopyEmail      이메일 주소 복사
 *  initScrollTop      맨 위로 버튼
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------
   * Constants & helpers
   * ------------------------------------------------------- */
  const FPS = 24;           // 타임코드 프레임 수
  const END_SEC = 60;       // 페이지 끝 = 00:01:00:00
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isDesktop = window.matchMedia('(min-width: 1200px)');
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /** 스크롤·리사이즈 때 fn을 프레임당 한 번만 실행 */
  function onFrame(fn) {
    let queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        fn();
      });
    };
  }

  function getMaxScroll() {
    return Math.max(1, root.scrollHeight - window.innerHeight);
  }

  function getYouTubeId(el) {
    const id = (el.getAttribute('data-youtube-id') || '').trim();
    return YT_ID.test(id) ? id : '';
  }

  function youTubeThumb(id) {
    return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  }

  function youTubeIframe(id, title) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&autoplay=1';
    iframe.title = title || 'YouTube 영상';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    return iframe;
  }

  /* ---------------------------------------------------------
   * Nav drawer — 1200px 미만에서 사이드바를 서랍 메뉴로 사용
   * ------------------------------------------------------- */
  function initNavDrawer() {
    const sidebar = $('#sidebar');
    const toggle = $('.menu-toggle');
    if (!sidebar || !toggle) return;

    const closeBtn = $('.sidebar-close');
    const backdrop = $('.sidebar-backdrop');
    const background = $$('#main, .site-footer, .topbar, .scroll-top');
    const isOpen = () => body.classList.contains('is-nav-open');

    function setOpen(open, restoreFocus) {
      body.classList.toggle('is-nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      background.forEach((el) => { el.inert = open; });   // 메뉴 뒤쪽은 조작 불가
      if (open) (closeBtn || sidebar).focus();
      else if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => setOpen(!isOpen(), false));
    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false, true));
    if (backdrop) backdrop.addEventListener('click', () => setOpen(false, true));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setOpen(false, true);
    });

    $$('a', sidebar).forEach((link) => {
      link.addEventListener('click', () => { if (isOpen()) setOpen(false, false); });
    });

    isDesktop.addEventListener('change', (e) => {
      if (e.matches && isOpen()) setOpen(false, false);
    });
  }

  /* ---------------------------------------------------------
   * Timeline — 스크롤 위치를 타임코드로 표시
   *  - 메뉴의 data-in(초)이 각 섹션의 시작 타임코드입니다.
   *  - 섹션 상단에 도착하면 정확히 그 값이 되고, 페이지 끝에서 00:01:00:00.
   *  - 상세 페이지는 현재 메뉴(Works)의 시작 타임코드에 고정됩니다.
   * ------------------------------------------------------- */
  function formatTimecode(sec) {
    const frames = Math.max(0, Math.floor(sec * FPS + 1e-6));
    const s = Math.floor(frames / FPS);
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, frames % FPS]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
  }

  /** points에서 key 값에 대응하는 outKey 값을 선형 보간 */
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

  /* ---------------------------------------------------------
   * Waveform — 타임라인 트랙을 오디오 파형으로 그림
   *  - 음악처럼 처음과 끝은 작고 가운데는 크며, 섹션이 바뀌는 지점(컷)에서 잠깐 잦아듭니다.
   *  - 같은 타임코드에서는 항상 같은 모양이 나오므로 페이지를 옮겨도 파형이 그대로입니다.
   * ------------------------------------------------------- */
  const WAVE_STEP = 3;   // 막대 간격(px)
  const WAVE_BAR = 2;    // 막대 두께(px)

  function waveAmp(sec, cuts) {
    const t = Math.min(1, Math.max(0, sec / END_SEC));
    let a = 0.3 + 0.7 * Math.sqrt(Math.sin(Math.PI * t));
    cuts.forEach((c) => { a *= 1 - 0.75 * Math.exp(-Math.pow((sec - c) / 0.9, 2)); });
    const h = Math.sin(Math.floor(sec * 4) * 12.9898 + 78.233) * 43758.5453;
    const noise = h - Math.floor(h);
    const swell = 0.5 + 0.5 * Math.sin(sec * 0.9) * Math.sin(sec * 2.3);
    return Math.max(0.1, a * (0.35 + 0.4 * noise + 0.25 * swell));
  }

  function paintWave(canvas, points) {
    const w = canvas.clientWidth;
    const top = points[0].y;
    const h = Math.round(points[points.length - 1].y - top);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const color = getComputedStyle(canvas.parentElement).color;
    const key = [w, h, dpr, color].join('|');
    if (!w || h <= 0 || canvas.dataset.key === key) return;   // 크기·색이 같으면 다시 그리지 않음
    canvas.dataset.key = key;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;

    const cuts = points.slice(1, -1).map((p) => p.sec);
    const mid = w / 2;
    for (let y = 0; y + WAVE_BAR <= h; y += WAVE_STEP) {
      const sec = interpolate(points, 'y', top + y + WAVE_BAR / 2, 'sec');
      const half = Math.max(0.5, waveAmp(sec, cuts) * mid);
      ctx.fillRect(mid - half, y, half * 2, WAVE_BAR);
    }
  }

  function initTimeline() {
    const outputs = $$('[data-tc-live]');
    const markers = $$('.timeline a[data-in]').map((link) => {
      const href = link.getAttribute('href') || '';
      return {
        link,
        sec: parseFloat(link.getAttribute('data-in')) || 0,
        section: href.charAt(0) === '#' ? $(href) : null
      };
    });
    if (!markers.length && !outputs.length) return;

    const track = $('.timeline-track');
    const fill = $('.timeline-fill');
    const playhead = $('.playhead');
    const progress = $('.topbar-progress');
    const scrubs = $$('[data-tc-scrub]');   // Home 모니터 재생 바
    const onIndex = markers.some((m) => m.section);

    // 재생 바에 섹션 시작 지점 표시
    scrubs.forEach((scrub) => {
      markers.forEach((m) => {
        if (m.sec <= 0 || m.sec >= END_SEC) return;
        const tick = document.createElement('i');
        tick.className = 'monitor-tick';
        tick.style.setProperty('--at', (m.sec / END_SEC).toFixed(4));
        scrub.appendChild(tick);
      });
    });

    // 트랙 = 회색 파형, 재생된 구간(fill) = 강조색 파형. fill의 높이만큼만 보입니다.
    let waves = [];
    if (track && fill && markers.length && document.createElement('canvas').getContext) {
      waves = [track, fill].map((parent) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'timeline-wave';
        parent.prepend(canvas);
        return canvas;
      });
      track.classList.add('has-wave');
    }

    let scrollPoints = [];   // [{ y: scrollY, sec }]
    let trackPoints = [];    // [{ sec, y: 트랙 안의 px }]

    function measure() {
      const maxScroll = getMaxScroll();

      if (onIndex) {
        scrollPoints = markers
          .filter((m) => m.section)
          .map((m) => {
            // 모바일 상단 바 높이(scroll-margin-top)만큼 보정 — 메뉴로 이동하면 정확히 그 타임코드
            const margin = parseFloat(getComputedStyle(m.section).scrollMarginTop) || 0;
            const y = m.section.getBoundingClientRect().top + window.scrollY - margin;
            return { y: Math.max(0, Math.round(y)), sec: m.sec };
          })
          .filter((p) => p.y < maxScroll - 1);
        scrollPoints.push({ y: maxScroll, sec: END_SEC });
      } else {
        // 상세 페이지: 스크롤과 관계없이 현재 메뉴(Works)의 시작 지점에 고정
        // (진행시키면 페이지 끝에서 재생 헤드가 다음 메뉴 About에 닿아, 다른 곳으로 이동한 것처럼 보임)
        const current = markers.findIndex((m) => m.link.classList.contains('is-active'));
        const start = current >= 0 ? markers[current].sec : 0;
        scrollPoints = [{ y: 0, sec: start }, { y: maxScroll, sec: start }];
      }

      if (track && markers.length) {
        trackPoints = markers.map((m) => {
          const tc = $('.tc', m.link) || m.link;
          return { sec: m.sec, y: tc.offsetTop + tc.offsetHeight / 2 };
        });
        trackPoints.push({ sec: END_SEC, y: trackPoints[trackPoints.length - 1].y + 28 }); // End 지점
        const top = trackPoints[0].y;
        track.style.top = top + 'px';
        track.style.height = (trackPoints[trackPoints.length - 1].y - top) + 'px';
        waves.forEach((canvas) => paintWave(canvas, trackPoints));
      }
    }

    function render() {
      const sec = interpolate(scrollPoints, 'y', window.scrollY, 'sec');
      const tc = formatTimecode(sec);
      outputs.forEach((el) => { if (el.textContent !== tc) el.textContent = tc; });
      const ratio = (sec / END_SEC).toFixed(4);
      if (progress) progress.style.transform = 'scaleX(' + ratio + ')';
      scrubs.forEach((el) => el.style.setProperty('--p', ratio));

      if (trackPoints.length) {
        const y = interpolate(trackPoints, 'sec', sec, 'y') - trackPoints[0].y;
        if (playhead) playhead.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
        if (fill) fill.style.height = y.toFixed(1) + 'px';
      }

      if (onIndex) {
        // 화면 위쪽 35% 지점을 지난 마지막 섹션을 현재 메뉴로 표시
        const line = window.scrollY + window.innerHeight * 0.35;
        let active = null;
        markers.forEach((m) => {
          if (m.section && m.section.getBoundingClientRect().top + window.scrollY <= line) active = m;
        });
        if (window.scrollY >= getMaxScroll() - 2) active = markers[markers.length - 1];
        markers.forEach((m) => {
          const on = m === active;
          m.link.classList.toggle('is-active', on);
          if (on) m.link.setAttribute('aria-current', 'true');
          else m.link.removeAttribute('aria-current');
        });
      }
    }

    function refresh() {
      measure();
      render();
    }

    refresh();
    window.addEventListener('scroll', onFrame(render), { passive: true });
    window.addEventListener('resize', onFrame(refresh));
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  /* ---------------------------------------------------------
   * About photo — 고정(sticky)되어 있는 동안만 흑백 → 컬러
   *  - PC: sticky 위치에 붙어 있을 때만 컬러, 고정이 풀리면 다시 흑백
   *  - 모바일(고정 없음): 화면 위쪽 구간(20~35%)을 지나는 동안만 컬러
   * ------------------------------------------------------- */
  function initAboutPhoto() {
    const photo = $('.about-photo');
    if (!photo) return;

    function update() {
      const style = getComputedStyle(photo);
      const rect = photo.getBoundingClientRect();
      let pinned;
      if (style.position === 'sticky') {
        pinned = Math.abs(rect.top - (parseFloat(style.top) || 0)) <= 1.5;
      } else {
        const vh = window.innerHeight;
        pinned = rect.top <= vh * 0.35 && rect.bottom >= vh * 0.2;
      }
      photo.classList.toggle('is-pinned', pinned);
    }

    const scheduled = onFrame(update);
    window.addEventListener('scroll', scheduled, { passive: true });
    window.addEventListener('resize', scheduled);
    update();
  }

  /* ---------------------------------------------------------
   * Work reveal — 목록이 화면에 들어오면 구분선이 그어지고 항목 등장 (1회)
   * ------------------------------------------------------- */
  function initWorkReveal() {
    const lists = $$('.work-list');
    if (!lists.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const list = entry.target;
        list.classList.add('is-revealed');
        $$('.work-row', list).forEach((row) => row.classList.add('is-revealed'));
        observer.unobserve(list);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    lists.forEach((list) => {
      const rows = $$('.work-row', list);
      rows.forEach((row, i) => row.style.setProperty('--i', i));   // 줄마다 시차
      list.style.setProperty('--n', rows.length);
      list.classList.add('has-reveal');
      observer.observe(list);
    });
  }

  /* ---------------------------------------------------------
   * Work preview — 마우스를 따라다니는 썸네일
   *  data-youtube-id(영상) 또는 data-preview-img(이미지)가 있는 항목에서만 동작
   * ------------------------------------------------------- */
  function getPreview(row) {
    const id = getYouTubeId(row);
    if (id) return { src: youTubeThumb(id), ratio: '16x9' };
    const img = (row.getAttribute('data-preview-img') || '').trim();
    if (img) return { src: img, ratio: row.getAttribute('data-preview-ratio') || '4x3' };
    return null;
  }

  const PREVIEW_OFFSET = 40;   // 커서에서 썸네일까지 거리 — 원형 커서(지름 56px)와 겹치지 않도록

  function initWorkPreview() {
    const rows = $$('.work-row').filter(getPreview);
    if (!rows.length || !hasFinePointer.matches) return;

    const box = document.createElement('div');
    box.className = 'work-preview';
    box.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    box.appendChild(img);
    body.appendChild(box);

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let visible = false;

    function step() {
      const ease = reduceMotion.matches ? 1 : 0.18;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      box.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      const moving = Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3;
      frame = visible && moving ? window.requestAnimationFrame(step) : 0;
    }

    function follow(e) {
      targetX = Math.min(e.clientX + PREVIEW_OFFSET, window.innerWidth - box.offsetWidth - 16);
      targetY = Math.min(Math.max(e.clientY - box.offsetHeight / 2, 16), window.innerHeight - box.offsetHeight - 16);
      if (!frame) frame = window.requestAnimationFrame(step);
    }

    rows.forEach((row) => {
      const preview = getPreview(row);

      row.addEventListener('pointerenter', (e) => {
        if (img.getAttribute('src') !== preview.src) img.src = preview.src;
        box.classList.toggle('work-preview--4x3', preview.ratio === '4x3');
        if (!visible) {
          x = targetX = e.clientX + PREVIEW_OFFSET;
          y = targetY = e.clientY;
        }
        visible = true;
        box.classList.add('is-visible');
        follow(e);
      });

      row.addEventListener('pointermove', follow);

      row.addEventListener('pointerleave', () => {
        visible = false;
        box.classList.remove('is-visible');
      });
    });
  }

  /* ---------------------------------------------------------
   * Play cursor — Works 목록 위에서 커서가 원형 라벨로 바뀜 (마우스 환경만)
   *  영상 작업: ▶ PLAY / 디자인 작업: VIEW ↗ / 공개 전: SOON
   * ------------------------------------------------------- */
  const CURSOR_LABELS = {
    play: '<i class="bi bi-play-fill"></i>PLAY',
    view: 'VIEW<i class="bi bi-arrow-up-right"></i>',
    soon: 'SOON'
  };

  function initPlayCursor() {
    const rows = $$('.work-row');
    if (!rows.length || !hasFinePointer.matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'play-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    body.appendChild(cursor);
    $$('.work-list').forEach((list) => list.classList.add('has-play-cursor'));

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let visible = false;

    // 위치는 transform이 아닌 translate 속성으로 지정 — transform으로 하면 등장할 때의
    // scale이 위치 값까지 줄여서, 커서가 화면 왼쪽 위에서 날아오는 것처럼 보입니다.
    function place() {
      cursor.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    }

    function step() {
      const ease = reduceMotion.matches ? 1 : 0.25;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      place();
      const moving = Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2;
      frame = visible && moving ? window.requestAnimationFrame(step) : 0;
    }

    function follow(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(step);
    }

    function hide() {
      visible = false;
      cursor.classList.remove('is-visible');
    }

    rows.forEach((row) => {
      let kind = 'play';
      if (row.classList.contains('is-upcoming')) kind = 'soon';
      else if (row.closest('.work-list--design')) kind = 'view';

      function show(e) {
        cursor.innerHTML = CURSOR_LABELS[kind];
        cursor.className = 'play-cursor play-cursor--' + kind;
        x = targetX = e.clientX;
        y = targetY = e.clientY;
        place();   // 현재 마우스 위치에서 바로 커지며 등장
        visible = true;
        cursor.classList.add('is-visible');
      }

      row.addEventListener('pointerenter', show);
      // 스크롤로 숨겨진 뒤 같은 줄 안에서 마우스를 움직이면 다시 표시
      row.addEventListener('pointermove', (e) => (visible ? follow(e) : show(e)));
      row.addEventListener('pointerleave', hide);
    });

    // 마우스를 멈춘 채 스크롤하면 커서가 엉뚱한 줄에 남지 않도록 숨김
    window.addEventListener('scroll', () => { if (visible) hide(); }, { passive: true });
  }

  /* ---------------------------------------------------------
   * Section wipe — 배경색이 바뀌는 섹션에 들어가면 이전 색이 오른쪽으로 쓸려 나감 (1회)
   *  [data-wipe] 섹션에만 동작하며, 이전 색은 CSS의 --wipe-from으로 지정합니다.
   * ------------------------------------------------------- */
  function initSectionWipe() {
    const sections = $$('[data-wipe]');
    if (!sections.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-wiped');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -40% 0px' });

    sections.forEach((section) => {
      section.classList.add('has-wipe');
      observer.observe(section);
    });
  }

  /* ---------------------------------------------------------
   * Credits — Contact의 크레딧이 한 줄씩 올라오고, 마지막에 연락처 등장 (1회)
   * ------------------------------------------------------- */
  function initCredits() {
    const contact = $('.contact');
    const groups = contact ? $$('.credits, .contact-end', contact) : [];
    if (!groups.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-rolled');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    $$('.credit', contact).forEach((item, i) => item.style.setProperty('--i', i));
    contact.classList.add('has-roll');
    groups.forEach((group) => observer.observe(group));
  }

  /* ---------------------------------------------------------
   * Video embeds — 상세 페이지 .media-frame[data-youtube-id]
   *  썸네일을 먼저 보여 주고, 클릭하면 플레이어를 불러옵니다.
   * ------------------------------------------------------- */
  function initVideoEmbeds() {
    $$('.media-frame[data-youtube-id]').forEach((frame) => {
      const id = getYouTubeId(frame);
      if (!id) return;   // 비어 있으면 'Media Offline' 표시 유지

      const title = frame.getAttribute('data-title') || '';
      const poster = document.createElement('button');
      poster.type = 'button';
      poster.className = 'yt-poster';
      poster.setAttribute('aria-label', (title ? title + ' ' : '') + '영상 재생');

      const thumb = document.createElement('img');
      thumb.src = youTubeThumb(id);
      thumb.alt = '';
      thumb.loading = 'lazy';

      const play = document.createElement('span');
      play.className = 'yt-play';
      play.setAttribute('aria-hidden', 'true');
      play.innerHTML = '<i class="bi bi-play-fill"></i>';

      poster.append(thumb, play);
      poster.addEventListener('click', () => {
        const iframe = youTubeIframe(id, title);
        frame.replaceChildren(iframe);
        iframe.focus();
      }, { once: true });

      frame.replaceChildren(poster);
    });
  }

  /* ---------------------------------------------------------
   * Showreel — #home[data-showreel-id]가 있으면 버튼 표시
   * ------------------------------------------------------- */
  function initShowreel() {
    const hero = $('[data-showreel-id]');
    const button = $('.showreel-open');
    const dialog = $('.reel-dialog');
    if (!hero || !button || !dialog || typeof dialog.showModal !== 'function') return;

    const id = (hero.getAttribute('data-showreel-id') || '').trim();
    if (!YT_ID.test(id)) return;

    const frame = $('.reel-frame', dialog);
    button.hidden = false;

    button.addEventListener('click', () => {
      frame.replaceChildren(youTubeIframe(id, '이영민 쇼릴'));
      dialog.showModal();
    });

    $('.reel-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // 바깥 클릭
    dialog.addEventListener('close', () => {
      frame.replaceChildren();   // 재생 중지
      button.focus();
    });
  }

  /* ---------------------------------------------------------
   * Copy email
   * ------------------------------------------------------- */
  function initCopyEmail() {
    $$('.copy-email').forEach((button) => {
      // 같은 섹션의 안내 문구 하나를 함께 씀 (큰 메일 주소 · 주소 복사 버튼)
      const status = $('.copy-status', button.closest('section') || button.parentElement);
      let timer = 0;

      button.addEventListener('click', async () => {
        let copied = false;
        try {
          await navigator.clipboard.writeText(button.getAttribute('data-copy'));
          copied = true;
        } catch (err) {
          copied = false;
        }
        if (!status) return;
        status.textContent = copied
          ? '이메일 주소를 복사했습니다.\n잘 부탁드립니다!'   // 줄바꿈은 사이드바에서만 적용 (CSS white-space)
          : '복사하지 못했습니다. 주소를 직접 선택해 주세요.';
        clearTimeout(timer);
        timer = setTimeout(() => { status.textContent = ''; }, 4000);   // 문구가 길어져 조금 더 오래 표시
      });
    });
  }

  /* ---------------------------------------------------------
   * Scroll top
   * ------------------------------------------------------- */
  function initScrollTop() {
    const button = $('.scroll-top');
    if (!button) return;

    const update = () => button.classList.toggle('is-visible', window.scrollY > 600);
    window.addEventListener('scroll', onFrame(update), { passive: true });
    update();

    button.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
   * Run
   * ------------------------------------------------------- */
  initNavDrawer();
  initTimeline();
  initAboutPhoto();
  initWorkReveal();
  initWorkPreview();
  initPlayCursor();
  initSectionWipe();
  initCredits();
  initVideoEmbeds();
  initShowreel();
  initCopyEmail();
  initScrollTop();
})();
