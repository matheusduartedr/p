/**
 * QUANTUM HUB — Application Navigation & Android Back Button Stack
 */

window.QuantumRouter = (function () {
  'use strict';

  var navHistory = ['hub'];
  var currentView = 'hub';
  var lastBackPressTime = 0;
  var activeModalCloser = null;

  function init() {
    setupCapacitorBackButton();
    setupDOMNavListeners();
    setupThemeToggle();
  }

  function navigateTo(viewId, params, isBackNav) {
    if (!viewId || viewId === currentView) return;

    var previousView = currentView;
    currentView = viewId;

    if (!isBackNav) {
      navHistory.push(viewId);
    }

    // Update View DOM classes
    document.querySelectorAll('.app-view').forEach(function (v) {
      v.classList.remove('active-view');
    });

    var targetView = document.getElementById('view-' + viewId);
    if (targetView) {
      targetView.classList.add('active-view');
      targetView.scrollTop = 0;
    }

    // Update Bottom / Sidebar Nav highlights
    document.querySelectorAll('.nav-tab-btn').forEach(function (btn) {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active-tab');
      } else {
        btn.classList.remove('active-tab');
      }
    });

    // Lifecycle triggers for simulation engines
    handleViewLifecycle(previousView, currentView, params);
  }

  function handleViewLifecycle(prev, next, params) {
    // 1. Pausing / starting Espectro 3D
    if (next === 'espectro') {
      if (window.initSpec3D) {
        window.initSpec3D();
      }
      if (window.drawSpectrum) {
        requestAnimationFrame(function () {
          window.drawSpectrum();
        });
      }
    } else if (prev === 'espectro') {
      if (window.stopSpec3D) {
        window.stopSpec3D();
      }
    }

    // 2. Initializing / configuring PROTON
    if (next === 'proton') {
      if (window.initProtonSimulation) {
        window.initProtonSimulation(params);
      }
    }

    // 3. Proxima ATT
    if (next === 'construcao') {
      if (window.initProximaAtt) {
        window.initProximaAtt();
      }
    }
  }

  function goBack() {
    // 1. Check if an active modal is open
    if (activeModalCloser) {
      activeModalCloser();
      activeModalCloser = null;
      return true;
    }

    var openModals = document.querySelectorAll('.app-modal-backdrop.modal-open');
    if (openModals.length > 0) {
      openModals.forEach(function (m) { m.classList.remove('modal-open'); });
      return true;
    }

    // 2. Check history stack
    if (navHistory.length > 1) {
      navHistory.pop(); // Remove current
      var previous = navHistory[navHistory.length - 1];
      navigateTo(previous, null, true);
      return true;
    }

    // 3. At Root View ('hub'): double-tap to exit application
    var now = Date.now();
    if (now - lastBackPressTime < 2000) {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
      }
    } else {
      lastBackPressTime = now;
      showToast('Pressione voltar novamente para sair do QUANTUM HUB');
    }
    return false;
  }

  function setupCapacitorBackButton() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', function () {
        goBack();
      });
    }

    // Fallback for browser back button testing
    window.addEventListener('popstate', function () {
      goBack();
    });
  }

  function setupDOMNavListeners() {
    document.querySelectorAll('[data-view-target]').forEach(function (el) {
      el.addEventListener('click', function () {
        var target = el.getAttribute('data-view-target');
        var mode = el.getAttribute('data-sim-mode');
        var view = el.getAttribute('data-sim-view');
        navigateTo(target, { mode: mode, view: view });
      });
    });
  }

  function setupThemeToggle() {
    var toggleBtn = document.getElementById('btn-global-theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        document.body.classList.toggle('theme-light');
        var isLight = document.body.classList.contains('theme-light');
        toggleBtn.innerHTML = isLight ? '🌙' : '☀️';
        
        // Notify renderers of theme change
        if (window.updateThemeAll) {
          window.updateThemeAll(isLight ? 'white' : 'black');
        }
      });
    }
  }

  function registerModalCloser(closerFn) {
    activeModalCloser = closerFn;
  }

  function showToast(message) {
    var toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(6,12,28,0.92);color:#00ccff;border:1px solid rgba(0,204,255,0.4);padding:10px 20px;border-radius:24px;font-size:0.85rem;z-index:99999;box-shadow:0 8px 30px rgba(0,0,0,0.5);backdrop-filter:blur(8px);transition:opacity 0.3s;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(function () {
      toast.style.opacity = '0';
    }, 2000);
  }

  return {
    init: init,
    navigateTo: navigateTo,
    goBack: goBack,
    registerModalCloser: registerModalCloser,
    showToast: showToast,
    getCurrentView: function () { return currentView; }
  };
})();
