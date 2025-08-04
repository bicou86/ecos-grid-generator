const fs = require('fs');

// Lire les fichiers JSON
const structureComplete = JSON.parse(fs.readFileSync('structure_scenarioPatienteStandardisee.json', 'utf8'));
const structureActuelle = JSON.parse(fs.readFileSync('structure_annexes.json', 'utf8'));

// Fonction pour extraire toutes les propriétés d'un objet de manière récursive
function extractProperties(obj, prefix = '') {
    let properties = new Set();
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let fullKey = prefix ? `${prefix}.${key}` : key;
            properties.add(fullKey);
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                // Récursion pour les objets imbriqués
                let subProperties = extractProperties(obj[key], fullKey);
                subProperties.forEach(prop => properties.add(prop));
            }
        }
    }
    
    return properties;
}

// Extraire toutes les propriétés des deux structures
const propsComplete = extractProperties(structureComplete.annexes.scenarioPatienteStandardisee, 'scenarioPatienteStandardisee');
const propsActuelle = extractProperties(structureActuelle.annexes.scenarioPatienteStandardisee, 'scenarioPatienteStandardisee');

// Trouver les propriétés manquantes
const manquantes = [];
for (let prop of propsComplete) {
    if (!propsActuelle.has(prop)) {
        manquantes.push(prop);
    }
}

// Organiser les propriétés manquantes par section principale
const manquantesParSection = {};
manquantes.forEach(prop => {
    const parts = prop.split('.');
    const section = parts[1]; // Première partie après scenarioPatienteStandardisee
    if (!manquantesParSection[section]) {
        manquantesParSection[section] = [];
    }
    manquantesParSection[section].push(prop);
});

// Afficher les résultats
console.log('=== PROPRIÉTÉS MANQUANTES DANS structure_annexes.json ===\n');
console.log(`Total: ${manquantes.length} propriétés manquantes\n`);

// Afficher par section
Object.keys(manquantesParSection).sort().forEach(section => {
    console.log(`\n${section}: (${manquantesParSection[section].length} propriétés)`);
    manquantesParSection[section].sort().forEach(prop => {
        console.log(`  - ${prop}`);
    });
});

// Créer un fichier avec les sections manquantes pour faciliter l'ajout
const sectionsManquantes = {};
manquantes.forEach(prop => {
    const parts = prop.split('.');
    let current = sectionsManquantes;
    
    // Reconstruire la structure
    for (let i = 1; i < parts.length; i++) { // Skip 'scenarioPatienteStandardisee'
        const part = parts[i];
        if (i === parts.length - 1) {
            // Dernière partie - créer la propriété
            current[part] = "";
        } else {
            // Partie intermédiaire - créer l'objet si nécessaire
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
    }
});

// Sauvegarder les sections manquantes
fs.writeFileSync('sections_manquantes.json', JSON.stringify(sectionsManquantes, null, 2));
console.log('\n\nLes sections manquantes ont été sauvegardées dans sections_manquantes.json');