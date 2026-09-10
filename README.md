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
* **🌧️ Lluvia:** Desata un diluvio que riega toda la isla.
* **Spawners:** Genera Campesinos/Jíbaros, Policías de patrulla, Niños/Aldeanitos, Animales (Perros, Cerdos, Caimanes) o al mismísimo Patrón.
* **💘 Amor (Flecha de Cupido):** Haz click en un aldeano y luego en otro para flecharlos y unirlos en matrimonio/romance.
* **⚔️ Cizaña (Discordia Divina):** Haz click en dos aldeanos para sembrar el odio y convertirlos en enemigos mortales que se agarran a puñetazos.
* **🧠 Mente (Inspección Psicológica):** Haz click en este botón y selecciona a cualquier aldeano para ver su nombre, personalidad, barras de Fe, Miedo, Codicia, Energía y su pensamiento íntimo en vivo. ¡Puedes infundirle fe o aterrorizarlo con un botón!
* **📜 Chismes / Crónicas en Vivo:** Abre el periódico de la isla con el registro histórico de romances, traiciones, peleas callejeras y nacimientos.
* **🗺️ Mapas del Mundo:** Elige entre 4 mundos distintos:
  * 🌌 **Génesis Primordial:** Océano infinito vacío. Eres Dios en el inicio de los tiempos y moldeas la tierra desde cero.
  * 🏞️ **El Valle Sagrado:** Río caudaloso, puentes de madera, casonas y taberna.
  * 🌋 **Tierras de Azufre:** Volcán activo, cráteres de fuego, ceniza y riscos oscuros.
  * 🏝️ **Isla Clandestina:** Archipiélago con muelles secretos y almacenes del cártel.
* **👁️ POSEER:** Haz click en este botón y luego selecciona a cualquier personaje para entrar en su cuerpo.

### 2. Vida Social, Crianza y Emociones (`src/social/relations.js` & `src/ai/brain.js`)
* **Familias y Crianza:** Las parejas establecidas pueden tener bebés. Los niños corretean, juegan imitando a los adultos y al cabo del tiempo crecen convirtiéndose en campesinos adultos.
* **Dramas y Traiciones:** Si un aldeano coquetea con la pareja de otro, se desatan celos y peleas callejeras.
* **Fauna y Animales:** Los perros siguen y defienden a sus dueños ladrando a las patrullas policiales; los cerdos pastan y los caimanes acechan en las aguas.
* **Bocadillos de pensamiento en vivo:** Verás pequeños diálogos sobre sus cabezas con lo que sienten (*"¡Dios mío, qué fue ese trueno!"*, *"Si entrego esto compro mi terreno"*, *"Bendita lluvia celestial..."*).

### 3. Modo Inmersivo (Zelda: The Minish Cap)
La cámara hace un zoom cinemático continuo desde el cielo hasta situarse detrás de tu personaje con vista cenital pixel-art:
* **WASD / Flechas:** Moverse por el mundo.
* **ESPACIO / Tecla E:** Interactuar:
  * Cosechar plantas maduras si tienes espacio en tu inventario.
  * Entregar el cargamento en el **Almacén del Patrón** o en el **Muelle de Salida**.
* **Esquivar la Patrulla Policial:** Los policías patrullan con conos de luz y linternas. Si te ven con cargamento, sonará la alarma y te perseguirán.
* **Q / ESC / Botón "Ascender":** Al completar tu mini-misión de escape, tu alma se purifica con luz celestial y regresas al cielo como Dios omnipotente.

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
