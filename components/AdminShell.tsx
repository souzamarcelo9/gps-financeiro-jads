"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bot, CreditCard, Layers, LayoutGrid, LogOut, Megaphone, Menu, PieChart, PlaySquare, Settings, SlidersHorizontal, Users, Workflow, X } from "lucide-react";
import { useDemo } from "@/lib/store";
import { Logo } from "./Logo";
import { DemoBanner } from "./DemoBanner";

type Item = { href: string; rotulo: string; icone: typeof Users; selo?: string; contador?: number };

export function AdminShell({ children }: { children: ReactNode }) {
  const { pronto, sessao, sair, alunos } = useDemo();
  const router = useRouter();
  const path = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (pronto && sessao?.papel !== "admin") router.replace("/");
  }, [pronto, sessao, router]);
  useEffect(() => setAberto(false), [path]);

  if (!pronto || sessao?.papel !== "admin") return <div className="grid min-h-screen place-items-center text-ink-mute">Carregando…</div>;

  const pendentes = alunos.filter((a) => a.status === "pendente").length;
  const GRUPOS: { titulo?: string; itens: Item[] }[] = [
    { itens: [{ href: "/admin", rotulo: "Visão geral", icone: LayoutGrid }, { href: "/admin/alunos", rotulo: "Alunos", icone: Users, contador: pendentes || undefined }] },
    {
      titulo: "Conteúdo",
      itens: [
        { href: "/admin/carteiras", rotulo: "Carteiras", icone: PieChart },
        { href: "/admin/estrategias", rotulo: "Estratégias prontas", icone: Layers },
        { href: "/admin/metodologia", rotulo: "Metodologia", icone: SlidersHorizontal },
        { href: "/admin/mentor", rotulo: "Mentor IA", icone: Bot },
        { href: "/admin/aulas", rotulo: "Videoaulas", icone: PlaySquare },
      ],
    },
    {
      titulo: "Vendas",
      itens: [
        { href: "/admin/ofertas", rotulo: "Ofertas", icone: Megaphone },
        { href: "/admin/pagamentos", rotulo: "Pagamentos", icone: CreditCard },
        { href: "/admin/automacoes", rotulo: "Automações", icone: Workflow, selo: "Fase 2" },
        { href: "/admin/configuracoes", rotulo: "Configurações", icone: Settings },
      ],
    },
  ];
  const ativo = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const menu = (
    <>
      <nav className="mt-7 flex flex-col gap-5" aria-label="Administração">
        {GRUPOS.map((g, gi) => (
          <div key={gi}>
            {g.titulo && <p className="mb-1.5 px-3.5 text-[13px] font-semibold text-white/45">{g.titulo}</p>}
            <div className="flex flex-col gap-0.5">
              {g.itens.map(({ href, rotulo, icone: Icone, selo, contador }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors ${ativo(href) ? "bg-white/[0.12] text-white ring-1 ring-white/15" : "text-white/70 hover:bg-white/[0.06] hover:text-white"}`}
                >
                  <Icone size={18} />
                  <span className="flex-1">{rotulo}</span>
                  {selo && <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] text-white/80">{selo}</span>}
                  {contador && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ouro px-1 text-[11px] font-bold text-ink">{contador}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ouro font-display font-bold text-ink">R</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-white">Renan</p>
          <p className="text-white/55">Administrador</p>
        </div>
        <button type="button" aria-label="Sair" onClick={() => (sair(), router.replace("/"))} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
          <LogOut size={17} />
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto bg-ink px-4 py-6 lg:flex">
          <Logo claro />
          {menu}
        </aside>
        {aberto && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-ink/40" onClick={() => setAberto(false)} />
            <aside className="relative flex h-full w-72 flex-col overflow-y-auto bg-ink px-4 py-6">
              <div className="flex items-center justify-between">
                <Logo claro />
                <button type="button" aria-label="Fechar menu" onClick={() => setAberto(false)} className="text-white">
                  <X />
                </button>
              </div>
              {menu}
            </aside>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <DemoBanner />
          <header className="flex items-center gap-3 border-b border-ink/10 bg-white px-5 py-3 lg:hidden">
            <button type="button" aria-label="Abrir menu" onClick={() => setAberto(true)} className="text-ink">
              <Menu />
            </button>
            <Logo />
          </header>
          <main className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 md:px-8 md:py-9">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function TituloPagina({ titulo, descricao, acao, sobre }: { titulo: string; descricao?: string; acao?: ReactNode; sobre?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {sobre && <div className="mb-1 text-sm font-semibold text-folha">{sobre}</div>}
        <h1 className="text-[2rem] font-bold leading-tight">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-2xl text-ink-mute">{descricao}</p>}
      </div>
      {acao && <div className="flex flex-wrap gap-2">{acao}</div>}
    </div>
  );
}

