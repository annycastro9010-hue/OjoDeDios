// Gestor de animaciones desacoplado para soportar tanto renderizado procedural
// como SpriteSheets externos creados por animadores (Aseprite / PNG).

export class AnimationManager {
  constructor() {
    this.sheets = new Map(); // Hojas de sprites externas cargadas
  }

  // Permite a cualquier animador registrar una hoja de sprites externa en el futuro
  // Ejemplo: registerSheet('cultivator', '/assets/cultivator_spritesheet.png', 16, 16, config)
  registerSheet(id, imageSrc, frameWidth = 16, frameHeight = 16, animConfig = {}) {
    const img = new Image();
    img.src = imageSrc;
    const sheetData = {
      image: img,
      loaded: false,
      frameW: frameWidth,
      frameH: frameHeight,
      anims: animConfig // { walk_down: [0,1,2,3], idle: [0], ... }
    };
    img.onload = () => {
      sheetData.loaded = true;
      console.log(`[AnimationManager] SpriteSheet '${id}' cargada con éxito.`);
    };
    this.sheets.set(id, sheetData);
  }

  // Dibuja el personaje: si existe una hoja externa cargada la usa; si no, usa el motor Minish Cap
  draw(ctx, type, x, y, direction = 'down', frame = 0, isMoving = false, hasCargo = false, isPossessed = false) {
    const sheet = this.sheets.get(type);

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // 1. Sombra translúcida bajo los pies (Característica visual clave de Zelda Minish Cap)
    this.drawGroundShadow(ctx, 8, 14);

    // Si es un niño / cría, escalar para que sea pequeño y adorable
    if (type === 'child') {
      ctx.scale(0.72, 0.72);
      ctx.translate(3, 5);
    }

    // 2. Si hay hoja de sprites externa cargada por un animador:
    if (sheet && sheet.loaded) {
      this.drawExternalFrame(ctx, sheet, direction, frame, isMoving);
    } else {
      // 3. Renderizado Procedural Nativo de Alta Fidelidad Estilo Minish Cap
      this.drawMinishCharacter(ctx, type, direction, frame, isMoving, hasCargo);
    }

    // 4. Efectos Celestiales si está poseído
    if (isPossessed) {
      this.drawPossessionAura(ctx);
    }

    ctx.restore();
  }

  // Sombra circular elíptica estilo Zelda GBA
  drawGroundShadow(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 25, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Dibuja frame desde imagen externa
  drawExternalFrame(ctx, sheet, dir, frame, isMoving) {
    const animKey = isMoving ? `walk_${dir}` : `idle_${dir}`;
    const frames = sheet.anims[animKey] || [0];
    const frameIndex = frames[frame % frames.length] || 0;

    const cols = Math.floor(sheet.image.width / sheet.frameW);
    const sx = (frameIndex % cols) * sheet.frameW;
    const sy = Math.floor(frameIndex / cols) * sheet.frameH;

    ctx.drawImage(
      sheet.image,
      sx, sy, sheet.frameW, sheet.frameH,
      0, 0, sheet.frameW, sheet.frameH
    );
  }

  // Motor Minish Cap Procedural (4 direcciones x 4 frames de marcha completa)
  drawMinishCharacter(ctx, type, dir, frame, isMoving, hasCargo) {
    // Cálculo del ciclo de caminata Minish Cap:
    // Frame 0: Contacto pie izquierdo, brazo derecho adelante
    // Frame 1: Paso neutral (head bob -1px)
    // Frame 2: Contacto pie derecho, brazo izquierdo adelante
    // Frame 3: Paso neutral (head bob -1px)
    const stepCycle = isMoving ? (frame % 4) : 0;
    const headBob = isMoving ? (stepCycle % 2 === 1 ? -1 : 0) : 0;

    let legLeftOffset = 0;
    let legRightOffset = 0;
    let armLeftOffset = 0;
    let armRightOffset = 0;

    if (isMoving) {
      if (stepCycle === 0) {
        legLeftOffset = 1; legRightOffset = -1;
        armLeftOffset = -1; armRightOffset = 1;
      } else if (stepCycle === 2) {
        legLeftOffset = -1; legRightOffset = 1;
        armLeftOffset = 1; armRightOffset = -1;
      }
    }

    // Colores según tipo
    const colors = this.getCharacterPalette(type);

    // ================= DIBUJAR SEGÚN DIRECCIÓN =================
    if (dir === 'down') {
      // Piernas
      ctx.fillStyle = colors.pants;
      ctx.fillRect(4, 11 + legLeftOffset, 3, 3);
      ctx.fillRect(9, 11 + legRightOffset, 3, 3);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(4, 13 + legLeftOffset, 3, 1.5);
      ctx.fillRect(9, 13 + legRightOffset, 3, 1.5);

      // Torso / Ropa
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(4, 6 + headBob, 8, 5);

      // Brazos
      ctx.fillStyle = colors.skin;
      ctx.fillRect(2, 7 + armLeftOffset + headBob, 2, 3);
      ctx.fillRect(12, 7 + armRightOffset + headBob, 2, 3);

      // Cabeza y Cara
      ctx.fillStyle = colors.skin;
      ctx.fillRect(5, 3 + headBob, 6, 4);
      // Ojos estilo anime pixel Zelda (2x2 píxeles)
      ctx.fillStyle = '#111827';
      ctx.fillRect(5, 4 + headBob, 2, 2);
      ctx.fillRect(9, 4 + headBob, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 4 + headBob, 1, 1);
      ctx.fillRect(9, 4 + headBob, 1, 1);

      // Sombrero / Gorra
      this.drawHeadwear(ctx, type, 'down', headBob, colors);

      // Cargamento frontal
      if (hasCargo) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(5, 7 + headBob, 6, 4);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 7 + headBob, 6, 4);
      }
    } else if (dir === 'up') {
      // Vista Trasera
      ctx.fillStyle = colors.pants;
      ctx.fillRect(4, 11 + legLeftOffset, 3, 3);
      ctx.fillRect(9, 11 + legRightOffset, 3, 3);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(4, 13 + legLeftOffset, 3, 1.5);
      ctx.fillRect(9, 13 + legRightOffset, 3, 1.5);

      // Espalda
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(4, 6 + headBob, 8, 5);

      // Si lleva mochila o fardo a la espalda
      if (hasCargo) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(4, 5 + headBob, 8, 5);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(4, 5 + headBob, 8, 5);
      }

      // Nuca y Sombrero trasero
      ctx.fillStyle = colors.skin;
      ctx.fillRect(5, 4 + headBob, 6, 2);
      this.drawHeadwear(ctx, type, 'up', headBob, colors);
    } else if (dir === 'left' || dir === 'right') {
      const isRight = dir === 'right';
      ctx.save();
      if (!isRight) {
        // Volteo horizontal para vista izquierda
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }

      // Piernas en perfil (adelante y atrás)
      ctx.fillStyle = colors.pants;
      ctx.fillRect(6 + legLeftOffset, 11, 4, 3);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(6 + legLeftOffset, 13, 4, 1.5);

      // Torso lateral
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(5, 6 + headBob, 6, 5);

      // Brazo lateral oscilante
      ctx.fillStyle = colors.skin;
      ctx.fillRect(7 + armRightOffset, 7 + headBob, 2, 4);

      // Cara perfil
      ctx.fillStyle = colors.skin;
      ctx.fillRect(7, 3 + headBob, 5, 4);
      // Ojo perfil
      ctx.fillStyle = '#111827';
      ctx.fillRect(10, 4 + headBob, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 4 + headBob, 1, 1);

      // Sombrero perfil
      this.drawHeadwear(ctx, type, 'side', headBob, colors);

      // Fardo en los brazos
      if (hasCargo) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(11, 6 + headBob, 5, 4);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(11, 6 + headBob, 5, 4);
      }

      ctx.restore();
    }
  }

  drawHeadwear(ctx, type, view, bob, colors) {
    if (type === 'cultivator') {
      // Sombrero campesino de paja estilo Zelda
      ctx.fillStyle = colors.hat;
      if (view === 'down' || view === 'up') {
        ctx.fillRect(1, 1 + bob, 14, 3);
        ctx.fillStyle = colors.hatBand;
        ctx.fillRect(3, -1 + bob, 10, 2);
      } else {
        ctx.fillRect(3, 1 + bob, 12, 3);
        ctx.fillStyle = colors.hatBand;
        ctx.fillRect(5, -1 + bob, 8, 2);
      }
    } else if (type === 'police') {
      // Gorra de policía con visera y placa
      ctx.fillStyle = colors.hat;
      ctx.fillRect(3, 0 + bob, 10, 3);
      if (view === 'down') {
        ctx.fillStyle = '#facc15'; // Placa dorada
        ctx.fillRect(7, 0 + bob, 2, 2);
        ctx.fillStyle = '#0f172a'; // Visera
        ctx.fillRect(3, 3 + bob, 10, 1.5);
      } else if (view === 'side') {
        ctx.fillStyle = '#0f172a'; // Visera saliente
        ctx.fillRect(9, 2 + bob, 4, 1.5);
      }
    } else if (type === 'boss') {
      // Sombrero elegante / pelo oscuro
      ctx.fillStyle = colors.hat;
      ctx.fillRect(3, 0 + bob, 10, 3);
      if (view === 'down') {
        ctx.fillStyle = '#000'; // Gafas de sol
        ctx.fillRect(4, 4 + bob, 8, 2);
      }
    }
  }

  drawPossessionAura(ctx) {
    // Aura divina con pulso senoidal y halo dorado
    const pulse = Math.sin(Date.now() * 0.009) * 0.2 + 0.45;
    const grad = ctx.createRadialGradient(8, 8, 3, 8, 8, 16);
    grad.addColorStop(0, `rgba(255, 235, 59, ${pulse})`);
    grad.addColorStop(1, 'rgba(255, 235, 59, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 18, 0, Math.PI * 2);
    ctx.fill();

    // Halo giratorio
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(8, -2, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  getCharacterPalette(type) {
    if (type === 'police') {
      return {
        skin: '#f5cda5',
        shirt: '#1e3a8a',
        pants: '#0f172a',
        shoes: '#020617',
        hat: '#1e3a8a'
      };
    } else if (type === 'boss') {
      return {
        skin: '#f5cda5',
        shirt: '#991b1b',
        pants: '#f8fafc',
        shoes: '#450a0a',
        hat: '#18181b'
      };
    }
    // Cultivator default
    return {
      skin: '#f5cda5',
      shirt: '#f1f5f9',
      pants: '#5c3a21',
      shoes: '#331f13',
      hat: '#d4a359',
      hatBand: '#b88439'
    };
  }
}

export const animManager = new AnimationManager();
