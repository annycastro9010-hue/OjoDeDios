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
    } else if (type === 'hyrule' || type === 'minish') {
      this.generateHyrule(grid, w, h, cx, cy);
    } else if (type === 'genesis') {
      this.generateGenesis(grid, w, h, cx, cy);
    } else {
      this.generateBiblical(grid, w, h, cx, cy);
    }
  }

  // 1. 📜 ERA BÍBLICA: Los Primeros Humanos tras el Edén, Monte del Altar y Oasis
  static generateBiblical(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const noise = Math.sin(x * 0.18) * 0.07 + Math.cos(y * 0.22) * 0.07;

        if (dist + noise < 0.35) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
        } else if (dist + noise < 0.65) {
          grid.set(x, y, ELEM.DIRT);
        } else if (dist + noise < 0.76) {
          grid.set(x, y, ELEM.SAND); // Arena dorada costera
        } else {
          grid.set(x, y, ELEM.WATER); // Mar Primordial
        }
      }
    }

    // Río Sagrado de las Aguas Vivas (Jordán)
    for (let y = 0; y < h; y++) {
      const riverX = cx + Math.floor(Math.sin(y * 0.12) * 14 - 10);
      for (let rx = riverX - 3; rx <= riverX + 3; rx++) {
        if (rx >= 0 && rx < w) {
          grid.set(rx, y, ELEM.WATER);
        }
      }
      grid.set(riverX - 4, y, ELEM.FERTILE_DIRT);
      grid.set(riverX + 4, y, ELEM.FERTILE_DIRT);
    }

    // Puentes de piedra Minish Cap
    const b1 = cy - 14;
    const b2 = cy + 14;
    for (let bx = cx - 20; bx <= cx - 4; bx++) {
      grid.set(bx, b1, ELEM.ROAD);
      grid.set(bx, b1 + 1, ELEM.ROAD);
      grid.set(bx, b2, ELEM.ROAD);
      grid.set(bx, b2 + 1, ELEM.ROAD);
    }

    // 🏔️ Monte del Altar Elevado (Acantilado Minish Cap con Escalera)
    const altarX = cx + 18;
    const altarY = cy - 8;
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        grid.set(altarX + dx, altarY + dy, ELEM.FERTILE_DIRT);
      }
    }
    // Muros de piedra perimetrales
    for (let dx = -6; dx <= 6; dx++) {
      grid.set(altarX + dx, altarY + 4, ELEM.CLIFF);
      grid.set(altarX + dx, altarY - 4, ELEM.CLIFF);
    }
    for (let dy = -4; dy <= 4; dy++) {
      grid.set(altarX - 6, altarY + dy, ELEM.CLIFF);
      grid.set(altarX + 6, altarY + dy, ELEM.CLIFF);
    }
    // Escalera de madera para subir al monte sagrado
    grid.set(altarX, altarY + 4, ELEM.LADDER);
    grid.set(altarX, altarY, ELEM.GOLD);
    grid.set(altarX, altarY - 1, ELEM.CAMPFIRE);
    grid.buildingLocations.push({ x: altarX, y: altarY, name: "Altar Sagrado en el Monte" });

    // 🌳 Huerto Sagrado del Edén (Árboles Minish con frutos dorados)
    for (let tx = cx - 28; tx <= cx - 10; tx += 6) {
      grid.set(tx, cy - 16, ELEM.TREE);
    }
    grid.set(altarX - 4, altarY - 2, ELEM.TREE);
    grid.set(altarX + 4, altarY - 2, ELEM.TREE);

    // 🪵 Cercas de madera Minish
    for (let fx = cx - 26; fx <= cx - 6; fx++) {
      grid.set(fx, cy + 6, ELEM.FENCE);
    }

    // 🏡 Aldea de Arcilla de Adán y Caín (Estilo Minish Cap)
    grid.createBuilding(cx - 26, cy - 8, 8, 6, "Hogar de Adán y Eva", { roofColor: 'yellow' });
    grid.createBuilding(cx - 28, cy + 10, 7, 5, "Cabaña de Caín", { roofColor: 'red' });

    // Jardineras y huertos floridos Minish
    grid.set(cx - 26, cy - 2, ELEM.FLOWER_BED);
    grid.set(cx - 19, cy - 2, ELEM.FLOWER_BED);
    grid.set(altarX - 3, altarY + 2, ELEM.FLOWER_BED);
    grid.set(altarX + 3, altarY + 2, ELEM.FLOWER_BED);

    // Pozo de piedra
    grid.set(cx - 16, cy + 2, ELEM.STONE);
    grid.set(cx - 15, cy + 2, ELEM.WATER);
    grid.set(cx - 14, cy + 2, ELEM.STONE);
    grid.buildingLocations.push({ x: cx - 15, y: cy + 2, name: "Pozo de la Vida" });

    // Caminos de adoquines
    for (let x = cx - 26; x <= altarX; x++) {
      grid.set(x, cy, ELEM.ROAD);
    }
  }

  // 2. ☮️ AÑOS 70: Comuna de Paz, Gran Escenario de Bob Marley y Festival
  static generateSeventies(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wobble = Math.sin(x * 0.18) * 0.08 + Math.cos(y * 0.18) * 0.08;

        if (dist + wobble < 0.68) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
        } else {
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // 🧱 Terraza de Acantilado Norte con Escalera de Madera
    const cliffY = cy - 16;
    for (let x = cx - 26; x <= cx + 24; x++) {
      grid.set(x, cliffY, ELEM.CLIFF);
    }
    grid.set(cx - 10, cliffY, ELEM.LADDER);
    grid.set(cx + 12, cliffY, ELEM.LADDER);

    // 🌳 Bosquecillo de Árboles Minish Cap con Flores y Manzanas
    for (let x = cx - 24; x <= cx + 22; x += 6) {
      grid.set(x, cliffY - 4, ELEM.TREE);
    }
    for (let y = cy - 8; y <= cy + 16; y += 6) {
      grid.set(cx - 28, y, ELEM.TREE);
      grid.set(cx + 28, y, ELEM.TREE);
    }

    // Lago de Meditación Minish Cap
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        if (dx * dx + dy * dy < 32) {
          grid.set(cx + 22 + dx, cy + 4 + dy, ELEM.WATER);
        }
      }
    }
    grid.buildingLocations.push({ x: cx + 22, y: cy + 4, name: "Lago de Meditación" });

    // 🎸 Gran Escenario Musical de Madera en el Centro
    const stageX = cx - 8;
    const stageY = cy - 8;
    for (let sy = 0; sy < 8; sy++) {
      for (let sx = 0; sx < 16; sx++) {
        grid.set(stageX + sx, stageY + sy, ELEM.ROAD);
      }
    }
    grid.set(stageX + 1, stageY + 1, ELEM.CAMPFIRE);
    grid.set(stageX + 14, stageY + 1, ELEM.CAMPFIRE);
    grid.buildingLocations.push({ x: stageX + 8, y: stageY + 4, name: "Escenario de Bob Marley" });

    // 🪵 Cercas de madera Minish
    for (let x = cx - 18; x <= cx - 2; x++) {
      grid.set(x, cy + 12, ELEM.FENCE);
    }
    for (let x = cx + 2; x <= cx + 18; x++) {
      grid.set(x, cy + 12, ELEM.FENCE);
    }

    // 🏕️ Carpas de la Comuna
    grid.createBuilding(cx - 22, cy - 6, 7, 5, "Carpa Sanadora", { roofColor: 'purple' });
    grid.createBuilding(cx - 20, cy + 14, 7, 5, "Comuna de Paz", { roofColor: 'green' });

    // Jardineras floridas alrededor del escenario musical
    grid.set(stageX - 2, stageY + 3, ELEM.FLOWER_BED);
    grid.set(stageX + 17, stageY + 3, ELEM.FLOWER_BED);
    grid.set(cx - 15, cy - 1, ELEM.FLOWER_BED);
    grid.set(cx + 15, cy - 1, ELEM.FLOWER_BED);

    // Caminos de adoquines
    for (let x = cx - 24; x <= cx + 20; x++) {
      grid.set(x, cy + 2, ELEM.ROAD);
    }
    for (let y = cy - 8; y <= cy + 16; y++) {
      grid.set(cx, y, ELEM.ROAD);
    }

    // Gran Fogata Comunitaria central
    grid.set(cx, cy + 6, ELEM.CAMPFIRE);
    grid.buildingLocations.push({ x: cx, y: cy + 6, name: "Fogata de la Paz" });
  }

  // 3. 💰 AÑOS 80: Hacienda del Patrón, Piscina, Pista de Aterrizaje y Muelles
  static generateEighties(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wobble = Math.sin(x * 0.16) * 0.07;

        if (dist + wobble < 0.68) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
        } else {
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // 🧱 Muro / Acantilado Perimetral de la Hacienda con Escaleras
    const wallY = cy - 14;
    for (let x = cx - 30; x <= cx + 26; x++) {
      grid.set(x, wallY, ELEM.CLIFF);
    }
    grid.set(cx - 12, wallY, ELEM.LADDER);
    grid.set(cx + 14, wallY, ELEM.LADDER);

    // 🌳 Palmeras y Árboles Minish Cap
    for (let x = cx - 28; x <= cx + 24; x += 6) {
      grid.set(x, wallY - 4, ELEM.TREE);
    }
    for (let y = cy - 4; y <= cy + 18; y += 6) {
      grid.set(cx - 30, y, ELEM.TREE);
    }

    // 🏰 Mansión del Patrón (Estilo Cantería Minish Cap)
    const mX = cx - 18;
    const mY = cy - 24;
    grid.createBuilding(mX, mY, 14, 8, "Mansión del Patrón", { style: 'mansion' });

    // 🏊 Piscina con relieve Minish Cap
    for (let py = 0; py < 5; py++) {
      for (let px = 0; px < 8; px++) {
        grid.set(mX + 18 + px, mY + 1 + py, ELEM.WATER);
      }
    }
    grid.buildingLocations.push({ x: mX + 22, y: mY + 3, name: "Piscina del Capo" });

    // Jardineras señoriales junto a la piscina y la entrada
    grid.set(mX + 18, mY + 7, ELEM.FLOWER_BED);
    grid.set(mX + 25, mY + 7, ELEM.FLOWER_BED);
    grid.set(mX - 2, mY + 6, ELEM.FLOWER_BED);

    // ✈️ Pista de Aterrizaje de Adoquines y Asfalto
    const runX = cx - 25;
    const runY = cy + 12;
    for (let rx = 0; rx < 38; rx++) {
      grid.set(runX + rx, runY, ELEM.ROAD);
      grid.set(runX + rx, runY + 1, ELEM.ROAD);
      grid.set(runX + rx, runY + 2, ELEM.ROAD);
    }
    grid.buildingLocations.push({ x: runX + 19, y: runY + 1, name: "Pista de Aterrizaje" });

    // Hangar y Muelle
    grid.createBuilding(runX + 40, runY - 2, 8, 6, "Hangar Clandestino", { roofColor: 'stone' });

    // 🪵 Cercas de la hacienda
    for (let x = cx - 20; x <= cx + 20; x++) {
      grid.set(x, cy + 4, ELEM.FENCE);
    }
  }

  // 4. ⚔️ AÑOS 40: Bastión de Guerra, Trincheras y Acantilados
  static generateForties(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.68) {
          grid.set(x, y, ELEM.DIRT);
        } else {
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // 🧱 Riscos Fortificados con Escaleras de Asalto
    const rY = cy - 14;
    for (let x = cx - 28; x <= cx + 28; x++) {
      grid.set(x, rY, ELEM.CLIFF);
    }
    grid.set(cx - 10, rY, ELEM.LADDER);
    grid.set(cx + 10, rY, ELEM.LADDER);

    // 🌳 Árboles Minish en el perímetro
    for (let x = cx - 26; x <= cx + 26; x += 6) {
      grid.set(x, rY - 4, ELEM.TREE);
    }

    // 🪖 Búnker de Mando Fortificado
    const bkX = cx - 8;
    const bkY = cy - 24;
    grid.createBuilding(bkX, bkY, 16, 7, "Búnker de Mando", { style: 'mansion' });

    // 🛡️ Red de Trincheras con Adoquines y Cercas Barricada
    const tY1 = cy + 2;
    for (let x = cx - 30; x <= cx + 30; x++) {
      const zig = (Math.floor(x / 4) % 2 === 0) ? 0 : 2;
      grid.set(x, tY1 + zig, ELEM.ROAD);
      grid.set(x, tY1 + zig - 1, ELEM.FENCE); // Parapeto de vallas
    }
    grid.buildingLocations.push({ x: cx, y: tY1, name: "Línea de Trincheras" });

    // Hospital Militar y Estación de Radio
    grid.createBuilding(cx - 26, cy - 4, 8, 6, "Hospital Militar", { roofColor: 'stone' });
    grid.createBuilding(cx + 18, cy - 4, 8, 6, "Estación de Radio", { roofColor: 'blue' });
  }

  // 5. 🌌 GÉNESIS: Océano Infinito y Monolito Primordial Minish
  static generateGenesis(grid, w, h, cx, cy) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        grid.set(x, y, ELEM.WATER);
      }
    }
    // Isla sagrada con acantilado y árbol primordial
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -8; dx <= 8; dx++) {
        if (dx * dx + dy * dy < 48) {
          grid.set(cx + dx, cy + dy, ELEM.FERTILE_DIRT);
        }
      }
    }
    // Acantilado norte con escalera
    for (let dx = -6; dx <= 6; dx++) {
      grid.set(cx + dx, cy - 3, ELEM.CLIFF);
    }
    grid.set(cx, cy - 3, ELEM.LADDER);

    // Árboles Minish Primordiales
    grid.set(cx - 5, cy - 5, ELEM.TREE);
    grid.set(cx + 5, cy - 5, ELEM.TREE);

    grid.set(cx, cy + 2, ELEM.GOLD);
    grid.set(cx, cy + 1, ELEM.CAMPFIRE);
    grid.buildingLocations.push({ x: cx, y: cy + 2, name: "Monolito Primordial" });
  }

  // 6. 🇨🇴 REALIDAD MACONDO: Selva Minish Cap, Acantilados, Trochas, Retenes y Río
  static generateColombia(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const noise = Math.sin(x * 0.22) * 0.08 + Math.cos(y * 0.26) * 0.08;

        if (dist + noise < 0.68) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
        } else {
          grid.set(x, y, ELEM.WATER);
        }
      }
    }

    // 🧱 Riscos de Selva y Cordillera con Escaleras para Subir al Monte
    const cliffY = cy - 16;
    for (let x = cx - 28; x <= cx + 26; x++) {
      grid.set(x, cliffY, ELEM.CLIFF);
    }
    grid.set(cx + 18, cliffY, ELEM.LADDER); // Escalera al campamento guerrillero
    grid.set(cx - 16, cliffY, ELEM.LADDER);

    // 🌳 Bosques de Árboles Minish Cap Selváticos
    for (let x = cx - 26; x <= cx + 24; x += 6) {
      grid.set(x, cliffY - 4, ELEM.TREE);
    }
    for (let y = cy - 8; y <= cy + 18; y += 6) {
      grid.set(cx - 30, y, ELEM.TREE);
    }

    // Gran Río Sinuoso Minish Cap que cruza el mapa
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

    // Trocha Principal de Adoquines y Barro
    for (let x = cx - 35; x <= cx + 35; x++) {
      const ty = cy + Math.floor(Math.sin(x * 0.08) * 6);
      grid.set(x, ty, ELEM.ROAD);
      grid.set(x, ty + 1, ELEM.ROAD);
    }

    // Puente de madera sobre el río
    const bridgeY = cy + 2;
    for (let bx = cx - 20; bx <= cx - 5; bx++) {
      grid.set(bx, bridgeY, ELEM.ROAD);
      grid.set(bx, bridgeY + 1, ELEM.ROAD);
    }

    // 🪵 Cercas de madera Minish en la trocha y huertos
    for (let fx = cx - 18; fx <= cx - 4; fx++) {
      grid.set(fx, cy + 10, ELEM.FENCE);
    }

    // 🪖 1. Cambuche Guerrillero en el Monte Alto
    const campX = cx + 18;
    const campY = cliffY - 8;
    grid.createBuilding(campX, campY, 8, 5, "Campamento del Monte", { roofColor: 'stone' });
    grid.set(campX + 3, campY + 2, ELEM.CAMPFIRE); // La paila del sancocho

    // 🛑 2. Retén Clandestino en la Trocha
    const retenX = cx + 8;
    const retenY = cy + Math.floor(Math.sin(retenX * 0.08) * 6);
    grid.set(retenX, retenY - 2, ELEM.FENCE);
    grid.set(retenX, retenY + 3, ELEM.FENCE);
    grid.buildingLocations.push({ x: retenX, y: retenY, name: "Retén en la Trocha" });

    // 👮‍♂️ 3. Puesto de Policía del Cuadrante y Alcaldía
    const townX = cx - 26;
    const townY = cy - 8;
    grid.createBuilding(townX, townY, 8, 6, "Puesto del Cuadrante", { roofColor: 'green' });

    // 🏪 4. Tienda de Doña Gloria y Billar
    const storeX = cx - 26;
    const storeY = cy + 12;
    grid.createBuilding(storeX, storeY, 8, 6, "Tienda y Billar", { roofColor: 'red', sign: 'pot' });

    // Puesto de frutas y aguacates en la plaza del pueblo (ELEM.MARKET)
    grid.set(townX + 10, townY + 3, ELEM.MARKET);
    grid.set(townX + 11, townY + 3, ELEM.MARKET);
    grid.set(storeX + 10, storeY + 2, ELEM.FLOWER_BED);

    // 🛶 5. Muelle de Canoas en el Río
    const dockX = cx - 8;
    const dockY = cy + 18;
    for (let dy = 0; dy < 3; dy++) {
      grid.set(dockX + dy, dockY, ELEM.WOOD);
      grid.set(dockX + dy, dockY + 1, ELEM.ROAD);
    }
    grid.buildingLocations.push({ x: dockX + 1, y: dockY, name: "Muelle de Canoas" });
  }

  // 6. 🗡️ CIUDADELA DE HYRULE: The Legend of Zelda: The Minish Cap (Fidelidad Pixel Art GBA)
  static generateHyrule(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.47);
    const radiusY = Math.floor(h * 0.45);

    // 1. Suelo Base: Pradera viva y foso de agua exterior
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wobble = Math.sin(x * 0.14) * 0.05 + Math.cos(y * 0.14) * 0.05;

        if (dist + wobble < 0.72) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
          if (Math.random() < 0.12) grid.set(x, y, ELEM.PLANT_BLOOM);
        } else {
          grid.set(x, y, ELEM.WATER); // Foso / lago exterior de Hyrule
        }
      }
    }

    // Coordenadas de las murallas de la ciudadela
    const wallNorth = cy - 26;
    const wallSouth = cy + 28;
    const wallWest = cx - 36;
    const wallEast = cx + 36;

    // 2. 🧱 Murallas de Cantería y Almenas de la Ciudadela (ELEM.WALL)
    // Muralla Norte (con apertura central para la Gran Puerta del Castillo)
    for (let x = wallWest; x <= wallEast; x++) {
      if (x < cx - 3 || x > cx + 3) {
        grid.set(x, wallNorth, ELEM.WALL);
        grid.set(x, wallNorth - 1, ELEM.WALL);
      }
    }
    // Muralla Sur (con apertura central para el puente de salida sur)
    for (let x = wallWest; x <= wallEast; x++) {
      if (x < cx - 2 || x > cx + 2) {
        grid.set(x, wallSouth, ELEM.WALL);
        grid.set(x, wallSouth + 1, ELEM.WALL);
      }
    }
    // Murallas Oeste y Este
    for (let y = wallNorth; y <= wallSouth; y++) {
      grid.set(wallWest, y, ELEM.WALL);
      grid.set(wallWest - 1, y, ELEM.WALL);
      grid.set(wallEast, y, ELEM.WALL);
      grid.set(wallEast + 1, y, ELEM.WALL);
    }

    // 🏰 Gran Arco Monumental Norte del Castillo (con campana y emblema real)
    grid.buildingLocations.push({
      x: cx - 3,
      y: wallNorth - 1,
      w: 6,
      h: 4,
      name: "Puerta Norte del Castillo"
    });

    // Camino real que cruza de norte a sur por la puerta
    for (let y = wallNorth - 4; y <= wallSouth + 4; y++) {
      grid.set(cx - 1, y, ELEM.ROAD);
      grid.set(cx, y, ELEM.ROAD);
      grid.set(cx + 1, y, ELEM.ROAD);
    }

    // 🌊 3. Canal de Agua del Oeste y Molino Hidráulico
    const canalX1 = cx - 30;
    const canalX2 = cx - 27;
    for (let y = wallNorth + 2; y <= wallSouth - 2; y++) {
      for (let x = canalX1; x <= canalX2; x++) {
        grid.set(x, y, ELEM.WATER);
      }
      // Ribera adoquinada del canal
      grid.set(canalX1 - 1, y, ELEM.ROAD);
      grid.set(canalX2 + 1, y, ELEM.ROAD);
    }

    // Puente de Piedra Norte sobre el canal
    const bridgeNorthY = cy - 14;
    for (let x = canalX1 - 2; x <= canalX2 + 2; x++) {
      grid.set(x, bridgeNorthY, ELEM.ROAD);
      grid.set(x, bridgeNorthY + 1, ELEM.ROAD);
    }
    grid.buildingLocations.push({ x: canalX1, y: bridgeNorthY, name: "Puente Norte del Canal" });

    // Puente de Madera Sur sobre el canal con barandillas
    const bridgeSouthY = cy + 14;
    for (let x = canalX1 - 2; x <= canalX2 + 2; x++) {
      grid.set(x, bridgeSouthY, ELEM.ROAD);
      grid.set(x, bridgeSouthY + 1, ELEM.ROAD);
    }
    grid.set(canalX1 - 1, bridgeSouthY - 1, ELEM.WOOD);
    grid.set(canalX2 + 1, bridgeSouthY - 1, ELEM.WOOD);
    grid.set(canalX1 - 1, bridgeSouthY + 2, ELEM.WOOD);
    grid.set(canalX2 + 1, bridgeSouthY + 2, ELEM.WOOD);
    grid.buildingLocations.push({ x: canalX1, y: bridgeSouthY, name: "Puente Sur del Canal" });

    // 🌊 Molino de Agua con Rueda Hidráulica Giratoria
    grid.createBuilding(canalX2 + 2, cy - 24, 9, 6, "Molino de Agua", {
      style: 'watermill',
      roofColor: 'stone'
    });

    // ⛲ 4. Gran Plaza Mayor de Hyrule (Town Square)
    const pX1 = cx - 13;
    const pX2 = cx + 13;
    const pY1 = cy - 9;
    const pY2 = cy + 11;
    for (let py = pY1; py <= pY2; py++) {
      for (let px = pX1; px <= pX2; px++) {
        grid.set(px, py, ELEM.ROAD);
      }
    }

    // Gran Fuente de Mármol Central con Chorro de Agua Animado (ELEM.FOUNTAIN)
    grid.set(cx - 1, cy - 2, ELEM.FOUNTAIN);
    grid.set(cx, cy - 2, ELEM.FOUNTAIN);
    grid.set(cx + 1, cy - 2, ELEM.FOUNTAIN);
    grid.set(cx - 1, cy - 1, ELEM.FOUNTAIN);
    grid.set(cx, cy - 1, ELEM.FOUNTAIN);
    grid.set(cx + 1, cy - 1, ELEM.FOUNTAIN);
    grid.buildingLocations.push({ x: cx - 1, y: cy - 2, name: "Fuente de Hyrule", showName: false });

    // 🎪 Bazares y Puestos de Mercado con Toldos a Rayas (ELEM.MARKET)
    grid.set(cx - 9, cy - 5, ELEM.MARKET);
    grid.set(cx - 8, cy - 5, ELEM.MARKET);
    grid.set(cx + 7, cy - 5, ELEM.MARKET);
    grid.set(cx + 8, cy - 5, ELEM.MARKET);
    grid.set(cx - 9, cy + 6, ELEM.MARKET);
    grid.set(cx - 8, cy + 6, ELEM.MARKET);
    grid.set(cx + 7, cy + 6, ELEM.MARKET);
    grid.set(cx + 8, cy + 6, ELEM.MARKET);

    // 🌷 Jardineras Ornamentales con Bordillo Blanco en la Plaza (ELEM.FLOWER_BED)
    for (let x = cx - 5; x <= cx + 5; x++) {
      if (Math.abs(x - cx) >= 2) {
        grid.set(x, pY1 + 1, ELEM.FLOWER_BED);
        grid.set(x, pY2 - 1, ELEM.FLOWER_BED);
      }
    }
    grid.set(pX1 + 1, cy, ELEM.FLOWER_BED);
    grid.set(pX2 - 1, cy, ELEM.FLOWER_BED);

    // 5. 🏡 Cabañas y Comercios con Tejados Curvos Multicolores y Carteles Colgantes (The Minish Cap)
    // A. Zapatería de Rem (Tejado Rojo, Cartel Zapato)
    grid.createBuilding(cx - 25, cy - 9, 8, 6, "Zapatería de Rem", {
      roofColor: 'red',
      sign: 'shoe'
    });

    // B. Panadería Real (Tejado Amarillo, Cartel Pan)
    grid.createBuilding(cx + 16, cy - 9, 8, 6, "Panadería Real", {
      roofColor: 'yellow',
      sign: 'bread'
    });

    // C. Botica de Pociones de Syrup (Tejado Azul, Cartel Poción)
    grid.createBuilding(cx + 26, cy - 9, 8, 6, "Botica de Pociones", {
      roofColor: 'blue',
      sign: 'potion'
    });

    // D. Armería y Forja Real (Tejado Azul, Cartel Escudo)
    grid.createBuilding(cx - 25, cy + 6, 8, 6, "Armería y Escudos", {
      roofColor: 'blue',
      sign: 'shield'
    });

    // E. Posada y Taberna del Viajero (Tejado Verde, Dos Pisos)
    grid.createBuilding(cx + 16, cy + 6, 9, 6, "Posada del Viajero", {
      roofColor: 'green'
    });

    // F. Gran Mansión Señorial / Ayuntamiento (Estilo Cantería Señorial)
    grid.createBuilding(cx - 16, cy - 23, 12, 7, "Mansión Señorial", {
      style: 'mansion'
    });

    // G. Dojo de Swiftblade - Maestro de la Espada (Tejado de Piedra, Cartel Bell/Dojo)
    grid.createBuilding(cx + 16, cy - 23, 10, 6, "Dojo de Swiftblade", {
      roofColor: 'stone',
      sign: 'shield'
    });

    // H. Biblioteca Real de Hyrule (Tejado Púrpura)
    grid.createBuilding(cx + 26, cy + 16, 8, 6, "Biblioteca Real", {
      roofColor: 'purple'
    });

    // I. Casa Residencial Campestre (Tejado Rojo)
    grid.createBuilding(cx - 16, cy + 18, 8, 6, "Cabaña Residencial", {
      roofColor: 'red'
    });

    // 6. 🪣 Pozo de Agua de Piedra y Plaza Sureste
    const wellX = cx + 8;
    const wellY = cy + 18;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        grid.set(wellX + dx, wellY + dy, ELEM.STONE);
      }
    }
    grid.set(wellX, wellY, ELEM.WATER);
    grid.buildingLocations.push({ x: wellX, y: wellY, name: "Pozo de la Plaza" });

    // 7. 🛣️ Red de Calles Adoquinadas Conectando Toda la Ciudadela
    // Calle Este-Oeste Principal
    for (let x = canalX2 + 1; x <= wallEast - 2; x++) {
      grid.set(x, cy + 2, ELEM.ROAD);
      grid.set(x, cy + 3, ELEM.ROAD);
    }
    // Calle Norte transversal
    for (let x = canalX2 + 1; x <= wallEast - 2; x++) {
      grid.set(x, cy - 14, ELEM.ROAD);
    }
    // Calle Sur transversal
    for (let x = canalX2 + 1; x <= wallEast - 2; x++) {
      grid.set(x, cy + 14, ELEM.ROAD);
    }
    // Conexiones verticales
    for (let y = cy - 22; y <= cy + 24; y++) {
      grid.set(cx - 15, y, ELEM.ROAD);
      grid.set(cx + 14, y, ELEM.ROAD);
    }

    // 8. 🌳 Árboles Volumétricos Frondosos de Hyrule (ELEM.TREE)
    const treePositions = [
      // Ribera del canal
      { x: canalX1 - 4, y: cy - 20 },
      { x: canalX1 - 4, y: cy - 8 },
      { x: canalX1 - 4, y: cy + 4 },
      { x: canalX1 - 4, y: cy + 18 },
      // Esquinas exteriores de la Plaza Mayor
      { x: cx - 14, y: cy - 11 },
      { x: cx + 14, y: cy - 11 },
      { x: cx - 14, y: cy + 12 },
      { x: cx + 14, y: cy + 12 },
      // Frente al dojo y mansión
      { x: cx - 2, y: cy - 18 },
      { x: cx + 2, y: cy - 18 },
      { x: cx + 28, y: cy - 18 },
      // Entrada sur
      { x: cx - 6, y: wallSouth - 4 },
      { x: cx + 6, y: wallSouth - 4 }
    ];
    for (const pos of treePositions) {
      grid.set(pos.x, pos.y, ELEM.TREE);
    }

    // 9. 🪵 Cercas de Madera Perimetrales en Patios (ELEM.FENCE)
    for (let x = cx - 25; x <= cx - 17; x++) {
      grid.set(x, cy - 2, ELEM.FENCE);
      grid.set(x, cy + 13, ELEM.FENCE);
    }
    for (let x = cx + 16; x <= cx + 25; x++) {
      grid.set(x, cy - 2, ELEM.FENCE);
      grid.set(x, cy + 13, ELEM.FENCE);
    }

    // Jardineras adicionales frente a los comercios
    grid.set(cx - 25, cy - 3, ELEM.FLOWER_BED);
    grid.set(cx - 17, cy - 3, ELEM.FLOWER_BED);
    grid.set(cx + 16, cy - 3, ELEM.FLOWER_BED);
    grid.set(cx + 25, cy - 3, ELEM.FLOWER_BED);
  }

  // 7. 🌱 GÉNESIS / MUNDO VIRGEN DESDE CERO (Sin casas, sin edificios, naturaleza pura para civilizar)
  static generateGenesis(grid, w, h, cx, cy) {
    const radiusX = Math.floor(w * 0.44);
    const radiusY = Math.floor(h * 0.40);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const noise = Math.sin(x * 0.15) * 0.08 + Math.cos(y * 0.18) * 0.08;

        if (dist + noise < 0.40) {
          grid.set(x, y, ELEM.FERTILE_DIRT);
        } else if (dist + noise < 0.65) {
          grid.set(x, y, ELEM.DIRT);
        } else if (dist + noise < 0.76) {
          grid.set(x, y, ELEM.SAND); // Costa virgen
        } else {
          grid.set(x, y, ELEM.WATER); // Océano primordial
        }
      }
    }

    // Río natural serpenteante de agua viva
    for (let y = 0; y < h; y++) {
      const riverX = cx + Math.floor(Math.sin(y * 0.14) * 16 - 6);
      for (let rx = riverX - 2; rx <= riverX + 2; rx++) {
        if (rx >= 0 && rx < w) {
          grid.set(rx, y, ELEM.WATER);
        }
      }
      grid.set(riverX - 3, y, ELEM.FERTILE_DIRT);
      grid.set(riverX + 3, y, ELEM.FERTILE_DIRT);
    }

    // Yacimientos de roca y cantera natural para extraer piedra
    const quarryX = cx + 18;
    const quarryY = cy - 12;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (Math.hypot(dx, dy) <= 3.2) {
          grid.set(quarryX + dx, quarryY + dy, ELEM.STONE);
        }
      }
    }

    // Bosque virgen de árboles frutales y maderables Minish Cap
    for (let y = cy - 20; y <= cy + 18; y += 5) {
      for (let x = cx - 28; x <= cx - 8; x += 5) {
        if (Math.random() < 0.7 && grid.get(x, y) !== ELEM.WATER) {
          grid.set(x, y, ELEM.TREE);
        }
      }
    }

    // Campamento virgen con fogata primitiva para calentarse
    grid.set(cx, cy, ELEM.CAMPFIRE);
    // Sin edificios prehechos: ¡la civilización florecerá desde cero!
  }
}

