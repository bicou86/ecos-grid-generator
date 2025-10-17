const fs = require('fs');
const path = require('path');

function extractCSS(htmlContent) {
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    return styleMatch ? styleMatch[1] : '';
}

function compareCSSRules() {
    const manualPath = path.join(__dirname, 'grilles_generees/html/v3/AVP_v3 - Grille ECOS-test.html');
    const autoPath = path.join(__dirname, 'grilles_generees/html/v3/AVP_v3 - Grille ECOS.html');
    
    const manualContent = fs.readFileSync(manualPath, 'utf8');
    const autoContent = fs.readFileSync(autoPath, 'utf8');
    
    const manualCSS = extractCSS(manualContent);
    const autoCSS = extractCSS(autoContent);
    
    console.log('📐 Comparaison des CSS:');
    console.log(`Manuel CSS: ${manualCSS.length} caractères`);
    console.log(`Auto CSS: ${autoCSS.length} caractères`);
    
    // Extraire les règles CSS
    const extractRules = (css) => {
        const rules = css.match(/[^{}]+{[^}]+}/g) || [];
        return rules.map(rule => rule.trim());
    };
    
    const manualRules = extractRules(manualCSS);
    const autoRules = extractRules(autoCSS);
    
    console.log(`\nNombre de règles CSS:`);
    console.log(`Manuel: ${manualRules.length} règles`);
    console.log(`Auto: ${autoRules.length} règles`);
    
    // Chercher les règles manquantes
    console.log('\n🔍 Règles CSS présentes uniquement dans Auto:');
    let count = 0;
    autoRules.forEach(rule => {
        if (!manualCSS.includes(rule.split('{')[0].trim())) {
            console.log(`- ${rule.substring(0, 60)}...`);
            count++;
            if (count >= 10) return;
        }
    });
    
    // Chercher les sélecteurs spécifiques
    console.log('\n🎯 Sélecteurs spécifiques:');
    const specificSelectors = ['.comment-button', '.redflags-section', '.dd-section', '.therapy-section', '.scoring-rule'];
    specificSelectors.forEach(selector => {
        const inManual = manualCSS.includes(selector);
        const inAuto = autoCSS.includes(selector);
        console.log(`${selector}: Manuel (${inManual ? '✓' : '✗'}), Auto (${inAuto ? '✓' : '✗'})`);
    });
}

compareCSSRules();