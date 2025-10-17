const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour générer les fichiers HTML et PDF pour un cas
async function generateCaseFiles(caseName) {
    console.log(`\n📋 Génération des fichiers pour: ${caseName}`);
    
    try {
        // 1. Vérifier que les fichiers JSON existent
        const mainJsonPath = path.join(__dirname, 'json_files', `${caseName}.json`);
        const doorJsonPath = path.join(__dirname, 'json_files', 'json_feuille-porte', `${caseName}.json`);
        
        if (!fs.existsSync(mainJsonPath)) {
            console.error(`❌ Fichier JSON principal introuvable: ${mainJsonPath}`);
            return false;
        }
        
        if (!fs.existsSync(doorJsonPath)) {
            console.error(`❌ Fichier JSON feuille-porte introuvable: ${doorJsonPath}`);
            return false;
        }
        
        console.log('✅ Fichiers JSON trouvés');
        
        // 2. Lire les données JSON
        const mainData = JSON.parse(fs.readFileSync(mainJsonPath, 'utf8'));
        const doorData = JSON.parse(fs.readFileSync(doorJsonPath, 'utf8'));
        
        // 3. Générer la grille ECOS HTML
        console.log('📝 Génération de la grille ECOS HTML...');
        const generatorPath = path.join(__dirname, 'Chablon', 'Generateur_de_Grilles_ECOS.html');
        const generatorHtml = fs.readFileSync(generatorPath, 'utf8');
        
        // Exécuter le générateur dans un contexte Node avec JSDOM
        const jsdom = require('jsdom');
        const { JSDOM } = jsdom;
        const dom = new JSDOM(generatorHtml, { runScripts: 'dangerously', resources: 'usable' });
        const window = dom.window;
        const document = window.document;
        
        // Injecter les données JSON
        window.caseData = mainData;
        
        // Attendre que le DOM soit chargé
        await new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
        
        // Générer le HTML
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.click();
        }
        
        // Attendre la génération
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Récupérer le HTML généré
        const outputDiv = document.getElementById('output');
        if (outputDiv && outputDiv.innerHTML) {
            const gridHtmlPath = path.join(__dirname, 'grilles_generees', 'html', `${caseName} - Grille ECOS.html`);
            fs.writeFileSync(gridHtmlPath, outputDiv.innerHTML, 'utf8');
            console.log(`✅ Grille HTML générée: ${gridHtmlPath}`);
        }
        
        // 4. Générer la feuille-porte HTML
        console.log('📝 Génération de la feuille-porte HTML...');
        const doorTemplate = fs.readFileSync(path.join(__dirname, 'Chablon', 'Model - Feuille Porte.html'), 'utf8');
        
        // Remplacer les placeholders
        let doorHtml = doorTemplate;
        doorHtml = doorHtml.replace(/\{\{titre\}\}/g, doorData.titre || '');
        doorHtml = doorHtml.replace(/\{\{contexte\}\}/g, doorData.contexte || '');
        doorHtml = doorHtml.replace(/\{\{description\}\}/g, doorData.description || '');
        
        // Gérer les signes vitaux
        if (doorData.signesVitaux) {
            let vitalsHtml = '<div class="vitals-grid">';
            Object.entries(doorData.signesVitaux).forEach(([key, value]) => {
                const label = {
                    'tensionArterielle': 'TA',
                    'frequenceCardiaque': 'FC',
                    'frequenceRespiratoire': 'FR',
                    'temperature': 'T°',
                    'saturation': 'SaO2'
                }[key] || key;
                vitalsHtml += `<div class="vital-item"><span class="vital-label">${label}:</span> ${value}</div>`;
            });
            vitalsHtml += '</div>';
            doorHtml = doorHtml.replace(/\{\{signesVitaux\}\}/g, vitalsHtml);
        } else {
            doorHtml = doorHtml.replace(/\{\{signesVitaux\}\}/g, '');
        }
        
        // Gérer les tâches
        if (doorData.taches && doorData.taches.length > 0) {
            let tasksHtml = '<ul>';
            doorData.taches.forEach(task => {
                tasksHtml += `<li>${task}</li>`;
            });
            tasksHtml += '</ul>';
            doorHtml = doorHtml.replace(/\{\{taches\}\}/g, tasksHtml);
        } else {
            doorHtml = doorHtml.replace(/\{\{taches\}\}/g, '');
        }
        
        const doorHtmlPath = path.join(__dirname, 'feuille-porte', 'html', `${caseName} - Feuille Porte.html`);
        fs.writeFileSync(doorHtmlPath, doorHtml, 'utf8');
        console.log(`✅ Feuille-porte HTML générée: ${doorHtmlPath}`);
        
        // 5. Générer les PDFs
        console.log('📄 Génération des PDFs...');
        execSync(`node generate-pdf.js "${caseName}"`, { cwd: __dirname, stdio: 'inherit' });
        
        console.log(`\n✅ Tous les fichiers pour "${caseName}" ont été générés avec succès!`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erreur lors de la génération:`, error);
        return false;
    }
}

// Récupérer le nom du cas depuis les arguments
const caseName = process.argv[2];

if (!caseName) {
    console.error('❌ Veuillez fournir le nom du cas en argument');
    console.log('Usage: node generate-case-files.js "Nom du cas"');
    process.exit(1);
}

// Générer les fichiers
generateCaseFiles(caseName).then(success => {
    process.exit(success ? 0 : 1);
});