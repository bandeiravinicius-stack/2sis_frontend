# 📚 2SIS - Front-End & Back-End: XYZ Bookstore

Repositório da disciplina de Front-End e Back-End (2SIS), contendo a implementação completa da API REST e da aplicação client-side da **XYZ Bookstore**.

Desenvolvido por: **Vinicius Bandeira**  
Repositório: [bandeiravinicius-stack/2sis_frontend](https://github.com/bandeiravinicius-stack/2sis_frontend)

---

## 📁 Estrutura do Projeto

```
2sis_frontend/
├── .gitignore
├── README.md
└── projeto_backend/
    ├── app.js               # Servidor Express com todas as rotas da API
    ├── package.json         # Dependências (Express, CORS, Nodemon)
    ├── CONTRATO.md          # Especificação técnica e matriz de auditoria da API
    ├── RELATORIO.md         # Relatório acadêmico com a resolução das questões
    └── pagina/              # Frontend que consome a API (origem independente)
        ├── index.html       # Estrutura visual da livraria
        ├── script.js        # Lógica client-side (fetch, delegação e checkout)
        └── style.css        # Estilos dos cards, carrinho e alertas
```

---

## 🚀 Como Executar o Projeto

### 1. Iniciar a API Backend (Porta 3000)

Abra o terminal na pasta `projeto_backend`:

```bash
cd projeto_backend
npm install
npm start
```
> Para modo de desenvolvimento com recarregamento automático: `npm run dev`

A API estará acessível em: `http://localhost:3000`
- Catálogo: `http://localhost:3000/livros`
- Carrinho: `http://localhost:3000/carrinho`

### 2. Abrir o Frontend (Porta 5500 ou Live Server)

Abra o arquivo `projeto_backend/pagina/index.html` com o **Live Server** do VS Code (ou com `npx serve pagina`):
- O frontend carregará os cards consumindo a API na porta 3000.
- Permite adicionar livros ao carrinho ("Comprar Agora").
- Permite visualizar o carrinho com subtotais calculados no servidor.
- Permite remover itens individualmente via `DELETE /carrinho/:id`.
- Permite finalizar compra (checkout) com emissão de número de pedido e total.

---

## 📜 Contrato e Auditoria

Consulte o arquivo [`projeto_backend/CONTRATO.md`](./projeto_backend/CONTRATO.md) para conferir a especificação detalhada de todos os 8 endpoints e os comandos `curl -i` de validação.
