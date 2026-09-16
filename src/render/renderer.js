import { ELEM, ELEM_PROPS } from '../sim/elements.js';
import { animManager } from './animationManager.js?v=20260912_minish_sprites_v2';
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
    else if (eraId === 'hyrule') skyBg = '#0369a1';     // Cielo azul puro de Hyrule / Minish

    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Aplicar transformación de cámara (Zoom y Posición)
    camera.applyTransform(ctx);

    // 2. Renderizar Cuadrícula Celular Temática
    const w = grid.width;
    const h = grid.height;
    const ts = this.tileSize;
    const treeCanopies = []; // Registrar copas elevadas de árboles para pase Y-Sort

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const elem = grid.get(x, y);
        if (elem === ELEM.EMPTY) continue;

        const px = x * ts;
        const py = y * ts;

        // A. AGUA SEGÚN ERA
        // A. AGUA MINISH CAP (AZUL LUMINOSO CON RELIEVE Y ONDAS)
        if (elem === ELEM.WATER) {
          const wave = Math.sin(x * 0.45 + this.waterTime) * 14;
          ctx.fillStyle = `rgb(36, ${145 + Math.floor(wave)}, ${235 + Math.floor(wave)})`;
          ctx.fillRect(px, py, ts, ts);

          // Destello y espuma de agua
          if ((x * 17 + y * 23 + Math.floor(this.waterTime * 3)) % 11 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.fillRect(px + 2, py + 2, 3, 1);
            ctx.fillRect(px + 3, py + 1, 1, 3);
          }

          // 🌊 Relieve y Profundidad del Canal (Efecto de agua hundida 2.5D)
          const upElem = grid.get(x, y - 1);
          if (upElem !== ELEM.WATER && upElem !== ELEM.EMPTY) {
            ctx.fillStyle = 'rgba(10, 20, 40, 0.55)';
            ctx.fillRect(px, py, ts, 2); // Sombra profunda del borde
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(px, py + 2, ts, 1); // Borde de luz / espuma
          }
          const leftElem = grid.get(x - 1, y);
          if (leftElem !== ELEM.WATER && leftElem !== ELEM.EMPTY) {
            ctx.fillStyle = 'rgba(10, 20, 40, 0.45)';
            ctx.fillRect(px, py, 2, ts);
          }
        }

        // B. CÉSPED Y TIERRA ESTILO THE MINISH CAP (PIXEL ART GBA VIBRANTE CON BRIZNAS Y FLORES)
        else if (elem === ELEM.DIRT || elem === ELEM.FERTILE_DIRT) {
          let grassBase = '#60bc14';
          let grassLight = '#80d426';
          let grassDark = '#489c0c';

          if (eraId === 'colombia') {
            // Selva tropical Minish Cap
            grassBase = elem === ELEM.FERTILE_DIRT ? '#22a01a' : '#52b018';
            grassLight = '#78ce28';
            grassDark = '#1c7812';
          } else if (eraId === 'seventies') {
            // Pradera florida de festival
            grassBase = '#6ac418';
            grassLight = '#90e430';
            grassDark = '#4fa010';
          } else if (eraId === 'biblical') {
            // Oasis fértil del Edén
            grassBase = elem === ELEM.FERTILE_DIRT ? '#58b414' : '#68bc18';
            grassLight = '#7ecc24';
            grassDark = '#40880c';
          } else if (eraId === 'eighties') {
            // Jardines de hacienda
            grassBase = '#48b016';
            grassLight = '#6ecc24';
            grassDark = '#34880e';
          } else if (eraId === 'forties') {
            // Pradera rural europea
            grassBase = elem === ELEM.FERTILE_DIRT ? '#529e16' : '#689632';
            grassLight = '#72b422';
            grassDark = '#3a720e';
          }

          ctx.fillStyle = grassBase;
          ctx.fillRect(px, py, ts, ts);

          // Textura sutil pixel art Minish (briznas de hierba en V)
          const tileHash = (x * 41 + y * 67) % 7;
          if (tileHash === 1) {
            ctx.fillStyle = grassLight;
            ctx.fillRect(px + 2, py + 1, 1, 3);
            ctx.fillRect(px + 5, py + 2, 1, 2);
            ctx.fillStyle = grassDark;
            ctx.fillRect(px + 2, py + 4, 1, 1);
          } else if (tileHash === 2) {
            ctx.fillStyle = grassLight;
            ctx.fillRect(px + 3, py + 2, 2, 2);
            ctx.fillStyle = grassDark;
            ctx.fillRect(px + 4, py + 4, 1, 2);
          }

          // Florecillas silvestres de 4 pétalos Minish Cap (Image 1 y 4)
          const flwHash = (x * 73 + y * 97) % 23;
          if (flwHash === 1) {
            // Flor roja con centro amarillo
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(px + 2, py + 2, 3, 3);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(px + 3, py + 3, 1, 1);
          } else if (flwHash === 2) {
            // Flor celeste brillante
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(px + 3, py + 3, 3, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 4, py + 4, 1, 1);
          } else if (flwHash === 3) {
            // Flor amarilla dorada
            ctx.fillStyle = '#facc15';
            ctx.fillRect(px + 2, py + 3, 2, 2);
          } else if (flwHash === 4) {
            // Flor blanca de manzanilla
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 4, py + 2, 2, 2);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(px + 4, py + 2, 1, 1);
          }
        }

        // C. TIERRA / CLARO DE ARENA MINISH CAP (CON BORDES DENTADOS DE CÉSPED)
        else if (elem === ELEM.SAND) {
          ctx.fillStyle = '#e2b652';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#ca9838';
          ctx.fillRect(px + 1, py + 3, 4, 2);
          ctx.fillStyle = '#f4cb6e';
          ctx.fillRect(px + 3, py + 1, 3, 2);

          // Flecos de césped cayendo sobre la arena si el bloque de arriba es hierba
          const u = grid.get(x, y - 1);
          if (u === ELEM.DIRT || u === ELEM.FERTILE_DIRT) {
            ctx.fillStyle = '#60bc14';
            ctx.fillRect(px, py, 2, 2);
            ctx.fillRect(px + 4, py, 3, 2);
            ctx.fillRect(px + 1, py + 2, 1, 1);
            ctx.fillRect(px + 5, py + 2, 1, 1);
          }
        }

        // D. CAMINO DE ADOQUINES DE PIEDRA MINISH CAP (Image 1 y 3)
        else if (elem === ELEM.ROAD) {
          ctx.fillStyle = '#e2e8f0'; // Loseta de piedra clara
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#f8fafc'; // Brillo superior
          ctx.fillRect(px + 1, py + 1, ts - 2, 1);
          ctx.fillStyle = '#94a3b8'; // Sombra y junta inferior
          ctx.fillRect(px, py + ts - 1, ts, 1);
          ctx.fillRect(px + ts - 1, py, 1, ts);
          ctx.fillStyle = '#cbd5e1'; // Textura de piedra
          ctx.fillRect(px + 2, py + 2, 3, 3);
          if ((x + y) % 3 === 0) {
            ctx.fillStyle = '#64748b'; // Grieta en la piedra
            ctx.fillRect(px + 1, py + 4, 1, 2);
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
        }

        // M. 🧱 ACANTILADO / MURO DE PIEDRA MINISH CAP (CON VOLUMEN 2.5D, SILLERÍA Y CÉSPED COLGANTE)
        else if (elem === ELEM.CLIFF) {
          // Fondo de piedra labrada
          ctx.fillStyle = '#786856';
          ctx.fillRect(px, py, ts, ts);

          // Sillares de piedra individuales con luces y sombras
          ctx.fillStyle = '#948472';
          ctx.fillRect(px + 1, py + 2, 3, 2);
          ctx.fillRect(px + 5, py + 4, 2, 2);
          ctx.fillStyle = '#5c4e40'; // Juntas de mortero
          ctx.fillRect(px, py + 3, ts, 1);
          ctx.fillRect(px + 4, py, 1, 3);
          ctx.fillRect(px + 2, py + 4, 1, 4);

          // Enredaderas o musgo verde colgante
          if ((x * 29 + y * 43) % 5 === 0) {
            ctx.fillStyle = '#389812';
            ctx.fillRect(px + 3, py + 2, 2, 4);
            ctx.fillStyle = '#68c418';
            ctx.fillRect(px + 3, py + 3, 1, 2);
          }

          // Canto superior con alero de césped si el bloque de arriba no es risco
          const upTile = grid.get(x, y - 1);
          if (upTile !== ELEM.CLIFF) {
            ctx.fillStyle = '#60bc14';
            ctx.fillRect(px, py, ts, 2);
            // Flecos de césped goteando sobre la piedra
            ctx.fillStyle = '#80d426';
            ctx.fillRect(px + 1, py + 2, 2, 1);
            ctx.fillRect(px + 5, py + 2, 2, 1);
          }

          // Sombra arrojada al pie del acantilado sobre el suelo inferior
          const downTile = grid.get(x, y + 1);
          if (downTile !== ELEM.CLIFF) {
            ctx.fillStyle = 'rgba(10, 20, 30, 0.48)';
            ctx.fillRect(px, py + ts - 2, ts, 2);
          }
        }

        // N. 🪜 ESCALERA DE MANO DE MADERA MINISH CAP (TRANSIBILE SOBRE RISCOS)
        else if (elem === ELEM.LADDER) {
          // Muro de piedra de fondo
          ctx.fillStyle = '#786856';
          ctx.fillRect(px, py, ts, ts);

          // Largueros verticales de madera
          ctx.fillStyle = '#451a03'; // Sombra de larguero
          ctx.fillRect(px + 1, py, 2, ts);
          ctx.fillRect(px + 5, py, 2, ts);
          ctx.fillStyle = '#854d0e'; // Madera iluminada
          ctx.fillRect(px + 1, py, 1, ts);
          ctx.fillRect(px + 5, py, 1, ts);

          // Peldaños dorados con relieve
          for (let ly = 1; ly < ts; ly += 3) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillRect(px + 2, py + ly + 1, 4, 1); // Sombra
            ctx.fillStyle = '#d97706';
            ctx.fillRect(px + 2, py + ly, 4, 1); // Peldaño
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(px + 2, py + ly, 2, 1); // Reflejo
          }
        }

        // O. 🪵 CERCA DE MADERA CON POSTES Y RIELES (THE MINISH CAP)
        else if (elem === ELEM.FENCE) {
          // Sombra suave en el suelo bajo el poste
          ctx.fillStyle = 'rgba(10, 25, 15, 0.38)';
          ctx.beginPath();
          ctx.ellipse(px + 4, py + 7, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Travesaños horizontales dobles
          ctx.fillStyle = '#5c2d12'; // Sombra del riel
          ctx.fillRect(px, py + 3, ts, 1);
          ctx.fillRect(px, py + 6, ts, 1);
          ctx.fillStyle = '#b45309'; // Riel de madera
          ctx.fillRect(px, py + 2, ts, 1);
          ctx.fillRect(px, py + 5, ts, 1);

          // Poste de madera vertical torneado con remate
          ctx.fillStyle = '#5c2d12';
          ctx.fillRect(px + 2, py + 1, 4, 6);
          ctx.fillStyle = '#a16207';
          ctx.fillRect(px + 2, py + 2, 4, 5);
          ctx.fillStyle = '#fde68a'; // Brillo en la cabeza del poste
          ctx.fillRect(px + 3, py + 1, 2, 1);
        }

        // P. 🌳 ÁRBOL FRONDOSO VOLUMÉTRICO (The Minish Cap)
        else if (elem === ELEM.TREE) {
          // Sombra elíptica suave en el suelo bajo la copa
          ctx.fillStyle = 'rgba(10, 25, 15, 0.42)';
          ctx.beginPath();
          ctx.ellipse(px + 4, py + 7, 14, 5.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Raíces y base del tronco de madera (con colisión física en los pies)
          // Raíz izquierda y derecha
          ctx.fillStyle = '#3e1c08'; // Sombra de raíz
          ctx.fillRect(px - 2, py + 5, 4, 3);
          ctx.fillRect(px + 6, py + 5, 4, 3);
          ctx.fillStyle = '#5c2d12'; // Madera noble
          ctx.fillRect(px - 1, py + 4, 3, 3);
          ctx.fillRect(px + 6, py + 4, 3, 3);

          // Tronco central
          ctx.fillStyle = '#3e1c08';
          ctx.fillRect(px + 1, py, 6, 7);
          ctx.fillStyle = '#5c2d12';
          ctx.fillRect(px + 2, py, 4, 7);
          ctx.fillStyle = '#854d0e'; // Brillo en la corteza
          ctx.fillRect(px + 3, py + 1, 2, 5);

          // Registrar la copa elevada para el pase unificado Y-Sort
          treeCanopies.push({
            x: px,
            y: py,
            gridX: x,
            gridY: y
          });
        }

        // Q. 🏰 MURALLA DE CASTILLO / ALMENAS MINISH CAP (Fortaleza perimetral)
        else if (elem === ELEM.WALL) {
          // Fondo de sillería de cantería
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px, py, ts, ts);

          // Sillares de piedra individuales con luces
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(px + 1, py + 2, ts - 2, ts - 3);
          ctx.fillStyle = '#f1f5f9'; // Remate superior de coronación
          ctx.fillRect(px, py + 1, ts, 1);

          // Almenas / Merlones (almenas en columnas pares)
          const isMerlon = (x % 2 === 0);
          if (isMerlon) {
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(px + 1, py - 3, ts - 2, 4);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(px + 1, py - 3, ts - 2, 1);
            ctx.fillStyle = '#475569';
            ctx.fillRect(px + ts - 2, py - 3, 1, 4);
          }

          // Juntas de mortero
          ctx.fillStyle = '#475569';
          ctx.fillRect(px, py + 4, ts, 1);
          ctx.fillRect(px + 3, py + 1, 1, 3);
          ctx.fillRect(px + 5, py + 5, 1, 3);

          // Sombra arrojada al pie de la muralla
          const downTile = grid.get(x, y + 1);
          if (downTile !== ELEM.WALL) {
            ctx.fillStyle = 'rgba(10, 20, 30, 0.48)';
            ctx.fillRect(px, py + ts - 2, ts, 2);
          }
        }

        // R. ⛲ FUENTE DE MÁRMOL DE PLAZA MINISH CAP
        else if (elem === ELEM.FOUNTAIN) {
          // Sombra de la taza
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.beginPath();
          ctx.ellipse(px + 4, py + 7, 5, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Taza de mármol blanco
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(px, py + 1, ts, ts - 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px, py + 1, ts, 1); // Canto superior brillante
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(px, py + ts - 2, ts, 1);

          // Agua cristalina interior
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(px + 1, py + 2, ts - 2, ts - 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 2, py + 2, ts - 4, 1);

          // Chorro animado de agua
          const fH = Math.floor((this.waterTime * 12) % 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 3, py - 2 - fH, 2, 3 + fH);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(px + 2, py - 1 - fH, 4, 1);
        }

        // S. 🎪 PUESTO DE MERCADO CON TOLDO A RAYAS (The Minish Cap)
        else if (elem === ELEM.MARKET) {
          // Toldo textil ondeante a rayas rojas y blancas / amarillas
          const isRed = (x % 2 === 0);
          ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
          ctx.fillRect(px, py, ts, 4);
          ctx.fillStyle = isRed ? '#b91c1c' : '#f1f5f9';
          ctx.fillRect(px, py + 4, ts, 1); // Cenefa festoneada

          // Mostrador de madera
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px, py + 5, ts, 3);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(px, py + 5, ts, 1);

          // Mercancías (jarrones, frutas, gemas)
          const pHash = (x * 13) % 4;
          if (pHash === 0) {
            ctx.fillStyle = '#38bdf8'; // Vasija azul
            ctx.fillRect(px + 1, py + 3, 2, 2);
            ctx.fillStyle = '#facc15'; // Manzanas doradas
            ctx.fillRect(px + 4, py + 3, 2, 2);
          } else if (pHash === 1) {
            ctx.fillStyle = '#10b981'; // Cántaro verde
            ctx.fillRect(px + 2, py + 2, 3, 3);
          } else {
            ctx.fillStyle = '#ec4899'; // Tejidos
            ctx.fillRect(px + 1, py + 3, 3, 2);
            ctx.fillStyle = '#f97316'; // Frutas
            ctx.fillRect(px + 5, py + 3, 2, 2);
          }
        }

        // T. 🌺 JARDINERA / PARTERRE CON BORDILLO DE PIEDRA BLANCA
        else if (elem === ELEM.FLOWER_BED) {
          ctx.fillStyle = '#3d2314'; // Tierra fértil
          ctx.fillRect(px, py, ts, ts);

          // Bordillos de piedra blanca labrada
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px, py, ts, 1);
          ctx.fillRect(px, py + ts - 1, ts, 1);
          ctx.fillRect(px, py, 1, ts);
          ctx.fillRect(px + ts - 1, py, 1, ts);

          // Racimos densos de flores de 4 pétalos Minish Cap
          const bHash = (x * 23 + y * 47) % 3;
          if (bHash === 0) {
            ctx.fillStyle = '#ef4444'; // Flor roja
            ctx.fillRect(px + 2, py + 2, 2, 2);
            ctx.fillRect(px + 4, py + 4, 2, 2);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(px + 3, py + 3, 1, 1);
          } else if (bHash === 1) {
            ctx.fillStyle = '#38bdf8'; // Flor azul zafiro
            ctx.fillRect(px + 2, py + 3, 2, 2);
            ctx.fillRect(px + 4, py + 2, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 3, py + 3, 1, 1);
          } else {
            ctx.fillStyle = '#facc15'; // Flor amarilla
            ctx.fillRect(px + 3, py + 3, 3, 3);
            ctx.fillStyle = '#f97316';
            ctx.fillRect(px + 4, py + 4, 1, 1);
          }
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
      if (b.showName === false || !b.name) continue;
      const bCenterX = b.x * ts + (b.w ? (b.w * ts) / 2 : 12);
      // Sombra de texto
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(b.name, bCenterX + 1, b.y * ts - 4 + 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.name, bCenterX, b.y * ts - 4);
    }

    // 6. Renderizado Unificado con Ordenación Y (Y-Sorting para Profundidad 2.5D Real)
    // Agrupa NPCs, Animales y Copas de Árboles para que los objetos detrás se oculten naturalmente
    const renderList = [];

    for (const npc of npcs) {
      renderList.push({ type: 'npc', sortY: npc.y + 13, item: npc });
    }
    for (const animal of animals) {
      renderList.push({ type: 'animal', sortY: animal.y + 12, item: animal });
    }
    for (const tree of treeCanopies) {
      // El punto de clasificación es la base del tronco (y + 7)
      renderList.push({ type: 'tree', sortY: tree.y + 7, item: tree });
    }

    renderList.sort((a, b) => a.sortY - b.sortY);

    for (const obj of renderList) {
      if (obj.type === 'tree') {
        this.drawMinishTreeCanopy(ctx, obj.item.x, obj.item.y, obj.item.gridX, obj.item.gridY);
      } else if (obj.type === 'animal') {
        obj.item.draw(ctx);
      } else if (obj.type === 'npc') {
        const npc = obj.item;
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

      // 👑 Distintivo de Líder de la Civilización
      if (npc.brain && npc.brain.isLeader) {
        ctx.save();
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', npc.x + 8, npc.y - 4);
        ctx.restore();
      }

      // 🎭 Icono Flotante de Emoción y Estado (🦁 Gallardía, 😱 Susto/Pánico, 💤 Descanso, ✨ Éxtasis)
      if (npc.brain && npc.brain.emotionIcon) {
        ctx.save();
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        const emoteY = npc.y - (npc.brain.isLeader ? 15 : 6);
        ctx.fillText(npc.brain.emotionIcon, npc.x + (npc.brain.isLeader ? 15 : 8), emoteY);
        ctx.restore();
      }

      // ⚠️ Alerta de Inanición Crítica
      if (npc.brain && npc.brain.needs && npc.brain.needs.health < 35) {
        ctx.save();
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️', npc.x + 8, npc.y - (npc.brain.isLeader ? 14 : 6));
        ctx.restore();
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

      // 🗡️ ALDEA MINISH: CABAÑA DE TEJADO AZUL (The Minish Cap)
      else if (b.name.includes("Cabaña de la Aldea")) {
        ctx.save();
        // Sombra arrojada de la casa hacia el sureste
        ctx.fillStyle = 'rgba(10, 20, 15, 0.35)';
        ctx.beginPath();
        ctx.ellipse(bx + 26, by + 26, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fachada de la casa (pared blanca estucada con vigas de madera)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(bx - 4, by + 10, 48, 16);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx - 4, by + 10, 48, 16);
        // Vigas de madera verticales
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx - 4, by + 10, 2, 16);
        ctx.fillRect(bx + 42, by + 10, 2, 16);
        ctx.fillRect(bx + 14, by + 10, 2, 16);
        ctx.fillRect(bx + 24, by + 10, 2, 16);

        // Puerta principal arqueada de roble
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(bx + 17, by + 15, 7, 11);
        ctx.fillStyle = '#facc15'; // Manija dorada
        ctx.fillRect(bx + 22, by + 20, 1, 2);
        // Escalón de piedra frontal
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx + 15, by + 25, 11, 2);

        // Jardineras con flores bajo las ventanas laterales
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(bx, by + 20, 10, 3);
        ctx.fillRect(bx + 30, by + 20, 10, 3);
        // Flores de colores
        ctx.fillStyle = '#ef4444'; ctx.fillRect(bx + 2, by + 18, 2, 2);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(bx + 6, by + 18, 2, 2);
        ctx.fillStyle = '#facc15'; ctx.fillRect(bx + 32, by + 18, 2, 2);
        ctx.fillStyle = '#ec4899'; ctx.fillRect(bx + 36, by + 18, 2, 2);

        // Tejado Azul Zafiro a dos aguas con cumbrera
        ctx.fillStyle = '#1e40af'; // Sombra del alero
        ctx.fillRect(bx - 8, by + 8, 56, 3);
        ctx.fillStyle = '#1d4ed8'; // Pendiente de tejado
        ctx.fillRect(bx - 6, by - 4, 52, 12);
        ctx.fillStyle = '#3b82f6'; // Franja iluminada
        ctx.fillRect(bx - 4, by - 8, 48, 5);
        ctx.fillStyle = '#60a5fa'; // Cumbrera superior
        ctx.fillRect(bx - 2, by - 10, 44, 3);

        // Chimenea de ladrillos rojos con humo animado
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx + 6, by - 15, 6, 9);
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(bx + 5, by - 16, 8, 2); // Remate superior
        // Humo blanco ascendente
        const smokeH = (this.waterTime * 10) % 18;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(bx + 9 + Math.sin(smokeH * 0.4) * 3, by - 18 - smokeH, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 🗡️ ALDEA MINISH: POZO DE PIEDRA CON CUBO
      else if (b.name.includes("Pozo de Piedra")) {
        ctx.save();
        // Sombra
        ctx.fillStyle = 'rgba(10, 20, 15, 0.35)';
        ctx.beginPath();
        ctx.ellipse(bx + 6, by + 10, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brocal circular de sillería de piedra
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(bx + 6, by + 6, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(bx + 6, by + 4, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Agua en el fondo
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(bx + 6, by + 4, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Estructura de madera con polea
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx - 1, by - 4, 2, 10); // Poste izq
        ctx.fillRect(bx + 11, by - 4, 2, 10); // Poste der
        ctx.fillRect(bx - 2, by - 5, 16, 2); // Travesaño
        // Cuerda y cubo
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bx + 5, by - 4, 1, 5); // Cuerda
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bx + 4, by + 1, 3, 3); // Cubo

        ctx.restore();
      }

      // 🗡️ ALDEA MINISH: PUENTE DEL CANAL CON BARANDILLAS
      else if (b.name.includes("Puente del Canal")) {
        ctx.save();
        // Barandillas de madera en los extremos
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx - 8, by - 6, 32, 2);
        ctx.fillRect(bx - 8, by + 12, 32, 2);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(bx - 8, by - 6, 3, 6);
        ctx.fillRect(bx + 20, by - 6, 3, 6);
        ctx.fillRect(bx - 8, by + 8, 3, 6);
        ctx.fillRect(bx + 20, by + 8, 3, 6);
        ctx.restore();
      }

      // 🏰 PUERTA NORTE MONUMENTAL (ARCO REAL CON CAMPANA Y EMBLEMA DE HYRULE)
      else if (b.name.includes("Puerta Norte") || b.name.includes("Arco del Castillo") || b.name.includes("Arco Monumental")) {
        this.drawMonumentalGate(ctx, bx, by);
      }

      // 🌊 MOLINO DE AGUA CON RUEDA HIDRÁULICA GIRATORIA
      else if (b.name.includes("Molino de Agua") || b.style === 'watermill') {
        this.drawMinishHouse(ctx, b, ts);
        this.drawWaterWheel(ctx, bx + (b.w ? b.w * ts : 48) - 3, by + 12);
      }

      // 🏡 CASAS CON TEJADOS CURVOS MINISH CAP (Rojo, Azul, Amarillo, Verde, Púrpura, Mansión)
      else if (b.roofColor || b.style || (b.w && b.h)) {
        this.drawMinishHouse(ctx, b, ts);
      }
    }
  }

  // 🏡 Renderizado de Casa / Edificio Minish Cap de Alta Fidelidad
  drawMinishHouse(ctx, b, ts) {
    const bx = b.x * ts;
    const by = b.y * ts;
    const bw = (b.w || 8) * ts;
    const bh = (b.h || 6) * ts;
    const roofColor = b.roofColor || 'blue';

    ctx.save();

    // 1. Sombra elíptica arrojada de la casa en el suelo
    ctx.fillStyle = 'rgba(10, 18, 25, 0.42)';
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, by + bh + 2, bw / 2 + 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Si es estilo Mansión de Cantería (Palacio Minish)
    if (b.style === 'mansion') {
      // Fachada de piedra de sillería beige/gris
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(bx, by - 4, bw, bh + 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx, by + bh - 4, bw, 4);

      // Balustrada superior con urnas ornamentales
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bx - 2, by - 8, bw + 4, 4);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bx - 2, by - 8, bw + 4, 1);
      // Urnas en las esquinas
      ctx.fillRect(bx - 3, by - 12, 4, 4);
      ctx.fillRect(bx + bw - 1, by - 12, 4, 4);

      // Cornisa y columnas
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx + 4, by, 3, bh);
      ctx.fillRect(bx + bw - 7, by, 3, bh);

      // Gran puerta arqueada de doble hoja
      const dW = 14; const dH = 16;
      const dX = bx + bw / 2 - dW / 2;
      const dY = by + bh - dH;
      ctx.fillStyle = '#451a03';
      ctx.fillRect(dX - 2, dY - 2, dW + 4, dH + 2);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(dX, dY, dW, dH);
      ctx.fillStyle = '#facc15'; // Aldabas doradas
      ctx.fillRect(dX + 3, dY + 7, 2, 2);
      ctx.fillRect(dX + dW - 5, dY + 7, 2, 2);

      // Ventanales señoriales con arco
      const wY = by + 4;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 12, wY, 8, 10);
      ctx.fillRect(bx + bw - 20, wY, 8, 10);
      ctx.fillStyle = '#cbd5e1'; // Cruzeta
      ctx.fillRect(bx + 15, wY, 2, 10);
      ctx.fillRect(bx + 12, wY + 4, 8, 2);
      ctx.fillRect(bx + bw - 17, wY, 2, 10);
      ctx.fillRect(bx + bw - 20, wY + 4, 8, 2);

      ctx.restore();
      return;
    }

    // 2. Fachada de la casa: Estuco blanco crema con vigas de roble
    const wallY = by + Math.floor(bh * 0.44);
    const wallH = (by + bh) - wallY;

    // Pared de estuco
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(bx + 2, wallY, bw - 4, wallH);
    ctx.fillStyle = '#e8dfd0'; // Sombra inferior
    ctx.fillRect(bx + 2, wallY + wallH - 3, bw - 4, 3);

    // Vigas de madera verticales y horizontales (Timber framing Minish Cap)
    ctx.fillStyle = '#6b3310';
    ctx.fillRect(bx + 2, wallY, 2, wallH); // Viga izq
    ctx.fillRect(bx + bw - 4, wallY, 2, wallH); // Viga der
    ctx.fillRect(bx + 2, wallY + wallH - 2, bw - 4, 2); // Rodapié
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(bx + 3, wallY, 1, wallH);
    ctx.fillRect(bx + bw - 3, wallY, 1, wallH);

    // Puerta de madera de roble arqueada
    const doorW = 10;
    const doorH = 14;
    const doorX = bx + Math.floor(bw / 2) - doorW / 2;
    const doorY = by + bh - doorH;

    // Marco de piedra del arco
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(doorX - 2, doorY - 2, doorW + 4, doorH + 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(doorX - 2, doorY - 2, doorW + 4, 1);

    // Hoja de la puerta de madera
    ctx.fillStyle = '#5c2d12';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(doorX + 1, doorY + 1, doorW - 2, doorH - 1);
    // Herrajes de hierro y aldaba dorada
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(doorX + 2, doorY + 4, doorW - 4, 1);
    ctx.fillRect(doorX + 2, doorY + 9, doorW - 4, 1);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(doorX + doorW - 4, doorY + 6, 2, 2); // Pomo dorado

    // Farol de bronce junto a la puerta
    ctx.fillStyle = '#b45309';
    ctx.fillRect(doorX - 4, doorY + 2, 2, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(doorX - 4, doorY + 3, 2, 2);

    // Ventanas con cristales iluminados y jardineras floridas
    const winY = wallY + 3;
    const winW = 8;
    const winH = 8;
    const leftWinX = bx + 6;
    const rightWinX = bx + bw - 14;

    const drawWindow = (wx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx - 1, winY - 1, winW + 2, winH + 2);
      ctx.fillStyle = (roofColor === 'blue') ? '#fef08a' : '#38bdf8';
      ctx.fillRect(wx, winY, winW, winH);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wx + 3, winY, 2, winH);
      ctx.fillRect(wx, winY + 3, winW, 2);
      // Jardinera con flores
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wx - 2, winY + winH, winW + 4, 3);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(wx - 1, winY + winH - 1, winW + 2, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(wx - 1, winY + winH - 1, 2, 2);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(wx + 3, winY + winH - 1, 2, 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(wx + 6, winY + winH - 1, 2, 2);
    };

    if (bw >= 40) {
      if (doorX - leftWinX >= 12) drawWindow(leftWinX);
      if (rightWinX - doorX >= 12) drawWindow(rightWinX);
    }

    // 3. Chimenea de ladrillo con penacho de humo animado
    if (b.hasChimney !== false) {
      const chimX = bx + bw - 10;
      const chimY = by - 12;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(chimX, chimY, 6, 12);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(chimX + 1, chimY + 1, 4, 10);
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(chimX - 1, chimY, 8, 2); // Remate superior
      // Humo blanco ondeante
      const smkBob = (this.waterTime * 10) % 18;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(chimX + 3 + Math.sin(smkBob * 0.4) * 3, chimY - 3 - smkBob, 3, 0, Math.PI * 2);
      ctx.arc(chimX + 4 + Math.cos(smkBob * 0.3) * 4, chimY - 8 - smkBob * 1.2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Tejado Curvo Minish Cap (Forma abombada icónica)
    const roofX = bx - 3;
    const roofY = by - 10;
    const roofW = bw + 6;
    const roofH = Math.floor(bh * 0.58) + 8;

    let cBase = '#0284c7';
    let cLight = '#38bdf8';
    let cDark = '#075985';
    let cOutline = '#082f49';

    if (roofColor === 'red') {
      cBase = '#dc2626'; cLight = '#f87171'; cDark = '#991b1b'; cOutline = '#450a0a';
    } else if (roofColor === 'yellow') {
      cBase = '#eab308'; cLight = '#fde047'; cDark = '#ca8a04'; cOutline = '#713f12';
    } else if (roofColor === 'green') {
      cBase = '#16a34a'; cLight = '#4ade80'; cDark = '#15803d'; cOutline = '#14532d';
    } else if (roofColor === 'purple') {
      cBase = '#9333ea'; cLight = '#c084fc'; cDark = '#7e22ce'; cOutline = '#3b0764';
    } else if (roofColor === 'stone') {
      cBase = '#cbd5e1'; cLight = '#f8fafc'; cDark = '#64748b'; cOutline = '#334155';
    }

    // A. Contorno oscuro del tejado
    ctx.fillStyle = cOutline;
    this.drawCurvedRoofShape(ctx, roofX - 1, roofY - 1, roofW + 2, roofH + 2);

    // B. Color base del tejado
    ctx.fillStyle = cBase;
    this.drawCurvedRoofShape(ctx, roofX, roofY, roofW, roofH);

    // C. Capa de sombra inferior / alero
    ctx.fillStyle = cDark;
    ctx.fillRect(roofX + 2, roofY + roofH - 5, roofW - 4, 5);

    // D. Líneas de tejas horizontales con relieve curvo
    for (let ty = roofY + 4; ty < roofY + roofH - 4; ty += 5) {
      ctx.fillStyle = cDark;
      ctx.fillRect(roofX + 3, ty, roofW - 6, 1);
      ctx.fillStyle = cLight;
      ctx.fillRect(roofX + 3, ty + 1, roofW - 6, 1);
    }

    // E. Destello de sol superior Minish Cap
    ctx.fillStyle = cLight;
    ctx.beginPath();
    ctx.ellipse(roofX + roofW / 2, roofY + 4, roofW / 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sombra del alero cayendo sobre la fachada
    ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
    ctx.fillRect(bx + 2, wallY, bw - 4, 4);

    // 5. Cartel de comercio colgante si corresponde
    if (b.sign) {
      this.drawShopSign(ctx, doorX - 8, wallY + 2, b.sign);
    }

    ctx.restore();
  }

  // Trazo geométrico de tejado abombado Minish Cap
  drawCurvedRoofShape(ctx, rx, ry, rw, rh) {
    ctx.beginPath();
    ctx.moveTo(rx + 6, ry);
    ctx.lineTo(rx + rw - 6, ry);
    ctx.quadraticCurveTo(rx + rw, ry + 2, rx + rw, ry + rh - 4);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.lineTo(rx, ry + rh);
    ctx.lineTo(rx, ry + rh - 4);
    ctx.quadraticCurveTo(rx, ry + 2, rx + 6, ry);
    ctx.closePath();
    ctx.fill();
  }

  // Cartel comercial de madera tallada (Minish Cap)
  drawShopSign(ctx, x, y, sign) {
    ctx.save();
    // Soporte de hierro forjado
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 2, y, 2, 8);
    ctx.fillRect(x - 2, y, 8, 2);

    // Tablilla de madera
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 1, y + 2, 10, 9);
    ctx.fillStyle = '#fbf8f2';
    ctx.fillRect(x + 2, y + 3, 8, 7);

    // Iconografía pixel
    if (sign === 'shoe') {
      // Zapato de Rem el zapatero (Image 1)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 3, y + 6, 6, 3);
      ctx.fillRect(x + 3, y + 5, 3, 2);
    } else if (sign === 'shield') {
      // Escudo con cruz roja
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 4, y + 4, 4, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 5, y + 5, 2, 3);
    } else if (sign === 'potion') {
      // Frasco de poción verde
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 4, y + 5, 4, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 5, y + 4, 2, 2);
    } else if (sign === 'bell') {
      // Campana dorada
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 4, y + 4, 4, 4);
      ctx.fillRect(x + 5, y + 8, 2, 1);
    } else if (sign === 'bread') {
      // Pan dorado
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 3, y + 5, 6, 4);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x + 4, y + 5, 4, 1);
    } else if (sign === 'pot') {
      // Tinaja de barro
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(x + 4, y + 4, 4, 5);
    }
    ctx.restore();
  }

  // 🏰 Gran Arco Monumental Norte de Hyrule (Acceso al Castillo con Campana Real)
  drawMonumentalGate(ctx, bx, by) {
    ctx.save();
    // Gran arco de cantería de 40px de ancho por 32px de alto
    const gw = 44;
    const gh = 32;

    // Sombra en el suelo
    ctx.fillStyle = 'rgba(10, 20, 30, 0.45)';
    ctx.beginPath();
    ctx.ellipse(bx + gw / 2, by + gh + 1, gw / 2 + 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pilares de piedra labrada izquierdo y derecho
    ctx.fillStyle = '#64748b';
    ctx.fillRect(bx, by, 10, gh);
    ctx.fillRect(bx + gw - 10, by, 10, gh);

    // Frontón superior con cornisa decorativa
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bx - 2, by - 8, gw + 4, 8);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(bx - 2, by - 8, gw + 4, 2);

    // Vado / Arco abierto en el centro
    ctx.fillStyle = '#334155';
    ctx.fillRect(bx + 10, by - 2, gw - 20, gh + 2);
    ctx.fillStyle = '#0f172a'; // Profundidad oscura bajo el arco
    ctx.beginPath();
    ctx.arc(bx + gw / 2, by + 12, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(bx + 11, by + 12, gw - 22, gh - 10);

    // Emblema Real Alado de Hyrule en el frontón
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bx + gw / 2, by - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // Alas doradas extendidas
    ctx.fillRect(bx + gw / 2 - 12, by - 5, 8, 2);
    ctx.fillRect(bx + gw / 2 + 4, by - 5, 8, 2);

    // Gran Campana Dorada colgada bajo el arco
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(bx + gw / 2 - 1, by + 1, 2, 4); // Cadena
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bx + gw / 2, by + 7, 3.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(bx + gw / 2 - 4, by + 7, 8, 3);
    ctx.fillStyle = '#713f12';
    ctx.fillRect(bx + gw / 2 - 1, by + 10, 2, 2); // Badajo

    ctx.restore();
  }

  // 🌊 Rueda Hidráulica Giratoria del Molino (The Minish Cap)
  drawWaterWheel(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    const radius = 10;
    const angle = this.waterTime * 2.2;

    // Sombra acuática
    ctx.fillStyle = 'rgba(10, 30, 50, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, radius + 1, radius, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eje de madera
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // 8 Paletas de madera giratorias
    for (let i = 0; i < 8; i++) {
      const a = angle + (i * Math.PI / 4);
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;

      // Radio / rayo
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Paleta
      ctx.fillStyle = '#a16207';
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillRect(-3, -1, 6, 2.5);
      ctx.restore();
    }

    // Salpicaduras de agua en la parte inferior de la rueda
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2 + Math.sin(this.waterTime * 15) * 3, radius - 1, 2, 2);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(2 - Math.cos(this.waterTime * 15) * 3, radius, 2, 2);

    ctx.restore();
  }

  // 🌳 Renderizado de Copa de Árbol Volumétrico (The Minish Cap 2.5D de Alta Fidelidad)
  drawMinishTreeCanopy(ctx, x, y, gx, gy) {
    const cx = x + 4;
    const cy = y - 9; // Centro de la gran copa esférica elevada sobre el tronco

    ctx.save();

    // 8 lóbulos festoneados alrededor de la circunferencia (nube de follaje)
    const lobes = [
      { dx: 0, dy: -9, r: 7.5 },
      { dx: 7, dy: -7, r: 7 },
      { dx: 10, dy: 0, r: 7.5 },
      { dx: 7, dy: 7, r: 7 },
      { dx: 0, dy: 9, r: 7.5 },
      { dx: -7, dy: 7, r: 7 },
      { dx: -10, dy: 0, r: 7.5 },
      { dx: -7, dy: -7, r: 7 }
    ];

    // 1. Contorno oscuro exterior Minish Cap (#122a08)
    ctx.fillStyle = '#122a08';
    for (const l of lobes) {
      ctx.beginPath();
      ctx.arc(cx + l.dx, cy + l.dy, l.r + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();

    // 2. Capa base de sombra profunda (#1a480e)
    ctx.fillStyle = '#1a480e';
    for (const l of lobes) {
      ctx.beginPath();
      ctx.arc(cx + l.dx, cy + l.dy, l.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    // 3. Capa media: Follaje verde esmeralda vibrante (#389c16)
    ctx.fillStyle = '#389c16';
    for (const l of lobes) {
      if (l.dy <= 4) {
        ctx.beginPath();
        ctx.arc(cx + l.dx, cy + l.dy - 1, l.r - 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Capa iluminada superior: Verde lima vivo bañado por el sol (#76d420)
    ctx.fillStyle = '#76d420';
    for (const l of lobes) {
      if (l.dy <= -2) {
        ctx.beginPath();
        ctx.arc(cx + l.dx, cy + l.dy - 1.5, l.r - 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 4, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Destellos de sol en la cima (crestas doradas #a6f43c y #d8ff68)
    ctx.fillStyle = '#a6f43c';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 8, 4, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy - 7, 3.5, 0, Math.PI * 2);
    ctx.arc(cx - 6, cy - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d8ff68';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 9, 2, 0, Math.PI * 2);
    ctx.arc(cx + 2, cy - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Almohadas interiores de hojas con hendiduras de sombra
    ctx.fillStyle = '#1c4c10';
    ctx.beginPath();
    ctx.arc(cx - 2, cy + 3, 4, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3ea618';
    ctx.beginPath();
    ctx.arc(cx - 2, cy + 2, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // 7. Frutos o flores Minish Cap (Image 1 y 4)
    const flw = (gx * 19 + gy * 31) % 4;
    if (flw === 1) {
      // Manzanas rojas Minish con brillo
      const apples = [
        { dx: -5, dy: -4 },
        { dx: 4, dy: -5 },
        { dx: -1, dy: -9 },
        { dx: 6, dy: 1 },
        { dx: -6, dy: 2 }
      ];
      for (const a of apples) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx + a.dx, cy + a.dy, 3, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx + a.dx + 1, cy + a.dy, 1, 1);
      }
    } else if (flw === 2) {
      // Manzanas doradas
      const goldApples = [
        { dx: -4, dy: -6 },
        { dx: 3, dy: -4 },
        { dx: -2, dy: 2 },
        { dx: 5, dy: 0 }
      ];
      for (const ga of goldApples) {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx + ga.dx, cy + ga.dy, 3, 3);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx + ga.dx + 1, cy + ga.dy, 1, 1);
      }
    } else if (flw === 3) {
      // Flores blancas Minish (Image 1)
      const blossoms = [
        { dx: -6, dy: -3 },
        { dx: 2, dy: -7 },
        { dx: 5, dy: -2 },
        { dx: -2, dy: -1 },
        { dx: 3, dy: 3 }
      ];
      for (const bl of blossoms) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + bl.dx, cy + bl.dy, 3, 3);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + bl.dx + 1, cy + bl.dy + 1, 1, 1);
      }
    }

    ctx.restore();
  }
}
