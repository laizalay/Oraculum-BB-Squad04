<div align="center">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />

# 🛡️ Oraculum BB

**Plataforma de quiz interativo para avaliação de conhecimento em cibersegurança**

Residência em Software & IA — Rise Up 2026.1 · Porto Digital · Squad 04

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Membros do Squad e Divisão de Tarefas](#-membros-do-squad-e-divisão-de-tarefas)
  - [EP01 — Autenticação](#ep01--autenticação)
  - [EP02 — Motor de Quiz](#ep02--motor-de-quiz)
  - [EP03 — Resultado e Nível](#ep03--resultado-e-nível)
  - [EP04 — Dashboard do Gestor](#ep04--dashboard-do-gestor)
  - [EP05 — Acessibilidade e UX](#ep05--acessibilidade-e-ux)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Status do Projeto](#-status-do-projeto)

---

## 📌 Sobre o Projeto

O **Oraculum BB** é uma plataforma de quiz interativo que avalia o conhecimento em cibersegurança do usuário e classifica seu nível em **Júnior, Pleno ou Sênior**, orientando sua evolução com feedback imediato.

O sistema atende dois perfis de usuário:

- **Aluno / Funcionário** — realiza o quiz, recebe classificação e acompanha seus pontos de melhoria.
- **Gestor de TI** — acessa um dashboard com visão consolidada de toda a equipe: distribuição por nível, temas com mais erros e desempenho individual de cada funcionário.

A classificação é feita por uma lógica de nivelamento progressivo (fases A/B por nível), sem uso de IA em produção. Ferramentas de IA foram utilizadas exclusivamente no processo de desenvolvimento.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend | React + Vite | Interface do quiz, home e telas do aluno |
| Estilização | Tailwind CSS | Sistema de design consistente |
| Banco de Dados | Firebase Firestore | Usuários, respostas e resultados |
| Autenticação | Firebase Authentication | Login, cadastro, recuperação de senha e controle de perfis |
| Hospedagem | Firebase Hosting | Deploy do build React com CDN global |
| Estado Global | React Context API | Sessão, usuário e progresso do quiz |

> O projeto **não possui backend dedicado**. Toda a lógica reside no frontend React, com Firebase como camada de dados e autenticação via Firestore Security Rules.

---

## 📁 Estrutura do Repositório

```
oraculum-bb/
├── frontend/                        # Aplicação React + Vite
│   ├── public/
│   │   └── assets/                  # Ícones e imagens estáticas
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis (Button, Card, Badge...)
│   │   ├── pages/                   # Telas da aplicação
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Result.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Dashboard.jsx        # Exclusivo para o perfil gestor
│   │   ├── context/                 # React Context (AuthContext, QuizContext)
│   │   ├── hooks/                   # Hooks customizados (useAuth, useQuiz...)
│   │   ├── services/
│   │   │   └── firebase.js          # Inicialização do Firebase SDK
│   │   ├── utils/                   # Funções auxiliares (classifyLevel, formatScore...)
│   │   ├── App.jsx                  # Roteamento principal (React Router)
│   │   └── main.jsx
│   ├── .env                         # Variáveis de ambiente (chaves Firebase) — NÃO commitar
│   ├── firebase.json                # Configuração do Firebase Hosting
│   └── package.json
│
└── README.md
```

---

## 👥 Membros do Squad e Divisão de Tarefas

A divisão segue os épicos e histórias de usuário definidos no backlog do projeto. Cada membro é responsável pelas tasks listadas abaixo — o status reflete o progresso registrado no Notion.

---

### EP01 — Autenticação

#### US01 · Cadastro de novo usuário
**Responsáveis: Jean Silva & João Santino**

| Task | Status |
|---|---|
| Criar tela de cadastro com validação de campos no frontend | ✅ Concluído |
| Validar unicidade de e-mail via Firebase Authentication | ✅ Concluído |
| Usar Firebase Auth SDK para criar o usuário (`createUserWithEmailAndPassword`) | ✅ Concluído |
| Redirecionar para home após cadastro bem-sucedido | ✅ Concluído |
| Exibir mensagem de boas-vindas no primeiro acesso | ✅ Concluído |

---

#### US02 · Login de usuário existente
**Responsáveis: Jean Silva & João Santino**

| Task | Status |
|---|---|
| Criar tela de login com validação de campos | ✅ Concluído |
| Usar Firebase Auth SDK para login (`signInWithEmailAndPassword`) | ✅ Concluído |
| Verificar custom claim de perfil (aluno/gestor) após login | 🟡 Em Andamento |
| Redirecionar aluno para home e gestor para dashboard com base no perfil | 🟡 Em Andamento |
| Exibir botão "Esqueci minha senha" na tela de login | ✅ Concluído |

---

#### US03 · Solicitar recuperação de senha
**Responsáveis: Felipe Bento & João Guilherme**

| Task | Status |
|---|---|
| Criar tela de recuperação de senha | ✅ Concluído |
| Integrar com Firebase Auth (`sendPasswordResetEmail`) | ✅ Concluído |
| Criar feedback visual de sucesso/erro | ✅ Concluído |
| Validar campo de e-mail no frontend | 🟡 Em Andamento |

---

#### US04 · Redefinir senha
**Responsáveis: Felipe Bento & João Guilherme**

| Task | Status |
|---|---|
| Criar tela de redefinição de senha | ✅ Concluído |
| Integrar com Firebase Auth (reset via link) | ✅ Concluído |
| Validar token de redefinição | 🟡 Em Andamento |
| Implementar validação de senha no frontend | 🟡 Em Andamento |
| Redirecionar para login após sucesso | 🟡 Em Andamento |
| Exibir mensagem de erro para link inválido/expirado | 🟡 Em Andamento |

---

### EP02 — Motor de Quiz

#### US05 · Onboarding do quiz
**Responsáveis: João Paulo Dias & Ivan Roberto**

| Task | Status |
|---|---|
| Criar tela de onboarding | ✅ Concluído |
| Criar componentes informativos (cards de benefícios) | ⚪ Não Iniciado |
| Integrar navegação para início do quiz | ✅ Concluído |
| Botão único "Começar Quiz" — usuário só avança ao clicar | ✅ Concluído |

---

#### US06 · Iniciar e responder o quiz
**Responsáveis: Kennedy Veras & João Paulo Dias**

| Task | Status |
|---|---|
| Criar tela de pergunta com componente de múltipla escolha | ✅ Concluído |
| Exibir barra ou contador de progresso | ✅ Concluído |
| Armazenar respostas localmente durante o quiz (React state) | ✅ Concluído |
| Buscar questões diretamente do Firestore (coleção `questions`) | ✅ Concluído |
| Salvar respostas no Firestore ao finalizar o quiz | ✅ Concluído |
| Exibir confirmação ao sair; salvar estado parcial no localStorage | ✅ Concluído |
| Exibir banner de aviso em caso de perda de conexão durante o quiz | ✅ Concluído |
| Garantir mínimo de 10 questões por nível antes do lançamento | ✅ Concluído |
| Exibir aviso ao usuário caso respostas sejam submetidas em velocidade suspeita | ✅ Concluído |

---

#### US07 · Receber feedback ao errar uma questão
**Responsáveis: Kennedy Veras, João Paulo Dias & Ivan Roberto**

| Task | Status |
|---|---|
| Criar componente de feedback de questão (certo/errado + explicação) | ✅ Concluído |
| Incluir campo `explicação` no modelo de dados das perguntas | ✅ Concluído |
| Exibir resumo de acertos/erros por questão na tela de resultado | ✅ Concluído |
| Diferenciar visualmente respostas certas e erradas (cores e ícones) | ✅ Concluído |

---

### EP03 — Resultado e Nível

#### US08 · Visualizar resultado e nível classificado
**Responsáveis: Laiza Maria & Kennedy Veras**

| Task | Status |
|---|---|
| Criar lógica de classificação (Nivelamento A/B) | ✅ Concluído |
| Criar tela de resultado com exibição do nível e breakdown por tema | ⚪ Não Iniciado |
| Salvar resultado no Firestore (coleção `quiz_results`) via SDK client-side | ✅ Concluído |
| Criar componente visual de nível (badge/ícone por classificação) | ⚪ Não Iniciado |
| Exibir sugestões de melhoria associadas a cada tema | ⚪ Não Iniciado |
| Organizar temas por prioridade (maior número de erros primeiro) | ⚪ Não Iniciado |
| Resultado salvo no histórico do usuário automaticamente | ✅ Concluído |

---

### EP04 — Dashboard do Gestor

#### US09 · Visualizar painel consolidado de todos os usuários
**Responsáveis: Laiza Maria & Luís Bezerra**

| Task | Status |
|---|---|
| Criar tela de dashboard exclusiva para o perfil gestor | ⚪ Não Iniciado |
| Buscar dados agregados via Firestore (`onSnapshot()` para tempo real) | ⚪ Não Iniciado |
| Criar componentes de gráfico (distribuição de níveis, temas críticos) | ⚪ Não Iniciado |
| Verificar custom claim de gestor via Firebase Auth antes de exibir o dashboard | ⚪ Não Iniciado |
| Criar aba com lista de funcionários e seus desempenhos individuais | ⚪ Não Iniciado |

---

### EP05 — Acessibilidade e UX

#### US10 · Visualizar home do aluno/funcionário
**Responsáveis: Laiza Maria & Luís Bezerra**

| Task | Status |
|---|---|
| Criar tela Home do usuário | ⚪ Não Iniciado |
| Integrar com dados do Firestore (resultado do quiz) | ⚪ Não Iniciado |
| Criar componente de lista de melhorias | ⚪ Não Iniciado |
| Criar barra de progresso | ⚪ Não Iniciado |
| Listar principais pontos de melhoria com descrição | ⚪ Não Iniciado |
| Layout responsivo e organizado em cards | ⚪ Não Iniciado |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Firebase (projeto configurado)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/squad04-riseup/oraculum-bb.git
cd oraculum-bb/frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (veja seção abaixo)
cp .env.example .env

# 4. Rode o projeto em desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`.

### Build para produção

```bash
npm run build
```

---

## 🔥 Configuração do Firebase

O projeto usa Firebase como única camada de backend. Antes de rodar, é necessário ter um projeto Firebase configurado com:

- **Authentication** — método Email/Senha habilitado
- **Firestore Database** — criado no modo de produção
- **Hosting** — configurado para deploy do build React

### Coleções do Firestore

| Coleção | Dados |
|---|---|
| `users` | Perfil do usuário: nome, e-mail, perfil (aluno/gestor), nível atual |
| `questions` | Enunciado, alternativas, resposta correta, explicação, nível e categoria |
| `quiz_results` | userId, data, score geral, score por categoria, nível classificado |

### Firestore Security Rules

As regras de segurança garantem que:
- Alunos leem e escrevem **apenas seus próprios dados**
- Gestores têm acesso de leitura a **todos os dados**
- O papel do usuário (aluno/gestor) é definido via **custom claims** no token Firebase

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na pasta `/frontend` com as chaves do seu projeto Firebase. **Nunca commite este arquivo.**

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

---

## 📊 Status do Projeto

**Entrega Parcial** — prazo 27/04/2026

| Épico | US | Responsáveis | Status Geral |
|---|---|---|---|
| EP01 — Autenticação | US01, US02 | Jean, João Santino | 🟡 Em Andamento |
| EP01 — Autenticação | US03, US04 | Felipe, João Guilherme | 🟡 Em Andamento |
| EP02 — Motor de Quiz | US05 | João Paulo, Ivan | 🟡 Em Andamento |
| EP02 — Motor de Quiz | US06, US07 | Kennedy, João Paulo, Ivan | ✅ Concluído |
| EP03 — Resultado | US08 | Laiza, Kennedy | 🟡 Em Andamento |
| EP04 — Dashboard | US09 | Laiza, Luís Bezerra | ⚪ Não Iniciado |
| EP05 — UX / Home | US10 | Laiza, Luís Bezerra | ⚪ Não Iniciado |

**Legenda:** ✅ Concluído · 🟡 Em Andamento · ⚪ Não Iniciado

---

<div align="center">

Desenvolvido pelo **Squad 04** · Residência Rise Up 2026.1 · Porto Digital

Patrocinado pelo **Banco do Brasil**

</div>
