/** As 9 carteiras da metodologia (dados fictícios). Na versão final, ficam no Supabase e são editadas no painel. */
import { codigoCarteira } from "./quiz";
import { OBJETIVOS, PERFIS } from "./labels";
import type { Ativo, Carteira, ClasseAtivo, FormatoCotacao, Objetivo, Perfil, Risco } from "./types";

type Base = Omit<Ativo, "id" | "pct" | "visivel">;

const COMO_COMPRAR: Record<ClasseAtivo, string> = {
  tesouro: "No app da sua corretora, acesse Renda fixa > Tesouro Direto, escolha o título e informe o valor.",
  cdb: "Na corretora, vá em Renda fixa > CDB e filtre por liquidez diária e emissores de bancos sólidos.",
  garantia_r7: "Fale com o time da R7 pelo botão de Investimento com Garantia. A contratação é feita com acompanhamento humano.",
  fii: "No home broker, busque o código do fundo, informe a quantidade de cotas e confirme a ordem de compra.",
  acao: "No home broker, busque o código da ação, defina a quantidade e envie a ordem com preço limitado.",
  etf: "No home broker, busque o código do ETF e compre como se fosse uma ação.",
  bdr: "No home broker, busque o código do BDR. Algumas corretoras pedem que você aceite o termo de BDRs antes.",
  etf_int: "No home broker, busque o código do ETF. Você investe no exterior sem precisar abrir conta fora do Brasil.",
};

const AULA_CLASSE: Record<ClasseAtivo, string> = {
  tesouro: "a5",
  cdb: "a6",
  garantia_r7: "a7",
  fii: "a8",
  acao: "a9",
  etf: "a10",
  bdr: "a10",
  etf_int: "a11",
};

type Preco = { cotacao: number; min: number; teto: number; venda?: number; vendaMax?: number; formato?: FormatoCotacao };

function b(classe: ClasseAtivo, nome: string, codigo: string, risco: Risco, explicacao: string, preco?: Preco): Base {
  return {
    classe,
    nome,
    codigo,
    risco,
    explicacao,
    comoComprar: COMO_COMPRAR[classe],
    aulaId: AULA_CLASSE[classe],
    formato: preco?.formato ?? "reais",
    cotacao: preco?.cotacao,
    compraMin: preco?.min,
    teto: preco?.teto,
    precoVenda: preco?.venda,
    vendaMax: preco?.vendaMax,
  };
}

const POOL: Record<string, Base> = {
  selic: b("tesouro", "Tesouro Selic 2029", "TESOURO SELIC", "Baixo", "Acompanha a taxa básica de juros. Seguro e com resgate fácil, ideal para a parte mais estável do plano.", { cotacao: 0.08, min: 0.05, teto: 0.15, formato: "selic" }),
  ipca35: b("tesouro", "Tesouro IPCA+ 2035", "TESOURO IPCA+ 35", "Baixo", "Protege seu dinheiro da inflação e paga um juro real acima dela até o vencimento.", { cotacao: 6.4, min: 6.1, teto: 6.8, formato: "ipca" }),
  ipca45: b("tesouro", "Tesouro IPCA+ 2045", "TESOURO IPCA+ 45", "Médio", "Título de longo prazo para construir patrimônio protegido da inflação. Oscila mais antes do vencimento.", { cotacao: 6.55, min: 6.2, teto: 6.9, formato: "ipca" }),
  cdb: b("cdb", "CDB Liquidez Diária", "CDB 100% CDI", "Baixo", "Rende próximo da taxa do mercado e permite resgatar o dinheiro em qualquer dia útil.", { cotacao: 102, min: 100, teto: 106, formato: "cdi" }),
  cdbpre: b("cdb", "CDB Prefixado", "CDB PRÉ 2028", "Baixo", "Você já sabe quanto vai receber no vencimento. Bom para travar uma taxa atrativa.", { cotacao: 13.2, min: 12.8, teto: 13.8, formato: "pre" }),
  r7: b("garantia_r7", "Renda com Garantia R7", "R7 IMÓVEL 24M", "Médio", "Operação privada com rentabilidade definida e imóvel como garantia. Paga rendimentos mensais.", { cotacao: 1.6, min: 1.5, teto: 1.8, formato: "am" }),
  fiipapel: b("fii", "FII Recebíveis Imobiliários", "RCBV11", "Médio", "Fundo que investe em títulos do setor imobiliário. Costuma pagar rendimentos mensais acima da média.", { cotacao: 96.4, min: 92, teto: 99, venda: 112, vendaMax: 118 }),
  fiilog: b("fii", "FII Galpões Logísticos", "LGTX11", "Médio", "Fundo dono de galpões alugados para grandes empresas. Renda mensal com contratos longos.", { cotacao: 112.8, min: 100, teto: 108, venda: 128, vendaMax: 135 }),
  fiishop: b("fii", "FII Shoppings Centers", "SHPZ11", "Médio", "Fundo com participação em shoppings. Recebe parte dos aluguéis e das vendas das lojas.", { cotacao: 84.1, min: 80, teto: 88, venda: 98, vendaMax: 104 }),
  acaoEnergia: b("acao", "Elétrica Nacional", "ELNC3", "Médio", "Empresa de energia com receitas previsíveis e histórico de bons dividendos.", { cotacao: 41.25, min: 37, teto: 43, venda: 52, vendaMax: 55 }),
  acaoBanco: b("acao", "Banco Brasileiro", "BBRS4", "Alto", "Grande banco com lucros consistentes e pagamento recorrente de dividendos.", { cotacao: 34.9, min: 28, teto: 32.5, venda: 39, vendaMax: 42 }),
  acaoVarejo: b("acao", "Varejo Digital", "VRJD3", "Alto", "Empresa de varejo com potencial de crescimento. Oscila bastante no curto prazo.", { cotacao: 11.7, min: 12, teto: 13.5, venda: 17, vendaMax: 18 }),
  etfBR: b("etf", "ETF Ibovespa", "IBXZ11", "Alto", "Com uma única compra, você investe nas principais empresas da bolsa brasileira.", { cotacao: 128.3, min: 120, teto: 132 }),
  bdr: b("bdr", "BDR Big Techs", "BGTC34", "Alto", "Acesso às maiores empresas de tecnologia do mundo diretamente pela bolsa brasileira.", { cotacao: 58.6, min: 48, teto: 55 }),
  etfInt: b("etf_int", "ETF S&P 500", "SPXB11", "Alto", "Investe nas 500 maiores empresas dos Estados Unidos, com proteção cambial natural em dólar.", { cotacao: 318.9, min: 300, teto: 330 }),
};

const ALOCACOES: Record<string, [string, number][]> = {
  C1: [["ipca35", 30], ["selic", 20], ["cdbpre", 20], ["r7", 15], ["etfInt", 10], ["etfBR", 5]],
  C2: [["selic", 25], ["cdb", 20], ["r7", 25], ["fiipapel", 20], ["fiilog", 10]],
  C3: [["selic", 20], ["ipca35", 20], ["r7", 20], ["fiipapel", 15], ["fiilog", 10], ["etfInt", 10], ["cdb", 5]],
  M1: [["ipca45", 15], ["r7", 10], ["acaoBanco", 15], ["acaoEnergia", 10], ["etfBR", 15], ["etfInt", 20], ["bdr", 15]],
  M2: [["r7", 20], ["ipca35", 15], ["fiipapel", 20], ["fiilog", 20], ["acaoEnergia", 15], ["selic", 10]],
  M3: [["r7", 15], ["ipca35", 15], ["fiilog", 15], ["fiipapel", 10], ["acaoEnergia", 15], ["etfInt", 15], ["bdr", 10], ["selic", 5]],
  A1: [["ipca45", 10], ["acaoBanco", 15], ["acaoVarejo", 15], ["etfBR", 15], ["bdr", 20], ["etfInt", 25]],
  A2: [["r7", 15], ["fiishop", 20], ["fiilog", 20], ["fiipapel", 10], ["acaoBanco", 15], ["acaoEnergia", 20]],
  A3: [["r7", 10], ["fiilog", 15], ["fiishop", 10], ["acaoBanco", 15], ["acaoEnergia", 10], ["bdr", 20], ["etfInt", 20]],
};

const NOMES: Record<string, string> = {
  C1: "Crescimento Seguro",
  C2: "Renda Tranquila",
  C3: "Renda com Base Sólida",
  M1: "Crescimento Constante",
  M2: "Renda Mensal Equilibrada",
  M3: "Renda e Patrimônio",
  A1: "Multiplicação Acelerada",
  A2: "Renda Turbinada",
  A3: "Patrimônio em Expansão",
};

const RESUMO_PERFIL: Record<Perfil, string> = {
  conservador: "base forte em renda fixa e pouca exposição a oscilações",
  moderado: "equilíbrio entre renda fixa e renda variável",
  arrojado: "maior espaço para renda variável e ativos internacionais",
};
const RESUMO_OBJ: Record<Objetivo, string> = {
  multiplicacao: "reinvestir os rendimentos e acelerar o crescimento do patrimônio",
  renda: "gerar rendimentos mensais recorrentes",
  renda_crescimento: "gerar renda mensal e continuar crescendo o patrimônio",
};

export const CARTEIRAS: Carteira[] = PERFIS.flatMap((p) =>
  OBJETIVOS.map((o) => {
    const codigo = codigoCarteira(p, o);
    return {
      codigo,
      perfil: p,
      objetivo: o,
      nome: NOMES[codigo],
      resumo: `Carteira com ${RESUMO_PERFIL[p]}, pensada para ${RESUMO_OBJ[o]}.`,
      estrategia:
        o === "multiplicacao"
          ? "Os rendimentos recebidos devem ser reinvestidos todo mês nos próprios ativos do plano, seguindo os percentuais."
          : o === "renda"
            ? "Os rendimentos mensais podem ser usados como renda. Para crescer mais rápido, reinvista uma parte."
            : "Use metade dos rendimentos como renda e reinvista a outra metade para manter o patrimônio crescendo.",
      observacao: "",
      ativos: ALOCACOES[codigo].map(([chave, pct], i) => ({ ...POOL[chave], id: `${codigo}-${i}`, pct, visivel: true })),
      atualizadaEm: "2026-11-18",
    };
  }),
);
