// Sistema de Animales y Fauna Insular (Perros, Cerdos, Cocodrilos)
import { sound } from '../audio/soundFX.js';
import { ELEM } from '../sim/elements.js';
import { vfx } from '../render/fx.js';
import { animManager } from '../render/animationManager.js';

export class Animal {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type; // 'dog', 'pig', 'croc'
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = type === 'dog' ? 1.3 : (type === 'pig' ? 0.65 : 0.8);
    this.inWater = false;

    this.direction = 'right';
    this.frame = 0;
    this.animTimer = 0;

    this.state = 'wandering';
    this.stateTimer = 60 + Math.floor(Math.random() * 80);
    this.targetNpc = null; // Dueño o presa
    this.bubbleText = "";
    this.bubbleTimer = 0;
  }

  setBubble(text, duration = 90) {
    this.bubbleText = text;
    this.bubbleTimer = duration;
  }

  update(grid, allNpcs, allAnimals, tileSize = 8) {
    this.animTimer++;
    if (this.animTimer > 10) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 4;
    }

    if (this.bubbleTimer > 0) {
      this.bubbleTimer--;
      if (this.bubbleTimer <= 0) this.bubbleText = "";
    }

    this.stateTimer--;

    // 🌊 Detección de Bioma Acuático
    const tx = Math.floor((this.x + 8) / tileSize);
    const ty = Math.floor((this.y + 12) / tileSize);
    const groundElem = grid.get(tx, ty);
    this.inWater = (groundElem === ELEM.WATER);

    if (this.type === 'dog') {
      this.speed = this.inWater ? 0.7 : 1.3;
      if (this.inWater && Math.random() < 0.06 && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
        vfx.addWaterSplash(this.x + 8, this.y + 10, 2);
        vfx.addWaterRipple(this.x, this.y, 10);
      }
      this.updateDog(allNpcs);
    } else if (this.type === 'pig') {
      this.speed = this.inWater ? 0.35 : 0.65;
      if (this.inWater) {
        if (Math.random() < 0.1) {
          vfx.addWaterSplash(this.x + 8, this.y + 10, 3);
          vfx.addWaterRipple(this.x, this.y, 11);
        }
        if (Math.random() < 0.02) {
          this.setBubble("🐖 ¡Oink! ¡No me gusta el agua!", 70);
        }
      }
      this.updatePig(grid, tileSize);
    } else if (this.type === 'croc') {
      // 🐊 El caimán es el rey del agua: veloz y sigiloso en río/mar, lento en tierra
      this.speed = this.inWater ? 1.35 : 0.55;
      if (this.inWater && Math.random() < 0.05 && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
        vfx.addWaterRipple(this.x, this.y, 13);
      }
      this.updateCroc(allNpcs);
    }

    // 🧱 Colisión Física con Construcciones, Rocas y Abismos
    const isSolid = (px, py) => {
      const gtx = Math.floor(px / tileSize);
      const gty = Math.floor(py / tileSize);
      return grid.isSolid ? grid.isSolid(gtx, gty) : (grid.get(gtx, gty) === ELEM.BUILDING || grid.get(gtx, gty) === ELEM.STONE || grid.get(gtx, gty) === ELEM.RUBBLE || grid.get(gtx, gty) === ELEM.CHASM);
    };

    if (!isSolid(this.x + this.vx + 8, this.y + 12)) {
      this.x += this.vx;
    } else {
      this.vx = -this.vx * 0.5;
    }

    if (!isSolid(this.x + 8, this.y + this.vy + 12)) {
      this.y += this.vy;
    } else {
      this.vy = -this.vy * 0.5;
    }

    const maxPxX = (grid.width - 2) * tileSize;
    const maxPxY = (grid.height - 2) * tileSize;
    this.x = Math.max(tileSize * 2, Math.min(maxPxX, this.x));
    this.y = Math.max(tileSize * 2, Math.min(maxPxY, this.y));

    this.vx *= 0.82;
    this.vy *= 0.82;
  }

  updateDog(allNpcs) {
    if (!this.targetNpc || Math.random() < 0.004) {
      const humans = allNpcs.filter(n => n.type !== 'police');
      if (humans.length > 0) {
        this.targetNpc = humans[Math.floor(Math.random() * humans.length)];
        this.setBubble("🐾 ¡He encontrado a mi amigo humano!", 80);
      }
    }

    if (this.targetNpc) {
      const d = Math.hypot(this.targetNpc.x - this.x, this.targetNpc.y - this.y);
      if (d > 35) {
        const angle = Math.atan2(this.targetNpc.y - this.y, this.targetNpc.x - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.direction = this.vx > 0 ? 'right' : 'left';
      } else if (d < 20 && Math.random() < 0.02) {
        this.setBubble("🐕 ¡Guau! ❤️ (Aprendiendo trucos)", 75);
        if (this.targetNpc.brain) {
          this.targetNpc.brain.energy = Math.min(100, this.targetNpc.brain.energy + 5);
        }
      }
    }
  }

  updatePig(grid, tileSize) {
    if (this.stateTimer <= 0) {
      this.stateTimer = 90 + Math.floor(Math.random() * 100);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.direction = this.vx > 0 ? 'right' : 'left';

      // Pastar en plantas maduras
      const tx = Math.floor(this.x / tileSize);
      const ty = Math.floor(this.y / tileSize);
      if (grid.get(tx, ty) === 6) { // PLANT_BLOOM
        this.setBubble("🐖 ¡Oink! (Pastando rico trébol)", 70);
      } else if (Math.random() < 0.25) {
        this.setBubble("🐖 Oink oink", 60);
      }
    }
  }

  updateCroc(allNpcs) {
    // El cocodrilo merodea y asusta si hay alguien muy cerca
    const nearby = allNpcs.find(n => Math.hypot(n.x - this.x, n.y - this.y) < 32);
    if (nearby) {
      if (Math.random() < 0.05) {
        this.setBubble("🐊 ¡CHOMP!", 80);
        nearby.brain.fear = Math.min(100, nearby.brain.fear + 20);
        nearby.brain.setThoughtBubble("😱 ¡Un caimán, corran!", 90);
      }
    } else if (this.stateTimer <= 0) {
      this.stateTimer = 100 + Math.floor(Math.random() * 100);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.direction = this.vx > 0 ? 'right' : 'left';
    }
  }

  // Dibujo pixel art del animal estilo The Legend of Zelda: The Minish Cap
  draw(ctx) {
    if (animManager && animManager.drawAnimal) {
      const drawn = animManager.drawAnimal(ctx, this.type, this.x, this.y, this.direction, this.frame, this.inWater);
      if (drawn) {
        // Bocadillo de sonido del animal
        if (this.bubbleText) {
          ctx.save();
          ctx.font = '7px sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          const m = ctx.measureText(this.bubbleText);
          const bw = m.width + 4;
          ctx.fillRect(Math.floor(this.x + 8 - bw / 2), Math.floor(this.y - 10), bw, 9);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(Math.floor(this.x + 8 - bw / 2), Math.floor(this.y - 10), bw, 9);
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.fillText(this.bubbleText, Math.floor(this.x + 8), Math.floor(this.y - 3));
          ctx.restore();
        }
        return;
      }
    }

    const now = Date.now();
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.floor(this.x), Math.floor(this.y));

    const isFacingRight = this.direction === 'right';
    const legCycle = (this.frame % 4);

    // 1. Sombra bajo el animal en tierra
    if (!this.inWater) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
      ctx.beginPath();
      ctx.ellipse(8, 14, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Estela u ondas de agua Minish Cap
      ctx.save();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(8, 12, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // 🐕 PERRO DE CAZA / LABRADOR MINISH CAP
    // =========================================================================
    if (this.type === 'dog') {
      const tailWag = Math.round(Math.sin(now * 0.02) * 2);
      const earBob = (legCycle % 2 === 1) ? 1 : 0;
      const out = '#3d1a04';

      ctx.save();
      if (!isFacingRight) {
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }

      // Cola meneándose alegremente
      ctx.fillStyle = out;
      ctx.fillRect(0, 5 + tailWag, 3, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(1, 6 + tailWag, 2, 2);

      // Patas traseras y delanteras
      if (!this.inWater) {
        const p1 = (legCycle === 0 || legCycle === 1) ? 1 : -1;
        const p2 = -p1;
        ctx.fillStyle = out;
        ctx.fillRect(3, 11 + p1, 3, 4);
        ctx.fillRect(9, 11 + p2, 3, 4);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(3, 11 + p1, 2, 3);
        ctx.fillRect(9, 11 + p2, 2, 3);
        ctx.fillStyle = '#f59e0b'; // Pezuña / pata
        ctx.fillRect(4, 13 + p1, 2, 1);
        ctx.fillRect(10, 13 + p2, 2, 1);
      }

      // Cuerpo del perro (3 tonos de dorado)
      ctx.fillStyle = out;
      ctx.fillRect(2, 6, 10, 6);
      ctx.fillStyle = '#92400e'; // Sombra vientre
      ctx.fillRect(3, 8, 8, 4);
      ctx.fillStyle = '#d97706'; // Tono medio
      ctx.fillRect(3, 7, 8, 3);
      ctx.fillStyle = '#f59e0b'; // Lomo iluminado
      ctx.fillRect(4, 6, 7, 2);

      // Cabeza redonda y hocico
      ctx.fillStyle = out;
      ctx.fillRect(8, 2, 7, 6);
      ctx.fillRect(13, 4, 3, 4); // Morro
      ctx.fillStyle = '#d97706';
      ctx.fillRect(9, 3, 5, 5);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(9, 2, 4, 2);
      ctx.fillStyle = '#fde68a'; // Hocico crema
      ctx.fillRect(12, 4, 3, 3);

      // Trufa / Nariz húmeda negra con brillo
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(14, 4, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 4, 1, 1);

      // Ojo vivaz Minish Cap
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, 3, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 3, 1, 1);

      // Oreja caída que rebota con el trote
      ctx.fillStyle = out;
      ctx.fillRect(7, 2 + earBob, 3, 5);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 3 + earBob, 2, 4);

      // Collar rojo / azul con cascabel dorado
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(8, 6, 2, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(9, 8, 1, 1);

      ctx.restore();
    }
    // =========================================================================
    // 🐖 CERDITO ROSADO GORDITO MINISH CAP
    // =========================================================================
    else if (this.type === 'pig') {
      const earWiggle = (legCycle % 2 === 1) ? 1 : 0;
      const out = '#701a35';

      ctx.save();
      if (!isFacingRight) {
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }

      // Colita enroscada en espiral
      ctx.fillStyle = out;
      ctx.fillRect(0, 7, 3, 2);
      ctx.fillRect(1, 6, 2, 2);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(1, 7, 1, 1);

      // Patitas trotonas
      if (!this.inWater) {
        const p1 = (legCycle === 0 || legCycle === 1) ? 1 : -1;
        const p2 = -p1;
        ctx.fillStyle = out;
        ctx.fillRect(3, 11 + p1, 3, 4);
        ctx.fillRect(9, 11 + p2, 3, 4);
        ctx.fillStyle = '#db2777';
        ctx.fillRect(3, 11 + p1, 2, 3);
        ctx.fillRect(9, 11 + p2, 2, 3);
        ctx.fillStyle = '#9d174d'; // Pezuñas hendidas
        ctx.fillRect(3, 13 + p1, 2, 1);
        ctx.fillRect(9, 13 + p2, 2, 1);
      }

      // Cuerpo rechoncho (3 tonos de rosa)
      ctx.fillStyle = out;
      ctx.fillRect(2, 4, 10, 8);
      ctx.fillRect(1, 5, 12, 6);
      ctx.fillStyle = '#db2777'; // Sombra panza
      ctx.fillRect(2, 8, 10, 4);
      ctx.fillStyle = '#f472b6'; // Rosa medio
      ctx.fillRect(2, 5, 10, 4);
      ctx.fillStyle = '#fbcfe8'; // Lomo iluminado
      ctx.fillRect(4, 4, 6, 2);

      // Cabeza y trompa redonda
      ctx.fillStyle = out;
      ctx.fillRect(9, 4, 6, 7);
      ctx.fillRect(13, 6, 3, 4);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(10, 5, 4, 5);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(10, 4, 3, 2);

      // Hocico chato con orificios nasales
      ctx.fillStyle = '#db2777';
      ctx.fillRect(13, 6, 3, 3);
      ctx.fillStyle = '#831843'; // Agujeros de la nariz
      ctx.fillRect(14, 7, 1, 1);
      ctx.fillRect(14, 8, 1, 1);

      // Ojo negro dulce con brillo
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, 5, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 5, 1, 1);

      // Orejita puntiaguda que tiembla
      ctx.fillStyle = out;
      ctx.fillRect(8, 2 + earWiggle, 3, 4);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(9, 3 + earWiggle, 2, 2);

      ctx.restore();
    }
    // =========================================================================
    // 🐊 CAIMÁN DE RÍO / COCODRILO SELVÁTICO
    // =========================================================================
    else if (this.type === 'croc') {
      const out = '#052e16';
      const tailSin = Math.round(Math.sin(now * 0.015) * 2);

      ctx.save();
      if (!isFacingRight) {
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }

      if (this.inWater) {
        // En el agua: cuerpo semi-sumergido con crestas escamadas cortando el agua
        ctx.fillStyle = out;
        ctx.fillRect(0, 8 + tailSin, 15, 4);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(1, 8 + tailSin, 13, 3);
        // Crestas dorsales afiladas
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(2, 7 + tailSin, 2, 2);
        ctx.fillRect(5, 7, 2, 2);
        ctx.fillRect(8, 7, 2, 2);
        // Ojo reptiliano amarillo acechando sobre el agua
        ctx.fillStyle = '#facc15';
        ctx.fillRect(10, 6, 2, 2);
        ctx.fillStyle = '#000000'; // Pupila vertical
        ctx.fillRect(11, 6, 1, 2);
      } else {
        // En tierra: caimán completo arrastrándose
        // Cola escamada
        ctx.fillStyle = out;
        ctx.fillRect(0, 8 + tailSin, 4, 3);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(1, 8 + tailSin, 3, 2);

        // Patas reptilianas
        ctx.fillStyle = out;
        ctx.fillRect(3, 11, 3, 3);
        ctx.fillRect(9, 11, 3, 3);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(3, 12, 2, 2);
        ctx.fillRect(9, 12, 2, 2);

        // Cuerpo largo con escamas dorsales
        ctx.fillStyle = out;
        ctx.fillRect(2, 6, 12, 6);
        ctx.fillStyle = '#14532d'; // Vientre
        ctx.fillRect(3, 8, 10, 3);
        ctx.fillStyle = '#16a34a'; // Lomo
        ctx.fillRect(3, 6, 9, 3);
        // Crestas dorsales
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(4, 5, 2, 2);
        ctx.fillRect(7, 5, 2, 2);
        ctx.fillRect(10, 5, 2, 2);

        // Cabeza y mandíbula con dientes
        ctx.fillStyle = out;
        ctx.fillRect(11, 6, 5, 5);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(12, 7, 4, 3);
        // Dientes afilados blancos
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 9, 1, 1);
        ctx.fillRect(15, 9, 1, 1);

        // Ojo reptiliano
        ctx.fillStyle = '#facc15';
        ctx.fillRect(12, 5, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(13, 5, 1, 2);
      }

      ctx.restore();
    }

    // Bocadillo de sonido del animal
    if (this.bubbleText) {
      ctx.save();
      ctx.font = '7px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const m = ctx.measureText(this.bubbleText);
      const bw = m.width + 4;
      ctx.fillRect(8 - bw / 2, -10, bw, 9);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(8 - bw / 2, -10, bw, 9);
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(this.bubbleText, 8, -3);
      ctx.restore();
    }

    ctx.restore();
  }
}
