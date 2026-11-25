export type Perfil = "conservador" | "moderado" | "arrojado";
export type Objetivo = "multiplicacao" | "renda" | "renda_crescimento";
export type StatusAcesso = "ativo" | "pendente" | "bloqueado" | "reembolsado" | "chargeback";
export type Plataforma = "Hotmart" | "PayT";
export type Produto = "gps" | "acompanhamento";
export type Risco = "Baixo" | "Médio" | "Alto";
export type FormatoCotacao = "reais" | "ipca" | "cdi" | "pre" | "am" | "selic";
export type ClasseAtivo = "tesouro" | "cdb" | "garantia_r7" | "fii" | "acao" | "etf" | "bdr" | "etf_int";

export interface Respostas {
  [perguntaId: string]: string | number;
}

export interface DadosFinanceiros {
  rendaMensal: number;
  gastosMensais: number;
  reservaAtual: number;
  capital: number;
  aporteMensal: number;
}

export interface ResultadoPerfil extends DadosFinanceiros {
  perfil: Perfil;
  objetivo: Objetivo;
  codigo: string; // referência interna (C1..A3), não exibida ao aluno
  pontuacao: number;
  prazo: string;
  geradoEm: string;
  atualizadoEm: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  plataforma: Plataforma;
  status: StatusAcesso;
  produtos: Produto[];
  compradoEm: string;
  ultimoAcesso: string;
  sessoesAtivas: number;
  mensagensIA: number;
  custoIA: number;
  viuBoasVindas: boolean;
  aulasConcluidas: string[];
  reservaDecisao?: "providenciar" | "sem_reserva"; // resposta ao aviso de reserva (opcional, não trava)
  resultado?: ResultadoPerfil;
}

export interface Ativo {
  id: string;
  classe: ClasseAtivo;
  nome: string;
  codigo: string;
  pct: number;
  risco: Risco;
  formato?: FormatoCotacao; // como exibir cotação e faixas (preço em R$ ou taxa)
  compraMin?: number; // início da faixa de compra
  teto?: number; // fim da faixa de compra (teto)
  precoVenda?: number; // início da faixa de venda
  vendaMax?: number; // fim da faixa de venda
  cotacao?: number; // simulada (preço ou taxa)
  explicacao: string;
  comoComprar: string;
  aulaId?: string;
  logoUrl?: string; // logo real do ativo (upload no painel ou provedor de dados)
  visivel: boolean;
}

export interface Carteira {
  codigo: string;
  perfil: Perfil;
  objetivo: Objetivo;
  nome: string;
  resumo: string;
  estrategia: string;
  observacao: string;
  ativos: Ativo[];
  atualizadaEm: string;
}

export interface Aula {
  id: string;
  modulo: string;
  titulo: string;
  duracao: string;
  videoUrl: string;
  descricao: string;
  links?: { rotulo: string; href: string }[];
  palavrasChave: string[];
}

export interface ItemConhecimento {
  id: string;
  titulo: string;
  conteudo: string;
  atualizadoEm: string;
}

export interface MensagemChat {
  id: string;
  autor: "aluno" | "assistente";
  texto: string;
  links?: { rotulo: string; href: string }[];
  aula?: { id: string; titulo: string; modulo: string };
  acao?: "checkout";
  video?: boolean;
  foraDeEscopo?: boolean;
  semIA?: boolean;
  hora: string;
}

export interface Transacao {
  id: string;
  cliente: string;
  email: string;
  produto: string;
  gateway: Plataforma;
  valor: number;
  metodo: "Pix" | "Cartão" | "Boleto";
  status: "aprovado" | "pendente" | "reembolsado" | "chargeback";
  data: string;
}

export interface EventoWebhook {
  id: string;
  plataforma: Plataforma;
  evento: string;
  email: string;
  produto: string;
  recebidoEm: string;
  acao: string;
  ok: boolean;
}

export interface Metodologia {
  mesesReserva: number;
  limiteConservador: number;
  limiteModerado: number;
  avisoPrecos: string;
  avisoCotacao: string;
  textoReserva: string;
}

export interface LimitesIA {
  mensagensPorDia: number;
  mensagensPorMes: number;
  maxTokensResposta: number;
  historicoEnviado: number;
}

export interface ConfigMentor {
  modelo: string;
  prompt: string;
  recusa: string;
  sugestoes: string[];
  limites: LimitesIA;
}

export interface OfertaAcompanhamento {
  ativo: boolean;
  titulo: string;
  chamada: string;
  preco: number;
  checkoutUrl: string;
  videoUrl: string;
  beneficios: { titulo: string; texto: string }[];
  faq: { pergunta: string; resposta: string }[];
  locais: { inicio: boolean; plano: boolean; popup: boolean; mentor: boolean };
}

export interface OperacaoGarantia {
  id: string;
  nome: string;
  garantia: "Imóvel" | "Veículo";
  rentabilidade: string;
  prazo: string;
  minimo: number;
  captado: number; // %
}

export interface OfertaGarantia {
  ativo: boolean;
  titulo: string;
  chamada: string;
  descricao: string;
  minimo: number;
  destaque: string;
  videoUrl: string;
  whatsapp: string;
  operacoes: OperacaoGarantia[];
}

export interface Ofertas {
  acompanhamento: OfertaAcompanhamento;
  garantia: OfertaGarantia;
}

export type Estrategias = Record<Objetivo, string>;
