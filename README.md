# 👁️ Ojo de Dios: Sandbox & Posesión Clandestina

> Un simulador divino web inspirado en **WorldBox**, **The Legend of Zelda: The Minish Cap** y dinámicas emergentes clandestinas al estilo **Schedule I**.

Juega como Dios: manipula la física celular de los elementos (tierra, agua, semillas, fuego, rayos), observa cómo tus aldeanos y cárteles prosperan de forma autónoma, y en cualquier momento, **desciende del cielo y posee el cuerpo de cualquier mortal** para cumplir misiones de sigilo, contrabando o supervivencia antes de poder liberar tu alma y ascender de nuevo al trono celestial.

---

## 🎮 Modos de Juego y Controles

### 1. Modo Dios (Macro Sandbox)
* **💧 Agua:** Riega la tierra, crea costas y apaga incendios.
* **🟫 Tierra:** Modela el terreno de la isla.
* **🌿 Semilla:** Siémbrala en tierra fértil; al recibir agua brotará hierba clandestina madura.
* **🔥 Fuego:** Incendia cultivos y madera, generando humo y cenizas.
* **⚡ Rayo:** Castigo celestial instantáneo que detona el área.
* **🌋 Terremoto (Cataclismo Geológico):** Sacude violentamente la pantalla, raja la tierra abriendo fallas abisales (`CHASM`), colapsa estructuras en escombros (`RUBBLE`) y desata el pánico colectivo en toda la isla.
* **🌧️ Lluvia:** Desata un diluvio que riega toda la isla.
* **Spawners:** Genera Aldeanos, Niños, Animales o **Personajes de la Realidad** (Policía de Cuadrante, Guerrillero, Mototaxista, Vendedor, Doña Gloria o el Alcalde).
* **💘 Amor (Flecha de Cupido):** Haz click en un aldeano y luego en otro para flecharlos y unirlos en matrimonio/romance.
* **⚔️ Cizaña (Discordia Divina):** Haz click en dos aldeanos para sembrar el odio y convertirlos en enemigos mortales que se agarran a puñetazos.
* **🪵 Madera y 🏡 Choza:** Coloca madera para los artesanos o levanta los cimientos de un nuevo hogar.
* **👑 Sistema de Evolución y Civilización Autónoma (Estilo WorldBox):**
  - **Recolección y Recursos Vivos:** Los aldeanos talan madera (`🪵`), pican piedra (`🪨`), cosechan trigo y pescan (`🍞`) para su comunidad.
  - **Construcción Autónoma:** Al acumular recursos, los aldeanos eligen terrenos planos y **construyen sus propias chozas, casas de madera o piedra, senderos y altares ceremoniales**.
  - **Sabiduría y Aprendizaje (`💡`):** Los ancianos y profetas transmiten conocimientos a los niños y adultos; la tribu descubre la agricultura, la mampostería, la domesticación animal y la teología, evolucionando de **Tribu Primitiva** a **Aldea Floreciente** y **Reino Próspero**.
  - **Domesticación Animal:** Los perros y cerdos aprenden con el trato humano; los perros siguen a sus dueños con afecto (`❤️ ¡Guau!`) y vigilan las fogatas.
* **⌛ Mapas Arquitectónicos Temáticos y Lore Histórico:**
  - 🇨🇴 **Realidad Macondo (Selva, Retenes y Cuadrante - 2026):** Trochas de barro, río serpenteante con canoas, cambuche guerrillero con sancocho en la selva, retenes clandestinos, patrullas del cuadrante, tiendas con billar y mototaxis suicidas.
  - 📜 **Albores Bíblicos (Tras Caín y Abel):** Adán y Eva en su hogar ancestral, Caín labrando la tierra buscando redención, Abel cuidando rebaños, profetas orando ante el Monte del Altar Sagrado y el Río de la Vida.
  - ☮️ **Comuna de Paz (Años 70 - Bob Marley):** Gran escenario musical de madera, fogata de la paz y comuna de carpas y huertos libres.
  - 💰 **Imperio Clandestino (Años 80):** Hacienda del Patrón con piscina privada de azulejos, pista de aterrizaje clandestina y muelles secretos.
  - ⚔️ **Frente de Resistencia (Años 40):** Búnker de mando fortificado, red de trincheras en zigzag, hospital militar de campaña y partisanos.
* **📱 Adaptabilidad Total y Pantallas Táctiles:** El juego escala dinámicamente en cualquier pantalla (celulares verticales, tablets o monitores panorámicos 4K), con soporte táctil nativo para jugar con los dedos en móviles.

### 2. Vida Social, Crianza y Emociones (`src/social/relations.js` & `src/ai/brain.js`)
* **Familias y Crianza:** Las parejas establecidas pueden tener bebés. Los niños corretean, juegan imitando a los adultos y al cabo del tiempo crecen convirtiéndose en campesinos adultos.
* **Dramas y Traiciones:** Si un aldeano coquetea con la pareja de otro, se desatan celos y peleas callejeras.
* **Fauna y Animales:** Los perros siguen y defienden a sus dueños ladrando a las patrullas policiales; los cerdos pastan y los caimanes acechan en las aguas.
* **Bocadillos de pensamiento en vivo:** Verás pequeños diálogos sobre sus cabezas con lo que sienten (*"¡Dios mío, qué fue ese trueno!"*, *"Si entrego esto compro mi terreno"*, *"Bendita lluvia celestial..."*).

### 3. Modo Inmersivo (Zelda: The Minish Cap)
La cámara hace un zoom cinemático continuo desde el cielo hasta situarse detrás de tu personaje con vista cenital pixel-art:
* **WASD / Flechas:** Moverse por el mundo.
* **ESPACIO / Tecla E:** Interactuar y **Habilidad Especial Activa según el Rol**:
  * **👮‍♂️ Policía de Cuadrante:** *¡Pedir pa' la gaseosa!* Requisa a mototaxis o sospechosos, cobra la mordida con campanillas de dinero y confisca mercancía.
  * **🛵 Mototaxista Suicida:** *¡Pique Trochero!* Acelerón supersónico con estela de humo y rugido de motor 2 tiempos.
  * **📢 Vendedor Ambulante:** *¡Megáfono a Todo Volumen!* Lanza el pregón de aguacates aturdiendo a las patrullas y atrayendo compradores.
  * **🪖 Guerrillero del Monte:** *¡Olla Comunitaria!* Prende la fogata comunitaria con sancocho trifásico para el pueblo.
  * **👵 Doña Gloria (Vecina):** *¡Escobazo Limpio!* Pega escobazos y espanta a los malandrines del vecindario.
  * **🎩 Alcalde en Campaña:** *¡Tamal por Voto!* Lanza tamales calientes para calmar a las masas y ganar seguidores.
  * **👨‍🌾 Aldeano / Cultivador:** Cosechar plantas maduras y entregar cargamentos en almacenes o muelles.
* **Esquivar la Patrulla Policial:** Los policías patrullan con conos de luz y linternas. Si te ven con cargamento, sonará la alarma y te perseguirán.
* **Q / ESC / Botón "Ascender":** Al cumplir la misión o desear salir, tu alma se purifica con luz celestial y regresas al trono divino.

---

## ⚡ Stack Tecnológico

* **Motor:** HTML5 Canvas 2D nativo + JavaScript ES Modules modular.
* **Tooling:** Vite para compilación instantánea y desarrollo local en milisegundos.
* **Física:** Autómata Celular reactivo de fluidos y combustión en arrays tipados (`Uint8Array`) a 60 FPS estables.
* **Audio:** Sintetizador de efectos retro de 8/16 bits con Web Audio API puro (cero dependencias externas).
* **Despliegue:** GitHub Actions automático hacia **GitHub Pages**.

---

## 🚀 Cómo Ejecutar en Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/annycastro9010-hue/OjoDeDios.git
   cd OjoDeDios
   ```

2. Instala dependencias y arranca el servidor de desarrollo:
   ```bash
   npm install
   npm run dev
   ```

3. Abre el enlace local que muestra la terminal (por ejemplo: `http://localhost:3000`).

---

## 🌐 Publicación en GitHub Pages

El proyecto incluye un flujo de trabajo automatizado en `.github/workflows/deploy.yml`. Cada vez que hagas `git push origin main`, GitHub compilará el juego y lo publicará automáticamente.

Para activar GitHub Pages en tu repositorio:
1. Ve a tu repositorio en GitHub: `https://github.com/annycastro9010-hue/OjoDeDios`
2. Haz click en **Settings** -> **Pages**.
3. En **Build and deployment > Source**, selecciona **GitHub Actions**.
4. ¡Tu juego estará en línea en: `https://annycastro9010-hue.github.io/OjoDeDios/`!
