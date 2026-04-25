# TaskFlow — Gerenciador de Tarefas 📝✨

TaskFlow é uma aplicação moderna e completa de Lista de Tarefas (To-Do List), construída com React e integrada ao Supabase. Ela oferece um design premium com *glassmorphism*, modo noturno (dark mode) nativo, e proteção de dados a nível de usuário.

## 🚀 Funcionalidades Principais

- **Autenticação Segura:** Sistema completo de Login e Cadastro utilizando o Supabase Auth.
- **Privacidade de Dados:** Configuração de *Row Level Security (RLS)* garantindo que cada usuário acesse apenas as suas próprias tarefas.
- **Operações CRUD:** Crie, leia, atualize, alterne o status (pendente/concluída) e exclua tarefas em tempo real.
- **Interface Premium:** Design luxuoso e animado com Tailwind CSS e componentes no estilo *glassmorphism*.
- **Filtros e Buscas:** Encontre suas tarefas rapidamente pesquisando por título, ou filtrando por *Todas*, *Pendentes* e *Concluídas*.
- **Categorização:** Organize sua vida em categorias (*Trabalho*, *Pessoal*, *Estudos*, *Saúde*, *Financeiro*).
- **Indicadores de Desempenho:** Painel com estatísticas rápidas do seu nível de produtividade.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (Autenticação e Banco de Dados PostgreSQL)
- **Manipulação de Datas:** [date-fns](https://date-fns.org/)

## 📦 Como rodar o projeto localmente

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado na sua máquina (versão 18+ recomendada).

### 2. Instalação

Clone este repositório e acesse a pasta do projeto:
```bash
git clone https://github.com/dl7255971-debug/Sitetarefas.git
cd Sitetarefas
```

Instale as dependências:
```bash
npm install
```

### 3. Configuração do Supabase
As credenciais do Supabase já estão configuradas no arquivo `src/utils/supabase.js`.
Caso você queira rodar o projeto em seu próprio servidor Supabase, basta alterar a `supabaseUrl` e a `supabaseKey` no arquivo mencionado.

Lembre-se de criar a tabela `tasks` no Supabase com o seguinte SQL:
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  "dueDate" TEXT,
  completed BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política de segurança
CREATE POLICY "Users can manage their own tasks" 
  ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 4. Executando

Para rodar o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse no seu navegador através do link gerado (geralmente `http://localhost:5173`).

## 👨‍💻 Contribuindo

Sinta-se livre para clonar, realizar *fork* e mandar *Pull Requests* para melhorias!

---
Desenvolvido com 💙 e muito foco na produtividade!
