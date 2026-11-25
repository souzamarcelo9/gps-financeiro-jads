"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, PlayCircle, Zap } from "lucide-react";
import { OBJETIVO_LABEL, PERFIL_LABEL } from "@/lib/labels";
import { useDemo } from "@/lib/store";
import { responder } from "@/lib/assistente";
import { VideoPlayer } from "./VideoPlayer";
import type { MensagemChat } from "@/lib/types";

function agora() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${d.toTimeString().slice(0, 5)}`;
}

export function MentorFlutuante() {
  const demo = useDemo();
  const { alunoAtual, chats, usoHoje, mentor, mentorAberto, abrirMentor, fecharMentor, perguntaPendente, limparPergunta, adicionarMensagens, registrarUsoIA, abrirCheckout, temAcompanhamento, ofertas } = demo;
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const email = alunoAtual?.email ?? "";
  const mensagens = chats[email] ?? [];
  const uso = usoHoje[email] ?? 0;
  const esgotado = uso >= mentor.limites.mensagensPorDia;
  const r = alunoAtual?.resultado;
  const carteira = r ? demo.carteiras.find((c) => c.codigo === r.codigo) : undefined;
  const saudacao = r && carteira
    ? `Oi, ${alunoAtual?.nome.split(" ")[0]}. O seu perfil é ${PERFIL_LABEL[r.perfil].toLowerCase()} e o objetivo é ${OBJETIVO_LABEL[r.objetivo].toLowerCase()}, então a sua carteira é a ${carteira.codigo}, ${carteira.nome}. Posso explicar a calculadora, uma aula, o que significa o selo de cada ativo ou como funciona o Programa de Acompanhamento Individual.`
    : `Oi, ${alunoAtual?.nome.split(" ")[0]}! Sou o Mentor 24h. Responda o questionário para eu conhecer o seu plano. Enquanto isso, posso explicar conceitos e indicar aulas.`;

  const sugestoes = mentor.sugestoes.filter((s) => !(temAcompanhamento && s.toLowerCase().includes("acompanhamento")) && (ofertas.acompanhamento.locais.mentor || !s.toLowerCase().includes("acompanhamento")));

  useEffect(() => {
    if (mentorAberto) fimRef.current?.scrollIntoView({ block: "end" });
  }, [mentorAberto, mensagens.length, pensando]);

  function enviar(conteudo: string) {
    const t = conteudo.trim();
    if (!t || pensando || esgotado || !alunoAtual) return;
    adicionarMensagens(email, [{ id: `u${Date.now()}`, autor: "aluno", texto: t, hora: agora() }]);
    setTexto("");
    setPensando(true);
    const resp = responder(t, { aluno: alunoAtual, carteiras: demo.carteiras, aulas: demo.aulas, mentor, metodologia: demo.metodologia, ofertas });
    setTimeout(() => {
      adicionarMensagens(email, [{ id: `a${Date.now()}`, autor: "assistente", hora: agora(), ...resp }]);
      if (!resp.semIA) registrarUsoIA(email);
      setPensando(false);
    }, resp.semIA ? 450 : 1200);
  }

  useEffect(() => {
    if (mentorAberto && perguntaPendente) {
      enviar(perguntaPendente);
      limparPergunta();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorAberto, perguntaPendente]);

  if (!alunoAtual) return null;

  return (
    <>
      {!mentorAberto && (
        <button
          type="button"
          onClick={() => abrirMentor()}
          className="print:hidden fixed bottom-[78px] right-3 z-40 flex items-center gap-2.5 rounded-full bg-noite py-1.5 pl-1.5 pr-4 sm:gap-3 sm:py-2.5 sm:pl-2.5 sm:pr-5 text-left text-white shadow-[0_12px_30px_-8px_rgba(14,59,67,0.55)] transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-ouro text-ink sm:h-10 sm:w-10">
            <MessageCircle size={20} />
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-ink bg-folha" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold sm:text-base">Mentor 24h</span>
            <span className="hidden text-[13px] text-white/70 sm:block">Tire sua dúvida agora</span>
          </span>
        </button>
      )}

      {mentorAberto && (
        <div
          className="print:hidden fixed inset-0 z-50 flex flex-col bg-white md:inset-auto md:bottom-5 md:right-5 md:h-[min(660px,calc(100vh-40px))] md:w-[410px] md:overflow-hidden md:rounded-[26px] md:shadow-[0_24px_60px_-12px_rgba(14,59,67,0.4)] md:ring-1 md:ring-ink/10"
          role="dialog"
          aria-label="Mentor 24h"
        >
          <header className="flex items-start justify-between gap-3 border-b border-ink/[0.08] px-5 pb-3.5 pt-4">
            <div>
              <p className="text-[12.5px] font-semibold text-ouro-deep">Mentor 24h</p>
              <p className="font-display text-[1.1rem] font-bold leading-tight">
                {uso} de {mentor.limites.mensagensPorDia} mensagens hoje
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-mute">
                {carteira ? `Carteira ${carteira.codigo}, ${carteira.nome}. ` : ""}Respostas curtas, com a aula no lugar de uma conversa longa.
              </p>
            </div>
            <button type="button" onClick={fecharMentor} className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-ink/15 hover:ring-ink/35">
              Fechar
            </button>
          </header>

          <div className="flex-1 space-y-3.5 overflow-y-auto bg-paper/70 px-4 py-4">
            <div className="w-fit max-w-[92%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] ring-1 ring-ink/[0.07]">
              {saudacao}
            </div>
            {mensagens.map((m) => (
              <Mensagem key={m.id} m={m} onCheckout={abrirCheckout} temAcompanhamento={temAcompanhamento} />
            ))}
            {pensando && (
              <div className="ponto-digitando flex w-fit gap-1 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-ink/[0.06]" aria-label="O Mentor está escrevendo">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-ink-mute" />
                ))}
              </div>
            )}
            <div ref={fimRef} />
          </div>

          <div className="border-t border-ink/[0.08] px-4 pb-3 pt-3">
            <div className="mb-3 flex max-h-[104px] flex-wrap gap-2 overflow-y-auto">
              {sugestoes.map((s) => (
                <button key={s} type="button" onClick={() => enviar(s)} disabled={pensando || esgotado} className="rounded-full bg-white px-3 py-1.5 text-left text-[13px] font-semibold text-ink-soft ring-1 ring-ink/15 hover:ring-ink/35 disabled:opacity-50">
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar(texto);
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="msg-mentor" className="sr-only">
                Sua pergunta
              </label>
              <input
                id="msg-mentor"
                maxLength={500}
                value={texto}
                disabled={esgotado}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={esgotado ? "Limite de hoje atingido. Volte amanhã!" : "Pergunte sobre o plano ou uma aula"}
                className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-4 py-3 text-[15px] focus:border-ink focus:outline-none"
              />
              <button type="submit" disabled={!texto.trim() || pensando || esgotado} className="rounded-full bg-ink px-5 py-3 font-semibold text-white disabled:opacity-50">
                Enviar
              </button>
            </form>
            <p className="mt-2 text-center text-[11.5px] text-ink-mute">O Mentor explica a metodologia e não faz recomendações individuais.</p>
          </div>
        </div>
      )}
    </>
  );
}

function Mensagem({ m, onCheckout, temAcompanhamento }: { m: MensagemChat; onCheckout: () => void; temAcompanhamento: boolean }) {
  const { fecharMentor } = useDemo();
  if (m.autor === "aluno") return <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] text-white">{m.texto}</div>;
  return (
    <div className="max-w-[94%]">
      <div className={`rounded-2xl rounded-bl-md px-4 py-3 text-[15px] ring-1 ring-ink/[0.06] ${m.foraDeEscopo ? "bg-ouro-soft/60" : "bg-white"}`}>
        {m.texto.split("\n\n").map((p, i) => (
          <p key={i} className={i ? "mt-2.5" : ""}>
            {p}
          </p>
        ))}
        {m.video && !temAcompanhamento && (
          <div className="mt-3">
            <VideoPlayer titulo="Conheça o Acompanhamento" duracaoSeg={240} compacto />
          </div>
        )}
        {(m.links || m.aula || m.acao) && (
          <div className="mt-3 flex flex-col gap-2">
            {m.acao === "checkout" && !temAcompanhamento && (
              <button type="button" onClick={onCheckout} className="btn-ouro px-4 py-2 text-sm">
                Quero o acompanhamento individual
              </button>
            )}
            {m.links?.map((l) => (
              <Link key={l.href} href={l.href} onClick={fecharMentor} className="btn-primario px-4 py-2 text-sm">
                {l.rotulo}
              </Link>
            ))}
            {m.aula && (
              <Link href={`/app/aulas/${m.aula.id}`} onClick={fecharMentor} className="flex items-center gap-2.5 rounded-xl bg-paper px-3 py-2 text-sm hover:bg-paper-deep">
                <PlayCircle size={20} className="shrink-0 text-azul" />
                <span>
                  <span className="block font-semibold">{m.aula.titulo}</span>
                  <span className="text-ink-mute">{m.aula.modulo}</span>
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
      {m.semIA && (
        <p className="mt-1 flex items-center gap-1 pl-1 text-[11.5px] text-ink-mute">
          <Zap size={11} /> Resposta automática, sem consumo de IA
        </p>
      )}
    </div>
  );
}
