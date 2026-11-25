const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ==========================================
// Middlewares Globais (Step 15 e Step 16)
// ==========================================
// CORS: permite comunicação entre a página (ex: Live Server na 5500) e a API (3000)
app.use(cors());

// express.json(): faz o parse automático do body para objetos JavaScript
app.use(express.json());

// ==========================================
// Base de Dados em Memória (Catálogo e Estado)
// ==========================================
const livros = [
  {
    id: "sally-adventure-book",
    titulo: "As Aventuras de Sally",
    autor: "A. Escritora",
    descricao: "Esta é uma história épica de Sally e seu cão Rex navegando por outros mundos.",
    preco: 39.9,
  },
  {
    id: "dave-cooking-book",
    titulo: "A Cozinha do Dave",
    autor: "D. Chef",
    descricao: "Esta é a história de Dave aprendendo a cozinhar de tudo, de panquecas a massas, uma receita por vez.",
    preco: 29.5,
  },
  {
    id: "tech-future-book",
    titulo: "O Futuro da Tecnologia",
    autor: "Ada Lovelace",
    descricao: "Uma visão profunda sobre o impacto da computação e algoritmos no futuro da humanidade.",
    preco: 45.0,
  },
];

// O carrinho armazena apenas a referência e quantidade { livroId, quantidade }
const carrinho = [];

// Histórico de pedidos finalizados após o checkout
const pedidos = [];

// ==========================================
// Funções Auxiliares
// ==========================================
// Realiza o join entre o carrinho e o catálogo, calculando o subtotal no servidor
function enriquecerItens(listaCarrinho) {
  return listaCarrinho.map((item) => {
    const livro = livros.find((l) => l.id === item.livroId);
    return {
      livroId: item.livroId,
      quantidade: item.quantidade,
      titulo: livro ? livro.titulo : "Livro Desconhecido",
      autor: livro ? livro.autor : "Autor Desconhecido",
      preco: livro ? livro.preco : 0,
      subtotal: livro ? Number((livro.preco * item.quantidade).toFixed(2)) : 0,
    };
  });
}

// ==========================================
// Rotas do Catálogo de Livros (Steps 06, 07 e 14)
// ==========================================

// 1. GET /livros (suporta filtro opcional ?autor=...)
app.get("/livros", (req, res) => {
  const { autor } = req.query;
  if (autor) {
    const filtrados = livros.filter((l) =>
      l.autor.toLowerCase().includes(autor.toLowerCase())
    );
    return res.status(200).json(filtrados);
  }
  return res.status(200).json(livros);
});

// 2. GET /livros/:id (detalhe de um livro específico)
app.get("/livros/:id", (req, res) => {
  const livro = livros.find((l) => l.id === req.params.id);
  if (!livro) {
    return res.status(404).json({ erro: "livro não encontrado" });
  }
  return res.status(200).json(livro);
});

// ==========================================
// Rotas do Carrinho de Compras (Steps 08, 10, 15 e 19)
// ==========================================

// 3. GET /carrinho (retorna os itens enriquecidos com subtotal)
app.get("/carrinho", (req, res) => {
  return res.status(200).json(enriquecerItens(carrinho));
});

// 4. POST /carrinho (adiciona item validado)
app.post("/carrinho", (req, res) => {
  const { livroId, quantidade } = req.body;

  // Validação 1: campos obrigatórios
  if (!livroId || quantidade === undefined || quantidade === null) {
    return res.status(400).json({ erro: "faltam campos: livroId, quantidade" });
  }

  // Validação 2: livro deve existir no catálogo
  const livro = livros.find((l) => l.id === livroId);
  if (!livro) {
    return res.status(400).json({ erro: "livro inexistente: " + livroId });
  }

  // Validação 3: quantidade deve ser inteiro positivo
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: "quantidade deve ser inteiro positivo" });
  }

  // Atualiza ou insere o item no carrinho
  const itemExistente = carrinho.find((item) => item.livroId === livroId);
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({ livroId, quantidade });
  }

  // Item enriquecido para resposta imediata ao cliente (sem necessidade de outro GET)
  const itemEnriquecido = {
    livroId,
    quantidade,
    titulo: livro.titulo,
    preco: livro.preco,
    subtotal: Number((livro.preco * quantidade).toFixed(2)),
  };

  return res.status(201).json({
    item: itemEnriquecido,
    carrinho: enriquecerItens(carrinho),
  });
});

// 5. DELETE /carrinho/:id (Desafio Final - Step 19)
// Remove um item do carrinho pelo livroId
app.delete("/carrinho/:id", (req, res) => {
  const { id } = req.params;
  const index = carrinho.findIndex((item) => item.livroId === id);

  if (index === -1) {
    return res.status(404).json({ erro: "item não encontrado no carrinho: " + id });
  }

  // Remove o item preservando a referência do array
  carrinho.splice(index, 1);

  return res.status(200).json(enriquecerItens(carrinho));
});

// ==========================================
// Rotas de Checkout e Pedidos (Step 10 e Step 19)
// ==========================================

// 6. POST /checkout (converte carrinho em pedido e zera o carrinho)
app.post("/checkout", (req, res) => {
  if (carrinho.length === 0) {
    return res.status(400).json({ erro: "carrinho vazio: nada para fechar" });
  }

  const itens = enriquecerItens(carrinho);
  const total = itens.reduce((soma, item) => soma + item.subtotal, 0);

  const pedido = {
    numero: Date.now(),
    itens,
    total: Number(total.toFixed(2)),
  };

  pedidos.push(pedido);

  // Esvazia o array preservando sua referência em memória
  carrinho.length = 0;

  return res.status(200).json(pedido);
});

// 7. GET /pedidos (histórico de vendas)
app.get("/pedidos", (req, res) => {
  return res.status(200).json(pedidos);
});

// ==========================================
// Rota Catch-All 404 (Step 14)
// Deve sempre vir DEPOIS de todas as rotas conhecidas
// ==========================================
app.use((req, res) => {
  return res.status(404).json({ erro: "rota inexistente" });
});

// ==========================================
// Middleware de Tratamento de Erro (Step 15)
// 4 parâmetros (err, req, res, next) identificam o handler de erro do Express
// ==========================================
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "corpo nao e JSON valido" });
  }
  return res.status(500).json({ erro: "falha interna no servidor" });
});

// ==========================================
// Inicialização do Servidor
// ==========================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` API da Livraria XYZ iniciada com sucesso!`);
    console.log(` Endereço: http://localhost:${PORT}`);
    console.log(` Catálogo: http://localhost:${PORT}/livros`);
    console.log(` Carrinho: http://localhost:${PORT}/carrinho`);
    console.log(`=========================================`);
  });
}

module.exports = app;
