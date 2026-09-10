// Sistema de Personalidad, Sensaciones y Mente Autónoma para NPCs

const FIRST_NAMES = [
  'Juancho', 'Don Chepe', 'Rosita', 'El Flaco', 'Mateo', 'Sargento Morales',
  'Padre Lucas', 'El Chino', 'La Güera', 'Toño', 'Benjamín', 'Carmen',
  'El Zurdo', 'Doña Blanca', 'Camilo', 'Esteban', 'Silvia', 'El Zarco'
];

const TRAITS = [
  { id: 'devoto', name: 'Devoto Místico', desc: 'Fascinado por los milagros divinos. Reza ante la lluvia y los rayos.' },
  { id: 'ambicioso', name: 'Codicioso', desc: 'Obsesionado con el dinero ilícito. Trabaja sin descanso.' },
  { id: 'cobarde', name: 'Miedoso', desc: 'Entra en pánico fácilmente con el fuego o las sirenas policiales.' },
  { id: 'holgazán', name: 'Perezoso', desc: 'Le gusta tomar siestas y pasear por los senderos sin apuro.' },
  { id: 'rebelde', name: 'Insumiso', desc: 'Desafía abiertamente la ley y no respeta a las autoridades.' },
  { id: 'piadoso', name: 'Pacífico', desc: 'Evita conflictos y busca la armonía en la comunidad.' }
];

export class NPCBrain {
  constructor(type) {
    this.name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    this.trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];

    // Estado Mental y Emocional (0 a 100)
    this.faith = 25 + Math.floor(Math.random() * 30); // Fe en Dios
    this.fear = 10;                                   // Nivel de Pánico
    this.greed = this.trait.id === 'ambicioso' ? 85 : 35; // Deseo de dinero
    this.energy = 80 + Math.floor(Math.random() * 20); // Energía física
    
    // Evolución y Rango
    this.level = 1;
    this.experience = 0;
    this.deliveredCargos = 0;
    this.title = this.calculateTitle(type);

    // Pensamiento activo en la mente del aldeano
    this.currentThought = "Viendo qué hacer hoy...";
    this.thoughtTimer = 60 + Math.floor(Math.random() * 90);
    this.bubbleText = ""; // Texto corto que flota sobre su cabeza
    this.bubbleTimer = 0;
  }

  calculateTitle(type) {
    if (type === 'police') {
      if (this.level >= 3) return "Comandante de Zona";
      if (this.level >= 2) return "Oficial Veterano";
      return "Guardia de Patrulla";
    }
    if (type === 'boss') {
      return "El Gran Patrón";
    }
    // Cultivador / Aldeano
    if (this.faith >= 85) return "Profeta Iluminado";
    if (this.level >= 4) return "Lugarteniente del Cártel";
    if (this.level >= 3) return "Contrabandista Experto";
    if (this.level >= 2) return "Cultivador Ágil";
    return "Peón Rural";
  }

  // Muestra un bocadillo de pensamiento sobre su cabeza
  setThoughtBubble(text, duration = 120) {
    this.bubbleText = text;
    this.bubbleTimer = duration;
    this.currentThought = text;
  }

  // Evolución por logros
  gainExp(amount, npc) {
    this.experience += amount;
    if (this.experience >= this.level * 100) {
      this.level++;
      this.title = this.calculateTitle(npc.type);
      this.setThoughtBubble(`⭐ ¡He ascendido a ${this.title}!`, 180);
      
      // Mejoras de evolución física
      if (npc.type === 'cultivator') {
        npc.maxCargo = Math.min(4, npc.maxCargo + 1);
        npc.speed += 0.1;
      }
    }
  }

  // Reacción ante eventos divinos y del entorno
  onDivineEvent(eventType, intensity = 1) {
    if (eventType === 'lightning') {
      this.fear = Math.min(100, this.fear + 35);
      this.faith = Math.min(100, this.faith + 20);
      if (this.trait.id === 'devoto') {
        this.setThoughtBubble("⚡ ¡El Creador ha hablado desde las alturas!", 150);
      } else {
        this.setThoughtBubble("😱 ¡Casi me parte un rayo!", 140);
      }
    } else if (eventType === 'rain') {
      this.faith = Math.min(100, this.faith + 15);
      this.fear = Math.max(0, this.fear - 10);
      this.setThoughtBubble("🌧️ Bendita lluvia celestial para los cultivos", 130);
    } else if (eventType === 'saw_possession') {
      this.faith = Math.min(100, this.faith + 25);
      this.setThoughtBubble("✨ ¿Acaso ese aldeano tiene el aura de Dios?", 160);
    }
  }

  // Bucle de actualización mental (llamado cada frame)
  update(npc, nearbyDanger, isRaining) {
    // Contador de bocadillo de pensamiento
    if (this.bubbleTimer > 0) {
      this.bubbleTimer--;
      if (this.bubbleTimer <= 0) {
        this.bubbleText = "";
      }
    }

    this.thoughtTimer--;
    if (this.thoughtTimer <= 0) {
      this.thoughtTimer = 180 + Math.floor(Math.random() * 180);
      this.generateEmergentThought(npc, nearbyDanger, isRaining);
    }

    // Regulación de emociones con el tiempo
    if (this.fear > 5) this.fear -= 0.05;
    if (this.energy < 100 && npc.state === 'wandering') this.energy += 0.03;
  }

  // Generador de pensamientos según personalidad y situación
  generateEmergentThought(npc, nearbyDanger, isRaining) {
    if (nearbyDanger) {
      this.fear = Math.min(100, this.fear + 20);
      if (this.trait.id === 'cobarde') {
        this.setThoughtBubble("🏃 ¡Patitas pa' qué las quiero!", 100);
      } else if (this.trait.id === 'rebelde') {
        this.setThoughtBubble("🤬 ¡Malditos tombos, no me van a agarrar!", 100);
      } else {
        this.setThoughtBubble("⚠️ ¡La patrulla está cerca!", 90);
      }
      return;
    }

    if (npc.cargo > 0) {
      if (this.trait.id === 'ambicioso') {
        this.setThoughtBubble("💰 Si entrego esto, compro mi terreno", 110);
      } else {
        this.setThoughtBubble("📦 Llevando el fardo al almacén...", 90);
      }
      return;
    }

    if (this.faith >= 70 && Math.random() < 0.3) {
      this.setThoughtBubble("🙏 Dios Todopoderoso, guía mis pasos", 100);
      return;
    }

    if (this.trait.id === 'holgazán' && Math.random() < 0.4) {
      this.setThoughtBubble("😴 Qué ganas de una siesta bajo un árbol", 100);
      return;
    }

    const randomThoughts = [
      "El clima en la isla está tranquilo hoy.",
      "Espero que no se incendie el cañal.",
      "El Patrón paga puntual si no te pillan.",
      "Dicen que desde el cielo alguien nos observa..."
    ];
    this.setThoughtBubble(randomThoughts[Math.floor(Math.random() * randomThoughts.length)], 80);
  }
}
