// Simulación del Ciclo Circadiano Día/Noche y Horario Humano
// Maneja 24 horas del día con luz ambiental, fases diurnas/nocturnas y eventos de rutina

export class DayNightCycle {
  constructor() {
    this.time = 8.0; // Inicia a las 8:00 AM (inicio de jornada laboral)
    this.day = 1;
    this.speedMultiplier = 0.0035; // ~1 minuto real = 1 día a velocidad 1x
  }

  // Avanza el tiempo con base en timeSpeed del juego
  step(timeSpeed = 1) {
    if (timeSpeed <= 0) return;
    this.time += this.speedMultiplier * timeSpeed;
    if (this.time >= 24.0) {
      this.time -= 24.0;
      this.day++;
    }
  }

  getHour() {
    return Math.floor(this.time);
  }

  getMinute() {
    return Math.floor((this.time - Math.floor(this.time)) * 60);
  }

  // Retorna string formateado de hora (ej: "☀️ 08:30 AM (Día 1)")
  getFormattedTime() {
    const h = this.getHour();
    const m = this.getMinute();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const padM = m < 10 ? `0${m}` : m;
    const icon = this.isNight() ? '🌙' : (this.isDawn() ? '🌅' : (this.isDusk() ? '🌇' : '☀️'));
    return `${icon} ${displayH}:${padM} ${period} • Día ${this.day}`;
  }

  // Fases del día para la rutina humana
  isDawn() {
    return this.time >= 5.5 && this.time < 7.5; // 5:30 AM - 7:30 AM
  }

  isMorningWork() {
    return this.time >= 7.5 && this.time < 12.5; // 7:30 AM - 12:30 PM
  }

  isLunchTime() {
    return this.time >= 12.5 && this.time < 14.5; // 12:30 PM - 2:30 PM
  }

  isAfternoonWork() {
    return this.time >= 14.5 && this.time < 18.0; // 2:30 PM - 6:00 PM
  }

  isDusk() {
    return this.time >= 18.0 && this.time < 20.5; // 6:00 PM - 8:30 PM (Cena, paseo, culto)
  }

  isNight() {
    return this.time >= 20.5 || this.time < 5.5; // 8:30 PM - 5:30 AM (Dormir en casa)
  }

  getRoutinePhase() {
    if (this.isNight()) return 'sleeping';
    if (this.isDawn()) return 'waking';
    if (this.isMorningWork()) return 'working_morning';
    if (this.isLunchTime()) return 'lunch_break';
    if (this.isAfternoonWork()) return 'working_afternoon';
    if (this.isDusk()) return 'evening_leisure';
    return 'free';
  }

  // Color e intensidad de luz ambiental para el canvas (efecto Minish Cap)
  getAmbientOverlay() {
    const t = this.time;
    // 00:00 - 05:00: Noche profunda azul oscuro
    if (t < 5.0) {
      return { r: 5, g: 15, b: 45, a: 0.58 };
    }
    // 05:00 - 07:00: Amanecer dorado/rosado
    if (t < 7.0) {
      const progress = (t - 5.0) / 2.0;
      return {
        r: Math.round(5 + (240 - 5) * (1 - progress)),
        g: Math.round(15 + (160 - 15) * progress),
        b: Math.round(45 + (120 - 45) * progress),
        a: 0.58 * (1 - progress) + 0.15 * Math.sin(progress * Math.PI)
      };
    }
    // 07:00 - 17:00: Pleno día (luz solar cristalina)
    if (t < 17.0) {
      return { r: 255, g: 255, b: 240, a: 0.0 };
    }
    // 17:00 - 19.5: Atardecer dorado cálido (Golden hour Minish Cap)
    if (t < 19.5) {
      const progress = (t - 17.0) / 2.5;
      return {
        r: 245,
        g: 140,
        b: 40,
        a: 0.28 * progress
      };
    }
    // 19.5 - 21.5: Crepúsculo morado hacia noche
    if (t < 21.5) {
      const progress = (t - 19.5) / 2.0;
      return {
        r: Math.round(245 * (1 - progress) + 15 * progress),
        g: Math.round(140 * (1 - progress) + 20 * progress),
        b: Math.round(40 * (1 - progress) + 70 * progress),
        a: 0.28 + (0.58 - 0.28) * progress
      };
    }
    // 21.5 - 24.0: Noche profunda
    return { r: 5, g: 15, b: 45, a: 0.58 };
  }
}

export const dayCycle = new DayNightCycle();
