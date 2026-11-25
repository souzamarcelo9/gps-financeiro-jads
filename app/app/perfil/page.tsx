"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Laptop, Lock, Smartphone } from "lucide-react";
import { useDemo } from "@/lib/store";
import { brl, dataBR, OBJETIVO_LABEL, PERFIL_LABEL } from "@/lib/labels";
import { AtualizarDadosModal } from "@/components/AtualizarDadosModal";
import { SeletorCarteira } from "@/components/TrocarCarteira";
import { Card, Campo, Selo } from "@/components/ui";

export default function Perfil() {
  const { alunoAtual, chats, atualizarCadastro, carteiras } = useDemo();
  const [nome, setNome] = useState(alunoAtual?.nome ?? "");
  const [tel, setTel] = useState(alunoAtual?.telefone ?? "");
  const [salvo, setSalvo] = useState(false);
  const [editar, setEditar] = useState(false);
  if (!alunoAtual) return null;
  const r = alunoAtual.resultado;
  const perguntas = (chats[alunoAtual.email] ?? []).filter((m) => m.autor === "aluno").length;
  const temAcomp = alunoAtual.produtos.includes("acompanhamento");

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-[2rem] font-bold leading-tight">Meus dados</h1>

      <Card className="p-6">
        <h2 className="font-display text-lg font-bold">Cadastro</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            atualizarCadastro({ nome, telefone: tel });
            setSalvo(true);
          }}
        >
          <Campo id="p-nome" rotulo="Nome completo">
            <input id="p-nome" value={nome} onChange={(e) => (setNome(e.target.value), setSalvo(false))} className="campo py-2.5" />
          </Campo>
          <Campo id="p-tel" rotulo="WhatsApp" ajuda="Usado pela equipe para avisos e atendimento.">
            <input id="p-tel" inputMode="tel" value={tel} onChange={(e) => (setTel(e.target.value), setSalvo(false))} placeholder="(11) 99999-9999" className="campo py-2.5" />
          </Campo>
          <Campo id="p-email" rotulo="E-mail de acesso" ajuda="Para trocar, fale com o suporte para validarmos sua compra.">
            <input id="p-email" value={alunoAtual.email} disabled className="campo bg-paper py-2.5 text-ink-mute" />
          </Campo>
          <div className="flex items-end">
            <button type="submit" className="btn-primario w-full sm:w-auto">
              {salvo ? "Dados salvos" : "Salvar dados"}
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-bold">Produtos</h2>
        <ul className="mt-3 divide-y divide-ink/[0.07]">
          <li className="flex items-center justify-between gap-3 py-3">
            <span>
              <span className="block font-semibold">GPS Financeiro, acesso vitalício</span>
              <span className="text-sm text-ink-mute">
                {alunoAtual.plataforma}, comprado em {dataBR(alunoAtual.compradoEm)}
              </span>
            </span>
            <Selo tom="folha">
              <BadgeCheck size={14} /> Ativo
            </Selo>
          </li>
          <li className="flex items-center justify-between gap-3 py-3">
            <span>
              <span className="block font-semibold">Acompanhamento Individual Vitalício</span>
              <span className="text-sm text-ink-mute">{temAcomp ? "Benefícios liberados" : "Revisão do plano, carteira do Renan e mais"}</span>
            </span>
            {temAcomp ? (
              <Selo tom="folha">
                <BadgeCheck size={14} /> Ativo
              </Selo>
            ) : (
              <Link href="/app/acompanhamento" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ouro-deep">
                <Lock size={14} /> Conhecer
              </Link>
            )}
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Dados do plano</h2>
          <div className="flex gap-2">
            {r && (
              <button type="button" onClick={() => setEditar(true)} className="btn-linha px-4 py-2 text-sm">
                Atualizar dados
              </button>
            )}
            <Link href="/app/questionario" className="btn-linha px-4 py-2 text-sm">
              Refazer questionário
            </Link>
          </div>
        </div>
        {r ? (
          <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
            {(
              [
                ["Perfil", PERFIL_LABEL[r.perfil]],
                ["Objetivo", OBJETIVO_LABEL[r.objetivo]],
                ["Carteira", `${r.codigo}, ${carteiras.find((c) => c.codigo === r.codigo)?.nome ?? ""}`],
                ["Prazo", r.prazo],
                ["Renda mensal", brl(r.rendaMensal)],
                ["Gastos mensais", brl(r.gastosMensais)],
                ["Reserva atual", brl(r.reservaAtual)],
                ["Capital disponível", brl(r.capital)],
                ["Aporte mensal", brl(r.aporteMensal)],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-ink/[0.07] py-2.5">
                <dt className="text-ink-mute">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-ink-mute">Você ainda não respondeu o questionário.</p>
        )}
        {r && (
          <div className="mt-5 rounded-2xl bg-paper p-4">
            <p className="mb-3 text-sm font-semibold text-ink-soft">Trocar objetivo ou perfil sem refazer o questionário</p>
            <SeletorCarteira />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-bold">Dispositivos conectados</h2>
        <p className="mt-1 text-sm text-ink-mute">Sua conta pode ficar conectada em até 2 dispositivos ao mesmo tempo.</p>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3">
            <Laptop className="text-ink-soft" size={22} />
            <span className="flex-1">
              <span className="block font-semibold">Este navegador</span>
              <span className="text-sm text-ink-mute">Conectado agora</span>
            </span>
          </li>
          {alunoAtual.sessoesAtivas > 1 && (
            <li className="flex items-center gap-3">
              <Smartphone className="text-ink-soft" size={22} />
              <span className="flex-1">
                <span className="block font-semibold">iPhone, Safari</span>
                <span className="text-sm text-ink-mute">Último acesso há 2 dias</span>
              </span>
              <button type="button" className="text-sm font-semibold text-alerta">
                Desconectar
              </button>
            </li>
          )}
        </ul>
        <p className="mt-5 text-sm text-ink-mute">
          Você já fez {perguntas} {perguntas === 1 ? "pergunta" : "perguntas"} ao Mentor 24h. O histórico fica salvo no seu cadastro.
        </p>
      </Card>
      <AtualizarDadosModal aberto={editar} onFechar={() => setEditar(false)} />
    </div>
  );
}
