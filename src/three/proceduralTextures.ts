import * as THREE from 'three';
import { FlavorId, FlavorSpec } from '../data/blendyData';

export function createBottleLabelTexture(
  flavour: FlavorSpec,
  maxAnisotropy: number
): THREE.CanvasTexture {
  // 4:1 ratio matches cylinder circumference (2π * 0.482 ≈ 3.03) / height (0.76) ≈ 4.0
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm matte cotton paper background
  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(0, 0, 2048, 512);

  // Subtle paper fiber grain
  for (let i = 0; i < 650; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(30,27,24,0.02)' : 'rgba(255,255,255,0.4)';
    ctx.fillRect(Math.random() * 2048, Math.random() * 512, 6, 2);
  }

  // Deep rich flavour footer band
  ctx.fillStyle = flavour.ink;
  ctx.fillRect(0, 324, 2048, 188);

  // Pastel accent ribbon above footer
  ctx.fillStyle = flavour.bg;
  ctx.fillRect(0, 306, 2048, 18);

  const cx = 1024;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Brand Wordmark (true proportions)
  ctx.fillStyle = '#1E1B18';
  ctx.font = '800 132px "Baloo 2", "Poppins", sans-serif';
  ctx.fillText('Blendy', cx, 136);

  // Flavor Pill Badge
  ctx.fillStyle = flavour.bg;
  const pillW = 420;
  const pillH = 54;
  ctx.beginPath();
  ctx.roundRect(cx - pillW / 2, 212, pillW, pillH, 27);
  ctx.fill();

  ctx.fillStyle = flavour.ink;
  ctx.font = '700 26px "Poppins", sans-serif';
  ctx.fillText(flavour.fullName.toUpperCase(), cx, 240);

  // Footer High-Contrast Copy
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px "Poppins", sans-serif';
  ctx.fillText('100% REAL FRUIT   ·   0g ADDED SUGAR', cx, 392);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.font = '500 22px "Poppins", sans-serif';
  ctx.fillText('COLD-PRESSED DAILY   ·   330 ML GLASS', cx, 446);

  // Back/side specs (left & right wings)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#4A433D';
  ctx.font = '600 22px "Poppins", sans-serif';
  ctx.fillText('VEGAN & PLANT-BASED', 96, 128);
  ctx.fillText('GLUTEN-FREE & RAW', 96, 166);
  ctx.fillText('ZERO CONCENTRATES', 96, 204);

  ctx.textAlign = 'right';
  ctx.fillText(`ENERGY: ${flavour.nutrition.calories} KCAL`, 1952, 128);
  ctx.fillText(`VITAMIN C: ${flavour.nutrition.vitaminC}`, 1952, 166);
  ctx.fillText('ADDED SUGAR: 0G', 1952, 204);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createFruitSliceTexture(
  flavorId: FlavorId,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  if (flavorId === 'kiwi') {
    const grad = ctx.createRadialGradient(cx, cy, 16, cx, cy, 248);
    grad.addColorStop(0, '#F1F9D2');
    grad.addColorStop(0.24, '#C5E67A');
    grad.addColorStop(0.82, '#6BA932');
    grad.addColorStop(0.94, '#508520');
    grad.addColorStop(1, '#6C4B2B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 228, 0.42)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 32, cy + Math.sin(a) * 32);
      ctx.lineTo(cx + Math.cos(a) * 195, cy + Math.sin(a) * 195);
      ctx.stroke();
    }

    ctx.fillStyle = '#14130F';
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r = 86 + (i % 2) * 18;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r,
        6.5,
        3.5,
        a,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  } else if (flavorId === 'banana') {
    const grad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 250);
    grad.addColorStop(0, '#FFFDF2');
    grad.addColorStop(0.68, '#FAE59E');
    grad.addColorStop(0.91, '#EFC95C');
    grad.addColorStop(1, '#CE9F2E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(165, 130, 55, 0.32)';
    ctx.lineWidth = 7;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 100, cy + Math.sin(a) * 100);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(120, 82, 32, 0.5)';
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const r = 40 + (i % 3) * 20;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (flavorId === 'strawberry') {
    // Seeded strawberry skin texture
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#E82C48');
    grad.addColorStop(0.6, '#CE1B37');
    grad.addColorStop(1, '#9E0E26');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 16; col++) {
        const sx = (col + (row % 2) * 0.5) * 32;
        const sy = 24 + row * 40;
        ctx.fillStyle = 'rgba(80, 5, 15, 0.35)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F7D274';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3.8, 6.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 250);
    grad.addColorStop(0, '#A57FE0');
    grad.addColorStop(1, '#582B8D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createTravertineTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E8DFD0';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 460; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = 10 + Math.random() * 50;
    const h = 1.5 + Math.random() * 4;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(165, 148, 124, 0.28)' : 'rgba(255, 250, 240, 0.42)';
    ctx.fillRect(x, y, w, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
  grad.addColorStop(0, 'rgba(32, 18, 46, 0.56)');
  grad.addColorStop(0.55, 'rgba(32, 18, 46, 0.22)');
  grad.addColorStop(1, 'rgba(32, 18, 46, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
