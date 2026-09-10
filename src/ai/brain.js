const ERA_NAMES = {
  biblical: ['Adán', 'Eva', 'Caín', 'Abel', 'Enoc', 'Sara', 'Noé', 'Abraham', 'Miriam', 'Elías', 'Mateo', 'Salomón'],
  seventies: ['Bob', 'Ziggy', 'Rita', 'Damian', 'Janis', 'Jimi', 'Marley', 'Lili', 'Paz', 'Luna', 'Sol', 'Dylan'],
  eighties: ['Pablo', 'Gonzalo', 'Carlos', 'Don Chepe', 'Jorge', 'Virginia', 'El Flaco', 'Rosita', 'El Zurdo', 'Toño'],
  forties: ['Sargento Miller', 'Clara', 'Winston', 'Hans', 'Sophie', 'Dmitry', 'Elena', 'Capitán Torres', 'Partisano Lev']
};

const TRAITS = [
  { id: 'devoto', name: 'Devoto Místico', desc: 'Fascinado por los milagros divinos. Reza ante la lluvia y los rayos.' },
  { id: 'curioso', name: 'Curioso / Sabio', desc: 'Desea aprender cómo funciona el mundo, investigar y construir.' },
  { id: 'constructor', name: 'Constructor', desc: 'Le apasiona talar madera, picar piedra y levantar hogares para su clan.' },
  { id: 'ambicioso', name: 'Próspero', desc: 'Trabaja sin descanso para acumular bienes y hacer crecer el reino.' },
  { id: 'cobarde', name: 'Cauto', desc: 'Evita peligros, bestias y fuego para proteger a los suyos.' },
  { id: 'piadoso', name: 'Pacífico', desc: 'Evita conflictos y busca la armonía en la comunidad.' }
];

export class NPCBrain {
  constructor(type, eraId = 'biblical') {
    const namesList = ERA_NAMES[eraId] || FIRST_NAMES;
    this.name = namesList[Math.floor(Math.random() * namesList.length)];
    this.trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];

    // Estado Mental, Emocional y Cognitivo (0 a 100)
    this.faith = 25 + Math.floor(Math.random() * 30); // Fe en Dios
    this.fear = 10;                                   // Nivel de Pánico
    this.greed = this.trait.id === 'ambicioso' ? 85 : 30; // Deseo de prosperidad
    this.energy = 85 + Math.floor(Math.random() * 15); // Energía física
    this.wisdom = 10 + Math.floor(Math.random() * 20); // Conocimiento / Aprendizaje
    this.curiosity = 50 + Math.floor(Math.random() * 50); // Deseo de aprender y explorar
    
    // Evolución y Rango
    this.level = 1;
    this.experience = 0;
    this.deliveredCargos = 0;
    this.buildingsHelped = 0;
    this.title = this.calculateTitle(type);

    // Pensamiento activo en la mente del aldeano
    this.currentThought = "Viendo qué hacer hoy...";
    this.thoughtTimer = 60 + Math.floor(Math.random() * 90);
    this.bubbleText = ""; // Texto corto que flota sobre su cabeza
    this.bubbleTimer = 0;
  }

  calculateTitle(type) {
    if (this.wisdom >= 80) return "Sabio de la Tribu";
    if (this.buildingsHelped >= 3) return "Maestro Constructor";
    if (this.faith >= 85) return "Profeta Iluminado";

    if (type === 'prophet') return "Profeta Sagrado";
    if (type === 'fisherman') return this.level >= 2 ? "Patrón del Río" : "Pescador";
    if (type === 'musician') return this.level >= 2 ? "Maestro de Melodías" : "Músico";
    if (type === 'healer') return "Sanador Botánico";
    if (type === 'soldier') return this.level >= 2 ? "Capitán de Guardia" : "Centinela";
    if (type === 'police') return this.level >= 2 ? "Comandante" : "Guardia";
    if (type === 'boss') return "Líder de la Dinastía";

    // Aldeano / Constructor
    if (this.level >= 4) return "Patriarca del Clan";
    if (this.level >= 3) return "Constructor Diestro";
    if (this.level >= 2) return "Agricultor Próspero";
    return "Aldeano";
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

    if (this.curiosity >= 70 && Math.random() < 0.4) {
      const thoughts = [
        "💡 Si apilamos madera y arcilla haremos casas seguras.",
        "🐾 ¡Los cachorros aprenden rápido si los alimentamos!",
        "🌾 Si sembramos junto al agua el trigo brotará el doble.",
        "✨ Debe haber un Creador detrás de toda esta naturaleza...",
        "🪵 Necesitamos cortar más madera para la siguiente choza."
      ];
      this.setThoughtBubble(thoughts[Math.floor(Math.random() * thoughts.length)], 110);
      return;
    }

    if (this.trait.id === 'constructor' && Math.random() < 0.5) {
      this.setThoughtBubble("🔨 Buscando un buen terreno plano para construir", 110);
      return;
    }

    if (this.faith >= 70 && Math.random() < 0.3) {
      this.setThoughtBubble("🙏 Que el Gran Creador bendiga a nuestro pueblo", 100);
      return;
    }

    if (this.trait.id === 'piadoso' && Math.random() < 0.4) {
      this.setThoughtBubble("🕊️ Qué bendición ver a nuestra comunidad prosperar", 100);
      return;
    }

    const randomThoughts = [
      "El fuego de la fogata mantiene calientes a los niños.",
      "Espero que tengamos buena pesca hoy.",
      "La piedra del monte es dura y servirá para los cimientos.",
      "Aprendiendo cada día a dominar la tierra..."
    ];
    this.setThoughtBubble(randomThoughts[Math.floor(Math.random() * randomThoughts.length)], 90);
  }
}
