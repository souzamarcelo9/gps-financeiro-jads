"use client";

import { useState } from "react";
import { Modal } from "./ui";
import { VideoPlayer } from "./VideoPlayer";
import { useDemo } from "@/lib/store";

export function BoasVindasModal() {
  const { alunoAtual, boasVindasVideo, concluirBoasVindas } = useDemo();
  const [assistiu, setAssistiu] = useState(false);
  const aberto = !!alunoAtual && !alunoAtual.viuBoasVindas && boasVindasVideo.obrigatorio;

  return (
    <Modal aberto={aberto} onFechar={() => {}} semFechar largura="max-w-2xl">
      <p className="text-sm font-semibold text-folha">Primeiro acesso</p>
      <h2 className="mt-1 text-2xl font-bold sm:text-[1.7rem]">Boas-vindas ao GPS Financeiro, {alunoAtual?.nome.split(" ")[0]}!</h2>
      <p className="mt-2 text-ink-soft">
        Assista a este vídeo curto para conhecer a plataforma: onde está o seu plano, as videoaulas e o Mentor 24h. Você pode acelerar a velocidade, mas não adiantar.
      </p>
      <div className="mt-5">
        <VideoPlayer titulo="Como usar o GPS Financeiro" subtitulo="com Renan, 3 minutos" duracaoSeg={boasVindasVideo.duracaoSeg} bloquearAvanco onFim={() => setAssistiu(true)} />
      </div>
      <button type="button" disabled={!assistiu} onClick={concluirBoasVindas} className="btn-primario mt-5 w-full">
        {assistiu ? "Começar a usar o GPS Financeiro" : "Assista ao vídeo para continuar"}
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-mute">
        <span>Este vídeo fica disponível depois em Videoaulas.</span>
        <button type="button" onClick={concluirBoasVindas} className="underline underline-offset-2">
          Pular (somente na demonstração)
        </button>
      </div>
    </Modal>
  );
}
