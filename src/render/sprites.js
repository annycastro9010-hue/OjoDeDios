// Generador y renderizado de sprites Pixel Art estilo Zelda Minish Cap (16x16)

export class SpriteRenderer {
  constructor() {
    this.cache = new Map();
  }

  // Dibuja un personaje pixel art en el contexto 2D
  drawCharacter(ctx, type, x, y, direction = 'down', frame = 0, hasCargo = false, isPossessed = false) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Si está poseído, aura divina pulsante
    if (isPossessed) {
      ctx.save();
      const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 0.5;
      const gradient = ctx.createRadialGradient(8, 8, 2, 8, 8, 16);
      gradient.addColorStop(0, `rgba(255, 235, 59, ${pulse})`);
      gradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(8, 8, 16, 0, Math.PI * 2);
      ctx.fill();

      // Halo dorado sobre la cabeza
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(8, -1, 5, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Desplazamiento por pasos (animación bobbing)
    const bob = (frame % 2 === 1) ? 1 : 0;

    if (type === 'cultivator') {
      this.drawCultivator(ctx, direction, bob, hasCargo);
    } else if (type === 'police') {
      this.drawPolice(ctx, direction, bob);
    } else if (type === 'boss') {
      this.drawBoss(ctx, direction, bob);
    }

    ctx.restore();
  }

  drawCultivator(ctx, dir, bob, hasCargo) {
    // Sombrero de paja
    ctx.fillStyle = '#d4a359';
    ctx.fillRect(2, 0 + bob, 12, 3);
    ctx.fillStyle = '#b88439';
    ctx.fillRect(4, -2 + bob, 8, 2);

    // Cara
    ctx.fillStyle = '#f5cda5';
    ctx.fillRect(5, 3 + bob, 6, 4);

    // Ojos según dirección
    ctx.fillStyle = '#222';
    if (dir === 'left') {
      ctx.fillRect(5, 4 + bob, 2, 2);
    } else if (dir === 'right') {
      ctx.fillRect(9, 4 + bob, 2, 2);
    } else if (dir === 'down') {
      ctx.fillRect(5, 4 + bob, 2, 2);
      ctx.fillRect(9, 4 + bob, 2, 2);
    }

    // Camisa blanca / campesino
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(4, 7 + bob, 8, 5);

    // Pantalones marrones
    ctx.fillStyle = '#654321';
    ctx.fillRect(5, 12, 3, 3 - bob);
    ctx.fillRect(8, 12, 3, 2 + bob);

    // Si lleva carga clandestina (fardo en la espalda o brazos)
    if (hasCargo) {
      ctx.fillStyle = '#10b981'; // Verde alijo
      ctx.fillRect(dir === 'right' ? 1 : 11, 7 + bob, 4, 4);
      ctx.strokeStyle = '#f59e0b'; // Cinta amarilla
      ctx.lineWidth = 1;
      ctx.strokeRect(dir === 'right' ? 1 : 11, 7 + bob, 4, 4);
    }
  }

  drawPolice(ctx, dir, bob) {
    // Gorra azul oscuro de policía
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(3, 0 + bob, 10, 3);
    // Placa dorada en la gorra
    ctx.fillStyle = '#facc15';
    ctx.fillRect(7, 0 + bob, 2, 2);

    // Cara
    ctx.fillStyle = '#f5cda5';
    ctx.fillRect(5, 3 + bob, 6, 4);

    // Ojos
    ctx.fillStyle = '#111';
    if (dir === 'left') {
      ctx.fillRect(5, 4 + bob, 2, 2);
    } else if (dir === 'right') {
      ctx.fillRect(9, 4 + bob, 2, 2);
    } else {
      ctx.fillRect(5, 4 + bob, 2, 2);
      ctx.fillRect(9, 4 + bob, 2, 2);
    }

    // Uniforme policial azul con corbata/placa
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(4, 7 + bob, 8, 5);
    ctx.fillStyle = '#facc15'; // Placa en pecho
    ctx.fillRect(5, 8 + bob, 2, 2);

    // Pantalones oscuros
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5, 12, 3, 3 - bob);
    ctx.fillRect(8, 12, 3, 2 + bob);
  }

  drawBoss(ctx, dir, bob) {
    // Pelo engominado / sombrero elegante
    ctx.fillStyle = '#18181b';
    ctx.fillRect(3, 0 + bob, 10, 3);

    // Gafas de sol negras
    ctx.fillStyle = '#f5cda5';
    ctx.fillRect(5, 3 + bob, 6, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 4 + bob, 8, 2);

    // Traje rojo vino
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(4, 7 + bob, 8, 5);
    // Cadena dorada
    ctx.fillStyle = '#facc15';
    ctx.fillRect(7, 8 + bob, 2, 3);

    // Pantalones blancos
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(5, 12, 3, 3 - bob);
    ctx.fillRect(8, 12, 3, 2 + bob);

    // Humo de puro
    if (Math.random() < 0.3) {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
      ctx.fillRect(dir === 'right' ? 12 : 2, 3 + bob, 2, 2);
    }
  }

  // Dibuja el cono de visión de un policía
  drawVisionCone(ctx, x, y, dir, range = 65, fov = Math.PI * 0.35) {
    ctx.save();
    let baseAngle = 0;
    if (dir === 'right') baseAngle = 0;
    else if (dir === 'down') baseAngle = Math.PI * 0.5;
    else if (dir === 'left') baseAngle = Math.PI;
    else if (dir === 'up') baseAngle = -Math.PI * 0.5;

    ctx.beginPath();
    ctx.moveTo(x + 8, y + 8);
    ctx.arc(x + 8, y + 8, range, baseAngle - fov / 2, baseAngle + fov / 2);
    ctx.closePath();

    const grad = ctx.createRadialGradient(x + 8, y + 8, 5, x + 8, y + 8, range);
    grad.addColorStop(0, 'rgba(255, 235, 59, 0.45)');
    grad.addColorStop(1, 'rgba(255, 235, 59, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }
}

export const sprites = new SpriteRenderer();
