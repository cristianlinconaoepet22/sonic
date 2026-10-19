# Sonic Arcade 2D 🌀🕹️

Videojuego retro de plataformas 2D estilo **Sonic the Hedgehog (Sega Mega Drive / Genesis)** desarrollado en **HTML5 Canvas puro**, **JavaScript ES6+ / TypeScript**, **Vite** y **Tailwind CSS**.

El proyecto está diseñado con una arquitectura modular limpia, optimizada a 60 FPS estables y con **assets procedurales en código** (sin necesidad de imágenes externas ni riesgo de errores 404). Listo para subir a GitHub y desplegar directamente en **Vercel**.

---

## 🎮 Características del Juego

1. **Físicas Auténticas de Sonic**:
   - **Inercia y Aceleración**: Curva de aceleración gradual, fricción natural y derrape (*skidding*) con partículas de polvo al frenar en seco.
   - **Spin Dash**: Mantén pulsado **Abajo** y presiona **Salto (Espacio / Z)** repetidamente para cargar revoluciones con sonido FM ascendente; al soltar, Sonic saldrá disparado a toda velocidad.
   - **Rodar en Pendientes**: Presiona **Abajo** mientras corres para hacerte bola (*Roll*) y arrasar con todo a tu paso.
   - **Salto de Altura Variable**: Salto corto o largo según el tiempo que mantengas pulsada la tecla.

2. **Entorno Arcade & Green Hill Zone**:
   - **Loop-de-loop 360° Funcional**: Atraviesa el bucle vertical corriendo a alta velocidad.
   - **Rings Giratorios**: Anillos con animación procedural 3D y brillo dinámico.
   - **Muelles / Springs**: Impulsores verticales y horizontales que lanzan a Sonic con animación y sonido.
   - **Cámara Dinámica**: Scroll horizontal suave con anticipación (*lookahead*) según la velocidad del jugador.
   - **Cajas de Objetos (Monitores)**: Cajas rompibles con +10 Anillos y Speed Shoes.

3. **Mecánicas de Daño & Ring Scatter**:
   - Si Sonic es golpeado con anillos: pierde los anillos en una dispersión física en parábola con rebotes realistas para poder recuperarlos.
   - Si Sonic es golpeado con 0 anillos: pierde una vida con animación clásica de caída.

4. **Enemigos Badniks**:
   - **Motobug**: Mariquita robótica con rueda animada y tubo de escape que patrulla las plataformas.
   - **Buzz Bomber**: Avispa voladora que patrulla los cielos.
   - Destrucción por salto o Spin Dash, liberando animalitos (*Flickie*) y sumando puntos.

5. **Audio Chiptune Procedural (Web Audio API)**:
   - Sintetizador integrado en tiempo real para sonidos de anillo, salto, Spin Dash, muelles, explosiones, fanfarria de meta y música de fondo 16-bit opcional.

---

## 📁 Arquitectura del Proyecto

```text
sonic-arcade-2d/
├── index.html               # Punto de entrada HTML con fuentes retro
├── package.json             # Dependencias y scripts Vite
├── vite.config.ts           # Configuración del empaquetador Vite
├── vercel.json              # Configuración de despliegue SPA en Vercel
├── README.md                # Documentación del proyecto
├── .gitignore               # Archivos ignorados por Git
└── src/
    ├── main.tsx             # Bootstrap de React y Canvas
    ├── index.css            # Tailwind CSS y estilos CRT
    ├── App.tsx              # Cabina Arcade, controles táctiles y HUD
    ├── game/
    │   ├── GameEngine.ts    # Loop a 60 FPS, cámara, colisiones y estados
    │   ├── Physics.ts       # Constantes de inercia, gravedad, bucle y colisiones
    │   ├── Player.ts        # Entidad Sonic, Spin Dash, rolling y daño
    │   ├── Ring.ts          # Anillos estáticos y física de dispersión
    │   ├── Enemy.ts         # Badniks (Motobug, Buzz Bomber) e IA
    │   ├── Level.ts         # Geometría del nivel Green Hill, loop y fondo
    │   └── SoundEngine.ts   # Sintetizador procedural Web Audio API
    └── assets/
        └── proceduralSprites.ts # Renderizado procedural de sprites vía Canvas
```

---

## 🚀 Instalación y Ejecución en Local

### Prerrequisitos
- **Node.js** (versión 18 o superior recomendada)
- **npm** o **pnpm** / **yarn**

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/sonic-arcade-2d.git
cd sonic-arcade-2d
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000` (o el puerto indicado por Vite).

### 4. Compilar para Producción
```bash
npm run build
```
Generará la carpeta `dist/` optimizada para despliegue estático.

---

## ☁️ Despliegue en Vercel (1-Click)

El proyecto incluye el archivo `vercel.json` listo para redirigir todas las rutas a `index.html`.

### Método 1: Vercel Dashboard (Recomendado)
1. Sube tu código a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.
2. Ve a [vercel.com/new](https://vercel.com/new).
3. Importa tu repositorio `sonic-arcade-2d`.
4. Vercel detectará automáticamente **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Haz clic en **Deploy**. ¡Tu juego estará en línea en segundos!

### Método 2: Vercel CLI
```bash
npm i -g vercel
vercel
```
Sigue los prompts en la terminal y confirma el despliegue a producción con `vercel --prod`.

---

## 🕹️ Controles del Juego

| Acción | Teclado | Móvil / Pantalla Táctil |
| :--- | :--- | :--- |
| **Moverse a la izquierda** | `←` / `A` | D-Pad ◀ |
| **Moverse a la derecha** | `→` / `D` | D-Pad ▶ |
| **Agacharse / Rodar** | `↓` / `S` | D-Pad ▼ |
| **Mirar arriba** | `↑` / `W` | D-Pad ▲ |
| **Saltar** | `Espacio` / `Z` / `Enter` | Botón **JUMP (A)** |
| **Spin Dash** | Mantener `↓` + pulsar `Espacio` (o tecla `X`) | Botón **SPIN DASH** |
| **Pausar juego** | `P` / `Escape` | Botón Pausa |
| **Efecto CRT Scanlines** | Botón CRT en la barra superior | Botón CRT |
| **Audio ON/OFF** | Botón Audio en la barra superior | Botón Audio |

---

## 🛠️ Tecnologías Utilizadas
- **HTML5 Canvas 2D API**: Renderizado gráfico directo a 60 cuadros por segundo sin librerías pesadas.
- **Web Audio API**: Efectos de sonido y sintetizador chiptune en tiempo real sin archivos de audio externos.
- **TypeScript**: Tipado estricto y arquitectura de juego modular.
- **Vite**: Bundler ultrarrápido y liviano.
- **Tailwind CSS**: Estilizado moderno para la cabina arcade y los controles táctiles.
- **Lucide Icons**: Iconografía para la interfaz de usuario.
