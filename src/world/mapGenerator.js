import { ELEM } from '../sim/elements.js';

export class MapGenerator {
  static generate(grid, type = 'archipelago') {
    grid.grid.fill(ELEM.EMPTY);
    grid.life.fill(0);
    grid.buildingLocations = [];

    const w = grid.width;
    const h = grid.height;
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    if (type === 'genesis') {
      // 🌌 GÉNESIS: El Vacío Primordial (Océano infinito sin tierra)
      // El jugador es Dios al principio de los tiempos y debe crear la luz, la tierra y la vida.
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          grid.set(x, y, ELEM.WATER);
        }
      }
      // Un pequeño altar o roca sagrada flotante en el centro
      grid.set(cx, cy, ELEM.FERTILE_DIRT);
      grid.set(cx + 1, cy, ELEM.FERTILE_DIRT);
      grid.set(cx, cy + 1, ELEM.FERTILE_DIRT);
      grid.set(cx + 1, cy + 1, ELEM.FERTILE_DIRT);
      grid.set(cx, cy - 1, ELEM.PLANT_BLOOM);
      return;
    }

    if (type === 'valley') {
      // 🏞️ EL VALLE SAGRADO: Ríos sinuosos, colinas verdes, puentes y casas
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Río curvado que cruza de norte a sur
          const riverX = cx + Math.sin(y * 0.15) * 12 + Math.cos(y * 0.05) * 8;
          const distToRiver = Math.abs(x - riverX);

          if (distToRiver < 4) {
            grid.set(x, y, ELEM.WATER);
          } else if (distToRiver < 8) {
            grid.set(x, y, ELEM.FERTILE_DIRT);
            if (Math.random() < 0.08) grid.set(x, y, ELEM.PLANT_BLOOM);
          } else {
            grid.set(x, y, ELEM.DIRT);
          }
        }
      }

      // Puentes de madera cruzando el río
      const bridgeY1 = cy - 15;
      const bridgeY2 = cy + 15;
      for (let bx = cx - 8; bx <= cx + 8; bx++) {
        grid.set(bx, bridgeY1, ELEM.ROAD);
        grid.set(bx, bridgeY1 + 1, ELEM.ROAD);
        grid.set(bx, bridgeY2, ELEM.ROAD);
        grid.set(bx, bridgeY2 + 1, ELEM.ROAD);
      }

      // Aldea central con casas
      grid.createBuilding(cx - 25, cy - 8, 8, 6);
      grid.buildingLocations.push({ x: cx - 21, y: cy - 5, name: "Casona del Valle" });

      grid.createBuilding(cx + 16, cy + 6, 8, 6);
      grid.buildingLocations.push({ x: cx + 20, y: cy + 9, name: "Taberna y Plaza" });
      return;
    }

    if (type === 'volcano') {
      // 🌋 ISLA DEL FUEGO & CENIZA: Volcán central, magma y playas de piedra
      const radiusX = Math.floor(w * 0.38);
      const radiusY = Math.floor(h * 0.34);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = (x - cx) / radiusX;
          const dy = (y - cy) / radiusY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wobble = Math.sin(x * 0.25) * 0.06 + Math.cos(y * 0.25) * 0.06;

          if (dist + wobble < 0.2) {
            // Cráter ardiente
            grid.set(x, y, ELEM.FIRE, 120);
          } else if (dist + wobble < 0.5) {
            // Laderas de ceniza y roca
            grid.set(x, y, Math.random() < 0.6 ? ELEM.STONE : ELEM.ASH);
          } else if (dist + wobble < 0.78) {
            grid.set(x, y, ELEM.DIRT);
            if (Math.random() < 0.04) grid.set(x, y, ELEM.FERTILE_DIRT);
          } else {
            grid.set(x, y, ELEM.WATER);
          }
        }
      }

      grid.createBuilding(cx - 14, cy + 12, 8, 6);
      grid.buildingLocations.push({ x: cx - 10, y: cy + 15, name: "Refugio del Volcán" });
      return;
    }

    // Default: 'archipelago' (Isla Clandestina Narco)
    grid.initWorld();
  }
}
