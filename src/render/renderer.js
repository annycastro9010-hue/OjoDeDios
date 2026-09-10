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

  render(grid, npcs, camera, possessedNpc, mouseWorldPos, currentTool, brushRadius) {
    const ctx = this.ctx;
    this.waterTime += 0.05;

    // Limpiar pantalla
    ctx.fillStyle = '#0a0d18'; // Fondo azul marino abisal
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Aplicar transformación de cámara (Zoom y Posición)
    camera.applyTransform(ctx);

    // 1. Renderizar Cuadrícula Celular
    const w = grid.width;
    const h = grid.height;
    const ts = this.tileSize;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const elem = grid.get(x, y);
        if (elem === ELEM.EMPTY) continue;

        const px = x * ts;
        const py = y * ts;

        if (elem === ELEM.WATER) {
          // Animación de olas en agua
          const wave = Math.sin(x * 0.4 + this.waterTime) * 15;
          ctx.fillStyle = `rgb(35, ${120 + Math.floor(wave)}, ${210 + Math.floor(wave)})`;
          ctx.fillRect(px, py, ts, ts);
        } else if (elem === ELEM.FIRE) {
          // Parpadeo de fuego
          const flicker = Math.random() > 0.5 ? '#ff3b00' : '#ff9500';
          ctx.fillStyle = flicker;
          ctx.fillRect(px, py, ts, ts);
        } else if (elem === ELEM.PLANT_BLOOM) {
          // Fondo verde con motas doradas de resina/flor
          ctx.fillStyle = '#10b981';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
        } else if (elem === ELEM.BUILDING) {
          ctx.fillStyle = '#3e2723';
          ctx.fillRect(px, py, ts, ts);
          ctx.fillStyle = '#271915';
          ctx.strokeRect(px, py, ts, ts);
        } else {
          ctx.fillStyle = ELEM_PROPS[elem]?.color || '#fff';
          ctx.fillRect(px, py, ts, ts);
        }
      }
    }

    // 2. Renderizar Conos de Visión de Policías
    for (const npc of npcs) {
      if (npc.type === 'police') {
        sprites.drawVisionCone(ctx, npc.x, npc.y, npc.direction);
      }
    }

    // 3. Renderizar Edificios con Nombres
    ctx.font = '7px sans-serif';
    ctx.textAlign = 'center';
    for (const b of grid.buildingLocations) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.name, b.x * ts + 12, b.y * ts - 4);
    }

    // 4. Renderizar NPCs con AnimationManager (soporta tanto procedural como SpriteSheets externos)
    const sortedNpcs = [...npcs].sort((a, b) => a.y - b.y);
    for (const npc of sortedNpcs) {
      const isPossessed = (possessedNpc && possessedNpc.id === npc.id);
      const isMoving = Math.abs(npc.vx || 0) > 0.05 || Math.abs(npc.vy || 0) > 0.05;
      animManager.draw(
        ctx,
        npc.type,
        npc.x,
        npc.y,
        npc.direction,
        npc.frame,
        isMoving,
        npc.cargo > 0,
        isPossessed
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
}
