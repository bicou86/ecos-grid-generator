const fs = require('fs');
const path = require('path');

// Liste des fichiers à traiter
const filesToProcess = [
    'json_files/v3/Fatigue I_v3.json',
    'json_files/v3/Fatigue II_v3.json',
    'json_files/v3/Fatigue III - Psy_v3.json',
    'json_files/v3/Douleur aux jambes_v3.json',
    'json_files/v3/Douleur au talon_v3.json',
    'json_files/v3/Douleur au poignet_v3.json',
    'json_files/v3/Douleur au genou_v3.json',
    'json_files/v3/Érythème_v3.json',
    'json_files/v3/Gonflement du visage_v3.json',
    'json_files/v3/Gonflement abdominal_v3.json',
    'json_files/v3/Flush_v3.json',
    'json_files/v3/Épilepsie_v3.json',
    'json_files/v3/Énurésie - Pédiatrie_v3.json'
];

let totalModified = 0;
const modifiedFiles = [];

console.log('🔧 Conversion des sections "investigations" en "details"...\n');

// Fonction pour parcourir récursivement un objet et remplacer investigations par details
function replaceInvestigations(obj, path = '') {
    let modified = false;
    
    if (typeof obj !== 'object' || obj === null) {
        return { obj, modified };
    }
    
    // Si c'est un tableau, parcourir chaque élément
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const result = replaceInvestigations(obj[i], path + `[${i}]`);
            if (result.modified) {
                obj[i] = result.obj;
                modified = true;
            }
        }
        return { obj, modified };
    }
    
    // Si c'est un objet
    const newObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // Si on trouve une ddSection avec investigations
            if (key === 'ddSection' && obj[key] && obj[key].investigations) {
                console.log(`  📍 Trouvé ddSection.investigations dans ${path}`);
                
                // Créer la nouvelle structure
                newObj[key] = {
                    ...obj[key],
                    details: obj[key].investigations
                };
                
                // Supprimer investigations
                delete newObj[key].investigations;
                
                modified = true;
                console.log(`  ✅ Converti investigations → details`);
            }
            // Si c'est un critère avec ddSection.investigations
            else if (key === 'investigations' && path.includes('ddSection')) {
                // Ne pas copier investigations, il sera remplacé par details au niveau parent
                continue;
            }
            else {
                const result = replaceInvestigations(obj[key], path + '.' + key);
                if (result.modified) {
                    modified = true;
                }
                newObj[key] = result.obj;
            }
        }
    }
    
    return { obj: newObj, modified };
}

// Traiter chaque fichier
for (const filePath of filesToProcess) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ Fichier non trouvé : ${filePath}`);
        continue;
    }
    
    console.log(`📄 Traitement de : ${path.basename(filePath)}`);
    
    try {
        // Lire le fichier
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);
        
        // Remplacer les investigations
        const result = replaceInvestigations(data);
        
        if (result.modified) {
            // Écrire le fichier modifié
            fs.writeFileSync(fullPath, JSON.stringify(result.obj, null, 2));
            console.log(`  ✅ Fichier modifié et sauvegardé\n`);
            totalModified++;
            modifiedFiles.push(filePath);
        } else {
            console.log(`  ℹ️  Aucune modification nécessaire\n`);
        }
        
    } catch (error) {
        console.log(`  ❌ Erreur : ${error.message}\n`);
    }
}

console.log(`\n📊 Résumé :`);
console.log(`   - ${totalModified} fichiers modifiés`);
console.log(`   - ${filesToProcess.length - totalModified} fichiers non modifiés`);

if (modifiedFiles.length > 0) {
    console.log(`\n📝 Fichiers modifiés :`);
    modifiedFiles.forEach(file => console.log(`   - ${file}`));
    
    // Créer le script de régénération
    const regenerateScript = `
const { exec } = require('child_process');
const path = require('path');

const jsonFiles = ${JSON.stringify(modifiedFiles, null, 2)};

let processed = 0;

console.log('🔄 Régénération des grilles HTML et PDF...\\n');

function regenerateNext() {
    if (processed >= jsonFiles.length) {
        console.log('\\n✅ Toutes les grilles ont été régénérées');
        return;
    }
    
    const jsonFile = jsonFiles[processed];
    console.log(\`📄 Régénération de : \${path.basename(jsonFile)}\`);
    
    exec(\`node generateur-automatique.js "\${jsonFile}"\`, (error, stdout, stderr) => {
        if (error) {
            console.error(\`   ❌ Erreur : \${error.message}\`);
        } else {
            console.log(\`   ✅ Succès\`);
            if (stdout) console.log(stdout.trim());
        }
        
        processed++;
        setTimeout(regenerateNext, 1000);
    });
}

regenerateNext();
`;

    fs.writeFileSync('regenerate-investigations-grids.js', regenerateScript);
    console.log('\n✅ Script de régénération créé : regenerate-investigations-grids.js');
    console.log('   Exécutez : node regenerate-investigations-grids.js');
}