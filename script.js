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

// ---------- 15. POURCENTAGE ----------

function calcPourcentage() {
  const mode = $('pct-mode').value;
  const a = parseFloat($('pct-a').value);
  const b = parseFloat($('pct-b').value);

  if (isNaN(a) || isNaN(b)) {
    showResult('pct-result', '<div class="note">⚠ Entre des valeurs numériques dans les deux champs.</div>');
    return;
  }

  let label = '', value = '', detail = '';

  if (mode === 'pourcentage-de') {
    // X% de Y = ?
    const r = (a / 100) * b;
    label = `${formatNum(a)} % de ${formatNum(b)}`;
    value = formatNum(r, 2);
    detail = `${formatNum(a)} ÷ 100 × ${formatNum(b)} = ${formatNum(r, 2)}`;
  } else if (mode === 'est-de') {
    // X est X% de Y
    if (b === 0) {
      showResult('pct-result', '<div class="note">⚠ Impossible de calculer un pourcentage avec un total de 0.</div>');
      return;
    }
    const r = (a / b) * 100;
    label = `${formatNum(a)} représente combien de % de ${formatNum(b)}`;
    value = formatNum(r, 2) + ' %';
    detail = `${formatNum(a)} ÷ ${formatNum(b)} × 100 = ${formatNum(r, 2)} %`;
  } else if (mode === 'ajouter') {
    // Ajouter X% à Y
    const r = b + (a / 100) * b;
    label = `${formatNum(b)} + ${formatNum(a)} %`;
    value = formatNum(r, 2);
    detail = `${formatNum(b)} × (1 + ${formatNum(a)}/100) = ${formatNum(r, 2)}`;
  } else if (mode === 'remise') {
    // Remise de X% sur Y
    const r = b - (a / 100) * b;
    const economie = (a / 100) * b;
    label = `${formatNum(b)} avec ${formatNum(a)} % de remise`;
    value = formatNum(r, 2);
    detail = `Tu économises ${formatNum(economie, 2)} sur ${formatNum(b)}`;
  } else if (mode === 'evolution') {
    // X% d'évolution entre A et B
    if (a === 0) {
      showResult('pct-result', '<div class="note">⚠ Impossible de calculer une évolution depuis 0.</div>');
      return;
    }
    const r = ((b - a) / a) * 100;
    const sens = r >= 0 ? 'hausse' : 'baisse';
    label = `Évolution de ${formatNum(a)} à ${formatNum(b)}`;
    value = (r >= 0 ? '+' : '') + formatNum(r, 2) + ' %';
    detail = `${sens} de ${formatNum(Math.abs(b - a), 2)} (${formatNum(Math.abs(r), 2)} % par rapport au point de départ)`;
  }

  showResult('pct-result', `
    <div class="result-label">${label}</div>
    <div class="result-value">${value}</div>
    <div class="result-detail">
      <div class="result-detail-row" style="border:none;"><span>${detail}</span></div>
    </div>
  `);
}

function pourcentageRender() {
  const mode = $('pct-mode').value;
  const labA = $('pct-lab-a'), labB = $('pct-lab-b');
  const phA = $('pct-a'), phB = $('pct-b');
  const labels = {
    'pourcentage-de': ['Pourcentage (%)', 'De quelle valeur ?'],
    'est-de': ['Valeur', 'Sur un total de'],
    'ajouter': ['Pourcentage à ajouter (%)', 'Valeur de départ'],
    'remise': ['Remise (%)', 'Prix initial'],
    'evolution': ['Valeur de départ', 'Valeur d\'arrivée']
  };
  const phs = {
    'pourcentage-de': ['20', '150'],
    'est-de': ['30', '120'],
    'ajouter': ['15', '100'],
    'remise': ['30', '80'],
    'evolution': ['1000', '1200']
  };
  labA.textContent = labels[mode][0];
  labB.textContent = labels[mode][1];
  phA.placeholder = phs[mode][0];
  phB.placeholder = phs[mode][1];
}

// ---------- 16. COMPTEUR DE MOTS ----------

function compteurMaj() {
  const txt = $('cpt-text').value;

  const carAvec = txt.length;
  const carSans = txt.replace(/\s/g, '').length;
  const mots = txt.trim() === '' ? 0 : txt.trim().split(/\s+/).length;
  const phrases = (txt.match(/[.!?]+/g) || []).length;
  const paragraphes = txt.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const lignes = txt.split('\n').length;

  const lectureMin = Math.max(1, Math.ceil(mots / 200)); // 200 mots/min de lecture moyenne

  // Compteurs sociaux
  const twitter = 280 - carAvec;
  const sms = 160 - carAvec;
  const meta = 160 - carAvec; // SEO meta description

  $('cpt-mots').textContent = formatNum(mots, 0);
  $('cpt-car-avec').textContent = formatNum(carAvec, 0);
  $('cpt-car-sans').textContent = formatNum(carSans, 0);
  $('cpt-phrases').textContent = formatNum(phrases, 0);
  $('cpt-paragraphes').textContent = formatNum(paragraphes, 0);
  $('cpt-lignes').textContent = formatNum(lignes, 0);
  $('cpt-lecture').textContent = lectureMin + ' min';

  const setLimite = (id, restant) => {
    const el = $(id);
    if (!el) return;
    if (restant < 0) {
      el.innerHTML = `<span style="color:#dc2626;">+${formatNum(-restant, 0)} de trop</span>`;
    } else {
      el.textContent = formatNum(restant, 0) + ' restants';
    }
  };
  setLimite('cpt-twitter', twitter);
  setLimite('cpt-sms', sms);
  setLimite('cpt-meta', meta);
}

function compteurVider() {
  $('cpt-text').value = '';
  compteurMaj();
}

// ---------- 17. GÉNÉRATEUR MOT DE PASSE ----------

function genererMotDePasse() {
  const longueur = parseInt($('mdp-longueur').value, 10);
  const maj = $('mdp-maj').checked;
  const min = $('mdp-min').checked;
  const chif = $('mdp-chiffres').checked;
  const sym = $('mdp-symboles').checked;

  if (!maj && !min && !chif && !sym) {
    showResult('mdp-result', '<div class="note">⚠ Sélectionne au moins un type de caractères.</div>');
    return;
  }

  let chars = '';
  if (maj) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (min) chars += 'abcdefghijkmnopqrstuvwxyz';
  if (chif) chars += '23456789';
  if (sym) chars += '!@#$%&*+-=?';

  let mdp = '';
  const arr = new Uint32Array(longueur);
  crypto.getRandomValues(arr);
  for (let i = 0; i < longueur; i++) {
    mdp += chars[arr[i] % chars.length];
  }

  // Estimation de la force
  const types = [maj, min, chif, sym].filter(Boolean).length;
  let force = 'Faible', couleur = '#dc2626', combinaisons = '';
  const entropie = longueur * Math.log2(chars.length);
  if (entropie >= 80) { force = 'Très forte'; couleur = '#059669'; }
  else if (entropie >= 60) { force = 'Forte'; couleur = '#10b981'; }
  else if (entropie >= 40) { force = 'Moyenne'; couleur = '#f59e0b'; }

  // Temps pour cracker (estimation à 1 milliard de tentatives/seconde)
  const totalComb = Math.pow(chars.length, longueur);
  const secondes = totalComb / 1e9;
  let temps = '';
  if (secondes < 60) temps = '< 1 minute';
  else if (secondes < 3600) temps = Math.round(secondes / 60) + ' minutes';
  else if (secondes < 86400) temps = Math.round(secondes / 3600) + ' heures';
  else if (secondes < 31536000) temps = Math.round(secondes / 86400) + ' jours';
  else if (secondes < 3.15e10) temps = Math.round(secondes / 31536000) + ' ans';
  else if (secondes < 3.15e13) temps = Math.round(secondes / 31536000 / 1000) + ' mille ans';
  else if (secondes < 3.15e16) temps = Math.round(secondes / 31536000 / 1e6) + ' millions d\'années';
  else temps = 'des milliards d\'années';

  showResult('mdp-result', `
    <div class="pseudo-output" id="mdp-output" style="font-family: 'SF Mono', Consolas, monospace; word-break: break-all;">${mdp}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Force du mot de passe</span><strong style="color:${couleur};">${force}</strong></div>
      <div class="result-detail-row"><span>Entropie</span><strong>${formatNum(entropie, 1)} bits</strong></div>
      <div class="result-detail-row"><span>Temps pour le cracker</span><strong>${temps}</strong></div>
    </div>
    <div class="note">Mot de passe généré localement (jamais envoyé sur internet). Stocke-le dans un gestionnaire de mots de passe.</div>
  `);

  // Sauvegarde pour copie
  window._mdpGenere = mdp;
}

function copierMotDePasse() {
  if (!window._mdpGenere) return;
  navigator.clipboard.writeText(window._mdpGenere).then(() => {
    const btn = $('mdp-copy');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Copié';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    }
  });
}

// ---------- 18. CRÉDIT IMMOBILIER ----------

function calcCreditImmo() {
  const montant = parseFloat($('credit-montant').value);
  const taux = parseFloat($('credit-taux').value);
  const duree = parseInt($('credit-duree').value, 10);
  const assurance = parseFloat($('credit-assurance').value) || 0;

  if (isNaN(montant) || isNaN(taux) || isNaN(duree) || montant <= 0 || duree <= 0) {
    showResult('credit-result', '<div class="note">⚠ Remplis tous les champs avec des valeurs positives.</div>');
    return;
  }

  // Calcul mensualité (formule classique de prêt amortissable)
  const tauxMensuel = taux / 100 / 12;
  const nbMensualites = duree * 12;
  let mensualite;
  if (tauxMensuel === 0) {
    mensualite = montant / nbMensualites;
  } else {
    mensualite = montant * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -nbMensualites));
  }

  // Assurance (% annuel du capital initial)
  const assuranceMensuelle = (assurance / 100) * montant / 12;
  const mensualiteTotale = mensualite + assuranceMensuelle;

  const coutTotalCredit = (mensualite * nbMensualites) - montant;
  const coutTotalAssurance = assuranceMensuelle * nbMensualites;
  const coutTotal = coutTotalCredit + coutTotalAssurance;

  // Construction du tableau d'amortissement année par année (limité à 30 lignes pour lisibilité)
  let capitalRestant = montant;
  let amortRows = '';
  const maxLignes = Math.min(duree, 30);

  for (let annee = 1; annee <= maxLignes; annee++) {
    let interetsAnnee = 0;
    let capitalAnnee = 0;
    for (let m = 0; m < 12; m++) {
      const interet = capitalRestant * tauxMensuel;
      const capital = mensualite - interet;
      interetsAnnee += interet;
      capitalAnnee += capital;
      capitalRestant -= capital;
    }
    amortRows += `<tr><td>${annee}</td><td>${formatEur(capitalAnnee)}</td><td>${formatEur(interetsAnnee)}</td><td>${formatEur(Math.max(0, capitalRestant))}</td></tr>`;
  }

  showResult('credit-result', `
    <div class="result-label">Mensualité totale (avec assurance)</div>
    <div class="result-value">${formatEur(mensualiteTotale)}<span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Mensualité (hors assurance)</span><strong>${formatEur(mensualite)}</strong></div>
      <div class="result-detail-row"><span>Assurance mensuelle</span><strong>${formatEur(assuranceMensuelle)}</strong></div>
      <div class="result-detail-row"><span>Coût total du crédit (intérêts)</span><strong>${formatEur(coutTotalCredit)}</strong></div>
      <div class="result-detail-row"><span>Coût total de l'assurance</span><strong>${formatEur(coutTotalAssurance)}</strong></div>
      <div class="result-detail-row"><span>Coût total (hors capital)</span><strong>${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>Coût global (capital + frais)</span><strong>${formatEur(montant + coutTotal)}</strong></div>
    </div>
    <details style="margin-top: 16px;">
      <summary style="cursor:pointer; color:var(--text); font-weight:500;">📊 Voir le tableau d'amortissement</summary>
      <table style="margin-top: 12px; width: 100%; font-size: 13px;">
        <thead><tr><th>Année</th><th>Capital remboursé</th><th>Intérêts payés</th><th>Capital restant</th></tr></thead>
        <tbody>${amortRows}</tbody>
      </table>
    </details>
    <div class="note">Calcul indicatif. Le taux réel inclut souvent des frais (dossier, garantie) qui augmentent le TAEG. Demande plusieurs offres.</div>
  `);
}

// ---------- 19. CONVERTISSEUR MONNAIES ----------

let _tauxCache = null;
let _tauxDate = null;
let _tauxSource = '';

async function chargerTaux() {
  // Cache 1h
  if (_tauxCache && _tauxDate && (Date.now() - _tauxDate < 3600000)) {
    return _tauxCache;
  }

  // Liste de sources de secours (en ordre de priorité)
  const sources = [
    {
      name: 'frankfurter.dev',
      url: 'https://api.frankfurter.dev/v1/latest?from=EUR',
      parse: (data) => data.rates
    },
    {
      name: 'frankfurter.app',
      url: 'https://api.frankfurter.app/latest?from=EUR',
      parse: (data) => data.rates
    },
    {
      name: 'open.er-api.com',
      url: 'https://open.er-api.com/v6/latest/EUR',
      parse: (data) => data.rates
    },
    {
      name: 'exchangerate-api',
      url: 'https://api.exchangerate-api.com/v4/latest/EUR',
      parse: (data) => data.rates
    }
  ];

  for (const source of sources) {
    try {
      const resp = await fetch(source.url);
      if (!resp.ok) continue;
      const data = await resp.json();
      const rates = source.parse(data);
      if (rates && typeof rates === 'object') {
        rates.EUR = 1;
        _tauxCache = rates;
        _tauxDate = Date.now();
        _tauxSource = source.name;
        return _tauxCache;
      }
    } catch (e) {
      // Essayer la source suivante
      continue;
    }
  }
  return null;
}

async function calcMonnaie() {
  const montant = parseFloat($('mon-montant').value);
  const de = $('mon-de').value;
  const vers = $('mon-vers').value;

  if (isNaN(montant)) {
    showResult('mon-result', '<div class="note">⚠ Entre un montant valide.</div>');
    return;
  }

  $('mon-result').innerHTML = '<div class="note">⏳ Chargement des taux en cours...</div>';
  $('mon-result').classList.add('visible');

  const taux = await chargerTaux();
  if (!taux) {
    showResult('mon-result', `
      <div class="note">⚠ Impossible de joindre les serveurs de taux de change. 
      Cela peut venir d'une connexion internet instable ou d'un bloqueur de publicités qui empêche les requêtes. 
      Réessaie dans quelques instants ou désactive temporairement ton bloqueur.</div>
    `);
    return;
  }

  if (!taux[de] || !taux[vers]) {
    showResult('mon-result', '<div class="note">⚠ Une des devises n\'est pas disponible sur la source actuelle.</div>');
    return;
  }

  // Conversion via EUR pivot
  const enEuros = de === 'EUR' ? montant : montant / taux[de];
  const resultat = vers === 'EUR' ? enEuros : enEuros * taux[vers];
  const tauxDirect = vers === 'EUR' ? 1 / taux[de] : (de === 'EUR' ? taux[vers] : taux[vers] / taux[de]);

  const symboles = { EUR: '€', USD: '$', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'CA$', AUD: 'AU$', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', NOK: 'kr', SEK: 'kr', DKK: 'kr', PLN: 'zł', TRY: '₺', ZAR: 'R', SGD: 'S$', HKD: 'HK$', KRW: '₩', THB: '฿' };
  const symVers = symboles[vers] || vers;

  showResult('mon-result', `
    <div class="result-label">${formatNum(montant, 2)} ${de} =</div>
    <div class="result-value">${formatNum(resultat, 2)} <span class="unit">${symVers}</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Taux de change</span><strong>1 ${de} = ${formatNum(tauxDirect, 4)} ${vers}</strong></div>
      <div class="result-detail-row"><span>Taux inverse</span><strong>1 ${vers} = ${formatNum(1 / tauxDirect, 4)} ${de}</strong></div>
    </div>
    <div class="note">Taux fournis par ${_tauxSource}. Mis à jour quotidiennement en semaine.</div>
  `);
}

// ---------- 20. GÉNÉRATEUR DE CV ----------

function cvAjouterExperience() {
  const cont = $('cv-experiences');
  const idx = cont.querySelectorAll('.cv-bloc').length;
  const bloc = document.createElement('div');
  bloc.className = 'cv-bloc';
  bloc.innerHTML = `
    <div class="field-row">
      <div class="field"><label>Poste</label><input type="text" class="cv-exp-poste" placeholder="Développeur Web"></div>
      <div class="field"><label>Entreprise</label><input type="text" class="cv-exp-entreprise" placeholder="Nom de l'entreprise"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Du</label><input type="text" class="cv-exp-debut" placeholder="Sept. 2023"></div>
      <div class="field"><label>Au</label><input type="text" class="cv-exp-fin" placeholder="Actuel"></div>
    </div>
    <div class="field"><label>Description (1-3 lignes)</label><textarea class="cv-exp-desc" rows="2" placeholder="Missions principales, réalisations..."></textarea></div>
    <button class="btn btn-secondary" onclick="this.parentElement.remove()" style="margin-bottom: 16px;">− Supprimer</button>
  `;
  cont.appendChild(bloc);
}

function cvAjouterFormation() {
  const cont = $('cv-formations');
  const bloc = document.createElement('div');
  bloc.className = 'cv-bloc';
  bloc.innerHTML = `
    <div class="field-row">
      <div class="field"><label>Diplôme</label><input type="text" class="cv-form-diplome" placeholder="Master Informatique"></div>
      <div class="field"><label>École / Université</label><input type="text" class="cv-form-ecole" placeholder="Université Paris-Saclay"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Année de début</label><input type="text" class="cv-form-debut" placeholder="2021"></div>
      <div class="field"><label>Année de fin</label><input type="text" class="cv-form-fin" placeholder="2023"></div>
    </div>
    <button class="btn btn-secondary" onclick="this.parentElement.remove()" style="margin-bottom: 16px;">− Supprimer</button>
  `;
  cont.appendChild(bloc);
}

function genererCV() {
  const nom = ($('cv-nom').value || '').trim();
  if (!nom) {
    alert('Indique au moins ton nom.');
    return;
  }
  const titre = ($('cv-titre').value || '').trim();
  const email = ($('cv-email').value || '').trim();
  const tel = ($('cv-tel').value || '').trim();
  const ville = ($('cv-ville').value || '').trim();
  const profil = ($('cv-profil').value || '').trim();
  const competences = ($('cv-competences').value || '').trim();
  const langues = ($('cv-langues').value || '').trim();
  const interets = ($('cv-interets').value || '').trim();

  const experiences = Array.from(document.querySelectorAll('#cv-experiences .cv-bloc')).map(b => ({
    poste: b.querySelector('.cv-exp-poste').value || '',
    entreprise: b.querySelector('.cv-exp-entreprise').value || '',
    debut: b.querySelector('.cv-exp-debut').value || '',
    fin: b.querySelector('.cv-exp-fin').value || '',
    desc: b.querySelector('.cv-exp-desc').value || ''
  })).filter(e => e.poste || e.entreprise);

  const formations = Array.from(document.querySelectorAll('#cv-formations .cv-bloc')).map(b => ({
    diplome: b.querySelector('.cv-form-diplome').value || '',
    ecole: b.querySelector('.cv-form-ecole').value || '',
    debut: b.querySelector('.cv-form-debut').value || '',
    fin: b.querySelector('.cv-form-fin').value || ''
  })).filter(f => f.diplome || f.ecole);

  // Construction du HTML du CV (template épuré)
  const cvHtml = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; padding: 40px 50px; background: white; min-height: 297mm; line-height: 1.5; max-width: 210mm; margin: 0 auto;">
      <header style="border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 28px;">
        <h1 style="margin: 0 0 6px 0; font-size: 32px; font-weight: 400; letter-spacing: -0.5px;">${nom}</h1>
        ${titre ? `<div style="font-size: 16px; color: #666; margin-bottom: 10px;">${titre}</div>` : ''}
        <div style="font-size: 13px; color: #555;">
          ${email ? `<span>✉ ${email}</span>` : ''}
          ${tel ? `<span style="margin-left: 14px;">☎ ${tel}</span>` : ''}
          ${ville ? `<span style="margin-left: 14px;">📍 ${ville}</span>` : ''}
        </div>
      </header>

      ${profil ? `
      <section style="margin-bottom: 26px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 0 0 10px 0;">Profil</h2>
        <p style="margin: 0; font-size: 14px;">${profil}</p>
      </section>` : ''}

      ${experiences.length > 0 ? `
      <section style="margin-bottom: 26px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 0 0 12px 0;">Expériences</h2>
        ${experiences.map(e => `
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong style="font-size: 15px;">${e.poste}${e.entreprise ? ' — ' + e.entreprise : ''}</strong>
              <span style="font-size: 12px; color: #666;">${e.debut}${e.fin ? ' → ' + e.fin : ''}</span>
            </div>
            ${e.desc ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #444;">${e.desc}</p>` : ''}
          </div>
        `).join('')}
      </section>` : ''}

      ${formations.length > 0 ? `
      <section style="margin-bottom: 26px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 0 0 12px 0;">Formation</h2>
        ${formations.map(f => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong style="font-size: 15px;">${f.diplome}</strong>
              <span style="font-size: 12px; color: #666;">${f.debut}${f.fin ? ' → ' + f.fin : ''}</span>
            </div>
            ${f.ecole ? `<div style="font-size: 13px; color: #444;">${f.ecole}</div>` : ''}
          </div>
        `).join('')}
      </section>` : ''}

      ${competences ? `
      <section style="margin-bottom: 26px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 0 0 10px 0;">Compétences</h2>
        <p style="margin: 0; font-size: 14px;">${competences}</p>
      </section>` : ''}

      ${langues ? `
      <section style="margin-bottom: 26px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 0 0 10px 0;">Langues</h2>
        <p style="margin: 0; font-size: 14px;">${langues}</p>
      </section>` : ''}

      ${interets ? `
      <section style="margin-bottom: 26px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 0 0 10px 0;">Centres d'intérêt</h2>
        <p style="margin: 0; font-size: 14px;">${interets}</p>
      </section>` : ''}
    </div>
  `;

  // Génération PDF via html2pdf
  const container = document.createElement('div');
  container.innerHTML = cvHtml;
  document.body.appendChild(container);

  const opt = {
    margin: 0,
    filename: `CV_${nom.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container.firstElementChild).save().then(() => {
    document.body.removeChild(container);
  });
}

// ---------- 21. CAPACITÉ D'EMPRUNT ----------

function calcCapacite() {
  const revenus = parseFloat($('cap-revenus').value);
  const charges = parseFloat($('cap-charges').value) || 0;
  const taux = parseFloat($('cap-taux').value);
  const duree = parseInt($('cap-duree').value, 10);
  const assurance = parseFloat($('cap-assurance').value) || 0.35;

  if (isNaN(revenus) || isNaN(taux) || isNaN(duree) || revenus <= 0) {
    showResult('cap-result', '<div class="note">⚠ Remplis revenus, taux et durée.</div>');
    return;
  }

  // Règle HCSF: 35% d'endettement max
  const mensualiteMax = revenus * 0.35 - charges;
  if (mensualiteMax <= 0) {
    showResult('cap-result', '<div class="note">⚠ Tes charges actuelles atteignent déjà 35% de tes revenus. Aucune capacité d\'emprunt supplémentaire.</div>');
    return;
  }

  // Décomposer mensualité = remboursement + assurance
  // assurance mensuelle = (assurance/100) × capital / 12
  // mensualité_remb = capital × tauxM / (1 - (1+tauxM)^-n)
  // mensualité_max = mensualité_remb + assurance × capital / 1200
  // => capital × [tauxM / (1 - (1+tauxM)^-n) + assurance/1200] = mensualité_max
  const tauxM = taux / 100 / 12;
  const n = duree * 12;
  let facteur;
  if (tauxM === 0) {
    facteur = 1 / n + assurance / 1200;
  } else {
    facteur = tauxM / (1 - Math.pow(1 + tauxM, -n)) + assurance / 1200;
  }
  const capital = mensualiteMax / facteur;

  const mensualiteAssurance = (assurance / 100) * capital / 12;
  const mensualiteRemb = mensualiteMax - mensualiteAssurance;
  const coutTotal = mensualiteRemb * n - capital + mensualiteAssurance * n;

  showResult('cap-result', `
    <div class="result-label">Capacité d'emprunt maximale</div>
    <div class="result-value">${formatEur(capital)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Mensualité totale (avec assurance)</span><strong>${formatEur(mensualiteMax)} / mois</strong></div>
      <div class="result-detail-row"><span>Dont mensualité crédit</span><strong>${formatEur(mensualiteRemb)}</strong></div>
      <div class="result-detail-row"><span>Dont assurance mensuelle</span><strong>${formatEur(mensualiteAssurance)}</strong></div>
      <div class="result-detail-row"><span>Coût total du crédit</span><strong>${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>Taux d'endettement appliqué</span><strong>35 %</strong></div>
    </div>
    <div class="note">Calcul basé sur la règle HCSF (35% max d'endettement). Les banques peuvent déroger pour 20% de leurs dossiers (primo-accédants notamment).</div>
  `);
}

// ---------- 22. FRAIS DE NOTAIRE ----------

function calcNotaire() {
  const prix = parseFloat($('not-prix').value);
  const type = $('not-type').value;

  if (isNaN(prix) || prix <= 0) {
    showResult('not-result', '<div class="note">⚠ Indique le prix d\'achat.</div>');
    return;
  }

  // Calcul détaillé
  // Émoluments du notaire (tarif réglementé, dégressif)
  function emolumentsNotaire(p) {
    // Tranches 2024 (proportionnelles, art. A. 444-91 CCom)
    const tranches = [
      { jusqu: 6500, taux: 0.0395 },
      { jusqu: 17000, taux: 0.01627 },
      { jusqu: 60000, taux: 0.01085 },
      { jusqu: Infinity, taux: 0.00814 }
    ];
    let restant = p;
    let total = 0;
    let dernierSeuil = 0;
    for (const t of tranches) {
      const portion = Math.min(restant, t.jusqu - dernierSeuil);
      if (portion <= 0) break;
      total += portion * t.taux;
      restant -= portion;
      dernierSeuil = t.jusqu;
      if (restant <= 0) break;
    }
    return total;
  }

  let droitsEnregistrement, debours, contribSecurite, totalFrais;
  const emoluments = emolumentsNotaire(prix);
  debours = 1200; // estimation moyenne
  contribSecurite = prix * 0.001; // contribution sécurité immobilière (~0.1%)

  if (type === 'ancien') {
    // Droits de mutation: 5.80% (DMTO 4.50% + taxe communale 1.20% + frais d'assiette)
    droitsEnregistrement = prix * 0.0581;
  } else {
    // Neuf: TVA 20% déjà incluse dans le prix, droits réduits à 0.715%
    droitsEnregistrement = prix * 0.00715;
  }

  totalFrais = emoluments + droitsEnregistrement + debours + contribSecurite;
  const pourcentage = (totalFrais / prix) * 100;
  const coutTotal = prix + totalFrais;

  showResult('not-result', `
    <div class="result-label">Frais de notaire estimés</div>
    <div class="result-value">${formatEur(totalFrais)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Soit en % du prix d'achat</span><strong>${formatNum(pourcentage, 2)} %</strong></div>
      <div class="result-detail-row"><span>Droits d'enregistrement (État + département)</span><strong>${formatEur(droitsEnregistrement)}</strong></div>
      <div class="result-detail-row"><span>Émoluments du notaire</span><strong>${formatEur(emoluments)}</strong></div>
      <div class="result-detail-row"><span>Débours et formalités</span><strong>${formatEur(debours)}</strong></div>
      <div class="result-detail-row"><span>Contribution sécurité immobilière</span><strong>${formatEur(contribSecurite)}</strong></div>
      <div class="result-detail-row"><span>Coût total d'acquisition (prix + frais)</span><strong>${formatEur(coutTotal)}</strong></div>
    </div>
    <div class="note">Calcul indicatif basé sur les barèmes en vigueur. Les frais réels peuvent varier de ±10% selon la commune (taux DMTO départemental) et les frais annexes.</div>
  `);
}

// ---------- 23. TABLEAU D'AMORTISSEMENT DÉTAILLÉ ----------

function calcAmortissement() {
  const capital = parseFloat($('amt-capital').value);
  const taux = parseFloat($('amt-taux').value);
  const duree = parseInt($('amt-duree').value, 10);
  const granularite = $('amt-granularite').value;

  if (isNaN(capital) || isNaN(taux) || isNaN(duree) || capital <= 0) {
    showResult('amt-result', '<div class="note">⚠ Remplis tous les champs.</div>');
    return;
  }

  const tauxM = taux / 100 / 12;
  const n = duree * 12;
  let mensualite;
  if (tauxM === 0) {
    mensualite = capital / n;
  } else {
    mensualite = capital * tauxM / (1 - Math.pow(1 + tauxM, -n));
  }

  // Génération du tableau
  let capitalRestant = capital;
  const lignes = [];
  let interetsTotal = 0;

  if (granularite === 'mois') {
    for (let m = 1; m <= n; m++) {
      const interet = capitalRestant * tauxM;
      const capRemb = mensualite - interet;
      capitalRestant -= capRemb;
      interetsTotal += interet;
      lignes.push({
        periode: m,
        mensualite: mensualite,
        interet: interet,
        capital: capRemb,
        crd: Math.max(0, capitalRestant)
      });
    }
  } else {
    for (let annee = 1; annee <= duree; annee++) {
      let interetA = 0, capitalA = 0;
      for (let m = 0; m < 12; m++) {
        const interet = capitalRestant * tauxM;
        const capRemb = mensualite - interet;
        interetA += interet;
        capitalA += capRemb;
        capitalRestant -= capRemb;
      }
      interetsTotal += interetA;
      lignes.push({
        periode: annee,
        mensualite: mensualite * 12,
        interet: interetA,
        capital: capitalA,
        crd: Math.max(0, capitalRestant)
      });
    }
  }

  // Construire le tableau HTML
  const periodeLabel = granularite === 'mois' ? 'Mois' : 'Année';
  const colMensualite = granularite === 'mois' ? 'Mensualité' : 'Total annuel';
  let tableHtml = `<table style="font-size: 13px; margin-top: 12px;">
    <thead><tr><th>${periodeLabel}</th><th>${colMensualite}</th><th>Intérêts</th><th>Capital</th><th>Capital restant</th></tr></thead>
    <tbody>`;
  // Limiter affichage pour mensuel à 60 lignes (5 ans)
  const limit = granularite === 'mois' ? Math.min(60, lignes.length) : lignes.length;
  for (let i = 0; i < limit; i++) {
    const l = lignes[i];
    tableHtml += `<tr><td>${l.periode}</td><td>${formatEur(l.mensualite)}</td><td>${formatEur(l.interet)}</td><td>${formatEur(l.capital)}</td><td>${formatEur(l.crd)}</td></tr>`;
  }
  tableHtml += '</tbody></table>';
  if (granularite === 'mois' && lignes.length > 60) {
    tableHtml += `<div class="note">Affichage limité aux 60 premiers mois (5 ans). Passe en vue annuelle pour voir tout.</div>`;
  }

  showResult('amt-result', `
    <div class="result-label">Mensualité fixe</div>
    <div class="result-value">${formatEur(mensualite)} / mois</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Capital emprunté</span><strong>${formatEur(capital)}</strong></div>
      <div class="result-detail-row"><span>Coût total des intérêts</span><strong>${formatEur(interetsTotal)}</strong></div>
      <div class="result-detail-row"><span>Coût total remboursé</span><strong>${formatEur(capital + interetsTotal)}</strong></div>
    </div>
    ${tableHtml}
  `);
}

// ---------- 24. RENTABILITÉ LOCATIVE ----------

function calcRentabilite() {
  const prix = parseFloat($('loc-prix').value);
  const loyer = parseFloat($('loc-loyer').value);
  const charges = parseFloat($('loc-charges').value) || 0;
  const taxeFonciere = parseFloat($('loc-taxe').value) || 0;
  const fraisAcquisition = parseFloat($('loc-frais').value) || 0;

  if (isNaN(prix) || isNaN(loyer) || prix <= 0 || loyer <= 0) {
    showResult('loc-result', '<div class="note">⚠ Remplis au moins le prix d\'achat et le loyer.</div>');
    return;
  }

  const investissementTotal = prix + fraisAcquisition;
  const loyerAnnuel = loyer * 12;

  // Rentabilité brute
  const rentaBrute = (loyerAnnuel / investissementTotal) * 100;

  // Rentabilité nette de charges (charges + taxe foncière)
  const chargesAnnuelles = charges + taxeFonciere;
  const loyerNet = loyerAnnuel - chargesAnnuelles;
  const rentaNette = (loyerNet / investissementTotal) * 100;

  // Cash flow mensuel (sans crédit pour simplifier)
  const cashFlowMensuel = loyer - (chargesAnnuelles / 12);

  let avis = '';
  if (rentaNette < 3) avis = '🔴 Faible — typique des grandes métropoles (Paris). Compte sur la plus-value à long terme plutôt que sur les loyers.';
  else if (rentaNette < 5) avis = '🟡 Correcte — équilibre entre risque et rendement, courant en banlieue ou villes moyennes.';
  else if (rentaNette < 7) avis = '🟢 Bonne rentabilité — typique des villes moyennes ou colocations.';
  else avis = '🟢 Très bonne rentabilité — vérifie qu\'il n\'y a pas de risque caché (quartier dévalorisé, travaux à prévoir, vacance locative élevée).';

  showResult('loc-result', `
    <div class="result-label">Rentabilité nette annuelle</div>
    <div class="result-value">${formatNum(rentaNette, 2)} %</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Rentabilité brute</span><strong>${formatNum(rentaBrute, 2)} %</strong></div>
      <div class="result-detail-row"><span>Loyer annuel</span><strong>${formatEur(loyerAnnuel)}</strong></div>
      <div class="result-detail-row"><span>Charges + taxe foncière</span><strong>${formatEur(chargesAnnuelles)}</strong></div>
      <div class="result-detail-row"><span>Loyer net annuel</span><strong>${formatEur(loyerNet)}</strong></div>
      <div class="result-detail-row"><span>Cash flow mensuel (avant crédit)</span><strong>${formatEur(cashFlowMensuel)}</strong></div>
      <div class="result-detail-row"><span>Investissement total</span><strong>${formatEur(investissementTotal)}</strong></div>
    </div>
    <div class="note">${avis}</div>
    <div class="note" style="margin-top:8px;">⚠ Calcul simplifié. Une vraie analyse inclut aussi : mensualité crédit, fiscalité (revenus fonciers ou LMNP), assurance PNO, vacance locative, frais de gestion, travaux.</div>
  `);
}

// ---------- 25. INTÉRÊTS COMPOSÉS ----------

function calcInterets() {
  const initial = parseFloat($('int-initial').value) || 0;
  const versement = parseFloat($('int-versement').value) || 0;
  const taux = parseFloat($('int-taux').value);
  const duree = parseInt($('int-duree').value, 10);

  if (isNaN(taux) || isNaN(duree) || duree <= 0 || (initial === 0 && versement === 0)) {
    showResult('int-result', '<div class="note">⚠ Remplis taux, durée, et au moins un versement.</div>');
    return;
  }

  // Capitalisation mensuelle
  const r = taux / 100 / 12;
  const n = duree * 12;
  // C_final = C0(1+r)^n + V × ((1+r)^n - 1) / r
  let capitalFinal;
  if (r === 0) {
    capitalFinal = initial + versement * n;
  } else {
    capitalFinal = initial * Math.pow(1 + r, n) + versement * (Math.pow(1 + r, n) - 1) / r;
  }
  const totalVerse = initial + versement * n;
  const interets = capitalFinal - totalVerse;

  // Génération du tableau année par année
  let cap = initial;
  let tableHtml = `<table style="font-size: 13px; margin-top: 12px;">
    <thead><tr><th>Année</th><th>Versements cumulés</th><th>Capital total</th><th>Intérêts cumulés</th></tr></thead>
    <tbody>`;
  for (let a = 1; a <= duree; a++) {
    for (let m = 0; m < 12; m++) {
      cap = cap * (1 + r) + versement;
    }
    const verses = initial + versement * 12 * a;
    tableHtml += `<tr><td>${a}</td><td>${formatEur(verses)}</td><td>${formatEur(cap)}</td><td>${formatEur(cap - verses)}</td></tr>`;
    if (a > 30) break; // Limiter à 30 ans pour éviter table énorme
  }
  tableHtml += '</tbody></table>';

  showResult('int-result', `
    <div class="result-label">Capital final estimé</div>
    <div class="result-value">${formatEur(capitalFinal)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Total versé</span><strong>${formatEur(totalVerse)}</strong></div>
      <div class="result-detail-row"><span>Intérêts générés</span><strong>${formatEur(interets)}</strong></div>
      <div class="result-detail-row"><span>Rapport intérêts / versé</span><strong>${formatNum((interets / totalVerse) * 100, 1)} %</strong></div>
    </div>
    ${tableHtml}
    <div class="note">⚠ Hypothèse : taux constant et capitalisation mensuelle. La fiscalité (prélèvements sociaux, IR) n'est pas prise en compte.</div>
  `);
}

// ---------- 26. TJM FREELANCE ----------

function calcTJM() {
  const salaireNet = parseFloat($('tjm-salaire').value);
  const statut = $('tjm-statut').value;
  const joursTravailles = parseInt($('tjm-jours').value, 10) || 218;

  if (isNaN(salaireNet) || salaireNet <= 0) {
    showResult('tjm-result', '<div class="note">⚠ Indique le salaire net souhaité.</div>');
    return;
  }

  // Charges sociales selon statut
  let chargesPourcentage, fraisFixes;
  if (statut === 'auto') {
    chargesPourcentage = 0.22; // Auto-entrepreneur services BNC
    fraisFixes = 0;
  } else if (statut === 'eurl') {
    chargesPourcentage = 0.45; // Travailleur non salarié (TNS)
    fraisFixes = 0;
  } else { // sasu
    chargesPourcentage = 0.65; // Cotisations + IR ~65% pour atteindre net
    fraisFixes = 100;
  }

  // CA HT mensuel nécessaire
  const caMensuelMin = (salaireNet + fraisFixes) / (1 - chargesPourcentage);
  const caAnnuelMin = caMensuelMin * 12;

  // Jours facturables = jours travaillés - congés - intercontrats
  const joursFacturables = joursTravailles - 25 - 10; // 25 jours congés, 10 jours formation/intercontrat
  const tjmMin = caAnnuelMin / Math.max(joursFacturables, 100);

  // Recommandations TJM selon métier
  const tjmConfortable = tjmMin * 1.2;
  const tjmPremium = tjmMin * 1.5;

  showResult('tjm-result', `
    <div class="result-label">TJM minimum à facturer</div>
    <div class="result-value">${formatEur(tjmMin)} <span class="unit">HT/jour</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Pour atteindre ${formatEur(salaireNet)} net/mois</span><strong></strong></div>
      <div class="result-detail-row"><span>CA annuel HT minimum</span><strong>${formatEur(caAnnuelMin)}</strong></div>
      <div class="result-detail-row"><span>Jours facturables retenus</span><strong>${joursFacturables} jours</strong></div>
      <div class="result-detail-row"><span>Charges sociales estimées</span><strong>${Math.round(chargesPourcentage * 100)} %</strong></div>
      <div class="result-detail-row"><span>TJM confortable (+ marge)</span><strong>${formatEur(tjmConfortable)}</strong></div>
      <div class="result-detail-row"><span>TJM premium (expérience+ )</span><strong>${formatEur(tjmPremium)}</strong></div>
    </div>
    <div class="note">⚠ Estimation indicative. Le TJM réel dépend de ton métier, ton expérience, ta région, et ton positionnement. À ajuster avec ton expert-comptable.</div>
  `);
}

// ---------- 27. CALCULATEUR D'ÂGE ----------

function calcAge() {
  const dateStr = $('age-date').value;
  if (!dateStr) {
    showResult('age-result', '<div class="note">⚠ Indique ta date de naissance.</div>');
    return;
  }

  const naissance = new Date(dateStr);
  const today = new Date();

  if (naissance > today) {
    showResult('age-result', '<div class="note">⚠ Tu ne peux pas être né dans le futur.</div>');
    return;
  }

  // Calcul détaillé
  let ans = today.getFullYear() - naissance.getFullYear();
  let mois = today.getMonth() - naissance.getMonth();
  let jours = today.getDate() - naissance.getDate();

  if (jours < 0) {
    mois--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    jours += lastMonth.getDate();
  }
  if (mois < 0) {
    ans--;
    mois += 12;
  }

  const diffMs = today - naissance;
  const totalJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHeures = Math.floor(diffMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalSecondes = Math.floor(diffMs / 1000);
  const totalSemaines = Math.floor(totalJours / 7);
  const totalMois = ans * 12 + mois;

  // Prochain anniversaire
  let prochainAnniv = new Date(today.getFullYear(), naissance.getMonth(), naissance.getDate());
  if (prochainAnniv < today) {
    prochainAnniv = new Date(today.getFullYear() + 1, naissance.getMonth(), naissance.getDate());
  }
  const joursAvantAnniv = Math.ceil((prochainAnniv - today) / (1000 * 60 * 60 * 24));

  // Jour de naissance (jour de la semaine)
  const joursSem = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const jourNaissance = joursSem[naissance.getDay()];

  showResult('age-result', `
    <div class="result-label">Tu as exactement</div>
    <div class="result-value">${ans} ans, ${mois} mois et ${jours} jours</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Total mois</span><strong>${formatNum(totalMois, 0)}</strong></div>
      <div class="result-detail-row"><span>Total semaines</span><strong>${formatNum(totalSemaines, 0)}</strong></div>
      <div class="result-detail-row"><span>Total jours</span><strong>${formatNum(totalJours, 0)}</strong></div>
      <div class="result-detail-row"><span>Total heures</span><strong>${formatNum(totalHeures, 0)}</strong></div>
      <div class="result-detail-row"><span>Total minutes</span><strong>${formatNum(totalMinutes, 0)}</strong></div>
      <div class="result-detail-row"><span>Total secondes</span><strong>${formatNum(totalSecondes, 0)}</strong></div>
      <div class="result-detail-row"><span>Tu es né(e) un</span><strong>${jourNaissance}</strong></div>
      <div class="result-detail-row"><span>Prochain anniversaire</span><strong>dans ${joursAvantAnniv} jour${joursAvantAnniv > 1 ? 's' : ''}</strong></div>
    </div>
  `);
}

// ---------- 28. JOURS ENTRE 2 DATES ----------

function calcDates() {
  const debut = new Date($('dates-debut').value);
  const fin = new Date($('dates-fin').value);

  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    showResult('dates-result', '<div class="note">⚠ Remplis les deux dates.</div>');
    return;
  }

  const ms = Math.abs(fin - debut);
  const jours = Math.round(ms / (1000 * 60 * 60 * 24));
  const semaines = Math.floor(jours / 7);
  const annees = Math.floor(jours / 365.25);
  const mois = Math.floor(jours / 30.44);

  // Jours ouvrés (lundi à vendredi)
  let joursOuvres = 0;
  const start = new Date(Math.min(debut, fin));
  const end = new Date(Math.max(debut, fin));
  const cur = new Date(start);
  while (cur < end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) joursOuvres++;
    cur.setDate(cur.getDate() + 1);
  }

  const heures = jours * 24;
  const minutes = jours * 24 * 60;

  showResult('dates-result', `
    <div class="result-label">Durée entre les 2 dates</div>
    <div class="result-value">${formatNum(jours, 0)} jours</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Soit en années</span><strong>${formatNum(annees, 1)} ans</strong></div>
      <div class="result-detail-row"><span>Soit en mois</span><strong>${formatNum(mois, 0)} mois</strong></div>
      <div class="result-detail-row"><span>Soit en semaines</span><strong>${formatNum(semaines, 0)} semaines</strong></div>
      <div class="result-detail-row"><span>Jours ouvrés (lun-ven)</span><strong>${formatNum(joursOuvres, 0)}</strong></div>
      <div class="result-detail-row"><span>Jours weekend</span><strong>${formatNum(jours - joursOuvres, 0)}</strong></div>
      <div class="result-detail-row"><span>Total heures</span><strong>${formatNum(heures, 0)}</strong></div>
      <div class="result-detail-row"><span>Total minutes</span><strong>${formatNum(minutes, 0)}</strong></div>
    </div>
    <div class="note">Calcul des jours ouvrés simplifié (lun-ven). Ne prend pas en compte les jours fériés français.</div>
  `);
}

// ---------- 29. DATE D'ACCOUCHEMENT ----------

function calcAccouchement() {
  const dateStr = $('acc-date').value;
  const mode = $('acc-mode').value;
  if (!dateStr) {
    showResult('acc-result', '<div class="note">⚠ Indique une date.</div>');
    return;
  }

  let dateBase = new Date(dateStr);
  let dateConception, dateDDR, dateAccouchement;

  if (mode === 'ddr') {
    // Date des dernières règles → accouchement = DDR + 280j (40 semaines)
    dateDDR = dateBase;
    dateAccouchement = new Date(dateBase.getTime() + 280 * 24 * 60 * 60 * 1000);
    dateConception = new Date(dateBase.getTime() + 14 * 24 * 60 * 60 * 1000);
  } else {
    // Date de conception → accouchement = conception + 266j
    dateConception = dateBase;
    dateAccouchement = new Date(dateBase.getTime() + 266 * 24 * 60 * 60 * 1000);
    dateDDR = new Date(dateBase.getTime() - 14 * 24 * 60 * 60 * 1000);
  }

  const today = new Date();
  const joursDepuisDDR = Math.floor((today - dateDDR) / (1000 * 60 * 60 * 24));
  const semainesAmen = Math.floor(joursDepuisDDR / 7);
  const joursAmen = joursDepuisDDR % 7;

  const joursRestants = Math.floor((dateAccouchement - today) / (1000 * 60 * 60 * 24));
  const semainesRestantes = Math.floor(joursRestants / 7);

  let trimestre;
  if (semainesAmen < 15) trimestre = '1er trimestre';
  else if (semainesAmen < 28) trimestre = '2e trimestre';
  else trimestre = '3e trimestre';

  const fmtDate = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  let progression = '';
  if (joursRestants > 0) {
    progression = `<div class="result-detail-row"><span>Trimestre actuel</span><strong>${trimestre}</strong></div>
                   <div class="result-detail-row"><span>Semaines d'aménorrhée</span><strong>${semainesAmen} SA + ${joursAmen}j</strong></div>
                   <div class="result-detail-row"><span>Jours restants estimés</span><strong>${joursRestants} jours (${semainesRestantes} sem.)</strong></div>`;
  } else if (joursRestants > -14) {
    progression = `<div class="result-detail-row"><span>Statut</span><strong>Terme atteint ou dépassé</strong></div>`;
  } else {
    progression = `<div class="result-detail-row"><span>Statut</span><strong>Date d'accouchement passée — félicitations 👶</strong></div>`;
  }

  showResult('acc-result', `
    <div class="result-label">Date d'accouchement estimée</div>
    <div class="result-value" style="font-size: 22px;">${fmtDate(dateAccouchement)}</div>
    <div class="result-detail">
      ${progression}
      <div class="result-detail-row"><span>Date de conception estimée</span><strong>${fmtDate(dateConception)}</strong></div>
      <div class="result-detail-row"><span>Date des dernières règles</span><strong>${fmtDate(dateDDR)}</strong></div>
    </div>
    <div class="note">⚠ Estimation indicative basée sur un cycle de 28 jours et un terme de 40 SA. Seul un suivi médical (échographie de datation) donne la date précise.</div>
  `);
}

// ---------- 30. CALCUL MENTAL (mini-jeu) ----------

let _cmEtat = null;

function cmDemarrer() {
  const niveau = $('cm-niveau').value;
  const duree = parseInt($('cm-duree').value, 10) || 60;

  _cmEtat = {
    niveau,
    duree,
    debut: Date.now(),
    score: 0,
    bonnesReponses: 0,
    mauvaisesReponses: 0,
    operation: null,
    reponse: null
  };

  $('cm-config').style.display = 'none';
  $('cm-jeu').style.display = 'block';
  $('cm-resultats').style.display = 'none';

  cmGenererOperation();
  cmTickTimer();
}

function cmGenererOperation() {
  if (!_cmEtat) return;
  const niveau = _cmEtat.niveau;
  let a, b, op, resultat;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const ops = niveau === 'facile' ? ['+', '-'] : (niveau === 'moyen' ? ['+', '-', '×'] : ['+', '-', '×', '÷']);
  op = ops[rand(0, ops.length - 1)];

  if (niveau === 'facile') {
    a = rand(1, 20); b = rand(1, 20);
  } else if (niveau === 'moyen') {
    a = rand(1, 50); b = rand(1, 12);
  } else {
    a = rand(2, 99); b = rand(2, 15);
  }

  if (op === '+') resultat = a + b;
  else if (op === '-') { if (b > a) [a, b] = [b, a]; resultat = a - b; }
  else if (op === '×') resultat = a * b;
  else { // ÷
    resultat = a;
    a = a * b;
    // a est maintenant le dividende, résultat est le quotient entier
  }

  _cmEtat.operation = `${a} ${op} ${b}`;
  _cmEtat.reponse = resultat;

  $('cm-operation').textContent = _cmEtat.operation;
  $('cm-input').value = '';
  $('cm-input').focus();
}

function cmValider() {
  if (!_cmEtat) return;
  const val = parseFloat($('cm-input').value);
  if (isNaN(val)) return;

  if (val === _cmEtat.reponse) {
    _cmEtat.bonnesReponses++;
    _cmEtat.score += 10;
    $('cm-feedback').innerHTML = '<span style="color:#10b981;">✓ Bonne réponse !</span>';
  } else {
    _cmEtat.mauvaisesReponses++;
    _cmEtat.score = Math.max(0, _cmEtat.score - 3);
    $('cm-feedback').innerHTML = `<span style="color:#dc2626;">✗ La bonne réponse était ${_cmEtat.reponse}</span>`;
  }

  setTimeout(() => { $('cm-feedback').innerHTML = ''; }, 800);

  $('cm-score').textContent = _cmEtat.score;
  $('cm-bonnes').textContent = _cmEtat.bonnesReponses;
  $('cm-mauvaises').textContent = _cmEtat.mauvaisesReponses;

  cmGenererOperation();
}

function cmTickTimer() {
  if (!_cmEtat) return;
  const restant = _cmEtat.duree - Math.floor((Date.now() - _cmEtat.debut) / 1000);
  if (restant <= 0) {
    cmFinir();
    return;
  }
  $('cm-timer').textContent = restant + 's';
  setTimeout(cmTickTimer, 200);
}

function cmFinir() {
  if (!_cmEtat) return;
  const total = _cmEtat.bonnesReponses + _cmEtat.mauvaisesReponses;
  const precision = total > 0 ? Math.round(_cmEtat.bonnesReponses / total * 100) : 0;

  let mention = '';
  if (_cmEtat.bonnesReponses >= 30) mention = '🏆 Excellent ! T\'es un crack du calcul mental';
  else if (_cmEtat.bonnesReponses >= 20) mention = '🥇 Très bon score !';
  else if (_cmEtat.bonnesReponses >= 10) mention = '👍 Bien joué, continue à t\'entraîner';
  else mention = '💪 Pas mal pour commencer, le calcul mental se travaille';

  $('cm-jeu').style.display = 'none';
  $('cm-resultats').innerHTML = `
    <div class="result visible">
      <div class="result-label">Partie terminée</div>
      <div class="result-value">${_cmEtat.bonnesReponses} bonnes réponses</div>
      <div class="result-detail">
        <div class="result-detail-row"><span>Score total</span><strong>${_cmEtat.score} pts</strong></div>
        <div class="result-detail-row"><span>Mauvaises réponses</span><strong>${_cmEtat.mauvaisesReponses}</strong></div>
        <div class="result-detail-row"><span>Précision</span><strong>${precision} %</strong></div>
        <div class="result-detail-row"><span>Vitesse</span><strong>${total > 0 ? Math.round(_cmEtat.duree / total * 10) / 10 : 0} sec/calcul</strong></div>
        <div class="result-detail-row"><span>Évaluation</span><strong>${mention}</strong></div>
      </div>
      <button class="btn" onclick="cmReset()">🔄 Rejouer</button>
    </div>
  `;
  $('cm-resultats').style.display = 'block';
  _cmEtat = null;
}

function cmReset() {
  $('cm-config').style.display = 'block';
  $('cm-jeu').style.display = 'none';
  $('cm-resultats').style.display = 'none';
}

// ---------- 31. PLUS-VALUE IMMOBILIÈRE ----------

function calcPlusValue() {
  const prixAchat = parseFloat($('pv-achat').value);
  const fraisAchat = parseFloat($('pv-frais-achat').value) || 0;
  const travaux = parseFloat($('pv-travaux').value) || 0;
  const prixVente = parseFloat($('pv-vente').value);
  const fraisVente = parseFloat($('pv-frais-vente').value) || 0;
  const annees = parseInt($('pv-annees').value, 10);
  const residence = $('pv-residence').value;

  if (isNaN(prixAchat) || isNaN(prixVente) || isNaN(annees)) {
    showResult('pv-result', '<div class="note">⚠ Remplis tous les champs obligatoires.</div>');
    return;
  }

  // Prix de revient = achat + frais (forfait 7,5% si non détaillés) + travaux (forfait 15% si détention >5 ans)
  const prixRevient = prixAchat + fraisAchat + travaux;
  const prixNetVendeur = prixVente - fraisVente;
  const plusValueBrute = prixNetVendeur - prixRevient;

  if (residence === 'principale') {
    showResult('pv-result', `
      <div class="result-label">Résidence principale = exonération totale</div>
      <div class="result-value">${formatEur(Math.max(0, plusValueBrute))}</div>
      <div class="result-detail">
        <div class="result-detail-row"><span>Plus-value brute</span><strong>${formatEur(plusValueBrute)}</strong></div>
        <div class="result-detail-row"><span>Impôt sur la plus-value</span><strong style="color:#10b981;">0 € (exonéré)</strong></div>
        <div class="result-detail-row"><span>Tu encaisses</span><strong>${formatEur(prixNetVendeur)}</strong></div>
      </div>
      <div class="note">✓ La vente de la résidence principale est totalement exonérée d'impôt sur la plus-value (article 150 U du CGI).</div>
    `);
    return;
  }

  if (plusValueBrute <= 0) {
    showResult('pv-result', `
      <div class="result-label">Moins-value (perte)</div>
      <div class="result-value" style="color:#dc2626;">${formatEur(plusValueBrute)}</div>
      <div class="note">Aucune imposition. Une moins-value sur l'immobilier ne se reporte pas sur d'autres revenus.</div>
    `);
    return;
  }

  // Abattements pour durée de détention
  function abattementIR(annees) {
    if (annees < 6) return 0;
    if (annees < 22) return Math.min(1, (annees - 5) * 0.06);
    return 1;
  }
  function abattementPS(annees) {
    if (annees < 6) return 0;
    if (annees < 22) return (annees - 5) * 0.0165;
    if (annees < 30) return (22 - 5) * 0.0165 + 0.016 + (annees - 22) * 0.09;
    return 1;
  }

  const abatIR = abattementIR(annees);
  const abatPS = abattementPS(annees);
  const pvImposableIR = plusValueBrute * (1 - abatIR);
  const pvImposablePS = plusValueBrute * (1 - abatPS);
  const ir = pvImposableIR * 0.19;
  const ps = pvImposablePS * 0.172;
  
  // Surtaxe pour grosses plus-values
  let surtaxe = 0;
  if (pvImposableIR > 50000) {
    if (pvImposableIR < 60000) surtaxe = (pvImposableIR - 50000) * 0.02;
    else if (pvImposableIR < 100000) surtaxe = pvImposableIR * 0.02;
    else if (pvImposableIR < 110000) surtaxe = pvImposableIR * 0.03 - 1100;
    else if (pvImposableIR < 150000) surtaxe = pvImposableIR * 0.03;
    else if (pvImposableIR < 160000) surtaxe = pvImposableIR * 0.04 - 1500;
    else if (pvImposableIR < 250000) surtaxe = pvImposableIR * 0.04;
    else if (pvImposableIR < 260000) surtaxe = pvImposableIR * 0.05 - 2500;
    else surtaxe = pvImposableIR * 0.06 - 5100;
    surtaxe = Math.max(0, surtaxe);
  }

  const totalImpot = ir + ps + surtaxe;
  const netVendeur = prixNetVendeur - totalImpot;

  showResult('pv-result', `
    <div class="result-label">Plus-value imposable et net après impôts</div>
    <div class="result-value">${formatEur(plusValueBrute - totalImpot)} <span class="unit">net après impôts</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Plus-value brute</span><strong>${formatEur(plusValueBrute)}</strong></div>
      <div class="result-detail-row"><span>Abattement IR (durée ${annees} ans)</span><strong>${formatNum(abatIR * 100, 1)} %</strong></div>
      <div class="result-detail-row"><span>Abattement prélèv. sociaux</span><strong>${formatNum(abatPS * 100, 1)} %</strong></div>
      <div class="result-detail-row"><span>Impôt sur le revenu (19%)</span><strong>${formatEur(ir)}</strong></div>
      <div class="result-detail-row"><span>Prélèvements sociaux (17,2%)</span><strong>${formatEur(ps)}</strong></div>
      ${surtaxe > 0 ? `<div class="result-detail-row"><span>Surtaxe (>50k€)</span><strong>${formatEur(surtaxe)}</strong></div>` : ''}
      <div class="result-detail-row"><span><strong>Total impôts à payer</strong></span><strong>${formatEur(totalImpot)}</strong></div>
      <div class="result-detail-row"><span><strong>Net reçu par le vendeur</strong></span><strong>${formatEur(netVendeur)}</strong></div>
    </div>
    <div class="note">${annees >= 22 ? '✓ Exonération IR atteinte (22 ans).' : ''} ${annees >= 30 ? '✓ Exonération totale (30 ans).' : 'Exonération totale à 30 ans.'}</div>
  `);
}

// ---------- 32. INDEMNITÉ DE LICENCIEMENT ----------

function calcIndemniteLicenciement() {
  const salaire = parseFloat($('lic-salaire').value);
  const anciennete = parseFloat($('lic-anciennete').value);
  const motif = $('lic-motif').value;

  if (isNaN(salaire) || isNaN(anciennete) || salaire <= 0) {
    showResult('lic-result', '<div class="note">⚠ Remplis le salaire et l\'ancienneté.</div>');
    return;
  }

  if (anciennete < 0.66) {
    showResult('lic-result', `
      <div class="result-label">Aucune indemnité légale</div>
      <div class="result-value">0 €</div>
      <div class="note">⚠ L'indemnité légale de licenciement nécessite au moins <strong>8 mois d'ancienneté</strong> (depuis 2017). Tu n'en bénéficies pas. Toutefois, ta convention collective peut prévoir mieux.</div>
    `);
    return;
  }

  // Indemnité légale: 1/4 mois par année pour les 10 premières, 1/3 mois au-delà
  let indemniteLegale;
  if (anciennete <= 10) {
    indemniteLegale = salaire * (1/4) * anciennete;
  } else {
    indemniteLegale = salaire * (1/4) * 10 + salaire * (1/3) * (anciennete - 10);
  }

  let texte = '';
  if (motif === 'economique') {
    texte = '<strong>Licenciement économique</strong> : ton indemnité légale ci-dessous. Ta convention collective peut prévoir des montants plus favorables. Tu as aussi droit au CSP (Contrat de Sécurisation Professionnelle) avec 75% de ton ancien salaire pendant 12 mois.';
  } else if (motif === 'cause_reelle') {
    texte = '<strong>Cause réelle et sérieuse</strong> : indemnité légale calculée. Si le licenciement est jugé sans cause réelle aux prud\'hommes, indemnités supplémentaires possibles (barème Macron : 0,5 à 20 mois selon ancienneté).';
  } else {
    texte = '<strong>Faute grave/lourde</strong> : aucune indemnité due par l\'employeur. Tu peux contester aux prud\'hommes si tu estimes la qualification injustifiée.';
    indemniteLegale = 0;
  }

  showResult('lic-result', `
    <div class="result-label">Indemnité légale minimum</div>
    <div class="result-value">${formatEur(indemniteLegale)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Salaire mensuel de référence</span><strong>${formatEur(salaire)}</strong></div>
      <div class="result-detail-row"><span>Ancienneté</span><strong>${formatNum(anciennete, 1)} ans</strong></div>
      <div class="result-detail-row"><span>Calcul</span><strong>${anciennete <= 10 ? '1/4 mois × ancienneté' : '1/4 × 10 ans + 1/3 × surplus'}</strong></div>
    </div>
    <div class="note">${texte}</div>
    <div class="note" style="margin-top:8px;">⚠ Vérifie ta <strong>convention collective</strong> : elle peut prévoir une indemnité plus favorable. L'indemnité conventionnelle s'applique si elle est supérieure à l'indemnité légale.</div>
  `);
}

// ---------- 33. SALAIRE CHARGÉ EMPLOYEUR ----------

function calcSalaireCharge() {
  const brut = parseFloat($('sch-brut').value);
  const statut = $('sch-statut').value;

  if (isNaN(brut) || brut <= 0) {
    showResult('sch-result', '<div class="note">⚠ Indique le salaire brut.</div>');
    return;
  }

  let chargesPatTaux, chargesSalTaux;
  if (statut === 'cadre') {
    chargesPatTaux = 0.45; // ~45%
    chargesSalTaux = 0.25;
  } else if (statut === 'non-cadre') {
    chargesPatTaux = 0.42;
    chargesSalTaux = 0.22;
  } else { // fonction publique
    chargesPatTaux = 0.74; // beaucoup plus élevées (pension civile)
    chargesSalTaux = 0.15;
  }

  const chargesPat = brut * chargesPatTaux;
  const chargesSal = brut * chargesSalTaux;
  const coutEmployeur = brut + chargesPat;
  const salaireNet = brut - chargesSal;

  const annuelBrut = brut * 12;
  const annuelCoutEmployeur = coutEmployeur * 12;
  const annuelNet = salaireNet * 12;

  showResult('sch-result', `
    <div class="result-label">Coût total employeur (super-brut)</div>
    <div class="result-value">${formatEur(coutEmployeur)} <span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Salaire brut affiché</span><strong>${formatEur(brut)}</strong></div>
      <div class="result-detail-row"><span>Charges patronales (${Math.round(chargesPatTaux*100)}%)</span><strong>+${formatEur(chargesPat)}</strong></div>
      <div class="result-detail-row"><span><strong>Coût employeur mensuel</strong></span><strong>${formatEur(coutEmployeur)}</strong></div>
      <div class="result-detail-row"><span>Salaire net (salarié reçoit)</span><strong>${formatEur(salaireNet)}</strong></div>
      <div class="result-detail-row"><span>Charges salariales (${Math.round(chargesSalTaux*100)}%)</span><strong>−${formatEur(chargesSal)}</strong></div>
      <div class="result-detail-row"><span>Coût annuel total employeur</span><strong>${formatEur(annuelCoutEmployeur)}</strong></div>
      <div class="result-detail-row"><span>Annuel net pour le salarié</span><strong>${formatEur(annuelNet)}</strong></div>
      <div class="result-detail-row"><span>Ratio coût employeur / net salarié</span><strong>${formatNum(coutEmployeur / salaireNet, 2)}x</strong></div>
    </div>
    <div class="note">Sur ${formatEur(coutEmployeur)} dépensés par l'entreprise, le salarié touche ${formatEur(salaireNet)} net. La différence (${formatEur(coutEmployeur - salaireNet)}) finance la sécu, retraite, chômage, formation.</div>
  `);
}

// ---------- 34. TVA INVERSE (TTC → HT) ----------

function calcTVAInverse() {
  const ttc = parseFloat($('tvi-ttc').value);
  const taux = parseFloat($('tvi-taux').value);

  if (isNaN(ttc) || isNaN(taux) || ttc < 0) {
    showResult('tvi-result', '<div class="note">⚠ Remplis le montant TTC et le taux.</div>');
    return;
  }

  const tauxRatio = 1 + taux / 100;
  const ht = ttc / tauxRatio;
  const tva = ttc - ht;

  showResult('tvi-result', `
    <div class="result-label">Montant Hors Taxes</div>
    <div class="result-value">${formatEur(ht)} HT</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Montant TTC saisi</span><strong>${formatEur(ttc)}</strong></div>
      <div class="result-detail-row"><span>Taux TVA</span><strong>${formatNum(taux, 1)} %</strong></div>
      <div class="result-detail-row"><span>Montant de TVA</span><strong>${formatEur(tva)}</strong></div>
      <div class="result-detail-row"><span>Vérification : HT × (1+${formatNum(taux,1)}%)</span><strong>${formatEur(ht * tauxRatio)}</strong></div>
    </div>
    <div class="note">Formule : HT = TTC ÷ (1 + taux/100). À l'inverse, pour calculer un TTC depuis un HT, utilise notre <a href="facture.html" style="color:var(--text);">calculateur de facture</a>.</div>
  `);
}

// ---------- 35. CALORIES QUOTIDIENNES (BMR/TDEE) ----------

function calcCalories() {
  const sexe = $('cal-sexe').value;
  const poids = parseFloat($('cal-poids').value);
  const taille = parseFloat($('cal-taille').value);
  const age = parseInt($('cal-age').value, 10);
  const activite = parseFloat($('cal-activite').value);

  if (isNaN(poids) || isNaN(taille) || isNaN(age) || poids <= 0 || taille <= 0 || age <= 0) {
    showResult('cal-result', '<div class="note">⚠ Remplis tous les champs.</div>');
    return;
  }

  // Formule Mifflin-St Jeor (plus précise que Harris-Benedict)
  let bmr;
  if (sexe === 'homme') {
    bmr = 10 * poids + 6.25 * taille - 5 * age + 5;
  } else {
    bmr = 10 * poids + 6.25 * taille - 5 * age - 161;
  }

  const tdee = bmr * activite;

  const perte = tdee - 500;
  const perteRapide = tdee - 750;
  const prise = tdee + 300;
  const priseRapide = tdee + 500;

  showResult('cal-result', `
    <div class="result-label">Ton besoin calorique quotidien (TDEE)</div>
    <div class="result-value">${formatNum(tdee, 0)} <span class="unit">kcal/jour</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Métabolisme de base (BMR)</span><strong>${formatNum(bmr, 0)} kcal</strong></div>
      <div class="result-detail-row"><span>Multiplicateur d'activité</span><strong>×${activite}</strong></div>
      <div class="result-detail-row"><span>Besoin si maintien du poids</span><strong>${formatNum(tdee, 0)} kcal</strong></div>
      <div class="result-detail-row"><span>Perte modérée (~0,5 kg/sem)</span><strong>${formatNum(perte, 0)} kcal</strong></div>
      <div class="result-detail-row"><span>Perte rapide (~0,75 kg/sem)</span><strong>${formatNum(perteRapide, 0)} kcal</strong></div>
      <div class="result-detail-row"><span>Prise de masse (~+0,3 kg/sem)</span><strong>${formatNum(prise, 0)} kcal</strong></div>
      <div class="result-detail-row"><span>Prise rapide (avec musculation)</span><strong>${formatNum(priseRapide, 0)} kcal</strong></div>
    </div>
    <div class="note">Calcul Mifflin-St Jeor (référence en nutrition). Pour un suivi précis, consulte un diététicien-nutritionniste.</div>
  `);
}

// ---------- 36. ALLURE DE COURSE ----------

function calcAllure() {
  const mode = $('all-mode').value;
  const distance = parseFloat($('all-distance').value);

  if (isNaN(distance) || distance <= 0) {
    showResult('all-result', '<div class="note">⚠ Indique la distance.</div>');
    return;
  }

  let tempsTotalSec, paceSec, vitesse;

  if (mode === 'temps') {
    const h = parseInt($('all-h').value, 10) || 0;
    const m = parseInt($('all-m').value, 10) || 0;
    const s = parseInt($('all-s').value, 10) || 0;
    tempsTotalSec = h * 3600 + m * 60 + s;
    if (tempsTotalSec === 0) {
      showResult('all-result', '<div class="note">⚠ Indique un temps.</div>');
      return;
    }
    paceSec = tempsTotalSec / distance;
    vitesse = (distance * 3600) / tempsTotalSec;
  } else {
    // Mode: tu donnes l'allure, on calcule le temps total
    const pm = parseInt($('all-pm').value, 10) || 0;
    const ps = parseInt($('all-ps').value, 10) || 0;
    paceSec = pm * 60 + ps;
    if (paceSec === 0) {
      showResult('all-result', '<div class="note">⚠ Indique une allure.</div>');
      return;
    }
    tempsTotalSec = paceSec * distance;
    vitesse = 3600 / paceSec;
  }

  function fmtTemps(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.round(s % 60);
    if (h > 0) return `${h}h${String(m).padStart(2, '0')}min${String(sec).padStart(2, '0')}s`;
    return `${m}min${String(sec).padStart(2, '0')}s`;
  }
  function fmtPace(s) {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  // Prédictions pour distances classiques avec ce pace
  const predictions = [
    { d: 5, n: '5 km' },
    { d: 10, n: '10 km' },
    { d: 21.0975, n: 'Semi-marathon' },
    { d: 42.195, n: 'Marathon' }
  ];
  let predictHtml = '';
  predictions.forEach(p => {
    if (Math.abs(p.d - distance) > 0.1) {
      predictHtml += `<div class="result-detail-row"><span>${p.n}</span><strong>${fmtTemps(paceSec * p.d)}</strong></div>`;
    }
  });

  showResult('all-result', `
    <div class="result-label">Allure / Pace</div>
    <div class="result-value">${fmtPace(paceSec)} <span class="unit">/ km</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Distance</span><strong>${formatNum(distance, 2)} km</strong></div>
      <div class="result-detail-row"><span>Temps total</span><strong>${fmtTemps(tempsTotalSec)}</strong></div>
      <div class="result-detail-row"><span>Vitesse moyenne</span><strong>${formatNum(vitesse, 1)} km/h</strong></div>
      <div class="result-detail-row"><span style="font-weight:600; padding-top:8px;">Estimation à allure constante :</span><strong></strong></div>
      ${predictHtml}
    </div>
    <div class="note">Les prédictions assument une allure constante. En pratique, ton temps réel sur des distances longues sera un peu plus lent (méthode de Riegel : T₂ = T₁ × (D₂/D₁)^1.06).</div>
  `);
}

function allureRender() {
  const mode = $('all-mode').value;
  $('all-temps-block').style.display = mode === 'temps' ? 'block' : 'none';
  $('all-pace-block').style.display = mode === 'pace' ? 'block' : 'none';
}

// ---------- 37. DATE D'OVULATION ----------

function calcOvulation() {
  const dateStr = $('ovu-date').value;
  const cycle = parseInt($('ovu-cycle').value, 10) || 28;

  if (!dateStr) {
    showResult('ovu-result', '<div class="note">⚠ Indique la date des dernières règles.</div>');
    return;
  }

  const ddr = new Date(dateStr);
  // Ovulation = J (cycle - 14) après le 1er jour des règles
  const ovulation = new Date(ddr.getTime() + (cycle - 14) * 24 * 60 * 60 * 1000);
  // Période fertile = 5 jours avant ovulation à 1 jour après
  const fertilDebut = new Date(ovulation.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fertilFin = new Date(ovulation.getTime() + 1 * 24 * 60 * 60 * 1000);
  // Prochaines règles = DDR + cycle
  const prochainesRegles = new Date(ddr.getTime() + cycle * 24 * 60 * 60 * 1000);

  const fmt = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const today = new Date();
  const joursAvantOvu = Math.ceil((ovulation - today) / (1000 * 60 * 60 * 24));
  const joursAvantRegles = Math.ceil((prochainesRegles - today) / (1000 * 60 * 60 * 24));

  let statut;
  if (today >= fertilDebut && today <= fertilFin) {
    statut = '🌸 Tu es actuellement dans ta période fertile.';
  } else if (today < fertilDebut) {
    statut = `📅 Période fertile dans ${Math.ceil((fertilDebut - today) / (1000*60*60*24))} jour(s).`;
  } else {
    statut = '📅 Période fertile passée pour ce cycle.';
  }

  showResult('ovu-result', `
    <div class="result-label">Date d'ovulation estimée</div>
    <div class="result-value" style="font-size:22px;">${fmt(ovulation)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Période fertile</span><strong>du ${fmt(fertilDebut)} au ${fmt(fertilFin)}</strong></div>
      <div class="result-detail-row"><span>Prochaines règles estimées</span><strong>${fmt(prochainesRegles)}</strong></div>
      <div class="result-detail-row"><span>Jours avant ovulation</span><strong>${joursAvantOvu >= 0 ? joursAvantOvu + ' jours' : 'Déjà passée'}</strong></div>
      <div class="result-detail-row"><span>Jours avant prochaines règles</span><strong>${joursAvantRegles >= 0 ? joursAvantRegles + ' jours' : 'En retard'}</strong></div>
    </div>
    <div class="note">${statut}</div>
    <div class="note" style="margin-top:8px;">⚠ Estimation basée sur un cycle régulier. La date réelle d'ovulation peut varier de ±3 jours. Pour un suivi fiable, utilise des tests d'ovulation ou la courbe de température.</div>
  `);
}

// ---------- 38. POURBOIRE / PARTAGE ADDITION ----------

function calcPourboire() {
  const addition = parseFloat($('pb-addition').value);
  const pourboirePct = parseFloat($('pb-pct').value) || 0;
  const nbPersonnes = parseInt($('pb-personnes').value, 10) || 1;

  if (isNaN(addition) || addition <= 0) {
    showResult('pb-result', '<div class="note">⚠ Indique le montant de l\'addition.</div>');
    return;
  }

  const pourboire = addition * (pourboirePct / 100);
  const total = addition + pourboire;
  const parPersonne = total / nbPersonnes;
  const pourboireParPersonne = pourboire / nbPersonnes;

  showResult('pb-result', `
    <div class="result-label">Par personne (${nbPersonnes})</div>
    <div class="result-value">${formatEur(parPersonne)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Addition initiale</span><strong>${formatEur(addition)}</strong></div>
      <div class="result-detail-row"><span>Pourboire (${formatNum(pourboirePct, 0)}%)</span><strong>${formatEur(pourboire)}</strong></div>
      <div class="result-detail-row"><span><strong>Total à payer</strong></span><strong>${formatEur(total)}</strong></div>
      <div class="result-detail-row"><span>Par personne (sans pourboire)</span><strong>${formatEur(addition / nbPersonnes)}</strong></div>
      <div class="result-detail-row"><span>Pourboire par personne</span><strong>${formatEur(pourboireParPersonne)}</strong></div>
    </div>
    ${pourboirePct === 0 ? '<div class="note">💡 En France, le pourboire n\'est pas obligatoire (service inclus dans la note). Aux USA : 15-20 % attendu.</div>' : ''}
  `);
}

// ---------- 39. QUANTITÉ DE PEINTURE ----------

function calcPeinture() {
  const surface = parseFloat($('pei-surface').value);
  const couches = parseInt($('pei-couches').value, 10) || 2;
  const rendement = parseFloat($('pei-rendement').value) || 10;

  if (isNaN(surface) || surface <= 0) {
    showResult('pei-result', '<div class="note">⚠ Indique la surface à peindre.</div>');
    return;
  }

  const litresNecessaires = (surface * couches) / rendement;
  const margeSecurite = litresNecessaires * 1.1; // +10% sécurité

  // Calcul nombre de pots optimal
  const formats = [
    { taille: 10, nom: '10 L' },
    { taille: 5, nom: '5 L' },
    { taille: 2.5, nom: '2,5 L' },
    { taille: 1, nom: '1 L' },
    { taille: 0.5, nom: '0,5 L' }
  ];

  // Solution gloutonne avec marge de sécurité
  let restant = margeSecurite;
  const achat = [];
  for (const f of formats) {
    if (restant >= f.taille) {
      const nb = Math.floor(restant / f.taille);
      if (nb > 0) {
        achat.push({ nb, nom: f.nom, taille: f.taille });
        restant -= nb * f.taille;
      }
    }
  }
  if (restant > 0) {
    // Ajouter un petit format pour couvrir
    achat.push({ nb: 1, nom: '0,5 L', taille: 0.5 });
  }

  const achatHtml = achat.map(a => `${a.nb} pot${a.nb > 1 ? 's' : ''} de ${a.nom}`).join(', ');

  showResult('pei-result', `
    <div class="result-label">Peinture nécessaire</div>
    <div class="result-value">${formatNum(litresNecessaires, 2)} L</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Surface à peindre</span><strong>${formatNum(surface, 1)} m²</strong></div>
      <div class="result-detail-row"><span>Nombre de couches</span><strong>${couches}</strong></div>
      <div class="result-detail-row"><span>Rendement de la peinture</span><strong>${formatNum(rendement, 1)} m²/L</strong></div>
      <div class="result-detail-row"><span>Surface totale à couvrir</span><strong>${formatNum(surface * couches, 1)} m²</strong></div>
      <div class="result-detail-row"><span>Quantité avec +10% sécurité</span><strong>${formatNum(margeSecurite, 2)} L</strong></div>
      <div class="result-detail-row"><span>À acheter</span><strong>${achatHtml}</strong></div>
    </div>
    <div class="note">Le rendement varie selon la peinture (acrylique, glycéro), le support et la couleur (les couleurs foncées sur fond clair demandent +couches).</div>
  `);
}

// ---------- 40. QR CODE GENERATOR ----------

function genererQR() {
  const texte = $('qr-texte').value;
  if (!texte) {
    showResult('qr-result', '<div class="note">⚠ Entre un texte, une URL, un email...</div>');
    return;
  }

  if (typeof QRCode === 'undefined') {
    showResult('qr-result', '<div class="note">⚠ Bibliothèque QR Code non chargée. Recharge la page.</div>');
    return;
  }

  // Crée le QR code dans un div temp
  const tempDiv = document.createElement('div');
  new QRCode(tempDiv, {
    text: texte,
    width: 300,
    height: 300,
    colorDark: '#18181b',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  // Attendre la génération (lib utilise canvas ou img)
  setTimeout(() => {
    const img = tempDiv.querySelector('img') || tempDiv.querySelector('canvas');
    let dataUrl;
    if (img) {
      if (img.tagName === 'CANVAS') {
        dataUrl = img.toDataURL('image/png');
      } else {
        dataUrl = img.src;
      }
    }

    let typeContenu = 'Texte';
    if (texte.match(/^https?:\/\//i)) typeContenu = 'URL';
    else if (texte.match(/^mailto:/i) || texte.includes('@')) typeContenu = 'Email';
    else if (texte.match(/^tel:/i)) typeContenu = 'Téléphone';
    else if (texte.match(/^wifi:/i)) typeContenu = 'Wi-Fi';

    showResult('qr-result', `
      <div style="text-align:center; padding:20px 0;">
        <img src="${dataUrl}" alt="QR Code généré" style="max-width:300px; width:100%; border-radius:12px;">
      </div>
      <div class="result-detail">
        <div class="result-detail-row"><span>Type de contenu</span><strong>${typeContenu}</strong></div>
        <div class="result-detail-row"><span>Longueur</span><strong>${texte.length} caractères</strong></div>
      </div>
      <div class="btn-group">
        <a href="${dataUrl}" download="qrcode.png" class="btn">📥 Télécharger PNG</a>
      </div>
      <div class="note">Le QR code est généré localement, ton texte n'est jamais envoyé sur un serveur.</div>
    `);
  }, 100);
}

// ---------- 41. CRÉDIT AUTO ----------

function calcCreditAuto() {
  const montant = parseFloat($('auto-montant').value);
  const taux = parseFloat($('auto-taux').value);
  const dureeMois = parseInt($('auto-duree').value, 10);

  if (isNaN(montant) || isNaN(taux) || isNaN(dureeMois) || montant <= 0 || dureeMois <= 0) {
    showResult('auto-result', '<div class="note">⚠ Remplis tous les champs.</div>');
    return;
  }

  const tauxM = taux / 100 / 12;
  let mensualite;
  if (tauxM === 0) {
    mensualite = montant / dureeMois;
  } else {
    mensualite = montant * tauxM / (1 - Math.pow(1 + tauxM, -dureeMois));
  }
  const coutTotal = mensualite * dureeMois - montant;

  showResult('auto-result', `
    <div class="result-label">Mensualité du crédit auto</div>
    <div class="result-value">${formatEur(mensualite)} <span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Montant emprunté</span><strong>${formatEur(montant)}</strong></div>
      <div class="result-detail-row"><span>Durée</span><strong>${dureeMois} mois (${formatNum(dureeMois/12, 1)} ans)</strong></div>
      <div class="result-detail-row"><span>Total des intérêts</span><strong>${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>Coût total (capital + intérêts)</span><strong>${formatEur(montant + coutTotal)}</strong></div>
    </div>
    <div class="note">Calcul hors assurance et frais de dossier. Le TAEG affiché par les banques inclut ces frais et est donc légèrement supérieur au taux nominal.</div>
  `);
}

// ---------- 42. CRÉDIT CONSO ----------

function calcCreditConso() {
  const montant = parseFloat($('conso-montant').value);
  const taux = parseFloat($('conso-taux').value);
  const dureeMois = parseInt($('conso-duree').value, 10);

  if (isNaN(montant) || isNaN(taux) || isNaN(dureeMois) || montant <= 0 || dureeMois <= 0) {
    showResult('conso-result', '<div class="note">⚠ Remplis tous les champs.</div>');
    return;
  }

  const tauxM = taux / 100 / 12;
  let mensualite;
  if (tauxM === 0) {
    mensualite = montant / dureeMois;
  } else {
    mensualite = montant * tauxM / (1 - Math.pow(1 + tauxM, -dureeMois));
  }
  const coutTotal = mensualite * dureeMois - montant;
  const ratioInterets = (coutTotal / montant) * 100;

  let alerte = '';
  if (taux > 15) alerte = '⚠️ Taux très élevé, proche du taux d\'usure. Compare plusieurs offres avant de signer.';
  else if (taux > 10) alerte = 'Taux élevé. Vérifie si une banque traditionnelle ne propose pas mieux que ce taux.';

  showResult('conso-result', `
    <div class="result-label">Mensualité</div>
    <div class="result-value">${formatEur(mensualite)} <span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Montant emprunté</span><strong>${formatEur(montant)}</strong></div>
      <div class="result-detail-row"><span>Durée</span><strong>${dureeMois} mois</strong></div>
      <div class="result-detail-row"><span>Taux annuel</span><strong>${formatNum(taux, 2)} %</strong></div>
      <div class="result-detail-row"><span>Coût total des intérêts</span><strong>${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>Tu rembourseras au total</span><strong>${formatEur(montant + coutTotal)}</strong></div>
      <div class="result-detail-row"><span>Soit ${formatNum(ratioInterets, 1)}% du capital en intérêts</span><strong></strong></div>
    </div>
    ${alerte ? `<div class="note">${alerte}</div>` : ''}
  `);
}

// ---------- 43. LIVRET A / ÉPARGNE ----------

function calcLivretA() {
  const initial = parseFloat($('liv-initial').value) || 0;
  const versement = parseFloat($('liv-versement').value) || 0;
  const taux = parseFloat($('liv-taux').value);
  const annees = parseInt($('liv-duree').value, 10);

  if (isNaN(taux) || isNaN(annees) || annees <= 0 || (initial === 0 && versement === 0)) {
    showResult('liv-result', '<div class="note">⚠ Remplis taux, durée et au moins un versement.</div>');
    return;
  }

  // Calcul livret A : capitalisation annuelle, intérêts crédités au 31/12
  // Convention simplifiée : versements mensuels en début de mois
  let capital = initial;
  let totalVerse = initial;
  
  for (let a = 1; a <= annees; a++) {
    let interets = 0;
    // Approximation: pour chaque mois, le versement compte pour (12-mois)/12 du taux annuel
    for (let m = 1; m <= 12; m++) {
      capital += versement;
      totalVerse += versement;
      // Intérêts proportionnels au temps restant dans l'année
      interets += versement * (taux / 100) * (13 - m) / 12;
    }
    // Plus intérêts sur le capital de début d'année
    interets += (capital - versement * 12) * (taux / 100);
    capital += interets;
  }

  const interetsTotal = capital - totalVerse;

  showResult('liv-result', `
    <div class="result-label">Capital final estimé</div>
    <div class="result-value">${formatEur(capital)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Capital initial</span><strong>${formatEur(initial)}</strong></div>
      <div class="result-detail-row"><span>Versements totaux sur ${annees} ans</span><strong>${formatEur(totalVerse - initial)}</strong></div>
      <div class="result-detail-row"><span>Total versé</span><strong>${formatEur(totalVerse)}</strong></div>
      <div class="result-detail-row"><span>Intérêts générés</span><strong>${formatEur(interetsTotal)}</strong></div>
      <div class="result-detail-row"><span>Capital final</span><strong>${formatEur(capital)}</strong></div>
    </div>
    <div class="note">💡 Le Livret A et le LDDS sont défiscalisés (ni impôt ni prélèvements sociaux). Plafonds : 22 950 € (Livret A) et 12 000 € (LDDS).</div>
  `);
}

// ---------- 44. DPE (CLASSE ÉNERGIE) ----------

function calcDPE() {
  const conso = parseFloat($('dpe-conso').value);
  const ges = parseFloat($('dpe-ges').value);

  if (isNaN(conso) || conso < 0) {
    showResult('dpe-result', '<div class="note">⚠ Indique la consommation énergétique en kWh/m²/an.</div>');
    return;
  }

  // Classification énergie
  function classeEnergie(c) {
    if (c < 70) return { letter: 'A', color: '#0a8050', label: 'Très performant', desc: 'Logement à très basse consommation, parfait isolement.' };
    if (c < 110) return { letter: 'B', color: '#4cae50', label: 'Performant', desc: 'Très bonne performance énergétique.' };
    if (c < 180) return { letter: 'C', color: '#8bc34a', label: 'Correct', desc: 'Performance énergétique correcte.' };
    if (c < 250) return { letter: 'D', color: '#ffc107', label: 'Moyen', desc: 'Performance énergétique moyenne. Marge de progression.' };
    if (c < 330) return { letter: 'E', color: '#ff9800', label: 'Peu performant', desc: 'Performance énergétique faible.' };
    if (c < 420) return { letter: 'F', color: '#ff5722', label: 'Passoire thermique', desc: '⚠️ Interdiction de louer depuis 2025.' };
    return { letter: 'G', color: '#d32f2f', label: 'Passoire thermique', desc: '⚠️ Interdiction de louer depuis 2023. Indécence locative.' };
  }

  function classeGES(g) {
    if (g < 6) return { letter: 'A', color: '#0a8050' };
    if (g < 11) return { letter: 'B', color: '#4cae50' };
    if (g < 30) return { letter: 'C', color: '#8bc34a' };
    if (g < 50) return { letter: 'D', color: '#ffc107' };
    if (g < 70) return { letter: 'E', color: '#ff9800' };
    if (g < 100) return { letter: 'F', color: '#ff5722' };
    return { letter: 'G', color: '#d32f2f' };
  }

  const cE = classeEnergie(conso);
  const gesValue = !isNaN(ges) && ges > 0 ? ges : conso * 0.2; // Estimation par défaut si non fourni
  const cG = classeGES(gesValue);

  // Le DPE retient le pire des deux
  const lettres = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const finalLetter = lettres.indexOf(cE.letter) > lettres.indexOf(cG.letter) ? cE.letter : cG.letter;
  const finalClasse = finalLetter === cE.letter ? cE : { ...cE, letter: finalLetter };

  let loi = '';
  if (finalLetter === 'G') loi = '🚫 <strong>Logement indécent</strong> depuis 1er janvier 2023. Interdiction de louer.';
  else if (finalLetter === 'F') loi = '🚫 <strong>Passoire thermique</strong> : interdiction de louer depuis 2025.';
  else if (finalLetter === 'E') loi = '⚠️ Interdiction prévue à partir de 2034. Anticipe les travaux.';
  else loi = '✅ Conforme aux exigences de la loi Climat (location autorisée).';

  showResult('dpe-result', `
    <div class="result-label">Classe DPE estimée</div>
    <div class="result-value" style="color:${finalClasse.color}; font-size: 56px;">${finalLetter}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Étiquette énergie</span><strong style="color:${cE.color};">${cE.letter} — ${cE.label}</strong></div>
      <div class="result-detail-row"><span>Consommation énergétique</span><strong>${formatNum(conso, 0)} kWh/m²/an</strong></div>
      <div class="result-detail-row"><span>Étiquette climat (GES)</span><strong style="color:${cG.color};">${cG.letter}</strong></div>
      <div class="result-detail-row"><span>Émissions GES</span><strong>${formatNum(gesValue, 1)} kgCO₂eq/m²/an</strong></div>
      <div class="result-detail-row"><span>Statut légal</span><strong>${loi}</strong></div>
    </div>
    <div class="note">⚠ Estimation indicative. Le DPE officiel est réalisé par un diagnostiqueur certifié et coûte 100-250 € pour un appartement. Obligatoire pour vendre ou louer.</div>
  `);
}

// ---------- 45. SURFACE HABITABLE / CARREZ ----------

function calcSurface() {
  const surfaces = ($('sur-pieces').value || '').split(/[,\n;]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
  if (surfaces.length === 0) {
    showResult('sur-result', '<div class="note">⚠ Entre au moins une surface valide en m².</div>');
    return;
  }

  const total = surfaces.reduce((a, b) => a + b, 0);
  const moyenne = total / surfaces.length;
  const max = Math.max(...surfaces);
  const min = Math.min(...surfaces);

  showResult('sur-result', `
    <div class="result-label">Surface totale</div>
    <div class="result-value">${formatNum(total, 2)} m²</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Nombre de pièces</span><strong>${surfaces.length}</strong></div>
      <div class="result-detail-row"><span>Surface moyenne par pièce</span><strong>${formatNum(moyenne, 2)} m²</strong></div>
      <div class="result-detail-row"><span>Plus grande pièce</span><strong>${formatNum(max, 2)} m²</strong></div>
      <div class="result-detail-row"><span>Plus petite pièce</span><strong>${formatNum(min, 2)} m²</strong></div>
      <div class="result-detail-row"><span>Total en m²</span><strong>${formatNum(total, 2)} m²</strong></div>
      <div class="result-detail-row"><span>Soit en pieds²</span><strong>${formatNum(total * 10.764, 0)} ft²</strong></div>
    </div>
    <div class="note">📐 Pour la loi Carrez (copropriété), n'inclus pas : caves, garages, parkings, balcons, terrasses, ni les espaces sous 1,80 m de hauteur sous plafond.</div>
  `);
}

// ---------- 46. CYCLES DE SOMMEIL ----------

function calcSommeil() {
  const mode = $('som-mode').value;
  const heure = $('som-heure').value;

  if (!heure) {
    showResult('som-result', '<div class="note">⚠ Indique une heure.</div>');
    return;
  }

  const [h, m] = heure.split(':').map(Number);
  const baseTime = new Date();
  baseTime.setHours(h, m, 0, 0);

  // Délai d'endormissement moyen = 15 min
  const cycleMinutes = 90;
  const endormissement = 15;
  
  let resultats = [];
  for (let nbCycles = 3; nbCycles <= 6; nbCycles++) {
    const totalMinutes = nbCycles * cycleMinutes + endormissement;
    let temps;
    if (mode === 'reveil') {
      // On part de l'heure de réveil, on remonte
      temps = new Date(baseTime.getTime() - totalMinutes * 60000);
    } else {
      // On part de l'heure de coucher, on avance
      temps = new Date(baseTime.getTime() + totalMinutes * 60000);
    }
    const dureeH = Math.floor(totalMinutes / 60);
    const dureeM = totalMinutes % 60;
    resultats.push({
      cycles: nbCycles,
      heure: temps.getHours().toString().padStart(2, '0') + ':' + temps.getMinutes().toString().padStart(2, '0'),
      duree: `${dureeH}h${dureeM.toString().padStart(2, '0')}`,
      qualite: nbCycles === 5 ? '✓ Idéal' : (nbCycles === 6 ? '✓ Très bon' : (nbCycles === 4 ? 'Acceptable' : '⚠️ Court'))
    });
  }

  const labelMode = mode === 'reveil' ? 'Tu dois te coucher à' : 'Tu vas te réveiller à';
  const meilleurResultat = resultats[2]; // 5 cycles = idéal

  let tableaux = resultats.map(r => `
    <div class="result-detail-row">
      <span>${r.cycles} cycles (${r.duree} de sommeil)</span>
      <strong>${r.heure} <span style="font-size:12px; color:var(--text-muted);">${r.qualite}</span></strong>
    </div>
  `).join('');

  showResult('som-result', `
    <div class="result-label">${labelMode} :</div>
    <div class="result-value">${meilleurResultat.heure}</div>
    <div class="result-detail">
      ${tableaux}
    </div>
    <div class="note">Un cycle de sommeil dure environ 90 minutes. Se réveiller à la fin d'un cycle (et non au milieu) garantit un réveil plus reposé. 5 cycles = 7h30 + 15min d'endormissement = 7h45 au lit.</div>
  `);
}

// ---------- 47. ALCOOLÉMIE (WIDMARK) ----------

function calcAlcoolemie() {
  const sexe = $('alc-sexe').value;
  const poids = parseFloat($('alc-poids').value);
  const heures = parseFloat($('alc-heures').value) || 0;
  const estomac = $('alc-estomac').value;

  // Récupérer les verres
  const biere = parseInt($('alc-biere').value, 10) || 0;
  const vin = parseInt($('alc-vin').value, 10) || 0;
  const fort = parseInt($('alc-fort').value, 10) || 0;

  if (isNaN(poids) || poids <= 0) {
    showResult('alc-result', '<div class="note">⚠ Indique ton poids.</div>');
    return;
  }

  const totalVerres = biere + vin + fort;
  if (totalVerres === 0) {
    showResult('alc-result', '<div class="note">⚠ Indique au moins un verre consommé.</div>');
    return;
  }

  // En France, 1 verre standard = 10 g d'alcool pur
  // bière 25cl 5° = 10g, vin 12cl 12° = 11.5g, alcool fort 4cl 40° = 12.8g
  const alcoolTotal = biere * 10 + vin * 11.5 + fort * 12.8;

  // Coefficient de Widmark
  const coeff = sexe === 'homme' ? 0.7 : 0.6;

  // Coefficient d'absorption (estomac plein réduit le pic)
  const coeffAbsorption = estomac === 'plein' ? 0.85 : 1.0;

  // Alcoolémie initiale
  const alcoolemieInitiale = (alcoolTotal * coeffAbsorption) / (poids * coeff);

  // Élimination = 0,15 g/L/h
  const eliminationParHeure = 0.15;
  const alcoolemieActuelle = Math.max(0, alcoolemieInitiale - heures * eliminationParHeure);

  // Calcul du temps avant de redescendre sous les seuils
  function tempsPour(seuil) {
    if (alcoolemieActuelle <= seuil) return 0;
    return (alcoolemieActuelle - seuil) / eliminationParHeure;
  }
  
  function fmtHeures(h) {
    const heuresEntiers = Math.floor(h);
    const minutes = Math.round((h - heuresEntiers) * 60);
    if (heuresEntiers === 0) return `${minutes} min`;
    return `${heuresEntiers}h${minutes.toString().padStart(2, '0')}`;
  }

  let statut, couleur, message;
  if (alcoolemieActuelle === 0) {
    statut = '✅ Aucune alcoolémie';
    couleur = '#10b981';
    message = 'Tu peux conduire en toute légalité.';
  } else if (alcoolemieActuelle < 0.2) {
    statut = '✅ En dessous de tous les seuils légaux';
    couleur = '#10b981';
    message = 'Mais reste prudent : même peu d\'alcool altère les réflexes.';
  } else if (alcoolemieActuelle < 0.5) {
    statut = '⚠️ Au-dessus de 0,2 g/L (jeune permis : INTERDIT)';
    couleur = '#f59e0b';
    message = 'Si tu as moins de 3 ans de permis, ne conduis PAS. Sanction : 135€ + 6 points + interdiction.';
  } else if (alcoolemieActuelle < 0.8) {
    statut = '🚫 INFRACTION : conduite avec alcoolémie';
    couleur = '#dc2626';
    message = 'Sanction : amende 135€, 6 points en moins, possible suspension de permis. Ne conduis surtout pas.';
  } else {
    statut = '🚨 DÉLIT : alcoolémie élevée';
    couleur = '#991b1b';
    message = 'Sanction : jusqu\'à 2 ans de prison, 4 500€ d\'amende, perte de 6 points, suspension de permis. NE CONDUIS PAS.';
  }

  showResult('alc-result', `
    <div class="result-label">Alcoolémie estimée</div>
    <div class="result-value" style="color:${couleur};">${formatNum(alcoolemieActuelle, 2)} <span class="unit">g/L</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Pic d'alcoolémie initial</span><strong>${formatNum(alcoolemieInitiale, 2)} g/L</strong></div>
      <div class="result-detail-row"><span>Heures écoulées</span><strong>${formatNum(heures, 1)} h</strong></div>
      <div class="result-detail-row"><span>Alcool pur consommé</span><strong>${formatNum(alcoolTotal, 1)} g</strong></div>
      <div class="result-detail-row"><span>Statut</span><strong style="color:${couleur};">${statut}</strong></div>
      <div class="result-detail-row"><span>Temps avant 0,5 g/L</span><strong>${fmtHeures(tempsPour(0.5))}</strong></div>
      <div class="result-detail-row"><span>Temps avant 0,2 g/L (jeune)</span><strong>${fmtHeures(tempsPour(0.2))}</strong></div>
      <div class="result-detail-row"><span>Temps avant 0,0 g/L</span><strong>${fmtHeures(tempsPour(0))}</strong></div>
    </div>
    <div class="note" style="background:#fef3c7; padding:12px; border-radius:8px; margin-top:12px;">
      <strong>⚠ ESTIMATION INDICATIVE UNIQUEMENT</strong><br>
      ${message}<br><br>
      <strong>Cette estimation ne remplace pas un éthylotest.</strong> De nombreux facteurs peuvent fausser le calcul : médicaments, fatigue, métabolisme individuel, stress. <strong>En cas de doute, ne prends pas le volant. Appelle un taxi, un VTC, un proche, ou couche-toi sur place.</strong>
    </div>
  `);
}

// ---------- 48. TIRAGE AU SORT ----------

let _tirageHistorique = [];

function tirerAuSort() {
  const liste = ($('tir-liste').value || '').split('\n').map(s => s.trim()).filter(s => s.length > 0);
  const mode = $('tir-mode').value;
  const nbEquipes = parseInt($('tir-equipes').value, 10) || 2;

  if (liste.length < 2) {
    showResult('tir-result', '<div class="note">⚠ Entre au moins 2 noms ou options (un par ligne).</div>');
    return;
  }

  let resultat = '';

  if (mode === 'un') {
    const choisi = liste[Math.floor(Math.random() * liste.length)];
    _tirageHistorique.push(choisi);
    if (_tirageHistorique.length > 5) _tirageHistorique.shift();
    
    resultat = `
      <div class="result-label">Résultat du tirage</div>
      <div class="result-value" style="font-size: 32px;">${choisi}</div>
      <div class="result-detail">
        <div class="result-detail-row"><span>Total d'options</span><strong>${liste.length}</strong></div>
        <div class="result-detail-row"><span>Probabilité</span><strong>1 sur ${liste.length} (${formatNum(100/liste.length, 1)}%)</strong></div>
        ${_tirageHistorique.length > 1 ? `<div class="result-detail-row"><span>Historique</span><strong>${_tirageHistorique.join(', ')}</strong></div>` : ''}
      </div>
    `;
  } else if (mode === 'ordre') {
    const shuffled = [...liste];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const liste_html = shuffled.map((n, i) => `<div class="result-detail-row"><span>${i+1}.</span><strong>${n}</strong></div>`).join('');
    resultat = `
      <div class="result-label">Ordre aléatoire</div>
      <div class="result-detail">${liste_html}</div>
    `;
  } else if (mode === 'equipes') {
    if (nbEquipes < 2 || nbEquipes > liste.length) {
      showResult('tir-result', '<div class="note">⚠ Le nombre d\'équipes doit être entre 2 et le nombre de participants.</div>');
      return;
    }
    const shuffled = [...liste];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const equipes = Array.from({length: nbEquipes}, () => []);
    shuffled.forEach((p, i) => equipes[i % nbEquipes].push(p));
    
    const equipes_html = equipes.map((eq, i) => `
      <div class="result-detail-row" style="border-bottom:1px solid var(--border); padding:8px 0;">
        <span><strong>Équipe ${i+1}</strong> (${eq.length} membre${eq.length > 1 ? 's' : ''})</span>
        <strong>${eq.join(', ')}</strong>
      </div>
    `).join('');
    resultat = `
      <div class="result-label">Équipes constituées</div>
      <div class="result-detail">${equipes_html}</div>
    `;
  }

  showResult('tir-result', resultat + '<div class="note">🎲 Tirage 100% aléatoire (crypto.getRandomValues). Tu peux relancer pour un nouveau résultat.</div>');
}

function tirageRender() {
  const mode = $('tir-mode').value;
  $('tir-equipes-block').style.display = mode === 'equipes' ? 'block' : 'none';
}

// ---------- 49. LIEN WHATSAPP ----------

function genererLienWhatsapp() {
  let numero = ($('wa-numero').value || '').replace(/[\s\-\.\(\)]/g, '');
  const message = $('wa-message').value || '';

  if (!numero) {
    showResult('wa-result', '<div class="note">⚠ Indique un numéro de téléphone.</div>');
    return;
  }

  // Nettoyer le numéro
  if (numero.startsWith('+')) numero = numero.substring(1);
  if (numero.startsWith('00')) numero = numero.substring(2);
  if (numero.startsWith('0') && numero.length === 10) {
    // Numéro français sans indicatif
    numero = '33' + numero.substring(1);
  }

  // Vérification basique
  if (!/^\d{6,15}$/.test(numero)) {
    showResult('wa-result', '<div class="note">⚠ Numéro invalide. Format attendu : 0612345678 (France) ou +49123456789 (international).</div>');
    return;
  }

  const messageEncode = encodeURIComponent(message);
  const lien = `https://wa.me/${numero}${message ? '?text=' + messageEncode : ''}`;

  showResult('wa-result', `
    <div class="result-label">Ton lien WhatsApp est prêt</div>
    <div class="pseudo-output" style="font-size:14px; word-break:break-all; user-select:all;" id="wa-lien-output">${lien}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Numéro formaté</span><strong>+${numero}</strong></div>
      <div class="result-detail-row"><span>Message pré-rempli</span><strong>${message || '(aucun)'}</strong></div>
    </div>
    <div class="btn-group">
      <a href="${lien}" target="_blank" rel="noopener" class="btn">📲 Tester le lien</a>
      <button class="btn btn-secondary" onclick="copierLienWA('${lien.replace(/'/g, "\\'")}')">📋 Copier le lien</button>
    </div>
    <div class="note">💡 Utilise ce lien sur ton site, dans tes emails ou ta bio Instagram. Tes contacts arriveront direct dans une conversation WhatsApp avec ton message pré-rempli.</div>
  `);
}

function copierLienWA(lien) {
  navigator.clipboard.writeText(lien).then(() => {
    alert('Lien copié dans le presse-papier ! 📋');
  });
}

// ---------- 50. FUSEAUX HORAIRES ----------

const FUSEAUX = [
  { ville: 'Paris', offset: 1, dst: true },
  { ville: 'Londres', offset: 0, dst: true },
  { ville: 'New York', offset: -5, dst: true },
  { ville: 'Los Angeles', offset: -8, dst: true },
  { ville: 'Toronto', offset: -5, dst: true },
  { ville: 'Mexico', offset: -6, dst: true },
  { ville: 'São Paulo', offset: -3, dst: false },
  { ville: 'Le Cap', offset: 2, dst: false },
  { ville: 'Dubaï', offset: 4, dst: false },
  { ville: 'Mumbai', offset: 5.5, dst: false },
  { ville: 'Bangkok', offset: 7, dst: false },
  { ville: 'Singapour', offset: 8, dst: false },
  { ville: 'Hong Kong', offset: 8, dst: false },
  { ville: 'Pékin', offset: 8, dst: false },
  { ville: 'Tokyo', offset: 9, dst: false },
  { ville: 'Séoul', offset: 9, dst: false },
  { ville: 'Sydney', offset: 10, dst: true },
  { ville: 'Auckland', offset: 12, dst: true },
  { ville: 'Honolulu', offset: -10, dst: false },
  { ville: 'Reykjavik', offset: 0, dst: false }
];

function calcFuseaux() {
  const heureRef = $('fus-heure').value;
  const villeRef = $('fus-ref').value;

  if (!heureRef) {
    showResult('fus-result', '<div class="note">⚠ Indique une heure de référence.</div>');
    return;
  }

  const [h, m] = heureRef.split(':').map(Number);
  
  // Trouver l'offset de la ville de référence
  const ref = FUSEAUX.find(f => f.ville === villeRef);
  if (!ref) {
    showResult('fus-result', '<div class="note">⚠ Ville inconnue.</div>');
    return;
  }

  // Calculer l'UTC depuis la ville de référence
  const utcMinutes = h * 60 + m - ref.offset * 60;

  let html = `<div class="result-label">Quand il est ${heureRef} à ${villeRef}, il est :</div><div class="result-detail">`;
  
  for (const f of FUSEAUX) {
    if (f.ville === villeRef) continue;
    let localMinutes = utcMinutes + f.offset * 60;
    // Normaliser sur 24h
    while (localMinutes < 0) localMinutes += 24 * 60;
    while (localMinutes >= 24 * 60) localMinutes -= 24 * 60;
    const lh = Math.floor(localMinutes / 60);
    const lm = Math.floor(localMinutes % 60);
    const diffHeure = f.offset - ref.offset;
    const diffStr = diffHeure > 0 ? `+${diffHeure}h` : `${diffHeure}h`;
    html += `<div class="result-detail-row"><span>${f.ville} <span style="color:var(--text-muted); font-size:12px;">(${diffStr})</span></span><strong>${lh.toString().padStart(2,'0')}:${lm.toString().padStart(2,'0')}</strong></div>`;
  }
  html += '</div>';

  showResult('fus-result', html + '<div class="note">Les heures d\'été (DST) ne sont pas prises en compte automatiquement. En France : +1h fin mars à fin octobre.</div>');
}

// ---------- 51. CONVERTISSEUR PDF (FICHIER → PDF) ----------

let _cvpFiles = [];

function cvpHandleFiles(files) {
  _cvpFiles = Array.from(files);
  cvpRenderList();
}

function cvpRenderList() {
  const liste = $('cvp-liste');
  if (_cvpFiles.length === 0) {
    liste.innerHTML = '';
    return;
  }
  liste.innerHTML = '<div style="margin-top:16px; font-size:13px; font-weight:600; color:var(--text-muted);">Fichiers sélectionnés :</div>' +
    _cvpFiles.map((f, i) => {
      const sizeKB = (f.size / 1024).toFixed(1);
      return `<div class="result-detail-row" style="padding:8px 0; border-bottom:1px solid var(--border);">
        <span>📄 ${f.name}</span>
        <strong style="color:var(--text-muted); font-size:12px;">${sizeKB} Ko <a href="#" onclick="cvpRemove(${i}); event.preventDefault();" style="margin-left:8px; color:#dc2626;">✕</a></strong>
      </div>`;
    }).join('');
}

function cvpRemove(idx) {
  _cvpFiles.splice(idx, 1);
  cvpRenderList();
}

async function convertirFichierPdf() {
  if (_cvpFiles.length === 0) {
    showResult('cvp-result', '<div class="note">⚠ Sélectionne au moins un fichier à convertir.</div>');
    return;
  }

  $('cvp-result').innerHTML = '<div class="note">⏳ Conversion en cours, patiente quelques secondes...</div>';
  $('cvp-result').classList.add('visible');

  try {
    // Détecter le type via le premier fichier
    const firstFile = _cvpFiles[0];
    const ext = firstFile.name.split('.').pop().toLowerCase();
    
    let blob, downloadName;
    
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) {
      blob = await cvpImagesEnPdf(_cvpFiles);
      downloadName = _cvpFiles.length === 1 
        ? firstFile.name.replace(/\.[^/.]+$/, '') + '.pdf'
        : 'images-' + Date.now() + '.pdf';
    } else if (ext === 'docx') {
      blob = await cvpDocxEnPdf(firstFile);
      downloadName = firstFile.name.replace(/\.docx$/i, '') + '.pdf';
    } else if (ext === 'txt') {
      blob = await cvpTexteEnPdf(firstFile);
      downloadName = firstFile.name.replace(/\.txt$/i, '') + '.pdf';
    } else if (['html', 'htm'].includes(ext)) {
      blob = await cvpHtmlEnPdf(firstFile, false);
      downloadName = firstFile.name.replace(/\.html?$/i, '') + '.pdf';
    } else if (ext === 'md') {
      blob = await cvpHtmlEnPdf(firstFile, true);
      downloadName = firstFile.name.replace(/\.md$/i, '') + '.pdf';
    } else {
      showResult('cvp-result', `<div class="note">⚠ Format <strong>.${ext}</strong> non supporté.<br><br>Formats acceptés : <strong>JPG, PNG, WEBP, GIF, BMP, DOCX, TXT, HTML, MD</strong>.<br><br>Pour PPTX, XLSX, ODT, PDF chiffrés : nécessite un serveur (impossible côté navigateur).</div>`);
      return;
    }
    
    if (!blob) throw new Error('La conversion a échoué.');
    
    const url = URL.createObjectURL(blob);
    const sizeKB = (blob.size / 1024).toFixed(1);
    
    showResult('cvp-result', `
      <div class="result-label">✓ Conversion réussie</div>
      <div class="result-detail">
        <div class="result-detail-row"><span>Fichier original</span><strong>${firstFile.name}${_cvpFiles.length > 1 ? ' (+' + (_cvpFiles.length - 1) + ' autres)' : ''}</strong></div>
        <div class="result-detail-row"><span>Taille du PDF</span><strong>${sizeKB} Ko</strong></div>
      </div>
      <div class="btn-group">
        <a href="${url}" download="${downloadName}" class="btn">📥 Télécharger ${downloadName}</a>
      </div>
      <div class="note">Le fichier reste sur ton appareil, rien n'est envoyé sur un serveur.</div>
    `);
  } catch (e) {
    console.error(e);
    showResult('cvp-result', `<div class="note">⚠ Erreur de conversion : ${e.message || 'Format non lisible.'}<br>Vérifie que le fichier n'est pas protégé par mot de passe et qu'il est dans un format supporté.</div>`);
  }
}

async function cvpImagesEnPdf(files) {
  if (typeof window.jspdf === 'undefined') throw new Error('Bibliothèque jsPDF non chargée');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  let first = true;
  
  for (const file of files) {
    if (!first) pdf.addPage();
    first = false;
    
    const dataUrl = await cvpReadAsDataURL(file);
    const img = await cvpLoadImage(dataUrl);
    
    // Marges 10mm
    const pageWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight() - 20;
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (pdf.internal.pageSize.getWidth() - w) / 2;
    const y = (pdf.internal.pageSize.getHeight() - h) / 2;
    
    // Détecter le format
    const fmt = file.type.includes('png') ? 'PNG' : (file.type.includes('webp') ? 'WEBP' : 'JPEG');
    pdf.addImage(dataUrl, fmt, x, y, w, h);
  }
  
  return pdf.output('blob');
}

function cvpReadAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Lecture du fichier échouée'));
    reader.readAsDataURL(file);
  });
}

function cvpLoadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = dataUrl;
  });
}

async function cvpDocxEnPdf(file) {
  if (typeof mammoth === 'undefined') throw new Error('Bibliothèque mammoth (Word) non chargée');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return await cvpHtmlVersBlob(result.value);
}

async function cvpTexteEnPdf(file) {
  const text = await file.text();
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<div style="font-family: 'Helvetica', Arial, sans-serif; font-size: 13px; line-height: 1.5; white-space: pre-wrap; color: #18181b;">${escaped}</div>`;
  return await cvpHtmlVersBlob(html);
}

async function cvpHtmlEnPdf(file, isMarkdown) {
  let html = await file.text();
  if (isMarkdown && typeof marked !== 'undefined') {
    html = marked.parse(html);
  }
  return await cvpHtmlVersBlob(html);
}

function cvpHtmlVersBlob(htmlContent) {
  return new Promise((resolve, reject) => {
    if (typeof html2pdf === 'undefined') {
      reject(new Error('Bibliothèque html2pdf non chargée'));
      return;
    }
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-10000px';
    wrapper.style.left = '0';
    wrapper.style.width = '210mm';
    wrapper.style.padding = '15mm';
    wrapper.style.fontFamily = "'Helvetica', Arial, sans-serif";
    wrapper.style.color = '#18181b';
    wrapper.style.background = '#ffffff';
    wrapper.style.fontSize = '12px';
    wrapper.style.lineHeight = '1.5';
    wrapper.innerHTML = htmlContent;
    document.body.appendChild(wrapper);
    
    const opt = {
      margin: 10,
      filename: 'output.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(wrapper).outputPdf('blob').then(blob => {
      document.body.removeChild(wrapper);
      resolve(blob);
    }).catch(err => {
      if (wrapper.parentNode) document.body.removeChild(wrapper);
      reject(err);
    });
  });
}

// ========== 52. CHATGPT / IA COÛT MENSUEL ==========

const IA_PLANS = {
  'chatgpt-free': { name: 'ChatGPT Free', cost: 0, desc: 'Accès limité GPT-4o-mini' },
  'chatgpt-plus': { name: 'ChatGPT Plus', cost: 20, desc: 'GPT-4o, voix, image, DALL-E' },
  'chatgpt-pro': { name: 'ChatGPT Pro', cost: 200, desc: 'O1 illimité, accès prioritaire' },
  'chatgpt-team': { name: 'ChatGPT Team', cost: 25, desc: 'Par utilisateur, espace partagé' },
  'claude-free': { name: 'Claude Free', cost: 0, desc: 'Accès limité Sonnet' },
  'claude-pro': { name: 'Claude Pro', cost: 20, desc: 'Sonnet + Opus illimité' },
  'claude-max-5': { name: 'Claude Max 5x', cost: 100, desc: '5x les limites de Pro' },
  'claude-max-20': { name: 'Claude Max 20x', cost: 200, desc: '20x les limites de Pro' },
  'gemini-free': { name: 'Gemini Free', cost: 0, desc: 'Accès Gemini 2.0 limité' },
  'gemini-advanced': { name: 'Gemini Advanced', cost: 21.99, desc: 'Gemini 2.5 Pro, 2 To stockage' },
  'perplexity-pro': { name: 'Perplexity Pro', cost: 20, desc: 'Recherche IA illimitée' }
};

function calcCoutIA() {
  const plan = $('ia-plan').value;
  const utilisateurs = parseInt($('ia-utilisateurs').value, 10) || 1;
  const duree = parseInt($('ia-duree').value, 10) || 1;
  
  if (!plan || !IA_PLANS[plan]) {
    showResult('ia-result', '<div class="note">⚠ Sélectionne un plan IA.</div>');
    return;
  }
  
  const planInfo = IA_PLANS[plan];
  const coutMensuel = planInfo.cost * utilisateurs;
  const coutTotal = coutMensuel * duree;
  const coutAnnuel = coutMensuel * 12;
  
  // Comparaison avec d'autres plans
  const comparaisons = Object.entries(IA_PLANS)
    .filter(([key, info]) => key !== plan && info.cost > 0)
    .map(([key, info]) => `<div class="result-detail-row"><span>${info.name}</span><strong>${info.cost * utilisateurs} €/mois</strong></div>`)
    .slice(0, 5)
    .join('');
  
  showResult('ia-result', `
    <div class="result-label">Coût ${planInfo.name}</div>
    <div class="result-value">${formatEur(coutMensuel)} <span class="unit">/ mois</span></div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Plan choisi</span><strong>${planInfo.name}</strong></div>
      <div class="result-detail-row"><span>Description</span><strong>${planInfo.desc}</strong></div>
      <div class="result-detail-row"><span>Utilisateurs</span><strong>${utilisateurs}</strong></div>
      <div class="result-detail-row"><span>Coût mensuel</span><strong>${formatEur(coutMensuel)}</strong></div>
      <div class="result-detail-row"><span>Coût sur ${duree} mois</span><strong>${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>Coût annuel</span><strong>${formatEur(coutAnnuel)}</strong></div>
    </div>
    ${comparaisons ? `<div class="note"><strong>💡 Comparaison avec d'autres plans (${utilisateurs} utilisateur${utilisateurs > 1 ? 's' : ''}) :</strong></div><div class="result-detail" style="margin-top:8px;">${comparaisons}</div>` : ''}
    <div class="note">💰 Tarifs en EUR pour 2026. La TVA est généralement incluse pour les particuliers en France. Pour des usages très intensifs, l'API peut revenir moins cher que les abonnements.</div>
  `);
}

// ========== 53. TAXE VINTED ==========

function calcTaxeVinted() {
  const ventes = parseInt($('vt-ventes').value, 10) || 0;
  const ca = parseFloat($('vt-ca').value) || 0;
  const type = $('vt-type').value;
  
  if (ventes === 0 || ca === 0) {
    showResult('vt-result', '<div class="note">⚠ Remplis le nombre de ventes et le montant total.</div>');
    return;
  }
  
  const seuilVentes = 30;
  const seuilCA = 2000;
  
  const declarationAuto = ventes >= seuilVentes || ca >= seuilCA;
  const seuilDepassement = [];
  if (ventes >= seuilVentes) seuilDepassement.push(`${ventes} ventes ≥ 30`);
  if (ca >= seuilCA) seuilDepassement.push(`${formatEur(ca)} ≥ 2 000 €`);
  
  let statut, couleur, action, impot;
  
  if (type === 'perso') {
    // Vente de biens personnels d'occasion
    if (!declarationAuto) {
      statut = '✅ Aucune déclaration nécessaire';
      couleur = '#10b981';
      action = 'Tu vends tes affaires perso d\'occasion sous les seuils, rien à faire.';
      impot = 0;
    } else {
      statut = '📋 Déclaration automatique mais non imposable';
      couleur = '#f59e0b';
      action = `Vinted déclare automatiquement à l'administration (seuils dépassés : ${seuilDepassement.join(', ')}). Comme ce sont des biens personnels d'occasion, tu n'es PAS imposé sauf cas particuliers (objet > 5 000€, métaux précieux, bijoux).`;
      impot = 0;
    }
  } else if (type === 'pro') {
    // Vente avec marge / activité régulière
    statut = '⚠️ Activité professionnelle - imposable';
    couleur = '#dc2626';
    action = 'Tu es considéré comme vendeur professionnel. Tu dois t\'immatriculer (micro-entreprise, SASU, etc.) et déclarer tes revenus.';
    // Estimation impôt : 22% si micro-entreprise (services + impôt libératoire)
    impot = ca * 0.22;
  } else if (type === 'collection') {
    // Bijoux, métaux précieux, objets de collection
    statut = '⚠️ Taxation forfaitaire des biens précieux';
    couleur = '#dc2626';
    action = 'Les bijoux, objets de collection et métaux précieux sont soumis à une taxe forfaitaire (6,5% sur le prix de vente pour les bijoux/objets > 5000€, 11% pour les métaux précieux).';
    impot = ca * 0.065;
  }
  
  showResult('vt-result', `
    <div class="result-label">Situation fiscale Vinted</div>
    <div class="result-value" style="font-size:24px; color:${couleur};">${statut}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Nombre de ventes</span><strong>${ventes}</strong></div>
      <div class="result-detail-row"><span>Chiffre d'affaires</span><strong>${formatEur(ca)}</strong></div>
      <div class="result-detail-row"><span>Type de vente</span><strong>${type === 'perso' ? 'Biens personnels d\'occasion' : (type === 'pro' ? 'Vendeur professionnel' : 'Bijoux / Collection / Métaux précieux')}</strong></div>
      <div class="result-detail-row"><span>Déclaration automatique par Vinted</span><strong>${declarationAuto ? '✅ Oui' : '❌ Non'}</strong></div>
      ${impot > 0 ? `<div class="result-detail-row"><span>Estimation impôt</span><strong>${formatEur(impot)}</strong></div>` : ''}
    </div>
    <div class="note"><strong>📌 À retenir :</strong> ${action}</div>
    <div class="note">⚠ Estimation indicative basée sur les règles 2026. Pour ta situation précise, consulte le site des impôts (impots.gouv.fr) ou un conseiller fiscal.</div>
  `);
}

// ========== 54. FRAIS PAYPAL ==========

function calcFraisPaypal() {
  const montant = parseFloat($('pp-montant').value) || 0;
  const type = $('pp-type').value;
  const international = $('pp-international').value === 'oui';
  
  if (montant <= 0) {
    showResult('pp-result', '<div class="note">⚠ Indique un montant.</div>');
    return;
  }
  
  let pourcentage, fixe, nomType;
  
  switch (type) {
    case 'perso':
      pourcentage = 0;
      fixe = 0;
      nomType = 'Envoi entre amis (perso)';
      break;
    case 'commercial':
      pourcentage = 0.029;
      fixe = 0.35;
      nomType = 'Achat / Paiement commercial';
      break;
    case 'bouton':
      pourcentage = 0.034;
      fixe = 0.35;
      nomType = 'Bouton de paiement (sites)';
      break;
    case 'micropaiement':
      pourcentage = 0.05;
      fixe = 0.05;
      nomType = 'Micropaiement (< 10 €)';
      break;
    case 'carte-achat':
      pourcentage = 0.016;
      fixe = 0.10;
      nomType = 'PayPal Carte d\'achat';
      break;
    default:
      pourcentage = 0.029;
      fixe = 0.35;
      nomType = 'Commercial standard';
  }
  
  let fraisPourcentage = montant * pourcentage;
  let fraisInternational = 0;
  
  if (international) {
    // Frais conversion + transfert international
    fraisInternational = montant * 0.015; // 1.5% de change
    fraisPourcentage += montant * 0.005; // 0.5% supplémentaire
  }
  
  const totalFrais = fraisPourcentage + fixe + fraisInternational;
  const netRecu = montant - totalFrais;
  
  showResult('pp-result', `
    <div class="result-label">Frais PayPal estimés</div>
    <div class="result-value" style="color:#dc2626;">${formatEur(totalFrais)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Montant initial</span><strong>${formatEur(montant)}</strong></div>
      <div class="result-detail-row"><span>Type de transaction</span><strong>${nomType}</strong></div>
      <div class="result-detail-row"><span>Frais en %</span><strong>${formatEur(fraisPourcentage)} (${(pourcentage*100).toFixed(2)}%)</strong></div>
      <div class="result-detail-row"><span>Frais fixe</span><strong>${formatEur(fixe)}</strong></div>
      ${international ? `<div class="result-detail-row"><span>Frais international</span><strong>${formatEur(fraisInternational)} (~1.5%)</strong></div>` : ''}
      <div class="result-detail-row"><span>Total des frais</span><strong style="color:#dc2626;">${formatEur(totalFrais)}</strong></div>
      <div class="result-detail-row"><span>Montant net reçu</span><strong style="color:#10b981;">${formatEur(netRecu)}</strong></div>
      <div class="result-detail-row"><span>Pourcentage prélevé</span><strong>${((totalFrais/montant)*100).toFixed(2)}%</strong></div>
    </div>
    <div class="note">💡 <strong>Astuce :</strong> Pour éviter les frais entre amis/famille, choisis "Envoi à un proche" lors du paiement (gratuit en EUR). Pour les boutiques en ligne, certaines alternatives comme Wise ou Stripe peuvent être moins chères selon le volume.</div>
  `);
}

// ========== 55. CONSOMMATION CLIM (RICHE) ==========

const CLIM_PRESETS = {
  'mobile-petite': { name: 'Climatiseur mobile petit', w: 800, surface: '10-15m²' },
  'mobile-grande': { name: 'Climatiseur mobile grand', w: 1500, surface: '20-30m²' },
  'split-7000': { name: 'Split 7 000 BTU (chambre)', w: 650, surface: '12-18m²' },
  'split-9000': { name: 'Split 9 000 BTU (chambre/bureau)', w: 850, surface: '18-25m²' },
  'split-12000': { name: 'Split 12 000 BTU (salon moyen)', w: 1150, surface: '25-35m²' },
  'split-18000': { name: 'Split 18 000 BTU (grand salon)', w: 1700, surface: '35-50m²' },
  'split-24000': { name: 'Split 24 000 BTU (très grand)', w: 2300, surface: '50-70m²' },
  'multi-split': { name: 'Multi-split 3-4 unités', w: 3500, surface: 'Maison entière' },
  'centrale': { name: 'Climatisation centrale', w: 5000, surface: 'Maison/Bureaux' }
};

function climPreset(key) {
  if (!CLIM_PRESETS[key]) return;
  $('clim-puissance').value = CLIM_PRESETS[key].w;
  // Visual feedback
  document.querySelectorAll('.clim-preset-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.clim-preset-btn[data-key="${key}"]`);
  if (btn) btn.classList.add('active');
}

function climScenario(scenario) {
  // Présets de scénarios complets
  const scenarios = {
    'canicule': { heures: 12, jours: 30, label: 'Canicule (juillet/août intensif)' },
    'standard-ete': { heures: 6, jours: 60, label: 'Été standard (juin → août)' },
    'occasionnel': { heures: 4, jours: 20, label: 'Occasionnel (juste les pics)' },
    'bureau-travail': { heures: 8, jours: 22, label: 'Bureau (5j/sem × 4 sem)' }
  };
  if (!scenarios[scenario]) return;
  $('clim-heures').value = scenarios[scenario].heures;
  $('clim-jours').value = scenarios[scenario].jours;
  document.querySelectorAll('.clim-scenario-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.clim-scenario-btn[data-key="${scenario}"]`);
  if (btn) btn.classList.add('active');
}

function calcConsoClim() {
  const puissance = parseFloat($('clim-puissance').value) || 0;
  const heures = parseFloat($('clim-heures').value) || 0;
  const jours = parseInt($('clim-jours').value, 10) || 0;
  const prixKwh = parseFloat($('clim-prix-kwh').value) || 0.25;
  const temperatureExt = parseFloat($('clim-temp').value) || 30;
  
  if (puissance <= 0 || heures <= 0 || jours <= 0) {
    showResult('clim-result', '<div class="note">⚠ Remplis tous les champs (puissance, heures/jour, jours).</div>');
    return;
  }
  
  // Calcul de base
  const consoJourKwh = (puissance * heures) / 1000;
  const consoTotaleKwh = consoJourKwh * jours;
  const coutJour = consoJourKwh * prixKwh;
  const coutTotal = consoTotaleKwh * prixKwh;
  const coutMois = coutJour * 30;
  const coutHeure = (puissance / 1000) * prixKwh;
  
  // Estimation CO2 (mix énergétique français ~50g CO2/kWh)
  const co2Kg = (consoTotaleKwh * 50) / 1000;
  
  // Bonus : économie possible en montant la consigne
  // Chaque +1°C économise ~7% (référence ADEME)
  const economie22vs26 = coutTotal * 0.30; // 22°C consomme ~30% de plus que 26°C
  
  // Type de clim
  let typeClim = 'Personnalisée';
  if (puissance < 1000) typeClim = '🌿 Petite (chambre)';
  else if (puissance < 2000) typeClim = '🏠 Split moyen (salon)';
  else if (puissance < 3500) typeClim = '🏢 Multi-split / grande pièce';
  else typeClim = '🏛️ Centrale / commerciale';
  
  // Comparaison avec alternatives
  const ventilateur = 50 * heures * jours / 1000 * prixKwh; // ventilateur ~50W
  
  showResult('clim-result', `
    <div class="result-label">Coût de la clim</div>
    <div class="result-value">${formatEur(coutTotal)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Type de clim</span><strong>${typeClim} (${puissance}W)</strong></div>
      <div class="result-detail-row"><span>Utilisation</span><strong>${heures}h/jour × ${jours} jours</strong></div>
      <div class="result-detail-row"><span>Conso totale</span><strong>${formatNum(consoTotaleKwh, 1)} kWh</strong></div>
      <div class="result-detail-row"><span>Prix kWh</span><strong>${formatEur(prixKwh)}</strong></div>
      <div class="result-detail-row"><span>Coût par heure</span><strong>${formatEur(coutHeure)}/h</strong></div>
      <div class="result-detail-row"><span>Coût par jour</span><strong>${formatEur(coutJour)}</strong></div>
      <div class="result-detail-row"><span>Coût par mois (30j)</span><strong>${formatEur(coutMois)}</strong></div>
      <div class="result-detail-row"><span><strong>Coût total période</strong></span><strong style="color:#dc2626;">${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>🌱 Empreinte CO₂</span><strong>${formatNum(co2Kg, 1)} kg CO₂eq</strong></div>
    </div>
    
    <div style="margin-top: 16px; padding: 14px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <strong>💡 Tu pourrais économiser ${formatEur(economie22vs26)}</strong><br>
      <span style="font-size:13px;">En passant ta consigne de 22°C à 26°C (recommandation ADEME). Chaque degré supplémentaire coûte ~7% de plus.</span>
    </div>

    <div style="margin-top: 12px; padding: 14px; background: var(--surface-2); border-radius: 8px;">
      <strong>🆚 Alternatives moins chères :</strong>
      <div class="result-detail-row" style="margin-top:6px;"><span>Ventilateur 50W (même usage)</span><strong>${formatEur(ventilateur)} (économie ${formatEur(coutTotal - ventilateur)})</strong></div>
      <div class="result-detail-row"><span>Volets fermés + ventilation nuit</span><strong>0 € (gratuit)</strong></div>
      <div class="result-detail-row"><span>Climatiseur de classe A+++ (-30%)</span><strong>${formatEur(coutTotal * 0.7)}</strong></div>
    </div>

    <div class="note">📊 <strong>Astuces ADEME :</strong> 26°C max recommandé, écart max 7°C avec l'extérieur (donc 28°C s'il fait 35°C dehors). Nettoyer filtres chaque mois (+15% efficacité). Fermer volets dès le matin. Ventilation nocturne quand température extérieure < intérieur.</div>
  `);
}

// ========== 56. RECHARGE VOITURE ÉLECTRIQUE (RICHE) ==========

const VE_MODELS = {
  'tesla-model-3-sr': { name: 'Tesla Model 3 SR (60 kWh)', capacite: 60, conso: 14 },
  'tesla-model-3-lr': { name: 'Tesla Model 3 LR (82 kWh)', capacite: 82, conso: 15 },
  'tesla-model-y': { name: 'Tesla Model Y (75 kWh)', capacite: 75, conso: 16 },
  'tesla-model-s': { name: 'Tesla Model S (100 kWh)', capacite: 100, conso: 18 },
  'renault-zoe': { name: 'Renault Zoe (52 kWh)', capacite: 52, conso: 17 },
  'renault-megane': { name: 'Renault Megane E-Tech (60 kWh)', capacite: 60, conso: 16 },
  'peugeot-e208': { name: 'Peugeot e-208 (50 kWh)', capacite: 50, conso: 16 },
  'peugeot-e308': { name: 'Peugeot e-308 (54 kWh)', capacite: 54, conso: 17 },
  'citroen-ec3': { name: 'Citroën ë-C3 (44 kWh)', capacite: 44, conso: 17 },
  'dacia-spring': { name: 'Dacia Spring (27 kWh)', capacite: 27, conso: 14 },
  'volkswagen-id3': { name: 'VW ID.3 (58 kWh)', capacite: 58, conso: 16 },
  'volkswagen-id4': { name: 'VW ID.4 (77 kWh)', capacite: 77, conso: 18 },
  'kia-ev6': { name: 'Kia EV6 (77 kWh)', capacite: 77, conso: 16 },
  'hyundai-ioniq5': { name: 'Hyundai Ioniq 5 (77 kWh)', capacite: 77, conso: 17 },
  'fiat-500e': { name: 'Fiat 500e (42 kWh)', capacite: 42, conso: 15 },
  'bmw-i4': { name: 'BMW i4 (80 kWh)', capacite: 80, conso: 17 },
  'mercedes-eqe': { name: 'Mercedes EQE (90 kWh)', capacite: 90, conso: 19 },
  'mg4': { name: 'MG4 (64 kWh)', capacite: 64, conso: 16 },
  'byd-atto3': { name: 'BYD Atto 3 (60 kWh)', capacite: 60, conso: 17 },
  'autre': { name: 'Autre / Personnalisé', capacite: 0, conso: 18 }
};

function vePreset(modelKey) {
  if (!VE_MODELS[modelKey]) return;
  const m = VE_MODELS[modelKey];
  if (m.capacite > 0) $('ve-capacite').value = m.capacite;
  if (m.conso > 0) $('ve-conso').value = m.conso;
  document.querySelectorAll('.ve-model-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.ve-model-btn[data-key="${modelKey}"]`);
  if (btn) btn.classList.add('active');
}

function veBorne(puissance, prix) {
  $('ve-puissance').value = puissance;
  $('ve-prix-kwh').value = prix;
  document.querySelectorAll('.ve-borne-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.ve-borne-btn[data-puissance="${puissance}"]`);
  if (btn) btn.classList.add('active');
}

function calcRechargeVE() {
  const capacite = parseFloat($('ve-capacite').value) || 0;
  const chargeInitiale = parseFloat($('ve-charge-init').value) || 0;
  const chargeFinale = parseFloat($('ve-charge-fin').value) || 100;
  const puissanceCharge = parseFloat($('ve-puissance').value) || 0;
  const prixKwh = parseFloat($('ve-prix-kwh').value) || 0.25;
  const conso100km = parseFloat($('ve-conso').value) || 18;
  
  if (capacite <= 0 || puissanceCharge <= 0) {
    showResult('ve-result', '<div class="note">⚠ Remplis la capacité batterie et la puissance de charge.</div>');
    return;
  }
  
  if (chargeFinale <= chargeInitiale) {
    showResult('ve-result', '<div class="note">⚠ La charge finale doit être supérieure à la charge initiale.</div>');
    return;
  }
  
  const pourcentageACharger = chargeFinale - chargeInitiale;
  const kwhNecessaires = capacite * (pourcentageACharger / 100);
  
  // Rendement de charge (en moyenne 90% à domicile, 95% en borne rapide)
  const rendement = puissanceCharge > 50 ? 0.92 : 0.88;
  const kwhFactures = kwhNecessaires / rendement;
  
  // Temps de charge (sur charge rapide, ralentit après 80%)
  let tempsCharge;
  if (puissanceCharge >= 50 && chargeFinale > 80) {
    // Charge rapide : 10-80% à pleine puissance, 80-100% à moitié
    const partRapide = Math.max(0, 80 - chargeInitiale) / 100 * capacite;
    const partLente = (chargeFinale - 80) / 100 * capacite;
    tempsCharge = partRapide / puissanceCharge + partLente / (puissanceCharge * 0.4);
  } else {
    tempsCharge = kwhNecessaires / puissanceCharge;
  }
  
  const heuresCharge = Math.floor(tempsCharge);
  const minutesCharge = Math.round((tempsCharge - heuresCharge) * 60);
  
  const coutTotal = kwhFactures * prixKwh;
  const kmAvecCharge = (kwhNecessaires / conso100km) * 100;
  const coutAu100km = (conso100km / 100) * (prixKwh / rendement);
  
  // Comparaison thermique (8L/100km × 1.80€/L)
  const coutThermique100km = 8 * 1.80;
  const economie100km = coutThermique100km - coutAu100km;
  const economie10000km = economie100km * 100;
  
  // Type de borne
  let typeBorne = '';
  if (puissanceCharge <= 2.3) typeBorne = '🐌 Prise domestique (220V)';
  else if (puissanceCharge <= 3.7) typeBorne = '🔌 Prise renforcée Green\'Up';
  else if (puissanceCharge <= 7.4) typeBorne = '⚡ Wallbox 32A monophasée';
  else if (puissanceCharge <= 22) typeBorne = '⚡⚡ Wallbox triphasée';
  else if (puissanceCharge <= 50) typeBorne = '🔥 Borne rapide DC';
  else if (puissanceCharge <= 150) typeBorne = '🔥🔥 Borne ultra-rapide';
  else typeBorne = '🚀 Supercharger / 350 kW';
  
  // CO2 (50g/kWh mix français)
  const co2 = (kwhFactures * 50) / 1000;
  
  showResult('ve-result', `
    <div class="result-label">Coût de la recharge</div>
    <div class="result-value">${formatEur(coutTotal)}</div>
    <div class="result-detail">
      <div class="result-detail-row"><span>Batterie</span><strong>${capacite} kWh</strong></div>
      <div class="result-detail-row"><span>Charge</span><strong>${chargeInitiale}% → ${chargeFinale}%</strong></div>
      <div class="result-detail-row"><span>Énergie facturée</span><strong>${formatNum(kwhFactures, 1)} kWh</strong></div>
      <div class="result-detail-row"><span>Borne</span><strong>${typeBorne}</strong></div>
      <div class="result-detail-row"><span>⏱️ Temps de charge</span><strong>${heuresCharge}h${minutesCharge.toString().padStart(2,'0')}</strong></div>
      <div class="result-detail-row"><span>Prix kWh</span><strong>${formatEur(prixKwh)}</strong></div>
      <div class="result-detail-row"><span><strong>Coût total</strong></span><strong style="color:#dc2626;">${formatEur(coutTotal)}</strong></div>
      <div class="result-detail-row"><span>🛣️ Autonomie ajoutée</span><strong>~${formatNum(kmAvecCharge, 0)} km</strong></div>
      <div class="result-detail-row"><span>🟢 Coût aux 100 km</span><strong style="color:#10b981;">${formatEur(coutAu100km)}</strong></div>
      <div class="result-detail-row"><span>🌱 CO₂ émis</span><strong>${formatNum(co2, 1)} kg</strong></div>
    </div>

    <div style="margin-top:16px; padding:14px; background:#d1fae5; border-radius:8px; border-left:4px solid #10b981;">
      <strong>🆚 Comparaison voiture thermique</strong><br>
      <div class="result-detail-row" style="margin-top:6px;"><span>Coût aux 100 km thermique</span><strong>${formatEur(coutThermique100km)} (8L × 1,80€/L)</strong></div>
      <div class="result-detail-row"><span>Économie aux 100 km</span><strong>${formatEur(economie100km)} (-${Math.round((economie100km/coutThermique100km)*100)}%)</strong></div>
      <div class="result-detail-row"><span>Sur 10 000 km/an</span><strong>${formatEur(economie10000km)} économisés</strong></div>
      <div class="result-detail-row"><span>Sur 5 ans</span><strong>${formatEur(economie10000km * 5)} économisés</strong></div>
    </div>

    <div style="margin-top:12px; padding:14px; background:var(--surface-2); border-radius:8px;">
      <strong>💡 Astuces de recharge</strong>
      <div style="margin-top:8px; font-size:13px;">
        • <strong>Charge à domicile</strong> = 5-8x moins cher qu'en borne publique<br>
        • <strong>Heures creuses</strong> (22h-6h) = -30% à -50% sur la facture<br>
        • <strong>80% suffit</strong> au quotidien (préserve la batterie + plus rapide)<br>
        • <strong>100% utile</strong> avant un long trajet seulement<br>
        • <strong>Charge lente</strong> (Wallbox 7kW) = meilleure longévité batterie
      </div>
    </div>

    <div class="note">📊 Estimation basée sur le rendement réel (${Math.round(rendement*100)}%), pas la conso théorique. La conso varie de ±30% selon vitesse, climat, charge transportée. Sur autoroute à 130 km/h, compte +40% vs cycle WLTP.</div>
  `);
}

