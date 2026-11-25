import type { ClasseAtivo, Objetivo, Perfil, StatusAcesso } from "./types";

export const PERFIS: Perfil[] = ["conservador", "moderado", "arrojado"];
export const OBJETIVOS: Objetivo[] = ["multiplicacao", "renda", "renda_crescimento"];

export const PERFIL_LABEL: Record<Perfil, string> = { conservador: "Conservador", moderado: "Moderado", arrojado: "Arrojado" };
export const OBJETIVO_LABEL: Record<Objetivo, string> = {
  multiplicacao: "Multiplicar capital",
  renda: "Gerar renda mensal",
  renda_crescimento: "Renda mensal com crescimento",
};
export const OBJETIVO_CURTO: Record<Objetivo, string> = {
  multiplicacao: "Multiplicação",
  renda: "Renda mensal",
  renda_crescimento: "Renda + crescimento",
};
export const OBJETIVO_SLUG: Record<Objetivo, string> = {
  multiplicacao: "multiplicacao",
  renda: "renda-mensal",
  renda_crescimento: "renda-e-crescimento",
};

export const PERFIL_TEXTO: Record<Perfil, string> = { conservador: "text-conservador", moderado: "text-moderado", arrojado: "text-arrojado" };
export const PERFIL_FUNDO: Record<Perfil, string> = { conservador: "bg-conservador", moderado: "bg-moderado", arrojado: "bg-arrojado" };
export const PERFIL_SUAVE: Record<Perfil, string> = {
  conservador: "bg-conservador/10 text-conservador",
  moderado: "bg-moderado/10 text-moderado",
  arrojado: "bg-arrojado/10 text-arrojado",
};
export const PERFIL_HEX: Record<Perfil, string> = { conservador: "#3E7CB1", moderado: "#2F8F6B", arrojado: "#C9731E" };

export const STATUS_LABEL: Record<StatusAcesso, string> = {
  ativo: "Ativo",
  pendente: "Pagamento pendente",
  bloqueado: "Bloqueado",
  reembolsado: "Reembolsado",
  chargeback: "Chargeback",
};

export const CLASSE_LABEL: Record<ClasseAtivo, string> = {
  tesouro: "Tesouro Direto",
  cdb: "CDB",
  garantia_r7: "Renda com Garantia R7",
  fii: "Fundos Imobiliários",
  acao: "Ações",
  etf: "ETFs",
  bdr: "BDRs",
  etf_int: "ETFs Internacionais",
};
export const CLASSES: ClasseAtivo[] = ["tesouro", "cdb", "garantia_r7", "fii", "acao", "etf", "bdr", "etf_int"];
export const RENDA_FIXA: ClasseAtivo[] = ["tesouro", "cdb", "garantia_r7"];
export const CLASSE_COR: Record<ClasseAtivo, string> = {
  tesouro: "#2F6FB1",
  cdb: "#5B9BD5",
  garantia_r7: "#0E3B43",
  fii: "#2F8F6B",
  acao: "#C9731E",
  etf: "#D9A21B",
  bdr: "#6B5BD2",
  etf_int: "#B83A4B",
};

export const PERFIL_EXPLICACAO: Record<Perfil, string> = {
  conservador:
    "Você valoriza segurança e previsibilidade. Prefere ver o patrimônio crescer com tranquilidade a enfrentar grandes oscilações, por isso seu plano tem uma base forte em renda fixa.",
  moderado:
    "Você busca equilíbrio. Aceita algumas oscilações em troca de um retorno melhor, sem abrir mão de uma base sólida em renda fixa para dormir tranquilo.",
  arrojado:
    "Você entende que as oscilações fazem parte do caminho e está disposto a enfrentá-las em busca de mais crescimento no longo prazo, com mais espaço para renda variável.",
};
export const OBJETIVO_EXPLICACAO: Record<Objetivo, string> = {
  multiplicacao:
    "Seu foco é fazer o patrimônio crescer. Os rendimentos são reinvestidos para acelerar o efeito dos juros compostos ao longo dos anos.",
  renda:
    "Seu foco é receber dinheiro todo mês. O plano prioriza ativos que pagam rendimentos de forma recorrente, como fundos imobiliários e renda com garantia.",
  renda_crescimento:
    "Você quer o melhor dos dois: uma renda mensal hoje e um patrimônio que continua crescendo para o futuro.",
};

export function brl(valor: number, casas = 0) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: casas, maximumFractionDigits: casas });
}
export function brlCompacto(valor: number) {
  if (valor >= 1_000_000) return `R$ ${(valor / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (valor >= 1_000) return `R$ ${(valor / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return brl(valor);
}
export function dataBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
export function dataHoraBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
export function diasAtras(iso: string, hoje = "2026-11-23") {
  const d = Math.round((new Date(hoje).getTime() - new Date(iso.slice(0, 10)).getTime()) / 86400000);
  if (d <= 0) return "hoje";
  if (d === 1) return "ontem";
  return `há ${d} dias`;
}
export function dataLonga(d = new Date()) {
  const t = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}
export function hojeISO() {
  return new Date().toISOString();
}
