function calc() {
  let brut = document.getElementById("brut").value;
  let net = brut * 0.78;

  document.getElementById("result").innerText =
    "Net ≈ " + net.toFixed(2) + "€";
}