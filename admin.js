(function () {
  'use strict';

  var APP_ID = 'custom-app-137010504-1';

  EcwidApp.init({
    app_id: APP_ID,
    autoloadedflag: true,
    autoheight: true
  });

  var HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

  var initialConfig = {
    public: {
      appEnabled: 'true',
      scrollThreshold: '25',
      shape: 'circle',
      buttonBackground: '#2563eb',
      iconColor: '#ffffff',
      progressBarColor: '#ffffff',
      icon: 'arrow-up',
      progressBarEnabled: 'true'
    },
    private: {
      installed: 'true'
    }
  };

  initialConfig.public = JSON.stringify(initialConfig.public);

  function sanitizeHex(value, fallback) {
    if (typeof value !== 'string') {
      return fallback;
    }
    var normalized = value.trim();
    if (!normalized.startsWith('#')) {
      normalized = '#' + normalized;
    }
    return HEX_COLOR.test(normalized) ? normalized.toLowerCase() : fallback;
  }

  function sanitizeThreshold(value) {
    var num = parseInt(value, 10);
    if (isNaN(num)) {
      return 25;
    }
    return Math.min(100, Math.max(0, num));
  }

  function readValuesFromPage() {
    var applicationConfig = {
      public: {},
      private: {}
    };

    var allInputs = document.querySelectorAll('[data-name][data-visibility]');

    for (var i = 0; i < allInputs.length; i++) {
      var input = allInputs[i];
      var fieldVisibility = input.dataset.visibility;
      var fieldName = input.dataset.name;

      if (!fieldVisibility || !fieldName) {
        continue;
      }

      if (input.tagName === 'INPUT') {
        if (input.type === 'radio') {
          if (input.checked) {
            applicationConfig[fieldVisibility][fieldName] = input.value;
          }
        } else if (input.type === 'checkbox') {
          applicationConfig[fieldVisibility][fieldName] = String(input.checked);
        } else if (
          input.type === 'text' ||
          input.type === 'number' ||
          input.type === 'color'
        ) {
          applicationConfig[fieldVisibility][fieldName] = input.value;
        }
      } else if (input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
        applicationConfig[fieldVisibility][fieldName] = input.value;
      }
    }

    applicationConfig.public.appEnabled =
      applicationConfig.public.appEnabled === 'true' ? 'true' : 'false';
    applicationConfig.public.progressBarEnabled =
      applicationConfig.public.progressBarEnabled === 'true' ? 'true' : 'false';
    applicationConfig.public.scrollThreshold = String(
      sanitizeThreshold(applicationConfig.public.scrollThreshold)
    );
    applicationConfig.public.buttonBackground = sanitizeHex(
      applicationConfig.public.buttonBackground,
      '#2563eb'
    );
    applicationConfig.public.iconColor = sanitizeHex(
      applicationConfig.public.iconColor,
      '#ffffff'
    );
    applicationConfig.public.progressBarColor = sanitizeHex(
      applicationConfig.public.progressBarColor,
      '#ffffff'
    );

    if (applicationConfig.public.shape !== 'square') {
      applicationConfig.public.shape = 'circle';
    }

    var allowedIcons = ['arrow-up', 'caret-up', 'chevron-up'];
    if (allowedIcons.indexOf(applicationConfig.public.icon) === -1) {
      applicationConfig.public.icon = 'arrow-up';
    }

    applicationConfig.public = JSON.stringify(applicationConfig.public);
    return applicationConfig;
  }

  function setValuesForPage(applicationConfig) {
    var applicationConfigTemp = {
      public: {},
      private: {}
    };

    if (applicationConfig.constructor === Array) {
      for (var i = 0; i < applicationConfig.length; i++) {
        if (applicationConfig[i].key !== 'public') {
          applicationConfigTemp.private[applicationConfig[i].key] =
            applicationConfig[i].value;
        } else {
          applicationConfigTemp[applicationConfig[i].key] =
            applicationConfig[i].value;
        }
      }
      applicationConfig = applicationConfigTemp;
    }

    applicationConfig.public = JSON.parse(applicationConfig.public);
    var allInputs = document.querySelectorAll('[data-name][data-visibility]');

    for (var j = 0; j < allInputs.length; j++) {
      var input = allInputs[j];
      var visibility = input.dataset.visibility;
      var name = input.dataset.name;
      var storedValue = applicationConfig[visibility][name];

      if (storedValue === undefined) {
        continue;
      }

      if (input.tagName === 'INPUT') {
        if (input.type === 'radio') {
          input.checked = storedValue === input.value;
          if (typeof checkFieldChange === 'function') {
            checkFieldChange(input);
          }
        } else if (input.type === 'checkbox') {
          input.checked = storedValue === 'true';
          if (typeof checkFieldChange === 'function') {
            checkFieldChange(input);
          }
        } else {
          input.value = storedValue;
          if (typeof checkFieldChange === 'function') {
            checkFieldChange(input);
          }
        }
      } else if (input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
        input.value = storedValue;
        if (typeof checkFieldChange === 'function') {
          checkFieldChange(input);
        }
      }
    }

    syncColorTextInputs();
    updatePreview();
  }

  function syncColorTextInputs() {
    var pairs = document.querySelectorAll('[data-color-sync]');
    for (var i = 0; i < pairs.length; i++) {
      var picker = pairs[i];
      var textInput = document.querySelector(
        '[data-color-text="' + picker.dataset.colorSync + '"]'
      );
      if (textInput) {
        textInput.value = picker.value;
      }
    }
  }

  function updatePreview() {
    var preview = document.getElementById('scroll-top-preview');
    if (!preview) {
      return;
    }

    var shape = document.querySelector('[data-name="shape"]');
    var bg = document.querySelector('[data-name="buttonBackground"]');
    var icon = document.querySelector('[data-name="iconColor"]');
    var progress = document.querySelector('[data-name="progressBarColor"]');
    var iconType = document.querySelector('[data-name="icon"]:checked') ||
      document.querySelector('[data-name="icon"]');
    var progressEnabled = document.querySelector('[data-name="progressBarEnabled"]');

    preview.className = 'scroll-preview scroll-preview--' + (shape ? shape.value : 'circle');
    preview.style.backgroundColor = bg ? sanitizeHex(bg.value, '#2563eb') : '#2563eb';
    preview.style.color = icon ? sanitizeHex(icon.value, '#ffffff') : '#ffffff';
    preview.style.setProperty(
      '--preview-progress-color',
      progress ? sanitizeHex(progress.value, '#ffffff') : '#ffffff'
    );

    var iconEl = preview.querySelector('.scroll-preview__icon');
    if (iconEl && iconType) {
      iconEl.innerHTML = getPreviewIconMarkup(iconType.value || 'arrow-up');
    }

    preview.classList.toggle(
      'scroll-preview--progress',
      progressEnabled ? progressEnabled.checked : true
    );
  }

  function getPreviewIconMarkup(iconName) {
    var icons = {
      'arrow-up':
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4l-7 7h4v9h6v-9h4z"/></svg>',
      'caret-up':
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 6l-8 8h16z"/></svg>',
      'chevron-up':
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>'
    };
    return icons[iconName] || icons['arrow-up'];
  }

  function createUserData() {
    EcwidApp.setAppStorage(initialConfig.private, function () {
      console.log('Initial private preferences saved.');
    });

    EcwidApp.setAppPublicConfig(initialConfig.public, function () {
      console.log('Initial public preferences saved.');
    });

    setValuesForPage(initialConfig);
  }

  function getUserData() {
    EcwidApp.getAppStorage(function (allValues) {
      setValuesForPage(allValues);
    });
  }

  function saveUserData() {
    var saveData = readValuesFromPage();

    EcwidApp.setAppStorage(saveData.private, function () {
      console.log('Private preferences saved.');
    });

    EcwidApp.setAppPublicConfig(saveData.public, function () {
      console.log('Public preferences saved.');
    });

    updatePreview();
  }

  function bindAutosave() {
    var fields = document.querySelectorAll(
      '.field__input, .field__select, .field__textarea, .radio input, input[type="color"]'
    );

    for (var i = 0; i < fields.length; i++) {
      fields[i].addEventListener('change', function () {
        saveUserData();
      });

      fields[i].addEventListener('blur', function () {
        if (typeof checkFieldChange === 'function') {
          checkFieldChange(this);
        }
        saveUserData();
      });
    }

    var colorPickers = document.querySelectorAll('[data-color-sync]');
    for (var j = 0; j < colorPickers.length; j++) {
      colorPickers[j].addEventListener('input', function () {
        var textInput = document.querySelector(
          '[data-color-text="' + this.dataset.colorSync + '"]'
        );
        if (textInput) {
          textInput.value = this.value;
        }
        updatePreview();
      });
    }

    var colorTexts = document.querySelectorAll('[data-color-text]');
    for (var k = 0; k < colorTexts.length; k++) {
      colorTexts[k].addEventListener('input', function () {
        var picker = document.querySelector(
          '[data-color-sync="' + this.dataset.colorText + '"]'
        );
        var sanitized = sanitizeHex(this.value, picker ? picker.value : '#000000');
        this.value = sanitized;
        if (picker) {
          picker.value = sanitized;
        }
        updatePreview();
      });

      colorTexts[k].addEventListener('blur', function () {
        saveUserData();
      });
    }
  }

  EcwidApp.getAppStorage('installed', function (value) {
    if (value != null) {
      getUserData();
    } else {
      createUserData();
    }
    bindAutosave();
  });
})();
