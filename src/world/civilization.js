import { ELEM } from '../sim/elements.js';
import { chronicles } from '../social/relations.js';
import { sound } from '../audio/soundFX.js';
import { vfx } from '../render/fx.js';

export class CivilizationSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.wood = 25;
    this.stone = 15;
    this.food = 30;
    this.knowledge = 10;
    this.level = 1; // 1: Nómadas, 2: Aldea, 3: Reino
    this.stageName = 'Tribu Primitiva';
    this.leaderId = null;

    // Descubrimientos de la humanidad
    this.discoveries = {
      fire: true,
      agriculture: false,
      masonry: false,
      animalHusbandry: false,
      temple: false
    };

    // Edificios construidos por los aldeanos
    this.villages = [];
    this.buildTimer = 0;
  }

  addResource(type, amount) {
    if (type === 'wood') this.wood += amount;
    if (type === 'stone') this.stone += amount;
    if (type === 'food') this.food += amount;
    if (type === 'knowledge') this.knowledge += amount;

    this.checkEvolution();
  }

  checkEvolution() {
    if (!this.discoveries.agriculture && this.knowledge >= 25 && this.food >= 20) {
      this.discoveries.agriculture = true;
      chronicles.add('🌱 ¡DESCUBRIMIENTO! La tribu ha aprendido a sembrar semillas y regar cultivos.', 'evolution');
    }

    if (!this.discoveries.masonry && this.knowledge >= 50 && this.stone >= 30) {
      this.discoveries.masonry = true;
      chronicles.add('🧱 ¡DESCUBRIMIENTO! Los aldeanos dominan la mampostería y construirán casas de piedra sólida.', 'evolution');
    }

    if (!this.discoveries.animalHusbandry && this.knowledge >= 70) {
      this.discoveries.animalHusbandry = true;
      chronicles.add('🐾 ¡DESCUBRIMIENTO! La humanidad ha domesticado a los animales como compañeros leales.', 'evolution');
    }

    if (!this.discoveries.temple && this.knowledge >= 100 && this.stone >= 50) {
      this.discoveries.temple = true;
      chronicles.add('🏛️ ¡ERA SAGRADA! La civilización ha diseñado su primer Altar y Templo a los Cielos.', 'evolution');
    }

    if (this.level === 1 && this.knowledge >= 40 && this.wood >= 40) {
      this.level = 2;
      this.stageName = 'Aldea Floreciente';
      sound.playAscend();
      chronicles.add('👑 ¡EVOLUCIÓN! La tribu primitiva ha evolucionado en una Aldea Floreciente.', 'evolution');
    } else if (this.level === 2 && this.knowledge >= 90 && this.stone >= 50) {
      this.level = 3;
      this.stageName = 'Reino Próspero';
      sound.playAscend();
      chronicles.add('🏰 ¡EVOLUCIÓN SUPREMA! La aldea se ha coronado como un Reino Próspero con leyes y reyes.', 'evolution');
    }
  }

  update(grid, npcs) {
    this.buildTimer++;
    if (this.buildTimer < 180) return;
    this.buildTimer = 0;

    if (this.wood >= 18) {
      this.planBuilding(grid, npcs, 'house');
    } else if (this.level >= 2 && this.stone >= 25 && !this.hasBuildingType('altar')) {
      this.planBuilding(grid, npcs, 'altar');
    }
  }

  hasBuildingType(type) {
    return this.villages.some(b => b.type === type);
  }

  planBuilding(grid, npcs, type) {
    const cx = Math.floor(grid.width / 2);
    const cy = Math.floor(grid.height / 2);

    for (let attempts = 0; attempts < 30; attempts++) {
      const rx = cx + Math.floor((Math.random() - 0.5) * (grid.width * 0.55));
      const ry = cy + Math.floor((Math.random() - 0.5) * (grid.height * 0.45));

      let valid = true;
      for (let dy = -1; dy <= 6; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const elem = grid.get(rx + dx, ry + dy);
          if (elem === ELEM.WATER || elem === ELEM.BUILDING || elem === ELEM.LAVA || elem === ELEM.STONE) {
            valid = false;
            break;
          }
        }
        if (!valid) break;
      }

      if (valid) {
        if (type === 'house') {
          this.constructHouse(grid, rx, ry);
          this.wood = Math.max(0, this.wood - 18);
        } else if (type === 'altar') {
          this.constructAltar(grid, rx, ry);
          this.stone = Math.max(0, this.stone - 25);
        }
        break;
      }
    }
  }

  constructHouse(grid, bx, by) {
    const w = 6;
    const h = 5;
    const isStone = this.discoveries.masonry;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
          if (y === h - 1 && (x === 2 || x === 3)) {
            grid.set(bx + x, by + y, ELEM.ROAD);
          } else {
            grid.set(bx + x, by + y, ELEM.BUILDING);
          }
        } else {
          grid.set(bx + x, by + y, ELEM.ROAD);
        }
      }
    }

    for (let s = -2; s <= 2; s++) {
      grid.set(bx + 2, by + h + s, ELEM.ROAD);
    }

    const houseName = isStone ? 'Casa de Piedra' : 'Choza de Madera';
    this.villages.push({ x: bx, y: by, type: 'house', name: houseName });
    grid.buildingLocations.push({ x: bx + 1, y: by + 1, name: houseName });

    sound.playPlant();
    vfx.addShockwave((bx + 3) * 8, (by + 2) * 8, 30, '#eab308');
    chronicles.add(`🏡 ¡NUEVA CASA! Los aldeanos han construido una ${houseName}.`, 'build');
  }

  constructAltar(grid, bx, by) {
    const size = 5;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
          grid.set(bx + x, by + y, ELEM.STONE);
        } else if (x === 2 && y === 2) {
          grid.set(bx + x, by + y, ELEM.GOLD);
        } else {
          grid.set(bx + x, by + y, ELEM.ROAD);
        }
      }
    }

    this.villages.push({ x: bx, y: by, type: 'altar', name: 'Altar Ceremonial' });
    grid.buildingLocations.push({ x: bx + 1, y: by + 1, name: 'Altar a Dios' });

    sound.playAscend();
    vfx.addShockwave((bx + 2) * 8, (by + 2) * 8, 40, '#ffd700');
    chronicles.add('✨ ¡TEMPLO ERIGIDO! Los creyentes han consagrado un gran Altar a Dios.', 'divine');
  }
}

export const civ = new CivilizationSystem();
