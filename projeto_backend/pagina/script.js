// ==========================================
// Configuração da API
// ==========================================
const API_URL = "http://localhost:3000";

// Elementos do DOM
const cardsContainer = document.getElementById("cards-container");
const viewCartBtn = document.getElementById("view-cart-btn");
const checkoutBtn = document.getElementById("checkout-btn");
const carrinhoSection = document.getElementById("carrinho-section");
const carrinhoView = document.getElementById("carrinho-view");
const mensagemStatus = document.getElementById("mensagem-status");

// ==========================================
// Função de Notificações na Tela (UX)
// ==========================================
function mostrarMensagem(texto, tipo = "info") {
  mensagemStatus.textContent = texto;
  mensagemStatus.className = `mensagem-box msg-${tipo}`;
  mensagemStatus.style.display = "block";

  // Scroll suave até a mensagem
  mensagemStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Ocultar automaticamente após 5 segundos
  setTimeout(() => {
    mensagemStatus.style.display = "none";
  }, 5000);
}

// ==========================================
// 1. Carregar Catálogo de Livros (Step 18)
// ==========================================
async function carregarCatalogo() {
  try {
    const res = await fetch(`${API_URL}/livros`);
    if (!res.ok) {
      throw new Error("Não foi possível carregar o catálogo de livros da API.");
    }

    const livros = await res.json();
    cardsContainer.innerHTML = "";

    if (livros.length === 0) {
      cardsContainer.innerHTML = "<p>Nenhum livro disponível no momento.</p>";
      return;
    }

    // Gera os cards dinamicamente a partir dos dados do backend
    livros.forEach((livro) => {
      const cardHtml = `
        <div class="card" id="${livro.id}">
          <div class="card-badge">Destaque</div>
          <h3>${livro.titulo}</h3>
          <p class="autor">Por: <strong>${livro.autor}</strong></p>
          <p class="descricao">${livro.descricao}</p>
          <p class="preco">R$ ${Number(livro.preco).toFixed(2)}</p>
          <button class="btn btn-buy buy-now" data-id="${livro.id}">
            Comprar Agora
          </button>
        </div>
      `;
      cardsContainer.insertAdjacentHTML("beforeend", cardHtml);
    });
  } catch (erro) {
    console.error("Erro ao carregar catálogo:", erro);
    cardsContainer.innerHTML = `
      <div class="erro-conexao">
        <p><strong>Erro de Conexão com o Servidor</strong></p>
        <p>Certifique-se de que a API está rodando na porta 3000 (<code>node app.js</code>).</p>
      </div>
    `;
    mostrarMensagem("A API não está acessível em http://localhost:3000.", "erro");
  }
}

// ==========================================
// 2. Adicionar ao Carrinho via Delegação (Step 18)
// ==========================================
cardsContainer.addEventListener("click", async (evento) => {
  const btn = evento.target.closest(".buy-now");
  if (!btn) return;

  const livroId = btn.dataset.id;
  btn.disabled = true;
  btn.textContent = "Adicionando...";

  try {
    const res = await fetch(`${API_URL}/carrinho`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ livroId, quantidade: 1 }),
    });

    if (!res.ok) {
      const { erro } = await res.json();
      mostrarMensagem(`Erro do servidor: ${erro}`, "erro");
      return;
    }

    const dados = await res.json();
    mostrarMensagem(
      `"${dados.item.titulo}" foi adicionado ao carrinho! Total de itens: ${dados.carrinho.length}`,
      "sucesso"
    );

    // Se o painel do carrinho estiver aberto, atualiza a exibição em tempo real
    if (carrinhoSection.style.display !== "none") {
      renderizarCarrinho(dados.carrinho);
    }
  } catch (erro) {
    console.error("Erro ao adicionar ao carrinho:", erro);
    mostrarMensagem("Falha ao comunicar com a API.", "erro");
  } finally {
    btn.disabled = false;
    btn.textContent = "Comprar Agora";
  }
});

// ==========================================
// 3. Visualizar Carrinho (Step 19)
// ==========================================
async function renderizarCarrinho(carrinhoDados = null) {
  try {
    let itens = carrinhoDados;
    if (!itens) {
      const res = await fetch(`${API_URL}/carrinho`);
      if (!res.ok) throw new Error("Erro ao consultar carrinho");
      itens = await res.json();
    }

    carrinhoView.innerHTML = "";

    if (itens.length === 0) {
      carrinhoView.innerHTML = `
        <div class="carrinho-vazio">
          <p>Seu carrinho está vazio no momento.</p>
        </div>
      `;
      return;
    }

    let tabelaHtml = `
      <table class="tabela-carrinho">
        <thead>
          <tr>
            <th>Livro</th>
            <th>Preço Unitário</th>
            <th>Qtd</th>
            <th>Subtotal</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalGeral = 0;

    itens.forEach((item) => {
      totalGeral += item.subtotal;
      tabelaHtml += `
        <tr>
          <td><strong>${item.titulo}</strong></td>
          <td>R$ ${Number(item.preco).toFixed(2)}</td>
          <td>${item.quantidade}</td>
          <td>R$ ${Number(item.subtotal).toFixed(2)}</td>
          <td>
            <button class="btn-remover" data-id="${item.livroId}" title="Remover item">
              🗑️ Remover
            </button>
          </td>
        </tr>
      `;
    });

    tabelaHtml += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="total-label">Total Geral:</td>
            <td colspan="2" class="total-valor">R$ ${totalGeral.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;

    carrinhoView.innerHTML = tabelaHtml;
  } catch (erro) {
    console.error("Erro ao renderizar carrinho:", erro);
    mostrarMensagem("Não foi possível carregar os itens do carrinho.", "erro");
  }
}

viewCartBtn.addEventListener("click", async () => {
  if (carrinhoSection.style.display === "none") {
    await renderizarCarrinho();
    carrinhoSection.style.display = "block";
    carrinhoSection.scrollIntoView({ behavior: "smooth" });
  } else {
    carrinhoSection.style.display = "none";
  }
});

// ==========================================
// 4. Remover Item do Carrinho (DELETE /carrinho/:id - Step 19)
// ==========================================
carrinhoView.addEventListener("click", async (evento) => {
  const btnRemover = evento.target.closest(".btn-remover");
  if (!btnRemover) return;

  const id = btnRemover.dataset.id;
  btnRemover.disabled = true;

  try {
    const res = await fetch(`${API_URL}/carrinho/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const { erro } = await res.json();
      mostrarMensagem(`Erro ao remover: ${erro}`, "erro");
      return;
    }

    const carrinhoAtualizado = await res.json();
    mostrarMensagem("Item removido com sucesso do carrinho!", "info");
    renderizarCarrinho(carrinhoAtualizado);
  } catch (erro) {
    console.error("Erro na remoção:", erro);
    mostrarMensagem("Falha ao comunicar com a API para remover item.", "erro");
  }
});

// ==========================================
// 5. Finalizar Compra (POST /checkout - Step 19)
// ==========================================
checkoutBtn.addEventListener("click", async () => {
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Processando...";

  try {
    const res = await fetch(`${API_URL}/checkout`, {
      method: "POST",
    });

    // Erro (ex: 400 carrinho vazio): DEVE ser exibido na tela (regra de UX do Step 19)
    if (!res.ok) {
      const { erro } = await res.json();
      mostrarMensagem(`Aviso: ${erro}`, "alerta");
      return;
    }

    const pedido = await res.json();
    mostrarMensagem(
      `🎉 Pedido #${pedido.numero} confirmado com sucesso! Total: R$ ${pedido.total.toFixed(2)}. Obrigado pela preferência!`,
      "sucesso"
    );

    // Limpa a tela do carrinho e atualiza o estado
    renderizarCarrinho([]);
  } catch (erro) {
    console.error("Erro no checkout:", erro);
    mostrarMensagem("Erro de comunicação ao tentar finalizar a compra.", "erro");
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "💳 Finalizar Compra";
  }
});

// ==========================================
// Inicialização ao Carregar a Página
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  carregarCatalogo();
});
