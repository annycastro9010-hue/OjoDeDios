import { ELEM } from '../sim/elements.js';

export class MapGenerator {
  static generate(grid, type = 'biblical') {
    grid.grid.fill(ELEM.EMPTY);
    grid.life.fill(0);
    grid.buildingLocations = [];

    const w = grid.width;
    const h = grid.height;
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    if (type === 'biblical') {
      this.generateBiblical(grid, w, h, cx, cy);
    } else if (type === 'seventies' || type === 'valley') {
      this.generateSeventies(grid, w, h, cx, cy);
    } else if (type === 'eighties' || type === 'archipelago') {
      this.generateEighties(grid, w, h, cx, cy);
    } else if (type === 'forties' || type === 'volcano') {
      this.generateForties(grid, w, h, cx, cy);
    } else if (type === 'colombia') {
      this.generateColombia(grid, w, h, cx, cy);
    } else if (type === 'genesis') {
      this.generateGenesis(grid, w, h, cx, cy);
    } else {
      this.generateBiblical(grid, w, h, cx, cy);
    }
  }

  // 1. 📜 ERA BÍBLICA: Los Primeros Humanos tras el Edén, Monte del Altar y Oasis
  static generateBiblical(grid, w, h, cx, cy) {
    // Terreno base: Oasis fértil rodeado de desierto y cordillera
    const radiusX = Math.floor(w * 0.42);
    const radiusY = Math.floor(h * 0.38);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const noise = Math.sin(x * 0.18) * 0.07 + Math.cos(y * 0.22) * 0.07;

        if (dist + noise < 0.32) {
          // Valle central del Edén: Tierra muy fértil y cultivos
          grid.set(x, y, ELEM.FERTILE_DIRT);
          if (Math.random() < 0.12) grid.set(x, y, ELEM.PLANT_BLOOM);
        } else if (dist + noise < 0.58) {
          // Llanuras agrícolas de Caín y pastoreo de Abel
          grid.set(x, y, ELEM.DIRT);
          if (Math.random() < 0.05) grid.set(x, y, ELEM.WOOD);
        } else if (dist + noise < 0.78) {
          // Desierto dorado circundante (Tierra de Nod)
          grid.set(x, y, ELEM.SAND);
        } else {
          // Gran Mar Primordial
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // Río Sagrado de las Aguas Vivas (Jordán) que cruza el oasis
    for (let y = 0; y < h; y++) {
      const riverX = cx + Math.floor(Math.sin(y * 0.12) * 14 - 8);
      for (let rx = riverX - 3; rx <= riverX + 3; rx++) {
        if (rx >= 0 && rx < w) {
          grid.set(rx, y, ELEM.WATER);
        }
      }
      // Orillas húmedas
      grid.set(riverX - 4, y, ELEM.FERTILE_DIRT);
      grid.set(riverX + 4, y, ELEM.FERTILE_DIRT);
    }

    // Puentes sagrados de troncos y piedra
    const b1 = cy - 14;
    const b2 = cy + 14;
    for (let bx = cx - 18; bx <= cx - 2; bx++) {
      grid.set(bx, b1, ELEM.ROAD);
      grid.set(bx, b1 + 1, ELEM.ROAD);
      grid.set(bx, b2, ELEM.ROAD);
      grid.set(bx, b2 + 1, ELEM.ROAD);
    }

    // 🏔️ Monte del Altar Sagrado de Dios (Centro Ceremonial)
    const altarX = cx + 18;
    const altarY = cy - 6;
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 4) {
          grid.set(altarX + dx, altarY + dy, ELEM.STONE);
        }
      }
    }
    // Altar con reliquia de oro en la cima
    grid.set(altarX, altarY, ELEM.GOLD);
    grid.set(altarX, altarY - 1, ELEM.CAMPFIRE); // Fuego sagrado
    grid.buildingLocations.push({ x: altarX, y: altarY, name: "Altar Sagrado a Dios" });

    // 🏡 Aldea Primitiva de Casas de Arcilla y Adobe
    grid.createBuilding(cx - 26, cy - 8, 7, 5);
    grid.buildingLocations.push({ x: cx - 23, y: cy - 6, name: "Hogar de Adán y Eva" });

    grid.createBuilding(cx - 28, cy + 10, 6, 5);
    grid.buildingLocations.push({ x: cx - 25, y: cy + 12, name: "Cabaña de Caín" });

    // Pozo comunal de agua bendita
    grid.set(cx - 18, cy + 3, ELEM.STONE);
    grid.set(cx - 17, cy + 3, ELEM.WATER);
    grid.set(cx - 16, cy + 3, ELEM.STONE);
    grid.buildingLocations.push({ x: cx - 17, y: cy + 3, name: "Pozo de la Vida" });

    // Senderos de tierra apisonada que conectan la aldea
    for (let x = cx - 26; x <= altarX; x++) {
      grid.set(x, cy, ELEM.ROAD);
    }
  }

  // 2. ☮️ AÑOS 70: Comuna de Paz, Gran Escenario de Bob Marley y Huertos Libres
  static generateSeventies(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wobble = Math.sin(x * 0.2) * 0.08 + Math.cos(y * 0.2) * 0.08;

        if (dist + wobble < 0.45) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
          if (Math.random() < 0.15) grid.set(x, y, ELEM.PLANT_BLOOM);
        } else if (dist + wobble < 0.72) {
          grid.set(x, y, ELEM.DIRT);
          if (Math.random() < 0.04) grid.set(x, y, ELEM.WOOD);
        } else {
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // Lago de Meditación y Paz en el este
    for (let dy = -7; dy <= 7; dy++) {
      for (let dx = -7; dx <= 7; dx++) {
        if (dx * dx + dy * dy < 45) {
          grid.set(cx + 28 + dx, cy + 8 + dy, ELEM.WATER);
        }
      }
    }
    grid.buildingLocations.push({ x: cx + 28, y: cy + 8, name: "Lago de Meditación" });

    // 🎸 Gran Escenario Musical de Madera en el Centro
    const stageX = cx - 6;
    const stageY = cy - 8;
    for (let sy = 0; sy < 7; sy++) {
      for (let sx = 0; sx < 14; sx++) {
        grid.set(stageX + sx, stageY + sy, ELEM.ROAD); // Madera del escenario
      }
    }
    grid.set(stageX + 1, stageY + 1, ELEM.CAMPFIRE);
    grid.set(stageX + 12, stageY + 1, ELEM.CAMPFIRE);
    grid.buildingLocations.push({ x: stageX + 7, y: stageY + 3, name: "Escenario de Bob Marley" });

    // 🏕️ Círculo de Cabañas y Carpas de la Comuna
    const tents = [
      { x: cx - 25, y: cy - 14, name: "Carpa Sanadora" },
      { x: cx - 30, y: cy + 4, name: "Comuna de Paz" },
      { x: cx - 18, y: cy + 16, name: "Taller de Guitarras" },
      { x: cx + 12, y: cy + 18, name: "Huerto Ecológico" }
    ];

    tents.forEach(t => {
      grid.createBuilding(t.x, t.y, 6, 5);
      grid.buildingLocations.push({ x: t.x + 2, y: t.y + 2, name: t.name });
    });

    // Gran Fogata Comunitaria central
    grid.set(cx, cy + 6, ELEM.CAMPFIRE);
    grid.buildingLocations.push({ x: cx, y: cy + 6, name: "Fogata de la Paz" });
  }

  // 3. 💰 AÑOS 80: Hacienda del Patrón, Piscina, Pista de Aterrizaje y Muelles
  static generateEighties(grid, w, h, cx, cy) {
    grid.initWorld(); // Isla base orgánica

    // 🏰 Hacienda del Patrón (Norte)
    const mX = cx - 20;
    const mY = cy - 25;
    grid.createBuilding(mX, mY, 14, 9);
    grid.buildingLocations.push({ x: mX + 5, y: mY + 4, name: "Mansión del Patrón" });

    // 🏊 Piscina privada azulejada de agua azul
    for (let py = 0; py < 5; py++) {
      for (let px = 0; px < 8; px++) {
        grid.set(mX + 18 + px, mY + 2 + py, ELEM.WATER);
      }
    }
    grid.buildingLocations.push({ x: mX + 22, y: mY + 4, name: "Piscina del Capo" });

    // ✈️ Pista de Aterrizaje Clandestina (Recta de asfalto)
    const runX = cx - 35;
    const runY = cy + 12;
    for (let rx = 0; rx < 45; rx++) {
      grid.set(runX + rx, runY, ELEM.ROAD);
      grid.set(runX + rx, runY + 1, ELEM.ROAD);
      grid.set(runX + rx, runY + 2, ELEM.ROAD);
    }
    grid.buildingLocations.push({ x: runX + 22, y: runY + 1, name: "Pista de Aterrizaje" });

    // Hangar y Almacén Clandestino junto a la pista
    grid.createBuilding(runX + 46, runY - 2, 8, 6);
    grid.buildingLocations.push({ x: runX + 49, y: runY + 1, name: "Hangar Clandestino" });

    // Muelle secreto al sur
    const dockX = cx + 8;
    const dockY = cy + 26;
    grid.createBuilding(dockX, dockY, 7, 5);
    grid.buildingLocations.push({ x: dockX + 3, y: dockY + 2, name: "Muelle de Lanchas" });
  }

  // 4. ⚔️ AÑOS 40: Bastión de Guerra, Trincheras y Hospital de Campaña
  static generateForties(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.42);
    const radiusY = Math.floor(h * 0.38);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wobble = Math.sin(x * 0.22) * 0.06;

        if (dist + wobble < 0.45) {
          grid.set(x, y, ELEM.DIRT);
        } else if (dist + wobble < 0.7) {
          grid.set(x, y, Math.random() < 0.5 ? ELEM.DIRT : ELEM.ASH);
        } else {
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // 🪖 Búnker de Mando Central
    const bkX = cx - 8;
    const bkY = cy - 14;
    for (let by = 0; by < 7; by++) {
      for (let bx = 0; bx < 16; bx++) {
        grid.set(bkX + bx, bkY + by, ELEM.STONE);
      }
    }
    // Entrada del búnker
    grid.set(bkX + 7, bkY + 6, ELEM.ROAD);
    grid.set(bkX + 8, bkY + 6, ELEM.ROAD);
    grid.buildingLocations.push({ x: bkX + 8, y: bkY + 3, name: "Búnker de Mando" });

    // 🛡️ Red de Trincheras en zigzag
    const tY1 = cy + 2;
    const tY2 = cy + 12;
    for (let x = cx - 35; x <= cx + 35; x++) {
      const zig = (Math.floor(x / 4) % 2 === 0) ? 0 : 2;
      grid.set(x, tY1 + zig, ELEM.ROAD);
      grid.set(x, tY1 + zig - 1, ELEM.STONE); // Sacos de arena
      grid.set(x, tY2 + zig, ELEM.ROAD);
    }
    grid.buildingLocations.push({ x: cx, y: tY1, name: "Línea de Trincheras" });

    // 🏥 Hospital de Campaña de la Cruz Roja
    grid.createBuilding(cx - 30, cy - 8, 8, 6);
    grid.buildingLocations.push({ x: cx - 26, y: cy - 5, name: "Hospital Militar" });

    // Almacén de Munición y Radio
    grid.createBuilding(cx + 20, cy - 8, 8, 6);
    grid.buildingLocations.push({ x: cx + 24, y: cy - 5, name: "Estación de Radio" });
  }

  // 5. 🌌 GÉNESIS: Océano Infinito y Monolito Primordial
  static generateGenesis(grid, w, h, cx, cy) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        grid.set(x, y, ELEM.WATER);
      }
    }
    // Isla sagrada inicial donde comenzará la civilización
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (dx * dx + dy * dy < 16) {
          grid.set(cx + dx, cy + dy, ELEM.FERTILE_DIRT);
        }
      }
    }
    grid.set(cx, cy, ELEM.GOLD);
    grid.set(cx, cy - 1, ELEM.CAMPFIRE);
    grid.set(cx, cy + 1, ELEM.PLANT_BLOOM);
    grid.buildingLocations.push({ x: cx, y: cy, name: "Monolito Primordial" });
  }

  // 6. 🇨🇴 REALIDAD MACONDO: Selva húmeda, trochas de barro, retenes clandestinos y cuadrante
  static generateColombia(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    // Relieve montañoso selvático
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const noise = Math.sin(x * 0.22) * 0.08 + Math.cos(y * 0.26) * 0.08;

        if (dist + noise < 0.45) {
          // Selva espesa con vegetación, árboles y platanales
          grid.set(x, y, ELEM.FERTILE_DIRT);
          if (Math.random() < 0.14) grid.set(x, y, ELEM.PLANT_BLOOM);
          if (Math.random() < 0.06) grid.set(x, y, ELEM.WOOD);
        } else if (dist + noise < 0.75) {
          // Llanura de pastizales y barro
          grid.set(x, y, ELEM.DIRT);
          if (Math.random() < 0.04) grid.set(x, y, ELEM.WOOD);
        } else {
          // Río caudaloso circundante y ciénagas
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // Gran Río Sinuoso (tipo Magdalena / Atrato) que cruza el mapa
    for (let y = 0; y < h; y++) {
      const riverX = cx + Math.floor(Math.sin(y * 0.1) * 16 - 12);
      for (let rx = riverX - 3; rx <= riverX + 3; rx++) {
        if (rx >= 0 && rx < w) {
          grid.set(rx, y, ELEM.WATER);
        }
      }
      grid.set(riverX - 4, y, ELEM.FERTILE_DIRT);
      grid.set(riverX + 4, y, ELEM.FERTILE_DIRT);
    }

    // Trocha Principal de Barro y Mula (conecta el pueblo con la selva)
    for (let x = cx - 35; x <= cx + 35; x++) {
      const ty = cy + Math.floor(Math.sin(x * 0.08) * 6);
      grid.set(x, ty, ELEM.ROAD);
      grid.set(x, ty + 1, ELEM.ROAD);
      if (Math.random() < 0.15) grid.set(x, ty + 1, ELEM.DIRT); // Barro en la trocha
    }

    // Puente de troncos improvisado sobre el río
    const bridgeY = cy + 2;
    for (let bx = cx - 20; bx <= cx - 5; bx++) {
      grid.set(bx, bridgeY, ELEM.ROAD);
      grid.set(bx, bridgeY + 1, ELEM.ROAD);
    }

    // 🪖 1. Cambuche Guerrillero en el Monte (Olla del sancocho y cambuche)
    const campX = cx + 22;
    const campY = cy - 14;
    grid.createBuilding(campX, campY, 8, 6);
    grid.set(campX + 3, campY + 2, ELEM.CAMPFIRE); // La olla comunitaria
    grid.set(campX + 4, campY + 2, ELEM.WOOD);
    grid.buildingLocations.push({ x: campX + 4, y: campY + 2, name: "Campamento del Monte" });

    // 🛑 2. Retén Clandestino en la Trocha (barricada de troncos)
    const retenX = cx + 8;
    const retenY = cy + Math.floor(Math.sin(retenX * 0.08) * 6);
    grid.set(retenX, retenY - 2, ELEM.WOOD);
    grid.set(retenX, retenY + 3, ELEM.WOOD);
    grid.buildingLocations.push({ x: retenX, y: retenY, name: "Retén en la Trocha" });

    // 👮‍♂️ 3. Puesto de Policía del Cuadrante y Alcaldía
    const townX = cx - 28;
    const townY = cy - 12;
    grid.createBuilding(townX, townY, 9, 6);
    grid.buildingLocations.push({ x: townX + 4, y: townY + 3, name: "Puesto del Cuadrante" });

    // 🏪 4. Tienda de Doña Gloria y Billar
    const storeX = cx - 26;
    const storeY = cy + 8;
    grid.createBuilding(storeX, storeY, 8, 6);
    grid.buildingLocations.push({ x: storeX + 4, y: storeY + 3, name: "Tienda y Billar" });

    // 🛶 5. Muelle de Canoas en el Río
    const dockX = cx - 8;
    const dockY = cy + 18;
    for (let dy = 0; dy < 3; dy++) {
      grid.set(dockX + dy, dockY, ELEM.WOOD);
      grid.set(dockX + dy, dockY + 1, ELEM.ROAD);
    }
    grid.buildingLocations.push({ x: dockX + 1, y: dockY, name: "Muelle de Canoas" });
  }
}
