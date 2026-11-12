# QuickClock Front

Interface React/TypeScript mobile first para organizar trabalho por empresa.
O Flutter original validou o produto; esta versao web permite usar no Safari
sem pagar a assinatura anual Apple Developer para distribuir um app pessoal.

## Executar

Requer Node 24 LTS e npm. Na raiz:

```bash
npm ci
npm run dev
```

Abra a URL mostrada pelo Vite. `/api` e encaminhado ao backend em
`http://127.0.0.1:8080`. Para outro destino, defina `API_PROXY_TARGET` no ambiente
do processo Vite. Nunca coloque credenciais nessa variavel.

```bash
npm test
npm run build
```

## Estado da entrega

Base tipada, navegacao, cadastro/edicao/desativacao de empresas e configuracao
do meio periodo e expediente conectados aos contratos existentes da API.
Sem dados demonstrativos; sem backend acessivel, a interface mostra erro e retry.
Somente a selecao da empresa fica no localStorage, nao os registros de negocio.
As outras telas indicam que sua integracao ainda esta em preparacao.

Esta entrega ainda nao inclui Compose nem lancamentos diarios. A execucao final
sera frontend, API Spring e PostgreSQL em Docker no PC, com acesso HTTP pelo IP
privado ZeroTier. Nao ha login ou service worker. Abertura pela tela inicial deve
ser validada no Safari do aparelho; nao ha garantia de abertura offline.

## Projetos e especificacao

- [Flutter e spec central](https://github.com/jvictornascimento/pabelis-quickclock-flutter/tree/main/specs/001-quickclock)
- [Backend Spring](https://github.com/jvictornascimento/pabelis-quickclock-backend)
- [Frontend](https://github.com/jvictornascimento/pabelis-quickclock-front)

Consulte PROJECT_CONTEXT.md e AGENTS.md. Este repositorio substitui o prototipo
`web-preview/` como destino de novas implementacoes web; o original foi preservado.
