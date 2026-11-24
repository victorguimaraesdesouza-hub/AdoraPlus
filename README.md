# Adora+ — Sistema de Escala e Repertório

Plataforma web **mobile-first** para gerenciamento de escalas, calendário, horários e repertórios de ministérios de louvor, com **3 temas (Escuro, Claro e Suave)**, autenticação exclusiva via Google e integração OAuth configurável para Google Drive e OneDrive.

## Demo Online (GitHub Pages)

- **Site publicado:** `https://victorguimaraesdesouza-hub.github.io/AdoraPlus/`

## Stack

- **Frontend:** React 19 + TypeScript + Vite (SPA responsiva com aparência estruturada e 3 temas)
- **Autenticação:** Google Identity Services (OAuth 2.0) — apenas e-mail autenticado; nome e perfil preenchidos manualmente
- **Banco de dados (Produção):** PostgreSQL — schema pronto em [`supabase/schema.sql`](supabase/schema.sql) (compatível com Supabase Free Tier ou PostgreSQL 15+)
- **Integrações de repertório:** Google Drive e OneDrive (OAuth 2.0)

## Funcionalidades da Primeira Entrega (MVP)

- **Login Google + Cadastro manual** (Nome completo, Data de nascimento, Sexo, Unção, múltiplos Cargos expansíveis)
- **Gestão de permissões** com níveis **Admin**, **Editor** e **Membro** + controle granular por permissão
- **Dashboard intuitiva** com acesso rápido, próximo culto, faixa semanal e avisos gerais em painéis distintos
- **Calendário mensal** com filtro (*Todos os cultos* / *Só as minhas*) e destaque visual + losango âmbar nos dias escalados
- **Módulo de Escalas** (criar, editar, aprovar, excluir, atribuir participantes e funções)
- **Módulo de Repertório** com banco de músicas, vínculo por culto e configuração OAuth para **Google Drive** e **OneDrive**
- **3 Temas completos:** Escuro, Claro e Suave

## Executar localmente

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha suas credenciais OAuth e PostgreSQL/Supabase quando conectar o ambiente real.
