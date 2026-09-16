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
  - **Física de Fluidos Isótropa (Top-Down):** En perspectiva cenital divina, el agua y la lava se difunden de forma equilibrada e isotrópica sin sesgo artificial hacia el sur. El agua hidrata la tierra circundante (`FERTILE_DIRT`), apaga incendios y drena en abismos tectónicos.
  - **Química de Lava y Agua:** El contacto entre agua y magma provoca petrificación instantánea en roca volcánica (`STONE`/`RUBBLE`) y emite nubes de vapor/humo (`SMOKE`) con siseo térmico.
  - **Arena y Terreno Firme (`SAND`):** La arena es un bloque terrestre sólido y estable (playas, desiertos, dunas). No sufre gravedad artificial hacia abajo ni se hunde en el mar, manteniendo las costas y desiertos íntegros.
  - **Física de Absorción y Humedad:** Cuando el agua toca tierra, la fertiliza (`FERTILE_DIRT`) en cualquier dirección.
  - **Botánica:** Las semillas germinan al contacto con humedad y crecen en dos fases: brote tierno y flor madura cosechable (`PLANT_BLOOM`).
  - **Combustión Realista:** El fuego consume vegetación, semillas y troncos de madera (`WOOD`), produciendo brasas duraderas, humo ascendente y cenizas (`ASH`), y se extingue al tocar agua.
  - **Física de Fractura Tectónica (`triggerEarthquake`):** Traza grietas fractales en tiempo real desde un epicentro, desgarrando celdas de tierra en abismos, demoliendo estructuras de madera/muros en escombros y levantando polvaredas.
  - **Colisiones de Obstáculos Sólidos:** Los muros (`BUILDING`), peñascos (`STONE`), escombros y abismos bloquean el paso físico de personajes y fauna mediante deslizamiento de eje.


### B. Sistema de NPCs, Vida Autónoma y Emociones (`src/entities/` & `src/ai/brain.js`)
- Cada NPC cuenta con:
  - **Inventario dinámico (`cargo`):** Puede llevar paquetes recolectados.
  - **Rutas, Trilladas y Economía:** Desgaste progresivo de terreno por pisadas continuas (`grid.recordFootstep`); caminar sobre trilladas consolidadas (`ELEM.ROAD`) otorga +20% de velocidad y reduce el gasto calórico.
  - **Energía Vital, Fatiga y Descanso:** Las labores consumen energía. Si la energía desciende de 20%, el NPC entra en estado de descanso/sueño (`💤`) junto a fogatas o chozas, recuperando energía y salud.
  - **Personalidades y Emociones Humanas Dinámicas:**
    - `gallardo`: No teme a desastres; defiende niños, combate peligros y sofoca fuegos pisoteándolos con tierra (`🦁`).
    - `asustadizo`: Pánico súbito ante fenómenos extraños (`😱`), huyendo y alertando a la comarca.
    - `mistico`: Profetiza, reza ante milagros y consagra ritos (`✨`).
    - `innovador`: Formula tecnologías y experimentos con materiales (`💡`).
    - `holgazan`: Descansa a la sombra con siestas largas (`💤`).
    - `bochinchero`: Difunde chismes y rumores vecinales (`🗣️`).
  - **Fauna Autónoma y Especie Felina (`src/entities/animals.js`):**
    - Perros (`dog`), Cerdos (`pig`), Caimanes (`croc`) y **Gatos (`cat`)**.
    - Los gatos trepan, cazan ratones en trigales, toman siestas al sol y ronronean junto a los humanos (`prrr`), aliviando su miedo y fatiga.
    - **Sociedades y Jerarquías Animales:** Elección orgánica de Líderes Alfas coronados (`👑`) para manadas caninas y dinastías felinas.
  - **Conos de visión de linterna:** Policías y patrulleros de cuadrante proyectan campos de visión angular (FOV) que persiguen o detienen a sospechosos.
  - **Roles Memificables de la Realidad:**
    - `police_cuadrante`: Patrulla la trocha, cobra "pa' la gaseosa" e inmoviliza infractores.
    - `guerrillero`: Habita campamentos en la selva, cuida el sancocho comunal y monta retenes.
    - `mototaxista`: Piloto suicida que hace piques y huye a toda velocidad del cuadrante.
    - `vendedor`: Pregona con megáfono vendiendo aguacates y mazamorra.
    - `vecina_chismosa`: Vigila el vecindario y espanta sospechosos a escobazos.
    - `alcalde`: Saluda a las masas y reparte tamales por votos.
  - **Habilidades Activas en Modo Posesión:** El controlador mapea la tecla `ESPACIO` / botón de acción para ejecutar la habilidad única del personaje encarnado.

### C. Motor de Civilización, Religión Dinámica y Reactividad Divina (`src/world/civilization.js`)
- **Acelerador de Tiempo Divino (0x, 1x, 2x, 5x, 10x):** Permite ejecutar múltiples subpasos de simulación física y cognitiva por cuadro manteniendo 60 FPS estables de renderizado, permitiendo que generaciones enteras evolucionen en minutos.
- **Religión Dinámica Emergente:**
  - Panteón vivo que muta según los actos del jugador:
    - Actos de Gracia (Lluvia, Maná, Árboles) -> *Culto del Proveedor Celeste* (Misericordioso, festivo, devoción amorosa).
    - Actos de Castigo (Rayos, Terremotos, Fuego) -> *Culto del Juicio Ardiente* (Dios de la Cólera, sacrificios y templos de piedra).
    - Posesión Divina -> *Orden del Espíritu Encarnado*.
- **Supervivencia Biológica Individual:** Cada NPC gestiona hambre (`hunger`), salud (`health`), sed y moral. Cuando el hambre aprieta, consumen raciones del almacén comunal; ante hambrunas prolongadas, sufren inanición.
- **Economía y Graneros Comunales:** Gestión activa de madera (`WOOD`), piedra (`STONE`), comida (`FOOD`) y sabiduría (`KNOWLEDGE`). Se erigen Graneros Centrales para conservar cosechas.
- **Árbol de Descubrimientos Científicos (10 Tecnologías):** Dominio del Fuego, Herramientas Líticas, Agricultura Primitiva, Graneros Comunales, Medicina Botánica, Canales de Irrigación, Mampostería Sólida, Código de Leyes, Templo Sagrado y Empalizadas Defensivas.
- **Sistema Político, Facciones y Elección Orgánica de Líderes:**
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

### E. Motor de Profundidad Espacial 2.5D y Oclusión Cenital (`src/render/renderer.js` & `src/sim/grid.js`)
Inspirado directamente en la arquitectura visual de *The Legend of Zelda: The Minish Cap*:
1. **Volumetría de Copas y Troncos de Árboles (`ELEM.TREE`):**
   - La física sólida de colisión se confina estrictamente a la base del tronco (`8x6px`), permitiendo que el jugador y los NPCs caminen detrás de la copa sin chocar.
   - Las copas esféricas de 3 niveles se dibujan con sombra inferior oscura, lóbulos medios verdes y copetes iluminados por la luz del sol matutino.
2. **Pipeline de Renderizado Unificado Y-Sorted:**
   - Para resolver la oclusión tridimensional, los personajes (`npc.y + 13`), animales (`animal.y + 12`) y copas de árboles (`tree.y + 7`) se combinan en una única lista (`renderList`) y se ordenan de menor a mayor en el eje Y.
   - Si un personaje camina detrás de un árbol (`y < tree.y`), se dibuja primero y la copa lo cubre naturalmente; si camina por delante (`y > tree.y`), se dibuja después y se superpone al tronco.
3. **Acantilados y Riscos de Piedra Multinivel (`ELEM.CLIFF` & `ELEM.LADDER`):**
   - Cada bloque de risco proyecta un borde iluminado superior de 2px, una fachada vertical de sillares de piedra con juntas oscuras y una sombra profunda arrojada sobre el suelo inferior.
   - Las escaleras de madera (`ELEM.LADDER`) suprimen la solidez del risco, permitiendo transitar entre pisos superiores e inferiores sin interrupciones.
4. **Canales de Agua Hundidos con Oclusión en Pies:**
   - Los límites norte de las baldosas de agua dibujan una sombra translúcida de 2px (`rgba(15, 23, 42, 0.45)`), produciendo el efecto óptico de canal excavado.
   - Cuando un personaje entra al agua, sus pies quedan sumergidos (`submergeY = 4px`) y se generan ondas circulares concéntricas en la superficie.

### F. Motor de Animación Desacoplado (`src/render/animationManager.js`)
El juego separa estrictamente la **lógica física** de la **representación visual**:
- **Soporte Dual Activo (Hojas de Artista Minish Cap + Fallback Procedural):**
  - Integra directamente las 2 hojas oficiales de sprites (`public/sprites/sheet1_minish.jpg` y `sheet2_minish.jpg`) procesadas en tiempo real con **Chroma Key dinámico** para remover el fondo verde y habilitar transparencia alpha pura.
  - Mapeo completo de coordenadas para:
    - **Hoja 1:** Bob Marley (`musician`), Don Mario (`vendedor`), Doña Gloria (`vecina_chismosa`), El Brayan (`mototaxista` a pie y en moto), El Patrón (`boss`), Moisés (`prophet`), Link (`hero`).
    - **Hoja 2:** Patrullero Gómez (`police_cuadrante`), Comandante Tiro-Loco (`guerrillero`), Doctor Promesas (`alcalde`), Soldado (`soldier`), Enfermera (`medic`), Perro labrador (`dog`), Cerdito (`pig`), Caimán (`croc`).
  - Si las imágenes están en proceso de carga o en red offline, el motor activa automáticamente su generador procedural nativo de 3 tonos con parpadeo procedural de ojos y respiración en reposo.

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
