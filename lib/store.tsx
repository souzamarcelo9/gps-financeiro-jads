"use client";

/**
 * Estado global da DEMONSTRAÇÃO (memória + localStorage do navegador).
 * Na versão final, cada ação vira uma chamada ao Supabase ou a uma rota de API.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CARTEIRAS } from "./carteiras";
import { ALUNOS, AULAS, CONHECIMENTO, ESTRATEGIAS, METODOLOGIA, MENTOR, OFERTAS, PRODUTO_ACOMP, PRODUTO_GPS, TRANSACOES, WEBHOOKS } from "./data";
import { atualizarResultado, calcularResultado } from "./quiz";
import type {
  Aluno, Aula, Carteira, ConfigMentor, DadosFinanceiros, Estrategias, EventoWebhook, ItemConhecimento, MensagemChat, Metodologia, Objetivo, Ofertas, Perfil, Plataforma, Produto, Respostas, StatusAcesso, Transacao,
} from "./types";

type Sessao = { papel: "aluno" | "admin"; email: string } | null;

interface Estado {
  sessao: Sessao;
  alunos: Aluno[];
  carteiras: Carteira[];
  aulas: Aula[];
  conhecimento: ItemConhecimento[];
  metodologia: Metodologia;
  mentor: ConfigMentor;
  ofertas: Ofertas;
  estrategias: Estrategias;
  transacoes: Transacao[];
  webhooks: EventoWebhook[];
  chats: Record<string, MensagemChat[]>;
  usoHoje: Record<string, number>;
  respostas: Record<string, Respostas>;
  boasVindasVideo: { url: string; obrigatorio: boolean; duracaoSeg: number };
  cotacoesEm: string;
}

const INICIAL: Estado = {
  sessao: null,
  alunos: ALUNOS,
  carteiras: CARTEIRAS,
  aulas: AULAS,
  conhecimento: CONHECIMENTO,
  metodologia: METODOLOGIA,
  mentor: MENTOR,
  ofertas: OFERTAS,
  estrategias: ESTRATEGIAS,
  transacoes: TRANSACOES,
  webhooks: WEBHOOKS,
  chats: {
    "ana@exemplo.com": [
      { id: "h1", autor: "aluno", texto: "O que é liquidez diária?", hora: "18/11 20:14" },
      {
        id: "h2",
        autor: "assistente",
        texto: "Liquidez diária significa que você pode resgatar o dinheiro em qualquer dia útil, sem esperar o vencimento. É a característica mais importante para a reserva de emergência.",
        aula: { id: "a2", titulo: "Reserva de emergência: quanto e onde guardar", modulo: "Primeiros passos" },
        hora: "18/11 20:14",
      },
    ],
  },
  usoHoje: { "ana@exemplo.com": 3 },
  respostas: {},
  boasVindasVideo: { url: "https://player.exemplo.com/boas-vindas", obrigatorio: true, duracaoSeg: 180 },
  cotacoesEm: new Date().toISOString(),
};

const CHAVE = "gps-financeiro-demo-v4";
export type VerificacaoEmail = "ok" | "sem_compra" | "bloqueado" | "pendente";

interface Ctx extends Estado {
  pronto: boolean;
  alunoAtual?: Aluno;
  temAcompanhamento: boolean;
  checkoutAberto: boolean;
  abrirCheckout: () => void;
  fecharCheckout: () => void;
  mentorAberto: boolean;
  abrirMentor: (pergunta?: string) => void;
  fecharMentor: () => void;
  perguntaPendente?: string;
  limparPergunta: () => void;
  verificarEmail: (email: string) => VerificacaoEmail;
  entrar: (email: string) => void;
  entrarAdmin: () => void;
  sair: () => void;
  concluirBoasVindas: () => void;
  salvarQuestionario: (r: Respostas) => void;
  atualizarDados: (patch: Partial<DadosFinanceiros> & { objetivo?: Objetivo; perfil?: Perfil }) => void;
  decidirReserva: (d: "providenciar" | "sem_reserva" | undefined) => void;
  atualizarCadastro: (patch: Partial<Pick<Aluno, "nome" | "telefone">>) => void;
  concluirAula: (id: string) => void;
  comprarAcompanhamento: () => void;
  adicionarMensagens: (email: string, msgs: MensagemChat[]) => void;
  registrarUsoIA: (email: string) => void;
  atualizarCotacoes: () => void;
  // admin
  editarAluno: (id: string, patch: Partial<Aluno>) => void;
  definirStatus: (id: string, status: StatusAcesso) => void;
  alternarProduto: (id: string, produto: Produto) => void;
  adicionarAluno: (nome: string, email: string, telefone: string) => void;
  simularVenda: () => void;
  salvarCarteira: (c: Carteira) => void;
  salvarEstrategias: (e: Estrategias) => void;
  salvarMetodologia: (m: Metodologia) => void;
  salvarMentor: (m: ConfigMentor, k: ItemConhecimento[]) => void;
  salvarAulas: (a: Aula[], video: Estado["boasVindasVideo"]) => void;
  salvarOfertas: (o: Ofertas) => void;
  resetarDemo: () => void;
}

const Contexto = createContext<Ctx | null>(null);
const agoraISO = () => new Date().toISOString();

export function DemoProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Estado>(INICIAL);
  const [pronto, setPronto] = useState(false);
  const [checkoutAberto, setCheckout] = useState(false);
  const [mentorAberto, setMentor] = useState(false);
  const [perguntaPendente, setPergunta] = useState<string | undefined>();

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setS({ ...INICIAL, ...JSON.parse(salvo) });
    } catch {
      /* sem armazenamento: segue com os dados iniciais */
    }
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(s));
    } catch {
      /* ignora */
    }
  }, [s, pronto]);

  const valor = useMemo<Ctx>(() => {
    const email = s.sessao?.email;
    const alunoAtual = s.sessao?.papel === "aluno" ? s.alunos.find((a) => a.email === email) : undefined;
    const mudarAluno = (filtro: (a: Aluno) => boolean, fn: (a: Aluno) => Aluno) =>
      setS((e) => ({ ...e, alunos: e.alunos.map((a) => (filtro(a) ? fn(a) : a)) }));
    const meu = (fn: (a: Aluno) => Aluno) => mudarAluno((a) => a.email === email, fn);

    function registrarVenda(e: Estado, nome: string, mail: string, produto: string, valor: number, gateway: Plataforma): Estado {
      const data = agoraISO();
      const id = `TX${Math.floor(100000 + Math.random() * 899999)}`;
      return {
        ...e,
        transacoes: [{ id, cliente: nome, email: mail, produto, gateway, valor, metodo: produto === PRODUTO_ACOMP ? "Cartão" : "Pix", status: "aprovado", data }, ...e.transacoes],
        webhooks: [
          {
            id: `w${Date.now()}`,
            plataforma: gateway,
            evento: gateway === "Hotmart" ? "PURCHASE_APPROVED" : "compra_aprovada",
            email: mail,
            produto,
            recebidoEm: data,
            acao: produto === PRODUTO_ACOMP ? "Acompanhamento liberado" : "Aluno criado e acesso liberado",
            ok: true,
          },
          ...e.webhooks,
        ],
      };
    }

    return {
      ...s,
      pronto,
      alunoAtual,
      temAcompanhamento: !!alunoAtual?.produtos.includes("acompanhamento"),
      checkoutAberto,
      abrirCheckout: () => setCheckout(true),
      fecharCheckout: () => setCheckout(false),
      mentorAberto,
      abrirMentor: (p) => {
        setPergunta(p);
        setMentor(true);
      },
      fecharMentor: () => setMentor(false),
      perguntaPendente,
      limparPergunta: () => setPergunta(undefined),
      verificarEmail: (mail) => {
        const a = s.alunos.find((x) => x.email.toLowerCase() === mail.trim().toLowerCase());
        if (!a) return "sem_compra";
        if (a.status === "pendente") return "pendente";
        if (a.status !== "ativo") return "bloqueado";
        return "ok";
      },
      entrar: (mail) => {
        const e = mail.trim().toLowerCase();
        setS((x) => ({
          ...x,
          sessao: { papel: "aluno", email: e },
          alunos: x.alunos.map((a) => (a.email === e ? { ...a, ultimoAcesso: agoraISO().slice(0, 10), sessoesAtivas: Math.min(2, a.sessoesAtivas + 1) } : a)),
        }));
      },
      entrarAdmin: () => setS((x) => ({ ...x, sessao: { papel: "admin", email: "renan@r7investimentos.com.br" } })),
      sair: () => {
        setMentor(false);
        setS((x) => ({ ...x, sessao: null }));
      },
      concluirBoasVindas: () => meu((a) => ({ ...a, viuBoasVindas: true, aulasConcluidas: Array.from(new Set([...a.aulasConcluidas, "a0"])) })),
      salvarQuestionario: (resp) => {
        if (!email) return;
        const resultado = calcularResultado(resp, s.metodologia);
        setS((x) => ({ ...x, respostas: { ...x.respostas, [email]: resp }, alunos: x.alunos.map((a) => (a.email === email ? { ...a, resultado } : a)) }));
      },
      atualizarDados: (patch) => meu((a) => (a.resultado ? { ...a, resultado: atualizarResultado(a.resultado, patch) } : a)),
      decidirReserva: (d) => meu((a) => ({ ...a, reservaDecisao: d })),
      atualizarCadastro: (patch) => meu((a) => ({ ...a, ...patch })),
      concluirAula: (id) => meu((a) => ({ ...a, aulasConcluidas: a.aulasConcluidas.includes(id) ? a.aulasConcluidas.filter((x) => x !== id) : [...a.aulasConcluidas, id] })),
      comprarAcompanhamento: () => {
        if (!alunoAtual) return;
        setS((x) => {
          const y = registrarVenda(x, alunoAtual.nome, alunoAtual.email, PRODUTO_ACOMP, x.ofertas.acompanhamento.preco, alunoAtual.plataforma);
          return { ...y, alunos: y.alunos.map((a) => (a.email === alunoAtual.email ? { ...a, produtos: Array.from(new Set([...a.produtos, "acompanhamento" as Produto])) } : a)) };
        });
      },
      adicionarMensagens: (mail, msgs) => setS((x) => ({ ...x, chats: { ...x.chats, [mail]: [...(x.chats[mail] ?? []), ...msgs] } })),
      registrarUsoIA: (mail) => {
        setS((x) => ({ ...x, usoHoje: { ...x.usoHoje, [mail]: (x.usoHoje[mail] ?? 0) + 1 } }));
        mudarAluno((a) => a.email === mail, (a) => ({ ...a, mensagensIA: a.mensagensIA + 1, custoIA: +(a.custoIA + 0.005).toFixed(3) }));
      },
      atualizarCotacoes: () =>
        setS((x) => ({
          ...x,
          cotacoesEm: agoraISO(),
          carteiras: x.carteiras.map((c) => ({
            ...c,
            ativos: c.ativos.map((at) => (at.cotacao ? { ...at, cotacao: +(at.cotacao * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2) } : at)),
          })),
        })),
      editarAluno: (id, patch) => mudarAluno((a) => a.id === id, (a) => ({ ...a, ...patch })),
      definirStatus: (id, status) => mudarAluno((a) => a.id === id, (a) => ({ ...a, status, sessoesAtivas: status === "ativo" ? a.sessoesAtivas : 0 })),
      alternarProduto: (id, produto) =>
        mudarAluno((a) => a.id === id, (a) => ({ ...a, produtos: a.produtos.includes(produto) ? a.produtos.filter((p) => p !== produto) : [...a.produtos, produto] })),
      adicionarAluno: (nome, mail, telefone) =>
        setS((x) => ({
          ...x,
          alunos: [
            { id: `m${Date.now()}`, nome, email: mail.trim().toLowerCase(), telefone, plataforma: "Hotmart", status: "ativo", produtos: ["gps"], compradoEm: agoraISO().slice(0, 10), ultimoAcesso: "—", sessoesAtivas: 0, mensagensIA: 0, custoIA: 0, viuBoasVindas: false, aulasConcluidas: [] },
            ...x.alunos,
          ],
          webhooks: [{ id: `w${Date.now()}`, plataforma: "Hotmart", evento: "LIBERAÇÃO MANUAL", email: mail, produto: PRODUTO_GPS, recebidoEm: agoraISO(), acao: "Acesso liberado pelo administrador", ok: true }, ...x.webhooks],
        })),
      simularVenda: () => {
        const nomes = ["Paula Fontes", "Ronaldo Brito", "Simone Araújo", "Henrique Lacerda", "Luana Prado", "Murilo Campos"];
        const nome = nomes[Math.floor(Math.random() * nomes.length)];
        const mail = `${nome.split(" ")[0].toLowerCase()}.${Date.now() % 10000}@exemplo.com`;
        const gateway: Plataforma = Math.random() < 0.6 ? "Hotmart" : "PayT";
        setS((x) => {
          const y = registrarVenda(x, nome, mail, PRODUTO_GPS, 497, gateway);
          return {
            ...y,
            alunos: [
              { id: `s${Date.now()}`, nome, email: mail, telefone: "(11) 9" + Math.floor(1000 + Math.random() * 8999) + "-" + Math.floor(1000 + Math.random() * 8999), plataforma: gateway, status: "ativo", produtos: ["gps"], compradoEm: agoraISO().slice(0, 10), ultimoAcesso: "—", sessoesAtivas: 0, mensagensIA: 0, custoIA: 0, viuBoasVindas: false, aulasConcluidas: [] },
              ...y.alunos,
            ],
          };
        });
      },
      salvarCarteira: (c) => setS((x) => ({ ...x, carteiras: x.carteiras.map((k) => (k.codigo === c.codigo ? { ...c, atualizadaEm: agoraISO() } : k)) })),
      salvarEstrategias: (e) => setS((x) => ({ ...x, estrategias: e })),
      salvarMetodologia: (m) => setS((x) => ({ ...x, metodologia: m })),
      salvarMentor: (m, k) => setS((x) => ({ ...x, mentor: m, conhecimento: k })),
      salvarAulas: (a, video) => setS((x) => ({ ...x, aulas: a, boasVindasVideo: video })),
      salvarOfertas: (o) => setS((x) => ({ ...x, ofertas: o })),
      resetarDemo: () => setS({ ...INICIAL, sessao: s.sessao }),
    };
  }, [s, pronto, checkoutAberto, mentorAberto, perguntaPendente]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDemo() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useDemo precisa estar dentro de <DemoProvider>");
  return c;
}
