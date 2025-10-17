const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Récupérer tous les fichiers v3 modifiés récemment
const modifiedFiles = execSync('find json_files/v3 -name "*.json" -mtime -1', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => f)
    .map(f => path.basename(f));

console.log(`\n🔄 Régénération de ${modifiedFiles.length} fichiers v3 modifiés récemment...\n`);

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