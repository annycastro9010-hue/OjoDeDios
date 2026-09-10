import { ELEM } from './sim/elements.js';
import { SimulationGrid } from './sim/grid.js';
import { Camera } from './player/camera.js';
import { GameRenderer } from './render/renderer.js';
import { NPC } from './entities/npc.js';
import { PlayerController } from './player/controller.js';
import { QuestSystem } from './quests/questSystem.js';
import { sound } from './audio/soundFX.js';
import { vfx } from './render/fx.js';
import { MapGenerator } from './world/mapGenerator.js';
import { Animal } from './entities/animals.js';
import { social, chronicles } from './social/relations.js';

import { ERAS } from './world/eras.js';

// Inicialización de lienzo
const canvas = document.getElementById('gameCanvas');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Instancias del juego
const grid = new SimulationGrid(130, 85);
const camera = new Camera(canvas);
const renderer = new GameRenderer(canvas);
const controller = new PlayerController();
const questSystem = new QuestSystem();

// Estado global del juego
let mode = 'god'; // 'god' o 'possessed'
let possessedNpc = null;
let currentTool = 'water';
let currentEra = ERAS.EIGHTIES; // Era activa por defecto
let brushRadius = 2;
let isMouseDown = false;
let mousePos = { x: 0, y: 0 };
let nextNpcId = 1;
let nextAnimalId = 1;

// Estadísticas de la isla
let clandestineCash = 250;
let policeAlert = 15; // 0 a 100%

// Población inicial de la isla
const npcs = [];
function spawnNpc(type, x, y) {
  const npc = new NPC(nextNpcId++, type, x, y);
  npcs.push(npc);
  return npc;
}

// Fauna / Animales de la isla
const animals = [];
function spawnAnimal(type, x, y) {
  const a = new Animal(nextAnimalId++, type, x, y);
  animals.push(a);
  return a;
}

// Spawns iniciales en posiciones clave
const cx = Math.floor(grid.width / 2) * 8;
const cy = Math.floor(grid.height / 2) * 8;
spawnNpc('boss', cx - 80, cy - 50); // El Patrón en el almacén
spawnNpc('cultivator', cx - 20, cy);
spawnNpc('cultivator', cx + 40, cy - 20);
spawnNpc('cultivator', cx - 50, cy + 30);
spawnNpc('child', cx - 30, cy + 10);
spawnNpc('police', cx + 70, cy + 40);
spawnNpc('police', cx - 100, cy + 10);

// Animales iniciales
spawnAnimal('dog', cx - 15, cy + 5);
spawnAnimal('pig', cx + 30, cy + 25);
spawnAnimal('croc', cx + 110, cy + 60);

camera.setMode('god', null, grid.width, grid.height);

// UI Elements
const topBar = document.getElementById('topBar');
const bottomToolbar = document.getElementById('bottomToolbar');
const possessedHud = document.getElementById('possessedHud');
const controlsHelp = document.getElementById('controlsHelp');
const statPop = document.getElementById('statPop');
const statCrops = document.getElementById('statCrops');
const statCash = document.getElementById('statCash');
const statAlert = document.getElementById('statAlert');
const questTitle = document.getElementById('questTitle');
const questDesc = document.getElementById('questDesc');
const questHarvest = document.getElementById('questHarvest');
const questDeliver = document.getElementById('questDeliver');
const ascendBtn = document.getElementById('ascendBtn');
const notification = document.getElementById('notification');

function notify(text) {
  notification.innerText = text;
  notification.style.opacity = '1';
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 3200);
}

// Mind Panel Elements
const mindPanel = document.getElementById('mindPanel');
const mindNpcName = document.getElementById('mindNpcName');
const mindClose = document.getElementById('mindClose');
const mindNpcTitle = document.getElementById('mindNpcTitle');
const mindNpcTrait = document.getElementById('mindNpcTrait');
const barFaith = document.getElementById('barFaith');
const barFear = document.getElementById('barFear');
const barGreed = document.getElementById('barGreed');
const barEnergy = document.getElementById('barEnergy');
const mindThoughtText = document.getElementById('mindThoughtText');
const btnBlessFaith = document.getElementById('btnBlessFaith');
const btnScare = document.getElementById('btnScare');
const btnPossessFromMind = document.getElementById('btnPossessFromMind');

let inspectedNpc = null;

function openMindPanel(npc) {
  inspectedNpc = npc;
  updateMindPanelUI();
  mindPanel.style.display = 'block';
  notify(`🧠 Inspeccionando la mente de ${npc.brain.name}`);
}

function updateMindPanelUI() {
  if (!inspectedNpc || !inspectedNpc.brain) return;
  const b = inspectedNpc.brain;
  mindNpcName.innerText = `${b.name} (${inspectedNpc.type.toUpperCase()})`;
  mindNpcTitle.innerText = `${b.title} (Nivel ${b.level})`;
  mindNpcTrait.innerText = `Personalidad: ${b.trait.name}`;
  barFaith.style.width = `${b.faith}%`;
  barFear.style.width = `${b.fear}%`;
  barGreed.style.width = `${b.greed}%`;
  barEnergy.style.width = `${b.energy}%`;
  mindThoughtText.innerText = `"${b.currentThought}"`;
}

mindClose.addEventListener('click', () => {
  mindPanel.style.display = 'none';
  inspectedNpc = null;
});

btnBlessFaith.addEventListener('click', () => {
  if (!inspectedNpc) return;
  inspectedNpc.brain.faith = Math.min(100, inspectedNpc.brain.faith + 25);
  inspectedNpc.brain.fear = Math.max(0, inspectedNpc.brain.fear - 15);
  inspectedNpc.brain.setThoughtBubble("🕊️ ¡Siento la gracia y paz del Creador!", 160);
  sound.playAscend();
  vfx.addShockwave(inspectedNpc.x, inspectedNpc.y, 25, '#ffd700');
  updateMindPanelUI();
  notify(`✨ Has infundido fe y calma en ${inspectedNpc.brain.name}`);
});

btnScare.addEventListener('click', () => {
  if (!inspectedNpc) return;
  inspectedNpc.brain.fear = Math.min(100, inspectedNpc.brain.fear + 35);
  inspectedNpc.brain.setThoughtBubble("😱 ¡Qué presencia tan aterradora!", 160);
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

// Gestión de botones de herramientas
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;

    if (currentTool === 'possess') {
      notify("👁️ Haz click sobre cualquier aldeano o policía para poseer su cuerpo");
    } else if (currentTool === 'inspect') {
      notify("🧠 Haz click sobre cualquier aldeano para leer su mente y sensaciones");
    }
  });
});

// Eventos de Mouse
canvas.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  mousePos = { x: e.clientX, y: e.clientY };
  handlePointerAction();
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
  mousePos = { x: e.clientX, y: e.clientY };
  if (isMouseDown && mode === 'god') {
    handlePointerAction();
  }
});

// Lluvia divina masiva
function triggerRain() {
  sound.playWater();
  notify("🌧️ Has desatado una lluvia sagrada sobre la isla");
  for (let i = 0; i < 250; i++) {
    const rx = Math.floor(Math.random() * grid.width);
    const ry = Math.floor(Math.random() * 8);
    grid.set(rx, ry, ELEM.WATER);
  }
  // Reacción mental de los aldeanos
  npcs.forEach(n => n.brain.onDivineEvent('rain'));
}

// Modales y Paneles
const mapModal = document.getElementById('mapModal');
const mapClose = document.getElementById('mapClose');
const btnOpenMaps = document.getElementById('btnOpenMaps');
const chroniclesPanel = document.getElementById('chroniclesPanel');
const chroniclesClose = document.getElementById('chroniclesClose');
const btnOpenChronicles = document.getElementById('btnOpenChronicles');
const chroniclesList = document.getElementById('chroniclesList');

// Listener de nuevas noticias / dramas en vivo
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

// Modal de Mapas
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

    // Reiniciar población base
    npcs.length = 0;
    animals.length = 0;
    const midX = Math.floor(grid.width / 2) * 8;
    const midY = Math.floor(grid.height / 2) * 8;
    spawnNpc('cultivator', midX - 20, midY);
    spawnNpc('cultivator', midX + 20, midY);
    spawnNpc('child', midX - 10, midY + 15);
    spawnNpc('police', midX + 40, midY - 20);
    spawnAnimal('dog', midX - 5, midY);

    const title = card.querySelector('.map-card-title').innerText;
    chronicles.add(`🌍 ¡GÉNESIS! El mundo ha sido reformado en: ${title}`, 'divine');
    notify(`🌍 Mundo reformado: ${title}`);
  });
});

// Modal de Eras Históricas (Bíblica, 70s Bob Marley, 80s Carteles, 40s Guerra)
const eraModal = document.getElementById('eraModal');
const eraClose = document.getElementById('eraClose');
const btnOpenEras = document.getElementById('btnOpenEras');

btnOpenEras.addEventListener('click', () => {
  eraModal.style.display = 'block';
});
eraClose.addEventListener('click', () => {
  eraModal.style.display = 'none';
});

document.querySelectorAll('#eraModal .map-card').forEach(card => {
  card.addEventListener('click', () => {
    const eraKey = card.dataset.era;
    currentEra = ERAS[eraKey];
    btnOpenEras.innerText = `⏳ ${currentEra.name}`;
    eraModal.style.display = 'none';

    // Regenerar mundo acorde a la era histórica
    MapGenerator.generate(grid, currentEra.mapPreset);
    camera.setMode('god', null, grid.width, grid.height);

    npcs.length = 0;
    animals.length = 0;
    const midX = Math.floor(grid.width / 2) * 8;
    const midY = Math.floor(grid.height / 2) * 8;

    if (currentEra.id === 'biblical') {
      spawnNpc('prophet', midX - 10, midY);
      spawnNpc('fisherman', midX + 30, midY);
      spawnNpc('cultivator', midX - 40, midY + 20);
      spawnNpc('police', midX + 60, midY); // Centurión
      spawnNpc('child', midX, midY + 15);
      spawnAnimal('pig', midX + 20, midY + 20);
      spawnAnimal('dog', midX - 25, midY);
    } else if (currentEra.id === 'seventies') {
      spawnNpc('musician', midX - 10, midY);
      spawnNpc('hippie', midX + 25, midY);
      spawnNpc('healer', midX - 35, midY + 20);
      spawnNpc('cultivator', midX + 50, midY + 20);
      spawnNpc('child', midX, midY + 15);
      spawnAnimal('dog', midX - 5, midY);
    } else if (currentEra.id === 'forties') {
      spawnNpc('soldier', midX - 20, midY);
      spawnNpc('soldier', midX + 40, midY);
      spawnNpc('medic', midX - 10, midY + 15);
      spawnNpc('cultivator', midX + 10, midY - 20);
      spawnNpc('child', midX - 30, midY);
      spawnAnimal('dog', midX + 20, midY);
    } else {
      // 80s Carteles
      spawnNpc('boss', midX - 80, midY - 50);
      spawnNpc('cultivator', midX - 20, midY);
      spawnNpc('cultivator', midX + 40, midY - 20);
      spawnNpc('police', midX + 70, midY + 40);
      spawnNpc('child', midX - 30, midY + 10);
      spawnAnimal('dog', midX - 15, midY + 5);
      spawnAnimal('croc', midX + 110, midY + 60);
    }

    sound.playAscend();
    chronicles.add(`⏳ ¡CAMBIO DE ERA! El mundo entra en: ${currentEra.name}. ${currentEra.description}`, 'divine');
    notify(`⏳ ¡Era iniciada: ${currentEra.name}!`);
  });
});

// Panel de Crónicas
btnOpenChronicles.addEventListener('click', () => {
  chroniclesPanel.style.display = chroniclesPanel.style.display === 'flex' ? 'none' : 'flex';
});
chroniclesClose.addEventListener('click', () => {
  chroniclesPanel.style.display = 'none';
});

// Variables para poderes de Cupido y Discordia
let selectedLover = null;
let selectedRival = null;

// Acciones según herramienta
function handlePointerAction() {
  if (mode !== 'god') return;

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
  } else if (currentTool === 'fire') {
    grid.paint(tileX, tileY, ELEM.FIRE, brushRadius);
    sound.playFire();
  } else if (currentTool === 'lightning') {
    grid.strikeLightning(tileX, tileY);
    sound.playThunder();
    camera.triggerShake(7, 16);
    vfx.addShockwave(worldCoords.x, worldCoords.y, 45, '#ff4400');
    notify("⚡ ¡El castigo de Dios ha caído!");
    npcs.forEach(n => n.brain.onDivineEvent('lightning'));
  } else if (currentTool === 'rain') {
    triggerRain();
  } else if (currentTool === 'spawn_cultivator') {
    spawnNpc('cultivator', worldCoords.x, worldCoords.y);
    notify("👨‍🌾 Nuevo cultivador reclutado");
    isMouseDown = false;
  } else if (currentTool === 'spawn_child') {
    spawnNpc('child', worldCoords.x, worldCoords.y);
    notify("👶 Ha nacido un niño en la aldea");
    chronicles.add("👶 ¡BENDICIÓN! Un nuevo niño corretea alegremente por la isla.", "birth");
    isMouseDown = false;
  } else if (currentTool === 'spawn_animal') {
    const types = ['dog', 'pig', 'croc'];
    const selected = types[Math.floor(Math.random() * types.length)];
    spawnAnimal(selected, worldCoords.x, worldCoords.y);
    notify(`🐾 Ha aparecido un animal: ${selected.toUpperCase()}`);
    isMouseDown = false;
  } else if (currentTool === 'spawn_police') {
    spawnNpc('police', worldCoords.x, worldCoords.y);
    notify("👮 Patrulla policial desplegada");
    isMouseDown = false;
  } else if (currentTool === 'spawn_boss') {
    spawnNpc('boss', worldCoords.x, worldCoords.y);
    notify("👑 El Patrón ha llegado");
    isMouseDown = false;
  } else if (currentTool === 'love') {
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      if (!selectedLover) {
        selectedLover = clickedNpc;
        notify(`💘 Has flechado a ${clickedNpc.brain.name}. Ahora haz click en el segundo aldeano...`);
      } else if (selectedLover.id !== clickedNpc.id) {
        social.blessLove(selectedLover, clickedNpc);
        sound.playAscend();
        vfx.addShockwave(clickedNpc.x, clickedNpc.y, 35, '#ec4899');
        notify(`💖 ¡${selectedLover.brain.name} y ${clickedNpc.brain.name} se han enamorado!`);
        selectedLover = null;
      }
      isMouseDown = false;
    }
  } else if (currentTool === 'discord') {
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      if (!selectedRival) {
        selectedRival = clickedNpc;
        notify(`⚔️ Has marcado a ${clickedNpc.brain.name}. Haz click en su futuro rival...`);
      } else if (selectedRival.id !== clickedNpc.id) {
        social.sowDiscord(selectedRival, clickedNpc);
        sound.playAlert();
        vfx.addShockwave(clickedNpc.x, clickedNpc.y, 35, '#ef4444');
        notify(`⚡ ¡${selectedRival.brain.name} y ${clickedNpc.brain.name} ahora son enemigos mortales!`);
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
  notify(`✨ ¡Descendiendo del cielo para encarnar en ${npc.type.toUpperCase()}!`);

  // Ocultar HUD macro y panel de mente si estaba abierto
  topBar.style.display = 'none';
  bottomToolbar.style.display = 'none';
  if (mindPanel) mindPanel.style.display = 'none';
  inspectedNpc = null;

  // Reacción de asombro místico en aldeanos vecinos (testigos del milagro)
  npcs.filter(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) < 120)
      .forEach(n => n.brain.onDivineEvent('saw_possession'));

  // Iniciar vórtice celestial y onda de choque
  vfx.startPossession(
    npc.x + 8,
    npc.y + 8,
    // onImpact: Momento en que el rayo toca el cuerpo
    () => {
      mode = 'possessed';
      possessedNpc = npc;
      npc.isPossessed = true;
      camera.setMode('possessed', npc);

      // Activar HUD inmersivo de Zelda Minish Cap
      possessedHud.style.display = 'block';
      controlsHelp.style.display = 'block';
      ascendBtn.style.display = 'none';

      // Generar misión según la era histórica activa
      const quest = questSystem.generateQuestFor(npc, currentEra);
      questTitle.innerText = quest.title;
      questDesc.innerText = quest.description;
      updateQuestUI();
    },
    // onComplete: Secuencia de transición terminada
    () => {
      notify(`🎮 Tienes el control total. Cumple el encargo para liberar tu alma.`);
    }
  );
}

// Ascender al Cielo (Volver a Modo Dios)
function exitPossession() {
  if (possessedNpc) {
    possessedNpc.isPossessed = false;
    possessedNpc = null;
  }
  mode = 'god';
  sound.playAscend();
  camera.setMode('god', null, grid.width, grid.height);
  questSystem.clear();

  // Restaurar HUD
  topBar.style.display = 'flex';
  bottomToolbar.style.display = 'flex';
  possessedHud.style.display = 'none';
  controlsHelp.style.display = 'none';

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
    questDesc.innerHTML = `<span style="color:#4ade80">¡MISIÓN COMPLETADA!</span> Pulsa <b>[Q]</b> o haz click abajo para Ascender.`;
  }
}

// Bucle Principal del Juego (60 FPS)
let frameCount = 0;
function gameLoop() {
  frameCount++;

  // 1. Simulación Celular (Agua, fuego, plantas)
  grid.step();

  // 2. Control del Jugador en Posesión
  if (mode === 'possessed' && possessedNpc) {
    controller.update(
      possessedNpc,
      grid,
      (actionType, amt) => {
        const completed = questSystem.onAction(actionType, amt);
        if (actionType === 'deliver') {
          clandestineCash += amt * 150;
        }
        updateQuestUI();
        if (completed) {
          notify("✨ ¡Encargo cumplido! Tu alma ya puede ascender al cielo [Q]");
        }
      },
      () => {
        exitPossession();
      }
    );
  }

  // 3. Actualización de NPCs autónomos
  for (const npc of npcs) {
    npc.update(
      grid,
      npcs,
      8,
      (earned) => {
        clandestineCash += earned;
      },
      () => {
        policeAlert = Math.min(100, policeAlert + 15);
      }
    );
  }

  // Actualización de Fauna y Animales
  for (const animal of animals) {
    animal.update(grid, npcs, animals, 8);
  }

  // Sistema Social Emergente: Romance, Celos, Riñas y Crianza
  social.update(npcs, (babyX, babyY, pA, pB) => {
    const baby = spawnNpc('child', babyX, babyY);
    baby.parentId = pA.id;
    sound.playAscend();
    vfx.addShockwave(babyX, babyY, 25, '#f472b6');
  });

  // Descenso natural de alerta policial con el tiempo
  if (frameCount % 180 === 0 && policeAlert > 5) {
    policeAlert = Math.max(0, policeAlert - 2);
  }

  // 4. Actualización de VFX y Partículas
  vfx.update(camera);

  // Si el jugador está poseyendo y moviéndose, emitir polvo bajo los pies
  if (mode === 'possessed' && possessedNpc) {
    if (Math.random() < 0.2) {
      vfx.addHolySpark(possessedNpc.x, possessedNpc.y);
    }
  }

  // 5. Actualización de Cámara
  camera.update(mode === 'possessed' ? possessedNpc : null);

  // 6. Renderizado (incluye NPCs, Animales, VFX y retícula)
  const worldMouse = camera.screenToWorld(mousePos.x, mousePos.y);
  renderer.render(grid, npcs, animals, camera, possessedNpc, worldMouse, currentTool, brushRadius);

  // 6. Actualización de Estadísticas cada 30 frames
  if (frameCount % 30 === 0 && mode === 'god') {
    statPop.innerText = npcs.length;
    statCash.innerText = `$${clandestineCash}`;
    statAlert.style.width = `${policeAlert}%`;

    // Contar plantas maduras
    let crops = 0;
    for (let i = 0; i < grid.grid.length; i++) {
      if (grid.grid[i] === ELEM.PLANT_BLOOM) crops++;
    }
    statCrops.innerText = crops;

    // Actualizar panel de mente en tiempo real si está abierto
    if (inspectedNpc) {
      updateMindPanelUI();
    }
  }

  requestAnimationFrame(gameLoop);
}

// Iniciar Loop
requestAnimationFrame(gameLoop);
notify("👁️ Bienvenido al Ojo de Dios. ¡Siembra vida, riega agua y desata tu poder!");
