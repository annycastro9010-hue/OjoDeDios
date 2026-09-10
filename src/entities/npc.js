import { ELEM } from '../sim/elements.js';
import { sound } from '../audio/soundFX.js';

export class NPC {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type; // 'cultivator', 'police', 'boss'
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = type === 'police' ? 1.1 : 0.85;

    this.direction = 'down';
    this.frame = 0;
    this.animTimer = 0;

    this.state = 'wandering';
    this.stateTimer = 0;
    this.targetTile = null;

    this.cargo = 0; // Fardos de mercancía en inventario
    this.maxCargo = 2;

    this.isPossessed = false;
    this.alerted = false;
    this.alertTimer = 0;
  }

  update(grid, allNpcs, tileSize = 8, onClandestineSale = null, onPoliceAlert = null) {
    // Si está poseído por el jugador, los controles WASD manejan el movimiento
    if (this.isPossessed) return;

    this.animTimer++;
    if (this.animTimer > 12) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 4;
    }

    if (this.type === 'cultivator') {
      this.updateCultivator(grid, allNpcs, tileSize, onClandestineSale);
    } else if (this.type === 'police') {
      this.updatePolice(grid, allNpcs, tileSize, onPoliceAlert);
    } else if (this.type === 'boss') {
      this.updateBoss(grid, allNpcs, tileSize);
    }

    // Aplicar movimiento
    this.x += this.vx;
    this.y += this.vy;

    // Límites de la isla
    const maxPxX = (grid.width - 2) * tileSize;
    const maxPxY = (grid.height - 2) * tileSize;
    this.x = Math.max(tileSize * 2, Math.min(maxPxX, this.x));
    this.y = Math.max(tileSize * 2, Math.min(maxPxY, this.y));

    // Desaceleración
    this.vx *= 0.8;
    this.vy *= 0.8;
  }

  updateCultivator(grid, allNpcs, tileSize, onClandestineSale) {
    this.stateTimer--;

    // 1. Detección de peligro: si hay un policía cerca, huir
    const nearbyPolice = allNpcs.find(n => n.type === 'police' && this.distTo(n) < 55);
    if (nearbyPolice && this.cargo > 0) {
      this.state = 'fleeing';
      const angle = Math.atan2(this.y - nearbyPolice.y, this.x - nearbyPolice.x);
      this.vx = Math.cos(angle) * (this.speed * 1.3);
      this.vy = Math.sin(angle) * (this.speed * 1.3);
      this.updateDirection();
      return;
    }

    // 2. Si lleva carga máxima, ir a entregar al Almacén
    if (this.cargo >= this.maxCargo && this.state !== 'delivering') {
      this.state = 'delivering';
      if (grid.buildingLocations.length > 0) {
        const dest = grid.buildingLocations[0];
        this.targetTile = { x: dest.x, y: dest.y };
      }
    }

    // 3. Ejecución de estados
    if (this.state === 'delivering' && this.targetTile) {
      const targetPxX = this.targetTile.x * tileSize;
      const targetPxY = this.targetTile.y * tileSize;
      const d = Math.hypot(targetPxX - this.x, targetPxY - this.y);

      if (d < 12) {
        // Entrega completada
        if (onClandestineSale) onClandestineSale(this.cargo * 100);
        this.cargo = 0;
        this.state = 'wandering';
        this.stateTimer = 60;
        this.targetTile = null;
      } else {
        const angle = Math.atan2(targetPxY - this.y, targetPxX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.updateDirection();
      }
      return;
    }

    // 4. Buscar plantas maduras para cosechar
    if (this.cargo < this.maxCargo) {
      const curTileX = Math.floor(this.x / tileSize);
      const curTileY = Math.floor(this.y / tileSize);

      // Si la celda actual o vecina es una planta madura, cosechar
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tx = curTileX + dx;
          const ty = curTileY + dy;
          if (grid.get(tx, ty) === ELEM.PLANT_BLOOM) {
            grid.set(tx, ty, ELEM.FERTILE_DIRT); // Dejar tierra para rebrote
            this.cargo++;
            sound.playPlant();
            return;
          }
        }
      }

      // Si no tiene objetivo de cosecha, buscar en radio de 10 tiles
      if (!this.targetTile || this.stateTimer <= 0) {
        let nearestDist = 999;
        let bestTarget = null;
        for (let dy = -8; dy <= 8; dy++) {
          for (let dx = -8; dx <= 8; dx++) {
            const tx = curTileX + dx;
            const ty = curTileY + dy;
            if (grid.get(tx, ty) === ELEM.PLANT_BLOOM) {
              const d = dx * dx + dy * dy;
              if (d < nearestDist) {
                nearestDist = d;
                bestTarget = { x: tx, y: ty };
              }
            }
          }
        }
        if (bestTarget) {
          this.targetTile = bestTarget;
          this.state = 'seeking_crop';
          this.stateTimer = 180;
        } else {
          this.state = 'wandering';
          this.stateTimer = 90 + Math.floor(Math.random() * 90);
          this.targetTile = null;
        }
      }

      if (this.state === 'seeking_crop' && this.targetTile) {
        const targetPxX = this.targetTile.x * tileSize;
        const targetPxY = this.targetTile.y * tileSize;
        const angle = Math.atan2(targetPxY - this.y, targetPxX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.updateDirection();
        return;
      }
    }

    // 5. Deambular normal
    if (this.state === 'wandering') {
      if (this.stateTimer <= 0) {
        this.stateTimer = 60 + Math.floor(Math.random() * 80);
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * (this.speed * 0.7);
        this.vy = Math.sin(angle) * (this.speed * 0.7);
        this.updateDirection();
      }
    }
  }

  updatePolice(grid, allNpcs, tileSize, onPoliceAlert) {
    this.stateTimer--;

    // Cono de visión: buscar cultivadores con cargamento o jugadores sospechosos
    const suspects = allNpcs.filter(n => n.id !== this.id && n.cargo > 0);
    let spotted = null;

    for (const sus of suspects) {
      const d = this.distTo(sus);
      if (d < 70) {
        const angle = Math.atan2(sus.y - this.y, sus.x - this.x);
        const facingAngle = this.getFacingAngle();
        let diff = Math.abs(angle - facingAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < Math.PI * 0.25) { // Dentro del cono FOV
          spotted = sus;
          break;
        }
      }
    }

    if (spotted) {
      if (!this.alerted) {
        this.alerted = true;
        sound.playAlert();
        if (onPoliceAlert) onPoliceAlert();
      }
      this.state = 'chasing';
      const angle = Math.atan2(spotted.y - this.y, spotted.x - this.x);
      this.vx = Math.cos(angle) * (this.speed * 1.35);
      this.vy = Math.sin(angle) * (this.speed * 1.35);
      this.updateDirection();

      // Si atrapa al sospechoso
      if (this.distTo(spotted) < 14) {
        spotted.cargo = 0;
        this.alerted = false;
        this.state = 'wandering';
        this.stateTimer = 90;
      }
      return;
    }

    // Patrulla por senderos
    if (this.stateTimer <= 0) {
      this.alerted = false;
      this.stateTimer = 100 + Math.floor(Math.random() * 80);
      const dirs = ['down', 'up', 'left', 'right'];
      this.direction = dirs[Math.floor(Math.random() * dirs.length)];
      if (this.direction === 'down') { this.vx = 0; this.vy = this.speed; }
      else if (this.direction === 'up') { this.vx = 0; this.vy = -this.speed; }
      else if (this.direction === 'left') { this.vx = -this.speed; this.vy = 0; }
      else if (this.direction === 'right') { this.vx = this.speed; this.vy = 0; }
    }
  }

  updateBoss(grid, allNpcs, tileSize) {
    // El Patrón fuma su puro cerca de su almacén y camina poco
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 120 + Math.floor(Math.random() * 100);
      const dirs = ['down', 'right', 'left', 'up'];
      this.direction = dirs[Math.floor(Math.random() * dirs.length)];
      if (Math.random() < 0.3) {
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    }
  }

  getFacingAngle() {
    if (this.direction === 'right') return 0;
    if (this.direction === 'down') return Math.PI * 0.5;
    if (this.direction === 'left') return Math.PI;
    return -Math.PI * 0.5; // up
  }

  updateDirection() {
    if (Math.abs(this.vx) > Math.abs(this.vy)) {
      this.direction = this.vx > 0 ? 'right' : 'left';
    } else if (Math.abs(this.vy) > 0.1) {
      this.direction = this.vy > 0 ? 'down' : 'up';
    }
  }

  distTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }
}
