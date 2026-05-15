// ============================================
// CALVIRO V3 - Module global d'amélioration UX
// S'auto-active sur toutes les pages
// ============================================

(function() {
  'use strict';

  // ============ CATÉGORISATION ============
  const CATALOG = {
    'credit-immobilier':       { cat: 'immobilier', title: 'Crédit immobilier', icon: '🏡' },
    'capacite-emprunt':        { cat: 'immobilier', title: "Capacité d'emprunt", icon: '🏠' },
    'frais-notaire':           { cat: 'immobilier', title: 'Frais de notaire', icon: '🧮' },
    'tableau-amortissement':   { cat: 'immobilier', title: "Tableau d'amortissement", icon: '📊' },
    'rentabilite-locative':    { cat: 'immobilier', title: 'Rentabilité locative', icon: '📈' },
    'plus-value-immobiliere':  { cat: 'immobilier', title: 'Plus-value immobilière', icon: '📊' },
    'dpe':                     { cat: 'immobilier', title: 'DPE / Classe énergie', icon: '🔥' },
    'surface-habitable':       { cat: 'immobilier', title: 'Surface habitable', icon: '📐' },

    'impots':                  { cat: 'finance', title: 'Impôt sur le revenu', icon: '📑' },
    'interets-composes':       { cat: 'finance', title: 'Intérêts composés', icon: '💰' },
    'credit-auto':             { cat: 'finance', title: 'Crédit auto', icon: '🚗' },
    'credit-conso':            { cat: 'finance', title: 'Crédit conso', icon: '💳' },
    'livret-a':                { cat: 'finance', title: 'Livret A / Épargne', icon: '🏦' },
    'facture':                 { cat: 'finance', title: 'Facture / TVA', icon: '🧾' },
    'tva-inverse':             { cat: 'finance', title: 'TVA inverse', icon: '🧾' },

    'salaire':                 { cat: 'travail', title: 'Salaire brut/net', icon: '💼' },
    'salaire-charge':          { cat: 'travail', title: 'Salaire chargé', icon: '💼' },
    'tjm-freelance':           { cat: 'travail', title: 'TJM freelance', icon: '💼' },
    'chomage':                 { cat: 'travail', title: 'Allocation chômage', icon: '🛟' },
    'retraite':                { cat: 'travail', title: 'Retraite', icon: '👴' },
    'apl':                     { cat: 'travail', title: 'APL', icon: '🏘️' },
    'indemnite-licenciement':  { cat: 'travail', title: 'Indemnité licenciement', icon: '📄' },

    'imc':                     { cat: 'sante', title: 'IMC', icon: '⚖️' },
    'calories':                { cat: 'sante', title: 'Calories quotidiennes', icon: '🔥' },
    'eau':                     { cat: 'sante', title: 'Besoin en eau', icon: '💧' },
    'allure-course':           { cat: 'sante', title: 'Allure de course', icon: '🏃' },
    'cycles-sommeil':          { cat: 'sante', title: 'Cycles de sommeil', icon: '😴' },
    'accouchement':            { cat: 'sante', title: "Date d'accouchement", icon: '🤰' },
    'ovulation':               { cat: 'sante', title: "Date d'ovulation", icon: '🌸' },
    'alcoolemie':              { cat: 'sante', title: 'Alcoolémie', icon: '🍷' },

    'age':                     { cat: 'temps', title: "Calculateur d'âge", icon: '🎂' },
    'dates':                   { cat: 'temps', title: 'Jours entre 2 dates', icon: '📅' },
    'pomodoro':                { cat: 'temps', title: 'Pomodoro', icon: '🍅' },
    'fuseaux-horaires':        { cat: 'temps', title: 'Fuseaux horaires', icon: '🌐' },

    'cv':                      { cat: 'quotidien', title: 'Générateur de CV', icon: '📋' },
    'mot-de-passe':            { cat: 'quotidien', title: 'Mot de passe', icon: '🔐' },
    'qr-code':                 { cat: 'quotidien', title: 'QR Code', icon: '📱' },
    'lien-whatsapp':           { cat: 'quotidien', title: 'Lien WhatsApp', icon: '🔗' },
    'pdf':                     { cat: 'quotidien', title: 'Outils PDF', icon: '📄' },
    'convertisseur-pdf':       { cat: 'quotidien', title: 'Convertisseur PDF', icon: '📄' },
    'monnaies':                { cat: 'quotidien', title: 'Convertisseur monnaies', icon: '💱' },
    'convertisseur':           { cat: 'quotidien', title: 'Convertisseur unités', icon: '📐' },
    'pourcentage':             { cat: 'quotidien', title: 'Pourcentage', icon: '%' },
    'pourboire':               { cat: 'quotidien', title: 'Pourboire', icon: '💸' },
    'peinture':                { cat: 'quotidien', title: 'Quantité peinture', icon: '🎨' },

    'bac':                     { cat: 'etudes', title: 'Note du Bac', icon: '🎓' },
    'compteur-mots':           { cat: 'etudes', title: 'Compteur de mots', icon: '📝' },
    'pseudo':                  { cat: 'etudes', title: 'Générateur de pseudo', icon: '🎭' },
    'probabilites':            { cat: 'etudes', title: 'Probabilités', icon: '🎯' },
    'calcul-mental':           { cat: 'etudes', title: 'Calcul mental', icon: '🧠' },
    'tirage-au-sort':          { cat: 'etudes', title: 'Tirage au sort', icon: '🎲' }
  };

  // ============ DÉTECTION PAGE ============
  function getCurrentPageId() {
    const path = window.location.pathname;
    const file = path.split('/').pop().replace('.html', '');
    return file;
  }

  function isToolPage() {
    const id = getCurrentPageId();
    return CATALOG.hasOwnProperty(id);
  }

  // ============ OUTILS LIÉS ============
  function injectRelatedTools() {
    if (!isToolPage()) return;
    
    const currentId = getCurrentPageId();
    const currentCat = CATALOG[currentId].cat;
    
    // Trouver 4 outils similaires dans la même catégorie
    const similar = Object.entries(CATALOG)
      .filter(([id, info]) => id !== currentId && info.cat === currentCat)
      .map(([id, info]) => ({ id, ...info }))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    if (similar.length === 0) return;
    
    // Trouver où injecter : après .seo-content si elle existe, sinon après .tool
    const target = document.querySelector('.seo-content') || document.querySelector('.tool');
    if (!target) return;
    
    const html = `
      <div class="related-tools">
        <h3>🔗 Outils similaires</h3>
        <div class="related-grid">
          ${similar.map(s => `
            <a href="${s.id}.html" class="related-card">
              <span class="ico">${s.icon}</span>
              <span>${s.title}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
    target.insertAdjacentHTML('afterend', html);
  }

  // ============ BOUTONS DE PARTAGE ============
  function injectShareButtons() {
    if (!isToolPage()) return;
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const target = document.querySelector('.tool');
    if (!target) return;
    
    const html = `
      <div class="share-bar">
        <span class="share-label">📤 Partager :</span>
        <a href="https://wa.me/?text=${title}%20${url}" target="_blank" rel="noopener" class="share-btn" title="WhatsApp">
          <span>💬</span> WhatsApp
        </a>
        <a href="https://twitter.com/intent/tweet?text=${title}&url=${url}" target="_blank" rel="noopener" class="share-btn" title="Twitter / X">
          <span>𝕏</span> Twitter
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener" class="share-btn" title="Facebook">
          <span>📘</span> Facebook
        </a>
        <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>this.textContent='✓ Copié').then(()=>setTimeout(()=>this.innerHTML='<span>🔗</span> Copier',2000))" class="share-btn" title="Copier le lien">
          <span>🔗</span> Copier
        </button>
      </div>
    `;
    target.insertAdjacentHTML('afterend', html);
  }

  // ============ BOUTON RETOUR EN HAUT ============
  function injectTopButton() {
    const btn = document.createElement('button');
    btn.className = 'top-btn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Retour en haut');
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  }

  // ============ ANIMATIONS AU SCROLL ============
  function setupScrollAnimations() {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    // Animer les sections principales
    document.querySelectorAll('.category-section, .related-tools, .seo-content, .share-bar, .faq-section').forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  // ============ BANNIÈRE COOKIES ============
  function injectCookieBanner() {
    if (localStorage.getItem('calviro-cookies') === 'accepted') return;
    
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-text">
          🍪 Calviro n'utilise <strong>aucun cookie de tracking</strong>. On stocke uniquement tes préférences (thème, favoris, historique) en local sur ton appareil. Aucune donnée envoyée à un serveur.
          <a href="confidentialite.html" style="text-decoration:underline;">En savoir plus</a>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn primary" onclick="localStorage.setItem('calviro-cookies','accepted');this.closest('.cookie-banner').remove();">OK, compris</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('visible'), 800);
  }

  // ============ FAVORIS ============
  function getFavoris() {
    try { return JSON.parse(localStorage.getItem('calviro-favoris') || '[]'); } 
    catch { return []; }
  }

  function setFavoris(list) {
    localStorage.setItem('calviro-favoris', JSON.stringify(list));
  }

  function toggleFavori(id, button) {
    const list = getFavoris();
    const idx = list.indexOf(id);
    if (idx > -1) {
      list.splice(idx, 1);
      button.classList.remove('active');
      button.textContent = '☆';
    } else {
      list.push(id);
      button.classList.add('active');
      button.textContent = '★';
    }
    setFavoris(list);
  }

  function injectFavorisOnCards() {
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html') && !window.location.pathname.endsWith('/')) return;
    
    const favoris = getFavoris();
    document.querySelectorAll('.tool-card[href]').forEach(card => {
      const href = card.getAttribute('href');
      const id = href.replace('.html', '');
      if (card.querySelector('.fav-star')) return;
      
      const star = document.createElement('button');
      star.className = 'fav-star';
      const isFav = favoris.includes(id);
      star.textContent = isFav ? '★' : '☆';
      if (isFav) star.classList.add('active');
      star.setAttribute('aria-label', 'Ajouter aux favoris');
      star.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavori(id, star);
      };
      card.appendChild(star);
    });
  }

  // ============ PWA - SERVICE WORKER ============
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {});
      });
    }
  }

  // ============ INIT ============
  function init() {
    injectRelatedTools();
    injectShareButtons();
    injectTopButton();
    injectCookieBanner();
    injectFavorisOnCards();
    setupScrollAnimations();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for index page
  window.CalviroV3 = { getFavoris, setFavoris, CATALOG };
})();
