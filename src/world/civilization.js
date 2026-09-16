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
      finalAmount = Math.ceil(amount * 1.25);
    }

    if (type === 'wood') this.wood += finalAmount;
    if (type === 'stone') this.stone += finalAmount;
    if (type === 'food') this.food += finalAmount;
    if (type === 'knowledge') this.knowledge += finalAmount;

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

    // 3. Generación autónoma de recursos por trabajo de la población y sabios
    const cultivators = npcs.filter(n => n.type === 'cultivator' || n.type === 'child');
    if (cultivators.length > 0 && Math.random() < 0.15) {
      this.addResource('food', 0.25 * cultivators.length);
      this.addResource('wood', 0.18 * cultivators.length);
      this.addResource('stone', 0.12 * cultivators.length);
    }

    const thinkers = npcs.filter(n => n.brain && (n.brain.trait?.id === 'curioso' || n.brain.wisdom >= 50));
    if (thinkers.length > 0 && Math.random() < 0.25) {
      this.addResource('knowledge', 0.20 * thinkers.length);
    }

    // Comprobar evolución histórica periódicamente
    this.checkEvolution();

    // 4. Asignación Orgánica de Hogares a Familias y Ciudadanos (cada 60 frames = 1 seg)
    this.homeAssignTimer = (this.homeAssignTimer || 0) + 1;
    if (this.homeAssignTimer >= 60) {
      this.homeAssignTimer = 0;
      this.assignHomesToCitizens(npcs);
    }

    // 5. Construcción Orgánica de Edificios según Avance Tecnológico y Nivel de Civilización
    this.buildTimer++;
    if (this.buildTimer < 150) return;
    this.buildTimer = 0;

    const maxHouses = 6 + this.level * 4; // Aldea: 10 casas, Reino: 14 casas, Imperio: 18 casas
    if (this.wood >= 18 && this.villages.filter(v => v.type === 'house').length < maxHouses) {
      this.planBuilding(grid, npcs, 'house');
    } else if (this.discoveries.granary && this.wood >= 25 && !this.hasBuildingType('granary')) {
      this.planBuilding(grid, npcs, 'granary');
    } else if (this.level >= 2 && this.stone >= 25 && !this.hasBuildingType('altar')) {
      this.planBuilding(grid, npcs, 'altar');
    } else if (this.level >= 3 && this.stone >= 35 && this.villages.filter(v => v.type === 'altar').length < 2) {
      this.planBuilding(grid, npcs, 'altar');
    }
  }

  // Distribución de casas: parejas e hijos comparten la misma vivienda (optimizado O(N+H))
  assignHomesToCitizens(npcs) {
    const houses = this.villages.filter(v => v.type === 'house');
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
            partner.brain.bedPosition = { x: npc.brain.home.x + 3, y: npc.brain.home.y + 2 };
            houseOccupants.set(npc.brain.home, (houseOccupants.get(npc.brain.home) || 0) + 1);
          }
        }
        // Asignar misma casa a sus hijos
        for (const child of npcs) {
          if (child.parentId === npc.id && child.brain && !child.brain.home) {
            child.brain.home = npc.brain.home;
            child.brain.bedPosition = { x: npc.brain.home.x + 2, y: npc.brain.home.y + 3 };
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
          npc.brain.setThoughtBubble(`🏡 ¡Me he mudado a ${house.name}!`, 140);
          houseOccupants.set(house, count + 1);
          break;
        }
      }
    }
  }

  hasBuildingType(type) {
    return this.villages.some(b => b.type === type);
  }

  planBuilding(grid, npcs, type) {
    const cx = Math.floor(grid.width / 2);
    const cy = Math.floor(grid.height / 2);

    for (let attempts = 0; attempts < 30; attempts++) {
      const rx = cx + Math.floor((Math.random() - 0.5) * (grid.width * 0.55));
      const ry = cy + Math.floor((Math.random() - 0.5) * (grid.height * 0.45));

      let valid = true;
      for (let dy = -1; dy <= 6; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const elem = grid.get(rx + dx, ry + dy);
          if (elem === ELEM.WATER || elem === ELEM.BUILDING || elem === ELEM.LAVA || elem === ELEM.STONE || elem === ELEM.CHASM) {
            valid = false;
            break;
          }
        }
        if (!valid) break;
      }

      if (valid) {
        if (type === 'house') {
          this.constructHouse(grid, rx, ry);
          this.wood = Math.max(0, this.wood - 18);
        } else if (type === 'granary') {
          this.constructGranary(grid, rx, ry);
          this.wood = Math.max(0, this.wood - 25);
        } else if (type === 'altar') {
          this.constructAltar(grid, rx, ry);
          this.stone = Math.max(0, this.stone - 25);
        }
        break;
      }
    }
  }

  constructHouse(grid, bx, by) {
    const w = 6;
    const h = 5;
    const isStone = this.discoveries.masonry;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
          if (y === h - 1 && (x === 2 || x === 3)) {
            grid.set(bx + x, by + y, ELEM.ROAD);
          } else {
            grid.set(bx + x, by + y, ELEM.BUILDING);
          }
        } else {
          grid.set(bx + x, by + y, ELEM.ROAD);
        }
      }
    }

    for (let s = -2; s <= 2; s++) {
      grid.set(bx + 2, by + h + s, ELEM.ROAD);
    }

    const houseName = isStone ? 'Casa de Piedra' : 'Choza de Madera';
    this.villages.push({ x: bx, y: by, type: 'house', name: houseName });
    grid.buildingLocations.push({ x: bx + 1, y: by + 1, name: houseName });

    sound.playPlant();
    vfx.addShockwave((bx + 3) * 8, (by + 2) * 8, 30, '#eab308');
    chronicles.add(`🏡 ¡NUEVA VIVIENDA! Los aldeanos han construido una ${houseName}.`, 'build');
  }

  constructGranary(grid, bx, by) {
    const w = 5;
    const h = 5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
          grid.set(bx + x, by + y, ELEM.BUILDING);
        } else {
          grid.set(bx + x, by + y, ELEM.ROAD);
        }
      }
    }
    // Puerta
    grid.set(bx + 2, by + h - 1, ELEM.ROAD);

    this.villages.push({ x: bx, y: by, type: 'granary', name: 'Granero Comunal' });
    grid.buildingLocations.push({ x: bx + 1, y: by + 1, name: 'Granero Central' });

    sound.playPlant();
    vfx.addShockwave((bx + 2) * 8, (by + 2) * 8, 35, '#22c55e');
    chronicles.add('🌾 ¡GRANERO ERIGIDO! Se ha construido un almacén seguro para la comida comunal.', 'build');
  }

  constructAltar(grid, bx, by) {
    const size = 5;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
          grid.set(bx + x, by + y, ELEM.STONE);
        } else if (x === 2 && y === 2) {
          grid.set(bx + x, by + y, ELEM.GOLD);
        } else {
          grid.set(bx + x, by + y, ELEM.ROAD);
        }
      }
    }

    this.villages.push({ x: bx, y: by, type: 'altar', name: 'Altar Ceremonial' });
    grid.buildingLocations.push({ x: bx + 1, y: by + 1, name: 'Altar a Dios' });

    sound.playAscend();
    vfx.addShockwave((bx + 2) * 8, (by + 2) * 8, 40, '#ffd700');
    chronicles.add('✨ ¡TEMPLO ERIGIDO! Los creyentes han consagrado un gran Altar a Dios.', 'divine');
  }
}

export const civ = new CivilizationSystem();
