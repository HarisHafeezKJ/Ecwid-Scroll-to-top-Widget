(function () {
  'use strict';

  var APP_ID = 'custom-app-137010504-1';
  var ROOT_ID = 'est-scroll-top-root';
  var initialized = false;

  var DEFAULTS = {
    appEnabled: true,
    scrollThreshold: 25,
    shape: 'circle',
    buttonBackground: '#2563eb',
    iconColor: '#ffffff',
    progressBarColor: '#ffffff',
    icon: 'arrow-up',
    progressBarEnabled: true
  };

  var ICONS = {
    'arrow-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4l-7 7h4v9h6v-9h4z"/></svg>',
    'caret-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 6l-8 8h16z"/></svg>',
    'chevron-up':
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>'
  };

  function parseConfig(raw) {
    var config = {};

    if (!raw) {
      return Object.assign({}, DEFAULTS);
    }

    if (typeof raw === 'string') {
      try {
        config = JSON.parse(raw);
      } catch (error) {
        return Object.assign({}, DEFAULTS);
      }
    } else if (typeof raw === 'object') {
      config = raw;
    }

    return {
      appEnabled: String(config.appEnabled) === 'true',
      scrollThreshold: clampThreshold(config.scrollThreshold),
      shape: config.shape === 'square' ? 'square' : 'circle',
      buttonBackground: sanitizeHex(config.buttonBackground, DEFAULTS.buttonBackground),
      iconColor: sanitizeHex(config.iconColor, DEFAULTS.iconColor),
      progressBarColor: sanitizeHex(config.progressBarColor, DEFAULTS.progressBarColor),
      icon: ICONS[config.icon] ? config.icon : DEFAULTS.icon,
      progressBarEnabled: String(config.progressBarEnabled) === 'true'
    };
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
      '{position:fixed;right:24px;bottom:24px;z-index:99999;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(12px);transition:opacity .25s ease,transform .25s ease,visibility .25s ease}' +
      '#' +
      ROOT_ID +
      '.est-visible{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}' +
      '.est-btn{position:relative;display:flex;align-items:center;justify-content:center;width:52px;height:52px;padding:0;border:0;background:transparent;cursor:pointer;outline:none;box-shadow:0 8px 24px rgba(15,23,42,.18)}' +
      '.est-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
      '.est-btn--circle{border-radius:50%}' +
      '.est-btn--square{border-radius:10px}' +
      '.est-btn__surface{position:absolute;inset:0;background:var(--est-bg);border-radius:inherit}' +
      '.est-btn--square .est-btn__surface{border-radius:10px}' +
      '.est-progress{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}' +
      '.est-progress__track,.est-progress__bar{fill:none;stroke-width:3;vector-effect:non-scaling-stroke}' +
      '.est-progress__track{stroke:rgba(255,255,255,.22)}' +
      '.est-progress__bar{stroke:var(--est-progress);transition:stroke-dashoffset .12s linear}' +
      '.est-icon{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:22px;height:22px;color:var(--est-icon)}' +
      '.est-icon svg{width:100%;height:100%;display:block}';

    document.head.appendChild(style);
  }

  function createButton(config) {
    var root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('aria-hidden', 'true');

    var button = document.createElement('button');
    button.type = 'button';
    button.className =
      'est-btn est-btn--' + (config.shape === 'square' ? 'square' : 'circle');
    button.setAttribute('aria-label', 'Scroll to top');
    button.style.setProperty('--est-bg', config.buttonBackground);
    button.style.setProperty('--est-icon', config.iconColor);
    button.style.setProperty('--est-progress', config.progressBarColor);

    var surface = document.createElement('span');
    surface.className = 'est-btn__surface';
    button.appendChild(surface);

    var progressSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    progressSvg.setAttribute('class', 'est-progress');
    progressSvg.setAttribute('viewBox', '0 0 52 52');
    progressSvg.setAttribute('aria-hidden', 'true');

    if (config.shape === 'circle') {
      var trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      trackCircle.setAttribute('class', 'est-progress__track');
      trackCircle.setAttribute('cx', '26');
      trackCircle.setAttribute('cy', '26');
      trackCircle.setAttribute('r', '23');

      var barCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      barCircle.setAttribute('class', 'est-progress__bar');
      barCircle.setAttribute('cx', '26');
      barCircle.setAttribute('cy', '26');
      barCircle.setAttribute('r', '23');
      barCircle.setAttribute('transform', 'rotate(-90 26 26)');

      progressSvg.appendChild(trackCircle);
      progressSvg.appendChild(barCircle);
    } else {
      var trackRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      trackRect.setAttribute('class', 'est-progress__track');
      trackRect.setAttribute('x', '3');
      trackRect.setAttribute('y', '3');
      trackRect.setAttribute('width', '46');
      trackRect.setAttribute('height', '46');
      trackRect.setAttribute('rx', '8');

      var barRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      barRect.setAttribute('class', 'est-progress__bar');
      barRect.setAttribute('x', '3');
      barRect.setAttribute('y', '3');
      barRect.setAttribute('width', '46');
      barRect.setAttribute('height', '46');
      barRect.setAttribute('rx', '8');
      barRect.setAttribute('fill', 'none');

      progressSvg.appendChild(trackRect);
      progressSvg.appendChild(barRect);
    }

    if (config.progressBarEnabled) {
      button.appendChild(progressSvg);
    }

    var iconWrap = document.createElement('span');
    iconWrap.className = 'est-icon';
    iconWrap.innerHTML = ICONS[config.icon] || ICONS['arrow-up'];
    button.appendChild(iconWrap);

    root.appendChild(button);
    document.body.appendChild(root);

    var progressBar = progressSvg.querySelector('.est-progress__bar');
    var progressLength = progressBar ? progressBar.getTotalLength() : 0;

    return {
      root: root,
      button: button,
      progressBar: progressBar,
      progressLength: progressLength,
      progressEnabled: config.progressBarEnabled,
      shape: config.shape,
      threshold: config.scrollThreshold
    };
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

    if (!length && state.shape === 'circle') {
      length = 2 * Math.PI * 23;
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

    var config = getPublicConfig();
    if (!config.appEnabled) {
      return;
    }

    initialized = true;
    injectStyles(config);
    var state = createButton(config);

    state.button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    bindScrollBehavior(state);
  }

  function boot() {
    if (typeof Ecwid !== 'undefined' && Ecwid.OnAPILoaded && Ecwid.OnAPILoaded.add) {
      Ecwid.OnAPILoaded.add(initStorefront);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initStorefront);
    } else {
      initStorefront();
    }
  }

  boot();
})();
