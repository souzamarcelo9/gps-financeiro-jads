"use client";

import Link from "next/link";
import { BadgeCheck, Landmark, UsersRound } from "lucide-react";
import { useDemo } from "@/lib/store";

/** Vitrine da página inicial (editada em Ofertas no painel). */
export function ProgramasComplementares() {
  const { ofertas, temAcompanhamento } = useDemo();
  const a = ofertas.acompanhamento;
  const g = ofertas.garantia;
  const mostrarA = a.ativo && a.locais.inicio;
  if (!mostrarA && !g.ativo) return null;

  return (
    <section>
      <h2 className="text-[1.7rem] font-bold leading-tight">Programas complementares</h2>
      <p className="mt-0.5 text-ink-mute">Para ir além do seu plano, no seu ritmo.</p>
      <div className={`mt-4 grid gap-4 ${mostrarA && g.ativo ? "lg:grid-cols-2" : ""}`}>
        {mostrarA && (
          <article className="flex overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[0.08]">
            <div className="hidden w-32 shrink-0 place-items-center bg-ink text-ouro sm:grid">
              {temAcompanhamento ? <BadgeCheck size={44} strokeWidth={1.4} /> : <UsersRound size={44} strokeWidth={1.4} />}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-[13px] font-semibold text-ouro-deep">{temAcompanhamento ? "Seu programa" : "Programa principal"}</p>
              <h3 className="mt-1 font-display text-[1.45rem] font-bold leading-tight">{a.titulo}</h3>
              <p className="mt-1.5 flex-1 text-[15px] text-ink-soft">
                {temAcompanhamento
                  ? "Acesso liberado. Solicite a revisão do seu plano e fale com a equipe quando precisar."
                  : "O Renan e a equipe ao seu lado para colocar o plano em prática, com revisão do seu plano, carteira pessoal e Radar de Oportunidades."}
              </p>
              <Link href="/app/acompanhamento" className="btn-ouro mt-4 w-fit px-5 py-2.5 text-[15px]">
                {temAcompanhamento ? "Ver meus benefícios" : "Conhecer o acompanhamento"}
              </Link>
            </div>
          </article>
        )}
        {g.ativo && (
          <article className="flex overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[0.08]">
            <div className="hidden w-32 shrink-0 place-items-center bg-[#3B3424] text-ouro sm:grid">
              <Landmark size={44} strokeWidth={1.4} />
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-[13px] font-semibold text-ink-mute">Outra opção da R7</p>
              <h3 className="mt-1 font-display text-[1.45rem] font-bold leading-tight">{g.titulo}</h3>
              <p className="mt-1.5 flex-1 text-[15px] text-ink-soft">{g.chamada}, a partir de {g.minimo.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}. Sem promessa de resultado.</p>
              <Link href="/app/investimento-garantia" className="btn-linha mt-4 w-fit px-5 py-2.5 text-[15px]">
                Ver como funciona
              </Link>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
