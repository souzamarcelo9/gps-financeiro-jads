# GPS Financeiro (R7 Investimentos): protótipo navegável

Protótipo da Fase 1 para apresentação ao cliente. **Next.js 14 (App Router), TypeScript e Tailwind CSS.**
Não há banco de dados nesta versão: os dados são fictícios (`lib/data.ts` e `lib/carteiras.ts`) e as alterações feitas
na demonstração ficam salvas só no navegador (o botão "Restaurar dados", no topo, volta ao estado inicial).

## Rodar localmente

```bash
npm install
npm run dev   # http://localhost:3000
```

## Publicar no Vercel

1. Suba a pasta para um repositório no GitHub.
2. No Vercel: Add New > Project > Import. O framework é detectado como Next.js; não há variáveis de ambiente.
3. Deploy. (Ou `npx vercel` dentro da pasta.)

## Novidades desta versão (rodada 1 da reunião)

1. Ativos do plano em painéis separados por classe (Renda fixa, Fundos imobiliários, Ações…), sem rolagem lateral no celular.
2. Cada ativo mostra resumo, cotação ou taxa ilustrativa, faixa de compra e de venda, gráfico e selo: na faixa, abaixo ou acima da faixa.
3. Acompanhamento Individual anunciado na página inicial (Programas complementares) e no menu lateral.
4. "Aulas ligadas a esta carteira", indicadas a partir dos ativos do plano do aluno.
5. Calculadora "Quanto vai para cada ativo", com Valor de agora e Aporte mensal.
6. Mentor 24h em formato de chatbot no canto inferior, com a pergunta "Como funciona o Programa de Acompanhamento Individual?" levando à página do programa.

## Rodada 2

- Código da carteira (ex.: M2) em destaque no Início, como no primeiro protótipo, e no cabeçalho de Minha carteira.
- Menu lateral em azul-noite; item renomeado para "Minha carteira"; Questionário e Mentor 24h de volta ao menu.
- Início no formato do primeiro protótipo (carteira + reserva lado a lado), mantendo as melhorias da rodada 1.

## Rodada 3 (ajustes finais do protótipo)

- Painel > Carteiras: cada ativo é um cartão editável (sem rolagem lateral, inclusive no celular); seletor 3×3 das carteiras em telas menores; barra de total fixa com "Salvar".
- Logo do ativo: upload no painel (ou endereço da imagem). Sem logo, aparece a sigla.
- Cartão do ativo mostra quanto investir agora e por mês; card "Seus dados" com edição direta e recálculo; exportação da carteira em PDF (`/app/plano/pdf`).
- Troca de objetivo ou de perfil sem refazer o questionário, com confirmação "Hoje → Passa a ser".
- Aviso da reserva antes da carteira, com duas opções em radio (inclui seguir sem a reserva) e botão "Ver minha carteira".

## Acessos da demonstração (código: 123456)

| Conta | Situação |
|---|---|
| `ana@exemplo.com` | Aluna com plano pronto |
| `novo@exemplo.com` | Primeiro acesso: vídeo obrigatório e questionário |
| `bruno@exemplo.com` | Já comprou o Acompanhamento Individual |
| `carla@exemplo.com` | Reserva incompleta (mostra o aviso antes da carteira) |
| `eduarda@exemplo.com` | Compra reembolsada (acesso bloqueado) |
| aba Administrador > `renan@r7investimentos.com.br` | Painel administrativo |

Roteiro sugerido: `novo@exemplo.com` → vídeo de boas-vindas → questionário → pop-up de parabéns → plano (perfil,
reserva, carteira, oferta) → Mentor 24h ("Como funciona o Acompanhamento…") → compra simulada → aba liberada → painel admin.

## O que é real e o que é simulado

| Recurso | No protótipo | Na versão final |
|---|---|---|
| Regras do questionário, reserva e cálculos (`lib/quiz.ts`) | Lógica real, reaproveitável | Igual, com regras vindas do painel |
| Login por código | Código fixo 123456 | Supabase Auth (OTP por e-mail) |
| Compra e liberação | Checkout e webhook simulados | Webhooks Hotmart/PayT em rotas de API |
| Cotações | Variação aleatória | API de cotações + comparação com o teto |
| Vídeos | Player simulado | Panda Video ou Vimeo incorporado |
| Mentor 24h (`lib/assistente.ts`) | Respostas por palavras-chave | Regras + API de IA com prompt, dados do aluno e base de conhecimento |
| Painel admin | Grava no navegador | Grava no Supabase |

Fora deste protótipo (partes em amarelo do documento): conteúdo da área exclusiva do acompanhamento,
plataforma de gestão do Investimento com Garantia, proteção contra compartilhamento de contas e automações de WhatsApp.

## Estrutura

```
app/page.tsx              Login (aluno e administrador)
app/app/                  Área do aluno: início, questionário, plano, aulas, estratégias, acompanhamento, garantia, meus dados
app/admin/                Painel: visão geral, alunos, carteiras, estratégias, metodologia, mentor, aulas, ofertas, pagamentos
components/               Layouts, Mentor flutuante, checkout, vídeo, tabela do plano, gráficos
lib/                      Tipos, regras, carteiras, dados fictícios, simulação do Mentor e estado da demo
```
