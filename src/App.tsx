/**
 * Sonic Arcade 2D - Main React Application
 * Provides an authentic retro arcade cabinet interface with responsive canvas scaling,
 * mobile touch controls, audio controls, CRT scanline toggle, and help guides.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GameState } from './game/GameEngine';
import { sounds } from './game/SoundEngine';
import { Volume2, VolumeX, Maximize2, RotateCcw, HelpCircle, Gamepad2, Play, Pause } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [hudStats, setHudStats] = useState({
    score: 0,
    rings: 0,
    lives: 3,
    time: '00:00:00',
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanlines, setScanlines] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStateChange = (newState, stats) => {
      setGameState(newState);
      setHudStats(stats);
    };

    engine.start();

    return () => {
      engine.destroy();
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (!next) {
      sounds.stopBGM();
    } else if (gameState === 'PLAYING') {
      sounds.startBGM();
    }
  };

  const handleStartGame = () => {
    if (engineRef.current) {
      if (gameState === 'TITLE' || gameState === 'GAME_OVER' || gameState === 'LEVEL_CLEAR') {
        engineRef.current.startGame();
      } else if (gameState === 'PAUSED') {
        engineRef.current.togglePause();
      }
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleToggleFullscreen = () => {
    const container = document.getElementById('arcade-screen-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Virtual mobile touch controls
  const handleTouch = (key: 'left' | 'right' | 'up' | 'down' | 'jump' | 'spinDashButton' | 'rollButton', active: boolean) => {
    if (engineRef.current) {
      engineRef.current.setVirtualInput(key, active);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-arcade text-sm sm:text-base text-sky-400 tracking-wider">
            SONIC ARCADE 2D
          </span>
          <span className="hidden md:inline text-xs text-slate-500 font-medium">
            Green Hill Zone · 16-Bit Engine
          </span>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setScanlines(!scanlines)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              scanlines ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Efecto CRT Scanlines"
          >
            CRT
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors"
            title="Activar/Silenciar Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio ON' : 'Mudo'}</span>
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors"
            title="Instrucciones y Controles"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Controles</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors"
            title="Reiniciar Nivel"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Arcade Frame */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 max-w-6xl mx-auto w-full">
        {/* Arcade Cabinet Frame */}
        <div className="w-full relative flex flex-col items-center">
          {/* Bezel Title Strip */}
          <div className="w-full max-w-[960px] bg-slate-900 border border-b-0 border-slate-800 rounded-t-xl px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MEGA-DRIVE 60FPS</span>
            </div>
            <div className="flex items-center gap-4">
              <span>SCORE: <strong className="text-amber-400 font-arcade text-[10px]">{hudStats.score}</strong></span>
              <span>RINGS: <strong className="text-amber-400 font-arcade text-[10px]">{hudStats.rings}</strong></span>
              <span>LIVES: <strong className="text-sky-400 font-arcade text-[10px]">×{hudStats.lives}</strong></span>
            </div>
          </div>

          {/* Canvas Container */}
          <div
            id="arcade-screen-container"
            className={`w-full max-w-[960px] aspect-[16/9] relative bg-black border-2 border-slate-800 rounded-b-xl shadow-2xl overflow-hidden flex items-center justify-center ${
              scanlines ? 'crt-scanlines' : ''
            }`}
          >
            <canvas
              ref={canvasRef}
              className="game-canvas w-full h-full object-contain focus:outline-none"
              tabIndex={0}
            />

            {/* Quick Action Overlay Button on Title */}
            {gameState === 'TITLE' && (
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 bg-black/30 pointer-events-none">
                <button
                  onClick={handleStartGame}
                  className="pointer-events-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-arcade text-xs sm:text-sm rounded-lg shadow-lg font-bold flex items-center gap-2 transition-transform"
                >
                  <Play className="w-4 h-4 fill-current" />
                  START GAME
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Touch / Gamepad Mobile Virtual Controls (Shown on touch screens or small viewports) */}
        <div className="mt-4 w-full max-w-[960px] flex items-center justify-between px-2 gap-4 lg:hidden">
          {/* D-Pad */}
          <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
            <div />
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('up', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('up', false); }}
              className="bg-slate-800 active:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center select-none"
            >
              ▲
            </button>
            <div />
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('left', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('left', false); }}
              className="bg-slate-800 active:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center select-none"
            >
              ◀
            </button>
            <div className="bg-slate-900 rounded border border-slate-800 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('right', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('right', false); }}
              className="bg-slate-800 active:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center select-none"
            >
              ▶
            </button>
            <div />
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('down', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('down', false); }}
              className="bg-slate-800 active:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center select-none"
            >
              ▼
            </button>
            <div />
          </div>

          {/* Action Buttons: Jump (A), Spin Dash, and Roll */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Roll Button */}
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('rollButton', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('rollButton', false); }}
              className="w-14 h-14 rounded-full bg-emerald-600 active:bg-emerald-500 shadow-lg text-white font-arcade text-[10px] flex flex-col items-center justify-center active:scale-95 transition-transform"
              title="Rodar (Roll) para arrasar enemigos"
            >
              <span>RODAR</span>
              <span className="text-[8px] opacity-80">(ROLL)</span>
            </button>

            {/* Spin Dash Button */}
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('spinDashButton', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('spinDashButton', false); }}
              className="w-14 h-14 rounded-full bg-rose-600 active:bg-rose-500 shadow-lg text-white font-arcade text-[10px] flex flex-col items-center justify-center active:scale-95 transition-transform"
              title="Cargar y lanzar Spin Dash"
            >
              <span>SPIN</span>
              <span className="text-[8px] opacity-80">DASH</span>
            </button>

            {/* Jump Button */}
            <button
              onPointerDown={(e) => { e.preventDefault(); handleTouch('jump', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleTouch('jump', false); }}
              className="w-16 h-16 rounded-full bg-sky-600 active:bg-sky-500 shadow-lg text-white font-arcade text-xs flex flex-col items-center justify-center active:scale-95 transition-transform"
              title="Saltar"
            >
              <span>JUMP</span>
              <span className="text-[9px] opacity-80">(A)</span>
            </button>
          </div>
        </div>

        {/* Keyboard Quick Guide Below Screen */}
        <div className="mt-4 w-full max-w-[960px] bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <Gamepad2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span><strong className="text-slate-200">Moverse:</strong> Flechas / A, D</span>
            <span>·</span>
            <span><strong className="text-emerald-400">Pelota / Atacar:</strong> Tecla Abajo (↓) o C</span>
            <span>·</span>
            <span><strong className="text-slate-200">Saltar:</strong> Espacio / Z</span>
            <span>·</span>
            <span><strong className="text-rose-400">Spin Dash:</strong> Abajo + Espacio o tecla X</span>
            <span>·</span>
            <span><strong className="text-slate-200">Pausa:</strong> P / Esc</span>
          </div>
          <div className="text-amber-400 font-medium text-[11px]">
            ⚡ Presiona Abajo para volverte una pelota destructora
          </div>
        </div>
      </main>

      {/* Instructions Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-arcade text-sm text-sky-400">SONIC ARCADE 2D - GUÍA</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-1.5">
                <p className="font-semibold text-amber-400">⚡ Mecánicas de Velocidad & Spin Dash:</p>
                <p>• <strong>Inercia y aceleración:</strong> Sonic gana velocidad al correr continuamente. Al cambiar de dirección abruptamente realizará un derrape (skid) levantando polvo.</p>
                <p>• <strong>Spin Dash:</strong> Agáchate (Abajo) y presiona Saltar repetidamente para cargar revoluciones con sonido ascendente. Al soltar Abajo saldrás disparado destruyendo enemigos.</p>
                <p>• <strong>Rodar (Roll):</strong> Presiona Abajo mientras corres para hacerte bola y mantener el impulso en pendientes y rampas.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-1.5">
                <p className="font-semibold text-emerald-400">🌀 Loop-de-Loop & Muelles:</p>
                <p>• Pasa por los bucles (loops) de 360 grados a gran velocidad para dar la vuelta completa.</p>
                <p>• Los resortes/muelles rojos te catapultarán hacia arriba o a la derecha a máxima velocidad.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-1.5">
                <p className="font-semibold text-rose-400">💍 Anillos y Enemigos (Badniks):</p>
                <p>• Recolecta rings flotantes. Si recibes daño teniendo rings, rebotarán a tu alrededor en una explosión física para que los recuperes.</p>
                <p>• Si recibes daño con 0 rings, perderás una vida.</p>
                <p>• Salta sobre los Motobugs y Buzz Bombers o golpéalos rodando con Spin Dash para destruirlos y liberar animalitos.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded transition-colors"
            >
              Entendido, ¡A Jugar!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 px-4 py-2.5 text-center text-xs text-slate-600">
        Sonic Arcade 2D · Motor de físicas 16-bit con HTML5 Canvas puro · Listo para Vercel & GitHub
      </footer>
    </div>
  );
}
