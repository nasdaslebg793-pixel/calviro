function calc() {
  let brut = document.getElementById("brut").value;
  let net = brut * 0.78;

  document.getElementById("result").innerText =
    "Net ≈ " + net.toFixed(2) + "€";
}
function calcAge() {
  let year = document.getElementById("birth").value;
  let age = 2026 - year;
  document.getElementById("resAge").innerText = "Âge ≈ " + age;
}

function calcMoy() {
  let n1 = parseFloat(document.getElementById("n1").value);
  let n2 = parseFloat(document.getElementById("n2").value);
  let n3 = parseFloat(document.getElementById("n3").value);

  let moy = (n1 + n2 + n3) / 3;
  document.getElementById("resMoy").innerText = "Moyenne ≈ " + moy.toFixed(2);
}

function calcTVA() {
  let ht = document.getElementById("ht").value;
  let ttc = ht * 1.2;
  document.getElementById("resTVA").innerText = "TTC ≈ " + ttc.toFixed(2) + "€";
}

function calcTime() {
  let h = document.getElementById("hours").value;
  let min = h * 60;
  document.getElementById("resTime").innerText = min + " minutes";
}

function calcPercent() {
  let val = document.getElementById("val").value;
  let perc = document.getElementById("perc").value;

  let res = (val * perc) / 100;
  document.getElementById("resPercent").innerText = res;
}
