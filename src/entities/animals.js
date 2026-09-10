// Sistema de Animales y Fauna Insular (Perros, Cerdos, Cocodrilos, Palomas)
import { sound } from '../audio/soundFX.js';

export class Animal {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type; // 'dog', 'pig', 'croc'
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = type === 'dog' ? 1.3 : (type === 'pig' ? 0.65 : 0.8);

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

    if (this.type === 'dog') {
      this.updateDog(allNpcs);
    } else if (this.type === 'pig') {
      this.updatePig(grid, tileSize);
    } else if (this.type === 'croc') {
      this.updateCroc(allNpcs);
    }

    this.x += this.vx;
    this.y += this.vy;

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

  // Dibujo pixel art del animal
  draw(ctx) {
    ctx.save();
    ctx.translate(Math.floor(this.x), Math.floor(this.y));

    if (this.type === 'dog') {
      // Perro marrón/dorado
      ctx.fillStyle = '#b45309';
      ctx.fillRect(2, 6, 11, 6); // Cuerpo
      ctx.fillRect(this.direction === 'right' ? 9 : 2, 2, 5, 5); // Cabeza
      ctx.fillStyle = '#78350f'; // Orejas
      ctx.fillRect(this.direction === 'right' ? 9 : 5, 1, 2, 3);
      // Patas animadas
      const legBob = (this.frame % 2 === 1) ? 1 : 0;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(3, 11, 2, 3 - legBob);
      ctx.fillRect(9, 11, 2, 2 + legBob);
      // Colita
      ctx.fillStyle = '#b45309';
      ctx.fillRect(this.direction === 'right' ? 0 : 12, 5, 2, 2);
    } else if (this.type === 'pig') {
      // Cerdo rosado
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(2, 5, 12, 7); // Cuerpo
      ctx.fillRect(this.direction === 'right' ? 10 : 1, 6, 4, 4); // Trompa
      ctx.fillStyle = '#db2777';
      ctx.fillRect(this.direction === 'right' ? 12 : 2, 7, 2, 2); // Hocico
      // Patas
      const legBob = (this.frame % 2 === 1) ? 1 : 0;
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(3, 11, 2, 3 - legBob);
      ctx.fillRect(9, 11, 2, 2 + legBob);
    } else if (this.type === 'croc') {
      // Cocodrilo verde oscuro
      ctx.fillStyle = '#15803d';
      ctx.fillRect(1, 7, 14, 5); // Cuerpo bajo
      ctx.fillStyle = '#166534';
      ctx.fillRect(this.direction === 'right' ? 10 : 0, 8, 6, 3); // Mandíbula
      ctx.fillStyle = '#facc15';
      ctx.fillRect(this.direction === 'right' ? 11 : 4, 7, 2, 2); // Ojo reptil
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
