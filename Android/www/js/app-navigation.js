/**
 * QUANTUM HUB — Application Navigation & Android Back Button Stack
 */

window.QuantumRouter = (function () {
  'use strict';

  var navHistory = ['hub'];
  var currentView = 'hub';
  var lastBackPressTime = 0;

  function init() {
    setupCapacitorBackButton();
    setupDOMNavListeners();
    setupThemeToggle();
  }

  function navigateTo(viewId, params, isBackNav) {
    if (!viewId || viewId === currentView) return;
    var previousView = currentView;
    currentView = viewId;
    if (!isBackNav) navHistory.push(viewId);

    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));
    var targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active-view');

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active-tab', btn.getAttribute('data-view') === viewId);
    });

    handleViewLifecycle(previousView, currentView, params);
  }

  function handleViewLifecycle(prev, next, params) {
    if (next === 'espectro') HubEngine.drawSpectrum();
    if (next === 'proton') ProtonEngine.init(params);
    if (next === 'construcao') ProximaEngine.init();
  }

  function goBack() {
    if (navHistory.length > 1) {
      navHistory.pop();
      navigateTo(navHistory[navHistory.length - 1], null, true);
      return true;
    }
    var now = Date.now();
    if (now - lastBackPressTime < 2000) {
      if (window.Capacitor?.Plugins?.App) window.Capacitor.Plugins.App.exitApp();
    } else {
      lastBackPressTime = now;
      HubEngine.showToast?.('Pressione voltar novamente para sair');
    }
    return false;
  }

  function setupCapacitorBackButton() {
    window.Capacitor?.Plugins?.App?.addListener('backButton', goBack);
    window.addEventListener('popstate', goBack);
  }

  function setupDOMNavListeners() {
    document.querySelectorAll('[data-view-target]').forEach(el => {
      el.addEventListener('click', () => {
        navigateTo(el.getAttribute('data-view-target'), {
          mode: el.getAttribute('data-sim-mode'),
          view: el.getAttribute('data-sim-view')
        });
      });
    });
  }

  function setupThemeToggle() {
    var btn = document.getElementById('btn-global-theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        var isL = document.body.classList.contains('theme-light');
        btn.innerHTML = isL ? '🌙' : '☀️';
        HubEngine.updateTheme(isL ? 'white' : 'black');
        ProtonEngine.setBackground(isL ? 'white' : 'black');
      });
    }
  }

  return { init, navigateTo, goBack };
})();
