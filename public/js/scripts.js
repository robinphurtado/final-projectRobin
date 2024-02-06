document.querySelector("#darken").addEventListener("change", changeTheme);
let products = document.querySelectorAll("a");
for (p of products) {
  p.addEventListener("click", getInfo);
}
async function getInfo() {
  var myModal = new bootstrap.Modal(document.getElementById('productModal'));
  myModal.show();
  let url = `/api/product/${this.id}`;
  let response = await fetch(url);
  console.log(url);
  let data = await response.json();
  let productDetails = document.querySelector("#productDetails");
  productDetails.innerHTML = "";
  for (let i of data) {
    productDetails.innerHTML += `<h1><strong> ${i.productInfo}</strong> </h1>`;
    productDetails.innerHTML += `<img src="${data[0].image}" width = "400"><br><br>`;
    productDetails.innerHTML += `<p><strong>Brand: </strong>${i.productBrandName} </p>`;
    productDetails.innerHTML += `<p><strong>Price: </strong> $${i.basePrice} </p>`;
    productDetails.innerHTML += `<p><strong>Quantity available: </strong> ${i.quantity} </p>`;
  }
  let urlTwo = `/api/comment/${this.id}`;
  let responseTwo = await fetch(urlTwo);
  console.log(urlTwo);
  let comments = await responseTwo.json();
  let commentInfo = document.querySelector("#commentInfo");
  commentInfo.innerHTML = "";
  for (let j of comments) {
    commentInfo.innerHTML += `<h4> ${j.comment} </h4>`;
    commentInfo.innerHTML += `<p> - ${j.author} </p>`;
  }
}
function changeTheme() {
  if (document.querySelector("#darken").checked) {
    document.querySelector("#mTitle").className = "darkModalTheme";
    document.querySelector("#mBody").className = "darkModalBody";
  }
  if (!document.querySelector("#darken").checked) {
    document.querySelector("#mTitle").className = "modal-title";
    document.querySelector("#mBody").className = "modal-body";
  }
}