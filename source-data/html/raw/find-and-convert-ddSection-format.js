const fs = require('fs');
const path = require('path');

const v3Dir = path.join(__dirname, 'json_files', 'v3');
const files = fs.readdirSync(v3Dir).filter(f => f.endsWith('.json'));

let filesToModify = [];
let modifiedCount = 0;

console.log('Recherche des fichiers avec ddSection.details au format objet...\n');

// Fonction pour vérifier et convertir les objets ddSection.details
function checkAndConvertDdSectionDetails(obj, filePath) {
  let modified = false;
  
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'ddSection' && obj[key] && obj[key].details && Array.isArray(obj[key].details)) {
        // Vérifier si c'est le format à convertir (objets avec name/indication)
        const hasObjectFormat = obj[key].details.some(item => 
          typeof item === 'object' && 'name' in item && 'indication' in item
        );
        
        if (hasObjectFormat) {
          console.log(`  ✓ Trouvé dans ${path.basename(filePath)}`);
          filesToModify.push(path.basename(filePath));
          
          // Convertir en format string "name -> indication"
          obj[key].details = obj[key].details.map(item => {
            if (typeof item === 'object' && item.name && item.indication) {
              return `${item.name} -> ${item.indication}`;
            }
            return item;
          });
          modified = true;
        }
      } else if (typeof obj[key] === 'object') {
        // Récursion pour les objets imbriqués
        const childModified = checkAndConvertDdSectionDetails(obj[key], filePath);
        modified = modified || childModified;
      }
    }
  }
  
  return modified;
}

// Analyser chaque fichier
files.forEach(fileName => {
  const filePath = path.join(v3Dir, fileName);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    const modified = checkAndConvertDdSectionDetails(data, filePath);
    
    if (modified) {
      // Sauvegarder le fichier modifié
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      modifiedCount++;
    }
    
  } catch (error) {
    console.error(`❌ Erreur avec ${fileName}:`, error.message);
  }
});

console.log(`\n✅ Analyse terminée : ${modifiedCount} fichiers modifiés`);
console.log(`\nFichiers modifiés :`);
filesToModify.forEach(f => console.log(`  - ${f}`));

// Créer un script pour régénérer les grilles
if (modifiedCount > 0) {
  const regenerateScript = `const { exec } = require('child_process');
const path = require('path');

const files = ${JSON.stringify(filesToModify, null, 2)};

console.log('Régénération des grilles HTML et PDF pour les fichiers modifiés...');

files.forEach((file, index) => {
  const baseName = file.replace('.json', '');
  const jsonPath = path.join(__dirname, 'json_files', 'v3', file);
  
  setTimeout(() => {
    console.log(\`\\nRégénération de \${baseName}...\`);
    exec(\`node generateur-automatique.js "\${jsonPath}"\`, (error, stdout, stderr) => {
      if (error) {
        console.error(\`❌ Erreur pour \${baseName}:\`, error.message);
      } else {
        console.log(\`✅ \${baseName} régénéré avec succès\`);
      }
    });
  }, index * 2000); // Délai de 2 secondes entre chaque génération
});
`;

  fs.writeFileSync('regenerate-ddSection-format-grids.js', regenerateScript);
  console.log('\n✅ Script de régénération créé : regenerate-ddSection-format-grids.js');
}