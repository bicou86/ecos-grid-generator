#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function processFile(jsonPath, index, total) {
    return new Promise((resolve, reject) => {
        const filename = path.basename(jsonPath);
        console.log(`\n[${index}/${total}] Traitement de : ${filename}`);
        
        const process = spawn('node', ['generateur-automatique.js', jsonPath], {
            stdio: 'pipe'
        });
        
        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Succès : ${filename}`);
                resolve(true);
            } else {
                console.log(`❌ Erreur : ${filename}`);
                reject(new Error(output));
            }
        });
    });
}

async function moveFilesToV3() {
    // Déplacer les fichiers générés vers les dossiers v3
    const moves = [
        { from: 'grilles_generees/html/', to: 'grilles_generees/html/v3/' },
        { from: 'grilles_generees/pdf/', to: 'grilles_generees/pdf/v3/' },
        { from: 'feuille-porte/html/', to: 'feuille-porte/html/v3/' },
        { from: 'feuille-porte/pdf/', to: 'feuille-porte/pdf/v3/' }
    ];
    
    for (const move of moves) {
        const files = fs.readdirSync(move.from).filter(f => f.includes('_v3'));
        for (const file of files) {
            const source = path.join(move.from, file);
            const dest = path.join(move.to, file);
            if (fs.existsSync(source)) {
                fs.renameSync(source, dest);
            }
        }
    }
}

async function main() {
    const jsonFiles = fs.readdirSync('json_files/v3')
        .filter(f => f.endsWith('.json'))
        .map(f => path.join('json_files/v3', f));
    
    console.log(`🚀 Génération de ${jsonFiles.length} fichiers JSON du dossier json_files/v3/`);
    console.log('==================================================');
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < jsonFiles.length; i++) {
        try {
            await processFile(jsonFiles[i], i + 1, jsonFiles.length);
            success++;
        } catch (error) {
            errors++;
        }
    }
    
    console.log('\n==================================================');
    console.log('📊 Résumé de la génération :');
    console.log(`✅ Succès : ${success}/${jsonFiles.length}`);
    console.log(`❌ Erreurs : ${errors}/${jsonFiles.length}`);
    
    console.log('\n🔄 Déplacement des fichiers vers les dossiers v3...');
    await moveFilesToV3();
    
    console.log('\n✨ Génération terminée !');
}

main().catch(console.error);