"use client";

import { useState } from "react";
import { Gem, Landmark, Plus, Trash2 } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { Abas, Card, Campo, IconChip, Interruptor } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { brl } from "@/lib/labels";
import type { Ofertas as O, OperacaoGarantia } from "@/lib/types";

export default function Ofertas() {
  const { ofertas, salvarOfertas, alunos } = useDemo();
  const [o, setO] = useState<O>(ofertas);
  const [aba, setAba] = useState<"acomp" | "garantia">("acomp");
  const [aviso, setAviso] = useState(false);
  const mudou = JSON.stringify(o) !== JSON.stringify(ofertas);
  const a = o.acompanhamento;
  const g = o.garantia;
  const setA = (p: Partial<O["acompanhamento"]>) => setO({ ...o, acompanhamento: { ...a, ...p } });
  const setG = (p: Partial<O["garantia"]>) => setO({ ...o, garantia: { ...g, ...p } });
  const compradores = alunos.filter((x) => x.produtos.includes("acompanhamento")).length;

  return (
    <>
      <TituloPagina
        titulo="Ofertas"
        descricao="Textos, vídeos, preços, links de checkout e onde cada oferta aparece. Tudo editável sem programar."
        acao={
          <button type="button" disabled={!mudou} onClick={() => (salvarOfertas(o), setAviso(true))} className="btn-primario">
            Salvar ofertas
          </button>
        }
      />
      {aviso && !mudou && <p className="mb-5 rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">Ofertas salvas. A área do aluno já mostra os novos conteúdos.</p>}

      <Abas
        className="mb-5"
        valor={aba}
        onChange={setAba}
        itens={[
          { id: "acomp", rotulo: "Acompanhamento Individual" },
          { id: "garantia", rotulo: "Investimento com Garantia" },
        ]}
      />

      {aba === "acomp" ? (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <IconChip icon={Gem} tom="ouro" />
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold">Oferta principal</h2>
                  <p className="text-sm text-ink-mute">{compradores} alunos já compraram</p>
                </div>
                <Interruptor ligado={a.ativo} onChange={(v) => setA({ ativo: v })} rotulo="Oferta ativa" />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo id="a-tit" rotulo="Nome do programa">
                  <input id="a-tit" value={a.titulo} onChange={(e) => setA({ titulo: e.target.value })} className="campo py-2.5" />
                </Campo>
                <Campo id="a-preco" rotulo="Preço (pagamento único)">
                  <input id="a-preco" type="number" value={a.preco} onChange={(e) => setA({ preco: Number(e.target.value) })} className="campo py-2.5" />
                </Campo>
                <div className="sm:col-span-2">
                  <Campo id="a-cham" rotulo="Chamada exibida após o plano">
                    <textarea id="a-cham" rows={2} value={a.chamada} onChange={(e) => setA({ chamada: e.target.value })} className="campo py-2.5 text-[15px]" />
                  </Campo>
                </div>
                <Campo id="a-check" rotulo="Link do checkout (Hotmart ou PayT)" ajuda="O e-mail do aluno é enviado junto para a compra cair na mesma conta.">
                  <input id="a-check" value={a.checkoutUrl} onChange={(e) => setA({ checkoutUrl: e.target.value })} className="campo py-2.5" />
                </Campo>
                <Campo id="a-vid" rotulo="Vídeo de apresentação">
                  <input id="a-vid" value={a.videoUrl} onChange={(e) => setA({ videoUrl: e.target.value })} className="campo py-2.5" />
                </Campo>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Benefícios</h2>
                <button type="button" onClick={() => setA({ beneficios: [...a.beneficios, { titulo: "Novo benefício", texto: "" }] })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
                  <Plus size={15} /> Adicionar
                </button>
              </div>
              <ul className="mt-4 space-y-2.5">
                {a.beneficios.map((b, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-paper p-3">
                    <div className="flex-1 space-y-1">
                      <input aria-label="Título do benefício" value={b.titulo} onChange={(e) => setA({ beneficios: a.beneficios.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)) })} className="w-full bg-transparent font-semibold focus:outline-none" />
                      <input aria-label="Descrição do benefício" value={b.texto} onChange={(e) => setA({ beneficios: a.beneficios.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)) })} className="w-full bg-transparent text-[14.5px] text-ink-soft focus:outline-none" />
                    </div>
                    <button type="button" onClick={() => setA({ beneficios: a.beneficios.filter((_, j) => j !== i) })} aria-label="Remover" className="self-start rounded-lg p-1.5 text-ink-mute hover:text-alerta">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Dúvidas frequentes</h2>
                <button type="button" onClick={() => setA({ faq: [...a.faq, { pergunta: "Nova pergunta", resposta: "" }] })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
                  <Plus size={15} /> Adicionar
                </button>
              </div>
              <ul className="mt-4 space-y-2.5">
                {a.faq.map((f, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-paper p-3">
                    <div className="flex-1 space-y-1">
                      <input aria-label="Pergunta" value={f.pergunta} onChange={(e) => setA({ faq: a.faq.map((x, j) => (j === i ? { ...x, pergunta: e.target.value } : x)) })} className="w-full bg-transparent font-semibold focus:outline-none" />
                      <textarea aria-label="Resposta" rows={2} value={f.resposta} onChange={(e) => setA({ faq: a.faq.map((x, j) => (j === i ? { ...x, resposta: e.target.value } : x)) })} className="w-full resize-none bg-transparent text-[14.5px] text-ink-soft focus:outline-none" />
                    </div>
                    <button type="button" onClick={() => setA({ faq: a.faq.filter((_, j) => j !== i) })} aria-label="Remover" className="self-start rounded-lg p-1.5 text-ink-mute hover:text-alerta">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="h-fit p-6">
            <h2 className="font-display text-lg font-bold">Onde a oferta aparece</h2>
            <p className="mt-1 text-sm text-ink-mute">O menu lateral sempre mostra a aba com cadeado para quem não comprou. Quem já comprou deixa de ver as ofertas.</p>
            <ul className="mt-4 divide-y divide-ink/[0.07]">
              {(
                [
                  ["popup", "Pop-up de parabéns", "Antecipa a oferta quando o plano fica pronto"],
                  ["plano", "Página do plano", "Seção com vídeo logo após a carteira"],
                  ["inicio", "Página inicial", "Destaque com benefícios e vídeo"],
                  ["mentor", "Mentor 24h", "Pergunta pronta e respostas comerciais"],
                ] as const
              ).map(([k, t, d]) => (
                <li key={k} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="text-sm text-ink-mute">{d}</span>
                  </span>
                  <Interruptor ligado={a.locais[k]} onChange={(v) => setA({ locais: { ...a.locais, [k]: v } })} rotulo={t} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <IconChip icon={Landmark} tom="ink" />
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold">Divulgação</h2>
                <p className="text-sm text-ink-mute">Oferta gratuita para todos os alunos, com destaque menor.</p>
              </div>
              <Interruptor ligado={g.ativo} onChange={(v) => setG({ ativo: v })} rotulo="Oferta ativa" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Campo id="g-tit" rotulo="Título">
                <input id="g-tit" value={g.titulo} onChange={(e) => setG({ titulo: e.target.value })} className="campo py-2.5" />
              </Campo>
              <Campo id="g-min" rotulo="Valor mínimo">
                <input id="g-min" type="number" value={g.minimo} onChange={(e) => setG({ minimo: Number(e.target.value) })} className="campo py-2.5" />
              </Campo>
              <Campo id="g-cham" rotulo="Chamada">
                <input id="g-cham" value={g.chamada} onChange={(e) => setG({ chamada: e.target.value })} className="campo py-2.5" />
              </Campo>
              <Campo id="g-dest" rotulo="Destaque de rentabilidade">
                <input id="g-dest" value={g.destaque} onChange={(e) => setG({ destaque: e.target.value })} className="campo py-2.5" />
              </Campo>
              <div className="sm:col-span-2">
                <Campo id="g-desc" rotulo="Descrição">
                  <textarea id="g-desc" rows={3} value={g.descricao} onChange={(e) => setG({ descricao: e.target.value })} className="campo py-2.5 text-[15px]" />
                </Campo>
              </div>
              <Campo id="g-vid" rotulo="Vídeo">
                <input id="g-vid" value={g.videoUrl} onChange={(e) => setG({ videoUrl: e.target.value })} className="campo py-2.5" />
              </Campo>
              <Campo id="g-zap" rotulo="Link do WhatsApp do time">
                <input id="g-zap" value={g.whatsapp} onChange={(e) => setG({ whatsapp: e.target.value })} className="campo py-2.5" />
              </Campo>
            </div>
          </Card>
          <Card className="h-fit p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Operações exibidas</h2>
              <button
                type="button"
                onClick={() => setG({ operacoes: [...g.operacoes, { id: `o${Date.now()}`, nome: "Nova operação", garantia: "Imóvel", rentabilidade: "1,5% ao mês", prazo: "24 meses", minimo: 1000, captado: 0 }] })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft"
              >
                <Plus size={15} /> Adicionar
              </button>
            </div>
            <ul className="mt-4 space-y-2.5">
              {g.operacoes.map((op, i) => {
                const set = (p: Partial<OperacaoGarantia>) => setG({ operacoes: g.operacoes.map((x, j) => (j === i ? { ...x, ...p } : x)) });
                return (
                  <li key={op.id} className="rounded-xl bg-paper p-3">
                    <div className="flex items-center gap-2">
                      <input aria-label="Nome da operação" value={op.nome} onChange={(e) => set({ nome: e.target.value })} className="flex-1 bg-transparent font-semibold focus:outline-none" />
                      <button type="button" onClick={() => setG({ operacoes: g.operacoes.filter((_, j) => j !== i) })} aria-label="Remover" className="rounded-lg p-1 text-ink-mute hover:text-alerta">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <select aria-label="Garantia" value={op.garantia} onChange={(e) => set({ garantia: e.target.value as OperacaoGarantia["garantia"] })} className="rounded-lg border border-ink/15 bg-white px-2 py-1">
                        <option>Imóvel</option>
                        <option>Veículo</option>
                      </select>
                      <input aria-label="Rentabilidade" value={op.rentabilidade} onChange={(e) => set({ rentabilidade: e.target.value })} className="rounded-lg border border-ink/15 bg-white px-2 py-1" />
                      <input aria-label="Prazo" value={op.prazo} onChange={(e) => set({ prazo: e.target.value })} className="rounded-lg border border-ink/15 bg-white px-2 py-1" />
                      <input aria-label="Percentual captado" type="number" value={op.captado} onChange={(e) => set({ captado: Number(e.target.value) })} className="rounded-lg border border-ink/15 bg-white px-2 py-1" />
                    </div>
                    <p className="mt-1.5 text-[12px] text-ink-mute">Mínimo {brl(op.minimo)}, {op.captado}% captado</p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
