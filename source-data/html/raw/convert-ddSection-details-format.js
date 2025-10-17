const fs = require('fs');
const path = require('path');

// Liste des 13 fichiers à modifier
const filesToModify = [
  'Douleur articulaire_v3.json',
  'Douleur du flanc_v3.json',
  'Éruption cutanée II_v3.json',
  'Essoufflement II_v3.json',
  'Fatigue I_v3.json',
  'Hématurie_v3.json',
  'Lombalgie I_v3.json',
  'Palpitations_v3.json',
  'Perte connaissance_v3.json',
  'Prurit_v3.json',
  'Suspicion dépression_v3.json',
  'Toux aiguë_v3.json',
  'Toux IV_v3.json'
];

let modifiedCount = 0;

// Fonction pour convertir les objets ddSection.details en format string
function convertDdSectionDetails(obj) {
  let modified = false;
  
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'ddSection' && obj[key] && obj[key].details && Array.isArray(obj[key].details)) {
        // Vérifier si c'est le format à convertir (objets avec name/indication)
        const hasObjectFormat = obj[key].details.some(item => 
          typeof item === 'object' && 'name' in item && 'indication' in item
        );
        
        if (hasObjectFormat) {
          // Convertir en format string "name -> indication"
          obj[key].details = obj[key].details.map(item => {
            if (typeof item === 'object' && item.name && item.indication) {
              return `${item.name} -> ${item.indication}`;
            }
            return item;
          });
          modified = true;
          console.log(`  ✓ Converti ddSection.details en format string`);
        }
      } else if (typeof obj[key] === 'object') {
        // Récursion pour les objets imbriqués
        const childModified = convertDdSectionDetails(obj[key]);
        modified = modified || childModified;
      }
    }
  }
  
  return modified;
}

// Traiter chaque fichier
filesToModify.forEach(fileName => {
  const filePath = path.join(__dirname, 'json_files', 'v3', fileName);
  
  try {
    // Lire le fichier
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log(`\nTraitement de ${fileName}...`);
    
    // Convertir les ddSection.details
    const modified = convertDdSectionDetails(data);
    
    if (modified) {
      // Sauvegarder le fichier modifié
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ ${fileName} modifié et sauvegardé`);
      modifiedCount++;
    } else {
      console.log(`ℹ️  ${fileName} - Aucune modification nécessaire`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur avec ${fileName}:`, error.message);
  }
});

console.log(`\n✅ Conversion terminée : ${modifiedCount} fichiers modifiés`);

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

  fs.writeFileSync('regenerate-ddSection-grids.js', regenerateScript);
  console.log('\n✅ Script de régénération créé : regenerate-ddSection-grids.js');
}