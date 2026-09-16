import { ELEM } from './sim/elements.js?v=20260912_minish_sprites_v2';
import { SimulationGrid } from './sim/grid.js?v=20260912_minish_sprites_v2';
import { Camera } from './player/camera.js?v=20260912_minish_sprites_v2';
import { GameRenderer } from './render/renderer.js?v=20260912_minish_sprites_v2';
import { NPC } from './entities/npc.js?v=20260912_minish_sprites_v2';
import { PlayerController } from './player/controller.js?v=20260912_minish_sprites_v2';
import { QuestSystem } from './quests/questSystem.js?v=20260912_minish_sprites_v2';
import { sound } from './audio/soundFX.js?v=20260912_minish_sprites_v2';
import { vfx } from './render/fx.js?v=20260912_minish_sprites_v2';
import { MapGenerator } from './world/mapGenerator.js?v=20260912_minish_sprites_v2';
import { Animal } from './entities/animals.js?v=20260912_minish_sprites_v2';
import { social, chronicles } from './social/relations.js';
import { ERAS } from './world/eras.js';
import { civ } from './world/civilization.js';

// Inicialización de lienzo
const canvas = document.getElementById('gameCanvas');
const grid = new SimulationGrid(130, 85);
const camera = new Camera(canvas);
const renderer = new GameRenderer(canvas);
const controller = new PlayerController();
const questSystem = new QuestSystem();

// Estado global del juego
let mode = 'god'; // 'god' o 'possessed'
let possessedNpc = null;
let currentTool = 'water';
let currentEra = ERAS.BIBLICAL; // Comienza en los Albores Bíblicos de la Humanidad
let brushRadius = 2;
let isMouseDown = false;
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let nextNpcId = 1;
let nextAnimalId = 1;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (camera && grid) {
    camera.setMode(mode, possessedNpc, grid.width, grid.height);
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Población y Fauna
const npcs = [];
function spawnNpc(type, x, y, eraId = currentEra.id) {
  const npc = new NPC(nextNpcId++, type, x, y);
  // Reconfigurar cerebro con nombres de la era
  npc.brain = new (npc.brain.constructor)(type, eraId);
  npcs.push(npc);
  return npc;
}

const animals = [];
function spawnAnimal(type, x, y) {
  const a = new Animal(nextAnimalId++, type, x, y);
  animals.push(a);
  return a;
}

// UI Elements
const topBar = document.getElementById('topBar');
const bottomToolbar = document.getElementById('bottomToolbar');
const possessedHud = document.getElementById('possessedHud');
const controlsHelp = document.getElementById('controlsHelp');
const statPop = document.getElementById('statPop');
const statWood = document.getElementById('statWood');
const statStone = document.getElementById('statStone');
const statFood = document.getElementById('statFood');
const statWisdom = document.getElementById('statWisdom');
const civStage = document.getElementById('civStage');
const btnOpenEras = document.getElementById('btnOpenEras');
const btnOpenGov = document.getElementById('btnOpenGov');
const btnToolbarGov = document.getElementById('btnToolbarGov');
const govModal = document.getElementById('govModal');
const govClose = document.getElementById('govClose');
const govModalType = document.getElementById('govModalType');
const govModalLeader = document.getElementById('govModalLeader');
const govModalHappy = document.getElementById('govModalHappy');
const govModalUnrest = document.getElementById('govModalUnrest');
const btnGovElect = document.getElementById('btnGovElect');
const govPoliciesList = document.getElementById('govPoliciesList');
const govTechGrid = document.getElementById('govTechGrid');
const govBarTitle = document.getElementById('govBarTitle');
const statHappy = document.getElementById('statHappy');
const questTitle = document.getElementById('questTitle');
const questDesc = document.getElementById('questDesc');
const questHarvest = document.getElementById('questHarvest');
const questDeliver = document.getElementById('questDeliver');
const ascendBtn = document.getElementById('ascendBtn');
const notification = document.getElementById('notification');
const virtualControls = document.getElementById('virtualControls');
if (virtualControls) {
  controller.bindTouchControls(virtualControls);
}

function notify(text) {
  notification.innerText = text;
  notification.style.opacity = '1';
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 3400);
}

// Configuración de Mundo y Civilización por Era
function setupEraWorld(era) {
  currentEra = era;
  btnOpenEras.innerText = `⏳ ${era.name}`;
  MapGenerator.generate(grid, era.mapPreset);
  camera.setMode('god', null, grid.width, grid.height);

  npcs.length = 0;
  animals.length = 0;
  civ.reset();

  const midX = Math.floor(grid.width / 2) * 8;
  const midY = Math.floor(grid.height / 2) * 8;

  if (era.id === 'biblical') {
    // 📖 ADÁN Y EVA (Primeros Padres de la Humanidad)
    const adam = spawnNpc('cultivator', midX - 23 * 8, midY - 6 * 8, 'biblical');
    adam.brain.name = "Adán";
    adam.brain.title = "Patriarca Anciano";
    adam.brain.wisdom = 95;
    adam.brain.faith = 100;
    adam.brain.setThoughtBubble("Recuerdo la gracia del Edén... Cuidaré a la tribu.", 180);

    const eve = spawnNpc('cultivator', midX - 21 * 8, midY - 5 * 8, 'biblical');
    eve.brain.name = "Eva";
    eve.brain.title = "Madre de la Humanidad";
    eve.brain.wisdom = 90;
    social.blessLove(adam, eve);

    // 🌾 CAÍN Y ABEL
    const cain = spawnNpc('cultivator', midX - 25 * 8, midY + 12 * 8, 'biblical');
    cain.brain.name = "Caín";
    cain.brain.title = "Labrador de la Tierra";
    cain.brain.setThoughtBubble("Con el sudor de mi frente labraré este suelo.", 150);

    const abel = spawnNpc('fisherman', midX - 10 * 8, midY, 'biblical');
    abel.brain.name = "Abel";
    abel.brain.title = "Pastor Fiel";
    abel.brain.setThoughtBubble("Ofrendaré lo mejor de mi rebaño al Creador.", 150);

    // 🕊️ PROFETA EN EL ALTAR SAGRADO
    const prophet = spawnNpc('prophet', midX + 18 * 8, midY - 6 * 8, 'biblical');
    prophet.brain.name = "Profeta Elías";
    prophet.brain.faith = 100;
    prophet.brain.title = "Voz de Dios";

    // Niños que corretean y aprenden
    const c1 = spawnNpc('child', midX - 18 * 8, midY + 3 * 8, 'biblical');
    c1.brain.name = "Enoc";
    const c2 = spawnNpc('child', midX - 14 * 8, midY + 8 * 8, 'biblical');
    c2.brain.name = "Sara";

    // Animales bíblicos
    spawnAnimal('dog', midX - 12 * 8, midY + 2 * 8);
    spawnAnimal('pig', midX - 5 * 8, midY + 15 * 8);
    spawnAnimal('pig', midX + 10 * 8, midY + 10 * 8);

    chronicles.add("📖 ¡GÉNESIS! Adán, Eva, Caín y Abel fundan la civilización junto al Río de la Vida y el Altar Sagrado.", "divine");
    notify("🕊️ ¡Albores Bíblicos! La humanidad aprende a sembrar, construir y orar.");
  } else if (era.id === 'seventies') {
    // 🎸 Bob Marley en el centro de su gran escenario de madera
    const bob = spawnNpc('musician', midX + 1 * 8, midY - 5 * 8, 'seventies');
    bob.brain.name = "Bob Marley";
    bob.brain.title = "Voz de la Paz";
    bob.brain.setThoughtBubble("🎶 One Love, One Heart, Let's get together and feel all right!", 200);

    // Público hippie frente al escenario escuchando la música
    const h1 = spawnNpc('hippie', midX - 2 * 8, midY + 1 * 8, 'seventies');
    h1.brain.setThoughtBubble("☮️ ¡Siente la vibración de la música!", 160);

    const h2 = spawnNpc('musician', midX + 4 * 8, midY + 2 * 8, 'seventies');
    h2.brain.name = "Ziggy";
    h2.brain.title = "Guitarrista";
    h2.brain.setThoughtBubble("🎸 Siguiendo el compás del bajo...", 150);

    // Sanadora en la Carpa Sanadora
    const healer = spawnNpc('healer', midX - 23 * 8, midY - 12 * 8, 'seventies');
    healer.brain.name = "Rita";
    healer.brain.title = "Sanadora Herbal";

    // Niños y fauna en la comuna
    spawnNpc('child', midX - 10 * 8, midY + 5 * 8, 'seventies');
    spawnNpc('cultivator', midX + 14 * 8, midY + 16 * 8, 'seventies');
    spawnAnimal('dog', midX, midY + 8 * 8); // Perro cerca de la fogata

    chronicles.add("☮️ ¡FESTIVAL DE LA PAZ! Bob Marley canta en su tarima con amplificadores y la comuna enciende la fogata.", "divine");
    notify("☮️ ¡Años 70! Bob Marley en concierto, praderas floridas, amplificadores y comuna.");
  } else if (era.id === 'eighties') {
    const boss = spawnNpc('boss', midX - 15 * 8, midY - 21 * 8, 'eighties');
    boss.brain.name = "El Patrón";
    spawnNpc('cultivator', midX - 10 * 8, midY + 15 * 8, 'eighties');
    spawnNpc('police', midX + 25 * 8, midY + 10 * 8, 'eighties');
    spawnNpc('child', midX - 5 * 8, midY, 'eighties');
    spawnAnimal('dog', midX - 8 * 8, midY);
    spawnAnimal('croc', midX + 30 * 8, midY + 20 * 8);

    chronicles.add("💰 ¡IMPERIO CLANDESTINO! El Patrón reina en su hacienda con piscina y pistas de avioneta.", "divine");
    notify("💰 ¡Años 80! Cárteles, hacienda de lujo y pistas clandestinas.");
  } else if (era.id === 'forties') {
    const cmd = spawnNpc('soldier', midX + 8 * 8, midY + 3 * 8, 'forties');
    cmd.brain.name = "Comandante Miller";
    cmd.brain.title = "Jefe del Bastión";
    spawnNpc('medic', midX - 26 * 8, midY - 5 * 8, 'forties');
    spawnNpc('soldier', midX - 10 * 8, midY + 2 * 8, 'forties');
    spawnNpc('cultivator', midX + 15 * 8, midY - 10 * 8, 'forties');
    spawnNpc('child', midX - 4 * 8, midY - 6 * 8, 'forties');
    spawnAnimal('dog', midX + 5 * 8, midY + 5 * 8);

    chronicles.add("⚔️ ¡FRENTE DE RESISTENCIA! Las trincheras están cavadas y el hospital militar recibe heridos.", "divine");
    notify("⚔️ ¡Años 40! Búnker fortificado, trincheras y resistencia civil.");
  } else if (era.id === 'colombia') {
    // 🇨🇴 REALIDAD MACONDO: Retén, Cuadrante, Mototaxis, Doña Gloria y Aguacates
    const tombo = spawnNpc('police_cuadrante', midX - 24 * 8, midY - 10 * 8, 'colombia');
    tombo.brain.name = "Patrullero Gómez";
    tombo.brain.title = "Agente del Cuadrante";
    tombo.brain.setThoughtBubble("Páreme esa moto ahí mi rey... ¿Tiene el SOAT?", 180);

    const guerr = spawnNpc('guerrillero', midX + 26 * 8, midY - 12 * 8, 'colombia');
    guerr.brain.name = "Comandante Tiro-Loco";
    guerr.brain.title = "Líder del Monte";
    guerr.brain.setThoughtBubble("¿Quién no lavó la paila del sancocho?", 180);

    const brayan = spawnNpc('mototaxista', midX + 4 * 8, midY + 2 * 8, 'colombia');
    brayan.brain.name = "El Brayan";
    brayan.brain.title = "Piloto de Trocha";
    brayan.brain.setThoughtBubble("¡Súbase compadre que voy sin frenos!", 180);

    const mario = spawnNpc('vendedor', midX - 22 * 8, midY + 10 * 8, 'colombia');
    mario.brain.name = "Don Mario";
    mario.brain.title = "Pregonero de Aguacates";
    mario.brain.setThoughtBubble("¡A mil y a dos mil el aguacate maduro!", 180);

    const gloria = spawnNpc('vecina_chismosa', midX - 26 * 8, midY + 6 * 8, 'colombia');
    gloria.brain.name = "Doña Gloria";
    gloria.brain.title = "Ojo de Águila del Barrio";
    gloria.brain.setThoughtBubble("¡Mírele los tatuajes al vecino nuevo!", 180);

    const alcalde = spawnNpc('alcalde', midX - 27 * 8, midY - 14 * 8, 'colombia');
    alcalde.brain.name = "Doctor Promesas";
    alcalde.brain.title = "Alcalde en Campaña";
    alcalde.brain.setThoughtBubble("¡Un tamal caliente por cada voto compatriotas!", 180);

    // Campesinos y niños
    spawnNpc('cultivator', midX + 10 * 8, midY + 12 * 8, 'colombia');
    spawnNpc('child', midX - 12 * 8, midY + 4 * 8, 'colombia');
    spawnAnimal('dog', midX - 20 * 8, midY + 8 * 8);

    chronicles.add("🇨🇴 ¡REALIDAD MACONDO! El cuadrante patrulla la trocha, la guerrilla hierve el sancocho y Doña Gloria vigila.", "divine");
    notify("🇨🇴 ¡Realidad Macondo! Selva, retenes, cuadrantes, mototaxis y aguacates.");
  } else if (era.id === 'hyrule') {
    // 🗡️ ALDEA MINISH (2.5D Zelda The Minish Cap): Link, Herrero Smith, Malon y el Pozo
    const link = spawnNpc('hero', midX - 2 * 8, midY + 4 * 8, 'hyrule');
    link.brain.name = "Link";
    link.brain.title = "Héroe Minish";
    link.brain.setThoughtBubble("🗡️ ¡El abuelo Smith me encargó llevar la espada al castillo!", 220);

    const smith = spawnNpc('prophet', midX - 6 * 8, midY - 6 * 8, 'hyrule');
    smith.brain.name = "Maestro Smith";
    smith.brain.title = "Herrero Real";
    smith.brain.setThoughtBubble("⚒️ El acero sagrado necesita templarse en la fragua.", 180);

    const malon = spawnNpc('farmer', midX + 18 * 8, midY - 8 * 8, 'hyrule');
    malon.brain.name = "Malon";
    malon.brain.title = "Granjera del Valle";
    malon.brain.setThoughtBubble("🌾 Cuidando las hortalizas del huerto hundido...", 180);

    const child = spawnNpc('child', midX + 2 * 8, midY + 8 * 8, 'hyrule');
    child.brain.name = "Pico";
    child.brain.title = "Aldeano Curioso";
    child.brain.setThoughtBubble("✨ ¿Has visto a los seres diminutos del bosque?", 170);

    spawnAnimal('dog', midX - 4 * 8, midY + 12 * 8);
    spawnAnimal('pig', midX + 20 * 8, midY - 4 * 8);

    chronicles.add("🗡️ ¡ALDEA MINISH! Link recorre los caminos empedrados, cabañas con tejado azul, árboles volumétricos y acantilados con escaleras.", "divine");
    notify("🗡️ ¡Aldea Minish (2.5D Zelda)! Profundidad visual, árboles esféricos, huertos hundidos y acantilados transitables.");
  }

  // Elegir orgánicamente el líder de la civilización para la era
  civ.electLeader(npcs);
}

// Mind Panel Elements
const mindPanel = document.getElementById('mindPanel');
const mindNpcName = document.getElementById('mindNpcName');
const mindClose = document.getElementById('mindClose');
const mindNpcTitle = document.getElementById('mindNpcTitle');
const mindNpcTrait = document.getElementById('mindNpcTrait');
const barFaith = document.getElementById('barFaith');
const barHunger = document.getElementById('barHunger');
const barHealth = document.getElementById('barHealth');
const barSatisfaction = document.getElementById('barSatisfaction');
const barFear = document.getElementById('barFear');
const barEnergy = document.getElementById('barEnergy');
const mindThoughtText = document.getElementById('mindThoughtText');
const btnBlessFaith = document.getElementById('btnBlessFaith');
const btnFeedNpc = document.getElementById('btnFeedNpc');
const btnScare = document.getElementById('btnScare');
const btnPossessFromMind = document.getElementById('btnPossessFromMind');

const mindNpcEmotion = document.getElementById('mindNpcEmotion');
const mindRestStatus = document.getElementById('mindRestStatus');

let inspectedNpc = null;

function openMindPanel(npc) {
  inspectedNpc = npc;
  updateMindPanelUI();
  mindPanel.style.display = 'block';
  notify(`🧠 Inspeccionando a ${npc.brain.name} (${npc.brain.title})`);
}

function updateMindPanelUI() {
  if (!inspectedNpc || !inspectedNpc.brain) return;
  const b = inspectedNpc.brain;
  mindNpcName.innerText = `${b.name} (${inspectedNpc.type.toUpperCase()})`;
  mindNpcTitle.innerText = `${b.title} • Sabiduría: ${Math.round(b.wisdom)}`;
  mindNpcTrait.innerText = `Personalidad: ${b.trait.name}`;

  if (mindNpcEmotion) {
    const emoNames = {
      calm: 'Sereno / En Paz',
      scared: '¡Aterrorizado / Pánico!',
      valiant: '¡Gallardo y Decidido!',
      inspired: 'Éxtasis Místico',
      joyful: 'Alegre y Optimista',
      sleeping: 'Durmiendo plácidamente',
      exhausted: 'Exhausto',
      enraged: 'Indignado / Rebelde'
    };
    mindNpcEmotion.innerText = `${b.emotionIcon || '🕊️'} ${emoNames[b.emotion] || b.emotion}`;
  }

  if (mindRestStatus) {
    mindRestStatus.style.display = b.isResting ? 'block' : 'none';
  }

  if (barFaith) barFaith.style.width = `${Math.min(100, Math.round(b.faith))}%`;
  if (barHunger && b.needs) barHunger.style.width = `${Math.min(100, Math.round(b.needs.hunger))}%`;
  if (barHealth && b.needs) barHealth.style.width = `${Math.min(100, Math.round(b.needs.health))}%`;
  if (barSatisfaction) barSatisfaction.style.width = `${Math.min(100, Math.round(b.satisfaction || 80))}%`;
  if (barFear) barFear.style.width = `${Math.min(100, Math.round(b.fear))}%`;
  if (barEnergy) barEnergy.style.width = `${Math.min(100, Math.round(b.energy))}%`;
  mindThoughtText.innerText = `"${b.currentThought}"`;
}

mindClose.addEventListener('click', () => {
  mindPanel.style.display = 'none';
  inspectedNpc = null;
});

btnBlessFaith.addEventListener('click', () => {
  if (!inspectedNpc) return;
  inspectedNpc.brain.faith = Math.min(100, inspectedNpc.brain.faith + 25);
  inspectedNpc.brain.wisdom = Math.min(100, inspectedNpc.brain.wisdom + 10);
  inspectedNpc.brain.setEmotion('inspired', '✨', 180);
  civ.addResource('knowledge', 5);
  inspectedNpc.brain.setThoughtBubble("🕊️ ¡El Creador ha iluminado mi entendimiento!", 160);
  sound.playAscend();
  vfx.addShockwave(inspectedNpc.x, inspectedNpc.y, 30, '#ffd700');
  recordGodAction('rain', inspectedNpc.x, inspectedNpc.y, 0.5);
  updateMindPanelUI();
  notify(`✨ Has iluminado la sabiduría de ${inspectedNpc.brain.name}`);
});

if (btnFeedNpc) {
  btnFeedNpc.addEventListener('click', () => {
    if (!inspectedNpc || !inspectedNpc.brain) return;
    const b = inspectedNpc.brain;
    if (b.needs) {
      b.needs.hunger = 0;
      b.needs.health = 100;
    }
    b.satisfaction = 100;
    b.setEmotion('joyful', '🍞', 180);
    b.setThoughtBubble("🍞 ¡Maná del Cielo! ¡El Creador ha saciado mi hambre!", 180);
    sound.playAscend();
    vfx.addShockwave(inspectedNpc.x, inspectedNpc.y, 25, '#f59e0b');
    recordGodAction('bless_mana', inspectedNpc.x, inspectedNpc.y, 1);
    updateMindPanelUI();
    notify(`🍞 Has saciado el hambre de ${b.name} con maná celestial`);
  });
}

btnScare.addEventListener('click', () => {
  if (!inspectedNpc) return;
  inspectedNpc.brain.fear = Math.min(100, inspectedNpc.brain.fear + 35);
  inspectedNpc.brain.setThoughtBubble("😱 ¡Una voz de trueno retumba en mi alma!", 160);
  sound.playAlert();
  camera.triggerShake(4, 8);
  updateMindPanelUI();
  notify(`⚡ Has hecho temblar a ${inspectedNpc.brain.name}`);
});

btnPossessFromMind.addEventListener('click', () => {
  if (!inspectedNpc) return;
  const target = inspectedNpc;
  mindPanel.style.display = 'none';
  inspectedNpc = null;
  enterPossession(target);
});

// --- MODO OBSERVADOR / ESPECTADOR Y CONTROLES DE ZOOM ---
const btnFollowFromMind = document.getElementById('btnFollowFromMind');
const spectatorHud = document.getElementById('spectatorHud');
const spectatorTargetName = document.getElementById('spectatorTargetName');
const btnStopFollow = document.getElementById('btnStopFollow');
const zoomControls = document.getElementById('zoomControls');
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnZoomReset = document.getElementById('btnZoomReset');

function startObserving(npc) {
  if (!npc) return;
  camera.follow(npc);
  if (mindPanel) mindPanel.style.display = 'none';
  if (spectatorHud) {
    spectatorHud.style.display = 'flex';
    if (spectatorTargetName) {
      spectatorTargetName.innerText = `${npc.brain.name} (${npc.brain.title})`;
    }
  }
  sound.playAscend();
  notify(`🎥 Modo Observador: Siguiendo a ${npc.brain.name} de cerca`);
}

function stopObserving(notifyUser = false) {
  if (camera.followedEntity) {
    camera.unfollow();
    if (spectatorHud) spectatorHud.style.display = 'none';
    if (notifyUser) notify("👁️ Vista libre celestial restaurada");
  }
}

if (btnFollowFromMind) {
  btnFollowFromMind.addEventListener('click', () => {
    if (!inspectedNpc) return;
    const target = inspectedNpc;
    inspectedNpc = null;
    startObserving(target);
  });
}

if (btnStopFollow) {
  btnStopFollow.addEventListener('click', () => {
    stopObserving(true);
  });
}

if (btnZoomIn) {
  btnZoomIn.addEventListener('click', () => {
    camera.zoomBy(1.25);
    notify("🔍 Acercando vista");
  });
}

if (btnZoomOut) {
  btnZoomOut.addEventListener('click', () => {
    camera.zoomBy(0.8);
    notify("🔍 Alejando vista");
  });
}

if (btnZoomReset) {
  btnZoomReset.addEventListener('click', () => {
    stopObserving();
    camera.resetView(grid.width, grid.height);
    notify("🎯 Vista general de la isla centrada");
  });
}

// --- SISTEMA Y MODAL DE GOBIERNO, CIENCIA Y LEYES ---
function openGovModal() {
  renderGovModalUI();
  if (govModal) govModal.style.display = 'block';
}

function updateReligionBadge() {
  const relTitle = document.getElementById('religionBarTitle');
  if (relTitle && civ.religion) {
    relTitle.innerText = civ.religion.name.replace('Culto del ', '').replace('Orden del ', '');
  }
}

function recordGodAction(type, worldX, worldY, intensity = 1) {
  civ.recordGodIntervention(type, intensity, npcs, animals);
  npcs.forEach(n => {
    const d = Math.hypot(n.x - worldX, n.y - worldY);
    if (d < 180) {
      n.brain.onDivineEvent(type, intensity);
    }
  });
  updateReligionBadge();
  if (govModal && govModal.style.display === 'block') {
    renderGovModalUI();
  }
}

function renderGovModalUI() {
  if (!govModal) return;
  if (govModalType) govModalType.innerText = civ.governmentName;
  if (govModalLeader) govModalLeader.innerText = `Líder Supremo: ${civ.leaderName || 'Ninguno'}`;
  if (govModalHappy) govModalHappy.innerText = `${Math.round(civ.happiness)}%`;
  if (govModalUnrest) govModalUnrest.innerText = `${Math.round(civ.unrest)}%`;

  // Renderizar Religión
  const govReligName = document.getElementById('govReligName');
  const govReligDeity = document.getElementById('govReligDeity');
  const govReligDogma = document.getElementById('govReligDogma');
  const govReligStats = document.getElementById('govReligStats');
  const govDogAlpha = document.getElementById('govDogAlpha');
  const govCatAlpha = document.getElementById('govCatAlpha');

  if (govReligName && civ.religion) govReligName.innerText = `🕊️ ${civ.religion.name}`;
  if (govReligDeity && civ.religion) govReligDeity.innerText = `Deidad: ${civ.religion.deityTitle} (${civ.religion.deityType.toUpperCase()})`;
  if (govReligDogma && civ.religion) govReligDogma.innerText = `"${civ.religion.dogma}"`;
  if (govReligStats && civ.religion) {
    govReligStats.innerText = `Milagros: ${civ.religion.miraclesWitnessed} | Catástrofes: ${civ.religion.catastrophesWitnessed} | Fe: ${Math.round(civ.religion.faith)}% | Temor: ${Math.round(civ.religion.fear)}%`;
  }

  // Renderizar Sociedades Animales
  if (govDogAlpha && civ.animalSocieties) govDogAlpha.innerText = `Líder Alfa: ${civ.animalSocieties.dogPack.alphaName}`;
  if (govCatAlpha && civ.animalSocieties) govCatAlpha.innerText = `Gran Felino: ${civ.animalSocieties.catTribe.alphaName}`;

  // Renderizar Políticas
  if (govPoliciesList) {
    govPoliciesList.innerHTML = '';
    const policies = civ.getPolicies();
    for (const pol of policies) {
      const item = document.createElement('div');
      item.className = 'policy-item';
      item.innerHTML = `
        <div>
          <div style="font-size: 18px; color: #f8fafc; font-weight: bold;">${pol.icon} ${pol.name}</div>
          <div style="font-size: 14px; color: #94a3b8;">${pol.desc}</div>
          <div style="font-size: 12px; color: #38bdf8;">Requisito: ${pol.req}</div>
        </div>
        <button class="policy-btn ${pol.active ? 'active' : ''}" data-policy="${pol.id}">
          ${pol.active ? '✅ ACTIVO' : '⭕ DEROGADO'}
        </button>
      `;
      item.querySelector('.policy-btn').addEventListener('click', () => {
        civ.togglePolicy(pol.id);
        renderGovModalUI();
      });
      govPoliciesList.appendChild(item);
    }
  }

  // Renderizar Árbol de Conocimiento
  if (govTechGrid) {
    govTechGrid.innerHTML = '';
    const techs = civ.getTechTree();
    for (const t of techs) {
      const card = document.createElement('div');
      card.className = `tech-card ${t.unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div style="font-size: 24px;">${t.icon}</div>
        <div style="flex: 1;">
          <div style="font-size: 16px; font-weight: bold; color: ${t.unlocked ? '#34d399' : '#e2e8f0'};">
            ${t.name} ${t.unlocked ? '✓' : '🔒'}
          </div>
          <div style="font-size: 13px; color: #94a3b8;">${t.desc}</div>
          <div style="font-size: 12px; color: ${t.unlocked ? '#a7f3d0' : '#f59e0b'};">
            ${t.unlocked ? '¡Descubierto!' : `Requiere: ${t.req}`}
          </div>
        </div>
      `;
      govTechGrid.appendChild(card);
    }
  }
}

if (btnOpenGov) btnOpenGov.addEventListener('click', openGovModal);
if (btnToolbarGov) btnToolbarGov.addEventListener('click', openGovModal);
if (govClose) govClose.addEventListener('click', () => { govModal.style.display = 'none'; });

const btnOpenReligion = document.getElementById('btnOpenReligion');
if (btnOpenReligion) {
  btnOpenReligion.addEventListener('click', () => {
    openGovModal();
    const religCard = document.getElementById('govReligionCard');
    if (religCard) {
      religCard.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

if (btnGovElect) {
  btnGovElect.addEventListener('click', () => {
    civ.electLeader(npcs);
    sound.playAscend();
    renderGovModalUI();
    notify(`👑 Se convocó asamblea popular y se proclamó a ${civ.leaderName}`);
  });
}

// Control de Velocidad de Tiempo (Acelerador de la Simulación)
let timeSpeed = 1;
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'transparent';
      b.style.color = '#94a3b8';
      b.style.fontWeight = 'normal';
    });
    btn.classList.add('active');
    btn.style.background = '#0284c7';
    btn.style.color = '#ffffff';
    btn.style.fontWeight = 'bold';
    timeSpeed = parseInt(btn.dataset.speed, 10);
    if (timeSpeed === 0) {
      notify("⏸️ Simulación en Pausa");
    } else if (timeSpeed === 1) {
      notify("▶️ Tiempo Normal (1x)");
    } else if (timeSpeed === 2) {
      notify("⏩ Tiempo Acelerado (2x)");
    } else if (timeSpeed === 5) {
      notify("⏭️ Evolución Rápida (5x)");
    } else if (timeSpeed === 10) {
      notify("⚡ Velocidad Cósmica de los Dioses (10x)");
    }
  });
});

// Gestión de botones de herramientas
document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
    canvas.style.cursor = currentTool === 'pan' ? 'grab' : 'crosshair';

    if (currentTool === 'pan') {
      notify("🖐️ Arrastra con el dedo o ratón para mover el mapa. Toca un aldeano para inspeccionarlo.");
    } else if (currentTool === 'possess') {
      notify("👁️ Toca o haz click sobre cualquier personaje para encarnar en él");
    } else if (currentTool === 'inspect') {
      notify("🧠 Toca o haz click sobre cualquier aldeano para leer su mente y sabiduría");
    } else if (currentTool === 'build_house') {
      notify("🏡 Toca en tierra plana para ordenar levantar una nueva choza o casa");
    } else if (currentTool === 'earthquake') {
      notify("🌋 Toca el suelo para desatar un sismo tectónico y rajar la tierra");
    } else if (currentTool === 'spawn_meme') {
      notify("🇨🇴 Toca para spawnear un personaje memificable de la realidad");
    }
  });
});

// Soporte Unificado Mouse y Pantallas Táctiles (Móviles / Tablets / PC)
function getEventPos(e) {
  if (e.touches && e.touches.length > 0) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return { x: e.clientX, y: e.clientY };
}

let isPanning = false;
let lastPanPos = { x: 0, y: 0 };
let mouseDownPos = { x: 0, y: 0 };

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.18 : 0.85;
  camera.zoomBy(factor, e.clientX, e.clientY);
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
  mouseDownPos = { x: e.clientX, y: e.clientY };
  if (e.button === 2 || e.button === 1 || currentTool === 'pan') {
    isPanning = true;
    lastPanPos = { x: e.clientX, y: e.clientY };
    stopObserving();
    if (currentTool === 'pan') canvas.style.cursor = 'grabbing';
    return;
  }
  isMouseDown = true;
  mousePos = getEventPos(e);
  handlePointerAction();
});

window.addEventListener('mouseup', (e) => {
  if (currentTool === 'pan') {
    canvas.style.cursor = 'grab';
    if (isPanning) {
      const distMoved = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (distMoved < 6) {
        const worldCoords = camera.screenToWorld(e.clientX, e.clientY);
        const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
        if (clickedNpc) {
          openMindPanel(clickedNpc);
        }
      }
    }
  }
  isMouseDown = false;
  isPanning = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (isPanning) {
    const dx = e.clientX - lastPanPos.x;
    const dy = e.clientY - lastPanPos.y;
    camera.panBy(dx, dy);
    stopObserving();
    lastPanPos = { x: e.clientX, y: e.clientY };
    return;
  }
  mousePos = getEventPos(e);
  if (isMouseDown && mode === 'god' && currentTool !== 'pan') {
    handlePointerAction();
  }
});

// Eventos Táctiles para Móviles y Tablets con soporte Pinch-to-Zoom y Desplazamiento
let touchMode = 'none'; // 'paint' | 'pan' | 'pinch'
let touchStartPos = { x: 0, y: 0 };
let touchLastPanPos = { x: 0, y: 0 };
let initialPinchDist = 0;

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();

  if (e.touches.length >= 2) {
    touchMode = 'pinch';
    isMouseDown = false;
    isPanning = false;
    stopObserving();
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    initialPinchDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
    touchLastPanPos = {
      x: (t0.clientX + t1.clientX) / 2,
      y: (t0.clientY + t1.clientY) / 2
    };
    return;
  }

  if (e.touches.length === 1) {
    const t0 = e.touches[0];
    touchStartPos = { x: t0.clientX, y: t0.clientY };
    touchLastPanPos = { x: t0.clientX, y: t0.clientY };

    if (currentTool === 'pan') {
      touchMode = 'pan';
      isPanning = true;
      stopObserving();
      return;
    }

    touchMode = 'paint';
    isMouseDown = true;
    mousePos = getEventPos(e);
    handlePointerAction();
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length >= 2) {
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    const currentDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
    const midX = (t0.clientX + t1.clientX) / 2;
    const midY = (t0.clientY + t1.clientY) / 2;

    if (initialPinchDist > 0) {
      const factor = currentDist / initialPinchDist;
      const clampedFactor = Math.max(0.88, Math.min(1.15, factor));
      camera.zoomBy(clampedFactor, midX, midY);
      initialPinchDist = currentDist;
    }

    const dx = midX - touchLastPanPos.x;
    const dy = midY - touchLastPanPos.y;
    camera.panBy(dx, dy);
    stopObserving();
    touchLastPanPos = { x: midX, y: midY };
    return;
  }

  if (e.touches.length === 1) {
    const t0 = e.touches[0];
    if (touchMode === 'pan' || currentTool === 'pan') {
      const dx = t0.clientX - touchLastPanPos.x;
      const dy = t0.clientY - touchLastPanPos.y;
      camera.panBy(dx, dy);
      stopObserving();
      touchLastPanPos = { x: t0.clientX, y: t0.clientY };
      return;
    }

    if (isMouseDown && mode === 'god' && touchMode === 'paint') {
      mousePos = getEventPos(e);
      handlePointerAction();
    }
  }
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (e.touches.length === 0) {
    if (touchMode === 'pan') {
      const distMoved = Math.hypot(touchLastPanPos.x - touchStartPos.x, touchLastPanPos.y - touchStartPos.y);
      if (distMoved < 12) {
        const worldCoords = camera.screenToWorld(touchLastPanPos.x, touchLastPanPos.y);
        const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
        if (clickedNpc) {
          openMindPanel(clickedNpc);
        }
      }
    }
    isMouseDown = false;
    isPanning = false;
    touchMode = 'none';
  } else if (e.touches.length === 1) {
    const t0 = e.touches[0];
    touchLastPanPos = { x: t0.clientX, y: t0.clientY };
    touchMode = currentTool === 'pan' ? 'pan' : 'none';
  }
});

// Lluvia divina masiva
function triggerRain() {
  sound.playWater();
  notify("🌧️ Has derramado bendita lluvia sobre los campos");
  for (let i = 0; i < 250; i++) {
    const rx = Math.floor(Math.random() * grid.width);
    const ry = Math.floor(Math.random() * 8);
    grid.set(rx, ry, ELEM.WATER);
  }
  civ.addResource('food', 5);
  recordGodAction('rain', (grid.width * 8) / 2, (grid.height * 8) / 2, 1);
}

// Modales y Paneles
const mapModal = document.getElementById('mapModal');
const mapClose = document.getElementById('mapClose');
const btnOpenMaps = document.getElementById('btnOpenMaps');
const chroniclesPanel = document.getElementById('chroniclesPanel');
const chroniclesClose = document.getElementById('chroniclesClose');
const btnOpenChronicles = document.getElementById('btnOpenChronicles');
const chroniclesList = document.getElementById('chroniclesList');

chronicles.onNewChronicle = (entry) => {
  if (!chroniclesList) return;
  const item = document.createElement('div');
  item.className = 'chronicle-entry';
  item.innerHTML = `<div class="chronicle-time">${entry.time}</div><div>${entry.text}</div>`;
  chroniclesList.insertBefore(item, chroniclesList.firstChild);
  if (chroniclesList.children.length > 30) {
    chroniclesList.removeChild(chroniclesList.lastChild);
  }
};

btnOpenMaps.addEventListener('click', () => {
  mapModal.style.display = 'block';
});
mapClose.addEventListener('click', () => {
  mapModal.style.display = 'none';
});

document.querySelectorAll('#mapModal .map-card').forEach(card => {
  card.addEventListener('click', () => {
    const mapType = card.dataset.map;
    MapGenerator.generate(grid, mapType);
    mapModal.style.display = 'none';
    camera.setMode('god', null, grid.width, grid.height);

    npcs.length = 0;
    animals.length = 0;
    civ.reset();

    const midX = Math.floor(grid.width / 2) * 8;
    const midY = Math.floor(grid.height / 2) * 8;
    spawnNpc('cultivator', midX - 20, midY);
    spawnNpc('cultivator', midX + 20, midY);
    spawnNpc('child', midX - 10, midY + 15);
    spawnAnimal('dog', midX - 5, midY);

    const title = card.querySelector('.map-card-title').innerText;
    chronicles.add(`🌍 ¡MUNDO REFORMADO! El Creador ha esculpido: ${title}`, 'divine');
    notify(`🌍 Mundo reformado: ${title}`);
  });
});

// Modal de Eras Históricas
const eraModal = document.getElementById('eraModal');
const eraClose = document.getElementById('eraClose');

btnOpenEras.addEventListener('click', () => {
  eraModal.style.display = 'block';
});
eraClose.addEventListener('click', () => {
  eraModal.style.display = 'none';
});

document.querySelectorAll('#eraModal .map-card').forEach(card => {
  card.addEventListener('click', () => {
    const eraKey = card.dataset.era;
    eraModal.style.display = 'none';
    setupEraWorld(ERAS[eraKey]);
    sound.playAscend();
  });
});

btnOpenChronicles.addEventListener('click', () => {
  chroniclesPanel.style.display = chroniclesPanel.style.display === 'flex' ? 'none' : 'flex';
});
chroniclesClose.addEventListener('click', () => {
  chroniclesPanel.style.display = 'none';
});

let selectedLover = null;
let selectedRival = null;

// Acciones según herramienta divina
function handlePointerAction() {
  if (mode !== 'god') return;
  if (currentTool === 'pan') return;

  const worldCoords = camera.screenToWorld(mousePos.x, mousePos.y);
  const { tileX, tileY } = camera.worldToTile(worldCoords.x, worldCoords.y);

  if (currentTool === 'water') {
    grid.paint(tileX, tileY, ELEM.WATER, brushRadius);
    sound.playWater();
  } else if (currentTool === 'dirt') {
    grid.paint(tileX, tileY, ELEM.DIRT, brushRadius);
  } else if (currentTool === 'seed') {
    grid.paint(tileX, tileY, ELEM.SEED, brushRadius);
    sound.playPlant();
  } else if (currentTool === 'wood') {
    grid.paint(tileX, tileY, ELEM.WOOD, brushRadius);
    civ.addResource('wood', 2);
  } else if (currentTool === 'tree') {
    grid.paint(tileX, tileY, ELEM.TREE, 1);
    sound.playPlant();
  } else if (currentTool === 'cliff') {
    grid.paint(tileX, tileY, ELEM.CLIFF, brushRadius);
  } else if (currentTool === 'ladder') {
    grid.paint(tileX, tileY, ELEM.LADDER, 1);
  } else if (currentTool === 'fence') {
    grid.paint(tileX, tileY, ELEM.FENCE, 1);
  } else if (currentTool === 'fire') {
    grid.paint(tileX, tileY, ELEM.FIRE, brushRadius);
    sound.playFire();
    recordGodAction('fire', worldCoords.x, worldCoords.y, 0.8);
  } else if (currentTool === 'lightning') {
    grid.strikeLightning(tileX, tileY);
    sound.playThunder();
    camera.triggerShake(7, 16);
    vfx.addShockwave(worldCoords.x, worldCoords.y, 45, '#ff4400');
    notify("⚡ ¡El rayo de Dios ha sacudido la tierra!");
    recordGodAction('lightning', worldCoords.x, worldCoords.y, 1.2);
  } else if (currentTool === 'earthquake') {
    grid.triggerEarthquake(tileX, tileY, 3);
    sound.playEarthquake();
    camera.triggerShake(14, 42);
    vfx.addShockwave(worldCoords.x, worldCoords.y, 65, '#ea580c');
    notify("🌋 ¡TERREMOTO TECTÓNICO! Se abren fallas abisales y las casas tambalean");
    chronicles.add("🌋 ¡TERREMOTO GRADO 8.5! Grietas tectónicas parten la tierra y cunde el pánico.", "divine");
    recordGodAction('earthquake', worldCoords.x, worldCoords.y, 1.5);
    isMouseDown = false;
  } else if (currentTool === 'spawn_meme') {
    const memeTypes = ['police_cuadrante', 'guerrillero', 'mototaxista', 'vendedor', 'vecina_chismosa', 'alcalde'];
    const chosen = memeTypes[Math.floor(Math.random() * memeTypes.length)];
    const p = spawnNpc(chosen, worldCoords.x, worldCoords.y, 'colombia');
    sound.playAscend();
    notify(`🇨🇴 ¡Apareció ${p.brain.name} (${p.brain.title})!`);
    chronicles.add(`🇨🇴 ¡NUEVO PERSONAJE! Ha llegado al pueblo: ${p.brain.name} (${p.brain.title}).`, "birth");
    isMouseDown = false;
  } else if (currentTool === 'rain') {
    triggerRain();
  } else if (currentTool === 'spawn_cultivator') {
    const human = spawnNpc('cultivator', worldCoords.x, worldCoords.y);
    notify(`👨‍🌾 Ha nacido un nuevo aldeano: ${human.brain.name}`);
    isMouseDown = false;
  } else if (currentTool === 'spawn_child') {
    const kid = spawnNpc('child', worldCoords.x, worldCoords.y);
    notify(`👶 ${kid.brain.name} corretea alegremente aprendiendo`);
    chronicles.add(`👶 ¡BENDICIÓN! El pequeño ${kid.brain.name} corretea por la aldea.`, "birth");
    isMouseDown = false;
  } else if (currentTool === 'spawn_animal') {
    const types = ['dog', 'pig'];
    const selected = types[Math.floor(Math.random() * types.length)];
    const a = spawnAnimal(selected, worldCoords.x, worldCoords.y);
    notify(`🐾 Animal creado: ${selected.toUpperCase()}`);
    isMouseDown = false;
  } else if (currentTool === 'spawn_cat') {
    const cat = spawnAnimal('cat', worldCoords.x, worldCoords.y);
    sound.playPlant();
    notify(`🐱 Ha nacido un ágil gatito: Michi #${cat.id}`);
    chronicles.add(`🐱 ¡NUEVO FELINO! Un curioso gato maúlla, ronronea y caza plagas en la aldea.`, "birth");
    isMouseDown = false;
  } else if (currentTool === 'build_house') {
    civ.constructHouse(grid, tileX, tileY);
    isMouseDown = false;
  } else if (currentTool === 'love') {
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      if (!selectedLover) {
        selectedLover = clickedNpc;
        notify(`💘 Has flechado a ${clickedNpc.brain.name}. Selecciona a su pareja...`);
      } else if (selectedLover.id !== clickedNpc.id) {
        social.blessLove(selectedLover, clickedNpc);
        sound.playAscend();
        vfx.addShockwave(clickedNpc.x, clickedNpc.y, 35, '#ec4899');
        notify(`💖 ¡${selectedLover.brain.name} y ${clickedNpc.brain.name} se han prometido amor!`);
        selectedLover = null;
      }
      isMouseDown = false;
    }
  } else if (currentTool === 'discord') {
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      if (!selectedRival) {
        selectedRival = clickedNpc;
        notify(`⚔️ Marcado ${clickedNpc.brain.name}. Haz click en su rival...`);
      } else if (selectedRival.id !== clickedNpc.id) {
        social.sowDiscord(selectedRival, clickedNpc);
        sound.playAlert();
        vfx.addShockwave(clickedNpc.x, clickedNpc.y, 35, '#ef4444');
        notify(`⚡ ¡${selectedRival.brain.name} y ${clickedNpc.brain.name} son enemigos mortales!`);
        selectedRival = null;
      }
      isMouseDown = false;
    }
  } else if (currentTool === 'inspect') {
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      openMindPanel(clickedNpc);
    }
  } else if (currentTool === 'possess') {
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      enterPossession(clickedNpc);
    }
  }
}

// Iniciar Secuencia Mágica de Posesión (Estilo The Minish Cap)
function enterPossession(npc) {
  stopObserving();
  notify(`✨ ¡Descendiendo del cielo para encarnar en ${npc.brain.name}!`);
  recordGodAction('possession', npc.x, npc.y, 1);

  topBar.style.display = 'none';
  bottomToolbar.style.display = 'none';
  if (mindPanel) mindPanel.style.display = 'none';
  if (zoomControls) zoomControls.style.display = 'none';
  if (spectatorHud) spectatorHud.style.display = 'none';
  inspectedNpc = null;

  npcs.filter(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 120)
      .forEach(n => n.brain.onDivineEvent('saw_possession'));

  vfx.startPossession(
    npc.x + 8,
    npc.y + 8,
    () => {
      mode = 'possessed';
      possessedNpc = npc;
      npc.isPossessed = true;
      camera.setMode('possessed', npc);

      possessedHud.style.display = 'block';
      controlsHelp.style.display = 'block';
      ascendBtn.style.display = 'none';

      // Mostrar controles virtuales táctiles en móviles o pantallas estrechas
      const virtualControls = document.getElementById('virtualControls');
      const isTouchOrNarrow = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 850);
      if (virtualControls && isTouchOrNarrow) {
        virtualControls.style.display = 'flex';
      }

      const quest = questSystem.generateQuestFor(npc, currentEra);
      questTitle.innerText = quest.title;
      questDesc.innerText = quest.description;
      updateQuestUI();

      let abilityTip = "Cosechar o Entregar";
      if (npc.type === 'police_cuadrante') abilityTip = "👮 ¡Pedir pa' la gaseosa a los sospechosos!";
      else if (npc.type === 'mototaxista') abilityTip = "🛵 ¡Turbo pique callejero a fondo!";
      else if (npc.type === 'vendedor') abilityTip = "📢 ¡Megáfono de aguacates a todo volumen!";
      else if (npc.type === 'guerrillero') abilityTip = "🪖 ¡Olla comunitaria de sancocho!";
      else if (npc.type === 'vecina_chismosa') abilityTip = "👵 ¡Escobazo limpio a los malandrines!";
      else if (npc.type === 'alcalde') abilityTip = "🎩 ¡Lanzar tamales por votos!";

      controlsHelp.innerHTML = `<b>[WASD / Flechas]</b> Moverse &nbsp;|&nbsp; <b>[ESPACIO / E]</b> <span style="color:#facc15">${abilityTip}</span> &nbsp;|&nbsp; <b>[Q / ESC]</b> Ascender`;
    },
    () => {
      notify(`🎮 Encarnaste en ${npc.brain.name} (${npc.brain.title}). ¡Usa [ESPACIO] para tu habilidad!`);
    }
  );
}

function exitPossession() {
  if (possessedNpc) {
    possessedNpc.isPossessed = false;
    possessedNpc = null;
  }
  mode = 'god';
  sound.playAscend();
  camera.setMode('god', null, grid.width, grid.height);
  questSystem.clear();

  topBar.style.display = 'flex';
  bottomToolbar.style.display = 'flex';
  if (zoomControls) zoomControls.style.display = 'flex';
  possessedHud.style.display = 'none';
  controlsHelp.style.display = 'none';

  const virtualControls = document.getElementById('virtualControls');
  if (virtualControls) {
    virtualControls.style.display = 'none';
  }

  notify("☁️ Tu alma ha ascendido de regreso al Trono Celestial");
}

ascendBtn.addEventListener('click', exitPossession);

function updateQuestUI() {
  const q = questSystem.activeQuest;
  if (!q) return;
  questHarvest.innerText = `${q.harvestCurrent}/${q.harvestGoal}`;
  questDeliver.innerText = `${q.deliverCurrent}/${q.deliverGoal}`;

  if (q.completed) {
    ascendBtn.style.display = 'inline-block';
    questDesc.innerHTML = `<span style="color:#4ade80">¡MISIÓN COMPLETADA!</span> Pulsa <b>[Q]</b> para Ascender.`;
  }
}

// Bucle Principal del Juego (60 FPS)
let frameCount = 0;
function gameLoop() {
  frameCount++;

  const steps = (mode === 'possessed') ? 1 : timeSpeed;

  // Si no está en pausa (steps > 0), correr los pasos de simulación del mundo
  for (let s = 0; s < steps; s++) {
    // 1. Simulación Celular (Agua, fuego, plantas)
    grid.step();

    // 1b. Evolución y Construcción Autónoma de la Civilización (Humana y Animal)
    civ.update(grid, npcs, animals);

    // 2. Control del Jugador en Posesión (solo 1 vez por frame)
    if (s === 0 && mode === 'possessed' && possessedNpc) {
      controller.update(
        possessedNpc,
        grid,
        (actionType, amt) => {
          const completed = questSystem.onAction(actionType, amt);
          if (actionType === 'harvest') {
            civ.addResource('food', amt);
          } else if (actionType === 'deliver') {
            civ.addResource('knowledge', amt * 5);
          } else if (actionType === 'tamal' || actionType === 'sancocho') {
            civ.addResource('food', 2);
          } else if (actionType === 'bribe') {
            civ.addResource('knowledge', 10);
          }
          updateQuestUI();
          if (completed) {
            notify("✨ ¡Misión completada! Tu alma ya puede ascender al cielo [Q]");
          }
        },
        () => {
          exitPossession();
        },
        8,
        npcs
      );
    }

    // 3. Actualización de NPCs autónomos
    for (const npc of npcs) {
      npc.update(
        grid,
        npcs,
        8,
        (earned) => {
          civ.addResource('food', 1);
        },
        () => {}
      );
    }

    // Actualización de Fauna y Animales
    for (const animal of animals) {
      animal.update(grid, npcs, animals, 8);
    }

    // Sistema Social Emergente: Romance, Niños y Crianza
    social.update(npcs, (babyX, babyY, pA, pB) => {
      const baby = spawnNpc('child', babyX, babyY);
      baby.parentId = pA.id;
      sound.playAscend();
      vfx.addShockwave(babyX, babyY, 25, '#f472b6');
    });
  }

  // 4. Actualización de VFX
  vfx.update(camera);

  // 5. Actualización de Cámara
  camera.update(mode === 'possessed' ? possessedNpc : null);

  // 6. Renderizado
  const worldMouse = camera.screenToWorld(mousePos.x, mousePos.y);
  renderer.render(grid, npcs, animals, camera, possessedNpc, worldMouse, currentTool, brushRadius, currentEra);

  // 7. Actualización de Estadísticas cada 25 frames
  if (frameCount % 25 === 0 && mode === 'god') {
    statPop.innerText = npcs.length;
    if (statWood) statWood.innerText = civ.wood;
    if (statStone) statStone.innerText = civ.stone;
    if (statFood) statFood.innerText = Math.round(civ.food);
    if (statWisdom) statWisdom.innerText = Math.round(civ.knowledge);
    if (civStage) civStage.innerText = `🏛️ ${civ.stageName}`;
    if (statHappy) statHappy.innerText = `${Math.round(civ.happiness)}%`;
    updateReligionBadge();
    if (govBarTitle) {
      govBarTitle.innerText = civ.leaderName ? `${civ.leaderName.split(' ')[0]} (${civ.governmentName.split(' ')[0]})` : civ.governmentName.split(' ')[0];
    }

    if (inspectedNpc) {
      updateMindPanelUI();
    }
  }

  requestAnimationFrame(gameLoop);
}

// Iniciar Mundo por defecto en la Era Bíblica
setupEraWorld(ERAS.BIBLICAL);

// Iniciar GameLoop
requestAnimationFrame(gameLoop);
