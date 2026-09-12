// Motor de Animación Desacoplado de Alta Fidelidad Estilo The Legend of Zelda: The Minish Cap (GBA)
// Integra directamente las 2 Hojas de Sprites de Artista de alta resolución con transparencia automática (Chroma Key)
// y fallback procedural instantáneo con sombreado de 3 tonos.

export class AnimationManager {
  constructor() {
    this.sheets = new Map();
    this.sheet1Canvas = null;
    this.sheet2Canvas = null;
    this.sheetsReady = false;

    this.initMinishSheets();
  }

  // Carga automática de las dos hojas oficiales de sprites de The Minish Cap
  initMinishSheets() {
    if (typeof window === 'undefined' || typeof Image === 'undefined') return;

    const basePath = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './';
    const s1Url = `${basePath}sprites/sheet1_minish.jpg`.replace('//', '/');
    const s2Url = `${basePath}sprites/sheet2_minish.jpg`.replace('//', '/');

    const cleanGreenBg = (img) => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const d = imgData.data;
        const bgR = d[16];
        const bgG = d[17];
        const bgB = d[18];

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const diff = Math.hypot(r - bgR, g - bgG, b - bgB);
          const isGreenDominant = (g > 105 && g > r * 1.15 && g > b * 1.15);

          if (diff < 65 || (isGreenDominant && diff < 90)) {
            d[i + 3] = 0; // Transparencia total
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        console.warn('Chroma key bypass:', e);
      }
      return cvs;
    };

    let loadedCount = 0;
    const onLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        this.sheetsReady = true;
      }
    };

    const img1 = new Image();
    img1.crossOrigin = 'anonymous';
    img1.onload = () => {
      this.sheet1Canvas = cleanGreenBg(img1);
      onLoaded();
    };
    img1.src = s1Url;

    const img2 = new Image();
    img2.crossOrigin = 'anonymous';
    img2.onload = () => {
      this.sheet2Canvas = cleanGreenBg(img2);
      onLoaded();
    };
    img2.src = s2Url;

    // Coordenadas exactas en las hojas de sprites 1024x1024
    this.spriteMap = {
      // HOJA 1: Protagonistas y Ciudadanos
      musician: {
        sheet: 1,
        down: [
          { x: 12, y: 12, w: 76, h: 104 },
          { x: 114, y: 12, w: 76, h: 104 },
          { x: 216, y: 12, w: 76, h: 104 },
          { x: 318, y: 12, w: 76, h: 104 }
        ],
        side: [
          { x: 12, y: 135, w: 76, h: 104 },
          { x: 114, y: 135, w: 76, h: 104 },
          { x: 216, y: 135, w: 76, h: 104 },
          { x: 318, y: 135, w: 76, h: 104 }
        ],
        up: [
          { x: 420, y: 135, w: 76, h: 104 }
        ]
      },
      vendedor: {
        sheet: 1,
        down: [
          { x: 524, y: 12, w: 76, h: 104 },
          { x: 626, y: 12, w: 76, h: 104 },
          { x: 830, y: 12, w: 76, h: 104 }
        ],
        side: [
          { x: 728, y: 12, w: 76, h: 104 },
          { x: 728, y: 135, w: 76, h: 104 },
          { x: 830, y: 135, w: 76, h: 104 }
        ],
        action: [
          { x: 114, y: 265, w: 86, h: 104 },
          { x: 318, y: 265, w: 86, h: 104 }
        ]
      },
      vecina_chismosa: {
        sheet: 1,
        down: [
          { x: 12, y: 390, w: 76, h: 104 },
          { x: 114, y: 390, w: 76, h: 104 },
          { x: 216, y: 390, w: 76, h: 104 },
          { x: 318, y: 390, w: 76, h: 104 }
        ],
        side: [
          { x: 420, y: 390, w: 76, h: 104 },
          { x: 524, y: 390, w: 76, h: 104 }
        ],
        up: [
          { x: 626, y: 390, w: 76, h: 104 }
        ]
      },
      mototaxista: {
        sheet: 1,
        down: [
          { x: 12, y: 518, w: 76, h: 104 },
          { x: 114, y: 518, w: 76, h: 104 },
          { x: 216, y: 518, w: 76, h: 104 }
        ],
        bike: [
          { x: 315, y: 518, w: 150, h: 104 },
          { x: 515, y: 518, w: 150, h: 104 }
        ]
      },
      boss: {
        sheet: 1,
        down: [
          { x: 12, y: 645, w: 76, h: 104 },
          { x: 114, y: 645, w: 76, h: 104 },
          { x: 216, y: 645, w: 76, h: 104 }
        ],
        side: [
          { x: 318, y: 645, w: 76, h: 104 },
          { x: 420, y: 645, w: 76, h: 104 }
        ]
      },
      prophet: {
        sheet: 1,
        down: [
          { x: 12, y: 770, w: 86, h: 106 },
          { x: 112, y: 770, w: 86, h: 106 },
          { x: 212, y: 770, w: 86, h: 106 }
        ],
        side: [
          { x: 312, y: 770, w: 86, h: 106 },
          { x: 412, y: 770, w: 86, h: 106 }
        ]
      },
      hero: {
        sheet: 1,
        down: [
          { x: 520, y: 770, w: 76, h: 106 },
          { x: 622, y: 770, w: 76, h: 106 },
          { x: 724, y: 770, w: 76, h: 106 },
          { x: 826, y: 770, w: 76, h: 106 }
        ],
        side: [
          { x: 114, y: 898, w: 76, h: 106 },
          { x: 216, y: 898, w: 76, h: 106 },
          { x: 318, y: 898, w: 76, h: 106 },
          { x: 420, y: 898, w: 76, h: 106 }
        ],
        up: [
          { x: 524, y: 898, w: 76, h: 106 },
          { x: 626, y: 898, w: 76, h: 106 },
          { x: 728, y: 898, w: 76, h: 106 }
        ]
      },

      // HOJA 2: Autoridades, Fuerzas y Fauna
      police_cuadrante: {
        sheet: 2,
        down: [
          { x: 12, y: 12, w: 76, h: 106 },
          { x: 114, y: 12, w: 76, h: 106 },
          { x: 216, y: 12, w: 76, h: 106 },
          { x: 524, y: 12, w: 76, h: 106 }
        ],
        side: [
          { x: 318, y: 12, w: 76, h: 106 },
          { x: 114, y: 135, w: 76, h: 106 },
          { x: 216, y: 135, w: 76, h: 106 },
          { x: 318, y: 135, w: 76, h: 106 }
        ],
        up: [
          { x: 420, y: 12, w: 76, h: 106 },
          { x: 828, y: 12, w: 76, h: 106 }
        ]
      },
      guerrillero: {
        sheet: 2,
        down: [
          { x: 12, y: 265, w: 76, h: 106 },
          { x: 114, y: 265, w: 76, h: 106 },
          { x: 216, y: 265, w: 76, h: 106 },
          { x: 524, y: 265, w: 76, h: 106 }
        ],
        side: [
          { x: 318, y: 265, w: 86, h: 106 },
          { x: 420, y: 265, w: 76, h: 106 },
          { x: 216, y: 390, w: 76, h: 106 }
        ],
        up: [
          { x: 626, y: 390, w: 76, h: 106 }
        ]
      },
      alcalde: {
        sheet: 2,
        down: [
          { x: 12, y: 518, w: 76, h: 106 },
          { x: 114, y: 518, w: 76, h: 106 },
          { x: 216, y: 518, w: 76, h: 106 },
          { x: 318, y: 518, w: 76, h: 106 }
        ],
        side: [
          { x: 420, y: 518, w: 76, h: 106 },
          { x: 626, y: 518, w: 76, h: 106 },
          { x: 728, y: 518, w: 76, h: 106 }
        ]
      },
      soldier: {
        sheet: 2,
        down: [
          { x: 12, y: 645, w: 76, h: 106 },
          { x: 114, y: 645, w: 76, h: 106 },
          { x: 216, y: 645, w: 76, h: 106 }
        ],
        side: [
          { x: 318, y: 645, w: 76, h: 106 },
          { x: 420, y: 645, w: 76, h: 106 },
          { x: 524, y: 645, w: 76, h: 106 }
        ]
      },
      medic: {
        sheet: 2,
        down: [
          { x: 12, y: 770, w: 76, h: 106 },
          { x: 114, y: 770, w: 76, h: 106 },
          { x: 216, y: 770, w: 76, h: 106 }
        ],
        side: [
          { x: 524, y: 770, w: 76, h: 106 },
          { x: 626, y: 770, w: 76, h: 106 }
        ],
        up: [
          { x: 318, y: 770, w: 76, h: 106 },
          { x: 420, y: 770, w: 76, h: 106 }
        ]
      },
      dog: {
        sheet: 2,
        down: [
          { x: 12, y: 898, w: 76, h: 106 },
          { x: 114, y: 898, w: 76, h: 106 }
        ],
        side: [
          { x: 216, y: 898, w: 86, h: 106 }
        ]
      },
      pig: {
        sheet: 2,
        down: [
          { x: 318, y: 898, w: 76, h: 106 },
          { x: 420, y: 898, w: 76, h: 106 }
        ],
        up: [
          { x: 524, y: 898, w: 76, h: 106 }
        ],
        side: [
          { x: 626, y: 898, w: 76, h: 106 }
        ]
      },
      croc: {
        sheet: 2,
        side: [
          { x: 728, y: 898, w: 86, h: 106 },
          { x: 828, y: 898, w: 86, h: 106 }
        ],
        down: [
          { x: 928, y: 898, w: 86, h: 106 }
        ]
      }
    };
  }

  registerSheet(type, imageSrc, frameW = 16, frameH = 16, animConfig = {}) {
    const img = new Image();
    img.src = imageSrc;
    const sheetData = {
      image: img,
      frameW,
      frameH,
      anims: animConfig,
      loaded: false
    };
    img.onload = () => {
      sheetData.loaded = true;
    };
    this.sheets.set(type, sheetData);
  }

  // Renderizado Principal de Personajes
  draw(ctx, type, x, y, direction = 'down', frame = 0, isMoving = false, hasCargo = false, isPossessed = false, isSwimming = false, inWater = false) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.floor(x), Math.floor(y));

    // 1. Sombra bajo los pies o estela de agua
    if (inWater) {
      if (type === 'prophet') {
        ctx.save();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(8, 12, 7, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      this.drawGroundShadow(ctx, 8, 15);
    }

    if (type === 'child') {
      ctx.scale(0.72, 0.72);
      ctx.translate(3, 5);
    }

    // 2. Intentar dibujar desde las hojas de artista Minish Cap
    let drawnFromSheet = false;
    if (this.sheetsReady && this.spriteMap && this.spriteMap[type]) {
      drawnFromSheet = this.drawFromArtistSheet(ctx, type, direction, frame, isMoving);
    }

    // 3. Fallback al motor procedural detallado de 3 tonos
    if (!drawnFromSheet) {
      this.drawMinishCharacter(ctx, type, direction, frame, isMoving, hasCargo, inWater);
    }

    // 4. Sumersión visual si está en agua
    if (inWater && type !== 'prophet') {
      ctx.save();
      ctx.fillStyle = 'rgba(24, 95, 185, 0.55)';
      ctx.fillRect(1, 11, 14, 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(2, 11, 12, 1);
      ctx.restore();
    }

    // 5. Efectos Celestiales si está poseído
    if (isPossessed) {
      this.drawPossessionAura(ctx);
    }

    ctx.restore();
  }

  // Dibuja el frame exacto de la hoja de artista con proporción y orientación GBA
  drawFromArtistSheet(ctx, type, dir, frame, isMoving) {
    const config = this.spriteMap[type];
    if (!config) return false;

    const sheetCanvas = config.sheet === 1 ? this.sheet1Canvas : this.sheet2Canvas;
    if (!sheetCanvas) return false;

    let dirKey = 'down';
    let isFlip = false;

    if (dir === 'up' && config.up) {
      dirKey = 'up';
    } else if (dir === 'left') {
      dirKey = 'side';
      isFlip = true;
    } else if (dir === 'right') {
      dirKey = 'side';
      isFlip = false;
    } else {
      dirKey = 'down';
    }

    const frameList = config[dirKey] || config.down || [];
    if (!frameList || frameList.length === 0) return false;

    const frameIdx = isMoving ? (frame % frameList.length) : 0;
    const f = frameList[frameIdx];

    ctx.save();
    // Dimensiones en mundo (ajustadas a la escala de 16x16 tiles)
    const dw = 18;
    const dh = 24;
    const dx = -1;
    const dy = -9;

    if (isFlip) {
      ctx.translate(16, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      sheetCanvas,
      f.x, f.y, f.w, f.h,
      dx, dy, dw, dh
    );
    ctx.restore();
    return true;
  }

  // Dibuja animales directamente de la Hoja 2
  drawAnimal(ctx, type, x, y, direction, frame, inWater) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.floor(x), Math.floor(y));

    if (!inWater) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
      ctx.beginPath();
      ctx.ellipse(8, 14, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(8, 12, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    let drawn = false;
    if (this.sheetsReady && this.spriteMap && this.spriteMap[type]) {
      const config = this.spriteMap[type];
      const sheetCanvas = this.sheet2Canvas;
      if (sheetCanvas) {
        const isFacingRight = (direction === 'right');
        const frameList = config.down || config.side || [];
        const f = frameList[frame % frameList.length];

        ctx.save();
        if (!isFacingRight) {
          ctx.translate(16, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(
          sheetCanvas,
          f.x, f.y, f.w, f.h,
          -1, -8, 18, 22
        );
        ctx.restore();
        drawn = true;
      }
    }

    ctx.restore();
    return drawn;
  }

  drawGroundShadow(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // MOTOR PROCEDURAL MINISH CAP (FALLBACK DE ALTA FIDELIDAD)
  // =========================================================================
  drawMinishCharacter(ctx, type, dir, frame, isMoving, hasCargo, inWater) {
    const now = Date.now();
    const blinkTimer = (now + (type.charCodeAt(0) || 0) * 137) % 3200;
    const isBlinking = blinkTimer > 3050 && blinkTimer < 3180;
    const breathOffset = (!isMoving && !inWater) ? (Math.sin(now * 0.0055) > 0.4 ? -1 : 0) : 0;

    const walkStep = frame % 4;
    let headBob = isMoving ? ((walkStep === 1 || walkStep === 3) ? 1 : 0) : breathOffset;
    let legL = 0, legR = 0, armL = 0, armR = 0;

    if (isMoving) {
      if (walkStep === 0) { legL = 2; legR = -1; armL = -2; armR = 2; }
      else if (walkStep === 2) { legL = -1; legR = 2; armL = 2; armR = -2; }
    }

    const pal = this.getPalette(type);
    const out = pal.out;

    if (dir === 'down') {
      ctx.fillStyle = out; ctx.fillRect(4, 11 + legL, 3, 4); ctx.fillRect(9, 11 + legR, 3, 4);
      ctx.fillStyle = pal.pantsDark; ctx.fillRect(4, 11 + legL, 3, 2); ctx.fillRect(9, 11 + legR, 3, 2);
      ctx.fillStyle = pal.pants; ctx.fillRect(4, 11 + legL, 2, 2); ctx.fillRect(9, 11 + legR, 2, 2);
      ctx.fillStyle = pal.shoeDark; ctx.fillRect(3, 13 + legL, 4, 2); ctx.fillRect(9, 13 + legR, 4, 2);
      ctx.fillStyle = pal.shoe; ctx.fillRect(4, 13 + legL, 3, 1); ctx.fillRect(10, 13 + legR, 3, 1);

      ctx.fillStyle = out; ctx.fillRect(3, 6 + headBob, 10, 6);
      ctx.fillStyle = pal.shirtDark; ctx.fillRect(4, 6 + headBob, 8, 5);
      ctx.fillStyle = pal.shirt; ctx.fillRect(4, 6 + headBob, 7, 4);
      ctx.fillStyle = pal.shirtLight; ctx.fillRect(5, 6 + headBob, 4, 2);
      ctx.fillStyle = pal.belt; ctx.fillRect(4, 10 + headBob, 8, 1);

      ctx.fillStyle = out; ctx.fillRect(2, 6 + armL + headBob, 2, 5); ctx.fillRect(12, 6 + armR + headBob, 2, 5);
      ctx.fillStyle = pal.shirt; ctx.fillRect(2, 6 + armL + headBob, 2, 2); ctx.fillRect(12, 6 + armR + headBob, 2, 2);
      ctx.fillStyle = pal.skin; ctx.fillRect(2, 8 + armL + headBob, 2, 2); ctx.fillRect(12, 8 + armR + headBob, 2, 2);

      ctx.fillStyle = out; ctx.fillRect(4, 1 + headBob, 8, 6); ctx.fillRect(3, 2 + headBob, 10, 4);
      ctx.fillStyle = pal.skinDark; ctx.fillRect(4, 2 + headBob, 8, 5);
      ctx.fillStyle = pal.skin; ctx.fillRect(4, 2 + headBob, 7, 4);
      ctx.fillStyle = pal.skinLight; ctx.fillRect(5, 2 + headBob, 5, 2);

      if (isBlinking) {
        ctx.fillStyle = out; ctx.fillRect(5, 4 + headBob, 2, 1); ctx.fillRect(9, 4 + headBob, 2, 1);
      } else {
        ctx.fillStyle = out; ctx.fillRect(5, 3 + headBob, 2, 2); ctx.fillRect(9, 3 + headBob, 2, 2);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(5, 3 + headBob, 1, 1); ctx.fillRect(9, 3 + headBob, 1, 1);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)'; ctx.fillRect(4, 5 + headBob, 2, 1); ctx.fillRect(10, 5 + headBob, 2, 1);
      }
    } else if (dir === 'up') {
      ctx.fillStyle = out; ctx.fillRect(4, 11 + legL, 3, 4); ctx.fillRect(9, 11 + legR, 3, 4);
      ctx.fillStyle = pal.pantsDark; ctx.fillRect(4, 11 + legL, 3, 2); ctx.fillRect(9, 11 + legR, 3, 2);
      ctx.fillStyle = pal.shoeDark; ctx.fillRect(4, 13 + legL, 3, 2); ctx.fillRect(9, 13 + legR, 3, 2);

      ctx.fillStyle = out; ctx.fillRect(3, 6 + headBob, 10, 6);
      ctx.fillStyle = pal.shirtDark; ctx.fillRect(4, 6 + headBob, 8, 5);
      ctx.fillStyle = pal.shirt; ctx.fillRect(5, 6 + headBob, 6, 4);
      ctx.fillStyle = pal.belt; ctx.fillRect(4, 10 + headBob, 8, 1);

      ctx.fillStyle = out; ctx.fillRect(4, 1 + headBob, 8, 6);
      ctx.fillStyle = pal.hairDark || pal.shirtDark; ctx.fillRect(4, 2 + headBob, 8, 5);
    } else {
      const isRight = dir === 'right';
      ctx.save();
      if (!isRight) {
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }
      ctx.fillStyle = out; ctx.fillRect(4, 11, 4, 4); ctx.fillRect(7, 11, 4, 4);
      ctx.fillStyle = pal.pantsDark; ctx.fillRect(5, 11, 3, 2); ctx.fillStyle = pal.pants; ctx.fillRect(8, 11, 3, 2);
      ctx.fillStyle = pal.shoeDark; ctx.fillRect(5, 13, 3, 2); ctx.fillStyle = pal.shoe; ctx.fillRect(8, 13, 3, 2);
      ctx.fillStyle = out; ctx.fillRect(5, 6 + headBob, 7, 6);
      ctx.fillStyle = pal.shirt; ctx.fillRect(7, 6 + headBob, 4, 4);
      ctx.fillStyle = out; ctx.fillRect(5, 1 + headBob, 8, 6);
      ctx.fillStyle = pal.skin; ctx.fillRect(7, 2 + headBob, 6, 4);
      ctx.fillStyle = pal.skin; ctx.fillRect(13, 4 + headBob, 1, 1);
      if (isBlinking) {
        ctx.fillStyle = out; ctx.fillRect(10, 4 + headBob, 2, 1);
      } else {
        ctx.fillStyle = out; ctx.fillRect(10, 3 + headBob, 2, 2);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(11, 3 + headBob, 1, 1);
      }
      ctx.restore();
    }
  }

  drawPossessionAura(ctx) {
    const pulse = Math.sin(Date.now() * 0.009) * 0.25 + 0.55;
    const grad = ctx.createRadialGradient(8, 8, 3, 8, 8, 18);
    grad.addColorStop(0, `rgba(255, 235, 59, ${pulse})`);
    grad.addColorStop(1, 'rgba(255, 235, 59, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 19, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(8, -2, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  getPalette(type) {
    const common = { skinLight: '#ffe4cc', skin: '#f5cda5', skinDark: '#d99f73', out: '#1c1917' };
    if (type === 'hero') return { ...common, hair: '#facc15', shirt: '#16a34a', shirtDark: '#14532d', shirtLight: '#4ade80', pants: '#e2e8f0', pantsDark: '#94a3b8', shoe: '#78350f', shoeDark: '#451a03', belt: '#78350f' };
    if (type === 'musician') return { ...common, skin: '#d4a373', shirt: '#f59e0b', shirtDark: '#b45309', shirtLight: '#fde047', pants: '#059669', pantsDark: '#064e3b', shoe: '#78350f', shoeDark: '#451a03', belt: '#dc2626' };
    if (type === 'vendedor') return { ...common, shirt: '#f1f5f9', shirtDark: '#cbd5e1', shirtLight: '#ffffff', pants: '#78350f', pantsDark: '#451a03', shoe: '#451a03', shoeDark: '#1c1917', belt: '#0284c7' };
    if (type === 'vecina_chismosa') return { ...common, shirt: '#f472b6', shirtDark: '#db2777', shirtLight: '#fbcfe8', pants: '#fbcfe8', pantsDark: '#f472b6', shoe: '#db2777', shoeDark: '#9f1239', belt: '#ec4899' };
    if (type === 'mototaxista') return { ...common, skin: '#d4a373', shirt: '#0284c7', shirtDark: '#0369a1', shirtLight: '#38bdf8', pants: '#1e293b', pantsDark: '#0f172a', shoe: '#ef4444', shoeDark: '#991b1b', belt: '#38bdf8' };
    if (type === 'police_cuadrante') return { ...common, out: '#064e3b', shirt: '#84cc16', shirtDark: '#4d7c0f', shirtLight: '#bef264', pants: '#14532d', pantsDark: '#052e16', shoe: '#0f172a', shoeDark: '#020617', belt: '#0f172a' };
    if (type === 'guerrillero') return { ...common, skin: '#d4a373', out: '#142e05', shirt: '#3f6212', shirtDark: '#1a2e05', shirtLight: '#65a30d', pants: '#365314', pantsDark: '#142903', shoe: '#0f172a', shoeDark: '#020617', belt: '#dc2626' };
    if (type === 'alcalde') return { ...common, out: '#0f172a', shirt: '#f8fafc', shirtDark: '#e2e8f0', shirtLight: '#ffffff', pants: '#cbd5e1', pantsDark: '#64748b', shoe: '#78350f', shoeDark: '#451a03', belt: '#facc15' };
    if (type === 'boss') return { ...common, out: '#18181b', shirt: '#991b1b', shirtDark: '#450a0a', shirtLight: '#dc2626', pants: '#f8fafc', pantsDark: '#cbd5e1', shoe: '#450a0a', shoeDark: '#18181b', belt: '#facc15' };
    if (type === 'prophet') return { ...common, out: '#0f172a', shirt: '#f8fafc', shirtDark: '#e2e8f0', shirtLight: '#ffffff', pants: '#0284c7', pantsDark: '#0369a1', shoe: '#78350f', shoeDark: '#451a03', belt: '#facc15' };
    if (type === 'soldier') return { ...common, out: '#111827', shirt: '#4b5563', shirtDark: '#374151', shirtLight: '#6b7280', pants: '#374151', pantsDark: '#1f2937', shoe: '#111827', shoeDark: '#030712', belt: '#1f2937' };
    if (type === 'child') return { ...common, shirt: '#fb923c', shirtDark: '#c2410c', shirtLight: '#fdba74', pants: '#38bdf8', pantsDark: '#0284c7', shoe: '#0284c7', shoeDark: '#0369a1', belt: '#ea580c' };
    return { ...common, shirt: '#f1f5f9', shirtDark: '#cbd5e1', shirtLight: '#ffffff', pants: '#5c3a21', pantsDark: '#331f13', shoe: '#331f13', shoeDark: '#1a0f0a', belt: '#78350f' };
  }
}

export const animManager = new AnimationManager();
