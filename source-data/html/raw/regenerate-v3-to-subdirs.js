const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour déplacer les fichiers générés vers les sous-dossiers v3
function moveToV3Subdirs(jsonFile) {
    const baseName = path.basename(jsonFile, '.json');
    
    // Chemins source (où generateur-automatique.js les met)
    const sourceGrilleHtml = path.join('grilles_generees/html', `${baseName} - Grille ECOS.html`);
    const sourceGrillePdf = path.join('grilles_generees/pdf', `${baseName} - Grille ECOS.pdf`);
    const sourceFeuilleHtml = path.join('feuille-porte/html', `${baseName} - Feuille Porte.html`);
    const sourceFeuillePdf = path.join('feuille-porte/pdf', `${baseName} - Feuille Porte.pdf`);
    
    // Chemins destination (sous-dossiers v3)
    const destGrilleHtml = path.join('grilles_generees/html/v3', `${baseName} - Grille ECOS.html`);
    const destGrillePdf = path.join('grilles_generees/pdf/v3', `${baseName} - Grille ECOS.pdf`);
    const destFeuilleHtml = path.join('feuille-porte/html/v3', `${baseName} - Feuille Porte.html`);
    const destFeuillePdf = path.join('feuille-porte/pdf/v3', `${baseName} - Feuille Porte.pdf`);
    
    // Déplacer les fichiers
    let moved = [];
    if (fs.existsSync(sourceGrilleHtml)) {
        fs.renameSync(sourceGrilleHtml, destGrilleHtml);
        moved.push('Grille HTML');
    }
    if (fs.existsSync(sourceGrillePdf)) {
        fs.renameSync(sourceGrillePdf, destGrillePdf);
        moved.push('Grille PDF');
    }
    if (fs.existsSync(sourceFeuilleHtml)) {
        fs.renameSync(sourceFeuilleHtml, destFeuilleHtml);
        moved.push('Feuille HTML');
    }
    if (fs.existsSync(sourceFeuillePdf)) {
        fs.renameSync(sourceFeuillePdf, destFeuillePdf);
        moved.push('Feuille PDF');
    }
    
    return moved;
}

// Liste des fichiers v3 modifiés
const modifiedFiles = [
    'Yeux rouges_v3.json',
    'Saignement vaginal_v3.json'
];

// Vérifier aussi les fichiers récemment modifiés
try {
    const recentlyModified = execSync('find json_files/v3 -name "*.json" -mmin -30', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f)
        .map(f => path.basename(f));
    
    // Ajouter les fichiers récemment modifiés à la liste
    recentlyModified.forEach(file => {
        if (!modifiedFiles.includes(file)) {
            modifiedFiles.push(file);
        }
    });
} catch (e) {
    console.log('Note: Could not check for recently modified files');
}

console.log(`\n🔄 Régénération de ${modifiedFiles.length} fichiers v3 vers les nouveaux sous-dossiers...\n`);

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
        // Générer avec generateur-automatique.js
        execSync(`node generateur-automatique.js "${jsonPath}"`, { stdio: 'pipe' });
        
        // Déplacer vers les sous-dossiers v3
        const moved = moveToV3Subdirs(jsonPath);
        
        if (moved.length > 0) {
            console.log(`  ✅ Fichiers générés et déplacés: ${moved.join(', ')}`);
            successCount++;
        } else {
            console.log(`  ⚠️  Aucun fichier généré`);
            errorCount++;
        }
        
    } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
        errorCount++;
    }
});

console.log(`\n📊 Résumé:`);
console.log(`✅ ${successCount} fichiers régénérés avec succès`);
console.log(`❌ ${errorCount} erreurs`);
console.log(`\n💡 Les fichiers v3 sont maintenant dans:`);
console.log(`  - grilles_generees/html/v3/`);
console.log(`  - grilles_generees/pdf/v3/`);
console.log(`  - feuille-porte/html/v3/`);
console.log(`  - feuille-porte/pdf/v3/`);