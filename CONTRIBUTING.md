# 📖 Guia de Contribuição — Oraculum BB

> Leia este guia **antes** de mexer em qualquer código.
> Ele foi escrito para ser fácil de entender, mesmo se você nunca usou Git antes.

---

## 🧠 Entendendo a ideia antes de começar

Imagina que o projeto é um **caderno de grupo**.

- A versão oficial do caderno fica no GitHub — chamamos ela de **`main`**.
- Cada pessoa **NÃO pode riscar o caderno original** diretamente.
- Em vez disso, cada um pega uma **folha separada** (chamamos de **branch**), faz seu trabalho lá, e depois cola no caderno oficial quando estiver pronto.

Isso evita que uma pessoa estrague o trabalho da outra. 🙌

---

## 🛠️ Pré-requisitos

Antes de qualquer coisa, verifique se você tem instalado:

| Ferramenta | Para que serve | Link |
|---|---|---|
| **Git** | Controlar versões do código | [git-scm.com](https://git-scm.com) |
| **VS Code** | Editor de código (recomendado) | [code.visualstudio.com](https://code.visualstudio.com) |
| **Node.js 18+** | Rodar o projeto React | [nodejs.org](https://nodejs.org) |

> ✅ Para verificar se o Git está instalado, abra o **Git Bash** e digite `git --version`.
> Se aparecer um número de versão (ex: `git version 2.44.0`), está tudo certo!

---

## 🚀 Passo a Passo Completo

### PASSO 1 — Clonar o repositório
> ⚠️ Faça isso **somente uma vez**, na primeira vez que for trabalhar no projeto.

Abra o **Git Bash** (clique com o botão direito em qualquer pasta → "Git Bash Here") e digite:

```bash
git clone https://github.com/laizalay/Oraculum-BB-Squad04
```

Depois entre na pasta do projeto:

```bash
cd oraculum-bb
```

---

### PASSO 2 — Atualizar antes de começar qualquer coisa
> ⚠️ Faça isso **toda vez** que for começar a trabalhar, mesmo que tenha feito ontem.

```bash
git checkout main
git pull origin main
```

💡 **Por que isso?** Porque enquanto você estava fora, outros membros podem ter enviado código. Se você não atualizar, vai trabalhar numa versão velha.

---

### PASSO 3 — Criar sua branch (sua "folha separada")

Agora crie uma branch com o nome da sua história de usuário (US):

```bash
git checkout -b feat/us01-cadastro
```

> Troque `us01-cadastro` pelo nome da **sua** US. Veja a tabela abaixo. 👇

#### 📋 Tabela de branches por membro

| US | Nome da branch | Responsáveis |
|---|---|---|
| US01 | `feat/us01-cadastro` | Jean, João Santino |
| US02 | `feat/us02-login` | Jean, João Santino |
| US03 | `feat/us03-recuperacao-senha` | Felipe, João Guilherme |
| US04 | `feat/us04-redefinir-senha` | Felipe, João Guilherme |
| US05 | `feat/us05-onboarding` | João Paulo, Ivan |
| US06 | `feat/us06-motor-quiz` | Kennedy, João Paulo |
| US07 | `feat/us07-feedback-questao` | Kennedy, João Paulo, Ivan |
| US08 | `feat/us08-resultado-nivel` | Laiza, Kennedy |
| US09 | `feat/us09-dashboard-gestor` | Laiza, Luís Bezerra |
| US10 | `feat/us10-home-usuario` | Laiza, Luís Bezerra |

---

### PASSO 4 — Fazer suas alterações e salvar (commit)

Depois de codar, você precisa dizer ao Git o que mudou e salvar isso.

**4.1 — Ver o que você alterou:**
```bash
git status
```
> Vai aparecer uma lista de arquivos modificados em vermelho. Normal! 😊

**4.2 — Adicionar os arquivos ao "pacote" de envio:**
```bash
git add .
```
> O ponto (`.`) significa "adiciona tudo que eu alterei". Você pode também adicionar arquivos específicos: `git add src/pages/Login.jsx`

**4.3 — Salvar com uma mensagem explicando o que você fez (commit):**
```bash
git commit -m "feat: tela de cadastro com validação de campos"
```

#### ✏️ Como escrever uma boa mensagem de commit

Use sempre esse formato:

```
tipo: descrição curta do que foi feito
```

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Criou algo novo | `feat: tela de login` |
| `fix` | Corrigiu um erro | `fix: botão não redirecionava` |
| `style` | Só ajustou visual/CSS | `style: cor do botão ajustada` |
| `refactor` | Reorganizou o código sem mudar a função | `refactor: separou componente de card` |
| `docs` | Alterou documentação | `docs: atualiza README` |

> 💡 Escreva a mensagem como se estivesse completando a frase: *"Este commit vai..."*
> ✅ `feat: adicionar tela de cadastro`
> ❌ `mudei coisa` / `arrumei` / `teste`

---

### PASSO 5 — Subir sua branch para o GitHub

```bash
git push origin feat/us01-cadastro
```

> Troque `feat/us01-cadastro` pelo nome da **sua** branch.

---

### PASSO 6 — Abrir o Pull Request (PR)

O Pull Request é o pedido para o seu código entrar na `main`. É aqui que o squad revisa.

**6.1** — Vai para `github.com/SEU_USUARIO/oraculum-bb`

**6.2** — Vai aparecer um aviso amarelo no topo com o botão **"Compare & pull request"**. Clica nele.

**6.3** — Confirma que está assim:
- **base:** `main`
- **compare:** `feat/us01-cadastro` *(sua branch)*

**6.4** — Escreve uma descrição curta do que você fez. Exemplo:
```
Criada a tela de cadastro com validação de campos (nome, e-mail, senha).
Integração com Firebase Auth usando createUserWithEmailAndPassword.
```

**6.5** — Clica em **"Create pull request"** ✅

**6.6** — Avisa no grupo que abriu o PR para alguém revisar.

**6.7** — Após aprovação, clica em **"Merge pull request"** → **"Confirm merge"**.

---

## ⚠️ A Regra de Ouro

```
❌ NUNCA commite diretamente na main.
✅ SEMPRE: branch → push → Pull Request → merge.
```

Commitar na `main` diretamente pode sobrescrever o trabalho de outro membro. Se isso acontecer acidentalmente, avise imediatamente no grupo.

---

## 🔒 Regras de segurança

- **Nunca suba o arquivo `.env`** — ele contém as chaves do Firebase e está no `.gitignore` por isso.
- Se você ver o arquivo `.env` nos arquivos do `git status`, **não faça o commit** e avise no grupo.

---

## ❓ Dúvidas Frequentes

**"Fiz git push mas deu erro de permissão"**
→ Verifique se o responsável pelo repositório te adicionou como colaborador (Settings → Collaborators).

**"Esqueci de criar a branch e fiz alterações na main"**
→ Não commita. Cria a branch agora com `git checkout -b feat/suaUs` — as alterações ainda não salvas vão junto.

**"Dois membros estão mexendo no mesmo arquivo"**
→ Vai acontecer conflito no merge. Avisa no grupo antes para combinar quem mexe em cada arquivo.

**"Comecei ontem mas hoje quando abri deu tudo diferente"**
→ Rodou `git pull origin main` hoje? Se não, faz isso primeiro.

---

## 📁 Onde cada um deve mexer

Para evitar conflito, cada membro fica nos **arquivos da sua US**:

| Pasta | O que tem lá | Quem mexe |
|---|---|---|
| `src/pages/Register.jsx` | Tela de cadastro | Jean, João Santino (US01) |
| `src/pages/Login.jsx` | Tela de login | Jean, João Santino (US02) |
| `src/pages/ForgotPassword.jsx` | Recuperação de senha | Felipe, João Guilherme (US03) |
| `src/pages/ResetPassword.jsx` | Redefinição de senha | Felipe, João Guilherme (US04) |
| `src/pages/Onboarding.jsx` | Tela de onboarding | João Paulo, Ivan (US05) |
| `src/pages/Quiz.jsx` | Motor do quiz | Kennedy, João Paulo (US06) |
| `src/components/Feedback.jsx` | Feedback de questões | Kennedy, João Paulo, Ivan (US07) |
| `src/pages/Result.jsx` | Resultado e nível | Laiza, Kennedy (US08) |
| `src/pages/Dashboard.jsx` | Dashboard do gestor | Laiza, Luís Bezerra (US09) |
| `src/pages/Home.jsx` | Home do usuário | Laiza, Luís Bezerra (US10) |

> Arquivos compartilhados como `firebase.js`, `App.jsx` e `context/` — **combine com o squad antes de alterar**.

---

## 🎨 Identidade Visual (para quem vai codar telas)

| Elemento | Valor |
|---|---|
| Cor primária (fundo/header) | `#1F3864` (azul marinho) |
| Cor de ação (botões) | `#F5C518` (amarelo) |
| Fundo de cards/formulários | `#FFFFFF` (branco) |
| Badge Júnior | Verde |
| Badge Pleno | Azul |
| Badge Sênior | Roxo |
| Fonte | Sans-serif limpa, sem serifa |

---

Feito com 💛 pelo Squad 04 · Rise Up 2026.1 · Porto Digital
