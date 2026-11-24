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

Esta entrega inclui Compose, mas ainda nao inclui lancamentos diarios. A execucao final
sera frontend, API Spring e PostgreSQL em Docker no PC, com acesso HTTP pelo IP
privado ZeroTier. Nao ha login ou service worker. Abertura pela tela inicial deve
ser validada no Safari do aparelho; nao ha garantia de abertura offline.

## Docker Compose local

Execute na raiz deste repositorio, com Docker Desktop/Engine e Compose ativos.
O backend deve estar em `../../Spring/QuickClock` ou no caminho informado por
`QUICKCLOCK_BACKEND_PATH`. Caminhos relativos sao resolvidos a partir do Compose.

No PowerShell:

```powershell
Copy-Item .env.example .env
# Edite DATABASE_PASSWORD em .env antes de iniciar.
docker compose config --quiet
docker compose up --build --wait
docker compose ps
```

Abra `http://127.0.0.1:8088/`. O proxy serve a interface e encaminha `/api/`
para Spring Boot; PostgreSQL e API nao publicam portas no host. Os tres servicos
possuem healthchecks. O check da API verifica HTTP apos inicializacao do Spring;
o check do PostgreSQL e o teste de persistencia confirmam o banco separadamente.

Para acessar pelo celular, configure `QUICKCLOCK_BIND_IP` com o IP privado do
ZeroTier do PC e recrie o frontend: `docker compose up -d frontend`.
A URL sera `http://IP-ZEROTIER:8088/`. Nao use `0.0.0.0` sem revisar a exposicao
de rede. O aparelho precisa estar autorizado na rede ZeroTier. A validacao real
no Safari e fora de casa permanece na T07.

```powershell
docker compose logs --tail 100 api
docker compose restart
docker compose down
docker compose up -d --wait
```

`down` preserva o volume `database_data`; `down -v` apaga os dados e nao faz parte
da rotina. Alterar senha no .env nao altera automaticamente senha de um banco
ja inicializado: fazer uma troca planejada, sem remover o volume para resolver.
Reiniciar o Docker nao exige internet depois que as imagens estao disponiveis.
O build inicial exige acesso aos registries/repositorios de dependencias.

Para QA, use outro nome de projeto (`-p quickclock-t06-qa`) e outra porta para
isolar containers e volume. Nunca executar verificacoes com dados pessoais.

## Projetos e especificacao

- [Flutter e spec central](https://github.com/jvictornascimento/pabelis-quickclock-flutter/tree/main/specs/001-quickclock)
- [Backend Spring](https://github.com/jvictornascimento/pabelis-quickclock-backend)
- [Frontend](https://github.com/jvictornascimento/pabelis-quickclock-front)

Consulte PROJECT_CONTEXT.md e AGENTS.md. Este repositorio substitui o prototipo
`web-preview/` como destino de novas implementacoes web; o original foi preservado.
