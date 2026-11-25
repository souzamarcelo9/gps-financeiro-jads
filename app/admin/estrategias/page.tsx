"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, EyeOff, Layers, MessageCircle, PlayCircle } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { Card, IconChip } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { OBJETIVOS, OBJETIVO_LABEL, OBJETIVO_SLUG, PERFIL_LABEL } from "@/lib/labels";
import type { Estrategias as E } from "@/lib/types";

export default function Estrategias() {
  const { estrategias, carteiras, salvarEstrategias } = useDemo();
  const [e, setE] = useState<E>(estrategias);
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <>
      <TituloPagina
        titulo="Estratégias prontas"
        descricao="Três estratégias de bônus que usam as carteiras já cadastradas. Elas não aparecem no menu nem em áreas de destaque."
        acao={
          <button type="button" disabled={JSON.stringify(e) === JSON.stringify(estrategias)} onClick={() => (salvarEstrategias(e), setAviso("Estratégias salvas."))} className="btn-primario">
            Salvar estratégias
          </button>
        }
      />
      {aviso && <p className="mb-5 rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">{aviso}</p>}

      <Card className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <span className="flex items-center gap-2 font-semibold">
          <EyeOff size={18} className="text-ink-mute" /> Acesso discreto
        </span>
        <span className="flex items-center gap-2 text-[15px] text-ink-soft">
          <PlayCircle size={18} className="text-azul" /> Links na descrição da aula{" "}
          <Link href="/admin/aulas" className="font-semibold underline underline-offset-2">
            As 3 estratégias prontas
          </Link>
        </span>
        <span className="flex items-center gap-2 text-[15px] text-ink-soft">
          <MessageCircle size={18} className="text-roxo" /> Enviadas pelo Mentor 24h quando o aluno pede
        </span>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {OBJETIVOS.map((o) => {
          const c = carteiras.find((k) => k.codigo === e[o])!;
          const caminho = `/app/estrategias/${OBJETIVO_SLUG[o]}`;
          return (
            <Card key={o} className="min-w-0 p-6">
              <IconChip icon={Layers} tom="ouro" />
              <h2 className="mt-4 font-display text-xl font-bold">{OBJETIVO_LABEL[o]}</h2>
              <label htmlFor={`est-${o}`} className="rotulo mt-4">
                Carteira usada
              </label>
              <select id={`est-${o}`} value={e[o]} onChange={(ev) => setE({ ...e, [o]: ev.target.value })} className="campo py-2.5">
                {carteiras.map((k) => (
                  <option key={k.codigo} value={k.codigo}>
                    {k.codigo}: {k.nome}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-ink-mute">
                {PERFIL_LABEL[c.perfil]}, {c.ativos.length} ativos
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-[13px]">
                <code className="flex-1 truncate">{caminho}</code>
                <button type="button" onClick={() => navigator.clipboard?.writeText(location.origin + caminho).catch(() => {})} aria-label="Copiar link" className="text-ink-mute hover:text-ink">
                  <Copy size={15} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
