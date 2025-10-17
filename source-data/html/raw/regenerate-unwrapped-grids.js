const { exec } = require('child_process');
const path = require('path');

const files = [
  "Douleur au genou_v3.json",
  "Douleur au poignet_v3.json",
  "Douleur au talon_v3.json",
  "Douleur aux jambes_v3.json",
  "Énurésie - Pédiatrie_v3.json",
  "Épilepsie_v3.json",
  "Érythème_v3.json",
  "Fatigue I_v3.json",
  "Fatigue II_v3.json",
  "Fatigue III - Psy_v3.json",
  "Flush_v3.json",
  "Gonflement abdominal_v3.json",
  "Gonflement du visage_v3.json"
];

console.log('Régénération des grilles HTML et PDF pour les fichiers modifiés...');

files.forEach((file, index) => {
  const baseName = file.replace('.json', '');
  const jsonPath = path.join(__dirname, 'json_files', 'v3', file);
  
  setTimeout(() => {
    console.log(`\nRégénération de ${baseName}...`);
    exec(`node generateur-automatique.js "${jsonPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur pour ${baseName}:`, error.message);
      } else {
        console.log(`✅ ${baseName} régénéré avec succès`);
      }
    });
  }, index * 2000); // Délai de 2 secondes entre chaque génération
});
