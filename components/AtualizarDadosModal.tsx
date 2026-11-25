"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Modal, Campo, CampoReais } from "./ui";
import { useDemo } from "@/lib/store";
import { OBJETIVOS, OBJETIVO_LABEL } from "@/lib/labels";
import type { DadosFinanceiros, Objetivo } from "@/lib/types";

const CAMPOS: { k: keyof DadosFinanceiros; rotulo: string; ajuda?: string }[] = [
  { k: "capital", rotulo: "Capital disponível para investir", ajuda: "Sem contar a reserva de emergência." },
  { k: "aporteMensal", rotulo: "Aporte mensal" },
  { k: "reservaAtual", rotulo: "Reserva de emergência atual" },
  { k: "gastosMensais", rotulo: "Gastos mensais", ajuda: "Usado para calcular sua reserva ideal." },
  { k: "rendaMensal", rotulo: "Renda mensal" },
];

export function AtualizarDadosModal({ aberto, onFechar, foco }: { aberto: boolean; onFechar: () => void; foco?: keyof DadosFinanceiros }) {
  const { alunoAtual, atualizarDados } = useDemo();
  const r = alunoAtual?.resultado;
  const [d, setD] = useState<DadosFinanceiros & { objetivo: Objetivo }>();

  useEffect(() => {
    if (aberto && r) setD({ capital: r.capital, aporteMensal: r.aporteMensal, reservaAtual: r.reservaAtual, gastosMensais: r.gastosMensais, rendaMensal: r.rendaMensal, objetivo: r.objetivo });
  }, [aberto, r]);

  if (!r || !d) return null;
  const ordem = foco ? [...CAMPOS].sort((a, b) => (a.k === foco ? -1 : b.k === foco ? 1 : 0)) : CAMPOS;

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Atualizar dados do plano" largura="max-w-xl">
      <p className="mt-1 text-ink-mute">Mude só o que precisar. O plano é recalculado na hora e as demais respostas ficam como estão.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {ordem.map((c) => (
          <Campo key={c.k} id={`dado-${c.k}`} rotulo={c.rotulo} ajuda={c.ajuda}>
            <CampoReais id={`dado-${c.k}`} valor={d[c.k]} onChange={(v) => setD({ ...d, [c.k]: v })} />
          </Campo>
        ))}
      </div>
      <fieldset className="mt-5">
        <legend className="rotulo">Objetivo financeiro</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {OBJETIVOS.map((o) => (
            <label key={o} className={`cursor-pointer rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${d.objetivo === o ? "border-ink bg-ink text-white" : "border-ink/10 hover:border-ink/30"}`}>
              <input type="radio" name="objetivo" value={o} checked={d.objetivo === o} onChange={() => setD({ ...d, objetivo: o })} className="sr-only" />
              {OBJETIVO_LABEL[o]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/app/questionario" className="text-sm font-semibold text-ink-soft underline underline-offset-2">
          Mudou sua relação com risco? Refazer questionário
        </Link>
        <button
          type="button"
          onClick={() => {
            const { objetivo, ...fin } = d;
            atualizarDados({ ...fin, objetivo });
            onFechar();
          }}
          className="btn-primario"
        >
          Salvar e recalcular
        </button>
      </div>
    </Modal>
  );
}
