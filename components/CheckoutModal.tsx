"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CreditCard, Lock, ShoppingCart, UserCheck, Webhook } from "lucide-react";
import { Modal } from "./ui";
import { useDemo } from "@/lib/store";
import { brl } from "@/lib/labels";

/** Simula o checkout externo (Hotmart/PayT com compra em 1 clique) e o webhook que libera o acesso. */
export function CheckoutModal() {
  const { checkoutAberto, fecharCheckout, alunoAtual, ofertas, comprarAcompanhamento } = useDemo();
  const [etapa, setEtapa] = useState<"resumo" | "processando" | "aprovado">("resumo");
  const [passo, setPasso] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (checkoutAberto) {
      setEtapa("resumo");
      setPasso(0);
    }
  }, [checkoutAberto]);

  useEffect(() => {
    if (etapa !== "processando") return;
    const ts = [setTimeout(() => setPasso(1), 700), setTimeout(() => setPasso(2), 1400), setTimeout(() => (comprarAcompanhamento(), setEtapa("aprovado")), 2100)];
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa]);

  const oferta = ofertas.acompanhamento;
  const passos = [
    { icon: ShoppingCart, t: "Compra aprovada", d: `Na ${alunoAtual?.plataforma ?? "Hotmart"}` },
    { icon: Webhook, t: "Webhook recebido", d: "Assinatura validada" },
    { icon: UserCheck, t: "Benefícios liberados", d: "Na mesma conta" },
  ];

  return (
    <Modal aberto={checkoutAberto} onFechar={fecharCheckout} largura="max-w-md" semFechar={etapa === "processando"}>
      {etapa === "resumo" && (
        <>
          <p className="flex items-center gap-1.5 text-sm text-ink-mute">
            <Lock size={14} /> Checkout {alunoAtual?.plataforma ?? "Hotmart"} (simulação)
          </p>
          <h2 className="mt-3 text-2xl font-bold">{oferta.titulo}</h2>
          <div className="mt-5 rounded-2xl bg-paper p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-ink-soft">Pagamento único</span>
              <span className="font-display text-3xl font-bold">{brl(oferta.preco)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-mute">ou 12x no cartão. Sem mensalidade, acesso vitalício.</p>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink/10 p-3.5">
            <CreditCard className="text-ink-soft" size={22} />
            <div className="text-sm">
              <p className="font-semibold">Cartão salvo na sua primeira compra</p>
              <p className="text-ink-mute">•••• 4821, conta {alunoAtual?.email}</p>
            </div>
          </div>
          <button type="button" onClick={() => setEtapa("processando")} className="btn-ouro mt-5 w-full text-[17px]">
            Comprar com 1 clique
          </button>
          <p className="mt-3 text-center text-[13px] text-ink-mute">
            Na versão final, este botão abre o checkout real com o seu e-mail já preenchido, para a compra cair na mesma conta.
          </p>
        </>
      )}
      {etapa !== "resumo" && (
        <div className="py-2">
          <h2 className="text-2xl font-bold">{etapa === "aprovado" ? "Tudo certo! Benefícios liberados" : "Processando sua compra…"}</h2>
          <ol className="mt-6 space-y-4">
            {passos.map((p, i) => {
              const feito = etapa === "aprovado" || passo > i;
              const atual = etapa === "processando" && passo === i;
              return (
                <li key={p.t} className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${feito ? "bg-folha text-white" : atual ? "bg-ouro-soft text-ouro-deep" : "bg-paper text-ink-mute"}`}>
                    {feito ? <BadgeCheck size={20} /> : <p.icon size={19} />}
                  </span>
                  <span>
                    <span className="block font-semibold">{p.t}</span>
                    <span className="text-sm text-ink-mute">{p.d}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          {etapa === "aprovado" && (
            <>
              <p className="mt-6 text-ink-soft">A aba Acompanhamento Individual foi desbloqueada e as ofertas deste programa não aparecem mais para você.</p>
              <button type="button" onClick={() => (fecharCheckout(), router.push("/app/acompanhamento"))} className="btn-primario mt-5 w-full">
                Ver meus benefícios
              </button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
