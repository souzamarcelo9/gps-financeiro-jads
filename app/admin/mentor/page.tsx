"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Bot, Coins, FileUp, Lock, MessagesSquare, Plus, ShieldCheck, Trash2, Zap } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { GraficoLinha } from "@/components/charts";
import { Abas, Avatar, Card, Campo, Indicador } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { BASE_ALUNOS, SERIE } from "@/lib/data";
import { brl, dataBR } from "@/lib/labels";

type Aba = "instrucoes" | "perguntas" | "conhecimento" | "consumo";
const FIXA = "Como funciona o Programa de Acompanhamento Individual?";

function Conteudo() {
  const params = useSearchParams();
  const { mentor, conhecimento, salvarMentor, alunos } = useDemo();
  const [aba, setAba] = useState<Aba>((params.get("aba") as Aba) || "instrucoes");
  const [m, setM] = useState(mentor);
  const [k, setK] = useState(conhecimento);
  const [aviso, setAviso] = useState(false);
  const mudou = JSON.stringify(m) !== JSON.stringify(mentor) || JSON.stringify(k) !== JSON.stringify(conhecimento);

  const ult30 = SERIE.slice(-30);
  const msgs = ult30.reduce((s, d) => s + d.mensagens, 0);
  const custo = msgs * 0.004;
  const top = [...alunos].sort((a, b) => b.mensagensIA - a.mensagensIA).slice(0, 6);

  return (
    <>
      <TituloPagina
        titulo="Mentor IA"
        descricao="Instruções, perguntas prontas, materiais e limites do Mentor 24h."
        acao={
          <button type="button" disabled={!mudou} onClick={() => (salvarMentor(m, k), setAviso(true))} className="btn-primario">
            Salvar alterações
          </button>
        }
      />
      {aviso && !mudou && <p className="mb-5 rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">Alterações salvas. As próximas conversas já usam as novas configurações.</p>}

      <Abas
        valor={aba}
        onChange={setAba}
        className="mb-5"
        itens={[
          { id: "instrucoes", rotulo: "Instruções" },
          { id: "perguntas", rotulo: "Perguntas prontas", total: m.sugestoes.length },
          { id: "conhecimento", rotulo: "Base de conhecimento", total: k.length },
          { id: "consumo", rotulo: "Limites e consumo" },
        ]}
      />

      {aba === "instrucoes" && (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <Campo id="prompt" rotulo="Instruções do Mentor (prompt)" ajuda="O perfil, o objetivo, o plano e os produtos do aluno entram automaticamente em cada conversa.">
              <textarea id="prompt" rows={18} value={m.prompt} onChange={(e) => setM({ ...m, prompt: e.target.value })} className="campo font-mono text-[13.5px] leading-relaxed" />
            </Campo>
          </Card>
          <div className="space-y-5">
            <Card className="p-6">
              <Campo id="recusa" rotulo="Resposta para assuntos fora do escopo">
                <textarea id="recusa" rows={7} value={m.recusa} onChange={(e) => setM({ ...m, recusa: e.target.value })} className="campo text-[15px]" />
              </Campo>
            </Card>
            <Card className="p-6">
              <h2 className="font-display font-bold">Duas funções, um assistente</h2>
              <ul className="mt-3 space-y-3 text-[15px] text-ink-soft">
                <li className="flex gap-2.5">
                  <MessagesSquare size={18} className="mt-0.5 shrink-0 text-azul" /> Suporte: dúvidas, conceitos, ativos do plano e indicação de aulas.
                </li>
                <li className="flex gap-2.5">
                  <Coins size={18} className="mt-0.5 shrink-0 text-ouro-deep" /> Vendas: explica o Acompanhamento, responde objeções, envia vídeo e checkout. Não oferece a quem já comprou.
                </li>
                <li className="flex gap-2.5">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-folha" /> Nunca inventa ativos ou percentuais: só usa o que está cadastrado nas carteiras.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {aba === "perguntas" && (
        <Card className="max-w-3xl p-6">
          <p className="text-sm text-ink-mute">Aparecem como atalhos no chat. A pergunta do acompanhamento é obrigatória e some para quem já comprou.</p>
          <ul className="mt-4 space-y-2.5">
            {m.sugestoes.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-6 text-sm font-semibold text-ink-mute">{i + 1}</span>
                <input aria-label={`Pergunta ${i + 1}`} value={s} disabled={s === FIXA} onChange={(e) => setM({ ...m, sugestoes: m.sugestoes.map((x, j) => (j === i ? e.target.value : x)) })} className="campo py-2.5 disabled:bg-paper" />
                {s === FIXA ? (
                  <Lock size={17} className="mx-2 shrink-0 text-ink-mute" aria-label="Obrigatória" />
                ) : (
                  <button type="button" onClick={() => setM({ ...m, sugestoes: m.sugestoes.filter((_, j) => j !== i) })} aria-label="Remover" className="rounded-lg p-2 text-ink-mute hover:bg-alerta-soft hover:text-alerta">
                    <Trash2 size={17} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button type="button" disabled={m.sugestoes.length >= 6} onClick={() => setM({ ...m, sugestoes: [...m.sugestoes, "Nova pergunta"] })} className="btn-linha mt-4 py-2 text-sm">
            <Plus size={16} /> Adicionar pergunta
          </button>
        </Card>
      )}

      {aba === "conhecimento" && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-mute">Textos da metodologia e dos produtos que o Mentor consulta antes de responder. As carteiras e aulas cadastradas já entram automaticamente.</p>
            <div className="flex gap-2">
              <button type="button" disabled title="Disponível na versão final" className="btn-linha py-2 text-sm">
                <FileUp size={16} /> Enviar PDF
              </button>
              <button type="button" onClick={() => setK([{ id: `k${Date.now()}`, titulo: "Novo tópico", conteudo: "", atualizadoEm: new Date().toISOString() }, ...k])} className="btn-ouro py-2 text-sm">
                <Plus size={16} /> Adicionar tópico
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {k.map((x, i) => (
              <div key={x.id} className="rounded-2xl bg-paper p-4">
                <div className="flex items-center gap-2">
                  <input aria-label="Título" value={x.titulo} onChange={(e) => setK(k.map((y, j) => (j === i ? { ...y, titulo: e.target.value } : y)))} className="flex-1 bg-transparent font-display text-lg font-bold focus:outline-none" />
                  <button type="button" onClick={() => setK(k.filter((_, j) => j !== i))} aria-label={`Remover ${x.titulo}`} className="rounded-lg p-1.5 text-ink-mute hover:bg-white hover:text-alerta">
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea aria-label="Conteúdo" rows={3} value={x.conteudo} onChange={(e) => setK(k.map((y, j) => (j === i ? { ...y, conteudo: e.target.value } : y)))} className="campo mt-2 bg-white py-2 text-[14.5px]" />
                <p className="mt-1.5 text-[12px] text-ink-mute">Atualizado em {dataBR(x.atualizadoEm)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {aba === "consumo" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador rotulo="Mensagens (30 dias)" valor={msgs.toLocaleString("pt-BR")} icon={MessagesSquare} tom="roxo" />
            <Indicador rotulo="Custo (30 dias)" valor={brl(custo, 2)} icon={Coins} tom="ouro" />
            <Indicador rotulo="Custo por aluno ativo" valor={brl(custo / BASE_ALUNOS, 2)} icon={Bot} tom="azul" rodape={`por mês, base de ${BASE_ALUNOS.toLocaleString("pt-BR")} alunos`} />
            <Indicador rotulo="Respondidas por regras" valor="38%" icon={Zap} tom="folha" rodape="sem consumo de IA" />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Custo diário estimado</h2>
              <div className="mt-3">
                <GraficoLinha valores={ult30.map((d) => d.mensagens * 0.004)} rotulos={ult30.map((d) => d.dia.slice(8, 10) + "/" + d.dia.slice(5, 7))} formatar={(v) => brl(v, 2)} cor="#6B5BD2" altura={230} />
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Limites por aluno</h2>
              <div className="mt-4 space-y-3.5">
                {(
                  [
                    ["mensagensPorDia", "Perguntas por dia"],
                    ["mensagensPorMes", "Perguntas por mês"],
                    ["maxTokensResposta", "Tamanho máximo da resposta (tokens)"],
                    ["historicoEnviado", "Mensagens anteriores enviadas como contexto"],
                  ] as const
                ).map(([key, r]) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <label htmlFor={key} className="text-[15px]">
                      {r}
                    </label>
                    <input id={key} type="number" min={1} value={m.limites[key]} onChange={(e) => setM({ ...m, limites: { ...m.limites, [key]: Number(e.target.value) } })} className="w-24 rounded-lg border border-ink/15 px-2 py-1.5 text-right font-semibold" />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-ink-mute">O histórico completo fica no banco de dados. Só as últimas mensagens vão para a IA, o que mantém o custo baixo.</p>
            </Card>
          </div>
          <Card className="mt-5 p-6">
            <h2 className="font-display text-lg font-bold">Alunos que mais usam o Mentor</h2>
            <ul className="mt-3 divide-y divide-ink/[0.06]">
              {top.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <Avatar nome={a.nome} tamanho={34} />
                  <span className="flex-1 font-semibold">{a.nome}</span>
                  <span className="text-sm text-ink-mute">{a.mensagensIA} perguntas</span>
                  <span className="w-20 text-right font-semibold">{brl(a.custoIA, 2)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </>
  );
}

export default function Mentor() {
  return (
    <Suspense fallback={<p className="text-ink-mute">Carregando…</p>}>
      <Conteudo />
    </Suspense>
  );
}
