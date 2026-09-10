import { ELEM } from '../sim/elements.js';
import { sound } from '../audio/soundFX.js';
import { NPCBrain } from '../ai/brain.js';

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

    // Mente, personalidad y sensaciones
    this.brain = new NPCBrain(type);

    // Relaciones Sociales, Pareja y Crianza
    this.partnerId = null;
    this.rivalId = null;
    this.hasChild = false;
    this.parentId = null;
    // Habilidades físicas naturales y biomas
    this.canSwim = (type === 'fisherman' || type === 'prophet' || type === 'musician' || Math.random() < 0.35);
    this.isSwimming = false;
    this.drowningTimer = 0;
    this.thirst = 0;

    if (type === 'child') {
      this.speed = 1.0;
      this.brain.title = "Niño de la Aldea";
    } else if (type === 'mototaxista') {
      this.speed = 1.45;
      this.brain.title = "El Brayan de la 125";
    } else if (type === 'police_cuadrante') {
      this.speed = 1.15;
      this.brain.title = "Patrullero del Cuadrante";
    } else if (type === 'guerrillero') {
      this.speed = 0.95;
      this.brain.title = "Miliciano de la Selva";
    } else if (type === 'vendedor') {
      this.speed = 0.8;
      this.brain.title = "Don Mario el de los Aguacates";
    } else if (type === 'vecina_chismosa') {
      this.speed = 0.9;
      this.brain.title = "Doña Gloria la Vecina";
    } else if (type === 'alcalde') {
      this.speed = 0.75;
      this.brain.title = "Doctor Promesas (Alcalde)";
    }
  }

  update(grid, allNpcs, tileSize = 8, onClandestineSale = null, onPoliceAlert = null) {
    // Si está poseído por el jugador, los controles WASD manejan el movimiento
    if (this.isPossessed) return;

    // Actualización de mente y pensamientos autónomos
    const nearbyPolice = allNpcs.find(n => (n.type === 'police' || n.type === 'soldier') && n.id !== this.id && this.distTo(n) < 60);
    this.brain.update(this, !!nearbyPolice, false);

    this.animTimer++;
    if (this.animTimer > 12) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 4;
    }

    // Detección física del bioma del suelo
    const curTileX = Math.floor((this.x + 8) / tileSize);
    const curTileY = Math.floor((this.y + 8) / tileSize);
    const groundElem = grid.get(curTileX, curTileY);

    // 1. Agua y Ahogamiento Natural
    if (groundElem === ELEM.WATER) {
      if (this.type === 'prophet') {
        if (Math.random() < 0.015) {
          this.brain.setThoughtBubble("✨ Caminando sobre las aguas...", 80);
        }
      } else if (this.canSwim) {
        this.isSwimming = true;
        this.speed = 0.55;
        if (Math.random() < 0.01) {
          this.brain.setThoughtBubble("🏊 Nadando fresquito...", 60);
        }
      } else {
        // No sabe nadar: chapotea y se ahoga
        this.drowningTimer++;
        this.vx *= 0.3;
        this.vy *= 0.3;
        if (this.drowningTimer % 35 === 0) {
          sound.playWater();
          this.brain.fear = 100;
          this.brain.setThoughtBubble("🌊 ¡SOCORRO! ¡No sé nadar, me ahogo!", 80);
        }
        if (this.drowningTimer > 220) {
          // Rescate de emergencia arrastrado a la orilla
          this.x += (Math.random() - 0.5) * 40;
          this.y += (Math.random() - 0.5) * 40;
          this.drowningTimer = 0;
          this.brain.setThoughtBubble("😵 ¡Casi me ahogo! Gracias al cielo...", 120);
        }
      }
    } else {
      this.isSwimming = false;
      this.drowningTimer = 0;
      this.speed = (this.type === 'police' || this.type === 'soldier') ? 1.1 : 0.85;
    }

    // 2. Arena de Desierto y Sed
    if (groundElem === ELEM.SAND) {
      this.thirst += 0.06;
      if (this.thirst > 50 && Math.random() < 0.02) {
        this.brain.setThoughtBubble("🏜️ ¡Qué calor de desierto, me muero de sed!", 90);
      }
    } else {
      if (this.thirst > 0) this.thirst -= 0.04;
    }

    // Comportamientos según profesión histórica
    if (this.type === 'cultivator') {
      this.updateCultivator(grid, allNpcs, tileSize, onClandestineSale);
    } else if (this.type === 'police' || this.type === 'soldier') {
      this.updatePolice(grid, allNpcs, tileSize, onPoliceAlert);
    } else if (this.type === 'boss') {
      this.updateBoss(grid, allNpcs, tileSize);
    } else if (this.type === 'child') {
      this.updateChild(allNpcs);
    } else if (this.type === 'musician' || this.type === 'hippie') {
      this.updateMusician(allNpcs);
    } else if (this.type === 'fisherman') {
      this.updateFisherman(grid, tileSize);
    } else if (this.type === 'prophet') {
      this.updateProphet(allNpcs);
    } else if (this.type === 'police_cuadrante') {
      this.updatePoliceCuadrante(grid, allNpcs, tileSize);
    } else if (this.type === 'guerrillero') {
      this.updateGuerrillero(grid, allNpcs, tileSize);
    } else if (this.type === 'mototaxista') {
      this.updateMototaxista(grid, allNpcs, tileSize);
    } else if (this.type === 'vendedor') {
      this.updateVendedor(grid, allNpcs, tileSize);
    } else if (this.type === 'vecina_chismosa') {
      this.updateVecinaChismosa(allNpcs);
    } else if (this.type === 'alcalde') {
      this.updateAlcalde(allNpcs);
    } else {
      // Civil / trabajador común
      this.updateCivilian();
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
        // Entrega completada y ganancia de experiencia / evolución
        const delivered = this.cargo;
        if (onClandestineSale) onClandestineSale(delivered * 100);
        this.brain.gainExp(delivered * 45, this);
        this.brain.deliveredCargos += delivered;
        this.brain.setThoughtBubble("💰 ¡Entregado con éxito!", 120);

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

  updateChild(allNpcs) {
    this.age++;
    this.stateTimer--;

    // Crecimiento a la adultez
    if (this.age > 3000) {
      this.type = 'cultivator';
      this.speed = 0.85;
      this.brain.title = "Joven Cultivador";
      this.brain.setThoughtBubble("🎉 ¡Ya soy mayor de edad! A trabajar la tierra.", 180);
      return;
    }

    // Seguir a los padres si están cerca
    if (this.parentId) {
      const parent = allNpcs.find(n => n.id === this.parentId);
      if (parent) {
        const d = this.distTo(parent);
        if (d > 42) {
          const angle = Math.atan2(parent.y - this.y, parent.x - this.x);
          this.vx = Math.cos(angle) * this.speed;
          this.vy = Math.sin(angle) * this.speed;
          this.updateDirection();
          return;
        }
      }
    }

    // Corretear jugando
    if (this.stateTimer <= 0) {
      this.stateTimer = 45 + Math.floor(Math.random() * 55);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 1.15);
      this.vy = Math.sin(angle) * (this.speed * 1.15);
      this.updateDirection();

      const childThoughts = [
        "¡Mira una mariposa!",
        "¡A que no me atrapas!",
        "¡Qué bonita es la isla!",
        "Tengo hambre, quiero fruta fresca."
      ];
      if (Math.random() < 0.35) {
        this.brain.setThoughtBubble(childThoughts[Math.floor(Math.random() * childThoughts.length)], 90);
      }
    }
  }

  updateMusician(allNpcs) {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 90 + Math.floor(Math.random() * 90);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.8);
      this.vy = Math.sin(angle) * (this.speed * 0.8);
      this.updateDirection();

      // Música pacifista estilo Bob Marley que calma a los aldeanos
      const lyrics = [
        "🎶 Don't worry about a thing...",
        "🎶 One love, one heart, let's get together...",
        "🎶 Vibra positiva para la isla...",
        "🎶 La música cura las penas del alma..."
      ];
      this.brain.setThoughtBubble(lyrics[Math.floor(Math.random() * lyrics.length)], 110);

      // Calmar y dar energía a gente cercana
      allNpcs.filter(n => n.id !== this.id && this.distTo(n) < 70).forEach(n => {
        n.brain.fear = Math.max(0, n.brain.fear - 15);
        n.brain.energy = Math.min(100, n.brain.energy + 8);
      });
    }
  }

  updateFisherman(grid, tileSize) {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 110 + Math.floor(Math.random() * 90);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.7);
      this.vy = Math.sin(angle) * (this.speed * 0.7);
      this.updateDirection();

      const fishermanThoughts = [
        "🎣 Buscando buena pesca en la orilla...",
        "🐟 Hoy el cardumen está abundante.",
        "🌊 El mar da de comer a los hombres de fe.",
        "🧺 Llevaré pescado fresco al pueblo."
      ];
      if (Math.random() < 0.4) {
        this.brain.setThoughtBubble(fishermanThoughts[Math.floor(Math.random() * fishermanThoughts.length)], 100);
      }
    }
  }

  updateProphet(allNpcs) {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 120 + Math.floor(Math.random() * 80);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.6);
      this.vy = Math.sin(angle) * (this.speed * 0.6);
      this.updateDirection();

      const preachings = [
        "🕊️ La paz sea con todos vosotros.",
        "✨ Bienaventurados los pacificadores.",
        "🙏 No temáis a las tempestades.",
        "🌾 El amor es más fuerte que cualquier rencor."
      ];
      this.brain.setThoughtBubble(preachings[Math.floor(Math.random() * preachings.length)], 120);

      // Aumentar fe de testigos cercanos
      allNpcs.filter(n => n.id !== this.id && this.distTo(n) < 75).forEach(n => {
        n.brain.faith = Math.min(100, n.brain.faith + 10);
        n.brain.fear = Math.max(0, n.brain.fear - 10);
      });
    }
  }

  updateCivilian() {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 100 + Math.floor(Math.random() * 80);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.75);
      this.vy = Math.sin(angle) * (this.speed * 0.75);
      this.updateDirection();
    }
  }

  // 👮‍♂️ 1. POLICÍA DE CUADRANTE / TRÁNSITO
  updatePoliceCuadrante(grid, allNpcs, tileSize) {
    this.stateTimer--;

    // Buscar mototaxis o gente con cargamento para "pedir pa la gaseosa"
    const target = allNpcs.find(n => n.id !== this.id && (n.type === 'mototaxista' || n.cargo > 0) && this.distTo(n) < 70);
    if (target) {
      const d = this.distTo(target);
      if (d > 20) {
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.vx = Math.cos(angle) * (this.speed * 1.25);
        this.vy = Math.sin(angle) * (this.speed * 1.25);
        this.updateDirection();
      } else {
        // En rango de retén / requisar
        if (Math.random() < 0.04) {
          sound.playWhistle();
          sound.playCash();
          this.brain.setThoughtBubble("👮 ¡Páreme ahí! Deje pa' la gaseosa y siga sano.", 140);
          target.brain.setThoughtBubble("💸 ¡Ya me tocó darle pal fresco al cuadrante!", 120);
          if (target.cargo > 0) target.cargo = Math.max(0, target.cargo - 1);
        }
      }
      return;
    }

    // Patrulla por los senderos
    if (this.stateTimer <= 0) {
      this.stateTimer = 90 + Math.floor(Math.random() * 80);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.8);
      this.vy = Math.sin(angle) * (this.speed * 0.8);
      this.updateDirection();
    }
  }

  // 🪖 2. GUERRILLERO DE LA SELVA
  updateGuerrillero(grid, allNpcs, tileSize) {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 110 + Math.floor(Math.random() * 90);
      // Se mantiene rondando la selva o el retén
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.8);
      this.vy = Math.sin(angle) * (this.speed * 0.8);
      this.updateDirection();

      // Si hay campesinos cerca, los llama a comer o les habla de la revolución
      const nearbyPeasant = allNpcs.find(n => n.id !== this.id && n.type === 'cultivator' && this.distTo(n) < 60);
      if (nearbyPeasant && Math.random() < 0.3) {
        this.brain.setThoughtBubble("🪖 ¡Compañero, acérquese a la olla por su plato de sancocho!", 140);
      }
    }
  }

  // 🛵 3. MOTOTAXISTA SUICIDA
  updateMototaxista(grid, allNpcs, tileSize) {
    this.stateTimer--;

    // Si ve a la policía del cuadrante cerca, mete turbo y huye
    const cop = allNpcs.find(n => (n.type === 'police' || n.type === 'police_cuadrante') && this.distTo(n) < 65);
    if (cop) {
      const angle = Math.atan2(this.y - cop.y, this.x - cop.x);
      this.vx = Math.cos(angle) * (this.speed * 1.5);
      this.vy = Math.sin(angle) * (this.speed * 1.5);
      this.updateDirection();
      if (Math.random() < 0.05) {
        sound.playMotorbike();
        this.brain.setThoughtBubble("🛵 ¡Fuga que me quitan la moto!", 90);
      }
      return;
    }

    // Piques y recorridos rápidos por la trocha
    if (this.stateTimer <= 0) {
      this.stateTimer = 45 + Math.floor(Math.random() * 55);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.updateDirection();

      if (Math.random() < 0.25) {
        sound.playMotorbike();
      }
    }
  }

  // 📢 4. VENDEDOR AMBULANTE DE AGUACATES / MAZAMORRA
  updateVendedor(grid, allNpcs, tileSize) {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 90 + Math.floor(Math.random() * 90);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.7);
      this.vy = Math.sin(angle) * (this.speed * 0.7);
      this.updateDirection();

      // Cada cierto tiempo suena el pregón con megáfono
      if (Math.random() < 0.35) {
        sound.playMegaphone();
        const yells = [
          "📢 ¡Llegaron los aguacates maduritos!",
          "📢 ¡Mazamorra fresca con dulce de guayaba!",
          "📢 ¡A dos mil el paquete de plátano!"
        ];
        this.brain.setThoughtBubble(yells[Math.floor(Math.random() * yells.length)], 130);

        // Los vecinos cercanos sienten apetito o van hacia él
        allNpcs.filter(n => n.id !== this.id && this.distTo(n) < 50).forEach(n => {
          n.brain.energy = Math.min(100, n.brain.energy + 5);
        });
      }
    }
  }

  // 👵 5. DOÑA GLORIA (LA VECINA CHISMOSA)
  updateVecinaChismosa(allNpcs) {
    this.stateTimer--;

    // Seguir a los sospechosos o mototaxis para fijarse en todo
    const suspect = allNpcs.find(n => n.id !== this.id && (n.cargo > 0 || n.type === 'mototaxista') && this.distTo(n) < 70);
    if (suspect && Math.random() < 0.6) {
      const angle = Math.atan2(suspect.y - this.y, suspect.x - this.x);
      this.vx = Math.cos(angle) * (this.speed * 0.9);
      this.vy = Math.sin(angle) * (this.speed * 0.9);
      this.updateDirection();
      if (Math.random() < 0.03) {
        sound.playSlap();
        this.brain.setThoughtBubble("👵 ¡Miren a ese vago con cara de malandrín!", 130);
      }
      return;
    }

    if (this.stateTimer <= 0) {
      this.stateTimer = 90 + Math.floor(Math.random() * 80);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.7);
      this.vy = Math.sin(angle) * (this.speed * 0.7);
      this.updateDirection();
    }
  }

  // 🎩 6. DOCTOR PROMESAS (EL ALCALDE)
  updateAlcalde(allNpcs) {
    this.stateTimer--;
    if (this.stateTimer <= 0) {
      this.stateTimer = 110 + Math.floor(Math.random() * 90);
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * (this.speed * 0.6);
      this.vy = Math.sin(angle) * (this.speed * 0.6);
      this.updateDirection();

      // Saluda y reparte promesas
      const speeches = [
        "🎩 ¡Compatriotas, el puente se inaugurará en mi periodo!",
        "🎩 ¡Un tamal caliente para cada familia del municipio!",
        "🎩 ¡La platica está rindiendo gracias a mi gestión!",
        "🎩 ¡Sonrían para la foto de campaña!"
      ];
      this.brain.setThoughtBubble(speeches[Math.floor(Math.random() * speeches.length)], 130);

      // Los aldeanos cercanos lo aplauden o se alegran
      allNpcs.filter(n => n.id !== this.id && this.distTo(n) < 60).forEach(n => {
        n.brain.fear = Math.max(0, n.brain.fear - 10);
      });
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
