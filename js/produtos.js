// Dados do cardápio. Para adicionar um produto, basta incluir um objeto aqui:
// os cards, o hero e o carrinho são montados a partir desta lista.
const categorias = [
  { id: "hamburguer",  nome: "Hambúrguer" },
  { id: "pao-de-alho", nome: "Pão de alho" },
  { id: "extras",      nome: "Acompanhamentos, sobremesas e bebidas" }
];

const produtos = [
  { id: 1, categoria: "hamburguer",  nome: "Cheeseburger", descricao: "Pão brioche, blend 150g e queijo cheddar.", preco: 24.9, foto: "img/cheeseburger.jpg", destaque: true },
  { id: 2, categoria: "hamburguer",  nome: "Bacon Burger", descricao: "Blend 150g, bacon crocante e maionese da casa.", preco: 29.9, foto: "img/bacon.jpg", destaque: true },
  { id: 3, categoria: "pao-de-alho", nome: "Pão de alho tradicional", descricao: "Seis unidades com muito alho.", preco: 14.0, foto: "img/pao-alho.jpg", destaque: false },
  { id: 4, categoria: "extras",      nome: "Batata frita", descricao: "Porção média com sal e orégano.", preco: 16.0, foto: "img/batata.jpg", destaque: false },
  { id: 5, categoria: "extras",      nome: "Refrigerante lata", descricao: "350 ml, gelado.", preco: 6.0, foto: "img/refri.jpg", destaque: false }
];