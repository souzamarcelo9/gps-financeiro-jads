"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { useDemo } from "@/lib/store";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Card } from "@/components/ui";

export default function AulaPage() {
  const { id } = useParams<{ id: string }>();
  const { aulas, alunoAtual, concluirAula, abrirMentor } = useDemo();
  const aula = aulas.find((a) => a.id === id);
  if (!aula)
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p>Aula não encontrada.</p>
        <Link href="/app/aulas" className="btn-linha mt-4">
          Ver todas as aulas
        </Link>
      </Card>
    );

  const doModulo = aulas.filter((a) => a.modulo === aula.modulo);
  const idx = aulas.findIndex((a) => a.id === aula.id);
  const proxima = aulas[idx + 1];
  const feita = alunoAtual?.aulasConcluidas.includes(aula.id);
  const minutos = parseInt(aula.duracao) || 10;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/app/aulas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
        <ArrowLeft size={16} /> Videoaulas
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <VideoPlayer key={aula.id} titulo={aula.titulo} subtitulo={aula.modulo} duracaoSeg={minutos * 60} onFim={() => !feita && concluirAula(aula.id)} />
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-folha">{aula.modulo}</p>
              <h1 className="text-[1.7rem] font-bold leading-tight">{aula.titulo}</h1>
            </div>
            <button type="button" onClick={() => concluirAula(aula.id)} className={feita ? "btn bg-folha-soft text-folha" : "btn-linha"}>
              {feita ? <CheckCircle2 size={18} /> : <Circle size={18} />} {feita ? "Aula concluída" : "Marcar como concluída"}
            </button>
          </div>
          <Card className="mt-5 p-5">
            <p className="text-ink-soft">{aula.descricao}</p>
            {aula.links && (
              <ul className="mt-4 space-y-2">
                {aula.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-semibold text-azul underline underline-offset-2">
                      {l.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => abrirMentor(`Tenho uma dúvida sobre a aula "${aula.titulo}"`)} className="text-[15px] font-semibold text-ink-soft underline underline-offset-2">
              Ficou com dúvida? Pergunte ao Mentor 24h
            </button>
            {proxima && (
              <Link href={`/app/aulas/${proxima.id}`} className="btn-primario">
                Próxima aula
              </Link>
            )}
          </div>
        </div>

        <aside>
          <Card className="overflow-hidden">
            <p className="border-b border-ink/[0.07] px-4 py-3 font-display font-bold">{aula.modulo}</p>
            <ol>
              {doModulo.map((a) => {
                const ok = alunoAtual?.aulasConcluidas.includes(a.id);
                const atual = a.id === aula.id;
                return (
                  <li key={a.id}>
                    <Link href={`/app/aulas/${a.id}`} className={`flex items-center gap-3 px-4 py-3 text-[15px] ${atual ? "bg-paper font-semibold" : "hover:bg-paper/60"}`}>
                      {ok ? <CheckCircle2 size={19} className="shrink-0 text-folha" /> : <PlayCircle size={19} className="shrink-0 text-ink-mute" />}
                      <span className="flex-1 leading-snug">{a.titulo}</span>
                      <span className="text-[13px] text-ink-mute">{a.duracao}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
