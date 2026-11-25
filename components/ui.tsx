"use client";

import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export type Tom = "ink" | "ouro" | "folha" | "alerta" | "roxo" | "azul" | "neutro";

const CHIP: Record<Tom, string> = {
  ink: "bg-ink/[0.07] text-ink",
  ouro: "bg-ouro-soft text-ouro-deep",
  folha: "bg-folha-soft text-folha",
  alerta: "bg-alerta-soft text-alerta",
  roxo: "bg-roxo-soft text-roxo",
  azul: "bg-azul-soft text-azul",
  neutro: "bg-paper-deep text-ink-soft",
};

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-[20px] bg-white ring-1 ring-ink/[0.07] ${className}`}>{children}</div>;
}

export function IconChip({ icon: Icone, tom = "ink", tamanho = 38 }: { icon: LucideIcon; tom?: Tom; tamanho?: number }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl ${CHIP[tom]}`} style={{ width: tamanho, height: tamanho }}>
      <Icone size={Math.round(tamanho * 0.47)} strokeWidth={2.1} />
    </span>
  );
}

export function Selo({ tom = "neutro", children, className = "" }: { tom?: Tom; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-0.5 text-[13px] font-semibold ${CHIP[tom]} ${className}`}>{children}</span>;
}

export function Variacao({ valor, sufixo = "%" }: { valor: number; sufixo?: string }) {
  const pos = valor >= 0;
  return (
    <Selo tom={pos ? "folha" : "alerta"}>
      {pos ? "↗" : "↘"} {Math.abs(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
      {sufixo}
    </Selo>
  );
}

export function Indicador({ rotulo, valor, icon, tom = "ink", rodape }: { rotulo: string; valor: ReactNode; icon: LucideIcon; tom?: Tom; rodape?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ink-mute">{rotulo}</p>
        <IconChip icon={icon} tom={tom} tamanho={34} />
      </div>
      <p className="mt-1 font-display text-[1.75rem] font-bold leading-tight">{valor}</p>
      {rodape && <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink-mute">{rodape}</div>}
    </Card>
  );
}

export function Abas<T extends string>({ itens, valor, onChange, className = "" }: { itens: { id: T; rotulo: string; total?: number }[]; valor: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto ${className}`} role="tablist">
      {itens.map((i) => {
        const ativo = i.id === valor;
        return (
          <button
            key={i.id}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(i.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
              ativo ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-ink/10 hover:ring-ink/25"
            }`}
          >
            {i.rotulo}
            {i.total !== undefined && <span className={`rounded-md px-1.5 text-xs ${ativo ? "bg-white/15" : "bg-paper-deep"}`}>{i.total}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Segmentado<T extends string>({ itens, valor, onChange }: { itens: { id: T; rotulo: string }[]; valor: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl bg-paper-deep/80 p-1">
      {itens.map((i) => (
        <button
          key={i.id}
          type="button"
          onClick={() => onChange(i.id)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${i.id === valor ? "bg-white text-ink shadow-sm" : "text-ink-mute hover:text-ink"}`}
        >
          {i.rotulo}
        </button>
      ))}
    </div>
  );
}

const CORES_AVATAR = ["#2F6FB1", "#2F8F6B", "#C9731E", "#6B5BD2", "#B83A4B", "#0E3B43", "#9C7210"];
export function Avatar({ nome, tamanho = 40 }: { nome: string; tamanho?: number }) {
  const ini = nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const cor = CORES_AVATAR[[...nome].reduce((s, c) => s + c.charCodeAt(0), 0) % CORES_AVATAR.length];
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: tamanho, height: tamanho, background: cor, fontSize: tamanho * 0.36 }} aria-hidden="true">
      {ini}
    </span>
  );
}

export function Interruptor({ ligado, onChange, rotulo }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: string }) {
  return (
    <button type="button" role="switch" aria-checked={ligado} aria-label={rotulo} onClick={() => onChange(!ligado)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ligado ? "bg-folha" : "bg-ink/20"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ligado ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function Modal({ aberto, onFechar, titulo, children, largura = "max-w-lg", semFechar = false }: { aberto: boolean; onFechar: () => void; titulo?: string; children: ReactNode; largura?: string; semFechar?: boolean }) {
  useEffect(() => {
    if (!aberto || semFechar) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [aberto, onFechar, semFechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={semFechar ? undefined : onFechar} tabIndex={-1} />
      <div className={`relative max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px] sm:p-7 ${largura}`}>
        {!semFechar && (
          <button type="button" onClick={onFechar} aria-label="Fechar" className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-mute hover:bg-paper">
            <X size={20} />
          </button>
        )}
        {titulo && <h2 className="pr-8 text-2xl font-bold">{titulo}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Campo({ rotulo, id, children, ajuda }: { rotulo: string; id: string; children: ReactNode; ajuda?: string }) {
  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      {children}
      {ajuda && <p className="mt-1 text-[13px] text-ink-mute">{ajuda}</p>}
    </div>
  );
}

export function CampoReais({ id, valor, onChange, className = "" }: { id: string; valor: number; onChange: (v: number) => void; className?: string }) {
  return (
    <div className={`flex items-center rounded-xl border border-ink/15 bg-white px-3.5 focus-within:border-ink ${className}`}>
      <span className="text-sm font-semibold text-ink-mute">R$</span>
      <input
        id={id}
        inputMode="numeric"
        value={valor ? valor.toLocaleString("pt-BR") : ""}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className="w-full bg-transparent px-2 py-2.5 font-semibold text-ink focus:outline-none"
      />
    </div>
  );
}

export function Barra({ pct, cor = "bg-ink", altura = "h-2" }: { pct: number; cor?: string; altura?: string }) {
  return (
    <div className={`${altura} overflow-hidden rounded-full bg-paper-deep`}>
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}
