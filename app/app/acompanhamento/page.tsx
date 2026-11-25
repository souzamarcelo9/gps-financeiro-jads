"use client";

import { useState } from "react";
import { BadgeCheck, CalendarRange, ChevronDown, ClipboardCheck, Eye, Infinity as Infinito, Lock, MessageSquareText, Radar, RefreshCcw, ShieldCheck, Users, Check, Minus } from "lucide-react";
import { useDemo } from "@/lib/store";
import { brl } from "@/lib/labels";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Card, IconChip, Selo } from "@/components/ui";

const ICONES = [Users, ClipboardCheck, Eye, CalendarRange, RefreshCcw, Radar, Infinito];

const COMPARA: [string, boolean, boolean][] = [
  ["Plano de investimentos personalizado", true, true],
  ["Videoaulas e estratégias prontas", true, true],
  ["Mentor 24h com inteligência artificial", true, true],
  ["Revisão do plano feita pelo Renan", false, true],
  ["Atendimento com pessoas reais", false, true],
  ["Carteira pessoal e Semana da Alocação", false, true],
  ["Radar de Oportunidades", false, true],
];

export default function Acompanhamento() {
  const { ofertas, temAcompanhamento, abrirCheckout, alunoAtual } = useDemo();
  const o = ofertas.acompanhamento;
  const [faq, setFaq] = useState<number | null>(0);
  const [verPreco, setVerPreco] = useState(false);

  if (temAcompanhamento) {
    const zap = (msg: string) => `https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`;
    const AREAS = [
      { icon: Eye, t: "Minha Carteira Pessoal", d: "A carteira do Renan, com ativos e alocações.", tom: "azul" as const },
      { icon: CalendarRange, t: "Semana da Alocação", d: "Compras e vendas do mês, com vídeo explicativo.", tom: "folha" as const },
      { icon: Radar, t: "Radar de Oportunidades", d: "Oportunidades publicadas a qualquer momento.", tom: "ouro" as const },
    ];
    return (
      <div className="mx-auto max-w-5xl">
        <Selo tom="folha">
          <BadgeCheck size={14} /> Acesso vitalício liberado
        </Selo>
        <h1 className="mt-3 text-[2rem] font-bold leading-tight">Acompanhamento Individual</h1>
        <p className="mt-1 max-w-2xl text-ink-mute">Bem-vindo ao programa, {alunoAtual?.nome.split(" ")[0]}! Aqui ficam os seus benefícios exclusivos.</p>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Card className="p-6">
            <IconChip icon={ClipboardCheck} tom="ink" tamanho={44} />
            <h2 className="mt-4 text-xl font-bold">Solicite a revisão humanizada do seu plano</h2>
            <p className="mt-1.5 text-ink-soft">O Renan revisa seu plano a dedo. Por isso pode levar alguns dias úteis. Você é avisado quando estiver pronta.</p>
            <a href={zap(`Olá! Sou ${alunoAtual?.nome} (${alunoAtual?.email}) e quero SOLICITAR A REVISÃO DO MEU PLANO.`)} target="_blank" rel="noreferrer" className="btn-primario mt-5">
              Solicitar revisão do meu plano
            </a>
          </Card>
          <Card className="p-6">
            <IconChip icon={MessageSquareText} tom="folha" tamanho={44} />
            <h2 className="mt-4 text-xl font-bold">Suporte individual</h2>
            <p className="mt-1.5 text-ink-soft">Fale com a equipe pelo canal exclusivo de atendimento. Escreva ATENDIMENTO HUMANO a qualquer momento para falar com uma pessoa.</p>
            <a href={zap(`Olá! Sou ${alunoAtual?.nome}, aluno do Acompanhamento Individual.`)} target="_blank" rel="noreferrer" className="btn-linha mt-5">
              Abrir atendimento
            </a>
          </Card>
        </div>

        <h2 className="mt-10 font-display text-xl font-bold">Conteúdos exclusivos</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {AREAS.map((a) => (
            <Card key={a.t} className="p-5">
              <IconChip icon={a.icon} tom={a.tom} />
              <p className="mt-3 font-semibold">{a.t}</p>
              <p className="text-sm text-ink-mute">{a.d}</p>
              <p className="mt-3 text-[13px] font-semibold text-ouro-deep">Nesta fase, enviado no grupo exclusivo do WhatsApp</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-[28px] bg-ink text-white">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-ouro">
              <Lock size={13} /> Programa premium
            </p>
            <h1 className="mt-4 text-[2.1rem] font-bold leading-[1.1] sm:text-[2.6rem]">{o.titulo}</h1>
            <p className="mt-4 max-w-lg text-lg text-white/75">Orientação humana do Renan e da equipe para colocar seu plano em prática com segurança, evitar erros e acelerar seus resultados.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={abrirCheckout} className="btn-ouro">
                Quero o acompanhamento
              </button>
              <a href="#investimento" className="btn border border-white/25 text-white hover:bg-white/10">
                Como funciona o pagamento
              </a>
            </div>
          </div>
          <VideoPlayer titulo="Conheça o Acompanhamento Individual" subtitulo="Renan explica tudo em 4 minutos" duracaoSeg={240} />
        </div>
      </section>

      <h2 className="mt-12 text-[1.6rem] font-bold">O que você recebe</h2>
      <p className="mt-1 text-ink-mute">Não é só um canal para tirar dúvidas: é um programa completo de acompanhamento.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {o.beneficios.map((b, i) => {
          const I = ICONES[i] ?? ShieldCheck;
          return (
            <Card key={b.titulo} className={`p-5 ${i === o.beneficios.length - 1 && o.beneficios.length % 3 === 1 ? "bg-ouro-soft/50 ring-ouro/40 sm:col-span-2 lg:col-span-3" : ""}`}>
              <IconChip icon={I} tom={i === o.beneficios.length - 1 ? "ouro" : "ink"} />
              <p className="mt-3 font-display text-lg font-bold leading-snug">{b.titulo}</p>
              <p className="mt-1 text-[15px] text-ink-soft">{b.texto}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-ink/[0.07] text-sm">
                <th className="px-5 py-4 font-semibold text-ink-mute">Compare</th>
                <th className="px-3 py-4 text-center font-semibold">Seu acesso atual</th>
                <th className="bg-ink px-3 py-4 text-center font-semibold text-white">Com acompanhamento</th>
              </tr>
            </thead>
            <tbody>
              {COMPARA.map(([t, a, b]) => (
                <tr key={t} className="border-b border-ink/[0.05] last:border-0">
                  <td className="px-5 py-3">{t}</td>
                  <td className="px-3 py-3 text-center">{a ? <Check size={18} className="mx-auto text-folha" /> : <Minus size={18} className="mx-auto text-ink/25" />}</td>
                  <td className="bg-ink/[0.03] px-3 py-3 text-center">{b && <Check size={18} className="mx-auto text-folha" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="flex flex-col justify-between p-7" >
          <div id="investimento" className="scroll-mt-6">
            <p className="text-sm font-semibold text-folha">Investimento</p>
            <h2 className="mt-1 text-[1.6rem] font-bold leading-tight">Você paga uma única vez. E tem tudo para sempre.</h2>
            <p className="mt-2 text-ink-soft">Sem mensalidade, sem renovação. Acompanhamento individual vitalício para atingir seus objetivos e não cometer erros pelo caminho.</p>
            {verPreco ? (
              <div className="mt-5 rounded-2xl bg-paper p-5">
                <p className="text-sm text-ink-mute">Pagamento único</p>
                <p className="font-display text-[2.6rem] font-bold leading-none">{brl(o.preco)}</p>
                <p className="mt-1.5 text-sm text-ink-mute">ou parcelado no cartão. Menos de {brl(o.preco / 365, 2)} por dia no primeiro ano, e depois é seu para sempre.</p>
              </div>
            ) : (
              <button type="button" onClick={() => setVerPreco(true)} className="mt-5 w-full rounded-2xl border-2 border-dashed border-ink/20 p-5 text-left font-semibold text-ink-soft hover:border-ink/40">
                Ver o valor do programa
              </button>
            )}
          </div>
          <button type="button" onClick={abrirCheckout} className="btn-ouro mt-6 w-full text-[17px]">
            Quero o acompanhamento individual
          </button>
          <p className="mt-2 text-center text-[13px] text-ink-mute">Compra liberada na sua conta atual, sem novo cadastro.</p>
        </Card>
      </div>

      <h2 className="mt-12 text-[1.6rem] font-bold">Dúvidas frequentes</h2>
      <div className="mt-4 space-y-2.5">
        {o.faq.map((f, i) => (
          <Card key={f.pergunta}>
            <button type="button" onClick={() => setFaq(faq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold" aria-expanded={faq === i}>
              {f.pergunta}
              <ChevronDown size={19} className={`shrink-0 text-ink-mute transition-transform ${faq === i ? "rotate-180" : ""}`} />
            </button>
            {faq === i && <p className="px-5 pb-4 text-ink-soft">{f.resposta}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
