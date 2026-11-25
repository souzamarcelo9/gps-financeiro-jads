"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, GraduationCap, LayoutGrid, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar, Segmentado } from "@/components/ui";
import { CONTAS_DEMO } from "@/lib/data";
import { useDemo } from "@/lib/store";

const CODIGO_DEMO = "123456";

export default function Login() {
  const { verificarEmail, entrar, entrarAdmin, alunos, sessao, pronto } = useDemo();
  const router = useRouter();
  const [modo, setModo] = useState<"aluno" | "admin">("aluno");
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);
  const codigoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pronto) return;
    if (sessao?.papel === "aluno") router.replace("/app");
    if (sessao?.papel === "admin") router.replace("/admin");
  }, [pronto, sessao, router]);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const aluno = alunos.find((a) => a.email === email.trim().toLowerCase());

  function enviarCodigo(e?: React.FormEvent) {
    e?.preventDefault();
    setErro(null);
    if (modo === "admin") {
      if (!email.toLowerCase().includes("r7investimentos")) {
        setErro("Este e-mail não tem acesso ao painel. Use um e-mail de administrador da R7 Investimentos.");
        return;
      }
    } else {
      const r = verificarEmail(email);
      if (r === "sem_compra") return setErro("Não encontramos uma compra aprovada com este e-mail. Use o mesmo e-mail da compra na Hotmart ou PayT.");
      if (r === "pendente") return setErro("Seu pagamento ainda está pendente. Assim que for aprovado, o acesso é liberado automaticamente.");
      if (r === "bloqueado") return setErro("O acesso deste e-mail está suspenso porque a compra foi reembolsada ou contestada. Fale com o suporte se for um engano.");
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEtapa("codigo");
      setEspera(45);
      setTimeout(() => codigoRef.current?.focus(), 50);
    }, 650);
  }

  function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (codigo !== CODIGO_DEMO) return setErro("Código incorreto. Confira o e-mail mais recente ou peça um novo código.");
    if (modo === "admin") {
      entrarAdmin();
      router.push("/admin");
    } else {
      entrar(email);
      router.push("/app");
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_1.05fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">
            <Segmentado
              itens={[
                { id: "aluno", rotulo: "Sou aluno" },
                { id: "admin", rotulo: "Administrador" },
              ]}
              valor={modo}
              onChange={(m) => {
                setModo(m);
                setEtapa("email");
                setErro(null);
                setEmail("");
                setCodigo("");
              }}
            />
            {etapa === "email" ? (
              <form onSubmit={enviarCodigo} noValidate className="mt-7">
                <h1 className="flex items-center gap-2.5 text-[2rem] font-bold leading-tight">
                  {modo === "aluno" ? <GraduationCap className="text-folha" size={30} /> : <LayoutGrid className="text-folha" size={28} />}
                  {modo === "aluno" ? "Boas-vindas de volta" : "Painel do administrador"}
                </h1>
                <p className="mt-2 text-ink-mute">Sem senha para lembrar: enviamos um código de acesso para o seu e-mail.</p>
                <label htmlFor="email" className="rotulo mt-7">
                  {modo === "aluno" ? "E-mail usado na compra" : "E-mail corporativo"}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" size={19} />
                  <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={modo === "aluno" ? "voce@email.com" : "nome@r7investimentos.com.br"} className="campo pl-11" />
                </div>
                {erro && (
                  <p role="alert" className="mt-3 rounded-xl bg-alerta-soft px-4 py-3 text-sm text-alerta">
                    {erro}
                  </p>
                )}
                <button type="submit" disabled={!email.includes("@") || enviando} className="btn-primario mt-5 w-full">
                  {enviando ? "Enviando código…" : "Enviar código de acesso"}
                </button>

                <div className="my-7 flex items-center gap-3 text-[13px] text-ink-mute">
                  <span className="h-px flex-1 bg-ink/10" /> ou acesse a demonstração <span className="h-px flex-1 bg-ink/10" />
                </div>
                {modo === "aluno" ? (
                  <>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {CONTAS_DEMO.map((c) => (
                        <button key={c.email} type="button" onClick={() => (setEmail(c.email), setErro(null))} className={`flex items-center gap-2.5 rounded-2xl bg-white p-3 text-left ring-1 transition hover:ring-ink/30 sm:flex-col sm:items-start ${email === c.email ? "ring-2 ring-ink" : "ring-ink/10"}`}>
                          <Avatar nome={c.nome} tamanho={34} />
                          <span>
                            <span className="block text-sm font-semibold leading-tight">{c.nome}</span>
                            <span className="text-[12.5px] text-ink-mute">{c.descricao}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-ink-mute">
                      Testar bloqueio:
                      <button type="button" onClick={() => setEmail("sem.compra@exemplo.com")} className="rounded-full bg-white px-2.5 py-1 font-semibold text-ink-soft ring-1 ring-ink/10">
                        e-mail sem compra
                      </button>
                      <button type="button" onClick={() => setEmail("eduarda@exemplo.com")} className="rounded-full bg-white px-2.5 py-1 font-semibold text-ink-soft ring-1 ring-ink/10">
                        compra reembolsada
                      </button>
                    </p>
                  </>
                ) : (
                  <button type="button" onClick={() => setEmail("renan@r7investimentos.com.br")} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-ink/10 hover:ring-ink/30">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ouro font-display font-bold text-ink">R</span>
                    <span>
                      <span className="block text-sm font-semibold">Renan</span>
                      <span className="text-[12.5px] text-ink-mute">renan@r7investimentos.com.br</span>
                    </span>
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={confirmar} className="mt-7">
                <button type="button" onClick={() => (setEtapa("email"), setCodigo(""), setErro(null))} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
                  <ArrowLeft size={16} /> Trocar e-mail
                </button>
                <h1 className="text-[2rem] font-bold leading-tight">Digite o código</h1>
                <p className="mt-2 text-ink-mute">
                  Enviamos um código de 6 dígitos para <strong className="text-ink">{email}</strong>.
                </p>
                <label htmlFor="codigo" className="rotulo mt-7">
                  Código de acesso
                </label>
                <input
                  ref={codigoRef}
                  id="codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => (setCodigo(e.target.value.replace(/\D/g, "")), setErro(null))}
                  className="campo text-center font-display text-3xl font-bold tracking-[0.5em]"
                  placeholder="······"
                />
                <p className="mt-2 text-sm text-ink-mute">
                  Na demonstração, use <strong className="text-ink">{CODIGO_DEMO}</strong>.
                </p>
                {aluno && aluno.sessoesAtivas >= 2 && (
                  <p className="mt-3 flex gap-2 rounded-xl bg-ouro-soft px-4 py-3 text-sm text-ouro-deep">
                    <Smartphone size={18} className="shrink-0" /> Esta conta já está conectada em 2 dispositivos. Ao entrar, o acesso mais antigo será encerrado.
                  </p>
                )}
                {erro && (
                  <p role="alert" className="mt-3 rounded-xl bg-alerta-soft px-4 py-3 text-sm text-alerta">
                    {erro}
                  </p>
                )}
                <button type="submit" disabled={codigo.length !== 6} className="btn-primario mt-5 w-full">
                  Entrar
                </button>
                <button type="button" disabled={espera > 0} onClick={() => (setEspera(45), setErro(null))} className="mt-4 w-full text-center text-sm font-semibold text-ink-soft disabled:text-ink-mute/70">
                  {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-ink-mute">
          <ShieldCheck size={15} /> Código válido por 10 minutos. Você permanece conectado em até 2 dispositivos.
        </p>
      </section>

      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between" style={{ background: "radial-gradient(120% 80% at 80% 0%, #2C5A62 0%, #0E3B43 50%, #0A2C32 100%)" }}>
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="pontos" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pontos)" />
        </svg>
        <div className="relative ml-auto w-full max-w-[460px] rotate-[-2deg] rounded-[24px] bg-white p-6 text-ink shadow-2xl">
          <p className="text-sm text-ink-mute">Plano de Ana</p>
          <p className="font-display text-2xl font-bold">Renda Mensal Equilibrada</p>
          <p className="text-sm text-ink-mute">Perfil moderado, R$ 18.000 para investir</p>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
            {[["#0E3B43", 20], ["#2F6FB1", 25], ["#2F8F6B", 40], ["#C9731E", 15]].map(([c, w]) => (
              <div key={c as string} style={{ width: `${w}%`, background: c as string }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {[
              ["Renda com Garantia R7", "R$ 3.600,00", ""],
              ["FII Recebíveis", "R$ 3.600,00", "Abaixo do teto"],
              ["FII Galpões Logísticos", "R$ 3.600,00", ""],
              ["Elétrica Nacional", "R$ 2.700,00", "Abaixo do teto"],
            ].map(([n, v, s]) => (
              <li key={n} className="flex items-center justify-between gap-3 border-b border-ink/[0.06] pb-2.5">
                <span>
                  {n}
                  {s && <span className="ml-2 rounded-md bg-folha-soft px-1.5 py-0.5 text-[11px] font-semibold text-folha">{s}</span>}
                </span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative max-w-lg">
          <p className="font-display text-[2.4rem] font-bold leading-[1.1]">Seu plano de investimentos, calculado para o seu momento.</p>
          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
            {[
              ["12", "perguntas para o seu plano"],
              ["24h", "Mentor com IA"],
              ["Vitalício", "acesso sem mensalidade"],
            ].map(([n, t]) => (
              <div key={t}>
                <p className="font-display text-2xl font-bold">{n}</p>
                <p className="text-sm text-white/60">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
