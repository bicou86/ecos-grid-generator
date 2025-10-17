const { exec } = require('child_process');
const path = require('path');

// Les 13 fichiers v3 modifiés
const files = [
  'Douleur au genou_v3.json',
  'Douleur au poignet_v3.json',
  'Douleur au talon_v3.json',
  'Douleur aux jambes_v3.json',
  'Énurésie - Pédiatrie_v3.json',
  'Épilepsie_v3.json',
  'Éruption cutanée II_v3.json',
  'Érythème_v3.json',
  'Fatigue I_v3.json',
  'Fatigue II_v3.json',
  'Fatigue III - Psy_v3.json',
  'Flush_v3.json',
  'Gonflement abdominal_v3.json',
  'Gonflement du visage_v3.json'
];

console.log('🔄 Régénération des grilles HTML et PDF pour les 13 fichiers v3 modifiés...\n');
console.log('📋 Modifications effectuées :');
console.log('   - Conversion "investigations" → "details"');
console.log('   - Conversion objets {name, indication} → "name -> indication"');
console.log('   - Suppression enveloppe ddSection pour les critères avec details');
console.log('   - Nettoyage fichiers JSON\n');

let completed = 0;
let errors = 0;

files.forEach((file, index) => {
  const baseName = file.replace('.json', '');
  const jsonPath = path.join(__dirname, 'json_files', 'v3', file);
  
  setTimeout(() => {
    console.log(`\n[${index + 1}/${files.length}] Régénération de ${baseName}...`);
    
    exec(`node generateur-automatique.js "${jsonPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur pour ${baseName}:`, error.message);
        errors++;
      } else {
        console.log(`✅ ${baseName} régénéré avec succès`);
        completed++;
        if (stdout && stdout.trim()) {
          console.log(`   ${stdout.trim()}`);
        }
      }
      
      // Afficher le résumé final
      if (completed + errors === files.length) {
        console.log('\n' + '='.repeat(60));
        console.log(`📊 RÉSUMÉ FINAL :`);
        console.log(`   ✅ Réussis : ${completed}/${files.length}`);
        if (errors > 0) {
          console.log(`   ❌ Erreurs : ${errors}/${files.length}`);
        }
        console.log('='.repeat(60));
      }
    });
  }, index * 2000); // Délai de 2 secondes entre chaque génération
});