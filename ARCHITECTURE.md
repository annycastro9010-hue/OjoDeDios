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
- **`grid.js`:** Utiliza `Uint8Array` contiguos en memoria para representar el mapa.
  - **Física de fluidos:** El agua cae por gravedad y se dispersa diagonal y horizontalmente.
  - **Física de absorción:** Cuando el agua toca tierra, la fertiliza (`FERTILE_DIRT`).
  - **Botánica:** Las semillas germinan al contacto con humedad y crecen en dos fases: brote tierno y flor madura cosechable (`PLANT_BLOOM`).
  - **Combustión:** El fuego se propaga a vegetación vecina, consume combustible, emite humo ascendente y deja ceniza.

### B. Sistema de NPCs y Vida Autónoma (`src/entities/`)
- Cada NPC cuenta con:
  - **Inventario dinámico (`cargo`):** Puede llevar paquetes recolectados.
  - **Rutas y economía:** Los cultivadores localizan plantas listas, las cosechan y las transportan a los puntos de entrega (Almacén del Patrón y Muelle) inyectando dinero en la economía insular.
  - **Conos de visión de linterna:** Los policías proyectan un campo de visión angular (FOV). Si un sospechoso o el jugador ingresa al haz de luz con cargamento ilegal, se dispara el estado de persecución con alerta sonora.

### C. Motor de Animación Desacoplado (`src/render/animationManager.js`)
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
  - Si no hay imagen externa, el motor usa su generador nativo de alta fidelidad estilo **The Minish Cap** con ciclo completo de marcha en 4 direcciones, balanceo de brazos opuesto a las piernas, inclinación de cabeza al pisar y sombra elíptica de suelo.

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
