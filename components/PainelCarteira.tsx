"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Info, MessageCircle, PlayCircle, RefreshCw } from "lucide-react";
import { distribuir, fmtCotacao, fmtFaixa, statusPreco, STATUS_FAIXA_LABEL, type StatusFaixa } from "@/lib/quiz";
import { brl, CLASSE_COR, dataHoraBR } from "@/lib/labels";
import { useDemo } from "@/lib/store";
import { Card, Segmentado } from "./ui";
import type { Ativo, Carteira, ClasseAtivo } from "@/lib/types";

/** Blocos de classes exibidos ao aluno, cada um como um painel separado. */
const GRUPOS: { titulo: string; descricao: string; classes: ClasseAtivo[]; cor: string }[] = [
  { titulo: "Renda fixa", descricao: "Títulos do governo, de bancos e operações com garantia. Dão estabilidade e previsibilidade ao plano.", classes: ["tesouro", "cdb", "garantia_r7"], cor: "#2F6FB1" },
  { titulo: "Fundos imobiliários", descricao: "Reúnem imóveis ou recebíveis. Muitos pagam rendimentos mensais e o preço oscila na bolsa.", classes: ["fii"], cor: "#2F8F6B" },
  { titulo: "Ações", descricao: "Participação em empresas. Podem pagar dividendos e oscilam mais no curto prazo.", classes: ["acao"], cor: "#C9731E" },
  { titulo: "ETFs e BDRs", descricao: "Várias empresas em uma única compra, incluindo gigantes internacionais pela bolsa brasileira.", classes: ["etf", "bdr"], cor: "#6B5BD2" },
  { titulo: "Exterior", descricao: "Fundos que investem fora do Brasil, como as 500 maiores empresas dos Estados Unidos.", classes: ["etf_int"], cor: "#B83A4B" },
];

const SELO: Record<StatusFaixa, string> = {
  faixa: "bg-folha-soft text-folha",
  abaixo: "bg-azul-soft text-azul",
  acima: "bg-paper-deep text-ink-mute",
  sem: "bg-paper text-ink-mute",
};
const COR_STATUS: Record<StatusFaixa, string> = { faixa: "#2F8F6B", abaixo: "#2F6FB1", acima: "#7C9296", sem: "#7C9296" };

function sigla(a: Ativo) {
  if (a.classe === "tesouro") return a.nome.includes("Selic") ? "SELIC" : `IPCA${a.nome.match(/\d{2}(\d{2})/)?.[1] ?? ""}`;
  if (a.classe === "cdb") return "CDB";
  if (a.classe === "garantia_r7") return "R7";
  return a.codigo.replace(/\d+$/, "").slice(0, 4);
}

/** Série ilustrativa determinística que termina na cotação atual. */
function serie(a: Ativo) {
  let semente = [...a.id + a.codigo].reduce((s, c) => s + c.charCodeAt(0) * 31, 7);
  const rnd = () => ((semente = (semente * 9301 + 49297) % 233280) / 233280);
  const fim = a.cotacao ?? 1;
  const pts = [fim];
  for (let i = 0; i < 23; i++) pts.unshift(pts[0] * (1 + (rnd() - 0.5) * 0.06));
  return pts;
}

/** Logo real do ativo quando cadastrada no painel; senão, a sigla na cor da classe. */
export function LogoAtivo({ a, tamanho = 56 }: { a: Ativo; tamanho?: number }) {
  if (a.logoUrl)
    return (
      <span className="grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10" style={{ width: tamanho, height: tamanho }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.logoUrl} alt={`Logo ${a.nome}`} className="h-[78%] w-[78%] object-contain" />
      </span>
    );
  return (
    <span className="grid shrink-0 place-items-center rounded-2xl font-display font-bold tracking-tight text-white" style={{ width: tamanho, height: tamanho, background: CLASSE_COR[a.classe], fontSize: tamanho * 0.23 }}>
      {sigla(a)}
    </span>
  );
}

function Sparkline({ a, status }: { a: Ativo; status: StatusFaixa }) {
  const pts = serie(a);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const W = 120;
  const H = 30;
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - 3 - ((v - min) / (max - min || 1)) * (H - 6)]);
  const linha = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-[120px]" aria-hidden="true">
      <path d={`${linha} L${W},${H} L0,${H} Z`} fill={COR_STATUS[status]} opacity="0.1" />
      <path d={linha} fill="none" stroke={COR_STATUS[status]} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BarraFaixa({ a }: { a: Ativo }) {
  if (a.teto === undefined || a.cotacao === undefined) return null;
  const ini = a.compraMin ?? a.teto * 0.9;
  const pad = (a.teto - ini) * 0.7 || a.teto * 0.05;
  const lo = Math.min(ini, a.cotacao) - pad;
  const hi = Math.max(a.teto, a.cotacao) + pad;
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <div className="relative my-2 h-2 rounded-full bg-paper-deep" role="img" aria-label={`Cotação ${fmtCotacao(a, a.cotacao)}, faixa de compra ${fmtFaixa(a, a.compraMin, a.teto)}`}>
      <div className="absolute inset-y-0 rounded-full bg-folha/35" style={{ left: `${pos(ini)}%`, width: `${pos(a.teto) - pos(ini)}%` }} />
      <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow" style={{ left: `${pos(a.cotacao)}%` }} />
    </div>
  );
}

function CartaoAtivo({ a, agora, mensal, modo, cotas, aulaTitulo }: { a: Ativo; agora: number; mensal: number; modo: "agora" | "mensal"; cotas?: number; aulaTitulo?: string }) {
  const st = statusPreco(a);
  const taxa = (a.formato ?? "reais") !== "reais";
  return (
    <article className="rounded-[20px] bg-white p-4 ring-1 ring-ink/[0.08] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-3.5">
          <LogoAtivo a={a} />
          <div className="min-w-0">
            <p className="text-[16.5px] font-semibold leading-snug">{a.nome}</p>
            <p className="text-[13.5px] text-ink-mute">
              {a.codigo}, {a.pct}% do plano, risco {a.risco.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-end justify-between gap-3 sm:block sm:w-auto sm:text-right">
          <div className="flex gap-5 sm:block">
            <div className={modo === "agora" ? "" : "opacity-70"}>
              <p className={`font-display font-bold leading-none tabular-nums ${modo === "agora" ? "text-[1.55rem]" : "text-[1.15rem]"}`}>{brl(agora, 2)}</p>
              <p className="mt-1 text-[13px] text-ink-mute">
                investir agora{cotas !== undefined && cotas > 0 ? `, ≈ ${cotas} cotas` : ""}
              </p>
            </div>
            <div className={`sm:mt-2.5 ${modo === "mensal" ? "" : "opacity-80"}`}>
              <p className={`font-display font-bold leading-none tabular-nums ${modo === "mensal" ? "text-[1.55rem]" : "text-[1.15rem]"}`}>{brl(mensal, 2)}</p>
              <p className="mt-1 text-[13px] text-ink-mute">por mês</p>
            </div>
          </div>
          {st !== "sem" && (
            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold sm:mt-2.5 ${SELO[st]}`}>
              <span className="h-2 w-2 rounded-full" style={{ background: COR_STATUS[st] }} />
              {STATUS_FAIXA_LABEL[st]}
            </span>
          )}
        </div>
      </div>

      {a.cotacao !== undefined && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-paper/70 p-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-[12.5px] text-ink-mute">{taxa ? "Taxa ilustrativa" : "Cotação ilustrativa"}</p>
              <p className="font-semibold tabular-nums">{fmtCotacao(a, a.cotacao)}</p>
            </div>
            <BarraFaixa a={a} />
            <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[13px] text-ink-soft">
              {a.teto !== undefined && (
                <span>
                  <span className="font-semibold text-folha">Compra:</span> {fmtFaixa(a, a.compraMin, a.teto)}
                </span>
              )}
              {(a.precoVenda !== undefined || a.vendaMax !== undefined) && (
                <span>
                  <span className="font-semibold text-ink">Venda:</span> {fmtFaixa(a, a.precoVenda, a.vendaMax)}
                </span>
              )}
            </div>
          </div>
          <Sparkline a={a} status={st} />
        </div>
      )}

      <div className="mt-4 border-t border-ink/[0.07] pt-3 text-[14px] text-ink-soft">
        <p>
          {a.explicacao} <span className="text-ink">Onde comprar:</span> {a.comoComprar}
        </p>
        {aulaTitulo && a.aulaId && (
          <Link href={`/app/aulas/${a.aulaId}`} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-azul hover:underline">
            <PlayCircle size={16} /> Aula: {aulaTitulo}
          </Link>
        )}
      </div>
    </article>
  );
}

export function Calculadora({
  modo,
  onModo,
  capital,
  aporte,
  onCapital,
  onAporte,
  nomeCarteira,
  salvar,
}: {
  modo: "agora" | "mensal";
  onModo: (m: "agora" | "mensal") => void;
  capital: number;
  aporte: number;
  onCapital: (v: number) => void;
  onAporte: (v: number) => void;
  nomeCarteira: string;
  salvar?: { mudou: boolean; onSalvar: () => void; onVoltar: () => void };
}) {
  const { abrirMentor } = useDemo();
  const valor = modo === "agora" ? capital : aporte;
  const set = modo === "agora" ? onCapital : onAporte;
  return (
    <Card className="p-5">
      <p className="text-[13px] font-semibold text-ouro-deep">Calculadora</p>
      <h3 className="mt-0.5 font-display text-[1.45rem] font-bold leading-tight">Quanto vai para cada ativo</h3>
      <div className="mt-4">
        <Segmentado
          itens={[
            { id: "agora", rotulo: "Valor de agora" },
            { id: "mensal", rotulo: "Aporte mensal" },
          ]}
          valor={modo}
          onChange={onModo}
        />
      </div>
      <label htmlFor="calc-valor" className="mt-4 block text-sm text-ink-soft">
        {modo === "agora" ? "Quanto você quer investir agora?" : "Quanto você vai investir por mês?"}
      </label>
      <div className="mt-1.5 flex items-center rounded-2xl border border-ink/15 bg-white px-4 focus-within:border-ink">
        <span className="text-sm font-semibold text-ink-mute">R$</span>
        <input
          id="calc-valor"
          inputMode="numeric"
          value={valor ? valor.toLocaleString("pt-BR") : ""}
          placeholder="0"
          onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || 0)}
          className="w-full bg-transparent px-2 py-3 font-display text-[1.7rem] font-bold text-ink focus:outline-none"
        />
      </div>
      <p className="mt-4 font-display text-[1.9rem] font-bold leading-none">{brl(valor, 2)}</p>
      <p className="mt-2 text-[13.5px] text-ink-mute">
        Os percentuais ficam fixos. Só o valor em reais muda, na hora. A soma segue a carteira {nomeCarteira}.
      </p>
      <p className="mt-2 text-[13.5px] text-ink-soft">{modo === "agora" ? `Aporte mensal: ${brl(aporte)}` : `Valor de agora: ${brl(capital)}`}</p>
      {salvar?.mudou && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper p-2.5 text-sm">
          <button type="button" onClick={salvar.onVoltar} className="font-semibold text-ink-mute underline underline-offset-2">
            Voltar aos meus valores
          </button>
          <button type="button" onClick={salvar.onSalvar} className="rounded-lg bg-ink px-3 py-1.5 font-semibold text-white">
            Salvar no meu plano
          </button>
        </div>
      )}
      <button type="button" onClick={() => abrirMentor("Como funciona a calculadora do plano?")} className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-ink/15 hover:ring-ink/35">
        <MessageCircle size={15} /> Tirar uma dúvida sem sair do assunto
      </button>
    </Card>
  );
}

/** Rosca da distribuição por bloco, com o código da carteira no centro (fundo escuro). */
export function RoscaCarteira({ carteira, codigo }: { carteira: Carteira; codigo: string }) {
  const visiveis = carteira.ativos.filter((a) => a.visivel);
  const total = visiveis.reduce((s, a) => s + a.pct, 0) || 1;
  const segs = GRUPOS.map((g) => ({ cor: g.cor, rotulo: g.titulo, v: visiveis.filter((a) => g.classes.includes(a.classe)).reduce((s, a) => s + a.pct, 0) })).filter((g) => g.v > 0);
  const R = 62;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative mx-auto h-[128px] w-[128px] shrink-0 sm:h-[170px] sm:w-[170px] md:mx-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={segs.map((g) => `${g.rotulo} ${Math.round((g.v / total) * 100)}%`).join(", ")}>
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        {segs.map((g) => {
          const f = g.v / total;
          const el = <circle key={g.rotulo} cx="80" cy="80" r={R} fill="none" stroke={g.cor === "#2F6FB1" ? "#4E8FD1" : g.cor} strokeWidth="16" strokeDasharray={`${Math.max(0, f * C - 4)} ${C}`} strokeDashoffset={-acc * C} />;
          acc += f;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-[1.9rem] font-extrabold leading-none text-white sm:text-[2.4rem]">{codigo}</p>
          <p className="mt-1 text-[13px] text-white/65">carteira</p>
        </div>
      </div>
    </div>
  );
}

/** Carteira em painéis por classe, com calculadora ao lado (empilha no celular, sem rolagem lateral). */
export function PainelCarteira({
  carteira,
  capital,
  aporte,
  onCapital,
  onAporte,
  salvar,
  lateral,
}: {
  carteira: Carteira;
  capital: number;
  aporte: number;
  onCapital: (v: number) => void;
  onAporte: (v: number) => void;
  salvar?: { mudou: boolean; onSalvar: () => void; onVoltar: () => void };
  lateral?: React.ReactNode;
}) {
  const { metodologia, aulas, cotacoesEm, atualizarCotacoes } = useDemo();
  const [modo, setModo] = useState<"agora" | "mensal">("agora");
  const linhas = distribuir(carteira, capital, aporte);

  const grupos = useMemo(
    () => GRUPOS.map((g) => ({ ...g, itens: linhas.filter((l) => g.classes.includes(l.classe)) })).filter((g) => g.itens.length),
    [linhas],
  );
  const contagem = linhas.reduce((acc, l) => ((acc[statusPreco(l)] += 1), acc), { faixa: 0, abaixo: 0, acima: 0, sem: 0 } as Record<StatusFaixa, number>);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
      <div className="order-2 min-w-0 space-y-8 lg:order-1">
        <Card className="p-5">
          <div className="flex h-3 overflow-hidden rounded-full">
            {grupos.map((g) => (
              <div key={g.titulo} style={{ width: `${g.itens.reduce((s, l) => s + l.pct, 0)}%`, background: g.cor }} />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-ink-soft">
            {grupos.map((g) => (
              <li key={g.titulo} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.cor }} />
                {g.titulo} <strong className="text-ink">{g.itens.reduce((s, l) => s + l.pct, 0)}%</strong>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
            <span className={`rounded-full px-2.5 py-1 font-semibold ${SELO.faixa}`}>{contagem.faixa} na faixa de compra</span>
            <span className={`rounded-full px-2.5 py-1 font-semibold ${SELO.abaixo}`}>{contagem.abaixo} abaixo da faixa</span>
            <span className={`rounded-full px-2.5 py-1 font-semibold ${SELO.acima}`}>{contagem.acima} acima da faixa</span>
          </div>
          <p className="mt-3 text-[13.5px] text-ink-mute">
            O selo compara a cotação com a faixa de compra definida pela metodologia. Acima da faixa: mantenha o valor em renda fixa com liquidez até o preço voltar. Cotações ilustrativas, atualizadas em{" "}
            {dataHoraBR(cotacoesEm)}.{" "}
            <button type="button" onClick={atualizarCotacoes} className="inline-flex items-center gap-1 font-semibold text-ink-soft hover:text-ink">
              <RefreshCw size={13} /> Atualizar
            </button>
          </p>
        </Card>

        {grupos.map((g) => (
          <section key={g.titulo}>
            <h3 className="font-display text-[1.6rem] font-bold leading-tight">{g.titulo}</h3>
            <p className="mb-3 mt-0.5 text-[14.5px] text-ink-mute">{g.descricao}</p>
            <div className="space-y-3">
              {g.itens.map((l) => (
                <CartaoAtivo
                  key={l.id}
                  a={l}
                  agora={l.agora}
                  mensal={l.mensal}
                  modo={modo}
                  cotas={l.cotas}
                  aulaTitulo={aulas.find((x) => x.id === l.aulaId)?.titulo}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="flex items-start gap-2 rounded-2xl bg-azul-soft/70 px-4 py-3 text-[14px] text-ink-soft">
          <Info size={17} className="mt-0.5 shrink-0 text-azul" /> {metodologia.avisoCotacao} {metodologia.avisoPrecos}
        </p>
        {carteira.observacao && <p className="rounded-2xl bg-ouro-soft/60 px-4 py-3 text-[14px] text-ink-soft">{carteira.observacao}</p>}
      </div>

      <aside className="order-1 space-y-4 lg:sticky lg:top-6 lg:order-2">
        <Calculadora modo={modo} onModo={setModo} capital={capital} aporte={aporte} onCapital={onCapital} onAporte={onAporte} nomeCarteira={carteira.codigo} salvar={salvar} />
        {lateral && <div className="hidden space-y-4 lg:block">{lateral}</div>}
      </aside>
      {lateral && <div className="order-3 space-y-4 lg:hidden">{lateral}</div>}
    </div>
  );
}
