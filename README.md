# Pabelis QuickClock Front

Frontend React PWA planejado para o QuickClock. Esta sera a principal interface
de uso diario no iPhone, Android e navegador.

## Por que uma PWA?

O projeto nasceu em Flutter, mas publicar ou manter uma versao iOS instalada de
forma convencional exige a conta Apple Developer de US$ 99 por ano. Como este e
um app pessoal e nao comercial, pagar isso todo ano nao faz sentido.

A PWA resolve esse problema: abre no Safari, pode ser adicionada a tela inicial
do iPhone e nao depende da App Store.

Por isso existem tres projetos:

- `pabelis-quickclock-flutter`: app Flutter atual e referencia funcional.
- `pabelis-quickclock-front`: esta PWA em React.
- `pabelis-quickclock-backend`: API Spring e persistencia.

Nao e loucura ter tres projetos; e uma separacao para manter instalacao,
evolucao e responsabilidades mais simples.

## Escopo da PWA

- Tela principal para lancar trabalho do dia.
- Selecao de empresa.
- Marcacao de manha e tarde.
- Consulta de dias trabalhados.
- Servicos adicionais.
- Orcamentos, historico e aprovacao.
- Relatorio mensal por empresa.
- Marcacao de valores como pagos.
- Controle financeiro de entradas e saidas.
- Dashboard financeiro mensal com previsao de gastos e recebimentos.

## Diretriz de navegação

A tela principal deve continuar sendo o lancamento dos trabalhos. O dashboard
financeiro deve ser acessado por menu ou navegacao secundaria, somente quando o
usuario quiser analisar o financeiro.

## Contexto compartilhado

As regras de produto ficam em `PROJECT_CONTEXT.md`. Quando ele mudar aqui,
tambem deve ser atualizado em:

- `/mnt/c/projetos/ponto-eletronico`
- `/mnt/z/Spring/QuickClock`

## Proximo passo

Inicializar o projeto React neste diretorio, configurar PWA e implementar as
telas usando o backend Spring como fonte de dados.
