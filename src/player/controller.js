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

  update(possessedNpc, grid, onQuestProgress, onAscendRequest, tileSize = 8) {
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

    const speed = 1.6;
    if (moveX !== 0 || moveY !== 0) {
      possessedNpc.x += moveX * speed;
      possessedNpc.y += moveY * speed;

      // Dirección del sprite
      if (Math.abs(moveX) > Math.abs(moveY)) {
        possessedNpc.direction = moveX > 0 ? 'right' : 'left';
      } else {
        possessedNpc.direction = moveY > 0 ? 'down' : 'up';
      }

      // Animación y sonido de pasos
      this.stepTimer++;
      if (this.stepTimer % 14 === 0) {
        possessedNpc.frame = (possessedNpc.frame + 1) % 4;
        sound.playStep();
      }
    }

    // Mantener dentro del mapa
    possessedNpc.x = Math.max(tileSize * 2, Math.min((grid.width - 3) * tileSize, possessedNpc.x));
    possessedNpc.y = Math.max(tileSize * 2, Math.min((grid.height - 3) * tileSize, possessedNpc.y));

    // Acción: interactuar / cosechar / entregar
    if (this.keys.action) {
      this.keys.action = false; // Disparar una vez por pulsación
      this.handleAction(possessedNpc, grid, onQuestProgress, tileSize);
    }

    // Ascender / Desposeer
    if (this.keys.ascend) {
      this.keys.ascend = false;
      if (onAscendRequest) onAscendRequest();
    }
  }

  handleAction(npc, grid, onQuestProgress, tileSize) {
    const tileX = Math.floor((npc.x + 8) / tileSize);
    const tileY = Math.floor((npc.y + 8) / tileSize);

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
