"use client";

import { useState } from "react";
import { ChevronDown, Film, Link2, Plus, Trash2 } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { Card, Campo, IconChip, Interruptor } from "@/components/ui";
import { useDemo } from "@/lib/store";
import type { Aula } from "@/lib/types";

export default function AdminAulas() {
  const { aulas, boasVindasVideo, salvarAulas } = useDemo();
  const [lista, setLista] = useState<Aula[]>(aulas);
  const [video, setVideo] = useState(boasVindasVideo);
  const [aberta, setAberta] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const mudou = JSON.stringify(lista) !== JSON.stringify(aulas) || JSON.stringify(video) !== JSON.stringify(boasVindasVideo);
  const modulos = Array.from(new Set(lista.map((a) => a.modulo)));
  const alterar = (id: string, p: Partial<Aula>) => (setSalvo(false), setLista(lista.map((a) => (a.id === id ? { ...a, ...p } : a))));

  return (
    <>
      <TituloPagina
        titulo="Videoaulas"
        descricao="As aulas tocam dentro da plataforma (Panda Video, Vimeo ou YouTube incorporado). O Mentor usa as palavras-chave para indicar a aula certa."
        acao={
          <button type="button" disabled={!mudou} onClick={() => (salvarAulas(lista.filter((a) => a.titulo.trim()), video), setSalvo(true))} className="btn-primario">
            {salvo && !mudou ? "Aulas salvas" : "Salvar aulas"}
          </button>
        }
      />

      <Card className="mb-5 p-6">
        <div className="flex flex-wrap items-start gap-4">
          <IconChip icon={Film} tom="ouro" tamanho={44} />
          <div className="min-w-[240px] flex-1">
            <h2 className="font-display text-lg font-bold">Vídeo obrigatório de boas-vindas</h2>
            <p className="text-sm text-ink-mute">Abre no primeiro acesso. Não pode ser pulado nem adiantado, só acelerado. Depois fica disponível em Videoaulas.</p>
          </div>
          <label className="flex items-center gap-3 text-[15px] font-semibold">
            Obrigatório no primeiro acesso
            <Interruptor ligado={video.obrigatorio} onChange={(v) => (setVideo({ ...video, obrigatorio: v }), setSalvo(false))} rotulo="Vídeo obrigatório" />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <Campo id="bv-url" rotulo="Link do vídeo">
            <input id="bv-url" value={video.url} onChange={(e) => (setVideo({ ...video, url: e.target.value }), setSalvo(false))} className="campo py-2.5" />
          </Campo>
          <Campo id="bv-dur" rotulo="Duração (segundos)">
            <input id="bv-dur" type="number" value={video.duracaoSeg} onChange={(e) => (setVideo({ ...video, duracaoSeg: Number(e.target.value) }), setSalvo(false))} className="campo py-2.5" />
          </Campo>
        </div>
      </Card>

      <div className="space-y-5">
        {modulos.map((mod, mi) => (
          <Card key={mod} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-ink/[0.07] px-5 py-3.5">
              <h2 className="font-display font-bold">
                <span className="mr-2 text-ink-mute">Módulo {mi + 1}</span>
                {mod}
              </h2>
              <button
                type="button"
                onClick={() => {
                  const id = `a${Date.now()}`;
                  setLista([...lista, { id, modulo: mod, titulo: "Nova aula", duracao: "10 min", videoUrl: "", descricao: "", palavrasChave: [] }]);
                  setAberta(id);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                <Plus size={15} /> Aula
              </button>
            </div>
            <ul>
              {lista
                .filter((a) => a.modulo === mod)
                .map((a) => (
                  <li key={a.id} className="border-b border-ink/[0.05] last:border-0">
                    <div className="flex items-center gap-3 px-5 py-2.5">
                      <input aria-label="Título da aula" value={a.titulo} onChange={(e) => alterar(a.id, { titulo: e.target.value })} className="flex-1 rounded-lg border border-transparent px-2 py-1.5 font-semibold hover:border-ink/15 focus:border-ink focus:outline-none" />
                      {a.links && a.links.length > 0 && (
                        <span className="hidden items-center gap-1 text-[13px] text-ink-mute sm:inline-flex">
                          <Link2 size={13} /> {a.links.length} links
                        </span>
                      )}
                      <span className="w-16 text-right text-[13px] text-ink-mute">{a.duracao}</span>
                      <button type="button" onClick={() => setAberta(aberta === a.id ? null : a.id)} aria-label="Editar detalhes" className="rounded-lg p-1.5 text-ink-mute hover:bg-paper">
                        <ChevronDown size={17} className={aberta === a.id ? "rotate-180" : ""} />
                      </button>
                      <button type="button" disabled={a.id === "a0"} onClick={() => (setSalvo(false), setLista(lista.filter((x) => x.id !== a.id)))} aria-label="Remover aula" className="rounded-lg p-1.5 text-ink-mute hover:bg-alerta-soft hover:text-alerta disabled:opacity-30">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {aberta === a.id && (
                      <div className="grid gap-3 bg-paper/50 px-5 py-4 md:grid-cols-2">
                        <Campo id={`v-${a.id}`} rotulo="Link do vídeo">
                          <input id={`v-${a.id}`} value={a.videoUrl} onChange={(e) => alterar(a.id, { videoUrl: e.target.value })} className="campo py-2" placeholder="https://" />
                        </Campo>
                        <div className="grid grid-cols-2 gap-3">
                          <Campo id={`m-${a.id}`} rotulo="Módulo">
                            <input id={`m-${a.id}`} value={a.modulo} onChange={(e) => alterar(a.id, { modulo: e.target.value })} className="campo py-2" />
                          </Campo>
                          <Campo id={`d-${a.id}`} rotulo="Duração">
                            <input id={`d-${a.id}`} value={a.duracao} onChange={(e) => alterar(a.id, { duracao: e.target.value })} className="campo py-2" />
                          </Campo>
                        </div>
                        <Campo id={`ds-${a.id}`} rotulo="Descrição">
                          <textarea id={`ds-${a.id}`} rows={3} value={a.descricao} onChange={(e) => alterar(a.id, { descricao: e.target.value })} className="campo py-2 text-[14.5px]" />
                        </Campo>
                        <Campo id={`l-${a.id}`} rotulo="Links na descrição (um por linha: texto | endereço)">
                          <textarea
                            id={`l-${a.id}`}
                            rows={3}
                            value={(a.links ?? []).map((l) => `${l.rotulo} | ${l.href}`).join("\n")}
                            onChange={(e) =>
                              alterar(a.id, {
                                links: e.target.value
                                  .split("\n")
                                  .map((linha) => linha.split("|").map((x) => x.trim()))
                                  .filter((p) => p[0])
                                  .map(([rotulo, href]) => ({ rotulo, href: href ?? "" })),
                              })
                            }
                            className="campo py-2 font-mono text-[13px]"
                          />
                        </Campo>
                        <Campo id={`k-${a.id}`} rotulo="Palavras-chave para o Mentor" ajuda="Separe por vírgula.">
                          <input id={`k-${a.id}`} value={a.palavrasChave.join(", ")} onChange={(e) => alterar(a.id, { palavrasChave: e.target.value.split(",").map((x) => x.trimStart().toLowerCase()) })} className="campo py-2" />
                        </Campo>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
