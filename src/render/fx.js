import { sound } from '../audio/soundFX.js';

export class VFXSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.possessionSequence = null;
  }

  // Inicia la secuencia mágica de posesión estilo The Minish Cap
  startPossession(targetX, targetY, onImpact, onComplete) {
    sound.playPossess();

    this.possessionSequence = {
      x: targetX,
      y: targetY,
      timer: 0,
      duration: 55, // ~0.9 segundos a 60fps
      impactDone: false,
      onImpact,
      onComplete
    };
  }

  // Genera anillo de choque de energía en el suelo
  addShockwave(x, y, maxRadius = 32, color = '#facc15') {
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius,
      alpha: 1.0,
      color
    });
  }

  // Nube de polvo al pisar fuerte o aterrizar
  addDust(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 0.8 + 0.3;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + 8,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.2,
        life: 1.0,
        decay: 0.05 + Math.random() * 0.04,
        size: 2.5,
        color: 'rgba(210, 190, 160, 0.7)'
      });
    }
  }

  // Virutas de madera y chispas al martillar y construir
  addWoodChips(x, y, count = 4) {
    const chipColors = ['#ca8a04', '#d97706', '#92400e', '#fef08a'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.0;
      const spd = Math.random() * 1.5 + 0.8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.5,
        life: 1.0,
        decay: 0.08 + Math.random() * 0.05,
        size: Math.random() < 0.5 ? 2 : 1.5,
        color: chipColors[Math.floor(Math.random() * chipColors.length)]
      });
    }
  }

  // Chispas de halo divino flotantes
  addHolySpark(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.4 - Math.random() * 0.4,
      life: 1.0,
      decay: 0.04,
      size: 1.5,
      color: '#ffd700'
    });
  }

  // 🌊 Salpicadura de gotas de agua al pisar, nadar o zambullirse
  addWaterSplash(x, y, count = 5) {
    const splashColors = ['#bae6fd', '#7dd3fc', '#38bdf8', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.8;
      const spd = Math.random() * 1.4 + 0.6;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + 10 + (Math.random() - 0.5) * 3,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        decay: 0.08 + Math.random() * 0.05,
        size: Math.random() < 0.5 ? 2 : 1.5,
        color: splashColors[Math.floor(Math.random() * splashColors.length)]
      });
    }
  }

  // 🌊 Onda concéntrica de agua (estela / ripple al flotar o nadar)
  addWaterRipple(x, y, maxRadius = 14) {
    this.shockwaves.push({
      x,
      y,
      radius: 2,
      maxRadius,
      alpha: 0.75,
      color: '#e0f2fe',
      lineWidth: 1.2
    });
  }

  // 🔥 Chispas de fuego o humo al tocar lava o quemarse
  addFireEmber(x, y, count = 4) {
    const emberColors = ['#ff4500', '#ff8c00', '#ffd700'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.2 - 0.4,
        life: 1.0,
        decay: 0.06 + Math.random() * 0.04,
        size: 2,
        color: emberColors[Math.floor(Math.random() * emberColors.length)]
      });
    }
  }

  update(camera) {
    // 1. Manejo de la secuencia cinemática de posesión
    if (this.possessionSequence) {
      const seq = this.possessionSequence;
      seq.timer++;

      const progress = seq.timer / seq.duration;

      // Generar vórtice de partículas en espiral descendente hacia el objetivo
      const angle = seq.timer * 0.35;
      const radius = Math.max(2, (1 - progress) * 60);
      const px = seq.x + Math.cos(angle) * radius;
      const py = seq.y + Math.sin(angle) * radius - (1 - progress) * 80;

      this.particles.push({
        x: px,
        y: py,
        vx: (seq.x - px) * 0.08,
        vy: (seq.y - py) * 0.08,
        life: 0.9,
        decay: 0.04,
        size: 3,
        color: '#fef08a'
      });

      // En el momento del impacto
      if (seq.timer >= 40 && !seq.impactDone) {
        seq.impactDone = true;
        sound.playMinishLand();
        this.addShockwave(seq.x, seq.y, 42, '#ffd700');
        this.addDust(seq.x, seq.y, 10);
        if (camera) camera.triggerShake(5, 12);
        if (seq.onImpact) seq.onImpact();
      }

      if (seq.timer >= seq.duration) {
        if (seq.onComplete) seq.onComplete();
        this.possessionSequence = null;
      }
    }

    // 2. Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Actualizar ondas de choque
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 0.5;
      sw.alpha -= 0.04;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Rayo de luz celestial durante la posesión
    if (this.possessionSequence) {
      const seq = this.possessionSequence;
      const progress = seq.timer / seq.duration;
      const alpha = Math.sin(progress * Math.PI) * 0.45;

      const grad = ctx.createLinearGradient(seq.x, seq.y - 120, seq.x, seq.y + 10);
      grad.addColorStop(0, `rgba(255, 235, 59, 0)`);
      grad.addColorStop(0.5, `rgba(255, 235, 59, ${alpha})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 1.5})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(seq.x - 14, seq.y - 120);
      ctx.lineTo(seq.x + 14, seq.y - 120);
      ctx.lineTo(seq.x + 8, seq.y + 12);
      ctx.lineTo(seq.x - 8, seq.y + 12);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Ondas de choque en el suelo
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = sw.lineWidth || 2.5;
      ctx.beginPath();
      ctx.ellipse(sw.x + 8, sw.y + 14, sw.radius, sw.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Partículas y chispas
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      ctx.restore();
    }

    ctx.restore();
  }
}

export const vfx = new VFXSystem();
