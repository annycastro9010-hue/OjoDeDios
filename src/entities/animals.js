// Sistema de Animales y Fauna Insular (Perros, Cerdos, Cocodrilos)
import { sound } from '../audio/soundFX.js';
import { ELEM } from '../sim/elements.js';
import { vfx } from '../render/fx.js';

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
      const el = grid.get(gtx, gty);
      return el === ELEM.BUILDING || el === ELEM.STONE || el === ELEM.RUBBLE || el === ELEM.CHASM;
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

  // Dibujo pixel art del animal con física acuática
  draw(ctx) {
    ctx.save();
    ctx.translate(Math.floor(this.x), Math.floor(this.y));

    // Estela u ondas de agua si el animal está en agua
    if (this.inWater) {
      ctx.save();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(8, 11, 7, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.type === 'dog') {
      // Perro marrón/dorado
      ctx.fillStyle = '#b45309';
      ctx.fillRect(2, 6, 11, 5); // Cuerpo
      ctx.fillRect(this.direction === 'right' ? 9 : 2, 2, 5, 5); // Cabeza
      ctx.fillStyle = '#78350f'; // Orejas
      ctx.fillRect(this.direction === 'right' ? 9 : 5, 1, 2, 3);

      if (!this.inWater) {
        // Patas animadas en tierra firme
        const legBob = (this.frame % 2 === 1) ? 1 : 0;
        ctx.fillStyle = '#92400e';
        ctx.fillRect(3, 11, 2, 3 - legBob);
        ctx.fillRect(9, 11, 2, 2 + legBob);
        // Colita
        ctx.fillStyle = '#b45309';
        ctx.fillRect(this.direction === 'right' ? 0 : 12, 5, 2, 2);
      } else {
        // Patas remando bajo el agua (espuma en la línea de flotación)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(2, 10, 11, 1);
      }
    } else if (this.type === 'pig') {
      // Cerdo rosado
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(2, 5, 12, 6); // Cuerpo
      ctx.fillRect(this.direction === 'right' ? 10 : 1, 6, 4, 4); // Trompa
      ctx.fillStyle = '#db2777';
      ctx.fillRect(this.direction === 'right' ? 12 : 2, 7, 2, 2); // Hocico

      if (!this.inWater) {
        // Patas en tierra
        const legBob = (this.frame % 2 === 1) ? 1 : 0;
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(3, 11, 2, 3 - legBob);
        ctx.fillRect(9, 11, 2, 2 + legBob);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(2, 10, 12, 1);
      }
    } else if (this.type === 'croc') {
      if (this.inWater) {
        // 🐊 Caimán al acecho en agua: cuerpo sumergido, mostrando crestas escamadas y ojos saltones
        ctx.fillStyle = '#14532d'; // Dorso semi-sumergido
        ctx.fillRect(2, 8, 12, 3);
        // Crestas dorsales sobresaliendo del agua
        ctx.fillStyle = '#166534';
        ctx.fillRect(3, 7, 2, 1);
        ctx.fillRect(6, 7, 2, 1);
        ctx.fillRect(9, 7, 2, 1);
        // Hocico en la superficie
        ctx.fillRect(this.direction === 'right' ? 11 : 0, 8, 4, 2);
        // Ojo amarillo acechando
        ctx.fillStyle = '#facc15';
        ctx.fillRect(this.direction === 'right' ? 10 : 3, 6, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.direction === 'right' ? 11 : 4, 7, 1, 1);
      } else {
        // En tierra: cuerpo completo visible arrastrándose
        ctx.fillStyle = '#15803d';
        ctx.fillRect(1, 7, 14, 5); // Cuerpo bajo
        ctx.fillStyle = '#166534';
        ctx.fillRect(this.direction === 'right' ? 10 : 0, 8, 6, 3); // Mandíbula
        ctx.fillStyle = '#facc15';
        ctx.fillRect(this.direction === 'right' ? 11 : 4, 7, 2, 2); // Ojo reptil
      }
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
