// Script de validation complète pour vérifier que toutes les sections sont prises en charge
const fs = require('fs');

// Charger les deux fichiers de structure
let structure1, structure2;
try {
    structure1 = JSON.parse(fs.readFileSync('json_files/structure_scenarioPatienteStandardisee.json', 'utf8'));
} catch (e) {
    console.log('Erreur lecture structure1:', e.message);
    structure1 = { scenarioPatienteStandardisee: {} };
}

try {
    structure2 = JSON.parse(fs.readFileSync('json_files/structure_scenariopatientestandardi.json', 'utf8'));
} catch (e) {
    console.log('Erreur lecture structure2:', e.message);
    structure2 = { scenarioPatienteStandardisee: {} };
}

console.log('Structure1 keys:', Object.keys(structure1));
console.log('Structure2 keys:', Object.keys(structure2));

// Charger le générateur
const generatorContent = fs.readFileSync('Chablon/Generateur_de_Grilles_ECOS_v4.html', 'utf8');

// Fonction récursive pour extraire tous les chemins d'une structure
function extractPaths(obj, prefix = '') {
    let paths = [];
    for (const key in obj) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            paths.push(fullPath);
            paths = paths.concat(extractPaths(obj[key], fullPath));
        } else {
            paths.push(fullPath);
        }
    }
    return paths;
}

// Extraire tous les chemins des deux structures
let paths1 = [];
let paths2 = [];

if (structure1.annexes && structure1.annexes.scenarioPatienteStandardisee) {
    paths1 = extractPaths(structure1.annexes.scenarioPatienteStandardisee, 'scenario');
} else if (structure1.scenarioPatienteStandardisee) {
    paths1 = extractPaths(structure1.scenarioPatienteStandardisee, 'scenario');
}

if (structure2.annexes && structure2.annexes.scenarioPatienteStandardisee) {
    paths2 = extractPaths(structure2.annexes.scenarioPatienteStandardisee, 'scenario');
} else if (structure2.scenarioPatienteStandardisee) {
    paths2 = extractPaths(structure2.scenarioPatienteStandardisee, 'scenario');
}

console.log('Paths1 count:', paths1.length);
console.log('Paths2 count:', paths2.length);

// Combiner et dédupliquer
const allPaths = [...new Set([...paths1, ...paths2])].sort();

console.log('=== VALIDATION DE LA PRISE EN CHARGE DES SECTIONS ===\n');
console.log(`Total de sections à vérifier: ${allPaths.length}\n`);

// Vérifier chaque chemin
let missingCount = 0;
const missingPaths = [];

allPaths.forEach(path => {
    // Extraire la dernière partie du chemin pour la recherche
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    
    // Rechercher dans le générateur
    // On cherche soit le nom de la propriété, soit son label traduit
    const regex1 = new RegExp(`['"]${lastPart}['"]`, 'g');
    const regex2 = new RegExp(`\\.${lastPart}(?:[\\s\\)\\]\\}]|$)`, 'g');
    
    const found = regex1.test(generatorContent) || regex2.test(generatorContent);
    
    if (!found) {
        missingCount++;
        missingPaths.push(path);
        console.log(`❌ ${path}`);
    }
});

console.log(`\n=== RÉSUMÉ ===`);
console.log(`Sections manquantes: ${missingCount}/${allPaths.length}`);
console.log(`Taux de couverture: ${((allPaths.length - missingCount) / allPaths.length * 100).toFixed(1)}%`);

if (missingPaths.length > 0) {
    console.log('\n=== SECTIONS À AJOUTER AU GÉNÉRATEUR ===\n');
    
    // Grouper par section principale
    const grouped = {};
    missingPaths.forEach(path => {
        const parts = path.split('.');
        const mainSection = parts[1]; // scenario.XXX
        if (!grouped[mainSection]) {
            grouped[mainSection] = [];
        }
        grouped[mainSection].push(parts.slice(2).join('.'));
    });
    
    // Afficher par groupe
    Object.keys(grouped).sort().forEach(section => {
        console.log(`\n${section}:`);
        grouped[section].forEach(subpath => {
            console.log(`  - ${subpath || '(racine)'}`);
        });
    });
}