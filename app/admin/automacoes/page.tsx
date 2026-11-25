"use client";

import { CheckCheck, Clock, MessageCircle, ShoppingCart, Sparkles, Wallet } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { Card, IconChip, Selo } from "@/components/ui";

const FLUXOS = [
  { icon: ShoppingCart, t: "Compra aprovada", d: "Boas-vindas com link de acesso e orientações iniciais.", gatilho: "Webhook de compra" },
  { icon: Sparkles, t: "Plano gerado", d: "Avisa que o plano está pronto e apresenta o Acompanhamento Individual.", gatilho: "Questionário concluído" },
  { icon: Wallet, t: "Capital a partir de R$ 10 mil", d: "Depois de 2 dias, apresenta o Investimento com Garantia.", gatilho: "Condição de capital" },
  { icon: Clock, t: "Aluno inativo", d: "Lembrete de aporte com link para o plano.", gatilho: "15 dias sem acesso" },
];

export default function Automacoes() {
  return (
    <>
      <TituloPagina titulo="Automações" sobre="Módulo opcional, previsto para a fase 2" descricao="Fluxos de WhatsApp pela API oficial, disparados pelos eventos e dados que a plataforma já registra. A estrutura da fase 1 já deixa tudo preparado para esta integração." />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          {FLUXOS.map((f) => (
            <Card key={f.t} className="flex items-start gap-4 p-5 opacity-90">
              <IconChip icon={f.icon} tom="neutro" />
              <div className="flex-1">
                <p className="font-semibold">{f.t}</p>
                <p className="text-[15px] text-ink-soft">{f.d}</p>
                <p className="mt-1 text-[13px] text-ink-mute">Gatilho: {f.gatilho}</p>
              </div>
              <Selo>Fase 2</Selo>
            </Card>
          ))}
        </div>
        <Card className="h-fit p-5">
          <p className="font-display font-bold">Prévia da mensagem</p>
          <div className="mt-4 rounded-2xl bg-[#E8EFE9] p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white p-3.5 text-[14.5px] shadow-sm">
              Olá, Ana! Seu plano de investimentos no GPS Financeiro está pronto. 🎉 Toque no link para ver quanto investir em cada ativo.
              <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-mute">
                09:41 <CheckCheck size={14} className="text-azul" />
              </p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-[13px] text-ink-mute">
            <MessageCircle size={15} className="mt-0.5 shrink-0" /> Mensagens iniciadas pela empresa usam modelos aprovados pela Meta e exigem o consentimento do aluno.
          </p>
        </Card>
      </div>
    </>
  );
}
