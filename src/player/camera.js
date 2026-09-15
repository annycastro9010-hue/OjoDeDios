// Cámara cinematográfica con interpolación suave de zoom entre Modo Dios y Modo Zelda

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.scale = 1.0;
    this.targetScale = 1.0;

    this.godScale = 1.0;
    this.possessedScale = 3.0;

    this.isTransitioning = false;
    this.shake = 0;
    this.shakeDuration = 0;
    this.followedEntity = null;
  }

  follow(entity, zoomScale = null) {
    this.followedEntity = entity;
    if (entity) {
      const isMobile = this.canvas.width < 600;
      this.targetScale = zoomScale !== null ? zoomScale : (isMobile ? 2.5 : 3.0);
      this.targetX = entity.x + 8;
      this.targetY = entity.y + 8;
    }
  }

  unfollow() {
    this.followedEntity = null;
  }

  resetView(worldWidth = 130, worldHeight = 85, tileSize = 8) {
    this.unfollow();
    const worldPxW = worldWidth * tileSize;
    const worldPxH = worldHeight * tileSize;
    const scaleX = this.canvas.width / worldPxW;
    const scaleY = this.canvas.height / worldPxH;
    this.godScale = Math.min(scaleX, scaleY) * 0.92;
    this.targetScale = Math.max(0.25, Math.min(this.godScale, 1.5));
    this.targetX = worldPxW / 2;
    this.targetY = worldPxH / 2;
  }

  triggerShake(intensity = 4, duration = 10) {
    this.shake = intensity;
    this.shakeDuration = duration;
  }

  setMode(mode, targetEntity = null, worldWidth = 140, worldHeight = 90, tileSize = 8) {
    const worldPxW = worldWidth * tileSize;
    const worldPxH = worldHeight * tileSize;

    if (mode === 'god') {
      // Ajustar escala para ver la isla cómodamente en cualquier pantalla (móvil vertical, tablet o desktop)
      const scaleX = this.canvas.width / worldPxW;
      const scaleY = this.canvas.height / worldPxH;
      this.godScale = Math.min(scaleX, scaleY) * 0.92;
      this.targetScale = Math.max(0.25, Math.min(this.godScale, 1.5));
      this.targetX = worldPxW / 2;
      this.targetY = worldPxH / 2;
    } else if (mode === 'possessed' && targetEntity) {
      const isMobile = this.canvas.width < 600;
      this.targetScale = isMobile ? 2.4 : this.possessedScale;
      this.targetX = targetEntity.x + 8;
      this.targetY = targetEntity.y + 8;
    }
  }

  update(possessedEntity = null) {
    // Si estamos poseyendo, la cámara sigue al personaje poseído
    if (possessedEntity) {
      this.targetX = possessedEntity.x + 8;
      this.targetY = possessedEntity.y + 8;
    } else if (this.followedEntity) {
      // Si estamos en modo espectador/observando a un aldeano
      if (this.followedEntity.needs && this.followedEntity.needs.health <= 0) {
        this.unfollow();
      } else {
        this.targetX = this.followedEntity.x + 8;
        this.targetY = this.followedEntity.y + 8;
      }
    }

    // Interpolación suave (Lerp)
    this.x += (this.targetX - this.x) * 0.08;
    this.y += (this.targetY - this.y) * 0.08;
    this.scale += (this.targetScale - this.scale) * 0.06;

    // Reducción de sacudida
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      this.shake *= 0.88;
    } else {
      this.shake = 0;
    }
  }

  zoomBy(factor, cursorX = null, cursorY = null) {
    const oldScale = this.targetScale;
    const newScale = Math.max(0.35, Math.min(3.8, oldScale * factor));
    this.targetScale = newScale;

    if (!this.followedEntity && cursorX !== null && cursorY !== null) {
      const worldPos = this.screenToWorld(cursorX, cursorY);
      this.targetX += (worldPos.x - this.targetX) * 0.2;
      this.targetY += (worldPos.y - this.targetY) * 0.2;
    }
  }

  panBy(dx, dy) {
    this.unfollow();
    this.targetX -= dx / this.scale;
    this.targetY -= dy / this.scale;
    this.x = this.targetX;
    this.y = this.targetY;
  }

  // Convierte coordenadas de pantalla (mouse click) a coordenadas de mundo en píxeles
  screenToWorld(screenX, screenY) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const worldX = (screenX - cx) / this.scale + this.x;
    const worldY = (screenY - cy) / this.scale + this.y;
    return { x: worldX, y: worldY };
  }

  // Convierte coordenadas de mundo a celda de la simulación
  worldToTile(worldX, worldY, tileSize = 8) {
    return {
      tileX: Math.floor(worldX / tileSize),
      tileY: Math.floor(worldY / tileSize)
    };
  }

  // Aplica la matriz de transformación a Canvas
  applyTransform(ctx) {
    ctx.save();
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.scale(this.scale, this.scale);

    const shakeX = (Math.random() - 0.5) * this.shake;
    const shakeY = (Math.random() - 0.5) * this.shake;
    ctx.translate(-this.x + shakeX, -this.y + shakeY);
  }

  restoreTransform(ctx) {
    ctx.restore();
  }
}
