import { civ } from '../world/civilization.js';

const ERA_NAMES = {
  biblical: ['Adán', 'Eva', 'Caín', 'Abel', 'Enoc', 'Sara', 'Noé', 'Abraham', 'Miriam', 'Elías', 'Mateo', 'Salomón'],
  seventies: ['Bob', 'Ziggy', 'Rita', 'Damian', 'Janis', 'Jimi', 'Marley', 'Lili', 'Paz', 'Luna', 'Sol', 'Dylan'],
  eighties: ['Pablo', 'Gonzalo', 'Carlos', 'Don Chepe', 'Jorge', 'Virginia', 'El Flaco', 'Rosita', 'El Zurdo', 'Toño'],
  forties: ['Sargento Miller', 'Clara', 'Winston', 'Hans', 'Sophie', 'Dmitry', 'Elena', 'Capitán Torres', 'Partisano Lev'],
  colombia: ['El Brayan', 'Don Mario', 'Doña Gloria', 'Patrullero Gómez', 'Comandante Tiro-Loco', 'Doctor Promesas', 'Yesid', 'Yurani', 'El Chévere', 'Mi Cabo', 'Don Chepe', 'Kevin', 'Albeiro', 'La Mona']
};

const TRAITS = [
  { id: 'devoto', name: 'Devoto Místico', desc: 'Fascinado por los milagros divinos. Reza ante la lluvia y los rayos.' },
  { id: 'curioso', name: 'Curioso / Sabio', desc: 'Desea aprender cómo funciona el mundo, investigar y construir.' },
  { id: 'constructor', name: 'Constructor', desc: 'Le apasiona talar madera, picar piedra y levantar hogares para su clan.' },
  { id: 'ambicioso', name: 'Próspero', desc: 'Trabaja sin descanso para acumular bienes y hacer crecer el reino.' },
  { id: 'cobarde', name: 'Cauto', desc: 'Evita peligros, bestias y fuego para proteger a los suyos.' },
  { id: 'piadoso', name: 'Pacífico', desc: 'Evita conflictos y busca la armonía en la comunidad.' },
  { id: 'rebusque', name: 'Del Rebusque', desc: 'Le busca la comba al palo para ganarse el diario honradamente.' },
  { id: 'bochinchero', name: 'Bochinchero', desc: 'Se sabe todos los chismes y secretos del vecindario.' },
  { id: 'rebelde', name: 'Rebelde Trochero', desc: 'No le copia a los retenes ni a los comparendos.' }
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

    // Necesidades biológicas de supervivencia
    this.needs = {
      hunger: 10 + Math.floor(Math.random() * 20), // 0 a 100
      health: 100,                                 // 0 a 100
      thirst: 0                                    // 0 a 100
    };
    this.satisfaction = 80;                        // Satisfacción con gobierno y vida (0 a 100)
    this.isLeader = false;

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
    if (type === 'police_cuadrante') return this.level >= 2 ? "Comandante de Cuadrante" : "Patrullero Pal Fresco";
    if (type === 'guerrillero') return this.level >= 2 ? "Comandante del Monte" : "Miliciano Trochero";
    if (type === 'mototaxista') return this.level >= 2 ? "Rey del Pique Callejero" : "El Brayan de la 125";
    if (type === 'vendedor') return this.level >= 2 ? "Empresario del Aguacate" : "Pregonero de Mazamorra";
    if (type === 'vecina_chismosa') return this.level >= 2 ? "Fiscal del Barrio" : "Doña Gloria la Chismosa";
    if (type === 'alcalde') return this.level >= 2 ? "Doctor Reelecto" : "Doctor Promesas";
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
    if (eventType === 'earthquake') {
      this.fear = 100;
      this.faith = Math.min(100, this.faith + 30);
      const quakes = [
        "😱 ¡LA VIRGEN SANTÍSIMA! ¡SE CAE EL RANCHO!",
        "🚨 ¡UN TERREMOTO! ¡AGÁRRENSE DEL POSTE!",
        "📺 ¡SALVEN EL TELEVISOR Y LA NEVERA!",
        "🥑 ¡MIS AGUACATES NOOOO!",
        "💥 ¡SE RAJÓ EL PISO, CORRAN PA' LA TROCHA!",
        "🙏 ¡DIOS MÍO APIÁDATE DE NUESTRO BARRIO!"
      ];
      this.setThoughtBubble(quakes[Math.floor(Math.random() * quakes.length)], 160);
    } else if (eventType === 'lightning') {
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

  // Bucle de actualización mental y biológica (llamado cada frame)
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

    // --- SUPERVIVENCIA BIOLÓGICA ---
    // Aumento gradual del hambre (el racionamiento ralentiza el consumo de energía)
    const hungerRate = (civ && civ.activePolicies.rationing) ? 0.014 : 0.022;
    this.needs.hunger = Math.min(100, this.needs.hunger + hungerRate);

    // Alimentación: cuando el hambre supera 55, consume del inventario comunal
    if (this.needs.hunger > 55 && civ) {
      if (civ.consumeFood(1)) {
        this.needs.hunger = Math.max(0, this.needs.hunger - 50);
        this.needs.health = Math.min(100, this.needs.health + 10);
        this.satisfaction = Math.min(100, this.satisfaction + 5);
        if (Math.random() < 0.005) {
          this.setThoughtBubble("🍞 Mmm, buen sustento del almacén comunal.", 80);
        }
      } else {
        // Escasez comunal
        this.satisfaction = Math.max(0, this.satisfaction - 0.04);
        if (this.needs.hunger >= 90) {
          this.needs.health = Math.max(0, this.needs.health - 0.05);
          if (Math.random() < 0.008) {
            this.setThoughtBubble("💀 ¡Hambruna! No hay nada que comer...", 90);
          }
        }
      }
    }

    // Medicina botánica: si la civilización descubrió herbalism, se recupera salud si no está famélico
    if (civ && civ.discoveries.herbalism && this.needs.health < 90 && this.needs.hunger < 60) {
      this.needs.health = Math.min(100, this.needs.health + 0.04);
    }
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

    // Pensamientos por roles memificables y de la realidad
    if (npc.type === 'police_cuadrante') {
      const tomboThoughts = [
        "👮 Páreme esa motico ahí a la derecha...",
        "👮 ¿Tiene el SOAT y la tecno al día mi rey?",
        "👮 ¿No tiene pa' la gaseosa y lo dejo sano?",
        "👮 Colabóreme y lo colaboro jefe...",
        "👮 Mi Cabo, reporte sin novedad en la trocha.",
        "👮 Esto le da pa' comparendo e inmovilización."
      ];
      this.setThoughtBubble(tomboThoughts[Math.floor(Math.random() * tomboThoughts.length)], 120);
      return;
    }

    if (npc.type === 'guerrillero') {
      const guerrillaThoughts = [
        "🪖 ¿Quién fue el flojo que no lavó la paila del sancocho?",
        "🪖 Silencio compañeros, que viene avioneta en el cielo.",
        "🪖 Retén en la trocha, paren los camiones de yuca.",
        "🪖 La bota izquierda me quedó en el pie derecho...",
        "🪖 Monte, fusil y radio de pilas compañero.",
        "🪖 Echenle más plátano a la olla comunitaria."
      ];
      this.setThoughtBubble(guerrillaThoughts[Math.floor(Math.random() * guerrillaThoughts.length)], 120);
      return;
    }

    if (npc.type === 'mototaxista') {
      const brayanThoughts = [
        "🛵 ¡Súbase compadre que voy sin frenos!",
        "🛵 ¡Por la trocha lo llevo en 2 minutos volando!",
        "🛵 ¡Dios es mi copiloto pero el Diablo va atrás!",
        "🛵 ¡Pilas con el retén de la policía!",
        "🛵 ¡Voy a picar la DT 125 en esta recta!",
        "🛵 ¡Echele 5 mil de corriente a la nave!"
      ];
      this.setThoughtBubble(brayanThoughts[Math.floor(Math.random() * brayanThoughts.length)], 120);
      return;
    }

    if (npc.type === 'vendedor') {
      const vendorThoughts = [
        "📢 ¡A mil y a dos mil el aguacate maduro!",
        "📢 ¡Llegó la mazamorra con leche y panela!",
        "📢 ¡Compro neveras viejas, baterías y chatarra!",
        "📢 ¡Aguacate mantequilla pa'l almuerzo!",
        "📢 ¡El que no prevea no come sancocho!",
        "📢 ¡Rebuscándome la papa honradamente!"
      ];
      this.setThoughtBubble(vendorThoughts[Math.floor(Math.random() * vendorThoughts.length)], 120);
      return;
    }

    if (npc.type === 'vecina_chismosa') {
      const chismeThoughts = [
        "👵 ¡Mírele los tatuajes al muchacho nuevo!",
        "👵 ¡Yo vi cuando bajaron esa caja a las 3 AM!",
        "👵 ¡Esa vecina no trabaja y tiene moto nueva!",
        "👵 ¡A mí no me echan cuentos en este barrio!",
        "👵 ¡Voy a llamar al cuadrante ya mismito!",
        "👵 ¡Barrer la acera me sirve pa' vigilar la cuadra!"
      ];
      this.setThoughtBubble(chismeThoughts[Math.floor(Math.random() * chismeThoughts.length)], 120);
      return;
    }

    if (npc.type === 'alcalde') {
      const alcaldeThoughts = [
        "🎩 ¡Prometo pavimentar la trocha (el año entrante)! ",
        "🎩 ¡Un tamal caliente por cada voto compatriotas!",
        "🎩 ¡Los recursos están bien invertidos... jeje!",
        "🎩 ¡Saludo para la foto con la comunidad!",
        "🎩 ¡Inauguramos el puente aunque le falten tablas!",
        "🎩 ¡El progreso llegó a nuestro ilustre municipio!"
      ];
      this.setThoughtBubble(alcaldeThoughts[Math.floor(Math.random() * alcaldeThoughts.length)], 120);
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

    // Pensamientos de Líder de Gobierno
    if (this.isLeader && Math.random() < 0.6) {
      const leaderThoughts = [
        "👑 Guiar a esta civilización hacia la prosperidad es mi deber sagrado.",
        "📜 Las leyes justas mantendrán la paz entre las familias.",
        "🏛️ Debemos almacenar más recursos para las futuras generaciones.",
        "👑 Escucharé las peticiones del pueblo en la asamblea.",
        "🌾 Si protegemos los cultivos, nadie pasará hambre."
      ];
      this.setThoughtBubble(leaderThoughts[Math.floor(Math.random() * leaderThoughts.length)], 130);
      return;
    }

    // Pensamientos de Hambre y Supervivencia
    if (this.needs.hunger > 70) {
      const hungryThoughts = [
        "🥖 Se me pegan las tripas al espinazo... necesito comida.",
        "🌾 Ojalá los recolectores traigan pronto fruta madura.",
        "🥣 ¿Quedará algo de sopa en el almacén comunal?",
        "😵 Me tiemblan las piernas de la debilidad..."
      ];
      this.setThoughtBubble(hungryThoughts[Math.floor(Math.random() * hungryThoughts.length)], 110);
      return;
    }

    // Malestar Político y Social si hay hambruna o disturbios
    if (civ && civ.unrest > 50 && Math.random() < 0.5) {
      const protestThoughts = [
        "😠 ¡El pueblo no aguanta más hambre ni abandono!",
        "📢 ¡Exigimos pan y justicia para las familias!",
        "⚠️ Si el líder no resuelve la crisis, marcharemos.",
        "🔥 Hay murmullos de rebelión en las esquinas..."
      ];
      this.setThoughtBubble(protestThoughts[Math.floor(Math.random() * protestThoughts.length)], 120);
      return;
    }

    // Pensamiento sobre Racionamiento activo
    if (civ && civ.activePolicies.rationing && Math.random() < 0.3) {
      this.setThoughtBubble("🥣 Apretarse el cinturón con las raciones de comida...", 100);
      return;
    }

    const randomThoughts = [
      "El fuego de la fogata mantiene calientes a los niños.",
      "Espero que tengamos buena pesca hoy.",
      "La piedra del monte es dura y servirá para los cimientos.",
      "Aprendiendo cada día a dominar la tierra...",
      "Cuidar a la comunidad es asegurar nuestro mañana."
    ];
    this.setThoughtBubble(randomThoughts[Math.floor(Math.random() * randomThoughts.length)], 90);
  }
}
