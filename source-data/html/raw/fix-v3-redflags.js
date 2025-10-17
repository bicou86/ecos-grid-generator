const fs = require('fs');
const path = require('path');

// Fonction pour convertir redflagsSection au format correct
function fixRedflagsSection(criterion) {
    if (!criterion.redflagsSection) return false;
    
    let modified = false;
    
    // Format 1: Object avec title et items
    if (typeof criterion.redflagsSection === 'object' && !Array.isArray(criterion.redflagsSection)) {
        if (criterion.redflagsSection.items && Array.isArray(criterion.redflagsSection.items)) {
            // Convertir en array d'objets avec propriété text
            criterion.redflagsSection = criterion.redflagsSection.items.map(item => ({
                text: typeof item === 'string' ? item : item.text || ''
            }));
            modified = true;
        }
    }
    
    // Format 2: Array d'objets avec category et signs
    else if (Array.isArray(criterion.redflagsSection)) {
        let needsConversion = false;
        
        // Vérifier si c'est le format avec category/signs
        for (let item of criterion.redflagsSection) {
            if (item.category && item.signs) {
                needsConversion = true;
                break;
            }
        }
        
        if (needsConversion) {
            // Aplatir toutes les catégories en une seule liste
            let allSigns = [];
            criterion.redflagsSection.forEach(category => {
                if (category.signs && Array.isArray(category.signs)) {
                    // Ajouter la catégorie comme premier élément
                    allSigns.push({ text: `${category.category} :` });
                    // Ajouter tous les signes
                    category.signs.forEach(sign => {
                        allSigns.push({ text: `• ${sign}` });
                    });
                }
            });
            criterion.redflagsSection = allSigns;
            modified = true;
        }
        
        // Vérifier que tous les éléments ont bien une propriété text
        else {
            let needsFix = false;
            criterion.redflagsSection = criterion.redflagsSection.map(item => {
                if (typeof item === 'string') {
                    needsFix = true;
                    return { text: item };
                } else if (!item.text && item.sign) {
                    needsFix = true;
                    return { text: item.sign };
                }
                return item;
            });
            if (needsFix) modified = true;
        }
    }
    
    return modified;
}

// Fonction pour traiter un fichier JSON
function processFile(filePath) {
    const filename = path.basename(filePath);
    console.log(`\nProcessing: ${filename}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        let modified = false;
        let redflagsFound = 0;
        let redflagsFixed = 0;
        
        // Parcourir toutes les sections
        if (data.sections) {
            Object.keys(data.sections).forEach(sectionKey => {
                const section = data.sections[sectionKey];
                
                if (section.criteria && Array.isArray(section.criteria)) {
                    section.criteria.forEach(criterion => {
                        if (criterion.redflagsSection) {
                            redflagsFound++;
                            if (fixRedflagsSection(criterion)) {
                                redflagsFixed++;
                                modified = true;
                                console.log(`  ✅ Fixed redflagsSection in criterion ${criterion.id}`);
                            }
                        }
                    });
                }
            });
        }
        
        // Vérifier aussi redflagsSection au niveau racine (certains fichiers l'ont là)
        if (data.redflagsSection) {
            redflagsFound++;
            // Pour le niveau racine, on garde le format avec category/signs
            // mais on s'assure que c'est un array
            if (typeof data.redflagsSection === 'object' && !Array.isArray(data.redflagsSection)) {
                if (data.redflagsSection.items) {
                    data.redflagsSection = data.redflagsSection.items.map(item => ({
                        category: "Signes d'alarme",
                        signs: [item]
                    }));
                    modified = true;
                    redflagsFixed++;
                    console.log(`  ✅ Fixed root-level redflagsSection`);
                }
            }
        }
        
        if (redflagsFound > 0) {
            console.log(`  📊 Found ${redflagsFound} redflagsSection(s), fixed ${redflagsFixed}`);
        }
        
        if (modified) {
            // Sauvegarder le fichier modifié
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`  💾 File saved successfully`);
            return true;
        } else {
            console.log(`  ℹ️  No changes needed`);
            return false;
        }
        
    } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        return false;
    }
}

// Traiter tous les fichiers v3
const v3Dir = 'json_files/v3';
const files = fs.readdirSync(v3Dir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(v3Dir, file));

console.log(`\n🔍 Searching for redflagsSection issues in ${files.length} v3 files...\n`);

let modifiedCount = 0;
const modifiedFiles = [];

files.forEach(file => {
    if (processFile(file)) {
        modifiedCount++;
        modifiedFiles.push(path.basename(file));
    }
});

console.log(`\n\n📊 Summary:`);
console.log(`✅ Modified ${modifiedCount} out of ${files.length} files`);

if (modifiedFiles.length > 0) {
    console.log(`\n📝 Modified files:`);
    modifiedFiles.forEach(file => console.log(`  - ${file}`));
    
    // Sauvegarder la liste pour la régénération
    fs.writeFileSync('modified-redflags-v3.json', JSON.stringify(modifiedFiles, null, 2));
    console.log(`\n💾 List saved to modified-redflags-v3.json`);
}