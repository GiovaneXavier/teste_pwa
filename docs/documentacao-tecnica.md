# Documentação Técnica — Salus EHS

**Versão:** 1.0
**Data:** Março/2026
**Time:** EHS (Environment, Health & Safety)

---

## 1. Visão Geral

O **Salus** é um Progressive Web App (PWA) desenvolvido para o time de EHS com dois objetivos principais:

- **Coleta anônima de dados**: funcionários preenchem formulários em tablets instalados nos setores da empresa, sem necessidade de autenticação
- **Gestão e análise**: gestores do time EHS acessam uma área administrativa protegida para visualizar, filtrar e exportar as respostas

O nome **Salus** é uma referência à deusa romana da saúde e proteção — valor central do time de EHS.

---

## 2. Arquitetura

### 2.1 Visão arquitetural

```
┌────────────────────────────────────────────────────────┐
│                   Servidor Próprio (Intranet)           │
│                                                        │
│  ┌──────────────┐    ┌────────────────────────────┐   │
│  │   Nginx       │───▶│  Next.js (Node.js / PM2)   │   │
│  │  (porta 80)   │    │  (porta 3000)               │   │
│  └──────────────┘    │                             │   │
│                      │  Frontend  │  API Routes    │   │
│                      └─────────────────┬───────────┘   │
│                                        │               │
│                      ┌─────────────────▼───────────┐   │
│                      │     SQL Server (existente)   │   │
│                      └─────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
         ▲                          ▲
         │                          │
    Tablet (PWA)              Gestor (browser)
    Formulário público        Área admin
    (sem autenticação)        (login obrigatório)
```

### 2.2 Stack tecnológica

| Componente | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| Framework full-stack | Next.js 16 (App Router) | 16.x | Full-stack em um único projeto, fácil deploy |
| ORM / Banco | Prisma + SQL Server | 5.x | SQL Server já existente na empresa |
| PWA | next-pwa | 5.x | Service worker + manifest para instalação no tablet |
| Autenticação | NextAuth.js | 4.x | Integração nativa com Next.js, session JWT |
| Estilização | TailwindCSS | 3.x | Desenvolvimento ágil, responsivo |
| Export Excel | ExcelJS | 4.x | Geração de .xlsx com formatação rica no servidor |
| Runtime produção | Node.js + PM2 | LTS | Gerenciamento de processo, restart automático |
| Proxy reverso | Nginx | — | SSL termination, proxy para porta 3000 |

---

## 3. Modelo de Dados

### 3.1 Diagrama de entidades

```
Setor ──────────────┐
  id                │         PerguntaSetor
  nome              │◀────────── perguntaId (FK)
  ativo             │            setorId (FK)
                    │
FaixaEtaria         │         Pergunta
  id                │           id
  label             │           texto
  ordem             │           tipo (multipla_escolha | texto)
                    │           ordem
Resposta ───────────┤           ativo
  id                │               │
  setorId (FK)      │           OpcaoResposta
  faixaEtariaId(FK) │             id
  criadoEm          │             perguntaId (FK)
      │             │             texto
      │             │             ordem
  RespostaItem      │
    id              │         Usuario
    respostaId (FK) │           id
    perguntaId (FK) │           email (unique)
    valorTexto      │           nome
    opcaoId (FK)    │           senha (bcrypt)
                               ativo
```

### 3.2 Descrição das tabelas

| Tabela | Descrição |
|---|---|
| `Setor` | Setores da empresa (Produção, Administrativo, Manutenção, etc.) |
| `FaixaEtaria` | Faixas etárias disponíveis no formulário (Até 25, 26-35, 36-45, 46+) |
| `Pergunta` | Perguntas do formulário. `tipo` define se é múltipla escolha ou texto livre |
| `OpcaoResposta` | Opções para perguntas de múltipla escolha, ordenadas por `ordem` |
| `PerguntaSetor` | Tabela de ligação N:N — define quais perguntas aparecem para cada setor |
| `Resposta` | Um preenchimento completo do formulário (cabeçalho: setor + faixa etária) |
| `RespostaItem` | Cada resposta individual. Para múltipla escolha: `opcaoId`. Para texto: `valorTexto` |
| `Usuario` | Usuários da área administrativa. Senhas hasheadas com bcrypt (12 rounds) |

### 3.3 Lógica condicional de perguntas

A tabela `PerguntaSetor` controla quais perguntas aparecem para cada setor. Uma pergunta pode estar associada a um, vários ou todos os setores.

**Exemplo:**
- Pergunta "Você utiliza EPIs adequados?" → todos os setores
- Pergunta "As máquinas estão em bom estado?" → apenas Produção e Manutenção

---

## 4. APIs

### 4.1 Rotas públicas (sem autenticação)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/setores` | Lista setores ativos |
| `GET` | `/api/faixas-etarias` | Lista faixas etárias ordenadas |
| `GET` | `/api/perguntas?setorId={id}` | Perguntas do setor com suas opções |
| `POST` | `/api/respostas` | Salva uma resposta completa |

### 4.2 Rotas protegidas (requer sessão NextAuth)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/respostas` | Lista respostas com filtros e paginação |
| `GET` | `/api/export` | Gera e retorna arquivo .xlsx |

### 4.3 Parâmetros de filtro (GET /api/respostas e /api/export)

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `setorId` | number | Filtrar por setor |
| `faixaEtariaId` | number | Filtrar por faixa etária |
| `de` | string (YYYY-MM-DD) | Data inicial |
| `ate` | string (YYYY-MM-DD) | Data final |
| `pagina` | number | Página atual (apenas /api/respostas, 20 por página) |

### 4.4 Corpo do POST /api/respostas

```json
{
  "setorId": 1,
  "faixaEtariaId": 2,
  "itens": [
    { "perguntaId": 1, "opcaoId": 3 },
    { "perguntaId": 2, "opcaoId": 7 },
    { "perguntaId": 6, "valorTexto": "Melhorar a sinalização de emergência" }
  ]
}
```

---

## 5. Fluxos Principais

### 5.1 Fluxo do formulário (tablet)

```
Tablet
  │
  ├─▶ GET /api/setores ──────────▶ Exibe botões de setor
  ├─▶ GET /api/faixas-etarias ───▶ Exibe botões de faixa etária
  │
  ├─ Usuário seleciona setor + faixa e clica "Iniciar"
  │
  ├─▶ GET /api/perguntas?setorId=X ─▶ Carrega perguntas do setor
  │
  ├─ Usuário responde todas as perguntas obrigatórias (múltipla escolha)
  │
  ├─▶ POST /api/respostas ────────▶ Salva no banco
  │
  └─▶ Tela de confirmação (3s) ──▶ Reset automático
```

### 5.2 Fluxo da área admin

```
Gestor
  │
  ├─▶ /login → NextAuth credentials ──▶ JWT session (8h)
  │
  ├─▶ /admin ──────────────────────▶ Dashboard
  │       Prisma: count, groupBy
  │
  ├─▶ /admin/respostas ────────────▶ Tabela paginada
  │       Filtros: setor, faixa, período
  │
  ├─▶ /admin/respostas/[id] ───────▶ Detalhe da resposta
  │
  └─▶ GET /api/export ─────────────▶ Download .xlsx
```

### 5.3 Geração do Excel

1. Busca todas as perguntas ativas (para definir colunas)
2. Busca respostas com filtros aplicados
3. Cria workbook ExcelJS com sheet "Respostas"
4. Cabeçalho: fundo verde (#16a34a), texto branco, altura 40px
5. Dados: linhas alternadas (branco / verde claro #F0FDF4)
6. Uma linha por resposta, perguntas como colunas
7. Retorna buffer como `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

## 6. Autenticação e Segurança

### 6.1 Estratégia de autenticação

- **Formulário público**: sem autenticação. Qualquer pessoa na intranet pode acessar a rota `/`
- **Área admin**: NextAuth.js com provider `credentials` (email + senha)
- **Sessão**: JWT, duração de 8 horas
- **Senhas**: bcrypt com 12 rounds de salt

### 6.2 Proteção de rotas

O arquivo `src/app/admin/layout.tsx` protege todas as rotas `/admin/*` via `getServerSession`. Se não houver sessão ativa, redireciona para `/login`.

As rotas de API protegidas (`/api/respostas GET` e `/api/export`) verificam a sessão com `getServerSession` e retornam `401` se não autenticado.

### 6.3 Dados anônimos

Nenhum dado identificador do respondente é coletado. O formulário registra apenas: setor, faixa etária, data/hora e respostas.

---

## 7. PWA

### 7.1 Configuração

O manifest em `public/manifest.json` define:
- `display: standalone` — abre como app nativo (sem barra do browser)
- `theme_color: #16a34a` — cor da barra de status
- `orientation: portrait-primary` — fixo em retrato (tablet)

### 7.2 Service Worker

Gerenciado pelo `next-pwa`. Em produção, registra um service worker com estratégia cache-first para assets estáticos, permitindo carregamento rápido mesmo em redes lentas.

**Nota:** O service worker é desabilitado em desenvolvimento (`NODE_ENV === 'development'`).

### 7.3 Instalação no tablet

No Chrome/Edge Android/Windows:
1. Acessar a URL do sistema no browser
2. Clicar em "Instalar aplicativo" na barra de endereço
3. O app abre em modo standalone (tela cheia, sem browser)

---

## 8. Deploy

### 8.1 Pré-requisitos

- Node.js LTS instalado no servidor
- SQL Server acessível (já existente)
- PM2 instalado globalmente: `npm install -g pm2`
- Nginx instalado

### 8.2 Passos de instalação

```bash
# 1. Clonar repositório
git clone <url-do-repo> /var/www/salus
cd /var/www/salus

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com dados reais do SQL Server

# 4. Criar tabelas no banco
npm run db:push

# 5. Popular dados iniciais (setores, faixas, admin)
npm run db:seed

# 6. Build de produção
npm run build

# 7. Iniciar com PM2
pm2 start npm --name "salus" -- start
pm2 save
pm2 startup
```

### 8.3 Configuração Nginx

```nginx
server {
    listen 80;
    server_name salus.empresa.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.4 Ícones PWA

Antes do deploy, gerar os ícones em `public/icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Usar o SVG em `public/icons/icon.svg` como base.

### 8.5 Atualizações

```bash
git pull
npm install
npm run build
pm2 restart salus
```

---

## 9. Gestão de Perguntas e Setores

### 9.1 Adicionar novo setor

Via Prisma Studio (`npm run db:studio`) ou SQL direto:

```sql
INSERT INTO Setor (nome, ativo) VALUES ('Novo Setor', 1);
```

### 9.2 Adicionar nova pergunta

1. Inserir na tabela `Pergunta`
2. Se múltipla escolha, inserir opções em `OpcaoResposta`
3. Associar aos setores em `PerguntaSetor`

### 9.3 Adicionar usuário admin

```bash
# Via seed (alterar .env.local e rodar novamente)
npm run db:seed

# Ou diretamente (gerar hash bcrypt antes)
```

---

## 10. Estrutura de Arquivos

```
salus/
├── CLAUDE.md                    # Guia para desenvolvimento com IA
├── docs/
│   └── documentacao-tecnica.md  # Este documento
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── seed.ts                  # Dados iniciais
├── public/
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # Ícones do app
├── src/
│   ├── app/                     # Páginas e API (Next.js App Router)
│   ├── components/              # Componentes React
│   │   ├── form/                # Formulário público
│   │   └── admin/               # Área administrativa
│   ├── lib/                     # Utilitários (Prisma, Auth, Excel)
│   └── types/                   # TypeScript types
├── .env.example                 # Modelo de variáveis de ambiente
├── next.config.js               # Configuração Next.js + next-pwa
├── tailwind.config.ts           # Configuração TailwindCSS
└── package.json                 # Dependências e scripts
```

---

## 11. Troubleshooting

| Problema | Causa | Solução |
|---|---|---|
| Build falha com erro Turbopack | next-pwa incompatível com Turbopack | Scripts já incluem `--webpack`. Não remover a flag |
| `params` / `searchParams` type error | Next.js 15+ — são Promises | Usar `const { id } = await params` |
| Erro de conexão com banco | SQL Server inacessível | Verificar `DATABASE_URL` e firewall |
| Service worker não atualiza | Cache do browser | Hard refresh (Ctrl+Shift+R) ou limpar cache |
| Login não funciona | NEXTAUTH_SECRET inválido | Gerar novo secret: `openssl rand -base64 32` |
