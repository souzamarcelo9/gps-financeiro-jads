"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { BLOCO_LABEL, PERGUNTAS } from "@/lib/quiz";
import { useDemo } from "@/lib/store";
import type { Respostas } from "@/lib/types";

const fmt = (v: string) => {
  const n = v.replace(/\D/g, "");
  return n ? Number(n).toLocaleString("pt-BR") : "";
};

export default function Questionario() {
  const { salvarQuestionario, respostas, sessao, alunoAtual } = useDemo();
  const router = useRouter();
  const [r, setR] = useState<Respostas>(() => (sessao ? respostas[sessao.email] ?? {} : {}));
  const [i, setI] = useState(0);
  const [gerando, setGerando] = useState(false);
  const p = PERGUNTAS[i];
  const total = PERGUNTAS.length;
  const valor = r[p.id];
  const respondida = valor !== undefined && valor !== "";

  function avancar(novo: Respostas = r) {
    if (i < total - 1) return setI(i + 1);
    setGerando(true);
    salvarQuestionario(novo);
    setTimeout(() => router.push("/app/plano?novo=1"), 1600);
  }

  if (gerando)
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center text-center">
        <div>
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-ink/10 border-t-ouro" />
          <h1 className="mt-6 text-2xl font-bold">Montando o seu plano…</h1>
          <p className="mt-2 text-ink-mute">Cruzando seu perfil, seu objetivo e seu capital com a metodologia.</p>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      {alunoAtual?.resultado && i === 0 && (
        <p className="mb-6 rounded-xl bg-azul-soft px-4 py-3 text-[15px] text-ink-soft">
          Você está refazendo o questionário. Para mudar só valores ou o objetivo, use &quot;Atualizar dados&quot; na página do plano.
        </p>
      )}
      <div className="flex items-center justify-between text-sm font-semibold text-ink-mute">
        <span>{BLOCO_LABEL[p.bloco]}</span>
        <span>
          {i + 1} de {total}
        </span>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {PERGUNTAS.map((q, n) => (
          <div key={q.id} className={`h-1.5 flex-1 rounded-full ${n <= i ? "bg-ink" : "bg-ink/10"}`} />
        ))}
      </div>

      <div key={p.id} className="mt-10">
        <h1 className="text-[1.75rem] font-bold leading-tight sm:text-[2.1rem]">{p.titulo}</h1>
        {p.ajuda && <p className="mt-2 text-ink-mute">{p.ajuda}</p>}

        {p.tipo === "opcoes" ? (
          <div className="mt-8 flex flex-col gap-3" role="radiogroup" aria-label={p.titulo}>
            {p.opcoes!.map((o) => {
              const sel = valor === o.valor;
              return (
                <button
                  key={o.valor}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => {
                    const novo = { ...r, [p.id]: o.valor };
                    setR(novo);
                    setTimeout(() => avancar(novo), 220);
                  }}
                  className={`flex items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left text-[17px] font-semibold transition-colors ${sel ? "border-ink bg-ink text-white" : "border-transparent bg-white text-ink hover:border-ink/25"}`}
                >
                  {o.texto}
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${sel ? "border-ouro bg-ouro text-ink" : "border-ink/20"}`}>{sel && <Check size={14} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (respondida) avancar();
            }}
          >
            <label htmlFor={p.id} className="sr-only">
              {p.titulo}
            </label>
            <div className="flex items-center rounded-2xl bg-white px-5 ring-2 ring-ink/10 focus-within:ring-ink">
              <span className="font-display text-2xl font-bold text-ink-mute">R$</span>
              <input
                id={p.id}
                autoFocus
                inputMode="numeric"
                placeholder={p.placeholder}
                value={valor !== undefined ? fmt(String(valor)) : ""}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "");
                  setR({ ...r, [p.id]: d === "" ? "" : Number(d) });
                }}
                className="w-full bg-transparent px-3 py-5 font-display text-3xl font-bold text-ink placeholder:text-ink/20 focus:outline-none"
              />
            </div>
            <button type="submit" disabled={!respondida} className="btn-primario mt-6 w-full sm:w-auto">
              {i === total - 1 ? "Gerar meu plano" : "Continuar"}
            </button>
          </form>
        )}
      </div>

      {i > 0 && (
        <button type="button" onClick={() => setI(i - 1)} className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <ArrowLeft size={16} /> Pergunta anterior
        </button>
      )}
    </div>
  );
}
