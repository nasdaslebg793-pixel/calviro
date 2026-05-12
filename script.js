function calcBAC() {
  let filiere = document.getElementById("filiere").value;

  let fr = parseFloat(document.getElementById("fr").value) || 0;
  let math = parseFloat(document.getElementById("math").value) || 0;
  let hg = parseFloat(document.getElementById("hg").value) || 0;
  let spe = parseFloat(document.getElementById("spe").value) || 0;

  let total = 0;
  let coeff = 0;

  // Coefficients simplifiés
  if (filiere === "general") {
    total = fr*3 + math*5 + hg*3 + spe*8;
    coeff = 19;
  }

  if (filiere === "techno") {
    total = fr*4 + math*4 + hg*4 + spe*6;
    coeff = 18;
  }

  if (filiere === "pro") {
    total = fr*3 + math*3 + hg*2 + spe*10;
    coeff = 18;
  }

  let moyenne = total / coeff;

  let result = "";

  if (moyenne >= 10) {
    result = "🎉 Admis avec " + moyenne.toFixed(2);
  } else if (moyenne >= 8) {
    result = "⚠️ Rattrapage avec " + moyenne.toFixed(2);
  } else {
    result = "❌ Recalé avec " + moyenne.toFixed(2);
  }

  document.getElementById("resBAC").innerText = result;
}
