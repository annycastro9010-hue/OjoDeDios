import { ELEM, ELEM_PROPS } from '../sim/elements.js';
import { animManager } from './animationManager.js';
import { sprites } from './sprites.js';
import { vfx } from './fx.js';

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = 8;
    this.waterTime = 0;
  }

  render(grid, npcs, animals = [], camera, possessedNpc, mouseWorldPos, currentTool, brushRadius, currentEra = null) {
    const ctx = this.ctx;
    this.waterTime += 0.05;
    const eraId = currentEra?.id || 'biblical';

    // 1. Limpiar pantalla con atmósfera ambiental según la Era
    let skyBg = '#0a0d18';
    if (eraId === 'seventies') skyBg = '#042f2e';       // Océano turquesa y cielo cálido
    else if (eraId === 'biblical') skyBg = '#0c4a6e';   // Mar primordial y cielo bíblico
    else if (eraId === 'eighties') skyBg = '#083344';   // Bahía caribeña de resort
    else if (eraId === 'forties') skyBg = '#0f172a';    // Cielo grisáceo bélico
    else if (eraId === 'colombia') skyBg = '#022c22';   // Delta fluvial selvático

    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Aplicar transformación de cámara (Zoom y Posición)
    camera.applyTransform(ctx);

    // 2. Renderizar Cuadrícula Celular Temática
    const w = grid.width;
    const h = grid.height;
    const ts = this.tileSize;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const elem = grid.get(x, y);
        if (elem === ELEM.EMPTY) continue;

        const px = x * ts;
        const py = y * ts;

        // A. AGUA SEGÚN ERA
        if (elem === ELEM.WATER) {
          const wave = Math.sin(x * 0.4 + this.waterTime) * 12;
          if (eraId === 'seventies') {
            // Agua turquesa cristalina tropical
            ctx.fillStyle = `rgb(14, ${185 + Math.floor(wave)}, ${235 + Math.floor(wave)})`;
            ctx.fillRect(px, py, ts, ts);
            if ((x + y + Math.floor(this.waterTime * 2)) % 11 === 0) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.fillRect(px + 2, py + 2, 2, 1);
            }
          } else if (eraId === 'eighties') {
            // Piscina / Bahía caribeña azul brillante
            ctx.fillStyle = `rgb(6, ${170 + Math.floor(wave)}, ${225 + Math.floor(wave)})`;
            ctx.fillRect(px, py, ts, ts);
          } else if (eraId === 'colombia') {
            // Río tropical amazónico / Atrato
            ctx.fillStyle = `rgb(16, ${110 + Math.floor(wave * 0.5)}, ${130 + Math.floor(wave * 0.5)})`;
            ctx.fillRect(px, py, ts, ts);
          } else {
            // Agua azul clásica
            ctx.fillStyle = `rgb(35, ${120 + Math.floor(wave)}, ${210 + Math.floor(wave)})`;
            ctx.fillRect(px, py, ts, ts);
          }
        }

        // B. TIERRA Y CÉSPED SEGÚN ERA (¡CERO MONTONES DE TIERRA SIN SENTIDO!)
        else if (elem === ELEM.DIRT || elem === ELEM.FERTILE_DIRT) {
          if (eraId === 'seventies') {
            // 🌸 PRADERA VERDE FLORIDO DE FESTIVAL (BOB MARLEY / WOODSTOCK)
            const isFertile = (elem === ELEM.FERTILE_DIRT);
            ctx.fillStyle = isFertile ? '#15803d' : '#22c55e'; // Césped vivo esmeralda
            ctx.fillRect(px, py, ts, ts);

            // Flores silvestres y psicodélicas esparcidas
            const flwHash = (x * 37 + y * 53) % 19;
            if (flwHash === 1) {
              ctx.fillStyle = '#ef4444'; // Flor roja
              ctx.fillRect(px + 2, py + 2, 2, 2);
            } else if (flwHash === 2) {
              ctx.fillStyle = '#facc15'; // Flor amarilla rasta
              ctx.fillRect(px + 4, py + 1, 2, 2);
            } else if (flwHash === 3) {
              ctx.fillStyle = '#ec4899'; // Flor rosa hippie
              ctx.fillRect(px + 2, py + 4, 2, 2);
            } else if (flwHash === 4) {
              ctx.fillStyle = '#38bdf8'; // Flor celeste
              ctx.fillRect(px + 3, py + 3, 2, 2);
            } else if (flwHash === 5) {
              ctx.fillStyle = '#8b5cf6'; // Flor morada
              ctx.fillRect(px + 4, py + 3, 2, 2);
            }
          } else if (eraId === 'biblical') {
            // Desierto y limo del Jordán
            if (elem === ELEM.FERTILE_DIRT) {
              ctx.fillStyle = '#365314'; // Limo fértil del oasis
            } else {
              ctx.fillStyle = '#92400e'; // Arcilla cocida por el sol
            }
            ctx.fillRect(px, py, ts, ts);
          } else if (eraId === 'eighties') {
            // Césped de club / hacienda de lujo
            ctx.fillStyle = elem === ELEM.FERTILE_DIRT ? '#15803d' : '#16a34a';
            ctx.fillRect(px, py, ts, ts);
            if ((x * 13 + y * 7) % 23 === 0) {
              ctx.fillStyle = '#ffffff'; // Florecillas de jardín
              ctx.fillRect(px + 3, py + 3, 2, 2);
            }
          } else if (eraId === 'forties') {
            // Barro bélico y fango de trinchera
            ctx.fillStyle = elem === ELEM.FERTILE_DIRT ? '#291b12' : '#3b2514';
            ctx.fillRect(px, py, ts, ts);
          } else if (eraId === 'colombia') {
            // Selva húmeda y barro rojizo de trocha
            if (elem === ELEM.FERTILE_DIRT) {
              ctx.fillStyle = '#14532d'; // Suelo de selva virgen
            } else {
              ctx.fillStyle = '#9a3412'; // Greda rojiza de la trocha
            }
            ctx.fillRect(px, py, ts, ts);
          } else {
            ctx.fillStyle = elem === ELEM.FERTILE_DIRT ? '#3d2314' : '#8b5a2b';
            ctx.fillRect(px, py, ts, ts);
          }
        }

        // C. ARENA
        else if (elem === ELEM.SAND) {
          ctx.fillStyle = eraId === 'biblical' ? '#f59e0b' : '#d4b16a';
          ctx.fillRect(px, py, ts, ts);
          if ((x + y) % 6 === 0) {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(px + 1, py + 2, 3, 1);
          }
        }

        // D. SENDEROS Y CAMINOS SEGÚN ERA
        else if (elem === ELEM.ROAD) {
          if (eraId === 'seventies') {
            // Tablas de madera de cedro para el escenario y el festival
            ctx.fillStyle = '#d97706';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(px, py + ts - 1, ts, 1); // Ranuras de madera
          } else if (eraId === 'eighties') {
            // Asfalto negro de pista de aterrizaje
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(px, py, ts, ts);
            // Pintura de pista de aterrizaje
            if (y % 3 === 1 && x % 4 === 0) {
              ctx.fillStyle = '#facc15';
              ctx.fillRect(px + 1, py + 3, 4, 2);
            }
          } else if (eraId === 'forties') {
            // Tablones de trinchera
            ctx.fillStyle = '#451a03';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px + 1, py, 1, ts);
          } else if (eraId === 'colombia') {
            // Trocha de barro con huellas
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px, py, ts, ts);
            if (x % 3 === 0) {
              ctx.fillStyle = '#451a03';
              ctx.fillRect(px, py + 2, 3, 2);
            }
          } else {
            ctx.fillStyle = '#a38258';
            ctx.fillRect(px, py, ts, ts);
          }
        }

        // E. FUEGO
        else if (elem === ELEM.FIRE) {
          const flicker = Math.random() > 0.5 ? '#ff3b00' : '#ff9500';
          ctx.fillStyle = flicker;
          ctx.fillRect(px, py, ts, ts);
        }

        // F. PLANTAS Y CULTIVOS
        else if (elem === ELEM.PLANT_BLOOM) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
        }

        // G. FOGATAS
        else if (elem === ELEM.CAMPFIRE) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 1, py + 4, ts - 2, 3);
          const flameColor = Math.random() > 0.4 ? '#f97316' : '#facc15';
          ctx.fillStyle = flameColor;
          ctx.fillRect(px + 2, py + 1, ts - 4, ts - 3);
        }

        // H. TRONCOS / MADERA
        else if (elem === ELEM.WOOD) {
          ctx.fillStyle = '#854d0e';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#a16207';
          ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
        }

        // I. ORO Y RELIQUIAS
        else if (elem === ELEM.GOLD) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
        }

        // J. EDIFICIOS SEGÚN ERA
        else if (elem === ELEM.BUILDING) {
          if (eraId === 'eighties') {
            // Muro blanco de mansión / hacienda con remate teja roja
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(px, py, ts, 2);
          } else if (eraId === 'forties') {
            // Hormigón armado de búnker
            ctx.fillStyle = '#475569';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#334155';
            ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
          } else if (eraId === 'seventies') {
            // Madera de carpa / pabellón bohemio
            ctx.fillStyle = '#b45309';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
          } else {
            ctx.fillStyle = '#573319';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#854d0e';
            ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
          }
        }

        // K. CENIZAS
        else if (elem === ELEM.ASH) {
          ctx.fillStyle = '#475569';
          ctx.fillRect(px, py, ts, ts);
        }

        // L. GRIETAS TECTÓNICAS Y ESCOMBROS
        else if (elem === ELEM.CHASM) {
          ctx.fillStyle = '#020617';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
          if (Math.random() < 0.2) {
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(px + 2, py + 2, 2, 2);
          }
        } else if (elem === ELEM.RUBBLE) {
          ctx.fillStyle = '#374151';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#9ca3af';
          ctx.fillRect(px + 1, py + 1, 3, 3);
          ctx.fillRect(px + 4, py + 3, 3, 3);
        } else {
          ctx.fillStyle = ELEM_PROPS[elem]?.color || '#fff';
          ctx.fillRect(px, py, ts, ts);
        }
      }
    }

    // 3. Renderizar Estructuras y Decorados Temáticos Icónicos de la Era
    this.renderEraLandmarks(ctx, grid, eraId);

    // 4. Renderizar Conos de Visión de Policías y Patrullas
    for (const npc of npcs) {
      if (npc.type === 'police' || npc.type === 'police_cuadrante') {
        sprites.drawVisionCone(ctx, npc.x, npc.y, npc.direction);
      }
    }

    // 5. Renderizar Edificios con Nombres
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    for (const b of grid.buildingLocations) {
      // Sombra de texto
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(b.name, b.x * ts + 12 + 1, b.y * ts - 4 + 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.name, b.x * ts + 12, b.y * ts - 4);
    }

    // 4. Renderizar Animales de la Isla
    for (const animal of animals) {
      animal.draw(ctx);
    }

    // 5. Renderizar NPCs con AnimationManager (soporta tanto procedural como SpriteSheets externos)
    const sortedNpcs = [...npcs].sort((a, b) => a.y - b.y);
    for (const npc of sortedNpcs) {
      const isPossessed = (possessedNpc && possessedNpc.id === npc.id);
      const isMoving = Math.abs(npc.vx || 0) > 0.05 || Math.abs(npc.vy || 0) > 0.05;

      const nTx = Math.floor((npc.x + 8) / ts);
      const nTy = Math.floor((npc.y + 13) / ts);
      const inWater = (grid.get(nTx, nTy) === ELEM.WATER);

      animManager.draw(
        ctx,
        npc.type,
        npc.x,
        npc.y,
        npc.direction,
        npc.frame,
        isMoving,
        npc.cargo > 0,
        isPossessed,
        npc.isSwimming,
        inWater
      );

      // Icono de alerta (!) si el policía está persiguiendo
      if (npc.alerted) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('!', npc.x + 8, npc.y - 6);
      }

      // 💭 Bocadillo de pensamiento emergente sobre la cabeza del aldeano
      if (npc.brain && npc.brain.bubbleText) {
        ctx.save();
        ctx.font = '7px sans-serif';
        const text = npc.brain.bubbleText;
        const textMetrics = ctx.measureText(text);
        const pad = 3;
        const bw = textMetrics.width + pad * 2;
        const bh = 11;
        const bx = Math.floor(npc.x + 8 - bw / 2);
        const by = Math.floor(npc.y - 15);

        // Caja de diálogo flotante
        ctx.fillStyle = 'rgba(254, 252, 232, 0.94)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        // Puntos de pensamiento hacia la cabeza
        ctx.fillStyle = 'rgba(254, 252, 232, 0.94)';
        ctx.fillRect(npc.x + 7, by + bh, 2, 2);

        // Texto del pensamiento
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(text, npc.x + 8, by + 8);
        ctx.restore();
      }
    }

    // 5. Renderizar Efectos Visuales VFX (Vórtice mágico, ondas de choque, chispas)
    vfx.render(ctx);

    // 5. Retícula Divina del Mouse (Solo en Modo Dios)
    if (!possessedNpc && mouseWorldPos) {
      const targetTileX = Math.floor(mouseWorldPos.x / ts);
      const targetTileY = Math.floor(mouseWorldPos.y / ts);
      const r = brushRadius * ts;

      ctx.save();
      ctx.strokeStyle = currentTool === 'possess' ? '#facc15' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(targetTileX * ts + ts / 2, targetTileY * ts + ts / 2, r, 0, Math.PI * 2);
      ctx.stroke();

      if (currentTool === 'possess') {
        ctx.fillStyle = '#facc15';
        ctx.font = '9px sans-serif';
        ctx.fillText('👁️ SELECCIONAR PARA POSEER', targetTileX * ts + ts / 2, targetTileY * ts - r - 6);
      }
      ctx.restore();
    }

    camera.restoreTransform(ctx);
  }

  // 🏛️ Renderizado de Estructuras y Decorados Temáticos Icónicos por Era
  renderEraLandmarks(ctx, grid, eraId) {
    const ts = this.tileSize;

    for (const b of grid.buildingLocations) {
      const bx = b.x * ts;
      const by = b.y * ts;

      // ☮️ AÑOS 70: ESCENARIO MUSICAL DE BOB MARLEY & FESTIVAL
      if (b.name.includes("Escenario de Bob Marley")) {
        ctx.save();
        // Tarima de concierto de madera noble
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bx - 4, by - 6, 32, 18);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx - 4, by - 6, 32, 18);

        // Gran Bandera Rasta (Rojo, Amarillo, Verde) de fondo
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx - 2, by - 12, 28, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(bx - 2, by - 10, 28, 2);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(bx - 2, by - 8, 28, 2);

        // Mástiles de la bandera
        ctx.fillStyle = '#475569';
        ctx.fillRect(bx - 3, by - 13, 2, 8);
        ctx.fillRect(bx + 25, by - 13, 2, 8);

        // Torres de Amplificadores (Speakers) a la izquierda y derecha
        // Torre Izquierda
        ctx.fillStyle = '#18181b';
        ctx.fillRect(bx - 8, by - 4, 6, 12);
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(bx - 5, by - 1, 2, 0, Math.PI * 2);
        ctx.arc(bx - 5, by + 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Led rojo encendido
        ctx.fillRect(bx - 7, by - 3, 1, 1);

        // Torre Derecha
        ctx.fillStyle = '#18181b';
        ctx.fillRect(bx + 26, by - 4, 6, 12);
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(bx + 29, by - 1, 2, 0, Math.PI * 2);
        ctx.arc(bx + 29, by + 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 27, by - 3, 1, 1);

        // Micrófono en el centro
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx + 11, by - 2, 1, 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(bx + 10, by - 3, 3, 2); // Cabeza dorada del mic

        // Notas musicales flotantes animadas
        const noteBob = Math.sin(this.waterTime * 2) * 3;
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('♪', bx + 6, by - 14 + noteBob);
        ctx.fillStyle = '#67e8f9';
        ctx.fillText('♫', bx + 18, by - 16 - noteBob);

        ctx.restore();
      }

      // 🏕️ CARPAS HIPPIES / COMUNA DE PAZ
      else if (b.name.includes("Carpa Sanadora") || b.name.includes("Comuna de Paz") || b.name.includes("Taller de Guitarras")) {
        ctx.save();
        // Toldo bohemio triangular a rayas
        ctx.beginPath();
        ctx.moveTo(bx - 2, by + 12);
        ctx.lineTo(bx + 10, by - 6);
        ctx.lineTo(bx + 22, by + 12);
        ctx.closePath();
        ctx.fillStyle = b.name.includes("Carpa") ? '#f472b6' : '#38bdf8';
        ctx.fill();

        // Rayas de colores del tipi
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(bx + 4, by + 12);
        ctx.lineTo(bx + 10, by - 6);
        ctx.lineTo(bx + 16, by + 12);
        ctx.fill();

        // Símbolo de Paz en la entrada
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.fillText('☮', bx + 10, by + 10);
        ctx.restore();
      }

      // 🏊 80s: PISCINA DEL CAPO
      else if (b.name.includes("Piscina del Capo")) {
        ctx.save();
        // Borde blanco de azulejos
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 6, by - 4, 38, 24);

        // Trampolín de salto
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(bx - 8, by + 4, 5, 2);

        // Sombrilla de playa a rayas roja y blanca
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx + 34, by - 2, 6, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + 32, by - 8, 4, 6);
        ctx.fillStyle = '#78350f'; // Palo
        ctx.fillRect(bx + 33, by - 2, 2, 7);

        // Reposera / Tumbona
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 28, by + 14, 8, 3);
        ctx.restore();
      }

      // ✈️ 80s: PISTA DE ATERRIZAJE (Avioneta Clandestina aparcada)
      else if (b.name.includes("Hangar Clandestino")) {
        ctx.save();
        // Avioneta bimotor blanca
        ctx.fillStyle = '#f8fafc';
        // Fuselaje
        ctx.fillRect(bx - 4, by - 2, 16, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx - 4, by, 16, 1); // Franja roja
        // Alas
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bx + 3, by - 8, 4, 17);
        // Hélices giratorias
        ctx.fillStyle = '#facc15';
        const propSpin = Math.floor(this.waterTime * 15) % 2 === 0;
        ctx.fillRect(bx + 4, by - 9, 2, propSpin ? 4 : 1);
        ctx.fillRect(bx + 4, by + 9, 2, propSpin ? 4 : 1);
        ctx.restore();
      }

      // 🕊️ BÍBLICA: ALTAR SAGRADO DE DIOS
      else if (b.name.includes("Altar Sagrado")) {
        ctx.save();
        // Gradas de piedra ceremonial
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 6, by + 2, 24, 6);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx - 3, by - 2, 18, 5);

        // Reliquia del Arca de Oro resplandeciente
        ctx.fillStyle = '#facc15';
        ctx.fillRect(bx, by - 6, 12, 5);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx + 2, by - 8, 8, 3);

        // Humo sagrado de incienso ascendiendo
        const smokeY = (this.waterTime * 8) % 18;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(bx + 6 + Math.sin(smokeY * 0.5) * 3, by - 10 - smokeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ⚔️ 40s: HOSPITAL MILITAR CON CRUZ ROJA
      else if (b.name.includes("Hospital Militar")) {
        ctx.save();
        // Carpa militar verde oliva
        ctx.fillStyle = '#374151';
        ctx.fillRect(bx - 4, by - 4, 24, 18);
        ctx.strokeStyle = '#1f2937';
        ctx.strokeRect(bx - 4, by - 4, 24, 18);

        // Gran Cruz Roja médica en el techo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + 4, by + 1, 8, 8);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(bx + 7, by + 2, 2, 6);
        ctx.fillRect(bx + 5, by + 4, 6, 2);
        ctx.restore();
      }

      // ⚔️ 40s: TRINCHERAS CON SACOS DE ARENA Y ALAMBRADAS
      else if (b.name.includes("Trincheras")) {
        ctx.save();
        ctx.fillStyle = '#ca8a04'; // Sacos de arena
        for (let sx = 0; sx < 28; sx += 7) {
          ctx.fillRect(bx - 12 + sx, by - 3, 6, 3);
        }
        // Alambrada de púas (X cruzadas)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        for (let ax = 0; ax < 24; ax += 8) {
          ctx.beginPath();
          ctx.moveTo(bx - 10 + ax, by - 7);
          ctx.lineTo(bx - 6 + ax, by - 3);
          ctx.moveTo(bx - 6 + ax, by - 7);
          ctx.lineTo(bx - 10 + ax, by - 3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 🇨🇴 COLOMBIA: TIENDA DE DOÑA GLORIA Y BILLAR
      else if (b.name.includes("Tienda y Billar")) {
        ctx.save();
        // Mesa de billar verde profesional
        ctx.fillStyle = '#15803d'; // Paño verde
        ctx.fillRect(bx + 14, by + 2, 12, 8);
        ctx.strokeStyle = '#78350f'; // Borde de madera
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 14, by + 2, 12, 8);

        // Bolas de billar (Blanca, Amarilla, Roja)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + 17, by + 4, 2, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(bx + 20, by + 6, 2, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 22, by + 4, 2, 2);

        // Canastas de cerveza / gaseosa
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(bx - 6, by + 4, 5, 5);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx - 5, by + 5, 3, 3);
        ctx.restore();
      }

      // 🇨🇴 COLOMBIA: CAMPAMENTO GUERRILLERO EN EL MONTE
      else if (b.name.includes("Campamento del Monte")) {
        ctx.save();
        // Techo de plástico / carpa camuflada entre la selva
        ctx.fillStyle = '#365314';
        ctx.fillRect(bx - 4, by - 6, 26, 8);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(bx - 2, by - 4, 22, 4);

        // Olla gigante / paila comunitaria sobre la fogata
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(bx + 9, by + 7, 4, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#facc15'; // Maíz / sancocho hirviendo
        ctx.fillRect(bx + 7, by + 6, 4, 1);
        ctx.restore();
      }

      // 🇨🇴 COLOMBIA: RETÉN EN LA TROCHA
      else if (b.name.includes("Retén en la Trocha")) {
        ctx.save();
        // Pila de llantas negras
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 6, by - 4, 5, 8);
        ctx.fillRect(bx + 14, by - 4, 5, 8);

        // Barra del retén rayada (Blanca y Roja)
        for (let i = 0; i < 20; i += 4) {
          ctx.fillStyle = (i % 8 === 0) ? '#ffffff' : '#dc2626';
          ctx.fillRect(bx - 3 + i, by, 4, 2);
        }
        ctx.restore();
      }

      // 🇨🇴 COLOMBIA: MUELLE DE CANOAS
      else if (b.name.includes("Muelle de Canoas")) {
        ctx.save();
        // Canoa de madera alargada en el agua
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.ellipse(bx + 4, by + 6, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx + 1, by + 5, 6, 2); // Interior hueco de la canoa
        ctx.restore();
      }
    }
  }
}
