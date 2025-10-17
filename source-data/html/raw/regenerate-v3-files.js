const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Liste des fichiers v3 modifiés par fix-v3-diagnostics.js
const modifiedFiles = [
    'Érythème_v3.json',
    'Insomnie I_v3.json',
    'Lombalgie I_v3.json',
    'Lombalgie II_v3.json',
    'Lombalgie III_v3.json',
    'Palpitations_v3.json',
    'Pneumonie II_v3.json',
    'Surdosage au paracétamol_v3.json',
    'Douleur thoracique I_v3.json',
    'Douleur thoracique II_v3.json',
    'Douleur thoracique III_v3.json',
    'Douleur thoracique IV_v3.json',
    'Dysphagie_v3.json',
    'Vertige I_v3.json',
    'Vertige II_v3.json',
    'Gonflement articulaire_v3.json',
    'Ascite et désorientation_v3.json',
    'Diarrhée II_v3.json',
    'Épilepsie - Pédiatrie I_v3.json',
    'Urgence hypertensive_v3.json',
    'Troubles mnésiques_v3.json',
    'Polyurie polydipsie_v3.json',
    'Chute II_v3.json',
    'Fièvre I_v3.json',
    'Fièvre et voyage_v3.json',
    'Hémorragie gastro-intestinale haute_v3.json',
    'Pancréatite_v3.json',
    'Syndrome méningé - Pédiatrie_v3.json',
    'Choc anaphylactique_v3.json',
    'Brûlure_v3.json',
    'Tabagisme I_v3.json',
    'Insuffisance cardiaque I_v3.json',
    'Insuffisance cardiaque II_v3.json',
    'Dysurie II_v3.json',
    'Morsure de chien_v3.json',
    'Hallucinations_v3.json',
    'Tachycardie_v3.json',
    'Trouble anxieux_v3.json',
    'Embolie pulmonaire_v3.json',
    'Dépression_v3.json',
    'Érysipèle_v3.json',
    'Suicidalité_v3.json',
    'Plaies_v3.json',
    'Vaccination manquée - Pédiatrie_v3.json',
    'Nodule thyroïdien_v3.json',
    'Gonalgie - Pédiatrie_v3.json',
    'Thrombose veineuse profonde_v3.json'
];

console.log(`\n🔄 Régénération de ${modifiedFiles.length} fichiers v3 modifiés...\n`);

let successCount = 0;
let errorCount = 0;

modifiedFiles.forEach((file, index) => {
    console.log(`[${index + 1}/${modifiedFiles.length}] Processing: ${file}`);
    
    const jsonPath = path.join('json_files/v3', file);
    
    if (!fs.existsSync(jsonPath)) {
        console.log(`  ⚠️  Fichier non trouvé: ${jsonPath}`);
        errorCount++;
        return;
    }
    
    try {
        // Utiliser generateur-automatique.js pour générer tous les fichiers
        execSync(`node generateur-automatique.js "${jsonPath}"`, { stdio: 'pipe' });
        console.log(`  ✅ Fichiers générés avec succès`);
        successCount++;
        
    } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
        errorCount++;
    }
});

console.log(`\n📊 Résumé:`);
console.log(`✅ ${successCount} fichiers régénérés avec succès`);
console.log(`❌ ${errorCount} erreurs`);
console.log(`\n✨ Régénération terminée!`);