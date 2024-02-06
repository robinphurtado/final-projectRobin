document.querySelector("#toAdminPage").addEventListener("click", openAdminPage);
var slideIndex = 1;
showSlides(slideIndex);
function plusSlides(n) {
  showSlides(slideIndex += n);
}
function currentSlide(n) {
  showSlides(slideIndex = n);
}
function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) { slideIndex = 1; }
  if (n < 1) { slideIndex = slides.length; }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}
function openAdminPage() {
  let pageSpecs = 'width = 1000, height = 800, toolbar=no, menubar=no, location=no, resizable=yes, scrollbars=yes, status=no';
  let pageLink = '/adminLogin';
  window.open(pageLink, 'PopUpWindow', pageSpecs);
}
/** 
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username.trim()) {
    errorMessage.textContent = 'Enter a username';
  } else if (!password.trim()) {
    errorMessage.textContent = 'Enter a password';
  } else {
    errorMessage.textContent = 'Login successful';
  }
}); */