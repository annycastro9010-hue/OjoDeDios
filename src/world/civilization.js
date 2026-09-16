import { ELEM } from '../sim/elements.js';
import { chronicles } from '../social/relations.js';
import { sound } from '../audio/soundFX.js';
import { vfx } from '../render/fx.js';
import { dayCycle } from '../sim/time.js';

export class CivilizationSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.wood = 30;
    this.stone = 20;
    this.food = 40;
    this.knowledge = 10;
    this.level = 1; // 1: Nómadas, 2: Aldea, 3: Reino
    this.stageName = 'Tribu Primitiva';

    // Gobierno y Liderazgo
    this.governmentType = 'tribal'; // 'tribal', 'theocracy', 'monarchy', 'republic'
    this.governmentName = 'Consejo Tribal de Ancianos';
    this.leaderId = null;
    this.leaderName = 'Ninguno';
    this.happiness = 85; // 0 a 100
    this.unrest = 10;    // 0 a 100

    // Políticas y Decretos
    this.activePolicies = {
      rationing: false,      // Racionamiento de comida en crisis
      tribute: false,        // Impuesto de obras públicas (+recursos, leve descontento)
      sacred_worship: false, // Culto diario sagrado (+fe, +sabiduría)
      public_order: false    // Vigilancia estricta y orden (reduce crímenes y miedo)
    };

    // 🕊️ Sistema de Religión Dinámica Emergente (Se moldea según los actos de Dios)
    this.religion = {
      name: 'Culto del Creador Primitivo',
      deityTitle: 'El Hacedor Supremo',
      deityType: 'balanced', // 'protective', 'wrathful', 'mystic', 'balanced'
      faith: 55,
      fear: 20,
      dogma: 'Venerar los ciclos de la tierra y agradecer el sustento sagrado.',
      miraclesWitnessed: 0,
      catastrophesWitnessed: 0,
      possessionsWitnessed: 0
    };

    // 🐾 Sociedades y Civilizaciones Animales Autónomas
    this.animalSocieties = {
      dogPack: { name: 'Hermandad Canina', alphaName: 'Ninguno', alphaId: null },
      catTribe: { name: 'Imperio Felino del Sol', alphaName: 'Ninguno', alphaId: null }
    };

    // Facciones Políticas Vivas
    this.factions = {
      traditionalists: 35, // Ancianos y agricultores conservadores
      devout: 35,          // Místicos y creyentes
      innovators: 15,      // Sabios e inventores
      rebels: 15           // Inconformes
    };

    // Árbol Tecnológico Completo de la Humanidad
    this.discoveries = {
      fire: true,             // Dominio del fuego
      tools: false,           // Herramientas líticas / hachas
      agriculture: false,     // Siembra y recolección eficiente
      granary: false,         // Graneros comunales para conservar comida
      herbalism: false,       // Medicina botánica para sanar
      irrigation: false,      // Canales de agua y riego
      masonry: false,         // Cantería y casas de piedra resistente
      law_code: false,        // Código de leyes escritas y tribunales
      temple: false,          // Teología y templos sagrados
      defense_wall: false     // Empalizadas y fortificaciones defensivas
    };

    // Edificios construidos por los aldeanos
    this.villages = [];
    this.constructionSites = [];
    this.buildTimer = 0;
    this.electionTimer = 0;
  }

  // Definición de las tecnologías para UI
  getTechTree() {
    return [
      { id: 'fire', name: 'Dominio del Fuego', icon: '🔥', desc: 'Mantiene el calor, ahuyenta bestias y permite cocinar.', unlocked: this.discoveries.fire, req: 'Innato' },
      { id: 'tools', name: 'Herramientas Líticas', icon: '🪓', desc: 'Hachas y picos que duplican la recolección de madera y piedra.', unlocked: this.discoveries.tools, req: '15 Sabiduría, 20 Madera' },
      { id: 'agriculture', name: 'Agricultura Primitiva', icon: '🌱', desc: 'Cultivo regular de semillas y recolección de cosechas.', unlocked: this.discoveries.agriculture, req: '30 Sabiduría, 25 Comida' },
      { id: 'granary', name: 'Graneros Comunales', icon: '🌾', desc: 'Almacena excedentes de comida y previene hambrunas.', unlocked: this.discoveries.granary, req: '45 Sabiduría, 30 Madera' },
      { id: 'herbalism', name: 'Medicina Botánica', icon: '🌿', desc: 'Ungüentos curativos que restablecen la salud de los enfermos.', unlocked: this.discoveries.herbalism, req: '60 Sabiduría, 20 Comida' },
      { id: 'irrigation', name: 'Canales de Irrigación', icon: '💧', desc: 'Canaliza agua a los campos aumentando la fertilidad.', unlocked: this.discoveries.irrigation, req: '75 Sabiduría, 20 Piedra' },
      { id: 'masonry', name: 'Mampostería Sólida', icon: '🧱', desc: 'Construcción de viviendas de piedra indestructibles.', unlocked: this.discoveries.masonry, req: '85 Sabiduría, 35 Piedra' },
      { id: 'law_code', name: 'Código de Leyes', icon: '📜', desc: 'Establece justicia formal, orden social y decretos cívicos.', unlocked: this.discoveries.law_code, req: '110 Sabiduría, 30 Madera' },
      { id: 'temple', name: 'Templo Sagrado', icon: '🏛️', desc: 'Consagración de altares mayores para venerar al Creador.', unlocked: this.discoveries.temple, req: '130 Sabiduría, 50 Piedra' },
      { id: 'defense_wall', name: 'Empalizadas Defensivas', icon: '🛡️', desc: 'Puestos de guardia que mantienen a salvo a la comunidad.', unlocked: this.discoveries.defense_wall, req: '150 Sabiduría, 60 Piedra' }
    ];
  }

  // Políticas disponibles para el gobierno
  getPolicies() {
    return [
      {
        id: 'rationing',
        name: 'Racionamiento de Alimentos',
        icon: '🥣',
        active: this.activePolicies.rationing,
        desc: 'Reduce el consumo de comida un 50% para resistir sequías, a cambio de leve malestar.',
        req: 'Emergencia alimentaria o Nivel 1'
      },
      {
        id: 'tribute',
        name: 'Tributo de Obras Públicas',
        icon: '🪵',
        active: this.activePolicies.tribute,
        desc: '+25% de madera y piedra para erigir chozas y templos más rápido.',
        req: 'Descubrimiento: Herramientas Líticas'
      },
      {
        id: 'sacred_worship',
        name: 'Culto y Rezo Comunitario',
        icon: '✨',
        active: this.activePolicies.sacred_worship,
        desc: 'Aumenta la fe colectiva y acelera la sabiduría de los sabios.',
        req: 'Forma Teocrática o Templo'
      },
      {
        id: 'public_order',
        name: 'Guardia y Orden Cívico',
        icon: '⚖️',
        active: this.activePolicies.public_order,
        desc: 'Reduce drásticamente el descontento y evita crímenes callejeros.',
        req: 'Descubrimiento: Código de Leyes'
      }
    ];
  }

  togglePolicy(policyId) {
    if (this.activePolicies[policyId] !== undefined) {
      this.activePolicies[policyId] = !this.activePolicies[policyId];
      const state = this.activePolicies[policyId] ? 'ACTIVADO' : 'DEROGADO';
      const meta = this.getPolicies().find(p => p.id === policyId);
      sound.playAscend();
      chronicles.add(`📜 ¡DECRETO DE GOBIERNO! El líder ha ${state} la ley: "${meta?.name}".`, 'divine');
      return this.activePolicies[policyId];
    }
    return false;
  }

  addResource(type, amount) {
    // Si el tributo está activo, bono a materiales
    let finalAmount = amount;
    if (this.activePolicies.tribute && (type === 'wood' || type === 'stone')) {
      finalAmount = amount * 1.25;
    }

    if (type === 'wood') this.wood = Math.round((this.wood + finalAmount) * 100) / 100;
    if (type === 'stone') this.stone = Math.round((this.stone + finalAmount) * 100) / 100;
    if (type === 'food') this.food = Math.round((this.food + finalAmount) * 100) / 100;
    if (type === 'knowledge') this.knowledge = Math.round((this.knowledge + finalAmount) * 100) / 100;

    this.checkEvolution();
  }

  // Consumo de comida por los aldeanos para sobrevivir
  consumeFood(portions = 1) {
    const cost = this.activePolicies.rationing ? portions * 0.5 : portions;
    if (this.food >= cost) {
      this.food = Math.max(0, this.food - cost);
      return true;
    }
    return false;
  }

  checkEvolution() {
    // 1. Herramientas Líticas
    if (!this.discoveries.tools && this.knowledge >= 15 && this.wood >= 20) {
      this.discoveries.tools = true;
      chronicles.add('🪓 ¡INVECIÓN CIENTÍFICA! Los aldeanos han fabricado hachas y picos líticos.', 'evolution');
    }

    // 2. Agricultura
    if (!this.discoveries.agriculture && this.knowledge >= 30 && this.food >= 25) {
      this.discoveries.agriculture = true;
      chronicles.add('🌱 ¡DESCUBRIMIENTO! La tribu domina la siembra sistemática y el riego de cultivos.', 'evolution');
    }

    // 3. Granero Comunal
    if (!this.discoveries.granary && this.knowledge >= 45 && this.wood >= 30) {
      this.discoveries.granary = true;
      chronicles.add('🌾 ¡PROGRESO! Han diseñado Graneros Comunales para conservar cosechas ante sequías.', 'evolution');
    }

    // 4. Medicina Botánica
    if (!this.discoveries.herbalism && this.knowledge >= 60 && this.food >= 20) {
      this.discoveries.herbalism = true;
      chronicles.add('🌿 ¡MEDICINA DESCUBIERTA! Los sabios curan heridas y enfermedades con extractos florales.', 'evolution');
    }

    // 5. Canales de Irrigación
    if (!this.discoveries.irrigation && this.knowledge >= 75 && this.stone >= 20) {
      this.discoveries.irrigation = true;
      chronicles.add('💧 ¡INGENIERÍA HIDRÁULICA! Los canales de irrigación riegan la tierra automáticamente.', 'evolution');
    }

    // 6. Mampostería
    if (!this.discoveries.masonry && this.knowledge >= 85 && this.stone >= 35) {
      this.discoveries.masonry = true;
      chronicles.add('🧱 ¡ARQUITECTURA AVANZADA! Mampostería de piedra sólida para resistir catástrofes.', 'evolution');
    }

    // 7. Código de Leyes
    if (!this.discoveries.law_code && this.knowledge >= 110 && this.wood >= 30) {
      this.discoveries.law_code = true;
      this.governmentType = 'republic';
      this.governmentName = 'República de Ciudadanos Libres';
      chronicles.add('📜 ¡CONSTITUCIÓN POLÍTICA! Se ha promulgado el primer Código de Leyes y Derechos.', 'evolution');
    }

    // 8. Templo Sagrado
    if (!this.discoveries.temple && this.knowledge >= 130 && this.stone >= 50) {
      this.discoveries.temple = true;
      chronicles.add('🏛️ ¡ERA SAGRADA! La civilización ha diseñado Templos Majestuosos a los Cielos.', 'evolution');
    }

    // 9. Empalizadas Defensivas
    if (!this.discoveries.defense_wall && this.knowledge >= 150 && this.stone >= 60) {
      this.discoveries.defense_wall = true;
      chronicles.add('🛡️ ¡DEFENSA MILITAR! Empalizadas y torres protegen la ciudadela de amenazas.', 'evolution');
    }

    // Evolución de la Época de la Civilización (Basada en Conocimiento, Materiales y Años Transcurridos)
    if (this.level === 1 && (this.knowledge >= 40 && this.wood >= 40 || dayCycle.year >= 3)) {
      this.level = 2;
      this.stageName = 'Aldea Floreciente';
      if (this.governmentType === 'tribal') {
        this.governmentType = 'theocracy';
        this.governmentName = 'Teocracia Sagrada del Pueblo';
      }
      sound.playAscend();
      chronicles.add(`👑 ¡EVOLUCIÓN HISTÓRICA (Año ${dayCycle.year})! La tribu primitiva ha florecido en una Aldea Organizada con gobierno propio.`, 'evolution');
    } else if (this.level === 2 && (this.knowledge >= 90 && this.stone >= 50 || dayCycle.year >= 8)) {
      this.level = 3;
      this.stageName = 'Reino Próspero';
      if (this.governmentType === 'theocracy' && !this.discoveries.law_code) {
        this.governmentType = 'monarchy';
        this.governmentName = 'Monarquía y Corona Real';
      }
      sound.playAscend();
      chronicles.add(`🏰 ¡EVOLUCIÓN SUPREMA (Año ${dayCycle.year})! La aldea se corona como un Reino Próspero con leyes y cortes reales.`, 'evolution');
    } else if (this.level === 3 && (this.knowledge >= 140 && this.villages.length >= 4 || dayCycle.year >= 15)) {
      this.level = 4;
      this.stageName = 'Gran Imperio Dinástico';
      this.governmentName = 'Imperio Imperial de las Tierras Sagradas';
      sound.playAscend();
      chronicles.add(`🏛️ ¡ERA IMPERIAL (Año ${dayCycle.year})! El reino se consolida como un Gran Imperio Dinástico con múltiples ciudades y calzadas.`, 'evolution');
    } else if (this.level === 4 && (this.knowledge >= 200 || dayCycle.year >= 25)) {
      this.level = 5;
      this.stageName = 'Civilización Cósmica de los Dioses';
      this.governmentName = 'Panteón Armónico de la Creación';
      sound.playAscend();
      chronicles.add(`✨ ¡EDAD DE ORO CÓSMICA (Año ${dayCycle.year})! Los mortales han alcanzado la iluminación suprema en comunión con el Creador.`, 'evolution');
    }
  }

  // Elección Viva del Líder de la Civilización
  electLeader(npcs) {
    if (!npcs || npcs.length === 0) return;

    // Quitar liderazgo previo
    for (const npc of npcs) {
      if (npc.brain) npc.brain.isLeader = false;
    }

    let chosen = null;

    if (this.governmentType === 'theocracy') {
      // El de mayor fe y devoción
      chosen = npcs.reduce((best, cur) => {
        const curFaith = cur.brain?.faith || 0;
        const bestFaith = best?.brain?.faith || 0;
        return curFaith > bestFaith ? cur : best;
      }, null);
    } else if (this.governmentType === 'monarchy') {
      // El de mayor nivel o patriarca dinástico
      chosen = npcs.reduce((best, cur) => {
        const curScore = (cur.brain?.level || 1) * 20 + (cur.brain?.wisdom || 0);
        const bestScore = ((best?.brain?.level || 1) * 20 + (best?.brain?.wisdom || 0));
        return curScore > bestScore ? cur : best;
      }, null);
    } else if (this.governmentType === 'republic') {
      // Elección democrática: combinación de sabiduría y simpatía
      chosen = npcs.reduce((best, cur) => {
        const curVote = (cur.brain?.wisdom || 10) + (cur.brain?.energy || 50) * 0.5;
        const bestVote = ((best?.brain?.wisdom || 10) + (best?.brain?.energy || 50) * 0.5);
        return curVote > bestVote ? cur : best;
      }, null);
    } else {
      // Consejo Tribal: el más anciano y sabio
      chosen = npcs.reduce((best, cur) => {
        const curWisdom = cur.brain?.wisdom || 0;
        const bestWisdom = best?.brain?.wisdom || 0;
        return curWisdom > bestWisdom ? cur : best;
      }, null);
    }

    if (chosen && chosen.brain) {
      chosen.brain.isLeader = true;
      this.leaderId = chosen.id;
      this.leaderName = chosen.brain.name;
      chosen.brain.title = `👑 Líder (${this.governmentName.split(' ')[0]})`;
      chosen.brain.setThoughtBubble(`👑 Asumo con honor el liderazgo de mi pueblo.`, 200);
      chronicles.add(`👑 ¡NUEVO LÍDER ELECTO! ${chosen.brain.name} ha sido elegido líder de ${this.governmentName}.`, 'divine');
    }
  }

  // ⚡ Reactividad Divina: Registra cada intervención de Dios y moldea la Religión del pueblo
  recordGodIntervention(eventType, intensity = 1, npcs = [], animals = []) {
    if (eventType === 'lightning' || eventType === 'earthquake' || eventType === 'fire') {
      this.religion.catastrophesWitnessed++;
      this.religion.fear = Math.min(100, this.religion.fear + 15 * intensity);
      this.religion.faith = Math.min(100, this.religion.faith + 8 * intensity);

      if (this.religion.catastrophesWitnessed >= 2) {
        this.religion.deityType = 'wrathful';
        this.religion.name = 'Culto del Juicio Ardiente';
        this.religion.deityTitle = 'Señor del Trueno y la Falla';
        this.religion.dogma = 'Temed el poder del Creador; ofrendad en altares de piedra para apaciguar su cólera.';
      }
    } else if (eventType === 'rain' || eventType === 'bless_mana' || eventType === 'seed' || eventType === 'tree') {
      this.religion.miraclesWitnessed++;
      this.religion.faith = Math.min(100, this.religion.faith + 12 * intensity);
      this.religion.fear = Math.max(0, this.religion.fear - 10 * intensity);
      this.happiness = Math.min(100, this.happiness + 5 * intensity);

      if (this.religion.miraclesWitnessed >= 2 && this.religion.catastrophesWitnessed <= 1) {
        this.religion.deityType = 'protective';
        this.religion.name = 'Culto del Proveedor Celeste';
        this.religion.deityTitle = 'Padre Misericordioso de la Vida';
        this.religion.dogma = 'El Creador nos cobija con lluvia fértil y multiplica las cosechas. ¡Danza y júbilo!';
      }
    } else if (eventType === 'possession') {
      this.religion.possessionsWitnessed++;
      this.religion.faith = Math.min(100, this.religion.faith + 20);
      if (this.religion.possessionsWitnessed >= 2) {
        this.religion.deityType = 'mystic';
        this.religion.name = 'Orden del Espíritu Encarnado';
        this.religion.deityTitle = 'El Dios Viviente que Camina entre Nosotros';
        this.religion.dogma = 'El Creador desciende en cuerpo mortal para guiarnos y obrar milagros directos.';
      }
    }
  }

  // 🐾 Liderazgo y Evolución de las Sociedades Animales (Perros y Gatos)
  updateAnimalSocieties(animals) {
    if (!animals || animals.length === 0) return;

    // 1. Manada Canina
    const dogs = animals.filter(a => a.type === 'dog');
    if (dogs.length > 0) {
      // Si no hay alfa designado o el anterior desapareció
      if (!dogs.some(d => d.isAlpha)) {
        const alpha = dogs[0];
        alpha.isAlpha = true;
        this.animalSocieties.dogPack.alphaName = `Perro Alfa #${alpha.id}`;
        this.animalSocieties.dogPack.alphaId = alpha.id;
        alpha.setBubble("🐕 ¡GUAU! 👑 (Líder Alfa de la Manada)", 110);
      }
    }

    // 2. Dinastía Felina
    const cats = animals.filter(a => a.type === 'cat');
    if (cats.length > 0) {
      if (!cats.some(c => c.isAlpha)) {
        const catAlpha = cats[0];
        catAlpha.isAlpha = true;
        this.animalSocieties.catTribe.alphaName = `Gran Felino #${catAlpha.id}`;
        this.animalSocieties.catTribe.alphaId = catAlpha.id;
        catAlpha.setBubble("🐱 ¡MIAU! 👑 (Gran Felino del Consejo)", 110);
      }
    }
  }

  // Evolución natural y espontánea de la Religión según la era cósmica y la devoción de los profetas
  checkNaturalReligiousEvolution(npcs) {
    if (!this.religion) return;

    // Si hay profetas y templos erigidos, la fe y dogmas se enriquecen con el paso de los años
    const prophets = npcs.filter(n => n.type === 'prophet' || n.brain?.trait?.id === 'mistico');
    if (prophets.length > 0 && Math.random() < 0.05) {
      this.religion.faith = Math.min(100, this.religion.faith + 0.1 * prophets.length);
    }

    // Religiones que emergen según las Eras Cósmicas del tiempo
    if (dayCycle.worldEra === 'Era del Sol Dorado' && this.religion.name !== 'Culto del Sol Radiante') {
      this.religion.name = 'Culto del Sol Radiante';
      this.religion.deityTitle = 'El Ojo Dorado de los Cielos';
      this.religion.dogma = 'Agradeced la luz solar que madura los frutos y aleja la penumbra de los hogares.';
      chronicles.add(`🕊️ ¡NUEVA RELIGIÓN HISTÓRICA (Año ${dayCycle.year})! Los sacerdotes fundan el "${this.religion.name}".`, 'divine');
    } else if (dayCycle.worldEra === 'Era de la Luna Sagrada' && this.religion.name !== 'Hermandad de la Dama Nocturna') {
      this.religion.name = 'Hermandad de la Dama Nocturna';
      this.religion.deityTitle = 'La Guardiana de los Sueños';
      this.religion.dogma = 'En el silencio de la noche reposan las almas justas bajo el manto celestial.';
      chronicles.add(`🌙 ¡CISMA SAGRADO (Año ${dayCycle.year})! Surge la mística "${this.religion.name}".`, 'divine');
    } else if (dayCycle.worldEra === 'Era de la Sabiduría' && this.religion.name !== 'Orden de la Razón Sagrada') {
      this.religion.name = 'Orden de la Razón Sagrada';
      this.religion.deityTitle = 'El Arquitecto Universal';
      this.religion.dogma = 'Conocer las leyes de la naturaleza es el mayor acto de veneración a Dios.';
      chronicles.add(`✨ ¡NUEVA TEOLOGÍA (Año ${dayCycle.year})! Los sabios instauran la "${this.religion.name}".`, 'divine');
    }
  }

  update(grid, npcs, animals = []) {
    // Actualizar civilizaciones animales
    this.updateAnimalSocieties(animals);
    // Evolución religiosa natural con el paso de los años
    this.checkNaturalReligiousEvolution(npcs);
    // 1. Contador de Elección y Sucesión de Liderazgo (cada ~15 segundos)
    this.electionTimer++;
    if (this.electionTimer > 900 || !npcs.some(n => n.id === this.leaderId)) {
      this.electionTimer = 0;
      this.electLeader(npcs);
    }

    // 2. Cálculo de Felicidad y Descontento Social
    if (this.food < 15) {
      this.happiness = Math.max(5, this.happiness - 0.08);
      this.unrest = Math.min(100, this.unrest + 0.12);

      // Auto-decreto de racionamiento si la situación es crítica
      if (!this.activePolicies.rationing && this.food < 10) {
        this.activePolicies.rationing = true;
        chronicles.add(`⚠️ ¡EMERGENCIA! Por hambruna inminente, el gobierno activa Racionamiento Obligatorio.`, 'crisis');
      }
    } else {
      this.happiness = Math.min(100, this.happiness + 0.04);
      this.unrest = Math.max(0, this.unrest - 0.06);

      if (this.activePolicies.rationing && this.food > 35) {
        this.activePolicies.rationing = false;
        chronicles.add(`🌾 ¡ABUNDANCIA RESTAURADA! El gobierno levanta el racionamiento de comida.`, 'evolution');
      }
    }

    // Si el descontento es altísimo, ¡Revuelta Popular!
    if (this.unrest > 80 && this.happiness < 25 && npcs.length > 2) {
      this.unrest = 35;
      this.happiness = 45;
      sound.playBurn();
      chronicles.add(`🔥 ¡REVUELTA POPULAR! El pueblo indignado por la hambruna ha derrocado al gobierno actual.`, 'crisis');
      this.electLeader(npcs);
    }

    // 3. Generación autónoma y desarrollo vivo de la civilización:
    // Todos los habitantes (campesinos, artesanos, comerciantes, vecinos) trabajan, aprenden y aportan
    if (npcs.length > 0 && Math.random() < 0.18) {
      this.addResource('food', 0.25 * npcs.length);
      this.addResource('wood', 0.20 * npcs.length);
      this.addResource('stone', 0.15 * npcs.length);
      // Sabiduría acumulada: por trabajo diario, inventos, conversaciones y años vividos
      this.addResource('knowledge', 0.22 * npcs.length);
    }

    // Comprobar evolución histórica periódicamente
    this.checkEvolution();

    // 4. Asignación Orgánica de Hogares a Familias y Ciudadanos (cada 60 frames = 1 seg)
    this.homeAssignTimer = (this.homeAssignTimer || 0) + 1;
    if (this.homeAssignTimer >= 60) {
      this.homeAssignTimer = 0;
      this.assignHomesToCitizens(npcs, grid);
    }

    // 5. Construcción Orgánica de Edificios según Avance Tecnológico y Nivel de Civilización
    this.buildTimer++;
    if (this.buildTimer >= 200) { // Evaluar periódicamente
      this.buildTimer = 0;

      // Máximo 1 obra activa a la vez (2 en imperio o nivel >= 4)
      const maxSites = this.level >= 4 ? 2 : 1;
      if (this.constructionSites.length < maxSites) {
        // ¿Hay ciudadanos sin hogar?
        const homeless = npcs.filter(n => !n.brain?.home && n.type !== 'police' && n.type !== 'boss');
        const maxHouses = 4 + this.level * 3;
        const currentHouses = this.villages.filter(v => v.type === 'house').length;

        if (homeless.length > 0 && currentHouses < maxHouses && this.wood >= 15 && !this.isBuildingSitePlanned('house')) {
          this.planBuilding(grid, npcs, 'house');
        } else if (this.discoveries.granary && this.wood >= 25 && !this.hasBuildingType('granary') && !this.isBuildingSitePlanned('granary')) {
          this.planBuilding(grid, npcs, 'granary');
        } else if (this.level >= 2 && this.stone >= 25 && !this.hasBuildingType('altar') && !this.isBuildingSitePlanned('altar')) {
          this.planBuilding(grid, npcs, 'altar');
        } else if (this.level >= 3 && this.stone >= 35 && this.villages.filter(v => v.type === 'altar').length < 2 && !this.isBuildingSitePlanned('altar')) {
          this.planBuilding(grid, npcs, 'altar');
        }
      }
    }
  }

  isBuildingSitePlanned(type) {
    return this.constructionSites.some(s => s.type === type);
  }

  hasBuildingType(type) {
    return this.villages.some(b => b.type === type);
  }

  // Distribución de casas: parejas e hijos comparten la misma vivienda (optimizado O(N+H))
  assignHomesToCitizens(npcs, grid = null) {
    let houses = this.villages.filter(v => v.type === 'house');

    // Registrar casas habitables preexistentes del mapa si aún no están en villages
    if (grid && grid.buildingLocations) {
      for (const b of grid.buildingLocations) {
        if ((b.w && b.h && (b.roofColor || b.style)) || (b.name && (b.name.includes('Hogar') || b.name.includes('Cabaña') || b.name.includes('Casa') || b.name.includes('Mansión') || b.name.includes('Tienda') || b.name.includes('Puesto')))) {
          if (!houses.some(h => Math.abs(h.x - b.x) < 3 && Math.abs(h.y - b.y) < 3)) {
            houses.push({ x: b.x, y: b.y, w: b.w || 6, h: b.h || 5, type: 'house', name: b.name || 'Hogar' });
          }
        }
      }
    }

    if (houses.length === 0 || !npcs || npcs.length === 0) return;

    // Conteo previo de ocupantes por vivienda
    const houseOccupants = new Map();
    for (const h of houses) houseOccupants.set(h, 0);
    for (const npc of npcs) {
      if (npc.brain?.home && houseOccupants.has(npc.brain.home)) {
        houseOccupants.set(npc.brain.home, houseOccupants.get(npc.brain.home) + 1);
      }
    }

    for (const npc of npcs) {
      if (!npc.brain) continue;

      // Si ya tiene casa asignada válida, comprobar si su pareja o hijos necesitan unirse a ella
      if (npc.brain.home) {
        // Asignar misma casa a su pareja
        if (npc.partnerId) {
          const partner = npcs.find(n => n.id === npc.partnerId);
          if (partner && partner.brain && !partner.brain.home) {
            partner.brain.home = npc.brain.home;
            partner.brain.bedPosition = { x: npc.brain.home.x + 2, y: npc.brain.home.y + 2 };
            houseOccupants.set(npc.brain.home, (houseOccupants.get(npc.brain.home) || 0) + 1);
          }
        }
        // Asignar misma casa a sus hijos
        for (const child of npcs) {
          if (child.parentId === npc.id && child.brain && !child.brain.home) {
            child.brain.home = npc.brain.home;
            child.brain.bedPosition = { x: npc.brain.home.x + 2, y: npc.brain.home.y + 2 };
            houseOccupants.set(npc.brain.home, (houseOccupants.get(npc.brain.home) || 0) + 1);
          }
        }
        continue;
      }

      // Si no tiene casa, buscar una casa con espacio (máximo 4 ocupantes)
      for (const house of houses) {
        const count = houseOccupants.get(house) || 0;
        if (count < 4) {
          npc.brain.home = house;
          const slot = count;
          npc.brain.bedPosition = {
            x: house.x + 2 + (slot % 2),
            y: house.y + 2 + Math.floor(slot / 2)
          };
          npc.brain.setThoughtBubble("🏡 ¡Me he mudado a mi nuevo hogar!", 140);
          houseOccupants.set(house, count + 1);
          break;
        }
      }
    }
  }

  planBuilding(grid, npcs, type) {
    const isStone = this.discoveries.masonry;
    const w = (type === 'house') ? (isStone ? 6 : 5) : 5;
    const h = (type === 'house') ? (isStone ? 5 : 4) : 5;

    // Buscar una posición libre cerca de los aldeanos o del centro
    let anchorX = Math.floor(grid.width / 2);
    let anchorY = Math.floor(grid.height / 2);
    if (npcs && npcs.length > 0) {
      const avg = npcs.reduce((acc, n) => ({ x: acc.x + n.x, y: acc.y + n.y }), { x: 0, y: 0 });
      anchorX = Math.floor(avg.x / (npcs.length * 8));
      anchorY = Math.floor(avg.y / (npcs.length * 8));
    }

    for (let attempts = 0; attempts < 60; attempts++) {
      const spreadX = attempts < 25 ? 36 : Math.floor(grid.width * 0.7);
      const spreadY = attempts < 25 ? 26 : Math.floor(grid.height * 0.6);
      const rx = Math.max(4, Math.min(grid.width - w - 4, anchorX + Math.floor((Math.random() - 0.5) * spreadX)));
      const ry = Math.max(4, Math.min(grid.height - h - 4, anchorY + Math.floor((Math.random() - 0.5) * spreadY)));

      let valid = true;
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const elem = grid.get(rx + dx, ry + dy);
          if (elem === ELEM.WATER || elem === ELEM.BUILDING || elem === ELEM.LAVA || elem === ELEM.CHASM) {
            valid = false;
            break;
          }
        }
        if (!valid) break;
      }

      // No solaparse con otra obra planificada
      if (valid) {
        for (const site of this.constructionSites) {
          if (Math.hypot(site.x - rx, site.y - ry) < 7) {
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        // Despejar maleza y plantas del terreno de obra
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            grid.set(rx + dx, ry + dy, ELEM.DIRT);
          }
        }

        let woodCost = 0;
        let stoneCost = 0;
        let subType = type;

        if (type === 'house') {
          if (isStone) {
            subType = 'stone_house';
            stoneCost = 20;
            woodCost = 10;
          } else {
            subType = 'hut';
            woodCost = 15;
          }
        } else if (type === 'granary') {
          woodCost = 25;
        } else if (type === 'altar') {
          stoneCost = 25;
        }

        // Deducir recursos
        this.wood = Math.max(0, this.wood - woodCost);
        this.stone = Math.max(0, this.stone - stoneCost);

        const site = {
          id: 'site_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          x: rx,
          y: ry,
          w: w,
          h: h,
          type: type,
          subType: subType,
          progress: 0,
          maxProgress: 100,
          assignedWorkers: []
        };

        this.constructionSites.push(site);
        sound.playPlant();
        chronicles.add(`🏗️ ¡OBRA INICIADA! Los aldeanos han delimitado el terreno para construir.`, 'build');
        break;
      }
    }
  }

  finishConstruction(grid, site) {
    const { x: bx, y: by, w, h, type, subType } = site;

    // Retirar de obras activas
    this.constructionSites = this.constructionSites.filter(s => s.id !== site.id);

    if (type === 'house') {
      const isStone = subType === 'stone_house';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
            if (y === h - 1 && (x === Math.floor(w / 2) || x === Math.floor(w / 2) - 1)) {
              grid.set(bx + x, by + y, ELEM.ROAD);
            } else {
              grid.set(bx + x, by + y, ELEM.BUILDING);
            }
          } else {
            grid.set(bx + x, by + y, ELEM.ROAD);
          }
        }
      }

      for (let s = 0; s <= 2; s++) {
        grid.set(bx + Math.floor(w / 2), by + h + s, ELEM.ROAD);
      }

      const houseObj = {
        x: bx,
        y: by,
        w: w,
        h: h,
        type: 'house',
        subType: subType,
        name: isStone ? 'Casa de Piedra' : 'Choza de Madera',
        roofColor: isStone ? 'red' : 'yellow',
        style: isStone ? 'stone' : 'hut'
      };

      this.villages.push(houseObj);
      grid.buildingLocations.push(houseObj);

      sound.playPlant();
      vfx.addShockwave((bx + Math.floor(w / 2)) * 8, (by + Math.floor(h / 2)) * 8, 30, isStone ? '#cbd5e1' : '#eab308');
      chronicles.add(isStone ? `🧱 ¡CASA DE PIEDRA FINALIZADA! Mampostería sólida levantada con esfuerzo.` : `🌾 ¡CHOZA FINALIZADA! Los aldeanos han levantado su hogar con madera y paja.`, 'build');
    } else if (type === 'granary') {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
            grid.set(bx + x, by + y, ELEM.BUILDING);
          } else {
            grid.set(bx + x, by + y, ELEM.ROAD);
          }
        }
      }
      grid.set(bx + Math.floor(w / 2), by + h - 1, ELEM.ROAD);

      const granaryObj = {
        x: bx,
        y: by,
        w: w,
        h: h,
        type: 'granary',
        name: 'Granero Comunal',
        style: 'granary'
      };

      this.villages.push(granaryObj);
      grid.buildingLocations.push(granaryObj);

      sound.playPlant();
      vfx.addShockwave((bx + 2) * 8, (by + 2) * 8, 35, '#22c55e');
      chronicles.add('🌾 ¡GRANERO ERIGIDO! Almacén seguro levantado para provisiones comunitarias.', 'build');
    } else if (type === 'altar') {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
            grid.set(bx + x, by + y, ELEM.STONE);
          } else if (x === Math.floor(w / 2) && y === Math.floor(h / 2)) {
            grid.set(bx + x, by + y, ELEM.GOLD);
          } else {
            grid.set(bx + x, by + y, ELEM.ROAD);
          }
        }
      }

      const altarObj = {
        x: bx,
        y: by,
        w: w,
        h: h,
        type: 'altar',
        name: 'Altar a Dios',
        style: 'altar'
      };

      this.villages.push(altarObj);
      grid.buildingLocations.push(altarObj);

      sound.playAscend();
      vfx.addShockwave((bx + 2) * 8, (by + 2) * 8, 40, '#ffd700');
      chronicles.add('✨ ¡TEMPLO ERIGIDO! Los devotos han consagrado un gran Altar a Dios.', 'divine');
    }
  }

  // Compatibilidad con invocaciones directas (ej: clicks o cheats)
  constructHouse(grid, bx, by) {
    this.finishConstruction(grid, {
      id: 'direct_' + Date.now(),
      x: bx,
      y: by,
      w: this.discoveries.masonry ? 6 : 5,
      h: this.discoveries.masonry ? 5 : 4,
      type: 'house',
      subType: this.discoveries.masonry ? 'stone_house' : 'hut'
    });
  }
}

export const civ = new CivilizationSystem();
