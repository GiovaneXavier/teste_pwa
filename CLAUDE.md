# CLAUDE.md — Salus EHS

## Visão geral do projeto

**Salus** é um PWA de formulários para o time de EHS (Environment, Health & Safety).
- Tablets sem autenticação preenchem um formulário de ~35 perguntas
- Gestores autenticados visualizam e exportam respostas em Excel
- Hospedado em servidor próprio (intranet — sem internet pública necessária)

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Banco | SQL Server via Prisma ORM | Prisma 5.x |
| PWA | next-pwa | 5.x |
| Auth | NextAuth.js | 4.x |
| UI | TailwindCSS | 3.x |
| Export | ExcelJS | 4.x |

## Comandos principais

```bash
npm run dev          # Desenvolvimento (webpack obrigatório — ver nota abaixo)
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run db:push      # Aplicar schema Prisma no SQL Server
npm run db:seed      # Popular banco com dados iniciais
npm run db:studio    # Abrir Prisma Studio
```

## IMPORTANTE: Webpack obrigatório

`next-pwa` não é compatível com Turbopack (padrão do Next.js 16).
Os scripts `dev` e `build` já incluem `--webpack`. **Nunca remover essa flag.**

## Variáveis de ambiente (.env.local)

```
DATABASE_URL="sqlserver://HOST:1433;database=salus;user=USER;password=SENHA;encrypt=false"
NEXTAUTH_SECRET="string-aleatoria-segura"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@empresa.com"
ADMIN_PASSWORD="SenhaSegura"
```

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx                    # Formulário público (tablet)
│   ├── login/page.tsx              # Login admin
│   ├── admin/
│   │   ├── page.tsx                # Dashboard
│   │   ├── respostas/page.tsx      # Listagem + filtros
│   │   └── respostas/[id]/page.tsx # Detalhe
│   └── api/
│       ├── respostas/route.ts      # POST salvar | GET listar
│       ├── perguntas/route.ts      # GET perguntas por setor
│       ├── setores/route.ts        # GET setores
│       ├── faixas-etarias/route.ts # GET faixas
│       └── export/route.ts         # GET → .xlsx
├── components/
│   ├── form/                       # Componentes do formulário público
│   └── admin/                      # Componentes da área admin
├── lib/
│   ├── prisma.ts                   # Singleton Prisma client
│   ├── auth.ts                     # Config NextAuth
│   └── excel.ts                    # Geração de Excel
└── types/
    └── index.ts                    # Types compartilhados
prisma/
├── schema.prisma                   # Schema SQL Server
└── seed.ts                         # Dados iniciais
public/
├── manifest.json                   # PWA manifest
└── icons/                          # Ícones PWA (192px e 512px — gerar antes do deploy)
```

## Schema do banco (resumo)

- `Setor` — setores da empresa
- `FaixaEtaria` — faixas etárias disponíveis
- `Pergunta` — perguntas do formulário (tipo: `multipla_escolha` | `texto`)
- `OpcaoResposta` — opções das perguntas de múltipla escolha
- `PerguntaSetor` — tabela N:N que define quais perguntas aparecem para cada setor
- `Resposta` — um preenchimento completo do formulário
- `RespostaItem` — cada resposta individual (pergunta + valor ou opção)
- `Usuario` — usuários admin (senha com bcrypt, 12 rounds)

## Fluxo do formulário (tablet)

1. Usuário seleciona **Setor** e **Faixa Etária**
2. API `/api/perguntas?setorId=X` retorna perguntas filtradas
3. Usuário preenche (múltipla escolha obrigatória, texto opcional)
4. `POST /api/respostas` salva no banco
5. Tela de confirmação por **3 segundos** → reset automático

## Rotas da área admin

| Rota | Descrição | Auth |
|---|---|---|
| `/login` | Login com email/senha | — |
| `/admin` | Dashboard com totais | ✅ |
| `/admin/respostas` | Listagem com filtros | ✅ |
| `/admin/respostas/[id]` | Detalhe de uma resposta | ✅ |
| `GET /api/export` | Download .xlsx | ✅ |

## Parâmetros do export Excel

```
GET /api/export?setorId=1&faixaEtariaId=2&de=2025-01-01&ate=2025-12-31
```
Todos os parâmetros são opcionais — sem filtro retorna tudo.

## Cores (TailwindCSS)

```
salus-600  #16a34a  (principal)
salus-100  #dcfce7  (fundo suave)
```
Classes utilitárias: `btn-primary`, `btn-secondary`, `card`, `input`, `label`

## Deploy em servidor próprio

```bash
# Build
npm run build

# PM2
pm2 start npm --name "salus" -- start
pm2 save
pm2 startup

# Nginx (exemplo)
# proxy_pass http://localhost:3000
```

## Antes do primeiro deploy

1. Configurar `.env.local` com dados reais
2. `npm run db:push` — criar tabelas
3. `npm run db:seed` — dados iniciais
4. Gerar ícones PWA em `public/icons/icon-192.png` e `icon-512.png`
5. Adicionar perguntas reais via Prisma Studio ou seed customizado

## Notas de compatibilidade

- `params` e `searchParams` em page components são `Promise<T>` no Next.js 15+ — sempre usar `await`
- `ExcelJS.Column[]` como tipo explícito causa erro — atribuir diretamente a `sheet.columns`
- `Buffer` do ExcelJS deve ser convertido para `Uint8Array` no `NextResponse`
