
const { exec } = require('child_process');
const path = require('path');

const jsonFiles = [
  "json_files/v3/Fatigue I_v3.json",
  "json_files/v3/Fatigue II_v3.json",
  "json_files/v3/Fatigue III - Psy_v3.json",
  "json_files/v3/Douleur aux jambes_v3.json",
  "json_files/v3/Douleur au talon_v3.json",
  "json_files/v3/Douleur au poignet_v3.json",
  "json_files/v3/Douleur au genou_v3.json",
  "json_files/v3/Érythème_v3.json",
  "json_files/v3/Gonflement du visage_v3.json",
  "json_files/v3/Gonflement abdominal_v3.json",
  "json_files/v3/Flush_v3.json",
  "json_files/v3/Épilepsie_v3.json",
  "json_files/v3/Énurésie - Pédiatrie_v3.json"
];

let processed = 0;

console.log('🔄 Régénération des grilles HTML et PDF...\n');

function regenerateNext() {
    if (processed >= jsonFiles.length) {
        console.log('\n✅ Toutes les grilles ont été régénérées');
        return;
    }
    
    const jsonFile = jsonFiles[processed];
    console.log(`📄 Régénération de : ${path.basename(jsonFile)}`);
    
    exec(`node generateur-automatique.js "${jsonFile}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`   ❌ Erreur : ${error.message}`);
        } else {
            console.log(`   ✅ Succès`);
            if (stdout) console.log(stdout.trim());
        }
        
        processed++;
        setTimeout(regenerateNext, 1000);
    });
}

regenerateNext();
