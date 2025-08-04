const fs = require('fs');

// Liste des sections principales de scenarioPatienteStandardisee
const sections = [
    'titre',
    'nom',
    'age',
    'contexte',
    'motifConsultation',
    'consignes',
    'histoireActuelle',
    'caracteristiquesComportementales',
    'simulation',
    'anamneseSystemes',
    'habitudes',
    'informationsPersonnelles',
    'histoireMedicale',
    'expositions',
    'exposition',
    'alimentation',
    'histoireGynecologique',
    'historieSexuelle',
    'informationADonner',
    'antecedentsPersonnels',
    'antecedentsFamiliaux',
    'antecedentsEnfant',
    'grossesseActuelle',
    'symptomesActuels',
    'symptomesUrinaires',
    'antecedentsRecents',
    'famille',
    'communicationDifficile',
    'techniqueRechercheMedicaments',
    'facteurRisque',
    'contextAlimentaire',
    'hydratation',
    'troublesSommeil',
    'medicaments',
    'roleEpouse',
    'histoireFamiliale',
    'hygieneSommeil',
    'symptomesAssocies',
    'symptomesRecents'
];

// Lire le générateur
const generator = fs.readFileSync('../Chablon/Generateur_de_Grilles_ECOS_v4.html', 'utf8');

console.log('=== VÉRIFICATION DES SECTIONS SCENARIOPATIENTESTANDARDISEE ===\n');

// Vérifier chaque section
sections.forEach(section => {
    // Chercher des références à scenario.section
    const regex1 = new RegExp(`scenario\\.${section}[\\s\\)\\[]`, 'g');
    const regex2 = new RegExp(`scenario\\['${section}'\\]`, 'g');
    
    const match1 = generator.match(regex1);
    const match2 = generator.match(regex2);
    
    if (match1 || match2) {
        console.log(`✅ ${section} - TROUVÉ (${(match1?.length || 0) + (match2?.length || 0)} occurrences)`);
    } else {
        console.log(`❌ ${section} - MANQUANT`);
    }
});

// Rechercher les sections qui sont dans le générateur mais pas dans notre liste
console.log('\n=== SECTIONS ADDITIONNELLES DANS LE GÉNÉRATEUR ===\n');
const scenarioPattern = /scenario\.(\w+)/g;
let match;
const foundSections = new Set();

while ((match = scenarioPattern.exec(generator)) !== null) {
    foundSections.add(match[1]);
}

foundSections.forEach(section => {
    if (!sections.includes(section)) {
        console.log(`📌 ${section} - Dans le générateur mais pas dans la liste`);
    }
});