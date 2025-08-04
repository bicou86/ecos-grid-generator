const fs = require('fs');
const path = require('path');

// Helper function to convert any value to array
function toArray(value) {
    if (value === null || value === undefined || value === '') {
        return [];
    }
    if (Array.isArray(value)) {
        return value.filter(item => item !== null && item !== undefined && item !== '');
    }
    if (typeof value === 'object') {
        // For objects, extract meaningful values
        const values = [];
        Object.entries(value).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
                if (Array.isArray(val)) {
                    values.push(...val);
                } else if (typeof val === 'object') {
                    // Flatten nested objects into string representation
                    const flattened = flattenObject(val, key);
                    if (flattened) values.push(flattened);
                } else {
                    values.push(`${key}: ${val}`);
                }
            }
        });
        return values;
    }
    return [value];
}

// Helper to flatten complex objects
function flattenObject(obj, prefix = '') {
    const result = [];
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                result.push(...value);
            } else if (typeof value === 'object') {
                const nested = flattenObject(value, `${prefix}.${key}`);
                if (nested) result.push(nested);
            } else {
                result.push(value);
            }
        }
    });
    return result.filter(Boolean);
}

// Deep merge arrays, removing duplicates
function mergeArrays(...arrays) {
    const merged = [];
    const seen = new Set();
    
    arrays.forEach(arr => {
        if (Array.isArray(arr)) {
            arr.forEach(item => {
                const key = typeof item === 'string' ? item.toLowerCase().trim() : JSON.stringify(item);
                if (!seen.has(key) && item !== null && item !== undefined && item !== '') {
                    seen.add(key);
                    merged.push(item);
                }
            });
        }
    });
    
    return merged;
}

// Extract all values from an object recursively
function extractAllValues(obj, target, path = []) {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
        const currentPath = [...path, key];
        
        if (value === null || value === undefined || value === '') return;
        
        // Map similar field names to unified target fields
        const fieldMappings = {
            // informationsExpert mappings
            'titre': ['titre', 'title'],
            'dossierMedical': ['dossierMedical', 'dossier'],
            'interventionsQuestions': ['interventionsQuestions', 'rolesInterventions', 'questions'],
            'pointsCles': ['pointsCles', 'pointsImportants', 'keysPoints'],
            'pieges': ['pieges', 'pitfalls'],
            'defis': ['defis', 'defisSpecifiques', 'challenges'],
            'objectifsApprentissage': ['objectifsApprentissage', 'objectifsPedagogiques', 'objectifs'],
            'diagnosticDifferentiel': ['diagnosticDifferentiel', 'dd', 'ddx'],
            'urgences': ['urgences', 'urgencesMedicales', 'urgencesObstetricales'],
            'signesAlarme': ['signesAlarme', 'symptomesAlarme', 'drapeauxRouges'],
            'facteursRisques': ['facteursRisques', 'facteurs'],
            'techniques': ['techniques', 'techniqueEvaluation', 'techniquesGestion'],
            'priseEnCharge': ['priseEnCharge', 'management'],
            'bonnesPratiques': ['bonnesPratiques', 'bestPractices'],
            'agentCaustique': ['agentCaustique', 'caustique'],
            'objectifsCommunication': ['objectifsCommunication', 'communication'],
            'resultatsLaboratoire': ['resultatsLaboratoire', 'labo', 'testGrossesse'],
            
            // scenarioPatienteStandardisee mappings
            'nom': ['nom', 'name', 'patient'],
            'age': ['age', 'âge'],
            'contexte': ['contexte', 'setting', 'context'],
            'motifConsultation': ['motifConsultation', 'plaintePrincipale', 'urgence', 'inquietudes', 'demandes', 'attentes', 'autreChose'],
            'consignes': ['consignes', 'instructions'],
            'histoire': ['histoire', 'histoireActuelle', 'debut', 'evolution', 'facteursDeclenchants', 'caracteristiques', 
                        'facteursModulateurs', 'traitements', 'crises', 'symptomesHistoire', 'fievre', 'toux', 
                        'fatigue', 'vomissements', 'diarrhee', 'troublesSommeil', 'traumatisme', 'decouverte', 
                        'impact', 'attitude', 'douleur', 'debutDouleur', 'irradiation', 'localisation', 'caractereDouleur',
                        'conceptCrises', 'descriptionCrise', 'crise', 'interCrise', 'douleurFond'],
            'symptomesAssocies': ['symptomesAssocies', 'generaux', 'neurologiques', 'cardiovasculaires', 'respiratoires', 
                                 'digestifs', 'urinaires', 'gynecologiques', 'musculosquelettiques', 'dermatologiques', 
                                 'psychiatriques', 'ORL', 'locaux', 'autresArticulations', 'synchronisme'],
            'anamnèseSystemique': ['anamnèseSystemique', 'anamneseSystemes', 'generale', 'neurologique', 'cardiovasculaire', 
                                  'respiratoire', 'digestive', 'urinaire', 'gynecologique', 'dermatologique', 
                                  'musculosquelettique', 'psychiatrique', 'pulmonaire', 'genitourinaire', 'osteoArticulaire'],
            'antecedentsMedicaux': ['antecedentsMedicaux', 'antecedents', 'maladies', 'hospitalisations', 'chirurgies', 
                                   'traumatismes', 'allergies', 'vaccinations', 'anxiete', 'autres', 'autresAntecedents',
                                   'autresMedicaments', 'bpco', 'cardiaque', 'cardiovasculaire', 'cardiovasculaires',
                                   'chirurgical', 'chirurgicaux', 'chirurgie', 'coloscopie', 'demence', 'depistage',
                                   'depression', 'diabete', 'digestif', 'digestifs', 'dyslipidemie', 'emboliePulmonaire',
                                   'fibromyalgie', 'general', 'genouDroit', 'grossesse', 'gynecologiques', 'habitudesVie',
                                   'hbp', 'hta', 'insuline', 'ist', 'medicament', 'medicaments', 'medicaux', 'metaboliques',
                                   'osteoporose', 'pathologies', 'pathologiesConnues', 'problemesGastriques', 'professionnels',
                                   'regimes', 'respiratoire', 'respiratoires', 'rgo', 'sopk', 'touxResiduelle', 'traitementActuel',
                                   'traitementAnterieur', 'traumatiques', 'traumatisme', 'urgences', 'vaccinal',
                                   'antecedentsChirurgicaux', 'antecedentsLombalgies', 'antecedentsEnfant', 'histoireFamiliale'],
            'medicaments': ['medicaments', 'actuels', 'observance', 'effetsSecondaires', 'supplements', 'iatrogenes',
                           'traitements', 'psychiatriques'],
            'antecedentsGynecologiques': ['antecedentsGynecologiques', 'menarche', 'cycles', 'dernieresRegles', 
                                         'contraception', 'grossesses', 'ist', 'accouchements', 'cycleMenstruel',
                                         'histoireGynecologique', 'obstetrique'],
            'antecedentsFamiliaux': ['antecedentsFamiliaux', 'mere', 'pere', 'fratrie', 'descendance', 'diabete',
                                    'frere', 'grandPere', 'hommes', 'mortsSubites'],
            'habitudes': ['habitudes', 'habitudesVie', 'tabac', 'alcool', 'stupefiants', 'drogues', 'activite', 
                         'alimentation', 'sommeil', 'sexualite', 'cafeine', 'cafe', 'sport', 'autonomie', 'social',
                         'profession', 'toxiques', 'activite_sexuelle', 'hobbies', 'poids', 'orientationSexuelle',
                         'etatEsprit', 'consommationSubstances', 'expositions', 'exposition', 'cage', 'cageResponses',
                         'contexteProfessionnel', 'histoireSexuelle', 'informationsPersonnelles'],
            'contextePsychoSocial': ['contextePsychoSocial', 'contextePsychosocial', 'contexteSocial', 'habitat', 
                                   'famille', 'economique', 'culturel', 'depression', 'deuil', 'ideesNoires', 
                                   'violenceDomestique', 'stress', 'violence', 'agressionPhysique', 'agressionSexuelle',
                                   'representationMaladie', 'informationsSurEnfant', 'petitsEnfants'],
            'simulation': ['simulation', 'comportement', 'reponses', 'defis', 'nonVerbal', 'attitude', 'durantExamen',
                          'durantEntretien', 'durantConsultation', 'reponsesTitypiques', 'examenPhysique', 
                          'cooperationMedicale', 'durantStatus', 'durantAppel'],
            'drapeauxRouges': ['drapeauxRouges', 'signesAlarme'],
            'informationsSupplementaires': ['informationsSupplementaires', 'personnalite', 'circonstancesIngestion',
                                          'questionsEtReponses', 'challenges'],
            
            // theoriePratique mappings
            'sections': ['sections', 'points', 'contenu'],
            'rappelsTherapeutiques': ['rappelsTherapeutiques', 'therapeutique'],
            'examensComplementaires': ['examensComplementaires', 'examens', 'bilanDiagnostique'],
            'priseEnCharge': ['priseEnCharge', 'management'],
            'protocoles': ['protocoles', 'protocol'],
            'guidePratique': ['guidePratique', 'guide'],
            'ressources': ['ressources', 'resources'],
            'notePatient': ['notePatient', 'note', 'anamnese']
        };
        
        // Find which target field this key maps to
        let targetField = null;
        for (const [field, aliases] of Object.entries(fieldMappings)) {
            if (aliases.some(alias => key.toLowerCase().includes(alias.toLowerCase()))) {
                targetField = field;
                break;
            }
        }
        
        // If we found a mapping and it exists in target, add the values
        if (targetField && target[targetField] !== undefined) {
            const values = toArray(value);
            if (values.length > 0) {
                target[targetField] = mergeArrays(target[targetField], values);
            }
        }
        
        // Recursively process nested objects
        if (typeof value === 'object' && !Array.isArray(value)) {
            extractAllValues(value, target, currentPath);
        }
    });
}

// Main migration function
function migrateToV3Arrays(inputFile) {
    try {
        // Read input file
        const data = fs.readFileSync(inputFile, 'utf8');
        const json = JSON.parse(data);
        
        // Initialize new structure
        const newStructure = {
            annexes: {
                informationsExpert: {
                    titre: [],
                    dossierMedical: [],
                    interventionsQuestions: [],
                    pointsCles: [],
                    pieges: [],
                    defis: [],
                    objectifsApprentissage: [],
                    diagnosticDifferentiel: [],
                    urgences: [],
                    signesAlarme: [],
                    facteursRisques: [],
                    techniques: [],
                    priseEnCharge: [],
                    bonnesPratiques: [],
                    agentCaustique: [],
                    defisSpecifiques: [],
                    objectifsCommunication: [],
                    objectifsPedagogiques: [],
                    symptomesAlarme: [],
                    techniqueEvaluation: [],
                    techniquesGestion: [],
                    urgencesMedicales: [],
                    urgencesObstetricales: [],
                    resultatsLaboratoire: []
                },
                scenarioPatienteStandardisee: {
                    titre: [],
                    nom: [],
                    age: [],
                    contexte: [],
                    motifConsultation: [],
                    consignes: [],
                    histoire: [],
                    symptomesAssocies: [],
                    anamnèseSystemique: [],
                    antecedentsMedicaux: [],
                    medicaments: [],
                    antecedentsGynecologiques: [],
                    antecedentsFamiliaux: [],
                    habitudes: [],
                    contextePsychoSocial: [],
                    simulation: [],
                    drapeauxRouges: [],
                    informationsSupplementaires: []
                },
                theoriePratique: {
                    titre: [],
                    sections: [],
                    rappelsTherapeutiques: [],
                    examensComplementaires: [],
                    diagnosticDifferentiel: [],
                    priseEnCharge: [],
                    protocoles: [],
                    guidePratique: [],
                    ressources: [],
                    notePatient: []
                }
            }
        };
        
        // Extract data from old structure
        if (json.annexes) {
            // Process informationsExpert
            if (json.annexes.informationsExpert) {
                extractAllValues(json.annexes.informationsExpert, newStructure.annexes.informationsExpert);
            }
            
            // Process scenarioPatienteStandardisee
            if (json.annexes.scenarioPatienteStandardisee) {
                extractAllValues(json.annexes.scenarioPatienteStandardisee, newStructure.annexes.scenarioPatienteStandardisee);
            }
            
            // Process theoriePratique
            if (json.annexes.theoriePratique) {
                extractAllValues(json.annexes.theoriePratique, newStructure.annexes.theoriePratique);
            }
            
            // Process any other top-level annexes fields
            extractAllValues(json.annexes, {
                ...newStructure.annexes.informationsExpert,
                ...newStructure.annexes.scenarioPatienteStandardisee,
                ...newStructure.annexes.theoriePratique
            });
        }
        
        // Keep other sections unchanged
        const result = {
            title: json.title,
            context: json.context,
            sections: json.sections,
            annexes: newStructure.annexes
        };
        
        return result;
    } catch (error) {
        console.error(`Error migrating ${inputFile}:`, error);
        return null;
    }
}

// Process multiple files
function processFiles(files) {
    const results = {
        success: [],
        failed: []
    };
    
    files.forEach(file => {
        const inputPath = path.join(__dirname, 'json_files', file);
        
        // Create backup
        const backupPath = inputPath.replace('.json', '_backup_v3_arrays.json');
        fs.copyFileSync(inputPath, backupPath);
        
        // Migrate
        const migrated = migrateToV3Arrays(inputPath);
        
        if (migrated) {
            // Write migrated version
            fs.writeFileSync(inputPath, JSON.stringify(migrated, null, 2));
            results.success.push(file);
            console.log(`✓ Migrated: ${file}`);
        } else {
            results.failed.push(file);
            console.log(`✗ Failed: ${file}`);
        }
    });
    
    console.log('\n=== Migration Summary ===');
    console.log(`Success: ${results.success.length}/${files.length}`);
    if (results.failed.length > 0) {
        console.log('Failed files:', results.failed);
    }
}

// Export functions for reuse
module.exports = { processFiles, migrateToV3Arrays };

// Get files from command line or use test set
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        processFiles(args);
    } else {
        // Test with one file
        const testFile = 'USMLE Triage 1 - Perte de Vision.json';
        const result = migrateToV3Arrays(path.join(__dirname, 'json_files', testFile));
        console.log(JSON.stringify(result.annexes, null, 2));
    }
}