import { civ } from '../world/civilization.js';
import { dayCycle } from '../sim/time.js';

const ERA_NAMES = {
  biblical: ['Adán', 'Eva', 'Caín', 'Abel', 'Enoc', 'Sara', 'Noé', 'Abraham', 'Miriam', 'Elías', 'Mateo', 'Salomón'],
  seventies: ['Bob', 'Ziggy', 'Rita', 'Damian', 'Janis', 'Jimi', 'Marley', 'Lili', 'Paz', 'Luna', 'Sol', 'Dylan'],
  eighties: ['Pablo', 'Gonzalo', 'Carlos', 'Don Chepe', 'Jorge', 'Virginia', 'El Flaco', 'Rosita', 'El Zurdo', 'Toño'],
  forties: ['Sargento Miller', 'Clara', 'Winston', 'Hans', 'Sophie', 'Dmitry', 'Elena', 'Capitán Torres', 'Partisano Lev'],
  colombia: ['El Brayan', 'Don Mario', 'Doña Gloria', 'Patrullero Gómez', 'Comandante Tiro-Loco', 'Doctor Promesas', 'Yesid', 'Yurani', 'El Chévere', 'Mi Cabo', 'Don Chepe', 'Kevin', 'Albeiro', 'La Mona']
};

const FALLBACK_NAMES = ['Adán', 'Eva', 'Juancho', 'Mateo', 'Sara', 'Camilo', 'Lucía', 'David', 'Pedro', 'Rosa'];

const TRAITS = [
  { id: 'gallardo', name: 'Gallardo / Valiente', desc: 'No le teme a bestias ni catástrofes; se planta con coraje, defiende a los suyos y combate el peligro.' },
  { id: 'asustadizo', name: 'Asustadizo / Miedoso', desc: 'Salta ante el menor trueno o sombra, corre despavorido pero alerta a los demás de peligros.' },
  { id: 'mistico', name: 'Místico / Teólogo', desc: 'Interpreta la voluntad de Dios, funda ritos sagrados, reza en los altares y propaga la fe.' },
  { id: 'innovador', name: 'Curioso / Innovador', desc: 'Aprende rápido, investiga secretos de la naturaleza y acelera los descubrimientos.' },
  { id: 'devoto', name: 'Devoto Fiel', desc: 'Fascinado por los milagros divinos. Reza ante la lluvia, los rayos y las bendiciones.' },
  { id: 'constructor', name: 'Constructor', desc: 'Le apasiona talar madera, picar piedra y levantar hogares y templos para su clan.' },
  { id: 'ambicioso', name: 'Próspero', desc: 'Trabaja sin descanso para acumular bienes, comerciar y hacer crecer el reino.' },
  { id: 'piadoso', name: 'Pacífico', desc: 'Evita conflictos, cuida a los enfermos y busca la armonía en la comunidad.' },
  { id: 'rebusque', name: 'Del Rebusque', desc: 'Le busca la comba al palo para ganarse el diario honradamente en cualquier era.' },
  { id: 'bochinchero', name: 'Bochinchero', desc: 'Se sabe todos los chismes, romances y secretos del vecindario y los pregona.' },
  { id: 'holgazan', name: 'Holgazán / Perezoso', desc: 'Ama echarse siestas largas bajo la sombra de los árboles o junto a las fogatas.' },
  { id: 'rebelde', name: 'Rebelde Trochero', desc: 'No le copia a los retenes, ni a los comparendos ni a los mandatos injustos.' }
];

export class NPCBrain {
  constructor(type, eraId = 'biblical') {
    const namesList = ERA_NAMES[eraId] || FALLBACK_NAMES;
    this.name = namesList[Math.floor(Math.random() * namesList.length)];
    this.trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];

    // Estado Mental, Emocional y Cognitivo (0 a 100)
    this.faith = 25 + Math.floor(Math.random() * 30); // Fe en Dios
    this.fear = 10;                                   // Nivel de Pánico
    this.greed = this.trait.id === 'ambicioso' ? 85 : 30; // Deseo de prosperidad
    this.energy = 85 + Math.floor(Math.random() * 15); // Energía física
    this.wisdom = 10 + Math.floor(Math.random() * 20); // Conocimiento / Aprendizaje
    this.curiosity = 50 + Math.floor(Math.random() * 50); // Deseo de aprender y explorar
    
    // Emociones Dinámicas y Expresiones Flotantes
    this.emotion = 'calm'; // 'calm', 'scared', 'valiant', 'inspired', 'joyful', 'exhausted', 'sleeping', 'enraged'
    this.emotionTimer = 0;
    this.emotionIcon = ''; // Emoticono flotante sobre la cabeza (🦁, 😱, ✨, 💤, 🍞, etc.)
    this.isResting = false;

    // --- CICLO DE VIDA HUMANA REAL ---
    this.ageYears = (type === 'child') ? 7 + Math.floor(Math.random() * 5) : 22 + Math.floor(Math.random() * 25);
    this.birthdayTimer = 0;
    
    // Rutina Circadiana Humana ('waking', 'working', 'eating', 'socializing', 'going_home', 'sleeping')
    this.routineState = 'working';
    this.routineDesc = 'Comenzando la jornada laboral';

    // Hogar y Residencia
    this.home = null; // { x, y, name } asignado por civilization
    this.bedPosition = null; // Coordenadas exactas para dormir en casa

    // Memorias Espaciales de Supervivencia
    this.memories = {
      waterSpots: [],  // fuentes de agua conocidas
      dangerSpots: [], // zonas de peligro recordadas
      foodSpots: []    // huertos o graneros
    };

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
      thirst: 5 + Math.floor(Math.random() * 15)   // 0 a 100
    };
    this.satisfaction = 80;                        // Satisfacción con gobierno y vida (0 a 100)
    this.isLeader = false;

    // Pensamiento activo en la mente del aldeano
    this.currentThought = "Viendo qué hacer hoy...";
    this.thoughtTimer = 60 + Math.floor(Math.random() * 90);
    this.bubbleText = ""; // Texto corto que flota sobre su cabeza
    this.bubbleTimer = 0;
  }

  setEmotion(emotion, icon, duration = 140) {
    this.emotion = emotion;
    this.emotionIcon = icon;
    this.emotionTimer = duration;
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

  // Reacción ante eventos divinos y del entorno según personalidad
  onDivineEvent(eventType, intensity = 1) {
    if (eventType === 'earthquake') {
      if (this.trait.id === 'gallardo') {
        this.fear = 25;
        this.faith = Math.min(100, this.faith + 15);
        this.setEmotion('valiant', '🦁', 220);
        const valiantQuakes = [
          "🦁 ¡Calma todos! ¡Protejan a los niños y apóyense en mí!",
          "🦁 ¡La tierra tiembla pero mi espíritu no vacila!",
          "🦁 ¡Rápido, verifiquen que las chozas no colapsen sobre las familias!"
        ];
        this.setThoughtBubble(valiantQuakes[Math.floor(Math.random() * valiantQuakes.length)], 180);
      } else if (this.trait.id === 'asustadizo') {
        this.fear = 100;
        this.faith = Math.min(100, this.faith + 40);
        this.setEmotion('scared', '😱', 260);
        this.setThoughtBubble("😱 ¡LA TIERRA SE PARTE EN DOS! ¡CORRAN POR SUS VIDAS!", 190);
      } else if (this.trait.id === 'mistico' || this.trait.id === 'devoto') {
        this.faith = 100;
        this.fear = 55;
        this.setEmotion('inspired', '✨', 220);
        this.setThoughtBubble("✨ ¡El rugido del Creador resuena en las profundidades de la roca!", 180);
      } else {
        this.fear = 85;
        this.faith = Math.min(100, this.faith + 25);
        this.setEmotion('scared', '😱', 180);
        const quakes = [
          "😱 ¡LA VIRGEN SANTÍSIMA! ¡SE CAE EL RANCHO!",
          "🚨 ¡UN TERREMOTO! ¡AGÁRRENSE DEL POSTE!",
          "📺 ¡SALVEN EL TELEVISOR Y LA NEVERA!",
          "🥑 ¡MIS AGUACATES NOOOO!",
          "💥 ¡SE RAJÓ EL PISO, CORRAN PA' LA TROCHA!",
          "🙏 ¡DIOS MÍO APIÁDATE DE NUESTRO BARRIO!"
        ];
        this.setThoughtBubble(quakes[Math.floor(Math.random() * quakes.length)], 160);
      }
    } else if (eventType === 'lightning') {
      if (this.trait.id === 'gallardo') {
        this.fear = 20;
        this.faith = Math.min(100, this.faith + 15);
        this.setEmotion('valiant', '⚡', 180);
        this.setThoughtBubble("⚡ ¡Poder divino! Si hay fuego iré a sofocarlo.", 150);
      } else if (this.trait.id === 'asustadizo') {
        this.fear = 100;
        this.faith = Math.min(100, this.faith + 30);
        this.setEmotion('scared', '😱', 240);
        this.setThoughtBubble("😱 ¡SANTÍSIMA TRINIDAD! ¡ESE TRUENO CASI ME DESINTEGRA!", 170);
      } else if (this.trait.id === 'mistico' || this.trait.id === 'devoto') {
        this.faith = Math.min(100, this.faith + 35);
        this.fear = 30;
        this.setEmotion('inspired', '✨', 200);
        this.setThoughtBubble("⚡ ¡El Creador ha escrito con fuego en el cielo!", 160);
      } else {
        this.fear = Math.min(100, this.fear + 40);
        this.faith = Math.min(100, this.faith + 20);
        this.setEmotion('scared', '😱', 160);
        this.setThoughtBubble("😱 ¡Casi me parte un rayo celeste!", 140);
      }
    } else if (eventType === 'rain') {
      this.faith = Math.min(100, this.faith + 15);
      this.fear = Math.max(0, this.fear - 15);
      this.setEmotion('joyful', '🌧️', 160);
      this.setThoughtBubble("🌧️ ¡Bendita lluvia celestial para los campos y ríos!", 140);
    } else if (eventType === 'saw_possession') {
      this.faith = Math.min(100, this.faith + 30);
      this.setEmotion('inspired', '✨', 220);
      this.setThoughtBubble("✨ ¡Aura divina! ¡Dios mismo ha caminado entre nosotros!", 180);
    } else if (eventType === 'bless_mana') {
      this.needs.hunger = 0;
      this.needs.health = 100;
      this.satisfaction = 100;
      this.faith = Math.min(100, this.faith + 25);
      this.setEmotion('joyful', '🍞', 180);
      this.setThoughtBubble("🍞 ¡Maná del cielo! ¡El Creador sació nuestra hambre!", 160);
    } else if (eventType === 'cat_purr') {
      this.fear = Math.max(0, this.fear - 25);
      this.energy = Math.min(100, this.energy + 8);
      this.setEmotion('calm', '💖', 120);
      this.setThoughtBubble("🐱 Mmm... este minino ronroneando me quita todo el estrés.", 100);
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

    // Contador de emoción activa
    if (this.emotionTimer > 0) {
      this.emotionTimer--;
      if (this.emotionTimer <= 0) {
        this.emotion = 'calm';
        this.emotionIcon = '';
      }
    }

    this.thoughtTimer--;
    if (this.thoughtTimer <= 0) {
      this.thoughtTimer = 180 + Math.floor(Math.random() * 180);
      this.generateEmergentThought(npc, nearbyDanger, isRaining);
    }

    // Regulación de emociones con el tiempo
    if (this.fear > 5) this.fear -= 0.05;

    // --- ENVEJECIMIENTO HUMANO GRADUAL ---
    this.birthdayTimer++;
    if (this.birthdayTimer >= 4500) { // Cada varios minutos de simulación cumple un año
      this.birthdayTimer = 0;
      this.ageYears++;
      if (this.ageYears === 18 && npc.type === 'child') {
        npc.type = 'cultivator';
        this.title = this.calculateTitle('cultivator');
        this.setThoughtBubble("🎉 ¡He cumplido 18 años! Ya soy un adulto con oficio.", 180);
      }
    }

    // --- CICLO Y RUTINA DIARIA HUMANA (SEGÚN HORA SOLAR) ---
    const phase = dayCycle.getRoutinePhase();
    this.routineState = phase;

    if (phase === 'sleeping') {
      this.routineDesc = this.home ? `Durmiendo en ${this.home.name}` : 'Descansando bajo las estrellas';
      this.isResting = true;
      this.energy = Math.min(100, this.energy + 0.4);
      this.needs.health = Math.min(100, this.needs.health + 0.1);
      this.setEmotion('sleeping', '💤', 30);
    } else if (phase === 'waking') {
      this.routineDesc = 'Despertando y estirándose';
      if (this.isResting) {
        this.isResting = false;
        this.setEmotion('calm', '🌅', 60);
        if (Math.random() < 0.02) {
          this.setThoughtBubble("🌅 Qué buen descanso. Hora de empezar el día.", 120);
        }
      }
    } else if (phase === 'working_morning') {
      this.routineDesc = 'Jornada laboral matutina';
      this.isResting = false;
    } else if (phase === 'lunch_break') {
      this.routineDesc = 'Pausa para el almuerzo y charla';
      this.isResting = false;
      if (this.needs.hunger > 30 && civ && civ.consumeFood(1)) {
        this.needs.hunger = Math.max(0, this.needs.hunger - 40);
        this.satisfaction = Math.min(100, this.satisfaction + 8);
        this.energy = Math.min(100, this.energy + 15);
        if (Math.random() < 0.02) {
          this.setThoughtBubble("🍲 Almuerzo caliente con la comunidad.", 110);
        }
      }
    } else if (phase === 'working_afternoon') {
      this.routineDesc = 'Labores de la tarde';
      this.isResting = false;
    } else if (phase === 'evening_leisure') {
      this.routineDesc = 'Regresando a casa y vida social';
      this.isResting = false;
    }

    // --- ENERGÍA, FATIGA Y DESCANSO ESPONTÁNEO (SIESTA) ---
    if (this.isResting && phase !== 'sleeping') {
      // Recuperar energía rápidamente y sanar
      this.energy = Math.min(100, this.energy + 0.35);
      this.needs.health = Math.min(100, this.needs.health + 0.08);
      this.setEmotion('sleeping', '💤', 40);
      if (this.energy >= 92) {
        this.isResting = false;
        this.setEmotion('joyful', '⚡', 100);
        this.setThoughtBubble("⚡ ¡Repuse todas mis fuerzas! ¡A seguir!", 130);
      }
    } else if (!this.isResting && phase !== 'sleeping') {
      if (this.energy < 15) {
        this.isResting = true;
        this.setEmotion('sleeping', '💤', 220);
        this.setThoughtBubble("💤 Rendido de cansancio... tomando una siestecita.", 140);
      }
    }

    // --- SED HUMANA ---
    this.needs.thirst = Math.min(100, this.needs.thirst + 0.012);
    if (this.needs.thirst > 65 && Math.random() < 0.01) {
      this.setThoughtBubble("💧 Tengo la garganta seca, buscaré agua fresca.", 90);
    }

    // --- SUPERVIVENCIA BIOLÓGICA ---
    // Aumento gradual del hambre (el racionamiento ralentiza el consumo de energía)
    const hungerRate = (civ && civ.activePolicies.rationing) ? 0.012 : 0.018;
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

    if (this.trait.id === 'gallardo' && Math.random() < 0.45) {
      const gallardoThoughts = [
        "🦁 ¡Mi pecho será el escudo de esta aldea!",
        "🦁 Si una fiera se acerca, no retrocederé un solo paso.",
        "🦁 El coraje se forja ante la adversidad. ¡Adelante!",
        "🦁 Si hay fuego o derrumbe, seré el primero en ayudar."
      ];
      this.setThoughtBubble(gallardoThoughts[Math.floor(Math.random() * gallardoThoughts.length)], 120);
      return;
    }

    if (this.trait.id === 'asustadizo' && Math.random() < 0.45) {
      const scaredThoughts = [
        "😨 ¿Escucharon ese crujido en la maleza? ¡Algo acecha!",
        "😱 ¿Y si cae un rayo de la nada? Mejor miro al cielo...",
        "🏃 Si pasa algo raro, seré el primero en salir corriendo.",
        "😨 Siento que el suelo tiembla... qué miedo tan bravo."
      ];
      this.setThoughtBubble(scaredThoughts[Math.floor(Math.random() * scaredThoughts.length)], 110);
      return;
    }

    if (this.trait.id === 'mistico' && Math.random() < 0.45) {
      const mysticThoughts = [
        "✨ Todo acto en este mundo revela los designios del Altísimo.",
        "🕊️ En cada gota de lluvia escucho el susurro del Creador.",
        "🏛️ Debemos mantener encendida la llama del Altar Sagrado.",
        "✨ Anotaré estos portentos celestes en las sagradas escrituras."
      ];
      this.setThoughtBubble(mysticThoughts[Math.floor(Math.random() * mysticThoughts.length)], 120);
      return;
    }

    if (this.trait.id === 'innovador' && Math.random() < 0.45) {
      const innovThoughts = [
        "💡 Si mezclamos arcilla con paja, los ladrillos no se rajarán.",
        "🔬 Observando cómo el agua moja y fecunda la semilla...",
        "⚙️ Una palanca de madera nos ahorraría la mitad del esfuerzo.",
        "🌱 Podríamos trazar surcos para canalizar el arroyo."
      ];
      this.setThoughtBubble(innovThoughts[Math.floor(Math.random() * innovThoughts.length)], 120);
      return;
    }

    if (this.trait.id === 'holgazan' && Math.random() < 0.45) {
      const lazyThoughts = [
        "💤 Qué delicia de sombra hace bajo este árbol frondoso...",
        "🥱 Trabajar cansa mucho, una siestecita de 20 minutos no daña a nadie.",
        "💤 El secreto de la longevidad es no afanarse por nada.",
        "🌿 Mañana cosecho... o pasado mañana, el trigo no se va a ir."
      ];
      this.setThoughtBubble(lazyThoughts[Math.floor(Math.random() * lazyThoughts.length)], 110);
      return;
    }

    if (this.trait.id === 'bochinchero' && Math.random() < 0.45) {
      const gossipThoughts = [
        "🗣️ ¡No se imaginan lo que acabo de escuchar en el río!",
        "👀 Esos dos andan sospechosamente juntos desde ayer...",
        "📢 ¡Tengo un chisme fresco que va a sacudir a la asamblea!",
        "🤫 Yo no soy de hablar mal de nadie, pero fíjense bien..."
      ];
      this.setThoughtBubble(gossipThoughts[Math.floor(Math.random() * gossipThoughts.length)], 120);
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

    // Pensamientos según la fase del día y vida hogareña
    const phase = dayCycle.getRoutinePhase();
    if (phase === 'sleeping' && Math.random() < 0.6) {
      const sleepThoughts = [
        "💤 Zzz... descansando plácidamente en mi hogar.",
        "💤 Mañana será un día productivo...",
        "💤 En la calidez de mi cama recupero fuerzas.",
        "💤 El silencio de la noche abriga a nuestra aldea."
      ];
      this.setThoughtBubble(sleepThoughts[Math.floor(Math.random() * sleepThoughts.length)], 100);
      return;
    }

    if (phase === 'evening_leisure' && Math.random() < 0.5) {
      const eveningThoughts = [
        "🍲 Qué bueno es regresar a casa después de una jornada dura.",
        "👨‍👩‍👧 Cenando y compartiendo anécdotas con mi familia.",
        "✨ Las estrellas brillan hermosas sobre las chozas del pueblo.",
        "🏡 Nada se compara con el calor de mi propio hogar."
      ];
      this.setThoughtBubble(eveningThoughts[Math.floor(Math.random() * eveningThoughts.length)], 120);
      return;
    }

    if (phase === 'lunch_break' && Math.random() < 0.5) {
      const lunchThoughts = [
        "🍲 Hora del almuerzo comunitario, buen provecho a todos.",
        "🥖 Qué rico compartir la comida con los vecinos.",
        "☕ Una pausa para charlar antes de volver al trabajo."
      ];
      this.setThoughtBubble(lunchThoughts[Math.floor(Math.random() * lunchThoughts.length)], 110);
      return;
    }

    const randomThoughts = [
      "El fuego de la fogata mantiene calientes a los niños.",
      "Espero que tengamos buena pesca y cosecha hoy.",
      "La piedra del monte es dura y servirá para los cimientos de nuevas casas.",
      "Aprendiendo cada día a cuidar a mi familia y a la comunidad.",
      "Cuidar a la comunidad es asegurar el porvenir de nuestros hijos."
    ];
    this.setThoughtBubble(randomThoughts[Math.floor(Math.random() * randomThoughts.length)], 90);
  }
}
