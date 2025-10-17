const fs = require('fs');
const path = require('path');

// Mappings de terminologie médicale à appliquer
const terminologyReplacements = {
    // Imagerie
    'TDM': 'CT',
    'angio-TDM': 'angio-CT',
    'CT crâne': 'CT cérébral',
    'TDM cérébrale': 'CT cérébral',
    'IRM crâne': 'IRM cérébrale',
    'TEP TDM': 'PET scan',
    'TEP-scan': 'PET scan',
    'Échographie': 'US',
    'CPRE': 'ERCP',
    
    // Biologie
    'Hémoccult': 'Test FIT (recherche de sang occulte dans les selles)',
    'CK-(MB)': 'CK-MB',
    'formule sanguine': 'FSC',
    'Numération': 'NFS',
    'anticorps anti-nucléaires': 'anticorps anti-nucléaires (ANA)',
    'PAL': 'phosphatases alcalines (PAL)',
    'PA': 'phosphatases alcalines (PAL)',
    'GGT': 'Gamma-GT',
    
    // Pathologies
    'Maladie inflammatoire chronique de l\'intestin': 'Maladie inflammatoire chronique de l\'intestin (MICI)'
};

// Fonction pour appliquer les remplacements
function applyTerminologyReplacements(text) {
    if (typeof text !== 'string') return text;
    
    let result = text;
    for (const [oldTerm, newTerm] of Object.entries(terminologyReplacements)) {
        // Utiliser une regex pour remplacer le terme complet uniquement
        const regex = new RegExp(`\\b${oldTerm}\\b`, 'g');
        result = result.replace(regex, newTerm);
    }
    return result;
}

// Fonction récursive pour parcourir et modifier un objet JSON
function processJsonObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => processJsonObject(item));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = processJsonObject(value);
        }
        return newObj;
    } else if (typeof obj === 'string') {
        return applyTerminologyReplacements(obj);
    }
    return obj;
}

// Traiter tous les fichiers JSON principaux
const mainDir = path.join(__dirname, 'json_files', 'usmle-mini');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'usmle-mini');

// Traiter les fichiers principaux
const mainFiles = fs.readdirSync(mainDir).filter(f => f.endsWith('.json'));
console.log(`Traitement de ${mainFiles.length} fichiers JSON principaux...`);

mainFiles.forEach(file => {
    const filePath = path.join(mainDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const processedContent = processJsonObject(content);
    fs.writeFileSync(filePath, JSON.stringify(processedContent, null, 2), 'utf-8');
    console.log(`✓ ${file}`);
});

// Traiter les fichiers feuille-porte
const doorFiles = fs.readdirSync(doorDir).filter(f => f.endsWith('.json'));
console.log(`\nTraitement de ${doorFiles.length} fichiers JSON feuille-porte...`);

doorFiles.forEach(file => {
    const filePath = path.join(doorDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const processedContent = processJsonObject(content);
    fs.writeFileSync(filePath, JSON.stringify(processedContent, null, 2), 'utf-8');
    console.log(`✓ ${file}`);
});

console.log('\n✅ Terminologie médicale mise à jour avec succès !');