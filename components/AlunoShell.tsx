"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BookOpen, Compass, Gem, Home, Landmark, Lock, LogOut, MessageCircle, UserRound, Wallet } from "lucide-react";
import { useDemo } from "@/lib/store";
import { Logo } from "./Logo";
import { Disclaimer } from "./Disclaimer";
import { DemoBanner } from "./DemoBanner";
import { MentorFlutuante } from "./MentorFlutuante";
import { CheckoutModal } from "./CheckoutModal";
import { BoasVindasModal } from "./BoasVindasModal";
import { Avatar } from "./ui";

type Item = { href?: string; rotulo: string; curto: string; icone: typeof Home; trava?: boolean; acao?: () => void; mobile?: boolean };

export function AlunoShell({ children }: { children: ReactNode }) {
  const { pronto, sessao, alunoAtual, sair, temAcompanhamento, ofertas, abrirMentor } = useDemo();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (pronto && (sessao?.papel !== "aluno" || !alunoAtual || alunoAtual.status !== "ativo")) router.replace("/");
  }, [pronto, sessao, alunoAtual, router]);

  if (!pronto || !alunoAtual) return <div className="grid min-h-screen place-items-center text-ink-mute">Carregando…</div>;

  const NAV: Item[] = [
    { href: "/app", rotulo: "Início", curto: "Início", icone: Home, mobile: true },
    { href: "/app/questionario", rotulo: "Questionário", curto: "Perfil", icone: Compass },
    { href: "/app/plano", rotulo: "Minha carteira", curto: "Carteira", icone: Wallet, mobile: true },
    { rotulo: "Mentor 24h", curto: "Mentor", icone: MessageCircle, acao: () => abrirMentor() },
    { href: "/app/aulas", rotulo: "Videoaulas", curto: "Aulas", icone: BookOpen, mobile: true },
    { href: "/app/acompanhamento", rotulo: "Acompanhamento Individual", curto: "Mentoria", icone: Gem, trava: !temAcompanhamento, mobile: true },
    ...(ofertas.garantia.ativo ? [{ href: "/app/investimento-garantia", rotulo: "Investimento com Garantia", curto: "Garantia", icone: Landmark }] : []),
    { href: "/app/perfil", rotulo: "Meus dados", curto: "Perfil", icone: UserRound, mobile: true },
  ];
  const ativo = (href?: string) => !!href && (href === "/app" ? path === "/app" : path.startsWith(href));
  const sairAgora = () => {
    sair();
    router.replace("/");
  };
  const classeItem = (on: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[15.5px] font-semibold transition-colors ${on ? "bg-white/[0.11] text-white ring-1 ring-white/10" : "text-white/70 hover:bg-white/[0.06] hover:text-white"}`;

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden print:!hidden h-screen w-[264px] shrink-0 flex-col overflow-y-auto bg-noite px-4 py-7 md:flex">
        <Link href="/app" aria-label="Início" className="px-1.5">
          <Logo claro />
        </Link>
        <nav className="mt-9 flex flex-col gap-0.5" aria-label="Navegação principal">
          {NAV.map(({ href, rotulo, icone: Icone, trava, acao }) => {
            const conteudo = (
              <>
                <Icone size={19} strokeWidth={2} />
                <span className="flex-1 leading-tight">{rotulo}</span>
                {trava && <Lock size={14} className="text-ouro" aria-label="Não adquirido" />}
              </>
            );
            return href ? (
              <Link key={rotulo} href={href} className={classeItem(ativo(href))}>
                {conteudo}
              </Link>
            ) : (
              <button key={rotulo} type="button" onClick={acao} className={classeItem(false)}>
                {conteudo}
              </button>
            );
          })}
        </nav>

        {!temAcompanhamento && ofertas.acompanhamento.ativo && (
          <div className="mt-7 shrink-0 rounded-2xl bg-gradient-to-br from-noite-claro to-noite-soft p-4 text-white ring-1 ring-ouro/30">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ouro">
              <Gem size={13} /> Programa principal
            </p>
            <p className="mt-1.5 font-display text-[1.05rem] font-bold leading-snug">{ofertas.acompanhamento.titulo}</p>
            <p className="mt-1 text-[13px] leading-snug text-white/65">O Renan e a equipe ao seu lado para colocar a carteira em prática.</p>
            <Link href="/app/acompanhamento" className="mt-3 block rounded-xl bg-ouro px-3 py-2 text-center text-sm font-semibold text-ink hover:bg-[#e6b232]">
              Conhecer o programa
            </Link>
          </div>
        )}

        <div className="mt-auto flex shrink-0 items-center gap-3 border-t border-white/10 px-1.5 pt-5">
          <Avatar nome={alunoAtual.nome} tamanho={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">{alunoAtual.nome}</p>
            <p className="truncate text-[13px] text-white/55">{alunoAtual.email}</p>
          </div>
          <button type="button" onClick={sairAgora} aria-label="Sair" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <DemoBanner />
        <header className="flex items-center justify-between bg-noite px-5 py-3.5 md:hidden print:hidden">
          <Logo claro />
          <button type="button" onClick={sairAgora} aria-label="Sair" className="rounded-lg p-2 text-white/80">
            <LogOut size={20} />
          </button>
        </header>
        <div className="mx-auto max-w-[1180px]">
          <main className="px-4 pb-6 pt-5 sm:px-5 md:px-8 md:pt-9 print:p-0">{children}</main>
          <div className="print:hidden">
            <Disclaimer />
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 print:hidden grid grid-cols-5 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Navegação">
        {NAV.filter((n) => n.mobile).map(({ href, curto, icone: Icone }) => (
          <Link key={curto} href={href!} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${ativo(href) ? "text-noite" : "text-ink-mute"}`}>
            <Icone size={21} strokeWidth={ativo(href) ? 2.5 : 2} />
            {curto}
          </Link>
        ))}
      </nav>

      <MentorFlutuante />
      <CheckoutModal />
      <BoasVindasModal />
    </div>
  );
}
