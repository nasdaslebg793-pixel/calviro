/* ===== Calviro — script.js ===== */

// ---------- Helpers ----------

function $(id) { return document.getElementById(id); }

function showResult(elId, html) {
  const el = $(elId);
  if (!el) return;
  el.innerHTML = html;
  el.classList.add('visible');
}

function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatNum(n, digits = 2) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(n);
}

// ---------- 1. BAC ----------

const BAC_COEF = {
  general: {
    name: 'Général',
    matieres: [
      { nom: 'Français (écrit)', coef: 5, terminale: false },
      { nom: 'Français (oral)', coef: 5, terminale: false },
      { nom: 'Philosophie', coef: 8, terminale: true },
      { nom: 'Grand oral', coef: 10, terminale: true },
      { nom: 'Spécialité 1', coef: 16, terminale: true },
      { nom: 'Spécialité 2', coef: 16, terminale: true },
      { nom: 'Contrôle continu (autres matières)', coef: 40, terminale: true }
    ]
  },
  techno: {
    name: 'Technologique',
    matieres: [
      { nom: 'Français (écrit)', coef: 5, terminale: false },
      { nom: 'Français (oral)', coef: 5, terminale: false },
      { nom: 'Philosophie', coef: 4, terminale: true },
      { nom: 'Grand oral', coef: 14, terminale: true },
      { nom: 'Spécialité 1', coef: 16, terminale: true },
      { nom: 'Spécialité 2', coef: 16, terminale: true },
      { nom: 'Contrôle continu (autres matières)', coef: 40, terminale: true }
    ]
  },
  pro: {
    name: 'Professionnel',
    matieres: [
      { nom: 'Français + Histoire-géo', coef: 1, terminale: true },
      { nom: 'Mathématiques', coef: 1, terminale: true },
      { nom: 'Langue vivante', coef: 1, terminale: true },
      { nom: 'EPS', coef: 1, terminale: true },
      { nom: 'Épreuves professionnelles', coef: 9, terminale: true },
      { nom: 'Chef-d\'œuvre', coef: 2, terminale: true },
      { nom: 'Économie-droit / gestion', coef: 1, terminale: true }
    ]
  }
};

function bacRender() {
  const filiere = $('bac-filiere').value;
  const cfg = BAC_COEF[filiere];
  const container = $('bac-matieres');
  container.innerHTML = '';
  cfg.matieres.forEach((m, i) => {
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.innerHTML = `
      <span>${m.nom}</span>
      <input type="number" id="bac-note-${i}" placeholder="Note /20" min="0" max="20" step="0.5">
      <span>× ${m.coef}</span>
    `;
    container.appendChild(row);
  });
}

function bacCalc() {
  const filiere = $('bac-filiere').value;
  const cfg = BAC_COEF[filiere];
  let total = 0;
  let coefTotal = 0;
  let manquantes = 0;
  cfg.matieres.forEach((m, i) => {
    const v = parseFloat($('bac-note-' + i).value);
    if (!isNaN(v)) {
      total += v * m.coef;
      coefTotal += m.coef;
    } else {
      manquantes++;
    }
  });
  if (coefTotal === 0) {
    showResult('bac-result', '<div class="result-label">Erreur</div><div style="font-size:15px;color:var(--text-muted);">Renseigne au moins une note.</div>');
    return;
  }
  const moy = total / coefTotal;
  let mention = '';
  if (moy >= 16) mention = 'Très bien (félicitations)';
  else if (moy >= 14) mention = 'Bien';
  else if (moy >= 12) mention = 'Assez bien';
  else if (moy >= 10) mention = 'Sans mention — admis';
  else if (moy >= 8) mention = 'Oral de rattrapage';
  else mention = 'Refusé';

  showResult('bac-result', `
    <div class="result-label">Moyenne pondérée</div>
    <div class="result-value">${formatNum(moy, 2)}<span class="unit">/20</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Mention</span><strong>${mention}</strong></div>
      <div class="result-detail-row"><span>Matières renseignées</span><strong>${cfg.matieres.length - manquantes}/${cfg.matieres.length}</strong></div>
    </div>
    ${manquantes > 0 ? `<div class="note">⚠ ${manquantes} matière(s) non renseignée(s) — résultat partiel.</div>` : ''}
  `);
}

// ---------- 2. Salaire ----------

function calcSalaire() {
  const sens = $('sal-sens').value;
  const valeur = parseFloat($('sal-input').value);
  const statut = $('sal-statut').value;
  if (isNaN(valeur) || valeur <= 0) return;

  // Taux moyens simplifiés
  const taux = statut === 'cadre' ? 0.25 : (statut === 'fonction' ? 0.15 : 0.22);

  let brut, net;
  if (sens === 'brut-net') { brut = valeur; net = valeur * (1 - taux); }
  else { net = valeur; brut = valeur / (1 - taux); }

  const annuel = sens === 'brut-net' ? net * 12 : brut * 12;
  const cotisations = brut - net;

  showResult('sal-result', `
    <div class="result-label">${sens === 'brut-net' ? 'Salaire net mensuel' : 'Salaire brut mensuel'}</div>
    <div class="result-value">${formatEur(sens === 'brut-net' ? net : brut)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Annuel (12 mois)</span><strong>${formatEur(annuel)}</strong></div>
      <div class="result-detail-row"><span>Cotisations / mois</span><strong>${formatEur(cotisations)}</strong></div>
      <div class="result-detail-row"><span>Taux appliqué</span><strong>${(taux * 100).toFixed(0)} %</strong></div>
    </div>
    <div class="note">Estimation indicative basée sur un taux moyen. Le vrai taux dépend de ta convention collective, mutuelle, prévoyance, etc.</div>
  `);
}

// ---------- 3. IMC ----------

function calcIMC() {
  const p = parseFloat($('imc-poids').value);
  const t = parseFloat($('imc-taille').value) / 100;
  if (isNaN(p) || isNaN(t) || t <= 0) return;
  const imc = p / (t * t);
  let cat = '', color = 'var(--text)';
  if (imc < 18.5) { cat = 'Maigreur'; color = 'var(--warning)'; }
  else if (imc < 25) { cat = 'Corpulence normale'; color = 'var(--success)'; }
  else if (imc < 30) { cat = 'Surpoids'; color = 'var(--warning)'; }
  else if (imc < 35) { cat = 'Obésité modérée'; color = 'var(--error)'; }
  else if (imc < 40) { cat = 'Obésité sévère'; color = 'var(--error)'; }
  else { cat = 'Obésité morbide'; color = 'var(--error)'; }

  const poidsIdealMin = 18.5 * t * t;
  const poidsIdealMax = 25 * t * t;

  showResult('imc-result', `
    <div class="result-label">Indice de masse corporelle</div>
    <div class="result-value">${formatNum(imc, 1)}<span class="unit">kg/m²</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Catégorie</span><strong style="color:${color}">${cat}</strong></div>
      <div class="result-detail-row"><span>Poids santé (18,5–25)</span><strong>${formatNum(poidsIdealMin, 1)} – ${formatNum(poidsIdealMax, 1)} kg</strong></div>
    </div>
    <div class="note">L'IMC est un indicateur général. Il ne tient pas compte de la masse musculaire, de l'âge, du sexe ou de la morphologie.</div>
  `);
}

// ---------- 4. Convertisseur ----------

const CONVERSIONS = {
  longueur: { name: 'Longueur', unites: { mm: 0.001, cm: 0.01, m: 1, km: 1000, pouce: 0.0254, pied: 0.3048, mile: 1609.344 } },
  masse: { name: 'Masse', unites: { mg: 0.000001, g: 0.001, kg: 1, tonne: 1000, livre: 0.453592, once: 0.0283495 } },
  volume: { name: 'Volume', unites: { mL: 0.001, cL: 0.01, dL: 0.1, L: 1, m3: 1000 } },
  temps: { name: 'Temps', unites: { seconde: 1, minute: 60, heure: 3600, jour: 86400, semaine: 604800 } },
  energie: { name: 'Énergie', unites: { joule: 1, kJ: 1000, calorie: 4.184, kcal: 4184, Wh: 3600, kWh: 3600000 } },
  temperature: { name: 'Température', special: true }
};

function convRender() {
  const cat = $('conv-cat').value;
  if (cat === 'temperature') {
    $('conv-units').innerHTML = `
      <select id="conv-from"><option value="C">°C</option><option value="F">°F</option><option value="K">K</option></select>
      <select id="conv-to"><option value="F">°F</option><option value="C">°C</option><option value="K">K</option></select>
    `;
    return;
  }
  const u = Object.keys(CONVERSIONS[cat].unites);
  $('conv-units').innerHTML = `
    <select id="conv-from">${u.map(x => `<option value="${x}">${x}</option>`).join('')}</select>
    <select id="conv-to">${u.map((x, i) => `<option value="${x}"${i === 1 ? ' selected' : ''}>${x}</option>`).join('')}</select>
  `;
}

function convCalc() {
  const cat = $('conv-cat').value;
  const v = parseFloat($('conv-input').value);
  if (isNaN(v)) return;
  const from = $('conv-from').value;
  const to = $('conv-to').value;
  let result;
  if (cat === 'temperature') {
    let celsius;
    if (from === 'C') celsius = v;
    else if (from === 'F') celsius = (v - 32) * 5 / 9;
    else celsius = v - 273.15;
    if (to === 'C') result = celsius;
    else if (to === 'F') result = celsius * 9 / 5 + 32;
    else result = celsius + 273.15;
  } else {
    const base = v * CONVERSIONS[cat].unites[from];
    result = base / CONVERSIONS[cat].unites[to];
  }
  showResult('conv-result', `
    <div class="result-label">Conversion</div>
    <div class="result-value" style="font-size: 26px;">${formatNum(v, 4)} ${from} = <strong>${formatNum(result, 6)} ${to}</strong></div>
  `);
}

// ---------- 5. Facture ----------

function calcFacture() {
  const ht = parseFloat($('fac-ht').value);
  const tva = parseFloat($('fac-tva').value);
  if (isNaN(ht) || isNaN(tva)) return;
  const montantTva = ht * tva / 100;
  const ttc = ht + montantTva;
  showResult('fac-result', `
    <div class="result-label">Total TTC</div>
    <div class="result-value">${formatEur(ttc)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Montant HT</span><strong>${formatEur(ht)}</strong></div>
      <div class="result-detail-row"><span>TVA (${tva} %)</span><strong>${formatEur(montantTva)}</strong></div>
    </div>
  `);
}

// ---------- 6. Eau ----------

function calcEau() {
  const p = parseFloat($('eau-poids').value);
  const sport = parseFloat($('eau-sport').value) || 0;
  if (isNaN(p)) return;
  const base = p * 35; // 35ml par kg
  const total = base + sport * 500; // +500ml par heure de sport
  const verres = Math.ceil(total / 250);

  showResult('eau-result', `
    <div class="result-label">Besoin quotidien</div>
    <div class="result-value">${formatNum(total / 1000, 2)}<span class="unit">L / jour</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Base (35 ml × ${p} kg)</span><strong>${formatNum(base / 1000, 2)} L</strong></div>
      <div class="result-detail-row"><span>Sport (${sport} h × 500 ml)</span><strong>${formatNum(sport * 0.5, 2)} L</strong></div>
      <div class="result-detail-row"><span>Équivalent en verres (25 cl)</span><strong>≈ ${verres} verres</strong></div>
    </div>
    <div class="note">Augmente l'apport en cas de forte chaleur, de grossesse, d'allaitement ou de maladie.</div>
  `);
}

// ---------- 7. Pomodoro ----------

let pomoState = { running: false, mode: 'work', remaining: 25 * 60, interval: null, workMin: 25, breakMin: 5, cycles: 0 };

function pomoUpdate() {
  const m = Math.floor(pomoState.remaining / 60).toString().padStart(2, '0');
  const s = (pomoState.remaining % 60).toString().padStart(2, '0');
  $('pomo-time').textContent = `${m}:${s}`;
  $('pomo-mode').textContent = pomoState.mode === 'work' ? 'Travail' : 'Pause';
  $('pomo-cycles').textContent = pomoState.cycles;
  document.title = `${m}:${s} — ${pomoState.mode === 'work' ? '🍅' : '☕'} Pomodoro`;
}

function pomoTick() {
  if (pomoState.remaining > 0) {
    pomoState.remaining--;
    pomoUpdate();
  } else {
    clearInterval(pomoState.interval);
    pomoState.running = false;
    // Bip sonore simple
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 600; g.gain.value = 0.2;
      o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 300);
    } catch (e) {}
    if (pomoState.mode === 'work') {
      pomoState.cycles++;
      pomoState.mode = 'break';
      pomoState.remaining = pomoState.breakMin * 60;
    } else {
      pomoState.mode = 'work';
      pomoState.remaining = pomoState.workMin * 60;
    }
    pomoUpdate();
    $('pomo-start').textContent = 'Démarrer';
    alert(pomoState.mode === 'work' ? 'Fin de pause — retour au travail !' : 'Pomodoro terminé — pause !');
  }
}

function pomoStart() {
  if (pomoState.running) {
    clearInterval(pomoState.interval);
    pomoState.running = false;
    $('pomo-start').textContent = 'Reprendre';
  } else {
    pomoState.running = true;
    pomoState.interval = setInterval(pomoTick, 1000);
    $('pomo-start').textContent = 'Pause';
  }
}

function pomoReset() {
  clearInterval(pomoState.interval);
  pomoState.running = false;
  pomoState.mode = 'work';
  pomoState.workMin = parseInt($('pomo-work').value) || 25;
  pomoState.breakMin = parseInt($('pomo-break').value) || 5;
  pomoState.remaining = pomoState.workMin * 60;
  $('pomo-start').textContent = 'Démarrer';
  pomoUpdate();
}

function pomoInit() {
  pomoReset();
}

// ---------- 8. Pseudo ----------

const PSEUDO_ADJ = ['silent','cosmic','rapid','crystal','neon','solar','lunar','wild','quiet','bright','dark','swift','royal','arctic','golden','iron','velvet','obsidian','crimson','vivid','frozen','feral','astral','mystic','phantom','sonic','retro','hyper','ultra','vintage'];
const PSEUDO_NOUN = ['fox','wolf','eagle','tiger','dragon','phoenix','raven','panda','shark','lion','panther','falcon','knight','rider','wizard','ninja','samurai','pilot','rebel','ghost','blade','storm','wave','nova','pulse','vortex','echo','drift','spark','flux'];
const PSEUDO_STYLES = ['camelCase','snake_case','dot.case','with-dash','random_num','leet'];

function genererPseudo() {
  const style = $('pseudo-style').value;
  const a = PSEUDO_ADJ[Math.floor(Math.random() * PSEUDO_ADJ.length)];
  const n = PSEUDO_NOUN[Math.floor(Math.random() * PSEUDO_NOUN.length)];
  const num = Math.floor(Math.random() * 1000);
  let result;
  switch (style) {
    case 'camelCase': result = a + n.charAt(0).toUpperCase() + n.slice(1); break;
    case 'snake_case': result = `${a}_${n}`; break;
    case 'dot.case': result = `${a}.${n}`; break;
    case 'with-dash': result = `${a}-${n}`; break;
    case 'random_num': result = `${a}${n}${num}`; break;
    case 'leet': result = (a + n).replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0').replace(/s/g, '5'); break;
    default: result = `${a}_${n}`;
  }
  $('pseudo-out').textContent = result;
}

function copierPseudo() {
  const txt = $('pseudo-out').textContent;
  if (!txt || txt === '—') return;
  navigator.clipboard.writeText(txt).then(() => {
    const btn = $('pseudo-copy');
    const old = btn.textContent;
    btn.textContent = '✓ Copié';
    setTimeout(() => btn.textContent = old, 1500);
  });
}

// ---------- 9. Probabilités ----------

const PROBA_REF = [
  { p: 1/19068840, label: 'gagner le jackpot du Loto (1 grille)' },
  { p: 1/139838160, label: 'gagner le jackpot de l\'EuroMillions' },
  { p: 1/1000000, label: 'être touché par la foudre dans une vie' },
  { p: 1/11500, label: 'mourir dans un accident de la route (par an, en France)' },
  { p: 1/100, label: 'tirer un as au tarot (1 carte sur 78)' },
  { p: 1/13, label: 'tirer un as dans un jeu de 52 cartes' },
  { p: 1/6, label: 'faire un 6 avec un dé' },
  { p: 0.5, label: 'tirer pile à pile ou face' }
];

function calcProba() {
  const num = parseFloat($('proba-num').value);
  const den = parseFloat($('proba-den').value);
  if (isNaN(num) || isNaN(den) || den <= 0 || num < 0) return;
  const p = num / den;
  const pct = p * 100;
  const oneIn = p > 0 ? 1 / p : Infinity;

  let comparaisons = '';
  PROBA_REF.forEach(ref => {
    const ratio = p / ref.p;
    if (ratio >= 1.5) {
      comparaisons += `<div class="result-detail-row"><span>${ref.label}</span><strong>${formatNum(ratio, 1)}× plus probable</strong></div>`;
    } else if (ratio <= 0.66) {
      comparaisons += `<div class="result-detail-row"><span>${ref.label}</span><strong>${formatNum(1/ratio, 1)}× moins probable</strong></div>`;
    }
  });

  showResult('proba-result', `
    <div class="result-label">Probabilité</div>
    <div class="result-value">${pct < 0.01 ? pct.toExponential(2) : formatNum(pct, 4)}<span class="unit">%</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Soit environ</span><strong>1 chance sur ${formatNum(oneIn, 0)}</strong></div>
    </div>
    ${comparaisons ? `<div class="result-detail" style="margin-top:12px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:8px;">Comparaisons</div>${comparaisons}</div>` : ''}
  `);
}

// ---------- 10. PDF generator ----------

function genererPDF() {
  const titre = $('pdf-titre').value || 'Document';
  const contenu = $('pdf-contenu').value;
  if (!contenu.trim()) { alert('Ajoute du contenu avant de générer le PDF.'); return; }

  // Création d'un élément pour html2pdf
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'padding: 40px; font-family: Georgia, serif; color: #000; line-height: 1.6; max-width: 800px;';
  wrapper.innerHTML = `
    <h1 style="font-size:28px;margin-bottom:24px;border-bottom:2px solid #000;padding-bottom:8px;">${titre}</h1>
    <div style="white-space:pre-wrap;font-size:14px;">${contenu.replace(/</g, '&lt;')}</div>
  `;
  document.body.appendChild(wrapper);
  html2pdf().set({
    margin: 10,
    filename: `${titre.replace(/[^a-z0-9]/gi, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(wrapper).save().then(() => {
    document.body.removeChild(wrapper);
  });
}

// ---------- 11. Chômage ----------

function calcChomage() {
  const sjr = parseFloat($('cho-salaire').value); // salaire brut mensuel
  const age = parseInt($('cho-age').value) || 30;
  if (isNaN(sjr) || sjr <= 0) return;

  // SJR = salaire journalier de référence (approx)
  const salaireJournalier = sjr * 12 / 365;
  // ARE = max(57% SJR, 40,4% SJR + 13,18€)
  const are1 = salaireJournalier * 0.57;
  const are2 = salaireJournalier * 0.404 + 13.18;
  const areJour = Math.max(are1, are2);
  // Plafonnement : pas plus de 75% du SJR, minimum ~31€/jour
  const arePlafonne = Math.min(areJour, salaireJournalier * 0.75);
  const areFinal = Math.max(arePlafonne, 31.97);
  const areMensuel = areFinal * 30;

  // Durée indicative
  let duree;
  if (age < 53) duree = 18;
  else if (age < 55) duree = 22.5;
  else duree = 27;

  showResult('cho-result', `
    <div class="result-label">Allocation chômage estimée</div>
    <div class="result-value">${formatEur(areMensuel)}<span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Par jour</span><strong>${formatEur(areFinal)}</strong></div>
      <div class="result-detail-row"><span>Durée maxi indicative</span><strong>${duree} mois</strong></div>
    </div>
    <div class="note">⚠ Estimation très simplifiée. Le calcul réel dépend de la durée travaillée, du nombre de jours de référence, du type de contrat, etc. Voir <a href="https://www.unedic.org" target="_blank" style="color:var(--text);">Unédic</a> pour le détail.</div>
  `);
}

// ---------- 12. Impôts ----------

// Barème 2025 (sur revenus 2024)
const IR_TRANCHES = [
  { max: 11497, taux: 0 },
  { max: 29315, taux: 0.11 },
  { max: 83823, taux: 0.30 },
  { max: 180294, taux: 0.41 },
  { max: Infinity, taux: 0.45 }
];

function calcImpots() {
  const revenu = parseFloat($('imp-revenu').value);
  const parts = parseFloat($('imp-parts').value);
  if (isNaN(revenu) || isNaN(parts) || parts <= 0) return;

  // Abattement 10% (frais pro forfaitaires)
  const revenuImposable = revenu * 0.9;
  const quotient = revenuImposable / parts;

  let impotParPart = 0;
  let bornePrec = 0;
  IR_TRANCHES.forEach(t => {
    if (quotient > bornePrec) {
      const dansTranche = Math.min(quotient, t.max) - bornePrec;
      impotParPart += dansTranche * t.taux;
    }
    bornePrec = t.max;
  });

  const impotBrut = impotParPart * parts;
  const tauxMoyen = revenu > 0 ? (impotBrut / revenu * 100) : 0;
  // Taux marginal
  let tauxMarg = 0;
  bornePrec = 0;
  for (const t of IR_TRANCHES) {
    if (quotient > bornePrec && quotient <= t.max) { tauxMarg = t.taux; break; }
    bornePrec = t.max;
  }

  showResult('imp-result', `
    <div class="result-label">Impôt sur le revenu (estimation)</div>
    <div class="result-value">${formatEur(Math.max(0, impotBrut))}<span class="unit">/ an</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Revenu imposable (après 10 %)</span><strong>${formatEur(revenuImposable)}</strong></div>
      <div class="result-detail-row"><span>Taux marginal</span><strong>${(tauxMarg * 100).toFixed(0)} %</strong></div>
      <div class="result-detail-row"><span>Taux moyen</span><strong>${tauxMoyen.toFixed(1)} %</strong></div>
      <div class="result-detail-row"><span>Par mois</span><strong>${formatEur(impotBrut / 12)}</strong></div>
    </div>
    <div class="note">Barème 2025 sur revenus 2024. Hors décote, réductions et crédits d'impôt. Pour un calcul officiel : impots.gouv.fr.</div>
  `);
}

// ---------- 13. Retraite ----------

function calcRetraite() {
  const salaire = parseFloat($('ret-salaire').value); // brut mensuel actuel
  const trimestres = parseInt($('ret-trimestres').value);
  const age = parseInt($('ret-age').value);
  if (isNaN(salaire) || isNaN(trimestres) || isNaN(age)) return;

  // Taux plein : 50% du salaire moyen des 25 meilleures années
  const TRIM_REQUIS = 172;
  const tauxBase = 0.50;
  const decote = Math.max(0, (TRIM_REQUIS - trimestres) * 0.00625); // 0.625% par trimestre manquant
  const tauxFinal = Math.max(0.25, tauxBase - decote);

  const retraiteBase = salaire * tauxFinal;
  // Estimation retraite complémentaire (Agirc-Arrco) : approx 25% du salaire pour cadres, 15% pour non cadres
  const complement = salaire * 0.20;
  const total = retraiteBase + complement;

  showResult('ret-result', `
    <div class="result-label">Pension mensuelle estimée</div>
    <div class="result-value">${formatEur(total)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Régime de base</span><strong>${formatEur(retraiteBase)}</strong></div>
      <div class="result-detail-row"><span>Complémentaire (estimée)</span><strong>${formatEur(complement)}</strong></div>
      <div class="result-detail-row"><span>Taux appliqué (base)</span><strong>${(tauxFinal * 100).toFixed(1)} %</strong></div>
      <div class="result-detail-row"><span>Trimestres manquants</span><strong>${Math.max(0, TRIM_REQUIS - trimestres)}</strong></div>
    </div>
    <div class="note">Estimation très indicative basée sur le salaire actuel. La pension réelle dépend des 25 meilleures années, du Smic horaire, du régime, etc. Voir <a href="https://www.info-retraite.fr" target="_blank" style="color:var(--text);">info-retraite.fr</a>.</div>
  `);
}

// ---------- 14. APL ----------

function calcAPL() {
  const loyer = parseFloat($('apl-loyer').value);
  const revenu = parseFloat($('apl-revenu').value); // revenu annuel
  const zone = $('apl-zone').value;
  const composition = $('apl-compo').value;
  if (isNaN(loyer) || isNaN(revenu)) return;

  // Calcul ULTRA-simplifié (le vrai calcul CAF est très complexe)
  // Plafonds loyer indicatifs par zone (personne seule 2025)
  const plafondLoyer = {
    '1': { seul: 327, couple: 394, plus: 457 },
    '2': { seul: 285, couple: 348, plus: 392 },
    '3': { seul: 267, couple: 323, plus: 351 }
  };
  const cle = composition === 'seul' ? 'seul' : (composition === 'couple' ? 'couple' : 'plus');
  const plafond = plafondLoyer[zone][cle];
  const loyerPrisEnCompte = Math.min(loyer, plafond);

  // Estimation : APL ≈ loyer pris en compte − participation personnelle
  const participationMin = 35;
  const tauxRevenu = 0.20; // 20% du revenu mensuel sert de participation
  const participation = Math.max(participationMin, (revenu / 12) * tauxRevenu - (composition === 'seul' ? 0 : 100));
  const apl = Math.max(0, loyerPrisEnCompte - participation);

  showResult('apl-result', `
    <div class="result-label">APL estimée</div>
    <div class="result-value">${formatEur(apl)}<span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Loyer pris en compte (plafonné)</span><strong>${formatEur(loyerPrisEnCompte)}</strong></div>
      <div class="result-detail-row"><span>Participation personnelle estimée</span><strong>${formatEur(participation)}</strong></div>
      <div class="result-detail-row"><span>Reste à charge estimé</span><strong>${formatEur(loyer - apl)}</strong></div>
    </div>
    <div class="note">⚠ Estimation très approximative. Le calcul officiel CAF prend en compte une trentaine de paramètres. Simulateur officiel : <a href="https://www.caf.fr" target="_blank" style="color:var(--text);">caf.fr</a>.</div>
  `);
}
