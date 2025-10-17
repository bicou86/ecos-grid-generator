const fs = require('fs');
const path = require('path');

function compareGrids() {
    const manualPath = path.join(__dirname, 'grilles_generees/html/v3/AVP_v3 - Grille ECOS-test.html');
    const autoPath = path.join(__dirname, 'grilles_generees/html/v3/AVP_v3 - Grille ECOS.html');
    
    const manualContent = fs.readFileSync(manualPath, 'utf8');
    const autoContent = fs.readFileSync(autoPath, 'utf8');
    
    // Comparer les tailles
    console.log(`\n📊 Comparaison des fichiers:`);
    console.log(`Manuel (générateur v2): ${manualContent.length} caractères`);
    console.log(`Auto (script automatique): ${autoContent.length} caractères`);
    console.log(`Différence: ${Math.abs(manualContent.length - autoContent.length)} caractères`);
    
    // Analyser les lignes
    const manualLines = manualContent.split('\n');
    const autoLines = autoContent.split('\n');
    
    console.log(`\nNombre de lignes:`);
    console.log(`Manuel: ${manualLines.length} lignes`);
    console.log(`Auto: ${autoLines.length} lignes`);
    
    // Chercher les principales différences structurelles
    console.log(`\n🔍 Analyse des différences principales:`);
    
    // Vérifier la présence de sections clés
    const sections = ['anamnese', 'examen', 'management', 'communication'];
    sections.forEach(section => {
        const manualCount = (manualContent.match(new RegExp(section, 'gi')) || []).length;
        const autoCount = (autoContent.match(new RegExp(section, 'gi')) || []).length;
        if (manualCount !== autoCount) {
            console.log(`- Section "${section}": Manuel (${manualCount}), Auto (${autoCount})`);
        }
    });
    
    // Compter les critères
    const manualCriteria = (manualContent.match(/id="[aem]\d+"/g) || []).length;
    const autoCriteria = (autoContent.match(/id="[aem]\d+"/g) || []).length;
    console.log(`\n📋 Nombre de critères:`);
    console.log(`Manuel: ${manualCriteria} critères`);
    console.log(`Auto: ${autoCriteria} critères`);
    
    // Vérifier les sections spéciales
    const specialSections = ['redflagsSection', 'ddSection', 'therapySection', 'scoringRule'];
    console.log(`\n🏷️ Sections spéciales:`);
    specialSections.forEach(section => {
        const manualHas = manualContent.includes(section);
        const autoHas = autoContent.includes(section);
        if (manualHas || autoHas) {
            console.log(`- ${section}: Manuel (${manualHas ? '✓' : '✗'}), Auto (${autoHas ? '✓' : '✗'})`);
        }
    });
    
    // Chercher les premières différences significatives
    console.log(`\n🔄 Premières différences détectées:`);
    let diffCount = 0;
    for (let i = 0; i < Math.min(manualLines.length, autoLines.length); i++) {
        if (manualLines[i] !== autoLines[i]) {
            // Ignorer les différences mineures (espaces, etc.)
            const manualTrimmed = manualLines[i].trim();
            const autoTrimmed = autoLines[i].trim();
            
            if (manualTrimmed !== autoTrimmed && manualTrimmed.length > 10 && autoTrimmed.length > 10) {
                console.log(`\nLigne ${i + 1}:`);
                console.log(`Manuel: ${manualLines[i].substring(0, 100)}${manualLines[i].length > 100 ? '...' : ''}`);
                console.log(`Auto:   ${autoLines[i].substring(0, 100)}${autoLines[i].length > 100 ? '...' : ''}`);
                
                diffCount++;
                if (diffCount >= 5) break;
            }
        }
    }
    
    // Vérifier la structure des details
    const manualDetails = (manualContent.match(/<div class="details"/g) || []).length;
    const autoDetails = (autoContent.match(/<div class="details"/g) || []).length;
    console.log(`\n📝 Éléments details:`);
    console.log(`Manuel: ${manualDetails} éléments`);
    console.log(`Auto: ${autoDetails} éléments`);
    
    // Vérifier les styles CSS
    console.log(`\n🎨 Analyse des styles CSS:`);
    const manualHasGradient = manualContent.includes('linear-gradient');
    const autoHasGradient = autoContent.includes('linear-gradient');
    console.log(`Gradient CSS: Manuel (${manualHasGradient ? '✓' : '✗'}), Auto (${autoHasGradient ? '✓' : '✗'})`);
    
    // Sauvegarder un rapport détaillé
    const report = {
        timestamp: new Date().toISOString(),
        filesCompared: {
            manual: 'AVP_v3 - Grille ECOS-test.html',
            auto: 'AVP_v3 - Grille ECOS.html'
        },
        statistics: {
            characterCount: {
                manual: manualContent.length,
                auto: autoContent.length,
                difference: Math.abs(manualContent.length - autoContent.length)
            },
            lineCount: {
                manual: manualLines.length,
                auto: autoLines.length,
                difference: Math.abs(manualLines.length - autoLines.length)
            },
            criteriaCount: {
                manual: manualCriteria,
                auto: autoCriteria
            }
        }
    };
    
    fs.writeFileSync(
        path.join(__dirname, 'grilles_generees/html/v3/comparison-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log(`\n✅ Rapport de comparaison sauvegardé dans comparison-report.json`);
}

compareGrids();