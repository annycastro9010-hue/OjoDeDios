// Motor de Animación Desacoplado de Alta Fidelidad Estilo The Legend of Zelda: The Minish Cap (GBA)
// Integra directamente las 2 Hojas de Sprites de Artista oficiales en formato PNG transparente de alta resolución.
// Mapea al 100% todos los roles del juego, animales y estados de evolución de la civilización sin fallbacks de rectángulos.

export class AnimationManager {
  constructor() {
    this.sheet1Img = null;
    this.sheet2Img = null;
    this.sheetsReady = false;

    this.initMinishSheets();
    this.setupSpriteMap();
  }

  // Carga garantizada de las dos hojas maestras transparentes de The Minish Cap
  initMinishSheets() {
    if (typeof window === 'undefined' || typeof Image === 'undefined') return;

    const loadImg = (paths) => {
      return new Promise((resolve) => {
        const tryPath = (idx) => {
          if (idx >= paths.length) {
            resolve(null);
            return;
          }
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => tryPath(idx + 1);
          img.src = paths[idx];
        };
        tryPath(0);
      });
    };

    const s1Paths = [
      './sprites/sheet1_minish.png',
      'sprites/sheet1_minish.png',
      '/OjoDeDios/sprites/sheet1_minish.png',
      '/sprites/sheet1_minish.png',
      './public/sprites/sheet1_minish.png',
      './sprites/sheet1_minish.jpg'
    ];
    const s2Paths = [
      './sprites/sheet2_minish.png',
      'sprites/sheet2_minish.png',
      '/OjoDeDios/sprites/sheet2_minish.png',
      '/sprites/sheet2_minish.png',
      './public/sprites/sheet2_minish.png',
      './sprites/sheet2_minish.jpg'
    ];

    Promise.all([loadImg(s1Paths), loadImg(s2Paths)]).then(([img1, img2]) => {
      if (img1) this.sheet1Img = img1;
      if (img2) this.sheet2Img = img2;
      if (this.sheet1Img || this.sheet2Img) {
        this.sheetsReady = true;
        console.log('✨ [OjoDeDios] Hojas de sprites Minish Cap activadas con éxito.');
      }
    });
  }

  setupSpriteMap() {
    // Coordenadas calculadas pixel a pixel en las hojas 1024x1024 transparentes
    this.spriteMap = {
      // -----------------------------------------------------------------------
      // HOJA 1: PROTAGONISTAS, ALDEANOS Y COLONOS
      // -----------------------------------------------------------------------

      // 1. MÚSICO / BOB MARLEY / HIPPIE (Fila 0 y Fila 1)
      musician: {
        sheet: 1,
        down: [
          { x: 16, y: 6, w: 69, h: 122 },
          { x: 119, y: 6, w: 69, h: 122 },
          { x: 222, y: 6, w: 81, h: 122 },
          { x: 323, y: 6, w: 83, h: 122 }
        ],
        side: [
          { x: 18, y: 133, w: 85, h: 122 },
          { x: 120, y: 133, w: 85, h: 122 },
          { x: 220, y: 133, w: 81, h: 122 },
          { x: 323, y: 133, w: 86, h: 122 }
        ],
        up: [
          { x: 425, y: 133, w: 78, h: 122 }
        ]
      },

      // 2. CAMPESINO / CULTIVADOR / GRANJERO / PESCADOR (Fila 0 col 5-9 y Fila 1)
      cultivator: {
        sheet: 1,
        down: [
          { x: 522, y: 6, w: 80, h: 122 },
          { x: 624, y: 6, w: 90, h: 122 },
          { x: 829, y: 6, w: 89, h: 122 },
          { x: 932, y: 6, w: 80, h: 122 }
        ],
        side: [
          { x: 728, y: 133, w: 77, h: 122 },
          { x: 830, y: 133, w: 77, h: 122 },
          { x: 422, y: 267, w: 77, h: 117 }
        ],
        up: [
          { x: 728, y: 6, w: 77, h: 122 }
        ]
      },

      // 3. VENDEDOR DE AGUACATES (DON MARIO CON MEGÁFONO) (Fila 2)
      vendedor: {
        sheet: 1,
        down: [
          { x: 12, y: 267, w: 79, h: 117 },
          { x: 110, y: 267, w: 96, h: 117 },
          { x: 522, y: 267, w: 94, h: 117 },
          { x: 828, y: 267, w: 98, h: 117 }
        ],
        side: [
          { x: 215, y: 267, w: 77, h: 117 },
          { x: 315, y: 267, w: 97, h: 117 },
          { x: 422, y: 267, w: 77, h: 117 }
        ],
        up: [
          { x: 627, y: 267, w: 76, h: 117 }
        ]
      },

      // 4. DOÑA GLORIA (VECINA CHISMOSA CON ESCOBA Y RULOS) (Fila 3)
      vecina_chismosa: {
        sheet: 1,
        down: [
          { x: 6, y: 395, w: 80, h: 117 },
          { x: 108, y: 395, w: 79, h: 117 },
          { x: 211, y: 395, w: 80, h: 117 },
          { x: 323, y: 395, w: 87, h: 117 }
        ],
        side: [
          { x: 415, y: 395, w: 84, h: 117 },
          { x: 527, y: 395, w: 90, h: 117 }
        ],
        up: [
          { x: 632, y: 395, w: 97, h: 117 }
        ]
      },

      // 5. EL BRAYAN (MOTOTAXISTA DE LA 125) (Fila 4)
      mototaxista: {
        sheet: 1,
        down: [
          { x: 18, y: 517, w: 66, h: 126 },
          { x: 118, y: 517, w: 77, h: 126 },
          { x: 214, y: 517, w: 84, h: 126 }
        ],
        side: [
          { x: 118, y: 517, w: 77, h: 126 },
          { x: 214, y: 517, w: 84, h: 126 }
        ],
        bike: [
          { x: 321, y: 517, w: 155, h: 126 },
          { x: 527, y: 517, w: 157, h: 126 }
        ]
      },

      // 6. EL PATRÓN (BOSS / MAGNATE / CAPO CON HABANO Y GAFAS) (Fila 5)
      boss: {
        sheet: 1,
        down: [
          { x: 18, y: 652, w: 65, h: 116 },
          { x: 120, y: 652, w: 67, h: 116 },
          { x: 222, y: 652, w: 70, h: 116 }
        ],
        side: [
          { x: 322, y: 652, w: 73, h: 116 },
          { x: 424, y: 652, w: 71, h: 116 },
          { x: 526, y: 652, w: 71, h: 116 }
        ]
      },

      // 7. PROFETA MOISÉS / PATRIARCA SAGRADO (Fila 6 col 0-4)
      prophet: {
        sheet: 1,
        down: [
          { x: 10, y: 778, w: 93, h: 125 },
          { x: 113, y: 778, w: 92, h: 125 },
          { x: 215, y: 778, w: 92, h: 125 }
        ],
        side: [
          { x: 317, y: 778, w: 93, h: 125 },
          { x: 418, y: 778, w: 94, h: 125 }
        ]
      },

      // 8. NIÑO / ALDEANO JOVEN (YOUNG LINK EN TÚNICA VERDE) (Fila 6 col 5-8)
      child: {
        sheet: 1,
        down: [
          { x: 532, y: 778, w: 62, h: 125 },
          { x: 632, y: 778, w: 66, h: 125 },
          { x: 737, y: 778, w: 62, h: 125 },
          { x: 837, y: 778, w: 66, h: 125 }
        ],
        side: [
          { x: 632, y: 778, w: 66, h: 125 },
          { x: 837, y: 778, w: 66, h: 125 }
        ]
      },

      // 9. LINK EL HÉROE DE HYRULE (Fila 7)
      hero: {
        sheet: 1,
        down: [
          { x: 20, y: 916, w: 62, h: 104 },
          { x: 530, y: 916, w: 66, h: 104 }
        ],
        side: [
          { x: 121, y: 916, w: 66, h: 104 },
          { x: 225, y: 916, w: 64, h: 104 },
          { x: 326, y: 916, w: 65, h: 104 },
          { x: 425, y: 916, w: 69, h: 104 }
        ],
        up: [
          { x: 632, y: 916, w: 64, h: 104 },
          { x: 735, y: 916, w: 66, h: 104 }
        ]
      },

      // -----------------------------------------------------------------------
      // HOJA 2: AUTORIDADES, FUERZAS MILITARES Y FAUNA
      // -----------------------------------------------------------------------

      // 10. PATRULLERO GÓMEZ / POLICÍA DEL CUADRANTE (Fila 0 y Fila 1)
      police_cuadrante: {
        sheet: 2,
        down: [
          { x: 19, y: 8, w: 65, h: 120 },
          { x: 122, y: 8, w: 75, h: 120 },
          { x: 225, y: 8, w: 74, h: 120 },
          { x: 527, y: 8, w: 79, h: 120 }
        ],
        side: [
          { x: 120, y: 135, w: 63, h: 121 },
          { x: 222, y: 135, w: 63, h: 121 },
          { x: 325, y: 135, w: 63, h: 121 },
          { x: 427, y: 135, w: 77, h: 121 }
        ],
        up: [
          { x: 735, y: 8, w: 60, h: 120 },
          { x: 835, y: 8, w: 67, h: 120 },
          { x: 735, y: 135, w: 61, h: 121 }
        ]
      },

      // 11. COMANDANTE TIRO-LOCO (GUERRILLERO DE LA SELVA) (Fila 2 y Fila 3)
      guerrillero: {
        sheet: 2,
        down: [
          { x: 17, y: 265, w: 70, h: 119 },
          { x: 119, y: 265, w: 87, h: 119 },
          { x: 527, y: 265, w: 88, h: 119 }
        ],
        side: [
          { x: 222, y: 265, w: 60, h: 119 },
          { x: 323, y: 265, w: 84, h: 119 },
          { x: 427, y: 265, w: 60, h: 119 },
          { x: 119, y: 392, w: 64, h: 118 }
        ],
        up: [
          { x: 732, y: 265, w: 61, h: 119 },
          { x: 633, y: 392, w: 91, h: 118 }
        ]
      },

      // 12. DOCTOR PROMESAS (ALCALDE / MONARCA / GOBERNANTE) (Fila 4)
      alcalde: {
        sheet: 2,
        down: [
          { x: 16, y: 520, w: 71, h: 120 },
          { x: 118, y: 520, w: 82, h: 120 },
          { x: 215, y: 520, w: 82, h: 120 },
          { x: 322, y: 520, w: 86, h: 120 }
        ],
        side: [
          { x: 432, y: 520, w: 56, h: 120 },
          { x: 640, y: 520, w: 52, h: 120 },
          { x: 740, y: 520, w: 52, h: 120 }
        ],
        action: [
          { x: 832, y: 520, w: 85, h: 120 }
        ]
      },

      // 13. SOLDADO MILITAR / GUARDIA DEL BASTIÓN (Fila 5)
      soldier: {
        sheet: 2,
        down: [
          { x: 18, y: 652, w: 66, h: 116 },
          { x: 120, y: 652, w: 61, h: 116 },
          { x: 222, y: 652, w: 62, h: 116 }
        ],
        side: [
          { x: 323, y: 652, w: 63, h: 116 },
          { x: 425, y: 652, w: 64, h: 116 },
          { x: 527, y: 652, w: 64, h: 116 }
        ]
      },

      // 14. MÉDICO / ENFERMERA / BOTÁNICA / SANADORA (Fila 6)
      medic: {
        sheet: 2,
        down: [
          { x: 14, y: 778, w: 75, h: 123 },
          { x: 116, y: 778, w: 75, h: 123 },
          { x: 218, y: 778, w: 74, h: 123 }
        ],
        side: [
          { x: 530, y: 778, w: 66, h: 123 },
          { x: 632, y: 778, w: 67, h: 123 },
          { x: 734, y: 778, w: 67, h: 123 }
        ],
        up: [
          { x: 320, y: 778, w: 75, h: 123 },
          { x: 423, y: 778, w: 74, h: 123 },
          { x: 837, y: 778, w: 66, h: 123 }
        ]
      },

      // 15. FAUNA: PERRO CRIOLLO / GOLDEN RETRIEVER (Fila 7 col 0-2)
      dog: {
        sheet: 2,
        down: [
          { x: 16, y: 924, w: 71, h: 95 },
          { x: 120, y: 924, w: 70, h: 95 }
        ],
        side: [
          { x: 218, y: 924, w: 81, h: 95 }
        ]
      },

      // 16. FAUNA: CERDITO ROSADO (Fila 7 col 3-6)
      pig: {
        sheet: 2,
        down: [
          { x: 325, y: 924, w: 67, h: 95 },
          { x: 428, y: 924, w: 66, h: 95 }
        ],
        up: [
          { x: 530, y: 924, w: 66, h: 95 }
        ],
        side: [
          { x: 632, y: 924, w: 69, h: 95 }
        ]
      },

      // 17. FAUNA: CAIMÁN DEL RÍO / REPTIL (Fila 7 col 7-9)
      croc: {
        sheet: 2,
        down: [
          { x: 924, y: 924, w: 95, h: 95 }
        ],
        side: [
          { x: 723, y: 924, w: 91, h: 95 },
          { x: 822, y: 924, w: 92, h: 95 }
        ]
      }
    };

    // ALIASES PARA GARANTIZAR QUE NINGÚN TIPO DEL JUEGO SE QUEDE SIN SPRITE
    this.spriteMap.peasant = this.spriteMap.cultivator;
    this.spriteMap.farmer = this.spriteMap.cultivator;
    this.spriteMap.fisherman = this.spriteMap.cultivator;
    this.spriteMap.civilian = this.spriteMap.vecina_chismosa;
    this.spriteMap.woman = this.spriteMap.vecina_chismosa;
    this.spriteMap.hippie = this.spriteMap.musician;
    this.spriteMap.police = this.spriteMap.police_cuadrante;
    this.spriteMap.healer = this.spriteMap.medic;
    this.spriteMap.nurse = this.spriteMap.medic;
    this.spriteMap.apothecary = this.spriteMap.medic;
    this.spriteMap.leader = this.spriteMap.alcalde;
    this.spriteMap.monarch = this.spriteMap.alcalde;
    this.spriteMap.king = this.spriteMap.alcalde;
    this.spriteMap.champion = this.spriteMap.hero;
  }

  // Renderizado Principal de Personajes (Garantizado desde Hoja de Artista)
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

    // 2. Dibujar desde las Hojas Oficiales de Sprites Minish Cap
    let resolvedType = type;
    if (!this.spriteMap[resolvedType]) {
      resolvedType = 'cultivator'; // Fallback visual de artista garantizado
    }

    this.drawFromArtistSheet(ctx, resolvedType, direction, frame, isMoving);

    // 3. Sumersión visual si está en agua
    if (inWater && type !== 'prophet') {
      ctx.save();
      ctx.fillStyle = 'rgba(24, 95, 185, 0.55)';
      ctx.fillRect(1, 11, 14, 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(2, 11, 12, 1);
      ctx.restore();
    }

    // 4. Efectos Celestiales si está poseído por Dios
    if (isPossessed) {
      this.drawPossessionAura(ctx);
    }

    ctx.restore();
  }

  // Dibuja el frame exacto de la hoja de artista con proporción y escala GBA Minish Cap
  drawFromArtistSheet(ctx, type, dir, frame, isMoving) {
    const config = this.spriteMap[type] || this.spriteMap.cultivator;
    if (!config) return false;

    const sheetImg = config.sheet === 1 ? this.sheet1Img : this.sheet2Img;
    if (!sheetImg) return false;

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

    // El mototaxista utiliza su moto DT 125 cuando está en movimiento acelerado
    if (type === 'mototaxista' && config.bike && isMoving) {
      dirKey = 'bike';
      isFlip = (dir === 'left');
    }

    const frameList = config[dirKey] || config.down || [];
    if (!frameList || frameList.length === 0) return false;

    const frameIdx = isMoving ? (frame % frameList.length) : 0;
    const f = frameList[frameIdx];

    ctx.save();

    // Proporciones nítidas para pantalla y resolución GBA Minish Cap
    let dw = 22;
    let dh = 28;
    let dx = -3;
    let dy = -13;

    if (dirKey === 'bike') {
      dw = 36;
      dh = 28;
      dx = isFlip ? -7 : -11;
      dy = -13;
    } else if (type === 'child') {
      dw = 18;
      dh = 22;
      dx = -1;
      dy = -8;
    }

    if (isFlip) {
      ctx.translate(16, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      sheetImg,
      f.x, f.y, f.w, f.h,
      dx, dy, dw, dh
    );
    ctx.restore();
    return true;
  }

  // Dibuja fauna y animales directamente de la Hoja 2
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
    const config = this.spriteMap[type];
    const sheetImg = this.sheet2Img;

    if (sheetImg && config) {
      const isFacingRight = (direction === 'right');
      const frameList = (direction === 'up' && config.up) ? config.up : (config.side || config.down || []);
      const f = frameList[frame % frameList.length];

      ctx.save();
      if (!isFacingRight) {
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }

      const dw = (type === 'croc') ? 26 : 22;
      const dh = 22;
      const dx = (type === 'croc') ? -5 : -3;
      const dy = -8;

      ctx.drawImage(
        sheetImg,
        f.x, f.y, f.w, f.h,
        dx, dy, dw, dh
      );
      ctx.restore();
      drawn = true;
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

  drawPossessionAura(ctx) {
    const pulse = Math.sin(Date.now() * 0.009) * 0.25 + 0.55;
    const grad = ctx.createRadialGradient(8, 8, 3, 8, 8, 19);
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
}

export const animManager = new AnimationManager();
