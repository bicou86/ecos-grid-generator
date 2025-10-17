const fs = require('fs');
const path = require('path');

// Liste des fichiers à modifier
const filesToModify = [
  'Douleur au genou_v3.json',
  'Douleur au poignet_v3.json',
  'Douleur au talon_v3.json',
  'Douleur aux jambes_v3.json',
  'Énurésie - Pédiatrie_v3.json',
  'Épilepsie_v3.json',
  'Érythème_v3.json',
  'Fatigue I_v3.json',
  'Fatigue II_v3.json',
  'Fatigue III - Psy_v3.json',
  'Flush_v3.json',
  'Gonflement abdominal_v3.json',
  'Gonflement du visage_v3.json'
];

let modifiedCount = 0;

console.log('Suppression de l\'enveloppe ddSection pour les critères avec details...\n');

// Fonction pour supprimer l'enveloppe ddSection
function removeDdSectionWrapper(obj) {
  let modified = false;
  
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      const childModified = removeDdSectionWrapper(item);
      modified = modified || childModified;
    });
  } else if (obj && typeof obj === 'object') {
    // Si on trouve un objet avec ddSection qui contient seulement details
    if (obj.ddSection && obj.ddSection.details && Object.keys(obj.ddSection).length === 1) {
      // Déplacer details au niveau supérieur
      obj.details = obj.ddSection.details;
      delete obj.ddSection;
      modified = true;
      console.log(`  ✓ Suppression ddSection wrapper pour critère: ${obj.text || 'sans nom'}`);
    }
    
    // Récursion pour les objets imbriqués
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        const childModified = removeDdSectionWrapper(obj[key]);
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
    
    // Supprimer les wrappers ddSection
    const modified = removeDdSectionWrapper(data);
    
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

  fs.writeFileSync('regenerate-unwrapped-grids.js', regenerateScript);
  console.log('\n✅ Script de régénération créé : regenerate-unwrapped-grids.js');
}