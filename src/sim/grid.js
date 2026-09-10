import { ELEM, ELEM_PROPS } from './elements.js';
import { sound } from '../audio/soundFX.js';

export class SimulationGrid {
  constructor(width = 140, height = 90) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
    this.life = new Uint8Array(width * height); // Vida o timer para fuego, crecimiento, etc.
    this.updated = new Uint8Array(width * height);
    this.soundCooldown = 0;

    this.buildingLocations = []; // Puntos clave (Almacén clandestino, puerto)
    this.initWorld();
  }

  getIndex(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return y * this.width + x;
  }

  get(x, y) {
    const idx = this.getIndex(x, y);
    if (idx === -1) return ELEM.STONE; // Bordes sólidos
    return this.grid[idx];
  }

  set(x, y, elem, lifeVal = 0) {
    const idx = this.getIndex(x, y);
    if (idx === -1) return;
    this.grid[idx] = elem;
    this.life[idx] = lifeVal;
  }

  initWorld() {
    this.grid.fill(ELEM.EMPTY);
    this.life.fill(0);

    const cx = Math.floor(this.width / 2);
    const cy = Math.floor(this.height / 2);
    const radiusX = Math.floor(this.width * 0.4);
    const radiusY = Math.floor(this.height * 0.35);

    // 1. Generar Isla con forma orgánica
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Ruido sinusoidal para bordes irregulares
        const wobble = Math.sin(x * 0.2) * 0.08 + Math.cos(y * 0.25) * 0.08;
        
        if (dist + wobble < 0.75) {
          // Centro de la isla: Tierra fértil y senderos
          const isInterior = (dist + wobble < 0.55);
          if (isInterior) {
            this.set(x, y, ELEM.FERTILE_DIRT);
            // Algunas semillas iniciales
            if (Math.random() < 0.04) {
              this.set(x, y, ELEM.PLANT_BLOOM);
            }
          } else {
            this.set(x, y, ELEM.DIRT);
          }
        } else if (dist + wobble < 0.88) {
          // Playas / aguas someras
          this.set(x, y, ELEM.WATER);
        } else {
          // Océano exterior
          this.set(x, y, ELEM.WATER);
        }
      }
    }

    // 2. Crear Almacén Secreto del Patrón
    const bX = cx - 12;
    const bY = cy - 8;
    this.createBuilding(bX, bY, 8, 6, "Almacén Principal");
    this.buildingLocations.push({ x: bX + 4, y: bY + 3, name: "Almacén del Patrón" });

    // 3. Crear Muelle de Embarque clandestino
    const dockX = cx + 22;
    const dockY = cy + 10;
    this.createBuilding(dockX, dockY, 6, 5, "Muelle de Embarque");
    this.buildingLocations.push({ x: dockX + 3, y: dockY + 2, name: "Muelle de Salida" });

    // 4. Senderos que conectan
    for (let x = bX + 4; x <= dockX + 3; x++) {
      const y = Math.floor(cy + Math.sin(x * 0.1) * 3);
      this.set(x, y, ELEM.ROAD);
      this.set(x, y + 1, ELEM.ROAD);
    }
  }

  createBuilding(startX, startY, w, h) {
    for (let y = startY; y < startY + h; y++) {
      for (let x = startX; x < startX + w; x++) {
        if (x === startX || x === startX + w - 1 || y === startY || y === startY + h - 1) {
          this.set(x, y, ELEM.BUILDING);
        } else {
          this.set(x, y, ELEM.ROAD); // Piso interior
        }
      }
    }
    // Puerta
    this.set(startX + Math.floor(w / 2), startY + h - 1, ELEM.ROAD);
  }

  // Pincel Divino: aplicar elementos en radio
  paint(cx, cy, elem, radius = 2) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const current = this.get(x, y);
            if (current === ELEM.BUILDING) continue; // No destruir muros con pincel básico

            if (elem === ELEM.FIRE) {
              if (current === ELEM.WATER) {
                this.set(x, y, ELEM.SMOKE, 15);
              } else {
                this.set(x, y, ELEM.FIRE, 40 + Math.floor(Math.random() * 20));
              }
            } else if (elem === ELEM.SEED) {
              if (current === ELEM.DIRT || current === ELEM.FERTILE_DIRT || current === ELEM.ROAD) {
                this.set(x, y, ELEM.SEED, 0);
              }
            } else if (elem === ELEM.WATER) {
              if (current === ELEM.DIRT) {
                this.set(x, y, ELEM.FERTILE_DIRT);
              } else if (current === ELEM.FIRE) {
                this.set(x, y, ELEM.SMOKE, 20);
                sound.playSteamHiss();
              } else if (current === ELEM.LAVA) {
                this.set(x, y, ELEM.STONE);
                if (y > 0) this.set(x, y - 1, ELEM.SMOKE, 25);
                sound.playSteamHiss();
              } else if (current === ELEM.EMPTY || current === ELEM.ASH) {
                this.set(x, y, ELEM.WATER);
              }
            } else if (elem === ELEM.LAVA) {
              if (current === ELEM.WATER) {
                this.set(x, y, ELEM.STONE);
                if (y > 0) this.set(x, y - 1, ELEM.SMOKE, 25);
                sound.playSteamHiss();
              } else if (current === ELEM.WOOD || current === ELEM.PLANT || current === ELEM.PLANT_BLOOM) {
                this.set(x, y, ELEM.FIRE, 50);
              } else {
                this.set(x, y, ELEM.LAVA);
              }
            } else {
              this.set(x, y, elem);
            }
          }
        }
      }
    }
  }

  // Rayo divino: explosión y fuego concentrado
  strikeLightning(cx, cy) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx * dx + dy * dy <= 9) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.set(x, y, ELEM.FIRE, 60);
          }
        }
      }
    }
  }

  // 🌋 Cataclismo Tectónico: Terremoto con apertura de fallas abisales y derrumbes
  triggerEarthquake(cx, cy, numFaults = 3) {
    const crackedTiles = [];
    const mainBranches = numFaults || 3;

    for (let b = 0; b < mainBranches; b++) {
      let curX = cx;
      let curY = cy;
      const baseAngle = (b / mainBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
      const length = 20 + Math.floor(Math.random() * 25);

      for (let step = 0; step < length; step++) {
        // Avance con desviación irregular / zig-zag sísmico
        const wobble = (Math.random() - 0.5) * 1.4;
        const angle = baseAngle + wobble;
        curX += Math.cos(angle) * 1.2;
        curY += Math.sin(angle) * 1.2;

        const tx = Math.floor(curX);
        const ty = Math.floor(curY);

        if (tx <= 2 || tx >= this.width - 3 || ty <= 2 || ty >= this.height - 3) break;

        // Romper celda central y aledañas
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const rx = tx + dx;
            const ry = ty + dy;
            if (rx < 1 || rx >= this.width - 1 || ry < 1 || ry >= this.height - 1) continue;

            const existing = this.get(rx, ry);
            if (existing === ELEM.EMPTY || existing === ELEM.CHASM) continue;

            // Si es un edificio o madera, colapsa en escombros
            if (existing === ELEM.BUILDING || existing === ELEM.WOOD || existing === ELEM.STONE) {
              this.set(rx, ry, ELEM.RUBBLE);
              crackedTiles.push({ x: rx, y: ry, type: 'rubble' });
              if (Math.random() < 0.4 && ry > 1) {
                this.set(rx, ry - 1, ELEM.SMOKE, 20); // Polvareda
              }
            } else if (existing === ELEM.WATER) {
              // El agua penetra la grieta
              if (Math.random() < 0.3) this.set(rx, ry, ELEM.CHASM);
            } else {
              // Tierra, caminos o cultivos se abren en abismo tectónico
              if (dx === 0 && dy === 0) {
                this.set(rx, ry, ELEM.CHASM);
                crackedTiles.push({ x: rx, y: ry, type: 'chasm' });
              } else if (Math.random() < 0.4) {
                this.set(rx, ry, ELEM.RUBBLE);
                crackedTiles.push({ x: rx, y: ry, type: 'rubble' });
              }
            }
          }
        }
      }
    }

    return crackedTiles;
  }

  // Actualización de física celular (60 FPS)
  step() {
    this.updated.fill(0);
    if (this.soundCooldown > 0) this.soundCooldown--;

    // Recorrido de abajo hacia arriba para física de caída
    for (let y = this.height - 1; y >= 0; y--) {
      // Alternar dirección izquierda/derecha para evitar sesgo
      const leftToRight = Math.random() > 0.5;
      const startX = leftToRight ? 0 : this.width - 1;
      const endX = leftToRight ? this.width : -1;
      const stepX = leftToRight ? 1 : -1;

      for (let x = startX; x !== endX; x += stepX) {
        const idx = y * this.width + x;
        if (this.updated[idx]) continue;

        const elem = this.grid[idx];
        if (elem === ELEM.EMPTY) continue;

        // ================= 1. AGUA =================
        if (elem === ELEM.WATER) {
          const down = this.get(x, y + 1);

          if (down === ELEM.DIRT) {
            // Agua penetra e hidrata la tierra
            this.set(x, y + 1, ELEM.FERTILE_DIRT);
            this.set(x, y, ELEM.EMPTY);
            continue;
          } else if (down === ELEM.FIRE) {
            this.set(x, y + 1, ELEM.SMOKE, 25);
            this.set(x, y, ELEM.EMPTY);
            if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
            continue;
          } else if (down === ELEM.LAVA) {
            // Agua enfría lava directamente en roca volcánica
            this.set(x, y + 1, ELEM.STONE);
            this.set(x, y, ELEM.SMOKE, 30);
            if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
            continue;
          } else if (down === ELEM.CHASM) {
            // Agua se precipita al abismo tectónico
            this.set(x, y, ELEM.EMPTY);
            continue;
          }

          if (y < this.height - 1 && down === ELEM.EMPTY) {
            this.set(x, y + 1, ELEM.WATER);
            this.set(x, y, ELEM.EMPTY);
            this.updated[this.getIndex(x, y + 1)] = 1;
          } else {
            // Revisar interacción con lava o fuego en los costados
            const dir = Math.random() < 0.5 ? -1 : 1;
            const sideLava1 = this.get(x + dir, y);
            const sideLava2 = this.get(x - dir, y);

            if (sideLava1 === ELEM.LAVA) {
              this.set(x + dir, y, ELEM.STONE);
              this.set(x, y, ELEM.SMOKE, 25);
              if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
              continue;
            } else if (sideLava2 === ELEM.LAVA) {
              this.set(x - dir, y, ELEM.STONE);
              this.set(x, y, ELEM.SMOKE, 25);
              if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
              continue;
            }

            // Flujo diagonal y horizontal
            const diag1 = this.get(x + dir, y + 1);
            const diag2 = this.get(x - dir, y + 1);

            if (diag1 === ELEM.EMPTY && y < this.height - 1) {
              this.set(x + dir, y + 1, ELEM.WATER);
              this.set(x, y, ELEM.EMPTY);
              this.updated[this.getIndex(x + dir, y + 1)] = 1;
            } else if (diag2 === ELEM.EMPTY && y < this.height - 1) {
              this.set(x - dir, y + 1, ELEM.WATER);
              this.set(x, y, ELEM.EMPTY);
              this.updated[this.getIndex(x - dir, y + 1)] = 1;
            } else {
              // Expansión lateral
              const side1 = this.get(x + dir, y);
              const side2 = this.get(x - dir, y);
              if (side1 === ELEM.EMPTY) {
                this.set(x + dir, y, ELEM.WATER);
                this.set(x, y, ELEM.EMPTY);
                this.updated[this.getIndex(x + dir, y)] = 1;
              } else if (side2 === ELEM.EMPTY) {
                this.set(x - dir, y, ELEM.WATER);
                this.set(x, y, ELEM.EMPTY);
                this.updated[this.getIndex(x - dir, y)] = 1;
              }
            }
          }
        }

        // ================= 2. LAVA / MAGMA =================
        else if (elem === ELEM.LAVA) {
          const down = this.get(x, y + 1);

          if (down === ELEM.WATER) {
            // Lava toca agua: petrificación inmediata en roca y vapor
            this.set(x, y, ELEM.STONE);
            this.set(x, y + 1, ELEM.SMOKE, 30);
            if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
            continue;
          } else if (down === ELEM.WOOD || down === ELEM.PLANT || down === ELEM.PLANT_BLOOM || down === ELEM.SEED) {
            this.set(x, y + 1, ELEM.FIRE, 60);
          }

          // Caída viscosa (algo más lenta que el agua)
          if (Math.random() < 0.75) {
            if (y < this.height - 1 && down === ELEM.EMPTY) {
              this.set(x, y + 1, ELEM.LAVA);
              this.set(x, y, ELEM.EMPTY);
              this.updated[this.getIndex(x, y + 1)] = 1;
            } else {
              const dir = Math.random() < 0.5 ? -1 : 1;
              const diag = this.get(x + dir, y + 1);
              const side = this.get(x + dir, y);

              if (side === ELEM.WATER) {
                this.set(x + dir, y, ELEM.STONE);
                this.set(x, y, ELEM.SMOKE, 25);
                if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
                continue;
              }

              if (diag === ELEM.EMPTY && y < this.height - 1) {
                this.set(x + dir, y + 1, ELEM.LAVA);
                this.set(x, y, ELEM.EMPTY);
                this.updated[this.getIndex(x + dir, y + 1)] = 1;
              } else if (side === ELEM.EMPTY && Math.random() < 0.4) {
                this.set(x + dir, y, ELEM.LAVA);
                this.set(x, y, ELEM.EMPTY);
                this.updated[this.getIndex(x + dir, y)] = 1;
              }
            }
          }

          // Calentar e incendiar vegetación o madera circundante
          const neighbors = [[x + 1, y], [x - 1, y], [x, y - 1]];
          for (const [nx, ny] of neighbors) {
            const ne = this.get(nx, ny);
            if (ne === ELEM.WOOD || ne === ELEM.PLANT || ne === ELEM.PLANT_BLOOM || ne === ELEM.SEED) {
              if (Math.random() < 0.3) {
                this.set(nx, ny, ELEM.FIRE, 50);
              }
            }
          }
        }

        // ================= 3. ARENA (Física Granular Real) =================
        else if (elem === ELEM.SAND) {
          const down = this.get(x, y + 1);

          if (y < this.height - 1) {
            if (down === ELEM.EMPTY) {
              // La arena cae por gravedad en el aire
              this.set(x, y + 1, ELEM.SAND);
              this.set(x, y, ELEM.EMPTY);
              this.updated[this.getIndex(x, y + 1)] = 1;
            } else if (down === ELEM.WATER) {
              // La arena es más densa que el agua: se hunde al fondo desplazando el agua
              this.set(x, y + 1, ELEM.SAND);
              this.set(x, y, ELEM.WATER);
              this.updated[this.getIndex(x, y + 1)] = 1;
            } else {
              // Deslizamiento diagonal en talud natural
              const dir = Math.random() < 0.5 ? -1 : 1;
              const diag1 = this.get(x + dir, y + 1);
              const diag2 = this.get(x - dir, y + 1);

              if (diag1 === ELEM.EMPTY) {
                this.set(x + dir, y + 1, ELEM.SAND);
                this.set(x, y, ELEM.EMPTY);
                this.updated[this.getIndex(x + dir, y + 1)] = 1;
              } else if (diag2 === ELEM.EMPTY) {
                this.set(x - dir, y + 1, ELEM.SAND);
                this.set(x, y, ELEM.EMPTY);
                this.updated[this.getIndex(x - dir, y + 1)] = 1;
              } else if (diag1 === ELEM.WATER) {
                this.set(x + dir, y + 1, ELEM.SAND);
                this.set(x, y, ELEM.WATER);
                this.updated[this.getIndex(x + dir, y + 1)] = 1;
              }
            }
          }
        }

        // ================= 4. FUEGO =================
        else if (elem === ELEM.FIRE) {
          let life = this.life[idx] - 1;
          if (life <= 0) {
            this.set(x, y, Math.random() < 0.4 ? ELEM.ASH : ELEM.EMPTY);
            continue;
          }
          this.life[idx] = life;

          // Propagar a vecinos inflamables (incluyendo troncos de madera)
          const neighbors = [
            [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
            [x + 1, y - 1], [x - 1, y - 1]
          ];
          for (const [nx, ny] of neighbors) {
            const ne = this.get(nx, ny);
            if (ne === ELEM.PLANT || ne === ELEM.PLANT_BLOOM || ne === ELEM.SEED) {
              if (Math.random() < 0.25) {
                this.set(nx, ny, ELEM.FIRE, 35 + Math.floor(Math.random() * 25));
                this.updated[this.getIndex(nx, ny)] = 1;
              }
            } else if (ne === ELEM.WOOD || ne === ELEM.CAMPFIRE) {
              // La madera arde con fuego duradero
              if (Math.random() < 0.18) {
                this.set(nx, ny, ELEM.FIRE, 65 + Math.floor(Math.random() * 35));
                this.updated[this.getIndex(nx, ny)] = 1;
              }
            } else if (ne === ELEM.WATER) {
              this.set(x, y, ELEM.SMOKE, 20);
              if (this.soundCooldown === 0) { sound.playSteamHiss(); this.soundCooldown = 18; }
              break;
            }
          }

          // Emitir humo hacia arriba
          if (y > 0 && Math.random() < 0.18 && this.get(x, y - 1) === ELEM.EMPTY) {
            this.set(x, y - 1, ELEM.SMOKE, 14);
          }
        }

        // ================= 5. HUMO =================
        else if (elem === ELEM.SMOKE) {
          let life = this.life[idx] - 1;
          if (life <= 0) {
            this.set(x, y, ELEM.EMPTY);
            continue;
          }
          this.life[idx] = life;
          // Ascender y disiparse
          if (y > 0 && this.get(x, y - 1) === ELEM.EMPTY) {
            const drift = Math.random() < 0.35 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            const targetX = Math.max(0, Math.min(this.width - 1, x + drift));
            if (this.get(targetX, y - 1) === ELEM.EMPTY) {
              this.set(targetX, y - 1, ELEM.SMOKE, life);
              this.set(x, y, ELEM.EMPTY);
              this.updated[this.getIndex(targetX, y - 1)] = 1;
            }
          }
        }

        // ================= 6. CRECIMIENTO BOTÁNICO =================
        else if (elem === ELEM.SEED) {
          const below = this.get(x, y + 1);
          const sides = [this.get(x - 1, y), this.get(x + 1, y), below];
          const hasWater = sides.some(s => s === ELEM.WATER || s === ELEM.FERTILE_DIRT);

          if (hasWater) {
            this.life[idx] += 1;
            if (this.life[idx] > 60) {
              this.set(x, y, ELEM.PLANT, 0);
            }
          }
        }

        else if (elem === ELEM.PLANT) {
          this.life[idx] += 1;
          if (this.life[idx] > 120) {
            this.set(x, y, ELEM.PLANT_BLOOM, 0);
            const side = Math.random() < 0.5 ? -1 : 1;
            if (this.get(x + side, y) === ELEM.FERTILE_DIRT && this.get(x + side, y - 1) === ELEM.EMPTY) {
              if (Math.random() < 0.08) {
                this.set(x + side, y - 1, ELEM.PLANT, 0);
              }
            }
          }
        }
      }
    }
  }
}
