"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clock, Copy, DollarSign, Mail, Receipt, RotateCcw, ShieldAlert, ShoppingCart, UserCheck, Webhook, Zap } from "lucide-react";
import { TituloPagina } from "@/components/AdminShell";
import { Abas, Card, IconChip, Indicador, Selo } from "@/components/ui";
import { useDemo } from "@/lib/store";
import { brl, dataHoraBR } from "@/lib/labels";

type Aba = "transacoes" | "integracoes" | "webhooks";

const INTEGRACOES = [
  { nome: "Hotmart", tipo: "Pagamentos e liberação de acesso", status: "Conectado", detalhe: "Eventos: compra aprovada, reembolso, chargeback, boleto/Pix pendente. Upsell com compra em 1 clique configurado no próprio checkout." },
  { nome: "PayT", tipo: "Pagamentos e liberação de acesso", status: "Conectado", detalhe: "Mesmos eventos da Hotmart, validados por assinatura do webhook." },
  { nome: "UTMify", tipo: "Rastreamento de vendas", status: "Conectado", detalhe: "Recebe as vendas dos checkouts com as UTMs das campanhas." },
  { nome: "Meta Pixel e API de Conversões", tipo: "Rastreamento de campanhas", status: "Conectado", detalhe: "Eventos de compra e upsell enviados para o Meta Ads." },
  { nome: "VTurb", tipo: "Vídeos de vendas", status: "Configurar", detalhe: "Player com métricas de retenção para os vídeos das ofertas." },
];

export default function Pagamentos() {
  const { transacoes, webhooks, simularVenda } = useDemo();
  const [aba, setAba] = useState<Aba>("transacoes");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [gateway, setGateway] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  const aprovadas = transacoes.filter((t) => t.status === "aprovado");
  const receita = aprovadas.reduce((s, t) => s + t.valor, 0);
  const reembolsos = transacoes.filter((t) => t.status === "reembolsado" || t.status === "chargeback");
  const pendentes = transacoes.filter((t) => t.status === "pendente");
  const upsells = aprovadas.filter((t) => t.produto.includes("Acompanhamento")).length;

  const lista = useMemo(() => {
    const b = busca.toLowerCase();
    return transacoes.filter((t) => (!b || t.id.toLowerCase().includes(b) || t.cliente.toLowerCase().includes(b) || t.email.includes(b) || t.produto.toLowerCase().includes(b)) && (!status || t.status === status) && (!gateway || t.gateway === gateway));
  }, [transacoes, busca, status, gateway]);

  return (
    <>
      <TituloPagina
        titulo="Pagamentos"
        descricao="A venda acontece na Hotmart ou na PayT. Aqui você acompanha os pedidos e os webhooks que liberam ou bloqueiam o acesso automaticamente."
        acao={
          <button type="button" onClick={() => (simularVenda(), setAviso("Venda simulada: webhook recebido, aluno criado e e-mail de acesso enviado."), setTimeout(() => setAviso(null), 3500))} className="btn-primario py-2.5 text-sm">
            <Zap size={16} /> Simular compra
          </button>
        }
      />
      {aviso && <p className="mb-5 rounded-xl bg-folha-soft px-4 py-3 font-semibold text-folha">{aviso}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador rotulo="Receita aprovada" valor={brl(receita)} icon={DollarSign} tom="azul" rodape={`${aprovadas.length} vendas`} />
        <Indicador rotulo="Ticket médio" valor={brl(receita / Math.max(1, aprovadas.length - upsells), 2)} icon={Receipt} tom="folha" rodape={`inclui ${upsells} upsells de acompanhamento`} />
        <Indicador rotulo="Reembolsos e chargebacks" valor={brl(reembolsos.reduce((s, t) => s + t.valor, 0))} icon={RotateCcw} tom="alerta" rodape={`${reembolsos.length} pedidos, acesso bloqueado`} />
        <Indicador rotulo="Pendentes" valor={String(pendentes.length)} icon={Clock} tom="ouro" rodape="Pix ou boleto aguardando" />
      </div>

      <Card className="mt-5 p-5">
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            { icon: ShoppingCart, t: "Compra aprovada", d: "Na Hotmart ou na PayT" },
            { icon: Webhook, t: "Webhook recebido", d: "Assinatura validada em menos de 1s" },
            { icon: UserCheck, t: "Aluno criado", d: "Produto liberado pelo e-mail da compra" },
            { icon: Mail, t: "E-mail enviado", d: "Boas-vindas e link de acesso" },
          ].map((p, i, arr) => (
            <li key={p.t} className="flex items-center gap-3">
              <IconChip icon={p.icon} tom="azul" />
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{p.t}</span>
                <span className="text-[13px] text-ink-mute">{p.d}</span>
              </span>
              {i < arr.length - 1 && <ArrowRight size={16} className="hidden text-ink/25 md:block" />}
            </li>
          ))}
        </ol>
      </Card>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-alerta-soft/70 px-4 py-3 text-[15px] text-ink-soft">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-alerta" /> Reembolso ou chargeback bloqueiam só o produto correspondente, na hora. E-mails sem compra aprovada não recebem código de login.
      </p>

      <Abas
        className="mt-6"
        valor={aba}
        onChange={setAba}
        itens={[
          { id: "transacoes", rotulo: "Transações", total: transacoes.length },
          { id: "integracoes", rotulo: "Integrações", total: INTEGRACOES.length },
          { id: "webhooks", rotulo: "Webhooks", total: webhooks.length },
        ]}
      />

      {aba === "transacoes" && (
        <Card className="mt-4 overflow-hidden">
          <div className="grid gap-3 border-b border-ink/[0.07] p-4 sm:grid-cols-[2fr_1fr_1fr]">
            <input aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por pedido, cliente ou produto" className="campo py-2.5" />
            <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="campo py-2.5">
              <option value="">Todos os status</option>
              <option value="aprovado">Aprovado</option>
              <option value="pendente">Pendente</option>
              <option value="reembolsado">Reembolsado</option>
              <option value="chargeback">Chargeback</option>
            </select>
            <select aria-label="Gateway" value={gateway} onChange={(e) => setGateway(e.target.value)} className="campo py-2.5">
              <option value="">Todos os gateways</option>
              <option>Hotmart</option>
              <option>PayT</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[15px]">
              <thead className="bg-paper/60 text-[13px] text-ink-mute">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-3 py-3 font-semibold">Cliente</th>
                  <th className="px-3 py-3 font-semibold">Produto</th>
                  <th className="px-3 py-3 font-semibold">Gateway</th>
                  <th className="px-3 py-3 text-right font-semibold">Valor</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {lista.slice(0, 40).map((t) => (
                  <tr key={t.id} className="border-t border-ink/[0.05]">
                    <td className="px-4 py-3 text-ink-mute">{t.id}</td>
                    <td className="px-3 py-3">
                      <span className="block font-semibold">{t.cliente}</span>
                      <span className="text-[13px] text-ink-mute">{t.email}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block">{t.produto}</span>
                      <span className="text-[13px] text-ink-mute">{t.metodo}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${t.gateway === "Hotmart" ? "bg-arrojado" : "bg-alerta"}`} />
                        {t.gateway}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">{brl(t.valor, 2)}</td>
                    <td className="px-3 py-3">
                      <Selo tom={t.status === "aprovado" ? "folha" : t.status === "pendente" ? "ouro" : "alerta"}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {{ aprovado: "Aprovado", pendente: "Pendente", reembolsado: "Reembolsado", chargeback: "Chargeback" }[t.status]}
                      </Selo>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-ink-soft">{dataHoraBR(t.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista.length === 0 && <p className="p-8 text-center text-ink-mute">Nenhuma transação com esses filtros.</p>}
          </div>
        </Card>
      )}

      {aba === "integracoes" && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {INTEGRACOES.map((i) => (
            <Card key={i.nome} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{i.nome}</p>
                  <p className="text-sm text-ink-mute">{i.tipo}</p>
                </div>
                <Selo tom={i.status === "Conectado" ? "folha" : "ouro"}>{i.status}</Selo>
              </div>
              <p className="mt-3 text-[15px] text-ink-soft">{i.detalhe}</p>
              {(i.nome === "Hotmart" || i.nome === "PayT") && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-[13px]">
                  <code className="flex-1 truncate">https://gpsfinanceiro.com.br/api/webhooks/{i.nome.toLowerCase()}</code>
                  <button type="button" aria-label="Copiar endereço do webhook" onClick={() => navigator.clipboard?.writeText(`https://gpsfinanceiro.com.br/api/webhooks/${i.nome.toLowerCase()}`).catch(() => {})} className="text-ink-mute hover:text-ink">
                    <Copy size={15} />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {aba === "webhooks" && (
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[15px]">
            <thead className="bg-paper/60 text-[13px] text-ink-mute">
              <tr>
                <th className="px-4 py-3 font-semibold">Recebido</th>
                <th className="px-3 py-3 font-semibold">Origem</th>
                <th className="px-3 py-3 font-semibold">Evento</th>
                <th className="px-3 py-3 font-semibold">E-mail</th>
                <th className="px-3 py-3 font-semibold">O que o sistema fez</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((w) => (
                <tr key={w.id} className="border-t border-ink/[0.05]">
                  <td className="px-4 py-3 text-[14px] text-ink-mute">{dataHoraBR(w.recebidoEm)}</td>
                  <td className="px-3 py-3">{w.plataforma}</td>
                  <td className="px-3 py-3">
                    <code className="rounded bg-paper px-1.5 py-0.5 text-[13px]">{w.evento}</code>
                  </td>
                  <td className="px-3 py-3">
                    <span className="block">{w.email}</span>
                    <span className="text-[13px] text-ink-mute">{w.produto}</span>
                  </td>
                  <td className={`px-3 py-3 font-semibold ${w.acao.includes("bloqueado") ? "text-alerta" : w.acao.includes("Aguardando") ? "text-ouro-deep" : "text-folha"}`}>{w.acao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
