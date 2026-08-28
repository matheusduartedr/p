/**
 * QUANTUM HUB — Proxima Engine (Shader |ψ|² Simulator)
 */

window.ProximaEngine = (function () {
  'use strict';

  // Physics & Math
  function psi2(n, l, m, x, y, z) {
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r < 1e-10) return (l === 0) ? Math.pow(localRadialWF(n, 0, 1e-10, 1), 2) : 0;
    const theta = Math.acos(Math.max(-1, Math.min(1, z / r)));
    const phi = Math.atan2(y, x);
    // Note: This engine needs local math because QuantumUtils doesn't have sphericalHarmonic yet
    const R = localRadialWF(n, l, r, 1);
    const Y = localSphericalHarmonic(l, m, theta, phi);
    return R * R * Y * Y;
  }

  function localRadialWF(n, l, r, Z) {
    const a0 = 1; const rho = 2 * Z * r / (n * a0);
    const norm = Math.sqrt(Math.pow(2 * Z / (n * a0), 3) * QuantumUtils.fact(n - l - 1) / (2 * n * QuantumUtils.fact(n + l)));
    return norm * Math.exp(-rho / 2) * Math.pow(rho, l) * QuantumUtils.laguerreAssoc(n - l - 1, 2 * l + 1, rho);
  }

  function localSphericalHarmonic(l, m, theta, phi) {
    const cosT = Math.cos(theta); const am = Math.abs(m);
    const Plm = QuantumUtils.legendreAssoc(l, am, cosT);
    const norm = Math.sqrt((2 * l + 1) / (4 * Math.PI) * QuantumUtils.fact(l - am) / QuantumUtils.fact(l + am));
    if (m === 0) return norm * Plm;
    if (m > 0) return Math.SQRT2 * norm * Plm * Math.cos(m * phi);
    return Math.SQRT2 * norm * Plm * Math.sin(-m * phi);
  }

  // Three.js Globals
  let scene, camera, renderer, orbitalMesh;
  let currentN = 1, currentL = 0, currentM = 0;
  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let cameraTheta = 0.5, cameraPhi = 1.2, cameraR = 6;

  function init() {
    const canvas = document.getElementById('att-webgl-canvas');
    const wrap = document.getElementById('att-canvas-container');
    if (!canvas || !wrap) return;

    // Clean up previous renderer if it exists
    if (renderer) {
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer = null;
    }

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x060914, 1);
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 1000);
    updateCam();

    scene.add(new THREE.AmbientLight(0x223344, 0.9));
    const d1 = new THREE.DirectionalLight(0x6496ff, 1.1); d1.position.set(5, 8, 6); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x00ff88, 0.6); d2.position.set(-4, -3, -5); scene.add(d2);

    canvas.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      cameraTheta -= (e.clientX - prevMouse.x) * 0.005;
      cameraPhi += (e.clientY - prevMouse.y) * 0.005;
      cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCam();
    });
    window.addEventListener('mouseup', () => isDragging = false);

    renderOrbital();
    (function loop() { requestAnimationFrame(loop); renderer.render(scene, camera); })();
  }

  function updateCam() {
    camera.position.set(cameraR * Math.sin(cameraPhi) * Math.cos(cameraTheta), cameraR * Math.cos(cameraPhi), cameraR * Math.sin(cameraPhi) * Math.sin(cameraTheta));
    camera.lookAt(0, 0, 0);
  }

  function renderOrbital() {
    if (orbitalMesh) { scene.remove(orbitalMesh); if (orbitalMesh.geometry) orbitalMesh.geometry.dispose(); }
    // Very simplified placeholder for the Marching Cubes logic to avoid bloating
    const geo = new THREE.SphereGeometry(currentN * 0.8, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: 0x00ccff, wireframe: true, transparent: true, opacity: 0.4 });
    orbitalMesh = new THREE.Mesh(geo, mat);
    scene.add(orbitalMesh);
  }

  return {
    init: init,
    setOrbital: function (n, l, m, btn) {
      currentN = n; currentL = l; currentM = m;
      document.querySelectorAll('#view-construcao .mode-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderOrbital();
    }
  };
})();
