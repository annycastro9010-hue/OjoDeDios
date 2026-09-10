# 🏛️ Arquitectura Técnica de "Ojo de Dios"

Este documento detalla la estructura del motor de juego, las decisiones de arquitectura de software y el plan de escalabilidad para añadir más animaciones, sistemas de IA y misiones.

---

## 1. Filosofía de Diseño: Dual-Layer Engine (Macro + Micro)

Uno de los mayores problemas al combinar un simulador masivo como *WorldBox* con el control en primera persona cenital como *Zelda: The Minish Cap* es el **rendimiento**:
- Si calculas física por colisión continua y visión por rayos para 500 NPCs a la vez, el juego se vuelve lento.
- Si reduces el mundo a una simple sala cerrada, pierdes la magia del sandbox donde cada acción divina afecta al ecosistema.

### Solución Arquitectónica implementada:
```
[ Capa Divina (Macro) ]
    │  - Autómata celular continuo (Agua, Tierra, Semillas, Fuego, Humo).
    │  - NPCs en modo "Ligero" (State Machine discreta: cosechar -> almacenar -> deambular).
    │  - Actualización global de bajo consumo de CPU.
    │
[ Matriz de Transformación de Cámara (Zoom Lerp) ]
    │  - Interpolación continua entre escala 0.7x (Cielo) y 3.0x (Tierra).
    │
[ Capa Inmersiva (Micro - Posesión Zelda) ]
       - Entrada directa WASD / Teclado para el NPC poseído.
       - Cálculo de conos de visión y linternas (FOV) de policías cercanos.
       - Mini-misión procedural contextual generada para el rol poseído.
       - Sistema de desposesión y ascensión celestial.
```

---

## 2. Componentes del Sistema

### A. Simulación Celular Reactiva (`src/sim/`)
- **`elements.js`:** Registra cada elemento con sus banderas (`isSolid`, `isLiquid`, `flammable`, densidad y paleta de color).
  - Incluye `ELEM.CHASM` (fallas abisales que parten el suelo) y `ELEM.RUBBLE` (escombros generados por colapso estructural).
- **`grid.js`:** Utiliza `Uint8Array` contiguos en memoria para representar el mapa.
  - **Física de fluidos y agua real:** El agua cae por gravedad, busca equilibrio lateral e interactúa con otros biomas.
  - **Química de Lava y Agua:** El contacto entre agua y magma provoca petrificación instantánea en roca volcánica (`STONE`/`RUBBLE`) y emite nubes de vapor/humo (`SMOKE`) con siseo térmico.
  - **Física Granular de Arena (`SAND`):** Cae por gravedad en el aire, se hunde en el agua desplazando el fluido hacia arriba y se desliza en diagonales formando taludes naturales.
  - **Física de absorción:** Cuando el agua toca tierra, la fertiliza (`FERTILE_DIRT`).
  - **Botánica:** Las semillas germinan al contacto con humedad y crecen en dos fases: brote tierno y flor madura cosechable (`PLANT_BLOOM`).
  - **Combustión Realista:** El fuego consume vegetación, semillas y troncos de madera (`WOOD`), produciendo brasas duraderas, humo ascendente y cenizas (`ASH`), y se extingue al tocar agua.
  - **Física de Fractura Tectónica (`triggerEarthquake`):** Traza grietas fractales en tiempo real desde un epicentro, desgarrando celdas de tierra en abismos, demoliendo estructuras de madera/muros en escombros y levantando polvaredas.
  - **Colisiones de Obstáculos Sólidos:** Los muros (`BUILDING`), peñascos (`STONE`), escombros y abismos bloquean el paso físico de personajes y fauna mediante deslizamiento de eje.


### B. Sistema de NPCs y Vida Autónoma (`src/entities/`)
- Cada NPC cuenta con:
  - **Inventario dinámico (`cargo`):** Puede llevar paquetes recolectados.
  - **Rutas y economía:** Los cultivadores localizan plantas listas, las cosechan y las transportan a los puntos de entrega inyectando recursos a la comunidad.
  - **Conos de visión de linterna:** Policías y patrulleros de cuadrante proyectan campos de visión angular (FOV) que persiguen o detienen a sospechosos.
  - **Roles Memificables de la Realidad:**
    - `police_cuadrante`: Patrulla la trocha, cobra "pa' la gaseosa" e inmoviliza infractores.
    - `guerrillero`: Habita campamentos en la selva, cuida el sancocho comunal y monta retenes.
    - `mototaxista`: Piloto suicida que hace piques y huye a toda velocidad del cuadrante.
    - `vendedor`: Pregona con megáfono vendiendo aguacates y mazamorra.
    - `vecina_chismosa`: Vigila el vecindario y espanta sospechosos a escobazos.
    - `alcalde`: Saluda a las masas y reparte tamales por votos.
  - **Habilidades Activas en Modo Posesión:** El controlador mapea la tecla `ESPACIO` / botón de acción para ejecutar la habilidad única del personaje encarnado.

### C. Motor de Civilización, Supervivencia y Gobierno (`src/world/civilization.js` & `src/ai/brain.js`)
- **Supervivencia Biológica Individual:** Cada NPC gestiona indicadores en tiempo real de hambre (`hunger`), salud (`health`), sed y moral. Cuando el hambre aprieta, consumen raciones del almacén comunal; ante hambrunas prolongadas, sufren inanición.
- **Economía y Graneros Comunales:** Gestión activa de madera (`WOOD`), piedra (`STONE`), comida (`FOOD`) y sabiduría (`KNOWLEDGE`). Se erigen Graneros Centrales para conservar cosechas.
- **Árbol de Descubrimientos Científicos (10 Tecnologías):** Dominio del Fuego, Herramientas Líticas, Agricultura Primitiva, Graneros Comunales, Medicina Botánica, Canales de Irrigación, Mampostería Sólida, Código de Leyes, Templo Sagrado y Empalizadas Defensivas.
- **Sistema Político y Elección Orgánica de Líderes:**
  - 4 Formas de Gobierno vivas: *Consejo Tribal de Ancianos*, *Teocracia Sagrada*, *Monarquía y Corona Real* y *República de Ciudadanos Libres*.
  - Elección popular del Líder (representado con corona dorada 👑 sobre su sprite).
  - Decretos y Leyes activas: Racionamiento de Alimentos en crisis, Tributo de Obras Públicas, Culto Sagrado y Guardia Cívica.
  - Dinámica de Estabilidad Social: Descontento popular y revueltas ciudadanas si hay escasez o tiranía.

### D. Motor de Eras Históricas, Escenografía y Decorados Vivos (`src/world/eras.js`, `src/world/mapGenerator.js` & `src/render/renderer.js`)
- **Renderizado Procedural Temático por Era (`renderEraLandmarks`):**
  - **Comuna 70s (Woodstock / Jamaica):** Suelo de pradera verde vibrante poblada de flores psicodélicas procedimentales, escenario de concierto de madera de cedro con columnas dobles de altavoces/amplificadores, gran bandera Rasta (rojo, amarillo, verde), pedestal cromado con micrófono dorado, notas musicales flotantes (`♪ ♫`), tipis y carpas hippies con el símbolo de la paz (`☮`), y fogata comunitaria rodeada de flores. Bob Marley posicionado en el centro exacto del escenario frente al micrófono.
  - **Realidad Macondo 2026:** Selva espesa, trochas de barro rojizo con huellas, río caudaloso navegable con canoas de madera, cambuche guerrillero con toldo camuflado y paila gigante de sancocho, retén de barricada y llantas en la trocha, y tienda comunitaria con mesa de billar verde profesional y canastas de cerveza.
  - **Albores Bíblicos:** Pradera fértil y dunas doradas, río sagrado de las aguas vivas con puentes rústicos, altar de piedra escalonada con el Arca de la Alianza dorada y humo de incienso ascendente, y cabañas de arcilla.
  - **Imperio Clandestino de los 80s:** Mansión de estilo hacienda con tejados de terracota, piscina azulejada de agua azul con sombrilla de playa y tumbonas, pista de aterrizaje clandestina de asfalto con señalización amarilla, y hangar con avioneta bimotor de contrabando con hélices en rotación continua.
  - **Frente Bélico de los 40s:** Búnker de hormigón armado, trincheras con parapetos de sacos de arena y alambradas de púas cruzadas, y hospital militar de campaña con carpa y emblema de la Cruz Roja.
- **Adaptabilidad Responsiva y Eventos Táctiles:** Normalización de coordenadas con soporte simultáneo para mouse en PC y toques `touchstart`/`touchmove` en smartphones y tablets.

### E. Motor de Animación Desacoplado (`src/render/animationManager.js`)
El juego separa estrictamente la **lógica física** de la **representación visual**:
- **Doble soporte (Procedural + SpriteSheets de artistas):**
  - Si un pixel artist te entrega una hoja de sprites `.png` (hecha en Aseprite, Photoshop, etc.), simplemente la registras con:
    ```javascript
    animManager.registerSheet('cultivator', './assets/cultivator_walk.png', 16, 16, {
      walk_down: [0, 1, 2, 3],
      walk_up: [4, 5, 6, 7],
      walk_left: [8, 9, 10, 11],
      walk_right: [12, 13, 14, 15]
    });
    ```
  - Si no hay imagen externa, el motor usa su generador nativo de alta fidelidad estilo **The Minish Cap** con ciclo completo de marcha en 4 direcciones, balanceo de brazos opuesto a las piernas, inclinación de cabeza al pisar, notas musicales flotantes para artistas y sombra elíptica de suelo.

### D. Secuencia Mágica de Posesión y VFX (`src/render/fx.js`)
- Inspirado en la reducción mágica de Link en *The Minish Cap*:
  1. **Rayo Celestial:** Haz de luz que une el cielo con el personaje objetivo.
  2. **Vórtice Espiral:** Partículas de polvo de oro girando y colapsando hacia el pecho del NPC.
  3. **Onda de Choque y Sacudida de Pantalla (Screen Shake):** Al impactar la encarnación, se emite una onda circular dorada, bocanadas de polvo y un golpe de cámara (*screen punch*).
  4. **Chispas y Aura Sagrada:** Partículas flotantes mientras mantengas la posesión.

### E. Audio Procedural (`src/audio/soundFX.js`)
- Sintetizado en tiempo real con Web Audio API:
  - Arpegios descendentes para el vórtice místico.
  - Sub-graves y chispas al aterrizar el alma en el cuerpo.
  - Alertas estilo Metal Gear / Zelda y acordes celestiales mayores al ascender.

---

## 3. Plan para Futuras Actualizaciones

1. **Ciclo Día/Noche dinámico:**
   - La patrulla policial duplica el peligro al usar linternas en la oscuridad.
2. **Nuevos Roles de Posesión:**
   - *Policía:* Infiltrarte o atrapar a los capos.
   - *El Patrón:* Conducir lanchas rápidas en el muelle.
   - *Profeta:* Realizar milagros (caminar sobre el agua convirtiéndola temporalmente en hielo, multiplicar recursos).
3. **Guardado en LocalStorage:**
   - Persistir el estado de la isla y los logros de posesión.
