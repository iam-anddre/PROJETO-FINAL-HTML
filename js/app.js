/* ---------- ESTADO (salvo no localStorage) ---------- */
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || []; // [{ id, qtd }]
let pedidos  = JSON.parse(localStorage.getItem("pedidos"))  || []; // [{ numero, data, itens, total }]

function salvar() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buscarProduto(id) {
  return produtos.find(p => p.id === id);
}

/* ---------- CARDÁPIO ---------- */
function renderHero() {
  const destaques = produtos.filter(p => p.destaque);
  document.getElementById("hero").innerHTML = destaques.map(p => `
    <a class="hero-item" href="#produto-${p.id}">
      <img src="${p.foto}" alt="${p.nome}">
      <span>${p.nome}</span>
    </a>`).join("");
}

function renderCategoriasNav() {
  document.getElementById("categorias").innerHTML = categorias.map(c =>
    `<a href="#cat-${c.id}">${c.nome}</a>`).join("");
}

function renderCardapio() {
  document.getElementById("lista-produtos").innerHTML = categorias.map(c => `
    <section class="categoria" id="cat-${c.id}">
      <h2>${c.nome}</h2>
      ${produtos.filter(p => p.categoria === c.id).map(p => `
        <article class="card" id="produto-${p.id}">
          <img src="${p.foto}" alt="${p.nome}" loading="lazy">
          <h3>${p.nome}</h3>
          <p>${p.descricao}</p>
          <div class="card-rodape">
            <span class="preco">${formatarPreco(p.preco)}</span>
            <button data-acao="add" data-id="${p.id}" aria-label="Adicionar ${p.nome}">+</button>
          </div>
        </article>`).join("")}
    </section>`).join("");
}

/* ---------- CARRINHO ---------- */
function adicionar(id) {
  const item = carrinho.find(i => i.id === id);
  if (item) item.qtd++;
  else carrinho.push({ id: id, qtd: 1 });
  atualizarCarrinho();
}

function alterarQtd(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) carrinho = carrinho.filter(i => i.id !== id);
  atualizarCarrinho();
}

function calcularTotal() {
  let total = 0;
  carrinho.forEach(i => { total += buscarProduto(i.id).preco * i.qtd; });
  return total;
}

function atualizarCarrinho() {
  salvar();
  const container = document.getElementById("itens-carrinho");

  if (carrinho.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio. Volte ao cardápio e toque no + para adicionar.</p>";
  } else {
    container.innerHTML = carrinho.map(i => {
      const p = buscarProduto(i.id);
      return `
        <div class="item-carrinho">
          <span>${p.nome}</span>
          <span>${formatarPreco(p.preco * i.qtd)}</span>
          <div class="qtd">
            <button data-acao="menos" data-id="${p.id}">-</button>
            <span>${i.qtd}</span>
            <button data-acao="mais" data-id="${p.id}">+</button>
          </div>
        </div>`;
    }).join("");
  }

  document.getElementById("total-carrinho").textContent = formatarPreco(calcularTotal());

  const qtdTotal = carrinho.reduce((soma, i) => soma + i.qtd, 0);
  const badge = document.getElementById("badge");
  badge.textContent = qtdTotal;
  badge.classList.toggle("hidden", qtdTotal === 0);
}

/* ---------- PEDIDOS ---------- */
function finalizarPedido() {
  if (carrinho.length === 0) return;
  pedidos.unshift({
    numero: pedidos.length + 1,
    data: new Date().toLocaleString("pt-BR"),
    itens: carrinho.map(i => ({ nome: buscarProduto(i.id).nome, qtd: i.qtd })),
    total: calcularTotal()
  });
  carrinho = [];
  atualizarCarrinho();
  renderPedidos();
  trocarTela("pedidos");
}

function renderPedidos() {
  const container = document.getElementById("lista-pedidos");
  if (pedidos.length === 0) {
    container.innerHTML = "<p>Você ainda não fez nenhum pedido.</p>";
    return;
  }
  container.innerHTML = pedidos.map(p => `
    <div class="pedido">
      <strong>Pedido #${p.numero}</strong> <small>${p.data}</small>
      <ul>${p.itens.map(i => `<li>${i.qtd}x ${i.nome}</li>`).join("")}</ul>
      <strong>${formatarPreco(p.total)}</strong>
    </div>`).join("");
}

/* ---------- NAVEGAÇÃO ENTRE TELAS ---------- */
function trocarTela(nome) {
  document.querySelectorAll(".tela").forEach(t => t.classList.add("hidden"));
  document.getElementById("tela-" + nome).classList.remove("hidden");
  document.querySelectorAll(".abas button").forEach(b =>
    b.classList.toggle("ativa", b.dataset.tela === nome));
  window.scrollTo(0, 0);
}

/* ---------- EVENTOS (um único listener para todos os cliques) ---------- */
document.addEventListener("click", e => {
  const aba = e.target.closest("[data-tela]");
  if (aba) return trocarTela(aba.dataset.tela);

  const botao = e.target.closest("[data-acao]");
  if (!botao) return;
  const id = Number(botao.dataset.id);

  if (botao.dataset.acao === "add")       adicionar(id);
  if (botao.dataset.acao === "mais")      alterarQtd(id, 1);
  if (botao.dataset.acao === "menos")     alterarQtd(id, -1);
  if (botao.dataset.acao === "finalizar") finalizarPedido();
});

/* ---------- INÍCIO ---------- */
renderHero();
renderCategoriasNav();
renderCardapio();
atualizarCarrinho();
renderPedidos();