<div align="center">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />

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
| Frontend | React + Vite + TypeScript | Interface do quiz, home e telas do aluno |
| Estilização | Tailwind CSS | Sistema de design consistente |
| Banco de Dados | Firebase Firestore | Usuários, respostas e resultados |
| Autenticação | Firebase Authentication | Login, cadastro, recuperação de senha e controle de perfis |
| Hospedagem | Vercel | Deploy do build React com CDN global |
| Estado Global | React Context API | Sessão, usuário e progresso do quiz |

> O projeto **não possui backend dedicado**. Toda a lógica reside no frontend React, com Firebase como camada de dados e autenticação.

---

## 📁 Estrutura do Repositório

```
Oraculum-BB-Squad04/
├── frontend/                        # Aplicação React + Vite + TypeScript
│   ├── public/
│   │   └── assets/                  # Ícones e imagens estáticas
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── EmployeeDashboard.tsx  # Dashboard do aluno/funcionário
│   │   │   ├── ManagerDashboard.tsx   # Dashboard exclusivo do gestor
│   │   │   ├── LevelingOnboarding.tsx # Tela de introdução ao quiz
│   │   │   ├── QuizView.tsx           # Motor do quiz com nivelamento A/B
│   │   │   └── Result.tsx             # Tela de resultado com nível e temas
│   │   ├── pages/                   # Telas com rota própria
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── Dashboard.tsx        # Roteador de perfil (aluno/gestor)
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Autenticação e estado global do usuário
│   │   ├── services/
│   │   │   └── firebase.ts          # Inicialização do Firebase SDK
│   │   ├── App.tsx                  # Roteamento principal (React Router)
│   │   └── main.tsx
│   ├── .env                         # Variáveis de ambiente — NÃO commitar
│   ├── firebase.json                # Configuração do Firebase Hosting
│   └── package.json
│
├── CONTRIBUTING.md                  # Guia de contribuição do squad
└── README.md
```

---

## 🗄️ Coleções do Firestore

| Coleção | Dados armazenados |
|---|---|
| `users` | Nome, e-mail, role (aluno/gestor), level, leveling_completed |
| `perguntas/{nivel}_{fase}/questoes` | Enunciado, alternativas, resposta correta, explicação, categoria |
| `quiz_attempts` | user_id, score, total_questions, wrong_by_category, completed_at |
| `bonus_questions` | Questões falsas para sorteio aleatório (implementação futura) |
| `bonus_attempts` | Respostas da questão bônus: esperou, acertou, nivel_bonus (implementação futura) |

---

## 👥 Membros do Squad e Divisão de Tarefas

---

### EP01 — Autenticação

#### US01 · Cadastro de novo usuário
**Responsáveis: Jean Silva & João Santino**

| Task | Status |
|---|---|
| Criar tela de cadastro com validação de campos | ✅ Concluído |
| Integrar com Firebase Auth (`createUserWithEmailAndPassword`) | ✅ Concluído |
| Criar documento do usuário no Firestore após registro | ✅ Concluído |
| Redirecionar para home após cadastro bem-sucedido | ✅ Concluído |

#### US02 · Login de usuário existente
**Responsáveis: Jean Silva & João Santino**

| Task | Status |
|---|---|
| Criar tela de login com validação de campos | ✅ Concluído |
| Integrar com Firebase Auth (`signInWithEmailAndPassword`) | ✅ Concluído |
| Redirecionar aluno ou gestor com base no campo `role` do Firestore | ✅ Concluído |
| Exibir botão "Esqueci minha senha" | ✅ Concluído |

#### US03 · Solicitar recuperação de senha
**Responsáveis: Felipe Bento & João Guilherme**

| Task | Status |
|---|---|
| Criar tela de recuperação de senha | ✅ Concluído |
| Integrar com Firebase Auth (`sendPasswordResetEmail`) | ✅ Concluído |
| Criar feedback visual de sucesso/erro | ✅ Concluído |

#### US04 · Redefinir senha
**Responsáveis: Felipe Bento & João Guilherme**

| Task | Status |
|---|---|
| Criar tela de redefinição de senha | ✅ Concluído |
| Integrar com Firebase Auth (reset via link) | ✅ Concluído |
| Redirecionar para login após sucesso | ✅ Concluído |

---

### EP02 — Motor de Quiz

#### US05 · Onboarding do quiz
**Responsáveis: João Paulo Dias & Ivan Roberto**

| Task | Status |
|---|---|
| Criar tela de onboarding (`LevelingOnboarding.tsx`) | ✅ Concluído |
| Integrar navegação para início do quiz | ✅ Concluído |

#### US06 · Iniciar e responder o quiz
**Responsáveis: Kennedy Veras & João Paulo Dias**

| Task | Status |
|---|---|
| Criar motor do quiz com lógica de nivelamento A/B | ✅ Concluído |
| Buscar questões do Firestore (`perguntas/{nivel}_{fase}/questoes`) | ✅ Concluído |
| Exibir barra de progresso por fase | ✅ Concluído |
| Salvar resultado em `quiz_attempts` com `wrong_by_category` | ✅ Concluído |
| Exibir aviso de conexão offline | ✅ Concluído |
| Exibir aviso de velocidade suspeita | ✅ Concluído |
| Confirmação ao tentar sair durante o quiz | ✅ Concluído |

#### US07 · Receber feedback ao responder uma questão
**Responsáveis: Kennedy Veras, João Paulo Dias & Ivan Roberto**

| Task | Status |
|---|---|
| Destacar visualmente resposta correta e incorreta (cores + ícones) | ✅ Concluído |
| Exibir explicação após cada resposta | ✅ Concluído |
| Registrar erros por categoria (`wrong_by_category`) | ✅ Concluído |

---

### EP03 — Resultado e Nível

#### US08 · Visualizar resultado e nível classificado
**Responsáveis: Laiza Maria & Kennedy Veras**

| Task | Status |
|---|---|
| Criar tela de resultado (`Result.tsx`) | ✅ Concluído |
| Exibir nível classificado buscado do Firestore (`users/{uid}`) | ✅ Concluído |
| Exibir temas com mais erros ordenados por frequência | ✅ Concluído |
| Exibir temas na home do funcionário (`EmployeeDashboard.tsx`) | ✅ Concluído |

---

### EP04 — Dashboard do Gestor

#### US09 · Visualizar painel consolidado
**Responsáveis: Laiza Maria & Luís Bezerra**

| Task | Status |
|---|---|
| Criar dashboard do gestor (`ManagerDashboard.tsx`) | ✅ Concluído |
| Exibir total de funcionários, quizzes e acerto médio | ✅ Concluído |
| Gráfico de distribuição por nível (Júnior, Pleno, Sênior) | ✅ Concluído |
| Aba de funcionários com busca e expansão individual | ✅ Concluído |
| Exibir temas com mais erros por funcionário | ✅ Concluído |
| Seção "Assuntos com Maior Dificuldade" na visão geral | ✅ Concluído |
| Exportar relatório em CSV | ✅ Concluído |

---

### EP05 — UX / Home do Usuário

#### US10 · Visualizar home do aluno
**Responsáveis: Laiza Maria & Luís Bezerra**

| Task | Status |
|---|---|
| Criar dashboard do funcionário (`EmployeeDashboard.tsx`) | ✅ Concluído |
| Exibir nome, nível e barra de progresso | ✅ Concluído |
| Exibir status do quiz (pendente/finalizado) | ✅ Concluído |
| Exibir temas para revisar após o quiz | ✅ Concluído |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- npm
- Conta no Firebase (projeto configurado)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/laizalay/Oraculum-BB-Squad04.git

# 2. Entre na pasta do frontend
cd Oraculum-BB-Squad04/frontend

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente (veja seção abaixo)
# Crie um arquivo .env na pasta frontend

# 5. Rode o projeto
npm run dev
```

O projeto estará disponível em `http://localhost:5173`.

---

## 🔥 Configuração do Firebase

O projeto usa Firebase como única camada de backend. Configure:

- **Authentication** — método Email/Senha habilitado
- **Firestore Database** — criado no modo de produção
- **Hosting** — configurado para deploy do build React

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

| Épico | US | Responsáveis | Status |
|---|---|---|---|
| EP01 — Autenticação | US01, US02 | Jean, João Santino | ✅ Concluído |
| EP01 — Autenticação | US03, US04 | Felipe, João Guilherme | ✅ Concluído |
| EP02 — Motor de Quiz | US05 | João Paulo, Ivan | ✅ Concluído |
| EP02 — Motor de Quiz | US06, US07 | Kennedy, João Paulo, Ivan | ✅ Concluído |
| EP03 — Resultado | US08 | Laiza, Kennedy | ✅ Concluído |
| EP04 — Dashboard | US09 | Laiza, Luís Bezerra | ✅ Concluído |
| EP05 — UX / Home | US10 | Laiza, Luís Bezerra | ✅ Concluído |

**Legenda:** ✅ Concluído · 🟡 Em Andamento · ⚪ Não Iniciado

---

## 📦 Entrega Final

| Entrega | Responsável |
|---|---|
| Documentação do MVP | Kennedy Veras |
| Apresentação (Slides) | Laiza Maria |
| Apresentador do Pitch | Luís Bezerra / João Guilherme |
| Drive com arquivos | [Acessar aqui](https://drive.google.com/drive/folders/1-D6OZ2OcvrVrcjw3uOatT1hiOmhH6FXR?usp=sharing) |



<div align="center">

Desenvolvido pelo **Squad 04** · Residência Rise Up 2026.1 · Porto Digital

Patrocinado pelo **Banco do Brasil**

</div>
