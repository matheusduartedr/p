/**
 * QUANTUM HUB — Shared Utilities & Physics Constants
 */

window.QuantumUtils = (function () {
  'use strict';

  const hc_eVnm = 1239.84193; // Constante hc em eV·nm
  const c_light = 299792.458; // km/s

  function fact(n) {
    if (n <= 1) return 1;
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  }

  function laguerreAssoc(n, alpha, x) {
    if (n === 0) return 1;
    if (n === 1) return 1 + alpha - x;
    let L0 = 1, L1 = 1 + alpha - x, Lk = 0;
    for (let k = 2; k <= n; k++) {
      Lk = ((2 * k - 1 + alpha - x) * L1 - (k - 1 + alpha) * L0) / k;
      L0 = L1; L1 = Lk;
    }
    return Lk;
  }

  function legendreAssoc(l, m, x) {
    let pmm = 1;
    if (m > 0) {
      let somx2 = Math.sqrt((1 - x) * (1 + x));
      let fact_val = 1;
      for (let i = 1; i <= m; i++) {
        pmm *= (-1) * fact_val * somx2; fact_val += 2;
      }
    }
    if (l === m) return pmm;
    let pmmp1 = x * (2 * m + 1) * pmm;
    if (l === m + 1) return pmmp1;
    let pll = 0;
    for (let ll = m + 2; ll <= l; ll++) {
      pll = ((2 * ll - 1) * x * pmmp1 - (ll + m - 1) * pmm) / (ll - m);
      pmm = pmmp1; pmmp1 = pll;
    }
    return pll;
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

  function createParticleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  function gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
  }

  return {
    hc_eVnm,
    c_light,
    fact,
    laguerreAssoc,
    legendreAssoc,
    wavelengthToColor,
    createParticleTexture,
    gaussianRandom
  };
})();
