/** Dados fictícios para o protótipo. Na versão final, tudo isto vem do Supabase. */
import { codigoCarteira } from "./quiz";
import type {
  Aluno, Aula, ConfigMentor, Estrategias, EventoWebhook, ItemConhecimento, Metodologia, Objetivo, Ofertas, Perfil, Plataforma, ResultadoPerfil, Transacao,
} from "./types";

export const HOJE = "2026-11-23";

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = rng(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
function diaMenos(n: number) {
  const d = new Date(`${HOJE}T12:00:00`);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function res(perfil: Perfil, objetivo: Objetivo, renda: number, gastos: number, reservaAtual: number, capital: number, aporte: number, prazo = "Mais de 5 anos"): ResultadoPerfil {
  return {
    perfil,
    objetivo,
    codigo: codigoCarteira(perfil, objetivo),
    pontuacao: perfil === "conservador" ? 7 : perfil === "moderado" ? 10 : 14,
    prazo,
    rendaMensal: renda,
    gastosMensais: gastos,
    reservaAtual,
    capital,
    aporteMensal: aporte,
    geradoEm: "2026-11-10T10:00:00",
    atualizadoEm: "2026-11-18T10:00:00",
  };
}

const base = (o: Partial<Aluno> & Pick<Aluno, "id" | "nome" | "email">): Aluno => ({
  telefone: "",
  plataforma: "Hotmart",
  status: "ativo",
  produtos: ["gps"],
  compradoEm: "2026-11-01",
  ultimoAcesso: HOJE,
  sessoesAtivas: 1,
  mensagensIA: 0,
  custoIA: 0,
  viuBoasVindas: true,
  aulasConcluidas: [],
  ...o,
});

const DEMO: Aluno[] = [
  base({ id: "d1", nome: "Ana Ribeiro", email: "ana@exemplo.com", telefone: "(11) 98877-1020", compradoEm: "2026-11-08", mensagensIA: 42, custoIA: 0.71, aulasConcluidas: ["a0", "a1", "a2", "a3", "a8"], resultado: res("moderado", "renda", 8500, 4200, 26000, 18000, 1200) }),
  base({ id: "d2", nome: "Novo Aluno (demo)", email: "novo@exemplo.com", telefone: "(21) 99654-3311", compradoEm: "2026-11-23", sessoesAtivas: 0, viuBoasVindas: false }),
  base({ id: "d3", nome: "Bruno Carvalho", email: "bruno@exemplo.com", telefone: "(31) 99120-7788", produtos: ["gps", "acompanhamento"], compradoEm: "2026-10-12", sessoesAtivas: 2, mensagensIA: 118, custoIA: 1.94, aulasConcluidas: ["a0", "a1", "a2", "a3", "a4", "a5", "a8", "a9", "a10", "a12"], resultado: res("arrojado", "multiplicacao", 32000, 14000, 90000, 250000, 6000) }),
  base({ id: "d4", nome: "Carla Mendes", email: "carla@exemplo.com", telefone: "(41) 98444-0901", plataforma: "PayT", compradoEm: "2026-11-15", mensagensIA: 9, custoIA: 0.15, aulasConcluidas: ["a0", "a1"], resultado: res("conservador", "renda", 4800, 3000, 2000, 5000, 300, "De 2 a 5 anos") }),
  base({ id: "d5", nome: "Eduarda Lima", email: "eduarda@exemplo.com", status: "reembolsado", compradoEm: "2026-09-20", ultimoAcesso: "2026-09-24", sessoesAtivas: 0, mensagensIA: 4, custoIA: 0.06, resultado: res("conservador", "multiplicacao", 3900, 2800, 0, 1500, 200, "Até 2 anos") }),
];

const NOMES = ["Lucas", "Mariana", "Rafael", "Juliana", "Thiago", "Camila", "Diego", "Fernanda", "Gustavo", "Larissa", "Marcos", "Natália", "Otávio", "Patrícia", "Ricardo", "Sabrina", "Tiago", "Vanessa", "Wagner", "Yasmin", "André", "Beatriz", "Caio", "Daniela", "Eduardo", "Flávia", "Gabriel", "Helena", "Igor", "Joana", "Leonardo", "Mirela", "Paulo", "Renata", "Sérgio"];
const SOBRENOMES = ["Andrade", "Costa", "Moreira", "Martins", "Carvalho", "Ribeiro", "Teixeira", "Souza", "Alves", "Rocha", "Freitas", "Pereira", "Nascimento", "Dias", "Vieira", "Barbosa", "Pinto", "Lopes", "Cardoso", "Gomes"];
const PERFIS_P: Perfil[] = ["conservador", "conservador", "moderado", "moderado", "moderado", "arrojado"];
const OBJ_P: Objetivo[] = ["multiplicacao", "renda", "renda", "renda_crescimento"];

const GERADOS: Aluno[] = NOMES.map((n, i) => {
  const sobrenome = SOBRENOMES[i % SOBRENOMES.length];
  const perfil = pick(PERFIS_P);
  const objetivo = pick(OBJ_P);
  const renda = Math.round((3500 + r() * 22000) / 100) * 100;
  const gastos = Math.round((renda * (0.45 + r() * 0.35)) / 100) * 100;
  const reservaAtual = r() < 0.55 ? gastos * 6 + Math.round(r() * 8) * 1000 : Math.round((r() * gastos * 4) / 500) * 500;
  const capital = Math.round(Math.pow(r(), 2.2) * 380000 / 1000) * 1000 + 2000;
  const aporte = Math.round((renda * (0.08 + r() * 0.2)) / 100) * 100;
  const dias = Math.floor(r() * 75);
  const statusSorteio = r();
  const status = statusSorteio < 0.04 ? "bloqueado" : statusSorteio < 0.09 ? "pendente" : statusSorteio < 0.12 ? "reembolsado" : "ativo";
  const temPlano = r() > 0.12 && status !== "pendente";
  const plataforma: Plataforma = r() < 0.62 ? "Hotmart" : "PayT";
  const aulas = Math.floor(r() * 15);
  const msgs = Math.floor(Math.pow(r(), 1.6) * 160);
  return base({
    id: `g${i}`,
    nome: `${n} ${sobrenome}`,
    email: `${n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${sobrenome.toLowerCase()}@exemplo.com`,
    telefone: r() < 0.85 ? `(${pick(["11", "21", "31", "41", "48", "51", "61", "71", "81"])}) 9${Math.floor(1000 + r() * 8999)}-${Math.floor(1000 + r() * 8999)}` : "",
    plataforma,
    status,
    produtos: status === "ativo" && r() < 0.22 ? ["gps", "acompanhamento"] : ["gps"],
    compradoEm: diaMenos(dias),
    ultimoAcesso: diaMenos(Math.max(0, dias - Math.floor(r() * dias))),
    sessoesAtivas: status === "ativo" ? (r() < 0.18 ? 2 : 1) : 0,
    mensagensIA: msgs,
    custoIA: +(msgs * 0.0045).toFixed(2),
    aulasConcluidas: status === "pendente" ? [] : Array.from({ length: aulas }, (_, k) => `a${k}`),
    viuBoasVindas: status !== "pendente",
    resultado: temPlano ? res(perfil, objetivo, renda, gastos, reservaAtual, capital, aporte, pick(["De 2 a 5 anos", "Mais de 5 anos", "Mais de 5 anos"])) : undefined,
  });
});

export const ALUNOS: Aluno[] = [...DEMO, ...GERADOS];

export const CONTAS_DEMO = [
  { email: "ana@exemplo.com", nome: "Ana Ribeiro", descricao: "Já tem plano" },
  { email: "novo@exemplo.com", nome: "Novo aluno", descricao: "Primeiro acesso" },
  { email: "bruno@exemplo.com", nome: "Bruno Carvalho", descricao: "Com acompanhamento" },
];

export const AULAS: Aula[] = [
  { id: "a0", modulo: "Boas-vindas", titulo: "Como usar o GPS Financeiro", duracao: "3 min", videoUrl: "https://player.exemplo.com/boas-vindas", descricao: "Uma visão geral da plataforma: onde está o seu plano, as videoaulas, o Mentor 24h e os demais benefícios.", palavrasChave: ["plataforma", "começar", "como usar"] },
  { id: "a1", modulo: "Primeiros passos", titulo: "Por que investir e não só poupar", duracao: "12 min", videoUrl: "https://player.exemplo.com/a1", descricao: "Entenda como a inflação corrói o dinheiro parado e por que investir é o caminho para construir patrimônio.", palavrasChave: ["poupança", "inflação", "iniciante"] },
  { id: "a2", modulo: "Primeiros passos", titulo: "Reserva de emergência: quanto e onde guardar", duracao: "15 min", videoUrl: "https://player.exemplo.com/a2", descricao: "Como calcular sua reserva, por que ela vem antes de tudo e quais investimentos usar: Tesouro Selic e CDB de liquidez diária.", palavrasChave: ["reserva", "emergência", "liquidez"] },
  { id: "a3", modulo: "Primeiros passos", titulo: "Abrindo conta na corretora", duracao: "9 min", videoUrl: "https://player.exemplo.com/a3", descricao: "Passo a passo para abrir sua conta, transferir dinheiro e conhecer o home broker.", palavrasChave: ["corretora", "conta", "home broker"] },
  { id: "a4", modulo: "Primeiros passos", titulo: "Como ler o seu plano de investimentos", duracao: "8 min", videoUrl: "https://player.exemplo.com/a4", descricao: "O que significa cada coluna do plano: percentual, risco, teto de compra e os valores calculados para você.", palavrasChave: ["plano", "carteira", "teto"] },
  { id: "a5", modulo: "Renda fixa", titulo: "Tesouro Direto na prática", duracao: "18 min", videoUrl: "https://player.exemplo.com/a5", descricao: "Tesouro Selic, IPCA+ e prefixado: para que serve cada um e como comprar.", palavrasChave: ["tesouro", "selic", "ipca"] },
  { id: "a6", modulo: "Renda fixa", titulo: "CDBs sem complicação", duracao: "14 min", videoUrl: "https://player.exemplo.com/a6", descricao: "Como escolher um CDB, o que é liquidez diária e como funciona o imposto de renda.", palavrasChave: ["cdb", "cdi", "liquidez"] },
  { id: "a7", modulo: "Renda fixa", titulo: "Renda com Garantia R7", duracao: "11 min", videoUrl: "https://player.exemplo.com/a7", descricao: "Como funcionam as operações com imóveis e veículos como garantia, seus benefícios e seus riscos.", palavrasChave: ["garantia", "r7", "imóvel"] },
  { id: "a8", modulo: "Renda variável", titulo: "Comprando seu primeiro fundo imobiliário", duracao: "16 min", videoUrl: "https://player.exemplo.com/a8", descricao: "O que é um FII, como ele paga rendimentos e o passo a passo da compra no home broker.", palavrasChave: ["fii", "fundo imobiliário", "fundos imobiliários"] },
  { id: "a9", modulo: "Renda variável", titulo: "Ações e dividendos", duracao: "17 min", videoUrl: "https://player.exemplo.com/a9", descricao: "Como se tornar sócio de grandes empresas e receber parte dos lucros.", palavrasChave: ["ações", "dividendos", "proventos"] },
  { id: "a10", modulo: "Renda variável", titulo: "ETFs e BDRs: diversificação com uma compra", duracao: "13 min", videoUrl: "https://player.exemplo.com/a10", descricao: "Como investir em dezenas de empresas de uma vez e acessar gigantes internacionais pela B3.", palavrasChave: ["etf", "bdr", "diversificação"] },
  { id: "a11", modulo: "Renda variável", titulo: "Investindo no exterior com ETFs internacionais", duracao: "12 min", videoUrl: "https://player.exemplo.com/a11", descricao: "S&P 500 e outros índices globais sem precisar abrir conta fora do Brasil.", palavrasChave: ["exterior", "s&p", "internacional"] },
  { id: "a12", modulo: "Usando o seu plano", titulo: "Teto de compra: quando comprar cada ativo", duracao: "10 min", videoUrl: "https://player.exemplo.com/a12", descricao: "Como usar o status verde e o teto de compra. Se um ativo estiver acima do teto, mantenha o valor em renda fixa com liquidez até surgir a oportunidade.", palavrasChave: ["teto", "preço", "quando comprar"] },
  {
    id: "a13",
    modulo: "Usando o seu plano",
    titulo: "As 3 estratégias prontas",
    duracao: "9 min",
    videoUrl: "https://player.exemplo.com/a13",
    descricao: "Além do seu plano personalizado, você tem acesso a três estratégias prontas. Escolha a que combina com o seu momento, informe seu capital e veja a distribuição calculada:",
    links: [
      { rotulo: "Estratégia Multiplicação de capital", href: "/app/estrategias/multiplicacao" },
      { rotulo: "Estratégia Geração de renda mensal", href: "/app/estrategias/renda-mensal" },
      { rotulo: "Estratégia Renda mensal com crescimento", href: "/app/estrategias/renda-e-crescimento" },
    ],
    palavrasChave: ["estratégias", "estratégia pronta"],
  },
  { id: "a14", modulo: "Usando o seu plano", titulo: "Novos aportes e rebalanceamento", duracao: "11 min", videoUrl: "https://player.exemplo.com/a14", descricao: "O que fazer quando você tem mais dinheiro para investir e quando reequilibrar o plano.", palavrasChave: ["aporte", "rebalancear", "rebalanceamento"] },
];

export const CONHECIMENTO: ItemConhecimento[] = [
  { id: "k1", titulo: "Metodologia: perfis e objetivos", conteudo: "Os 3 perfis (conservador, moderado, arrojado), os 3 objetivos e como o questionário os identifica.", atualizadoEm: "2026-11-02" },
  { id: "k2", titulo: "Reserva de emergência", conteudo: "Reserva ideal de 6 meses de gastos, em renda fixa com alta liquidez: Tesouro Selic ou CDB de liquidez diária.", atualizadoEm: "2026-10-28" },
  { id: "k3", titulo: "Teto de compra e status dos ativos", conteudo: "Verde quando a cotação está no teto ou abaixo. Acima do teto, manter o valor em renda fixa com liquidez até a oportunidade.", atualizadoEm: "2026-11-10" },
  { id: "k4", titulo: "Programa de Acompanhamento Individual", conteudo: "R$ 697, pagamento único e acesso vitalício. Benefícios: acompanhamento humano, revisão do plano, carteira pessoal do Renan, Semana da Alocação, revisão trimestral e Radar de Oportunidades.", atualizadoEm: "2026-11-12" },
  { id: "k5", titulo: "Investimento com Garantia R7", conteudo: "Operações privadas com imóvel ou veículo como garantia, a partir de R$ 1.000. Contratação com o time humano.", atualizadoEm: "2026-11-12" },
  { id: "k6", titulo: "Perguntas frequentes da plataforma", conteudo: "Login por código, atualizar dados do plano, refazer questionário, onde ficam as aulas.", atualizadoEm: "2026-11-15" },
];

export const METODOLOGIA: Metodologia = {
  mesesReserva: 6,
  limiteConservador: 8,
  limiteModerado: 12,
  avisoPrecos:
    "Caso algum ativo de renda variável não esteja dentro da faixa de preço considerada atrativa para compra, a orientação é manter temporariamente o valor correspondente em renda fixa com liquidez, até surgir uma oportunidade adequada.",
  avisoCotacao: "Confira a cotação atual do ativo no momento da compra.",
  textoReserva:
    "A reserva de emergência protege você de imprevistos, como perda de renda ou um problema de saúde, sem precisar vender seus investimentos no pior momento. Ela deve ficar em renda fixa com alta liquidez, como o Tesouro Selic ou um CDB de liquidez diária, para que você consiga resgatar o dinheiro rapidamente.",
};

export const ESTRATEGIAS: Estrategias = { multiplicacao: "M1", renda: "M2", renda_crescimento: "M3" };

export const MENTOR: ConfigMentor = {
  modelo: "claude-haiku (modelo econômico)",
  prompt: `Você é o Mentor 24h do GPS Financeiro, da R7 Investimentos.
Responda em português, de forma simples e objetiva, em no máximo 4 parágrafos curtos.

Você PODE:
- Explicar conceitos de investimento da metodologia.
- Usar o perfil, objetivo e plano do aluno (fornecidos no contexto).
- Explicar os ativos do plano do aluno com base nos dados cadastrados.
- Indicar a videoaula mais relacionada.
- Apresentar o Programa de Acompanhamento Individual e o Investimento com Garantia quando fizer sentido, sem insistir.

Você NÃO PODE:
- Inventar ativos, percentuais ou recomendações diferentes da metodologia.
- Analisar mercado, ativos fora do plano ou carteiras pessoais do aluno.
- Falar de assuntos fora de investimentos e da plataforma.
- Oferecer o Acompanhamento a quem já possui o programa.`,
  recusa:
    "Fui desenvolvido para entender seus objetivos, ajudar você a aplicar nossa metodologia de investimentos e utilizar os recursos disponíveis na plataforma. Por isso, não realizo análises ou orientações fora desse contexto e não falo de assuntos externos que não tenham ligação com investimentos. Posso ajudar com alguma dúvida relacionada ao seu plano ou ao conteúdo do seu programa?",
  sugestoes: [
    "Como funciona o Programa de Acompanhamento Individual?",
    "Tenho mais R$ 1.000 para investir. O que faço?",
    "Qual é a minha carteira?",
    "Por que preciso de reserva de emergência?",
    "Como compro um fundo imobiliário?",
    "O que é o Investimento com Garantia?",
  ],
  limites: { mensagensPorDia: 30, mensagensPorMes: 400, maxTokensResposta: 400, historicoEnviado: 6 },
};

export const OFERTAS: Ofertas = {
  acompanhamento: {
    ativo: true,
    titulo: "Acompanhamento Individual Vitalício",
    chamada: "Seu plano de investimentos está pronto. Agora, que tal ter acompanhamento humano individual para colocar tudo em prática?",
    preco: 697,
    checkoutUrl: "https://pay.hotmart.com/EXEMPLO-ACOMPANHAMENTO",
    videoUrl: "https://player.exemplo.com/acompanhamento",
    beneficios: [
      { titulo: "Acompanhamento individual humanizado", texto: "Suporte do Renan e da equipe para tirar dúvidas sobre a implementação e a evolução do seu plano." },
      { titulo: "Revisão humanizada do plano", texto: "Seu plano gerado pelo sistema revisado a dedo pelo Renan, com uma análise humana detalhada." },
      { titulo: "Acesso à carteira pessoal do Renan", texto: "Acompanhe os ativos e as estratégias que o próprio Renan utiliza." },
      { titulo: "Semana da Alocação", texto: "Todo mês, veja o que o Renan está comprando, vendendo ou ajustando." },
      { titulo: "Revisão trimestral de perfil", texto: "A equipe entra em contato para acompanhar sua evolução e ajustar o planejamento." },
      { titulo: "Radar de Oportunidades", texto: "Oportunidades identificadas a partir de acontecimentos relevantes no Brasil e no mundo." },
      { titulo: "Acesso vitalício", texto: "Você paga uma única vez e tem todos os benefícios para sempre, sem mensalidade." },
    ],
    faq: [
      { pergunta: "É uma mensalidade?", resposta: "Não. Você paga uma única vez e tem acesso vitalício a todos os benefícios do programa." },
      { pergunta: "Qual a diferença para o Mentor 24h?", resposta: "O Mentor 24h é uma inteligência artificial que tira dúvidas sobre a metodologia. No acompanhamento, você conta com pessoas reais: o Renan e a equipe, que revisam seu plano e acompanham sua evolução." },
      { pergunta: "Preciso criar outra conta?", resposta: "Não. Use o mesmo e-mail da sua compra atual e os benefícios são liberados automaticamente na sua conta." },
      { pergunta: "Em quanto tempo recebo a revisão do plano?", resposta: "A revisão é feita a dedo pelo Renan e pode levar alguns dias úteis. Você é avisado assim que estiver pronta." },
    ],
    locais: { inicio: true, plano: true, popup: true, mentor: true },
  },
  garantia: {
    ativo: true,
    titulo: "Investimento com Garantia",
    chamada: "Renda mensal com imóveis e veículos como garantia",
    descricao:
      "São investimentos privados oferecidos pela R7 Investimentos, que utilizam imóveis ou veículos como garantia da operação. A rentabilidade é definida na contratação e pode chegar a quase o dobro da renda fixa tradicional, dependendo da operação.",
    minimo: 1000,
    destaque: "Até 2x a renda fixa tradicional",
    videoUrl: "https://player.exemplo.com/garantia",
    whatsapp: "https://wa.me/5511999999999?text=Quero%20conhecer%20o%20Investimento%20com%20Garantia",
    operacoes: [
      { id: "o1", nome: "Operação Imóvel SP 24 meses", garantia: "Imóvel", rentabilidade: "1,6% ao mês", prazo: "24 meses", minimo: 1000, captado: 72 },
      { id: "o2", nome: "Operação Frota Sul 12 meses", garantia: "Veículo", rentabilidade: "1,8% ao mês", prazo: "12 meses", minimo: 1000, captado: 41 },
      { id: "o3", nome: "Operação Imóvel BH 36 meses", garantia: "Imóvel", rentabilidade: "1,5% ao mês", prazo: "36 meses", minimo: 5000, captado: 88 },
    ],
  },
};

const PRODUTO_GPS = "GPS Financeiro · Acesso vitalício";
const PRODUTO_ACOMP = "Acompanhamento Individual Vitalício";

export const TRANSACOES: Transacao[] = ALUNOS.flatMap((a, i) => {
  const t: Transacao[] = [
    {
      id: `TX${804500 + i * 7}`,
      cliente: a.nome,
      email: a.email,
      produto: PRODUTO_GPS,
      gateway: a.plataforma,
      valor: 497,
      metodo: i % 3 === 0 ? "Cartão" : i % 5 === 0 ? "Boleto" : "Pix",
      status: a.status === "reembolsado" ? "reembolsado" : a.status === "pendente" ? "pendente" : "aprovado",
      data: `${a.compradoEm}T${String(8 + (i % 13)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}:00`,
    },
  ];
  if (a.produtos.includes("acompanhamento"))
    t.push({ ...t[0], id: `TX${904500 + i * 7}`, produto: PRODUTO_ACOMP, valor: 697, metodo: "Cartão", status: "aprovado", data: t[0].data.replace(/T(\d\d)/, (_, h) => `T${String(Math.min(23, Number(h) + 1)).padStart(2, "0")}`) });
  return t;
}).sort((x, y) => y.data.localeCompare(x.data));

export const WEBHOOKS: EventoWebhook[] = TRANSACOES.slice(0, 16).map((t, i) => ({
  id: `w${i}`,
  plataforma: t.gateway,
  evento:
    t.gateway === "Hotmart"
      ? { aprovado: "PURCHASE_APPROVED", pendente: "PURCHASE_BILLET_PRINTED", reembolsado: "PURCHASE_REFUNDED", chargeback: "PURCHASE_CHARGEBACK" }[t.status]
      : { aprovado: "compra_aprovada", pendente: "aguardando_pagamento", reembolsado: "reembolso", chargeback: "chargeback" }[t.status],
  email: t.email,
  produto: t.produto,
  recebidoEm: t.data,
  acao:
    t.status === "aprovado"
      ? t.produto === PRODUTO_ACOMP
        ? "Acompanhamento liberado"
        : "Aluno criado e acesso liberado"
      : t.status === "pendente"
        ? "Aguardando pagamento"
        : "Acesso bloqueado",
  ok: true,
}));

export { PRODUTO_ACOMP, PRODUTO_GPS };

/** Série diária fictícia dos últimos 180 dias para os gráficos do painel. */
export const SERIE = Array.from({ length: 180 }, (_, i) => {
  const dia = diaMenos(179 - i);
  const semana = new Date(dia).getDay();
  const tendencia = 1 + i / 260;
  const vendas = Math.max(2, Math.round((7 + r() * 9 + (semana === 1 || semana === 2 ? 3 : 0) - (semana === 0 ? 3 : 0)) * tendencia));
  const upsells = Math.round(vendas * (0.12 + r() * 0.12));
  const planos = Math.round(vendas * (0.75 + r() * 0.2));
  return { dia, vendas, upsells, planos, receita: vendas * 497 + upsells * 697, mensagens: Math.round(vendas * (55 + r() * 30)) };
});

export const DUVIDAS_FREQUENTES = [
  { pergunta: "Tesouro Selic ou CDB para a reserva?", total: 312 },
  { pergunta: "Como funciona o Acompanhamento Individual?", total: 268 },
  { pergunta: "O que fazer quando o ativo está acima do teto?", total: 241 },
  { pergunta: "Como compro um fundo imobiliário?", total: 198 },
  { pergunta: "Tenho mais dinheiro, como aporto?", total: 176 },
];

/** Alunos na base (soma das vendas da série), usado para o custo de IA por aluno. */
export const BASE_ALUNOS = SERIE.reduce((s, d) => s + d.vendas, 0);
