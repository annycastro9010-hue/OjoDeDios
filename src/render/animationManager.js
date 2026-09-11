// Motor de Animación Desacoplado de Alta Fidelidad Estilo The Minish Cap
// Soporta tanto renderizado procedural ultra-nítido como SpriteSheets externos (Aseprite / PNG)

export class AnimationManager {
  constructor() {
    this.sheets = new Map();
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

  draw(ctx, type, x, y, direction = 'down', frame = 0, isMoving = false, hasCargo = false, isPossessed = false, isSwimming = false, inWater = false) {
    const sheet = this.sheets.get(type);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.floor(x), Math.floor(y));

    // 1. Sombra bajo los pies o estela de agua / milagro divino
    if (inWater) {
      if (type === 'prophet') {
        // ✨ Aureola milagrosa sobre el agua
        ctx.save();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else {
        // Onda acuática elíptica alrededor del cuerpo sumergido
        ctx.save();
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(8, 12, 7, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      this.drawGroundShadow(ctx, 8, 14);
    }

    // Si es un niño / cría, escalar para que sea pequeño y adorable
    if (type === 'child') {
      ctx.scale(0.72, 0.72);
      ctx.translate(3, 5);
    }

    if (sheet && sheet.loaded) {
      this.drawExternalFrame(ctx, sheet, direction, frame, isMoving);
    } else {
      this.drawMinishCharacter(ctx, type, direction, frame, isMoving, hasCargo);
    }

    // 🌊 Sumersión visual si está en el agua y no es el profeta
    if (inWater && type !== 'prophet') {
      ctx.save();
      // Capa translúcida de agua sobre las piernas
      ctx.fillStyle = 'rgba(24, 85, 175, 0.6)';
      ctx.fillRect(2, 11, 12, 5);
      // Espuma blanca en la línea de flotación
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(3, 11, 10, 1);
      ctx.restore();
    }

    // Efectos Celestiales si está poseído
    if (isPossessed) {
      this.drawPossessionAura(ctx);
    }

    ctx.restore();
  }

  drawGroundShadow(ctx, cx, cy) {
    ctx.fillStyle = 'rgba(10, 15, 25, 0.42)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

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

  // Motor Minish Cap Procedural de Alta Fidelidad
  drawMinishCharacter(ctx, type, dir, frame, isMoving, hasCargo) {
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

    const colors = this.getCharacterPalette(type);

    // Contorno sutil del cuerpo para dar volumen pixel art
    ctx.fillStyle = colors.outline || '#1c1917';
    ctx.fillRect(3, 5 + headBob, 10, 7);

    // ================= DIBUJO SEGÚN DIRECCIÓN =================
    if (dir === 'down') {
      // Piernas y calzado
      ctx.fillStyle = colors.pants;
      ctx.fillRect(4, 11 + legLeftOffset, 3, 3);
      ctx.fillRect(9, 11 + legRightOffset, 3, 3);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(4, 13 + legLeftOffset, 3, 2);
      ctx.fillRect(9, 13 + legRightOffset, 3, 2);

      // Torso / Ropa
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(4, 6 + headBob, 8, 5);

      // Cinturón o detalle
      ctx.fillStyle = colors.belt || '#78350f';
      ctx.fillRect(4, 10 + headBob, 8, 1);

      // Brazos y manos
      ctx.fillStyle = colors.skin;
      ctx.fillRect(2, 7 + armLeftOffset + headBob, 2, 3);
      ctx.fillRect(12, 7 + armRightOffset + headBob, 2, 3);

      // Cabeza y Cara
      ctx.fillStyle = colors.skin;
      ctx.fillRect(5, 3 + headBob, 6, 4);

      // Ojos estilo Zelda (2x2 px con brillo)
      ctx.fillStyle = '#111827';
      ctx.fillRect(5, 4 + headBob, 2, 2);
      ctx.fillRect(9, 4 + headBob, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 4 + headBob, 1, 1);
      ctx.fillRect(9, 4 + headBob, 1, 1);

      // Detalles específicos de la cabeza (sombreros, barbas, rastas)
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
      // Piernas traseras
      ctx.fillStyle = colors.pants;
      ctx.fillRect(4, 11 + legLeftOffset, 3, 3);
      ctx.fillRect(9, 11 + legRightOffset, 3, 3);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(4, 13 + legLeftOffset, 3, 2);
      ctx.fillRect(9, 13 + legRightOffset, 3, 2);

      // Espalda
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(4, 6 + headBob, 8, 5);

      if (hasCargo) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(4, 5 + headBob, 8, 5);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
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
        ctx.translate(16, 0);
        ctx.scale(-1, 1);
      }

      // Piernas en perfil
      ctx.fillStyle = colors.pants;
      ctx.fillRect(6 + legLeftOffset, 11, 4, 3);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(6 + legLeftOffset, 13, 4, 2);

      // Torso lateral
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(5, 6 + headBob, 6, 5);

      // Brazo lateral oscilante
      ctx.fillStyle = colors.skin;
      ctx.fillRect(7 + armRightOffset, 7 + headBob, 2, 4);

      // Cara perfil
      ctx.fillStyle = colors.skin;
      ctx.fillRect(7, 3 + headBob, 5, 4);

      // Ojo perfil con brillo
      ctx.fillStyle = '#111827';
      ctx.fillRect(10, 4 + headBob, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 4 + headBob, 1, 1);

      this.drawHeadwear(ctx, type, 'side', headBob, colors);

      if (hasCargo) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(11, 6 + headBob, 5, 4);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(11, 6 + headBob, 5, 4);
      }

      ctx.restore();
    }
  }

  drawHeadwear(ctx, type, view, bob, colors) {
    if (type === 'prophet') {
      // Barba canosa flotante y velo sagrado
      if (view === 'down') {
        ctx.fillStyle = '#f8fafc'; // Barba blanca
        ctx.fillRect(6, 6 + bob, 4, 3);
        ctx.fillRect(7, 9 + bob, 2, 2);
        // Velo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 1 + bob, 8, 3);
        ctx.fillStyle = '#38bdf8'; // Ribete celestial
        ctx.fillRect(4, 3 + bob, 8, 1);
      } else if (view === 'side') {
        ctx.fillStyle = '#f8fafc'; // Barba perfil
        ctx.fillRect(10, 6 + bob, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 1 + bob, 6, 3);
      } else {
        ctx.fillStyle = '#ffffff'; // Manto trasero
        ctx.fillRect(4, 1 + bob, 8, 6);
      }
    } else if (type === 'musician' || type === 'hippie') {
      // Bob Marley: Gorro Rasta y Rastas ondeando
      if (view === 'down') {
        // Gorro Tricolor (Rojo, Amarillo, Verde)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(4, 0 + bob, 8, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4, 2 + bob, 8, 1);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(4, 3 + bob, 8, 1);
        // Rastas laterales
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(3, 4 + bob, 2, 5);
        ctx.fillRect(11, 4 + bob, 2, 5);
      } else if (view === 'side') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(5, 0 + bob, 7, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(5, 2 + bob, 7, 1);
        // Rastas cayendo atrás
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(4, 3 + bob, 3, 6);
      } else {
        ctx.fillStyle = '#1c1917'; // Rastas en la espalda
        ctx.fillRect(4, 4 + bob, 8, 6);
      }
    } else if (type === 'soldier') {
      // Casco de acero militar M1 con brillo metálico
      ctx.fillStyle = colors.hat;
      if (view === 'side') {
        ctx.fillRect(6, 0 + bob, 7, 3);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(7, 0 + bob, 4, 1); // Brillo metálico
      } else {
        ctx.fillRect(4, 0 + bob, 8, 3);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(6, 0 + bob, 4, 1);
      }
    } else if (type === 'healer' || type === 'medic') {
      // Velo médico con Cruz Roja
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 1 + bob, 8, 3);
      if (view === 'down') {
        ctx.fillStyle = '#ef4444'; // Cruz Roja en el pecho/frente
        ctx.fillRect(7, 2 + bob, 2, 2);
      }
    } else if (type === 'boss') {
      // Gafas oscuras y peinado elegante
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(4, 1 + bob, 8, 3);
      if (view === 'down') {
        ctx.fillStyle = '#000000'; // Gafas oscuras
        ctx.fillRect(4, 4 + bob, 8, 2);
        ctx.fillStyle = '#facc15'; // Cadena de oro
        ctx.fillRect(7, 8 + bob, 2, 1);
      }
    } else if (type === 'child') {
      // Gorrita hacia atrás y mechones
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, 1 + bob, 8, 3);
      if (view === 'down') {
        ctx.fillStyle = '#78350f'; // Mechón castaño
        ctx.fillRect(5, 3 + bob, 2, 1);
        ctx.fillRect(9, 3 + bob, 2, 1);
      }
    } else if (type === 'police_cuadrante') {
      // Gorra verde con visera negra y detalle reflectivo fluorescente
      ctx.fillStyle = colors.hat;
      ctx.fillRect(4, 0 + bob, 8, 3);
      ctx.fillStyle = '#111827'; // Visera
      if (view === 'down') {
        ctx.fillRect(4, 3 + bob, 8, 1);
        ctx.fillStyle = '#84cc16'; // Franja reflectiva
        ctx.fillRect(4, 2 + bob, 8, 1);
      } else if (view === 'side') {
        ctx.fillRect(7, 3 + bob, 4, 1);
      }
    } else if (type === 'guerrillero') {
      // Boina / cachucha militar y pañoleta roja al cuello
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 0 + bob, 8, 3);
      if (view === 'down') {
        ctx.fillStyle = '#dc2626'; // Pañoleta roja
        ctx.fillRect(6, 6 + bob, 4, 2);
        ctx.fillRect(7, 8 + bob, 2, 2);
      } else if (view === 'side') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(8, 6 + bob, 3, 2);
      }
    } else if (type === 'mototaxista') {
      // Casco de moto deportivo con visera
      ctx.fillStyle = colors.hat;
      ctx.fillRect(3, -1 + bob, 10, 4);
      ctx.fillStyle = '#0f172a'; // Visera oscura
      if (view === 'down') {
        ctx.fillRect(5, 2 + bob, 6, 2);
        ctx.fillStyle = '#ffffff'; // Rayas deportivas
        ctx.fillRect(7, -1 + bob, 2, 4);
      } else if (view === 'side') {
        ctx.fillRect(8, 2 + bob, 4, 2);
      }
    } else if (type === 'vendedor') {
      // Gorra campesina y megáfono
      ctx.fillStyle = colors.hat;
      ctx.fillRect(3, 0 + bob, 10, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 2 + bob, 8, 1);
      if (view === 'down') {
        // Megáfono rojo en la mano
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(1, 7 + bob, 2, 3);
        ctx.fillStyle = '#f8fafc'; // Bocina
        ctx.fillRect(0, 6 + bob, 2, 5);
      } else if (view === 'side') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(12, 7 + bob, 3, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(14, 6 + bob, 2, 4);
      }
    } else if (type === 'vecina_chismosa') {
      // Rulos de colores en la cabeza y escoba
      ctx.fillStyle = '#ec4899'; // Rulos rosas y morados
      ctx.fillRect(3, 0 + bob, 3, 3);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(6, -1 + bob, 4, 3);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(10, 0 + bob, 3, 3);
      // Escoba de barrer
      ctx.fillStyle = '#b45309'; // Palo
      ctx.fillRect(13, 3 + bob, 1, 10);
      ctx.fillStyle = '#eab308'; // Paja de la escoba
      ctx.fillRect(12, 11 + bob, 3, 4);
    } else if (type === 'alcalde') {
      // Pelo negro engominado y banda presidencial tricolor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 1 + bob, 8, 3);
      if (view === 'down') {
        // Banda presidencial: Amarillo, Azul, Rojo
        ctx.fillStyle = '#facc15';
        ctx.fillRect(5, 6 + bob, 2, 2);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(7, 7 + bob, 2, 2);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(9, 8 + bob, 2, 2);
      }
    } else if (type === 'hero') {
      // Gorro verde picudo estilo Link Minish Cap + mechones rubios
      if (view === 'down') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(4, 0 + bob, 8, 3);
        ctx.fillRect(2, 1 + bob, 3, 3); // Punta del gorro doblada hacia el hombro
        ctx.fillRect(1, 3 + bob, 2, 2);
        // Mechones rubios
        ctx.fillStyle = '#facc15';
        ctx.fillRect(5, 3 + bob, 3, 2);
        ctx.fillRect(9, 3 + bob, 2, 2);
      } else if (view === 'side') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(5, 0 + bob, 7, 3);
        ctx.fillRect(3, 1 + bob, 3, 2);
        ctx.fillRect(1, 2 + bob, 3, 2); // Punta flotando hacia atrás
        ctx.fillStyle = '#facc15';
        ctx.fillRect(9, 3 + bob, 3, 2);
      } else {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(4, 0 + bob, 8, 4);
        ctx.fillRect(3, 3 + bob, 3, 4);
        ctx.fillRect(2, 6 + bob, 2, 3); // Gorro colgando en la espalda
      }
    } else {
      // Sombrero campesino de paja tejido estilo Minish Cap
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
    }
  }

  drawPossessionAura(ctx) {
    const pulse = Math.sin(Date.now() * 0.009) * 0.2 + 0.45;
    const grad = ctx.createRadialGradient(8, 8, 3, 8, 8, 16);
    grad.addColorStop(0, `rgba(255, 235, 59, ${pulse})`);
    grad.addColorStop(1, 'rgba(255, 235, 59, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 18, 0, Math.PI * 2);
    ctx.fill();

    // Halo celestial
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(8, -2, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  getCharacterPalette(type) {
    if (type === 'prophet') {
      return {
        skin: '#f5cda5',
        shirt: '#ffffff',
        pants: '#0284c7',
        shoes: '#78350f',
        belt: '#eab308',
        hat: '#ffffff',
        hatBand: '#38bdf8',
        outline: '#1e293b'
      };
    } else if (type === 'musician' || type === 'hippie') {
      return {
        skin: '#d4a373',
        shirt: '#f59e0b',
        pants: '#059669',
        shoes: '#78350f',
        belt: '#dc2626',
        hat: '#ef4444',
        hatBand: '#facc15',
        outline: '#1c1917'
      };
    } else if (type === 'fisherman') {
      return {
        skin: '#f5cda5',
        shirt: '#0284c7',
        pants: '#334155',
        shoes: '#1e293b',
        belt: '#0369a1',
        hat: '#f1f5f9',
        hatBand: '#0284c7',
        outline: '#0f172a'
      };
    } else if (type === 'soldier') {
      return {
        skin: '#f5cda5',
        shirt: '#4b5563',
        pants: '#374151',
        shoes: '#111827',
        belt: '#1f2937',
        hat: '#4b5563',
        hatBand: '#1f2937',
        outline: '#111827'
      };
    } else if (type === 'healer' || type === 'medic') {
      return {
        skin: '#f5cda5',
        shirt: '#f8fafc',
        pants: '#0284c7',
        shoes: '#334155',
        belt: '#ef4444',
        hat: '#ffffff',
        hatBand: '#ef4444',
        outline: '#1e293b'
      };
    } else if (type === 'boss') {
      return {
        skin: '#f5cda5',
        shirt: '#991b1b',
        pants: '#f8fafc',
        shoes: '#450a0a',
        belt: '#facc15',
        hat: '#18181b',
        hatBand: '#facc15',
        outline: '#271915'
      };
    } else if (type === 'child') {
      return {
        skin: '#f5cda5',
        shirt: '#fb923c',
        pants: '#38bdf8',
        shoes: '#0284c7',
        belt: '#ea580c',
        hat: '#facc15',
        hatBand: '#ea580c',
        outline: '#1c1917'
      };
    } else if (type === 'police_cuadrante') {
      return {
        skin: '#f5cda5',
        shirt: '#84cc16', // Chaleco reflectivo fluorescente
        pants: '#14532d', // Pantalón verde oscuro policial
        shoes: '#022c22',
        belt: '#1e293b',
        hat: '#15803d',
        hatBand: '#84cc16',
        outline: '#064e3b'
      };
    } else if (type === 'guerrillero') {
      return {
        skin: '#d4a373',
        shirt: '#3f6212', // Camuflado verde selva
        pants: '#365314',
        shoes: '#0f172a', // Botas pantaneras de caucho
        belt: '#dc2626', // Pañoleta roja
        hat: '#1e293b',  // Boina / gorra
        hatBand: '#dc2626',
        outline: '#1a2e05'
      };
    } else if (type === 'mototaxista') {
      return {
        skin: '#d4a373',
        shirt: '#0284c7', // Camiseta esqueleto
        pants: '#1e293b',
        shoes: '#ef4444', // Tenis deportivos
        belt: '#38bdf8',
        hat: '#ef4444',   // Casco de moto
        hatBand: '#ffffff',
        outline: '#0f172a'
      };
    } else if (type === 'vendedor') {
      return {
        skin: '#f5cda5',
        shirt: '#f8fafc', // Delantal de trabajo
        pants: '#78350f',
        shoes: '#451a03',
        belt: '#0284c7',
        hat: '#ca8a04',   // Gorra campesina
        hatBand: '#78350f',
        outline: '#292524'
      };
    } else if (type === 'vecina_chismosa') {
      return {
        skin: '#f5cda5',
        shirt: '#f472b6', // Bata floreada rosa
        pants: '#fbcfe8',
        shoes: '#db2777', // Pantuflas
        belt: '#ec4899',
        hat: '#f43f5e',   // Rulos en el pelo
        hatBand: '#a855f7',
        outline: '#831843'
      };
    } else if (type === 'alcalde') {
      return {
        skin: '#f5cda5',
        shirt: '#ffffff', // Guayabera blanca impecable
        pants: '#cbd5e1',
        shoes: '#78350f',
        belt: '#facc15',  // Banda presidencial
        hat: '#0f172a',   // Pelo engominado
        hatBand: '#facc15',
        outline: '#1e293b'
      };
    } else if (type === 'hero') {
      return {
        skin: '#fed7aa',
        shirt: '#16a34a', // Túnica verde esmeralda icónica
        pants: '#f8fafc', // Mallas blancas
        shoes: '#78350f', // Botas de cuero marrón
        belt: '#eab308',  // Cinturón con hebilla dorada
        hat: '#15803d',   // Gorro verde picudo
        hatBand: '#facc15', // Mechón rubio
        outline: '#14532d'
      };
    }

    // Cultivador / Aldeano estándar
    return {
      skin: '#f5cda5',
      shirt: '#f1f5f9',
      pants: '#5c3a21',
      shoes: '#331f13',
      belt: '#78350f',
      hat: '#d4a359',
      hatBand: '#b88439',
      outline: '#1c1917'
    };
  }
}

export const animManager = new AnimationManager();
