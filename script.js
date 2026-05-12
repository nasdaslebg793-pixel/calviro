function calcSalaire() {
  let brut = document.getElementById("brut").value;
  let net = brut * 0.78;

  document.getElementById("resSalaire").innerText =
    "Net ≈ " + net.toFixed(2) + "€";
}

function calcBAC() {
  let note = document.getElementById("note").value;

  if (note >= 16) {
    document.getElementById("resBAC").innerText = "Très bien";
  } else if (note >= 14) {
    document.getElementById("resBAC").innerText = "Bien";
  } else if (note >= 12) {
    document.getElementById("resBAC").innerText = "Assez bien";
  } else if (note >= 10) {
    document.getElementById("resBAC").innerText = "Admis";
  } else {
    document.getElementById("resBAC").innerText = "Recalé";
  }
}
