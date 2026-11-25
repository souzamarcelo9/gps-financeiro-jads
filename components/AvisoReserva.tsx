"use client";

import { useState } from "react";
import { LifeBuoy, PencilLine, Wallet } from "lucide-react";
import { useDemo } from "@/lib/store";
import { reserva } from "@/lib/quiz";
import { brl, OBJETIVO_CURTO, PERFIL_LABEL } from "@/lib/labels";
import { Card } from "./ui";

type Escolha = "providenciar" | "sem_reserva";

/** Aviso da reserva antes da carteira. Orienta, mas não trava: o aluno escolhe e segue. */
export function AvisoReserva() {
  const { alunoAtual, metodologia, decidirReserva } = useDemo();
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const r = alunoAtual?.resultado;
  if (!r) return null;
  const rs = reserva(r, metodologia);
  const restante = Math.max(0, rs.falta - r.capital);
  const meses = restante > 0 && r.aporteMensal > 0 ? Math.ceil(restante / r.aporteMensal) : 0;

  const opcoes: { v: Escolha; t: string; d: string }[] = [
    { v: "providenciar", t: "Entendi a orientação e vou primeiro providenciar a reserva de emergência", d: "Você vê a carteira normalmente e usa o dinheiro disponível para completar a reserva antes." },
    { v: "sem_reserva", t: "Entendi a orientação, mas prefiro iniciar meus investimentos sem ter a reserva", d: "Você segue direto para a carteira. Dá para rever essa escolha quando quiser." },
  ];

  return (
    <section className="rounded-[24px] border-2 border-ouro bg-ouro-soft/50 p-5 sm:p-7">
      <div className="flex items-start gap-3.5">
        <LifeBuoy className="mt-1 shrink-0 text-ouro-deep" size={28} />
        <div>
          <h3 className="text-[1.4rem] font-bold leading-tight sm:text-[1.6rem]">Antes da carteira: complete sua reserva de emergência</h3>
          <p className="mt-2 max-w-3xl text-ink-soft">
            A reserva é o dinheiro que protege você de imprevistos, como perder o emprego ou um problema de saúde, sem precisar vender seus investimentos no pior momento. Ela deve ficar em um investimento seguro e com resgate imediato, como o{" "}
            <strong className="text-ink">Tesouro Selic</strong> ou um <strong className="text-ink">CDB com liquidez diária</strong>.
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4">
          <dt className="text-sm text-ink-mute">Reserva ideal</dt>
          <dd className="font-display text-2xl font-bold">{brl(rs.ideal)}</dd>
          <dd className="text-[13px] text-ink-mute">
            {metodologia.mesesReserva} × {brl(r.gastosMensais)} de gastos mensais
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <dt className="text-sm text-ink-mute">Você já tem</dt>
          <dd className="font-display text-2xl font-bold">{brl(r.reservaAtual)}</dd>
          <dd className="text-[13px] text-ink-mute">{rs.pct}% da meta</dd>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <dt className="text-sm text-ink-mute">Falta juntar</dt>
          <dd className="font-display text-2xl font-bold text-ouro-deep">{brl(rs.falta)}</dd>
          <dd className="text-[13px] text-ink-mute">
            {restante === 0 ? "Dá para completar agora com o capital disponível" : meses ? `Cerca de ${meses} meses, usando o capital e aportes de ${brl(r.aporteMensal)}` : ""}
          </dd>
        </div>
      </dl>

      {r.capital > 0 && (
        <p className="mt-4 text-[15px] text-ink-soft">
          Você informou {brl(r.capital)} disponíveis agora.{" "}
          {r.capital >= rs.falta ? `Use ${brl(rs.falta)} para completar a reserva e invista o restante, ${brl(r.capital - rs.falta)}, na sua carteira.` : "Pela metodologia, esse valor iria primeiro para a reserva."}
        </p>
      )}

      <fieldset className="mt-5">
        <legend className="sr-only">Como você quer seguir?</legend>
        <div className="space-y-2.5">
          {opcoes.map((o) => (
            <label key={o.v} className={`flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-2 transition ${escolha === o.v ? "ring-noite" : "ring-transparent hover:ring-ink/15"}`}>
              <input type="radio" name="decisao-reserva" value={o.v} checked={escolha === o.v} onChange={() => setEscolha(o.v)} className="mt-1 h-5 w-5 shrink-0 accent-[#10233A]" />
              <span>
                <span className="block font-semibold leading-snug">{o.t}</span>
                <span className="text-[14px] text-ink-mute">{o.d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        disabled={!escolha}
        onClick={() => {
          decidirReserva(escolha!);
          setTimeout(() => document.getElementById("carteira")?.scrollIntoView({ behavior: "smooth" }), 80);
        }}
        className="btn-primario mt-5 w-full sm:w-auto"
      >
        <Wallet size={18} /> {escolha ? "Ver minha carteira" : "Escolha uma opção para ver a carteira"}
      </button>
    </section>
  );
}

/** Resumo dos dados usados nos cálculos, com edição direta (sem refazer o questionário). */
export function SeusDados({ onEditar }: { onEditar: () => void }) {
  const { alunoAtual } = useDemo();
  const r = alunoAtual?.resultado;
  if (!r) return null;
  const itens: [string, string][] = [
    ["Investir agora", brl(r.capital)],
    ["Aporte mensal", brl(r.aporteMensal)],
    ["Reserva atual", brl(r.reservaAtual)],
    ["Gastos mensais", brl(r.gastosMensais)],
    ["Renda mensal", brl(r.rendaMensal)],
    ["Perfil e objetivo", `${PERFIL_LABEL[r.perfil]}, ${OBJETIVO_CURTO[r.objetivo].toLowerCase()}`],
  ];
  return (
    <Card className="p-4">
      <p className="text-[13px] font-semibold text-ouro-deep">Seus dados</p>
      <dl className="mt-2 divide-y divide-ink/[0.06] text-[14px]">
        {itens.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-1.5">
            <dt className="text-ink-mute">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onEditar} className="btn-linha mt-3 w-full py-2 text-sm">
        <PencilLine size={15} /> Editar meus dados
      </button>
      <p className="mt-2 text-[12.5px] text-ink-mute">A carteira é recalculada na hora, sem refazer o questionário.</p>
    </Card>
  );
}
