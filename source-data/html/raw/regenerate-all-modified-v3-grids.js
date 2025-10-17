const { exec } = require('child_process');
const path = require('path');

// Tous les fichiers v3 modifiés (13 au total)
const files = [
  // Fichiers avec format investigations converti
  'Douleur au genou_v3.json',
  'Douleur au poignet_v3.json', 
  'Douleur au talon_v3.json',
  'Douleur aux jambes_v3.json',
  'Essoufflement II_v3.json',
  'Fatigue I_v3.json',
  'Fatigue II_v3.json',
  'Fatigue III - Psy_v3.json',
  'Hématurie_v3.json',
  'Lombalgie I_v3.json',
  'Palpitations_v3.json',
  'Toux IV_v3.json',
  // Fichiers avec format name/indication converti
  'Énurésie - Pédiatrie_v3.json',
  'Épilepsie_v3.json',
  'Érythème_v3.json',
  'Flush_v3.json',
  'Gonflement abdominal_v3.json',
  'Gonflement du visage_v3.json',
  // Fichier avec erreur JSON corrigée
  'Éruption cutanée II_v3.json'
];

// Enlever les doublons
const uniqueFiles = [...new Set(files)];

console.log(`Régénération des grilles HTML et PDF pour ${uniqueFiles.length} fichiers v3 modifiés...\n`);

uniqueFiles.forEach((file, index) => {
  const baseName = file.replace('.json', '');
  const jsonPath = path.join(__dirname, 'json_files', 'v3', file);
  
  setTimeout(() => {
    console.log(`\nRégénération ${index + 1}/${uniqueFiles.length}: ${baseName}...`);
    exec(`node generateur-automatique.js "${jsonPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur pour ${baseName}:`, error.message);
      } else {
        console.log(`✅ ${baseName} régénéré avec succès`);
        if (stdout) console.log(stdout);
      }
    });
  }, index * 2000); // Délai de 2 secondes entre chaque génération
});

console.log('\n📝 Résumé des modifications effectuées:');
console.log('- Conversion "investigations" → "details" dans ddSection');
console.log('- Conversion objets {name, indication} → chaînes "name -> indication"');
console.log('- Correction erreur JSON dans Éruption cutanée II_v3.json');
console.log('\nTotal: 13 fichiers v3 modifiés et à régénérer');