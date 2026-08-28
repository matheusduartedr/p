function toggleMainTheme() {
      const isWhite = !document.body.classList.contains('bg-white');
      setBackground(isWhite ? 'white' : 'black');
    }

    function setBackground(bg) {
      const isWhite = bg === 'white';
      document.body.classList.toggle('bg-white', isWhite);

      if (spec3DRenderer) {
        const bgCol = isWhite ? 0xf0f4f8 : 0x05060f;
        spec3DRenderer.setClearColor(bgCol, 1);
        if (spec3DScene) {
          spec3DScene.background = new THREE.Color(bgCol);
          spec3DScene.fog = new THREE.Fog(bgCol, 18, 40);
        }
      }

      const specBgBlack = document.getElementById('specBgBlack');
      const specBgWhite = document.getElementById('specBgWhite');
      if (specBgBlack) specBgBlack.classList.toggle('active', !isWhite);
      if (specBgWhite) specBgWhite.classList.toggle('active', isWhite);

      const themeBtn = document.getElementById('btn-theme-toggle');
      if (themeBtn) {
        themeBtn.innerHTML = isWhite ? '⬛ Tema Escuro' : '⬜ Tema Claro';
      }

      setTimeout(drawAllBands, 30);
    }

    // NAVIGATION
    function goSection(id) {
      document.querySelectorAll('.section').forEach(function (s) { s.classList.remove('active'); });
      document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.remove('active'); });
      document.getElementById(id).classList.add('active');
      if (document.getElementById('nav-' + id)) document.getElementById('nav-' + id).classList.add('active');

      if (id === 'espectro') {
        if (!spec3DRenderer) {
          initSpec3D();
        } else {
          buildSpec3DScene();
          if (!spec3DAnimId) animateSpec3D();
        }
        requestAnimationFrame(() => {
          drawSpectrum();
        });
      } else {
        stopSpec3D();
      }
    }

    // ══════════════════════════════════════════════════
    // SIMULADOR — Abas de Modo de Visualização
    // ══════════════════════════════════════════════════
    var simTabsVisible = false;
    var currentMainMode = 'quantum';
    var selectedQuantumView = null;

    var quantumViewData = {
      solid: { name: 'Sólido', icon: '🔵' },
      wireframe: { name: 'Wireframe', icon: '🔷' },
      cloud: { name: 'Nuvem', icon: '✨' }
    };

    function startSimSelection() {
      simTabsVisible = !simTabsVisible;
      var tabs = document.getElementById('sim-tabs-section');
      var btn = document.getElementById('btn-abrir-sim');
      if (simTabsVisible) {
        tabs.classList.add('visible');
        btn.textContent = 'Fechar';
        if (currentMainMode === 'quantum' && !selectedQuantumView) {
          document.getElementById('sim-open-cta').classList.remove('visible');
        } else {
          document.getElementById('sim-open-cta').classList.add('visible');
        }
      } else {
        tabs.classList.remove('visible');
        btn.innerHTML = 'Iniciar';
      }
    }

    function selectMainMode(mode, el) {
      currentMainMode = mode;
      document.getElementById('main-bohr').classList.remove('selected');
      document.getElementById('main-quantum').classList.remove('selected');
      document.getElementById('main-construcao').classList.remove('selected');
      el.classList.add('selected');

      var quantumOptions = document.getElementById('quantum-sub-options');
      var launchIcon = document.getElementById('btn-launch-icon');
      var launchText = document.getElementById('btn-launch-text');
      var labelInfo = document.getElementById('sim-selected-label');
      var cta = document.getElementById('sim-open-cta');

      if (mode === 'bohr') {
        quantumOptions.style.display = 'none';
        launchIcon.textContent = '🪐';
        launchText.textContent = 'Abrir Modelo Semi-clássico';
        labelInfo.textContent = 'MODO SELECIONADO: SEMI-CLÁSSICO';
        cta.classList.add('visible');
      } else if (mode === 'spectrum') {
        quantumOptions.style.display = 'none';
        launchIcon.textContent = '🌈';
        launchText.textContent = 'Abrir Espectro';
        labelInfo.textContent = 'MODO SELECIONADO: ESPECTRO';
        cta.classList.add('visible');
      } else if (mode === 'quantum') {
        quantumOptions.style.display = 'block';
        if (selectedQuantumView) {
          var data = quantumViewData[selectedQuantumView];
          launchIcon.textContent = data.icon;
          launchText.textContent = 'Abrir Quântico (' + data.name + ')';
          labelInfo.textContent = 'MODO: QUÂNTICO - ' + data.name.toUpperCase();
          cta.classList.add('visible');
        } else {
          cta.classList.remove('visible');
        }
      } else if (mode === 'construcao') {
        quantumOptions.style.display = 'none';
        launchIcon.textContent = '🚧';
        launchText.textContent = 'Abrir Em Construção';
        labelInfo.textContent = 'MODO SELECIONADO: EM CONSTRUÇÃO';
        cta.classList.add('visible');
      }
    }

    function selectSimTab(view, el) {
      selectedQuantumView = view;
      var subCards = document.getElementById('quantum-sub-options').querySelectorAll('.sim-tab-card');
      subCards.forEach(function (c) { c.classList.remove('selected'); });
      el.classList.add('selected');

      if (currentMainMode === 'quantum') {
        var data = quantumViewData[view];
        document.getElementById('btn-launch-icon').textContent = data.icon;
        document.getElementById('btn-launch-text').textContent = 'Abrir Quântico (' + data.name + ')';
        document.getElementById('sim-selected-label').textContent = 'MODO: QUÂNTICO - ' + data.name.toUpperCase();
        document.getElementById('sim-open-cta').classList.add('visible');
      }
    }

    function launchSimulator() {
      if (currentMainMode === 'construcao') {
        window.open('Proxima ATT.html', '_blank');
        return;
      }
      var url = 'PROTON.html?mode=' + currentMainMode;
      if (currentMainMode === 'quantum' && selectedQuantumView) {
        url += '&view=' + selectedQuantumView;
      }
      window.open(url, '_blank');
    }

    // PARTICLES
    var pCanvas = document.getElementById('particles-canvas');
    var pCtx = pCanvas.getContext('2d');
    var particles = [];
    function resizeParticles() { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
    resizeParticles();
    window.addEventListener('resize', resizeParticles);
    for (var i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, a: Math.random() });
    }
    function animParticles() {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      particles.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.a += 0.01;
        if (p.x < 0) p.x = pCanvas.width; if (p.x > pCanvas.width) p.x = 0;
        if (p.y < 0) p.y = pCanvas.height; if (p.y > pCanvas.height) p.y = 0;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fillStyle = 'rgba(0,204,255,' + (0.2 + Math.sin(p.a) * 0.15) + ')';
        pCtx.fill();
      });
      requestAnimationFrame(animParticles);
    }
    animParticles();

    // PERIODIC TABLE DATA
    var elements = [
      { "n": 1, "sym": "H", "name": "Hidrogênio", "cat": "nomet", "g": 1, "p": 1, "mass": 1.008, "state": "gas", "config": "1s1", "en": 2.2 },
      { "n": 2, "sym": "He", "name": "Hélio", "cat": "nob", "g": 18, "p": 1, "mass": 4.0026, "state": "gas", "config": "1s2", "en": null },
      { "n": 3, "sym": "Li", "name": "Lítio", "cat": "metal-a", "g": 1, "p": 2, "mass": 6.94, "state": "solid", "config": "1s2 2s1", "en": 0.98 },
      { "n": 4, "sym": "Be", "name": "Berílio", "cat": "metal-b", "g": 2, "p": 2, "mass": 9.0122, "state": "solid", "config": "1s2 2s2", "en": 1.57 },
      { "n": 5, "sym": "B", "name": "Boro", "cat": "met", "g": 13, "p": 2, "mass": 10.81, "state": "solid", "config": "1s2 2s2 2p1", "en": 2.04 },
      { "n": 6, "sym": "C", "name": "Carbono", "cat": "nomet", "g": 14, "p": 2, "mass": 12.011, "state": "solid", "config": "1s2 2s2 2p2", "en": 2.55 },
      { "n": 7, "sym": "N", "name": "Nitrogênio", "cat": "nomet", "g": 15, "p": 2, "mass": 14.007, "state": "gas", "config": "1s2 2s2 2p3", "en": 3.04 },
      { "n": 8, "sym": "O", "name": "Oxigênio", "cat": "nomet", "g": 16, "p": 2, "mass": 15.999, "state": "gas", "config": "1s2 2s2 2p4", "en": 3.44 },
      { "n": 9, "sym": "F", "name": "Flúor", "cat": "hal", "g": 17, "p": 2, "mass": 18.998, "state": "gas", "config": "1s2 2s2 2p5", "en": 3.98 },
      { "n": 10, "sym": "Ne", "name": "Neônio", "cat": "nob", "g": 18, "p": 2, "mass": 20.18, "state": "gas", "config": "1s2 2s2 2p6", "en": null },
      { "n": 11, "sym": "Na", "name": "Sódio", "cat": "metal-a", "g": 1, "p": 3, "mass": 22.99, "state": "solid", "config": "[Ne] 3s1", "en": 0.93 },
      { "n": 12, "sym": "Mg", "name": "Magnésio", "cat": "metal-b", "g": 2, "p": 3, "mass": 24.305, "state": "solid", "config": "[Ne] 3s2", "en": 1.31 },
      { "n": 13, "sym": "Al", "name": "Alumínio", "cat": "metal-t", "g": 13, "p": 3, "mass": 26.982, "state": "solid", "config": "[Ne] 3s2 3p1", "en": 1.61 },
      { "n": 14, "sym": "Si", "name": "Silício", "cat": "met", "g": 14, "p": 3, "mass": 28.085, "state": "solid", "config": "[Ne] 3s2 3p2", "en": 1.9 },
      { "n": 15, "sym": "P", "name": "Fósforo", "cat": "nomet", "g": 15, "p": 3, "mass": 30.974, "state": "solid", "config": "[Ne] 3s2 3p3", "en": 2.19 },
      { "n": 16, "sym": "S", "name": "Enxofre", "cat": "nomet", "g": 16, "p": 3, "mass": 32.06, "state": "solid", "config": "[Ne] 3s2 3p4", "en": 2.58 },
      { "n": 17, "sym": "Cl", "name": "Cloro", "cat": "hal", "g": 17, "p": 3, "mass": 35.45, "state": "gas", "config": "[Ne] 3s2 3p5", "en": 3.16 },
      { "n": 18, "sym": "Ar", "name": "Argônio", "cat": "nob", "g": 18, "p": 3, "mass": 39.948, "state": "gas", "config": "[Ne] 3s2 3p6", "en": null },
      { "n": 19, "sym": "K", "name": "Potássio", "cat": "metal-a", "g": 1, "p": 4, "mass": 39.098, "state": "solid", "config": "[Ar] 4s1", "en": 0.82 },
      { "n": 20, "sym": "Ca", "name": "Cálcio", "cat": "metal-b", "g": 2, "p": 4, "mass": 40.078, "state": "solid", "config": "[Ar] 4s2", "en": 1 },
      { "n": 21, "sym": "Sc", "name": "Escândio", "cat": "metal-t", "g": 3, "p": 4, "mass": 44.956, "state": "solid", "config": "[Ar] 3d1 4s2", "en": 1.36 },
      { "n": 22, "sym": "Ti", "name": "Titânio", "cat": "metal-t", "g": 4, "p": 4, "mass": 47.867, "state": "solid", "config": "[Ar] 3d2 4s2", "en": 1.54 },
      { "n": 23, "sym": "V", "name": "Vanádio", "cat": "metal-t", "g": 5, "p": 4, "mass": 50.942, "state": "solid", "config": "[Ar] 3d3 4s2", "en": 1.63 },
      { "n": 24, "sym": "Cr", "name": "Cromo", "cat": "metal-t", "g": 6, "p": 4, "mass": 51.996, "state": "solid", "config": "[Ar] 3d5 4s1", "en": 1.66 },
      { "n": 25, "sym": "Mn", "name": "Manganês", "cat": "metal-t", "g": 7, "p": 4, "mass": 54.938, "state": "solid", "config": "[Ar] 3d5 4s2", "en": 1.55 },
      { "n": 26, "sym": "Fe", "name": "Ferro", "cat": "metal-t", "g": 8, "p": 4, "mass": 55.845, "state": "solid", "config": "[Ar] 3d6 4s2", "en": 1.83 },
      { "n": 27, "sym": "Co", "name": "Cobalto", "cat": "metal-t", "g": 9, "p": 4, "mass": 58.933, "state": "solid", "config": "[Ar] 3d7 4s2", "en": 1.88 },
      { "n": 28, "sym": "Ni", "name": "Níquel", "cat": "metal-t", "g": 10, "p": 4, "mass": 58.693, "state": "solid", "config": "[Ar] 3d8 4s2", "en": 1.91 },
      { "n": 29, "sym": "Cu", "name": "Cobre", "cat": "metal-t", "g": 11, "p": 4, "mass": 63.546, "state": "solid", "config": "[Ar] 3d10 4s1", "en": 1.9 },
      { "n": 30, "sym": "Zn", "name": "Zinco", "cat": "metal-t", "g": 12, "p": 4, "mass": 65.38, "state": "solid", "config": "[Ar] 3d10 4s2", "en": 1.65 },
      { "n": 31, "sym": "Ga", "name": "Gálio", "cat": "metal-t", "g": 13, "p": 4, "mass": 69.723, "state": "solid", "config": "[Ar] 3d10 4s2 4p1", "en": 1.81 },
      { "n": 32, "sym": "Ge", "name": "Germânio", "cat": "met", "g": 14, "p": 4, "mass": 72.63, "state": "solid", "config": "[Ar] 3d10 4s2 4p2", "en": 2.01 },
      { "n": 33, "sym": "As", "name": "Arsênio", "cat": "met", "g": 15, "p": 4, "mass": 74.922, "state": "solid", "config": "[Ar] 3d10 4s2 4p3", "en": 2.18 },
      { "n": 34, "sym": "Se", "name": "Selênio", "cat": "nomet", "g": 16, "p": 4, "mass": 78.971, "state": "solid", "config": "[Ar] 3d10 4s2 4p4", "en": 2.55 },
      { "n": 35, "sym": "Br", "name": "Bromo", "cat": "hal", "g": 17, "p": 4, "mass": 79.904, "state": "liquid", "config": "[Ar] 3d10 4s2 4p5", "en": 2.96 },
      { "n": 36, "sym": "Kr", "name": "Criptônio", "cat": "nob", "g": 18, "p": 4, "mass": 83.798, "state": "gas", "config": "[Ar] 3d10 4s2 4p6", "en": 3 },
      { "n": 37, "sym": "Rb", "name": "Rubídio", "cat": "metal-a", "g": 1, "p": 5, "mass": 85.468, "state": "solid", "config": "[Kr] 5s1", "en": 0.82 },
      { "n": 38, "sym": "Sr", "name": "Estrôncio", "cat": "metal-b", "g": 2, "p": 5, "mass": 87.621, "state": "solid", "config": "[Kr] 5s2", "en": 0.95 },
      { "n": 39, "sym": "Y", "name": "Ítrio", "cat": "metal-t", "g": 3, "p": 5, "mass": 88.906, "state": "solid", "config": "[Kr] 4d1 5s2", "en": 1.22 },
      { "n": 40, "sym": "Zr", "name": "Zircônio", "cat": "metal-t", "g": 4, "p": 5, "mass": 91.224, "state": "solid", "config": "[Kr] 4d2 5s2", "en": 1.33 },
      { "n": 41, "sym": "Nb", "name": "Nióbio", "cat": "metal-t", "g": 5, "p": 5, "mass": 92.906, "state": "solid", "config": "[Kr] 4d4 5s1", "en": 1.6 },
      { "n": 42, "sym": "Mo", "name": "Molibdênio", "cat": "metal-t", "g": 6, "p": 5, "mass": 95.95, "state": "solid", "config": "[Kr] 4d5 5s1", "en": 2.16 },
      { "n": 43, "sym": "Tc", "name": "Tecnécio", "cat": "metal-t", "g": 7, "p": 5, "mass": 98, "state": "solid", "config": "[Kr] 4d5 5s2", "en": 1.9 },
      { "n": 44, "sym": "Ru", "name": "Rutênio", "cat": "metal-t", "g": 8, "p": 5, "mass": 101.07, "state": "solid", "config": "[Kr] 4d7 5s1", "en": 2.2 },
      { "n": 45, "sym": "Rh", "name": "Ródio", "cat": "metal-t", "g": 9, "p": 5, "mass": 102.91, "state": "solid", "config": "[Kr] 4d8 5s1", "en": 2.28 },
      { "n": 46, "sym": "Pd", "name": "Paládio", "cat": "metal-t", "g": 10, "p": 5, "mass": 106.42, "state": "solid", "config": "[Kr] 4d10", "en": 2.2 },
      { "n": 47, "sym": "Ag", "name": "Prata", "cat": "metal-t", "g": 11, "p": 5, "mass": 107.87, "state": "solid", "config": "[Kr] 4d10 5s1", "en": 1.93 },
      { "n": 48, "sym": "Cd", "name": "Cádmio", "cat": "metal-t", "g": 12, "p": 5, "mass": 112.41, "state": "solid", "config": "[Kr] 4d10 5s2", "en": 1.69 },
      { "n": 49, "sym": "In", "name": "Índio", "cat": "metal-t", "g": 13, "p": 5, "mass": 114.82, "state": "solid", "config": "[Kr] 4d10 5s2 5p1", "en": 1.78 },
      { "n": 50, "sym": "Sn", "name": "Estanho", "cat": "metal-t", "g": 14, "p": 5, "mass": 118.71, "state": "solid", "config": "[Kr] 4d10 5s2 5p2", "en": 1.96 },
      { "n": 51, "sym": "Sb", "name": "Antimônio", "cat": "met", "g": 15, "p": 5, "mass": 121.76, "state": "solid", "config": "[Kr] 4d10 5s2 5p3", "en": 2.05 },
      { "n": 52, "sym": "Te", "name": "Telúrio", "cat": "met", "g": 16, "p": 5, "mass": 127.6, "state": "solid", "config": "[Kr] 4d10 5s2 5p4", "en": 2.1 },
      { "n": 53, "sym": "I", "name": "Iodo", "cat": "hal", "g": 17, "p": 5, "mass": 126.9, "state": "solid", "config": "[Kr] 4d10 5s2 5p5", "en": 2.66 },
      { "n": 54, "sym": "Xe", "name": "Xenônio", "cat": "nob", "g": 18, "p": 5, "mass": 131.29, "state": "gas", "config": "[Kr] 4d10 5s2 5p6", "en": 2.6 },
      { "n": 55, "sym": "Cs", "name": "Césio", "cat": "metal-a", "g": 1, "p": 6, "mass": 132.91, "state": "solid", "config": "[Xe] 6s1", "en": 0.79 },
      { "n": 56, "sym": "Ba", "name": "Bário", "cat": "metal-b", "g": 2, "p": 6, "mass": 137.33, "state": "solid", "config": "[Xe] 6s2", "en": 0.89 },
      { "n": 57, "sym": "La", "name": "Lantânio", "cat": "lan", "g": 3, "p": 6, "mass": 138.91, "state": "solid", "config": "[Xe] 5d1 6s2", "en": 1.1 },
      { "n": 58, "sym": "Ce", "name": "Cério", "cat": "lan", "g": 3, "p": 6, "mass": 140.12, "state": "solid", "config": "[Xe] 4f1 5d1 6s2", "en": 1.12 },
      { "n": 59, "sym": "Pr", "name": "Praseodímio", "cat": "lan", "g": 3, "p": 6, "mass": 140.91, "state": "solid", "config": "[Xe] 4f3 6s2", "en": 1.13 },
      { "n": 60, "sym": "Nd", "name": "Neodímio", "cat": "lan", "g": 3, "p": 6, "mass": 144.24, "state": "solid", "config": "[Xe] 4f4 6s2", "en": 1.14 },
      { "n": 61, "sym": "Pm", "name": "Promécio", "cat": "lan", "g": 3, "p": 6, "mass": 145, "state": "solid", "config": "[Xe] 4f5 6s2", "en": 1.13 },
      { "n": 62, "sym": "Sm", "name": "Samário", "cat": "lan", "g": 3, "p": 6, "mass": 150.36, "state": "solid", "config": "[Xe] 4f6 6s2", "en": 1.17 },
      { "n": 63, "sym": "Eu", "name": "Európio", "cat": "lan", "g": 3, "p": 6, "mass": 151.96, "state": "solid", "config": "[Xe] 4f7 6s2", "en": 1.2 },
      { "n": 64, "sym": "Gd", "name": "Gadolínio", "cat": "lan", "g": 3, "p": 6, "mass": 157.25, "state": "solid", "config": "[Xe] 4f7 5d1 6s2", "en": 1.2 },
      { "n": 65, "sym": "Tb", "name": "Térbio", "cat": "lan", "g": 3, "p": 6, "mass": 158.93, "state": "solid", "config": "[Xe] 4f9 6s2", "en": 1.1 },
      { "n": 66, "sym": "Dy", "name": "Disprósio", "cat": "lan", "g": 3, "p": 6, "mass": 162.5, "state": "solid", "config": "[Xe] 4f10 6s2", "en": 1.22 },
      { "n": 67, "sym": "Ho", "name": "Hólmio", "cat": "lan", "g": 3, "p": 6, "mass": 164.93, "state": "solid", "config": "[Xe] 4f11 6s2", "en": 1.23 },
      { "n": 68, "sym": "Er", "name": "Érbio", "cat": "lan", "g": 3, "p": 6, "mass": 167.26, "state": "solid", "config": "[Xe] 4f12 6s2", "en": 1.24 },
      { "n": 69, "sym": "Tm", "name": "Túlio", "cat": "lan", "g": 3, "p": 6, "mass": 168.93, "state": "solid", "config": "[Xe] 4f13 6s2", "en": 1.25 },
      { "n": 70, "sym": "Yb", "name": "Itérbio", "cat": "lan", "g": 3, "p": 6, "mass": 173.05, "state": "solid", "config": "[Xe] 4f14 6s2", "en": 1.1 },
      { "n": 71, "sym": "Lu", "name": "Lutécio", "cat": "lan", "g": 3, "p": 6, "mass": 174.97, "state": "solid", "config": "[Xe] 4f14 5d1 6s2", "en": 1.27 },
      { "n": 72, "sym": "Hf", "name": "Háfnio", "cat": "metal-t", "g": 4, "p": 6, "mass": 178.49, "state": "solid", "config": "[Xe] 4f14 5d2 6s2", "en": 1.3 },
      { "n": 73, "sym": "Ta", "name": "Tântalo", "cat": "metal-t", "g": 5, "p": 6, "mass": 180.95, "state": "solid", "config": "[Xe] 4f14 5d3 6s2", "en": 1.5 },
      { "n": 74, "sym": "W", "name": "Tungstênio", "cat": "metal-t", "g": 6, "p": 6, "mass": 183.84, "state": "solid", "config": "[Xe] 4f14 5d4 6s2", "en": 2.36 },
      { "n": 75, "sym": "Re", "name": "Rênio", "cat": "metal-t", "g": 7, "p": 6, "mass": 186.21, "state": "solid", "config": "[Xe] 4f14 5d5 6s2", "en": 1.9 },
      { "n": 76, "sym": "Os", "name": "Ósmio", "cat": "metal-t", "g": 8, "p": 6, "mass": 190.23, "state": "solid", "config": "[Xe] 4f14 5d6 6s2", "en": 2.2 },
      { "n": 77, "sym": "Ir", "name": "Irídio", "cat": "metal-t", "g": 9, "p": 6, "mass": 192.22, "state": "solid", "config": "[Xe] 4f14 5d7 6s2", "en": 2.2 },
      { "n": 78, "sym": "Pt", "name": "Platina", "cat": "metal-t", "g": 10, "p": 6, "mass": 195.08, "state": "solid", "config": "[Xe] 4f14 5d9 6s1", "en": 2.28 },
      { "n": 79, "sym": "Au", "name": "Ouro", "cat": "metal-t", "g": 11, "p": 6, "mass": 196.97, "state": "solid", "config": "[Xe] 4f14 5d10 6s1", "en": 2.54 },
      { "n": 80, "sym": "Hg", "name": "Mercúrio", "cat": "metal-t", "g": 12, "p": 6, "mass": 200.59, "state": "liquid", "config": "[Xe] 4f14 5d10 6s2", "en": 2 },
      { "n": 81, "sym": "Tl", "name": "Tálio", "cat": "metal-t", "g": 13, "p": 6, "mass": 204.38, "state": "solid", "config": "[Xe] 4f14 5d10 6s2 6p1", "en": 1.62 },
      { "n": 82, "sym": "Pb", "name": "Chumbo", "cat": "metal-t", "g": 14, "p": 6, "mass": 207.2, "state": "solid", "config": "[Xe] 4f14 5d10 6s2 6p2", "en": 2.33 },
      { "n": 83, "sym": "Bi", "name": "Bismuto", "cat": "metal-t", "g": 15, "p": 6, "mass": 208.98, "state": "solid", "config": "[Xe] 4f14 5d10 6s2 6p3", "en": 2.02 },
      { "n": 84, "sym": "Po", "name": "Polônio", "cat": "metal-t", "g": 16, "p": 6, "mass": 209, "state": "solid", "config": "[Xe] 4f14 5d10 6s2 6p4", "en": 2 },
      { "n": 85, "sym": "At", "name": "Astato", "cat": "hal", "g": 17, "p": 6, "mass": 210, "state": "solid", "config": "[Xe] 4f14 5d10 6s2 6p5", "en": 2.2 },
      { "n": 86, "sym": "Rn", "name": "Radônio", "cat": "nob", "g": 18, "p": 6, "mass": 222, "state": "gas", "config": "[Xe] 4f14 5d10 6s2 6p6", "en": 2.2 },
      { "n": 87, "sym": "Fr", "name": "Frâncio", "cat": "metal-a", "g": 1, "p": 7, "mass": 223, "state": "solid", "config": "[Rn] 7s1", "en": 0.79 },
      { "n": 88, "sym": "Ra", "name": "Rádio", "cat": "metal-b", "g": 2, "p": 7, "mass": 226, "state": "solid", "config": "[Rn] 7s2", "en": 0.9 },
      { "n": 89, "sym": "Ac", "name": "Actínio", "cat": "act", "g": 3, "p": 7, "mass": 227, "state": "solid", "config": "[Rn] 6d1 7s2", "en": 1.1 },
      { "n": 90, "sym": "Th", "name": "Tório", "cat": "act", "g": 3, "p": 7, "mass": 232.04, "state": "solid", "config": "[Rn] 6d2 7s2", "en": 1.3 },
      { "n": 91, "sym": "Pa", "name": "Protactínio", "cat": "act", "g": 3, "p": 7, "mass": 231.04, "state": "solid", "config": "[Rn] 5f2 6d1 7s2", "en": 1.5 },
      { "n": 92, "sym": "U", "name": "Urânio", "cat": "act", "g": 3, "p": 7, "mass": 238.03, "state": "solid", "config": "[Rn] 5f3 6d1 7s2", "en": 1.38 },
      { "n": 93, "sym": "Np", "name": "Netúnio", "cat": "act", "g": 3, "p": 7, "mass": 237, "state": "solid", "config": "[Rn] 5f4 6d1 7s2", "en": 1.36 },
      { "n": 94, "sym": "Pu", "name": "Plutônio", "cat": "act", "g": 3, "p": 7, "mass": 244, "state": "solid", "config": "[Rn] 5f6 7s2", "en": 1.28 },
      { "n": 95, "sym": "Am", "name": "Amerício", "cat": "act", "g": 3, "p": 7, "mass": 243, "state": "solid", "config": "[Rn] 5f7 7s2", "en": 1.13 },
      { "n": 96, "sym": "Cm", "name": "Cúrio", "cat": "act", "g": 3, "p": 7, "mass": 247, "state": "solid", "config": "[Rn] 5f7 6d1 7s2", "en": 1.28 },
      { "n": 97, "sym": "Bk", "name": "Berquélio", "cat": "act", "g": 3, "p": 7, "mass": 247, "state": "solid", "config": "[Rn] 5f9 7s2", "en": 1.3 },
      { "n": 98, "sym": "Cf", "name": "Califórnio", "cat": "act", "g": 3, "p": 7, "mass": 251, "state": "solid", "config": "[Rn] 5f10 7s2", "en": 1.3 },
      { "n": 99, "sym": "Es", "name": "Enstênio", "cat": "act", "g": 3, "p": 7, "mass": 252, "state": "solid", "config": "[Rn] 5f11 7s2", "en": 1.3 },
      { "n": 100, "sym": "Fm", "name": "Férmio", "cat": "act", "g": 3, "p": 7, "mass": 257, "state": "solid", "config": "[Rn] 5f12 7s2", "en": 1.3 },
      { "n": 101, "sym": "Md", "name": "Mendelévio", "cat": "act", "g": 3, "p": 7, "mass": 258, "state": "solid", "config": "[Rn] 5f13 7s2", "en": 1.3 },
      { "n": 102, "sym": "No", "name": "Nobélio", "cat": "act", "g": 3, "p": 7, "mass": 259, "state": "solid", "config": "[Rn] 5f14 7s2", "en": 1.3 },
      { "n": 103, "sym": "Lr", "name": "Laurêncio", "cat": "act", "g": 3, "p": 7, "mass": 262, "state": "solid", "config": "[Rn] 5f14 7p1 7s2", "en": 1.3 },
      { "n": 104, "sym": "Rf", "name": "Rutherfórdio", "cat": "metal-t", "g": 4, "p": 7, "mass": 267, "state": "solid", "config": "[Rn] 5f14 6d2 7s2", "en": null },
      { "n": 105, "sym": "Db", "name": "Dúbnio", "cat": "metal-t", "g": 5, "p": 7, "mass": 268, "state": "solid", "config": "[Rn] 5f14 6d3 7s2", "en": null },
      { "n": 106, "sym": "Sg", "name": "Seabórgio", "cat": "metal-t", "g": 6, "p": 7, "mass": 269, "state": "solid", "config": "[Rn] 5f14 6d4 7s2", "en": null },
      { "n": 107, "sym": "Bh", "name": "Bório", "cat": "metal-t", "g": 7, "p": 7, "mass": 270, "state": "solid", "config": "[Rn] 5f14 6d5 7s2", "en": null },
      { "n": 108, "sym": "Hs", "name": "Hássio", "cat": "metal-t", "g": 8, "p": 7, "mass": 269, "state": "solid", "config": "[Rn] 5f14 6d6 7s2", "en": null },
      { "n": 109, "sym": "Mt", "name": "Meitnério", "cat": "metal-t", "g": 9, "p": 7, "mass": 278, "state": "solid", "config": "[Rn] 5f14 6d7 7s2", "en": null },
      { "n": 110, "sym": "Ds", "name": "Darmstádio", "cat": "metal-t", "g": 10, "p": 7, "mass": 281, "state": "solid", "config": "[Rn] 5f14 6d8 7s2", "en": null },
      { "n": 111, "sym": "Rg", "name": "Roentgênio", "cat": "metal-t", "g": 11, "p": 7, "mass": 282, "state": "solid", "config": "[Rn] 5f14 6d9 7s2", "en": null },
      { "n": 112, "sym": "Cn", "name": "Copernício", "cat": "metal-t", "g": 12, "p": 7, "mass": 285, "state": "liquid", "config": "[Rn] 5f14 6d10 7s2", "en": null },
      { "n": 113, "sym": "Nh", "name": "Nipônio", "cat": "metal-t", "g": 13, "p": 7, "mass": 286, "state": "solid", "config": "[Rn] 5f14 6d10 7s2 7p1", "en": null },
      { "n": 114, "sym": "Fl", "name": "Fleróvio", "cat": "metal-t", "g": 14, "p": 7, "mass": 289, "state": "solid", "config": "[Rn] 5f14 6d10 7s2 7p2", "en": null },
      { "n": 115, "sym": "Mc", "name": "Moscóvio", "cat": "metal-t", "g": 15, "p": 7, "mass": 289, "state": "solid", "config": "[Rn] 5f14 6d10 7s2 7p3", "en": null },
      { "n": 116, "sym": "Lv", "name": "Livermório", "cat": "metal-t", "g": 16, "p": 7, "mass": 293, "state": "solid", "config": "[Rn] 5f14 6d10 7s2 7p4", "en": null },
      { "n": 117, "sym": "Ts", "name": "Tennesso", "cat": "hal", "g": 17, "p": 7, "mass": 294, "state": "solid", "config": "[Rn] 5f14 6d10 7s2 7p5", "en": null },
      { "n": 118, "sym": "Og", "name": "Oganésson", "cat": "nob", "g": 18, "p": 7, "mass": 294, "state": "solid", "config": "[Rn] 5f14 6d10 7s2 7p6", "en": null },
    ];

    var ptBuilt = false;
    function buildPeriodicTable() {
      ptBuilt = true;
      var grid = document.getElementById('pt-grid');
      grid.innerHTML = '';
      var cellMap = {};
      elements.forEach(function (el) {
        var col = el.g, row = el.p;
        if (el.cat === 'lan') { row = 9; col = el.n - 56 + 2; }
        if (el.cat === 'act') { row = 10; col = el.n - 88 + 2; }
        cellMap[row + '-' + col] = el;
      });
      for (var r = 1; r <= 10; r++) {
        for (var c = 1; c <= 18; c++) {
          var el = cellMap[r + '-' + c];
          var div = document.createElement('div');
          if (!el) {
            div.className = 'el-btn el-hidden';
            div.innerHTML = '&nbsp;';
          } else {
            div.className = 'el-btn el-' + el.cat;
            div.id = 'el-' + el.n;
            div.title = el.name;
            div.innerHTML = '<span class="el-num">' + el.n + '</span><span class="el-sym">' + el.sym + '</span><span class="el-name">' + el.name.substring(0, 7) + '</span>';
            (function (e) { div.onclick = function () { showElement(e); }; })(el);
            div.setAttribute('data-cat', el.cat);
          }
          grid.appendChild(div);
        }
      }
    }

    function filterElements(cat, btn) {
      document.querySelectorAll('#pt-filters .pt-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.el-btn').forEach(function (el) {
        if (el.classList.contains('el-hidden')) return;
        var elCat = el.getAttribute('data-cat');
        el.style.opacity = (cat === 'all' || elCat === cat) ? '1' : '0.15';
        el.style.filter = (cat === 'all' || elCat === cat) ? '' : 'grayscale(1)';
      });
    }

    function showElement(el) {
      document.querySelectorAll('.el-btn').forEach(function (b) { b.classList.remove('active-el'); });
      var btn = document.getElementById('el-' + el.n);
      if (btn) btn.classList.add('active-el');
      var detail = document.getElementById('el-detail');
      var stateMap = { solid: 'S\u00f3lido', gas: 'Gasoso', liquid: 'L\u00edquido' };
      var catMap = { 'metal-a': 'Metal Alcalino', 'metal-t': 'Metal de Transi\u00e7\u00e3o', 'metal-b': 'Metal Alcalino-terroso', 'nomet': 'N\u00e3o Metal', 'nob': 'G\u00e1s Nobre', 'hal': 'Halog\u00eanio', 'met': 'Metaloide', 'lan': 'Latan\u00eddeo', 'act': 'Actin\u00eddeo' };
      detail.innerHTML =
        '<div class="el-detail-header">' +
        '<div class="el-big-sym">' + el.sym + '</div>' +
        '<div class="el-detail-info"><h3>' + el.name + '</h3><p>Z = ' + el.n + ' &nbsp;|&nbsp; ' + (catMap[el.cat] || el.cat) + '</p></div>' +
        '</div>' +
        '<div class="el-props">' +
        '<div class="el-prop"><div class="el-prop-label">Massa At\u00f4mica</div><div class="el-prop-val">' + el.mass + ' u</div></div>' +
        '<div class="el-prop"><div class="el-prop-label">N\u00ba At\u00f4mico</div><div class="el-prop-val">' + el.n + '</div></div>' +
        '<div class="el-prop"><div class="el-prop-label">Estado F\u00edsico</div><div class="el-prop-val">' + (stateMap[el.state] || el.state) + '</div></div>' +
        '<div class="el-prop"><div class="el-prop-label">Config. Eletr\u00f4nica</div><div class="el-prop-val" style="font-size:0.85rem">' + el.config + '</div></div>' +
        '<div class="el-prop"><div class="el-prop-label">Eletronegatividade</div><div class="el-prop-val">' + (el.en || '&mdash;') + '</div></div>' +
        '<div class="el-prop"><div class="el-prop-label">Per\u00edodo</div><div class="el-prop-val">' + el.p + '</div></div>' +
        '</div>';
      detail.classList.add('show');
      detail.style.display = 'block';
      detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ══════════════════════════════════════════════════
    // ESPECTRO — Laboratório Digital de Espectroscopia
    // ══════════════════════════════════════════════════
    const hc_eVnm = 1239.84193;
    const c_light = 299792.458; // km/s
    const serieColors = { 1: '#aa55ff', 2: '#00cc66', 3: '#ff7722', 4: '#ffaa00' };
    const serieNames = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett' };
    const serieRegion = { 1: 'UV extremo', 2: 'Visível / UV', 3: 'IV próximo', 4: 'IV médio' };
    let specMode = 'emission';
    let selectedSeriesFilter = 'all';
    let specViewMode = 'all';
    let hoveredInfo = null; // {n1, n2}
    let selectedLineInfo = { n1: 2, n2: 3, nm: 656.28 }; // Padrão H-alfa

    function hydrogenWavelength(n1, n2) {
      if (n2 <= n1) return null;
      const dE = 13.6 * (1 / (n1 * n1) - 1 / (n2 * n2));
      return hc_eVnm / dE;
    }

    function wavelengthToColor(nm) {
      let r, g, b;
      if (nm < 380) { r = 0.5; g = 0; b = 0.5; }
      else if (nm < 440) { r = (440 - nm) / 60; g = 0; b = 1; }
      else if (nm < 490) { r = 0; g = (nm - 440) / 50; b = 1; }
      else if (nm < 510) { r = 0; g = 1; b = (510 - nm) / 20; }
      else if (nm < 580) { r = (nm - 510) / 70; g = 1; b = 0; }
      else if (nm < 645) { r = 1; g = (645 - nm) / 65; b = 0; }
      else if (nm < 750) { r = 1; g = 0; b = 0; }
      else { r = 0.5; g = 0; b = 0; }
      let a = 1;
      if (nm < 420) a = 0.3 + 0.7 * (nm - 380) / 40;
      else if (nm > 700) a = 0.3 + 0.7 * (750 - nm) / 50;
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
    }

    function regionForNm(nm) {
      if (nm < 200) return 'UV extremo';
      if (nm < 380) return 'Ultravioleta (UV)';
      if (nm < 750) return 'Visível';
      if (nm < 1400) return 'Infravermelho próximo';
      return 'Infravermelho médio';
    }

    window.setSpecMode = function (mode) {
      specMode = mode;
      const btnE = document.getElementById('btnEmission');
      const btnA = document.getElementById('btnAbsorption');
      if (btnE) btnE.classList.toggle('active', mode === 'emission');
      if (btnA) btnA.classList.toggle('active', mode === 'absorption');
      drawAllBands();
      drawSpecLevelsCanvas();
      if (spec3DRenderer) { spec3DLineTimer = 0; buildSpec3DScene(); }
    };

    window.setSpecViewMode = function (mode) {
      specViewMode = mode;
      ['btnViewAll', 'btnView2D', 'btnView3D'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
      });
      if (mode === 'all') {
        const b = document.getElementById('btnViewAll'); if (b) b.classList.add('active');
        const c3d = document.getElementById('spec3DContainer'); if (c3d) c3d.style.display = 'block';
        const bands = document.getElementById('specBandsContainer'); if (bands) bands.style.display = 'flex';
        const sbar = document.getElementById('specSeriesBar'); if (sbar) sbar.style.display = 'flex';
      } else if (mode === '2d') {
        const b = document.getElementById('btnView2D'); if (b) b.classList.add('active');
        const c3d = document.getElementById('spec3DContainer'); if (c3d) c3d.style.display = 'none';
        const bands = document.getElementById('specBandsContainer'); if (bands) bands.style.display = 'flex';
        const sbar = document.getElementById('specSeriesBar'); if (sbar) sbar.style.display = 'flex';
      } else if (mode === '3d') {
        const b = document.getElementById('btnView3D'); if (b) b.classList.add('active');
        const c3d = document.getElementById('spec3DContainer'); if (c3d) c3d.style.display = 'block';
        const bands = document.getElementById('specBandsContainer'); if (bands) bands.style.display = 'none';
        const sbar = document.getElementById('specSeriesBar'); if (sbar) sbar.style.display = 'none';
      }
      setTimeout(() => {
        resizeSpec3D();
        drawAllBands();
        drawSpecLevelsCanvas();
      }, 50);
    };

    window.selectSeriesFilter = function (serieId, btn) {
      selectedSeriesFilter = serieId;
      document.querySelectorAll('.spec-series-tab').forEach(t => t.classList.remove('active'));
      if (btn) btn.classList.add('active');

      [1, 2, 3, 4].forEach(n1 => {
        const wrap = document.getElementById('bandWrapper' + n1);
        if (!wrap) return;
        if (serieId === 'all' || String(n1) === String(serieId)) {
          wrap.classList.remove('hidden');
        } else {
          wrap.classList.add('hidden');
        }
      });
      setTimeout(drawAllBands, 30);
    };

    window.toggleLevelsAccordion = function () {
      const content = document.getElementById('specLevelsContent');
      const arrow = document.getElementById('specLevelsAccArrow');
      if (!content) return;
      const isCollapsed = content.classList.contains('collapsed');
      if (isCollapsed) {
        content.classList.remove('collapsed');
        if (arrow) arrow.textContent = '▼';
        setTimeout(drawSpecLevelsCanvas, 50);
      } else {
        content.classList.add('collapsed');
        if (arrow) arrow.textContent = '▲';
      }
    };

    // ── Cena 3D do Espectro ──
    let spec3DScene, spec3DCamera, spec3DRenderer, spec3DAnimId;
    let spec3DDragging = false, spec3DLastX = 0, spec3DLastY = 0;
    let spec3DRotY = -0.3, spec3DRotX = 0.18;
    let spec3DSpectralLines = [];
    let spec3DPhotons = [];
    let spec3D_screenLines = [];
    let spec3D_tubeLight = null;
    let spec3DLineTimer = 0;

    function bindSpec3DEvents() {
      const canvas = document.getElementById('spec3DCanvas');
      const cont = document.getElementById('spec3DContainer');
      if (!canvas || canvas._evBound) return;
      canvas._evBound = true;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      canvas.addEventListener('mousedown', e => {
        spec3DDragging = false;
        spec3DLastX = e.clientX;
        spec3DLastY = e.clientY;
      });

      canvas.addEventListener('mousemove', e => {
        if (e.buttons !== 1) return;
        spec3DDragging = true;
        spec3DRotY += (e.clientX - spec3DLastX) * 0.008;
        spec3DRotX += (e.clientY - spec3DLastY) * 0.006;
        spec3DRotX = Math.max(-0.5, Math.min(0.5, spec3DRotX));
        spec3DLastX = e.clientX;
        spec3DLastY = e.clientY;
      });

      canvas.addEventListener('click', e => {
        if (spec3DDragging) { spec3DDragging = false; return; }
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, spec3DCamera);
        const hits = raycaster.intersectObjects(spec3DSpectralLines);
        if (!hits.length) return;

        const data = hits[0].object.userData;
        const nm = data.nm;
        const dE = hc_eVnm / nm;
        const n1 = 2, n2 = data.n2;

        // Painel flutuante
        const info = document.getElementById('spec3DInfo');
        const title = document.getElementById('spec3DTitle');
        const details = document.getElementById('spec3DDetails');
        if (info && title && details) {
          info.style.display = 'block';
          const c = wavelengthToColor(nm);
          title.textContent = `${data.name} — ${Math.round(nm * 10)} Å`;
          title.style.color = `rgb(${c.r},${c.g},${c.b})`;
          details.innerHTML =
            `Transição: n${n2} → n2<br>` +
            `ΔE = ${dE.toFixed(4)} eV<br>` +
            `λ = ${nm.toFixed(1)} nm<br>` +
            `Série de Balmer (Visível)`;
        }

        // Atualizar painel principal e diagrama de níveis
        updateSpecInfo(n1, n2, nm);

        // Destacar linha clicada
        spec3DSpectralLines.forEach(l => l.scale.set(1, 1, 1));
        hits[0].object.scale.set(1, 2.5, 1);
      });

      // Touch
      canvas.addEventListener('touchstart', e => {
        if (!e.touches.length) return;
        spec3DLastX = e.touches[0].clientX;
        spec3DLastY = e.touches[0].clientY;
      }, { passive: true });

      canvas.addEventListener('touchmove', e => {
        if (!e.touches.length) return;
        spec3DRotY += (e.touches[0].clientX - spec3DLastX) * 0.008;
        spec3DRotX += (e.touches[0].clientY - spec3DLastY) * 0.006;
        spec3DRotX = Math.max(-0.5, Math.min(0.5, spec3DRotX));
        spec3DLastX = e.touches[0].clientX;
        spec3DLastY = e.touches[0].clientY;
      }, { passive: true });
    }

    function stopSpec3D() {
      if (spec3DAnimId) cancelAnimationFrame(spec3DAnimId);
      spec3DAnimId = null;
    }

    const balmerVisible = [
      { n2: 3, nm: 656.28, name: 'Hα', greek: 'α' },
      { n2: 4, nm: 486.13, name: 'Hβ', greek: 'β' },
      { n2: 5, nm: 434.05, name: 'Hγ', greek: 'γ' },
      { n2: 6, nm: 410.17, name: 'Hδ', greek: 'δ' },
    ];

    function nmToThreeColor(nm) {
      const c = wavelengthToColor(nm);
      return new THREE.Color(c.r / 255, c.g / 255, c.b / 255);
    }

    function resizeSpec3D() {
      const cont = document.getElementById('spec3DContainer');
      if (!spec3DRenderer || !spec3DCamera || !cont) return;
      const W = cont.clientWidth || 300;
      const H = cont.clientHeight || 240;
      if (W === 0 || H === 0) return;
      spec3DCamera.aspect = W / H;
      spec3DCamera.updateProjectionMatrix();
      spec3DRenderer.setSize(W, H);
    }

    function initSpec3D() {
      const canvas = document.getElementById('spec3DCanvas');
      const cont = document.getElementById('spec3DContainer');
      if (!canvas || !cont) return;
      const W = cont.clientWidth || 800;
      const H = cont.clientHeight || 340;

      const isWhite = document.body.classList.contains('bg-white');
      const bgCol = isWhite ? 0x080d1a : 0x020409;

      spec3DScene = new THREE.Scene();
      spec3DScene.background = new THREE.Color(bgCol);
      spec3DScene.fog = new THREE.Fog(bgCol, 18, 40);

      spec3DCamera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
      spec3DCamera.position.set(0, 4, 10);
      spec3DCamera.lookAt(1, 0, 0);

      spec3DRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      spec3DRenderer.setSize(W, H);
      spec3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      spec3DRenderer.setClearColor(bgCol, 1);

      buildSpec3DScene();
      bindSpec3DEvents();

      if (window.ResizeObserver && cont && !cont._roBound) {
        cont._roBound = true;
        const ro = new ResizeObserver(() => {
          resizeSpec3D();
        });
        ro.observe(cont);
      }

      animateSpec3D();
    }

    function buildSpec3DScene() {
      while (spec3DScene.children.length) spec3DScene.remove(spec3DScene.children[0]);
      spec3DSpectralLines = [];
      spec3DPhotons = [];
      spec3DLineTimer = 0;

      // Luzes
      spec3DScene.add(new THREE.AmbientLight(0x1a2a44, 1.0));
      const d1 = new THREE.DirectionalLight(0xffffff, 0.5);
      d1.position.set(4, 8, 4); spec3DScene.add(d1);

      // Mesa
      const tabMat = new THREE.MeshPhongMaterial({ color: 0x090d18, shininess: 15 });
      const tab = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 6), tabMat);
      tab.position.set(0, -1.55, 0); spec3DScene.add(tab);

      // Tubo de descarga
      const tubeMat = new THREE.MeshPhongMaterial({ color: 0x7799cc, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
      const tubeGlow = new THREE.MeshBasicMaterial({ color: specMode === 'emission' ? 0xff55bb : 0x4488ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const tubeGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.8, 16, 1, true);
      const tg = new THREE.Mesh(tubeGeo, tubeMat);
      const gi = new THREE.Mesh(tubeGeo, tubeGlow);
      [tg, gi].forEach(m => { m.rotation.z = Math.PI / 2; m.position.set(-7.5, 0.1, 0); spec3DScene.add(m); });

      // Eletrodos
      const eMat = new THREE.MeshPhongMaterial({ color: 0x445566 });
      [-2, 2].forEach(x => {
        const e = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 8), eMat);
        e.rotation.z = Math.PI / 2; e.position.set(-7.5 + x, 0.1, 0); spec3DScene.add(e);
      });

      // Suportes
      [-0.55, 0.55].forEach(z => {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.7, 8), eMat);
        s.position.set(-7.5, -0.75, z); spec3DScene.add(s);
      });
      const tubeLight = new THREE.PointLight(specMode === 'emission' ? 0xff55bb : 0x4488ff, 1.4, 6);
      tubeLight.position.set(-7.5, 0.1, 0); spec3DScene.add(tubeLight);
      spec3D_tubeLight = tubeLight;

      // Fenda
      const slitMat = new THREE.MeshPhongMaterial({ color: 0x1a2233 });
      const slitF = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 1.0), slitMat);
      slitF.position.set(-4.5, 0.1, 0); spec3DScene.add(slitF);

      // Abertura
      const slitO = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.4, 0.06), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      slitO.position.set(-4.5, 0.1, 0); spec3DScene.add(slitO);

      // Feixe único (antes do prisma)
      const beamColor0 = specMode === 'absorption' ? 0xffffff : 0xff99cc;
      const beamMat = new THREE.MeshBasicMaterial({ color: beamColor0, transparent: true, opacity: 0.30 });
      const beamSingle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6), beamMat);
      beamSingle.rotation.z = Math.PI / 2;
      beamSingle.position.set(-2.8, 0.1, 0);
      spec3DScene.add(beamSingle);

      // Prisma
      const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(1.5, 0), new THREE.Vector2(0.75, 1.3)];
      const prismShape = new THREE.Shape(pts);
      const prismGeo = new THREE.ExtrudeGeometry(prismShape, { depth: 0.9, bevelEnabled: false });
      prismGeo.center();
      const prismMat = new THREE.MeshPhongMaterial({
        color: 0xaad4ff, transparent: true, opacity: 0.38,
        shininess: 140, specular: 0xffffff, side: THREE.DoubleSide
      });
      const prism = new THREE.Mesh(prismGeo, prismMat);
      prism.position.set(-0.5, 0.1, 0);
      prism.rotation.y = 0.25;
      spec3DScene.add(prism);
      const prismEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(prismGeo),
        new THREE.LineBasicMaterial({ color: 0xbbddff, transparent: true, opacity: 0.7 })
      );
      prismEdge.position.copy(prism.position);
      prismEdge.rotation.copy(prism.rotation);
      spec3DScene.add(prismEdge);

      // Tela VERTICAL (à direita, de frente para câmera)
      const screenW = 6.0, screenH = 1.6;

      // Texturas
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 512; texCanvas.height = 128;
      const texCtx = texCanvas.getContext('2d');

      if (specMode === 'absorption') {
        texCtx.fillStyle = '#ffffff';
        texCtx.fillRect(0, 0, 512, 128);
        balmerVisible.forEach((line, idx) => {
          const xPx = 60 + (idx / (balmerVisible.length - 1)) * 392;
          texCtx.fillStyle = '#000000';
          texCtx.fillRect(xPx - 8, 0, 16, 128);
        });
      } else {
        texCtx.fillStyle = '#080b18';
        texCtx.fillRect(0, 0, 512, 128);
      }

      const screenTex = new THREE.CanvasTexture(texCanvas);
      const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.DoubleSide });
      const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.rotation.y = -Math.PI / 2;
      screen.position.set(6.8, 0.2, 0);
      spec3DScene.add(screen);

      // Moldura
      const frameMat2 = new THREE.MeshPhongMaterial({ color: 0x1a2a3a });
      [
        [0.08, 0.08, screenW + 0.12, 6.8, screenH / 2 + 0.2, 0],
        [0.08, 0.08, screenW + 0.12, 6.8, -screenH / 2 + 0.2, 0],
        [0.08, screenH + 0.12, 0.08, 6.8, 0.2, screenW / 2],
        [0.08, screenH + 0.12, 0.08, 6.8, 0.2, -screenW / 2],
      ].forEach(([gx, gy, gz, px, py, pz]) => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(gx, gy, gz), frameMat2);
        f.position.set(px, py, pz);
        spec3DScene.add(f);
      });

      // Linhas espectrais
      spec3D_screenLines = [];
      const lineData = balmerVisible;
      const spreadZ = screenW * 0.80;
      lineData.forEach((line, idx) => {
        const col = nmToThreeColor(line.nm);
        const zPos = -spreadZ / 2 + (idx / (lineData.length - 1)) * spreadZ;

        const lineMat = new THREE.MeshBasicMaterial({
          color: specMode === 'absorption' ? 0x000000 : col,
          transparent: true,
          opacity: specMode === 'absorption' ? 0 : 1
        });
        const lineGeo = new THREE.BoxGeometry(0.05, screenH * 0.88, 0.04);
        const lineMesh = new THREE.Mesh(lineGeo, lineMat);
        lineMesh.position.set(6.82, 0.2, zPos);
        lineMesh.scale.set(1, 0, 1);
        lineMesh.userData = { spectralLine: true, ...line, n1: 2, idx };
        spec3DScene.add(lineMesh);
        spec3DSpectralLines.push(lineMesh);
        spec3D_screenLines.push({ mesh: lineMesh, zPos, col });

        // Halo
        if (specMode === 'emission') {
          const hMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
          const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, screenH * 0.88, 0.22), hMat);
          hMesh.position.set(6.82, 0.2, zPos);
          hMesh.scale.set(1, 0, 1);
          spec3DScene.add(hMesh);
          spec3D_screenLines[idx].halo = hMesh;
          const pt = new THREE.PointLight(col, 0, 3);
          pt.position.set(6.5, 0.2, zPos);
          spec3DScene.add(pt);
          spec3D_screenLines[idx].light = pt;
        }

        // Feixe prisma -> parede
        const beamColor = specMode === 'absorption' ? 0xffffff : col;
        const bLen = Math.sqrt(Math.pow(6.8 - (-0.5), 2) + Math.pow(zPos, 2));
        const bGeo = new THREE.CylinderGeometry(0.015, 0.015, bLen, 5);
        const bMat2 = new THREE.MeshBasicMaterial({ color: beamColor, transparent: true, opacity: 0 });
        const bMesh = new THREE.Mesh(bGeo, bMat2);
        bMesh.rotation.z = Math.PI / 2;
        bMesh.rotation.y = -Math.atan2(zPos, 6.8 - (-0.5));
        bMesh.position.set((-0.5 + 6.8) / 2, 0.2, zPos / 2);
        spec3DScene.add(bMesh);
        spec3D_screenLines[idx].beam = bMesh;

        // Label
        const lc = document.createElement('canvas');
        lc.width = 140; lc.height = 52;
        const lx = lc.getContext('2d');
        lx.fillStyle = `rgb(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)})`;
        lx.font = 'bold 22px monospace'; lx.textAlign = 'center';
        lx.fillText(line.name, 70, 24);
        lx.font = '15px monospace';
        lx.fillText(Math.round(line.nm * 10) + ' Å', 70, 44);
        const tex = new THREE.CanvasTexture(lc);
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0 }));
        spr.position.set(6.82, screenH / 2 + 0.6, zPos);
        spr.scale.set(1.2, 0.44, 1);
        spec3DScene.add(spr);
        spec3D_screenLines[idx].label = spr;
      });

      drawSpecLevelsCanvas();
    }

    function spawnSpec3DPhoton() {
      if (!spec3DScene || specMode !== 'emission') return;
      const col = nmToThreeColor(balmerVisible[Math.floor(Math.random() * 4)].nm);
      const geo = new THREE.SphereGeometry(0.055, 5, 5);
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(-6.5, 0.1 + (Math.random() - 0.5) * 0.2, 0);
      m.userData.vel = new THREE.Vector3(0.055 + Math.random() * 0.02, (Math.random() - 0.5) * 0.005, 0);
      m.userData.life = 100;
      spec3DScene.add(m);
      spec3DPhotons.push(m);
    }

    function animateSpec3D() {
      spec3DAnimId = requestAnimationFrame(animateSpec3D);
      if (!spec3DRenderer || !spec3DScene) return;

      spec3DScene.rotation.y = spec3DRotY;
      spec3DScene.rotation.x = spec3DRotX;

      if (spec3D_tubeLight) {
        spec3D_tubeLight.intensity = 1.2 + Math.sin(Date.now() * 0.006) * 0.4;
      }

      // Animação das linhas espectrais surgindo
      spec3DLineTimer++;
      if (spec3D_screenLines) {
        const progress = Math.min(1, spec3DLineTimer / 40);
        spec3D_screenLines.forEach((sl) => {
          sl.mesh.scale.set(1, progress, 1);
          if (sl.beam) sl.beam.material.opacity = progress * (specMode === 'absorption' ? 0.12 : 0.28);
          if (sl.halo) { sl.halo.scale.set(1, progress, 1); sl.halo.material.opacity = progress * 0.28; }
          if (sl.light) sl.light.intensity = progress * 0.65;
          if (sl.label) sl.label.material.opacity = progress * 0.9;
        });
      }

      if (specMode === 'emission' && Math.random() < 0.06) spawnSpec3DPhoton();
      for (let i = spec3DPhotons.length - 1; i >= 0; i--) {
        const p = spec3DPhotons[i];
        p.position.add(p.userData.vel);
        p.userData.life--;
        p.material.opacity = p.userData.life / 100;
        if (p.userData.life <= 0 || p.position.x > 5.5) {
          spec3DScene.remove(p); spec3DPhotons.splice(i, 1);
        }
      }

      spec3DRenderer.render(spec3DScene, spec3DCamera);
    }

    // ── DIAGRAMA DE NÍVEIS DE ENERGIA 2D ──
    function drawSpecLevelsCanvas() {
      const canvas = document.getElementById('specLevelsCanvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = rect.width || canvas.parentElement.clientWidth || 320;
      const H = 200;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      const isWhite = document.body.classList.contains('bg-white');
      const activeN1 = selectedLineInfo ? selectedLineInfo.n1 : 2;
      const activeN2 = selectedLineInfo ? selectedLineInfo.n2 : 3;
      const activeNm = selectedLineInfo ? selectedLineInfo.nm : 656.28;
      const col = wavelengthToColor(activeNm);
      const strokeCol = `rgb(${col.r},${col.g},${col.b})`;

      const padL = 50, padR = 40, padT = 24, padB = 22;
      const plotH = H - padT - padB;

      // Posição Y dos níveis de Bohr
      function getY(n) {
        if (n === 'inf') return padT;
        return padT + plotH * (1 - (1 - 1 / n) / (1 - 1 / 6));
      }

      // Fundo e grade sutil
      ctx.fillStyle = isWhite ? 'rgba(240,245,252,0.6)' : 'rgba(2,5,15,0.7)';
      ctx.fillRect(0, 0, W, H);

      // Desenhar Níveis de Energia (n=1 a n=6 e Infinito)
      const levels = [
        { n: 1, e: -13.60, name: 'n = 1 (Fundamental)' },
        { n: 2, e: -3.40, name: 'n = 2' },
        { n: 3, e: -1.51, name: 'n = 3' },
        { n: 4, e: -0.85, name: 'n = 4' },
        { n: 5, e: -0.54, name: 'n = 5' },
        { n: 6, e: -0.38, name: 'n = 6' }
      ];

      levels.forEach(lvl => {
        const y = getY(lvl.n);
        const isTarget = lvl.n === activeN1;
        const isOrigin = lvl.n === activeN2;
        const isHighlighted = isTarget || isOrigin;

        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);

        if (isHighlighted) {
          ctx.strokeStyle = isTarget ? '#00ff88' : '#00ccff';
          ctx.lineWidth = 2.0;
          ctx.shadowColor = isTarget ? 'rgba(0,255,136,0.6)' : 'rgba(0,204,255,0.6)';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = isWhite ? 'rgba(0,60,120,0.2)' : 'rgba(0,180,255,0.18)';
          ctx.lineWidth = 1.0;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Rótulo Nível à esquerda
        ctx.font = isHighlighted ? "bold 10px 'Courier New', monospace" : "9px 'Courier New', monospace";
        ctx.fillStyle = isHighlighted ? (isTarget ? '#00ff88' : '#00ccff') : (isWhite ? '#446688' : '#7799bb');
        ctx.textAlign = 'right';
        ctx.fillText(`n=${lvl.n}`, padL - 6, y + 3);

        // Valor de Energia à direita
        ctx.font = "8.5px 'Courier New', monospace";
        ctx.fillStyle = isHighlighted ? (isWhite ? '#112233' : '#ffffff') : (isWhite ? '#7799aa' : '#557799');
        ctx.textAlign = 'left';
        ctx.fillText(`${lvl.e.toFixed(2)} eV`, W - padR + 6, y + 3);
      });

      // Desenhar Seta da Transição Ativa
      if (activeN2 > activeN1) {
        const yStart = getY(activeN2);
        const yEnd = getY(activeN1);
        const arrowX = padL + (W - padL - padR) * 0.48;

        // Linha da transição
        ctx.beginPath();
        ctx.moveTo(arrowX, yStart);
        ctx.lineTo(arrowX, yEnd);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = strokeCol;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cabeça da seta (se emissão: para baixo; se absorção: para cima)
        const isEmission = specMode === 'emission';
        const tipY = isEmission ? yEnd : yStart;
        const dir = isEmission ? 1 : -1;

        ctx.fillStyle = strokeCol;
        ctx.beginPath();
        ctx.moveTo(arrowX - 5, tipY - dir * 8);
        ctx.lineTo(arrowX + 5, tipY - dir * 8);
        ctx.lineTo(arrowX, tipY);
        ctx.closePath();
        ctx.fill();

        // Badge com fóton emitido/absorvido
        const midY = (yStart + yEnd) / 2;
        ctx.fillStyle = isWhite ? 'rgba(255,255,255,0.9)' : 'rgba(3,8,22,0.9)';
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(arrowX + 10, midY - 12, 90, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isWhite ? '#112233' : '#ffffff';
        ctx.font = "bold 9px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(`ΔE = ${(13.6 * (1 / (activeN1 * activeN1) - 1 / (activeN2 * activeN2))).toFixed(3)} eV`, arrowX + 55, midY - 1);
        ctx.fillStyle = strokeCol;
        ctx.font = "8px 'Courier New', monospace";
        ctx.fillText(`λ = ${Math.round(activeNm)} nm`, arrowX + 55, midY + 9);
      }
    }

    // ── FAIXAS ESPECTRAIS 2D ──
    function drawAllBands() {
      [1, 2, 3, 4].forEach(n1 => drawBand(n1));
    }

    function drawBand(n1) {
      const canvas = document.getElementById('band' + n1);
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = rect.width || canvas.parentElement.clientWidth || 900;
      const H = 90;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const isWhite = document.body.classList.contains('bg-white');
      const col = serieColors[n1];
      const serieName = serieNames[n1];

      const lines = [];
      for (let n2 = n1 + 1; n2 <= n1 + 8; n2++) {
        const nm = hydrogenWavelength(n1, n2);
        if (!nm) continue;
        const rel = 1 / Math.pow(n2 - n1, 0.75);
        const greek = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ'][n2 - n1 - 1] || ('n' + n2);
        lines.push({ n2, nm, rel, greek });
      }

      const nmVals = lines.map(l => l.nm);
      const nmMin0 = Math.min(...nmVals), nmMax0 = Math.max(...nmVals);
      const span = Math.max(300, (nmMax0 - nmMin0) * 1.5);
      const mid = (nmMin0 + nmMax0) / 2;
      const nmA = mid - span / 2, nmB = mid + span / 2;

      const padL = W < 480 ? 56 : 74, padR = W < 480 ? 10 : 16, padT = 24, padB = 18;
      const plotW = W - padL - padR;
      const bandH = H - padT - padB;
      const toX = nm => padL + (nm - nmA) / (nmB - nmA) * plotW;

      // Fundo
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, W, H);

      if (specMode === 'absorption') {
        const grad = ctx.createLinearGradient(padL, 0, padL + plotW, 0);
        for (let i = 0; i <= 200; i++) {
          const nm = nmA + (nmB - nmA) * i / 200;
          if (nm >= 380 && nm < 750) {
            const c = wavelengthToColor(nm);
            grad.addColorStop(i / 200, `rgba(${c.r},${c.g},${c.b},${Math.min(1, c.a * 1.2)})`);
          } else if (nm < 380) {
            grad.addColorStop(i / 200, `rgba(60,0,80,0.7)`);
          } else {
            grad.addColorStop(i / 200, `rgba(60,0,0,0.5)`);
          }
        }
        ctx.fillStyle = grad;
        ctx.fillRect(padL, padT, plotW, bandH);

        const vigL = ctx.createLinearGradient(padL, 0, padL + 30, 0);
        vigL.addColorStop(0, 'rgba(1,2,6,0.8)'); vigL.addColorStop(1, 'rgba(1,2,6,0)');
        ctx.fillStyle = vigL; ctx.fillRect(padL, padT, 30, bandH);

        const vigR = ctx.createLinearGradient(padL + plotW - 30, 0, padL + plotW, 0);
        vigR.addColorStop(0, 'rgba(1,2,6,0)'); vigR.addColorStop(1, 'rgba(1,2,6,0.8)');
        ctx.fillStyle = vigR; ctx.fillRect(padL + plotW - 30, padT, 30, bandH);
      } else {
        ctx.fillStyle = '#02040b';
        ctx.fillRect(padL, padT, plotW, bandH);
      }

      // Moldura da faixa espectral
      ctx.strokeStyle = 'rgba(0,180,255,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL + 0.5, padT + 0.5, plotW - 1, bandH - 1);

      // Renderizar Linhas Espectrais
      canvas._lines = [];
      lines.forEach(line => {
        const x = toX(line.nm);
        if (x < padL - 10 || x > padL + plotW + 10) return;
        const isSelected = selectedLineInfo && selectedLineInfo.n1 === n1 && selectedLineInfo.n2 === line.n2;
        const isHov = hoveredInfo && hoveredInfo.n1 === n1 && hoveredInfo.n2 === line.n2;
        const isSpecial = isSelected || isHov;

        if (specMode === 'emission') {
          const isVis = line.nm >= 380 && line.nm < 750;
          let r, g, b;
          if (isVis) {
            const c = wavelengthToColor(line.nm); r = c.r; g = c.g; b = c.b;
          } else {
            const hex = col.replace('#', '');
            r = parseInt(hex.slice(0, 2), 16); g = parseInt(hex.slice(2, 4), 16); b = parseInt(hex.slice(4, 6), 16);
          }
          const inten = isSpecial ? 1.0 : 0.45 + line.rel * 0.55;
          const gR = isSpecial ? 22 : 12 * line.rel;

          // Glow volumétrico
          const gg = ctx.createLinearGradient(x - gR * 2, 0, x + gR * 2, 0);
          gg.addColorStop(0, `rgba(${r},${g},${b},0)`);
          gg.addColorStop(0.5, `rgba(${r},${g},${b},${0.25 * inten})`);
          gg.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gg; ctx.fillRect(x - gR * 2, padT, gR * 4, bandH);

          // Linha central
          const lw = isSpecial ? 3.5 : 1.2 + line.rel * 1.5;
          const lg = ctx.createLinearGradient(x - lw, 0, x + lw, 0);
          lg.addColorStop(0, `rgba(${r},${g},${b},0)`);
          lg.addColorStop(0.3, `rgba(${r},${g},${b},${0.8 * inten})`);
          lg.addColorStop(0.5, `rgba(255,255,255,${0.98 * inten})`);
          lg.addColorStop(0.7, `rgba(${r},${g},${b},${0.8 * inten})`);
          lg.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = lg; ctx.fillRect(x - lw, padT + 1, lw * 2, bandH - 2);

          // Marcador de seleção
          if (isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - lw - 1, padT, lw * 2 + 2, bandH);
          }
        } else {
          // Modo Absorção
          const lw = isSpecial ? 4.0 : 1.8 + line.rel * 1.8;
          ctx.fillStyle = 'rgba(0,0,0,0.96)';
          ctx.fillRect(x - lw / 2, padT, lw, bandH);
          if (isSpecial) {
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.setLineDash([3, 2]);
            ctx.strokeRect(x - lw / 2 - 2, padT, lw + 4, bandH); ctx.setLineDash([]);
          }
        }

        // Rótulos da linha
        if ((line.n2 - n1 <= 4) || isSpecial) {
          const isVis = specMode === 'emission' && line.nm >= 380 && line.nm < 750;
          const c = isVis ? wavelengthToColor(line.nm) : null;
          ctx.fillStyle = isSpecial ? '#ffffff'
            : (c ? `rgba(${c.r},${c.g},${c.b},0.85)` : 'rgba(160,195,240,0.65)');
          ctx.font = `${isSpecial ? 'bold ' : ''} ${isSpecial ? 9.5 : 7.5}px 'Courier New',monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('H' + line.greek, x, padT - 10);
          ctx.fillStyle = 'rgba(120,160,220,0.55)';
          ctx.font = `6.5px 'Courier New',monospace`;
          ctx.fillText(Math.round(line.nm) + 'nm', x, padT - 2);
        }
        canvas._lines.push({ n1, n2: line.n2, nm: line.nm, rel: line.rel, greek: line.greek, x });
      });

      // Escala e Marcações de Comprimento de Onda
      const botY = padT + bandH;
      ctx.strokeStyle = 'rgba(0,140,240,0.3)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(padL, botY); ctx.lineTo(padL + plotW, botY); ctx.stroke();
      const nmRange = nmB - nmA;
      const step = nmRange < 200 ? 10 : nmRange < 600 ? 50 : nmRange < 1500 ? 100 : 500;
      for (let nm = Math.ceil(nmA / step) * step; nm <= nmB; nm += step) {
        const x = toX(nm);
        if (x < padL || x > padL + plotW) continue;
        ctx.strokeStyle = 'rgba(80,150,230,0.4)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x, botY); ctx.lineTo(x, botY + 4); ctx.stroke();
        ctx.fillStyle = 'rgba(90,150,230,0.65)';
        ctx.font = `6.5px 'Courier New',monospace`; ctx.textAlign = 'center';
        ctx.fillText(Math.round(nm), x, botY + 11);
      }

      // Nome da série à esquerda
      ctx.fillStyle = col;
      ctx.font = `bold 10px 'Courier New',monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(serieName, padL - 6, padT + bandH / 2 - 4);
      ctx.fillStyle = 'rgba(120,165,220,0.7)';
      ctx.font = `7px 'Courier New',monospace`;
      ctx.fillText('n₁ = ' + n1, padL - 6, padT + bandH / 2 + 7);
    }

    // ── ATUALIZAR INFORMAÇÕES DA LINHA SELECIONADA ──
    function updateSpecInfo(n1, n2, nm) {
      const dE = hc_eVnm / nm;
      const freqTHz = (c_light / nm).toFixed(1);
      const col = serieColors[n1];
      selectedLineInfo = { n1, n2, nm };

      const setVal = (id, text) => {
        const el = document.getElementById(id);
        if (el) { el.textContent = text; el.classList.remove('dim'); }
      };

      const greek = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ'][n2 - n1 - 1] || ('n' + n2);
      const lineSymbol = `${serieNames[n1]} H${greek}`;

      setVal('specLineBadge', lineSymbol);
      setVal('specLineName', `Linha H${greek} (${regionForNm(nm)})`);
      setVal('specLineSub', `Transição n=${n2} → n=${n1} • Série de ${serieNames[n1]}`);
      setVal('specTransition', `n=${n2} → n=${n1}`);
      setVal('specDeltaE', dE.toFixed(4) + ' eV');
      setVal('specLambda', `${nm.toFixed(1)} nm (${Math.round(nm * 10)} Å)`);
      setVal('specRegion', regionForNm(nm));
      setVal('specFrequency', `${freqTHz} THz`);
      setVal('specSerieName', `${serieNames[n1]} (n₁ = ${n1})`);

      const sw = document.getElementById('specColorSwatch');
      if (sw) {
        sw.style.opacity = '1';
        if (nm >= 380 && nm < 750) {
          const c = wavelengthToColor(nm);
          sw.style.background = `rgb(${c.r},${c.g},${c.b})`;
          sw.style.boxShadow = `0 0 18px rgb(${c.r},${c.g},${c.b})`;
        } else {
          sw.style.background = col;
          sw.style.boxShadow = `0 0 14px ${col}`;
        }
      }

      drawSpecLevelsCanvas();
    }

    // ── EVENTOS INTERATIVOS DOS CANVASES ESPECTRAIS ──
    function bindAllBandEvents() {
      [1, 2, 3, 4].forEach(n1 => {
        const canvas = document.getElementById('band' + n1);
        if (!canvas || canvas._evBound) return;
        canvas._evBound = true;

        function handleHit(e) {
          const rect = canvas.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const mx = (clientX - rect.left);
          const hits = canvas._lines || [];
          let best = null, bestD = 999;
          hits.forEach(h => {
            const d = Math.abs(h.x - mx);
            if (d < bestD) { bestD = d; best = h; }
          });
          return { best, bestD };
        }

        canvas.addEventListener('mousemove', function (e) {
          const { best, bestD } = handleHit(e);
          const newHov = (best && bestD < 32) ? { n1: best.n1, n2: best.n2 } : null;
          const changed = JSON.stringify(newHov) !== JSON.stringify(hoveredInfo);
          if (changed) {
            hoveredInfo = newHov;
            canvas.style.cursor = newHov ? 'pointer' : 'crosshair';
            drawBand(n1);
            if (newHov) updateSpecInfo(newHov.n1, newHov.n2, best.nm);
          }
        });

        canvas.addEventListener('mouseleave', function () {
          if (hoveredInfo && hoveredInfo.n1 === n1) {
            hoveredInfo = null;
            drawBand(n1);
          }
        });

        canvas.addEventListener('click', function (e) {
          const { best, bestD } = handleHit(e);
          if (best && bestD < 36) {
            updateSpecInfo(best.n1, best.n2, best.nm);
            drawAllBands();
          }
        });

        // Suporte Mobile Touch otimizado
        canvas.addEventListener('touchstart', function (e) {
          const { best, bestD } = handleHit(e);
          if (best && bestD < 42) {
            updateSpecInfo(best.n1, best.n2, best.nm);
            drawAllBands();
          }
        }, { passive: true });
      });
    }

    function drawSpectrum() {
      drawAllBands();
      drawSpecLevelsCanvas();
      bindAllBandEvents();
    }
    function redrawSpectrum() { drawSpectrum(); }

    // Redesenhar o espectro responsivo ao redimensionar a janela
    let specResizeTimeout;
    window.addEventListener('resize', () => {
      resizeSpec3D();
      if (document.getElementById('espectro') && document.getElementById('espectro').classList.contains('active')) {
        clearTimeout(specResizeTimeout);
        specResizeTimeout = setTimeout(() => {
          drawSpectrum();
        }, 120);
      }
    });