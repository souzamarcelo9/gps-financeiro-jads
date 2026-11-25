"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Eye, EyeOff, ImagePlus, Plus, RefreshCw, Trash2 } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { LogoAtivo } from "@/components/PainelCarteira";
import { Card, Campo, Selo } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { fmtCotacao, somaPct, statusPreco, STATUS_FAIXA_LABEL } from "@/lib/quiz";
import { CLASSES, CLASSE_COR, CLASSE_LABEL, dataHoraBR, OBJETIVO_CURTO, PERFIS, PERFIL_LABEL, PERFIL_TEXTO } from "@/lib/labels";
import type { Ativo, Aula, Carteira, ClasseAtivo, FormatoCotacao, Risco } from "@/lib/types";

const FORMATOS: { v: FormatoCotacao; r: string }[] = [
  { v: "reais", r: "Preço em R$" },
  { v: "ipca", r: "Taxa IPCA + % a.a." },
  { v: "cdi", r: "Taxa em % do CDI" },
  { v: "pre", r: "Prefixado % a.a." },
  { v: "am", r: "Taxa % ao mês" },
  { v: "selic", r: "Selic + %" },
];

const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(",", ".")));
const inp = "w-full rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-[14.5px] focus:border-ink focus:outline-none";

export default function Carteiras() {
  const { carteiras, salvarCarteira, aulas, atualizarCotacoes, cotacoesEm, estrategias, alunos } = useDemo();
  const [codigo, setCodigo] = useState("M2");
  const original = carteiras.find((c) => c.codigo === codigo)!;
  const [c, setC] = useState<Carteira>(original);
  const [aberto, setAberto] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setC(carteiras.find((x) => x.codigo === codigo)!), [codigo]);
  useEffect(() => {
    // Novas cotações chegam sem apagar o que está sendo editado
    setC((atual) => ({ ...atual, ativos: atual.ativos.map((a) => ({ ...a, cotacao: original.ativos.find((x) => x.id === a.id)?.cotacao ?? a.cotacao })) }));
  }, [original]);

  const soma = somaPct(c);
  const ok = soma === 100;
  const normal = (k: Carteira) => JSON.stringify({ ...k, atualizadaEm: "", ativos: k.ativos.map((a) => ({ ...a, cotacao: 0 })) });
  const mudou = normal(c) !== normal(original);
  const usam = alunos.filter((a) => a.resultado?.codigo === c.codigo && a.status === "ativo").length;
  const ehEstrategia = Object.values(estrategias).includes(c.codigo);
  const mudarAtivo = (id: string, patch: Partial<Ativo>) => setC({ ...c, ativos: c.ativos.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const trocar = (k: string) => {
    if (k === codigo) return;
    if (mudou && !confirm("Descartar alterações não salvas?")) return;
    setCodigo(k);
    setAberto(null);
  };
  const salvar = () => {
    salvarCarteira(c);
    setAviso(`Carteira ${c.codigo} salva. As carteiras dos alunos já mostram a nova composição.`);
    setTimeout(() => setAviso(null), 3500);
  };

  return (
    <>
      <TituloPagina
        titulo="Carteiras"
        descricao="As 9 carteiras da metodologia. Edite ativos, percentuais, faixas de compra e venda, textos e logos."
        acao={
          <button type="button" onClick={atualizarCotacoes} className="btn-linha py-2.5 text-sm">
            <RefreshCw size={16} /> Atualizar cotações
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
        {/* Seletor: matriz 3x3 até telas grandes, lista no desktop largo */}
        <Card className="h-fit p-3 xl:hidden">
          <div className="grid grid-cols-3 gap-2">
            {carteiras.map((k) => (
              <button key={k.codigo} type="button" onClick={() => trocar(k.codigo)} className={`rounded-xl px-2 py-2.5 text-left ${k.codigo === codigo ? "bg-noite text-white" : "bg-paper hover:bg-paper-deep"}`}>
                <span className="flex items-center gap-1.5 font-display text-lg font-bold">
                  {k.codigo}
                  {somaPct(k) !== 100 && <AlertTriangle size={13} className="text-alerta" />}
                </span>
                <span className={`block truncate text-[12px] ${k.codigo === codigo ? "text-white/70" : "text-ink-mute"}`}>{k.nome}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card className="hidden h-fit p-3 xl:block">
          {PERFIS.map((p) => (
            <div key={p} className="mb-2 last:mb-0">
              <p className={`px-2 pb-1 pt-2 text-[13px] font-semibold ${PERFIL_TEXTO[p]}`}>{PERFIL_LABEL[p]}</p>
              {carteiras
                .filter((k) => k.perfil === p)
                .map((k) => (
                  <button key={k.codigo} type="button" onClick={() => trocar(k.codigo)} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left ${k.codigo === codigo ? "bg-noite text-white" : "hover:bg-paper"}`}>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold ${k.codigo === codigo ? "bg-white/15 text-ouro" : "bg-paper text-ink"}`}>{k.codigo}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{k.nome}</span>
                      <span className={`text-[12.5px] ${k.codigo === codigo ? "text-white/60" : "text-ink-mute"}`}>
                        {OBJETIVO_CURTO[k.objetivo]}, {k.ativos.length} ativos
                      </span>
                    </span>
                    {somaPct(k) !== 100 && <AlertTriangle size={15} className="text-alerta" />}
                  </button>
                ))}
            </div>
          ))}
        </Card>

        <div className="min-w-0 space-y-5">
          {aviso && <p className="rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">{aviso}</p>}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-mute">
                  Carteira {c.codigo}, {PERFIL_LABEL[c.perfil].toLowerCase()} + {OBJETIVO_CURTO[c.objetivo].toLowerCase()}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Selo tom="azul">{usam} alunos usam esta carteira</Selo>
                  {ehEstrategia && <Selo tom="ouro">Também é uma estratégia pronta</Selo>}
                </div>
              </div>
              <button type="button" disabled={!ok || !mudou} onClick={salvar} className="btn-primario">
                Salvar carteira
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Campo id="c-nome" rotulo="Nome exibido ao aluno">
                <input id="c-nome" value={c.nome} onChange={(e) => setC({ ...c, nome: e.target.value })} className="campo py-2.5" />
              </Campo>
              <Campo id="c-resumo" rotulo="Resumo do perfil e da estratégia">
                <input id="c-resumo" value={c.resumo} onChange={(e) => setC({ ...c, resumo: e.target.value })} className="campo py-2.5" />
              </Campo>
              <Campo id="c-estr" rotulo="Orientação de estratégia">
                <textarea id="c-estr" rows={2} value={c.estrategia} onChange={(e) => setC({ ...c, estrategia: e.target.value })} className="campo py-2.5 text-[15px]" />
              </Campo>
              <Campo id="c-obs" rotulo="Observações e avisos (opcional)">
                <textarea id="c-obs" rows={2} value={c.observacao} onChange={(e) => setC({ ...c, observacao: e.target.value })} placeholder="Ex.: ajuste temporário por conta de…" className="campo py-2.5 text-[15px]" />
              </Campo>
            </div>
          </Card>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Ativos ({c.ativos.length})</h2>
              <p className="text-[13px] text-ink-mute">Cotações em {dataHoraBR(cotacoesEm)} (simuladas). Você define as faixas; o selo do aluno é calculado sozinho.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = `${c.codigo}-n${Date.now()}`;
                setC({ ...c, ativos: [...c.ativos, { id, classe: "fii", formato: "reais", nome: "Novo ativo", codigo: "", pct: 0, risco: "Médio", explicacao: "", comoComprar: "", visivel: true }] });
                setAberto(id);
              }}
              className="btn-linha py-2 text-sm"
            >
              <Plus size={16} /> Adicionar ativo
            </button>
          </div>

          <div className="space-y-3">
            {c.ativos.map((a) => (
              <EditorAtivo
                key={a.id}
                a={a}
                aulas={aulas}
                aberto={aberto === a.id}
                onAbrir={() => setAberto(aberto === a.id ? null : a.id)}
                onMudar={(p) => mudarAtivo(a.id, p)}
                onRemover={() => setC({ ...c, ativos: c.ativos.filter((x) => x.id !== a.id) })}
              />
            ))}
          </div>

          <div className={`sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 shadow-lg ring-1 ${ok ? "bg-folha-soft ring-folha/20" : "bg-alerta-soft ring-alerta/20"}`}>
            <span className={`flex items-center gap-2 font-semibold ${ok ? "text-folha" : "text-alerta"}`}>
              {ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              Total: {soma.toLocaleString("pt-BR")}%
              <span className="hidden font-normal text-ink-soft sm:inline">{ok ? "Distribuição válida." : soma > 100 ? `Retire ${(soma - 100).toLocaleString("pt-BR")}%.` : `Faltam ${(100 - soma).toLocaleString("pt-BR")}%.`}</span>
            </span>
            <button type="button" disabled={!ok || !mudou} onClick={salvar} className="btn-primario py-2 text-sm">
              Salvar carteira
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function EditorAtivo({ a, aulas, aberto, onAbrir, onMudar, onRemover }: { a: Ativo; aulas: Aula[]; aberto: boolean; onAbrir: () => void; onMudar: (p: Partial<Ativo>) => void; onRemover: () => void }) {
  const st = statusPreco(a);
  const arquivo = useRef<HTMLInputElement>(null);
  const [erroLogo, setErroLogo] = useState<string | null>(null);

  function carregarLogo(f?: File) {
    if (!f) return;
    if (f.size > 300_000) return setErroLogo("Use uma imagem de até 300 KB (PNG, SVG ou JPG).");
    const leitor = new FileReader();
    leitor.onload = () => {
      setErroLogo(null);
      onMudar({ logoUrl: String(leitor.result) });
    };
    leitor.readAsDataURL(f);
  }

  return (
    <Card className={`p-4 sm:p-5 ${a.visivel ? "" : "opacity-60"}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => arquivo.current?.click()} className="group relative shrink-0" aria-label="Enviar logo do ativo" title="Enviar logo">
          <LogoAtivo a={a} tamanho={52} />
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-ink-soft shadow ring-1 ring-ink/10 group-hover:text-ink">
            <ImagePlus size={13} />
          </span>
        </button>
        <input ref={arquivo} type="file" accept="image/*" className="hidden" onChange={(e) => carregarLogo(e.target.files?.[0])} />
        <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <input aria-label="Nome do ativo" value={a.nome} onChange={(e) => onMudar({ nome: e.target.value })} className={`${inp} font-semibold`} />
          <input aria-label="Código" value={a.codigo} placeholder="CÓDIGO" onChange={(e) => onMudar({ codigo: e.target.value.toUpperCase() })} className={`${inp} uppercase`} />
        </div>
        <div className="flex shrink-0 gap-0.5">
          <button type="button" onClick={() => onMudar({ visivel: !a.visivel })} aria-label={a.visivel ? "Ocultar do aluno" : "Mostrar ao aluno"} title={a.visivel ? "Visível ao aluno" : "Oculto"} className="rounded-lg p-2 text-ink-mute hover:bg-paper">
            {a.visivel ? <Eye size={17} /> : <EyeOff size={17} />}
          </button>
          <button type="button" onClick={onRemover} aria-label="Remover ativo" className="rounded-lg p-2 text-ink-mute hover:bg-alerta-soft hover:text-alerta">
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      {erroLogo && <p className="mt-2 text-[13px] text-alerta">{erroLogo}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="text-[12.5px] text-ink-mute">
          Classe
          <select value={a.classe} onChange={(e) => onMudar({ classe: e.target.value as ClasseAtivo })} className={`${inp} mt-1`}>
            {CLASSES.map((k) => (
              <option key={k} value={k}>
                {CLASSE_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12.5px] text-ink-mute">
          Risco
          <select value={a.risco} onChange={(e) => onMudar({ risco: e.target.value as Risco })} className={`${inp} mt-1`}>
            {["Baixo", "Médio", "Alto"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="text-[12.5px] text-ink-mute">
          % da carteira
          <input inputMode="decimal" value={a.pct} onChange={(e) => onMudar({ pct: Number(e.target.value.replace(",", ".")) || 0 })} className={`${inp} mt-1 font-semibold`} />
        </label>
        <label className="text-[12.5px] text-ink-mute">
          Cotação exibida como
          <select value={a.formato ?? "reais"} onChange={(e) => onMudar({ formato: e.target.value as FormatoCotacao })} className={`${inp} mt-1`}>
            {FORMATOS.map((f) => (
              <option key={f.v} value={f.v}>
                {f.r}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="col-span-2 text-[12.5px] text-ink-mute">
          <legend>Faixa de compra (de / até)</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input aria-label="Início da faixa de compra" inputMode="decimal" value={a.compraMin ?? ""} placeholder="de" onChange={(e) => onMudar({ compraMin: num(e.target.value) })} className={inp} />
            <input aria-label="Teto da faixa de compra" inputMode="decimal" value={a.teto ?? ""} placeholder="até" onChange={(e) => onMudar({ teto: num(e.target.value) })} className={inp} />
          </div>
        </fieldset>
        <fieldset className="col-span-2 text-[12.5px] text-ink-mute">
          <legend>Faixa de venda (de / até)</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input aria-label="Início da faixa de venda" inputMode="decimal" value={a.precoVenda ?? ""} placeholder="de" onChange={(e) => onMudar({ precoVenda: num(e.target.value) })} className={inp} />
            <input aria-label="Fim da faixa de venda" inputMode="decimal" value={a.vendaMax ?? ""} placeholder="até" onChange={(e) => onMudar({ vendaMax: num(e.target.value) })} className={inp} />
          </div>
        </fieldset>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.07] pt-3">
        <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLASSE_COR[a.classe] }} />
          <span className="text-ink-mute">Cotação ilustrativa:</span>
          <span className="font-semibold">{a.cotacao !== undefined ? fmtCotacao(a, a.cotacao) : "sem cotação"}</span>
          {st !== "sem" && <Selo tom={st === "faixa" ? "folha" : st === "abaixo" ? "azul" : "neutro"}>{STATUS_FAIXA_LABEL[st]}</Selo>}
        </div>
        <button type="button" onClick={onAbrir} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink" aria-expanded={aberto}>
          Textos, aula e logo <ChevronDown size={16} className={aberto ? "rotate-180" : ""} />
        </button>
      </div>

      {aberto && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Campo id={`ex-${a.id}`} rotulo="Resumo do ativo (o que é e para que serve)">
            <textarea id={`ex-${a.id}`} rows={3} value={a.explicacao} onChange={(e) => onMudar({ explicacao: e.target.value })} className="campo py-2 text-[14.5px]" />
          </Campo>
          <Campo id={`cc-${a.id}`} rotulo="Onde e como comprar">
            <textarea id={`cc-${a.id}`} rows={3} value={a.comoComprar} onChange={(e) => onMudar({ comoComprar: e.target.value })} className="campo py-2 text-[14.5px]" />
          </Campo>
          <Campo id={`au-${a.id}`} rotulo="Aula relacionada">
            <select id={`au-${a.id}`} value={a.aulaId ?? ""} onChange={(e) => onMudar({ aulaId: e.target.value || undefined })} className="campo py-2 text-[14.5px]">
              <option value="">Nenhuma</option>
              {aulas.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.titulo}
                </option>
              ))}
            </select>
          </Campo>
          <Campo id={`lg-${a.id}`} rotulo="Logo do ativo" ajuda="Envie a imagem (botão no ícone) ou cole o endereço. Sem logo, o aluno vê a sigla.">
            <div className="flex gap-2">
              <input id={`lg-${a.id}`} value={a.logoUrl?.startsWith("data:") ? "Imagem enviada" : a.logoUrl ?? ""} placeholder="https://…" onChange={(e) => onMudar({ logoUrl: e.target.value || undefined })} className="campo py-2 text-[14.5px]" />
              {a.logoUrl && (
                <button type="button" onClick={() => onMudar({ logoUrl: undefined })} className="btn-linha shrink-0 px-3 py-2 text-sm">
                  Remover
                </button>
              )}
            </div>
          </Campo>
        </div>
      )}
    </Card>
  );
}
