"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, ClipboardList, DollarSign, Gem, Link2, MessageCircle, PieChart, RefreshCw, UserPlus, Zap } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { GraficoLinha, Rosca } from "@/components/charts";
import { Avatar, Barra, Card, IconChip, Indicador, Segmentado, Selo, Variacao } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { BASE_ALUNOS, DUVIDAS_FREQUENTES, SERIE } from "@/lib/data";
import { codigoCarteira } from "@/lib/quiz";
import { brl, brlCompacto, dataLonga, diasAtras, OBJETIVOS, OBJETIVO_CURTO, PERFIS, PERFIL_HEX, PERFIL_LABEL } from "@/lib/labels";

type Periodo = "7" | "30" | "90";
type Metrica = "receita" | "vendas" | "planos";

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function VisaoGeral() {
  const { alunos, transacoes, simularVenda, atualizarCotacoes, mentor } = useDemo();
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [metrica, setMetrica] = useState<Metrica>("receita");
  const [aviso, setAviso] = useState<string | null>(null);
  const n = Number(periodo);

  const dados = useMemo(() => {
    const atual = SERIE.slice(-n);
    const anterior = SERIE.slice(-2 * n, -n);
    const soma = (arr: typeof SERIE, k: keyof (typeof SERIE)[number]) => arr.reduce((s, d) => s + (d[k] as number), 0);
    const delta = (k: keyof (typeof SERIE)[number]) => ((soma(atual, k) - soma(anterior, k)) / Math.max(1, soma(anterior, k))) * 100;
    return {
      atual,
      receita: soma(atual, "receita"),
      vendas: soma(atual, "vendas"),
      upsells: soma(atual, "upsells"),
      planos: soma(atual, "planos"),
      mensagens: soma(atual, "mensagens"),
      dReceita: delta("receita"),
      dVendas: delta("vendas"),
      dPlanos: delta("planos"),
      dUpsell: (soma(atual, "upsells") / Math.max(1, soma(atual, "vendas")) - soma(anterior, "upsells") / Math.max(1, soma(anterior, "vendas"))) * 100,
    };
  }, [n]);

  const comPlano = alunos.filter((a) => a.status === "ativo" && a.resultado);
  const contagens: Record<string, number> = {};
  comPlano.forEach((a) => (contagens[a.resultado!.codigo] = (contagens[a.resultado!.codigo] ?? 0) + 1));
  const porPerfil = PERFIS.map((p) => ({ rotulo: PERFIL_LABEL[p], cor: PERFIL_HEX[p], valor: comPlano.filter((a) => a.resultado!.perfil === p).length }));
  const ativos = alunos.filter((a) => a.status === "ativo");
  const funil = [
    { r: "Acessaram a plataforma", v: ativos.length },
    { r: "Assistiram ao vídeo de boas-vindas", v: ativos.filter((a) => a.viuBoasVindas).length },
    { r: "Geraram o plano", v: comPlano.length },
    { r: "Compraram o acompanhamento", v: ativos.filter((a) => a.produtos.includes("acompanhamento")).length },
  ];
  const custoIA = dados.mensagens * 0.004;
  const mensal = (k: Metrica) => (k === "receita" ? (v: number) => brlCompacto(v) : (v: number) => String(Math.round(v)));
  const gateways = (["Hotmart", "PayT"] as const).map((g) => {
    const t = transacoes.filter((x) => x.gateway === g && x.status === "aprovado");
    return { g, total: t.reduce((s, x) => s + x.valor, 0), qtd: t.length };
  });
  const maxG = Math.max(...gateways.map((g) => g.total));

  const flash = (m: string) => {
    setAviso(m);
    setTimeout(() => setAviso(null), 3000);
  };

  return (
    <>
      <TituloPagina
        sobre={dataLonga()}
        titulo={`${saudacao()}, Renan`}
        descricao="Acompanhe vendas, planos gerados e o uso do Mentor 24h."
        acao={
          <Segmentado
            itens={[
              { id: "7", rotulo: "7 dias" },
              { id: "30", rotulo: "30 dias" },
              { id: "90", rotulo: "90 dias" },
            ]}
            valor={periodo}
            onChange={setPeriodo}
          />
        }
      />
      {aviso && <p className="mb-5 rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">{aviso}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Indicador rotulo="Receita" valor={brlCompacto(dados.receita)} icon={DollarSign} tom="azul" rodape={<><Variacao valor={dados.dReceita} /> vs. período anterior</>} />
        <Indicador rotulo="Novos alunos" valor={dados.vendas.toLocaleString("pt-BR")} icon={UserPlus} tom="folha" rodape={<><Variacao valor={dados.dVendas} /> acesso vitalício</>} />
        <Indicador rotulo="Planos gerados" valor={dados.planos.toLocaleString("pt-BR")} icon={ClipboardList} tom="ouro" rodape={<><Variacao valor={dados.dPlanos} /> questionários</>} />
        <Indicador rotulo="Conversão do acompanhamento" valor={`${((dados.upsells / dados.vendas) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`} icon={Gem} tom="alerta" rodape={<><Variacao valor={dados.dUpsell} sufixo=" p.p." /> {dados.upsells} vendas</>} />
        <Indicador rotulo="Mensagens ao Mentor" valor={dados.mensagens.toLocaleString("pt-BR")} icon={Bot} tom="roxo" rodape={<>Custo estimado <strong className="text-ink">{brl(custoIA, 2)}</strong></>} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Desempenho</h2>
              <p className="text-sm text-ink-mute">
                {metrica === "receita" ? "Receita" : metrica === "vendas" ? "Vendas" : "Planos gerados"} nos últimos {n} dias:{" "}
                <strong className="text-ink">{metrica === "receita" ? brl(dados.receita) : dados[metrica].toLocaleString("pt-BR")}</strong>
              </p>
            </div>
            <Segmentado
              itens={[
                { id: "receita", rotulo: "Receita" },
                { id: "vendas", rotulo: "Vendas" },
                { id: "planos", rotulo: "Planos" },
              ]}
              valor={metrica}
              onChange={setMetrica}
            />
          </div>
          <div className="mt-4">
            <GraficoLinha valores={dados.atual.map((d) => d[metrica])} rotulos={dados.atual.map((d) => d.dia.slice(8, 10) + "/" + d.dia.slice(5, 7))} formatar={mensal(metrica)} cor={metrica === "receita" ? "#2F8F6B" : metrica === "vendas" ? "#2F6FB1" : "#C9731E"} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Alunos por perfil e objetivo</h2>
              <p className="text-sm text-ink-mute">Base de demonstração, por plano gerado</p>
            </div>
            <Link href="/admin/alunos" className="text-sm font-semibold text-ink-soft underline underline-offset-2">
              Ver alunos
            </Link>
          </div>
          <div className="mt-4">
            <Rosca segmentos={porPerfil} centro={String(comPlano.length)} legenda="com plano" tamanho={176} />
          </div>
          <table className="mt-5 w-full border-separate border-spacing-1 text-center text-sm">
            <thead>
              <tr>
                <th />
                {OBJETIVOS.map((o) => (
                  <th key={o} className="pb-1 text-[12px] font-semibold leading-tight text-ink-mute">
                    {OBJETIVO_CURTO[o]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFIS.map((p) => (
                <tr key={p}>
                  <th className="pr-1 text-left text-[13px] font-semibold">
                    <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PERFIL_HEX[p] }} />
                    {PERFIL_LABEL[p]}
                  </th>
                  {OBJETIVOS.map((o) => {
                    const c = codigoCarteira(p, o);
                    return (
                      <td key={o} className="rounded-lg py-2" style={{ background: `${PERFIL_HEX[p]}${Math.min(200, 26 + (contagens[c] ?? 0) * 18).toString(16).padStart(2, "0")}` }}>
                        <span className="text-[12px] font-semibold text-ink-soft">{c}</span> <strong>{contagens[c] ?? 0}</strong>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">Jornada do aluno</h2>
          <p className="text-sm text-ink-mute">Base de demonstração, do acesso à compra</p>
          <ul className="mt-5 space-y-4">
            {funil.map((f, i) => (
              <li key={f.r}>
                <div className="mb-1.5 flex justify-between gap-2 text-[15px]">
                  <span>{f.r}</span>
                  <span className="whitespace-nowrap">
                    {i > 0 && <span className="mr-2 text-[13px] text-ink-mute">{Math.round((f.v / funil[0].v) * 100)}%</span>}
                    <strong>{f.v}</strong>
                  </span>
                </div>
                <Barra pct={(f.v / funil[0].v) * 100} cor={i === funil.length - 1 ? "bg-ouro" : "bg-azul"} />
              </li>
            ))}
          </ul>
          <p className="mt-5 flex gap-2 rounded-xl bg-folha-soft px-3.5 py-3 text-sm text-ink-soft">
            <Zap size={16} className="mt-0.5 shrink-0 text-folha" />
            {comPlano.length - funil[3].v} alunos com plano ainda não têm o acompanhamento. Filtre por capital em Alunos para um pós-venda direcionado.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Vendas recentes</h2>
              <p className="text-sm text-ink-mute">Atualizado automaticamente via webhook</p>
            </div>
            <Link href="/admin/pagamentos" className="text-sm font-semibold text-ink-soft underline underline-offset-2">
              Ver todas
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-ink/[0.06]">
            {transacoes.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <Avatar nome={t.cliente} tamanho={34} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{t.cliente}</span>
                  <span className="block truncate text-[13px] text-ink-mute">
                    {t.produto.includes("Acompanhamento") ? "Acompanhamento" : "GPS Financeiro"}, {diasAtras(t.data)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[15px] font-semibold">{brl(t.valor)}</span>
                  <Selo tom={t.status === "aprovado" ? "folha" : t.status === "pendente" ? "ouro" : "alerta"} className="text-[11px]">
                    {t.status === "aprovado" ? "Aprovado" : t.status === "pendente" ? "Pendente" : "Reembolso"}
                  </Selo>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold">Ações rápidas</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { icon: Zap, t: "Simular venda", fn: () => (simularVenda(), flash("Venda simulada: webhook recebido e aluno criado.")) },
                { icon: Link2, t: "Copiar link de login", fn: () => (navigator.clipboard?.writeText(location.origin).catch(() => {}), flash("Link copiado.")) },
                { icon: RefreshCw, t: "Atualizar cotações", fn: () => (atualizarCotacoes(), flash("Cotações atualizadas e status recalculados.")) },
                { icon: PieChart, t: "Editar carteiras", href: "/admin/carteiras" },
              ].map((a) =>
                a.href ? (
                  <Link key={a.t} href={a.href} className="flex flex-col gap-3 rounded-2xl p-3.5 ring-1 ring-ink/10 hover:ring-ink/30">
                    <IconChip icon={a.icon} tom="azul" tamanho={32} />
                    <span className="text-sm font-semibold leading-tight">{a.t}</span>
                  </Link>
                ) : (
                  <button key={a.t} type="button" onClick={a.fn} className="flex flex-col gap-3 rounded-2xl p-3.5 text-left ring-1 ring-ink/10 hover:ring-ink/30">
                    <IconChip icon={a.icon} tom="azul" tamanho={32} />
                    <span className="text-sm font-semibold leading-tight">{a.t}</span>
                  </button>
                ),
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold">Vendas por gateway</h2>
            <ul className="mt-4 space-y-4">
              {gateways.map((g) => (
                <li key={g.g}>
                  <div className="mb-1.5 flex justify-between text-[15px]">
                    <span className="font-semibold">{g.g}</span>
                    <span>
                      <strong>{brl(g.total)}</strong> <span className="text-[13px] text-ink-mute">{g.qtd} vendas</span>
                    </span>
                  </div>
                  <Barra pct={(g.total / maxG) * 100} cor={g.g === "Hotmart" ? "bg-arrojado" : "bg-alerta"} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Dúvidas mais frequentes no Mentor 24h</h2>
              <p className="text-sm text-ink-mute">Use para criar novas aulas e materiais</p>
            </div>
            <Link href="/admin/mentor" className="text-sm font-semibold text-ink-soft underline underline-offset-2">
              Configurar Mentor
            </Link>
          </div>
          <ol className="mt-5 space-y-4">
            {DUVIDAS_FREQUENTES.map((d, i) => (
              <li key={d.pergunta} className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-paper text-sm font-semibold text-ink-soft">{i + 1}</span>
                <div className="flex-1">
                  <div className="mb-1.5 flex justify-between gap-3 text-[15px]">
                    <span className="font-semibold">{d.pergunta}</span>
                    <span className="whitespace-nowrap text-sm text-ink-mute">{d.total} perguntas</span>
                  </div>
                  <Barra pct={(d.total / DUVIDAS_FREQUENTES[0].total) * 100} cor="bg-roxo" />
                </div>
              </li>
            ))}
          </ol>
        </Card>
        <section className="rounded-[20px] bg-ink p-6 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-ouro">
              <MessageCircle size={20} />
            </span>
            <div>
              <p className="font-display font-bold">Mentor 24h</p>
              <p className="text-[13px] text-white/60">{mentor.modelo}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-white/60">Custo por aluno ativo</p>
          <p className="font-display text-[2.4rem] font-bold leading-none">
            {brl(custoIA / (n / 30) / BASE_ALUNOS, 2)}
            <span className="text-base font-semibold text-white/60">/mês</span>
          </p>
          <p className="mt-4 text-sm text-white/70">
            Base de {BASE_ALUNOS.toLocaleString("pt-BR")} alunos. Respostas curtas, limite de {mentor.limites.mensagensPorDia} perguntas por dia e respostas por regras para perguntas simples. O aluno não paga mensalidade de IA.
          </p>
          <Link href="/admin/mentor?aba=consumo" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ouro underline underline-offset-2">
            Ver consumo detalhado
          </Link>
        </section>
      </div>
    </>
  );
}
