"use client";

import Link from "next/link";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useDemo } from "@/lib/store";
import { reserva } from "@/lib/quiz";
import { Card } from "./ui";

/** Aulas indicadas a partir dos ativos da carteira definida no questionário. */
export function AulasDaCarteira({ limite = 5, compacto = false }: { limite?: number; compacto?: boolean }) {
  const { alunoAtual, carteiras, aulas, metodologia } = useDemo();
  const r = alunoAtual?.resultado;
  if (!r || !alunoAtual) return null;
  const carteira = carteiras.find((c) => c.codigo === r.codigo);
  if (!carteira) return null;

  const ids: string[] = [];
  if (!reserva(r, metodologia).completa) ids.push("a2");
  ids.push("a4");
  carteira.ativos.filter((a) => a.visivel && a.aulaId).forEach((a) => ids.push(a.aulaId!));
  ids.push("a12");
  const lista = Array.from(new Set(ids))
    .map((id) => aulas.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .slice(0, limite);
  const modulos = Array.from(new Set(aulas.map((a) => a.modulo)));

  return (
    <Card className={compacto ? "p-4" : "p-5 sm:p-6"}>
      {compacto ? (
        <p className="text-[13px] font-semibold text-ouro-deep">Aulas ligadas a esta carteira</p>
      ) : (
        <h2 className="text-[1.7rem] font-bold leading-tight">Aulas ligadas a esta carteira</h2>
      )}
      {!compacto && <p className="mt-0.5 text-[14.5px] text-ink-mute">Escolhidas a partir dos ativos do seu plano, {carteira.nome}.</p>}
      <ul className={`mt-3 grid gap-2.5 ${compacto ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {lista.map((a) => {
          const feita = alunoAtual.aulasConcluidas.includes(a.id);
          return (
            <li key={a.id}>
              <Link href={`/app/aulas/${a.id}`} className="flex h-full items-start gap-3 rounded-2xl px-4 py-3 ring-1 ring-ink/10 transition hover:ring-ink/30">
                {feita ? <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-folha" /> : <PlayCircle size={19} className="mt-0.5 shrink-0 text-azul" />}
                <span>
                  <span className="block font-semibold leading-snug">{a.titulo}</span>
                  <span className="text-[13px] text-ink-mute">
                    Módulo {modulos.indexOf(a.modulo) + 1}, {a.modulo.toLowerCase()}, {a.duracao}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
