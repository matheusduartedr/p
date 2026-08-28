/**
 * QUANTUM HUB — Universal Gesture Controls & Viewport Observer
 * Enables smooth 1-finger orbit drag, 2-finger pinch-to-zoom, and dynamic ResizeObserver
 */

window.QuantumGestures = (function () {
  'use strict';

  /**
   * Clamps device pixel ratio to maintain 60 FPS on high-DPI mobile screens
   */
  function getOptimalPixelRatio() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  /**
   * Attaches unified pointer and multi-touch gestures to a 3D Canvas
   * @param {HTMLElement} canvasElement 
   * @param {Object} options callbacks { onRotate(dx, dy), onZoom(delta), onReset() }
   */
  function attachCanvasGestures(canvasElement, options) {
    if (!canvasElement) return;

    var activePointers = new Map();
    var lastPinchDistance = 0;
    var isDragging = false;
    var lastX = 0;
    var lastY = 0;
    var lastTapTime = 0;

    canvasElement.style.touchAction = 'none';

    function getDistance(p1, p2) {
      var dx = p1.clientX - p2.clientX;
      var dy = p1.clientY - p2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    canvasElement.addEventListener('pointerdown', function (e) {
      canvasElement.setPointerCapture(e.pointerId);
      activePointers.set(e.pointerId, e);

      // Double tap reset check
      var now = Date.now();
      if (activePointers.size === 1 && (now - lastTapTime) < 300) {
        if (options.onReset) options.onReset();
      }
      lastTapTime = now;

      if (activePointers.size === 1) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      } else if (activePointers.size === 2) {
        isDragging = false;
        var pts = Array.from(activePointers.values());
        lastPinchDistance = getDistance(pts[0], pts[1]);
      }
    });

    canvasElement.addEventListener('pointermove', function (e) {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, e);

      if (activePointers.size === 1 && isDragging) {
        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        if (options.onRotate) {
          options.onRotate(dx, dy);
        }
      } else if (activePointers.size === 2) {
        var pts = Array.from(activePointers.values());
        var currentDist = getDistance(pts[0], pts[1]);
        if (lastPinchDistance > 0) {
          var delta = currentDist - lastPinchDistance;
          if (options.onZoom) {
            options.onZoom(delta * 0.05);
          }
        }
        lastPinchDistance = currentDist;
      }
    });

    function onPointerEnd(e) {
      if (canvasElement.hasPointerCapture && canvasElement.hasPointerCapture(e.pointerId)) {
        canvasElement.releasePointerCapture(e.pointerId);
      }
      activePointers.delete(e.pointerId);
      if (activePointers.size === 0) {
        isDragging = false;
        lastPinchDistance = 0;
      } else if (activePointers.size === 1) {
        var remaining = activePointers.values().next().value;
        lastX = remaining.clientX;
        lastY = remaining.clientY;
        isDragging = true;
        lastPinchDistance = 0;
      }
    }

    canvasElement.addEventListener('pointerup', onPointerEnd);
    canvasElement.addEventListener('pointercancel', onPointerEnd);
    canvasElement.addEventListener('pointerleave', onPointerEnd);

    // Desktop Mouse Wheel Zoom
    canvasElement.addEventListener('wheel', function (e) {
      e.preventDefault();
      var zoomStep = e.deltaY < 0 ? 0.8 : -0.8;
      if (options.onZoom) {
        options.onZoom(zoomStep);
      }
    }, { passive: false });
  }

  /**
   * Creates a reactive ResizeObserver for 3D renderers and 2D canvases
   */
  function observeContainer(containerElement, onResizeCallback) {
    if (!containerElement || !window.ResizeObserver) return null;

    var ro = new ResizeObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var width = entry.contentRect.width;
        var height = entry.contentRect.height;
        if (width > 0 && height > 0 && onResizeCallback) {
          onResizeCallback(width, height);
        }
      }
    });

    ro.observe(containerElement);
    return ro;
  }

  return {
    getOptimalPixelRatio: getOptimalPixelRatio,
    attachCanvasGestures: attachCanvasGestures,
    observeContainer: observeContainer
  };
})();
