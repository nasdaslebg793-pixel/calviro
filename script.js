const bacData = {
    general: [
        { nom: "Maths", coef: 16 },
        { nom: "Philo", coef: 8 },
        { nom: "Français", coef: 10 }
    ],
    stmg: [
        { nom: "Management", coef: 16 },
        { nom: "Économie-Droit", coef: 16 },
        { nom: "Philo", coef: 4 }
    ]
};

function chargerMatieres() {
    const bacSelectionne = document.getElementById('select-bac').value;
    const container = document.getElementById('matieres-container');
    container.innerHTML = ""; // On vide

    bacData[bacSelectionne].forEach(m => {
        container.innerHTML += `
            <div class="matiere-row">
                <span>${m.nom} (Coef ${m.coef})</span>
                <input type="number" placeholder="Note" class="note-input" data-coef="${m.coef}">
            </div>
        `;
    });
}

function genererPDF() {
    const element = document.getElementById('matieres-container');
    const options = {
        margin: 1,
        filename: 'mon_bac_previsionnel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
}

// Lancer au chargement
window.onload = chargerMatieres;
