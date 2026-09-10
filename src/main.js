import { ELEM } from './sim/elements.js';
import { SimulationGrid } from './sim/grid.js';
import { Camera } from './player/camera.js';
import { GameRenderer } from './render/renderer.js';
import { NPC } from './entities/npc.js';
import { PlayerController } from './player/controller.js';
import { QuestSystem } from './quests/questSystem.js';
import { sound } from './audio/soundFX.js';
import { vfx } from './render/fx.js';

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
let brushRadius = 2;
let isMouseDown = false;
let mousePos = { x: 0, y: 0 };
let nextNpcId = 1;

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

// Spawns iniciales en posiciones clave
const cx = Math.floor(grid.width / 2) * 8;
const cy = Math.floor(grid.height / 2) * 8;
spawnNpc('boss', cx - 80, cy - 50); // El Patrón en el almacén
spawnNpc('cultivator', cx - 20, cy);
spawnNpc('cultivator', cx + 40, cy - 20);
spawnNpc('cultivator', cx - 50, cy + 30);
spawnNpc('police', cx + 70, cy + 40);
spawnNpc('police', cx - 100, cy + 10);

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

// Gestión de botones de herramientas
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;

    if (currentTool === 'possess') {
      notify("👁️ Haz click sobre cualquier aldeano o policía para poseer su cuerpo");
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
}

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
  } else if (currentTool === 'rain') {
    triggerRain();
  } else if (currentTool === 'spawn_cultivator') {
    spawnNpc('cultivator', worldCoords.x, worldCoords.y);
    notify("👨‍🌾 Nuevo cultivador reclutado en la isla");
    isMouseDown = false;
  } else if (currentTool === 'spawn_police') {
    spawnNpc('police', worldCoords.x, worldCoords.y);
    notify("👮 Patrulla policial desplegada");
    isMouseDown = false;
  } else if (currentTool === 'spawn_boss') {
    spawnNpc('boss', worldCoords.x, worldCoords.y);
    notify("👑 El Patrón ha llegado");
    isMouseDown = false;
  } else if (currentTool === 'possess') {
    // Buscar el NPC más cercano al click
    const clickedNpc = npcs.find(n => Math.hypot((n.x + 8) - worldCoords.x, (n.y + 8) - worldCoords.y) < 22);
    if (clickedNpc) {
      enterPossession(clickedNpc);
    }
  }
}

// Iniciar Secuencia Mágica de Posesión (Estilo The Minish Cap)
function enterPossession(npc) {
  notify(`✨ ¡Descendiendo del cielo para encarnar en ${npc.type.toUpperCase()}!`);

  // Ocultar HUD macro
  topBar.style.display = 'none';
  bottomToolbar.style.display = 'none';

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

      // Generar misión
      const quest = questSystem.generateQuestFor(npc);
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

  // 6. Renderizado
  const worldMouse = camera.screenToWorld(mousePos.x, mousePos.y);
  renderer.render(grid, npcs, camera, possessedNpc, worldMouse, currentTool, brushRadius);

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
  }

  requestAnimationFrame(gameLoop);
}

// Iniciar Loop
requestAnimationFrame(gameLoop);
notify("👁️ Bienvenido al Ojo de Dios. ¡Siembra vida, riega agua y desata tu poder!");
