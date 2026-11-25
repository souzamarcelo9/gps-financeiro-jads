"use client";

import { useState } from "react";
import { TituloPagina } from "@/components/AdminShell";
import { Card, Campo } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { PERGUNTAS } from "@/lib/quiz";

export default function Metodologia() {
  const { metodologia, salvarMetodologia } = useDemo();
  const [m, setM] = useState(metodologia);
  const [aviso, setAviso] = useState(false);
  const mudou = JSON.stringify(m) !== JSON.stringify(metodologia);
  const valido = m.limiteConservador < m.limiteModerado && m.limiteConservador >= 5 && m.limiteModerado <= 15;

  return (
    <>
      <TituloPagina
        titulo="Metodologia"
        descricao="Regras usadas pelo sistema para definir o perfil, calcular a reserva e orientar o aluno. Tudo por programação, sem custo de IA."
        acao={
          <button type="button" disabled={!mudou || !valido} onClick={() => (salvarMetodologia(m), setAviso(true))} className="btn-primario">
            Salvar regras
          </button>
        }
      />
      {aviso && !mudou && <p className="mb-5 rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">Regras salvas. Novos planos e recálculos já usam os valores atualizados.</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">Perfil de investidor</h2>
          <p className="mt-1 text-sm text-ink-mute">5 perguntas valem de 1 a 3 pontos cada (de 5 a 15 no total).</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-conservador/10 p-3">
              <p className="text-sm font-semibold text-conservador">Conservador</p>
              <p className="mt-1 text-sm">5 a</p>
              <input aria-label="Limite do perfil conservador" type="number" min={5} max={14} value={m.limiteConservador} onChange={(e) => setM({ ...m, limiteConservador: Number(e.target.value) })} className="mt-1 w-16 rounded-lg border border-ink/15 px-2 py-1 text-center font-semibold" />
            </div>
            <div className="rounded-xl bg-moderado/10 p-3">
              <p className="text-sm font-semibold text-moderado">Moderado</p>
              <p className="mt-1 text-sm">{m.limiteConservador + 1} a</p>
              <input aria-label="Limite do perfil moderado" type="number" min={6} max={15} value={m.limiteModerado} onChange={(e) => setM({ ...m, limiteModerado: Number(e.target.value) })} className="mt-1 w-16 rounded-lg border border-ink/15 px-2 py-1 text-center font-semibold" />
            </div>
            <div className="rounded-xl bg-arrojado/10 p-3">
              <p className="text-sm font-semibold text-arrojado">Arrojado</p>
              <p className="mt-1 text-sm">{m.limiteModerado + 1} a 15</p>
              <p className="mt-1 py-1 text-sm text-ink-mute">automático</p>
            </div>
          </div>
          {!valido && <p className="mt-3 text-sm text-alerta">O limite do conservador precisa ser menor que o do moderado, entre 5 e 15.</p>}
          <p className="mt-4 text-sm text-ink-soft">Objetivo: duas respostas iguais definem o objetivo. Respostas diferentes resultam em renda mensal com crescimento.</p>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">Reserva de emergência</h2>
          <Campo id="m-meses" rotulo="Meses de gastos que formam a reserva ideal">
            <input id="m-meses" type="number" min={1} max={24} value={m.mesesReserva} onChange={(e) => setM({ ...m, mesesReserva: Number(e.target.value) })} className="campo w-32 py-2.5" />
          </Campo>
          <div className="mt-4">
            <Campo id="m-res" rotulo="Explicação exibida no plano">
              <textarea id="m-res" rows={5} value={m.textoReserva} onChange={(e) => setM({ ...m, textoReserva: e.target.value })} className="campo py-2.5 text-[15px]" />
            </Campo>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Avisos de preço</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr]">
            <Campo id="m-cot" rotulo="Aviso curto sobre cotação">
              <input id="m-cot" value={m.avisoCotacao} onChange={(e) => setM({ ...m, avisoCotacao: e.target.value })} className="campo py-2.5" />
            </Campo>
            <Campo id="m-pre" rotulo="Orientação geral quando o ativo está acima do teto">
              <textarea id="m-pre" rows={3} value={m.avisoPrecos} onChange={(e) => setM({ ...m, avisoPrecos: e.target.value })} className="campo py-2.5 text-[15px]" />
            </Campo>
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="px-6 py-4">
            <h2 className="font-display text-lg font-bold">Perguntas do questionário</h2>
            <p className="text-sm text-ink-mute">{PERGUNTAS.length} perguntas. Na versão final, textos e pontos também ficam editáveis aqui.</p>
          </div>
          <ol className="divide-y divide-ink/[0.06] border-t border-ink/[0.07]">
            {PERGUNTAS.map((p, i) => (
              <li key={p.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-6 py-3 text-[15px]">
                <span className="w-6 font-semibold text-ink-mute">{i + 1}</span>
                <span className="flex-1 font-semibold">{p.titulo}</span>
                <span className="text-sm text-ink-mute">{p.bloco === "perfil" ? "Pontua perfil (1 a 3)" : p.bloco === "objetivo" ? "Define objetivo" : "Valor em reais"}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
