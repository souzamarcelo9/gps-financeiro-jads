/**
 * Questionário e regras da metodologia — programação tradicional, sem IA.
 * Reaproveitável na versão final (os limites vêm do painel "Metodologia").
 */
import type { Ativo, Carteira, DadosFinanceiros, Metodologia, Objetivo, Perfil, Respostas, ResultadoPerfil } from "./types";

export interface Opcao {
  valor: string;
  texto: string;
  pontos?: number;
  objetivo?: Objetivo;
}

export interface Pergunta {
  id: string;
  bloco: "perfil" | "objetivo" | "financeiro";
  tipo: "opcoes" | "valor";
  titulo: string;
  ajuda?: string;
  opcoes?: Opcao[];
  placeholder?: string;
}

export const PERGUNTAS: Pergunta[] = [
  {
    id: "queda",
    bloco: "perfil",
    tipo: "opcoes",
    titulo: "Se seus investimentos caíssem 15% em um mês, o que você faria?",
    opcoes: [
      { valor: "vende", texto: "Venderia tudo para não perder mais", pontos: 1 },
      { valor: "espera", texto: "Ficaria preocupado, mas esperaria recuperar", pontos: 2 },
      { valor: "compra", texto: "Aproveitaria para comprar mais barato", pontos: 3 },
    ],
  },
  {
    id: "experiencia",
    bloco: "perfil",
    tipo: "opcoes",
    titulo: "Qual é a sua experiência com investimentos?",
    opcoes: [
      { valor: "nenhuma", texto: "Estou começando agora", pontos: 1 },
      { valor: "renda_fixa", texto: "Já investi na poupança, Tesouro ou CDB", pontos: 2 },
      { valor: "variavel", texto: "Já investi em ações ou fundos imobiliários", pontos: 3 },
    ],
  },
  {
    id: "prazo",
    bloco: "perfil",
    tipo: "opcoes",
    titulo: "Por quanto tempo você pretende deixar esse dinheiro investido?",
    opcoes: [
      { valor: "ate2", texto: "Até 2 anos", pontos: 1 },
      { valor: "2a5", texto: "De 2 a 5 anos", pontos: 2 },
      { valor: "mais5", texto: "Mais de 5 anos", pontos: 3 },
    ],
  },
  {
    id: "risco",
    bloco: "perfil",
    tipo: "opcoes",
    titulo: "Qual frase combina mais com você?",
    opcoes: [
      { valor: "seguranca", texto: "Prefiro segurança, mesmo ganhando menos", pontos: 1 },
      { valor: "equilibrio", texto: "Quero equilíbrio entre segurança e retorno", pontos: 2 },
      { valor: "retorno", texto: "Aceito oscilações em busca de mais retorno", pontos: 3 },
    ],
  },
  {
    id: "estabilidade",
    bloco: "perfil",
    tipo: "opcoes",
    titulo: "Como é a sua renda hoje?",
    opcoes: [
      { valor: "instavel", texto: "Varia bastante de um mês para o outro", pontos: 1 },
      { valor: "estavel", texto: "É estável, mas sobra pouco", pontos: 2 },
      { valor: "sobra", texto: "É estável e sobra dinheiro todo mês", pontos: 3 },
    ],
  },
  {
    id: "objetivo_principal",
    bloco: "objetivo",
    tipo: "opcoes",
    titulo: "O que você mais quer que o seu dinheiro faça?",
    opcoes: [
      { valor: "crescer", texto: "Cresça o máximo possível ao longo dos anos", objetivo: "multiplicacao" },
      { valor: "pagar", texto: "Me pague uma renda todo mês", objetivo: "renda" },
      { valor: "ambos", texto: "Um pouco dos dois", objetivo: "renda_crescimento" },
    ],
  },
  {
    id: "futuro",
    bloco: "objetivo",
    tipo: "opcoes",
    titulo: "Daqui a 10 anos, como você se imagina?",
    opcoes: [
      { valor: "patrimonio", texto: "Com um patrimônio grande para usar depois", objetivo: "multiplicacao" },
      { valor: "viver_renda", texto: "Vivendo dos rendimentos dos investimentos", objetivo: "renda" },
      { valor: "renda_extra", texto: "Com renda extra e patrimônio ainda crescendo", objetivo: "renda_crescimento" },
    ],
  },
  { id: "renda_mensal", bloco: "financeiro", tipo: "valor", titulo: "Qual é a sua renda mensal?", ajuda: "Some salário, pró-labore e outras rendas fixas.", placeholder: "6.000" },
  {
    id: "gastos_mensais",
    bloco: "financeiro",
    tipo: "valor",
    titulo: "Quanto você gasta por mês com seu custo de vida?",
    ajuda: "Aluguel, contas, mercado, transporte e outras despesas fixas. Usamos esse valor para calcular sua reserva de emergência.",
    placeholder: "3.500",
  },
  {
    id: "reserva_atual",
    bloco: "financeiro",
    tipo: "valor",
    titulo: "Quanto você já tem guardado como reserva de emergência?",
    ajuda: "Dinheiro que você consegue resgatar a qualquer momento. Se ainda não tem, informe 0.",
    placeholder: "0",
  },
  { id: "capital", bloco: "financeiro", tipo: "valor", titulo: "Quanto você tem disponível para investir agora?", ajuda: "Sem contar a reserva de emergência.", placeholder: "10.000" },
  { id: "aporte", bloco: "financeiro", tipo: "valor", titulo: "Quanto você pretende investir todo mês?", placeholder: "500" },
];

export const BLOCO_LABEL = { perfil: "Como você lida com risco", objetivo: "Seu objetivo", financeiro: "Sua vida financeira" };

const PRAZO_LABEL: Record<string, string> = { ate2: "Até 2 anos", "2a5": "De 2 a 5 anos", mais5: "Mais de 5 anos" };

export function perfilPorPontuacao(pontos: number, m: Metodologia): Perfil {
  if (pontos <= m.limiteConservador) return "conservador";
  if (pontos <= m.limiteModerado) return "moderado";
  return "arrojado";
}

export function codigoCarteira(perfil: Perfil, objetivo: Objetivo): string {
  return `${{ conservador: "C", moderado: "M", arrojado: "A" }[perfil]}${{ multiplicacao: 1, renda: 2, renda_crescimento: 3 }[objetivo]}`;
}

export function calcularResultado(r: Respostas, m: Metodologia): ResultadoPerfil {
  let pontuacao = 0;
  const votos: Objetivo[] = [];
  for (const p of PERGUNTAS) {
    const op = p.opcoes?.find((o) => o.valor === r[p.id]);
    if (op?.pontos) pontuacao += op.pontos;
    if (op?.objetivo) votos.push(op.objetivo);
  }
  const objetivo: Objetivo = votos.length === 2 && votos[0] === votos[1] ? votos[0] : "renda_crescimento";
  const perfil = perfilPorPontuacao(pontuacao, m);
  const agora = new Date().toISOString();
  return {
    perfil,
    objetivo,
    codigo: codigoCarteira(perfil, objetivo),
    pontuacao,
    prazo: PRAZO_LABEL[String(r.prazo)] ?? "—",
    rendaMensal: Number(r.renda_mensal) || 0,
    gastosMensais: Number(r.gastos_mensais) || 0,
    reservaAtual: Number(r.reserva_atual) || 0,
    capital: Number(r.capital) || 0,
    aporteMensal: Number(r.aporte) || 0,
    geradoEm: agora,
    atualizadoEm: agora,
  };
}

/** Atualiza só o que o aluno mudou, preservando perfil e demais respostas. */
export function atualizarResultado(atual: ResultadoPerfil, patch: Partial<DadosFinanceiros> & { objetivo?: Objetivo; perfil?: Perfil }): ResultadoPerfil {
  const objetivo = patch.objetivo ?? atual.objetivo;
  const perfil = patch.perfil ?? atual.perfil;
  return { ...atual, ...patch, perfil, objetivo, codigo: codigoCarteira(perfil, objetivo), atualizadoEm: new Date().toISOString() };
}

export function reserva(r: DadosFinanceiros, m: Metodologia) {
  const ideal = r.gastosMensais * m.mesesReserva;
  const falta = Math.max(0, ideal - r.reservaAtual);
  const pct = ideal > 0 ? Math.min(100, Math.round((r.reservaAtual / ideal) * 100)) : 100;
  const mesesCobertos = r.gastosMensais > 0 ? r.reservaAtual / r.gastosMensais : 0;
  const mesesParaCompletar = falta > 0 && r.aporteMensal > 0 ? Math.ceil(falta / r.aporteMensal) : 0;
  return { ideal, falta, pct, completa: falta === 0, mesesCobertos, mesesParaCompletar };
}

export type StatusFaixa = "abaixo" | "faixa" | "acima" | "sem";

/** Compara a cotação com a faixa de compra cadastrada no painel. */
export function statusPreco(a: Ativo): StatusFaixa {
  if (a.teto === undefined || a.cotacao === undefined) return "sem";
  const min = a.compraMin ?? -Infinity;
  if (a.cotacao < min) return "abaixo";
  if (a.cotacao <= a.teto) return "faixa";
  return "acima";
}

export const STATUS_FAIXA_LABEL: Record<StatusFaixa, string> = {
  abaixo: "Abaixo da faixa",
  faixa: "Na faixa de compra",
  acima: "Acima da faixa",
  sem: "Sem faixa",
};

const pct = (v: number, c = 2) => v.toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c });

/** Formata preço ou taxa conforme o tipo do ativo. */
export function fmtCotacao(a: Pick<Ativo, "formato">, v: number) {
  switch (a.formato ?? "reais") {
    case "ipca":
      return `IPCA + ${pct(v)}% a.a.`;
    case "cdi":
      return `${pct(v, 0)}% do CDI`;
    case "pre":
      return `${pct(v)}% a.a.`;
    case "am":
      return `${pct(v)}% a.m.`;
    case "selic":
      return `Selic + ${pct(v)}%`;
    default:
      return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
}

/** "R$ 9,40 a R$ 10,30" ou "IPCA + 6,10% a 6,80%". */
export function fmtFaixa(a: Pick<Ativo, "formato">, min: number | undefined, max: number | undefined) {
  const f = a.formato ?? "reais";
  if (max === undefined && min === undefined) return "";
  if (min === undefined) return `até ${fmtCotacao(a, max!)}`;
  if (max === undefined) return `acima de ${fmtCotacao(a, min)}`;
  if (f === "reais") return `${fmtCotacao(a, min)} a ${fmtCotacao(a, max)}`;
  const curto = (v: number) => (f === "cdi" ? `${pct(v, 0)}%` : `${pct(v)}%`);
  const prefixo = f === "ipca" ? "IPCA + " : f === "selic" ? "Selic + " : "";
  const sufixo = f === "cdi" ? " do CDI" : f === "pre" ? " a.a." : f === "am" ? " a.m." : "";
  return `${prefixo}${curto(min)} a ${curto(max)}${sufixo}`;
}

export function distribuir(c: Carteira, capital: number, aporte: number) {
  const visiveis = c.ativos.filter((a) => a.visivel);
  return visiveis.map((a) => ({
    ...a,
    agora: (capital * a.pct) / 100,
    mensal: (aporte * a.pct) / 100,
    cotas: (a.formato ?? "reais") === "reais" && a.cotacao && a.cotacao > 0 ? Math.floor((capital * a.pct) / 100 / a.cotacao) : undefined,
  }));
}

export function somaPct(c: Carteira) {
  return Math.round(c.ativos.reduce((s, a) => s + (Number(a.pct) || 0), 0) * 100) / 100;
}
