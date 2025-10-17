// Script de diagnostic pour identifier les problèmes du générateur v4
const fs = require('fs');

// Lire le fichier JSON source
const jsonContent = fs.readFileSync('json_files/USMLE Triage 17 - Nausées et Vomissements.json', 'utf8');
const data = JSON.parse(jsonContent);

// Lire le HTML généré
const htmlContent = fs.readFileSync('grilles_generees/html/USMLE Triage/USMLE Triage 17 - Nausées et Vomissements - Grille ECOS.html', 'utf8');

console.log('=== ANALYSE DU JSON SOURCE ===\n');

// Analyser la structure de scenarioPatienteStandardisee
const scenario = data.annexes.scenarioPatienteStandardisee;

// Vérifier les sections qui apparaissent en double
console.log('1. Sections dans histoireActuelle:');
if (scenario.histoireActuelle) {
    Object.keys(scenario.histoireActuelle).forEach(key => {
        const value = scenario.histoireActuelle[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`   - ${key}: ${type}`);
        if (key === 'symptomesAssocies' || key === 'symptômes associés') {
            console.log(`     ATTENTION: Possible duplication avec ${key}`);
        }
    });
}

console.log('\n2. Sections dans anamneseSystemes:');
if (scenario.anamneseSystemes) {
    Object.keys(scenario.anamneseSystemes).forEach(key => {
        const value = scenario.anamneseSystemes[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`   - ${key}: ${type}`);
    });
}

console.log('\n3. Structure de histoireGynecologique:');
if (scenario.histoireGynecologique) {
    console.log('   Type:', Array.isArray(scenario.histoireGynecologique) ? 'array' : 'object');
    if (Array.isArray(scenario.histoireGynecologique)) {
        console.log('   Contenu:', scenario.histoireGynecologique);
    } else {
        Object.keys(scenario.histoireGynecologique).forEach(key => {
            console.log(`   - ${key}:`, scenario.histoireGynecologique[key]);
        });
    }
}

console.log('\n=== ANALYSE DU HTML GÉNÉRÉ ===\n');

// Compter les occurrences de "Symptômes associés"
const symptomesAssociesMatches = htmlContent.match(/<strong>Symptômes associés[\s:]*<\/strong>/g);
console.log(`Nombre d'occurrences de "Symptômes associés": ${symptomesAssociesMatches ? symptomesAssociesMatches.length : 0}`);

// Chercher les labels non traduits
const untranslatedLabels = htmlContent.match(/<strong>(douleurActuelle|hydratation|alimentation|urinaire|general|digestif|temperature)[\s:]*<\/strong>/g);
if (untranslatedLabels) {
    console.log('\nLabels non traduits trouvés:');
    untranslatedLabels.forEach(label => console.log(`   - ${label}`));
}

// Vérifier la présence de histoireGynecologique
const gynecologieSection = htmlContent.match(/<h4>Histoire gynécologique<\/h4>[\s\S]*?(?=<h4>|<\/div>)/);
if (gynecologieSection) {
    console.log('\nSection Histoire gynécologique trouvée:');
    console.log(gynecologieSection[0].substring(0, 200) + '...');
}

// Analyser la structure des mappings de labels dans le générateur
console.log('\n=== VÉRIFICATION DES MAPPINGS NÉCESSAIRES ===\n');

const labelsToCheck = [
    'histoireActuelle.douleurActuelle',
    'symptomesAssocies.hydratation',
    'symptomesAssocies.alimentation',
    'symptomesAssocies.urinaire',
    'etatActuel.general',
    'etatActuel.digestif',
    'etatActuel.temperature'
];

labelsToCheck.forEach(path => {
    const parts = path.split('.');
    let current = scenario;
    let found = true;
    
    for (const part of parts) {
        if (current && current[part] !== undefined) {
            current = current[part];
        } else {
            found = false;
            break;
        }
    }
    
    if (found) {
        console.log(`✓ ${path} existe dans le JSON`);
    } else {
        console.log(`✗ ${path} n'existe pas dans le JSON`);
    }
});