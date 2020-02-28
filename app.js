//navbar
const cartBtn = document.querySelector(".cart-icon");
//cerrar
const closeCartBtn = document.querySelector(".close-cart");
//limpiar
const clearCartBtn = document.querySelector(".clear-cart");
//
const cartDOM = document.querySelector(".cart");
const cartOverly = document.querySelector(".cart-overlay");
//navbar
const cartItems = document.querySelector(".cart-total-items");
const cartTotal = document.querySelector(".cart-total");
//cart productsos del cart
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-container");

//CART
let cart = [];
let productsArray = [];
let buttonsDOM = [];
//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      //los datos vienen un poco raro por eso vamo s ahacer el map apara retornarlos asi
      products = products.map(product => {
        const { title, price } = product.fields;
        const { id } = product.sys;
        const image = product.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      /* porque se puede sobreescribir usamos +-*/

      result += `
      <div class="product-card">
      <div class="card-image">
        <img src=${product.image} alt=${product.title} />
        <button class="card-button" data-id=${product.id}>
          <i class="fas fa-cart-arrow-down"></i>
          Add To Bad
        </button>
      </div>
      <div class="info">
        <p class="name">${product.title}</p>
        <p class="price">$${product.price}</p>
      </div>
    </div>`;
    });
    productsDOM.innerHTML = result;
  }
  //tomamos todos los botones
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".card-button")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      //buscamos si esta y basado a eso escribimos el texto
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", e => {
        //cambiamos atributos
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        //get product
        let cartItem = {
          ...Storage.getProduct(e.target.dataset.id),
          amount: 1
        };
        //add to cart
        cart.push(cartItem);
        //save cart ls
        Storage.saveCart(cart);
        //set cart values
        this.setCartValue(cart);
        //display cart items
        this.addCartItem(cartItem);
        //show the cart
        this.onShowCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.amount * item.price;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = `Your total is $${parseFloat(tempTotal.toFixed(2))}`;
  }
  addCartItem(item) {
    const { image, price, title, amount, id } = item;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML += `
    <div class="img-container">
    <img src=${image} alt=${title} />
  </div>
  <div class="cart-product-info">
    <h4>${title}</h4>
    <h4>$${price}</h4>
    <button class="remove" data-id=${id}>remove</button>
  </div>
  <div class="quantity">
    <i class="fas fa-angle-up" data-id=${id}></i>
    <h4 class="item-amount">${amount}</h4>
    <i class="fas fa-angle-down" data-id=${id}></i>
  </div>
    `;
    //asi lo agregamos
    cartContent.appendChild(div);
  }
  onShowCart() {
    cartOverly.classList.toggle("transparentBcg");
    cartDOM.classList.toggle("showCart");
  }
  //por si hay datos llenamos el carro
  setUpAPP() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.onShowCart);
    closeCartBtn.addEventListener("click", this.onShowCart);
    this.cartLogic();
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", e => {
      if (e.target.classList.contains("remove")) {
        let removeItem = e.target;
        let id = e.target.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        //de esta manera accesamos al cart item  padre del padre
      } else if (e.target.classList.contains("fa-angle-up")) {
        let cartItem = e.target;
        let id = e.target.dataset.id;
        let item = cart.find(item => item.id === id);
        item.amount += 1;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        //con esto accesamos al hermano de la par
        cartItem.nextElementSibling.innerText = item.amount;
      } else if (e.target.classList.contains("fa-angle-down")) {
        let cartItem = e.target;
        let id = e.target.dataset.id;
        let item = cart.find(item => item.id === id);
        item.amount = item.amount - 1;
        if (item.amount === 0) {
          this.removeItem(id);
          this.setCartValue(cart);
          cartContent.removeChild(cartItem.parentElement.parentElement);
        } else {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          cartItem.previousElementSibling.innerText = item.amount;
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    //los borramos
    cartItems.forEach(id => this.removeItem(id));
    //remove content
    //si hay contenido lo borramos
    while (cartContent.children.length > 0) {
      //removemos el 1ero
      console.log(cartContent.children[0]);
      cartContent.removeChild(cartContent.children[0]);
    }
    this.onShowCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    //update valius
    this.setCartValue(cart);
    //guardamos
    Storage.saveCart(cart);
    //reiniciamos los valores en los botones in a bad or add to cart
    //sacamos el buton
    let button = this.getSingleButton(id);
    //reescribimos
    button.disabled = false;
    button.innerHTML = ` <i class="fas fa-cart-arrow-down"></i>Add To Bad`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}
//local storage
class Storage {
  //si se declara static puede ser usado en otras clasas
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    return productsArray.find(item => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //get products                       display
  ui.setUpAPP();
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
      productsArray = products;
    })
    .then(() => {
      //lo hacemos desde aqui de caso contrario tomariamos los botones sin que cargara
      ui.getBagButtons();
    });
});
