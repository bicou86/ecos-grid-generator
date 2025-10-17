const fs = require('fs');
const path = require('path');

// Fonction pour uniformiser la ddSection et supprimer les details si nécessaire
function uniformizeDiagnostics(criterion) {
    let modified = false;
    
    // Si le critère contient "Diagnostics différentiels"
    if (criterion.text && criterion.text.includes('Diagnostics différentiels')) {
        
        // 1. Si on a des details mais pas de ddSection, convertir
        if (criterion.details && Array.isArray(criterion.details) && !criterion.ddSection) {
            criterion.ddSection = {
                categories: [{
                    name: "Diagnostics différentiels à considérer",
                    items: criterion.details
                }]
            };
            delete criterion.details;
            modified = true;
        }
        
        // 2. Si on a à la fois details et ddSection, supprimer details
        else if (criterion.details && criterion.ddSection) {
            delete criterion.details;
            modified = true;
        }
        
        // 3. Si la ddSection a un title, le supprimer
        if (criterion.ddSection && criterion.ddSection.title) {
            delete criterion.ddSection.title;
            modified = true;
        }
        
        // 4. Si la ddSection a des items complexes (objets), les convertir en strings
        if (criterion.ddSection && criterion.ddSection.categories) {
            criterion.ddSection.categories.forEach(category => {
                if (category.items && Array.isArray(category.items)) {
                    let itemsModified = false;
                    category.items = category.items.map(item => {
                        if (typeof item === 'object') {
                            itemsModified = true;
                            // Extraire le texte principal
                            if (item.text) {
                                return item.test ? item.text + ' ' + item.test : item.text;
                            } else if (item.diagnosis) {
                                return item.keyFeatures ? 
                                    item.diagnosis + ' : ' + item.keyFeatures : 
                                    item.diagnosis;
                            } else if (item.treatment) {
                                return item.details ? 
                                    item.treatment + ' - ' + item.details : 
                                    item.treatment;
                            }
                            return JSON.stringify(item); // fallback
                        }
                        return item;
                    });
                    if (itemsModified) modified = true;
                }
            });
        }
    }
    
    return modified;
}

// Fonction principale
function processFile(filePath) {
    console.log(`Processing: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        let modified = false;
        
        // Parcourir toutes les sections
        Object.keys(data.sections).forEach(sectionKey => {
            const section = data.sections[sectionKey];
            
            if (section.criteria && Array.isArray(section.criteria)) {
                section.criteria.forEach(criterion => {
                    if (uniformizeDiagnostics(criterion)) {
                        console.log(`  - Uniformized diagnostics in criterion ${criterion.id}`);
                        modified = true;
                    }
                });
            }
        });
        
        if (modified) {
            // Sauvegarder le fichier modifié
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`  ✅ File updated successfully`);
            return true;
        } else {
            console.log(`  ℹ️  No changes needed`);
            return false;
        }
        
    } catch (error) {
        console.error(`  ❌ Error processing file: ${error.message}`);
        return false;
    }
}

// Traiter tous les fichiers v3
const v3Dir = 'json_files/v3';
const files = fs.readdirSync(v3Dir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(v3Dir, file));

console.log(`Found ${files.length} v3 JSON files to process\n`);

let modifiedCount = 0;
files.forEach(file => {
    if (processFile(file)) {
        modifiedCount++;
    }
});

console.log(`\n✅ Modified ${modifiedCount} out of ${files.length} files`);