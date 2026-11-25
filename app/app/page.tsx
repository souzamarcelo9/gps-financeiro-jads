"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Compass, LifeBuoy, MessageCircle, PlayCircle, Smartphone, Wallet } from "lucide-react";
import { useDemo } from "@/lib/store";
import { reserva } from "@/lib/quiz";
import { brl, dataLonga, OBJETIVO_LABEL, PERFIL_LABEL } from "@/lib/labels";
import { ProgramasComplementares } from "@/components/ProgramasComplementares";
import { AulasDaCarteira } from "@/components/AulasDaCarteira";
import { Barra, Card, IconChip } from "@/components/ui";

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function Inicio() {
  const { alunoAtual, carteiras, aulas, metodologia, mentor, abrirMentor } = useDemo();
  if (!alunoAtual) return null;
  const r = alunoAtual.resultado;
  const nome = alunoAtual.nome.split(" ")[0];
  const carteira = r ? carteiras.find((c) => c.codigo === r.codigo) : undefined;
  const rs = r ? reserva(r, metodologia) : undefined;
  const concluidas = alunoAtual.aulasConcluidas.length;
  const proxima = aulas.find((a) => !alunoAtual.aulasConcluidas.includes(a.id) && a.id !== "a0") ?? aulas[1];

  const passos = [
    { feito: alunoAtual.viuBoasVindas, texto: "Assistir ao vídeo de boas-vindas", href: "/app/aulas/a0" },
    { feito: !!r, texto: "Responder o questionário de perfil", href: "/app/questionario" },
    { feito: !!r && alunoAtual.aulasConcluidas.includes("a4"), texto: "Entender como ler a sua carteira", href: "/app/aulas/a4" },
    { feito: !!rs?.completa, texto: "Completar a reserva de emergência", href: "/app/plano#reserva" },
    { feito: concluidas >= 6, texto: "Concluir os primeiros módulos de aulas", href: "/app/aulas" },
  ];
  const feitos = passos.filter((p) => p.feito).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-folha">{dataLonga()}</p>
          <h1 className="text-[2rem] font-bold leading-tight sm:text-[2.3rem]">
            {saudacao()}, {nome}
          </h1>
          <p className="text-ink-mute">{r ? "Sua carteira está salva. Continue de onde parou." : "Vamos montar a sua carteira de investimentos?"}</p>
        </div>
      </div>

      {!alunoAtual.telefone && (
        <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-azul-soft px-4 py-3 text-[15px] text-ink-soft">
          <Smartphone size={18} className="text-azul" /> Cadastre seu WhatsApp para receber avisos importantes sobre o seu plano.
          <Link href="/app/perfil" className="font-semibold text-azul underline underline-offset-2">
            Cadastrar agora
          </Link>
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        {r && carteira ? (
          <section className="relative overflow-hidden rounded-[28px] bg-noite p-7 text-white sm:p-8" style={{ background: "radial-gradient(120% 120% at 100% 0%, #24405F 0%, #10233A 60%)" }}>
            <p className="text-white/65">Sua carteira</p>
            <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-3">
              <span className="font-display text-[5.5rem] font-extrabold leading-[0.8] text-ouro sm:text-[6.5rem]">{r.codigo}</span>
              <div className="pb-1">
                <p className="font-display text-[1.45rem] font-bold leading-tight">{carteira.nome}</p>
                <p className="text-white/70">
                  {PERFIL_LABEL[r.perfil]}, {OBJETIVO_LABEL[r.objetivo].toLowerCase()}
                </p>
              </div>
            </div>
            <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.08] p-3.5">
                <p className="text-[13px] text-white/60">Para investir agora</p>
                <p className="font-display text-xl font-bold">{brl(r.capital)}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-3.5">
                <p className="text-[13px] text-white/60">Aporte mensal</p>
                <p className="font-display text-xl font-bold">{brl(r.aporteMensal)}</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app/plano" className="btn-ouro">
                <Wallet size={18} /> Abrir minha carteira
              </Link>
              <Link href="/app/plano#perfil" className="btn border border-white/25 text-white hover:bg-white/10">
                Ver meu resultado
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] bg-noite p-7 text-white sm:p-9">
            <IconChip icon={Compass} tom="ouro" tamanho={46} />
            <h2 className="mt-5 text-[1.9rem] font-bold leading-tight">Descubra seu perfil e receba sua carteira de investimentos</h2>
            <p className="mt-3 max-w-lg text-white/70">São 12 perguntas rápidas sobre como você lida com riscos, seus objetivos e sua vida financeira. Em cerca de 3 minutos, sua carteira personalizada fica pronta.</p>
            <Link href="/app/questionario" className="btn-ouro mt-7">
              Começar questionário
            </Link>
          </section>
        )}
        {r && rs ? (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <IconChip icon={LifeBuoy} tom={rs.completa ? "folha" : "ouro"} />
              <h2 className="font-display text-lg font-bold">Reserva de emergência</h2>
            </div>
            <div className="mt-5 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold">{rs.pct}%</span>
              <span className="text-sm text-ink-mute">meta {brl(rs.ideal)}</span>
            </div>
            <div className="mt-2">
              <Barra pct={rs.pct} cor={rs.completa ? "bg-folha" : "bg-ouro"} altura="h-2.5" />
            </div>
            <p className="mt-3 text-sm text-ink-soft">{rs.completa ? "Reserva completa. Seus aportes vão direto para a carteira." : `Faltam ${brl(rs.falta)} para completar.`}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-paper p-3">
                <dt className="text-ink-mute">Cobre hoje</dt>
                <dd className="font-display text-lg font-bold">{rs.mesesCobertos.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses</dd>
              </div>
              <div className="rounded-xl bg-paper p-3">
                <dt className="text-ink-mute">Gastos mensais</dt>
                <dd className="font-display text-lg font-bold">{brl(r.gastosMensais)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[13px] text-ink-mute">Guarde em renda fixa com liquidez diária, como Tesouro Selic ou CDB de liquidez diária.</p>
            <Link href="/app/plano#reserva" className="mt-3 inline-block text-sm font-semibold text-ink-soft underline underline-offset-2">
              Atualizar minha reserva
            </Link>
          </Card>
        ) : (
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Seus próximos passos</h2>
            <span className="text-sm font-semibold text-ink-mute">
              {feitos} de {passos.length}
            </span>
          </div>
          <div className="mt-3">
            <Barra pct={(feitos / passos.length) * 100} cor="bg-folha" />
          </div>
          <ol className="mt-4 space-y-1">
            {passos.map((p) => (
              <li key={p.texto}>
                <Link href={p.href} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper">
                  {p.feito ? <CheckCircle2 size={20} className="shrink-0 text-folha" /> : <Circle size={20} className="shrink-0 text-ink/25" />}
                  <span className={`text-[15px] ${p.feito ? "text-ink-mute line-through" : "font-semibold"}`}>{p.texto}</span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
        )}
      </div>

      <div className={`grid gap-5 ${r ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {r && (
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Seus próximos passos</h2>
            <span className="text-sm font-semibold text-ink-mute">
              {feitos} de {passos.length}
            </span>
          </div>
          <div className="mt-3">
            <Barra pct={(feitos / passos.length) * 100} cor="bg-folha" />
          </div>
          <ol className="mt-4 space-y-1">
            {passos.map((p) => (
              <li key={p.texto}>
                <Link href={p.href} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper">
                  {p.feito ? <CheckCircle2 size={20} className="shrink-0 text-folha" /> : <Circle size={20} className="shrink-0 text-ink/25" />}
                  <span className={`text-[15px] ${p.feito ? "text-ink-mute line-through" : "font-semibold"}`}>{p.texto}</span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
        )}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <IconChip icon={PlayCircle} tom="azul" />
            <h2 className="font-display text-lg font-bold">Continue aprendendo</h2>
          </div>
          <p className="mt-4 text-sm text-ink-mute">{proxima.modulo}</p>
          <p className="font-semibold leading-snug">{proxima.titulo}</p>
          <p className="text-sm text-ink-mute">{proxima.duracao}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link href={`/app/aulas/${proxima.id}`} className="btn-linha px-4 py-2 text-sm">
              Assistir aula
            </Link>
            <span className="text-[13px] text-ink-mute">
              {concluidas}/{aulas.length} aulas
            </span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <IconChip icon={MessageCircle} tom="roxo" />
            <h2 className="font-display text-lg font-bold">Mentor 24h</h2>
          </div>
          <p className="mt-1 text-sm text-ink-mute">Já conhece sua carteira e responde na hora.</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {mentor.sugestoes.slice(1, 4).map((s) => (
              <button key={s} type="button" onClick={() => abrirMentor(s)} className="rounded-xl bg-paper px-3.5 py-2 text-left text-sm font-semibold text-ink-soft hover:bg-paper-deep">
                {s}
              </button>
            ))}
          </div>
        </Card>
      </div>


      <ProgramasComplementares />

      <AulasDaCarteira limite={6} />
    </div>
  );
}
