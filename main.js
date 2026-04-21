/* ============================================
   VIZIOM — main.js
   ============================================ */

/* ── Page Loader ── */
(function () {
  const MIN = 1500, MAX = 3500;
  const overlay = document.getElementById('page-loader');
  const bar = document.getElementById('loader-bar');
  const logo = document.getElementById('loader-logo');
  const start = performance.now();
  let isLoaded = document.readyState === 'complete';
  let rafId;

  window.addEventListener('load', () => { isLoaded = true; });

  function tick(now) {
    const elapsed = now - start;
    let pct;
    if (elapsed < MIN) {
      pct = (elapsed / MIN) * 0.7;
    } else if (isLoaded || elapsed >= MAX) {
      pct = 0.7 + Math.min((elapsed - MIN) / 600, 1) * 0.3;
    } else {
      pct = 0.7 + Math.min((elapsed - MIN) / (MAX - MIN), 1) * 0.2;
    }
    pct = Math.min(pct, 1);
    bar.style.transform = `scaleX(${pct})`;

    if (pct < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      startExit();
    }
  }
  rafId = requestAnimationFrame(tick);

  function startExit() {
    window.dispatchEvent(new Event('viziom:ready'));
    gsap.timeline({ onComplete: () => { overlay.style.display = 'none'; } })
      .to(logo, { scale: 8, opacity: 0, duration: 0.75, ease: 'power3.in' }, 0)
      .to(overlay, { opacity: 0, duration: 0.75, ease: 'power2.in' }, 0);
  }
})();

/* ── Custom Cursor ── */
(function () {
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasHover) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;
  let hovering = false, ready = false, rafId;

  function onFirstMove(e) {
    mx = e.clientX; my = e.clientY;
    rx = mx; ry = my;
    document.body.classList.add('custom-cursor-active');
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    ready = true;
    window.removeEventListener('mousemove', onFirstMove);
    window.addEventListener('mousemove', onMove);
  }

  function onMove(e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  }

  function animate() {
    if (ready) {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      const size = hovering ? 50 : 36;
      ring.style.transform = `translate(${rx - size / 2}px, ${ry - size / 2}px)`;
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
    }
    rafId = requestAnimationFrame(animate);
  }

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [data-cursor-hover]')) {
      hovering = true;
      ring.style.borderColor = 'var(--accent)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [data-cursor-hover]')) {
      hovering = false;
      ring.style.borderColor = 'rgba(245,240,235,0.4)';
    }
  });

  window.addEventListener('mousemove', onFirstMove);
  rafId = requestAnimationFrame(animate);
})();

/* ── Header ── */
(function () {
  const header = document.getElementById('header');
  const burgerPillWrap = document.getElementById('burger-pill-wrap');
  const burgerPill = document.getElementById('burger-pill');
  const burgerBtn = document.getElementById('burger-btn');
  const burgerDropdown = document.getElementById('burger-dropdown');
  const desktopNav = document.getElementById('desktop-nav');
  const mobileBurger = document.getElementById('mobile-burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('backdrop');
  const headerLogo = document.getElementById('header-logo');
  let scrolled = false;
  let menuOpen = false;

  window.addEventListener('viziom:ready', () => {
    gsap.to(header, { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', delay: 1.5 });
  });

  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 80;
    if (isScrolled === scrolled) return;
    scrolled = isScrolled;

    if (scrolled) {
      gsap.to(desktopNav, {
        x: -40, opacity: 0, duration: 0.45, ease: 'power3.in',
        onComplete: () => {
          desktopNav.style.pointerEvents = 'none';
          desktopNav.style.visibility = 'hidden';
        }
      });
      gsap.to(headerLogo, { opacity: 0, duration: 0.25, ease: 'power2.in' });
      headerLogo.style.pointerEvents = 'none';
      burgerPill.classList.add('scrolled');
    } else {
      window.closeMenu();
      burgerPill.style.transition = 'max-width 0.6s cubic-bezier(0.7,0,1,1), opacity 0.4s ease';
      burgerPill.classList.remove('scrolled');
      setTimeout(() => { burgerPill.style.transition = ''; }, 700);
      gsap.to(headerLogo, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.4 });
      headerLogo.style.pointerEvents = 'auto';
      desktopNav.style.visibility = 'visible';
      desktopNav.style.pointerEvents = 'auto';
      gsap.fromTo(desktopNav,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.5 }
      );
    }
  }, { passive: true });

  // Hover scramble dropdown links
  document.querySelectorAll('.dropdown-link').forEach(link => {
    const arrow = link.querySelector('span') ? link.querySelector('span').outerHTML : '';
    const text = link.childNodes[0].textContent.trim();
    link.innerHTML = `<span style="display:inline-flex">${text.split('').map(c =>
      `<span style="display:inline-block;overflow:hidden;height:1.2em;vertical-align:top"><span style="display:block;line-height:1.2;text-shadow:0 1.2em 0 currentColor">${c === ' ' ? '&nbsp;' : c}</span></span>`
    ).join('')}</span>${arrow}`;

    link.addEventListener('mouseenter', () => {
      const chars = link.querySelectorAll('span > span > span');
      gsap.to(chars, { yPercent: -100, duration: 0.5, ease: 'power4.inOut', stagger: 0.03 });
    });
    link.addEventListener('mouseleave', () => {
      const chars = link.querySelectorAll('span > span > span');
      gsap.to(chars, { yPercent: 0, duration: 0.4, ease: 'power4.inOut', stagger: 0.03 });
    });
  });

  function openMenu() {
    menuOpen = true;
    burgerPill.classList.add('menu-open');
    burgerDropdown.classList.add('open');
    mobileBurger.classList.add('menu-open');
    mobileMenu.classList.add('active');
    backdrop.classList.add('active');
    burgerBtn.setAttribute('aria-expanded', 'true');
    mobileBurger.setAttribute('aria-expanded', 'true');
  }

  window.closeMenu = function () {
    menuOpen = false;
    burgerPill.classList.remove('menu-open');
    burgerDropdown.classList.remove('open');
    mobileBurger.classList.remove('menu-open');
    mobileMenu.classList.remove('active');
    backdrop.classList.remove('active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileBurger.setAttribute('aria-expanded', 'false');
  };

  function toggleMenu() {
    menuOpen ? window.closeMenu() : openMenu();
  }

  burgerBtn.addEventListener('click', toggleMenu);
  mobileBurger.addEventListener('click', toggleMenu);

  const navLinks = document.querySelectorAll('.nav-link');
  const pillHighlight = document.getElementById('nav-pill-highlight');

  navLinks.forEach(link => {
    const text = link.textContent.trim();
    link.innerHTML = `<span class="nav-chars">${text.split('').map(c =>
      `<span class="nav-char"><span class="nav-char-inner">${c === ' ' ? '&nbsp;' : c}</span></span>`
    ).join('')}</span>`;

    link.addEventListener('mouseenter', e => {
      navLinks.forEach(l => l.style.opacity = '0.25');
      link.style.opacity = '1';
      const navRect = desktopNav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      gsap.to(pillHighlight, {
        x: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out'
      });
      const chars = link.querySelectorAll('.nav-char-inner');
      gsap.to(chars, { yPercent: -100, duration: 0.5, ease: 'power4.inOut', stagger: 0.03 });
    });

    link.addEventListener('mouseleave', () => {
      const chars = link.querySelectorAll('.nav-char-inner');
      gsap.to(chars, { yPercent: 0, duration: 0.4, ease: 'power4.inOut', stagger: 0.03 });
    });
  });

  desktopNav.addEventListener('mouseleave', () => {
    navLinks.forEach(l => l.style.opacity = '0.6');
    gsap.to(pillHighlight, { opacity: 0, duration: 0.2, ease: 'power2.out' });
  });

})();

/* ── Hero WebGL Background ── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;

  const VERT = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform float uTime;
    uniform vec2  uMouse;
    uniform vec2  uMouseRaw;
    uniform float uEffect;
    uniform float uCellSize;
    uniform float uRadius;
    uniform float uCA;
    uniform float uScale;
    uniform float uIntensity;
    uniform vec3  uC1;
    uniform vec3  uC2;
    uniform vec3  uC3;
    uniform vec2  uResolution;

    vec3 mod289v3(vec3 x){ return x - floor(x*(1./289.))*289.; }
    vec4 mod289v4(vec4 x){ return x - floor(x*(1./289.))*289.; }
    vec4 permute(vec4 x){ return mod289v4((x*34.+1.)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.792842914 - 0.853132932*r; }

    float snoise(vec3 v){
      const vec2 C = vec2(1./6., 1./3.);
      const vec4 D = vec4(0., .5, 1., 2.);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g  = step(x0.yzx, x0.xyz);
      vec3 l  = 1. - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289v3(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0., i1.z, i2.z, 1.))
        + i.y + vec4(0., i1.y, i2.y, 1.))
        + i.x + vec4(0., i1.x, i2.x, 1.));
      float n_ = .142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j   = p - 49.*floor(p*ns.z*ns.z);
      vec4 x_  = floor(j*ns.z);
      vec4 y_  = floor(j - 7.*x_);
      vec4 x   = x_*ns.x + ns.yyyy;
      vec4 y   = y_*ns.x + ns.yyyy;
      vec4 h   = 1. - abs(x) - abs(y);
      vec4 b0  = vec4(x.xy, y.xy);
      vec4 b1  = vec4(x.zw, y.zw);
      vec4 s0  = floor(b0)*2.+1.;
      vec4 s1  = floor(b1)*2.+1.;
      vec4 sh  = -step(h, vec4(0.));
      vec4 a0  = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1  = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0  = vec3(a0.xy, h.x);
      vec3 p1  = vec3(a0.zw, h.y);
      vec3 p2  = vec3(a1.xy, h.z);
      vec3 p3  = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
      vec4 m = max(.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
      m = m*m;
      return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    vec3 gradientAt(vec2 uv) {
      vec2 p = uv * uScale;
      p += (uMouse - 0.5) * 0.12;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        p += snoise(vec3(p - fi*0.2, uTime + fi*32.0)) * uIntensity;
      }
      float n = snoise(vec3(p, sin(uTime*0.5))) * 0.5 + 0.5;
      return n < 0.5 ? mix(uC1, uC2, n*2.0) : mix(uC2, uC3, (n-0.5)*2.0);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      vec3 color = gradientAt(uv);
      if (uEffect > 0.01) {
        float dist  = length(uv - uMouseRaw);
        float zone  = 1.0 - smoothstep(uRadius*0.5, uRadius, dist);
        float blend = zone * uEffect;
        if (blend > 0.01) {
          vec2 cell   = vec2(uCellSize) / uResolution;
          vec2 pixUV  = floor(uv / cell) * cell + cell*0.5;
          vec3 pixColor = gradientAt(pixUV);
          vec2 ca = vec2(uCA, 0.0);
          float r = gradientAt(pixUV + ca).r;
          float b = gradientAt(pixUV - ca).b;
          pixColor = vec3(r, pixColor.g, b);
          color = mix(color, pixColor, blend);
        }
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    time: gl.getUniformLocation(prog, 'uTime'),
    mouse: gl.getUniformLocation(prog, 'uMouse'),
    mouseRaw: gl.getUniformLocation(prog, 'uMouseRaw'),
    effect: gl.getUniformLocation(prog, 'uEffect'),
    cellSize: gl.getUniformLocation(prog, 'uCellSize'),
    radius: gl.getUniformLocation(prog, 'uRadius'),
    ca: gl.getUniformLocation(prog, 'uCA'),
    scale: gl.getUniformLocation(prog, 'uScale'),
    intensity: gl.getUniformLocation(prog, 'uIntensity'),
    c1: gl.getUniformLocation(prog, 'uC1'),
    c2: gl.getUniformLocation(prog, 'uC2'),
    c3: gl.getUniformLocation(prog, 'uC3'),
    resolution: gl.getUniformLocation(prog, 'uResolution'),
  };

  gl.uniform3f(u.c1, 0.0, 0.565, 0.502);
  gl.uniform3f(u.c2, 0.016, 0.094, 0.094);
  gl.uniform3f(u.c3, 0.039, 0.039, 0.039);
  gl.uniform1f(u.cellSize, 18.0);
  gl.uniform1f(u.radius, 0.2);
  gl.uniform1f(u.ca, 0.007);
  gl.uniform1f(u.scale, 1.1);
  gl.uniform1f(u.intensity, 0.38);

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
  let prevMx = 0.5, prevMy = 0.5;
  let effectTarget = 0, effectCurrent = 0, dwellTimer = 0;
  const SPEED_THRESHOLD = 0.0015, DWELL_DELAY = 0.4;
  let isVisible = true;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth;
    my = 1.0 - e.clientY / window.innerHeight;
  });
  document.addEventListener('mouseleave', () => { effectTarget = 0; });

  const io = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) isVisible = false; });

  let lastNow = 0;
  function animate(now) {
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    if (isVisible) {
      const t = now / 1000;
      smx += (mx - smx) * 0.07; smy += (my - smy) * 0.07;
      const vx = mx - prevMx, vy = my - prevMy;
      prevMx = mx; prevMy = my;
      if (Math.sqrt(vx*vx + vy*vy) > SPEED_THRESHOLD) {
        effectTarget = 1; dwellTimer = 0;
      } else {
        dwellTimer += dt;
        if (dwellTimer > DWELL_DELAY) effectTarget = 0;
      }
      effectCurrent += (effectTarget - effectCurrent) * 0.08;
      gl.uniform1f(u.time, t * 0.25);
      gl.uniform2f(u.mouse, smx, smy);
      gl.uniform2f(u.mouseRaw, mx, my);
      gl.uniform1f(u.effect, effectCurrent);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

/* ── Hero Animations ── */
(function () {
  const LINES = ['STUDIO', 'CRÉATIF', 'ET DIGITAL'];
  const titleEl = document.getElementById('hero-title');
  const titleBlackEl = document.querySelector('#hero-title-black h1');
  const titleWrap = document.getElementById('hero-title-wrap');
  const heroDesc = document.getElementById('hero-desc');
  const heroGlow = document.getElementById('hero-glow');
  const heroCanvas = document.getElementById('hero-canvas');
  const scrollIndicator = document.getElementById('scroll-indicator');

  function buildTitle(el) {
    const lines = el.querySelectorAll('.hero-line');
    const allChars = [];
    lines.forEach((line, li) => {
      const inner = line.querySelector('.hero-line-inner');
      const text = LINES[li];
      inner.innerHTML = text.split('').map(c =>
        `<span class="t-char" style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span>`
      ).join('');
      allChars.push(...inner.querySelectorAll('.t-char'));
    });
    return allChars;
  }

  const chars = buildTitle(titleEl);
  const charsBlack = buildTitle(titleBlackEl);

  let titleStarted = false;
  function startLoopingTitle() {
    if (titleStarted) return;
    titleStarted = true;

    function loop() {
      gsap.set(chars, { opacity: 0, y: 28 });
      gsap.set(charsBlack, { opacity: 0, y: 28 });
      const tl = gsap.timeline({ onComplete: () => setTimeout(loop, 1000) });
      tl.to([chars, charsBlack], { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: { each: 0.045, from: 'start' } });
      tl.to({}, { duration: 5 });
      tl.to([chars, charsBlack], { opacity: 0, y: -22, duration: 0.4, ease: 'power2.in', stagger: { each: 0.045, from: 'end' } });
    }
    loop();
  }

  window.addEventListener('viziom:ready', () => {
    const tl = gsap.timeline();
    tl.fromTo(heroCanvas, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0);
    tl.fromTo(heroGlow, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, 0.2);
    tl.fromTo(titleWrap, { x: -90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, ease: 'power3.out', onComplete: startLoopingTitle }, 1.5);
    tl.fromTo(heroDesc, { x: 90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, 1.5);
    tl.fromTo(scrollIndicator, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.25);
  });

  titleWrap.addEventListener('mousemove', e => {
    const rect = titleWrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    document.getElementById('hero-title-black').style.clipPath = `circle(28px at ${x}px ${y}px)`;
  });
  titleWrap.addEventListener('mouseleave', () => {
    document.getElementById('hero-title-black').style.clipPath = 'circle(0px at 50% 50%)';
  });
})();

/* ── Scroll Hijack + Zoom Transition ── */
(function () {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  const heroContent = document.getElementById('hero-content');
  const heroGlow = document.getElementById('hero-glow');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const manifesto = document.getElementById('manifesto');
  const afterSections = document.querySelectorAll('#manifesto ~ *');
  const backBtn = document.getElementById('back-btn');

  let transitioning = false;
  let onHero = true;

  manifesto.style.opacity = '0';
  manifesto.style.display = 'none';
  manifesto.style.pointerEvents = 'none';
  afterSections.forEach(el => el.style.display = 'none');

  function zoomIn() {
    if (transitioning || !onHero) return;
    transitioning = true;
    document.body.classList.add('scroll-locked');

    const tl = gsap.timeline({
      onComplete: () => {
        onHero = false;
        transitioning = false;
        document.body.classList.remove('scroll-locked');
        canvas.style.display = 'none';
        hero.style.display = 'none';
        backBtn.style.display = 'block';
      }
    });

    tl.to([heroContent, heroGlow, scrollIndicator], {
      opacity: 0, duration: 0.6, ease: 'power2.in'
    }, 0);

    tl.to(canvas, {
      scale: 8, duration: 2.5, ease: 'power3.inOut'
    }, 0);

    tl.to(hero, {
      opacity: 0, duration: 0.8, ease: 'power2.in'
    }, 1.8);

    tl.to(manifesto, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      onStart: () => {
        manifesto.style.display = 'flex';
        manifesto.style.pointerEvents = 'auto';
        afterSections.forEach(el => { el.style.display = ''; el.style.removeProperty('display'); });
        setTimeout(() => window.dispatchEvent(new Event('manifesto:reveal')), 100);
        // Reset slide 1 pour forcer le repaint
        setTimeout(() => {
          const slidesContainer = document.getElementById('slides-container');
          if (slidesContainer) {
            slidesContainer.style.transition = 'none';
            slidesContainer.style.transform = 'translateX(0)';
            setTimeout(() => { slidesContainer.style.transition = ''; }, 50);
          }
        }, 200);
      }
    }, 2.2);
  }

  function zoomOut() {
    if (transitioning || onHero) return;
    transitioning = true;
    document.body.classList.add('scroll-locked');

    gsap.to(backBtn, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { backBtn.style.display = 'none'; }
    });

    canvas.style.display = 'block';
    hero.style.display = 'flex';

    const tl = gsap.timeline({
      onComplete: () => {
        onHero = true;
        transitioning = false;
        document.body.classList.remove('scroll-locked');
      }
    });

    tl.to(manifesto, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        manifesto.style.display = 'none';
        manifesto.style.pointerEvents = 'none';
        afterSections.forEach(el => el.style.display = 'none');
      }
    }, 0);

    tl.to(hero, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.4);
    tl.to(canvas, { scale: 1, duration: 2.5, ease: 'power3.inOut' }, 0.4);
    tl.to([heroContent, heroGlow, scrollIndicator], { opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.8);
  }

  backBtn.addEventListener('click', () => {
    window.scrollTo(0, 0);
    zoomOut();
  });

  window.addEventListener('wheel', (e) => {
    if (transitioning) return;
    if (onHero && e.deltaY > 0) zoomIn();
  }, { passive: true });

  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (transitioning) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (onHero && diff > 50) zoomIn();
  }, { passive: true });

  window.addEventListener('manifesto:back', () => {
    if (!onHero) zoomOut();
  });

})();

/* ── Manifesto Section ── */
(function () {
  const items = Array.from(document.querySelectorAll('#manifesto .manifesto-item'));

  items.forEach(item => {
    const temp = document.createElement('div');
    temp.innerHTML = item.innerHTML;
    let result = '';
    temp.childNodes.forEach(node => {
      if (node.nodeType === 3) {
        result += node.textContent.split('').map(c =>
          c === ' ' ? ' ' : `<span class="m-char">${c}</span>`
        ).join('');
      } else {
        result += node.outerHTML;
      }
    });
    item.innerHTML = result;
    item.style.opacity = '0';
  });

  let allChars = [];
  let currentIndex = 0;
  let active = false;
  const CHARS_PER_SCROLL = 12;
  const manifestoEl = document.getElementById('manifesto');

  window.addEventListener('manifesto:reveal', () => {
    allChars = Array.from(document.querySelectorAll('#manifesto .m-char'));
    currentIndex = 0;
    active = false;
    setTimeout(() => {
      items.forEach(item => { item.style.opacity = '1'; });
      allChars.forEach(c => { c.style.opacity = '0.3'; });
      active = true;
    }, 1000);
  });

  window.addEventListener('wheel', (e) => {
    if (!active) return;

    const rect = manifestoEl.getBoundingClientRect();
    const fullyVisible = rect.top >= -5 && rect.bottom <= window.innerHeight + 5;
    if (!fullyVisible) return;

    e.preventDefault();

    if (e.deltaY > 0) {
      const next = Math.min(currentIndex + CHARS_PER_SCROLL, allChars.length);
      for (let i = currentIndex; i < next; i++) {
        allChars[i].style.opacity = '1';
        allChars[i].style.transition = 'opacity 0.2s ease';
      }
      currentIndex = next;
      if (currentIndex >= allChars.length) {
        active = false;
      }
    }
  }, { passive: false });

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && currentIndex > 0 && currentIndex < allChars.length) {
      active = true;
    } else if (!entry.isIntersecting) {
      active = currentIndex > 0 && currentIndex < allChars.length;
    }
  }, { threshold: 0.99 });
  io.observe(manifestoEl);

  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!active) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 30) window.dispatchEvent(new WheelEvent('wheel', { deltaY: 1 }));
  }, { passive: true });
})();

/* ── Section 3 Horizontal Scroll ── */
(function () {
  const section3 = document.getElementById('section-3');
  const slidesContainer = document.getElementById('slides-container');
  const totalSlides = 6;
  let currentSlide = 0;
  let active = false;
  let transitioning = false;
  let sectionReady = false;

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      active = true;
      currentSlide = 0;
      slidesContainer.style.transition = 'none';
      slidesContainer.style.transform = 'translateX(0)';
      const bar = document.getElementById('slides-progress-bar');
      if (bar) bar.style.setProperty('--progress', '20%');
      setTimeout(() => {
        slidesContainer.style.transition = '';
        sectionReady = false;
        setTimeout(() => { sectionReady = true; }, 1500);
      }, 50);
    } else {
      active = false;
      sectionReady = false;
    }
  }, { threshold: 0.3 });
  io.observe(section3);

  function goToSlide(index) {
    if (transitioning) return;
    if (index < 0 || index >= totalSlides) return;
    transitioning = true;
    currentSlide = index;
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}vw)`;
    const bar = document.getElementById('slides-progress-bar');
    bar.style.setProperty('--progress', `${(currentSlide + 1) * (100 / totalSlides)}%`);
    setTimeout(() => { transitioning = false; }, 850);
  }

  window.addEventListener('wheel', (e) => {
    if (!sectionReady) return;
    const rect = section3.getBoundingClientRect();
    const bottomVisible = rect.bottom <= window.innerHeight;
    if (!bottomVisible) return;

    if (e.deltaY < 0 && currentSlide === 0) return;
    if (e.deltaY > 0 && currentSlide === totalSlides - 1) return;

    e.preventDefault();

    if (transitioning) return;

    if (e.deltaY > 0) {
      goToSlide(currentSlide + 1);
    } else if (e.deltaY < 0) {
      goToSlide(currentSlide - 1);
    }
  }, { passive: false });

})();

/* ── Section 4 Pixel Transition ── */
(function () {
  const overlay = document.getElementById('pixel-overlay');
  const section4 = document.getElementById('section-4');
  const galerieBtn = document.getElementById('galerie-btn');
  const CELL_SIZE = 60;

  function buildPixels() {
    overlay.innerHTML = '';
    const cols = Math.ceil(window.innerWidth / CELL_SIZE);
    const rows = Math.ceil(window.innerHeight / CELL_SIZE);

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ r, c, dist: (rows - r) + c });
      }
    }
    cells.sort((a, b) => a.dist - b.dist);

    cells.forEach(({ r, c }) => {
      const el = document.createElement('div');
      el.className = 'pixel-cell';
      el.style.left = `${c * CELL_SIZE}px`;
      el.style.top = `${r * CELL_SIZE}px`;
      el.style.width = `${CELL_SIZE}px`;
      el.style.height = `${CELL_SIZE}px`;
      overlay.appendChild(el);
    });

    return overlay.querySelectorAll('.pixel-cell');
  }

  function openSection4() {
    overlay.style.display = 'block';
    const cells = buildPixels();
    const total = cells.length;

    cells.forEach((cell, i) => {
      const delay = (i / total) * 1.2;
      gsap.to(cell, {
        opacity: 1,
        duration: 0.15,
        delay,
        ease: 'none',
        onComplete: i === total - 1 ? () => {
          section4.style.display = 'flex';
          gsap.to(section4, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(Array.from(cells), {
                opacity: 0,
                duration: 0.15,
                stagger: { each: 0.005, from: 'end' },
                onComplete: () => { overlay.style.display = 'none'; }
              });
            }
          });
        } : undefined
      });
    });
  }

  window.closeSection4 = function () {
    gsap.to(section4, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        section4.style.display = 'none';
      }
    });
  };

  galerieBtn.addEventListener('click', openSection4);
})();

/* ── Carousel slide 1 ── */
(function () {
  const track = document.getElementById('carousel-1');
  const dots = document.querySelectorAll('#dots-1 .carousel-dot');
  let current = 0;
  let startX = 0;
  let isDragging = false;

  function goTo(index) {
    current = Math.max(0, Math.min(index, dots.length - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  track.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });

  track.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
  });

  track.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
  });

  track.addEventListener('mouseleave', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
  });

  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
})();

/* ── Card glow effect ── */
document.querySelectorAll('.slide-card').forEach(card => {
  const glow = card.querySelector('.card-glow');
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    glow.style.left = `${e.clientX - rect.left}px`;
    glow.style.top = `${e.clientY - rect.top}px`;
  });
});

/* ── Carousel slide 3 ── */
(function () {
  const track = document.getElementById('carousel-3');
  const dots = document.querySelectorAll('#dots-3 .carousel-dot');
  let current = 0;
  let startX = 0;
  let isDragging = false;

  function goTo(index) {
    current = Math.max(0, Math.min(index, dots.length - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  track.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
  track.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
  });
  track.addEventListener('mouseleave', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
  });
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
})();

/* ── Card glow slide 4 ── */
document.querySelectorAll('.slide4-card .card-glow').forEach(glow => {
  const card = glow.closest('.slide4-card');
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    glow.style.left = `${e.clientX - rect.left}px`;
    glow.style.top = `${e.clientY - rect.top}px`;
  });
});