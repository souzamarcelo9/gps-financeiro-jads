"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, FileDown, LifeBuoy, PencilLine, Sparkles, Target, UserRound } from "lucide-react";
import { SeletorCarteira } from "@/components/TrocarCarteira";
import { AvisoReserva, SeusDados } from "@/components/AvisoReserva";
import { useDemo } from "@/lib/store";
import { reserva, statusPreco } from "@/lib/quiz";
import { brl, dataBR, OBJETIVO_CURTO, OBJETIVO_EXPLICACAO, OBJETIVO_LABEL, PERFIL_EXPLICACAO, PERFIL_LABEL, PERFIL_TEXTO } from "@/lib/labels";
import { PainelCarteira, RoscaCarteira } from "@/components/PainelCarteira";
import { AulasDaCarteira } from "@/components/AulasDaCarteira";
import { AcompanhamentoVitrine } from "@/components/AcompanhamentoVitrine";
import { AtualizarDadosModal } from "@/components/AtualizarDadosModal";
import { Barra, Card, IconChip, Modal } from "@/components/ui";
import type { DadosFinanceiros } from "@/lib/types";

const RISCO_PERFIL = { conservador: "Risco baixo", moderado: "Risco médio", arrojado: "Risco alto" } as const;

function Etapa({ n, titulo, children, id }: { n: number; titulo: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white">{n}</span>
        <h2 className="text-xl font-bold sm:text-[1.4rem]">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

function Plano() {
  const { alunoAtual, carteiras, metodologia, ofertas, atualizarDados, temAcompanhamento, decidirReserva } = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const [parabens, setParabens] = useState(false);
  const [editar, setEditar] = useState<{ aberto: boolean; foco?: keyof DadosFinanceiros }>({ aberto: false });
  const r = alunoAtual?.resultado;
  const [sim, setSim] = useState({ capital: r?.capital ?? 0, aporte: r?.aporteMensal ?? 0 });

  useEffect(() => {
    if (params.get("novo") === "1") setParabens(true);
  }, [params]);
  useEffect(() => {
    if (r) setSim({ capital: r.capital, aporte: r.aporteMensal });
  }, [r?.capital, r?.aporteMensal]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!r || !alunoAtual)
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p className="text-lg">Responda o questionário para gerar o seu plano de investimentos.</p>
        <Link href="/app/questionario" className="btn-ouro mt-5">
          Responder questionário
        </Link>
      </Card>
    );

  const carteira = carteiras.find((c) => c.codigo === r.codigo)!;
  const rs = reserva(r, metodologia);
  const nome = alunoAtual.nome.split(" ")[0];
  const simulando = sim.capital !== r.capital || sim.aporte !== r.aporteMensal;
  const travado = !rs.completa && !alunoAtual.reservaDecisao;
  const noPreco = carteira.ativos.filter((a) => a.visivel && statusPreco(a) === "faixa").length;
  const mostrarPopup = parabens && ofertas.acompanhamento.locais.popup && !temAcompanhamento;

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-[28px] p-6 text-white sm:p-9" style={{ background: "radial-gradient(110% 140% at 100% 0%, #24405F 0%, #10233A 55%, #0E2A35 100%)" }}>
        <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="text-[13px] font-semibold tracking-wide text-ouro">Carteira {r.codigo}</p>
            <h1 className="mt-1 text-[2.1rem] font-bold leading-[1.08] sm:text-[2.7rem]">{carteira.nome}</h1>
            <p className="mt-2 max-w-2xl text-white/75">{carteira.resumo}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[PERFIL_LABEL[r.perfil], OBJETIVO_CURTO[r.objetivo], RISCO_PERFIL[r.perfil], `${noPreco} na faixa de compra`].map((c) => (
                <span key={c} className="rounded-full bg-white/[0.08] px-3 py-1 text-[13.5px] font-semibold ring-1 ring-white/20">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[13px] text-white/55">
              Carteira de {nome}, gerada em {dataBR(r.geradoEm)}
              {r.atualizadoEm !== r.geradoEm ? `, atualizada em ${dataBR(r.atualizadoEm)}` : ""}
            </p>
          </div>
          <RoscaCarteira carteira={carteira} codigo={r.codigo} />
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 rounded-[20px] bg-white p-4 ring-1 ring-ink/[0.07] sm:p-5">
        <SeletorCarteira />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditar({ aberto: true })} className="btn-linha py-2.5 text-[15px]">
            <PencilLine size={17} /> Atualizar meus dados
          </button>
          <Link href="/app/plano/pdf" className="btn-linha py-2.5 text-[15px]">
            <FileDown size={17} /> Exportar PDF
          </Link>
        </div>
      </div>

      <div className="mt-10 space-y-12">
        <Etapa n={1} titulo="Seu perfil e objetivo" id="perfil">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <IconChip icon={UserRound} tom="azul" />
                <div>
                  <p className="text-sm text-ink-mute">Perfil de investidor</p>
                  <p className={`font-display text-xl font-bold ${PERFIL_TEXTO[r.perfil]}`}>{PERFIL_LABEL[r.perfil]}</p>
                </div>
              </div>
              <p className="mt-3 text-ink-soft">{PERFIL_EXPLICACAO[r.perfil]}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <IconChip icon={Target} tom="ouro" />
                <div>
                  <p className="text-sm text-ink-mute">Objetivo financeiro</p>
                  <p className="font-display text-xl font-bold">{OBJETIVO_LABEL[r.objetivo]}</p>
                </div>
              </div>
              <p className="mt-3 text-ink-soft">{OBJETIVO_EXPLICACAO[r.objetivo]}</p>
            </Card>
          </div>
          <p className={`mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-[15px] ${rs.completa ? "bg-folha-soft text-ink" : "bg-ouro-soft/70 text-ink"}`}>
            {rs.completa ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-folha" /> : <LifeBuoy size={20} className="mt-0.5 shrink-0 text-ouro-deep" />}
            {rs.completa
              ? "Sua reserva de emergência está completa. Está tudo pronto para você seguir com a carteira."
              : `Antes de investir na carteira, complete sua reserva de emergência: faltam ${brl(rs.falta)}. Veja abaixo por que ela é tão importante.`}
          </p>
        </Etapa>

        <Etapa n={2} titulo="Sua reserva de emergência" id="reserva">
          {travado ? (
            <AvisoReserva />
          ) : (
            <>
          <Card className="p-6 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-4xl font-bold">{rs.pct}%</span>
                  <span className="text-sm text-ink-mute">
                    {brl(r.reservaAtual)} de {brl(rs.ideal)}
                  </span>
                </div>
                <div className="mt-3">
                  <Barra pct={rs.pct} cor={rs.completa ? "bg-folha" : "bg-ouro"} altura="h-3" />
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-paper p-3">
                    <dt className="text-ink-mute">Reserva ideal</dt>
                    <dd className="font-display text-lg font-bold">{brl(rs.ideal)}</dd>
                    <dd className="text-[12px] text-ink-mute">
                      {metodologia.mesesReserva} × {brl(r.gastosMensais)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-paper p-3">
                    <dt className="text-ink-mute">Cobre hoje</dt>
                    <dd className="font-display text-lg font-bold">{rs.mesesCobertos.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses</dd>
                  </div>
                  <div className="rounded-xl bg-paper p-3">
                    <dt className="text-ink-mute">Falta</dt>
                    <dd className={`font-display text-lg font-bold ${rs.completa ? "text-folha" : "text-ouro-deep"}`}>{rs.completa ? "Nada" : brl(rs.falta)}</dd>
                    {rs.mesesParaCompletar > 0 && <dd className="text-[12px] text-ink-mute">≈ {rs.mesesParaCompletar} meses de aporte</dd>}
                  </div>
                </dl>
                <button type="button" onClick={() => setEditar({ aberto: true, foco: "reservaAtual" })} className="btn-linha mt-5 w-full sm:w-auto">
                  <LifeBuoy size={17} /> Atualizar reserva de emergência
                </button>
              </div>
              <div className="rounded-2xl bg-paper p-5">
                <p className="font-semibold">Por que a reserva vem primeiro</p>
                <p className="mt-1.5 text-ink-soft">{metodologia.textoReserva}</p>
                <p className="mt-4 text-sm font-semibold text-ink-soft">Onde guardar</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Tesouro Selic", "CDB de liquidez diária"].map((x) => (
                    <span key={x} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-ink/10">
                      {x}
                    </span>
                  ))}
                </div>
                {!rs.completa && r.capital > 0 && (
                  <p className="mt-4 text-[15px] text-ink-soft">
                    {r.capital >= rs.falta
                      ? `Dica: dos ${brl(r.capital)} disponíveis, separe ${brl(rs.falta)} para a reserva e use ${brl(r.capital - rs.falta)} no plano abaixo.`
                      : `Dica: pela metodologia, os ${brl(r.capital)} disponíveis devem ir primeiro para a reserva.`}
                  </p>
                )}
              </div>
            </div>
          </Card>
            </>
          )}
        </Etapa>

        {!travado && (
          <>
        <Etapa n={3} titulo="Sua carteira de investimentos" id="carteira">
          {!rs.completa && alunoAtual.reservaDecisao === "sem_reserva" && (
            <p className="-mt-1 mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-ouro-soft/60 px-4 py-2.5 text-[14px] text-ink-soft">
              Você optou por começar a investir antes de completar a reserva.
              <button type="button" onClick={() => decidirReserva(undefined)} className="font-semibold text-ink underline underline-offset-2">
                Rever orientação
              </button>
            </p>
          )}
          <p className="-mt-1 mb-5 max-w-3xl text-ink-soft">
            {carteira.resumo} <span className="text-ink-mute">{carteira.estrategia}</span>
          </p>
          <PainelCarteira
            carteira={carteira}
            capital={sim.capital}
            aporte={sim.aporte}
            onCapital={(v) => setSim({ ...sim, capital: v })}
            onAporte={(v) => setSim({ ...sim, aporte: v })}
            salvar={{ mudou: simulando, onSalvar: () => atualizarDados({ capital: sim.capital, aporteMensal: sim.aporte }), onVoltar: () => setSim({ capital: r.capital, aporte: r.aporteMensal }) }}
            lateral={
              <>
                <SeusDados onEditar={() => setEditar({ aberto: true })} />
                <AulasDaCarteira compacto limite={4} />
              </>
            }
          />
        </Etapa>

        <Etapa n={4} titulo={temAcompanhamento ? "Seu acompanhamento" : "Quer ajuda para colocar em prática?"}>
          <AcompanhamentoVitrine variante="plano" />
        </Etapa>
          </>
        )}
      </div>

      <AtualizarDadosModal aberto={editar.aberto} foco={editar.foco} onFechar={() => setEditar({ aberto: false })} />

      <Modal aberto={mostrarPopup} onFechar={() => (setParabens(false), router.replace("/app/plano"))} largura="max-w-lg">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ouro-soft text-3xl" aria-hidden="true">
            🎉
          </span>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight">Parabéns! Seu plano de investimentos está pronto!</h2>
          <p className="mt-3 text-ink-soft">Com base nas suas respostas, preparamos um plano de investimentos alinhado ao seu perfil e aos seus objetivos financeiros.</p>
          <div className="mt-5 rounded-2xl bg-paper p-4 text-left">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Sparkles size={17} className="text-ouro-deep" /> Novidade
            </p>
            <p className="mt-1 text-[15px] text-ink-soft">
              Você pode seguir seu plano por conta própria, ou optar pelo <strong>Acompanhamento Individual Humanizado</strong> e ter orientação do Renan e sua equipe para colocar tudo em prática com mais confiança e agilidade. Ao final do seu plano, você conhece todos os benefícios.
            </p>
          </div>
          <p className="mt-4 text-ink-soft">Sucesso e bons investimentos! 🚀</p>
          <button type="button" onClick={() => (setParabens(false), router.replace("/app/plano"))} className="btn-primario mt-6 w-full text-[17px]">
            Ver meu plano de investimentos
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function PaginaPlano() {
  return (
    <Suspense fallback={<p className="text-ink-mute">Carregando…</p>}>
      <Plano />
    </Suspense>
  );
}
