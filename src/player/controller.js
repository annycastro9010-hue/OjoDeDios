import { ELEM } from '../sim/elements.js';
import { sound } from '../audio/soundFX.js';

export class PlayerController {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false,
      ascend: false
    };

    this.stepTimer = 0;
    this.initKeyboardListeners();
  }

  initKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.keys.up = true;
      if (key === 's' || key === 'arrowdown') this.keys.down = true;
      if (key === 'a' || key === 'arrowleft') this.keys.left = true;
      if (key === 'd' || key === 'arrowright') this.keys.right = true;
      if (key === 'e' || key === ' ') this.keys.action = true;
      if (key === 'q' || key === 'escape') this.keys.ascend = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.keys.up = false;
      if (key === 's' || key === 'arrowdown') this.keys.down = false;
      if (key === 'a' || key === 'arrowleft') this.keys.left = false;
      if (key === 'd' || key === 'arrowright') this.keys.right = false;
      if (key === 'e' || key === ' ') this.keys.action = false;
      if (key === 'q' || key === 'escape') this.keys.ascend = false;
    });
  }

  bindTouchControls(container) {
    if (!container) return;
    const bindBtn = (selector, keyName) => {
      const btn = (container.querySelector ? container.querySelector(selector) : null) || (typeof document !== 'undefined' && document.querySelector ? document.querySelector(selector) : null);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        this.keys[keyName] = true;
        btn.classList.add('pressed');
      };
      const end = (e) => {
        e.preventDefault();
        this.keys[keyName] = false;
        btn.classList.remove('pressed');
      };
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
    };

    bindBtn('#padUp', 'up');
    bindBtn('#padDown', 'down');
    bindBtn('#padLeft', 'left');
    bindBtn('#padRight', 'right');
    bindBtn('#padAction', 'action');
    bindBtn('#padAscend', 'ascend');
  }

  update(possessedNpc, grid, onQuestProgress, onAscendRequest, tileSize = 8, allNpcs = []) {
    if (!possessedNpc) return;

    let moveX = 0;
    let moveY = 0;

    if (this.keys.up) moveY -= 1;
    if (this.keys.down) moveY += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    // Normalizar vector diagonal
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    const baseSpeed = possessedNpc.type === 'mototaxista' ? 2.4 : 1.6;
    if (moveX !== 0 || moveY !== 0) {
      possessedNpc.x += moveX * baseSpeed;
      possessedNpc.y += moveY * baseSpeed;

      // Dirección del sprite
      if (Math.abs(moveX) > Math.abs(moveY)) {
        possessedNpc.direction = moveX > 0 ? 'right' : 'left';
      } else {
        possessedNpc.direction = moveY > 0 ? 'down' : 'up';
      }

      // Animación y sonido de pasos o motor
      this.stepTimer++;
      if (this.stepTimer % 14 === 0) {
        possessedNpc.frame = (possessedNpc.frame + 1) % 4;
        if (possessedNpc.type === 'mototaxista') {
          sound.playMotorbike();
        } else {
          sound.playStep();
        }
      }
    }

    // Mantener dentro del mapa
    possessedNpc.x = Math.max(tileSize * 2, Math.min((grid.width - 3) * tileSize, possessedNpc.x));
    possessedNpc.y = Math.max(tileSize * 2, Math.min((grid.height - 3) * tileSize, possessedNpc.y));

    // Acción: interactuar / habilidad especial / cosechar / entregar
    if (this.keys.action) {
      this.keys.action = false; // Disparar una vez por pulsación
      this.handleAction(possessedNpc, grid, onQuestProgress, tileSize, allNpcs);
    }

    // Ascender / Desposeer
    if (this.keys.ascend) {
      this.keys.ascend = false;
      if (onAscendRequest) onAscendRequest();
    }
  }

  handleAction(npc, grid, onQuestProgress, tileSize, allNpcs = []) {
    const tileX = Math.floor((npc.x + 8) / tileSize);
    const tileY = Math.floor((npc.y + 8) / tileSize);

    // ================= HABILIDADES ESPECIALES ACTIVAS (ESPACIO) =================
    if (npc.type === 'police_cuadrante') {
      sound.playWhistle();
      sound.playCash();
      npc.brain.setThoughtBubble("👮 ¡PÁREME AHÍ! Colabóreme pa' la gaseosa mi rey.", 160);
      const target = allNpcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 55);
      if (target) {
        target.brain.setThoughtBubble("💸 ¡Qué robadera mi Cabo! Tenga pal fresco.", 140);
        target.cargo = 0;
      }
      if (onQuestProgress) onQuestProgress('bribe', 1);
      return;
    }

    if (npc.type === 'mototaxista') {
      sound.playMotorbike();
      npc.brain.setThoughtBubble("🛵 ¡PIQUE TROCHERO! ¡ÁBRANSE QUE VOY SIN FRENOS!", 150);
      const boost = 32;
      if (npc.direction === 'right') npc.x += boost;
      else if (npc.direction === 'left') npc.x -= boost;
      else if (npc.direction === 'up') npc.y -= boost;
      else if (npc.direction === 'down') npc.y += boost;

      // Dejar humo de tubo de escape
      grid.set(tileX, tileY, ELEM.SMOKE, 25);
      if (onQuestProgress) onQuestProgress('wheelie', 1);
      return;
    }

    if (npc.type === 'vendedor') {
      sound.playMegaphone();
      npc.brain.setThoughtBubble("📢 ¡A MIL Y A DOS MIL EL AGUACATE MADURITO!", 160);
      allNpcs.filter(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 60).forEach(n => {
        n.brain.setThoughtBubble("🥑 ¡Don Mario, véndame dos aguacates mantequilla!", 130);
      });
      if (onQuestProgress) onQuestProgress('sell', 1);
      return;
    }

    if (npc.type === 'guerrillero') {
      sound.playFire();
      grid.set(tileX, tileY, ELEM.CAMPFIRE);
      npc.brain.setThoughtBubble("🪖 ¡SANCOCHO TRIFÁSICO SERVIDO EN LA OLLA COMUNITARIA!", 160);
      allNpcs.filter(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 60).forEach(n => {
        n.brain.setThoughtBubble("🍲 ¡Bendito sea el sancocho en la selva!", 130);
      });
      if (onQuestProgress) onQuestProgress('sancocho', 1);
      return;
    }

    if (npc.type === 'vecina_chismosa') {
      sound.playSlap();
      npc.brain.setThoughtBubble("👵 ¡ESCOBAZO LIMPIO! ¡A TRABAJAR MALANDRINES!", 150);
      const target = allNpcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 55);
      if (target) {
        target.brain.setThoughtBubble("😱 ¡Auxilio, Doña Gloria me pegó un escobazo!", 130);
        target.x += (Math.random() - 0.5) * 30;
        target.y += (Math.random() - 0.5) * 30;
      }
      if (onQuestProgress) onQuestProgress('gossip', 1);
      return;
    }

    if (npc.type === 'alcalde') {
      sound.playPickup();
      grid.set(tileX, tileY, ELEM.PLANT_BLOOM);
      npc.brain.setThoughtBubble("🎩 ¡UN TAMAL CALIENTE POR CADA VOTO COMPATRIOTAS!", 160);
      allNpcs.filter(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 60).forEach(n => {
        n.brain.setThoughtBubble("😋 ¡Qué viva el Doctor Promesas y sus tamales!", 130);
      });
      if (onQuestProgress) onQuestProgress('tamal', 1);
      return;
    }

    // ================= COSECHA / ENTREGA NORMAL =================
    // 1. Cosechar planta madura cercana si tiene espacio
    if (npc.cargo < 2) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tx = tileX + dx;
          const ty = tileY + dy;
          if (grid.get(tx, ty) === ELEM.PLANT_BLOOM) {
            grid.set(tx, ty, ELEM.FERTILE_DIRT);
            npc.cargo++;
            sound.playPlant();
            if (onQuestProgress) onQuestProgress('harvest', 1);
            return;
          }
        }
      }
    }

    // 2. Entregar cargamento en Almacén o Muelle
    for (const b of grid.buildingLocations) {
      const bPxX = b.x * tileSize;
      const bPxY = b.y * tileSize;
      const dist = Math.hypot((npc.x + 8) - bPxX, (npc.y + 8) - bPxY);

      if (dist < 28 && npc.cargo > 0) {
        const delivered = npc.cargo;
        npc.cargo = 0;
        sound.playPickup();
        if (onQuestProgress) onQuestProgress('deliver', delivered);
        return;
      }
    }
  }
}
