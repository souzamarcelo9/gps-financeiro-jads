"use client";

import { useMemo, useRef, useState } from "react";

function caminhoSuave(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function GraficoLinha({ valores, rotulos, formatar, cor = "#2F8F6B", altura = 260 }: { valores: number[]; rotulos: string[]; formatar: (v: number) => string; cor?: string; altura?: number }) {
  const L = 760;
  const M = { t: 12, r: 12, b: 28, l: 62 };
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const { pts, ticks, max } = useMemo(() => {
    const bruto = Math.max(1, ...valores);
    const passo = Math.pow(10, Math.floor(Math.log10(bruto)));
    const max = Math.ceil(bruto / passo) * passo;
    const w = L - M.l - M.r;
    const h = altura - M.t - M.b;
    const pts = valores.map((v, i) => [M.l + (valores.length === 1 ? w / 2 : (i / (valores.length - 1)) * w), M.t + h - (v / max) * h] as [number, number]);
    return { pts, ticks: [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: M.t + h - f * h, v: f * max })), max };
  }, [valores, altura]);
  const linha = caminhoSuave(pts);
  const area = `${linha} L${pts[pts.length - 1][0]},${altura - M.b} L${pts[0][0]},${altura - M.b} Z`;
  const passoX = Math.max(1, Math.ceil(rotulos.length / 8));

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${L} ${altura}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Gráfico com ${valores.length} pontos. Máximo de ${formatar(max)}.`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const box = ref.current!.getBoundingClientRect();
          const x = ((e.clientX - box.left) / box.width) * L;
          let melhor = 0;
          pts.forEach((p, i) => Math.abs(p[0] - x) < Math.abs(pts[melhor][0] - x) && (melhor = i));
          setHover(melhor);
        }}
      >
        <defs>
          <linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={cor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t.y}>
            <line x1={M.l} x2={L - M.r} y1={t.y} y2={t.y} stroke="#0E3B43" strokeOpacity="0.07" />
            <text x={M.l - 10} y={t.y + 4} textAnchor="end" fontSize="11" fill="#5E7C81">
              {formatar(t.v)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#gArea)" />
        <path d={linha} fill="none" stroke={cor} strokeWidth="2.4" strokeLinejoin="round" />
        {rotulos.map((r, i) =>
          (i % passoX === 0 && rotulos.length - 1 - i >= passoX * 0.6) || i === rotulos.length - 1 ? (
            <text key={i} x={pts[i][0]} y={altura - 8} textAnchor="middle" fontSize="11" fill="#5E7C81">
              {r}
            </text>
          ) : null,
        )}
        {hover !== null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={M.t} y2={altura - M.b} stroke="#0E3B43" strokeOpacity="0.2" strokeDasharray="3 3" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r="5" fill="#fff" stroke={cor} strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(pts[hover][0] / L) * 100}%`, top: `${(pts[hover][1] / altura) * 100}%`, marginTop: -10 }}
        >
          <span className="block text-white/70">{rotulos[hover]}</span>
          <span className="font-semibold">{formatar(valores[hover])}</span>
        </div>
      )}
    </div>
  );
}

export function Rosca({ segmentos, centro, legenda, tamanho = 190 }: { segmentos: { valor: number; cor: string; rotulo: string }[]; centro: string; legenda: string; tamanho?: number }) {
  const total = segmentos.reduce((s, x) => s + x.valor, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let acum = 0;
  return (
    <div className="relative mx-auto" style={{ width: tamanho, height: tamanho }}>
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={segmentos.map((s) => `${s.rotulo}: ${s.valor}`).join(", ")}>
        <circle cx="90" cy="90" r={R} fill="none" stroke="#E4EBE6" strokeWidth="22" />
        {segmentos.map((s) => {
          const frac = s.valor / total;
          const el = <circle key={s.rotulo} cx="90" cy="90" r={R} fill="none" stroke={s.cor} strokeWidth="22" strokeDasharray={`${Math.max(0, frac * C - 3)} ${C}`} strokeDashoffset={-acum * C} />;
          acum += frac;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-4xl font-bold leading-none">{centro}</p>
          <p className="mt-1 text-sm text-ink-mute">{legenda}</p>
        </div>
      </div>
    </div>
  );
}

export function BarrasEmpilhadas({ itens }: { itens: { rotulo: string; pct: number; cor: string }[] }) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {itens.map((i) => (
          <div key={i.rotulo} style={{ width: `${i.pct}%`, background: i.cor }} title={`${i.rotulo}: ${i.pct}%`} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
        {itens.map((i) => (
          <li key={i.rotulo} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.cor }} />
            {i.rotulo} <span className="font-semibold text-ink">{i.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
