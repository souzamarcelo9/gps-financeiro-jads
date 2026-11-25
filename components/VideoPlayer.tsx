"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

const VELOCIDADES = [1, 1.25, 1.5, 2];

function tempo(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/**
 * Player SIMULADO para o protótipo. Na versão final: Panda Video ou Vimeo incorporado,
 * usando a API do player para impedir o avanço no vídeo de boas-vindas.
 */
export function VideoPlayer({
  titulo,
  subtitulo,
  duracaoSeg = 180,
  bloquearAvanco = false,
  onFim,
  compacto = false,
}: {
  titulo: string;
  subtitulo?: string;
  duracaoSeg?: number;
  bloquearAvanco?: boolean;
  onFim?: () => void;
  compacto?: boolean;
}) {
  const [tocando, setTocando] = useState(false);
  const [pos, setPos] = useState(0);
  const [vel, setVel] = useState(1);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    if (!tocando) return;
    const t = setInterval(() => {
      setPos((p) => {
        const n = Math.min(duracaoSeg, p + 0.25 * vel);
        if (n >= duracaoSeg) {
          setTocando(false);
          setFim(true);
        }
        return n;
      });
    }, 250);
    return () => clearInterval(t);
  }, [tocando, vel, duracaoSeg]);

  useEffect(() => {
    if (fim) onFim?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fim]);

  const pct = (pos / duracaoSeg) * 100;

  return (
    <div className="overflow-hidden rounded-2xl bg-ink text-white">
      <div className={`relative grid place-items-center ${compacto ? "aspect-video" : "aspect-video"}`} style={{ background: "radial-gradient(120% 90% at 20% 10%, #2C5A62 0%, #0E3B43 55%, #0A2C32 100%)" }}>
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden="true">
          <defs>
            <pattern id="grade" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke="#fff" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grade)" />
        </svg>
        <div className="relative z-10 px-6 text-center">
          <button
            type="button"
            onClick={() => (fim ? (setPos(0), setFim(false), setTocando(true)) : setTocando(!tocando))}
            aria-label={tocando ? "Pausar vídeo" : "Reproduzir vídeo"}
            className={`mx-auto grid place-items-center rounded-full bg-ouro text-ink shadow-xl transition-transform hover:scale-105 ${compacto ? "h-12 w-12" : "h-16 w-16"}`}
          >
            {tocando ? <Pause size={compacto ? 20 : 26} fill="currentColor" /> : <Play size={compacto ? 20 : 26} fill="currentColor" className="ml-1" />}
          </button>
          {!tocando && (
            <>
              <p className={`mt-4 font-display font-bold ${compacto ? "text-base" : "text-xl"}`}>{titulo}</p>
              {subtitulo && <p className="mt-1 text-sm text-white/65">{subtitulo}</p>}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setTocando(!tocando)} aria-label={tocando ? "Pausar" : "Reproduzir"} className="text-white/85">
          {tocando ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <span className="tabular-nums text-white/70">
          {tempo(pos)} / {tempo(duracaoSeg)}
        </span>
        <div
          className={`relative h-1.5 flex-1 rounded-full bg-white/15 ${bloquearAvanco ? "cursor-not-allowed" : "cursor-pointer"}`}
          onClick={(e) => {
            if (bloquearAvanco) return;
            const b = e.currentTarget.getBoundingClientRect();
            setPos(((e.clientX - b.left) / b.width) * duracaoSeg);
          }}
          title={bloquearAvanco ? "Este vídeo não pode ser adiantado" : undefined}
        >
          <div className="h-full rounded-full bg-ouro" style={{ width: `${pct}%` }} />
        </div>
        <label className="sr-only" htmlFor={`vel-${titulo}`}>
          Velocidade
        </label>
        <select id={`vel-${titulo}`} value={vel} onChange={(e) => setVel(Number(e.target.value))} className="rounded-md bg-white/10 px-1.5 py-0.5 text-white">
          {VELOCIDADES.map((v) => (
            <option key={v} value={v} className="text-ink">
              {v}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
