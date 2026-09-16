// Sistema de Relaciones Sociales, Amor, Drama, Crianza y Crónicas del Mundo

export class ChronicleManager {
  constructor() {
    this.logs = [];
    this.maxLogs = 35;
    this.onNewChronicle = null;
  }

  add(text, category = 'drama') {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = { text, category, time: timestamp };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    if (this.onNewChronicle) {
      this.onNewChronicle(entry);
    }
  }
}

export const chronicles = new ChronicleManager();

export class SocialSystem {
  constructor() {
    this.stepTimer = 0;
  }

  update(npcs, onSpawnBaby) {
    this.stepTimer++;
    if (this.stepTimer < 180) return; // Cada 3 segundos evaluar dinámicas sociales
    this.stepTimer = 0;

    // Cualquier aldeano o habitante adulto puede entablar relaciones sociales
    const adults = npcs.filter(n => n.type !== 'child' && (n.brain?.ageYears || 18) >= 16);

    for (let i = 0; i < adults.length; i++) {
      for (let j = i + 1; j < adults.length; j++) {
        const a = adults[i];
        const b = adults[j];

        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 55) {
          this.interact(a, b, onSpawnBaby);
        }
      }
    }
  }

  interact(a, b, onSpawnBaby) {
    const bA = a.brain;
    const bB = b.brain;

    // 1. Si ya son pareja, posibilidad de tener hijos (Crianza generacional)
    if (a.partnerId === b.id && b.partnerId === a.id) {
      // Pueden tener hasta 3 hijos por pareja si la aldea tiene comida
      const childrenCountA = a.childrenCount || 0;
      if (childrenCountA < 3 && Math.random() < 0.3) {
        a.childrenCount = childrenCountA + 1;
        b.childrenCount = (b.childrenCount || 0) + 1;
        a.hasChild = true;
        b.hasChild = true;
        a.brain.setThoughtBubble(`👶 ¡Vamos a tener otro hijo, ${bB.name}!`, 180);
        b.brain.setThoughtBubble(`👶 ¡Nuestra familia crece, ${bA.name}!`, 180);

        const babyX = (a.x + b.x) / 2 + (Math.random() - 0.5) * 8;
        const babyY = (a.y + b.y) / 2 + (Math.random() - 0.5) * 8;
        if (onSpawnBaby) {
          onSpawnBaby(babyX, babyY, a, b);
        }
        chronicles.add(`👶 ¡MILAGRO DE LA VIDA! ${bA.name} y ${bB.name} han tenido un hijo en la aldea.`, 'birth');
      }
      return;
    }

    // 2. Si son rivales, pelea o insultos
    if (a.rivalId === b.id || b.rivalId === a.id) {
      if (Math.random() < 0.4) {
        a.vx = (Math.random() - 0.5) * 3;
        b.vx = (Math.random() - 0.5) * 3;
        a.brain.setThoughtBubble(`👊 ¡Te dije que no te me acercaras, ${bB.name}!`, 120);
        b.brain.setThoughtBubble(`💥 ¡Ven si te atreves!`, 120);
        a.brain.fear = Math.min(100, a.brain.fear + 15);
        b.brain.fear = Math.min(100, b.brain.fear + 15);
        chronicles.add(`⚔️ ¡PELEA CALLEJERA! ${bA.name} y ${bB.name} se enfrentaron a golpes por viejas rencillas.`, 'fight');
      }
      return;
    }

    // 3. Posibilidad de Romance / Enamoramiento
    if (!a.partnerId && !b.partnerId && Math.random() < 0.35) {
      // Si son compatibles
      a.partnerId = b.id;
      b.partnerId = a.id;
      a.brain.setThoughtBubble(`💖 Me he enamorado de ${bB.name}...`, 180);
      b.brain.setThoughtBubble(`💖 Yo también te quiero, ${bA.name}...`, 180);
      chronicles.add(`💖 ¡ROMANCE! ${bA.name} y ${bB.name} han unido sus corazones y ahora son pareja.`, 'love');
      return;
    }

    // 4. Drama de Infidelidad / Celos
    if (a.partnerId && a.partnerId !== b.id && Math.random() < 0.12) {
      // Alguien coquetea indebidamente
      b.rivalId = a.partnerId;
      a.brain.setThoughtBubble(`👀 Ejem... me caes bien pero ya tengo pareja...`, 130);
      chronicles.add(`💔 ¡ESCÁNDALO Y CELOS! Vieron a ${bA.name} hablando muy cerca de ${bB.name}. Hay miradas asesinas.`, 'drama');
    }
  }

  // Intervención Divina: Cupido Divino
  blessLove(a, b) {
    a.partnerId = b.id;
    b.partnerId = a.id;
    a.brain.setThoughtBubble(`💘 ¡Una fuerza celestial me une a ${b.brain.name}!`, 180);
    b.brain.setThoughtBubble(`💘 ¡Es la voluntad de Dios, ${a.brain.name}!`, 180);
    chronicles.add(`💘 ¡AMOR DIVINO! Por decreto celestial, ${a.brain.name} y ${b.brain.name} se han enamorado instantáneamente.`, 'love');
  }

  // Intervención Divina: Sembrar Discordia
  sowDiscord(a, b) {
    a.rivalId = b.id;
    b.rivalId = a.id;
    a.partnerId = null;
    b.partnerId = null;
    a.brain.setThoughtBubble(`🤬 ¡Te detesto con toda mi alma, ${b.brain.name}!`, 160);
    b.brain.setThoughtBubble(`🔪 ¡Nunca debí confiar en ti, ${a.brain.name}!`, 160);
    chronicles.add(`⚡ ¡DISCORDIA DIVINA! La ira de Dios cayó entre ${a.brain.name} y ${b.brain.name}, convirtiéndolos en enemigos mortales.`, 'fight');
  }
}

export const social = new SocialSystem();
