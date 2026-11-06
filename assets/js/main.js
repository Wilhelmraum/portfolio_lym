/**
 * Yeongmin Lee Portfolio — main script
 * - Sidebar / mobile drawer
 * - Section scrollspy
 * - YouTube thumbnails & click-to-load embeds (data-youtube-id)
 * - Showreel dialog (data-showreel-id)
 * - Copy email, scroll-top, AOS
 */
(function () {
  'use strict';

  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1200px)');
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;

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

  function isOpen() {
    return body.classList.contains('nav-open');
  }

  function setNav(open, restoreFocus) {
    if (!sidebar || !toggleBtn) return;
    body.classList.toggle('nav-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    outside.forEach((el) => { el.inert = open; });
    if (open) {
      (closeBtn || sidebar).focus();
    } else if (restoreFocus) {
      toggleBtn.focus();
    }
  }

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => setNav(!isOpen(), false));
    if (closeBtn) closeBtn.addEventListener('click', () => setNav(false, true));
    if (backdrop) backdrop.addEventListener('click', () => setNav(false, true));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setNav(false, true);
    });

    sidebar.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (isOpen()) setNav(false, false);
      });
    });

    desktop.addEventListener('change', (e) => {
      if (e.matches && isOpen()) setNav(false, false);
    });
  }

  /* ---------------------------------------------------------
   * Scrollspy — 현재 보이는 섹션의 메뉴 활성화
   * ------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.sidenav a'));
  const spyTargets = navLinks
    .map((link) => {
      const hash = link.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') return null; // 다른 페이지 링크는 제외
      const section = document.querySelector(hash);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  function setActive(link) {
    navLinks.forEach((l) => {
      const active = l === link;
      l.classList.toggle('is-active', active);
      if (active) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  }

  if (spyTargets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = spyTargets.find((t) => t.section === entry.target);
        if (target) setActive(target.link);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    spyTargets.forEach((t) => spy.observe(t.section));
  }

  /* ---------------------------------------------------------
   * YouTube — data-youtube-id 가 있을 때만 동작
   *  data-mode="thumb" : 썸네일만 표시 (목록 카드)
   *  data-mode="embed" : 썸네일 + 클릭 시 플레이어 로드 (상세 페이지)
   * ------------------------------------------------------- */
  function ytThumb(id) {
    const img = document.createElement('img');
    img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
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

  document.querySelectorAll('.media-frame[data-youtube-id]').forEach((frame) => {
    const id = (frame.getAttribute('data-youtube-id') || '').trim();
    if (!YT_ID.test(id)) return; // 비어 있거나 형식이 다르면 '준비 중' 틀 유지

    const title = frame.getAttribute('data-title') || '';
    const mode = frame.getAttribute('data-mode') || 'thumb';
    frame.replaceChildren();

    if (mode === 'embed') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yt-poster';
      btn.setAttribute('aria-label', (title ? title + ' ' : '') + '영상 재생');
      btn.appendChild(ytThumb(id));
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
    } else {
      frame.appendChild(ytThumb(id));
    }
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
    reelDialog.addEventListener('click', (e) => {
      if (e.target === reelDialog) reelDialog.close(); // 바깥 영역 클릭
    });
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
      const text = btn.getAttribute('data-copy');
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
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

  /* ---------------------------------------------------------
   * AOS — 절제된 등장 효과, 모션 최소화 설정 시 비활성화
   * ------------------------------------------------------- */
  if (window.AOS) {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      disable: reduceMotion.matches
    });
    window.addEventListener('load', () => AOS.refresh());
  }
})();
