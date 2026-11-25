"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useDemo } from "@/lib/store";
import { distribuir, fmtFaixa, reserva, statusPreco, STATUS_FAIXA_LABEL } from "@/lib/quiz";
import { brl, CLASSE_LABEL, dataBR, OBJETIVO_LABEL, PERFIL_LABEL } from "@/lib/labels";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui";

const SELO = { faixa: "text-folha", abaixo: "text-azul", acima: "text-ink-mute", sem: "text-ink-mute" } as const;

/** Versão para impressão / PDF da carteira do aluno. */
export default function PdfCarteira() {
  const { alunoAtual, carteiras, metodologia } = useDemo();
  const r = alunoAtual?.resultado;
  if (!r || !alunoAtual)
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p>Responda o questionário para gerar a sua carteira.</p>
        <Link href="/app/questionario" className="btn-ouro mt-4">
          Responder questionário
        </Link>
      </Card>
    );
  const carteira = carteiras.find((c) => c.codigo === r.codigo)!;
  const linhas = distribuir(carteira, r.capital, r.aporteMensal);
  const rs = reserva(r, metodologia);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/app/plano" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <ArrowLeft size={16} /> Voltar para Minha carteira
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-ink-mute">Na janela que abrir, escolha &quot;Salvar como PDF&quot;.</span>
          <button type="button" onClick={() => window.print()} className="btn-primario py-2.5">
            <Printer size={17} /> Baixar PDF
          </button>
        </div>
      </div>

      <article className="rounded-[20px] bg-white p-5 ring-1 ring-ink/[0.08] sm:p-8 print:rounded-none print:p-0 print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <Logo />
          <div className="text-right text-[13px] text-ink-mute">
            <p className="font-semibold text-ink">{alunoAtual.nome}</p>
            <p>Gerado em {dataBR(new Date().toISOString())}</p>
          </div>
        </header>

        <div className="mt-6">
          <p className="text-[13px] font-semibold text-ouro-deep">Carteira {r.codigo}</p>
          <h1 className="text-[1.9rem] font-bold leading-tight">{carteira.nome}</h1>
          <p className="mt-1 text-ink-soft">{carteira.resumo}</p>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              ["Perfil", PERFIL_LABEL[r.perfil]],
              ["Objetivo", OBJETIVO_LABEL[r.objetivo]],
              ["Investir agora", brl(r.capital)],
              ["Aporte mensal", brl(r.aporteMensal)],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-paper p-3 print:border print:border-ink/15 print:bg-white">
              <dt className="text-[12.5px] text-ink-mute">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[14px] text-ink-soft">
          Reserva de emergência: {brl(r.reservaAtual)} de {brl(rs.ideal)} ({rs.pct}%).{" "}
          {rs.completa ? "Reserva completa." : `Faltam ${brl(rs.falta)}, a guardar em Tesouro Selic ou CDB com liquidez diária.`}
        </p>

        {/* Tabela: telas médias, grandes e impressão */}
        <table className="mt-6 hidden w-full text-left text-[14px] md:table print:table">
          <thead className="border-b-2 border-ink text-[12px] text-ink-mute">
            <tr>
              <th className="py-2 pr-2 font-semibold">Ativo</th>
              <th className="px-2 py-2 text-right font-semibold">%</th>
              <th className="px-2 py-2 text-right font-semibold">Agora</th>
              <th className="px-2 py-2 text-right font-semibold">Por mês</th>
              <th className="px-2 py-2 text-right font-semibold">≈ Cotas</th>
              <th className="px-2 py-2 font-semibold">Faixa de compra</th>
              <th className="py-2 pl-2 font-semibold">Situação</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const st = statusPreco(l);
              return (
                <tr key={l.id} className="border-b border-ink/10 align-top">
                  <td className="py-2.5 pr-2">
                    <span className="block font-semibold">{l.nome}</span>
                    <span className="text-[12px] text-ink-mute">
                      {l.codigo}, {CLASSE_LABEL[l.classe]}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold">{l.pct}%</td>
                  <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{brl(l.agora, 2)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{brl(l.mensal, 2)}</td>
                  <td className="px-2 py-2.5 text-right">{l.cotas ?? "—"}</td>
                  <td className="px-2 py-2.5 text-[13px]">{l.teto !== undefined ? fmtFaixa(l, l.compraMin, l.teto) : "—"}</td>
                  <td className={`py-2.5 pl-2 text-[13px] font-semibold ${SELO[st]}`}>{st === "sem" ? "—" : STATUS_FAIXA_LABEL[st]}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="py-2.5 pr-2">Total</td>
              <td className="px-2 py-2.5 text-right">{linhas.reduce((s, l) => s + l.pct, 0)}%</td>
              <td className="px-2 py-2.5 text-right">{brl(r.capital, 2)}</td>
              <td className="px-2 py-2.5 text-right">{brl(r.aporteMensal, 2)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>

        {/* Lista: celular */}
        <ul className="mt-6 space-y-2.5 md:hidden print:hidden">
          {linhas.map((l) => {
            const st = statusPreco(l);
            return (
              <li key={l.id} className="rounded-xl bg-paper p-3.5">
                <div className="flex justify-between gap-3">
                  <span>
                    <span className="block font-semibold leading-snug">{l.nome}</span>
                    <span className="text-[12.5px] text-ink-mute">{l.codigo}</span>
                  </span>
                  <span className="font-display font-bold">{l.pct}%</span>
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-x-4 text-[14px]">
                  <span>
                    Agora <strong>{brl(l.agora, 2)}</strong>
                  </span>
                  <span>
                    Por mês <strong>{brl(l.mensal, 2)}</strong>
                  </span>
                </div>
                {st !== "sem" && <p className={`mt-1 text-[13px] font-semibold ${SELO[st]}`}>{STATUS_FAIXA_LABEL[st]}</p>}
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-[12.5px] text-ink-mute">
          Cotas aproximadas pelas cotações de referência (ilustrativas). {metodologia.avisoCotacao} {metodologia.avisoPrecos}
        </p>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-mute">
          Conteúdo de caráter educacional e informativo, conforme a metodologia do GPS Financeiro. Não constitui recomendação individual de investimento. Investimentos envolvem riscos, inclusive de perda do capital investido.
        </p>
      </article>
    </div>
  );
}
