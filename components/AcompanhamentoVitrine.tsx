"use client";

import Link from "next/link";
import { BadgeCheck, CalendarClock, Eye, Radar, ShieldCheck, Users } from "lucide-react";
import { useDemo } from "@/lib/store";
import { VideoPlayer } from "./VideoPlayer";

const DESTAQUES = [
  { icon: Users, t: "Renan e equipe ao seu lado", d: "Tire dúvidas e coloque o plano em prática com orientação humana." },
  { icon: ShieldCheck, t: "Revisão do seu plano", d: "Seu plano revisado a dedo, um a um." },
  { icon: Eye, t: "Carteira pessoal do Renan", d: "Veja onde ele investe e as movimentações do mês." },
  { icon: Radar, t: "Radar de Oportunidades", d: "Alertas a partir do que acontece no Brasil e no mundo." },
];

export function AcompanhamentoVitrine({ variante = "plano" }: { variante?: "plano" | "inicio" }) {
  const { ofertas, temAcompanhamento, abrirCheckout } = useDemo();
  const o = ofertas.acompanhamento;
  if (!o.ativo) return null;
  if (variante === "inicio" && !o.locais.inicio) return null;
  if (variante === "plano" && !o.locais.plano) return null;

  if (temAcompanhamento)
    return (
      <section className="flex flex-col items-start justify-between gap-4 rounded-[24px] bg-folha-soft p-6 sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 shrink-0 text-folha" size={26} />
          <div>
            <h2 className="text-xl font-bold">Você tem o Acompanhamento Individual</h2>
            <p className="mt-1 text-ink-soft">Solicite a revisão do seu plano e fale com a equipe sempre que precisar.</p>
          </div>
        </div>
        <Link href="/app/acompanhamento" className="btn-primario shrink-0">
          Ver meus benefícios
        </Link>
      </section>
    );

  if (variante === "inicio")
    return (
      <section className="overflow-hidden rounded-[28px] bg-white ring-1 ring-ink/[0.07]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-ouro-soft px-3 py-1 text-[13px] font-semibold text-ouro-deep">
              <Users size={14} /> Acompanhamento humano
            </p>
            <h2 className="mt-3 text-[1.5rem] font-bold leading-tight sm:text-[1.75rem]">Quer ajuda do Renan e da equipe para colocar seu plano em prática?</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {DESTAQUES.map((d) => (
                <li key={d.t} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                    <d.icon size={18} />
                  </span>
                  <span>
                    <span className="block font-semibold leading-snug">{d.t}</span>
                    <span className="text-sm text-ink-mute">{d.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/acompanhamento" className="btn-primario">
                Conhecer o acompanhamento
              </Link>
              <button type="button" onClick={abrirCheckout} className="btn-linha">
                Quero contratar
              </button>
            </div>
          </div>
          <VideoPlayer titulo="Acompanhamento Individual Vitalício" subtitulo="Renan explica como funciona" duracaoSeg={240} />
        </div>
      </section>
    );

  return (
    <section className="overflow-hidden rounded-[28px] bg-ink text-white">
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-ouro">
            <CalendarClock size={14} /> Próximo passo recomendado
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight sm:text-[1.8rem]">{o.chamada}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {DESTAQUES.map((d) => (
              <li key={d.t} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-ouro">
                  <d.icon size={18} />
                </span>
                <span>
                  <span className="block font-semibold leading-snug">{d.t}</span>
                  <span className="text-sm text-white/65">{d.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={abrirCheckout} className="btn-ouro">
              Quero o acompanhamento individual
            </button>
            <Link href="/app/acompanhamento" className="btn border border-white/25 text-white hover:bg-white/10">
              Ver todos os benefícios
            </Link>
          </div>
        </div>
        <VideoPlayer titulo="Acompanhamento Individual Vitalício" subtitulo="Renan explica como funciona" duracaoSeg={240} />
      </div>
    </section>
  );
}
