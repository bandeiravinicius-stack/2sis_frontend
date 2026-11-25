# 🎓 Relatório Acadêmico de Conclusão: Workshop Backend XYZ Bookstore

**Aluno:** Vinicius Bandeira  
**Disciplina:** Programação Front-End / Back-End (2SIS)  
**Projeto:** API REST XYZ Bookstore (`projeto_backend`)

---

### Pergunta 1: A evolução do `node:http` puro para o Express (Step 10 e Step 15)

> **Questão:** *Qual dor do `node:http` puro mais chamou atenção/irritou durante a construção inicial, e qual linha exata do Express a eliminou por completo?*

**Resposta:**  
A maior dor na utilização do módulo nativo `node:http` foi a necessidade de acumular chunks de rede assíncronos manualmente para conseguir ler o corpo (body) de requisições POST. Era necessário escutar os eventos `req.on("data")` para concatenar os fragmentos do buffer em uma string, tratar o encerramento em `req.on("end")` e envolver um `JSON.parse` manual em blocos `try/catch`, tudo isso antes mesmo de iniciar as validações de regras de negócio. No Express, toda essa complexidade e aninhamento de callbacks foi apagada por uma única linha de middleware registrada no início da aplicação:
```javascript
app.use(express.json());
```
Essa linha gerencia internamente o fluxo do stream HTTP, executa o parse seguro e entrega o objeto pronto diretamente na propriedade `req.body` para todos os handlers.

---

### Pergunta 2: A independência da arquitetura API-First (Step 6 e Step 18)

> **Questão:** *O que mudou no `app.js` quando a página HTML/JS estática do projeto2 foi conectada à API? O que isso comprova sobre o design da aplicação?*

**Resposta:**  
No `app.js`, não mudou absolutamente **nada**. O servidor continuou expondo os mesmos endpoints e as mesmas estruturas de dados JSON acordadas. Isso comprova o poder do princípio de arquitetura **API-First**: o backend não gera HTML e não se preocupa com como os elementos visuais são dispostos na tela; sua única responsabilidade é servir dados consistentes via protocolo HTTP padronizado. Quando o frontend deixou de ser estático e passou a buscar informações via `fetch()`, a interface se adaptou aos dados sem que o servidor precisasse alterar uma única linha de código.

---

### Pergunta 3: A transição para a Fase 4 (React) (Step 16, Step 17 e Step 19)

> **Questão:** *Quando uma aplicação React (ou qualquer outro framework moderno) for colocada para consumir esta API na porta 5173 (ou outra porta), o que o servidor precisará fazer?*

**Resposta:**  
O servidor precisará fazer exatamente **nada**. A API já está 100% pronta e desacoplada para atender o React por duas razões fundamentais estabelecidas nos passos anteriores:
1. **Configuração de CORS (Step 16):** A inclusão de `app.use(cors())` garante que o navegador autorize requisições cross-origin vindas de qualquer porta ou host diferente (como `http://localhost:5173` do Vite/React).
2. **Contrato de API Estável (Step 17 e Step 19):** O documento `CONTRATO.md` estabeleceu promessas imutáveis (respostas em array, tratamento de erros no padrão `{ erro: "..." }` com status corretos e dados calculados no backend). O desenvolvedor frontend de React programa unicamente orientado ao contrato, garantindo integração imediata e sem atrito.
