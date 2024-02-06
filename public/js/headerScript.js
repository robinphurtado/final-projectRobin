document.querySelector("#darken").addEventListener("change", changeTheme);
function changeTheme() {
  if (document.querySelector("#darken").checked) {
    document.querySelector("#top").className = "upperDark";
    document.querySelector("#mainContent").className = "mainPartDark";
  }
  if (!document.querySelector("#darken").checked) {
    document.querySelector("#top").className = "upper";
    document.querySelector("#mainContent").className = "mainPart";
  }
}