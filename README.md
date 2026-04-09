# Task Management (To-Do) — Case Bravi

Aplicação web de **gerenciamento de tarefas** (To-Do) com backend em **Django REST Framework**, frontend em **React + Vite (TypeScript)**, autenticação **JWT em cookies httpOnly**, testes (**pytest** + **Selenium**), **Docker/Docker Compose** para dev e produção, **CI/CD no GitHub Actions** e deploy na **AWS** (EC2 + RDS), com **HTTPS via Let’s Encrypt**.

---

## Sumário

- [Requisitos funcionais (RFs)](#requisitos-funcionais-rfs)
- [Arquitetura](#arquitetura)
- [Desenvolvimento local (Docker Compose)](#desenvolvimento-local-docker-compose)
- [Produção (Docker Compose + Nginx + TLS)](#produção-docker-compose--nginx--tls)
- [Infraestrutura na AWS](#infraestrutura-na-aws)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Testes](#testes)
- [API](#api)
- [Decisões de design](#decisões-de-design)

---

## Requisitos funcionais (RFs)

Referência: `RFs.md`.

| RF   | Descrição                               | Cobertura no projeto                                                          |
| ---- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| RF1  | Cadastro de conta                         | Implementado (registro + login)                                               |
| RF2  | Login                                     | Implementado (cookies httpOnly)                                               |
| RF3  | CRUD de tarefas                           | Implementado                                                                  |
| RF4  | Marcar concluída / não concluída       | Implementado                                                                  |
| RF5  | Filtrar por status e categoria            | Implementado (+ filtros extras no front: escopo, due date)                    |
| RF6  | Paginação da lista de tarefas           | Implementado (DRF `PageNumberPagination`)                                   |
| RF7  | CRUD e listagem de categorias             | Implementado                                                                  |
| RF8  | Compartilhar tarefas e ver compartilhadas | Implementado (compartilhamento por e-mail no front)                           |
| RF9  | Integração com API                      | **Atendido**                                                            |
| RF10 | Backend DRF                               | Atendido                                                                      |
| RF11 | Frontend React                            | Atendido (Vite + TS)                                                          |
| RF12 | Testes backend com pytest                 | Atendido (`backend/**/tests/`)                                              |
| RF13 | Testes frontend com Selenium              | Atendido (`frontend/tests/`)                                                |
| RF14 | Docker + Docker Compose                   | Atendido (`docker-compose.yml` dev, `docker-compose-production.yml` prod) |
| RF15 | CI/CD                                     | Atendido (`.github/workflows`)                                              |
| RF16 | Deploy em nuvem (AWS/Azure) opcional      | Atendido na AWS (EC2 + RDS)                                                   |

---

## Arquitetura

### Backend (`backend/`)

- **Django** + **Django REST Framework**
- Autenticação: **Simple JWT** com tokens entregues em **cookies httpOnly** (`CookieJWTAuthentication`)
- Documentação OpenAPI: **drf-spectacular** (schema em dev; ver `config/urls.py`)
- Apps principais:
  - `accounts`: registro, login, refresh, **logout** (limpeza de cookies), usuário atual
  - `tasks`: tarefas, categorias, compartilhamentos
- Dependências gerenciadas com **Pipenv** (`Pipfile` / `Pipfile.lock`)

### Frontend (`frontend/`)

- **React** + **Vite** + **TypeScript**
- **React Router** (rotas públicas/privadas)
- **TanStack Query** para dados da API (cache, mutações, invalidação)
- Estilos em **CSS** próprio (`App.css`, etc.)
- Chamadas HTTP com **`credentials: "include"`** (cookies)

### Arquivos de ambiente

- **Desenvolvimento**
  - Raiz: `.env.dev` (Postgres do `docker-compose.yml`)
  - Backend: `backend/config/.env.dev`
  - Frontend: `frontend/.env.dev` (ex.: `VITE_API_BASE_URL`)
- **Produção**
  - Raiz: `.env.production` (variáveis usadas pelo Nginx no template, ex. `API_DOMAIN`)
  - Backend: `backend/config/.env.production` (`PRODUCTION=True`, DB RDS, `SECRET_KEY`, etc.)
  - Frontend: `frontend/.env.production` (build-time: `VITE_API_BASE_URL` apontando para a API pública)

---

## Desenvolvimento local (Docker Compose)

Arquivo: `docker-compose.yml`

Sobe:

| Serviço     | Função                         | Porta (host) |
| ------------ | -------------------------------- | ------------ |
| `backend`  | Django (`runserver`) + migrate | `8000`     |
| `db`       | PostgreSQL 15                    | `5432`     |
| `frontend` | Vite dev server                  | `5173`     |

### Passos

1. Crie `.env.dev` na **raiz** (Postgres), alinhado ao que o serviço `db` espera (veja `backend/config/example.env` como referência de nomes de variáveis).
2. Crie `backend/config/.env.dev` para o Django apontar para o banco do Compose.
3. Crie `frontend/.env.dev` se precisar mudar a API (ex.: `VITE_API_BASE_URL=http://localhost:8000`).

```bash
docker compose up --build
```

- API: `http://localhost:8000/api/`
- Frontend: `http://localhost:5173`

## Produção (Docker Compose + Nginx + TLS)

Arquivo: `docker-compose-production.yml`

| Serviço     | Função                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend`  | **Gunicorn** na porta **8000** (apenas `expose`, não publicada diretamente no host)                                              |
| `frontend` | `npm ci && npm run build` → artefatos em `frontend/dist`                                                                                   |
| `nginx`    | Serve o**build estático**, faz **proxy reverso** para `/api/`, e rota `/.well-known/acme-challenge/` para o **Certbot** |
| `certbot`  | Renovação periódica de certificados**Let’s Encrypt** (volumes montados no Nginx)                                                      |

O `docker-compose-production.yml` mapeia **443** no host; quando os certificados estiverem em `./data/certbot/conf`, inclua no `nginx/default.conf.template` um bloco `server` com `listen 443 ssl` apontando para esses arquivos para servir **HTTPS** após gerar o certificado.

Volumes relevantes:

- Certificados: `./data/certbot/conf` e `./data/certbot/www`
- Template Nginx: `nginx/default.conf.template` (usa `envsubst` com `API_DOMAIN` de `.env.production`)

---

## Infraestrutura na AWS

Visão adotada no projeto:

- **EC2**: hospeda Docker Compose (Nginx + backend + build do frontend + Certbot)
- **RDS (PostgreSQL)**: banco gerenciado; o backend em produção usa `PRODUCTION=True` e variáveis `DB_*` no `backend/config/.env.production`
- **Domínio**: DNS apontando para o IP público da EC2 (registros A/AAAA conforme o provedor)
- **Let’s Encrypt**: **Certbot** no Compose (renovação em loop); emissão inicial costuma ser feita com `certbot certonly` (webroot) apontando para o volume compartilhado com o Nginx

### Security groups

- **EC2**
  - http, https
  - ssh (my IP)
- **RDS**
  - EC2

---

## CI/CD (GitHub Actions)

Pasta: `.github/workflows/`

| Workflow              | Gatilho                      | O que faz                                                                                                         |
| --------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `backend-tests.yml` | push em qualquer branch + PR | Instala dependências com**Pipenv** e roda **pytest** no `backend/`                                 |
| `deploy.yml`        | push na branch**`main`**   | Conecta na**EC2** via SSH, `git pull` e `docker compose -f docker-compose-production.yml up -d --build` |

### Secrets necessários (deploy)

- `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`

---

## Testes

### Backend (pytest)

Docker

```bash
docker compose -f docker-compose.yml run --rm backend pipenv run pytest -q
```

Local

```bash
cd backend
pipenv install --dev
pipenv run pytest -q
# Make sure to set your env vars or update Django DATABASES settings
```

Config: `backend/pytest.ini`

### Frontend (Selenium)

Dependências: `frontend/tests/requirements.txt`

```bash
cd frontend
pipenv install --dev
export FRONTEND_URL="http://127.0.0.1:5173"
pipenv run pytest tests/test_selenium_smoke.py -q
```

Ou, com Node (chama o script Python):

```bash
cd frontend
npm run test:selenium
```

### Build / lint frontend

```bash
cd frontend
npm run build
npm run lint
```

---

## API

Prefixo típico: `https://<seu-dominio>/api/` (em dev: `http://localhost:8000/api/`)

- **Auth**: `registration/`, `login/`, `refresh/`, `logout/`, `user/`
- **Tasks**: `tasks/`, `tasks/<id>/`
- **Categories**: `categories/`, `categories/<id>/`

Contrato também descrito em /api/docs & /api/schema quando em dev

---

## Decisões de design

- **JWT em cookies httpOnly**: reduz exposição a XSS em relação a tokens no `localStorage`.
- **Nginx na frente do Gunicorn**: arquivos estáticos do SPA e proxy para a API sem expor a porta do Gunicorn na internet; TLS com Let’s Encrypt após configurar `listen 443 ssl` no template.
- **React Query**: padroniza carregamento, erros e revalidação após mutações.
- **Organização do frontend**: `services/`, `types/`, `hooks/`, `pages/`, `components/`.
- **RDS separado da EC2**: banco não fica no mesmo disco da aplicação.
