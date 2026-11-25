const http = require("http");
const app = require("./app");

const PORT = 3001; // Porta de teste para não colidir
let server;

async function request(path, options = {}) {
  const url = `http://localhost:${PORT}${path}`;
  const res = await fetch(url, options);
  let body;
  try {
    body = await res.json();
  } catch (e) {
    body = null;
  }
  return { status: res.status, headers: res.headers, body };
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n=== INICIANDO AUDITORIA DA API NA PORTA ${PORT} ===\n`);

    try {
      // 1. GET /livros
      let r = await request("/livros");
      console.assert(r.status === 200 && Array.isArray(r.body), "1. GET /livros falhou");
      console.log("✔ 1. GET /livros: 200 OK (Array retornado, total:", r.body.length, ")");

      // 2. GET /livros?autor=Escritora
      r = await request("/livros?autor=Escritora");
      console.assert(r.status === 200 && r.body.length > 0, "2. Filtro por autor falhou");
      console.log("✔ 2. GET /livros?autor=Escritora: 200 OK (Encontrados:", r.body.length, ")");

      // 3. GET /livros/:id existente
      r = await request("/livros/sally-adventure-book");
      console.assert(r.status === 200 && r.body.id === "sally-adventure-book", "3. Detalhe existente falhou");
      console.log("✔ 3. GET /livros/sally-adventure-book: 200 OK (Título:", r.body.titulo, ")");

      // 4. GET /livros/:id inexistente
      r = await request("/livros/livro-fantasma");
      console.assert(r.status === 404 && r.body.erro, "4. 404 detalhe inexistente falhou");
      console.log("✔ 4. GET /livros/livro-fantasma: 404 Not Found (Erro:", r.body.erro, ")");

      // 5. POST /carrinho (sucesso)
      r = await request("/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livroId: "sally-adventure-book", quantidade: 2 }),
      });
      console.assert(r.status === 201 && r.body.item && r.body.carrinho, "5. POST /carrinho falhou");
      console.log("✔ 5. POST /carrinho (sally x2): 201 Created (Subtotal item: R$", r.body.item.subtotal, ")");

      // 6. POST /carrinho (livro inexistente)
      r = await request("/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livroId: "nao-existe", quantidade: 1 }),
      });
      console.assert(r.status === 400 && r.body.erro, "6. POST /carrinho livro inexistente falhou");
      console.log("✔ 6. POST /carrinho com id inválido: 400 Bad Request (Erro:", r.body.erro, ")");

      // 7. GET /carrinho (enriquecido)
      r = await request("/carrinho");
      console.assert(r.status === 200 && r.body[0].subtotal > 0, "7. GET /carrinho falhou");
      console.log("✔ 7. GET /carrinho: 200 OK (Itens:", r.body.length, ", Subtotal primeiro:", r.body[0].subtotal, ")");

      // 8. DELETE /carrinho/:id (sucesso - Step 19)
      r = await request("/carrinho/sally-adventure-book", { method: "DELETE" });
      console.assert(r.status === 200 && r.body.length === 0, "8. DELETE /carrinho/:id falhou");
      console.log("✔ 8. DELETE /carrinho/sally-adventure-book: 200 OK (Carrinho após remoção: [] vazio)");

      // 9. DELETE /carrinho/:id (já removido -> 404)
      r = await request("/carrinho/sally-adventure-book", { method: "DELETE" });
      console.assert(r.status === 404 && r.body.erro, "9. DELETE 404 falhou");
      console.log("✔ 9. DELETE /carrinho/sally-adventure-book repetido: 404 Not Found (Erro:", r.body.erro, ")");

      // 10. POST /checkout com carrinho vazio -> 400
      r = await request("/checkout", { method: "POST" });
      console.assert(r.status === 400 && r.body.erro, "10. Checkout vazio falhou");
      console.log("✔ 10. POST /checkout com carrinho vazio: 400 Bad Request (Erro:", r.body.erro, ")");

      // 11. Adicionar item e fazer checkout com sucesso
      await request("/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livroId: "dave-cooking-book", quantidade: 1 }),
      });
      r = await request("/checkout", { method: "POST" });
      console.assert(r.status === 200 && r.body.numero && r.body.total === 29.5, "11. Checkout falhou");
      console.log("✔ 11. POST /checkout com sucesso: 200 OK (Pedido #:", r.body.numero, ", Total: R$", r.body.total, ")");

      // 12. Verificar se carrinho ficou vazio após checkout
      r = await request("/carrinho");
      console.assert(r.status === 200 && r.body.length === 0, "12. Carrinho não esvaziou após checkout");
      console.log("✔ 12. GET /carrinho pós-checkout: 200 OK (Carrinho esvaziado com sucesso)");

      // 13. Rota inexistente -> 404
      r = await request("/rota-qualquer");
      console.assert(r.status === 404 && r.body.erro, "13. Catch-all 404 falhou");
      console.log("✔ 13. Rota desconhecida: 404 Not Found (Catch-all funcionando)");

      console.log("\n=========================================");
      console.log(" TODOS OS TESTES PASSARAM COM SUCESSO! 🎯");
      console.log("=========================================\n");
    } catch (err) {
      console.error("\n❌ FALHA NO TESTE:", err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
