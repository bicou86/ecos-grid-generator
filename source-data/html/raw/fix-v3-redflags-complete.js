const fs = require('fs');
const path = require('path');

// Fonction pour convertir redflagsSection au format correct dans les critères
function fixRedflagsInCriterion(criterion) {
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
    
    // Format 2: Array mais avec des strings au lieu d'objets
    else if (Array.isArray(criterion.redflagsSection)) {
        let needsFix = false;
        criterion.redflagsSection = criterion.redflagsSection.map(item => {
            if (typeof item === 'string') {
                needsFix = true;
                return { text: item };
            }
            return item;
        });
        if (needsFix) modified = true;
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
        let rootRedflagsRemoved = false;
        let criteriaRedflagsFixed = 0;
        
        // 1. Supprimer redflagsSection au niveau racine
        if (data.redflagsSection) {
            console.log(`  🗑️  Removing root-level redflagsSection`);
            delete data.redflagsSection;
            rootRedflagsRemoved = true;
            modified = true;
        }
        
        // 2. Corriger redflagsSection dans les critères
        if (data.sections) {
            Object.keys(data.sections).forEach(sectionKey => {
                const section = data.sections[sectionKey];
                
                if (section.criteria && Array.isArray(section.criteria)) {
                    section.criteria.forEach(criterion => {
                        if (criterion.redflagsSection) {
                            if (fixRedflagsInCriterion(criterion)) {
                                criteriaRedflagsFixed++;
                                modified = true;
                                console.log(`  ✅ Fixed redflagsSection format in criterion ${criterion.id}`);
                            }
                        }
                    });
                }
            });
        }
        
        if (rootRedflagsRemoved || criteriaRedflagsFixed > 0) {
            console.log(`  📊 Changes: root removed=${rootRedflagsRemoved}, criteria fixed=${criteriaRedflagsFixed}`);
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

console.log(`\n🔍 Fixing redflagsSection in ${files.length} v3 files...\n`);

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
    fs.writeFileSync('modified-redflags-complete-v3.json', JSON.stringify(modifiedFiles, null, 2));
    console.log(`\n💾 List saved to modified-redflags-complete-v3.json`);
}