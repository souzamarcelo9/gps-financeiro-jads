"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Info } from "lucide-react";
import { useDemo } from "@/lib/store";
import { codigoCarteira } from "@/lib/quiz";
import { OBJETIVOS, OBJETIVO_CURTO, OBJETIVO_LABEL, PERFIS, PERFIL_LABEL } from "@/lib/labels";
import { Modal } from "./ui";
import type { Objetivo, Perfil } from "@/lib/types";

type Alvo = { perfil?: Perfil; objetivo?: Objetivo } | null;
const ORDEM: Record<Perfil, number> = { conservador: 0, moderado: 1, arrojado: 2 };

/** Troca de objetivo ou de perfil sem refazer o questionário, com confirmação "hoje → passa a ser". */
export function TrocarCarteiraModal({ alvo, onFechar }: { alvo: Alvo; onFechar: () => void }) {
  const { alunoAtual, carteiras, atualizarDados } = useDemo();
  const r = alunoAtual?.resultado;
  if (!r || !alvo) return null;
  const perfil = alvo.perfil ?? r.perfil;
  const objetivo = alvo.objetivo ?? r.objetivo;
  const novo = codigoCarteira(perfil, objetivo);
  const cAtual = carteiras.find((c) => c.codigo === r.codigo);
  const cNova = carteiras.find((c) => c.codigo === novo);
  const maisRisco = ORDEM[perfil] > ORDEM[r.perfil];
  const titulo = alvo.perfil ? `Mudar para o perfil ${PERFIL_LABEL[perfil].toLowerCase()}?` : `Escolher "${OBJETIVO_LABEL[objetivo]}"?`;

  return (
    <Modal aberto onFechar={onFechar} titulo={titulo} largura="max-w-xl">
      <p className="mt-1 text-ink-mute">
        {alvo.perfil ? "Seu objetivo continua o mesmo; muda o perfil de risco e, com ele, a carteira." : "Seu perfil continua o mesmo; muda o objetivo e, com ele, a carteira."}
      </p>
      <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl bg-paper p-4">
          <p className="text-[13px] text-ink-mute">Hoje</p>
          <p className="font-display text-xl font-bold">{r.codigo}</p>
          <p className="text-[15px] font-semibold">{cAtual?.nome}</p>
          <p className="text-[13px] text-ink-mute">
            {PERFIL_LABEL[r.perfil]}, {OBJETIVO_CURTO[r.objetivo].toLowerCase()}
          </p>
        </div>
        <ArrowRight className="mx-auto rotate-90 text-ink-mute sm:rotate-0" size={20} />
        <div className="rounded-2xl bg-noite p-4 text-white">
          <p className="text-[13px] text-white/60">Passa a ser</p>
          <p className="font-display text-xl font-bold text-ouro">{novo}</p>
          <p className="text-[15px] font-semibold">{cNova?.nome}</p>
          <p className="text-[13px] text-white/60">
            {PERFIL_LABEL[perfil]}, {OBJETIVO_CURTO[objetivo].toLowerCase()}
          </p>
        </div>
      </div>
      {maisRisco && (
        <p className="mt-4 flex gap-2 rounded-xl bg-ouro-soft/70 px-4 py-3 text-[14px] text-ink-soft">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-ouro-deep" /> Um perfil mais arrojado tem mais renda variável e oscila mais no curto prazo. Se tiver dúvida, refaça o questionário.
        </p>
      )}
      <p className="mt-4 flex gap-2 text-[14px] text-ink-mute">
        <Info size={17} className="mt-0.5 shrink-0" /> Seus dados (capital, aportes e reserva) continuam os mesmos e a carteira é recalculada na hora. Você pode voltar quando quiser.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onFechar} className="btn-linha">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            atualizarDados(alvo.perfil ? { perfil } : { objetivo });
            onFechar();
          }}
          className="btn-primario"
        >
          <Check size={17} /> Confirmar troca
        </button>
      </div>
    </Modal>
  );
}

/** Botões de troca rápida de objetivo e de perfil. */
export function SeletorCarteira({ escuro = false }: { escuro?: boolean }) {
  const { alunoAtual } = useDemo();
  const [alvo, setAlvo] = useState<Alvo>(null);
  const r = alunoAtual?.resultado;
  if (!r) return null;
  const chip = (on: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? "bg-noite text-white" : escuro ? "bg-white/10 text-white ring-1 ring-white/20" : "bg-white text-ink-soft ring-1 ring-ink/10 hover:ring-ink/30"}`;
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-[70px] text-sm font-semibold text-ink-mute">Objetivo</span>
        {OBJETIVOS.map((o) => (
          <button key={o} type="button" aria-pressed={o === r.objetivo} onClick={() => o !== r.objetivo && setAlvo({ objetivo: o })} className={chip(o === r.objetivo)}>
            {OBJETIVO_CURTO[o]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-[70px] text-sm font-semibold text-ink-mute">Perfil</span>
        {PERFIS.map((p) => (
          <button key={p} type="button" aria-pressed={p === r.perfil} onClick={() => p !== r.perfil && setAlvo({ perfil: p })} className={chip(p === r.perfil)}>
            {PERFIL_LABEL[p]}
          </button>
        ))}
      </div>
      <TrocarCarteiraModal alvo={alvo} onFechar={() => setAlvo(null)} />
    </div>
  );
}
