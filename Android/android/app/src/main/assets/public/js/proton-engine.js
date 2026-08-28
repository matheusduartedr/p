// Variáveis globais Three.js
        let scene, camera, renderer, controls;
        let nucleus, orbitals = [], electrons = [];
        let isRotating = true;
        let showElectrons = true;
        let currentMode = 'quantum';
        let currentAtom = 'H';
        let selectedAtom = 'H';
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
        let hydrogenExcitedLevel = 1; // Nível de excitação do H (1, 2, 3, 4)
        
        function createParticleTexture() {
            const size = 64;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            return new THREE.CanvasTexture(canvas);
        }

        const particleTexture = createParticleTexture();
        
        function gaussianRandom(mean = 0, stdev = 1) {
            let u = 1 - Math.random();
            let v = Math.random();
            let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return z * stdev + mean;
        }

        function createCloud(level) {
            const particleCount = isMobile ? 6000 : 30000;
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const isWhite = document.body.classList.contains('bg-white');
            
            // Função para gerar um deslocamento 3D aleatório dentro de uma esfera limite
            function getRandomOffset(maxRadius) {
                const r = maxRadius * Math.random();
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.acos(2 * Math.random() - 1);
                return {
                    x: r * Math.sin(theta) * Math.cos(phi),
                    y: r * Math.cos(theta),
                    z: r * Math.sin(theta) * Math.sin(phi)
                };
            }

            // Pré-calcular os deslocamentos dos picos de brilho por lóbulo, mantendo-os confinados dentro da geometria
            const offsetsLevel2 = {
                '1': getRandomOffset(2.4 * 0.45),
                '-1': getRandomOffset(2.4 * 0.45)
            };

            const offsetsLevel3 = [
                getRandomOffset(2.4 * 0.45), // angle=0, side=1
                getRandomOffset(2.4 * 0.45), // angle=0, side=-1
                getRandomOffset(2.4 * 0.45), // angle=pi/2, side=1
                getRandomOffset(2.4 * 0.45)  // angle=pi/2, side=-1
            ];

            const offsetsLevel4 = [
                getRandomOffset(3.2 * 0.45),
                getRandomOffset(3.2 * 0.45),
                getRandomOffset(3.2 * 0.45),
                getRandomOffset(3.2 * 0.45)
            ];

            for (let i = 0; i < particleCount; i++) {
                let x, y, z;
                if (level === 1) {
                    // Adicionado raio mínimo maior (0.8) para que os elétrons fiquem bem afastados do núcleo
                    const r = 0.8 + -Math.log(1 - Math.random() * 0.99) * 1.8;
                    const phi = Math.random() * Math.PI * 2;
                    const theta = Math.acos(2 * Math.random() - 1);
                    x = r * Math.sin(theta) * Math.cos(phi);
                    y = r * Math.sin(theta) * Math.sin(phi);
                    z = r * Math.cos(theta);
                } else if (level === 2) {
                    // 2p — dois lóbulos verticais, esferas de raio = 2.4 escaladas por (1, 1.8, 1) centradas em ±2.8 para afastar do núcleo
                    const side = Math.random() > 0.5 ? 1 : -1;
                    const R = 2.4;
                    const off = offsetsLevel2[side];
                    
                    // Gerar ponto gaussiano centrado no offset aleatório
                    let px = off.x + gaussianRandom(0, R * 0.35);
                    let py = off.y + gaussianRandom(0, R * 0.35);
                    let pz = off.z + gaussianRandom(0, R * 0.35);
                    
                    // Clampar o ponto para garantir confinamento esférico estrito
                    const d = Math.sqrt(px*px + py*py + pz*pz);
                    if (d > R) {
                        px = (px / d) * R;
                        py = (py / d) * R;
                        pz = (pz / d) * R;
                    }
                    
                    // Aplicar escala e translação exatas do lóbulo correspondente (afastado 4.6 para afastar do núcleo)
                    x = px;
                    y = py * 1.8 + side * 4.6;
                    z = pz;
                } else if (level === 3) {
                    // 3p — dois halteres (eixos X e Z), lóbulos de raio = 2.4 escalados por (1.5, 1, 1) centrados em ±5.5
                    const angleIdx = Math.random() > 0.5 ? 0 : 1;
                    const angle = angleIdx === 0 ? 0 : Math.PI / 2;
                    const sideIdx = Math.random() > 0.5 ? 0 : 1;
                    const side = sideIdx === 0 ? 1 : -1;
                    
                    const R = 2.4;
                    const off = offsetsLevel3[angleIdx * 2 + sideIdx];
                    
                    let px = off.x + gaussianRandom(0, R * 0.35);
                    let py = off.y + gaussianRandom(0, R * 0.35);
                    let pz = off.z + gaussianRandom(0, R * 0.35);
                    
                    const d = Math.sqrt(px*px + py*py + pz*pz);
                    if (d > R) {
                        px = (px / d) * R;
                        py = (py / d) * R;
                        pz = (pz / d) * R;
                    }
                    
                    x = px * 1.5 + side * 5.5 * Math.cos(angle);
                    y = py;
                    z = pz + side * 5.5 * Math.sin(angle);
                } else {
                    // 3d cloverleaf — 4 lóbulos no plano XZ, de raio = 3.2 escalados por (1.5, 1, 1) rotacionados por angle, centrados em ±7.8
                    const lobeIdx = Math.floor(Math.random() * 4);
                    const angle = lobeIdx * (Math.PI / 2);
                    
                    const R = 3.2;
                    const off = offsetsLevel4[lobeIdx];
                    
                    let px = off.x + gaussianRandom(0, R * 0.35);
                    let py = off.y + gaussianRandom(0, R * 0.35);
                    let pz = off.z + gaussianRandom(0, R * 0.35);
                    
                    const d = Math.sqrt(px*px + py*py + pz*pz);
                    if (d > R) {
                        px = (px / d) * R;
                        py = (py / d) * R;
                        pz = (pz / d) * R;
                    }
                    
                    px *= 1.5;
                    const rx = px * Math.cos(angle) - pz * Math.sin(angle);
                    const rz = px * Math.sin(angle) + pz * Math.cos(angle);
                    
                    x = rx + 7.8 * Math.cos(angle);
                    y = py;
                    z = rz + 7.8 * Math.sin(angle);
                }
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                // Calcular distância radial até o núcleo (0,0,0)
                const dNuclear = Math.sqrt(x*x + y*y + z*z);

                // Fator de decaimento físico exponencial (quanto mais longe do núcleo, menor o brilho)
                const decayRate = level === 1 ? 2.5 : (level === 2 ? 4.2 : (level === 3 ? 5.8 : 8.5));
                const f = Math.max(0.0, Math.exp(-dNuclear / decayRate));

                // Definir cores de acordo com o nível e fundo
                let rBase, gBase, bBase;
                if (isWhite) {
                    // No fundo branco, queremos eletrons pretos que desbotam para branco (1,1,1) conforme se afastam
                    rBase = 0.0; gBase = 0.0; bBase = 0.0;

                    // Interpolação linear da cor base (perto do núcleo) até branco (longe do núcleo)
                    colors[i * 3]     = rBase * f + (1.0 - f);
                    colors[i * 3 + 1] = gBase * f + (1.0 - f);
                    colors[i * 3 + 2] = bBase * f + (1.0 - f);
                } else {
                    // No fundo escuro, cores brilhantes originais que desbotam para preto (0,0,0) e brilham branco no centro
                    if (level === 1) { rBase = 0.39; gBase = 0.59; bBase = 1.0; }
                    else if (level === 2) { rBase = 0.39; gBase = 0.78; bBase = 1.0; }
                    else if (level === 3) { rBase = 0.39; gBase = 1.0; bBase = 0.78; }
                    else { rBase = 1.0; gBase = 0.59; bBase = 0.39; }

                    // Perto do núcleo (f alto), o calor faz a cor ficar "branca-quente" (glowing white core)
                    // Conforme se afasta, desbota suavemente para preto
                    colors[i * 3]     = rBase * f + (1.0 - rBase) * Math.pow(f, 4) * 0.85;
                    colors[i * 3 + 1] = gBase * f + (1.0 - gBase) * Math.pow(f, 4) * 0.85;
                    colors[i * 3 + 2] = bBase * f + (1.0 - bBase) * Math.pow(f, 4) * 0.85;
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('basePosition', new THREE.BufferAttribute(new Float32Array(positions), 3));

            const material = new THREE.PointsMaterial({
                size: isMobile ? 0.35 : 0.25,
                map: particleTexture,
                vertexColors: true,
                transparent: true,
                opacity: isWhite ? 0.75 : 0.5,
                blending: isWhite ? THREE.NormalBlending : THREE.AdditiveBlending,
                depthWrite: false
            });

            // Adicionar efeito de twinkle no shader
            material.onBeforeCompile = function(shader) {
                shader.uniforms.time = { value: 0 };
                material.userData.shader = shader;
                
                shader.vertexShader = `varying vec3 vPos;\n` + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>\nvPos = position;`
                );

                shader.fragmentShader = `uniform float time;\nvarying vec3 vPos;\n` + shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <color_fragment>`,
                    `#include <color_fragment>\n` +
                    `float phase = sin(vPos.x * 20.0) + cos(vPos.y * 30.0) + sin(vPos.z * 40.0);\n` +
                    `float twinkle = (sin(time * 15.0 + phase * 10.0) + 1.0) * 0.5;\n` + 
                    `diffuseColor.a *= (0.1 + 0.9 * twinkle);`
                );
            };

            const cloud = new THREE.Points(geometry, material);
            scene.add(cloud);
            orbitals.push(cloud);
        }

        // Números quânticos do H por nível de excitação
        // Estado fundamental: 1s → n=1, ℓ=0, mℓ=0, ms=+½
        // n=2: exibimos 2p (ℓ=1, mℓ=0) como mais representativo
        // n=3: 3p (ℓ=1, mℓ=0)
        // n=4: 3d (ℓ=2, mℓ=0) — já que o simulador chama de "3d"
        const hydrogenQN = [
            { n: 1, l: 0, ml:  0, ms: '+½', orbital: '1s' },
            { n: 2, l: 1, ml:  0, ms: '+½', orbital: '2p' },
            { n: 3, l: 1, ml:  0, ms: '+½', orbital: '3p' },
            { n: 3, l: 2, ml:  0, ms: '+½', orbital: '3d' }
        ];

        function updateQuantumNumbers(level) {
            const qn = hydrogenQN[level - 1];
            if (!qn) return;
            const html =
                `<span class="qn-item"><b>n</b> = ${qn.n}</span>` +
                `<span class="qn-item"><b>ℓ</b> = ${qn.l}</span>` +
                `<span class="qn-item"><b>m<sub>ℓ</sub></b> = ${qn.ml}</span>` +
                `<span class="qn-item"><b>m<sub>s</sub></b> = ${qn.ms}</span>`;
            const q1 = document.getElementById('quantumNumbers');
            const q2 = document.getElementById('quantumNumbersBohr');
            if (q1) q1.innerHTML = html;
            if (q2) q2.innerHTML = html;
        }

        // Energias dos níveis (em eV) — valores de ionização aproximados
        const energyLevels = {
            '1s': -13.6,
            '2s': -3.4,
            '2p': -3.4,
            '3s': -1.51,
            '3p': -1.51,
            '3d': -1.51,
            'K': -13.6,   // n=1
            'L': -3.4,    // n=2
            'M': -1.51,   // n=3
            'N': -0.85    // n=4
        };

        // Expor funções globalmente ANTES de qualquer outra coisa
        window.changeAtom = function(atomSymbol) {
            currentAtom = atomSymbol;
            selectedAtom = atomSymbol;
            
            // Reset nível de excitação do Hidrogênio
            if (atomSymbol === 'H') {
                hydrogenExcitedLevel = 1;
                updateQuantumNumbers(1);
            }
            
            // Atualizar botões
            document.querySelectorAll('.atom-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-atom') === atomSymbol) {
                    btn.classList.add('active');
                }
            });
            
            if (currentMode === 'bohr') {
                createBohrAtom(atomSymbol);
            } else if (scene) {
                createAtom(atomSymbol);
            }
        };

        // ============================================
        // MODELO SEMI-CLÁSSICO 2D
        // ============================================
        let bohrElectrons = [];
        let bohrAnimationId = null;

        function createBohrAtom(atomSymbol) {
            const container = document.getElementById('bohr-container');
            const atom = atomicData[atomSymbol];
            if (!atom) return;

            // Limpar elétrons anteriores
            bohrElectrons.forEach(el => {
                if (el.element && el.element.parentNode) {
                    el.element.parentNode.removeChild(el.element);
                }
            });
            bohrElectrons = [];

            // Limpar órbitas anteriores
            const oldOrbits = container.querySelectorAll('.bohr-orbit');
            oldOrbits.forEach(orbit => orbit.remove());

            // Obter dimensões reais do container
            const rect = container.getBoundingClientRect();
            const containerWidth = container.clientWidth || rect.width || 700;
            const containerHeight = container.clientHeight || rect.height || 700;
            
            const baseSize = Math.min(containerWidth, containerHeight);
            const scale = baseSize / 700;
            
            // Raios ajustados para ficar menor no centro da tela, combinando com a escala do 3D
            const bohrRadiusUnit = baseSize * 0.015; 
            const bohrOrbitDefs = [
                { n: 1, radius: bohrRadiusUnit * 2.5, shell: 'K', level: 1 },
                { n: 2, radius: bohrRadiusUnit * 6,   shell: 'L', level: 2 },
                { n: 3, radius: bohrRadiusUnit * 10,  shell: 'M', level: 3 },
                { n: 4, radius: bohrRadiusUnit * 15,  shell: 'N', level: 4 }
            ];

            // Para H, mostrar apenas as 4 órbitas do Modelo Semi-clássico (n=1..4)
            // Para outros átomos, comportamento padrão
            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;

            if (atomSymbol === 'H') {
                // Desenhar as 4 órbitas possíveis
                bohrOrbitDefs.forEach((orb, idx) => {
                    const orbitEl = document.createElement('div');
                    orbitEl.className = 'bohr-orbit';
                    orbitEl.style.width = (orb.radius * 2) + 'px';
                    orbitEl.style.height = (orb.radius * 2) + 'px';
                    // Órbita atual fica mais visível
                    orbitEl.style.opacity = orb.n === hydrogenExcitedLevel ? '0.85' : '0.25';
                    orbitEl.style.borderStyle = orb.n === hydrogenExcitedLevel ? 'solid' : 'dashed';
                    orbitEl.style.borderColor = orb.n === hydrogenExcitedLevel
                        ? bohrLevelColor(orb.n) : 'rgba(255,255,255,0.3)';
                    container.appendChild(orbitEl);
                });

                // Colocar elétron na órbita do nível atual
                const activeOrb = bohrOrbitDefs[hydrogenExcitedLevel - 1];
                const electronSize = Math.max(8, Math.min(14, 14 * scale));
                const electron = document.createElement('div');
                electron.className = 'bohr-electron level-' + hydrogenExcitedLevel;
                electron.style.width = electronSize + 'px';
                electron.style.height = electronSize + 'px';
                electron.style.boxShadow = `0 0 18px ${bohrLevelColor(hydrogenExcitedLevel)}`;
                electron.style.background = bohrLevelColor(hydrogenExcitedLevel);
                electron.style.borderColor = bohrLevelColor(hydrogenExcitedLevel);
                container.appendChild(electron);

                const angle = Math.random() * Math.PI * 2;
                bohrElectrons.push({
                    element: electron,
                    radius: activeOrb.radius,
                    angle: angle,
                    speed: (isMobile ? 0.018 : 0.025) - hydrogenExcitedLevel * 0.003,
                    centerX, centerY,
                    level: hydrogenExcitedLevel,
                    size: electronSize / 2
                });

                // Atualizar display de energia no Modelo Semi-clássico
                const energies = [-13.6, -3.4, -1.51, -0.85];
                const shells = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)'];
                const displayValue = document.getElementById('energyDisplayValueBohr');
                const levelInfo = document.getElementById('energyLevelInfoBohr');
                if (displayValue) displayValue.textContent = energies[hydrogenExcitedLevel - 1].toFixed(2);
                if (levelInfo) levelInfo.textContent = 'Camada ' + shells[hydrogenExcitedLevel - 1];

            } else {
                // Comportamento genérico para outros átomos (não usado agora, mas mantido)
                bohrOrbitDefs.slice(0, 2).forEach((orb, idx) => {
                    const orbitEl = document.createElement('div');
                    orbitEl.className = 'bohr-orbit';
                    orbitEl.style.width = (orb.radius * 2) + 'px';
                    orbitEl.style.height = (orb.radius * 2) + 'px';
                    orbitEl.style.opacity = '0.4';
                    container.appendChild(orbitEl);
                });

                for (let i = 0; i < Math.min(atom.electrons, 2); i++) {
                    const orb = bohrOrbitDefs[i];
                    const electronSize = Math.max(8, Math.min(12, 12 * scale));
                    const electron = document.createElement('div');
                    electron.className = 'bohr-electron level-1';
                    electron.style.width = electronSize + 'px';
                    electron.style.height = electronSize + 'px';
                    container.appendChild(electron);
                    const angle = (i * Math.PI) + Math.random() * 0.3;
                    bohrElectrons.push({
                        element: electron,
                        radius: orb.radius,
                        angle, speed: 0.02,
                        centerX, centerY,
                        level: 1, size: electronSize / 2
                    });
                }
            }

            // Iniciar animação
            if (bohrAnimationId) cancelAnimationFrame(bohrAnimationId);
            animateBohr();

            updateAtomInfo(atom);
        }

        // Cor por nível do Modelo Semi-clássico
        function bohrLevelColor(n) {
            const colors = ['#00ff88', '#00ccff', '#ff00ff', '#ff2222'];
            return colors[(n - 1) % colors.length];
        }

        function updateBohrDistribution(totalElectrons) {
            const quantumInfo = document.getElementById('quantum-info');
            if (quantumInfo && currentMode === 'bohr') {
                let desc = '<br><strong>🔵 Modelo Semi-clássico com Princípio de Pauli:</strong><br>';
                desc += '<span style="font-size: 0.85rem;">Cada órbita contém apenas 1 elétron, respeitando a exclusão de estados quânticos idênticos.</span><br>';
                desc += '<span style="font-size: 0.85rem;">';
                
                // Descrever distribuição
                if (totalElectrons <= 2) {
                    desc += `Camada K: ${totalElectrons} elétron${totalElectrons > 1 ? 's' : ''} (orbital 1s)`;
                } else if (totalElectrons <= 8) {
                    desc += `Camada K: 2 elétrons (1s²) • Camada L: ${totalElectrons - 2} elétrons (2s, 2p)`;
                } else {
                    desc += `Camadas K, L ocupadas • Total: ${totalElectrons} elétrons`;
                }
                
                desc += '</span>';
                quantumInfo.innerHTML = desc;
            }
        }

        function distributeElectrons(total) {
            // Esta função não é mais usada no novo sistema
            // Mantida para compatibilidade
            const distribution = [0, 0, 0, 0];
            
            for (let i = 0; i < Math.min(total, 4); i++) {
                distribution[i] = 1;
            }
            
            let remaining = total - 4;
            let level = 0;
            while (remaining > 0) {
                distribution[level]++;
                remaining--;
                level = (level + 1) % 4;
            }
            
            return distribution;
        }

        function animateBohr() {
            bohrElectrons.forEach(e => {
                e.angle += e.speed;
                const x = e.centerX + e.radius * Math.cos(e.angle);
                const y = e.centerY + e.radius * Math.sin(e.angle);
                const halfSize = e.size || 6;
                e.element.style.left = (x - halfSize) + 'px';
                e.element.style.top = (y - halfSize) + 'px';
            });

            bohrAnimationId = requestAnimationFrame(animateBohr);
        }

        // Adicionar listener para redimensionamento do Modelo Semi-clássico e Espectro
        let resizeTimeout;
        window.addEventListener('resize', function() {
            // Limpar timeout anterior
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            
            // Aguardar 300ms após o último resize para recriar
            resizeTimeout = setTimeout(function() {
                if (currentMode === 'bohr' && (selectedAtom || currentAtom)) {
                    const atomToUse = selectedAtom || currentAtom;
                    createBohrAtom(atomToUse);
                }
                if (currentMode === 'spectrum') {
                    drawSpectrum();
                }
            }, 300);
        });

        window.changeMode = function(mode, targetBtn) {
            currentMode = mode;
            
            // Parar a simulação do espectro 3D se estiver mudando de aba
            if (mode !== 'spectrum') {
                stopSpec3D();
            }
            
            // Atualizar botões
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            // Suporte a chamada via onclick="changeMode('x')" e via código
            const activeBtn = targetBtn || document.querySelector(`.mode-btn[data-mode="${mode}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            
            const canvas3D = document.getElementById('canvas-container');
            const bohrContainer = document.getElementById('bohr-container');
            const specContainer = document.getElementById('spectrum-container');
            const legend = document.querySelector('.orbital-legend');
            
            // Controlar classe do body para o layout do espectro
            document.body.classList.toggle('mode-spectrum', mode === 'spectrum');
            
            if (mode === 'bohr') {
                // Mostrar Modelo Semi-clássico, esconder 3D e Espectro
                canvas3D.style.display = 'none';
                bohrContainer.style.display = 'block';
                specContainer.style.display = 'none';
                if (legend) legend.style.display = 'none';
                createBohrAtom(currentAtom);
            } else if (mode === 'quantum') {
                // Mostrar 3D, esconder Modelo Semi-clássico e Espectro
                canvas3D.style.display = 'block';
                bohrContainer.style.display = 'none';
                specContainer.style.display = 'none';
                if (legend) legend.style.display = 'flex';
                if (scene) {
                    createAtom(currentAtom);
                }
            } else if (mode === 'spectrum') {
                // Mostrar Espectro, esconder 3D e Modelo Semi-clássico
                canvas3D.style.display = 'none';
                bohrContainer.style.display = 'none';
                specContainer.style.display = 'flex';

                // Inicializar 3D primeiro
                if (!spec3DRenderer) {
                    initSpec3D();
                } else {
                    buildSpec3DScene();
                    if (!spec3DAnimId) animateSpec3D();
                }

                // Desenhar bandas no próximo frame (após layout ser calculado)
                requestAnimationFrame(() => {
                    drawAllBands();
                    bindAllBandEvents();
                });
            }
        };

        window.setBackground = function(bg) {
            const isWhite = bg === 'white';
            document.body.classList.toggle('bg-white', isWhite);

            // Atualizar renderer 3D
            if (renderer) {
                renderer.setClearColor(isWhite ? 0xf0f4f8 : 0x0a0a1a, 1);
            }

            // Atualizar fog da cena
            if (scene) {
                scene.fog = new THREE.Fog(isWhite ? 0xf0f4f8 : 0x0a0a1a, 10, 50);
            }

            // Atualizar renderer 3D do espectro
            if (spec3DRenderer) {
                const bgCol = isWhite ? 0xf0f4f8 : 0x05060f;
                spec3DRenderer.setClearColor(bgCol, 1);
                if (spec3DScene) {
                    spec3DScene.background = new THREE.Color(bgCol);
                    spec3DScene.fog = new THREE.Fog(bgCol, 18, 40);
                }
            }

            // Atualizar botões ativos
            const bgBlack = document.getElementById('bgBlack');
            const bgWhite = document.getElementById('bgWhite');
            if (bgBlack) bgBlack.classList.toggle('active-bg', !isWhite);
            if (bgWhite) bgWhite.classList.toggle('active-bg', isWhite);

            const specBgBlack = document.getElementById('specBgBlack');
            const specBgWhite = document.getElementById('specBgWhite');
            if (specBgBlack) specBgBlack.classList.toggle('active', !isWhite);
            if (specBgWhite) specBgWhite.classList.toggle('active', isWhite);

            // Sincronizar quick-bar do espectro
            if (typeof syncSpecBgQBar === 'function') syncSpecBgQBar(bg);

            // Recriar átomo ou redesenhar espectro para aplicar novas cores
            if (currentMode === 'quantum') {
                createAtom(currentAtom);
            } else if (currentMode === 'spectrum') {
                setTimeout(drawSpectrum, 30);
            }
        };

        window.toggleRotation = function() {
            isRotating = !isRotating;
            const btn = document.getElementById('rotationBtn');
            if (btn) btn.textContent = isRotating ? '⏸️ Pausar Rotação' : '▶️ Iniciar Rotação';
            // Sincronizar quick-bar
            const qbIcon  = document.getElementById('qbRotationIcon');
            const qbLabel = document.getElementById('qbRotationLabel');
            if (qbIcon)  qbIcon.textContent  = isRotating ? '⏸️' : '▶️';
            if (qbLabel) qbLabel.textContent = isRotating ? 'Pausar' : 'Retomar';
        };

        window.toggleElectrons = function() {
            showElectrons = !showElectrons;
            const btn = document.getElementById('electronBtn');
            if (btn) btn.textContent = showElectrons ? '👁️ Ocultar Elétrons' : '👁️ Mostrar Elétrons';
            // Sincronizar quick-bar
            const qbIcon  = document.getElementById('qbElectronIcon');
            const qbLabel = document.getElementById('qbElectronLabel');
            if (qbIcon)  qbIcon.textContent  = showElectrons ? '👁️' : '🙈';
            if (qbLabel) qbLabel.textContent = showElectrons ? 'Elétrons' : 'Ocultos';
            
            if (showElectrons) {
                createAtom(currentAtom);
            } else {
                electrons.forEach(electron => {
                    electron.geometry.dispose();
                    electron.material.dispose();
                    scene.remove(electron);
                });
                electrons = [];
            }
        };

        window.resetView = function() {
            if (scene) scene.quaternion.set(0, 0, 0, 1);
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 0, 0);
        };

        window.changeOrbitalStyle = function(style) {
            orbitalStyle = style;
            if (currentMode === 'quantum') {
                createAtom(currentAtom);
            }
        };

        window.exciteElectron = function() {
            if (currentAtom !== 'H') return;

            // Subir um nível (cicla de 1→2→3→4→1)
            hydrogenExcitedLevel++;
            if (hydrogenExcitedLevel > 4) hydrogenExcitedLevel = 1;

            const energies    = [-13.6, -3.4, -1.51, -0.85];
            const levelLabels = ['1s (n=1)', '2p (n=2)', '3p (n=3)', '3d (n=3)'];
            const shells      = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)'];

            if (currentMode === 'quantum') {
                // No modo nuvem, não temos o array 'electrons' preenchido, mas podemos excitar o átomo
                if (orbitalStyle !== 'cloud' && electrons.length === 0) return;
                
                clearAtom();
                createNucleus();
                createHydrogenWaveFunction(hydrogenExcitedLevel);
                createEnergyWave();

                const displayValue = document.getElementById('energyDisplayValue');
                const levelInfo    = document.getElementById('energyLevelInfo');
                if (displayValue) { displayValue.textContent = energies[hydrogenExcitedLevel - 1].toFixed(2); displayValue.style.color = '#ff2222'; }
                if (levelInfo)    { levelInfo.textContent = 'Nível: ' + levelLabels[hydrogenExcitedLevel - 1]; levelInfo.style.color = '#ff2222'; }
                updateQuantumNumbers(hydrogenExcitedLevel);
                setTimeout(function() {
                    if (displayValue) displayValue.style.color = '#00ff88';
                    if (levelInfo)    levelInfo.style.color = 'rgba(255,255,255,0.7)';
                }, 1200);

            } else if (currentMode === 'bohr') {
                // Flash amarelo no elétron antes de reconstruir
                bohrElectrons.forEach(e => {
                    e.element.style.background = '#ff2222';
                    e.element.style.boxShadow  = '0 0 20px #ff2222';
                    e.element.style.borderColor = '#ff2222';
                });
                setTimeout(function() {
                    createBohrAtom(currentAtom);
                    updateQuantumNumbers(hydrogenExcitedLevel);
                    // Piscar display
                    const displayValue = document.getElementById('energyDisplayValueBohr');
                    const levelInfo    = document.getElementById('energyLevelInfoBohr');
                    if (displayValue) { displayValue.textContent = energies[hydrogenExcitedLevel - 1].toFixed(2); displayValue.style.color = '#ff2222'; }
                    if (levelInfo)    { levelInfo.textContent = 'Nível: ' + levelLabels[hydrogenExcitedLevel - 1]; levelInfo.style.color = '#ff2222'; }
                    setTimeout(function() {
                        if (displayValue) displayValue.style.color = '#00ff88';
                        if (levelInfo)    levelInfo.style.color = 'rgba(255,255,255,0.7)';
                    }, 800);
                }, 180);
            }
        };

        window.emitPhoton = function() {
            if (currentAtom !== 'H' || hydrogenExcitedLevel <= 1) return;

            const targetLevel = Math.ceil(Math.random() * (hydrogenExcitedLevel - 1));
            const energies    = [-13.6, -3.4, -1.51, -0.85];
            const levelLabels = ['1s (n=1)', '2p (n=2)', '3p (n=3)', '3d (n=3)'];

            if (currentMode === 'quantum') {
                // Capturar posição do elétron antes de limpar — mesmo se estiver invisível
                let emitPos = new THREE.Vector3(2, 0, 0);
                if (electrons.length > 0) {
                    emitPos = electrons[0].position.clone();
                    // Se o elétron estiver na origem (nunca moveu), usar posição no raio do orbital
                    if (emitPos.length() < 0.5) {
                        emitPos.set(hydrogenExcitedLevel * 2, 0, 0);
                    }
                }

                createPhoton(emitPos);

                hydrogenExcitedLevel = targetLevel;
                clearAtom();
                createNucleus();
                createHydrogenWaveFunction(hydrogenExcitedLevel);

                const displayValue = document.getElementById('energyDisplayValue');
                const levelInfo    = document.getElementById('energyLevelInfo');
                if (displayValue) { displayValue.textContent = energies[hydrogenExcitedLevel - 1].toFixed(2); displayValue.style.color = '#00ccff'; }
                if (levelInfo)    { levelInfo.textContent = 'Nível: ' + levelLabels[hydrogenExcitedLevel - 1]; levelInfo.style.color = '#00ccff'; }
                updateQuantumNumbers(hydrogenExcitedLevel);
                setTimeout(function() {
                    if (displayValue) displayValue.style.color = '#00ff88';
                    if (levelInfo)    levelInfo.style.color = 'rgba(255,255,255,0.7)';
                    updateAtomInfo(atomicData['H']);
                }, 1000);

            } else if (currentMode === 'bohr') {
                // Flash ciano + emitir fóton DOM imediatamente
                createBohrPhoton();
                bohrElectrons.forEach(e => {
                    e.element.style.background  = '#00ccff';
                    e.element.style.boxShadow   = '0 0 22px #00ccff';
                    e.element.style.borderColor = '#00ccff';
                });

                setTimeout(function() {
                    hydrogenExcitedLevel = targetLevel;
                    createBohrAtom(currentAtom);
                    updateQuantumNumbers(hydrogenExcitedLevel);
                    const displayValue = document.getElementById('energyDisplayValueBohr');
                    const levelInfo    = document.getElementById('energyLevelInfoBohr');
                    if (displayValue) { displayValue.textContent = energies[hydrogenExcitedLevel - 1].toFixed(2); displayValue.style.color = '#00ccff'; }
                    if (levelInfo)    { levelInfo.textContent = 'Nível: ' + levelLabels[hydrogenExcitedLevel - 1]; levelInfo.style.color = '#00ccff'; }
                    setTimeout(function() {
                        if (displayValue) displayValue.style.color = '#00ff88';
                        if (levelInfo)    levelInfo.style.color = 'rgba(255,255,255,0.7)';
                    }, 800);
                }, 250);
            }
        };

        // ══════════════════════════════════════════════
        // ESPECTRO — 4 séries simultâneas
        // ══════════════════════════════════════════════
        const hc_eVnm = 1239.84;
        const serieColors = { 1:'#aa55ff', 2:'#00cc66', 3:'#ff7722', 4:'#ffaa00' };
        const serieNames  = { 1:'Lyman', 2:'Balmer', 3:'Paschen', 4:'Brackett' };
        const serieRegion = { 1:'UV extremo', 2:'Visível / UV', 3:'IV próximo', 4:'IV médio' };
        let specMode = 'emission';
        let hoveredInfo = null; // {n1, n2}

        function hydrogenWavelength(n1, n2) {
            if (n2 <= n1) return null;
            const dE = 13.6 * (1/(n1*n1) - 1/(n2*n2));
            return hc_eVnm / dE;
        }

        function wavelengthToColor(nm) {
            let r, g, b;
            if      (nm < 380)  { r=0.5; g=0;   b=0.5; }
            else if (nm < 440)  { r=(440-nm)/60; g=0; b=1; }
            else if (nm < 490)  { r=0; g=(nm-440)/50; b=1; }
            else if (nm < 510)  { r=0; g=1; b=(510-nm)/20; }
            else if (nm < 580)  { r=(nm-510)/70; g=1; b=0; }
            else if (nm < 645)  { r=1; g=(645-nm)/65; b=0; }
            else if (nm < 750)  { r=1; g=0; b=0; }
            else                { r=0.5; g=0; b=0; }
            let a = 1;
            if (nm < 420) a = 0.3 + 0.7*(nm-380)/40;
            else if (nm > 700) a = 0.3 + 0.7*(750-nm)/50;
            return { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255), a };
        }

        function regionForNm(nm) {
            if (nm < 200)  return 'UV extremo';
            if (nm < 380)  return 'Ultravioleta (UV)';
            if (nm < 750)  return 'Visível';
            if (nm < 1400) return 'Infravermelho próximo';
            return 'Infravermelho';
        }

        window.setSpecMode = function(mode) {
            specMode = mode;
            const btnE = document.getElementById('btnEmission');
            const btnA = document.getElementById('btnAbsorption');
            if (btnE) { btnE.classList.toggle('active', mode === 'emission'); }
            if (btnA) { btnA.classList.toggle('active', mode === 'absorption'); }
            drawAllBands();
            if (spec3DRenderer) { spec3DLineTimer = 0; buildSpec3DScene(); }
        };

        // ── Sincronização dos botões da spec-quick-bar com o estado atual ──
        window.syncSpecQBar = function(mode) {
            const sqbE = document.getElementById('sqbEmission');
            const sqbA = document.getElementById('sqbAbsorption');
            if (sqbE) sqbE.classList.toggle('active', mode === 'emission');
            if (sqbA) sqbA.classList.toggle('active', mode === 'absorption');
        };

        window.syncSpecBgQBar = function(bg) {
            const sqbD = document.getElementById('sqbBgDark');
            const sqbL = document.getElementById('sqbBgLight');
            if (sqbD) sqbD.classList.toggle('active', bg === 'black');
            if (sqbL) sqbL.classList.toggle('active', bg === 'white');
        };

        // ── Acordeão do painel de dados do espectro (mobile) ──
        window.toggleSpecPanel = function() {
            if (window.innerWidth > 900) return; // desktop: sempre aberto
            const panel  = document.getElementById('spectrumPanel');
            const header = document.getElementById('specPanelAccHeader');
            if (!panel || !header) return;
            const isOpen = panel.classList.contains('open');
            panel.classList.toggle('open', !isOpen);
            header.classList.toggle('open', !isOpen);
            header.setAttribute('aria-expanded', String(!isOpen));
        };

        // ══════════════════════════════════════════════
        // CENA 3D DO ESPECTRO
        // ══════════════════════════════════════════════
        let spec3DScene, spec3DCamera, spec3DRenderer, spec3DAnimId;
        let spec3DDragging = false, spec3DLastX = 0, spec3DLastY = 0;
        let spec3DRotY = -0.3, spec3DRotX = 0.18;
        let spec3DSpectralLines = [];
        let spec3DPhotons = [];
        let spec3D_screenLines = [];
        let spec3D_tubeLight = null;
        let spec3DLineTimer = 0;
        let spec3DLineProgress = 0;

        function bindSpec3DEvents() {
            const canvas = document.getElementById('spec3DCanvas');
            const cont   = document.getElementById('spec3DContainer');
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
                mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
                mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, spec3DCamera);
                const hits = raycaster.intersectObjects(spec3DSpectralLines);
                if (!hits.length) return;

                const data = hits[0].object.userData;
                const nm   = data.nm;
                const dE   = hc_eVnm / nm;
                const n1 = 2, n2 = data.n2;

                // Painel flutuante
                const info    = document.getElementById('spec3DInfo');
                const title   = document.getElementById('spec3DTitle');
                const details = document.getElementById('spec3DDetails');
                if (info && title && details) {
                    info.style.display = 'block';
                    const c = wavelengthToColor(nm);
                    title.textContent  = `${data.name} — ${Math.round(nm*10)} Å`;
                    title.style.color  = `rgb(${c.r},${c.g},${c.b})`;
                    details.innerHTML  =
                        `Transição: n${n2} → n${n1}<br>` +
                        `ΔE = ${dE.toFixed(3)} eV<br>` +
                        `λ = ${Math.round(nm)} nm<br>` +
                        `n = ${n2},  ℓ = 1,  mₗ = 0<br>` +
                        `Série de Balmer`;
                }

                // Painel inferior
                updateSpecInfo(n1, n2, nm);

                // Destacar linha clicada
                spec3DSpectralLines.forEach(l => l.scale.set(1, 1, 1));
                hits[0].object.scale.set(1, 2.5, 1);
            });

            // Touch
            canvas.addEventListener('touchstart', e => {
                spec3DLastX = e.touches[0].clientX;
                spec3DLastY = e.touches[0].clientY;
            }, { passive: true });

            canvas.addEventListener('touchmove', e => {
                spec3DRotY += (e.touches[0].clientX - spec3DLastX) * 0.008;
                spec3DRotX += (e.touches[0].clientY - spec3DLastY) * 0.006;
                spec3DRotX  = Math.max(-0.5, Math.min(0.5, spec3DRotX));
                spec3DLastX = e.touches[0].clientX;
                spec3DLastY = e.touches[0].clientY;
            }, { passive: true });

            // Resize
            window.addEventListener('resize', () => {
                if (!spec3DRenderer || !cont) return;
                const W = cont.clientWidth, H = cont.clientHeight;
                spec3DCamera.aspect = W / H;
                spec3DCamera.updateProjectionMatrix();
                spec3DRenderer.setSize(W, H);
            });
        }

        function stopSpec3D() {
            if (spec3DAnimId) cancelAnimationFrame(spec3DAnimId);
            spec3DAnimId = null;
        }

        // Linhas Balmer visíveis (as mais educativas)
        const balmerVisible = [
            { n2:3, nm:656.3, name:'Hα', greek:'α' },
            { n2:4, nm:486.1, name:'Hβ', greek:'β' },
            { n2:5, nm:434.0, name:'Hγ', greek:'γ' },
            { n2:6, nm:410.2, name:'Hδ', greek:'δ' },
        ];

        function nmToThreeColor(nm) {
            const c = wavelengthToColor(nm);
            return new THREE.Color(c.r/255, c.g/255, c.b/255);
        }

        function initSpec3D() {
            const canvas = document.getElementById('spec3DCanvas');
            const cont   = document.getElementById('spec3DContainer');
            if (!canvas || !cont) return;
            const W = cont.clientWidth  || 800;
            const H = cont.clientHeight || 340;

            spec3DScene    = new THREE.Scene();
            spec3DScene.background = new THREE.Color(0x05060f);
            spec3DScene.fog        = new THREE.Fog(0x05060f, 18, 40);

            spec3DCamera   = new THREE.PerspectiveCamera(42, W/H, 0.1, 100);
            spec3DCamera.position.set(0, 4, 10);
            spec3DCamera.lookAt(1, 0, 0);

            spec3DRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            spec3DRenderer.setSize(W, H);
            spec3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            buildSpec3DScene();
            bindSpec3DEvents();
            animateSpec3D();
        }

        function buildSpec3DScene() {
            while (spec3DScene.children.length) spec3DScene.remove(spec3DScene.children[0]);
            spec3DSpectralLines = [];
            spec3DPhotons = [];
            spec3DLineProgress = 0;
            spec3DLineTimer    = 0;

            // Luzes
            spec3DScene.add(new THREE.AmbientLight(0x1a2a44, 1.0));
            const d1 = new THREE.DirectionalLight(0xffffff, 0.5);
            d1.position.set(4, 8, 4); spec3DScene.add(d1);

            // Mesa
            const tabMat = new THREE.MeshPhongMaterial({ color: 0x090d18, shininess: 15 });
            const tab = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 6), tabMat);
            tab.position.set(0, -1.55, 0); spec3DScene.add(tab);

            // ── Tubo de descarga ──
            const tubeMat  = new THREE.MeshPhongMaterial({ color: 0x7799cc, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
            const tubeGlow = new THREE.MeshBasicMaterial({ color: specMode === 'emission' ? 0xff55bb : 0x4488ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
            const tubeGeo  = new THREE.CylinderGeometry(0.14, 0.14, 3.8, 16, 1, true);
            const tg = new THREE.Mesh(tubeGeo, tubeMat);
            const gi = new THREE.Mesh(tubeGeo, tubeGlow);
            [tg, gi].forEach(m => { m.rotation.z = Math.PI/2; m.position.set(-7.5, 0.1, 0); spec3DScene.add(m); });
            // Eletrodos
            const eMat = new THREE.MeshPhongMaterial({ color: 0x445566 });
            [-2, 2].forEach(x => {
                const e = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 8), eMat);
                e.rotation.z = Math.PI/2; e.position.set(-7.5+x, 0.1, 0); spec3DScene.add(e);
            });
            // Suportes
            [-0.55, 0.55].forEach(z => {
                const s = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.7, 8), eMat);
                s.position.set(-7.5, -0.75, z); spec3DScene.add(s);
            });
            const tubeLight = new THREE.PointLight(0xff55bb, 1.4, 6);
            tubeLight.position.set(-7.5, 0.1, 0); spec3DScene.add(tubeLight);
            spec3D_tubeLight = tubeLight;

            // ── Fenda ──
            const slitMat = new THREE.MeshPhongMaterial({ color: 0x1a2233 });
            const slitF = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 1.0), slitMat);
            slitF.position.set(-4.5, 0.1, 0); spec3DScene.add(slitF);
            // Abertura
            const slitO = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.4, 0.06),
                new THREE.MeshBasicMaterial({ color: 0x000000 }));
            slitO.position.set(-4.5, 0.1, 0); spec3DScene.add(slitO);

            // ── Feixe único (antes do prisma) ──
            const beamColor0 = specMode === 'absorption' ? 0xffffff : 0xff99cc;
            const beamMat = new THREE.MeshBasicMaterial({ color: beamColor0, transparent: true, opacity: 0.30 });
            const beamSingle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6), beamMat);
            beamSingle.rotation.z = Math.PI/2;
            beamSingle.position.set(-2.8, 0.1, 0);
            spec3DScene.add(beamSingle);

            // ── Prisma ──
            const pts = [
                new THREE.Vector2(0, 0), new THREE.Vector2(1.5, 0), new THREE.Vector2(0.75, 1.3)
            ];
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

            // ── Tela VERTICAL (à direita, de frente para câmera) ──
            const screenW = 4.5, screenH = 1.2;

            // Criar textura da tela baseada no modo
            const texCanvas = document.createElement('canvas');
            texCanvas.width = 512; texCanvas.height = 128;
            const texCtx = texCanvas.getContext('2d');

            if (specMode === 'absorption') {
                // Fundo branco puro
                texCtx.fillStyle = '#ffffff';
                texCtx.fillRect(0, 0, 512, 128);

                // Linhas pretas largas e bem visíveis
                balmerVisible.forEach((line, idx) => {
                    const xPx = 60 + (idx / (balmerVisible.length - 1)) * 392;
                    texCtx.fillStyle = '#000000';
                    texCtx.fillRect(xPx - 8, 0, 16, 128);
                });
            } else {
                // Fundo escuro para emissão
                texCtx.fillStyle = '#080b18';
                texCtx.fillRect(0, 0, 512, 128);
            }

            const screenTex = new THREE.CanvasTexture(texCanvas);
            const screenMat = new THREE.MeshBasicMaterial({
                map: screenTex, side: THREE.DoubleSide
            });
            const screenGeo = new THREE.PlaneGeometry(screenH, screenW);
            const screen    = new THREE.Mesh(screenGeo, screenMat);
            screen.rotation.y = -Math.PI / 2;
            screen.position.set(6.8, 0.5, 0);
            spec3DScene.add(screen);

            // Moldura
            const frameMat2 = new THREE.MeshPhongMaterial({ color: 0x1a2a3a });
            [
                [0.08, screenW + 0.12, 0.08,  6.8, 0.5 + screenW/2, 0],
                [0.08, screenW + 0.12, 0.08,  6.8, 0.5 - screenW/2, 0],
                [0.08, 0.08, screenH + 0.12,  6.8, 0.5,  screenH/2],
                [0.08, 0.08, screenH + 0.12,  6.8, 0.5, -screenH/2],
            ].forEach(([gx, gy, gz, px, py, pz]) => {
                const f = new THREE.Mesh(new THREE.BoxGeometry(gx, gy, gz), frameMat2);
                f.position.set(px, py, pz);
                spec3DScene.add(f);
            });

            // ── Linhas espectrais na tela vertical (listras verticais, separadas por Z) ──
            spec3D_screenLines = [];
            const lineData = balmerVisible;
            const spreadZ = specMode === 'absorption' ? screenW * 0.72 : 3.6;
            lineData.forEach((line, idx) => {
                const col  = nmToThreeColor(line.nm);
                // Espalhar ao longo de Z (eixo de dispersão do prisma)
                const zPos = -spreadZ/2 + (idx / (lineData.length - 1)) * spreadZ;

                // Listra na tela (emissão: colorida; absorção: escura com borda)
                const lineMat = new THREE.MeshBasicMaterial({
                    color: specMode === 'absorption' ? 0x000000 : col,
                    transparent: true,
                    opacity: specMode === 'absorption' ? 0 : 1  // invisible in absorption — texture handles it
                });
                const lineGeo = new THREE.BoxGeometry(0.04, screenW * 0.90, specMode === 'absorption' ? 0.14 : 0.07);
                const lineMesh = new THREE.Mesh(lineGeo, lineMat);
                lineMesh.rotation.y = -Math.PI / 2;
                lineMesh.position.set(6.82, 0.5, zPos);
                lineMesh.scale.set(1, 0, 1); // cresce em Y
                lineMesh.userData = { spectralLine: true, ...line, n1: 2, idx };
                spec3DScene.add(lineMesh);
                spec3DSpectralLines.push(lineMesh);
                spec3D_screenLines.push({ mesh: lineMesh, zPos, col });

                // Halo glow (emissão)
                if (specMode === 'emission') {
                    const hMat  = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
                    const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, screenW*0.90, 0.28), hMat);
                    hMesh.rotation.y = -Math.PI / 2;
                    hMesh.position.set(6.82, 0.5, zPos);
                    hMesh.scale.set(1, 0, 1);
                    spec3DScene.add(hMesh);
                    spec3D_screenLines[idx].halo = hMesh;

                    const pt = new THREE.PointLight(col, 0, 3);
                    pt.position.set(6.5, 0.5, zPos);
                    spec3DScene.add(pt);
                    spec3D_screenLines[idx].light = pt;
                }

                // Feixe contínuo (absorção: branco; emissão: colorido)
                const beamColor = specMode === 'absorption' ? 0xffffff : col;
                const bLen = 6.82 - (-0.5);
                const bGeo = new THREE.CylinderGeometry(0.015, 0.015, bLen, 5);
                const bMat2 = new THREE.MeshBasicMaterial({
                    color: beamColor,
                    transparent: true, opacity: 0
                });
                const bMesh = new THREE.Mesh(bGeo, bMat2);
                // Inclinação: segue de (-0.5, 0.1, 0) até (6.82, 0.5, zPos)
                const dx = 6.82 - (-0.5), dz = zPos;
                const angleZ = Math.atan2(dz, dx);  // rotação em torno de Y
                bMesh.rotation.z = Math.PI / 2;
                bMesh.rotation.y = -angleZ;
                bMesh.position.set((-0.5 + 6.82) / 2, 0.2, zPos / 2);
                spec3DScene.add(bMesh);
                spec3D_screenLines[idx].beam = bMesh;

                // Label sprite acima de cada listra
                const lc = document.createElement('canvas');
                lc.width = 140; lc.height = 52;
                const lx = lc.getContext('2d');
                lx.fillStyle = `rgb(${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)})`;
                lx.font = 'bold 22px monospace'; lx.textAlign = 'center';
                lx.fillText(line.name, 70, 24);
                lx.font = '15px monospace';
                lx.fillText(Math.round(line.nm * 10) + ' Å', 70, 44);
                const tex = new THREE.CanvasTexture(lc);
                const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0 }));
                spr.position.set(6.82, 0.5 + screenW/2 + 0.4, zPos);
                spr.scale.set(1.2, 0.44, 1);
                spec3DScene.add(spr);
                spec3D_screenLines[idx].label = spr;
            });

            // Diagrama de níveis movido para HUD 2D (canvas sobreposto)
            drawLevelHUD();
        }

        // ── Diagrama de níveis como HUD 2D no canto ──
        function drawLevelHUD() {
            let hud = document.getElementById('spec3DHUD');
            if (!hud) {
                hud = document.createElement('canvas');
                hud.id = 'spec3DHUD';
                hud.style.cssText = 'position:absolute;top:10px;left:10px;pointer-events:none;border-radius:8px;';
                document.getElementById('spec3DContainer').appendChild(hud);
            }
            const W = 160, H = 220;
            hud.width = W; hud.height = H;
            hud.style.width  = W + 'px';
            hud.style.height = H + 'px';

            const ctx = hud.getContext('2d');
            ctx.clearRect(0, 0, W, H);

            // Fundo semi-transparente
            ctx.fillStyle = 'rgba(4,8,20,0.78)';
            ctx.beginPath();
            ctx.roundRect(0, 0, W, H, 8);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,180,255,0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Título
            ctx.fillStyle = '#6688aa';
            ctx.font = '9px monospace';
            ctx.fillText('Diagrama de Níveis', 10, 14);

            // Níveis n=1..5
            const padL = 38, padT = 26, padB = 18;
            const plotH = H - padT - padB;
            function lY(n) { return padT + plotH * (1 - (1 - 1/n)); }
            // escala: n=1 em baixo, n=∞ em cima
            function eY(n) { return padT + plotH * (1 - (1 - 1/n) / (1 - 1/6)); }

            [5,4,3,2,1].forEach(n => {
                const y = eY(n);
                const isBase = n === 2;
                ctx.strokeStyle = isBase ? '#00ccff' : n===1 ? '#00ff88' : '#334466';
                ctx.lineWidth = isBase ? 1.5 : 0.8;
                ctx.beginPath();
                ctx.moveTo(padL, y);
                ctx.lineTo(W - 10, y);
                ctx.stroke();
                ctx.fillStyle = isBase ? '#00ccff' : '#4a6a88';
                ctx.font = (isBase ? 'bold ' : '') + '9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('n='+n, padL - 4, y + 3);
                if (isBase || n === 1) {
                    const E = -13.6/(n*n);
                    ctx.fillStyle = 'rgba(100,140,180,0.6)';
                    ctx.font = '7px monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText(E.toFixed(1)+'eV', W - 38, y - 2);
                }
            });

            // Setas Balmer (n2→2)
            balmerVisible.forEach((line, idx) => {
                const c = wavelengthToColor(line.nm);
                const x = padL + 12 + idx * 22;
                const yTop = eY(Math.min(line.n2, 5));
                const yBot = eY(2);

                // Linha da seta
                ctx.strokeStyle = `rgb(${c.r},${c.g},${c.b})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, yTop + 1);
                ctx.lineTo(x, yBot - 5);
                ctx.stroke();

                // Ponta
                ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
                ctx.beginPath();
                ctx.moveTo(x - 4, yBot - 5);
                ctx.lineTo(x, yBot);
                ctx.lineTo(x + 4, yBot - 5);
                ctx.closePath();
                ctx.fill();

                // Label
                ctx.font = '7px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('H'+line.greek, x, yTop - 2);
            });
        }

        function spawnSpec3DPhoton() {
            if (!spec3DScene || specMode !== 'emission') return;
            const col = nmToThreeColor(balmerVisible[Math.floor(Math.random()*4)].nm);
            const geo = new THREE.SphereGeometry(0.055, 5, 5);
            const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
            const m   = new THREE.Mesh(geo, mat);
            m.position.set(-6.5, 0.1 + (Math.random()-0.5)*0.2, 0);
            m.userData.vel  = new THREE.Vector3(0.055 + Math.random()*0.02, (Math.random()-0.5)*0.005, 0);
            m.userData.life = 100;
            spec3DScene.add(m);
            spec3DPhotons.push(m);
        }

        function animateSpec3D() {
            spec3DAnimId = requestAnimationFrame(animateSpec3D);
            if (!spec3DRenderer || !spec3DScene) return;

            // Rotação drag
            spec3DScene.rotation.y = spec3DRotY;
            spec3DScene.rotation.x = spec3DRotX;

            // Pulsação do tubo
            if (spec3D_tubeLight) {
                spec3D_tubeLight.intensity = 1.2 + Math.sin(Date.now()*0.006)*0.4;
            }

            // Animação das linhas espectrais surgindo TODAS SIMULTANEAMENTE
            spec3DLineTimer++;
            if (spec3D_screenLines) {
                const progress = Math.min(1, spec3DLineTimer / 40);
                spec3D_screenLines.forEach((sl) => {
                    // Listra cresce em Y (vertical na tela)
                    sl.mesh.scale.set(1, progress, 1);
                    if (sl.beam) sl.beam.material.opacity = progress * (specMode === 'absorption' ? 0.10 : 0.28);
                    if (sl.halo) { sl.halo.scale.set(1, progress, 1); sl.halo.material.opacity = progress * 0.28; }
                    if (sl.light) sl.light.intensity = progress * 0.65;
                    if (sl.label) sl.label.material.opacity = progress * 0.9;
                });
            }

            // Fótons
            if (specMode === 'emission' && Math.random() < 0.06) spawnSpec3DPhoton();
            for (let i = spec3DPhotons.length-1; i >= 0; i--) {
                const p = spec3DPhotons[i];
                p.position.add(p.userData.vel);
                p.userData.life--;
                p.material.opacity = p.userData.life / 100;
                if (p.userData.life <= 0 || p.position.x > 5.5) {
                    spec3DScene.remove(p); spec3DPhotons.splice(i,1);
                }
            }

            spec3DRenderer.render(spec3DScene, spec3DCamera);
        }


        // ── Desenhar as 4 faixas ──
        function drawAllBands() {
            [1, 2, 3, 4].forEach(n1 => drawBand(n1));
        }

        function drawBand(n1) {
            const canvas = document.getElementById('band' + n1);
            if (!canvas) return;
            const W = canvas.parentElement ? (canvas.parentElement.clientWidth || 900) : 900;
            const H = 90;
            canvas.width  = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');

            // Série config
            const col = serieColors[n1];
            const serieName = serieNames[n1];

            // Linhas da série
            const lines = [];
            for (let n2 = n1+1; n2 <= n1+8; n2++) {
                const nm = hydrogenWavelength(n1, n2);
                if (!nm) continue;
                const rel = 1 / Math.pow(n2 - n1, 0.75);
                const greek = ['α','β','γ','δ','ε','ζ','η','θ'][n2-n1-1] || ('n'+n2);
                lines.push({ n2, nm, rel, greek });
            }

            // Escala λ
            const nmVals = lines.map(l => l.nm);
            const nmMin0 = Math.min(...nmVals), nmMax0 = Math.max(...nmVals);
            const span = Math.max(300, (nmMax0 - nmMin0) * 1.5);
            const mid  = (nmMin0 + nmMax0) / 2;
            const nmA  = mid - span/2, nmB = mid + span/2;

            // Layout — compacto para caber todas as 4 séries na janela
            const padL = 66, padR = 12, padT = 22, padB = 16;
            const plotW = W - padL - padR;
            const bandH = H - padT - padB;
            const toX   = nm => padL + (nm - nmA) / (nmB - nmA) * plotW;

            // Fundo sempre escuro (espectroscópio real)
            ctx.fillStyle = '#020409';
            ctx.fillRect(0, 0, W, H);

            if (specMode === 'absorption') {
                const grad = ctx.createLinearGradient(padL, 0, padL + plotW, 0);
                for (let i = 0; i <= 200; i++) {
                    const nm = nmA + (nmB - nmA) * i / 200;
                    if (nm >= 380 && nm < 750) {
                        const c = wavelengthToColor(nm);
                        grad.addColorStop(i/200, `rgba(${c.r},${c.g},${c.b},${Math.min(1, c.a * 1.2)})`);
                    } else if (nm < 380) {
                        grad.addColorStop(i/200, `rgba(60,0,80,0.7)`);
                    } else {
                        grad.addColorStop(i/200, `rgba(60,0,0,0.5)`);
                    }
                }
                ctx.fillStyle = grad;
                ctx.fillRect(padL, padT, plotW, bandH);
                // Vinheta
                const vigL = ctx.createLinearGradient(padL, 0, padL+30, 0);
                vigL.addColorStop(0, 'rgba(2,4,9,0.8)'); vigL.addColorStop(1, 'rgba(2,4,9,0)');
                ctx.fillStyle = vigL; ctx.fillRect(padL, padT, 30, bandH);
                const vigR = ctx.createLinearGradient(padL+plotW-30, 0, padL+plotW, 0);
                vigR.addColorStop(0, 'rgba(2,4,9,0)'); vigR.addColorStop(1, 'rgba(2,4,9,0.8)');
                ctx.fillStyle = vigR; ctx.fillRect(padL+plotW-30, padT, 30, bandH);
            } else {
                ctx.fillStyle = '#010208';
                ctx.fillRect(padL, padT, plotW, bandH);
            }

            // Borda da janela do espectro
            ctx.strokeStyle = 'rgba(0,150,255,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(padL+0.5, padT+0.5, plotW-1, bandH-1);

            // Linhas espectrais
            canvas._lines = [];
            lines.forEach(line => {
                const x = toX(line.nm);
                if (x < padL-10 || x > padL+plotW+10) return;
                const isHov = hoveredInfo && hoveredInfo.n1===n1 && hoveredInfo.n2===line.n2;

                if (specMode === 'emission') {
                    const isVis = line.nm >= 380 && line.nm < 750;
                    let r, g, b;
                    if (isVis) {
                        const c = wavelengthToColor(line.nm); r=c.r; g=c.g; b=c.b;
                    } else {
                        const hex = col.replace('#','');
                        r=parseInt(hex.slice(0,2),16); g=parseInt(hex.slice(2,4),16); b=parseInt(hex.slice(4,6),16);
                    }
                    const inten = isHov ? 1.0 : 0.4 + line.rel*0.6;
                    const gR    = isHov ? 20 : 10 * line.rel;
                    // Halo
                    const gg = ctx.createLinearGradient(x-gR*2,0,x+gR*2,0);
                    gg.addColorStop(0,   `rgba(${r},${g},${b},0)`);
                    gg.addColorStop(0.5, `rgba(${r},${g},${b},${0.20*inten})`);
                    gg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle=gg; ctx.fillRect(x-gR*2, padT, gR*4, bandH);
                    // Núcleo
                    const lw = isHov ? 3 : 1.0 + line.rel*1.6;
                    const lg = ctx.createLinearGradient(x-lw,0,x+lw,0);
                    lg.addColorStop(0,   `rgba(${r},${g},${b},0)`);
                    lg.addColorStop(0.3, `rgba(${r},${g},${b},${0.7*inten})`);
                    lg.addColorStop(0.5, `rgba(255,255,255,${0.95*inten})`);
                    lg.addColorStop(0.7, `rgba(${r},${g},${b},${0.7*inten})`);
                    lg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle=lg; ctx.fillRect(x-lw, padT+1, lw*2, bandH-2);
                } else {
                    const lw = isHov ? 3.5 : 1.5 + line.rel*2;
                    ctx.fillStyle='rgba(0,0,0,0.92)';
                    ctx.fillRect(x-lw/2, padT, lw, bandH);
                    if (isHov) {
                        ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
                        ctx.strokeRect(x-lw/2-2, padT, lw+4, bandH); ctx.setLineDash([]);
                    }
                }

                // Labels
                if ((line.n2-n1 <= 4) || isHov) {
                    const isVis = specMode==='emission' && line.nm>=380 && line.nm<750;
                    const c = isVis ? wavelengthToColor(line.nm) : null;
                    ctx.fillStyle = isHov ? 'rgba(255,255,255,0.95)'
                        : (c ? `rgba(${c.r},${c.g},${c.b},0.75)` : 'rgba(140,170,220,0.5)');
                    ctx.font = `${isHov?'bold ':''} ${isHov?9:7}px 'Courier New',monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillText('H'+line.greek, x, padT-9);
                    ctx.fillStyle = 'rgba(100,140,200,0.4)';
                    ctx.font = `6px 'Courier New',monospace`;
                    ctx.fillText(Math.round(line.nm)+'nm', x, padT-1);
                }
                canvas._lines.push({n1, n2:line.n2, nm:line.nm, rel:line.rel, greek:line.greek, x});
            });

            // Eixo X
            const botY = padT + bandH;
            ctx.strokeStyle='rgba(0,100,200,0.2)'; ctx.lineWidth=0.8;
            ctx.beginPath(); ctx.moveTo(padL,botY); ctx.lineTo(padL+plotW,botY); ctx.stroke();
            const nmRange = nmB-nmA;
            const step = nmRange<200?10:nmRange<600?50:nmRange<1500?100:500;
            for (let nm=Math.ceil(nmA/step)*step; nm<=nmB; nm+=step) {
                const x=toX(nm);
                if (x<padL||x>padL+plotW) continue;
                ctx.strokeStyle='rgba(60,120,200,0.3)'; ctx.lineWidth=0.8;
                ctx.beginPath(); ctx.moveTo(x,botY); ctx.lineTo(x,botY+3); ctx.stroke();
                ctx.fillStyle='rgba(70,130,210,0.55)';
                ctx.font=`6px 'Courier New',monospace`; ctx.textAlign='center';
                ctx.fillText(Math.round(nm), x, botY+10);
            }

            // Label série
            ctx.fillStyle = col;
            ctx.font = `bold 9px 'Courier New',monospace`;
            ctx.textAlign='right';
            ctx.fillText(serieName, padL-4, padT+bandH/2-3);
            ctx.fillStyle='rgba(80,120,180,0.5)';
            ctx.font=`6px 'Courier New',monospace`;
            ctx.fillText('n₁='+n1, padL-4, padT+bandH/2+6);
        }

        // ── Determinador de Região EM ──
        function regionForNm(nm) {
            if (nm < 380) return 'Ultravioleta';
            if (nm > 750) return 'Infravermelho';
            return 'Visível';
        }

        // ── Info ao clicar ──
        function updateSpecInfo(n1, n2, nm) {
            const hc_eVnm = 1239.84193; // Constante hc em eV·nm
            const dE = hc_eVnm / nm;
            const col = serieColors[n1];

            // Remove 'dim' ao exibir dados
            const setVal = (id, text) => {
                const el = document.getElementById(id);
                if (el) { el.textContent = text; el.classList.remove('dim'); }
            };

            setVal('specTransition', `n${n2} → n${n1}  (${serieNames[n1]})`);
            setVal('specDeltaE',     dE.toFixed(4) + ' eV');
            setVal('specLambda',     Math.round(nm) + ' nm  (' + Math.round(nm*10) + ' Å)');
            setVal('specRegion',     regionForNm(nm));

            const sw = document.getElementById('specColorSwatch');
            if (sw) {
                sw.style.opacity = '1';
                if (nm >= 380 && nm < 750) {
                    const c = wavelengthToColor(nm);
                    sw.style.background = `rgb(${c.r},${c.g},${c.b})`;
                    sw.style.boxShadow  = `0 0 12px rgb(${c.r},${c.g},${c.b})`;
                } else {
                    sw.style.background = col;
                    sw.style.boxShadow  = `0 0 10px ${col}`;
                }
            }
        }

        // ── Bind eventos em todos os canvases ──
        function bindAllBandEvents() {
            [1,2,3,4].forEach(n1 => {
                const canvas = document.getElementById('band'+n1);
                if (!canvas || canvas._evBound) return;
                canvas._evBound = true;

                canvas.addEventListener('mousemove', function(e) {
                    const rect = canvas.getBoundingClientRect();
                    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
                    const hits = canvas._lines || [];
                    let best = null, bestD = 999;
                    hits.forEach(h => { const d = Math.abs(h.x - mx); if (d < bestD) { bestD = d; best = h; } });
                    const newHov = (best && bestD < 26) ? {n1: best.n1, n2: best.n2} : null;
                    const changed = JSON.stringify(newHov) !== JSON.stringify(hoveredInfo);
                    if (changed) {
                        hoveredInfo = newHov;
                        canvas.style.cursor = newHov ? 'pointer' : 'default';
                        drawBand(n1);
                        if (newHov) updateSpecInfo(newHov.n1, newHov.n2, best.nm);
                    }
                });

                canvas.addEventListener('mouseleave', function() {
                    if (hoveredInfo && hoveredInfo.n1 === n1) {
                        hoveredInfo = null;
                        drawBand(n1);
                    }
                });

                canvas.addEventListener('click', function(e) {
                    const rect = canvas.getBoundingClientRect();
                    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
                    const hits = canvas._lines || [];
                    let best = null, bestD = 999;
                    hits.forEach(h => { const d = Math.abs(h.x - mx); if (d < bestD) { bestD = d; best = h; } });
                    if (best && bestD < 26) updateSpecInfo(best.n1, best.n2, best.nm);
                });
            });
        }

        function drawSpectrum()   { drawAllBands(); bindAllBandEvents(); }
        function redrawSpectrum() { drawSpectrum(); }

        window.toggleEnergyWaves = function() {
            showEnergyWaves = !showEnergyWaves;
            const btn = document.getElementById('waveBtn');
            if (btn) {
                btn.textContent = showEnergyWaves ? '🌊 Ondas: ON' : '🌊 Ondas: OFF';
            }
            
            if (!showEnergyWaves) {
                energyWaves.forEach(wave => {
                    wave.geometry.dispose();
                    wave.material.dispose();
                    scene.remove(wave);
                });
                energyWaves = [];
            }
        };

        // Dados dos átomos
        const atomicData = {
            H: { name: 'Hidrogênio', protons: 1, electrons: 1, config: '1s¹', 
                 orbitals: [{type: 's', n: 1, count: 1}] }
        };

        // ══════════════════════════════════════════════
        // ACORDEÃO — Toggle de seções recolhíveis
        // Funciona apenas em mobile (≤900px); em desktop os estilos
        // mantêm o conteúdo sempre visível (display:block).
        // ══════════════════════════════════════════════
        window.toggleAccordion = function(groupId) {
            // Se tela grande, não faz nada (os itens já estão sempre abertos)
            if (window.innerWidth > 900) return;

            const group   = document.getElementById(groupId);
            if (!group) return;

            const header  = group.querySelector('.accordion-header');
            const content = group.querySelector('.accordion-content');
            if (!header || !content) return;

            const isOpen = content.classList.contains('open');
            content.classList.toggle('open', !isOpen);
            header.classList.toggle('open', !isOpen);
            header.setAttribute('aria-expanded', String(!isOpen));
        };

        // Inicialização
        function init() {
            const container = document.getElementById('canvas-container');
            
            // Obter dimensões reais do container
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Cena
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

            // Câmera com aspect ratio correto
            camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 0, 0);

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
            renderer.setSize(width, height);
            renderer.setPixelRatio(pixelRatio);
            renderer.setClearColor(0x0a0a1a, 1);
            
            // Posicionar canvas corretamente
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.top = '0';
            renderer.domElement.style.left = '0';
            container.appendChild(renderer.domElement);

            // Luzes (otimizadas para mobile)
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const pointLight1 = new THREE.PointLight(0x00ccff, isMobile ? 0.7 : 1, 100);
            pointLight1.position.set(10, 10, 10);
            scene.add(pointLight1);

            if (!isMobile) {
                const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
                pointLight2.position.set(-10, -10, 10);
                scene.add(pointLight2);
            }

            // Controles de mouse
            setupMouseControls(container);

            // Criar átomo inicial
            createAtom(currentAtom);

            // Animação
            animate();

            // Responsividade
            window.addEventListener('resize', onWindowResize);
            
            // Forçar ajuste inicial
            setTimeout(() => onWindowResize(), 100);
        }

        let targetQuaternion = new THREE.Quaternion();
        let mouseSpeed = 0.005;

        function setupMouseControls(container) {
            // Controles de Mouse com Quaternions (Arcball livre sem trava/gimbal lock)
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            container.addEventListener('mousemove', (e) => {
                if (isDragging && scene) {
                    const deltaX = e.clientX - previousMousePosition.x;
                    const deltaY = e.clientY - previousMousePosition.y;

                    // Rotacionar no espaço da câmera para controle intuitivo em qualquer orientação
                    const deltaRotQuaternion = new THREE.Quaternion()
                        .setFromEuler(new THREE.Euler(
                            deltaY * mouseSpeed,
                            deltaX * mouseSpeed,
                            0,
                            'XYZ'
                        ));

                    scene.quaternion.multiplyQuaternions(deltaRotQuaternion, scene.quaternion);

                    previousMousePosition = { x: e.clientX, y: e.clientY };
                }
            });

            container.addEventListener('mouseup', () => { isDragging = false; });
            container.addEventListener('mouseleave', () => { isDragging = false; });

            container.addEventListener('wheel', (e) => {
                e.preventDefault();
                camera.position.z += e.deltaY * 0.01;
                camera.position.z = Math.max(8, Math.min(35, camera.position.z));
            });

            // Controles Touch para dispositivos móveis
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartDistance = 0;

            container.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (e.touches.length === 1) {
                    isDragging = true;
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                } else if (e.touches.length === 2) {
                    isDragging = false;
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    touchStartDistance = Math.sqrt(dx * dx + dy * dy);
                }
            }, { passive: false });

            container.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (e.touches.length === 1 && isDragging && scene) {
                    const deltaX = e.touches[0].clientX - touchStartX;
                    const deltaY = e.touches[0].clientY - touchStartY;

                    const deltaRotQuaternion = new THREE.Quaternion()
                        .setFromEuler(new THREE.Euler(
                            deltaY * 0.008,
                            deltaX * 0.008,
                            0,
                            'XYZ'
                        ));

                    scene.quaternion.multiplyQuaternions(deltaRotQuaternion, scene.quaternion);

                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                } else if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    const delta = distance - touchStartDistance;
                    camera.position.z -= delta * 0.05;
                    camera.position.z = Math.max(8, Math.min(35, camera.position.z));

                    touchStartDistance = distance;
                }
            }, { passive: false });

            container.addEventListener('touchend', (e) => {
                isDragging = false;
                touchStartDistance = 0;
            }, { passive: false });

            container.addEventListener('touchcancel', () => {
                isDragging = false;
                touchStartDistance = 0;
            });
        }

        function createNucleus() {
            const atom = atomicData[currentAtom];
            // Raio do núcleo cresce levemente com o número de prótons (r ∝ Z^(1/3))
            const baseRadius = 0.28;
            const nucleusRadius = atom ? baseRadius * Math.pow(atom.protons, 1/3) : baseRadius;
            const geometry = new THREE.SphereGeometry(nucleusRadius, 32, 32);
            const isWhite = document.body.classList.contains('bg-white');
            const material = new THREE.MeshPhongMaterial({
                color: isWhite ? 0xcc3300 : 0xff4500,
                emissive: isWhite ? 0x992200 : 0xff4500,
                emissiveIntensity: isWhite ? 0.3 : 0.5,
                shininess: 100
            });
            nucleus = new THREE.Mesh(geometry, material);
            scene.add(nucleus);
        }

        function createPhoton(startPosition) {
            if (!scene) return;
            if (isMobile && photons.length > 6) return;
            if (!isMobile && photons.length > 10) return;

            const count = isMobile ? 3 : 5;
            for (let p = 0; p < count; p++) {
                const segments = isMobile ? 12 : 16;
                const geometry = new THREE.SphereGeometry(0.28, segments, segments);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff2222,
                    transparent: false,
                    depthWrite: true
                });
                const photon = new THREE.Mesh(geometry, material);
                photon.position.copy(startPosition);

                const spread = (2 * Math.PI / count) * p + Math.random() * 0.3;
                const direction = new THREE.Vector3(
                    Math.cos(spread) * (0.8 + Math.random() * 0.2),
                    (Math.random() - 0.5) * 0.8,
                    Math.sin(spread) * (0.8 + Math.random() * 0.2)
                ).normalize();

                photon.userData = {
                    direction,
                    speed: 0.25,
                    life: isMobile ? 80 : 120,
                    maxLife: isMobile ? 80 : 120
                };

                // Glow generoso
                const glowGeo = new THREE.SphereGeometry(0.55, segments, segments);
                const glowMat = new THREE.MeshBasicMaterial({
                    color: 0xff6600,
                    transparent: true,
                    opacity: 0.7,
                    depthWrite: false
                });
                photon.add(new THREE.Mesh(glowGeo, glowMat));

                scene.add(photon);
                photons.push(photon);
            }
        }

        // Emissão de fóton no Modelo Semi-clássico (DOM animado)
        function createBohrPhoton() {
            const container = document.getElementById('bohr-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            // Pegar posição atual do elétron se existir
            let startX = cx, startY = cy;
            if (bohrElectrons.length > 0) {
                const e = bohrElectrons[0];
                startX = e.centerX + e.radius * Math.cos(e.angle);
                startY = e.centerY + e.radius * Math.sin(e.angle);
            }

            const count = isMobile ? 3 : 5;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('div');
                dot.style.cssText = `
                    position: absolute;
                    width: 10px; height: 10px;
                    background: #ff2222;
                    border-radius: 50%;
                    box-shadow: 0 0 14px 4px #ff6600;
                    pointer-events: none;
                    z-index: 200;
                    left: ${startX - 5}px;
                    top:  ${startY - 5}px;
                    transition: none;
                `;
                container.appendChild(dot);

                const angle = (2 * Math.PI / count) * i + Math.random() * 0.4;
                const dist  = 80 + Math.random() * 60;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;

                // Animar com requestAnimationFrame
                const startTime = performance.now();
                const duration  = 600 + Math.random() * 200;

                function animateDot(now) {
                    const t = Math.min((now - startTime) / duration, 1);
                    const ease = 1 - Math.pow(1 - t, 2);
                    dot.style.left    = (startX - 5 + tx * ease) + 'px';
                    dot.style.top     = (startY - 5 + ty * ease) + 'px';
                    dot.style.opacity = (1 - t).toFixed(2);
                    if (t < 1) requestAnimationFrame(animateDot);
                    else dot.remove();
                }
                requestAnimationFrame(animateDot);
            }
        }

        function createEnergyWave() {
            if (!showEnergyWaves || !scene || !nucleus) return;
            
            // Limitar ondas em mobile
            if (isMobile && energyWaves.length > 2) return;
            if (!isMobile && energyWaves.length > 5) return;
            
            const segments = isMobile ? 24 : 32;
            const geometry = new THREE.SphereGeometry(0.5, segments, segments);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.35,
                side: THREE.FrontSide,
                depthWrite: false
            });
            const wave = new THREE.Mesh(geometry, material);
            
            wave.position.copy(nucleus.position);
            wave.userData = {
                scale: 0.5,
                maxScale: isMobile ? 6 : 8,
                speed: isMobile ? 0.12 : 0.08
            };
            
            scene.add(wave);
            energyWaves.push(wave);
        }

        function createSOrbital(n, count) {
            const radius = n * 2;
            const segments = isMobile ? 32 : 64;
            const isWhite = document.body.classList.contains('bg-white');
            
            // Para Hidrogênio, criar visualização baseada no nível de excitação
            if (currentAtom === 'H' && currentMode === 'quantum') {
                createHydrogenWaveFunction(hydrogenExcitedLevel);
                return;
            }

            if (orbitalStyle === 'cloud') {
                const particleCount = isMobile ? 2000 : 5000;
                const positions = new Float32Array(particleCount * 3);
                for (let i = 0; i < particleCount; i++) {
                    const r = Math.abs(gaussianRandom(0, radius * 0.8));
                    const phi = Math.random() * Math.PI * 2;
                    const theta = Math.acos(2 * Math.random() - 1);
                    positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
                    positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
                    positions[i * 3 + 2] = r * Math.cos(theta);
                }
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const material = new THREE.PointsMaterial({
                    size: isMobile ? 0.30 : 0.22,
                    color: isWhite ? 0x111111 : 0x6496ff,
                    map: particleTexture,
                    transparent: true,
                    opacity: isWhite ? 0.75 : 0.55,
                    blending: isWhite ? THREE.NormalBlending : THREE.AdditiveBlending,
                    depthWrite: false
                });

                material.onBeforeCompile = function(shader) {
                    shader.uniforms.time = { value: 0 };
                    material.userData.shader = shader;
                    shader.vertexShader = `varying vec3 vPos;\n` + shader.vertexShader;
                    shader.vertexShader = shader.vertexShader.replace(`#include <begin_vertex>`, `#include <begin_vertex>\nvPos = position;`);
                    shader.fragmentShader = `uniform float time;\nvarying vec3 vPos;\n` + shader.fragmentShader;
                    shader.fragmentShader = shader.fragmentShader.replace(
                        `#include <color_fragment>`,
                        `#include <color_fragment>\n` +
                        `float phase = sin(vPos.x * 20.0) + cos(vPos.y * 30.0) + sin(vPos.z * 40.0);\n` +
                        `float twinkle = (sin(time * 15.0 + phase * 10.0) + 1.0) * 0.5;\n` + 
                        `diffuseColor.a *= (0.1 + 0.9 * twinkle);`
                    );
                };
                const cloud = new THREE.Points(geometry, material);
                scene.add(cloud);
                orbitals.push(cloud);
            } else {
                const geometry = new THREE.SphereGeometry(radius, segments, segments);
                const material = new THREE.MeshPhongMaterial({
                    color: isWhite ? 0x2244aa : 0x6496ff,
                    transparent: true,
                    opacity: orbitalStyle === 'transparent' ? 0.15 : 0.3,
                    wireframe: orbitalStyle === 'wireframe',
                    side: THREE.DoubleSide
                });
                const orbital = new THREE.Mesh(geometry, material);
                scene.add(orbital);
                orbitals.push(orbital);
            }

            // Criar elétrons
            if (showElectrons && orbitalStyle !== 'cloud') {
                for (let i = 0; i < count; i++) {
                    createElectron(radius, i, count);
                }
            }
        }



        function createHydrogenWaveFunction(level) {
            const segments = isMobile ? 24 : 32;
            
            if (orbitalStyle === 'cloud') {
                createCloud(level);
                return;
            }


            // Constantes compartilhadas — usadas nos orbitais e nos elétrons
            const P2_LOBE_R   = 4 * 0.50,  P2_ELONG  = 1.90;
            const P3_LOBE_R   = 6 * 0.36,  P3_ELONG  = 1.80;
            const D4_LOBE_R   = 8 * 0.30,  D4_ELONG  = 1.80;
            // lobeCenter = lobeR * elong * 1.45 → afasta completamente o lóbulo do núcleo
            const P2_CENTER   = P2_LOBE_R * P2_ELONG * 1.45;
            const P3_CENTER   = P3_LOBE_R * P3_ELONG * 1.45;
            const D4_CENTER   = D4_LOBE_R * D4_ELONG * 1.45;

            if (level === 1) {
                const isWhite = document.body.classList.contains('bg-white');
                // 1s — esférico, raio = 2
                const geometry = new THREE.SphereGeometry(2, segments, segments);
                const material = new THREE.MeshPhongMaterial({
                    color: isWhite ? 0x2244aa : 0x6496ff, transparent: true,
                    opacity: orbitalStyle === 'transparent' ? 0.15 : 0.3,
                    wireframe: orbitalStyle === 'wireframe', side: THREE.DoubleSide
                });
                const orbital = new THREE.Mesh(geometry, material);
                scene.add(orbital);
                orbitals.push(orbital);
                if (showElectrons) createElectron(2, 0, 1);
            }
            else if (level === 2) {
                // 2p — halter ao longo de Y; lóbulos afastados do núcleo Y=0
                createPShapedOrbital(4, 0x64c8ff);
                if (showElectrons) createElectronInLobe('py', P2_CENTER, P2_LOBE_R);
            }
            else if (level === 3) {
                // 3p — dois halteres em X e Z; lóbulos afastados do núcleo
                createDoublePOrbital(6, 0x64ffc8);
                if (showElectrons) {
                    createElectronInLobe('px', P3_CENTER, P3_LOBE_R);
                    createElectronInLobe('pz', P3_CENTER, P3_LOBE_R);
                }
            }
            else if (level === 4) {
                // 3d — trevo no plano XZ; lóbulos afastados do núcleo
                createCloverleafOrbital(8, 0xff9664);
                if (showElectrons) {
                    createElectronInLobe('px', D4_CENTER, D4_LOBE_R);
                    createElectronInLobe('pz', D4_CENTER, D4_LOBE_R);
                }
            }
        }

        // Cria elétron confinado dentro de um lóbulo específico
        // axis: 'px'|'py'|'pz' — eixo principal do lóbulo
        // lobeDist: distância do centro ao centro do lóbulo
        // lobeRadius: raio do lóbulo (confinamento)
        function createElectronInLobe(axis, lobeDist, lobeRadius) {
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5,
                transparent: true, opacity: 1
            });
            const electron = new THREE.Mesh(geometry, material);

            // Escolher um dos dois lóbulos (+ ou -) para orbitais com dois lóbulos
            // Para orbitais d com 4 lóbulos, o elétron vai a um lóbulo positivo
            const side = Math.random() > 0.5 ? 1 : -1;

            // Deslocamento lateral (perpendicular ao eixo do lóbulo)
            const lat = () => (Math.random() - 0.5) * lobeRadius * 0.65;
            // Deslocamento axial: SEMPRE no mesmo lado do núcleo que o lóbulo
            // (nunca atravessa o plano nodal)
            const axialSpread = lobeRadius * 0.5;
            const axialOffset = (Math.random() - 0.5) * axialSpread;

            if (axis === 'px') {
                electron.position.set(side * lobeDist + axialOffset, lat(), lat());
            } else if (axis === 'py') {
                electron.position.set(lat(), side * lobeDist + axialOffset, lat());
            } else { // pz
                electron.position.set(lat(), lat(), side * lobeDist + axialOffset);
            }

            electron.userData = {
                type: 'lobe',
                axis,
                lobeDist,
                lobeRadius,
                side,
                angle: Math.random() * Math.PI * 2,
                speed: 0.018 + Math.random() * 0.008,
                visible: true,
                visibilityTimer: Math.random() * 100,
                visibilityDuration: 40 + Math.random() * 40,
                invisibilityDuration: 10 + Math.random() * 20
            };

            scene.add(electron);
            electrons.push(electron);
        }

        // ─────────────────────────────────────────────────────────────
        // CORREÇÃO FÍSICA: lóbulos de orbitais p e d nunca atravessam
        // o núcleo. A fórmula lobeCenter = lobeR × elong × 0.92 garante
        // que a base de cada lóbulo começa ligeiramente além do plano nodal.
        // ─────────────────────────────────────────────────────────────

        function createPShapedOrbital(radius, color) {
            // Orbital 2p — dumbbell ao longo do eixo Y
            // Lóbulos nitidamente separados sem tocar na superfície do núcleo
            const group = new THREE.Group();
            const lobeR    = radius * 0.50;   // raio da esfera base
            const elongY   = 1.90;            // alongamento no eixo Y
            const lobeCenter = lobeR * elongY * 1.10;

            const material = new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: orbitalStyle === 'transparent' ? 0.18 : 0.35,
                wireframe: orbitalStyle === 'wireframe',
                side: THREE.DoubleSide
            });

            [1, -1].forEach(sign => {
                const geo = new THREE.SphereGeometry(lobeR, 28, 28);
                geo.scale(1, elongY, 1);
                const lobe = new THREE.Mesh(geo, material.clone());
                lobe.position.y = sign * lobeCenter;
                group.add(lobe);
            });

            scene.add(group);
            orbitals.push(group);
        }

        function createDoublePOrbital(radius, color) {
            // Orbital 3p — dois pares de lóbulos (0° e 90° no plano XZ)
            const group = new THREE.Group();
            const lobeR    = radius * 0.36;
            const elongXZ  = 1.80;
            const lobeCenter = lobeR * elongXZ * 1.10;

            const material = new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: orbitalStyle === 'transparent' ? 0.15 : 0.30,
                wireframe: orbitalStyle === 'wireframe',
                side: THREE.DoubleSide
            });

            [0, Math.PI / 2].forEach(angle => {
                [1, -1].forEach(sign => {
                    const geo = new THREE.SphereGeometry(lobeR, 24, 24);
                    geo.scale(elongXZ, 1, 1);
                    const lobe = new THREE.Mesh(geo, material.clone());
                    lobe.position.set(
                        sign * lobeCenter * Math.cos(angle),
                        0,
                        sign * lobeCenter * Math.sin(angle)
                    );
                    lobe.rotation.y = angle;
                    group.add(lobe);
                });
            });

            scene.add(group);
            orbitals.push(group);
        }

        function createCloverleafOrbital(radius, color) {
            // Orbital 3d — trevo de 4 lóbulos no plano XZ
            const group = new THREE.Group();
            const lobeR    = radius * 0.30;
            const elongXZ  = 1.80;
            const lobeCenter = lobeR * elongXZ * 1.10;

            const material = new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: orbitalStyle === 'transparent' ? 0.18 : 0.35,
                wireframe: orbitalStyle === 'wireframe',
                side: THREE.DoubleSide
            });

            [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].forEach(angle => {
                const geo = new THREE.SphereGeometry(lobeR, 24, 24);
                geo.scale(elongXZ, 1, 1);
                const lobe = new THREE.Mesh(geo, material.clone());
                lobe.position.set(
                    lobeCenter * Math.cos(angle),
                    0,
                    lobeCenter * Math.sin(angle)
                );
                lobe.rotation.y = angle;
                group.add(lobe);
            });

            scene.add(group);
            orbitals.push(group);
        }

        function createPOrbital(n, count) {
            const scale = n * 1.5;
            const segments = isMobile ? 24 : 32;
            
            // Criar 3 orientações (px, py, pz)
            const orientations = [
                { axis: 'x', color: 0x64ffc8, rotation: [0, 0, Math.PI / 2] },
                { axis: 'y', color: 0x64c8ff, rotation: [0, 0, 0] },
                { axis: 'z', color: 0xc864ff, rotation: [Math.PI / 2, 0, 0] }
            ];

            orientations.forEach((orient, idx) => {
                if (orbitalStyle === 'cloud') {
                    // Nuvem p correta: |ψ_{2p}|² ∝ r² · exp(-r/a₀) · cos²θ
                    // Zero no núcleo (r=0) e no plano nodal perpendicular ao eixo
                    const particleCount = isMobile ? 1200 : 3000;
                    const positions     = new Float32Array(particleCount * 3);
                    const a0 = scale * 0.9;            // escala radial em unidades Three.js
                    const box = a0 * 3.5;              // caixa de amostragem

                    // Densidade analítica do 2p: ∝ r² · exp(-r/a₀) · cos²θ_eixo
                    // rMax de densidade = 2a₀, normalizado a 1
                    const r0max = 2 * a0;
                    const dNorm = r0max * r0max * Math.exp(-2); // ≈ max teórico

                    let filled = 0;
                    const maxIter = particleCount * 300;
                    for (let iter = 0; iter < maxIter && filled < particleCount; iter++) {
                        const x = (Math.random() * 2 - 1) * box;
                        const y = (Math.random() * 2 - 1) * box;
                        const z = (Math.random() * 2 - 1) * box;
                        const r = Math.sqrt(x*x + y*y + z*z);
                        if (r < 0.001) continue;

                        // cosθ em relação ao eixo do orbital
                        let cosT;
                        if      (orient.axis === 'y') cosT = y / r;
                        else if (orient.axis === 'x') cosT = x / r;
                        else                          cosT = z / r;

                        const rn   = r / a0;
                        const dens = rn * rn * Math.exp(-rn) * cosT * cosT;

                        if (Math.random() < dens / (4 * Math.exp(-2))) {
                            positions[filled * 3]     = x;
                            positions[filled * 3 + 1] = y;
                            positions[filled * 3 + 2] = z;
                            filled++;
                        }
                    }
                    // Preenchimento de segurança
                    while (filled < particleCount) {
                        const angle  = Math.random() * Math.PI * 2;
                        const r      = a0 * (1 + Math.random());
                        const sign   = Math.random() > 0.5 ? 1 : -1;
                        positions[filled * 3]     = orient.axis === 'x' ? sign * r : Math.cos(angle) * r * 0.3;
                        positions[filled * 3 + 1] = orient.axis === 'y' ? sign * r : Math.sin(angle) * r * 0.3;
                        positions[filled * 3 + 2] = orient.axis === 'z' ? sign * r : Math.cos(angle) * r * 0.3;
                        filled++;
                    }

                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    const basePos = new Float32Array(positions);
                    geometry.setAttribute('basePosition', new THREE.BufferAttribute(basePos, 3));

                    const material = new THREE.PointsMaterial({
                        size: isMobile ? 0.28 : 0.20,
                        color: orient.color,
                        map: particleTexture,
                        transparent: true,
                        opacity: 0.55,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    });

                    material.onBeforeCompile = function(shader) {
                        shader.uniforms.time = { value: 0 };
                        material.userData.shader = shader;
                        shader.vertexShader = `varying vec3 vPos;\n` + shader.vertexShader;
                        shader.vertexShader = shader.vertexShader.replace(`#include <begin_vertex>`, `#include <begin_vertex>\nvPos = position;`);
                        shader.fragmentShader = `uniform float time;\nvarying vec3 vPos;\n` + shader.fragmentShader;
                        shader.fragmentShader = shader.fragmentShader.replace(
                            `#include <color_fragment>`,
                            `#include <color_fragment>\n` +
                            `float phase = sin(vPos.x * 20.0) + cos(vPos.y * 30.0) + sin(vPos.z * 40.0);\n` +
                            `float twinkle = (sin(time * 15.0 + phase * 10.0) + 1.0) * 0.5;\n` + 
                            `diffuseColor.a *= (0.1 + 0.9 * twinkle);`
                        );
                    };
                    const cloud = new THREE.Points(geometry, material);
                    scene.add(cloud);
                    orbitals.push(cloud);
                } else {
                    // Halter físico — lóbulos completamente afastados do núcleo
                    const group = new THREE.Group();
                    const lobeR  = scale * 0.50;
                    const elongY = 1.90;
                    const lobeCenter = lobeR * elongY * 1.45;

                    for (let side of [-1, 1]) {
                        const lobeGeometry = new THREE.SphereGeometry(lobeR, segments, segments);
                        lobeGeometry.scale(1, elongY, 1);

                        const material = new THREE.MeshPhongMaterial({
                            color: orient.color,
                            transparent: true,
                            opacity: orbitalStyle === 'transparent' ? 0.18 : 0.35,
                            wireframe: orbitalStyle === 'wireframe',
                            side: THREE.DoubleSide
                        });

                        const lobe = new THREE.Mesh(lobeGeometry, material);
                        lobe.position.y = side * lobeCenter;
                        group.add(lobe);
                    }

                    group.rotation.set(...orient.rotation);
                    scene.add(group);
                    orbitals.push(group);
                }
            });

            // Elétrons distribuídos nos orbitais p
            if (showElectrons && orbitalStyle !== 'cloud') {
                const radius = scale * 1.8;
                for (let i = 0; i < count; i++) {
                    const orientIdx = i % 3;
                    createElectronP(radius, orientIdx);
                }
            }
        }

        function createElectron(radius, index, total) {
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 1
            });
            const electron = new THREE.Mesh(geometry, material);
            
            // Posição inicial aleatória na superfície da esfera
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            electron.position.x = radius * Math.sin(phi) * Math.cos(theta);
            electron.position.y = radius * Math.sin(phi) * Math.sin(theta);
            electron.position.z = radius * Math.cos(phi);
            
            electron.userData = { 
                radius, 
                theta, 
                phi, 
                speed: 0.01 + Math.random() * 0.01,
                visible: true,
                visibilityTimer: Math.random() * 100,
                visibilityDuration: 40 + Math.random() * 40,
                invisibilityDuration: 10 + Math.random() * 20
            };
            
            scene.add(electron);
            electrons.push(electron);
        }

        function createElectronP(radius, orientation) {
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 1
            });
            const electron = new THREE.Mesh(geometry, material);
            
            // Posicionar em órbitas tipo halter
            const angle = Math.random() * Math.PI * 2;
            const side = Math.random() > 0.5 ? 1 : -1;
            
            if (orientation === 0) { // px
                electron.position.x = side * radius * 0.7;
                electron.position.y = Math.cos(angle) * radius * 0.25;
                electron.position.z = Math.sin(angle) * radius * 0.25;
            } else if (orientation === 1) { // py
                electron.position.y = side * radius * 0.7;
                electron.position.x = Math.cos(angle) * radius * 0.25;
                electron.position.z = Math.sin(angle) * radius * 0.25;
            } else { // pz
                electron.position.z = side * radius * 0.7;
                electron.position.x = Math.cos(angle) * radius * 0.25;
                electron.position.y = Math.sin(angle) * radius * 0.25;
            }
            
            electron.userData = { 
                orientation, 
                angle, 
                radius, 
                speed: 0.02,
                visible: true,
                visibilityTimer: Math.random() * 100,
                visibilityDuration: 40 + Math.random() * 40,
                invisibilityDuration: 10 + Math.random() * 20
            };
            
            scene.add(electron);
            electrons.push(electron);
        }

        function disposeObject(obj) {
            if (!obj) return;
            if (obj.children && obj.children.length > 0) {
                // Clone array because children may be modified during iteration
                [...obj.children].forEach(child => disposeObject(child));
            }
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }

        function clearAtom() {
            // Remover orbitais (incluindo Groups com filhos)
            orbitals.forEach(orbital => {
                disposeObject(orbital);
                scene.remove(orbital);
            });
            orbitals = [];

            // Remover elétrons
            electrons.forEach(electron => {
                disposeObject(electron);
                scene.remove(electron);
            });
            electrons = [];

            // Remover núcleo
            if (nucleus) {
                disposeObject(nucleus);
                scene.remove(nucleus);
                nucleus = null;
            }

            // Remover fótons
            photons.forEach(photon => {
                disposeObject(photon);
                scene.remove(photon);
            });
            photons = [];

            // Remover ondas de energia
            energyWaves.forEach(wave => {
                disposeObject(wave);
                scene.remove(wave);
            });
            energyWaves = [];
        }

        function createAtom(atomSymbol) {
            clearAtom();
            
            const atom = atomicData[atomSymbol];
            if (!atom) return;

            // Criar núcleo
            createNucleus();

            // Criar orbitais
            atom.orbitals.forEach(orb => {
                if (orb.type === 's') {
                    createSOrbital(orb.n, orb.count);
                } else if (orb.type === 'p') {
                    createPOrbital(orb.n, orb.count);
                }
            });

            // Atualizar UI
            updateAtomInfo(atom);
        }

        function updateAtomInfo(atom) {
            document.getElementById('atomName').textContent = atom.name + ' (' + currentAtom + ')';
            document.getElementById('protons').textContent = atom.protons;
            document.getElementById('electrons').textContent = atom.electrons;
            document.getElementById('config').textContent = atom.config;
            
            // Atualizar display de energia
            updateEnergyDisplay(atom);
            
            // Atualizar dica quântica
            const quantumInfo = document.getElementById('quantum-info');
            if (quantumInfo) {
                if (currentMode === 'quantum') {
                    quantumInfo.innerHTML = '<br><strong>⚛️ Efeito Quântico Ativo:</strong> Os elétrons desaparecem e reaparecem em posições diferentes, simulando o comportamento probabilístico da mecânica quântica (tunelamento quântico e dualidade onda-partícula).';
                } else {
                    quantumInfo.innerHTML = '';
                }
            }
        }

        function updateEnergyDisplay(atom) {
            // Energias do último orbital ocupado (valência)
            const shellEnergies = {
                H:  { key: '1s', shell: 'K', n: 1, energy: -13.6 }
            };
            const info = shellEnergies[currentAtom] || { key: '1s', shell: 'K', n: 1, energy: -13.6 };

            if (currentMode === 'quantum') {
                const displayValue = document.getElementById('energyDisplayValue');
                const levelInfo = document.getElementById('energyLevelInfo');
                
                if (displayValue) displayValue.textContent = info.energy.toFixed(1);
                if (levelInfo) levelInfo.textContent = `Nível: ${info.key} (n=${info.n})`;
            } else if (currentMode === 'bohr') {
                const displayValue = document.getElementById('energyDisplayValueBohr');
                const levelInfo = document.getElementById('energyLevelInfoBohr');
                
                if (displayValue) displayValue.textContent = info.energy.toFixed(1);
                if (levelInfo) levelInfo.textContent = `Camada ${info.shell} (n=${info.n})`;
            }
        }

        function animate() {
            requestAnimationFrame(animate);

            // Rotação automática suave via Quaternion (funciona em qualquer ângulo)
            if (isRotating && !isDragging && scene) {
                const autoRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.003);
                scene.quaternion.multiplyQuaternions(autoRot, scene.quaternion);
            }

            // Atualizar tempo nos shaders da nuvem para efeito de piscar (twinkle)
            orbitals.forEach(orb => {
                if (orb.isPoints && orb.material && orb.material.userData && orb.material.userData.shader) {
                    orb.material.userData.shader.uniforms.time.value = performance.now() * 0.001;
                }
            });

            // Animar elétrons
            electrons.forEach(electron => {
                const data = electron.userData;
                
                // Efeito de tunelamento quântico para TODOS os átomos no modo quântico
                if (currentMode === 'quantum') {
                    data.visibilityTimer++;
                    
                    if (data.visible) {
                        // Elétron visível
                        if (data.visibilityTimer >= data.visibilityDuration) {
                            // Começar a desaparecer
                            data.visible = false;
                            data.visibilityTimer = 0;
                            
                            // Efeito de fade out
                            let fadeSteps = 0;
                            const fadeInterval = setInterval(() => {
                                fadeSteps++;
                                electron.material.opacity = 1 - (fadeSteps / 10);
                                if (fadeSteps >= 10) {
                                    clearInterval(fadeInterval);
                                    electron.material.opacity = 0;
                                    electron.visible = false;
                                }
                            }, 20);
                        }
                    } else {
                        // Elétron invisível
                        if (data.visibilityTimer >= data.invisibilityDuration) {
                            // Começar a aparecer
                            data.visible = true;
                            data.visibilityTimer = 0;
                            data.visibilityDuration = 40 + Math.random() * 40;
                            data.invisibilityDuration = 10 + Math.random() * 20;
                            
                            // Reposicionar em local aleatório (tunelamento)
                            if (data.theta !== undefined) {
                                // Orbital s
                                data.theta = Math.random() * Math.PI * 2;
                                data.phi = Math.acos(2 * Math.random() - 1);
                            } else if (data.type === 'lobe') {
                                // Orbital lobe — pode tunelar para o outro lóbulo
                                data.side = Math.random() > 0.5 ? 1 : -1;
                                data.angle = Math.random() * Math.PI * 2;
                            } else if (data.orientation !== undefined) {
                                // Orbital p legado
                                data.angle = Math.random() * Math.PI * 2;
                            }
                            
                            electron.visible = true;
                            
                            // Efeito de fade in
                            let fadeSteps = 0;
                            const fadeInterval = setInterval(() => {
                                fadeSteps++;
                                electron.material.opacity = fadeSteps / 10;
                                if (fadeSteps >= 10) {
                                    clearInterval(fadeInterval);
                                    electron.material.opacity = 1;
                                }
                            }, 20);
                        }
                    }
                }
                
                // Movimento contínuo (mesmo quando invisível, para manter a física)
                if (data.theta !== undefined) {
                    // Orbital s — movimento na superfície esférica (levemente para dentro)
                    data.theta += data.speed;
                    data.phi += data.speed * 0.5;
                    const r = data.radius * 0.9; 
                    electron.position.x = r * Math.sin(data.phi) * Math.cos(data.theta);
                    electron.position.y = r * Math.sin(data.phi) * Math.sin(data.theta);
                    electron.position.z = r * Math.cos(data.phi);
                } else if (data.type === 'lobe') {
                    // Orbital lobe (p ou d) — movimento volumétrico dentro do lóbulo
                    // Garante que o elétron NUNCA cruza o plano nodal (núcleo)
                    data.angle += data.speed;
                    const r  = data.lobeRadius * 0.40;   // confinamento lateral
                    const c1 = Math.cos(data.angle) * r;
                    const s1 = Math.sin(data.angle) * r;
                    const c2 = Math.cos(data.angle * 1.3) * r * 0.5;

                    // Componente axial: always same sign as `side` — nunca cruza o núcleo
                    const axialRaw = data.side * data.lobeDist + c1 * 0.65;
                    const axialSafe = data.side * Math.max(data.lobeRadius * 0.15, Math.abs(axialRaw));

                    if (data.axis === 'px') {
                        electron.position.set(axialSafe, s1, c2);
                    } else if (data.axis === 'py') {
                        electron.position.set(s1, axialSafe, c2);
                    } else { // pz
                        electron.position.set(s1, c2, axialSafe);
                    }
                } else if (data.orientation !== undefined) {
                    // Orbital p legado — centralizado
                    data.angle += data.speed;
                    const side = Math.sin(data.angle * 2) > 0 ? 1 : -1;
                    const r = data.radius;
                    if (data.orientation === 0) {
                        electron.position.x = side * r * 0.7;
                        electron.position.y = Math.cos(data.angle) * r * 0.25;
                        electron.position.z = Math.sin(data.angle) * r * 0.25;
                    } else if (data.orientation === 1) {
                        electron.position.y = side * r * 0.7;
                        electron.position.x = Math.cos(data.angle) * r * 0.25;
                        electron.position.z = Math.sin(data.angle) * r * 0.25;
                    } else {
                        electron.position.z = side * r * 0.7;
                        electron.position.x = Math.cos(data.angle) * r * 0.25;
                        electron.position.y = Math.sin(data.angle) * r * 0.25;
                    }
                }
            });

            // Mantém núcleo estático (sem pulsar escala)
            if (nucleus) {
                const time = Date.now() * 0.002;
                
                // Apenas oscila levemente a opacidade do brilho sem alterar escala física
                if (nucleusGlow) {
                    nucleusGlow.material.opacity = 0.1 + Math.sin(time * 2) * 0.1;
                }
                
                // Emissão periódica de energia (menos frequente em mobile)
                if (showEnergyWaves && Math.random() < (isMobile ? 0.005 : 0.01)) {
                    createEnergyWave();
                }
            }

            // Animar fótons
            for (let i = photons.length - 1; i >= 0; i--) {
                const photon = photons[i];
                const data = photon.userData;
                
                photon.position.add(data.direction.clone().multiplyScalar(data.speed));
                data.life--;
                
                // Fade out via escala + opacidade do glow
                const ratio = data.life / data.maxLife;
                photon.scale.setScalar(0.5 + ratio * 0.5);
                if (photon.children[0]) {
                    photon.children[0].material.opacity = ratio * 0.7;
                }
                
                // Remover quando expirar
                if (data.life <= 0) {
                    disposeObject(photon);
                    scene.remove(photon);
                    photons.splice(i, 1);
                }
            }

            // Animar ondas de energia
            for (let i = energyWaves.length - 1; i >= 0; i--) {
                const wave = energyWaves[i];
                const data = wave.userData;
                
                data.scale += data.speed;
                wave.scale.set(data.scale, data.scale, data.scale);
                
                // Fade out
                wave.material.opacity = 0.6 * (1 - data.scale / data.maxScale);
                
                // Remover quando atingir tamanho máximo
                if (data.scale >= data.maxScale) {
                    wave.geometry.dispose();
                    wave.material.dispose();
                    scene.remove(wave);
                    energyWaves.splice(i, 1);
                }
            }

            // Animar nuvem eletrônica (pulsar e formigamento com ondas harmônicas)
            if (orbitalStyle === 'cloud') {
                const time = Date.now() * 0.0015;
                const isWhite = document.body.classList.contains('bg-white');
                orbitals.forEach(orb => {
                    const points = (orb instanceof THREE.Points) ? [orb] : (orb instanceof THREE.Group ? orb.children.filter(c => c instanceof THREE.Points) : []);
                    
                    points.forEach(p => {
                        // Pulsação suave de opacidade e tamanho (tamanho maior para partículas soft)
                        p.material.opacity = isWhite ? 0.75 + Math.sin(time) * 0.1 : 0.45 + Math.sin(time) * 0.15;
                        p.material.size = (isMobile ? 0.35 : 0.25) * (1 + Math.sin(time * 1.2) * 0.12);
                        
                        // Efeito de Formigamento (Jitter) e Ondulação Harmônica (Quantum Wave)
                        const attr = p.geometry.attributes.position;
                        const baseAttr = p.geometry.attributes.basePosition;
                        if (attr && baseAttr) {
                            const arr = attr.array;
                            const baseArr = baseAttr.array;
                            // Otimização: processar saltando pontos em mobile
                            const step = isMobile ? 12 : 6;
                            for (let i = 0; i < arr.length; i += step) {
                                const x = baseArr[i];
                                const y = baseArr[i+1];
                                const z = baseArr[i+2];
                                
                                // Distância radial até o núcleo (0, 0, 0)
                                const d = Math.sqrt(x*x + y*y + z*z);
                                
                                // Ondulação Harmônica Radial Quântica (propagando do centro)
                                const waveSpeed = time * 3.5;
                                const wave = Math.sin(waveSpeed - d * 0.8) * 0.08;
                                
                                // Jitter aleatório convencional
                                const jitter = (Math.random() - 0.5) * 0.06;
                                
                                // Direção radial unitária
                                const nx = x / (d + 0.0001);
                                const ny = y / (d + 0.0001);
                                const nz = z / (d + 0.0001);
                                
                                // Aplicar propagação da onda radial + tremor
                                arr[i] = x + nx * wave + jitter;
                                arr[i+1] = y + ny * wave + jitter;
                                arr[i+2] = z + nz * wave + jitter;
                            }
                            attr.needsUpdate = true;
                        }
                    });
                });
            }

            renderer.render(scene, camera);
        }

        function onWindowResize() {
            const container = document.getElementById('canvas-container');
            if (!container || !renderer || !camera) return;
            
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            if (width === 0 || height === 0) return; // Evitar divisão por zero
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(pixelRatio);
            
            // Reposicionar canvas
            if (renderer.domElement) {
                renderer.domElement.style.position = 'absolute';
                renderer.domElement.style.top = '0';
                renderer.domElement.style.left = '0';
            }
        }

        function handleStartupParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            if (mode === 'spectrum') {
                const btn = document.querySelector('.mode-btn[data-mode="spectrum"]');
                if(btn) changeMode('spectrum', btn);
            } else if (mode === 'bohr') {
                const btn = document.querySelector('.mode-btn[data-mode="bohr"]');
                if(btn) changeMode('bohr', btn);
            } else if (mode === 'quantum') {
                const btn = document.querySelector('.mode-btn[data-mode="quantum"]');
                if(btn) changeMode('quantum', btn);
                const view = urlParams.get('view');
                if (view) {
                    setTimeout(() => {
                        if (typeof changeOrbitalStyle === 'function') changeOrbitalStyle(view);
                    }, 100);
                }
            }
        }

        // Inicializar quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                init();
                handleStartupParams();
            });
        } else {
            init();
            handleStartupParams();
        }