const fs = require('fs');
const path = require('path');

// Lire le fichier markdown
const mdFilePath = path.join(__dirname, 'A_traiter_francais', 'USMLE - Mini cases.md');
const mdContent = fs.readFileSync(mdFilePath, 'utf-8');

// Fonction pour extraire les catégories et leurs cas
function extractCategories(content) {
    const categories = [];
    const lines = content.split('\n');
    
    let currentCategory = null;
    let currentAnamnese = '';
    let currentExamen = '';
    let inTable = false;
    let tableRows = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Détecter une nouvelle catégorie
        if (line.startsWith('### ') && !line.includes('Mini-Cas')) {
            // Sauvegarder la catégorie précédente si elle existe
            if (currentCategory && tableRows.length > 0) {
                categories.push({
                    name: currentCategory,
                    anamnese: currentAnamnese,
                    examen: currentExamen,
                    cases: tableRows
                });
            }
            
            // Nouvelle catégorie
            currentCategory = line.replace('### ', '').trim();
            currentAnamnese = '';
            currentExamen = '';
            tableRows = [];
            inTable = false;
        }
        
        // Extraire l'anamnèse
        if (currentCategory && line.startsWith('**Éléments clés de l\'anamnèse**')) {
            let j = i + 1;
            while (j < lines.length && !lines[j].startsWith('**')) {
                if (lines[j].trim()) {
                    currentAnamnese += lines[j].trim() + ' ';
                }
                j++;
            }
            currentAnamnese = currentAnamnese.trim();
        }
        
        // Extraire l'examen physique
        if (currentCategory && line.startsWith('**Éléments clés de l\'examen physique**')) {
            let j = i + 1;
            while (j < lines.length && !lines[j].startsWith('|') && !lines[j].startsWith('**')) {
                if (lines[j].trim()) {
                    currentExamen += lines[j].trim() + ' ';
                }
                j++;
            }
            currentExamen = currentExamen.trim();
        }
        
        // Détecter le début du tableau
        if (line.startsWith('| Présentation')) {
            inTable = true;
            i++; // Passer la ligne de séparation |---|---|---|
            continue;
        }
        
        // Extraire les lignes du tableau
        if (inTable && line.startsWith('|') && !line.includes('---')) {
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
            if (cells.length === 3) {
                const presentation = cells[0];
                const diagnostics = cells[1].split('<br>').map(d => d.trim());
                const bilan = cells[2].split('<br>').map(b => b.trim());
                
                // Extraire les informations du patient
                const genderMatch = presentation.match(/[♂♀]/);
                const ageMatch = presentation.match(/(\d+)\s*ans/);
                const gender = genderMatch ? (genderMatch[0] === '♂' ? 'Homme' : 'Femme') : '';
                const age = ageMatch ? ageMatch[1] : '';
                
                // Nettoyer la présentation
                let cleanPresentation = presentation
                    .replace(/[♂♀]\s*/, '')
                    .replace(/\d+\s*ans\s*/, '')
                    .replace(/^se présente avec\s*/i, '')
                    .trim();
                
                tableRows.push({
                    gender,
                    age,
                    presentation: cleanPresentation,
                    diagnostics,
                    bilan
                });
            }
        }
        
        // Fin du tableau
        if (inTable && !line.startsWith('|') && line !== '') {
            inTable = false;
        }
    }
    
    // Ajouter la dernière catégorie
    if (currentCategory && tableRows.length > 0) {
        categories.push({
            name: currentCategory,
            anamnese: currentAnamnese,
            examen: currentExamen,
            cases: tableRows
        });
    }
    
    return categories;
}

// Fonction pour générer un titre de cas unique
function generateCaseTitle(category, caseData, index) {
    // Utiliser le premier diagnostic comme base du titre
    const primaryDiagnosis = caseData.diagnostics[0] || category;
    const age = caseData.age;
    const gender = caseData.gender;
    
    return `USMLE Mini - ${primaryDiagnosis} - ${gender} de ${age} ans`;
}

// Fonction pour créer le JSON principal pour un cas
function createMainJSON(category, caseData, title) {
    return {
        title: title,
        category: "USMLE Mini-Cas",
        originalCategory: category.name,
        context: {
            setting: "Cabinet de médecine générale",
            patient: `${caseData.gender} de ${caseData.age} ans consultant pour ${caseData.presentation}`
        },
        sections: {
            anamnese: {
                weight: 0.25,
                criteria: [
                    {
                        id: "a1",
                        text: "Motif principal de consultation",
                        binaryOnly: true,
                        patientComment: caseData.presentation
                    },
                    {
                        id: "a2",
                        text: "Éléments clés de l'anamnèse à explorer",
                        details: category.anamnese.split(';').map(item => item.trim()).filter(item => item)
                    }
                ]
            },
            examen: {
                weight: 0.25,
                criteria: [
                    {
                        id: "e1",
                        text: "Éléments clés de l'examen physique",
                        details: category.examen.split(';').map(item => item.trim()).filter(item => item)
                    }
                ]
            },
            management: {
                weight: 0.25,
                criteria: [
                    {
                        id: "m1",
                        text: "Diagnostics différentiels à considérer",
                        ddSection: {
                            title: "Diagnostics différentiels",
                            categories: [
                                {
                                    name: "Hypothèses diagnostiques",
                                    items: caseData.diagnostics.map((diag, idx) => ({
                                        text: diag,
                                        cause: "À évaluer selon l'anamnèse et l'examen clinique",
                                        test: idx < caseData.bilan.length ? `→ ${caseData.bilan[idx]}` : ""
                                    }))
                                }
                            ]
                        }
                    },
                    {
                        id: "m2",
                        text: "Examens complémentaires pertinents",
                        details: caseData.bilan
                    }
                ]
            }
        },
        annexes: {
            informationsExpert: {
                titre: "Informations pour l'expert",
                pointsCles: [
                    `Cas de ${category.name.toLowerCase()}`,
                    `Patient: ${caseData.gender} de ${caseData.age} ans`,
                    "Évaluation de la démarche diagnostique",
                    "Choix approprié des examens complémentaires"
                ],
                pieges: [
                    "Ne pas explorer systématiquement tous les éléments de l'anamnèse",
                    "Oublier certains diagnostics différentiels importants",
                    "Demander des examens non pertinents ou excessifs"
                ]
            }
        }
    };
}

// Fonction pour créer le JSON feuille-porte
function createDoorSheetJSON(caseData, title) {
    return {
        titre: title,
        contexte: "Cabinet de médecine générale",
        description: `${caseData.gender}, ${caseData.age} ans, ${caseData.presentation}`,
        taches: [
            "Prendre une anamnèse ciblée",
            "Réaliser un examen clinique ciblé",
            "Proposer des diagnostics différentiels",
            "Suggérer les examens complémentaires pertinents"
        ]
    };
}

// Fonction principale
function generateAllJSONFiles() {
    console.log('Extraction des catégories et cas...');
    const categories = extractCategories(mdContent);
    
    let totalCases = 0;
    const allCases = [];
    
    // Collecter tous les cas avec leurs informations
    categories.forEach(category => {
        category.cases.forEach((caseData, index) => {
            const title = generateCaseTitle(category, caseData, index + 1);
            allCases.push({
                category,
                caseData,
                title
            });
            totalCases++;
        });
    });
    
    console.log(`Total de ${totalCases} mini-cas trouvés dans ${categories.length} catégories`);
    
    // Créer les dossiers s'ils n'existent pas
    const jsonDir = path.join(__dirname, 'json_files', 'usmle-mini');
    const doorSheetDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'usmle-mini');
    
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }
    if (!fs.existsSync(doorSheetDir)) {
        fs.mkdirSync(doorSheetDir, { recursive: true });
    }
    
    // Générer les fichiers JSON pour chaque cas
    allCases.forEach((item, globalIndex) => {
        const { category, caseData, title } = item;
        const caseNumber = globalIndex + 1;
        
        // Créer le nom de fichier
        const fileName = `USMLE-Mini-${caseNumber.toString().padStart(3, '0')} - ${title.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim()}`;
        
        // Générer le JSON principal
        const mainJSON = createMainJSON(category, caseData, title);
        const mainPath = path.join(jsonDir, `${fileName}.json`);
        fs.writeFileSync(mainPath, JSON.stringify(mainJSON, null, 2), 'utf-8');
        
        // Générer le JSON feuille-porte
        const doorJSON = createDoorSheetJSON(caseData, title);
        const doorPath = path.join(doorSheetDir, `${fileName}.json`);
        fs.writeFileSync(doorPath, JSON.stringify(doorJSON, null, 2), 'utf-8');
        
        console.log(`✓ Cas ${caseNumber}/${totalCases}: ${title}`);
    });
    
    // Créer un fichier index avec la liste de tous les cas
    const indexPath = path.join(jsonDir, 'index.json');
    const indexData = {
        totalCases,
        categories: categories.map(cat => ({
            name: cat.name,
            count: cat.cases.length
        })),
        cases: allCases.map((item, idx) => ({
            number: idx + 1,
            title: item.title,
            category: item.category.name,
            age: item.caseData.age,
            gender: item.caseData.gender
        }))
    };
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
    
    console.log('\n✅ Génération terminée !');
    console.log(`📁 Fichiers JSON principaux: ${jsonDir}`);
    console.log(`📁 Fichiers JSON feuille-porte: ${doorSheetDir}`);
    console.log(`📊 Index des cas: ${indexPath}`);
}

// Exécuter la génération
generateAllJSONFiles();