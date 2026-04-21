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
  const totalSlides = 7;
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

/* ── Carousel slide 7 ── */
(function () {
  const track = document.getElementById('carousel-7');
  const dots = document.querySelectorAll('#dots-7 .carousel-dot');
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

/* ── Slide 5 : 3D morph particules ── */
(function () {
  const canvas = document.getElementById('morph-canvas');
  const label = document.getElementById('morph-label');
  if (!canvas || !window.THREE) return;

  const THREE = window.THREE;
  const N = 1500;

  // OBJ data — 1500 points each, flat [x,y,z,x,y,z,...]
  const SHAPES = [
    [-0.5721,-0.5553,0.5614,0.5662,-0.5553,0.5614,0.5662,-0.5553,-0.5769,-0.5721,-0.5553,-0.5769,-0.5721,0.5830,0.5614,0.5662,0.5830,0.5614,0.5662,0.5830,-0.5769,-0.5721,0.5830,-0.5769,0.5935,-0.5826,-0.0078,-0.0029,-0.5826,-0.6043,-0.5994,-0.5826,-0.0078,-0.5994,0.0139,0.5887,-0.0029,0.6103,0.5887,0.5935,0.0139,0.5887,0.5935,0.6103,-0.0078,0.6441,0.0139,-0.0078,-0.0029,0.6103,-0.6043,-0.5994,0.0139,-0.6043,-0.5994,0.6103,-0.0078,-0.0029,-0.6332,0.3157,-0.3264,-0.6332,-0.0078,-0.5994,-0.5826,0.3157,-0.3264,-0.6332,0.3157,0.3206,-0.5826,0.5887,0.5935,-0.5826,0.3157,0.3206,-0.6332,-0.0078,0.3206,-0.6332,0.3157,0.5935,-0.5826,-0.3313,0.3206,-0.5826,-0.6043,-0.0029,-0.6332,-0.3313,-0.3264,-0.5826,-0.6043,-0.5994,-0.5826,-0.3313,-0.3264,-0.6332,-0.3313,-0.5994,-0.3096,0.5887,-0.3264,0.0139,0.6392,-0.0029,-0.3096,0.6392,-0.3264,-0.3096,0.6392,-0.3264,0.6103,0.5887,-0.0029,0.3374,0.6392,-0.3264,0.3374,0.6392,0.3206,0.6103,0.5887,0.5935,0.3374,0.5887,0.3206,0.0139,0.6392,0.3206,0.3374,0.6392,0.3206,-0.3096,0.6392,0.6441,0.0139,0.3157,0.6441,-0.3096,-0.0078,0.6441,-0.3096,0.3157,0.5935,0.6103,0.3157,0.6441,0.3374,-0.0078,0.6441,0.3374,0.3157,0.5935,0.3374,-0.6043,0.6441,0.0139,-0.3313,0.6441,0.3374,-0.3313,0.5935,-0.3096,-0.6043,0.6441,-0.3096,-0.3313,-0.0029,-0.3096,-0.6548,-0.3264,0.0139,-0.6548,-0.5994,-0.3096,-0.6043,0.3206,0.0139,-0.6548,0.3206,-0.3096,-0.6548,0.3206,0.6103,-0.6043,-0.0029,0.3374,-0.6548,0.3206,0.3374,-0.6548,-0.3264,0.6103,-0.6043,-0.5994,0.3374,-0.6043,-0.6500,-0.3096,-0.0078,-0.6500,0.0139,0.3157,-0.6500,-0.3096,0.3157,-0.6500,0.0139,-0.3313,-0.6500,-0.3096,-0.3313,-0.5994,0.6103,-0.3313,-0.6500,0.3374,-0.0078,-0.5994,0.6103,0.3157,-0.6500,0.3374,0.3157,-0.3264,0.6609,-0.0078,-0.0029,0.6609,0.3157,-0.3264,0.6609,0.3157,-0.0029,0.6609,-0.3313,-0.3264,0.6609,-0.3313,0.3206,0.6609,-0.0078,0.3206,0.6609,0.3157,-0.5955,-0.5787,0.4685,-0.4792,-0.5787,0.5848,-0.5955,-0.4624,0.5848,0.4733,-0.5787,0.5848,0.5896,-0.5787,0.4685,0.5896,-0.4624,0.5848,0.4733,-0.5787,-0.6003,0.5896,-0.4624,-0.6003,-0.4792,-0.5787,-0.6003,-0.5955,-0.5787,-0.4841,-0.5955,-0.4624,-0.6003,-0.5955,0.4901,0.5848,-0.4792,0.6064,0.5848,0.4733,0.6064,0.5848,0.5896,0.4901,0.5848,0.5896,0.6064,0.4685,0.5896,0.6064,-0.4841,0.5896,0.4901,-0.6003,0.4733,0.6064,-0.6003,-0.4792,0.6064,-0.6003,-0.5955,0.6064,-0.4841,-0.0029,-0.6281,0.4724,-0.1647,-0.5826,0.5887,0.1588,-0.5826,0.5887,-0.0029,-0.4664,0.6342,0.5935,-0.5826,0.1540,0.4773,-0.6281,-0.0078,0.5935,-0.5826,-0.1695,0.1588,-0.5826,-0.6043,-0.0029,-0.6281,-0.4880,-0.1647,-0.5826,-0.6043,-0.0029,-0.4664,-0.6497,-0.4831,-0.6281,-0.0078,-0.5994,-0.5826,0.1540,-0.5994,-0.5826,-0.1695,-0.0029,-0.6332,0.1540,-0.1647,-0.6332,-0.0078,0.1588,-0.6332,-0.0078,-0.0029,-0.6332,-0.1695,-0.5994,-0.1479,0.5887,-0.4831,0.0139,0.6342,-0.5994,0.1756,0.5887,-0.1647,0.6103,0.5887,-0.0029,0.4941,0.6342,0.1588,0.6103,0.5887,-0.0029,0.6558,0.4724,0.5935,0.1756,0.5887,0.4773,0.0139,0.6342,0.5935,-0.1479,0.5887,0.6390,0.0139,0.4724,-0.0029,-0.1479,0.6392,-0.0029,0.1756,0.6392,0.1588,0.0139,0.6392,0.5935,0.6103,0.1540,0.6390,0.4941,-0.0078,0.5935,0.6103,-0.1695,0.4773,0.6558,-0.0078,0.6390,0.0139,-0.4880,0.5935,-0.1479,-0.6043,0.4773,0.0139,-0.6497,0.6441,0.0139,0.1540,0.6441,-0.1479,-0.0078,0.6441,0.1756,-0.0078,0.6441,0.0139,-0.1695,-0.0029,0.4941,-0.6497,-0.1647,0.6103,-0.6043,-0.0029,0.6558,-0.4880,-0.4831,0.0139,-0.6497,-0.5994,-0.1479,-0.6043,-0.5994,0.1756,-0.6043,-0.6449,0.0139,-0.4880,-0.1647,0.0139,-0.6548,0.1588,0.0139,-0.6548,-0.0029,0.1756,-0.6548,-0.5994,0.6103,-0.1695,-0.6449,0.4941,-0.0078,-0.5994,0.6103,0.1540,-0.4831,0.6558,-0.0078,-0.6500,-0.1479,-0.0078,-0.6500,0.0139,-0.1695,-0.6500,0.1756,-0.0078,-0.1647,0.6609,-0.0078,-0.0029,0.6609,0.1540,-0.0029,0.6609,-0.1695,0.1588,0.6609,-0.0078,-0.1647,-0.6332,0.3157,-0.3264,-0.6332,0.1540,-0.3264,-0.6332,-0.1695,-0.4831,-0.6281,0.3157,-0.6449,-0.4664,0.3157,-0.3264,-0.6281,0.4724,-0.3264,-0.4664,0.6342,0.3206,-0.6281,0.4724,0.4773,-0.6281,0.3157,0.6390,-0.4664,0.3157,0.3206,-0.6332,0.1540,0.3206,-0.6332,-0.1695,0.4773,-0.6281,-0.3313,0.6390,-0.4664,-0.3313,0.3206,-0.6281,-0.4880,0.3206,-0.4664,-0.6497,-0.1647,-0.6332,-0.3313,-0.3264,-0.6281,-0.4880,-0.3264,-0.4664,-0.6497,-0.4831,-0.6281,-0.3313,-0.6449,-0.4664,-0.3313,-0.4831,-0.3096,0.6342,-0.6449,-0.3096,0.4724,-0.3264,0.1756,0.6392,-0.1647,-0.3096,0.6392,0.1588,-0.3096,0.6392,-0.4831,0.3374,0.6342,-0.6449,0.3374,0.4724,-0.3264,0.4941,0.6342,-0.3264,0.6558,0.4724,0.1588,0.3374,0.6392,0.3206,0.4941,0.6342,0.3206,0.6558,0.4724,0.4773,0.3374,0.6342,0.6390,0.3374,0.4724,0.3206,0.1756,0.6392,0.3206,-0.1479,0.6392,0.6390,-0.3096,0.4724,0.6441,-0.1479,0.3157,0.6441,0.1756,0.3157,0.6441,-0.3096,0.1540,0.6441,-0.3096,-0.1695,0.6390,0.4941,0.3157,0.4773,0.6558,0.3157,0.6441,0.3374,0.1540,0.6390,0.4941,-0.3313,0.4773,0.6558,-0.3313,0.6390,0.3374,-0.4880,0.4773,0.3374,-0.6497,0.6441,0.1756,-0.3313,0.6441,-0.1479,-0.3313,0.6390,-0.3096,-0.4880,-0.1647,-0.3096,-0.6548,0.1588,-0.3096,-0.6548,-0.3264,-0.1479,-0.6548,-0.3264,0.1756,-0.6548,-0.4831,-0.3096,-0.6497,-0.6449,-0.3096,-0.4880,0.3206,-0.1479,-0.6548,0.3206,0.4941,-0.6497,0.3206,0.6558,-0.4880,0.1588,0.3374,-0.6548,-0.1647,0.3374,-0.6548,-0.3264,0.4941,-0.6497,-0.3264,0.6558,-0.4880,-0.4831,0.3374,-0.6497,-0.6449,0.3374,-0.4880,-0.6500,-0.3096,-0.1695,-0.6500,-0.1479,0.3157,-0.6500,0.1756,0.3157,-0.6500,-0.1479,-0.3313,-0.6500,0.1756,-0.3313,-0.6449,0.4941,-0.3313,-0.4831,0.6558,-0.3313,-0.6500,0.3374,0.1540,-0.6449,0.4941,0.3157,-0.4831,0.6558,0.3157,-0.3264,0.6609,0.1540,-0.3264,0.6609,-0.1695,-0.1647,0.6609,0.3157,0.1588,0.6609,0.3157,0.1588,0.6609,-0.3313,0.3206,0.6609,-0.1695,0.3206,0.6609,0.1540,-0.1647,-0.6281,0.4724,-0.1647,-0.6332,0.1540,-0.4831,-0.6281,0.1540,-0.4831,-0.6231,0.4724,0.4773,-0.6231,0.4724,0.4773,-0.6281,0.1540,0.1588,-0.6332,0.1540,0.1588,-0.6332,-0.1695,0.4773,-0.6281,-0.1695,0.4773,-0.6231,-0.4880,0.1588,-0.6281,-0.4880,-0.1647,-0.6332,-0.1695,-0.4831,-0.6231,-0.4880,-0.4831,-0.6281,-0.1695,-0.1647,-0.4664,0.6342,-0.4831,-0.4664,0.6291,-0.4831,-0.1479,0.6342,-0.1647,-0.1479,0.6392,-0.1647,0.1756,0.6392,-0.4831,0.4941,0.6291,-0.1647,0.4941,0.6342,0.1588,0.1756,0.6392,0.1588,0.4941,0.6342,0.4773,0.4941,0.6291,0.4773,0.1756,0.6342,0.1588,-0.4664,0.6342,0.4773,-0.1479,0.6342,0.4773,-0.4664,0.6291,0.6340,-0.4664,0.4724,0.6390,-0.1479,0.4724,0.6441,-0.1479,0.1540,0.6390,-0.4664,0.1540,0.6390,0.1756,0.4724,0.6390,0.4941,0.1540,0.6441,0.1756,0.1540,0.6441,0.1756,-0.1695,0.6390,0.4941,-0.1695,0.6340,0.4941,-0.4880,0.6390,0.1756,-0.4880,0.6390,-0.4664,-0.1695,0.6441,-0.1479,-0.1695,0.6340,-0.4664,-0.4880,-0.1647,-0.4664,-0.6497,-0.1647,-0.1479,-0.6548,-0.4831,-0.1479,-0.6497,-0.4831,-0.4664,-0.6447,0.1588,-0.4664,-0.6497,0.4773,-0.4664,-0.6447,0.1588,-0.1479,-0.6548,0.1588,0.1756,-0.6548,0.4773,0.1756,-0.6497,0.4773,0.4941,-0.6447,0.1588,0.4941,-0.6497,-0.1647,0.1756,-0.6548,-0.1647,0.4941,-0.6497,-0.4831,0.1756,-0.6497,-0.6398,-0.4664,0.4724,-0.6449,-0.4664,0.1540,-0.6500,-0.1479,0.1540,-0.6449,-0.1479,0.4724,-0.6449,-0.4664,-0.1695,-0.6398,-0.4664,-0.4880,-0.6449,-0.1479,-0.4880,-0.6500,0.1756,-0.1695,-0.6449,0.1756,-0.4880,-0.6398,0.4941,-0.4880,-0.6449,0.4941,-0.1695,-0.6449,0.1756,0.4724,-0.6500,0.1756,0.1540,-0.6449,0.4941,0.1540,-0.1647,0.6558,0.4724,-0.4831,0.6508,0.4724,-0.4831,0.6558,0.1540,-0.1647,0.6609,0.1540,-0.1647,0.6609,-0.1695,-0.4831,0.6558,-0.1695,-0.4831,0.6508,-0.4880,0.1588,0.6609,-0.1695,0.1588,0.6558,-0.4880,0.4773,0.6508,-0.4880,0.4773,0.6558,-0.1695,0.1588,0.6558,0.4724,0.1588,0.6609,0.1540,0.4773,0.6558,0.1540,-0.5851,-0.5683,0.5264,-0.5371,-0.5683,0.5744,-0.5851,-0.5203,0.5744,0.5312,-0.5683,0.5744,0.5792,-0.5683,0.5264,0.5792,-0.5203,0.5744,0.5792,-0.5683,-0.5419,0.5312,-0.5683,-0.5899,-0.5371,-0.5683,-0.5899,-0.5851,-0.5683,-0.5419,-0.5851,-0.5203,-0.5899,-0.5851,0.5480,0.5744,-0.5371,0.5960,0.5744,-0.5851,0.5960,0.5264,0.5312,0.5960,0.5744,0.5792,0.5960,0.5264,0.5792,0.5960,-0.5419,0.5792,0.5480,-0.5899,0.5312,0.5960,-0.5899,-0.5371,0.5960,-0.5899,-0.5851,0.5480,-0.5899,-0.5851,0.5960,-0.5419,-0.0838,-0.5826,0.5887,0.0779,-0.5826,0.5887,-0.0029,-0.5321,0.6190,0.5935,-0.5826,0.0731,0.5430,-0.6129,-0.0078,0.5935,-0.5826,-0.0887,0.6239,-0.5321,-0.0078,0.0779,-0.5826,-0.6043,-0.0838,-0.5826,-0.6043,-0.0029,-0.5321,-0.6346,-0.5489,-0.6129,-0.0078,-0.5994,-0.5826,0.0731,-0.5994,-0.5826,-0.0887,-0.6297,-0.5321,-0.0078,-0.0029,-0.6332,0.0731,0.0779,-0.6332,-0.0078,-0.0029,-0.6332,-0.0887,-0.5994,-0.0670,0.5887,-0.5489,0.0139,0.6190,-0.5994,0.0947,0.5887,-0.6297,0.0139,0.5381,-0.0838,0.6103,0.5887,0.0779,0.6103,0.5887,-0.0029,0.6407,0.5381,0.5935,0.0947,0.5887,0.5430,0.0139,0.6190,0.5935,-0.0670,0.5887,0.6239,0.0139,0.5381,-0.0838,0.0139,0.6392,-0.0029,0.0947,0.6392,0.0779,0.0139,0.6392,0.5935,0.6103,0.0731,0.6239,0.5598,-0.0078,0.5935,0.6103,-0.0887,0.5430,0.6407,-0.0078,0.5935,0.0947,-0.6043,0.6239,0.0139,-0.5537,0.5430,0.0139,-0.6346,0.6441,0.0139,0.0731,0.6441,-0.0670,-0.0078,0.6441,0.0947,-0.0078,0.6441,0.0139,-0.0887,0.0779,0.6103,-0.6043,-0.0029,0.5598,-0.6346,-0.0029,0.6407,-0.5537,-0.5489,0.0139,-0.6346,-0.5994,-0.0670,-0.6043,-0.5994,0.0947,-0.6043,-0.6297,0.0139,-0.5537,-0.0029,-0.0670,-0.6548,-0.0838,0.0139,-0.6548,-0.0029,0.0947,-0.6548,-0.5994,0.6103,-0.0887,-0.6297,0.5598,-0.0078,-0.5994,0.6103,0.0731,-0.5489,0.6407,-0.0078,-0.6500,-0.0670,-0.0078,-0.6500,0.0139,0.0731,-0.6500,0.0139,-0.0887,-0.0838,0.6609,-0.0078,-0.0029,0.6609,0.0731,-0.0029,0.6609,-0.0887,0.0779,0.6609,-0.0078,-0.0029,-0.6332,0.2349,-0.0838,-0.6332,0.3157,0.0779,-0.6332,0.3157,-0.2456,-0.6332,-0.0078,-0.3264,-0.6332,0.0731,-0.3264,-0.6332,-0.0887,-0.5994,-0.5826,0.3966,-0.5994,-0.5826,0.2349,-0.5489,-0.6129,0.3157,-0.6297,-0.5321,0.3157,-0.2456,-0.5826,0.5887,-0.3264,-0.6129,0.5381,-0.3264,-0.5321,0.6190,-0.2456,-0.6332,0.3157,-0.3264,-0.6332,0.2349,-0.4073,-0.6332,0.3157,-0.3264,-0.6332,0.3966,0.2397,-0.5826,0.5887,0.3206,-0.6129,0.5381,0.3206,-0.5321,0.6190,0.5935,-0.5826,0.3966,0.5935,-0.5826,0.2349,0.5430,-0.6129,0.3157,0.6239,-0.5321,0.3157,0.4015,-0.6332,-0.0078,0.3206,-0.6332,0.0731,0.3206,-0.6332,-0.0887,0.2397,-0.6332,0.3157,0.3206,-0.6332,0.3966,0.4015,-0.6332,0.3157,0.3206,-0.6332,0.2349,0.5935,-0.5826,-0.4122,0.5430,-0.6129,-0.3313,0.6239,-0.5321,-0.3313,0.4015,-0.5826,-0.6043,0.2397,-0.5826,-0.6043,0.3206,-0.6129,-0.5537,0.3206,-0.5321,-0.6346,-0.0029,-0.6332,-0.2504,-0.0838,-0.6332,-0.3313,0.3206,-0.6332,-0.2504,0.4015,-0.6332,-0.3313,0.3206,-0.6332,-0.4122,0.2397,-0.6332,-0.3313,-0.4073,-0.5826,-0.6043,-0.2456,-0.5826,-0.6043,-0.3264,-0.6129,-0.5537,-0.5994,-0.5826,-0.4122,-0.5994,-0.5826,-0.2504,-0.5489,-0.6129,-0.3313,-0.6297,-0.5321,-0.3313,-0.3264,-0.6332,-0.2504,-0.2456,-0.6332,-0.3313,-0.3264,-0.6332,-0.4122,-0.5994,-0.3905,0.5887,-0.5994,-0.2288,0.5887,-0.5489,-0.3096,0.6190,-0.6297,-0.3096,0.5381,-0.4073,0.0139,0.6392,-0.2456,0.0139,0.6392,-0.3264,-0.0670,0.6392,-0.0029,-0.3905,0.6392,-0.0029,-0.2288,0.6392,-0.0838,-0.3096,0.6392,0.0779,-0.3096,0.6392,-0.3264,-0.3905,0.6392,-0.4073,-0.3096,0.6392,-0.3264,-0.2288,0.6392,-0.5994,0.4183,0.5887,-0.5994,0.2565,0.5887,-0.5489,0.3374,0.6190,-0.6297,0.3374,0.5381,-0.4073,0.6103,0.5887,-0.2456,0.6103,0.5887,-0.3264,0.5598,0.6190,-0.3264,0.6407,0.5381,-0.0029,0.2565,0.6392,-0.0838,0.3374,0.6392,0.0779,0.3374,0.6392,-0.3264,0.2565,0.6392,-0.4073,0.3374,0.6392,-0.3264,0.4183,0.6392,-0.2456,0.3374,0.6392,0.2397,0.6103,0.5887,0.3206,0.5598,0.6190,0.3206,0.6407,0.5381,0.5935,0.4183,0.5887,0.5935,0.2565,0.5887,0.5430,0.3374,0.6190,0.6239,0.3374,0.5381,0.2397,0.0139,0.6392,0.3206,0.0947,0.6392,0.3206,-0.0670,0.6392,0.2397,0.3374,0.6392,0.3206,0.4183,0.6392,0.4015,0.3374,0.6392,0.3206,0.2565,0.6392,0.5935,-0.2288,0.5887,0.5430,-0.3096,0.6190,0.6239,-0.3096,0.5381,0.3206,-0.3905,0.6392,0.2397,-0.3096,0.6392,0.3206,-0.2288,0.6392,0.4015,-0.3096,0.6392,0.6441,0.0139,0.3966,0.6441,-0.0670,0.3157,0.6441,0.0947,0.3157,0.6441,-0.3905,-0.0078,0.6441,-0.2288,-0.0078,0.6441,-0.3096,0.0731,0.6441,-0.3096,-0.0887,0.6441,-0.3905,0.3157,0.6441,-0.2288,0.3157,0.6441,-0.3096,0.2349,0.5935,0.6103,0.3966,0.5935,0.6103,0.2349,0.6239,0.5598,0.3157,0.5430,0.6407,0.3157,0.6441,0.4183,-0.0078,0.6441,0.3374,0.0731,0.6441,0.3374,-0.0887,0.6441,0.3374,0.3966,0.6441,0.2565,0.3157,0.6441,0.4183,0.3157,0.6441,0.3374,0.2349,0.5935,0.6103,-0.4122,0.5935,0.6103,-0.2504,0.5430,0.6407,-0.3313,0.5935,0.4183,-0.6043,0.5935,0.2565,-0.6043,0.6239,0.3374,-0.5537,0.5430,0.3374,-0.6346,0.6441,0.0139,-0.4122,0.6441,0.0139,-0.2504,0.6441,-0.0670,-0.3313,0.6441,0.3374,-0.2504,0.6441,0.4183,-0.3313,0.6441,0.3374,-0.4122,0.6441,0.2565,-0.3313,0.5935,-0.3905,-0.6043,0.5935,-0.2288,-0.6043,0.5430,-0.3096,-0.6346,0.6441,-0.3905,-0.3313,0.6441,-0.3096,-0.2504,0.6441,-0.2288,-0.3313,0.6441,-0.3096,-0.4122,-0.0029,-0.3905,-0.6548,-0.0029,-0.2288,-0.6548,0.0779,-0.3096,-0.6548,-0.4073,0.0139,-0.6548,-0.2456,0.0139,-0.6548,-0.3264,-0.0670,-0.6548,-0.3264,0.0947,-0.6548,-0.5994,-0.3905,-0.6043,-0.5994,-0.2288,-0.6043,-0.5489,-0.3096,-0.6346,-0.3264,-0.3905,-0.6548,-0.2456,-0.3096,-0.6548,-0.3264,-0.2288,-0.6548,-0.4073,-0.3096,-0.6548,0.4015,0.0139,-0.6548,0.2397,0.0139,-0.6548,0.3206,-0.0670,-0.6548,0.3206,-0.3905,-0.6548,0.4015,-0.3096,-0.6548,0.2397,-0.3096,-0.6548,0.3206,-0.2288,-0.6548,0.4015,0.6103,-0.6043,0.2397,0.6103,-0.6043,0.3206,0.5598,-0.6346,-0.0029,0.4183,-0.6548,-0.0029,0.2565,-0.6548,0.0779,0.3374,-0.6548,-0.0838,0.3374,-0.6548,0.4015,0.3374,-0.6548,0.3206,0.2565,-0.6548,0.3206,0.4183,-0.6548,0.2397,0.3374,-0.6548,-0.2456,0.6103,-0.6043,-0.3264,0.5598,-0.6346,-0.3264,0.6407,-0.5537,-0.5994,0.4183,-0.6043,-0.5994,0.2565,-0.6043,-0.5489,0.3374,-0.6346,-0.6297,0.3374,-0.5537,-0.2456,0.3374,-0.6548,-0.3264,0.4183,-0.6548,-0.4073,0.3374,-0.6548,-0.6500,-0.3905,-0.0078,-0.6500,-0.2288,-0.0078,-0.6500,-0.3096,0.0731,-0.6500,-0.3096,-0.0887,-0.6500,0.0139,0.2349,-0.6500,-0.0670,0.3157,-0.6500,0.0947,0.3157,-0.6500,-0.3905,0.3157,-0.6500,-0.3096,0.3966,-0.6500,-0.3096,0.2349,-0.6500,-0.2288,0.3157,-0.6500,0.0139,-0.2504,-0.6500,-0.0670,-0.3313,-0.6500,0.0947,-0.3313,-0.6500,-0.3905,-0.3313,-0.6500,-0.3096,-0.4122,-0.6500,-0.3096,-0.2504,-0.6500,-0.2288,-0.3313,-0.5994,0.6103,-0.4122,-0.6297,0.5598,-0.3313,-0.5489,0.6407,-0.3313,-0.6500,0.4183,-0.0078,-0.6500,0.2565,-0.0078,-0.6500,0.3374,-0.0887,-0.6500,0.3374,0.0731,-0.6500,0.3374,-0.4122,-0.6500,0.4183,-0.3313,-0.6500,0.3374,-0.2504,-0.5994,0.6103,0.3966,-0.5994,0.6103,0.2349,-0.6297,0.5598,0.3157,-0.5489,0.6407,0.3157,-0.6500,0.3374,0.3966,-0.6500,0.3374,0.2349,-0.6500,0.4183,0.3157,-0.4073,0.6609,-0.0078,-0.2456,0.6609,-0.0078,-0.3264,0.6609,0.0731,-0.3264,0.6609,-0.0887,-0.0029,0.6609,0.3966,-0.0029,0.6609,0.2349,0.0779,0.6609,0.3157,-0.3264,0.6609,0.3966,-0.4073,0.6609,0.3157,-0.3264,0.6609,0.2349,-0.2456,0.6609,0.3157,-0.0029,0.6609,-0.4122,-0.0029,0.6609,-0.2504,0.0779,0.6609,-0.3313,-0.3264,0.6609,-0.4122,-0.4073,0.6609,-0.3313,-0.3264,0.6609,-0.2504,-0.2456,0.6609,-0.3313,0.4015,0.6609,-0.0078,0.2397,0.6609,-0.0078,0.3206,0.6609,0.0731,0.4015,0.6609,-0.3313,0.3206,0.6609,-0.4122,0.2397,0.6609,-0.3313,0.3206,0.6609,-0.2504,0.3206,0.6609,0.3966,0.4015,0.6609,0.3157,0.3206,0.6609,0.2349,-0.5469,-0.6084,0.4705,-0.6252,-0.5301,0.4705,-0.4812,-0.6084,0.5362,-0.4812,-0.5301,0.6145,-0.5469,-0.4644,0.6145,-0.6252,-0.4644,0.5362,0.4753,-0.6084,0.5362,0.5410,-0.6084,0.4705,0.6194,-0.5301,0.4705,0.5410,-0.4644,0.6145,0.6194,-0.4644,0.5362,0.5410,-0.6084,-0.4860,0.6194,-0.5301,-0.4860,0.4753,-0.6084,-0.5517,0.6194,-0.4644,-0.5517,0.5410,-0.4644,-0.6301,-0.4812,-0.6084,-0.5517,-0.4812,-0.5301,-0.6301,-0.5469,-0.6084,-0.4860,-0.6252,-0.5301,-0.4860,-0.5469,-0.4644,-0.6301,-0.5469,0.4921,0.6145,-0.6252,0.4921,0.5362,-0.4812,0.5578,0.6145,-0.4812,0.6362,0.5362,-0.6252,0.5578,0.4705,-0.5469,0.6362,0.4705,0.4753,0.5578,0.6145,0.4753,0.6362,0.5362,0.6194,0.4921,0.5362,0.6194,0.5578,0.4705,0.5410,0.6362,0.4705,0.6194,0.5578,-0.4860,0.5410,0.6362,-0.4860,0.6194,0.4921,-0.5517,0.5410,0.4921,-0.6301,0.4753,0.6362,-0.5517,-0.4812,0.5578,-0.6301,-0.4812,0.6362,-0.5517,-0.5469,0.4921,-0.6301,-0.6252,0.4921,-0.5517,-0.6252,0.5578,-0.4860,-0.5469,0.6362,-0.4860,0.0779,-0.6281,0.4724,-0.1647,-0.6129,0.5381,-0.1647,-0.5321,0.6190,0.1588,-0.6129,0.5381,0.1588,-0.5321,0.6190,-0.0838,-0.4664,0.6342,0.0779,-0.4664,0.6342,0.6239,-0.5321,0.1540,0.4773,-0.6281,0.0731,0.4773,-0.6281,-0.0887,0.5430,-0.6129,-0.1695,0.6239,-0.5321,-0.1695,0.6390,-0.4664,0.0731,0.6390,-0.4664,-0.0887,0.1588,-0.6129,-0.5537,0.0779,-0.6281,-0.4880,-0.0838,-0.6281,-0.4880,-0.1647,-0.6129,-0.5537,-0.1647,-0.5321,-0.6346,-0.0838,-0.4664,-0.6497,0.0779,-0.4664,-0.6497,-0.4831,-0.6281,0.0731,-0.5489,-0.6129,0.1540,-0.6297,-0.5321,0.1540,-0.5489,-0.6129,-0.1695,-0.6297,-0.5321,-0.1695,-0.6449,-0.4664,0.0731,-0.6449,-0.4664,-0.0887,-0.0838,-0.6332,0.1540,-0.1647,-0.6332,0.0731,-0.1647,-0.6332,-0.0887,0.1588,-0.6332,0.0731,0.1588,-0.6332,-0.0887,0.0779,-0.6332,-0.1695,-0.0838,-0.6332,-0.1695,-0.5489,-0.1479,0.6190,-0.4831,-0.0670,0.6342,-0.4831,0.0947,0.6342,-0.5489,0.1756,0.6190,-0.6297,0.1756,0.5381,-0.6449,-0.0670,0.4724,-0.6449,0.0947,0.4724,-0.1647,0.5598,0.6190,-0.1647,0.6407,0.5381,0.0779,0.4941,0.6342,0.1588,0.5598,0.6190,0.1588,0.6407,0.5381,-0.0838,0.6558,0.4724,0.0779,0.6558,0.4724,0.5430,0.1756,0.6190,0.6239,0.1756,0.5381,0.4773,-0.0670,0.6342,0.5430,-0.1479,0.6190,0.6239,-0.1479,0.5381,0.6390,-0.0670,0.4724,0.6390,0.0947,0.4724,-0.1647,-0.0670,0.6392,-0.1647,0.0947,0.6392,0.0779,-0.1479,0.6392,-0.0838,0.1756,0.6392,0.0779,0.1756,0.6392,0.1588,0.0947,0.6392,0.1588,-0.0670,0.6392,0.6239,0.5598,0.1540,0.5430,0.6407,0.1540,0.6390,0.4941,0.0731,0.6239,0.5598,-0.1695,0.5430,0.6407,-0.1695,0.4773,0.6558,-0.0887,0.4773,0.6558,0.0731,0.6239,0.1756,-0.5537,0.5430,0.1756,-0.6346,0.6390,0.0947,-0.4880,0.6239,-0.1479,-0.5537,0.5430,-0.1479,-0.6346,0.4773,-0.0670,-0.6497,0.4773,0.0947,-0.6497,0.6441,-0.0670,0.1540,0.6441,0.0947,0.1540,0.6441,-0.1479,0.0731,0.6441,0.1756,0.0731,0.6441,0.1756,-0.0887,0.6441,0.0947,-0.1695,0.6441,-0.0670,-0.1695,0.1588,0.5598,-0.6346,0.1588,0.6407,-0.5537,0.0779,0.4941,-0.6497,-0.1647,0.5598,-0.6346,-0.1647,0.6407,-0.5537,-0.0838,0.6558,-0.4880,0.0779,0.6558,-0.4880,-0.4831,-0.0670,-0.6497,-0.4831,0.0947,-0.6497,-0.5489,-0.1479,-0.6346,-0.6297,-0.1479,-0.5537,-0.6297,0.1756,-0.5537,-0.6449,-0.0670,-0.4880,-0.6449,0.0947,-0.4880,-0.0838,-0.1479,-0.6548,0.0779,-0.1479,-0.6548,-0.1647,-0.0670,-0.6548,-0.1647,0.0947,-0.6548,0.1588,0.0947,-0.6548,0.0779,0.1756,-0.6548,-0.0838,0.1756,-0.6548,-0.6297,0.5598,-0.1695,-0.5489,0.6407,-0.1695,-0.6449,0.4941,-0.0887,-0.6449,0.4941,0.0731,-0.5489,0.6407,0.1540,-0.4831,0.6558,0.0731,-0.4831,0.6558,-0.0887,-0.6500,-0.1479,0.0731,-0.6500,-0.1479,-0.0887,-0.6500,-0.0670,0.1540,-0.6500,0.0947,0.1540,-0.6500,-0.0670,-0.1695,-0.6500,0.1756,-0.0887,-0.6500,0.1756,0.0731,-0.1647,0.6609,0.0731,-0.1647,0.6609,-0.0887,-0.0838,0.6609,0.1540,0.0779,0.6609,0.1540,-0.0838,0.6609,-0.1695,0.1588,0.6609,-0.0887,0.1588,0.6609,0.0731,-0.1647,-0.6332,0.3966,-0.1647,-0.6332,0.2349,0.1588,-0.6332,0.3966,0.1588,-0.6332,0.2349,-0.2456,-0.6332,0.1540,-0.2456,-0.6332,-0.1695,-0.4073,-0.6332,-0.1695,-0.4831,-0.6281,0.2349,-0.4831,-0.6281,0.3966,-0.6449,-0.4664,0.3966,-0.6449,-0.4664,0.2349,-0.2456,-0.6281,0.4724,-0.2456,-0.4664,0.6342,-0.4073,-0.4664,0.6342,0.2397,-0.6281,0.4724,0.4015,-0.6281,0.4724,0.2397,-0.4664,0.6342,0.4015,-0.4664,0.6342,0.4773,-0.6281,0.3966,0.4773,-0.6281,0.2349,0.6390,-0.4664,0.2349,0.4015,-0.6332,0.1540,0.2397,-0.6332,0.1540,0.2397,-0.6332,-0.1695,0.4015,-0.6332,-0.1695,0.4773,-0.6281,-0.2504,0.4773,-0.6281,-0.4122,0.6390,-0.4664,-0.4122,0.4015,-0.6281,-0.4880,0.2397,-0.6281,-0.4880,0.2397,-0.4664,-0.6497,0.4015,-0.4664,-0.6497,0.1588,-0.6332,-0.2504,0.1588,-0.6332,-0.4122,-0.1647,-0.6332,-0.4122,-0.2456,-0.6281,-0.4880,-0.4073,-0.6281,-0.4880,-0.2456,-0.4664,-0.6497,-0.4073,-0.4664,-0.6497,-0.4831,-0.6281,-0.4122,-0.4831,-0.6281,-0.2504,-0.6449,-0.4664,-0.2504,-0.4831,-0.3905,0.6342,-0.4831,-0.2288,0.6342,-0.6449,-0.3905,0.4724,-0.6449,-0.2288,0.4724,-0.4073,-0.1479,0.6392,-0.2456,-0.1479,0.6392,-0.2456,0.1756,0.6392,-0.1647,-0.3905,0.6392,-0.1647,-0.2288,0.6392,0.1588,-0.3905,0.6392,0.1588,-0.2288,0.6392,-0.4831,0.2565,0.6342,-0.4831,0.4183,0.6342,-0.6449,0.2565,0.4724,-0.2456,0.4941,0.6342,-0.2456,0.6558,0.4724,-0.4073,0.6558,0.4724,-0.1647,0.2565,0.6392,-0.1647,0.4183,0.6392,0.1588,0.2565,0.6392,0.1588,0.4183,0.6392,0.2397,0.6558,0.4724,0.4015,0.6558,0.4724,0.4773,0.4183,0.6342,0.4773,0.2565,0.6342,0.6390,0.2565,0.4724,0.6390,0.4183,0.4724,0.2397,0.1756,0.6392,0.4015,0.1756,0.6392,0.4015,-0.1479,0.6392,0.4773,-0.2288,0.6342,0.4773,-0.3905,0.6342,0.6390,-0.3905,0.4724,0.6390,-0.2288,0.4724,0.6441,-0.1479,0.3966,0.6441,-0.1479,0.2349,0.6441,0.1756,0.2349,0.6441,-0.2288,0.1540,0.6441,-0.3905,0.1540,0.6441,-0.3905,-0.1695,0.6441,-0.2288,-0.1695,0.6390,0.4941,0.3966,0.6390,0.4941,0.2349,0.4773,0.6558,0.3966,0.6441,0.4183,0.1540,0.6441,0.2565,0.1540,0.6441,0.2565,-0.1695,0.6441,0.4183,-0.1695,0.6390,0.4941,-0.2504,0.6390,0.4941,-0.4122,0.4773,0.6558,-0.4122,0.6390,0.4183,-0.4880,0.6390,0.2565,-0.4880,0.4773,0.2565,-0.6497,0.4773,0.4183,-0.6497,0.6441,0.1756,-0.2504,0.6441,0.1756,-0.4122,0.6441,-0.1479,-0.2504,0.6390,-0.2288,-0.4880,0.6390,-0.3905,-0.4880,0.4773,-0.3905,-0.6497,0.4773,-0.2288,-0.6497,-0.1647,-0.3905,-0.6548,-0.1647,-0.2288,-0.6548,0.1588,-0.3905,-0.6548,-0.2456,-0.1479,-0.6548,-0.4073,-0.1479,-0.6548,-0.2456,0.1756,-0.6548,-0.4073,0.1756,-0.6548,-0.4831,-0.2288,-0.6497,-0.4831,-0.3905,-0.6497,-0.6449,-0.3905,-0.4880,0.4015,-0.1479,-0.6548,0.2397,-0.1479,-0.6548,0.2397,0.1756,-0.6548,0.4015,0.1756,-0.6548,0.4015,0.4941,-0.6497,0.2397,0.4941,-0.6497,0.2397,0.6558,-0.4880,0.4015,0.6558,-0.4880,0.1588,0.4183,-0.6548,-0.1647,0.2565,-0.6548,-0.1647,0.4183,-0.6548,-0.2456,0.4941,-0.6497,-0.4073,0.4941,-0.6497,-0.4073,0.6558,-0.4880,-0.2456,0.6558,-0.4880,-0.4831,0.2565,-0.6497,-0.6449,0.2565,-0.4880,-0.6449,0.4183,-0.4880,-0.6500,-0.3905,0.1540,-0.6500,-0.2288,0.1540,-0.6500,-0.3905,-0.1695,-0.6500,-0.2288,-0.1695,-0.6500,-0.1479,0.3966,-0.6500,0.1756,0.3966,-0.6500,0.1756,0.2349,-0.6500,-0.1479,-0.4122,-0.6500,-0.1479,-0.2504,-0.6500,0.1756,-0.2504,-0.6500,0.1756,-0.4122,-0.6449,0.4941,-0.4122,-0.4831,0.6558,-0.2504,-0.4831,0.6558,-0.4122,-0.6500,0.2565,-0.1695,-0.6500,0.4183,-0.1695,-0.6500,0.2565,0.1540,-0.6500,0.4183,0.1540,-0.6449,0.4941,0.2349,-0.4831,0.6558,0.3966,-0.4831,0.6558,0.2349,-0.4073,0.6609,0.1540,-0.2456,0.6609,0.1540,-0.2456,0.6609,-0.1695,-0.4073,0.6609,-0.1695,-0.1647,0.6609,0.3966,0.1588,0.6609,0.3966,0.1588,0.6609,0.2349,-0.1647,0.6609,-0.2504,-0.1647,0.6609,-0.4122,0.1588,0.6609,-0.2504,0.1588,0.6609,-0.4122,0.2397,0.6609,-0.1695,0.2397,0.6609,0.1540,0.4015,0.6609,0.1540,-0.0838,-0.6129,0.5381,-0.0838,-0.6332,0.3966,-0.2456,-0.6332,0.3966,-0.2456,-0.6129,0.5381,-0.0838,-0.6332,0.2349,-0.0838,-0.6332,0.0731,-0.2456,-0.6332,0.2349,-0.4073,-0.6332,0.2349,-0.4073,-0.6332,0.0731,-0.5489,-0.6129,0.0731,-0.5489,-0.6129,0.2349,-0.4073,-0.6129,0.5381,-0.5489,-0.6129,0.3966,0.0779,-0.6129,0.5381,0.2397,-0.6129,0.5381,0.2397,-0.6332,0.3966,0.0779,-0.6332,0.3966,0.4015,-0.6129,0.5381,0.5351,-0.5950,0.5303,0.5430,-0.6129,0.3966,0.5430,-0.6129,0.2349,0.5430,-0.6129,0.0731,0.4015,-0.6332,0.0731,0.0779,-0.6332,0.2349,0.2397,-0.6332,0.2349,0.2397,-0.6332,0.0731,0.0779,-0.6332,0.0731,0.2397,-0.6332,-0.0887,0.2397,-0.6332,-0.2504,0.0779,-0.6332,-0.2504,0.4015,-0.6332,-0.0887,0.5430,-0.6129,-0.0887,0.5430,-0.6129,-0.2504,0.4015,-0.6332,-0.2504,0.5430,-0.6129,-0.4122,0.4015,-0.6129,-0.5537,0.0779,-0.6332,-0.4122,0.2397,-0.6332,-0.4122,0.2397,-0.6129,-0.5537,0.0779,-0.6129,-0.5537,-0.0838,-0.6332,-0.0887,-0.0838,-0.6332,-0.2504,-0.2456,-0.6332,-0.0887,-0.0838,-0.6332,-0.4122,-0.0838,-0.6129,-0.5537,-0.2456,-0.6129,-0.5537,-0.2456,-0.6332,-0.4122,-0.4073,-0.6129,-0.5537,-0.5410,-0.5950,-0.5458,-0.4073,-0.6332,-0.0887,-0.4073,-0.6332,-0.2504,-0.5489,-0.6129,-0.2504,-0.5489,-0.6129,-0.0887,-0.0838,-0.5321,0.6190,-0.2456,-0.5321,0.6190,-0.2456,-0.3905,0.6392,-0.0838,-0.3905,0.6392,-0.5410,-0.5242,0.6011,-0.5489,-0.3905,0.6190,-0.4073,-0.2288,0.6392,-0.5489,-0.2288,0.6190,-0.5489,-0.0670,0.6190,-0.4073,-0.0670,0.6392,-0.0838,-0.2288,0.6392,-0.2456,-0.0670,0.6392,-0.0838,-0.0670,0.6392,-0.0838,0.0947,0.6392,-0.2456,0.0947,0.6392,-0.2456,0.2565,0.6392,-0.0838,0.2565,0.6392,-0.4073,0.0947,0.6392,-0.5489,0.2565,0.6190,-0.4073,0.2565,0.6392,-0.5489,0.4183,0.6190,-0.5410,0.5519,0.6011,-0.4073,0.5598,0.6190,-0.0838,0.4183,0.6392,-0.2456,0.4183,0.6392,-0.0838,0.5598,0.6190,0.0779,0.0947,0.6392,0.0779,0.2565,0.6392,0.2397,0.2565,0.6392,0.2397,0.0947,0.6392,0.0779,0.4183,0.6392,0.0779,0.5598,0.6190,0.2397,0.5598,0.6190,0.4015,0.5598,0.6190,0.5351,0.5519,0.6011,0.5430,0.4183,0.6190,0.4015,0.0947,0.6392,0.4015,0.2565,0.6392,0.5430,0.2565,0.6190,0.5430,0.0947,0.6190,0.0779,-0.3905,0.6392,0.2397,-0.3905,0.6392,0.2397,-0.5321,0.6190,0.0779,-0.2288,0.6392,0.0779,-0.0670,0.6392,0.2397,-0.0670,0.6392,0.2397,-0.2288,0.6392,0.4015,-0.0670,0.6392,0.5430,-0.0670,0.6190,0.5430,-0.2288,0.6190,0.4015,-0.5321,0.6190,0.5430,-0.3905,0.6190,0.5351,-0.5242,0.6011,0.6059,-0.5242,0.5303,0.6239,-0.3905,0.5381,0.6239,-0.2288,0.5381,0.6239,-0.0670,0.5381,0.6441,-0.0670,0.3966,0.6441,-0.2288,0.3966,0.6441,-0.2288,0.2349,0.6441,-0.0670,0.2349,0.6441,-0.0670,0.0731,0.6239,-0.5321,0.2349,0.6441,-0.3905,0.2349,0.6441,-0.3905,0.0731,0.6239,-0.5321,0.0731,0.6239,0.0947,0.5381,0.6239,0.2565,0.5381,0.6441,0.2565,0.3966,0.6239,0.4183,0.5381,0.6059,0.5519,0.5303,0.6239,0.5598,0.3966,0.6441,0.4183,0.2349,0.6239,0.5598,0.2349,0.6239,0.5598,0.0731,0.6441,0.4183,0.0731,0.6441,0.2565,0.2349,0.6441,0.2565,0.0731,0.6441,0.0947,0.0731,0.6441,0.0947,-0.0887,0.6441,0.2565,-0.0887,0.6441,0.2565,-0.2504,0.6441,0.0947,-0.2504,0.6441,0.4183,-0.0887,0.6239,0.5598,-0.2504,0.6441,0.4183,-0.2504,0.6239,0.5598,-0.4122,0.6059,0.5519,-0.5458,0.6239,0.4183,-0.5537,0.6441,0.0947,-0.4122,0.6441,0.2565,-0.4122,0.6239,0.0947,-0.5537,0.6239,-0.5321,-0.0887,0.6441,-0.3905,-0.0887,0.6441,-0.3905,-0.2504,0.6239,-0.5321,-0.2504,0.6441,-0.2288,-0.0887,0.6441,-0.0670,-0.0887,0.6441,-0.2288,-0.2504,0.6441,-0.2288,-0.4122,0.6441,-0.0670,-0.4122,0.6239,-0.0670,-0.5537,0.6239,-0.2288,-0.5537,0.6239,-0.5321,-0.4122,0.6239,-0.3905,-0.5537,0.6059,-0.5242,-0.5458,-0.0838,-0.3905,-0.6548,-0.2456,-0.3905,-0.6548,-0.2456,-0.5321,-0.6346,-0.0838,-0.2288,-0.6548,-0.0838,-0.0670,-0.6548,-0.2456,-0.0670,-0.6548,-0.2456,-0.2288,-0.6548,-0.4073,-0.0670,-0.6548,-0.5489,-0.0670,-0.6346,-0.5489,-0.2288,-0.6346,-0.4073,-0.5321,-0.6346,-0.5489,-0.3905,-0.6346,-0.5410,-0.5242,-0.6166,0.0779,-0.5321,-0.6346,0.2397,-0.3905,-0.6548,0.0779,-0.3905,-0.6548,0.4015,-0.5321,-0.6346,0.5351,-0.5242,-0.6166,0.5430,-0.3905,-0.6346,0.4015,-0.2288,-0.6548,0.5430,-0.2288,-0.6346,0.4015,-0.0670,-0.6548,0.0779,-0.2288,-0.6548,0.2397,-0.2288,-0.6548,0.2397,-0.0670,-0.6548,0.0779,-0.0670,-0.6548,0.0779,0.0947,-0.6548,0.2397,0.0947,-0.6548,0.2397,0.2565,-0.6548,0.4015,0.0947,-0.6548,0.5430,0.0947,-0.6346,0.5430,0.2565,-0.6346,0.4015,0.2565,-0.6548,0.5430,0.4183,-0.6346,0.5351,0.5519,-0.6166,0.4015,0.5598,-0.6346,0.2397,0.4183,-0.6548,0.2397,0.5598,-0.6346,0.0779,0.5598,-0.6346,-0.0838,0.0947,-0.6548,-0.0838,0.2565,-0.6548,-0.2456,0.2565,-0.6548,-0.2456,0.0947,-0.6548,-0.0838,0.5598,-0.6346,-0.2456,0.5598,-0.6346,-0.2456,0.4183,-0.6548,-0.4073,0.5598,-0.6346,-0.5410,0.5519,-0.6166,-0.5489,0.4183,-0.6346,-0.4073,0.0947,-0.6548,-0.4073,0.2565,-0.6548,-0.5489,0.0947,-0.6346,-0.6118,-0.5242,0.5303,-0.6297,-0.5321,0.3966,-0.6297,-0.3905,0.5381,-0.6297,-0.5321,0.2349,-0.6297,-0.5321,0.0731,-0.6500,-0.3905,0.0731,-0.6500,-0.2288,0.2349,-0.6500,-0.2288,0.0731,-0.6500,-0.0670,0.0731,-0.6500,-0.0670,0.2349,-0.6297,-0.2288,0.5381,-0.6500,-0.2288,0.3966,-0.6500,-0.0670,0.3966,-0.6297,-0.5321,-0.0887,-0.6297,-0.5321,-0.2504,-0.6500,-0.3905,-0.2504,-0.6500,-0.3905,-0.0887,-0.6297,-0.5321,-0.4122,-0.6118,-0.5242,-0.5458,-0.6297,-0.3905,-0.5537,-0.6297,-0.2288,-0.5537,-0.6297,-0.0670,-0.5537,-0.6500,-0.0670,-0.4122,-0.6500,-0.2288,-0.0887,-0.6500,-0.2288,-0.2504,-0.6500,-0.0670,-0.2504,-0.6500,-0.0670,-0.0887,-0.6500,0.0947,-0.0887,-0.6500,0.2565,-0.2504,-0.6500,0.2565,-0.0887,-0.6500,0.0947,-0.4122,-0.6297,0.0947,-0.5537,-0.6297,0.2565,-0.5537,-0.6500,0.2565,-0.4122,-0.6297,0.4183,-0.5537,-0.6297,0.5598,-0.4122,-0.6500,0.4183,-0.0887,-0.6500,0.4183,-0.2504,-0.6297,0.5598,-0.2504,-0.6297,0.5598,-0.0887,-0.6297,0.0947,0.5381,-0.6500,0.0947,0.3966,-0.6297,0.2565,0.5381,-0.6500,0.0947,0.2349,-0.6500,0.0947,0.0731,-0.6500,0.2565,0.0731,-0.6500,0.2565,0.2349,-0.6500,0.4183,0.2349,-0.6500,0.4183,0.0731,-0.6297,0.5598,0.2349,-0.6297,0.4183,0.5381,-0.6297,0.5598,0.3966,-0.6118,0.5519,0.5303,-0.0838,0.6407,0.5381,-0.2456,0.6407,0.5381,-0.2456,0.6609,0.3966,-0.0838,0.6609,0.3966,-0.5410,0.6227,0.5303,-0.5489,0.6407,0.3966,-0.4073,0.6609,0.3966,-0.4073,0.6609,0.2349,-0.5489,0.6407,0.2349,-0.5489,0.6407,0.0731,-0.4073,0.6609,0.0731,-0.2456,0.6609,0.2349,-0.2456,0.6609,0.0731,-0.0838,0.6609,0.0731,-0.0838,0.6609,-0.0887,-0.2456,0.6609,-0.0887,-0.2456,0.6609,-0.2504,-0.0838,0.6609,-0.2504,-0.5489,0.6407,-0.0887,-0.5489,0.6407,-0.2504,-0.4073,0.6609,-0.2504,-0.4073,0.6609,-0.4122,-0.5489,0.6407,-0.4122,-0.5410,0.6227,-0.5458,-0.4073,0.6407,-0.5537,-0.0838,0.6609,-0.4122,-0.2456,0.6407,-0.5537,-0.0838,0.6407,-0.5537,0.0779,0.6609,-0.0887,0.0779,0.6609,-0.2504,0.2397,0.6609,-0.2504,0.2397,0.6609,-0.0887,0.0779,0.6609,-0.4122,0.2397,0.6407,-0.5537,0.2397,0.6609,-0.4122,0.4015,0.6609,-0.4122,0.4015,0.6407,-0.5537,0.5351,0.6227,-0.5458,0.5430,0.6407,-0.4122,0.4015,0.6609,-0.0887,0.5430,0.6407,-0.2504,0.5430,0.6407,-0.0887,0.0779,0.6407,0.5381,0.0779,0.6609,0.3966,0.2397,0.6609,0.3966,0.2397,0.6407,0.5381,0.0779,0.6609,0.2349,0.2397,0.6609,0.0731,0.2397,0.6609,0.2349,0.4015,0.6609,0.2349,0.4015,0.6609,0.0731,0.5430,0.6407,0.0731,0.5430,0.6407,0.2349,0.4015,0.6407,0.5381,0.4015,0.6609,0.3966,0.5351,0.6227,0.5303,-0.4073,0.4941,0.6342,0.4015,0.4941,0.6342,-0.0029,0.0139,-0.6548,0.4015,-0.3905,-0.6548,-0.4073,0.4183,-0.6548,0.3993,-0.4569,0.5702,0.4677,-0.4568,0.5659,0.3993,-0.3096,0.5746,0.4678,-0.3096,0.5702,0.3206,-0.3884,0.5746,0.3206,-0.3096,0.5745,0.3206,-0.4569,0.5702,-0.0029,-0.0670,0.5745,0.0779,-0.0670,0.5745,0.3993,0.3374,0.5746,0.4678,0.4161,0.5702,0.4678,0.3374,0.5702,0.3993,0.4846,0.5702,0.4677,0.4845,0.5659,0.3206,0.4161,0.5746,0.3206,0.4846,0.5702,-0.0029,0.0947,0.5745,0.0779,0.0947,0.5745,-0.3264,0.4161,0.5746,-0.4052,0.4846,0.5702,-0.3264,0.4846,0.5702,-0.4737,0.4161,0.5702,-0.4736,0.4845,0.5659,-0.4737,0.3374,0.5702,-0.3264,0.3374,0.5745,-0.0838,0.0139,0.5745,-0.0838,0.0947,0.5745,-0.0838,-0.0670,0.5745,-0.3264,-0.3884,0.5746,-0.4052,-0.3096,0.5746,-0.4737,-0.3884,0.5702,-0.4737,-0.3096,0.5702,-0.4052,-0.4569,0.5702,-0.4736,-0.4568,0.5659,-0.3264,-0.4569,0.5702,-0.6500,-0.3905,0.3966,-0.6500,0.4183,-0.4122,0.5879,-0.3888,-0.4804,0.5834,-0.4587,-0.4804,0.5924,-0.3096,-0.4104,0.5878,-0.3096,-0.4804,0.5924,-0.3888,-0.3313,0.5923,-0.3096,-0.3313,0.5878,-0.4588,-0.3313,0.5924,0.3374,-0.4104,0.5878,0.3374,-0.4804,0.5879,0.4865,-0.4105,0.5834,0.4865,-0.4804,0.5924,0.4165,-0.3313,0.5878,0.4865,-0.3313,0.5923,0.3374,-0.3313,0.5924,0.3374,0.3949,0.5923,0.3374,0.3157,0.5879,0.4865,0.3949,0.5878,0.4865,0.3157,0.5879,0.4165,0.4649,0.5834,0.4864,0.4648,0.5878,0.3374,0.4649,0.5879,-0.4588,0.3949,0.5878,-0.4588,0.3157,0.5924,-0.3096,0.3949,0.5923,-0.3096,0.3157,0.5879,-0.3888,0.4649,0.5878,-0.3096,0.4649,0.5834,-0.4587,0.4648,-0.0029,-0.6332,-0.0078,-0.0029,0.5832,0.0731,0.0779,0.5832,0.0731,-0.0029,0.5832,-0.0887,0.0779,0.5832,-0.0887,-0.0838,0.5832,-0.0078,-0.0838,0.5832,-0.0887,-0.0838,0.5832,0.0731,-0.4056,-0.5814,-0.3313,-0.4756,-0.5769,-0.3313,-0.4056,-0.5769,-0.4804,-0.4755,-0.5724,-0.4804,-0.3264,-0.5814,-0.4104,-0.3264,-0.5769,-0.4804,-0.3264,-0.5814,-0.3313,-0.0029,-0.5769,-0.4804,-0.0838,-0.5814,-0.4104,-0.0029,-0.5814,-0.3313,-0.0838,-0.5814,-0.3313,0.0779,-0.5814,-0.4104,0.0779,-0.5769,-0.4804,0.0779,-0.5814,-0.3313,0.3206,-0.5814,-0.4104,0.3206,-0.5769,-0.4804,0.4697,-0.5769,-0.4105,0.4697,-0.5724,-0.4804,0.3997,-0.5814,-0.3313,0.4697,-0.5769,-0.3313,0.3206,-0.5814,-0.3313,0.3206,-0.5814,0.3949,0.3997,-0.5814,0.3157,0.4697,-0.5769,0.3949,0.4697,-0.5769,0.3157,0.3998,-0.5769,0.4649,0.4696,-0.5724,0.4648,0.3206,-0.5769,0.4649,0.0779,-0.5814,0.3949,0.0779,-0.5814,0.3157,-0.0029,-0.5769,0.4649,0.0779,-0.5769,0.4649,-0.4056,-0.5769,0.4649,-0.4756,-0.5769,0.3949,-0.4755,-0.5724,0.4648,-0.4056,-0.5814,0.3157,-0.4756,-0.5769,0.3157,-0.3264,-0.5814,0.3157,-0.3264,-0.5769,0.4649,-0.0838,-0.5814,0.3157,-0.0838,-0.5814,0.3949,-0.0838,-0.5769,0.4649,-0.5809,0.4161,0.4630,-0.5809,0.4846,0.3945,-0.5766,0.4845,0.4629,-0.5809,0.4846,0.3157,-0.5853,0.3374,0.3945,-0.5853,0.3374,0.3157,-0.5809,0.3374,0.4630,-0.5853,0.0139,0.0731,-0.5853,0.0947,-0.0078,-0.5853,0.0947,0.0731,-0.5853,0.0947,-0.0887,-0.5853,-0.0670,-0.0078,-0.5853,-0.0670,-0.0887,-0.5853,-0.3884,-0.3313,-0.5853,-0.3096,-0.4100,-0.5853,-0.3096,-0.3313,-0.5809,-0.3884,-0.4785,-0.5809,-0.4569,-0.4100,-0.5766,-0.4568,-0.4785,-0.5809,-0.4569,-0.3313,-0.5853,-0.0670,0.0731,0.3206,0.4170,-0.6160,0.4002,0.4884,-0.6114,0.3206,0.4884,-0.6113,0.4716,0.4884,-0.6067,0.4002,0.3374,-0.6160,0.4716,0.3374,-0.6113,0.3206,0.3374,-0.6160,-0.4060,-0.4607,-0.6114,-0.4775,-0.3892,-0.6114,-0.4774,-0.4606,-0.6067,-0.4060,-0.3096,-0.6160,-0.3264,-0.3892,-0.6160,-0.3264,-0.3096,-0.6160,-0.3264,-0.4607,-0.6113,0.3993,-0.3884,0.5746,-0.0029,0.0139,0.5745,0.3993,0.4161,0.5746,-0.4052,0.4161,0.5746,0.5924,-0.3888,-0.4104,0.5924,0.4165,-0.4104,0.5924,0.4165,0.3949,0.5924,-0.3888,0.3949,-0.0029,0.5832,-0.0078,-0.4056,-0.5815,-0.4104,-0.0029,-0.5814,-0.4104,0.3997,-0.5815,0.3949,-0.0029,-0.5814,0.3949,-0.4056,-0.5815,0.3949,-0.5853,0.4161,0.3945,-0.5853,0.0139,-0.0078,-0.5853,-0.3884,-0.4100,0.4002,0.4170,-0.6160],
    [0.6566,0.2503,0.1069,0.7098,0.2516,0.0706,-0.3087,0.2542,-0.2984,-0.3316,0.2629,-0.3830,-0.1777,0.2560,-0.2319,-0.2078,0.2606,-0.2369,-0.0683,0.2582,-0.2766,-0.1478,0.2606,-0.2369,-0.0341,0.2560,-0.3238,-0.0462,0.2542,-0.2930,-0.0688,0.2606,-0.4884,-0.1756,0.2542,-0.5352,-0.1478,0.2606,-0.5291,-0.2642,0.2542,-0.5095,-0.2368,0.2606,-0.5205,-0.3055,0.2629,-0.4655,-0.3421,0.2525,-0.3830,-0.2967,0.2522,-0.2681,-0.2712,0.2522,-0.2481,-0.0861,0.2531,-0.2430,-0.1085,0.2522,-0.2132,-0.0181,0.2524,-0.2983,-0.1679,0.2525,-0.5427,-0.2944,0.2522,-0.4980,-0.3292,0.2525,-0.4437,-0.3667,0.2418,-0.3822,-0.3189,0.2364,-0.2496,-0.2866,0.2418,-0.2323,-0.2321,0.2363,-0.1972,-0.1089,0.2472,-0.1902,-0.0486,0.2446,-0.1793,-0.3124,0.2417,-0.5098,-0.1991,0.2385,-0.5916,-0.3532,0.2418,-0.4506,0.7253,0.2502,-0.4983,0.7160,0.2509,-0.5678,0.6451,0.2519,-0.5525,-0.0595,0.2525,-0.4935,-0.0267,0.2523,-0.4742,0.6600,0.2525,-0.2533,0.7261,0.2503,-0.1438,0.7265,0.2503,-0.3727,0.0143,0.2524,-0.2535,0.0498,0.2523,-0.3171,0.7245,0.2503,0.0398,0.7125,0.2516,0.0565,-0.1881,0.2151,-0.6360,-0.0006,0.2626,0.0475,0.0157,0.2444,0.0044,-0.0044,0.2402,0.0472,0.0066,0.2365,-0.1299,-0.5811,0.2311,-0.6035,-0.5918,0.2209,-0.6221,-0.5987,0.2273,-0.5946,-0.5668,0.2312,-0.4202,-0.6036,0.2215,-0.4994,-0.5853,0.2506,-0.0261,-0.5747,0.2595,-0.0297,-0.3995,0.2700,-0.0368,-0.4336,0.2731,-0.0192,-0.3991,0.2724,0.0102,-0.3751,0.2703,0.0372,-0.5907,0.2245,0.0360,-0.5692,0.2621,0.0155,-0.4521,0.2689,0.0258,-0.4592,0.2593,0.0395,-0.4244,0.2590,0.0551,-0.3828,0.2679,0.0470,-0.5515,0.2458,0.0824,-0.4304,0.2546,0.0729,-0.3675,0.2536,0.1086,0.6795,0.2525,-0.0720,0.0117,0.2366,-0.1147,0.0212,0.2425,-0.0832,-0.0385,0.2315,0.0489,-0.0494,0.2313,0.0269,0.2390,0.2525,-0.1369,0.4942,0.2525,-0.1793,0.2610,0.2523,-0.2519,0.2587,0.2521,-0.3276,0.2449,0.2525,-0.0987,0.4431,0.2614,-0.0077,-0.0133,0.2500,0.1088,-0.0143,0.2369,0.0855,-0.0686,0.2313,0.0983,-0.1199,0.2313,0.1102,-0.5271,0.2401,0.1331,-0.5327,0.2401,0.1271,-0.4140,0.2452,0.1557,-0.3902,0.2343,0.1683,-0.2257,0.2690,-0.2921,-0.1778,0.2690,-0.3830,-0.0901,0.2690,-0.3183,-0.1219,0.2690,-0.3830,-0.1299,0.2690,-0.4739,-0.1498,0.2690,-0.4098,-0.2257,0.2690,-0.4739,-0.3189,0.2647,-0.3265,-0.2831,0.2674,-0.2814,-0.2076,0.2647,-0.2381,-0.1481,0.2647,-0.2381,-0.0726,0.2674,-0.2814,-0.0294,0.2662,-0.3545,-0.0294,0.2662,-0.4115,-0.0405,0.2674,-0.4379,-0.1497,0.2682,-0.5200,-0.2860,0.2647,-0.4876,-0.2068,0.2674,-0.5240,-0.3014,0.2674,-0.4628,-0.4291,0.2725,0.0319,-0.3610,0.2680,0.0440,-0.3046,0.2490,-0.2608,-0.2446,0.2513,-0.2268,-0.1411,0.2505,-0.1983,-0.1861,0.2487,-0.5746,-0.2349,0.2512,-0.5402,-0.3216,0.2513,-0.4765,-0.2788,0.2322,-0.1994,-0.1253,0.2345,-0.1779,-0.0916,0.2332,-0.1731,-0.3253,0.2317,-0.5415,-0.3713,0.2317,-0.4866,-0.3775,0.2332,-0.4177,-0.0944,0.2510,-0.5973,0.0291,0.2496,-0.1042,0.0454,0.2519,-0.0716,0.0112,0.2491,-0.1523,-0.2407,0.2243,-0.6314,-0.0003,0.2323,-0.1269,0.0126,0.2347,-0.0803,-0.0249,0.2317,-0.1494,-0.0178,0.2334,0.0856,-0.0101,0.2324,0.0341,-0.0237,0.2323,0.1489,-0.0151,0.2344,0.1398,-0.3564,0.2558,0.0656,-0.3526,0.2643,0.0479,-0.3499,0.2524,0.1091,-0.3582,0.2532,0.1292,-0.3678,0.2536,0.1194,-0.3671,0.2317,-0.2648,-0.5960,0.2281,-0.1810,-0.0060,0.2316,-0.0734,0.0015,0.2314,-0.0970,-0.0925,0.2313,-0.1567,-0.1083,0.2316,-0.1422,-0.1005,0.2511,-0.0418,-0.0907,0.2511,-0.0624,-0.0666,0.2312,0.0046,-0.0509,0.2316,-0.0095,-0.1775,0.2312,-0.0134,-0.2045,0.2312,-0.0386,-0.0401,0.2313,-0.1410,-0.1650,0.2313,-0.1030,-0.1687,0.2313,-0.0857,-0.1158,0.2312,0.0165,-0.2228,0.2312,0.0681,-0.2249,0.2313,0.0891,-0.1467,0.2313,0.1105,-0.2038,0.2313,0.1409,-0.0424,0.2511,-0.0405,-0.0407,0.2511,-0.0758,-0.0374,0.2511,-0.1045,-0.0650,0.2511,-0.1002,-0.1128,0.2511,-0.0967,-0.0136,0.2391,-0.0758,-0.0182,0.2457,-0.0643,-0.0241,0.2362,-0.0401,-0.0339,0.2484,-0.1154,-0.0776,0.2391,-0.1382,-0.0651,0.2457,-0.1338,-0.1238,0.2425,-0.1173,-0.0902,0.2457,-0.1339,-0.1379,0.2391,-0.0975,-0.1337,0.2362,-0.1091,-0.1211,0.2457,-0.0333,-0.0780,0.2362,-0.0121,-0.0897,0.2457,-0.0174,-0.0537,0.2392,-0.0179,-0.0661,0.2457,-0.0172,-0.0388,0.2508,-0.0367,-0.0327,0.2511,-0.1044,-0.0777,0.2511,-0.1261,-0.1170,0.2511,-0.1113,-0.1301,0.2508,-0.0950,-0.1312,0.2500,-0.0531,-0.1000,0.2500,-0.0236,-0.0565,0.2508,-0.0254,-0.4253,0.2313,-0.2877,-0.4656,0.2357,-0.1540,-0.3424,0.2312,-0.5994,-0.4278,0.2311,-0.5415,-0.3997,0.2181,-0.6368,-0.4035,0.2375,-0.1131,-0.3183,0.2338,-0.0837,-0.2505,0.2312,-0.0454,-0.2938,0.2336,0.0377,-0.2936,0.2331,0.0557,-0.2464,0.2312,0.0431,-0.2745,0.2316,0.1118,-0.2751,0.2316,0.1321,-0.5951,0.2314,-0.0925,-0.5765,0.2457,-0.0846,-0.4329,0.2598,-0.0802,-0.3387,0.2519,0.0161,-0.3515,0.2522,-0.0266,-0.3337,0.2465,0.0550,-0.3331,0.2415,0.0884,-0.3240,0.2375,0.1319,-0.0202,0.2321,-0.0369,-0.0127,0.2342,-0.0632,-0.0795,0.2321,-0.0075,-0.1049,0.2329,-0.0145,-0.1414,0.2328,-0.0487,-0.1283,0.2328,-0.1209,-0.0909,0.2328,-0.1403,-0.0136,0.2328,-0.0996,-0.0505,0.2341,-0.1346,0.2399,0.1726,-0.6421,-0.1079,0.1395,-0.6424,0.7380,0.1974,-0.5959,0.7470,0.1680,-0.4967,0.7478,0.1972,-0.2908,0.7492,0.1370,-0.3307,0.6915,0.2199,0.1171,0.7383,0.1048,0.1010,0.7294,0.2219,-0.6139,0.6821,0.1379,-0.6345,-0.4656,0.1943,-0.6418,-0.4288,0.1647,-0.6424,-0.2548,0.2142,0.1919,-0.3144,0.2064,0.1946,-0.6056,0.2116,-0.2443,-0.6093,0.1681,-0.1886,-0.6093,0.1361,-0.5768,-0.6102,0.1523,-0.4992,-0.6110,0.1348,-0.4773,-0.6107,0.1520,-0.4516,-0.5943,0.1365,-0.6272,-0.5935,0.1694,-0.6270,-0.6086,0.1684,-0.0809,-0.6052,0.1994,-0.0368,-0.6024,0.1988,0.0031,-0.6014,0.1704,0.0400,-0.5906,0.2006,0.0650,-0.5783,0.2141,0.0880,-0.4321,0.1960,0.1891,0.7477,0.1977,-0.0042,0.7505,0.1384,-0.0322,0.7486,0.1978,-0.1045,0.4992,0.0991,0.2011,-0.2338,0.1932,-0.6401,-0.2934,0.1372,-0.6424,-0.0078,0.2164,0.1958,-0.0265,0.2145,0.1957,-0.4777,0.1000,-0.6424,-0.1577,0.2209,0.1872,-0.2081,0.2064,0.1990,-0.3407,0.2140,0.1881,-0.0435,0.2517,-0.5575,0.0417,0.2514,-0.5418,-0.1367,0.2525,-0.5386,0.1992,0.2523,-0.2875,0.1375,0.2521,-0.3514,0.0896,0.2523,-0.0996,0.5493,0.2508,-0.6156,0.3314,0.2506,-0.5651,0.3496,0.2401,-0.6359,0.0426,0.2467,-0.6310,-0.4967,0.2537,0.1260,-0.4754,0.2537,0.1238,-0.4916,0.2572,0.0343,-0.5266,0.2656,0.0202,-0.5490,0.2690,0.0148,-0.5384,0.2706,-0.0174,-0.5427,0.2681,-0.0563,-0.5460,0.2583,-0.0855,-0.0134,0.2493,0.1197,-0.0728,0.2313,0.1306,-0.0159,0.2319,0.1654,-0.2055,0.2313,0.1579,-0.1556,0.2308,0.1655,-0.2543,0.2292,0.1726,-0.3465,0.2412,0.1572,-0.5094,0.2520,0.1267,-0.4600,0.2536,0.1403,-0.5602,0.2561,0.0401,-0.5441,0.2533,0.0699,-0.5597,0.2660,0.0189,0.3132,-0.2780,-0.1098,0.4027,-0.2779,-0.2230,0.5033,-0.2774,-0.0390,0.5119,-0.2774,-0.0734,0.1721,-0.2774,-0.5836,0.0029,-0.2777,-0.4411,0.5938,-0.2288,-0.2632,0.5775,-0.2466,-0.1081,0.5303,-0.2288,0.0636,0.4993,-0.2099,0.1529,-0.1124,-0.2095,-0.0259,-0.1201,-0.2292,-0.0820,-0.1438,-0.1935,-0.2674,-0.1042,-0.2105,-0.4369,-0.1399,-0.2466,-0.2662,-0.0072,-0.2097,-0.5438,0.2274,-0.1896,-0.6143,0.3708,-0.2092,-0.5920,0.2271,-0.2466,-0.6137,0.5245,-0.2092,-0.4795,0.6327,-0.1249,-0.2698,0.6814,-0.1118,-0.2373,0.6064,-0.1324,-0.1479,0.4555,-0.1325,-0.5773,0.6901,-0.1024,-0.4938,0.5593,-0.1323,0.0980,0.6054,-0.1178,0.1477,0.7337,-0.0708,-0.2062,0.7337,-0.0708,-0.1307,0.7380,-0.0242,-0.5688,0.7126,-0.0887,-0.4953,0.7419,-0.0235,0.0745,0.7504,0.0365,-0.2881,0.7521,0.1042,-0.1750,0.7362,0.0041,-0.5961,0.7497,0.0374,0.0385,0.7376,0.0374,0.1122,0.7139,-0.0490,0.1436,0.6559,-0.0862,0.1746,0.4978,-0.0244,0.2187,0.5320,-0.0926,-0.6383,0.2411,-0.0673,-0.6422,0.5502,-0.0472,-0.6408,0.4567,0.0682,-0.6420,-0.1958,-0.0968,-0.6412,-0.2533,-0.0218,-0.6424,-0.5587,-0.1334,-0.6380,-0.5780,-0.2008,-0.6257,-0.5990,-0.1217,-0.6213,-0.6070,-0.0129,-0.6142,0.6199,-0.1088,0.1756,0.4351,-0.1254,-0.5992,0.2360,-0.1168,-0.6318,-0.1140,-0.1217,-0.6257,0.1313,-0.1193,-0.6306,-0.3803,-0.1454,-0.6368,-0.3290,-0.1016,-0.6400,0.7283,0.0708,0.1225,0.5784,0.0371,0.1839,0.6698,-0.0854,-0.6279,0.7217,-0.0486,-0.6150,0.3478,-0.1137,-0.6326,-0.1622,-0.1161,-0.6361,-0.2370,-0.1129,-0.6382,-0.4924,-0.2385,-0.6376,-0.4392,-0.2510,-0.6376,-0.4310,0.0728,-0.6424,-0.6081,-0.1818,0.0004,-0.6128,-0.0936,0.0129,-0.6062,-0.1778,-0.5994,-0.6119,-0.0961,-0.5898,-0.6117,-0.1369,-0.3470,-0.6103,-0.1555,-0.2160,-0.4552,-0.3716,0.0492,-0.4985,-0.3565,0.0406,-0.6124,-0.1154,-0.1769,-0.6102,-0.1540,-0.1176,-0.6124,-0.1145,-0.0693,-0.6124,-0.1145,-0.0473,-0.5833,-0.2701,0.0223,-0.5895,-0.2325,-0.6056,-0.5999,-0.2185,-0.5772,-0.6001,-0.2202,-0.4989,-0.6080,-0.1788,-0.5609,-0.6072,-0.1884,0.0506,-0.6078,-0.1886,0.0367,-0.5836,-0.2478,-0.1658,-0.5931,-0.2282,-0.0965,-0.6045,-0.2113,0.0359,-0.5968,-0.2246,0.0751,-0.5556,-0.2880,-0.0268,-0.5709,-0.2747,-0.0111,-0.5381,-0.3091,-0.5772,-0.5381,-0.3128,-0.5209,-0.5556,-0.2954,-0.5609,-0.5381,-0.3023,-0.1920,-0.5188,-0.3120,-0.0961,-0.5709,-0.2645,-0.0963,-0.5375,-0.3310,0.0510,-0.4547,-0.3605,0.0109,-0.4557,-0.3345,-0.5995,-0.4986,-0.3226,-0.5995,-0.4770,-0.3435,-0.5419,-0.4770,-0.3352,-0.1921,-0.4345,-0.3396,-0.1434,-0.4343,-0.3411,-0.0465,-0.3954,-0.3398,-0.5996,-0.3953,-0.3460,-0.5898,-0.3953,-0.3507,-0.3073,-0.4144,-0.3510,-0.3073,-0.3953,-0.3441,-0.1921,-0.3865,-0.3681,0.0181,-0.3622,-0.3694,0.0632,-0.3772,-0.3358,-0.0958,-0.4099,-0.3643,0.0097,-0.3673,-0.3594,0.0081,-0.3208,-0.3053,-0.6031,-0.3165,-0.3153,-0.3518,-0.3297,-0.3245,-0.2235,-0.3298,-0.3209,-0.1663,-0.3289,-0.3511,0.0149,-0.2996,-0.3285,0.0361,-0.3297,-0.3194,-0.0705,-0.3416,-0.3324,-0.0269,-0.3082,-0.3184,-0.0043,-0.2860,-0.1798,-0.6214,-0.2735,-0.1880,-0.3945,-0.2805,-0.2113,-0.2235,-0.2881,-0.2338,-0.1435,-0.2808,-0.2040,-0.1209,-0.2684,-0.2239,0.0179,-0.2882,-0.2324,-0.0958,-0.2858,-0.2366,-0.0283,-0.2741,-0.2148,-0.0078,-0.2353,-0.1221,-0.6283,-0.2675,-0.1400,-0.6103,-0.2348,-0.1564,-0.2314,-0.2348,-0.1522,-0.1714,-0.2660,-0.1640,-0.1209,-0.2324,-0.1684,0.0165,-0.2348,-0.1475,-0.0965,-0.2570,-0.1554,-0.0476,-0.2337,-0.1590,-0.0089,-0.2193,-0.1267,-0.6018,-0.2011,-0.1323,-0.5637,-0.2194,-0.1409,-0.5157,-0.1721,-0.1555,-0.2272,-0.2195,-0.1487,-0.1500,-0.1633,-0.1663,0.0611,-0.1850,-0.1506,-0.0469,-0.2025,-0.1471,-0.0977,-0.2192,-0.1540,-0.0169,-0.1018,-0.1900,0.0588,-0.1350,-0.1789,-0.0900,-0.1540,-0.1607,-0.0264,-0.6082,-0.1789,-0.4254,-0.6124,-0.1168,-0.4770,-0.5836,-0.2550,-0.3071,-0.5381,-0.3064,-0.2632,-0.5556,-0.2939,-0.3517,-0.4983,-0.3354,-0.3926,-0.3953,-0.3548,-0.4772,-0.4144,-0.3544,-0.4990,-0.3052,-0.2959,-0.4265,-0.2879,-0.2370,-0.4570,-0.2665,-0.1581,-0.5120,-0.2473,-0.1558,-0.4320,-0.2194,-0.1537,-0.4046,-0.1376,-0.1683,-0.3959,-0.1487,-0.1602,-0.3959,0.5828,-0.1896,-0.3518,0.5814,-0.1429,-0.0732,0.5592,-0.1561,-0.0027,-0.0376,-0.1402,-0.5549,-0.1148,-0.1479,-0.4871,0.2257,-0.1560,-0.6154,0.4631,-0.1561,-0.5480,0.4126,-0.2786,0.1230,0.2250,-0.2783,0.0928,0.5613,-0.2288,-0.0381,-0.0712,-0.2190,0.1038,-0.0652,-0.2425,0.0996,0.6061,-0.1249,-0.0065,0.7303,-0.0708,-0.0190,0.5506,-0.1429,0.0658,0.7427,0.1978,0.0679,0.7472,0.1977,0.0233,-0.2827,-0.0459,-0.6424,-0.2849,-0.1157,-0.6389,0.1374,-0.0964,-0.6411,-0.3321,0.0712,-0.6424,-0.1929,0.0374,-0.6424,-0.1733,0.1984,-0.6392,-0.1388,-0.1391,-0.5164,-0.6049,-0.1994,-0.4255,-0.5932,-0.2398,-0.4257,-0.5188,-0.3258,-0.4258,-0.2011,-0.1497,-0.4442,-0.6116,-0.1372,-0.5418,-0.3602,-0.3486,-0.5423,-0.3443,-0.3419,-0.5428,-0.2888,-0.2252,-0.5725,-0.2669,-0.1460,-0.5802,-0.6141,-0.0134,-0.4225,-0.6131,0.0407,-0.4991,-0.6118,0.0692,-0.5609,-0.6076,0.0953,-0.6066,-0.6116,0.0419,-0.5895,-0.6074,0.1694,-0.5982,-0.4801,0.2312,-0.4606,-0.5987,0.2273,-0.5225,-0.5278,0.2318,-0.2628,-0.5287,0.2312,-0.4580,-0.5478,0.2311,-0.5552,-0.5470,0.2214,-0.6349,-0.6139,0.0141,-0.1783,-0.6130,0.0694,-0.2121,-0.6141,-0.0123,-0.1156,-0.6128,0.0700,-0.1322,-0.6137,0.0146,-0.0585,-0.6132,0.0425,-0.0730,-0.6102,0.0738,0.0301,-0.6039,-0.0114,0.0896,-0.6024,0.1110,0.0735,-0.5665,-0.2199,0.1262,-0.5198,-0.2476,0.1373,-0.3475,-0.3531,0.0878,-0.3599,-0.3288,0.1094,-0.4063,-0.3632,0.0781,-0.3220,-0.3221,0.1129,-0.5096,-0.3095,0.0950,-0.4853,-0.3065,0.1061,-0.5311,-0.3086,0.0856,-0.3694,-0.2828,0.1521,-0.3427,-0.2769,0.1598,-0.3146,-0.2998,0.1327,-0.4300,-0.2831,0.1413,-0.5800,-0.1933,0.1277,-0.5756,-0.2017,0.1326,-0.5848,-0.2554,0.0848,-0.5840,-0.2434,0.0969,-0.5537,-0.3140,0.0649,-0.4327,-0.3747,0.0621,-0.4770,-0.3649,0.0651,-0.3468,-0.3615,0.0797,-0.3107,-0.3217,0.1083,-0.3218,-0.3380,0.0982,-0.3061,-0.2979,0.1328,-0.3084,-0.2883,0.1438,-0.3206,-0.2548,0.1705,-0.3140,-0.2585,0.1675,-0.4025,-0.2613,0.1680,-0.4939,-0.2328,0.1637,-0.4711,-0.2451,0.1648,-0.5142,-0.2257,0.1594,-0.5816,-0.2169,0.1174,-0.5586,-0.2055,0.1432,-0.5780,-0.2483,0.0981,-0.5337,-0.3256,0.0725,-0.4309,-0.3680,0.0718,-0.3475,-0.3573,0.0841,-0.3230,-0.3373,0.0991,-0.3150,-0.2739,0.1605,-0.3255,-0.2690,0.1674,-0.3840,-0.2660,0.1667,-0.4942,-0.2394,0.1600,-0.5145,-0.2298,0.1566,0.1102,-0.3730,0.3059,0.1331,-0.3808,0.2899,0.2748,-0.3917,0.2413,0.3554,-0.3864,0.2600,0.2676,-0.3863,0.2733,0.3097,-0.2851,0.3490,0.2342,-0.3533,0.3311,0.1150,-0.3220,0.3305,0.1126,-0.3035,0.3351,0.3668,-0.1045,0.3587,0.3558,-0.0591,0.3665,0.4330,-0.0761,0.2835,0.3999,-0.0573,0.3314,0.0639,-0.0728,0.3306,0.0215,-0.0695,0.2832,0.4525,-0.1156,0.2536,0.3506,-0.3702,0.3122,0.3528,-0.3605,0.3179,0.3328,-0.3687,0.3179,0.1633,-0.3612,0.3247,0.3659,-0.3536,0.3119,0.3810,-0.3430,0.2971,0.3704,-0.3035,0.3248,0.0440,-0.3017,0.2020,0.2365,-0.3626,0.2041,0.4076,-0.3373,0.2097,0.3800,-0.3206,0.2029,0.1008,-0.2805,0.1463,0.3426,-0.2953,0.1879,-0.0473,-0.2331,0.1541,-0.0304,-0.2107,0.1994,0.3754,-0.2645,0.3303,0.3612,-0.2086,0.3504,0.3893,-0.2253,0.3241,0.4063,-0.2423,0.2975,0.2334,-0.2477,0.3641,0.1805,-0.2854,0.3521,0.0781,-0.2378,0.3227,0.0479,-0.2461,0.2805,0.4362,-0.2388,0.2508,0.4585,-0.2141,0.2203,-0.3974,-0.2952,-0.6276,-0.4628,-0.2692,-0.6335,-0.5138,-0.2552,-0.6324,-0.3156,-0.1795,-0.6319,0.4052,-0.3865,0.2375,0.4073,-0.3768,0.2438,0.0984,-0.3898,0.2340,0.1479,-0.3854,0.2128,0.3242,-0.3907,0.2151,0.0932,-0.3556,0.2978,0.1109,-0.3661,0.3138,0.0982,-0.3383,0.3135,0.0419,-0.3276,0.2397,0.0226,-0.3059,0.2237,-0.2544,0.1072,0.2148,-0.2981,0.1530,0.2106,-0.3947,0.1363,0.2017,-0.3946,0.1461,0.2016,-0.4766,0.1072,0.1946,-0.1195,0.1072,0.2273,-0.0874,0.1223,0.2307,-0.1185,0.1456,0.2271,-0.1613,0.1456,0.2232,-0.3367,-0.0820,0.2015,-0.3966,-0.1032,0.1965,-0.4415,-0.1169,0.1925,-0.4452,-0.0587,0.1955,-0.0567,-0.0879,0.2254,-0.1391,-0.0938,0.2024,-0.1844,-0.0734,0.2062,-0.1846,-0.0911,0.1991,-0.1922,-0.1514,0.1308,-0.1523,-0.1536,0.1356,-0.1353,-0.1591,0.1204,-0.5214,-0.1199,0.1687,-0.5037,-0.1039,0.1828,-0.3696,-0.1424,0.1896,-0.3388,-0.1478,0.1862,-0.3037,-0.1497,0.1794,-0.1213,-0.1361,0.1786,-0.2295,-0.1301,0.1723,-0.2517,-0.1100,0.1899,-0.2915,-0.1188,0.1917,-0.2681,-0.1740,0.1326,-0.3053,-0.2552,0.1620,-0.2889,-0.2700,0.1160,-0.2851,-0.1315,0.1841,-0.2869,-0.2910,0.0763,-0.2629,-0.1959,0.0729,-0.1965,-0.1597,0.0964,-0.1395,-0.1637,0.0940,-0.2687,-0.2107,0.0858,-0.2712,-0.1924,0.1217,-0.2797,-0.2264,0.1252,-0.5218,0.1034,0.1908,-0.4898,0.1619,0.1909,-0.5046,-0.0339,0.1899,-0.5279,0.2094,0.1641,-0.5456,0.1994,0.1572,-0.5412,0.0300,0.0983,-0.5512,0.1075,0.1025,-0.5523,-0.0855,0.1643,-0.5758,-0.0661,0.1459,-0.5759,0.1033,0.0953,-0.5687,0.1059,0.0978,-0.5871,-0.2025,0.1108,-0.5937,-0.1169,0.1132,-0.5756,0.1499,0.1386,-0.5960,0.1082,0.1011,-0.5969,0.0051,0.1016,-0.6000,0.0833,0.0945,-0.5885,-0.0314,0.1258,-0.5957,-0.0175,0.1111,-0.5448,-0.0257,0.1773,-0.5313,0.0074,0.1881,-0.5350,-0.0044,0.1812,-0.5516,0.1484,0.1700,-0.5368,0.1468,0.1818,-0.5618,0.1225,0.1103,-0.5947,0.0553,0.0919,-0.5666,-0.0215,0.1362,-0.5370,-0.0165,0.1563,-0.5315,-0.0040,0.1541,-0.5529,0.1235,0.1138,0.7462,0.2197,-0.2147,0.7181,-0.0887,-0.3681,0.7193,-0.0887,-0.3252,0.0141,0.2369,-0.0285,0.0275,0.2488,-0.0484,0.0646,0.2576,-0.0221,0.0095,0.2333,-0.0281,-0.0046,0.2314,-0.0190,-0.2770,0.1651,0.2120,-0.2548,0.1692,0.2130,-0.3736,0.1653,0.2030,-0.4177,0.1622,0.1990,-0.4993,0.1244,0.1936,-0.4882,0.1457,0.1935,-0.3995,-0.0174,0.2017,-0.4671,-0.0299,0.1950,-0.3588,-0.0175,0.2055,-0.2771,-0.0273,0.2126,-0.1613,-0.0332,0.2214,-0.2082,-0.0226,0.2192,-0.0848,-0.0246,0.2307,-0.0473,0.0043,0.2461,-0.0651,-0.0000,0.2375,-0.1102,0.1617,0.2266,-0.0241,0.1601,0.2353,-0.1604,0.1580,0.2231,-0.2314,0.0282,0.2172,-0.2985,-0.0102,0.2110,-0.3784,-0.0100,0.2036,-0.4621,0.0011,0.1960,-0.0873,-0.0086,0.2311,-0.1395,0.0282,0.2257,-0.1845,-0.0003,0.2216,-0.5153,0.0089,0.1916,-0.5088,0.0262,0.1934,-0.5366,0.1356,0.1791,-0.4948,-0.0011,0.1943,-0.0412,0.1024,0.2476,-0.0489,0.1468,0.2356,-0.4901,0.1279,0.1939,-0.4911,0.0307,0.1946,-0.0655,0.0153,0.2379,-0.0695,0.1306,0.2343,-0.2318,0.1820,0.2107,-0.6119,0.1159,-0.3220,-0.6113,0.1171,-0.1186,-0.6095,0.1361,-0.0378,-0.6060,0.1535,0.0176,-0.5992,0.1599,0.0620,-0.4607,0.1874,0.1889,-0.4119,0.1813,0.1959,-0.5401,0.1722,0.1729,-0.0697,0.1895,0.2143,-0.0408,0.1972,0.2107,-0.3679,0.1818,0.2001,-0.5134,0.1758,0.1838,-0.5880,0.1572,0.1057,-0.5267,0.0586,0.1242,-0.5313,0.1016,0.1605,-0.2543,0.0677,0.2149,-0.3971,0.0476,0.2017,-0.4410,0.0684,0.1976,-0.1395,0.0677,0.2256,-0.1842,0.0471,0.2215,-0.5218,0.0638,0.1915,-0.5089,0.0870,0.1935,-0.4992,0.0679,0.1952,-0.0449,0.0828,0.2486,-0.0614,0.0465,0.2432,-0.0652,0.0876,0.2394,0.3760,0.0290,0.3544,0.3567,0.0068,0.3744,0.4078,0.0139,0.3174,0.0820,0.0517,0.3424,0.0220,0.0542,0.2843,0.4541,0.0286,0.2444,0.3847,-0.1674,0.3390,0.3336,-0.1894,0.3618,0.3956,-0.1659,0.3275,0.1510,-0.1269,0.3729,0.0677,-0.1371,0.3286,0.0591,-0.1705,0.3124,0.4676,-0.1532,0.2240,0.5002,-0.1393,0.1946,0.4737,-0.2512,0.1884,0.0553,-0.2779,-0.1477,0.1371,-0.2780,-0.1850,-0.0600,-0.2774,-0.0767,0.4504,-0.2774,-0.5164,0.3004,-0.2780,-0.4890,0.1777,-0.2466,-0.6108,0.0409,-0.0228,-0.6424,0.0406,0.0694,-0.6424,0.3874,-0.1430,-0.5940,0.1544,-0.2783,0.0926,-0.0575,-0.2238,0.1360,0.0264,-0.2170,0.2631,0.0073,-0.1191,0.2647,-0.0166,-0.0112,0.2605,-0.0145,0.0701,0.2618,-0.5775,0.2039,0.1014,-0.4962,0.2104,0.1744,-0.4853,0.2402,0.1539,-0.4779,0.2520,0.1419,-0.5557,0.2333,0.1063,-0.5319,0.2521,0.0972,-0.5068,0.2550,0.0427,-0.3908,0.2536,0.1351,-0.4931,0.2537,0.0895,0.3974,-0.2779,-0.3548,0.5826,-0.2092,-0.3518,-0.1338,-0.2106,-0.1510,-0.1360,-0.2466,-0.1866,-0.1609,-0.1607,-0.2297,0.0605,-0.2779,-0.3999,0.6440,-0.1187,-0.4043,0.3523,-0.3222,0.3301,0.1611,-0.3395,0.3326,0.2905,-0.0832,0.3787,0.1224,-0.0364,0.3747,0.0883,-0.1247,0.3517,0.2589,-0.3723,0.3186,0.1222,-0.3654,0.3182,0.3122,-0.2092,0.3635,0.1069,-0.2462,0.3463,0.0988,0.0481,0.3588,0.2615,-0.1896,0.3727,0.1146,-0.1691,0.3607,0.5435,-0.2747,-0.4393,0.5442,-0.2768,-0.0732,0.5401,-0.2748,-0.0049,-0.0795,-0.2748,0.0247,-0.1287,-0.2747,-0.1864,-0.0555,-0.2768,-0.4767,-0.0025,-0.2747,-0.5418,0.2270,-0.2768,-0.6016,0.5036,-0.2768,-0.4798,0.5011,-0.2704,0.1242,-0.0838,-0.2769,-0.0424,0.0033,-0.2829,0.1840,0.4499,-0.2977,0.2051,0.0322,-0.3166,0.2099,0.0672,-0.3885,0.2295,0.3999,-0.3884,0.2353,0.4201,-0.3800,0.2243,0.4300,-0.3542,0.2166,0.5683,-0.2768,-0.2219,-0.1244,-0.2747,-0.3522,0.2037,-0.3863,0.2736,0.3896,-0.3871,0.2472,0.3516,0.1636,0.3382,0.3547,0.1361,0.3384,0.3507,0.1765,0.3176,0.1115,0.1214,0.3508,0.1148,0.1768,0.3176,0.3517,0.0055,0.4018,0.3327,-0.0223,0.4068,0.3204,0.1932,0.3521,0.3475,0.1753,0.3655,0.3550,0.0871,0.3716,0.3540,0.1084,0.3882,0.1120,0.0066,0.3811,0.1117,0.0464,0.3862,0.2866,0.1748,0.3828,0.3143,0.1292,0.4035,0.2910,-0.0358,0.3927,0.2324,-0.0358,0.4019,0.2898,0.0892,0.4078,0.2515,0.1994,0.3333,0.3065,0.1969,0.3211,0.2515,0.2017,0.3167,0.1132,0.0672,0.4036,0.1216,0.1293,0.4025,0.1432,0.1932,0.3264,0.0975,-0.3816,0.2773,0.3040,-0.3738,0.3133,0.2349,-0.3803,0.2995,0.3628,-0.3745,0.2985,0.0829,-0.3825,0.2625,0.3480,-0.3720,0.3106,0.4150,-0.3294,0.2537,0.3535,0.1539,0.3633,0.1128,0.1525,0.3517,0.1146,0.1654,0.3587,0.3451,0.0893,0.4075,0.3321,0.1886,0.3266,0.1343,0.0059,0.4073,0.1752,0.0447,0.4078,0.1913,0.1990,0.3614,0.1730,0.1981,0.3521,0.1217,0.0240,0.4071,0.1324,0.1887,0.3524,0.2713,0.1987,0.3736,0.2889,0.1962,0.3768,0.1107,0.1044,0.3563,0.3459,-0.0104,0.3964,0.2025,0.1290,0.4035,0.2619,0.0047,0.4075,0.2622,-0.0306,0.4064,0.1744,-0.0342,0.4014,0.1912,0.1997,0.3212,0.2712,0.1991,0.3521,0.1215,0.1447,0.3978,0.2036,0.1746,0.3830,0.3534,0.1443,0.3944,0.3450,0.1447,0.3985,0.1481,0.1879,0.3777,0.2314,0.1917,0.3774,0.3317,0.1885,0.3743,0.2095,0.1951,0.3770,0.2103,0.1973,0.3768,0.3858,0.2140,0.2825,0.3291,0.2159,0.2993,0.2312,0.2305,0.2974,0.0907,0.2016,0.2952,0.1110,0.2269,0.2909,0.1906,0.2304,0.2972,0.0858,0.0709,0.3388,0.0342,0.1264,0.2796,-0.0153,0.1301,0.2500,0.4209,0.1361,0.2737,0.4042,0.1443,0.2892,0.0834,0.1908,0.2956,0.0705,0.1574,0.2966,0.4919,0.2571,0.1517,0.4020,0.1632,0.2863,0.7298,0.2434,0.0762,0.7335,0.2481,-0.0077,0.7318,0.2479,-0.5646,0.7436,0.2346,-0.1423,0.7394,0.2433,-0.3314,0.7081,0.2434,0.0995,0.7282,0.2367,-0.6128,0.7435,0.2346,-0.1060,0.6229,0.2434,0.1279,0.0021,0.3242,0.0479,0.0162,0.2766,0.0221,0.0917,0.3103,0.0043,0.1748,0.2784,-0.0040,0.4697,0.3243,0.0535,0.5033,0.2628,0.1224,0.4015,0.3243,0.0100,-0.0123,0.2763,0.0855,-0.0115,0.3097,0.0855,-0.0083,0.2540,0.1799,0.0344,0.2941,0.0055,0.3212,0.2941,0.0020,-0.0067,0.2336,0.1873,-0.0041,0.2391,0.1943,0.3813,0.2850,0.2677,0.2929,0.2644,0.2888,0.2516,0.3216,0.2828,0.1483,0.3216,0.2802,0.0613,0.2619,0.2654,0.1695,0.3216,0.2818,0.4202,0.3225,0.2311,0.0610,0.3460,0.0469,0.0922,0.3445,0.0540,0.1837,0.3460,0.0197,0.1291,0.3456,0.0253,0.4243,0.3457,0.1548,0.3684,0.3446,0.0608,0.3752,0.3457,0.0193,0.3676,0.3457,0.0306,0.0502,0.3460,0.1083,0.0716,0.3456,0.0810,0.0508,0.3460,0.1453,0.0722,0.3455,0.1613,0.0839,0.3460,0.0214,0.2638,0.3457,0.0149,0.3341,0.3460,0.0213,0.0503,0.3460,0.1313,0.0611,0.3458,0.1912,0.0895,0.3443,0.1643,0.3145,0.3460,0.2343,0.3595,0.3456,0.2077,0.2749,0.3459,0.2358,0.2307,0.3456,0.2502,0.1103,0.3446,0.2547,0.0932,0.3459,0.2220,0.1863,0.3459,0.2358,0.0623,0.3446,0.2321,0.0385,0.3445,0.2094,0.3640,0.3445,0.1741,0.0291,0.2860,0.2354,0.0417,0.2416,0.2547,-0.0058,0.3065,0.1847,-0.0096,0.2888,0.1725,-0.0132,0.2744,0.1195,-0.0125,0.3088,0.1195,0.0319,0.1879,0.2575,-0.0523,0.2309,0.1654,0.0046,0.1863,0.2305,0.0284,0.1775,0.2570,0.0403,0.1614,0.2746,0.0254,0.1681,0.2578,0.1205,0.3279,0.0722,0.1190,0.3309,0.0807,0.1957,0.3212,0.0467,0.1564,0.3162,0.0545,0.3371,0.3325,0.1108,0.3245,0.3122,0.0850,0.3329,0.3272,0.0537,0.3166,0.3122,0.0687,0.1219,0.3231,0.1418,0.1151,0.3359,0.1531,0.1216,0.3321,0.0430,0.1353,0.3121,0.0684,0.2697,0.3163,0.0544,0.1175,0.3320,0.1252,0.3178,0.3270,0.1828,0.3260,0.3215,0.1772,0.2282,0.3318,0.1859,0.2904,0.3213,0.1796,0.1393,0.3266,0.1831,0.1354,0.3161,0.1719,0.2047,0.3265,0.1835,0.1647,0.3120,0.1591,0.1279,0.3123,0.1619,0.3273,0.3215,0.1763,0.1014,0.3425,0.0749,0.1101,0.3400,0.0512,0.2212,0.3399,0.0359,0.3469,0.3402,0.0631,0.3443,0.3428,0.0365,0.1009,0.3425,0.1082,0.1011,0.3425,0.0841,0.1010,0.3425,0.1301,0.1083,0.3426,0.0359,0.1142,0.3363,0.1242,0.1096,0.3398,0.1728,0.3290,0.3366,0.1871,0.3439,0.3427,0.1923,0.2761,0.3425,0.1996,0.1230,0.3362,0.1862,0.1632,0.3397,0.1930,0.1055,0.3424,0.1851,0.3145,0.3096,0.0894,0.3208,0.3088,0.1167,0.1284,0.3098,0.0988,0.2213,0.3096,0.0887,0.1777,0.3096,0.0887,0.3222,0.3096,0.1448,0.0009,0.3397,0.0615,0.0990,0.3430,0.0084,0.1304,0.3338,0.0051,0.4591,0.3396,0.1533,0.4473,0.3338,0.0251,-0.0087,0.3336,0.0857,-0.0026,0.3394,0.1707,-0.0063,0.3330,0.1715,0.3184,0.3338,0.0054,0.0010,0.3430,0.1188,0.0203,0.3428,0.2015,0.3142,0.3429,0.2687,0.2722,0.3326,0.2801,0.1270,0.3327,0.2751,0.0661,0.3327,0.2556,0.0488,0.3327,0.2436,0.4478,0.3396,0.1803,0.3594,0.1035,0.3433,0.1013,0.0674,0.3545,-0.5775,-0.1655,0.1328,-0.5584,-0.1266,0.1514,-0.5152,-0.1457,0.1671,-0.3828,-0.2078,0.1763,-0.3304,-0.1960,0.1776,-0.5973,-0.0357,0.1066,-0.6131,-0.0330,0.0259,-0.4737,-0.1285,0.1879,-0.4204,-0.1638,0.1914,-0.4018,-0.1749,0.1861,-0.4912,-0.1491,0.1770,-0.4689,-0.1481,0.1869,-0.4530,-0.1948,0.1848,-0.3960,-0.1827,0.1826,-0.4078,-0.2104,0.1817,-0.4700,-0.1690,0.1842,-0.4286,-0.2268,0.1784,-0.4802,-0.2242,0.1698,-0.4121,-0.1898,0.1869,-0.4908,-0.1857,0.1733,-0.4309,-0.2138,0.1826,-0.4095,-0.2408,0.1721,-0.4944,-0.1864,0.1710,-0.5729,-0.1167,0.1423,-0.5708,-0.0915,0.1479,-0.3545,-0.1614,0.1816,-0.3811,-0.1649,0.1814,-0.3261,-0.2381,0.1732,-0.3138,-0.1757,0.1768,0.1495,-0.0826,0.3752,0.1745,-0.0342,0.3973,0.1214,0.2517,-0.4495,-0.6087,0.1989,-0.4512,-0.6088,0.1847,-0.5415,-0.6072,0.1850,-0.5979,-0.5922,0.2117,-0.6250,-0.5479,0.2117,-0.6383,-0.6138,-0.0547,0.0016,-0.6134,-0.0758,-0.0670,-0.6138,-0.0568,-0.1238,-0.6139,-0.0571,-0.2385,-0.6140,-0.0364,-0.4989,-0.6141,-0.0366,-0.4229,-0.6134,-0.0769,-0.5208,-0.6127,-0.0568,-0.5897,-0.5840,-0.0583,-0.6336,-0.5320,0.1159,0.1630,-0.3509,-0.3009,-0.6202,-0.3913,-0.2188,-0.6375,0.0979,0.2524,-0.0648,0.3075,-0.3632,0.0751,0.1629,-0.4100,0.0933,0.2924,-0.5681,0.1138,-0.1043,-0.4925,-0.1092,-0.1119,-0.4202,-0.1741,-0.1269,-0.6353,-0.3217,-0.0682,-0.4887,-0.4529,0.0871,-0.5681,-0.5908,0.3393,-0.3446,-0.5368,0.1542,-0.6353,-0.6113,0.5121,-0.4202,-0.4398,0.5585,-0.4202,-0.3234,0.5533,-0.6353,-0.1064,0.4563,-0.4125,0.0065,0.3242,-0.7219,0.0048,0.2885,-0.7219,0.0935,0.1214,-0.7219,0.0043,-0.0037,-0.7224,-0.0149,-0.0527,-0.7224,-0.1925,-0.0729,-0.7224,-0.3764,0.1160,-0.7224,-0.5181,-0.0145,-0.7219,-0.4957,0.2239,-0.7225,-0.5598,0.3252,-0.7219,-0.5018,0.4620,-0.7219,-0.4946,0.4575,-0.7224,-0.4098,0.5195,-0.7224,-0.1210,0.4100,-0.7219,-0.0548,0.4099,-0.7219,0.0418,0.3168,-0.7144,-0.0137,0.1308,-0.7019,-0.0189,0.0869,-0.7102,-0.0383,0.0231,-0.7019,-0.1111,-0.0035,-0.7144,-0.3465,0.0289,-0.6997,-0.3836,0.0874,-0.7144,-0.4601,0.2237,-0.6997,-0.4906,0.2713,-0.7057,-0.4958,0.3597,-0.7102,-0.4591,0.4181,-0.6997,-0.3827,0.4681,-0.7102,-0.2482,0.4176,-0.6997,-0.1138,0.3582,-0.7057,-0.0388,0.2217,-0.7020,-0.0332,0.1189,-0.7044,-0.0816,0.0505,-0.7020,-0.1290,0.0041,-0.7000,-0.2041,0.1171,-0.7048,-0.4084,0.0657,-0.7000,-0.4124,0.3092,-0.7000,-0.4622,0.3321,-0.7072,-0.3789,0.3776,-0.7048,-0.3586,0.4169,-0.7019,-0.1652,0.3738,-0.7066,-0.1588,0.2173,-0.7097,-0.1512,0.1668,-0.7099,-0.2731,0.2468,-0.7099,-0.3072,0.3221,-0.7089,-0.3352,0.1889,-0.2793,-0.1634,0.3762,-0.3112,-0.0134,0.5002,-0.3287,-0.3667,0.1716,-0.3112,-0.5272,-0.0042,-0.3112,-0.0906,0.2916,-0.7197,0.1098,-0.0661,-0.7210,-0.0497,-0.0736,-0.7150,-0.0446,-0.1233,-0.7197,-0.1781,-0.0218,-0.7210,-0.5033,0.0876,-0.7177,-0.5894,0.1544,-0.7177,-0.6098,0.5502,-0.7197,-0.3880,0.5640,-0.7210,-0.1777,0.5788,-0.7177,-0.2479,0.5193,-0.7150,-0.0433,0.3171,-0.7175,-0.0130,0.0490,-0.7175,-0.0692,-0.0042,-0.7175,-0.3468,0.1294,-0.7175,-0.4844,0.2718,-0.7175,-0.4983,0.2735,-0.7210,-0.5066,0.4350,-0.7210,-0.3943,0.4583,-0.7210,-0.1474,0.0858,-0.6776,0.0927,0.2924,-0.7010,0.1138,-0.0294,-0.7115,0.0116,-0.1266,-0.7115,-0.3217,0.0257,-0.7115,-0.5562,0.3606,-0.7115,-0.5899,0.4761,-0.7010,-0.5092,0.5802,-0.7010,-0.2479,0.4209,-0.7115,0.0588,0.1514,0.0888,0.4260,0.1581,0.0056,0.4260,0.1649,0.0595,0.4190,0.1457,0.0056,0.4187,0.1398,0.0888,0.4115,0.1397,0.0056,0.4080,0.1397,0.0888,0.4046,0.1318,0.0056,0.4068,0.1321,0.1133,0.4204,0.1694,0.0595,0.4225,0.1694,0.0595,0.4237,0.1357,0.0888,0.3987,0.1344,0.0301,0.3987,0.1424,0.1380,0.4222,0.1638,0.1379,0.4248,0.1493,-0.0190,0.4201,0.1642,-0.0190,0.4225,0.1465,-0.0190,0.4236,0.1335,-0.0190,0.4194,0.1383,-0.0190,0.4020,0.1358,0.1380,0.4098,0.1332,0.1380,0.4109,0.1325,0.0056,0.4230,0.1404,0.0595,0.4165,0.1428,0.0056,0.4184,0.1378,0.1380,0.4186,0.1416,-0.0190,0.4196,0.1636,0.1280,0.4259,0.1670,0.1379,0.4254,0.1693,0.0056,0.4254,0.1321,-0.0091,0.3993,0.1319,0.1280,0.4029,0.1332,0.1354,0.3993,0.1688,-0.0165,0.4203,0.1693,0.1280,0.4203,0.1674,0.1379,0.4203,0.1396,0.1280,0.4018,0.1394,-0.0091,0.3992,0.1390,-0.0189,0.4019,0.1582,0.1354,0.4258,0.1515,-0.0091,0.4259,0.1327,-0.0190,0.4199,0.1324,-0.0190,0.4066,0.1320,0.1354,0.4067,0.1457,-0.0091,0.4187,0.1675,0.0301,0.4191,0.1553,0.1354,0.4192,0.1394,0.0888,0.3992,0.1396,-0.0091,0.4046,0.1398,0.1354,0.4146,0.1687,-0.0165,0.4225,0.1688,0.1354,0.4213,0.1371,0.1379,0.4002,0.1327,0.1354,0.4229,0.1336,-0.0165,0.4244,0.1423,-0.0190,0.4189,0.1397,0.1379,0.4170,0.3009,0.1133,0.4259,0.3254,0.0056,0.4257,0.3091,0.0595,0.4190,0.3091,0.0056,0.4190,0.3247,0.0595,0.4115,0.3248,0.0301,0.4046,0.3327,0.0888,0.4029,0.3324,0.0056,0.4204,0.2952,0.0056,0.4213,0.2952,0.0301,0.4237,0.2952,0.0888,0.4213,0.3313,0.1133,0.3988,0.3274,0.0056,0.3988,0.3111,0.1380,0.4225,0.3124,0.1380,0.4248,0.3170,-0.0191,0.4224,0.3056,-0.0190,0.4237,0.3270,-0.0190,0.4164,0.3288,-0.0190,0.4057,0.3270,0.1380,0.4164,0.3300,0.1380,0.4148,0.3262,0.1380,0.4050,0.3291,0.0301,0.4254,0.3217,0.0056,0.4184,0.3298,0.1380,0.4234,0.3240,0.1380,0.4206,0.3267,-0.0190,0.4231,0.2958,0.1354,0.4247,0.2952,0.0056,0.4254,0.2975,0.0056,0.4259,0.3326,0.0056,0.4005,0.3324,0.1354,0.4005,0.3320,0.1133,0.3988,0.2971,-0.0189,0.4196,0.2997,0.1354,0.4193,0.3249,0.1280,0.4001,0.3255,0.1354,0.3992,0.3255,0.0056,0.3988,0.3130,0.1354,0.4258,0.2975,0.0595,0.4259,0.3128,-0.0190,0.4254,0.3323,-0.0091,0.4204,0.3325,0.0595,0.3993,0.3318,0.1379,0.4199,0.3092,-0.0165,0.4192,0.2952,0.0301,0.4196,0.3040,0.1354,0.4192,0.3255,0.0301,0.3988,0.3255,-0.0190,0.4048,0.3254,0.1379,0.4083,0.2958,-0.0165,0.4237,0.3274,0.1280,0.3988,0.3288,-0.0165,0.3992,0.3318,0.1354,0.4229,0.3318,-0.0165,0.4229,0.3234,0.1280,0.4178,0.7711,0.0150,0.0889,0.7821,0.0215,0.0886,0.7711,0.0150,0.0975,0.7784,0.0099,0.0974,0.7780,0.0254,0.0966,0.7769,0.0264,0.0913,0.7892,0.0287,0.0914,0.7510,0.0188,0.0913,0.7576,0.0188,0.0950,0.7842,0.0696,0.0886,0.7892,0.0696,0.0898,0.7802,0.1238,0.0886,0.7799,0.1156,0.0889,0.7739,0.1330,0.0965,0.7786,0.1041,0.0966,0.7417,0.1305,0.0974,0.7648,0.1247,0.0975,0.7770,0.1031,0.0932,0.7735,0.1198,0.0950,0.7892,0.1106,0.0914,0.7869,0.0696,0.0974,0.7906,0.0696,0.0950,0.7574,0.1340,0.0898,0.7417,0.1305,0.0889,0.7483,0.1354,0.0914,0.7328,0.0215,0.0886,0.7311,0.0107,0.0898,0.7380,0.0127,0.0978,0.7352,0.0236,0.0975,0.7486,0.0054,0.0965,0.7388,0.0268,0.0932,0.7250,0.0284,0.0932,0.7343,0.0060,0.0950,0.7366,0.1041,0.0898,0.7351,0.1318,0.0898,0.7285,0.1217,0.0898,0.7304,0.1199,0.0974,0.7362,0.0884,0.0966,0.7375,0.0696,0.0913,0.7384,0.1128,0.0913,0.7269,0.1231,0.0932,0.7511,0.1198,0.0932,0.7258,0.0479,0.0965,0.7244,0.0918,0.0950,0.7648,0.0146,0.0889,-0.5631,0.0029,0.1163,-0.5621,0.0085,0.1217,-0.5622,-0.0053,0.1203,-0.5700,-0.0089,0.1159,-0.5710,0.0187,0.1226,-0.5666,0.0210,0.1189,-0.5666,-0.0110,0.1166,-0.5631,0.0024,0.0879,-0.5685,0.0037,0.0938,-0.5621,0.0545,0.1232,-0.5622,0.0755,0.1283,-0.5621,0.1061,0.1202,-0.5618,0.1026,0.1239,-0.5713,0.1087,0.1220,-0.5710,0.1061,0.1202,-0.5700,0.1187,0.0915,-0.5710,0.1097,0.1001,-0.5685,0.0728,0.1196,-0.5685,0.1027,0.1177,-0.5684,0.1146,0.1263,-0.5710,0.0334,0.1283,-0.5684,0.0324,0.1317,-0.5618,0.1128,0.1076,-0.5618,0.1122,0.0859,-0.5647,0.1205,0.0999,-0.5618,-0.0024,0.0813,-0.5622,0.0042,0.0739,-0.5710,0.0156,0.0726,-0.5713,-0.0024,0.0813,-0.5710,-0.0007,0.1001,-0.5646,0.0113,0.0816,-0.5684,0.0135,0.0691,-0.5666,-0.0096,0.0774,-0.5618,0.0545,0.0742,-0.5622,0.0334,0.0717,-0.5631,0.1134,0.0746,-0.5710,0.1142,0.0797,-0.5701,0.0987,0.0805,-0.5666,0.0363,0.0813,-0.5685,0.0977,0.0816,-0.5647,0.1076,0.0709,-0.5685,0.1053,0.1002,-0.5710,0.0545,0.0715,-0.5684,0.0324,0.0681,-0.5621,-0.0006,0.0931,-0.5684,-0.0113,0.1087,0.4961,0.0330,0.1776,0.5569,-0.0173,0.2259,0.5892,-0.0236,0.1587,0.6130,-0.0272,0.2007,0.6740,0.0271,0.1437,0.6881,0.0464,0.1540,0.6725,0.0851,0.1241,0.6650,0.1393,0.1604,0.6338,0.1306,0.1213,0.5500,0.1618,0.1670,0.5644,0.1610,0.1484,0.5357,0.1564,0.1873,0.4955,0.0966,0.2207,0.4956,0.0577,0.2273,0.5530,0.0002,0.1536,0.5979,0.1061,0.1211,0.6249,0.0419,0.1258,0.6045,0.0023,0.1386,0.6027,0.0233,0.2225,0.6320,-0.0022,0.2201,0.6395,0.1089,0.1995,0.6670,0.1299,0.1896,0.6117,0.1589,0.1974,0.5196,0.1106,0.2268,0.5121,0.0437,0.2399,0.6698,-0.1692,-0.2924,0.6762,-0.1157,-0.2058,0.6508,-0.2227,-0.1939,0.6284,-0.1157,-0.1538,0.5581,-0.2227,-0.1514,0.5377,-0.1692,-0.1533,0.5591,-0.2227,-0.3504,0.5832,-0.1157,-0.3649,0.6586,-0.1692,-0.3114,0.6072,-0.0914,-0.2912,0.6288,-0.0914,-0.2142,0.6624,-0.0914,-0.2970,0.6498,-0.2470,-0.2203,0.5983,-0.2470,-0.2839,0.5358,-0.2470,-0.2010,0.5789,-0.2470,-0.2860,0.5240,-0.0914,-0.2510,0.6805,-0.0914,-0.2291,0.6744,-0.0914,-0.2916,0.6303,-0.0938,-0.3456,0.5836,-0.1011,-0.3662,0.5199,-0.1011,-0.1687,0.5368,-0.1011,-0.1461,0.6490,-0.0938,-0.1697,0.6591,-0.2372,-0.2885,0.6320,-0.2470,-0.1907,0.5315,-0.2470,-0.1920,0.5199,-0.2445,-0.2150,0.5202,-0.2445,-0.2870,0.5993,-0.2445,-0.3380,0.6489,-0.2372,-0.3056,-0.4776,-0.1713,0.1742,-0.4845,-0.1809,0.1796,-0.4773,-0.1710,0.1935,-0.4189,-0.1837,0.1998,-0.4127,-0.1668,0.1958,-0.4072,-0.1851,0.1834,-0.4406,-0.1858,0.1748,-0.4412,-0.1625,0.1882,-0.4403,-0.1759,0.1699,0.0236,0.2243,0.2596,0.0310,0.2343,0.2618,0.0552,0.2244,0.2612,0.0630,0.2306,0.2579,-0.0003,0.2244,0.2024,-0.0038,0.2306,0.2083,-0.0015,0.2243,0.2331,-0.0047,0.2306,0.2260,0.0278,0.2443,0.2500,0.0476,0.2414,0.2567,0.0523,0.2443,0.2512,0.0036,0.2414,0.2102,0.0053,0.2380,0.2405,-0.0004,0.2380,0.2253,0.0054,0.2207,0.2247,0.0574,0.2225,0.2476,0.0354,0.2486,0.2345,0.0294,0.2481,0.2196,0.0418,0.2343,0.2191,0.0206,0.2414,0.2000,0.0529,0.2443,0.2340,0.0396,0.2242,0.2211,0.0227,0.2243,0.2037,0.5605,-0.0136,0.2371,0.6372,-0.0186,0.2161,0.6698,0.0032,0.2091,0.6996,0.0725,0.1905,0.6830,0.1268,0.1851,0.5977,0.1744,0.1924,0.5255,0.1478,0.2136,0.4975,0.0979,0.2285,-0.2309,0.2687,-0.2596,-0.2471,0.2690,-0.2872,-0.1293,0.2690,-0.2779,-0.0596,0.2690,-0.3830,-0.0912,0.2690,-0.4660,-0.1528,0.2690,-0.4943,-0.2511,0.2689,-0.4874,-0.3055,0.2689,-0.4078,-0.2777,0.2690,-0.3166,0.5409,0.2518,-0.5092,0.6351,0.2522,-0.4790,0.5922,0.2524,-0.3314,0.5842,0.2525,-0.1435,0.5583,0.2533,-0.0109,0.5290,0.2577,0.0419,0.5371,0.2555,0.1165],
    [-0.0526,0.1867,0.1555,0.0498,0.1320,0.1555,-0.1353,0.1319,0.0954,-0.0353,0.3305,0.1021,0.0404,0.0065,0.1264,0.1325,0.1868,-0.0993,0.1642,0.1321,-0.0019,-0.1109,0.3304,-0.0019,-0.0526,0.1867,-0.1594,0.0498,0.1320,-0.1594,0.0869,0.3305,-0.0662,-0.1105,0.0064,-0.0813,0.1691,-0.0574,0.0320,0.1592,-0.0574,0.0646,0.1215,-0.0574,0.1210,0.0651,-0.0574,0.1587,-0.0014,-0.0574,0.1720,-0.0353,-0.0574,0.1686,-0.0980,-0.0574,0.1426,-0.1460,-0.0574,0.0947,-0.1720,-0.0574,0.0320,-0.1753,-0.0574,-0.0019,-0.1621,-0.0574,-0.0685,-0.1244,-0.0574,-0.1249,-0.0680,-0.0574,-0.1626,-0.0353,-0.0574,-0.1725,0.0325,-0.0574,-0.1725,0.0952,-0.0574,-0.1465,0.1432,-0.0574,-0.0986,0.1592,-0.0574,-0.0685,0.1725,-0.8333,-0.0019,0.1592,-0.8333,0.0646,0.1215,-0.8333,0.1210,0.0952,-0.8333,0.1426,0.0325,-0.8333,0.1686,-0.0353,-0.8333,0.1686,-0.0980,-0.8333,0.1426,-0.1244,-0.8333,0.1210,-0.1621,-0.8333,0.0646,-0.1753,-0.8333,-0.0019,-0.1621,-0.8333,-0.0685,-0.1244,-0.8333,-0.1249,-0.0980,-0.8333,-0.1465,-0.0353,-0.8333,-0.1725,0.0325,-0.8333,-0.1725,0.0952,-0.8333,-0.1465,0.1215,-0.8333,-0.1249,0.1592,-0.8333,-0.0685,0.1468,-0.8560,0.0275,0.1468,-0.8560,-0.0314,0.1382,-0.8560,-0.0598,0.1054,-0.8560,-0.1088,0.0564,-0.8560,-0.1415,-0.0014,-0.8560,-0.1530,-0.0309,-0.8560,-0.1501,-0.0853,-0.8560,-0.1276,-0.1270,-0.8560,-0.0859,-0.1496,-0.8560,-0.0314,-0.1525,-0.8560,-0.0019,-0.1410,-0.8560,0.0559,-0.1082,-0.8560,0.1049,-0.0592,-0.8560,0.1376,-0.0309,-0.8560,0.1462,0.0281,-0.8560,0.1462,0.0825,-0.8560,0.1237,0.1242,-0.8560,0.0820,0.1382,-0.8560,0.0559,0.1691,-0.0574,0.0320,0.1432,-0.0574,0.0947,0.0952,-0.0574,0.1426,0.0651,-0.0574,0.1587,-0.0014,-0.0574,0.1720,-0.0680,-0.0574,0.1587,-0.1244,-0.0574,0.1210,-0.1460,-0.0574,0.0947,-0.1720,-0.0574,0.0320,-0.1720,-0.0574,-0.0359,-0.1460,-0.0574,-0.0986,-0.0980,-0.0574,-0.1465,-0.0680,-0.0574,-0.1626,-0.0014,-0.0574,-0.1758,0.0651,-0.0574,-0.1626,0.1215,-0.0574,-0.1249,0.1432,-0.0574,-0.0986,0.1691,-0.0574,-0.0359,0.1691,-0.8333,0.0320,0.1432,-0.8333,0.0947,0.1215,-0.8333,0.1210,0.0651,-0.8333,0.1587,-0.0014,-0.8333,0.1720,-0.0680,-0.8333,0.1587,-0.0980,-0.8333,0.1426,-0.1460,-0.8333,0.0947,-0.1720,-0.8333,0.0320,-0.1720,-0.8333,-0.0359,-0.1621,-0.8333,-0.0685,-0.1244,-0.8333,-0.1249,-0.0680,-0.8333,-0.1626,-0.0014,-0.8333,-0.1758,0.0325,-0.8333,-0.1725,0.0952,-0.8333,-0.1465,0.1432,-0.8333,-0.0986,0.1691,-0.8333,-0.0359,0.1468,-0.8560,0.0275,0.1468,-0.8560,-0.0314,0.1242,-0.8560,-0.0859,0.0825,-0.8560,-0.1276,0.0564,-0.8560,-0.1415,-0.0014,-0.8560,-0.1530,-0.0592,-0.8560,-0.1415,-0.1082,-0.8560,-0.1088,-0.1270,-0.8560,-0.0859,-0.1496,-0.8560,-0.0314,-0.1496,-0.8560,0.0275,-0.1270,-0.8560,0.0820,-0.0853,-0.8560,0.1237,-0.0592,-0.8560,0.1376,-0.0014,-0.8560,0.1491,0.0564,-0.8560,0.1376,0.1054,-0.8560,0.1049,0.1242,-0.8560,0.0820,0.1955,-0.0091,-0.0019,0.1805,-0.0091,0.0734,0.1378,-0.0091,0.1373,0.1080,-0.0091,0.1618,0.0370,-0.0091,0.1912,-0.0398,-0.0091,0.1912,-0.1108,-0.0091,0.1618,-0.1406,-0.0091,0.1373,-0.1833,-0.0091,0.0734,-0.1983,-0.0091,-0.0019,-0.1833,-0.0091,-0.0773,-0.1651,-0.0091,-0.1113,-0.1108,-0.0091,-0.1657,-0.0398,-0.0091,-0.1951,0.0370,-0.0091,-0.1951,0.0739,-0.0091,-0.1839,0.1378,-0.0091,-0.1412,0.1805,-0.0091,-0.0773,0.1755,0.0073,0.0332,0.1789,0.0073,-0.0019,0.1652,0.0073,-0.0710,0.1261,0.0073,-0.1295,0.0676,0.0073,-0.1686,0.0338,0.0073,-0.1788,-0.0366,0.0073,-0.1788,-0.1016,0.0073,-0.1519,-0.1514,0.0073,-0.1021,-0.1680,0.0073,-0.0710,-0.1818,0.0073,-0.0019,-0.1680,0.0073,0.0671,-0.1289,0.0073,0.1256,-0.0704,0.0073,0.1647,-0.0366,0.0073,0.1750,0.0338,0.0073,0.1750,0.0988,0.0073,0.1480,0.1486,0.0073,0.0983,0.1652,0.0073,0.0671,0.0978,0.0073,-0.0019,0.0902,0.0073,-0.0399,0.0687,0.0073,-0.0721,0.0537,0.0073,-0.0844,0.0179,0.0073,-0.0992,-0.0208,0.0073,-0.0992,-0.0565,0.0073,-0.0844,-0.0716,0.0073,-0.0721,-0.0931,0.0073,-0.0399,-0.1006,0.0073,-0.0019,-0.0931,0.0073,0.0360,-0.0839,0.0073,0.0532,-0.0565,0.0073,0.0805,-0.0208,0.0073,0.0953,0.0179,0.0073,0.0953,0.0365,0.0073,0.0897,0.0687,0.0073,0.0682,0.0902,0.0073,0.0360,0.0978,0.0643,-0.0019,0.0959,0.0643,-0.0213,0.0811,0.0643,-0.0571,0.0537,0.0643,-0.0844,0.0179,0.0643,-0.0992,-0.0014,0.0643,-0.1011,-0.0394,0.0643,-0.0936,-0.0716,0.0643,-0.0721,-0.0931,0.0643,-0.0399,-0.0987,0.0643,-0.0213,-0.0987,0.0643,0.0174,-0.0839,0.0643,0.0532,-0.0565,0.0643,0.0805,-0.0208,0.0643,0.0953,-0.0014,0.0643,0.0973,0.0365,0.0643,0.0897,0.0687,0.0643,0.0682,0.0902,0.0643,0.0360,0.0745,0.0643,0.0132,0.0745,0.0643,-0.0170,0.0629,0.0643,-0.0449,0.0416,0.0643,-0.0663,0.0282,0.0643,-0.0734,-0.0014,0.0643,-0.0793,-0.0310,0.0643,-0.0734,-0.0561,0.0643,-0.0567,-0.0657,0.0643,-0.0449,-0.0773,0.0643,-0.0170,-0.0773,0.0643,0.0132,-0.0657,0.0643,0.0410,-0.0561,0.0643,0.0528,-0.0310,0.0643,0.0695,-0.0014,0.0643,0.0754,0.0282,0.0643,0.0695,0.0416,0.0643,0.0624,0.0629,0.0643,0.0410,0.1742,-0.0179,-0.0019,0.1609,-0.0179,0.0653,0.1446,-0.0179,0.0956,0.0962,-0.0179,0.1441,0.0329,-0.0179,0.1703,-0.0357,-0.0179,0.1703,-0.0686,-0.0179,0.1603,-0.1256,-0.0179,0.1223,-0.1637,-0.0179,0.0653,-0.1771,-0.0179,-0.0019,-0.1737,-0.0179,-0.0362,-0.1475,-0.0179,-0.0995,-0.0990,-0.0179,-0.1480,-0.0357,-0.0179,-0.1742,0.0329,-0.0179,-0.1742,0.0658,-0.0179,-0.1642,0.1228,-0.0179,-0.1261,0.1609,-0.0179,-0.0692,0.1669,-0.0138,0.0315,0.1701,-0.0138,-0.0019,0.1571,-0.0138,-0.0676,0.1199,-0.0138,-0.1233,0.0642,-0.0138,-0.1604,0.0321,-0.0138,-0.1702,-0.0349,-0.0138,-0.1702,-0.0967,-0.0138,-0.1446,-0.1441,-0.0138,-0.0973,-0.1599,-0.0138,-0.0676,-0.1730,-0.0138,-0.0019,-0.1599,-0.0138,0.0637,-0.1227,-0.0138,0.1194,-0.0967,-0.0138,0.1407,-0.0349,-0.0138,0.1663,0.0321,-0.0138,0.1663,0.0939,-0.0138,0.1407,0.1199,-0.0138,0.1194,0.1571,-0.0138,0.0637,0.0765,-0.0138,-0.0019,0.0706,-0.0138,-0.0318,0.0634,-0.0138,-0.0452,0.0419,-0.0138,-0.0668,0.0138,-0.0138,-0.0784,-0.0166,-0.0138,-0.0784,-0.0312,-0.0138,-0.0740,-0.0565,-0.0138,-0.0571,-0.0734,-0.0138,-0.0318,-0.0794,-0.0138,-0.0019,-0.0779,-0.0138,0.0133,-0.0662,-0.0138,0.0414,-0.0447,-0.0138,0.0629,-0.0166,-0.0138,0.0745,0.0138,-0.0138,0.0745,0.0284,-0.0138,0.0701,0.0537,-0.0138,0.0532,0.0706,-0.0138,0.0279,0.0765,0.0431,-0.0019,0.0750,0.0431,-0.0172,0.0634,0.0431,-0.0452,0.0419,0.0431,-0.0668,0.0138,0.0431,-0.0784,-0.0014,0.0431,-0.0799,-0.0312,0.0431,-0.0740,-0.0565,0.0431,-0.0571,-0.0734,0.0431,-0.0318,-0.0779,0.0431,-0.0172,-0.0779,0.0431,0.0133,-0.0662,0.0431,0.0414,-0.0447,0.0431,0.0629,-0.0312,0.0431,0.0701,-0.0014,0.0431,0.0760,0.0284,0.0431,0.0701,0.0537,0.0431,0.0532,0.0634,0.0431,0.0414,0.0745,0.0431,0.0132,0.0745,0.0431,-0.0170,0.0629,0.0431,-0.0449,0.0533,0.0431,-0.0567,0.0282,0.0431,-0.0734,-0.0014,0.0431,-0.0793,-0.0310,0.0431,-0.0734,-0.0444,0.0431,-0.0663,-0.0657,0.0431,-0.0449,-0.0773,0.0431,-0.0170,-0.0773,0.0431,0.0132,-0.0729,0.0431,0.0277,-0.0561,0.0431,0.0528,-0.0310,0.0431,0.0695,-0.0014,0.0431,0.0754,0.0282,0.0431,0.0695,0.0416,0.0431,0.0624,0.0629,0.0431,0.0410,0.1955,-0.9713,-0.0019,0.1805,-0.9713,0.0734,0.1623,-0.9713,0.1074,0.1080,-0.9713,0.1618,0.0370,-0.9713,0.1912,-0.0398,-0.9713,0.1912,-0.0768,-0.9713,0.1800,-0.1406,-0.9713,0.1373,-0.1833,-0.9713,0.0734,-0.1983,-0.9713,-0.0019,-0.1945,-0.9713,-0.0404,-0.1651,-0.9713,-0.1113,-0.1108,-0.9713,-0.1657,-0.0398,-0.9713,-0.1951,-0.0014,-0.9713,-0.1988,0.0739,-0.9713,-0.1839,0.1378,-0.9713,-0.1412,0.1805,-0.9713,-0.0773,0.1917,-0.9713,-0.0404,0.1811,-0.9821,0.0344,0.1533,-0.9821,0.1014,0.1020,-0.9821,0.1528,0.0698,-0.9821,0.1699,-0.0014,-0.9821,0.1841,-0.0726,-0.9821,0.1699,-0.1330,-0.9821,0.1296,-0.1561,-0.9821,0.1014,-0.1839,-0.9821,0.0344,-0.1839,-0.9821,-0.0382,-0.1561,-0.9821,-0.1053,-0.1330,-0.9821,-0.1335,-0.0726,-0.9821,-0.1738,-0.0014,-0.9821,-0.1880,0.0698,-0.9821,-0.1738,0.1020,-0.9821,-0.1566,0.1533,-0.9821,-0.1053,0.1811,-0.9821,-0.0382,0.1709,-0.8359,0.0323,0.1446,-0.8359,0.0956,0.1228,-0.8359,0.1223,0.0658,-0.8359,0.1603,-0.0014,-0.8359,0.1737,-0.0686,-0.8359,0.1603,-0.0990,-0.8359,0.1441,-0.1475,-0.8359,0.0956,-0.1737,-0.8359,0.0323,-0.1737,-0.8359,-0.0362,-0.1637,-0.8359,-0.0692,-0.1256,-0.8359,-0.1261,-0.0686,-0.8359,-0.1642,-0.0014,-0.8359,-0.1776,0.0329,-0.8359,-0.1742,0.0962,-0.8359,-0.1480,0.1446,-0.8359,-0.0995,0.1709,-0.8359,-0.0362,0.1482,-0.8588,0.0278,0.1482,-0.8588,-0.0317,0.1255,-0.8588,-0.0867,0.0834,-0.8588,-0.1288,0.0570,-0.8588,-0.1429,-0.0014,-0.8588,-0.1545,-0.0598,-0.8588,-0.1429,-0.1093,-0.8588,-0.1098,-0.1283,-0.8588,-0.0867,-0.1511,-0.8588,-0.0317,-0.1511,-0.8588,0.0278,-0.1283,-0.8588,0.0828,-0.1093,-0.8588,0.1060,-0.0598,-0.8588,0.1390,-0.0014,-0.8588,0.1507,0.0570,-0.8588,0.1390,0.0834,-0.8588,0.1249,0.1255,-0.8588,0.0828,-0.0202,0.2397,0.0683,-0.0014,0.2288,0.0688,0.0174,0.2397,0.0683,0.0174,0.2615,0.0683,-0.0121,0.2320,0.0683,-0.0121,0.2692,0.0683,-0.0227,0.2506,0.0683,-0.0215,0.2389,0.0646,-0.0014,0.2273,0.0653,0.0188,0.2389,0.0638,0.0101,0.2307,0.0646,-0.0128,0.2307,0.0646,-0.0128,0.2705,0.0646,-0.0243,0.2506,0.0646,-0.0189,0.2404,0.0700,-0.0113,0.2333,0.0700,0.0086,0.2333,0.0700,0.0186,0.2506,0.0700,0.0086,0.2679,0.0700,-0.0014,0.2709,0.0702,-0.0189,0.2608,0.0700,-0.0063,0.2477,0.0707,-0.0014,0.2449,0.0707,0.0014,0.2457,0.0707,0.0043,0.2506,0.0707,0.0014,0.2555,0.0707,-0.0042,0.2555,0.0707,-0.0063,0.2535,0.0707,-0.0065,0.2476,0.0426,-0.0014,0.2447,0.0433,0.0037,0.2476,0.0426,0.0044,0.2506,0.0426,0.0015,0.2557,0.0426,-0.0043,0.2557,0.0426,0.0710,0.1462,-0.0129,0.0710,0.1462,0.0061,0.0566,0.1462,0.0409,0.0267,0.1462,0.0638,-0.0106,0.1462,0.0687,-0.0454,0.1462,0.0543,-0.0589,0.1462,0.0409,-0.0733,0.1462,0.0061,-0.0684,0.1462,-0.0313,-0.0454,0.1462,-0.0611,-0.0290,0.1462,-0.0706,0.0084,0.1462,-0.0756,0.0432,0.1462,-0.0611,0.0661,0.1462,-0.0313,0.0710,0.2889,-0.0129,0.0695,0.2941,0.0059,0.0647,0.2941,0.0239,0.0554,0.2941,0.0400,0.0566,0.2889,0.0409,0.0432,0.2889,0.0543,0.0267,0.2889,0.0638,0.0084,0.2889,0.0687,-0.0104,0.2941,0.0672,-0.0284,0.2941,0.0624,-0.0445,0.2941,0.0531,-0.0577,0.2941,0.0400,-0.0589,0.2889,0.0409,-0.0684,0.2889,0.0244,-0.0733,0.2889,0.0061,-0.0733,0.2889,-0.0129,-0.0670,0.2941,-0.0307,-0.0577,0.2941,-0.0468,-0.0445,0.2941,-0.0599,-0.0284,0.2941,-0.0692,-0.0290,0.2889,-0.0706,-0.0106,0.2889,-0.0756,0.0084,0.2889,-0.0756,0.0267,0.2889,-0.0706,0.0422,0.2941,-0.0599,0.0554,0.2941,-0.0468,0.0647,0.2941,-0.0307,0.0679,0.2965,0.0057,0.0632,0.2965,-0.0301,0.0541,0.2965,-0.0458,0.0255,0.2965,-0.0678,-0.0102,0.2965,-0.0725,-0.0435,0.2965,-0.0587,-0.0564,0.2965,-0.0458,-0.0702,0.2965,-0.0125,-0.0655,0.2965,0.0232,-0.0435,0.2965,0.0518,-0.0278,0.2965,0.0609,0.0080,0.2965,0.0656,0.0413,0.2965,0.0518,0.0632,0.2965,0.0232,0.0636,0.2988,0.0051,0.0592,0.2988,-0.0284,0.0386,0.2988,-0.0552,0.0074,0.2988,-0.0681,-0.0097,0.2988,-0.0681,-0.0409,0.2988,-0.0552,-0.0615,0.2988,-0.0284,-0.0659,0.2988,0.0051,-0.0615,0.2988,0.0216,-0.0409,0.2988,0.0484,-0.0097,0.2988,0.0613,0.0239,0.2988,0.0569,0.0386,0.2988,0.0484,0.0592,0.2988,0.0216,0.0663,0.1462,0.0055,0.0528,0.1462,0.0380,0.0402,0.1462,0.0505,0.0077,0.1462,0.0640,-0.0271,0.1462,0.0594,-0.0551,0.1462,0.0380,-0.0639,0.1462,0.0226,-0.0685,0.1462,-0.0123,-0.0551,0.1462,-0.0448,-0.0271,0.1462,-0.0662,0.0077,0.1462,-0.0708,0.0249,0.1462,-0.0662,0.0528,0.1462,-0.0448,0.0663,0.1740,-0.0123,0.0617,0.1740,0.0226,0.0528,0.1740,0.0380,0.0249,0.1740,0.0594,-0.0100,0.1740,0.0640,-0.0425,0.1740,0.0505,-0.0551,0.1740,0.0380,-0.0685,0.1740,0.0055,-0.0639,0.1740,-0.0294,-0.0425,0.1740,-0.0573,-0.0271,0.1740,-0.0662,0.0077,0.1740,-0.0708,0.0402,0.1740,-0.0573,0.0617,0.1740,-0.0294,0.0629,0.1760,-0.0118,0.0585,0.1760,0.0213,0.0382,0.1760,0.0478,0.0073,0.1760,0.0606,-0.0096,0.1760,0.0606,-0.0404,0.1760,0.0478,-0.0608,0.1760,0.0213,-0.0652,0.1760,-0.0118,-0.0608,0.1760,-0.0281,-0.0404,0.1760,-0.0546,-0.0096,0.1760,-0.0674,0.0236,0.1760,-0.0631,0.0382,0.1760,-0.0546,0.0585,0.1760,-0.0281,0.0629,0.1100,0.0050,0.0501,0.1100,0.0359,0.0382,0.1100,0.0478,0.0073,0.1100,0.0606,-0.0258,0.1100,0.0563,-0.0524,0.1100,0.0359,-0.0652,0.1100,0.0050,-0.0652,0.1100,-0.0118,-0.0524,0.1100,-0.0427,-0.0258,0.1100,-0.0631,0.0073,0.1100,-0.0674,0.0236,0.1100,-0.0631,0.0501,0.1100,-0.0427,0.1017,0.0100,-0.0169,0.0947,0.0100,0.0363,0.0812,0.0100,0.0598,0.0386,0.0100,0.0924,-0.0147,0.0100,0.0995,-0.0643,0.0100,0.0789,-0.0834,0.0100,0.0598,-0.1040,0.0100,0.0101,-0.0970,0.0100,-0.0431,-0.0643,0.0100,-0.0857,-0.0408,0.0100,-0.0993,0.0124,0.0100,-0.1063,0.0620,0.0100,-0.0857,0.0947,0.0100,-0.0431,0.0958,0.0100,-0.0162,0.0892,0.0100,0.0340,0.0584,0.0100,0.0741,0.0116,0.0100,0.0935,-0.0139,0.0100,0.0935,-0.0606,0.0100,0.0741,-0.0914,0.0100,0.0340,-0.0980,0.0100,-0.0162,-0.0914,0.0100,-0.0408,-0.0606,0.0100,-0.0809,-0.0139,0.0100,-0.1003,0.0363,0.0100,-0.0937,0.0584,0.0100,-0.0809,0.0892,0.0100,-0.0408,0.0958,0.0990,0.0094,0.0764,0.0990,0.0561,0.0363,0.0990,0.0869,0.0116,0.0990,0.0935,-0.0385,0.0990,0.0869,-0.0787,0.0990,0.0561,-0.0980,0.0990,0.0094,-0.0980,0.0990,-0.0162,-0.0787,0.0990,-0.0629,-0.0385,0.0990,-0.0937,0.0116,0.0990,-0.1003,0.0363,0.0990,-0.0937,0.0764,0.0990,-0.0629,0.0393,0.0994,-0.0087,0.0365,0.0994,0.0122,0.0312,0.0994,0.0214,0.0145,0.0994,0.0343,-0.0065,0.0994,0.0370,-0.0260,0.0994,0.0289,-0.0335,0.0994,0.0214,-0.0416,0.0994,0.0019,-0.0388,0.0994,-0.0190,-0.0260,0.0994,-0.0358,-0.0167,0.0994,-0.0411,0.0042,0.0994,-0.0438,0.0237,0.0994,-0.0358,0.0365,0.0994,-0.0190,0.0828,0.0990,-0.0519,0.0473,0.0990,-0.0873,-0.0011,0.0990,-0.1003,-0.0496,0.0990,-0.0873,-0.0697,0.0990,-0.0719,-0.0947,0.0990,-0.0285,-0.0947,0.0990,0.0217,-0.0697,0.0990,0.0651,-0.0496,0.0990,0.0805,-0.0011,0.0990,0.0935,0.0473,0.0990,0.0805,0.0828,0.0990,0.0450,0.0925,0.0990,-0.0285,0.0958,0.0990,-0.0034,0.0674,0.0100,-0.0719,0.0239,0.0100,-0.0970,-0.0262,0.0100,-0.0970,-0.0496,0.0100,-0.0873,-0.0851,0.0100,-0.0519,-0.0980,0.0100,-0.0034,-0.0851,0.0100,0.0450,-0.0697,0.0100,0.0651,-0.0262,0.0100,0.0902,0.0239,0.0100,0.0902,0.0674,0.0100,0.0651,0.0828,0.0100,0.0450,0.0925,0.0100,-0.0285,0.0879,0.0100,-0.0548,0.0503,0.0100,-0.0925,0.0255,0.0100,-0.1028,-0.0278,0.0100,-0.1028,-0.0739,0.0100,-0.0761,-0.1005,0.0100,-0.0300,-0.1040,0.0100,-0.0034,-0.0902,0.0100,0.0480,-0.0526,0.0100,0.0857,-0.0011,0.0100,0.0995,0.0255,0.0100,0.0960,0.0716,0.0100,0.0693,0.0982,0.0100,0.0232,0.1017,0.0100,-0.0034,0.0543,0.1100,-0.0354,0.0309,0.1100,-0.0588,-0.0011,0.1100,-0.0674,-0.0331,0.1100,-0.0588,-0.0464,0.1100,-0.0487,-0.0630,0.1100,-0.0200,-0.0630,0.1100,0.0132,-0.0464,0.1100,0.0419,-0.0331,0.1100,0.0520,-0.0011,0.1100,0.0606,0.0309,0.1100,0.0520,0.0543,0.1100,0.0286,0.0607,0.1100,-0.0200,0.0629,0.1100,-0.0034,0.0441,0.1760,-0.0487,0.0154,0.1760,-0.0652,-0.0177,0.1760,-0.0652,-0.0331,0.1760,-0.0588,-0.0566,0.1760,-0.0354,-0.0652,0.1760,-0.0034,-0.0566,0.1760,0.0286,-0.0464,0.1760,0.0419,-0.0177,0.1760,0.0584,0.0154,0.1760,0.0584,0.0441,0.1760,0.0419,0.0543,0.1760,0.0286,0.0607,0.1760,-0.0200,0.0572,0.1740,-0.0371,0.0326,0.1740,-0.0618,0.0163,0.1740,-0.0685,-0.0186,0.1740,-0.0685,-0.0488,0.1740,-0.0511,-0.0662,0.1740,-0.0208,-0.0685,0.1740,-0.0034,-0.0595,0.1740,0.0303,-0.0348,0.1740,0.0550,-0.0011,0.1740,0.0640,0.0163,0.1740,0.0617,0.0465,0.1740,0.0442,0.0640,0.1740,0.0140,0.0663,0.1740,-0.0034,0.0572,0.1462,-0.0371,0.0326,0.1462,-0.0618,-0.0011,0.1462,-0.0708,-0.0348,0.1462,-0.0618,-0.0488,0.1462,-0.0511,-0.0662,0.1462,-0.0208,-0.0662,0.1462,0.0140,-0.0488,0.1462,0.0442,-0.0186,0.1462,0.0617,-0.0011,0.1462,0.0640,0.0326,0.1462,0.0550,0.0572,0.1462,0.0303,0.0640,0.1462,-0.0208,0.0663,0.1462,-0.0034,0.0446,0.2988,0.0424,0.0156,0.2988,0.0591,-0.0179,0.2988,0.0591,-0.0335,0.2988,0.0527,-0.0572,0.2988,0.0290,-0.0659,0.2988,-0.0034,-0.0572,0.2988,-0.0358,-0.0469,0.2988,-0.0492,-0.0179,0.2988,-0.0659,0.0156,0.2988,-0.0659,0.0446,0.2988,-0.0492,0.0549,0.2988,-0.0358,0.0614,0.2988,0.0134,0.0587,0.2965,0.0311,0.0334,0.2965,0.0564,0.0167,0.2965,0.0633,-0.0190,0.2965,0.0633,-0.0500,0.2965,0.0454,-0.0678,0.2965,0.0145,-0.0702,0.2965,-0.0034,-0.0609,0.2965,-0.0379,-0.0357,0.2965,-0.0632,-0.0011,0.2965,-0.0725,0.0167,0.2965,-0.0701,0.0477,0.2965,-0.0522,0.0656,0.2965,-0.0213,0.0679,0.2965,-0.0034,0.0613,0.2889,-0.0395,0.0499,0.2889,-0.0544,0.0349,0.2889,-0.0659,0.0175,0.2889,-0.0731,-0.0011,0.2889,-0.0756,-0.0011,0.2941,-0.0740,-0.0194,0.2941,-0.0716,-0.0365,0.2941,-0.0646,-0.0511,0.2941,-0.0533,-0.0636,0.2889,-0.0395,-0.0708,0.2889,-0.0221,-0.0733,0.2889,-0.0034,-0.0708,0.2889,0.0153,-0.0694,0.2941,0.0149,-0.0623,0.2941,0.0319,-0.0511,0.2941,0.0465,-0.0365,0.2941,0.0578,-0.0198,0.2889,0.0663,-0.0011,0.2889,0.0687,0.0175,0.2889,0.0663,0.0349,0.2889,0.0591,0.0342,0.2941,0.0578,0.0488,0.2941,0.0465,0.0600,0.2941,0.0319,0.0671,0.2941,0.0149,0.0671,0.2941,-0.0217,0.0686,0.2889,-0.0221,0.0613,0.1462,-0.0395,0.0349,0.1462,-0.0659,0.0175,0.1462,-0.0731,-0.0198,0.1462,-0.0731,-0.0522,0.1462,-0.0544,-0.0708,0.1462,-0.0221,-0.0733,0.1462,-0.0034,-0.0636,0.1462,0.0327,-0.0372,0.1462,0.0591,-0.0011,0.1462,0.0687,0.0175,0.1462,0.0663,0.0499,0.1462,0.0476,0.0686,0.1462,0.0153,0.0710,0.1462,-0.0034,0.0710,0.1652,-0.0129,0.0710,0.1747,-0.0129,0.0710,0.1938,-0.0129,0.0710,0.2128,-0.0129,0.0710,0.2318,-0.0129,0.0710,0.2413,-0.0129,0.0710,0.2604,-0.0129,0.0710,0.2794,-0.0129,0.0267,0.1652,0.0638,0.0267,0.1747,0.0638,0.0267,0.1938,0.0638,0.0267,0.2128,0.0638,0.0267,0.2318,0.0638,0.0230,0.2411,0.0655,0.0228,0.2611,0.0652,0.0267,0.2794,0.0638,0.0661,0.1652,-0.0313,0.0661,0.1747,-0.0313,0.0661,0.1938,-0.0313,0.0661,0.2128,-0.0313,0.0661,0.2318,-0.0313,0.0661,0.2413,-0.0313,0.0661,0.2604,-0.0313,0.0661,0.2794,-0.0313,0.0710,0.2699,0.0061,0.0710,0.2604,0.0061,0.0710,0.2413,0.0061,0.0710,0.2223,0.0061,0.0710,0.2033,0.0061,0.0710,0.1938,0.0061,0.0710,0.1747,0.0061,0.0710,0.1557,0.0061,0.0661,0.2699,0.0244,0.0661,0.2604,0.0244,0.0661,0.2413,0.0244,0.0661,0.2223,0.0244,0.0661,0.2033,0.0244,0.0661,0.1842,0.0244,0.0661,0.1747,0.0244,0.0661,0.1557,0.0244,0.0566,0.2699,0.0409,0.0566,0.2509,0.0409,0.0566,0.2413,0.0409,0.0566,0.2223,0.0409,0.0566,0.2033,0.0409,0.0566,0.1842,0.0409,0.0566,0.1747,0.0409,0.0566,0.1557,0.0409,0.0432,0.2699,0.0543,0.0432,0.2509,0.0543,0.0432,0.2413,0.0543,0.0432,0.2223,0.0543,0.0432,0.2033,0.0543,0.0432,0.1842,0.0543,0.0432,0.1747,0.0543,0.0432,0.1557,0.0543,-0.0290,0.2699,0.0638,-0.0272,0.2506,0.0649,-0.0251,0.2407,0.0655,-0.0290,0.2223,0.0638,-0.0290,0.2033,0.0638,-0.0290,0.1842,0.0638,-0.0290,0.1747,0.0638,-0.0290,0.1557,0.0638,-0.0454,0.2699,0.0543,-0.0454,0.2509,0.0543,-0.0454,0.2413,0.0543,-0.0454,0.2223,0.0543,-0.0454,0.2033,0.0543,-0.0454,0.1842,0.0543,-0.0454,0.1747,0.0543,-0.0454,0.1557,0.0543,-0.0589,0.2699,0.0409,-0.0589,0.2509,0.0409,-0.0589,0.2318,0.0409,-0.0589,0.2223,0.0409,-0.0589,0.2033,0.0409,-0.0589,0.1842,0.0409,-0.0589,0.1652,0.0409,-0.0589,0.1557,0.0409,-0.0684,0.2699,0.0244,-0.0684,0.2509,0.0244,-0.0684,0.2318,0.0244,-0.0684,0.2223,0.0244,-0.0684,0.2033,0.0244,-0.0684,0.1842,0.0244,-0.0684,0.1652,0.0244,-0.0684,0.1557,0.0244,-0.0733,0.2699,0.0061,-0.0733,0.2509,0.0061,-0.0733,0.2318,0.0061,-0.0733,0.2223,0.0061,-0.0733,0.2033,0.0061,-0.0733,0.1842,0.0061,-0.0733,0.1652,0.0061,-0.0733,0.1557,0.0061,-0.0733,0.2699,-0.0129,-0.0733,0.2509,-0.0129,-0.0733,0.2318,-0.0129,-0.0733,0.2223,-0.0129,-0.0733,0.2033,-0.0129,-0.0733,0.1842,-0.0129,-0.0733,0.1652,-0.0129,-0.0733,0.1557,-0.0129,-0.0684,0.2699,-0.0313,-0.0684,0.2509,-0.0313,-0.0684,0.2318,-0.0313,-0.0684,0.2223,-0.0313,-0.0684,0.2033,-0.0313,-0.0684,0.1842,-0.0313,-0.0684,0.1652,-0.0313,-0.0589,0.2794,-0.0477,-0.0589,0.2699,-0.0477,-0.0589,0.2509,-0.0477,-0.0589,0.2318,-0.0477,-0.0589,0.2128,-0.0477,-0.0589,0.2033,-0.0477,-0.0589,0.1842,-0.0477,-0.0589,0.1652,-0.0477,-0.0454,0.2794,-0.0611,-0.0454,0.2699,-0.0611,-0.0454,0.2509,-0.0611,-0.0454,0.2318,-0.0611,-0.0454,0.2128,-0.0611,-0.0454,0.2033,-0.0611,-0.0454,0.1842,-0.0611,-0.0454,0.1652,-0.0611,-0.0290,0.2794,-0.0706,-0.0290,0.2699,-0.0706,-0.0290,0.2509,-0.0706,-0.0290,0.2318,-0.0706,-0.0290,0.2128,-0.0706,-0.0290,0.2033,-0.0706,-0.0290,0.1842,-0.0706,-0.0290,0.1652,-0.0706,-0.0106,0.2794,-0.0756,-0.0106,0.2699,-0.0756,-0.0106,0.2509,-0.0756,-0.0106,0.2318,-0.0756,-0.0106,0.2128,-0.0756,-0.0106,0.2033,-0.0756,-0.0106,0.1842,-0.0756,-0.0106,0.1652,-0.0756,0.0084,0.2794,-0.0756,0.0084,0.2699,-0.0756,0.0084,0.2509,-0.0756,0.0084,0.2318,-0.0756,0.0084,0.2128,-0.0756,0.0084,0.1938,-0.0756,0.0084,0.1842,-0.0756,0.0084,0.1652,-0.0756,0.0267,0.2794,-0.0706,0.0267,0.2604,-0.0706,0.0267,0.2509,-0.0706,0.0267,0.2318,-0.0706,0.0267,0.2128,-0.0706,0.0267,0.1938,-0.0706,0.0267,0.1842,-0.0706,0.0267,0.1652,-0.0706,0.0432,0.2794,-0.0611,0.0432,0.2604,-0.0611,0.0432,0.2509,-0.0611,0.0432,0.2318,-0.0611,0.0432,0.2128,-0.0611,0.0432,0.1938,-0.0611,0.0432,0.1842,-0.0611,0.0432,0.1652,-0.0611,0.0566,0.2794,-0.0477,0.0566,0.2604,-0.0477,0.0566,0.2509,-0.0477,0.0566,0.2318,-0.0477,0.0566,0.2128,-0.0477,0.0566,0.1938,-0.0477,0.0566,0.1842,-0.0477,0.0566,0.1652,-0.0477,-0.0106,0.1557,0.0687,-0.0106,0.1747,0.0687,-0.0106,0.1842,0.0687,-0.0106,0.2033,0.0687,-0.0109,0.2267,0.0687,0.0086,0.2750,0.0687,0.0091,0.2269,0.0687,0.0084,0.2033,0.0687,0.0084,0.1842,0.0687,0.0084,0.1652,0.0687,0.0084,0.1557,0.0687,0.0710,0.2699,-0.0034,0.0710,0.2509,-0.0034,0.0710,0.2318,-0.0034,0.0710,0.2128,-0.0034,0.0710,0.2033,-0.0034,0.0710,0.1842,-0.0034,0.0710,0.1652,-0.0034,0.0686,0.2794,0.0153,0.0686,0.2699,0.0153,0.0686,0.2509,0.0153,0.0686,0.2318,0.0153,0.0686,0.2128,0.0153,0.0686,0.2033,0.0153,0.0686,0.1842,0.0153,0.0686,0.1652,0.0153,0.0613,0.2794,0.0327,0.0613,0.2699,0.0327,0.0613,0.2509,0.0327,0.0613,0.2318,0.0327,0.0613,0.2128,0.0327,0.0613,0.2033,0.0327,0.0613,0.1842,0.0327,0.0613,0.1652,0.0327,0.0499,0.2794,0.0476,0.0499,0.2699,0.0476,0.0499,0.2509,0.0476,0.0499,0.2318,0.0476,0.0499,0.2128,0.0476,0.0499,0.2033,0.0476,0.0499,0.1842,0.0476,0.0499,0.1652,0.0476,0.0349,0.2794,0.0591,0.0349,0.2699,0.0591,0.0349,0.2509,0.0591,0.0349,0.2318,0.0591,0.0349,0.2128,0.0591,0.0349,0.2033,0.0591,0.0349,0.1842,0.0591,0.0349,0.1652,0.0591,-0.0372,0.2794,0.0591,-0.0372,0.2604,0.0591,-0.0372,0.2509,0.0591,-0.0372,0.2318,0.0591,-0.0372,0.2128,0.0591,-0.0372,0.1938,0.0591,-0.0372,0.1842,0.0591,-0.0372,0.1652,0.0591,-0.0522,0.2794,0.0476,-0.0522,0.2604,0.0476,-0.0522,0.2509,0.0476,-0.0522,0.2318,0.0476,-0.0522,0.2128,0.0476,-0.0522,0.1938,0.0476,-0.0522,0.1842,0.0476,-0.0522,0.1652,0.0476,-0.0636,0.2794,0.0327,-0.0636,0.2604,0.0327,-0.0636,0.2509,0.0327,-0.0636,0.2318,0.0327,-0.0636,0.2128,0.0327,-0.0636,0.1938,0.0327,-0.0636,0.1842,0.0327,-0.0636,0.1652,0.0327,-0.0708,0.2794,0.0153,-0.0708,0.2604,0.0153,-0.0708,0.2509,0.0153,-0.0708,0.2318,0.0153,-0.0708,0.2128,0.0153,-0.0708,0.1938,0.0153,-0.0708,0.1842,0.0153,-0.0708,0.1652,0.0153,-0.0733,0.2794,-0.0034,-0.0733,0.2604,-0.0034,-0.0733,0.2509,-0.0034,-0.0733,0.2318,-0.0034,-0.0733,0.2128,-0.0034,-0.0733,0.1938,-0.0034,-0.0733,0.1747,-0.0034,-0.0733,0.1652,-0.0034,-0.0708,0.2794,-0.0221,-0.0708,0.2604,-0.0221,-0.0708,0.2413,-0.0221,-0.0708,0.2318,-0.0221,-0.0708,0.2128,-0.0221,-0.0708,0.1938,-0.0221,-0.0708,0.1747,-0.0221,-0.0708,0.1652,-0.0221,-0.0636,0.2794,-0.0395,-0.0636,0.2604,-0.0395,-0.0636,0.2413,-0.0395,-0.0636,0.2318,-0.0395,-0.0636,0.2128,-0.0395,-0.0636,0.1938,-0.0395,-0.0636,0.1747,-0.0395,-0.0636,0.1652,-0.0395,-0.0522,0.2794,-0.0544,-0.0522,0.2604,-0.0544,-0.0522,0.2413,-0.0544,-0.0522,0.2318,-0.0544,-0.0522,0.2128,-0.0544,-0.0522,0.1938,-0.0544,-0.0522,0.1747,-0.0544,-0.0522,0.1652,-0.0544,-0.0372,0.2794,-0.0659,-0.0372,0.2604,-0.0659,-0.0372,0.2413,-0.0659,-0.0372,0.2318,-0.0659,-0.0372,0.2128,-0.0659,-0.0372,0.1938,-0.0659,-0.0372,0.1747,-0.0659,-0.0372,0.1652,-0.0659,-0.0198,0.2794,-0.0731,-0.0198,0.2604,-0.0731,-0.0198,0.2413,-0.0731,-0.0198,0.2223,-0.0731,-0.0198,0.2128,-0.0731,-0.0198,0.1938,-0.0731,-0.0198,0.1747,-0.0731,-0.0198,0.1557,-0.0731,-0.0011,0.2794,-0.0756,-0.0011,0.2604,-0.0756,-0.0011,0.2413,-0.0756,-0.0011,0.2223,-0.0756,-0.0011,0.2128,-0.0756,-0.0011,0.1938,-0.0756,-0.0011,0.1747,-0.0756,-0.0011,0.1557,-0.0756,0.0175,0.2794,-0.0731,0.0175,0.2604,-0.0731,0.0175,0.2413,-0.0731,0.0175,0.2223,-0.0731,0.0175,0.2128,-0.0731,0.0175,0.1938,-0.0731,0.0175,0.1747,-0.0731,0.0175,0.1557,-0.0731,0.0349,0.2794,-0.0659,0.0349,0.2604,-0.0659,0.0349,0.2413,-0.0659,0.0349,0.2223,-0.0659,0.0349,0.2128,-0.0659,0.0349,0.1938,-0.0659,0.0349,0.1747,-0.0659,0.0349,0.1557,-0.0659,0.0499,0.2794,-0.0544,0.0499,0.2604,-0.0544,0.0499,0.2413,-0.0544,0.0499,0.2223,-0.0544,0.0499,0.2128,-0.0544,0.0499,0.1938,-0.0544,0.0499,0.1747,-0.0544,0.0499,0.1557,-0.0544,0.0613,0.2699,-0.0395,0.0613,0.2604,-0.0395,0.0613,0.2413,-0.0395,0.0613,0.2223,-0.0395,0.0613,0.2033,-0.0395,0.0613,0.1938,-0.0395,0.0613,0.1747,-0.0395,0.0613,0.1557,-0.0395,0.0686,0.1652,-0.0221,0.0686,0.1747,-0.0221,0.0686,0.1938,-0.0221,0.0686,0.2128,-0.0221,0.0686,0.2318,-0.0221,0.0686,0.2413,-0.0221,0.0686,0.2604,-0.0221,0.0686,0.2794,-0.0221,-0.0011,0.1652,0.0687,-0.0011,0.1747,0.0687,-0.0011,0.1938,0.0687,-0.0011,0.2128,0.0687,-0.0014,0.2769,0.0687,-0.0198,0.1557,0.0663,-0.0198,0.1747,0.0663,-0.0198,0.1938,0.0663,-0.0198,0.2128,0.0663,-0.0198,0.2223,0.0663,-0.0197,0.2691,0.0665,0.0175,0.1557,0.0663,0.0175,0.1747,0.0663,0.0175,0.1842,0.0663,0.0175,0.2033,0.0663,0.0175,0.2223,0.0663,0.0171,0.2695,0.0665,0.0175,0.2794,0.0663,0.0244,0.2562,0.0647,-0.0266,0.2455,0.0649,0.0037,0.2764,0.0687,-0.0065,0.2764,0.0687,-0.0158,0.2724,0.0676,0.0204,0.2655,0.0657,0.0207,0.2366,0.0665,-0.0154,0.2291,0.0682,-0.0227,0.2362,0.0665,0.0349,0.2556,0.0591,0.0036,0.2889,0.0687,-0.0372,0.2556,0.0591,-0.0059,0.2128,0.0687,0.0102,0.2342,0.0652,0.0187,0.2471,0.0636,0.0155,0.2622,0.0640,0.0099,0.2677,0.0649,-0.0053,0.2706,0.0655,-0.0180,0.2619,0.0640,-0.0209,0.2467,0.0636,-0.0178,0.2395,0.0644,-0.0049,0.2310,0.0655,0.0245,0.2460,0.0622,-0.0267,0.2557,0.0620,-0.0266,0.2455,0.0622,0.0037,0.2764,0.0660,-0.0065,0.2764,0.0660,-0.0229,0.2651,0.0630,0.0204,0.2655,0.0630,0.0207,0.2366,0.0638,-0.0154,0.2291,0.0655,0.0249,0.2511,0.0622,-0.0009,0.2248,0.0660,-0.0194,0.2323,0.0649,0.0091,0.2269,0.0660,0.0086,0.2750,0.0660,0.0175,0.2326,0.0649,-0.0109,0.2267,0.0660,0.0230,0.2411,0.0628,-0.0253,0.2606,0.0625,-0.0049,0.2307,0.0187,0.0030,0.2308,0.0187,0.0158,0.2395,0.0176,0.0186,0.2547,0.0167,0.0099,0.2675,0.0182,0.0026,0.2704,0.0187,-0.0125,0.2672,0.0182,-0.0210,0.2543,0.0167,-0.0178,0.2392,0.0176,-0.0122,0.2337,0.0184,0.0832,0.1090,-0.0145,0.1017,0.1075,0.0101,0.0947,0.1075,0.0363,0.0663,0.1090,0.0484,0.0506,0.1090,0.0641,0.0314,0.1090,0.0752,0.0100,0.1090,0.0809,0.0124,0.1075,0.0995,-0.0147,0.1075,0.0995,-0.0408,0.1075,0.0924,-0.0643,0.1075,0.0789,-0.0686,0.1090,0.0484,-0.0797,0.1090,0.0291,-0.0854,0.1090,0.0077,-0.0854,0.1090,-0.0145,-0.1040,0.1075,-0.0169,-0.0970,0.1075,-0.0431,-0.0834,0.1075,-0.0666,-0.0643,0.1075,-0.0857,-0.0337,0.1090,-0.0820,-0.0122,0.1090,-0.0877,0.0100,0.1090,-0.0877,0.0314,0.1090,-0.0820,0.0386,0.1075,-0.0993,0.0620,0.1075,-0.0857,0.0812,0.1075,-0.0666,0.0774,0.1090,-0.0359,0.0879,0.1075,-0.0548,0.0585,0.1090,-0.0630,0.0410,0.1090,-0.0764,0.0207,0.1090,-0.0848,-0.0011,0.1090,-0.0877,-0.0011,0.1075,-0.1063,-0.0278,0.1075,-0.1028,-0.0526,0.1075,-0.0925,-0.0739,0.1075,-0.0761,-0.0741,0.1090,-0.0455,-0.0825,0.1090,-0.0252,-0.0854,0.1090,-0.0034,-0.0825,0.1090,0.0184,-0.1005,0.1075,0.0232,-0.0902,0.1075,0.0480,-0.0739,0.1075,0.0693,-0.0526,0.1075,0.0857,-0.0230,0.1090,0.0780,-0.0011,0.1090,0.0809,0.0207,0.1090,0.0780,0.0410,0.1090,0.0696,0.0503,0.1075,0.0857,0.0716,0.1075,0.0693,0.0879,0.1075,0.0480,0.0982,0.1075,0.0232,0.0982,0.1075,-0.0300,0.0831,0.1090,-0.0034,0.1017,0.0442,-0.0169,0.1017,0.0442,0.0101,0.1017,0.0319,0.0101,0.0947,0.0319,0.0363,0.0812,0.0319,0.0598,0.0620,0.0319,0.0789,0.0386,0.0442,0.0924,0.0124,0.0442,0.0995,-0.0147,0.0442,0.0995,-0.0408,0.0442,0.0924,-0.0408,0.0319,0.0924,-0.0643,0.0319,0.0789,-0.0834,0.0319,0.0598,-0.0970,0.0319,0.0363,-0.1040,0.0319,0.0101,-0.1040,0.0442,-0.0169,-0.0970,0.0442,-0.0431,-0.0834,0.0442,-0.0666,-0.0643,0.0442,-0.0857,-0.0643,0.0319,-0.0857,-0.0408,0.0319,-0.0993,-0.0147,0.0319,-0.1063,0.0124,0.0319,-0.1063,0.0386,0.0442,-0.0993,0.0620,0.0442,-0.0857,0.0812,0.0442,-0.0666,0.0947,0.0442,-0.0431,0.0947,0.0319,-0.0431,0.0879,0.0319,-0.0548,0.0716,0.0319,-0.0761,0.0503,0.0319,-0.0925,0.0255,0.0442,-0.1028,-0.0011,0.0442,-0.1063,-0.0278,0.0442,-0.1028,-0.0526,0.0442,-0.0925,-0.0526,0.0319,-0.0925,-0.0739,0.0319,-0.0761,-0.0902,0.0319,-0.0548,-0.1005,0.0319,-0.0300,-0.1040,0.0442,-0.0034,-0.1005,0.0442,0.0232,-0.0902,0.0442,0.0480,-0.0739,0.0442,0.0693,-0.0739,0.0319,0.0693,-0.0526,0.0319,0.0857,-0.0278,0.0319,0.0960,-0.0011,0.0319,0.0995,0.0255,0.0442,0.0960,0.0503,0.0442,0.0857,0.0716,0.0442,0.0693,0.0879,0.0442,0.0480,0.0982,0.0442,0.0232,0.0982,0.0319,0.0232,0.0982,0.0319,-0.0300,0.1017,0.0319,-0.0034,0.1062,0.0345,-0.0175,0.1062,0.0416,0.0107,0.0989,0.0416,0.0380,0.0847,0.0416,0.0625,0.0647,0.0416,0.0825,0.0647,0.0345,0.0825,0.0403,0.0345,0.0966,0.0130,0.0345,0.1039,-0.0153,0.0345,0.1039,-0.0426,0.0416,0.0966,-0.0670,0.0416,0.0825,-0.0870,0.0416,0.0625,-0.1011,0.0416,0.0380,-0.1011,0.0345,0.0380,-0.1084,0.0345,0.0107,-0.1084,0.0345,-0.0175,-0.1011,0.0345,-0.0448,-0.0870,0.0416,-0.0693,-0.0670,0.0416,-0.0893,-0.0426,0.0416,-0.1034,-0.0153,0.0416,-0.1107,-0.0153,0.0345,-0.1107,0.0130,0.0345,-0.1107,0.0403,0.0345,-0.1034,0.0647,0.0345,-0.0893,0.0847,0.0416,-0.0693,0.0989,0.0416,-0.0448,0.0918,0.0416,-0.0571,0.0747,0.0416,-0.0793,0.0747,0.0345,-0.0793,0.0525,0.0345,-0.0963,0.0266,0.0345,-0.1071,-0.0011,0.0345,-0.1107,-0.0289,0.0345,-0.1071,-0.0548,0.0416,-0.0963,-0.0770,0.0416,-0.0793,-0.0941,0.0416,-0.0571,-0.1048,0.0416,-0.0312,-0.1048,0.0345,-0.0312,-0.1084,0.0345,-0.0034,-0.1048,0.0345,0.0244,-0.0941,0.0345,0.0502,-0.0770,0.0416,0.0725,-0.0548,0.0416,0.0895,-0.0289,0.0416,0.1002,-0.0011,0.0416,0.1039,-0.0011,0.0345,0.1039,0.0266,0.0345,0.1002,0.0525,0.0345,0.0895,0.0747,0.0345,0.0725,0.0918,0.0416,0.0502,0.1025,0.0416,0.0244,0.1025,0.0416,-0.0312,0.1062,0.0416,-0.0034,0.1062,0.0345,-0.0034,0.0357,0.0346,-0.0236,0.0407,0.0346,-0.0031,0.0348,0.0346,0.0171,0.0281,0.0346,0.0254,0.0096,0.0346,0.0356,-0.0115,0.0346,0.0351,-0.0295,0.0346,0.0242,-0.0358,0.0346,0.0156,-0.0408,0.0346,-0.0049,-0.0349,0.0346,-0.0252,-0.0197,0.0346,-0.0398,-0.0097,0.0346,-0.0436,0.0114,0.0346,-0.0432,0.0294,0.1032,-0.0322,0.0396,0.1032,-0.0137,0.0391,0.1032,0.0074,0.0348,0.1032,0.0171,0.0196,0.1032,0.0317,-0.0010,0.1032,0.0367,-0.0212,0.1032,0.0308,-0.0295,0.1032,0.0242,-0.0397,0.1032,0.0057,-0.0392,0.1032,-0.0154,-0.0282,0.1032,-0.0335,-0.0197,0.1032,-0.0398,0.0008,0.1032,-0.0448,0.0211,0.1032,-0.0389,0.0116,0.0240,-0.0397,0.0203,0.0240,-0.0356,0.0331,0.0240,-0.0216,0.0371,0.0240,-0.0030,0.0313,0.0240,0.0151,0.0251,0.0240,0.0224,0.0082,0.0240,0.0311,-0.0108,0.0240,0.0302,-0.0268,0.0240,0.0199,-0.0322,0.0240,0.0120,-0.0362,0.0240,-0.0066,-0.0304,0.0240,-0.0247,-0.0164,0.0240,-0.0374,-0.0073,0.0240,-0.0407,0.0116,-0.0095,-0.0397,0.0276,-0.0095,-0.0294,0.0363,-0.0095,-0.0125,0.0371,-0.0095,-0.0030,0.0313,-0.0095,0.0151,0.0172,-0.0095,0.0279,-0.0014,-0.0095,0.0319,-0.0108,-0.0095,0.0302,-0.0268,-0.0095,0.0199,-0.0355,-0.0095,0.0030,-0.0345,-0.0095,-0.0160,-0.0242,-0.0095,-0.0320,-0.0164,-0.0095,-0.0374,0.0030,-0.0385,-0.0153,0.0084,-0.0390,-0.0136,0.0121,-0.0394,-0.0094,0.0131,-0.0395,-0.0067,0.0128,-0.0396,-0.0011,0.0097,-0.0394,0.0037,0.0047,-0.0390,0.0063,0.0019,-0.0388,0.0065,-0.0035,-0.0383,0.0048,-0.0073,-0.0380,0.0006,-0.0085,-0.0378,-0.0049,-0.0079,-0.0378,-0.0078,-0.0049,-0.0380,-0.0125,0.0001,-0.0383,-0.0151,0.0721,-0.8441,-0.0022,0.0746,-0.8437,-0.0010,0.0783,-0.8431,0.0032,0.0794,-0.8427,0.0087,0.0777,-0.8428,0.0141,0.0759,-0.8431,0.0163,0.0710,-0.8437,0.0189,0.0655,-0.8445,0.0186,0.0608,-0.8453,0.0156,0.0593,-0.8456,0.0133,0.0581,-0.8459,0.0077,0.0598,-0.8458,0.0024,0.0639,-0.8453,-0.0015,0.0666,-0.8449,-0.0024,0.0003,-0.5060,-0.0152,0.0358,-0.7327,-0.0088,0.0031,-0.5059,-0.0147,0.0155,-0.6195,-0.0125,0.0038,-0.3921,-0.0138,0.0181,-0.6194,-0.0112,0.0060,-0.3921,-0.0120,0.0203,-0.6192,-0.0094,0.0433,-0.7318,-0.0052,0.0095,-0.5057,-0.0093,0.0449,-0.7316,-0.0029,0.0104,-0.5057,-0.0066,0.0228,-0.6190,-0.0044,0.0088,-0.3922,-0.0041,0.0231,-0.6189,-0.0015,0.0083,-0.3922,-0.0013,0.0101,-0.5057,-0.0010,0.0455,-0.7314,0.0055,0.0089,-0.5057,0.0016,0.0443,-0.7315,0.0080,0.0052,-0.3921,0.0034,0.0195,-0.6190,0.0060,0.0029,-0.3921,0.0051,0.0172,-0.6192,0.0077,0.0402,-0.7318,0.0118,0.0020,-0.5059,0.0064,0.0375,-0.7321,0.0128,-0.0008,-0.5059,0.0066,0.0117,-0.6195,0.0089,-0.0055,-0.3920,0.0058,0.0089,-0.6197,0.0084,-0.0081,-0.3920,0.0045,-0.0062,-0.5061,0.0049,0.0294,-0.7330,0.0113,-0.0084,-0.5062,0.0030,0.0272,-0.7333,0.0095,-0.0119,-0.3919,0.0003,0.0025,-0.6202,0.0030,-0.0128,-0.3919,-0.0023,0.0016,-0.6203,0.0003,0.0247,-0.7336,0.0045,-0.0112,-0.5063,-0.0049,0.0245,-0.7337,0.0016,-0.0107,-0.5063,-0.0077,0.0250,-0.7337,-0.0012,-0.0113,-0.3919,-0.0106,0.0031,-0.6203,-0.0080,-0.0095,-0.3919,-0.0128,0.0049,-0.6202,-0.0101,0.0280,-0.7335,-0.0059,-0.0053,-0.5062,-0.0140,0.0303,-0.7333,-0.0076,-0.0026,-0.5061,-0.0150,0.0099,-0.6199,-0.0127,-0.0001,-0.0498,-0.0145,-0.0051,-0.0496,-0.0120,-0.0081,-0.0495,-0.0072,-0.0087,-0.0495,-0.0044,-0.0075,-0.0496,0.0011,-0.0037,-0.0498,0.0053,0.0017,-0.0500,0.0071,0.0045,-0.0500,0.0068,0.0096,-0.0502,0.0042,0.0126,-0.0503,-0.0005,0.0129,-0.0502,-0.0062,0.0120,-0.0502,-0.0089,0.0082,-0.0500,-0.0131,0.0028,-0.0499,-0.0148,-0.0049,-0.1708,-0.0140,-0.0073,-0.1708,-0.0124,-0.0103,-0.1708,-0.0076,-0.0106,-0.1708,-0.0019,-0.0080,-0.1708,0.0031,-0.0059,-0.1709,0.0049,-0.0005,-0.1710,0.0067,0.0050,-0.1712,0.0055,0.0092,-0.1712,0.0017,0.0105,-0.1713,-0.0009,0.0107,-0.1712,-0.0066,0.0082,-0.1712,-0.0116,0.0034,-0.1710,-0.0147],
    [-0.0257,0.5228,0.6608,-0.0847,0.6075,0.5886,-0.1542,0.5936,0.5886,-0.2761,0.5837,0.5575,-0.3499,0.4629,0.6173,-0.3679,0.4059,0.6428,-0.4265,0.3036,0.6608,-0.5666,0.2347,0.5886,-0.6300,0.1426,0.5575,-0.6366,0.1093,0.5575,-0.5454,-0.0524,0.6428,-0.5341,-0.1223,0.6428,-0.4836,-0.2003,0.6608,-0.4726,-0.2771,0.6428,-0.4733,-0.3901,0.5886,-0.4107,-0.4984,0.5575,-0.2571,-0.4838,0.6428,-0.1845,-0.5158,0.6428,-0.0751,-0.5427,0.6428,0.0000,-0.5803,0.6173,0.0847,-0.6075,0.5886,0.1542,-0.5936,0.5886,0.2761,-0.5837,0.5575,0.3499,-0.4629,0.6173,0.3679,-0.4059,0.6428,0.4265,-0.3036,0.6608,0.5666,-0.2347,0.5886,0.6251,-0.1621,0.5575,0.6047,-0.1034,0.5886,0.5777,0.0556,0.6173,0.5103,0.1173,0.6608,0.5061,0.2096,0.6428,0.5005,0.2938,0.6173,0.4733,0.3901,0.5886,0.4107,0.4984,0.5575,0.2571,0.4838,0.6428,0.1845,0.5158,0.6428,0.0751,0.5427,0.6428,0.0269,0.5471,0.6428,-0.0940,0.6701,0.5248,-0.2698,0.6515,0.4917,-0.3614,0.5722,0.5248,-0.4785,0.4785,0.5248,-0.5722,0.3614,0.5248,-0.6371,0.2280,0.5248,-0.6983,0.0982,0.4917,-0.7020,-0.0678,0.4917,-0.6472,-0.1977,0.5248,-0.6764,-0.3199,0.4353,-0.6119,-0.4308,0.4353,-0.4757,-0.5775,0.4353,-0.3709,-0.6292,0.4594,-0.1869,-0.7245,0.4353,-0.0720,-0.7448,0.4353,0.1281,-0.7374,0.4353,0.2521,-0.7045,0.4353,0.3709,-0.6292,0.4594,0.5165,-0.5165,0.4594,0.5632,-0.4243,0.4917,0.6515,-0.2698,0.4917,0.6602,-0.1490,0.5248,0.6767,-0.0000,0.5248,0.6602,0.1490,0.5248,0.6117,0.2893,0.5248,0.5632,0.4243,0.4917,0.4484,0.5443,0.4917,0.3313,0.6226,0.4917,0.1977,0.6472,0.5248,0.1248,0.7198,0.4594,0.0000,0.8255,0.3006,-0.1717,0.7673,0.3756,-0.2949,0.7120,0.4014,-0.3995,0.6769,0.3756,-0.5666,0.6252,0.2594,-0.6374,0.5248,0.3006,-0.6803,0.3621,0.4014,-0.7589,0.2716,0.3398,-0.7631,0.1078,0.4014,-0.8051,0.0396,0.3398,-0.8174,-0.1159,0.3006,-0.7995,-0.2057,0.3006,-0.7627,-0.3608,0.2594,-0.6443,-0.4844,0.3398,-0.5824,-0.5279,0.3756,-0.4436,-0.6305,0.4014,-0.3159,-0.7627,0.3006,-0.1837,-0.8238,0.2594,-0.1456,-0.8314,0.2594,0.0757,-0.7824,0.3756,0.1717,-0.7673,0.3756,0.2949,-0.7120,0.4014,0.3995,-0.6769,0.3756,0.5666,-0.6252,0.2594,0.6514,-0.5363,0.2594,0.6939,-0.3694,0.3756,0.7401,-0.2648,0.3756,0.7783,-0.1101,0.3756,0.8061,-0.0000,0.3398,0.8174,0.1159,0.3006,0.7995,0.2057,0.3006,0.7627,0.3608,0.2594,0.6443,0.4844,0.3398,0.5824,0.5279,0.3756,0.4436,0.6305,0.4014,0.3159,0.7627,0.3006,0.1837,0.8238,0.2594,0.1422,0.8135,0.3006,-0.0438,0.8907,0.1070,-0.1936,0.8709,0.1070,-0.4193,0.7872,0.1070,-0.5312,0.7073,0.1362,-0.7131,0.5355,0.1070,-0.7808,0.4158,0.1362,-0.8638,0.1921,0.1362,-0.8919,-0.0000,0.1070,-0.8607,-0.1510,0.1758,-0.8329,-0.2980,0.1362,-0.7402,-0.4375,0.2174,-0.6473,-0.5867,0.1758,-0.4940,-0.7041,0.2174,-0.3291,-0.7944,0.2174,-0.1485,-0.8472,0.2174,0.0422,-0.8588,0.2174,0.2174,-0.8461,0.1758,0.4107,-0.7711,0.1758,0.5465,-0.6639,0.2174,0.6608,-0.5989,0.1070,0.7527,-0.4789,0.1070,0.8531,-0.2602,0.1070,0.8758,-0.1245,0.1362,0.8830,0.1256,0.1070,0.8462,0.2581,0.1362,0.7527,0.4789,0.1070,0.6608,0.5989,0.1070,0.5312,0.7073,0.1362,0.3385,0.8172,0.1362,0.2174,0.8461,0.1758,-0.0441,0.8987,0.0672,-0.1575,0.8956,-0.0034,-0.2664,0.8736,-0.0922,-0.3900,0.8246,-0.0471,-0.5777,0.7019,-0.0034,-0.6667,0.6042,0.0672,-0.7230,0.5428,0.0374,-0.8246,0.3900,-0.0471,-0.8918,0.1980,-0.0922,-0.8997,0.1583,-0.0922,-0.8999,-0.0873,0.0374,-0.8757,-0.2248,0.0374,-0.8312,-0.3443,0.0672,-0.7630,-0.4856,0.0374,-0.6767,-0.6133,-0.0922,-0.5797,-0.7043,-0.0471,-0.4230,-0.7942,0.0672,-0.3062,-0.8559,-0.0034,-0.1558,-0.8865,0.0672,-0.0446,-0.9079,-0.0034,0.1575,-0.8956,-0.0034,0.2268,-0.8835,-0.0471,0.3905,-0.8255,-0.0922,0.5458,-0.7270,-0.0034,0.6072,-0.6699,0.0374,0.7195,-0.5403,0.0672,0.8427,-0.3491,-0.0471,0.8918,-0.1980,-0.0922,0.8997,-0.1583,-0.0922,0.8999,0.0873,0.0374,0.8757,0.2248,0.0374,0.8312,0.3443,0.0672,0.7630,0.4856,0.0374,0.6767,0.6133,-0.0922,0.5797,0.7043,-0.0471,0.4250,0.7980,0.0374,0.3046,0.8513,0.0374,0.1268,0.8907,0.0672,0.0444,0.9030,0.0374,-0.1581,0.8987,-0.1373,-0.3062,0.8559,-0.1809,-0.5237,0.7473,-0.1373,-0.6125,0.6758,-0.1373,-0.7671,0.4883,-0.1809,-0.8559,0.3062,-0.1809,-0.9048,0.0878,-0.1809,-0.9079,-0.0881,-0.1373,-0.8829,-0.1962,-0.2217,-0.8133,-0.3847,-0.2515,-0.7370,-0.5166,-0.2515,-0.5719,-0.6947,-0.2515,-0.4603,-0.7782,-0.2217,-0.2238,-0.8715,-0.2515,-0.0873,-0.8999,-0.2217,0.1566,-0.8907,-0.2217,0.3443,-0.8312,-0.2515,0.4883,-0.7671,-0.1809,0.6072,-0.6699,-0.2217,0.7473,-0.5237,-0.1373,0.8217,-0.3887,-0.1809,0.8987,-0.1581,-0.1373,0.9121,-0.0000,-0.1373,0.8835,0.2268,-0.1373,0.8246,0.3900,-0.1373,0.7270,0.5458,-0.1809,0.5777,0.7019,-0.1809,0.4288,0.8051,-0.1373,0.3031,0.8471,-0.2515,0.1558,0.8865,-0.2515,0.0000,0.8437,-0.4438,-0.1899,0.8530,-0.3602,-0.3004,0.8397,-0.2914,-0.4789,0.7527,-0.2914,-0.5966,0.5966,-0.4438,-0.6639,0.5465,-0.4017,-0.7872,0.4193,-0.2914,-0.8225,0.2943,-0.3602,-0.8787,0.1544,-0.2914,-0.8725,0.0429,-0.3602,-0.8607,-0.1510,-0.3602,-0.8071,-0.2462,-0.4438,-0.7773,-0.3676,-0.4017,-0.6745,-0.5553,-0.3602,-0.5989,-0.6608,-0.2914,-0.5312,-0.7073,-0.3205,-0.3676,-0.7773,-0.4017,-0.1837,-0.8238,-0.4438,-0.1485,-0.8472,-0.4017,0.0854,-0.8805,-0.3205,0.2201,-0.8568,-0.3205,0.3413,-0.8240,-0.2914,0.4750,-0.7467,-0.3205,0.5666,-0.6252,-0.4438,0.6639,-0.5465,-0.4017,0.7872,-0.4193,-0.2914,0.8225,-0.2943,-0.3602,0.8787,-0.1544,-0.2914,0.8725,-0.0428,-0.3602,0.8607,0.1510,-0.3602,0.8071,0.2462,-0.4438,0.7627,0.3608,-0.4438,0.6985,0.5247,-0.3602,0.6554,0.5940,-0.3205,0.5355,0.7131,-0.2914,0.3291,0.7944,-0.4017,0.2101,0.8171,-0.4438,0.1485,0.8472,-0.4017,-0.0386,0.7851,-0.5599,-0.1685,0.7522,-0.5857,-0.3694,0.6939,-0.5599,-0.4900,0.5949,-0.5857,-0.6158,0.4634,-0.5857,-0.6966,0.3295,-0.5857,-0.7673,0.1717,-0.5599,-0.7706,-0.0000,-0.5857,-0.7943,-0.1387,-0.5241,-0.7401,-0.2648,-0.5599,-0.6971,-0.4427,-0.4850,-0.5973,-0.5413,-0.5241,-0.4427,-0.6971,-0.4850,-0.3529,-0.7463,-0.4850,-0.1387,-0.7943,-0.5241,0.0396,-0.8051,-0.5241,0.2353,-0.7711,-0.5241,0.3880,-0.7288,-0.4850,0.4725,-0.6282,-0.5599,0.5824,-0.5279,-0.5599,0.6640,-0.4212,-0.5599,0.7371,-0.2250,-0.5857,0.7631,-0.1078,-0.5857,0.7783,0.1101,-0.5599,0.7519,0.2295,-0.5599,0.6511,0.4127,-0.5857,0.5449,0.5449,-0.5857,0.4636,0.6597,-0.5241,0.3361,0.7106,-0.5599,0.1799,0.8060,-0.4850,0.0000,0.7482,-0.6196,-0.0982,0.6983,-0.6761,-0.1977,0.6472,-0.7092,-0.2893,0.6117,-0.7092,-0.4484,0.5443,-0.6761,-0.5543,0.5024,-0.6196,-0.5835,0.4393,-0.6437,-0.6117,0.2893,-0.7092,-0.6300,0.1426,-0.7418,-0.6366,0.1093,-0.7418,-0.7448,-0.0720,-0.6196,-0.6881,-0.1549,-0.6761,-0.7045,-0.2521,-0.6196,-0.6322,-0.4005,-0.6196,-0.4566,-0.4566,-0.7418,-0.4073,-0.5403,-0.7092,-0.3516,-0.6605,-0.6196,-0.2375,-0.6639,-0.6761,-0.1281,-0.7374,-0.6196,-0.0346,-0.7043,-0.6761,0.1202,-0.6950,-0.6761,0.1887,-0.6176,-0.7418,0.2893,-0.6117,-0.7092,0.4484,-0.5443,-0.6761,0.5543,-0.5024,-0.6196,0.5835,-0.4393,-0.6437,0.6117,-0.2893,-0.7092,0.6300,-0.1426,-0.7418,0.6366,-0.1093,-0.7418,0.7271,0.0703,-0.6437,0.7072,0.1826,-0.6437,0.6912,0.2863,-0.6196,0.6173,0.3908,-0.6437,0.4785,0.4337,-0.7418,0.4304,0.5223,-0.7092,0.3516,0.6605,-0.6196,0.2375,0.6639,-0.6761,0.1281,0.7374,-0.6196,0.0000,0.6133,-0.7729,-0.0847,0.6075,-0.7729,-0.2347,0.5666,-0.7729,-0.3696,0.4894,-0.7729,-0.4119,0.4544,-0.7729,-0.4917,0.3091,-0.8020,-0.5467,0.1956,-0.8020,-0.5781,0.0556,-0.8020,-0.6105,-0.0588,-0.7729,-0.5080,-0.1327,-0.8486,-0.4638,-0.2464,-0.8486,-0.4237,-0.3495,-0.8287,-0.3688,-0.4069,-0.8287,-0.2919,-0.4653,-0.8287,-0.1327,-0.5080,-0.8486,-0.0257,-0.5244,-0.8486,0.0916,-0.5416,-0.8287,0.2009,-0.4851,-0.8486,0.3091,-0.4917,-0.8020,0.3688,-0.4069,-0.8287,0.5006,-0.3545,-0.7729,0.5249,-0.2483,-0.8020,0.6047,-0.1034,-0.7729,0.6125,-0.0301,-0.7729,0.5662,0.1291,-0.8020,0.5249,0.2483,-0.8020,0.4481,0.3694,-0.8020,0.3901,0.4733,-0.7729,0.2654,0.4531,-0.8486,0.1537,0.5021,-0.8486,0.0525,0.5467,-0.8287,-0.0806,0.4827,0.6835,0.0000,0.3485,0.7638,-0.1184,0.3309,0.7628,-0.2592,0.4151,0.6835,-0.2957,0.3898,0.6835,-0.2564,0.2564,0.7566,-0.3468,0.2490,0.7202,-0.4086,0.2169,0.6993,-0.2995,0.1839,0.7628,-0.3332,0.1025,0.7638,-0.4213,0.0692,0.7202,-0.3485,0.0462,0.7628,-0.3610,-0.0342,0.7566,-0.4520,-0.1872,0.6835,-0.3390,-0.0811,0.7638,-0.3088,-0.1899,0.7566,-0.3019,-0.3019,0.7202,-0.3114,-0.3774,0.6835,-0.2435,-0.2686,0.7566,-0.1631,-0.3080,0.7638,-0.1438,-0.4020,0.7202,-0.0757,-0.4564,0.6993,-0.0342,-0.3610,0.7566,0.0757,-0.4564,0.6993,0.1176,-0.4474,0.6993,0.1345,-0.3247,0.7628,0.2252,-0.3628,0.7202,0.2945,-0.3568,0.6993,0.2064,-0.2845,0.7628,0.2686,-0.2222,0.7638,0.3628,-0.2252,0.7202,0.3042,-0.1761,0.7628,0.3466,-0.1065,0.7566,0.4626,-0.0000,0.6993,0.4887,0.0240,0.6835,0.3471,0.0553,0.7628,0.4020,0.1438,0.7202,0.4086,0.2169,0.6993,0.3177,0.1503,0.7628,0.2686,0.2222,0.7638,0.2867,0.3163,0.7202,0.2447,0.3927,0.6993,0.1697,0.3204,0.7566,0.1047,0.4506,0.6993,0.0626,0.4584,0.6993,0.0459,0.3455,0.7638,-0.2686,0.4154,0.6674,-0.4920,-0.0910,0.6625,-0.2879,-0.4174,0.6592,0.0987,-0.4961,0.6588,0.4159,-0.2779,0.6625,0.4957,0.1062,0.6592,0.2754,0.4257,0.6592,-0.1530,0.7345,0.4120,-0.6252,0.4088,0.4187,-0.7322,-0.1457,0.4176,-0.4212,-0.6169,0.4187,0.4113,-0.6276,0.4120,0.7392,-0.1546,0.4063,0.6269,0.4189,0.4064,0.1464,0.7359,0.4120,-0.4993,0.7338,0.0778,-0.8694,0.1661,0.0849,-0.7314,-0.4976,0.0923,-0.1724,-0.8669,0.0914,0.4910,-0.7349,0.0914,0.8662,-0.1799,0.0923,0.4973,0.7322,0.0849,-0.1653,0.8691,-0.2766,-0.7349,0.4910,-0.2758,-0.8681,-0.1727,-0.2692,-0.4853,-0.7397,-0.2766,0.1792,-0.8668,-0.2692,0.7421,-0.4869,-0.2621,0.8694,0.1729,-0.2626,0.4993,0.7338,-0.2621,-0.4113,0.6276,-0.5963,-0.7312,0.1530,-0.6030,-0.6208,-0.4148,-0.6019,-0.1457,-0.7322,-0.6019,0.4168,-0.6239,-0.5963,0.7341,-0.1384,-0.6030,0.6201,0.4224,-0.5963,0.1400,0.7421,-0.5906,-0.1117,0.5618,0.6081,-0.1254,0.4793,0.6674,-0.3364,0.5034,0.5797,-0.3223,0.3907,0.6601,-0.3671,0.3327,0.6674,-0.4339,0.2820,0.6523,-0.4843,0.1483,0.6601,-0.4793,0.1254,0.6674,-0.5001,-0.0000,0.6625,-0.5017,-0.0691,0.6601,-0.4874,-0.1123,0.6625,-0.5006,-0.3424,0.5808,-0.3986,-0.3021,0.6625,-0.3602,-0.5273,0.5501,-0.2930,-0.4266,0.6523,-0.1685,-0.4709,0.6625,-0.1055,-0.5303,0.6332,-0.0243,-0.4949,0.6674,0.0683,-0.4955,0.6625,0.1938,-0.4679,0.6601,0.3133,-0.4808,0.6092,0.2993,-0.3949,0.6674,0.5034,-0.3364,0.5797,0.4473,-0.2376,0.6601,0.4665,-0.1669,0.6674,0.5088,-0.0945,0.6523,0.5042,0.0483,0.6601,0.4909,0.0676,0.6674,0.4709,0.1685,0.6625,0.4293,0.2687,0.6601,0.4126,0.2938,0.6601,0.3133,0.4808,0.6092,0.2325,0.4377,0.6674,0.1244,0.6253,0.5490,0.1074,0.5062,0.6523,-0.0727,0.7513,0.4073,-0.1303,0.6552,0.5168,-0.3227,0.6823,0.4073,-0.3663,0.5601,0.5178,-0.5556,0.5036,0.4120,-0.6115,0.4302,0.4183,-0.7038,0.2518,0.4183,-0.7320,0.1639,0.4120,-0.7475,-0.0000,0.4183,-0.7438,-0.1295,0.4073,-0.6928,-0.2869,0.4120,-0.6500,-0.3836,0.4073,-0.5592,-0.5068,0.4073,-0.4494,-0.5973,0.4183,-0.3206,-0.6778,0.4120,-0.1425,-0.6827,0.4851,-0.0367,-0.7466,0.4183,0.1358,-0.6829,0.4841,0.2182,-0.7149,0.4183,0.3929,-0.5762,0.4851,0.4767,-0.5789,0.4120,0.6043,-0.3959,0.4530,0.6663,-0.3547,0.4073,0.7271,-0.1380,0.4291,0.7473,-0.1056,0.4073,0.7247,0.1441,0.4282,0.7320,0.1639,0.4120,0.6190,0.4057,0.4291,0.6115,0.4302,0.4183,0.4068,0.5970,0.4530,0.3798,0.6438,0.4183,0.2182,0.7149,0.4183,0.1050,0.7425,0.4120,-0.1553,0.7807,0.3342,-0.4373,0.6427,0.3704,-0.7996,0.1658,0.2962,-0.8172,-0.1693,0.2554,-0.6666,-0.4375,0.3349,-0.4179,-0.6373,0.3960,0.1528,-0.8022,0.2962,0.4691,-0.6903,0.2554,0.6593,-0.4484,0.3349,0.7488,-0.1423,0.3960,0.6976,0.4582,0.2554,0.4482,0.6826,0.2962,0.1581,0.7612,0.3704,-0.1786,0.8640,0.1046,-0.2205,0.8594,0.0787,-0.4854,0.7264,0.1331,-0.5093,0.7269,0.0787,-0.7323,0.4893,0.1042,-0.7613,0.4504,0.0849,-0.8569,0.1771,0.1335,-0.8717,0.1534,0.0916,-0.8806,-0.0855,0.0916,-0.8570,-0.2199,0.0916,-0.7808,-0.4159,0.0849,-0.7035,-0.4780,0.2138,-0.5639,-0.6851,0.0787,-0.4717,-0.7060,0.2133,-0.2989,-0.8354,0.0787,-0.1724,-0.8329,0.2138,0.0434,-0.8834,0.0849,0.1534,-0.8717,0.0916,0.3783,-0.7998,0.0916,0.4767,-0.7487,0.0787,0.6255,-0.6255,0.0849,0.7096,-0.5327,0.0787,0.8197,-0.3395,0.0787,0.8568,-0.2198,0.0849,0.8862,-0.0435,0.0787,0.8759,0.1247,0.0916,0.8328,0.2980,0.0849,0.7222,0.4746,0.1728,0.6555,0.5941,0.0916,0.4793,0.7173,0.1723,0.4159,0.7809,0.0916,0.1621,0.8488,0.1728,0.0857,0.8832,0.0787,-0.1734,0.8714,0.0653,-0.7499,0.5011,-0.0922,-0.8832,0.1690,-0.0044,-0.8757,-0.1742,0.0359,-0.7436,-0.4890,0.0655,-0.1757,-0.8834,-0.0476,0.1751,-0.8804,-0.0045,0.5023,-0.7399,0.0360,0.8836,-0.1825,-0.0476,0.8847,0.1827,-0.0922,0.7513,0.4941,-0.0044,0.4890,0.7436,0.0655,-0.0435,0.8862,-0.2631,-0.1247,0.8757,-0.2692,-0.2980,0.8330,-0.2759,-0.4518,0.7637,-0.2631,-0.5940,0.6554,-0.2692,-0.7440,0.5050,-0.1799,-0.8021,0.3794,-0.2631,-0.8804,0.1751,-0.1798,-0.8832,0.0857,-0.2631,-0.8806,-0.1819,-0.1799,-0.8461,-0.2580,-0.2692,-0.7399,-0.5023,-0.2204,-0.6832,-0.5623,-0.2759,-0.4960,-0.7424,-0.2202,-0.4753,-0.7466,-0.2759,-0.1734,-0.8714,-0.2497,-0.1247,-0.8757,-0.2692,0.1672,-0.8742,-0.2499,0.1918,-0.8638,-0.2692,0.4914,-0.7473,-0.2204,0.5093,-0.7269,-0.2631,0.6851,-0.5639,-0.2631,0.7637,-0.4518,-0.2631,0.8461,-0.2580,-0.2692,0.8862,-0.1696,-0.1367,0.8806,0.0855,-0.2759,0.8862,0.1696,-0.1367,0.7996,0.3782,-0.2692,0.7487,0.4767,-0.2631,0.5959,0.6574,-0.2631,0.5077,0.7247,-0.2692,0.3395,0.8197,-0.2631,0.1918,0.8640,-0.2759,-0.1563,0.8198,-0.4397,-0.4780,0.7035,-0.3981,-0.7239,0.4916,-0.3178,-0.8639,0.1718,-0.2886,-0.6928,-0.4629,-0.4392,-0.4746,-0.7222,-0.3571,-0.1704,-0.8568,-0.3175,0.1718,-0.8639,-0.2886,0.6928,-0.4629,-0.4392,0.8488,-0.1621,-0.3571,0.8568,0.1704,-0.3175,0.7372,0.4847,-0.2889,0.1656,0.8328,-0.3976,-0.0722,0.7464,-0.5963,-0.1658,0.7996,-0.4805,-0.3512,0.6599,-0.6026,-0.4529,0.6778,-0.4798,-0.5538,0.5019,-0.6026,-0.6753,0.4591,-0.4805,-0.7060,0.2526,-0.5963,-0.7320,0.1639,-0.5963,-0.7547,-0.0000,-0.5916,-0.7366,-0.1282,-0.6026,-0.6928,-0.2869,-0.5963,-0.6438,-0.3798,-0.6026,-0.5285,-0.5285,-0.6026,-0.4508,-0.5992,-0.5963,-0.3196,-0.6757,-0.6026,-0.1884,-0.7308,-0.5916,-0.0368,-0.7490,-0.5963,0.1491,-0.7833,-0.5192,0.2543,-0.7106,-0.5916,0.4422,-0.6618,-0.5185,0.4767,-0.5789,-0.5963,0.6500,-0.4264,-0.5547,0.6599,-0.3512,-0.6026,0.7488,-0.1423,-0.5803,0.7401,-0.1046,-0.6026,0.7612,0.1514,-0.5540,0.7296,0.1635,-0.6026,0.6326,0.4227,-0.5795,0.5992,0.4508,-0.5963,0.4289,0.6300,-0.5803,0.4017,0.6335,-0.5963,0.1581,0.7612,-0.5547,0.1295,0.7438,-0.5916,-0.1358,0.6829,-0.6685,-0.4068,0.5970,-0.6374,-0.6551,0.1370,-0.7021,-0.6250,-0.1310,-0.7344,-0.5836,-0.3820,-0.6694,-0.4057,-0.6190,-0.6134,0.1181,-0.6276,-0.7344,0.3773,-0.5528,-0.7021,0.5970,-0.4068,-0.6374,0.7247,-0.1441,-0.6125,0.5301,0.3542,-0.7334,0.3820,0.5836,-0.6694,0.1407,0.7074,-0.6364,-0.2936,0.4274,-0.8405,-0.4274,0.2936,-0.8405,-0.5312,-0.1056,-0.8195,-0.5033,-0.3363,-0.7641,-0.1118,-0.5619,-0.7930,0.2875,-0.4303,-0.8394,0.4475,-0.3069,-0.8207,0.5309,0.1123,-0.8207,0.5079,0.3314,-0.7652,0.1055,0.5642,-0.7941,-0.0763,0.3493,0.7473,-0.3766,0.2596,0.6902,-0.4759,0.0879,0.6745,-0.4130,-0.0822,0.7097,-0.2935,-0.2041,0.7473,-0.0957,-0.4473,0.6902,0.1008,-0.4733,0.6745,0.2289,-0.3544,0.7110,0.2967,-0.1982,0.7460,0.4759,0.0879,0.6745,0.3766,0.2596,0.6902,0.2087,0.3243,0.7316,0.0763,0.3493,0.7473,-0.4194,0.2987,0.6672,-0.5060,-0.0915,0.6659,-0.2979,-0.4182,0.6663,0.2828,-0.4408,0.6608,0.5024,-0.1091,0.6659,0.4353,0.2724,0.6663,-0.1409,0.7582,0.4014,-0.6294,0.4316,0.4095,-0.6420,-0.4173,0.4105,-0.1590,-0.7533,0.4006,0.4164,-0.6406,0.4103,0.7541,0.1312,0.4105,0.4322,0.6306,0.4097,-0.1553,0.8834,0.0781,-0.8811,0.1851,0.0672,-0.7501,-0.4902,0.0777,0.1658,-0.8834,0.0777,0.7432,-0.5082,0.0672,0.8806,0.1658,0.0777,0.1849,0.8796,0.0777,-0.4875,0.7458,-0.2910,-0.8746,0.1838,-0.2801,-0.5039,-0.7366,-0.2914,0.1655,-0.8781,-0.2807,0.7315,-0.5128,-0.2801,0.7495,0.4892,-0.2810,0.1831,0.8736,-0.2800,-0.6172,0.4344,-0.6110,-0.7348,-0.1370,-0.6187,-0.4269,-0.6216,-0.6096,0.4039,-0.6375,-0.6110,0.7313,-0.1546,-0.6187,0.6323,0.4109,-0.6096,-0.1117,0.5116,0.6608,-0.0865,0.4810,0.6822,-0.2896,0.4061,0.6779,-0.4201,0.2691,0.6779,-0.5064,0.0851,0.6663,-0.5109,-0.1108,0.6596,-0.4908,-0.0878,0.6763,-0.4059,-0.2894,0.6763,-0.2692,-0.4191,0.6766,-0.0853,-0.5078,0.6672,-0.1122,-0.4860,0.6779,0.0883,-0.4902,0.6766,0.2842,-0.4088,0.6754,0.4317,-0.2774,0.6653,0.5069,-0.0910,0.6672,0.4780,-0.1050,0.6835,0.4900,0.0881,0.6754,0.4015,0.2799,0.6835,0.2772,0.4324,0.6663,0.0926,0.5154,0.6608,0.1042,0.4774,0.6822,-0.1559,0.7367,0.4248,-0.4274,0.6223,0.4267,-0.6465,0.4098,0.4105,-0.6165,0.4339,0.4253,-0.7385,0.1568,0.4267,-0.7313,-0.1546,0.4344,-0.6165,-0.4339,0.4253,-0.4172,-0.6405,0.4097,-0.4344,-0.6172,0.4267,-0.1558,-0.7374,0.4258,0.1556,-0.7323,0.4353,0.4316,-0.6294,0.4095,0.6420,-0.4173,0.4105,0.6170,-0.4239,0.4353,0.7367,-0.1559,0.4248,0.7385,0.1568,0.4267,0.6247,0.4395,0.4103,0.4202,0.6451,0.4006,0.4269,0.6216,0.4253,0.1376,0.7414,0.4253,-0.1941,0.8734,0.0967,-0.5157,0.7357,0.0777,-0.4796,0.7537,0.0957,-0.7387,0.5053,0.0967,-0.8756,0.1650,0.1067,-0.8721,-0.1938,0.0957,-0.7411,-0.5060,0.0774,-0.7549,-0.4803,0.0967,-0.5039,-0.7380,0.0964,-0.1648,-0.8784,0.0957,0.1845,-0.8780,0.0781,0.5082,-0.7432,0.0672,0.4875,-0.7458,0.1067,0.7472,-0.4882,0.0957,0.8797,-0.1651,0.0967,0.8755,0.1946,0.0781,0.7424,0.5068,0.0669,0.7484,0.4884,0.0957,0.4890,0.7479,0.0964,0.1646,0.8772,0.1070,-0.1941,0.8734,-0.2810,-0.1553,0.8834,-0.2624,-0.4910,0.7510,-0.2618,-0.7540,0.4921,-0.2515,-0.8771,0.1651,-0.2800,-0.8759,-0.1841,-0.2810,-0.8849,-0.1661,-0.2515,-0.7501,-0.4902,-0.2620,-0.4904,-0.7513,-0.2624,-0.1648,-0.8784,-0.2801,0.1836,-0.8734,-0.2914,0.1665,-0.8834,-0.2513,0.5054,-0.7399,-0.2620,0.7527,-0.4913,-0.2620,0.8799,-0.1547,-0.2801,0.8755,-0.1946,-0.2624,0.8834,0.1658,-0.2620,0.7424,0.5068,-0.2513,0.4815,0.7567,-0.2624,0.1655,0.8781,-0.2807,0.1949,0.8771,-0.2620,-0.1403,0.7514,-0.5940,-0.4365,0.6357,-0.5857,-0.6312,0.4107,-0.6091,-0.7423,0.1378,-0.6110,-0.7544,0.1600,-0.5857,-0.7503,-0.1399,-0.5939,-0.6299,-0.4325,-0.5946,-0.4035,-0.6368,-0.6096,-0.1370,-0.7348,-0.6187,-0.1585,-0.7474,-0.5946,0.1580,-0.7479,-0.5940,0.4405,-0.6260,-0.5949,0.6375,-0.4039,-0.6110,0.6247,-0.4395,-0.5946,0.7490,-0.1589,-0.5949,0.7533,0.1590,-0.5849,0.6247,0.4395,-0.5946,0.4112,0.6317,-0.6101,0.4405,0.6260,-0.5949,0.1580,0.7479,-0.5940,-0.1038,0.5712,0.6173,-0.3509,0.5413,0.5564,-0.3804,0.3448,0.6663,-0.4923,0.1508,0.6672,-0.5142,0.0253,0.6672,-0.4910,-0.1503,0.6663,-0.4599,-0.2965,0.6416,-0.3109,-0.4103,0.6672,-0.1283,-0.5990,0.5875,0.1102,-0.6036,0.5886,0.2201,-0.4654,0.6672,0.3631,-0.3631,0.6663,0.4431,-0.2594,0.6663,0.5348,-0.1156,0.6416,0.5100,0.0703,0.6672,0.5143,0.3328,0.5875,0.3489,0.5048,0.5886,0.1734,0.4847,0.6672,0.0000,0.7545,0.4267,-0.2539,0.7095,0.4253,-0.5067,0.5590,0.4267,-0.6661,0.3545,0.4267,-0.7502,0.0726,0.4253,-0.7297,-0.1882,0.4253,-0.6028,-0.4537,0.4267,-0.3830,-0.5570,0.5238,-0.1882,-0.7297,0.4253,0.1055,-0.7471,0.4267,0.3839,-0.5920,0.4917,0.5806,-0.3988,0.4908,0.7138,-0.1512,0.4585,0.7186,0.1331,0.4594,0.6661,0.3545,0.4267,0.4792,0.5818,0.4253,0.2539,0.7095,0.4253,-0.1556,0.8285,0.2589,-0.6652,0.4561,0.3398,-0.6922,-0.4509,0.3006,-0.1697,-0.8071,0.3000,0.4289,-0.6593,0.3756,0.8120,0.1516,0.3006,0.4657,0.6807,0.3000,-0.1632,0.8700,0.1362,-0.4205,0.7895,0.0967,-0.6896,0.5676,0.0958,-0.8409,0.3009,0.0958,-0.8933,-0.0439,0.0967,-0.8263,-0.3423,0.0967,-0.6315,-0.6315,0.0958,-0.3818,-0.8073,0.0958,-0.0439,-0.8933,0.0967,0.2609,-0.8556,0.0967,0.5676,-0.6896,0.0958,0.7699,-0.4553,0.0967,0.8407,-0.1764,0.2168,0.8457,0.1583,0.2174,0.7687,0.4546,0.0958,0.5371,0.7152,0.0967,0.1801,0.8554,0.1758,-0.4996,0.7652,-0.0922,-0.8920,0.1866,-0.0471,-0.7576,-0.4946,0.0374,0.1685,-0.8971,-0.0471,0.7501,-0.5120,-0.0036,0.8877,0.1674,0.0372,0.1868,0.8931,-0.0922,-0.1685,0.8971,-0.1373,-0.4564,0.7717,-0.2624,-0.7182,0.5393,-0.2620,-0.8902,0.1870,-0.1809,-0.8925,-0.1684,-0.1807,-0.7560,-0.4943,-0.2215,-0.5107,-0.7468,-0.2217,-0.2620,-0.8591,-0.2620,0.0866,-0.8925,-0.2624,0.3834,-0.8105,-0.2624,0.6655,-0.6032,-0.2620,0.8298,-0.3437,-0.2620,0.8966,-0.0000,-0.2624,0.8456,0.3026,-0.2620,0.6935,0.5708,-0.2620,0.4215,0.7914,-0.2624,0.1263,0.8877,-0.2624,-0.4837,0.7413,-0.3205,-0.8457,-0.1583,-0.4017,-0.4923,-0.7206,-0.3597,0.1636,-0.8685,-0.3202,0.8249,-0.1733,-0.4432,0.7322,0.4776,-0.3602,0.0000,0.7652,-0.5949,-0.2572,0.7189,-0.5946,-0.5139,0.5670,-0.5949,-0.6741,0.3588,-0.5946,-0.7561,0.1068,-0.5946,-0.7410,-0.1911,-0.5949,-0.6907,-0.4507,-0.4843,-0.4670,-0.6814,-0.4850,-0.1907,-0.7394,-0.5946,0.1070,-0.7577,-0.5949,0.4400,-0.6760,-0.5241,0.6645,-0.4548,-0.5234,0.7683,-0.1620,-0.5592,0.7733,0.1439,-0.5599,0.6755,0.3596,-0.5949,0.4854,0.5895,-0.5946,0.2578,0.7204,-0.5949,-0.1226,0.6659,-0.7092,-0.5806,0.3988,-0.6751,-0.7173,-0.1335,-0.6428,-0.1347,-0.6308,-0.7408,0.3839,-0.5920,-0.6761,0.6355,0.1165,-0.7418,0.3830,0.5570,-0.7082,-0.1102,0.6036,-0.7729,-0.5124,0.1111,-0.8474,-0.4872,-0.3147,-0.8009,-0.1283,-0.5990,-0.7718,0.4510,-0.3122,-0.8275,0.5716,0.1038,-0.8020,0.3478,0.5043,-0.7718,-0.2491,0.3890,0.6980,-0.4163,0.0920,0.7188,-0.3604,-0.2291,0.7202,-0.0849,-0.3806,0.7395,0.2089,-0.3302,0.7408,0.3530,-0.0795,0.7553,0.3068,0.1932,0.7566,0.0898,0.3802,0.7408,-0.2795,0.4064,0.6690,-0.4983,0.0991,0.6573,-0.4850,-0.0898,0.6690,-0.2735,-0.4265,0.6602,-0.1061,-0.4842,0.6674,0.2858,-0.4106,0.6625,0.4158,-0.2894,0.6602,0.4824,0.1026,0.6690,0.2823,0.4225,0.6573,0.1026,0.4824,0.6690,-0.4274,0.6226,0.4073,-0.6185,0.4247,0.4120,-0.7317,-0.1552,0.4182,-0.4259,-0.6256,0.4049,-0.1453,-0.7308,0.4198,0.4259,-0.6256,0.4049,0.6166,-0.4234,0.4182,0.7388,0.1566,0.4073,0.6291,0.4090,0.4120,0.1366,0.7354,0.4182,-0.4881,0.7423,0.0759,-0.7344,0.4907,0.0941,-0.8700,-0.1797,0.0759,-0.7414,-0.4840,0.0916,-0.1634,-0.8700,0.0849,0.1639,-0.8726,0.0788,0.7393,-0.4861,0.0944,0.8699,0.1730,0.0756,0.7393,0.4861,0.0944,0.1639,0.8726,0.0788,-0.1639,0.8726,-0.2631,-0.7412,0.4839,-0.2692,-0.8664,0.1820,-0.2759,-0.7351,-0.4990,-0.2602,-0.1723,-0.8663,-0.2784,0.1669,-0.8726,-0.2602,0.7414,-0.4840,-0.2759,0.8663,-0.1819,-0.2692,0.7330,0.5011,-0.2631,0.1790,0.8664,-0.2788,-0.1474,0.7410,-0.5885,-0.6241,0.4091,-0.6050,-0.7388,0.1566,-0.5917,-0.6166,-0.4234,-0.6026,-0.4247,-0.6185,-0.5963,0.1566,-0.7388,-0.5917,0.6169,-0.4200,-0.6050,0.7410,-0.1474,-0.5885,0.6169,0.4200,-0.6050,0.4274,0.6226,-0.5917,0.0000,0.4987,0.6779,-0.1680,0.4695,0.6779,-0.3347,0.3693,0.6763,-0.4402,0.2338,0.6763,-0.5383,0.0979,0.6416,-0.5666,-0.1219,0.6161,-0.5313,-0.3658,0.5564,-0.3174,-0.3847,0.6779,-0.2132,-0.4508,0.6779,-0.0244,-0.4978,0.6763,0.1460,-0.4767,0.6763,0.3114,-0.4499,0.6416,0.4869,-0.3145,0.6161,0.6355,-0.1165,0.5575,0.4981,0.0244,0.6779,0.4506,0.2131,0.6763,0.3524,0.3524,0.6763,0.2339,0.4405,0.6779,0.0974,0.5393,0.6428,-0.1407,0.6612,0.5238,-0.3880,0.6576,0.4103,-0.5907,0.3838,0.4908,-0.6938,0.1281,0.4917,-0.7148,-0.1521,0.4594,-0.6016,-0.4128,0.4585,-0.4854,-0.5895,0.4103,-0.2234,-0.7319,0.4105,0.0375,-0.7643,0.4105,0.3265,-0.6903,0.4103,0.5399,-0.5399,0.4103,0.7070,-0.2928,0.4105,0.7643,-0.0375,0.4105,0.7189,0.2572,0.4103,0.5907,0.4865,0.4105,0.3888,0.6591,0.4105,0.1068,0.7561,0.4103,-0.4548,0.6645,0.3391,-0.8071,-0.1697,0.3000,-0.4509,-0.6922,0.3006,0.1620,-0.7683,0.3749,0.8285,-0.1556,0.2589,0.6652,0.4561,0.3398,0.1439,0.7733,0.3756,-0.3021,0.8442,0.0781,-0.5698,0.6923,0.0781,-0.7928,0.4223,0.0777,-0.8877,0.1263,0.0781,-0.8419,-0.1774,0.2174,-0.7092,-0.4847,0.2168,-0.5393,-0.7182,0.0777,-0.2230,-0.8684,0.0781,0.1791,-0.8542,0.1754,0.4937,-0.7214,0.1758,0.7413,-0.4837,0.1362,0.8685,-0.1636,0.1358,0.8925,0.0866,0.0781,0.7928,0.4223,0.0777,0.6032,0.6655,0.0777,0.3021,0.8442,0.0781,-0.1866,0.8920,-0.0471,-0.7643,0.4990,-0.0471,-0.8841,-0.1850,0.0372,-0.1691,-0.8966,-0.0922,0.5134,-0.7509,-0.0034,0.8892,-0.1670,0.0374,0.4996,0.7652,-0.0922,-0.0862,0.8889,-0.2801,-0.4205,0.7895,-0.2810,-0.6627,0.6007,-0.2810,-0.8409,0.3009,-0.2801,-0.8931,-0.0000,-0.2801,-0.8263,-0.3423,-0.2810,-0.6617,-0.5997,-0.2801,-0.4199,-0.7883,-0.2801,-0.0863,-0.8903,-0.2810,0.2225,-0.8663,-0.2810,0.5362,-0.7142,-0.2801,0.7643,-0.4990,-0.1373,0.8955,-0.1690,-0.1372,0.8855,0.1260,-0.2810,0.7687,0.4546,-0.2801,0.4970,0.7601,-0.1807,0.1679,0.8940,-0.1809,-0.1822,0.8663,-0.3205,-0.8299,0.1552,-0.4438,-0.7214,-0.4937,-0.3602,-0.1632,-0.8700,-0.3205,0.7073,-0.4610,-0.4438,0.8542,0.1791,-0.3597,0.1587,0.8443,-0.4012,-0.1055,0.7471,-0.6110,-0.3829,0.6491,-0.6096,-0.6746,0.4399,-0.5234,-0.7930,0.1478,-0.5241,-0.7695,-0.1630,-0.5599,-0.6478,-0.4437,-0.5592,-0.4792,-0.5818,-0.6096,-0.2203,-0.7216,-0.6110,0.0370,-0.7527,-0.6096,0.2884,-0.6962,-0.6096,0.5335,-0.5335,-0.6110,0.6820,-0.3226,-0.6110,0.7527,-0.0370,-0.6096,0.7208,0.2200,-0.6096,0.5824,0.4797,-0.6110,0.3833,0.6499,-0.6110,0.1053,0.7462,-0.6096,-0.3988,0.5806,-0.6751,-0.6612,-0.1407,-0.7082,-0.3681,-0.5683,-0.7092,0.1512,-0.7138,-0.6428,0.6343,-0.1170,-0.7408,0.5575,0.3842,-0.7092,0.1335,0.7173,-0.6428,-0.4622,0.2972,-0.8287,-0.5361,-0.1158,-0.8275,-0.3328,-0.5155,-0.7729,0.3308,-0.4776,-0.8020,0.5159,-0.0934,-0.8474,0.2837,0.4421,-0.8486,-0.0920,0.4163,0.7188,-0.3302,0.2089,0.7408,-0.3802,-0.0898,0.7408,-0.1932,-0.3068,0.7566,0.0795,-0.3530,0.7553,0.3059,-0.1934,0.7553,0.3806,0.0849,0.7395,0.0813,0.4548,0.6980,-0.1150,0.5333,-0.8241,-0.4016,0.6337,-0.6069,-0.2854,0.4183,-0.8520,-0.5303,0.5303,-0.6069,-0.4214,0.2816,-0.8596,-0.6337,0.4016,-0.6069,-0.5097,0.1103,-0.8440,-0.7312,0.1365,-0.6160,-0.6613,-0.1226,-0.7051,-0.6277,-0.1338,-0.7376,-0.6288,-0.4094,-0.6071,-0.4237,-0.2773,-0.8520,-0.4768,-0.5790,-0.6069,-0.2765,-0.4274,-0.8594,-0.3524,-0.6621,-0.6069,-0.1055,-0.4967,-0.8553,-0.1376,-0.7376,-0.6071,0.1103,-0.5995,-0.7685,0.1453,-0.6857,-0.6722,0.3961,-0.6085,-0.6401,0.3278,-0.4748,-0.7975,0.6186,-0.4249,-0.6069,0.4198,-0.2805,-0.8517,0.6929,-0.2870,-0.6069,0.4971,-0.0989,-0.8596,0.7391,-0.1286,-0.6069,0.5131,0.0931,-0.8440,0.7277,0.1537,-0.6160,0.5641,0.3663,-0.7051,0.5287,0.3639,-0.7376,0.4239,0.6187,-0.6076,0.2824,0.4384,-0.8440,0.1873,0.7262,-0.6069,0.0926,0.4993,-0.8553,0.0368,0.7491,-0.6069,-0.0754,0.3400,0.7630,-0.0820,0.4894,0.6724,0.0677,0.3404,0.7628,0.1453,0.4744,0.6724,0.1998,0.2852,0.7630,0.3508,0.3508,0.6724,0.2901,0.1879,0.7552,0.4744,0.1453,0.6724,0.3380,0.0723,0.7552,0.4894,-0.0820,0.6724,0.3422,-0.0774,0.7614,0.4175,-0.2682,0.6725,0.2844,-0.1980,0.7535,0.2774,-0.3994,0.6783,0.2283,-0.3574,0.7149,0.0983,-0.4491,0.6941,0.0862,-0.4786,0.6783,-0.0614,-0.3544,0.7513,-0.1056,-0.4848,0.6725,-0.1870,-0.2919,0.7584,-0.2881,-0.4041,0.6724,-0.2886,-0.1928,0.7628,-0.4382,-0.2327,0.6724,-0.3430,-0.0604,0.7630,-0.4962,-0.0000,0.6724,-0.3380,0.0723,0.7552,-0.4382,0.2327,0.6724,-0.2901,0.1879,0.7552,-0.2998,0.3954,0.6724,-0.1862,0.2948,0.7575,-0.1062,0.4848,0.6724,-0.1721,0.4809,0.6627,-0.4094,0.6288,0.4227,-0.3459,0.5019,0.5842,-0.4275,0.2962,0.6559,-0.4510,0.5993,0.4226,-0.4511,0.2396,0.6627,-0.7338,0.1549,0.4232,-0.6312,0.1166,0.5532,-0.5034,-0.0912,0.6622,-0.7466,0.0722,0.4226,-0.4978,-0.1146,0.6627,-0.6085,-0.3961,0.4558,-0.6857,-0.1453,0.4879,-0.2918,-0.4194,0.6627,-0.5303,-0.5303,0.4226,-0.2758,-0.4301,0.6627,-0.1453,-0.6857,0.4879,-0.3961,-0.6085,0.4558,0.0847,-0.5037,0.6627,0.0368,-0.7491,0.4226,0.1085,-0.4994,0.6626,0.3663,-0.5641,0.5208,0.1537,-0.7277,0.4317,0.3940,-0.3251,0.6627,0.5993,-0.4510,0.4226,0.4373,-0.2816,0.6559,0.5961,-0.1275,0.5842,0.6288,-0.4094,0.4227,0.5101,0.0250,0.6627,0.7391,0.1286,0.4226,0.5322,0.1148,0.6380,0.4844,0.3131,0.6127,0.7341,0.1558,0.4226,0.3612,0.3612,0.6627,0.4249,0.6186,0.4226,0.3131,0.4844,0.6127,0.1101,0.5084,0.6559,0.3811,0.6460,0.4226,0.0488,0.5085,0.6627,-0.1377,0.7373,0.4232,0.0000,0.7597,0.4080,-0.1641,0.8741,0.0946,0.1477,0.7876,0.3370,-0.4143,0.6374,0.4080,-0.3401,0.8211,0.0946,-0.1577,0.7436,0.4080,-0.7172,0.4897,0.1740,-0.4958,0.7263,0.1347,-0.7416,0.1661,0.4080,-0.8501,0.2592,0.0946,-0.6373,0.4153,0.4073,-0.8243,-0.1550,0.2571,-0.8737,0.1649,0.0954,-0.6707,-0.3570,0.4080,-0.7650,-0.4524,0.0946,-0.7495,-0.1580,0.3983,-0.4632,-0.6775,0.2981,-0.7344,-0.5015,0.0948,-0.2559,-0.7153,0.4080,-0.1928,-0.8679,0.0946,-0.4267,-0.6545,0.3726,0.1477,-0.7876,0.3370,-0.1540,-0.8756,0.0946,0.2559,-0.7153,0.4080,0.4866,-0.7444,0.0948,0.1687,-0.8032,0.2981,0.6320,-0.4329,0.3983,0.5336,-0.7107,0.0946,0.6707,-0.3570,0.4080,0.8704,-0.1820,0.0954,0.7022,-0.4587,0.2571,0.7477,0.1398,0.4073,0.8846,-0.0858,0.0946,0.7357,0.1897,0.4080,0.7421,0.4853,0.1056,0.8366,0.1753,0.2153,0.4303,0.6267,0.4080,0.6284,0.6284,0.0946,0.6267,0.4303,0.4080,0.1780,0.8500,0.1740,0.4812,0.7360,0.1347,-0.1659,0.8789,0.0662,0.1258,0.8832,-0.2618,0.0861,0.8880,0.0774,-0.4965,0.7588,-0.1369,-0.1831,0.8755,-0.2506,-0.7135,0.5356,0.0774,-0.6888,0.5670,-0.2618,-0.5033,0.7375,0.0767,-0.8876,0.1855,-0.0474,-0.7473,0.4885,-0.2616,-0.8910,-0.0438,0.0774,-0.8789,-0.1546,-0.2618,-0.8832,0.1667,0.0366,-0.7563,-0.4948,-0.0040,-0.8737,-0.1835,-0.2618,-0.6308,-0.6308,0.0774,-0.5039,-0.7369,-0.2618,-0.7465,-0.5093,-0.0040,-0.1839,-0.8798,0.0366,-0.4792,-0.7528,-0.2618,-0.0438,-0.8910,0.0774,0.1656,-0.8774,-0.2610,-0.1685,-0.8921,-0.0922,0.4888,-0.7473,0.0767,0.2602,-0.8534,-0.2618,0.5356,-0.7135,0.0774,0.7388,-0.5042,-0.2506,0.5110,-0.7491,-0.1369,0.8738,-0.1829,0.0773,0.8065,-0.3814,-0.2618,0.8789,-0.1546,0.0775,0.8832,0.1667,-0.2210,0.8880,-0.1677,-0.1803,0.7476,0.4880,0.0775,0.8065,0.3814,-0.2618,0.8738,0.1829,0.0773,0.5110,0.7491,-0.1369,0.7388,0.5042,-0.2506,0.2218,0.8641,0.0774,0.2602,0.8534,-0.2618,0.4888,0.7473,0.0767,-0.1408,0.7529,-0.5826,0.1515,0.8066,-0.4824,-0.4178,0.7845,-0.2790,-0.3861,0.6543,-0.5923,-0.1816,0.8679,-0.2900,-0.7058,0.4822,-0.3997,-0.4303,0.6267,-0.5923,-0.8211,0.3401,-0.2790,-0.7436,0.1577,-0.5923,-0.7270,0.4752,-0.3584,-0.8642,-0.1630,-0.3190,-0.7487,0.1303,-0.5923,-0.8368,-0.2994,-0.2790,-0.6371,-0.4149,-0.5922,-0.8366,-0.1753,-0.3997,-0.4999,-0.7323,-0.2900,-0.6071,-0.4567,-0.5923,-0.4178,-0.7845,-0.2790,-0.1569,-0.7442,-0.5916,-0.4486,-0.6872,-0.4824,0.1647,-0.8739,-0.2791,-0.0373,-0.7588,-0.5923,0.1928,-0.8679,-0.2790,0.4267,-0.6545,-0.5569,0.1649,-0.7841,-0.5213,0.7341,-0.5020,-0.2790,0.5372,-0.5372,-0.5923,0.5020,-0.7341,-0.2790,0.7841,-0.1649,-0.5213,0.6545,-0.4267,-0.5569,0.8756,0.1540,-0.2790,0.7588,0.0373,-0.5923,0.8737,-0.1649,-0.2797,0.7022,0.4587,-0.4414,0.7442,0.1569,-0.5916,0.5648,0.6862,-0.2790,0.4567,0.6071,-0.5923,0.7323,0.4999,-0.2900,0.1753,0.8366,-0.3997,0.4149,0.6371,-0.5922,-0.0323,0.3399,0.7625,-0.1713,0.2953,0.7625,-0.2632,0.2175,0.7625,-0.3245,0.1161,0.7641,-0.3410,-0.0167,0.7625,-0.2656,-0.2197,0.7641,-0.1614,-0.3046,0.7641,-0.0169,-0.3442,0.7641,0.1319,-0.3184,0.7641,0.2414,-0.2414,0.7625,0.3086,-0.1459,0.7625,0.3399,-0.0323,0.7625,0.3331,0.0887,0.7641,0.2794,0.2024,0.7641,0.1713,0.2953,0.7625,-0.0604,0.3397,0.7641,-0.2865,-0.1914,0.7641,0.1896,-0.2838,0.7625,0.1857,0.2907,0.7641,-0.2019,-0.2845,0.7638,0.0771,0.3374,0.7641,0.2019,-0.2845,0.7638,-0.1316,0.3678,0.7408,-0.3678,0.1316,0.7408,-0.2489,-0.3012,0.7408,0.1495,-0.3609,0.7408,0.3889,-0.0370,0.7408,0.2370,0.3106,0.7408,-0.3411,0.0610,0.7535,0.2875,0.1921,0.7522,0.2976,0.1870,0.7628,0.0782,-0.3427,0.7628,0.0843,0.3785,0.7356,-0.2849,-0.2010,0.7575,-0.0167,0.3399,0.6067,-0.1455,0.3077,0.6067,-0.3008,0.1594,0.7578,-0.3399,0.0167,0.7578,-0.3144,-0.1302,0.7578,-0.2406,-0.2406,0.6067,-0.1455,-0.3077,0.6067,-0.0322,-0.3388,0.6067,0.0763,-0.3316,0.7578,0.2066,-0.2705,0.7578,0.2943,-0.1708,0.6067,0.3373,-0.0452,0.6067,0.3316,0.0763,0.6067,0.2168,0.2624,0.7578,0.0873,0.3290,0.7578,-0.2829,0.1890,0.7578,0.3337,-0.0664,0.6067,-0.1302,0.3144,0.1656,-0.2285,0.2521,0.1656,-0.3144,0.1302,-0.2894,-0.3399,0.0167,-0.2894,-0.3254,-0.1000,-0.2894,-0.2624,-0.2168,0.1656,-0.1708,-0.2943,0.1656,-0.0452,-0.3373,0.1656,0.0873,-0.3290,-0.2894,0.1974,-0.2771,-0.2894,0.2884,-0.1805,0.1656,0.3355,0.0564,0.1656,0.2943,0.1708,0.1656,0.1974,0.2771,-0.2894,0.0873,0.3290,-0.2894,-0.3337,0.0664,0.1656,0.3337,0.0664,-0.2894,-0.0159,0.3236,-0.5445,-0.1575,0.2971,-0.5290,-0.1782,0.2155,-0.5445,-0.2119,0.1921,-0.5445,-0.3131,0.0831,-0.5445,-0.3315,0.0557,-0.5290,-0.3166,-0.1133,-0.5290,-0.2370,-0.1483,-0.5445,-0.2273,-0.1736,-0.5445,-0.1239,-0.2993,-0.5445,-0.1133,-0.3166,-0.5290,0.0318,-0.3348,-0.5290,0.0822,-0.2674,-0.5445,0.2064,-0.2497,-0.5445,0.2738,-0.1950,-0.5290,0.2908,-0.1688,-0.5290,0.3236,-0.0159,-0.5445,0.2757,0.0463,-0.5445,0.2765,0.0734,-0.5445,0.2291,0.2291,-0.5445,0.2258,0.2491,-0.5290,0.0988,0.3215,-0.5290,0.0446,0.3333,-0.5290,-0.2795,-0.1868,-0.5290,0.3176,-0.0632,-0.5445,0.0000,0.1794,-0.5445,-0.1854,0.0877,-0.5445,-0.1715,-0.0528,-0.5445,-0.0686,-0.1657,-0.5445,0.0526,-0.1982,-0.5445,0.1774,-0.1029,-0.5445,0.1748,0.0403,-0.5445,0.0526,0.1982,-0.5445,0.2011,-0.0400,-0.5445,-0.2406,0.2406,-0.4825,-0.3399,0.0167,-0.4825,-0.2624,-0.2168,-0.4825,-0.0452,-0.3373,-0.4825,0.1974,-0.2771,-0.4825,0.3355,0.0564,-0.4825,0.2066,0.2705,-0.4825,-0.3337,0.0664,-0.4825,0.0000,0.4402,-0.8607,-0.1911,0.4614,-0.8607,-0.3237,0.3924,-0.8599,-0.3396,0.2801,-0.8607,-0.4514,0.2135,-0.8607,-0.5019,0.0843,-0.8599,-0.5039,-0.0695,-0.8599,-0.4410,-0.2343,-0.8607,-0.3591,-0.2717,-0.8607,-0.2635,-0.3759,-0.8607,-0.1682,-0.4701,-0.8607,0.0000,-0.5086,-0.8599,0.1287,-0.4921,-0.8599,0.2656,-0.4240,-0.8607,0.3353,-0.3700,-0.8607,0.4315,-0.2700,-0.8599,0.4921,-0.1287,-0.8599,0.4971,0.0477,-0.8607,0.4358,0.1136,-0.8607,0.3873,0.2465,-0.8607,0.3353,0.3700,-0.8607,0.1947,0.4699,-0.8599,0.0695,0.5039,-0.8599,-0.4916,0.1075,-0.8607,0.2723,-0.4199,-0.8607,0.1089,0.4980,-0.8599,-0.2716,-0.4237,-0.8607,0.4916,0.1075,-0.8607,-0.4418,0.0879,-0.8607,0.4153,0.2775,-0.8607,-0.1647,0.2808,-0.8607,-0.2779,0.0625,-0.8607,-0.2596,-0.1964,-0.8607,-0.0271,-0.2835,-0.8607,0.1641,-0.2328,-0.8607,0.3251,-0.0160,-0.8607,0.2014,0.2014,-0.8607,-0.1809,0.2707,-0.8607,-0.0853,0.5073,-0.8574,-0.4361,0.2729,-0.8574,-0.5014,-0.1154,-0.8574,-0.2599,-0.4439,-0.8574,0.1506,-0.4919,-0.8574,0.4650,-0.2199,-0.8574,0.4752,0.1968,-0.8574,0.1733,0.4843,-0.8574,-0.4994,0.0926,-0.8493,0.4186,-0.2876,-0.8493,-0.0914,0.5055,-0.8563,0.4224,-0.2939,-0.8574,-0.5065,0.0909,-0.8574,0.4220,0.2928,-0.8563,-0.1082,-0.4992,-0.8528]
  ];

  const LABELS = ['Cubes', 'Caméra', 'Parfum', 'Globe'];

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera3d = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera3d.position.set(0, 0, 2.5);

  // Particles geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  // Init with shape 0
  for (let i = 0; i < N * 3; i++) positions[i] = SHAPES[0][i];
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Particle sizes — vary for depth effect
  const sizes = new Float32Array(N);
  for (let i = 0; i < N; i++) sizes[i] = 0.02 + Math.random() * 0.03;
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0x00E5CC,
    size: 0.025,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Subtle ambient glow — second layer larger+dimmer
  const geo2 = new THREE.BufferGeometry();
  const pos2 = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) pos2[i] = SHAPES[0][i];
  geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
  const mat2 = new THREE.PointsMaterial({
    color: 0x00E5CC,
    size: 0.055,
    transparent: true,
    opacity: 0.12,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const points2 = new THREE.Points(geo2, mat2);
  scene.add(points2);

  // Morph state
  let fromPos = Float32Array.from(SHAPES[0]);
  let toPos = Float32Array.from(SHAPES[0]);
  let morphProgress = 1;
  const MORPH_DURATION = 1.4;
  let morphElapsed = 0;
  let currentShape = 0;

  function morphTo(index) {
    if (index === currentShape && morphProgress >= 1) return;
    fromPos = Float32Array.from(geometry.attributes.position.array);
    toPos = Float32Array.from(SHAPES[index]);
    morphProgress = 0;
    morphElapsed = 0;
    currentShape = index;
    if (label) {
      label.textContent = LABELS[index];
      label.style.opacity = '0.6';
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
  }

  // Resize
  function resize() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h);
    camera3d.aspect = w / h;
    camera3d.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let mouseX = 0, mouseY = 0;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  let autoRotY = 0;
  let lastTime = 0;

  function animate(time) {
    requestAnimationFrame(animate);
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    // Morph
    if (morphProgress < 1) {
      morphElapsed += dt;
      morphProgress = Math.min(morphElapsed / MORPH_DURATION, 1);
      const t = easeInOutCubic(morphProgress);
      const pos = geometry.attributes.position.array;
      const pos2arr = geo2.attributes.position.array;
      for (let i = 0; i < N * 3; i++) {
        const v = fromPos[i] + (toPos[i] - fromPos[i]) * t;
        pos[i] = v;
        pos2arr[i] = v;
      }
      geometry.attributes.position.needsUpdate = true;
      geo2.attributes.position.needsUpdate = true;
    }

    // Rotation
    autoRotY += dt * 0.25;
    const targetRotY = autoRotY + mouseX * 0.5;
    const targetRotX = mouseY * 0.3;
    points.rotation.y += (targetRotY - points.rotation.y) * 0.05;
    points.rotation.x += (targetRotX - points.rotation.x) * 0.05;
    points2.rotation.y = points.rotation.y;
    points2.rotation.x = points.rotation.x;

    // Float
    const floatY = Math.sin(time * 0.0008) * 0.06;
    points.position.y = floatY;
    points2.position.y = floatY;

    renderer.render(scene, camera3d);
  }
  requestAnimationFrame(animate);

  // Cards hover
  const slide5 = document.getElementById('slide-5');
  if (slide5) {
    const cards = slide5.querySelectorAll('.slide-card');
    cards.forEach((card, i) => {
      card.addEventListener('mouseenter', () => morphTo(i));
      card.addEventListener('mouseleave', () => {
        // stay on last hovered shape
      });
    });
  }
})();