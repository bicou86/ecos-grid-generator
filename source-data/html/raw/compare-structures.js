const fs = require('fs');
const path = require('path');

function compareStructures() {
    const manualPath = path.join(__dirname, 'grilles_generees/html/v3/AVP_v3 - Grille ECOS-test.html');
    const autoPath = path.join(__dirname, 'grilles_generees/html/v3/AVP_v3 - Grille ECOS.html');
    
    const manualContent = fs.readFileSync(manualPath, 'utf8');
    const autoContent = fs.readFileSync(autoPath, 'utf8');
    
    console.log('🔍 Comparaison structurelle des fichiers HTML:\n');
    
    // Analyser les sections d'anamnèse pour le critère a3 (RED FLAGS)
    console.log('📋 Analyse du critère a3 (RED FLAGS):');
    
    // Extraire la partie concernant a3
    const extractA3Section = (content) => {
        const startIndex = content.indexOf('3. RED FLAGS');
        if (startIndex === -1) return null;
        const endIndex = content.indexOf('criteria-row">', startIndex + 500);
        return content.substring(startIndex, endIndex);
    };
    
    const manualA3 = extractA3Section(manualContent);
    const autoA3 = extractA3Section(autoContent);
    
    if (manualA3 && autoA3) {
        console.log('\nStructure dans Manuel:');
        console.log(manualA3.substring(0, 300) + '...\n');
        console.log('Structure dans Auto:');
        console.log(autoA3.substring(0, 300) + '...');
    }
    
    // Vérifier la présence du bouton commentaire
    console.log('\n💬 Boutons de commentaire:');
    const manualCommentButtons = (manualContent.match(/comment-button/g) || []).length;
    const autoCommentButtons = (autoContent.match(/comment-button/g) || []).length;
    console.log(`Manuel: ${manualCommentButtons} boutons`);
    console.log(`Auto: ${autoCommentButtons} boutons`);
    
    // Vérifier les sections de commentaires
    console.log('\n📝 Sections de commentaires:');
    const manualCommentSections = (manualContent.match(/criterion-comment-section/g) || []).length;
    const autoCommentSections = (autoContent.match(/criterion-comment-section/g) || []).length;
    console.log(`Manuel: ${manualCommentSections} sections`);
    console.log(`Auto: ${autoCommentSections} sections`);
    
    // Vérifier la structure du minuteur
    console.log('\n⏱️ Éléments du minuteur:');
    const timerElements = ['timer-controls', 'timer-display', 'startTimer', 'stopTimer', 'resetTimer'];
    timerElements.forEach(element => {
        const inManual = manualContent.includes(element);
        const inAuto = autoContent.includes(element);
        console.log(`${element}: Manuel (${inManual ? '✓' : '✗'}), Auto (${inAuto ? '✓' : '✗'})`);
    });
    
    // Vérifier les modes
    console.log('\n🎯 Modes révision/examen:');
    const modeElements = ['revision-mode', 'exam-mode', 'toggleMode'];
    modeElements.forEach(element => {
        const inManual = manualContent.includes(element);
        const inAuto = autoContent.includes(element);
        console.log(`${element}: Manuel (${inManual ? '✓' : '✗'}), Auto (${inAuto ? '✓' : '✗'})`);
    });
    
    // Analyser le JavaScript
    console.log('\n📜 Analyse du JavaScript:');
    const extractScriptContent = (content) => {
        const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        return scriptMatch ? scriptMatch[1] : '';
    };
    
    const manualScript = extractScriptContent(manualContent);
    const autoScript = extractScriptContent(autoContent);
    
    console.log(`Manuel script: ${manualScript.length} caractères`);
    console.log(`Auto script: ${autoScript.length} caractères`);
    
    // Vérifier les fonctions JavaScript principales
    const jsFunctions = ['updateScore', 'calculateTotal', 'toggleComment', 'startTimer', 'stopTimer'];
    console.log('\n🔧 Fonctions JavaScript:');
    jsFunctions.forEach(func => {
        const inManual = manualScript.includes(func);
        const inAuto = autoScript.includes(func);
        console.log(`${func}: Manuel (${inManual ? '✓' : '✗'}), Auto (${inAuto ? '✓' : '✗'})`);
    });
}

compareStructures();