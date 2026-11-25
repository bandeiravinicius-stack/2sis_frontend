# 📜 Contrato de Especificação e Auditoria da API: XYZ Bookstore

> **Documento Oficial de Contrato (Steps 17 & 19)**  
> Este documento congela as regras de comunicação entre o backend (Node.js/Express) e os clientes frontend (HTML/JS puro ou React).

---

## 🎯 Promessas Estruturais do Contrato

1. **Listas são sempre arrays:** Mesmo que vazias ou com apenas 1 item, rotas de listagem devolvem `[]`. O frontend pode utilizar `.map` e `.filter` diretamente sem risco de exceções.
2. **Erros são sempre JSON estruturado:** Todo erro responde com formato `{ "erro": "mensagem explicativa" }` e status HTTP adequado (400, 404, 500), nunca em HTML ou texto puro.
3. **Dados calculados no servidor:** Valores de `subtotal` e `total` são computados exclusivamente no backend para garantir integridade e segurança.

---

## 📊 Matriz do Contrato de Endpoints

| # | Rota | Método | Body (JSON) | Sucesso (Status + Retorno) | Erros Tratados | Auditoria |
|---|------|--------|-------------|----------------------------|----------------|-----------|
| **1** | `/livros` | `GET` | — | `200` `[{ id, titulo, autor, descricao, preco }]` | — | ✔ Auditado |
| **2** | `/livros?autor=X` | `GET` | — | `200` `[{ livro }]` (ou `[]` se nenhum match) | — | ✔ Auditado |
| **3** | `/livros/:id` | `GET` | — | `200` `{ livro }` | `404` `{ "erro": "livro não encontrado" }` | ✔ Auditado |
| **4** | `/carrinho` | `GET` | — | `200` `[{ livroId, quantidade, titulo, autor, preco, subtotal }]` | — | ✔ Auditado |
| **5** | `/carrinho` | `POST` | `{ "livroId": string, "quantidade": int }` | `201` `{ "item": { ... }, "carrinho": [ ... ] }` | `400` campos ausentes, livro inexistente ou quantidade <= 0 | ✔ Auditado |
| **6** | `/carrinho/:id` | `DELETE` | — | `200` `[{ carrinho restante enriquecido }]` | `404` `{ "erro": "item não encontrado no carrinho: <id>" }` | ✔ Auditado |
| **7** | `/checkout` | `POST` | — | `200` `{ "numero": timestamp, "itens": [ ... ], "total": number }` | `400` `{ "erro": "carrinho vazio: nada para fechar" }` | ✔ Auditado |
| **8** | `/pedidos` | `GET` | — | `200` `[{ pedido }]` | — | ✔ Auditado |
| **9** | *(qualquer outra)* | `*` | — | — | `404` `{ "erro": "rota inexistente" }` | ✔ Auditado |

---

## ⚖️ Defesa Técnica: Status 404 no DELETE /carrinho/:id (Step 19)

* **Escolha:** Foi adotado o status HTTP **`404 Not Found`** quando o `livroId` não está presente no carrinho.
* **Justificativa:** O identificador `:id` fornecido na rota é a chave de localização do recurso específico que o cliente deseja remover. Se o recurso não existe na coleção atual do carrinho, o recurso não foi encontrado (`404`), preservando a semântica canônica do padrão REST (diferente de `400 Bad Request`, que indica parâmetros com formato ou sintaxe inválida no corpo da requisição).

---

## 🧪 Bateria de Testes de Auditoria (curl -i)

Execute a sequência abaixo no terminal para validar todos os comportamentos e códigos de status:

```bash
# 1. Listar livros (esperado: 200 OK com array)
curl -i http://localhost:3000/livros

# 2. Filtrar por autor existente (esperado: 200 OK com array filtrado)
curl -i "http://localhost:3000/livros?autor=Writer"

# 3. Filtrar por autor inexistente (esperado: 200 OK com array vazio [])
curl -i "http://localhost:3000/livros?autor=ninguem"

# 4. Detalhe de livro existente (esperado: 200 OK com objeto do livro)
curl -i http://localhost:3000/livros/sally-adventure-book

# 5. Detalhe de livro inexistente (esperado: 404 Not Found em JSON)
curl -i http://localhost:3000/livros/livro-fantasma

# 6. Adicionar ao carrinho (esperado: 201 Created com item e carrinho enriquecidos)
curl -i -X POST http://localhost:3000/carrinho \
  -H "content-type: application/json" \
  -d '{"livroId": "sally-adventure-book", "quantidade": 2}'

# 7. Adicionar com livro inexistente (esperado: 400 Bad Request em JSON)
curl -i -X POST http://localhost:3000/carrinho \
  -H "content-type: application/json" \
  -d '{"livroId": "inexistente", "quantidade": 1}'

# 8. Ver carrinho enriquecido (esperado: 200 OK com itens e subtotais calculados)
curl -i http://localhost:3000/carrinho

# 9. Remover item do carrinho (esperado: 200 OK com carrinho atualizado)
curl -i -X DELETE http://localhost:3000/carrinho/sally-adventure-book

# 10. Remover item já removido (esperado: 404 Not Found)
curl -i -X DELETE http://localhost:3000/carrinho/sally-adventure-book

# 11. Checkout com carrinho vazio (esperado: 400 Bad Request)
curl -i -X POST http://localhost:3000/checkout

# 12. Adicionar item novamente e fechar checkout (esperado: 200 OK com numero e total)
curl -X POST http://localhost:3000/carrinho -H "content-type: application/json" -d '{"livroId": "dave-cooking-book", "quantidade": 1}'
curl -i -X POST http://localhost:3000/checkout

# 13. Conferir se carrinho foi esvaziado após checkout (esperado: 200 OK com [])
curl -i http://localhost:3000/carrinho

# 14. Rota inexistente (esperado: 404 Not Found em JSON)
curl -i http://localhost:3000/rota-invalida
```
