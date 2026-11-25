"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Download, Gem, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { Abas, Avatar, Barra, Campo, Card, Interruptor, Modal, Selo } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { reserva } from "@/lib/quiz";
import { brl, dataBR, diasAtras, OBJETIVOS, OBJETIVO_CURTO, PERFIS, PERFIL_LABEL, PERFIL_SUAVE, STATUS_LABEL } from "@/lib/labels";
import type { Aluno, StatusAcesso } from "@/lib/types";

type Aba = "todos" | "ativos" | "sem_plano" | "acompanhamento" | "pendentes" | "bloqueados";
const FAIXAS = [
  { v: 0, r: "Qualquer capital" },
  { v: 10000, r: "A partir de R$ 10 mil" },
  { v: 20000, r: "A partir de R$ 20 mil" },
  { v: 50000, r: "A partir de R$ 50 mil" },
  { v: 100000, r: "A partir de R$ 100 mil" },
  { v: 250000, r: "A partir de R$ 250 mil" },
];
const TOM_STATUS: Record<StatusAcesso, "folha" | "ouro" | "alerta"> = { ativo: "folha", pendente: "ouro", bloqueado: "alerta", reembolsado: "alerta", chargeback: "alerta" };

function Lista() {
  const { alunos, aulas, editarAluno, definirStatus, alternarProduto, adicionarAluno, metodologia } = useDemo();
  const params = useSearchParams();
  const [aba, setAba] = useState<Aba>("todos");
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [capital, setCapital] = useState(Number(params.get("capital")) || 0);
  const [ordem, setOrdem] = useState<"recentes" | "capital">(params.get("ordem") === "capital" ? "capital" : "recentes");
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);

  const filtroAba: Record<Aba, (a: Aluno) => boolean> = {
    todos: () => true,
    ativos: (a) => a.status === "ativo",
    sem_plano: (a) => a.status === "ativo" && !a.resultado,
    acompanhamento: (a) => a.produtos.includes("acompanhamento"),
    pendentes: (a) => a.status === "pendente",
    bloqueados: (a) => ["bloqueado", "reembolsado", "chargeback"].includes(a.status),
  };

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return alunos
      .filter(filtroAba[aba])
      .filter((a) => !b || a.nome.toLowerCase().includes(b) || a.email.includes(b) || a.telefone.includes(b) || a.resultado?.codigo.toLowerCase() === b)
      .filter((a) => !perfil || a.resultado?.perfil === perfil)
      .filter((a) => !objetivo || a.resultado?.objetivo === objetivo)
      .filter((a) => !capital || (a.resultado?.capital ?? 0) >= capital)
      .sort((x, y) => (ordem === "capital" ? (y.resultado?.capital ?? 0) - (x.resultado?.capital ?? 0) : y.compradoEm.localeCompare(x.compradoEm)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunos, aba, busca, perfil, objetivo, capital, ordem]);

  const aberto = alunos.find((a) => a.id === abertoId);
  const capitalFiltrado = lista.reduce((s, a) => s + (a.resultado?.capital ?? 0), 0);

  function exportar() {
    const cab = "nome,email,telefone,status,produtos,perfil,objetivo,carteira,capital,aporte_mensal,renda_mensal\n";
    const linhas = lista.map((a) => [a.nome, a.email, a.telefone, a.status, a.produtos.join("+"), a.resultado?.perfil ?? "", a.resultado?.objetivo ?? "", a.resultado?.codigo ?? "", a.resultado?.capital ?? "", a.resultado?.aporteMensal ?? "", a.resultado?.rendaMensal ?? ""].join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([cab + linhas], { type: "text/csv;charset=utf-8" }));
    const l = document.createElement("a");
    l.href = url;
    l.download = "alunos.csv";
    l.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <TituloPagina
        titulo="Alunos"
        descricao="Gerencie acessos e filtre por perfil, objetivo e capital disponível para fazer o pós-venda certo para cada aluno."
        acao={
          <>
            <button type="button" onClick={exportar} className="btn-linha py-2.5 text-sm">
              <Download size={16} /> Exportar CSV
            </button>
            <button type="button" onClick={() => setNovo(true)} className="btn-primario py-2.5 text-sm">
              <Plus size={16} /> Adicionar aluno
            </button>
          </>
        }
      />

      <Abas
        valor={aba}
        onChange={setAba}
        itens={(
          [
            ["todos", "Todos"],
            ["ativos", "Ativos"],
            ["sem_plano", "Sem plano"],
            ["acompanhamento", "Com acompanhamento"],
            ["pendentes", "Pendentes"],
            ["bloqueados", "Bloqueados e reembolsos"],
          ] as [Aba, string][]
        ).map(([id, rotulo]) => ({ id, rotulo, total: alunos.filter(filtroAba[id]).length }))}
      />

      <Card className="mt-4 overflow-hidden">
        <div className="grid gap-3 border-b border-ink/[0.07] p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" size={17} />
            <input aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, e-mail, telefone ou carteira" className="campo py-2.5 pl-10" />
          </div>
          <select aria-label="Perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)} className="campo py-2.5">
            <option value="">Todos os perfis</option>
            {PERFIS.map((p) => (
              <option key={p} value={p}>
                {PERFIL_LABEL[p]}
              </option>
            ))}
          </select>
          <select aria-label="Objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} className="campo py-2.5">
            <option value="">Todos os objetivos</option>
            {OBJETIVOS.map((o) => (
              <option key={o} value={o}>
                {OBJETIVO_CURTO[o]}
              </option>
            ))}
          </select>
          <select aria-label="Capital" value={capital} onChange={(e) => setCapital(Number(e.target.value))} className="campo py-2.5">
            {FAIXAS.map((f) => (
              <option key={f.v} value={f.v}>
                {f.r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm text-ink-mute">
          <span>
            {lista.length} alunos, capital declarado somado de <strong className="text-ink">{brl(capitalFiltrado)}</strong>
          </span>
          <label className="flex items-center gap-2">
            Ordenar por
            <select value={ordem} onChange={(e) => setOrdem(e.target.value as typeof ordem)} className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-ink">
              <option value="recentes">Entrada mais recente</option>
              <option value="capital">Maior capital</option>
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-[15px]">
            <thead className="border-y border-ink/[0.07] bg-paper/60 text-[13px] text-ink-mute">
              <tr>
                <th className="px-4 py-3 font-semibold">Aluno</th>
                <th className="px-3 py-3 font-semibold">Plano</th>
                <th className="px-3 py-3 text-right font-semibold">Capital</th>
                <th className="px-3 py-3 font-semibold">Situação</th>
                <th className="px-3 py-3 font-semibold">Aulas</th>
                <th className="px-3 py-3 font-semibold">Gateway</th>
                <th className="px-3 py-3 font-semibold">Entrou em</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => {
                const pctAulas = Math.round((a.aulasConcluidas.length / aulas.length) * 100);
                return (
                  <tr key={a.id} onClick={() => setAbertoId(a.id)} className="cursor-pointer border-b border-ink/[0.05] last:border-0 hover:bg-paper/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nome={a.nome} tamanho={38} />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 font-semibold">
                            {a.nome}
                            {a.produtos.includes("acompanhamento") && <Gem size={14} className="text-ouro-deep" aria-label="Tem acompanhamento" />}
                          </span>
                          <span className="block truncate text-[13px] text-ink-mute">{a.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {a.resultado ? (
                        <>
                          <span className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2.5 text-[13px] font-semibold ${PERFIL_SUAVE[a.resultado.perfil]}`}>
                            <span className="rounded-full bg-current px-1.5 py-0.5 text-[11px]">
                              <span className="text-white">{a.resultado.codigo}</span>
                            </span>
                            {PERFIL_LABEL[a.resultado.perfil]}
                          </span>
                          <span className="mt-0.5 block text-[13px] text-ink-mute">{OBJETIVO_CURTO[a.resultado.objetivo]}</span>
                        </>
                      ) : (
                        <span className="text-[13px] text-ink-mute">Sem plano</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {a.resultado ? (
                        <>
                          <span className="block font-semibold">{brl(a.resultado.capital)}</span>
                          <span className="text-[13px] text-ink-mute">+{brl(a.resultado.aporteMensal)}/mês</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Selo tom={TOM_STATUS[a.status]}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {STATUS_LABEL[a.status]}
                      </Selo>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Barra pct={pctAulas} cor="bg-azul" altura="h-1.5" />
                        </div>
                        <span className="text-[13px] text-ink-mute">{pctAulas}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[14px]">
                        <span className={`h-2.5 w-2.5 rounded-full ${a.plataforma === "Hotmart" ? "bg-arrojado" : "bg-alerta"}`} />
                        {a.plataforma}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[14px]">
                      <span className="block">{dataBR(a.compradoEm)}</span>
                      <span className="text-[13px] text-ink-mute">visto {a.ultimoAcesso === "—" ? "nunca" : diasAtras(a.ultimoAcesso)}</span>
                    </td>
                    <td className="pr-3 text-ink-mute">
                      <MoreHorizontal size={18} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lista.length === 0 && <p className="p-8 text-center text-ink-mute">Nenhum aluno com esses filtros. Remova algum filtro para ver mais.</p>}
        </div>
      </Card>

      {aberto && (
        <Detalhe
          aluno={aberto}
          totalAulas={aulas.length}
          mesesReserva={metodologia.mesesReserva}
          onFechar={() => setAbertoId(null)}
          onSalvar={(p) => editarAluno(aberto.id, p)}
          onStatus={(s) => definirStatus(aberto.id, s)}
          onProduto={() => alternarProduto(aberto.id, "acompanhamento")}
          metodologia={metodologia}
        />
      )}
      <NovoAluno aberto={novo} onFechar={() => setNovo(false)} onCriar={adicionarAluno} existe={(e) => alunos.some((a) => a.email === e.trim().toLowerCase())} />
    </>
  );
}

function Detalhe({ aluno, totalAulas, onFechar, onSalvar, onStatus, onProduto, metodologia }: { aluno: Aluno; totalAulas: number; mesesReserva: number; onFechar: () => void; onSalvar: (p: Partial<Aluno>) => void; onStatus: (s: StatusAcesso) => void; onProduto: () => void; metodologia: Parameters<typeof reserva>[1] }) {
  const [form, setForm] = useState({ nome: aluno.nome, email: aluno.email, telefone: aluno.telefone });
  const [salvo, setSalvo] = useState(false);
  const r = aluno.resultado;
  const rs = r ? reserva(r, metodologia) : undefined;
  const mudou = form.nome !== aluno.nome || form.email !== aluno.email || form.telefone !== aluno.telefone;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Detalhes de ${aluno.nome}`}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/40" onClick={onFechar} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-[#F4F7F5] p-6">
        <div className="flex items-start gap-3">
          <Avatar nome={aluno.nome} tamanho={52} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight">{aluno.nome}</h2>
            <p className="text-sm text-ink-mute">
              {aluno.plataforma}, desde {dataBR(aluno.compradoEm)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Selo tom={TOM_STATUS[aluno.status]}>{STATUS_LABEL[aluno.status]}</Selo>
              {aluno.produtos.includes("acompanhamento") && (
                <Selo tom="ouro">
                  <Gem size={12} /> Acompanhamento
                </Selo>
              )}
            </div>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 hover:bg-white">
            <X />
          </button>
        </div>

        <Card className="mt-5 p-4">
          <h3 className="font-display font-bold">Dados cadastrais</h3>
          <div className="mt-3 space-y-3">
            <Campo id="d-nome" rotulo="Nome">
              <input id="d-nome" value={form.nome} onChange={(e) => (setForm({ ...form, nome: e.target.value }), setSalvo(false))} className="campo py-2" />
            </Campo>
            <Campo id="d-email" rotulo="E-mail de acesso" ajuda="Altere só depois de confirmar a identidade e a compra.">
              <input id="d-email" value={form.email} onChange={(e) => (setForm({ ...form, email: e.target.value }), setSalvo(false))} className="campo py-2" />
            </Campo>
            <Campo id="d-tel" rotulo="Telefone / WhatsApp">
              <input id="d-tel" value={form.telefone} onChange={(e) => (setForm({ ...form, telefone: e.target.value }), setSalvo(false))} className="campo py-2" placeholder="(11) 99999-9999" />
            </Campo>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            {salvo ? <span className="text-sm text-folha">Dados salvos.</span> : <span />}
            <button type="button" disabled={!mudou || !form.email.includes("@")} onClick={() => (onSalvar({ ...form, email: form.email.trim().toLowerCase() }), setSalvo(true))} className="btn-primario px-4 py-2 text-sm">
              Salvar dados
            </button>
          </div>
        </Card>

        {r && rs && (
          <Card className="mt-4 p-4">
            <h3 className="font-display font-bold">Plano e situação financeira</h3>
            <dl className="mt-2 grid grid-cols-2 gap-y-2 text-[15px]">
              {(
                [
                  ["Perfil", `${PERFIL_LABEL[r.perfil]} (${r.pontuacao} pts)`],
                  ["Objetivo", OBJETIVO_CURTO[r.objetivo]],
                  ["Carteira", r.codigo],
                  ["Prazo", r.prazo],
                  ["Renda mensal", brl(r.rendaMensal)],
                  ["Gastos mensais", brl(r.gastosMensais)],
                  ["Capital", brl(r.capital)],
                  ["Aporte mensal", brl(r.aporteMensal)],
                  ["Reserva", `${brl(r.reservaAtual)} de ${brl(rs.ideal)}`],
                  ["Atualizado", dataBR(r.atualizadoEm)],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-ink-mute">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        <Card className="mt-4 p-4">
          <h3 className="font-display font-bold">Produtos e permissões</h3>
          <div className="mt-3 flex items-center justify-between gap-3 border-b border-ink/[0.07] pb-3">
            <span>
              <span className="block font-semibold">GPS Financeiro</span>
              <span className="text-sm text-ink-mute">Produto principal, vitalício</span>
            </span>
            <Selo tom="folha">Liberado</Selo>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span>
              <span className="block font-semibold">Acompanhamento Individual</span>
              <span className="text-sm text-ink-mute">Liberação manual, sem afetar o produto principal</span>
            </span>
            <Interruptor ligado={aluno.produtos.includes("acompanhamento")} onChange={onProduto} rotulo="Acompanhamento Individual" />
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="font-display font-bold">Uso da plataforma</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-paper p-2.5">
              <p className="font-display text-xl font-bold">{aluno.aulasConcluidas.length}</p>
              <p className="text-[12px] text-ink-mute">de {totalAulas} aulas</p>
            </div>
            <div className="rounded-xl bg-paper p-2.5">
              <p className="font-display text-xl font-bold">{aluno.mensagensIA}</p>
              <p className="text-[12px] text-ink-mute">perguntas ao Mentor</p>
            </div>
            <div className="rounded-xl bg-paper p-2.5">
              <p className="font-display text-xl font-bold">{aluno.sessoesAtivas}</p>
              <p className="text-[12px] text-ink-mute">dispositivos</p>
            </div>
          </div>
          <p className="mt-2 text-[13px] text-ink-mute">Custo de IA deste aluno: {brl(aluno.custoIA, 2)}</p>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="font-display font-bold">Acesso</h3>
          {aluno.status === "ativo" ? (
            <button type="button" onClick={() => onStatus("bloqueado")} className="btn mt-3 w-full bg-alerta-soft text-alerta hover:bg-alerta hover:text-white">
              Bloquear acesso
            </button>
          ) : (
            <button type="button" onClick={() => onStatus("ativo")} className="btn mt-3 w-full bg-folha-soft text-folha hover:bg-folha hover:text-white">
              Liberar acesso
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}

function NovoAluno({ aberto, onFechar, onCriar, existe }: { aberto: boolean; onFechar: () => void; onCriar: (n: string, e: string, t: string) => void; existe: (e: string) => boolean }) {
  const [f, setF] = useState({ nome: "", email: "", tel: "" });
  const duplicado = f.email.includes("@") && existe(f.email);
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Adicionar aluno">
      <p className="mt-1 text-ink-mute">Para vendas fora da Hotmart e PayT ou casos de suporte. O aluno entra com este e-mail.</p>
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onCriar(f.nome, f.email, f.tel);
          setF({ nome: "", email: "", tel: "" });
          onFechar();
        }}
      >
        <Campo id="n-nome" rotulo="Nome">
          <input id="n-nome" required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className="campo py-2.5" />
        </Campo>
        <Campo id="n-email" rotulo="E-mail">
          <input id="n-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="campo py-2.5" />
        </Campo>
        {duplicado && <p className="text-sm text-alerta">Este e-mail já está cadastrado.</p>}
        <Campo id="n-tel" rotulo="WhatsApp (opcional)">
          <input id="n-tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} className="campo py-2.5" />
        </Campo>
        <button type="submit" disabled={!f.nome || !f.email.includes("@") || duplicado} className="btn-primario mt-2 w-full">
          Liberar acesso
        </button>
      </form>
    </Modal>
  );
}

export default function Alunos() {
  return (
    <Suspense fallback={<p className="text-ink-mute">Carregando…</p>}>
      <Lista />
    </Suspense>
  );
}
