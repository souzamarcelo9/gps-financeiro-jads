"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Layers } from "lucide-react";
import { useDemo } from "@/lib/store";
import { OBJETIVOS, OBJETIVO_EXPLICACAO, OBJETIVO_LABEL, OBJETIVO_SLUG } from "@/lib/labels";
import { PainelCarteira } from "@/components/PainelCarteira";
import { Card, IconChip } from "@/components/ui";

/** Página discreta: só é acessada pela descrição da aula das estratégias ou pelo Mentor 24h. */
export default function Estrategia() {
  const { slug } = useParams<{ slug: string }>();
  const { estrategias, carteiras, alunoAtual } = useDemo();
  const objetivo = OBJETIVOS.find((o) => OBJETIVO_SLUG[o] === slug);
  const [capital, setCapital] = useState(alunoAtual?.resultado?.capital || 10000);
  const [aporte, setAporte] = useState(alunoAtual?.resultado?.aporteMensal || 500);

  if (!objetivo)
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p>Estratégia não encontrada.</p>
        <Link href="/app/aulas/a13" className="btn-linha mt-4">
          Ver a aula das estratégias
        </Link>
      </Card>
    );

  const carteira = carteiras.find((c) => c.codigo === estrategias[objetivo])!;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/app/aulas/a13" className="text-sm font-semibold text-ink-soft underline underline-offset-2">
        Aula: As 3 estratégias prontas
      </Link>
      <div className="mt-4 flex flex-wrap items-start gap-4">
        <IconChip icon={Layers} tom="ouro" tamanho={50} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-folha">Estratégia pronta</p>
          <h1 className="text-[2rem] font-bold leading-tight">{OBJETIVO_LABEL[objetivo]}</h1>
          <p className="mt-1 max-w-2xl text-ink-soft">{OBJETIVO_EXPLICACAO[objetivo]}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {OBJETIVOS.map((o) => (
          <Link key={o} href={`/app/estrategias/${OBJETIVO_SLUG[o]}`} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${o === objetivo ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-ink/10"}`}>
            {OBJETIVO_LABEL[o]}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <PainelCarteira carteira={carteira} capital={capital} aporte={aporte} onCapital={setCapital} onAporte={setAporte} />
      </div>

      <p className="mt-5 text-[15px] text-ink-soft">
        {alunoAtual?.resultado ? "Seu plano personalizado leva em conta o seu perfil de risco. " : "Ainda não tem um plano personalizado? "}
        <Link href={alunoAtual?.resultado ? "/app/plano" : "/app/questionario"} className="font-semibold text-ink underline underline-offset-2">
          {alunoAtual?.resultado ? "Ver meu plano" : "Responder o questionário"}
        </Link>
      </p>
    </div>
  );
}
