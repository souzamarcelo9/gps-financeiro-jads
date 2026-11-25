"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, PlayCircle, Search } from "lucide-react";
import { useDemo } from "@/lib/store";
import { Barra, Card } from "@/components/ui";

export default function Aulas() {
  const { aulas, alunoAtual } = useDemo();
  const [busca, setBusca] = useState("");
  const feitas = alunoAtual?.aulasConcluidas ?? [];

  const grupos = useMemo(() => {
    const b = busca.trim().toLowerCase();
    const mapa = new Map<string, typeof aulas>();
    aulas.filter((a) => !b || a.titulo.toLowerCase().includes(b) || a.palavrasChave.some((k) => k.includes(b))).forEach((a) => mapa.set(a.modulo, [...(mapa.get(a.modulo) ?? []), a]));
    return [...mapa.entries()];
  }, [aulas, busca]);

  const pct = Math.round((aulas.filter((a) => feitas.includes(a.id)).length / aulas.length) * 100);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight">Videoaulas</h1>
          <p className="mt-1 text-ink-mute">Assista tudo aqui mesmo, sem sair da plataforma.</p>
        </div>
        <div className="w-full max-w-[220px]">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-ink-mute">Seu progresso</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Barra pct={pct} cor="bg-folha" />
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" size={18} />
        <label htmlFor="busca" className="sr-only">
          Buscar aula
        </label>
        <input id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por assunto: reserva, FII, tesouro…" className="campo pl-11" />
      </div>

      <div className="mt-8 space-y-7">
        {grupos.length === 0 && <p className="text-ink-mute">Nenhuma aula encontrada para “{busca}”. Tente outra palavra.</p>}
        {grupos.map(([modulo, lista], gi) => {
          const concl = lista.filter((a) => feitas.includes(a.id)).length;
          return (
            <section key={modulo}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold">
                  <span className="mr-2 text-ink-mute">Módulo {gi + 1}</span>
                  {modulo}
                </h2>
                <span className="text-sm text-ink-mute">
                  {concl}/{lista.length} concluídas
                </span>
              </div>
              <Card className="overflow-hidden">
                <ol>
                  {lista.map((a, i) => {
                    const ok = feitas.includes(a.id);
                    return (
                      <li key={a.id} className={i ? "border-t border-ink/[0.07]" : ""}>
                        <Link href={`/app/aulas/${a.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-paper/60">
                          {ok ? <CheckCircle2 className="shrink-0 text-folha" size={24} /> : <PlayCircle className="shrink-0 text-azul" size={24} />}
                          <span className="flex-1">
                            <span className="block font-semibold">{a.titulo}</span>
                            <span className="text-sm text-ink-mute">{a.duracao}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </section>
          );
        })}
      </div>
    </div>
  );
}
