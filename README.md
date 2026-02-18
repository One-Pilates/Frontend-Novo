# One Pilates — Frontend 🎨

## 📌 Introdução
O **One Pilates Frontend** é a interface do sistema de gerenciamento de agendamentos do estúdio One Pilates.

A aplicação foi desenvolvida em **React com Vite**, oferecendo uma experiência moderna, intuitiva e responsiva para **administradores, professores e secretárias**.

---

## 🛠 Tecnologias
- React  
- Vite
- Jest (Testes)
- ESLint + Prettier (Code Quality)
- Husky (Pre-commit hooks)

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite" alt="Frontend Skills" />
</div>

---

## ⚙️ Instalação

```bash
# Entrar no frontend
cd one-pilates/frontend

# Instalar dependências
npm install

# Rodar o projeto
npm run dev
```

---

## 🧪 Testes e Qualidade de Código

### Scripts Disponíveis
```bash
npm test              # Roda todos os testes (6-8 segundos)
npm run lint          # Verifica erros de código
npm run lint:fix      # Corrige erros automaticamente
npm run format        # Formata o código
```

### Pre-commit Automático
Antes de cada commit, o sistema automaticamente:
- ✨ Formata os arquivos modificados (Prettier)
- 🔍 Corrige erros de lint (ESLint)
- ✅ Roda os testes principais

**Regras de Qualidade:**
- ❌ Bloqueia `console.log` e `console.warn` (permite apenas `console.error`)
- ❌ Bloqueia variáveis não utilizadas
- ❌ Bloqueia `debugger` e `alert()`

---

## 🚀 Uso

Após iniciar o projeto:

Aplicação disponível em: http://localhost:5173

📄 Licença

Este projeto é distribuído sob a licença MIT.

