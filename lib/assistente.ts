/**
 * SIMULAÇÃO do Mentor 24h para o protótipo.
 * Versão final: perguntas simples e fora de escopo resolvidas por regras (sem custo);
 * o restante vai para a API de IA com o prompt do admin + dados do aluno + trechos da base de conhecimento.
 */
import { fmtCotacao, fmtFaixa, reserva, statusPreco, STATUS_FAIXA_LABEL } from "./quiz";
import { brl, OBJETIVO_LABEL, OBJETIVO_SLUG, PERFIL_LABEL } from "./labels";
import type { Aluno, Aula, Carteira, ConfigMentor, MensagemChat, Metodologia, Ofertas } from "./types";

type Resposta = Omit<MensagemChat, "id" | "autor" | "hora">;

const FORA_ESCOPO = ["receita", "bolo", "futebol", "programação", "programar", "python", "javascript", "saúde", "médico", "remédio", "dieta", "filme", "série", "novela", "música", "piada", "política", "eleição", "horóscopo", "redação", "traduz"];
const ANALISE = ["o que acha da", "o que acha do", "analisa", "analise minha", "petr", "vale3", "bitcoin", "cripto", "devo vender", "qual ação", "qual acao", "me recomenda", "minha carteira pessoal"];

const tem = (t: string, termos: string[]) => termos.some((x) => t.includes(x));

interface Ctx {
  aluno?: Aluno;
  carteiras: Carteira[];
  aulas: Aula[];
  mentor: ConfigMentor;
  metodologia: Metodologia;
  ofertas: Ofertas;
}

function aula(aulas: Aula[], id: string) {
  const a = aulas.find((x) => x.id === id);
  return a ? { id: a.id, titulo: a.titulo, modulo: a.modulo } : undefined;
}

export function responder(entrada: string, ctx: Ctx): Resposta {
  const t = entrada.toLowerCase();
  const { aluno, carteiras, aulas, mentor, metodologia, ofertas } = ctx;
  const r = aluno?.resultado;
  const carteira = r ? carteiras.find((c) => c.codigo === r.codigo) : undefined;
  const temAcomp = aluno?.produtos.includes("acompanhamento");
  const linkPlano = { rotulo: "Abrir minha carteira", href: "/app/plano" };

  if (tem(t, FORA_ESCOPO)) return { texto: mentor.recusa, foraDeEscopo: true, semIA: true };
  if (tem(t, ANALISE))
    return {
      texto:
        "Não faço análise de ativos fora do seu plano nem de carteiras montadas fora da metodologia. As recomendações estão prontas no seu plano e são atualizadas pela equipe.\n\nSe quiser, posso explicar qualquer ativo do seu plano e por que ele está ali.",
      links: r ? [linkPlano] : undefined,
      foraDeEscopo: true,
      semIA: true,
    };

  if (tem(t, ["calculadora"]))
    return {
      texto:
        "A calculadora distribui o seu dinheiro pelos percentuais do plano. Em \"Valor de agora\" você informa quanto vai investir hoje; em \"Aporte mensal\", quanto vai investir todo mês. Cada cartão de ativo mostra na hora o valor em reais.\n\nOs percentuais não mudam: eles seguem a metodologia. Se o valor mudou de vez, use \"Salvar no meu plano\".",
      links: [{ rotulo: "Abrir a calculadora do plano", href: "/app/plano" }],
      aula: aula(aulas, "a4"),
      semIA: true,
    };

  if (tem(t, ["selo", "faixa"]))
    return {
      texto:
        "O selo compara a cotação ilustrativa com a faixa de compra definida pela metodologia. Verde: na faixa de compra. Azul: abaixo da faixa. Cinza: acima da faixa.\n\nQuando um ativo de renda variável está acima da faixa, a orientação é manter o valor dele em renda fixa com liquidez até o preço voltar.",
      aula: aula(aulas, "a12"),
      semIA: true,
    };

  if (tem(t, ["acompanhamento", "humanizado", "renan", "mentoria", "individual"])) {
    if (temAcomp)
      return {
        texto:
          "Você já faz parte do Programa de Acompanhamento Individual Vitalício! Seus benefícios ficam na aba Acompanhamento Individual, e o atendimento com o Renan e a equipe acontece pelo canal exclusivo.",
        links: [{ rotulo: "Ir para o Acompanhamento", href: "/app/acompanhamento" }],
        semIA: true,
      };
    return {
      texto: `O Acompanhamento Individual é para quem quer colocar o plano em prática com orientação humana. Você conta com o Renan e a equipe para tirar dúvidas, tem seu plano revisado a dedo, acesso à carteira pessoal do Renan, a Semana da Alocação mensal, revisões trimestrais e o Radar de Oportunidades.\n\nO melhor: você paga ${brl(ofertas.acompanhamento.preco)} uma única vez e tem acesso vitalício a tudo, sem mensalidade. Quer assistir ao vídeo de apresentação?`,
      links: [{ rotulo: "Conhecer o Programa de Acompanhamento", href: "/app/acompanhamento" }],
      video: true,
      acao: "checkout",
    };
  }

  if (tem(t, ["garantia", "r7"]))
    return {
      texto: `O Investimento com Garantia é uma opção da R7 Investimentos: operações privadas com imóveis ou veículos como garantia, que pagam renda mensal com rentabilidade definida na contratação. Começa a partir de ${brl(ofertas.garantia.minimo)}.\n\nComo todo investimento, tem riscos, e não conta com a garantia do FGC. Na página você vê as operações disponíveis e pode falar com o time para seguir.`,
      links: [{ rotulo: "Conhecer Investimentos com Garantia", href: "/app/investimento-garantia" }],
      aula: aula(aulas, "a7"),
    };

  if (tem(t, ["estratégia", "estrategia", "estratégias prontas"]))
    return {
      texto: "Além do seu plano personalizado, você tem acesso a três estratégias prontas. Em cada uma, você informa o capital e o aporte e vê a distribuição calculada na hora:",
      links: (["multiplicacao", "renda", "renda_crescimento"] as const).map((o) => ({ rotulo: OBJETIVO_LABEL[o], href: `/app/estrategias/${OBJETIVO_SLUG[o]}` })),
      aula: aula(aulas, "a13"),
      semIA: true,
    };

  if (!r)
    return {
      texto: "Para eu te orientar de forma personalizada, primeiro preciso conhecer seu perfil. O questionário leva uns 3 minutos e gera o seu plano de investimentos.",
      links: [{ rotulo: "Responder questionário", href: "/app/questionario" }],
      semIA: true,
    };

  const ativo = carteira?.ativos.find((a) => a.visivel && (t.includes(a.codigo.toLowerCase()) || t.includes(a.nome.toLowerCase())));
  if (ativo)
    return {
      texto: `${ativo.nome} (${ativo.codigo}) representa ${ativo.pct}% do seu plano. ${ativo.explicacao}\n\nComo comprar: ${ativo.comoComprar}${ativo.teto !== undefined && ativo.cotacao !== undefined ? ` Cotação ilustrativa: ${fmtCotacao(ativo, ativo.cotacao)}. Faixa de compra: ${fmtFaixa(ativo, ativo.compraMin, ativo.teto)} (${STATUS_FAIXA_LABEL[statusPreco(ativo)].toLowerCase()}). ${metodologia.avisoCotacao}` : ""}`,
      links: [linkPlano],
      aula: ativo.aulaId ? aula(aulas, ativo.aulaId) : undefined,
    };

  if (tem(t, ["teto", "acima do", "caro", "preço", "cotação"]))
    return { texto: `${metodologia.avisoPrecos}\n\nNo seu plano, o selo verde indica que o ativo está na faixa de compra; o azul, abaixo da faixa; o cinza, acima.`, links: [linkPlano], aula: aula(aulas, "a12") };

  if (tem(t, ["reserva", "emergência", "emergencia"])) {
    const rs = reserva(r, metodologia);
    return {
      texto: `${rs.completa ? `Sua reserva já está completa: ${brl(r.reservaAtual)}, acima dos ${brl(rs.ideal)} recomendados. Seus aportes podem ir direto para o plano.` : `Com gastos de ${brl(r.gastosMensais)} por mês, sua reserva ideal é ${brl(rs.ideal)}. Faltam ${brl(rs.falta)}.`}\n\nA reserva protege você de imprevistos sem precisar vender investimentos no pior momento. Ela deve ficar em renda fixa com alta liquidez, como Tesouro Selic ou CDB de liquidez diária.`,
      links: [{ rotulo: "Atualizar minha reserva", href: "/app/plano#reserva" }],
      aula: aula(aulas, "a2"),
    };
  }

  if (tem(t, ["fundo imobili", "fundos imobili", "fii"]))
    return {
      texto: "Fundo imobiliário (FII) é um investimento em que você compra cotas de um fundo dono de imóveis ou títulos do setor. Em troca, recebe rendimentos, geralmente todo mês.\n\nPara comprar: no home broker da sua corretora, busque o código do fundo que está no seu plano, informe a quantidade de cotas e confirme a ordem.",
      aula: aula(aulas, "a8"),
      links: [linkPlano],
    };

  if (tem(t, ["tesouro", "selic", "ipca"]))
    return { texto: "O Tesouro Direto é um empréstimo ao governo federal em troca de juros, considerado o investimento mais seguro do país. O Tesouro Selic é ótimo para a reserva; os títulos IPCA+ protegem da inflação no longo prazo.", aula: aula(aulas, "a5") };

  if (tem(t, ["cdb", "cdi"]))
    return { texto: "CDB é um empréstimo que você faz a um banco, com rendimento geralmente atrelado ao CDI. Os de liquidez diária permitem resgatar o dinheiro em qualquer dia útil, por isso servem bem para a reserva.", aula: aula(aulas, "a6") };

  if (tem(t, ["investir", "aporte", "aportar", "sobrou", "tenho mais", "r$", "reais"])) {
    const rs = reserva(r, metodologia);
    return {
      texto: `Ótimo! Como seu perfil é ${PERFIL_LABEL[r.perfil].toLowerCase()} com objetivo de ${OBJETIVO_LABEL[r.objetivo].toLowerCase()}, esse valor deve seguir o seu plano.\n\nAbra o plano e use o botão "Atualizar dados" para somar o novo valor ao capital. A calculadora mostra na hora quanto colocar em cada ativo.${rs.completa ? "" : `\n\nUm lembrete: ainda faltam ${brl(rs.falta)} para completar sua reserva. Pela metodologia, ela vem primeiro.`}`,
      links: [linkPlano],
      aula: aula(aulas, "a14"),
    };
  }

  if (tem(t, ["meu perfil", "meu plano", "meu objetivo", "minha carteira", "qual é a minha", "qual a minha"]))
    return {
      texto: `Seu perfil é ${PERFIL_LABEL[r.perfil].toLowerCase()} e seu objetivo é ${OBJETIVO_LABEL[r.objetivo].toLowerCase()}. Por isso a sua carteira é a ${r.codigo} (${carteira?.nome}), calculada para o seu capital de ${brl(r.capital)}.`,
      links: [linkPlano],
      semIA: true,
    };

  if (t.length < 20 && tem(t, ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"]))
    return { texto: `Olá, ${aluno?.nome.split(" ")[0]}! Sou o Mentor 24h. Posso tirar dúvidas sobre investimentos, explicar os ativos do seu plano e indicar a aula certa para cada assunto. Como posso ajudar?`, semIA: true };

  return {
    texto: "Boa pergunta! Na versão final, esta resposta é gerada pela IA com base na metodologia e nos materiais cadastrados no painel, sempre curta e com a aula relacionada.\n\nNesta demonstração, experimente perguntar sobre reserva, fundos imobiliários, um ativo do seu plano, o Acompanhamento Individual ou o Investimento com Garantia.",
  };
}
