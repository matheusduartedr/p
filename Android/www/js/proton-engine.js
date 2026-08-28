/**
 * QUANTUM HUB — Proton Engine (Quantum & Bohr Simulation)
 */

window.ProtonEngine = (function () {
  'use strict';

  // Three.js Globals
  let scene, camera, renderer;
  let nucleus, orbitals = [], electrons = [];
  let isRotating = true;
  let showElectrons = true;
  let currentMode = 'quantum';
  let currentAtom = 'H';
  let orbitalStyle = 'cloud';
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotation = { x: 0, y: 0 };
  let photons = [];
  let energyWaves = [];
  let showEnergyWaves = false;
  let nucleusGlow;
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let pixelRatio = Math.min(window.devicePixelRatio, 2);
  let hydrogenExcitedLevel = 1;

  // Particle Hub
  const particleTexture = QuantumUtils.createParticleTexture();

  // Atomic Data
  const atomicData = {
    H: {
      name: 'Hidrogênio', protons: 1, electrons: 1, config: '1s¹',
      orbitals: [{ type: 's', n: 1, count: 1 }]
    }
  };

  const hydrogenQN = [
    { n: 1, l: 0, ml: 0, ms: '+½', orbital: '1s' },
    { n: 2, l: 1, ml: 0, ms: '+½', orbital: '2p' },
    { n: 3, l: 1, ml: 0, ms: '+½', orbital: '3p' },
    { n: 4, l: 2, ml: 0, ms: '+½', orbital: '3d' }
  ];

  // Bohr Globals
  let bohrElectrons = [];
  let bohrAnimationId = null;

  function init(params) {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Clean up previous renderer if it exists
    if (renderer) {
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer = null;
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x0a0a1a, 1);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl1 = new THREE.PointLight(0x00ccff, isMobile ? 0.7 : 1, 100);
    pl1.position.set(10, 10, 10);
    scene.add(pl1);

    setupMouseControls(container);
    createAtom(currentAtom);
    animate();

    if (params) {
      if (params.mode) changeMode(params.mode);
      if (params.view) changeOrbitalStyle(params.view);
    }

    window.addEventListener('resize', onWindowResize);
  }

  function setupMouseControls(container) {
    container.addEventListener('mousedown', (e) => { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; });
    container.addEventListener('mousemove', (e) => {
      if (isDragging && scene) {
        const dx = e.clientX - previousMousePosition.x, dy = e.clientY - previousMousePosition.y;
        const deltaQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(dy * 0.005, dx * 0.005, 0, 'XYZ'));
        scene.quaternion.multiplyQuaternions(deltaQ, scene.quaternion);
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });
    container.addEventListener('mouseup', () => { isDragging = false; });
    container.addEventListener('mouseleave', () => { isDragging = false; });
  }

  function createAtom(atomSymbol) {
    clearAtom();
    const atom = atomicData[atomSymbol];
    if (!atom) return;
    createNucleus();
    atom.orbitals.forEach(orb => {
      if (orb.type === 's') createSOrbital(orb.n, orb.count);
    });
    updateAtomInfo(atom);
  }

  function createNucleus() {
    const geo = new THREE.SphereGeometry(0.28, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 0.5, shininess: 100 });
    nucleus = new THREE.Mesh(geo, mat);
    scene.add(nucleus);
  }

  function createSOrbital(n, count) {
    if (currentAtom === 'H') { createHydrogenWaveFunction(hydrogenExcitedLevel); return; }
    const radius = n * 2;
    if (orbitalStyle === 'cloud') {
      const pCount = isMobile ? 2000 : 5000, pos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const r = Math.abs(QuantumUtils.gaussianRandom(0, radius * 0.8)), phi = Math.random() * Math.PI * 2, theta = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(theta) * Math.cos(phi); pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi); pos[i * 3 + 2] = r * Math.cos(theta);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ size: 0.22, color: 0x6496ff, map: particleTexture, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
      const cloud = new THREE.Points(geo, mat); scene.add(cloud); orbitals.push(cloud);
    }
  }

  function createHydrogenWaveFunction(level) {
    if (orbitalStyle === 'cloud') { createCloud(level); return; }
    const geo = new THREE.SphereGeometry(2, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: 0x6496ff, transparent: true, opacity: 0.3, wireframe: orbitalStyle === 'wireframe', side: THREE.DoubleSide });
    const orb = new THREE.Mesh(geo, mat); scene.add(orb); orbitals.push(orb);
    if (showElectrons) createElectron(2, 0, 1);
  }

  function createCloud(level) {
    const pCount = isMobile ? 6000 : 30000, pos = new Float32Array(pCount * 3), colors = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 0.8 + -Math.log(1 - Math.random() * 0.99) * 1.8, phi = Math.random() * Math.PI * 2, theta = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(theta) * Math.cos(phi), y = r * Math.sin(theta) * Math.sin(phi), z = r * Math.cos(theta);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const f = Math.exp(-r / 2.5); colors[i * 3] = 0.39 * f; colors[i * 3 + 1] = 0.59 * f; colors[i * 3 + 2] = 1.0 * f;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.25, map: particleTexture, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const cloud = new THREE.Points(geo, mat); scene.add(cloud); orbitals.push(cloud);
  }

  function createElectron(radius, index, total) {
    const geo = new THREE.SphereGeometry(0.15, 16, 16);
    const mat = new THREE.MeshPhongMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5, transparent: true, opacity: 1 });
    const e = new THREE.Mesh(geo, mat);
    const theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
    e.position.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi));
    e.userData = { radius, theta, phi, speed: 0.01 + Math.random() * 0.01, visible: true, visibilityTimer: 0, visibilityDuration: 40 + Math.random() * 40, invisibilityDuration: 10 + Math.random() * 20 };
    scene.add(e); electrons.push(e);
  }

  function clearAtom() {
    [...orbitals, ...electrons, ...photons, ...energyWaves].forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose();
      scene.remove(obj);
    });
    orbitals = []; electrons = []; photons = []; energyWaves = [];
    if (nucleus) { scene.remove(nucleus); nucleus = null; }
  }

  function updateAtomInfo(atom) {
    document.getElementById('atomName').textContent = atom.name + ' (' + currentAtom + ')';
    document.getElementById('protons').textContent = atom.protons;
    document.getElementById('electrons').textContent = atom.electrons;
    document.getElementById('config').textContent = atom.config;
    updateEnergyDisplay(atom);
  }

  function updateEnergyDisplay(atom) {
    const info = { key: '1s', shell: 'K', n: 1, energy: -13.6 };
    const dv = document.getElementById('energyDisplayValue'), li = document.getElementById('energyLevelInfo');
    if (dv) dv.textContent = info.energy.toFixed(1);
    if (li) li.textContent = `Nível: ${info.key} (n=${info.n})`;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (isRotating && !isDragging && scene) {
      const autoRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.003);
      scene.quaternion.multiplyQuaternions(autoRot, scene.quaternion);
    }
    electrons.forEach(e => {
      const d = e.userData;
      if (currentMode === 'quantum') {
        d.visibilityTimer++;
        if (d.visible && d.visibilityTimer >= d.visibilityDuration) { d.visible = false; d.visibilityTimer = 0; e.visible = false; }
        else if (!d.visible && d.visibilityTimer >= d.invisibilityDuration) { d.visible = true; d.visibilityTimer = 0; e.visible = true; d.theta = Math.random() * Math.PI * 2; d.phi = Math.acos(2 * Math.random() - 1); }
      }
      d.theta += d.speed; d.phi += d.speed * 0.5;
      const r = d.radius * 0.9;
      e.position.set(r * Math.sin(d.phi) * Math.cos(d.theta), r * Math.sin(d.phi) * Math.sin(d.theta), r * Math.cos(d.phi));
    });
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function changeMode(mode, targetBtn) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = targetBtn || document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.getElementById('canvas-container').style.display = mode === 'quantum' ? 'block' : 'none';
    document.getElementById('bohr-container').style.display = mode === 'bohr' ? 'block' : 'none';
    if (mode === 'bohr') createBohrAtom(currentAtom);
    else createAtom(currentAtom);
  }

  function createBohrAtom(atomSymbol) {
    const container = document.getElementById('bohr-container');
    if (!container) return;
    container.querySelectorAll('.bohr-orbit, .bohr-electron').forEach(el => el.remove());
    bohrElectrons = [];

    const W = container.clientWidth || 700, H = container.clientHeight || 700, size = Math.min(W, H);
    const unit = size * 0.015;
    [1, 2, 3, 4].forEach(n => {
      const orb = document.createElement('div'); orb.className = 'bohr-orbit';
      orb.style.width = orb.style.height = (unit * n * 5 * 2) + 'px';
      orb.style.opacity = n === hydrogenExcitedLevel ? '0.85' : '0.25';
      container.appendChild(orb);
    });

    const activeR = unit * hydrogenExcitedLevel * 5;
    const el = document.createElement('div'); el.className = 'bohr-electron';
    el.style.width = el.style.height = '12px'; container.appendChild(el);
    bohrElectrons.push({ element: el, radius: activeR, angle: Math.random() * Math.PI * 2, speed: 0.02, centerX: W / 2, centerY: H / 2 });

    if (bohrAnimationId) cancelAnimationFrame(bohrAnimationId);
    animateBohr();
  }

  function animateBohr() {
    bohrElectrons.forEach(e => {
      e.angle += e.speed;
      e.element.style.left = (e.centerX + e.radius * Math.cos(e.angle) - 6) + 'px';
      e.element.style.top = (e.centerY + e.radius * Math.sin(e.angle) - 6) + 'px';
    });
    bohrAnimationId = requestAnimationFrame(animateBohr);
  }

  function changeOrbitalStyle(style) {
    orbitalStyle = style;
    if (currentMode === 'quantum') createAtom(currentAtom);
  }

  function exciteElectron() {
    if (currentAtom !== 'H') return;
    hydrogenExcitedLevel = (hydrogenExcitedLevel % 4) + 1;
    if (currentMode === 'quantum') createAtom(currentAtom);
    else createBohrAtom(currentAtom);
  }

  // PUBLIC API
  return {
    init: init,
    changeMode,
    changeOrbitalStyle,
    exciteElectron,
    toggleRotation: function () { isRotating = !isRotating; },
    toggleElectrons: function () { showElectrons = !showElectrons; if (showElectrons) createAtom(currentAtom); else electrons.forEach(e => { scene.remove(e); }); electrons = []; },
    resetView: function () { if (scene) scene.quaternion.set(0, 0, 0, 1); camera.position.set(0, 5, 15); camera.lookAt(0, 0, 0); },
    setBackground: function (bg) {
      const isWhite = bg === 'white';
      if (renderer) renderer.setClearColor(isWhite ? 0xf0f4f8 : 0x0a0a1a, 1);
      if (scene) scene.fog = new THREE.Fog(isWhite ? 0xf0f4f8 : 0x0a0a1a, 10, 50);
      createAtom(currentAtom);
    }
  };
})();
