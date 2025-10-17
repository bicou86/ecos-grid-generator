const { exec } = require('child_process');
const path = require('path');

const files = [
  "Douleur articulaire_v3.json",
  "Douleur du flanc_v3.json",
  "Éruption cutanée II_v3.json",
  "Essoufflement II_v3.json",
  "Fatigue I_v3.json",
  "Hématurie_v3.json",
  "Lombalgie I_v3.json",
  "Palpitations_v3.json",
  "Perte connaissance_v3.json",
  "Prurit_v3.json",
  "Suspicion dépression_v3.json",
  "Toux aiguë_v3.json",
  "Toux IV_v3.json"
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
