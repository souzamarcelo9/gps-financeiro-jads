"use client";

import { useDemo } from "@/lib/store";

export function DemoBanner({ escuro = false }: { escuro?: boolean }) {
  const { resetarDemo } = useDemo();
  return (
    <div className={`print:hidden px-4 py-1.5 text-center text-[12.5px] ${escuro ? "bg-ink-soft text-white/80" : "bg-ouro-soft text-ouro-deep"}`}>
      Protótipo para apresentação: dados fictícios, salvos só neste navegador.{" "}
      <button type="button" onClick={() => confirm("Restaurar todos os dados de exemplo?") && resetarDemo()} className="font-semibold underline underline-offset-2">
        Restaurar dados
      </button>
    </div>
  );
}
