#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const JSON_DIR = './json_files';

function regenerateAllGrids() {
    const files = fs.readdirSync(JSON_DIR).filter(file => file.endsWith('.json'));
    console.log(`📋 Régénération de ${files.length} grilles ECOS...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    files.forEach((file, index) => {
        const filePath = path.join(JSON_DIR, file);
        console.log(`\n🔄 [${index + 1}/${files.length}] Génération: ${file}`);
        
        try {
            // Exécuter le générateur automatique
            const output = execSync(`node generateur-automatique.js "${filePath}"`, {
                encoding: 'utf8',
                timeout: 30000 // 30 secondes max par fichier
            });
            
            console.log(`  ✅ Succès: ${file}`);
            successCount++;
            
        } catch (error) {
            console.error(`  ❌ Erreur: ${file}`);
            console.error(`     ${error.message}`);
            errors.push({ file, error: error.message });
            errorCount++;
        }
    });

    console.log(`\n📊 Résumé de la régénération:`);
    console.log(`   - Total fichiers: ${files.length}`);
    console.log(`   - Succès: ${successCount}`);
    console.log(`   - Erreurs: ${errorCount}`);

    if (errors.length > 0) {
        console.log(`\n❌ Fichiers en erreur:`);
        errors.forEach(({ file, error }) => {
            console.log(`   - ${file}: ${error}`);
        });
    }

    console.log(`\n🎉 Régénération terminée !`);
}

// Exécuter la régénération
regenerateAllGrids();