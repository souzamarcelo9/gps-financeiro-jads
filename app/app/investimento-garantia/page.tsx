"use client";

import { useState } from "react";
import { Building2, Car, ChevronDown, FileSignature, HandCoins, MessageCircle, ShieldAlert, Wallet } from "lucide-react";
import { useDemo } from "@/lib/store";
import { brl } from "@/lib/labels";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Barra, Card, IconChip } from "@/components/ui";

const PASSOS = [
  { icon: MessageCircle, t: "Fale com o time", d: "Você conversa com um especialista da R7 e tira suas dúvidas." },
  { icon: FileSignature, t: "Escolha a operação", d: "Valor, prazo e garantia definidos em contrato." },
  { icon: HandCoins, t: "Receba todo mês", d: "Os rendimentos caem na sua conta mensalmente." },
];

const DETALHES = [
  { t: "Garantias", d: "Cada operação é lastreada em um imóvel ou veículo, avaliado antes da contratação e vinculado ao contrato." },
  { t: "Prazos e resgate", d: "O capital fica aplicado até o fim do prazo da operação. Os rendimentos são pagos mensalmente." },
  { t: "Riscos", d: "É um investimento privado: não conta com a garantia do FGC e envolve risco de crédito e de execução da garantia. Leia o contrato com atenção." },
  { t: "Condições", d: "Valores mínimos, taxas e disponibilidade variam por operação e são apresentados pelo time antes da assinatura." },
];

export default function InvestimentoGarantia() {
  const { ofertas } = useDemo();
  const g = ofertas.garantia;
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-folha">Oportunidade R7 Investimentos</p>
          <h1 className="mt-1 text-[2.1rem] font-bold leading-[1.1] sm:text-[2.5rem]">{g.titulo}</h1>
          <p className="mt-3 text-lg text-ink-soft">{g.descricao}</p>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
            <Card className="p-4">
              <p className="text-sm text-ink-mute">A partir de</p>
              <p className="font-display text-2xl font-bold">{brl(g.minimo)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-ink-mute">Rentabilidade</p>
              <p className="font-display text-xl font-bold leading-tight text-folha">{g.destaque}</p>
            </Card>
          </div>
          <a href={g.whatsapp} target="_blank" rel="noreferrer" className="btn-primario mt-7">
            <MessageCircle size={18} /> Falar com o time da R7
          </a>
        </div>
        <VideoPlayer titulo="Como funciona o Investimento com Garantia" duracaoSeg={200} />
      </div>

      <h2 className="mt-12 text-[1.5rem] font-bold">Como funciona</h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <li key={p.t}>
            <Card className="h-full p-5">
              <div className="flex items-center gap-3">
                <IconChip icon={p.icon} tom="ink" />
                <span className="font-display text-sm font-bold text-ink-mute">Passo {i + 1}</span>
              </div>
              <p className="mt-3 font-semibold">{p.t}</p>
              <p className="text-[15px] text-ink-soft">{p.d}</p>
            </Card>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-[1.5rem] font-bold">Operações disponíveis</h2>
      <p className="mt-1 text-ink-mute">Exemplos fictícios para a demonstração.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {g.operacoes.map((op) => (
          <Card key={op.id} className="p-5">
            <div className="flex items-center justify-between">
              <IconChip icon={op.garantia === "Imóvel" ? Building2 : Car} tom={op.garantia === "Imóvel" ? "azul" : "ouro"} />
              <span className="rounded-lg bg-paper px-2 py-0.5 text-[13px] font-semibold text-ink-soft">Garantia: {op.garantia.toLowerCase()}</span>
            </div>
            <p className="mt-4 font-display text-lg font-bold">{op.nome}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-ink-mute">Rentab.</dt>
                <dd className="font-semibold text-folha">{op.rentabilidade}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Prazo</dt>
                <dd className="font-semibold">{op.prazo}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Mínimo</dt>
                <dd className="font-semibold">{brl(op.minimo)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[13px] text-ink-mute">
                <span>Captado</span>
                <span>{op.captado}%</span>
              </div>
              <Barra pct={op.captado} cor="bg-ink" />
            </div>
            <a href={g.whatsapp} target="_blank" rel="noreferrer" className="btn-linha mt-5 w-full py-2.5 text-sm">
              <Wallet size={16} /> Tenho interesse
            </a>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-[1.5rem] font-bold">Garantias, prazos, riscos e condições</h2>
      <div className="mt-4 space-y-2.5">
        {DETALHES.map((d, i) => (
          <Card key={d.t}>
            <button type="button" onClick={() => setAberto(aberto === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold" aria-expanded={aberto === i}>
              {d.t}
              <ChevronDown size={19} className={`shrink-0 text-ink-mute transition-transform ${aberto === i ? "rotate-180" : ""}`} />
            </button>
            {aberto === i && <p className="px-5 pb-4 text-ink-soft">{d.d}</p>}
          </Card>
        ))}
      </div>
      <p className="mt-6 flex items-start gap-2 rounded-2xl bg-alerta-soft/60 px-4 py-3 text-[14px] text-ink-soft">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-alerta" />
        Rentabilidade passada ou estimada não é garantia de rentabilidade futura. Investimentos privados não contam com a cobertura do Fundo Garantidor de Créditos (FGC).
      </p>
    </div>
  );
}
