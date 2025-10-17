const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Liste spécifique des fichiers v3 à régénérer
const specificFiles = [
    'AVP_v3.json',
    'Yeux rouges_v3.json',
    'Tremor_v3.json',
    'Toux I_v3.json',
    'Syncope_v3.json',
    'Retard de croissance - Pédiatrie_v3.json',
    'Problème personnel_v3.json',
    'Pollakiurie_v3.json',
    'Peur - Psy_v3.json',
    'Otorrhée - Pédiatrie_v3.json',
    'Chute I_v3.json',
    'Bradycardie_v3.json'
];

console.log(`\n🔄 Régénération de ${specificFiles.length} fichiers v3 spécifiques...\n`);

let successCount = 0;
let errorCount = 0;

specificFiles.forEach((file, index) => {
    console.log(`[${index + 1}/${specificFiles.length}] Processing: ${file}`);
    
    const jsonPath = path.join('json_files/v3', file);
    
    if (!fs.existsSync(jsonPath)) {
        console.log(`  ⚠️  Fichier non trouvé: ${jsonPath}`);
        errorCount++;
        return;
    }
    
    try {
        // Utiliser generateur-automatique.js pour générer tous les fichiers
        const output = execSync(`node generateur-automatique.js "${jsonPath}"`, { encoding: 'utf8' });
        
        // Vérifier si les fichiers ont été créés
        const title = file.replace('.json', '');
        const htmlGrid = path.join('grilles_generees/html', `${title} - Grille ECOS.html`);
        const pdfGrid = path.join('grilles_generees/pdf', `${title} - Grille ECOS.pdf`);
        const htmlPorte = path.join('feuille-porte/html', `${title} - Feuille Porte.html`);
        const pdfPorte = path.join('feuille-porte/pdf', `${title} - Feuille Porte.pdf`);
        
        let filesCreated = [];
        if (fs.existsSync(htmlGrid)) filesCreated.push('Grille HTML');
        if (fs.existsSync(pdfGrid)) filesCreated.push('Grille PDF');
        if (fs.existsSync(htmlPorte)) filesCreated.push('Feuille Porte HTML');
        if (fs.existsSync(pdfPorte)) filesCreated.push('Feuille Porte PDF');
        
        console.log(`  ✅ Fichiers générés: ${filesCreated.join(', ')}`);
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