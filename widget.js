(function () {
  'use strict';

  var APP_ID = 'custom-app-137010504-1';
  var ROOT_ID = 'est-scroll-top-root';
  var initialized = false;

  var DEFAULTS = {
    appEnabled: true,
    scrollThreshold: 25,
    brandPreset: 'ocean',
    shape: 'circle',
    buttonLabel: '',
    buttonEffect: 'glow',
    glowColor: '#2563eb',
    gradientEnd: '#1d4ed8',
    borderEnabled: false,
    borderColor: '#ffffff',
    buttonBackground: '#2563eb',
    buttonBackgroundOpacity: 100,
    iconColor: '#ffffff',
    progressBarColor: '#ffffff',
    icon: 'chevron-up',
    iconUrl: '',
    progressBarEnabled: true
  };

  var SHAPES = ['circle', 'square', 'pill', 'rectangle'];
  var EFFECTS = ['none', 'glow', 'glass', 'gradient'];

  var ICONS = {
    'chevron-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>',
    'chevron-double-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 13l5-5 5 5M7 18l5-5 5 5z"/></svg>',
    'arrow-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4l-7 7h4v9h6v-9h4z"/></svg>',
    'arrow-up-long':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7"/></svg>',
    'caret-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 6l-8 8h16z"/></svg>',
    'caret-double-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4l-7 7h14zM12 13l-7 7h14z"/></svg>',
    'triangle-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3L3 20h18z"/></svg>',
    'circle-arrow-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 6H11v5.25l-2.5-2.5-.75.75L12 15.5l4.25-4.25-.75-.75-2.5 2.5V8z"/></svg>',
    'line-arrow-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 20V6M8 10l4-4 4 4"/></svg>'
  };

  function unwrapConfigRaw(raw) {
    if (raw == null || raw === '') {
      return null;
    }

    if (typeof raw === 'string') {
      return raw;
    }

    if (typeof raw === 'object') {
      if (typeof raw.value === 'string') {
        return raw.value;
      }
      return raw;
    }

    return null;
  }

  function parseConfig(raw) {
    var config = {};
    var unwrapped = unwrapConfigRaw(raw);

    if (!unwrapped) {
      return Object.assign({}, DEFAULTS);
    }

    if (typeof unwrapped === 'string') {
      try {
        config = JSON.parse(unwrapped);
      } catch (error) {
        return Object.assign({}, DEFAULTS);
      }
    } else if (typeof unwrapped === 'object') {
      config = unwrapped;
    }

    var shape = SHAPES.indexOf(config.shape) !== -1 ? config.shape : DEFAULTS.shape;
    var buttonEffect =
      EFFECTS.indexOf(config.buttonEffect) !== -1
        ? config.buttonEffect
        : DEFAULTS.buttonEffect;
    var buttonLabel =
      typeof config.buttonLabel === 'string' ? config.buttonLabel.trim().slice(0, 16) : '';

    return {
      appEnabled: String(config.appEnabled) === 'true',
      scrollThreshold: clampThreshold(config.scrollThreshold),
      brandPreset:
        typeof config.brandPreset === 'string' ? config.brandPreset : DEFAULTS.brandPreset,
      shape: shape,
      buttonLabel: buttonLabel,
      buttonEffect: buttonEffect,
      glowColor: sanitizeHex(config.glowColor, DEFAULTS.glowColor),
      gradientEnd: sanitizeHex(config.gradientEnd, DEFAULTS.gradientEnd),
      borderEnabled: String(config.borderEnabled) === 'true',
      borderColor: sanitizeHex(config.borderColor, DEFAULTS.borderColor),
      buttonBackground: sanitizeHex(config.buttonBackground, DEFAULTS.buttonBackground),
      buttonBackgroundOpacity: clampOpacity(
        config.buttonBackgroundOpacity,
        DEFAULTS.buttonBackgroundOpacity
      ),
      iconColor: sanitizeHex(config.iconColor, DEFAULTS.iconColor),
      progressBarColor: sanitizeHex(config.progressBarColor, DEFAULTS.progressBarColor),
      icon: ICONS[config.icon] ? config.icon : DEFAULTS.icon,
      iconUrl: sanitizeIconUrl(config.iconUrl),
      progressBarEnabled: String(config.progressBarEnabled) === 'true'
    };
  }

  function sanitizeIconUrl(value) {
    if (typeof value !== 'string') {
      return '';
    }
    var trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    try {
      var url = new URL(trimmed);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return url.href;
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  function getIconMarkup(config) {
    if (config.iconUrl) {
      return '<img src="' + config.iconUrl + '" alt="" aria-hidden="true">';
    }
    return ICONS[config.icon] || ICONS['chevron-up'];
  }

  function sanitizeHex(value, fallback) {
    if (typeof value !== 'string') {
      return fallback;
    }
    var normalized = value.trim();
    if (!normalized.startsWith('#')) {
      normalized = '#' + normalized;
    }
    return /^#[0-9a-fA-F]{6}$/.test(normalized)
      ? normalized.toLowerCase()
      : fallback;
  }

  function clampThreshold(value) {
    var num = parseInt(value, 10);
    if (isNaN(num)) {
      return DEFAULTS.scrollThreshold;
    }
    return Math.min(100, Math.max(0, num));
  }

  function clampOpacity(value, fallback) {
    var num = parseInt(value, 10);
    if (isNaN(num)) {
      return typeof fallback === 'number' ? fallback : 100;
    }
    return Math.min(100, Math.max(0, num));
  }

  function hexToRgba(hex, alpha) {
    var normalized = sanitizeHex(hex, '#000000');
    var opacity = Math.min(1, Math.max(0, alpha));
    var r = parseInt(normalized.slice(1, 3), 16);
    var g = parseInt(normalized.slice(3, 5), 16);
    var b = parseInt(normalized.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
  }

  function getPublicConfig() {
    if (typeof Ecwid !== 'undefined' && typeof Ecwid.getAppPublicConfig === 'function') {
      return parseConfig(Ecwid.getAppPublicConfig(APP_ID));
    }
    return Object.assign({}, DEFAULTS);
  }

  function injectStyles(config) {
    if (document.getElementById('est-scroll-top-styles')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'est-scroll-top-styles';
    style.textContent =
      '#' +
      ROOT_ID +
      '{position:fixed;right:80px;bottom:80px;z-index:99999;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(12px);transition:opacity .25s ease,transform .25s ease,visibility .25s ease}' +
      '#' +
      ROOT_ID +
      '.est-visible{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}' +
      '.est-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;width:52px;height:52px;padding:0;border:0;background:transparent;cursor:pointer;outline:none;box-shadow:0 8px 24px rgba(15,23,42,.18)}' +
      '.est-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
      '.est-btn--circle{border-radius:50%}' +
      '.est-btn--square{border-radius:10px}' +
      '.est-btn--pill{width:auto;min-width:52px;height:44px;padding:0 16px;border-radius:999px}' +
      '.est-btn--rectangle{width:auto;min-width:52px;height:44px;padding:0 14px;border-radius:6px}' +
      '.est-btn__surface{position:absolute;inset:0;background:var(--est-bg);border-radius:inherit}' +
      '.est-btn--gradient .est-btn__surface{background:linear-gradient(135deg,var(--est-bg),var(--est-gradient-end))}' +
      '.est-btn--glass .est-btn__surface,.est-btn--translucent .est-btn__surface{background:var(--est-bg-alpha)}' +
      '.est-btn--glass .est-btn__surface{backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}' +
      '.est-btn--bordered .est-btn__surface{border:1px solid var(--est-border)}' +
      '.est-btn--glow{box-shadow:0 0 18px var(--est-glow),0 8px 24px rgba(15,23,42,.18)}' +
      '.est-progress{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}' +
      '.est-progress__track,.est-progress__bar{fill:none;stroke-width:3;vector-effect:non-scaling-stroke}' +
      '.est-progress__track{stroke:rgba(255,255,255,.22)}' +
      '.est-progress__bar{stroke:var(--est-progress);transition:stroke-dashoffset .12s linear}' +
      '.est-icon{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:22px;height:22px;color:var(--est-icon);flex-shrink:0}' +
      '.est-btn--pill .est-icon,.est-btn--rectangle .est-icon{width:16px;height:16px}' +
      '.est-label{position:relative;z-index:1;font-size:12px;font-weight:700;letter-spacing:.04em;line-height:1;color:var(--est-icon);white-space:nowrap}' +
      '.est-icon svg,.est-icon img{width:100%;height:100%;display:block}' +
      '.est-icon img{object-fit:contain}';

    document.head.appendChild(style);
  }

  var PROGRESS_STROKE = 3;

  function getProgressRectRadius(shape, innerHeight) {
    if (shape === 'pill') {
      return innerHeight / 2;
    }
    if (shape === 'rectangle') {
      return Math.min(6, innerHeight / 2);
    }
    if (shape === 'square') {
      return Math.min(10, innerHeight / 2);
    }
    return Math.min(8, innerHeight / 2);
  }

  function applyProgressShapeGeometry(width, height, shape, trackEl, barEl) {
    var inset = PROGRESS_STROKE / 2;

    if (shape === 'circle') {
      var radius = Math.min(width - PROGRESS_STROKE, height - PROGRESS_STROKE) / 2;
      var cx = width / 2;
      var cy = height / 2;

      trackEl.setAttribute('cx', String(cx));
      trackEl.setAttribute('cy', String(cy));
      trackEl.setAttribute('r', String(radius));
      barEl.setAttribute('cx', String(cx));
      barEl.setAttribute('cy', String(cy));
      barEl.setAttribute('r', String(radius));
      barEl.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy + ')');
      return;
    }

    var innerW = width - PROGRESS_STROKE;
    var innerH = height - PROGRESS_STROKE;
    var rx = getProgressRectRadius(shape, innerH);
    var rectAttrs = {
      x: String(inset),
      y: String(inset),
      width: String(innerW),
      height: String(innerH),
      rx: String(rx)
    };

    trackEl.setAttribute('x', rectAttrs.x);
    trackEl.setAttribute('y', rectAttrs.y);
    trackEl.setAttribute('width', rectAttrs.width);
    trackEl.setAttribute('height', rectAttrs.height);
    trackEl.setAttribute('rx', rectAttrs.rx);
    barEl.setAttribute('x', rectAttrs.x);
    barEl.setAttribute('y', rectAttrs.y);
    barEl.setAttribute('width', rectAttrs.width);
    barEl.setAttribute('height', rectAttrs.height);
    barEl.setAttribute('rx', rectAttrs.rx);
    barEl.setAttribute('fill', 'none');
  }

  function syncProgressSvgGeometry(button, progressSvg, shape) {
    if (!button || !progressSvg) {
      return null;
    }

    var width = button.offsetWidth;
    var height = button.offsetHeight;
    if (width < 2 || height < 2) {
      return null;
    }

    progressSvg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    progressSvg.removeAttribute('preserveAspectRatio');

    var trackEl = progressSvg.querySelector('.est-progress__track');
    var barEl = progressSvg.querySelector('.est-progress__bar');
    if (!trackEl || !barEl) {
      return null;
    }

    applyProgressShapeGeometry(width, height, shape, trackEl, barEl);
    return barEl;
  }

  function appendProgressSvg(button, config) {
    var progressSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    progressSvg.setAttribute('class', 'est-progress');
    progressSvg.setAttribute('aria-hidden', 'true');

    if (config.shape === 'circle') {
      var trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      trackCircle.setAttribute('class', 'est-progress__track');

      var barCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      barCircle.setAttribute('class', 'est-progress__bar');

      progressSvg.appendChild(trackCircle);
      progressSvg.appendChild(barCircle);
    } else {
      var trackRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      trackRect.setAttribute('class', 'est-progress__track');

      var barRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      barRect.setAttribute('class', 'est-progress__bar');

      progressSvg.appendChild(trackRect);
      progressSvg.appendChild(barRect);
    }

    button.appendChild(progressSvg);
    return progressSvg;
  }

  function createButton(config) {
    var root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('aria-hidden', 'true');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'est-btn est-btn--' + config.shape;
    if (config.buttonEffect === 'glow') {
      button.classList.add('est-btn--glow');
    }
    if (config.buttonEffect === 'glass') {
      button.classList.add('est-btn--glass');
    } else if (config.buttonBackgroundOpacity < 100) {
      button.classList.add('est-btn--translucent');
    }
    if (config.buttonEffect === 'gradient') {
      button.classList.add('est-btn--gradient');
    }
    if (config.borderEnabled || config.buttonEffect === 'glass') {
      button.classList.add('est-btn--bordered');
    }
    button.setAttribute(
      'aria-label',
      config.buttonLabel ? 'Scroll to top: ' + config.buttonLabel : 'Scroll to top'
    );
    button.style.setProperty('--est-bg', config.buttonBackground);
    button.style.setProperty(
      '--est-bg-alpha',
      hexToRgba(config.buttonBackground, config.buttonBackgroundOpacity / 100)
    );
    button.style.setProperty('--est-icon', config.iconColor);
    button.style.setProperty('--est-progress', config.progressBarColor);
    button.style.setProperty('--est-glow', config.glowColor);
    button.style.setProperty('--est-gradient-end', config.gradientEnd);
    button.style.setProperty('--est-border', config.borderColor);

    var surface = document.createElement('span');
    surface.className = 'est-btn__surface';
    button.appendChild(surface);

    var progressSvg = null;
    if (config.progressBarEnabled) {
      progressSvg = appendProgressSvg(button, config);
    }

    var iconWrap = document.createElement('span');
    iconWrap.className = 'est-icon';
    iconWrap.innerHTML = getIconMarkup(config);
    button.appendChild(iconWrap);

    if (config.buttonLabel) {
      var labelWrap = document.createElement('span');
      labelWrap.className = 'est-label';
      labelWrap.textContent = config.buttonLabel;
      button.appendChild(labelWrap);
    }

    root.appendChild(button);
    document.body.appendChild(root);

    var progressBar = null;
    var progressLength = 0;
    if (progressSvg) {
      progressBar = syncProgressSvgGeometry(button, progressSvg, config.shape);
      progressLength =
        progressBar && typeof progressBar.getTotalLength === 'function'
          ? progressBar.getTotalLength()
          : 0;
    }

    return {
      root: root,
      button: button,
      progressSvg: progressSvg,
      progressBar: progressBar,
      progressLength: progressLength,
      progressEnabled: config.progressBarEnabled,
      shape: config.shape,
      threshold: config.scrollThreshold
    };
  }

  function bindProgressResize(state) {
    if (!state.progressSvg || typeof ResizeObserver === 'undefined') {
      return;
    }

    var resizeObserver = new ResizeObserver(function () {
      var bar = syncProgressSvgGeometry(state.button, state.progressSvg, state.shape);
      if (!bar) {
        return;
      }

      state.progressBar = bar;
      state.progressLength =
        typeof bar.getTotalLength === 'function' ? bar.getTotalLength() : state.progressLength;
      updateProgress(state, getScrollMetrics().progress);
    });

    resizeObserver.observe(state.button);
  }

  function getScrollMetrics() {
    var scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var maxScroll = scrollHeight - viewportHeight;
    var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    var progress = maxScroll > 0 ? scrollY / maxScroll : 0;

    return {
      scrollY: scrollY,
      maxScroll: maxScroll,
      progress: Math.min(1, Math.max(0, progress))
    };
  }

  function updateProgress(state, progress) {
    if (!state.progressEnabled || !state.progressBar) {
      return;
    }

    var length = state.progressLength;

    if (!length) {
      length = state.shape === 'circle' ? 2 * Math.PI * 23 : 188;
    }

    if (!length) {
      return;
    }

    var offset = length * (1 - progress);
    state.progressBar.style.strokeDasharray = String(length);
    state.progressBar.style.strokeDashoffset = String(offset);
  }

  function bindScrollBehavior(state) {
    var ticking = false;

    function refresh() {
      ticking = false;
      var metrics = getScrollMetrics();
      var thresholdRatio = state.threshold / 100;
      var shouldShow =
        metrics.maxScroll > 0 && metrics.progress >= thresholdRatio;

      state.root.classList.toggle('est-visible', shouldShow);
      state.root.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
      updateProgress(state, metrics.progress);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(refresh);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    refresh();
  }

  function initStorefront() {
    if (initialized || document.getElementById(ROOT_ID)) {
      return;
    }

    if (!document.body) {
      return;
    }

    var config = getPublicConfig();
    if (!config.appEnabled) {
      return;
    }

    injectStyles(config);

    var state;
    try {
      state = createButton(config);
    } catch (error) {
      console.error('Scroll to Top: failed to create button', error);
      return;
    }

    initialized = true;

    state.button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    bindProgressResize(state);
    bindScrollBehavior(state);
  }

  function scheduleInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initStorefront);
      return;
    }

    initStorefront();
  }

  function boot() {
    if (typeof Ecwid !== 'undefined' && Ecwid.OnAPILoaded && typeof Ecwid.OnAPILoaded.add === 'function') {
      Ecwid.OnAPILoaded.add(initStorefront);
    }

    scheduleInit();

    if (typeof Ecwid === 'undefined') {
      var attempts = 0;
      var poll = window.setInterval(function () {
        attempts += 1;

        if (typeof Ecwid !== 'undefined') {
          window.clearInterval(poll);

          if (Ecwid.OnAPILoaded && typeof Ecwid.OnAPILoaded.add === 'function') {
            Ecwid.OnAPILoaded.add(initStorefront);
          }

          initStorefront();
        } else if (attempts >= 40) {
          window.clearInterval(poll);
        }
      }, 250);
    }
  }

  boot();
})();
