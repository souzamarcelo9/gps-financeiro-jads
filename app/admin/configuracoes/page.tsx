"use client";

import { useState } from "react";
import { TituloPagina } from "@/components/AdminShell";
import { Card, Campo, Interruptor } from "@/components/ui";

export default function Configuracoes() {
  const [c, setC] = useState({ dispositivos: 2, sessaoDias: 30, codigoMin: 10, suporte: "https://wa.me/5511999999999", emailSuporte: "suporte@r7investimentos.com.br", avisoLogin: true });
  const [salvo, setSalvo] = useState(false);
  const set = (p: Partial<typeof c>) => (setC({ ...c, ...p }), setSalvo(false));
  return (
    <>
      <TituloPagina
        titulo="Configurações"
        descricao="Acesso, sessões e canais de suporte."
        acao={
          <button type="button" onClick={() => setSalvo(true)} className="btn-primario">
            {salvo ? "Configurações salvas" : "Salvar configurações"}
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Acesso e sessões</h2>
          <Campo id="c-disp" rotulo="Dispositivos conectados ao mesmo tempo" ajuda="Ao passar do limite, o acesso mais antigo é encerrado.">
            <input id="c-disp" type="number" min={1} max={5} value={c.dispositivos} onChange={(e) => set({ dispositivos: Number(e.target.value) })} className="campo w-32 py-2.5" />
          </Campo>
          <Campo id="c-sess" rotulo="Dias que o aluno fica conectado sem novo código">
            <input id="c-sess" type="number" min={1} value={c.sessaoDias} onChange={(e) => set({ sessaoDias: Number(e.target.value) })} className="campo w-32 py-2.5" />
          </Campo>
          <Campo id="c-cod" rotulo="Validade do código de acesso (minutos)">
            <input id="c-cod" type="number" min={5} value={c.codigoMin} onChange={(e) => set({ codigoMin: Number(e.target.value) })} className="campo w-32 py-2.5" />
          </Campo>
          <label className="flex items-center justify-between gap-3 text-[15px]">
            Avisar o aluno quando outro dispositivo entrar
            <Interruptor ligado={c.avisoLogin} onChange={(v) => set({ avisoLogin: v })} rotulo="Avisar novo dispositivo" />
          </label>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Suporte</h2>
          <Campo id="c-zap" rotulo="Link do WhatsApp de suporte">
            <input id="c-zap" value={c.suporte} onChange={(e) => set({ suporte: e.target.value })} className="campo py-2.5" />
          </Campo>
          <Campo id="c-mail" rotulo="E-mail de suporte">
            <input id="c-mail" value={c.emailSuporte} onChange={(e) => set({ emailSuporte: e.target.value })} className="campo py-2.5" />
          </Campo>
        </Card>
      </div>
    </>
  );
}
