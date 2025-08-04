const fs = require('fs');
const path = require('path');

// Helper function to convert value to appropriate type (string, array, or keep as is)
function convertValue(value, targetType) {
    if (value === null || value === undefined || value === '') {
        if (targetType === 'array') return [];
        if (targetType === 'string') return '';
        return null;
    }
    
    if (targetType === 'array') {
        if (Array.isArray(value)) {
            return value.filter(item => item !== null && item !== undefined && item !== '');
        }
        if (typeof value === 'object') {
            // Convert object to array of values
            const values = [];
            Object.entries(value).forEach(([key, val]) => {
                if (val !== null && val !== undefined && val !== '') {
                    if (Array.isArray(val)) {
                        values.push(...val);
                    } else {
                        values.push(val);
                    }
                }
            });
            return values;
        }
        return [value];
    }
    
    if (targetType === 'string') {
        if (Array.isArray(value)) {
            return value[0] || '';
        }
        if (typeof value === 'object') {
            // Try to find a meaningful string value
            return value.value || value.text || value.title || value.nom || value.age || '';
        }
        return String(value);
    }
    
    return value;
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

// Collect all possible values for a field from various sources
function collectFieldValues(source, fieldNames) {
    const values = [];
    
    fieldNames.forEach(fieldName => {
        // Direct field
        if (source[fieldName] !== undefined && source[fieldName] !== null && source[fieldName] !== '') {
            if (Array.isArray(source[fieldName])) {
                values.push(...source[fieldName]);
            } else if (typeof source[fieldName] === 'object') {
                Object.values(source[fieldName]).forEach(val => {
                    if (val !== null && val !== undefined && val !== '') {
                        if (Array.isArray(val)) {
                            values.push(...val);
                        } else {
                            values.push(val);
                        }
                    }
                });
            } else {
                values.push(source[fieldName]);
            }
        }
        
        // Check nested structures
        Object.entries(source).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                if (value[fieldName] !== undefined && value[fieldName] !== null && value[fieldName] !== '') {
                    if (Array.isArray(value[fieldName])) {
                        values.push(...value[fieldName]);
                    } else {
                        values.push(value[fieldName]);
                    }
                }
            }
        });
    });
    
    return values;
}

// Migrate histoire section
function migrateHistoire(oldAnnexes, oldScenario) {
    const histoire = {
        debut: [],
        evolution: [],
        contexte: [],
        facteursDeclenchants: [],
        caracteristiques: {
            localisation: [],
            irradiation: [],
            type: [],
            qualite: [],
            intensite: [],
            frequence: [],
            duree: []
        },
        facteursModulateurs: {
            ameliorants: [],
            aggravants: []
        },
        traitements: {
            essayes: [],
            efficacite: [],
            actuels: []
        }
    };
    
    // Get histoireActuelle data
    const ha = oldScenario?.histoireActuelle || oldScenario?.histoire || {};
    
    // Basic fields - now arrays
    histoire.debut = convertValue(ha.debut || ha.evenementPrincipal || ha.symptomePrincipal || [], 'array');
    histoire.evolution = convertValue(ha.evolution || ha.progression || [], 'array');
    histoire.contexte = convertValue(ha.contexte || ha.contextePsychosocial || [], 'array');
    
    // Facteurs déclenchants
    histoire.facteursDeclenchants = mergeArrays(
        ha.facteursDeclenchants,
        ha.declencheurs,
        ha.triggers
    );
    
    // Caractéristiques - now arrays
    const carac = ha.caracteristiques || ha.douleur || {};
    histoire.caracteristiques.localisation = convertValue(carac.localisation || ha.localisation || [], 'array');
    histoire.caracteristiques.irradiation = convertValue(carac.irradiation || ha.irradiation || [], 'array');
    histoire.caracteristiques.type = convertValue(carac.type || ha.type || [], 'array');
    histoire.caracteristiques.qualite = convertValue(carac.qualite || ha.caractereDouleur || [], 'array');
    histoire.caracteristiques.intensite = convertValue(carac.intensite || ha.intensite || [], 'array');
    histoire.caracteristiques.frequence = convertValue(carac.frequence || [], 'array');
    histoire.caracteristiques.duree = convertValue(carac.duree || ha.duree || [], 'array');
    
    // Facteurs modulateurs
    const mod = ha.facteursModulateurs || {};
    histoire.facteursModulateurs.ameliorants = mergeArrays(
        mod.ameliorants,
        ha.facteursSoulageants,
        ha.amelioration
    );
    histoire.facteursModulateurs.aggravants = mergeArrays(
        mod.aggravants,
        ha.facteursAggravants,
        ha.aggravation
    );
    
    // Traitements
    const trait = ha.traitements || {};
    histoire.traitements.essayes = mergeArrays(
        trait.essayes,
        trait.anterieurs,
        ha.traitementsEssayes
    );
    histoire.traitements.efficacite = mergeArrays(
        trait.efficacite,
        trait.resultats,
        ha.efficaciteTraitements
    );
    histoire.traitements.actuels = mergeArrays(
        trait.actuels,
        trait.enCours,
        ha.medicamentsActuels
    );
    
    // Add symptômes from histoire if present
    if (ha.symptomesHistoire || ha.symptomesPrincipaux) {
        histoire.facteursDeclenchants = mergeArrays(
            histoire.facteursDeclenchants,
            ha.symptomesHistoire,
            ha.symptomesPrincipaux
        );
    }
    
    return histoire;
}

// Migrate symptomesAssocies section
function migrateSymptomesAssocies(oldAnnexes, oldScenario) {
    const symptomes = {
        generaux: [],
        neurologiques: [],
        cardiovasculaires: [],
        respiratoires: [],
        digestifs: [],
        urinaires: [],
        gynecologiques: [],
        musculosquelettiques: [],
        dermatologiques: [],
        psychiatriques: [],
        ORL: []
    };
    
    const sa = oldScenario?.symptomesAssocies || {};
    const as = oldScenario?.anamneseSystemes || oldScenario?.anamnèseSystemique || {};
    
    // Map old fields to new structure
    symptomes.generaux = mergeArrays(sa.generaux, sa.systemiquesGeneraux, as.generale);
    symptomes.neurologiques = mergeArrays(sa.neurologiques, sa.neuro, as.neurologique);
    symptomes.cardiovasculaires = mergeArrays(sa.cardiovasculaires, sa.cardio, as.cardiovasculaire);
    symptomes.respiratoires = mergeArrays(sa.respiratoires, sa.respi, as.respiratoire, as.pulmonaire);
    symptomes.digestifs = mergeArrays(sa.digestifs, sa.gastro, as.digestive);
    symptomes.urinaires = mergeArrays(sa.urinaires, sa.uro, as.urinaire, as.genitourinaire);
    symptomes.gynecologiques = mergeArrays(sa.gynecologiques, sa.gyneco, as.gynecologique);
    symptomes.musculosquelettiques = mergeArrays(sa.musculosquelettiques, sa.osteo, as.osteoArticulaire);
    symptomes.dermatologiques = mergeArrays(sa.dermatologiques, sa.dermato, as.dermatologique);
    symptomes.psychiatriques = mergeArrays(sa.psychiatriques, sa.psy, as.psychiatrique);
    symptomes.ORL = mergeArrays(sa.ORL, sa.orl);
    
    return symptomes;
}

// Migrate habitudes section
function migrateHabitudes(oldAnnexes, oldScenario) {
    const habitudes = {
        tabac: [],
        alcool: [],
        cage: [],
        drogue: [],
        autre: []
    };
    
    const hab = oldScenario?.habitudes || {};
    const habVie = oldScenario?.habitudesVie || {};
    
    // Extract tabac information
    const tabacValues = collectFieldValues(
        { ...hab, ...habVie },
        ['tabac', 'cigarette', 'smoking', 'fumeur']
    );
    habitudes.tabac = tabacValues;
    
    // Extract alcool information
    const alcoolValues = collectFieldValues(
        { ...hab, ...habVie },
        ['alcool', 'alcohol', 'boisson', 'vin']
    );
    habitudes.alcool = alcoolValues;
    
    // Extract drogue information
    const drogueValues = collectFieldValues(
        { ...hab, ...habVie },
        ['drogue', 'drogues', 'stupefiants', 'substances', 'toxiques', 'stupefiant']
    );
    habitudes.drogue = drogueValues;
    
    // Extract CAGE responses specifically
    const cageData = hab.cage || hab.cageResponses || habVie.cage || habVie.cageResponses;
    if (cageData) {
        if (Array.isArray(cageData)) {
            habitudes.cage = cageData;
        } else if (typeof cageData === 'object') {
            const cageArray = [];
            Object.entries(cageData).forEach(([key, value]) => {
                if (value) cageArray.push(`${key}: ${value}`);
            });
            habitudes.cage = cageArray;
        } else {
            habitudes.cage = [cageData];
        }
    }
    
    // Collect all other habits
    const autreHabitudes = [];
    const knownFields = ['tabac', 'alcool', 'drogue', 'drogues', 'stupefiants', 'cigarette', 
                        'smoking', 'fumeur', 'alcohol', 'boisson', 'vin', 'substances', 'toxiques',
                        'cage', 'cageResponses', 'stupefiant'];
    
    // Process hab object
    Object.entries(hab).forEach(([key, value]) => {
        if (!knownFields.includes(key) && value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                autreHabitudes.push(...value);
            } else {
                autreHabitudes.push(`${key}: ${value}`);
            }
        }
    });
    
    // Process habVie object
    Object.entries(habVie).forEach(([key, value]) => {
        if (!knownFields.includes(key) && value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                autreHabitudes.push(...value);
            } else {
                autreHabitudes.push(`${key}: ${value}`);
            }
        }
    });
    
    // No need to check for CAGE again as it's handled above
    
    habitudes.autre = mergeArrays(autreHabitudes);
    
    return habitudes;
}

// Main migration function
function migrateToV3Mixte(inputFile) {
    try {
        // Read input file
        const data = fs.readFileSync(inputFile, 'utf8');
        const json = JSON.parse(data);
        
        // Initialize new structure
        const newStructure = {
            annexes: {
                informationsExpert: {
                    titre: '',
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
                    priseEnCharge: [],
                    resultatsLaboratoire: [],
                    autre: []
                },
                scenarioPatienteStandardisee: {
                    titre: '',
                    nom: '',
                    age: '',
                    contexte: [],
                    motifConsultation: {
                        plaintePrincipale: [],
                        autreChose: []
                    },
                    consignes: [],
                    histoire: null, // Will be set by migrateHistoire
                    symptomesAssocies: null, // Will be set by migrateSymptomesAssocies
                    anamnèseSystemique: {
                        generale: [],
                        neurologique: [],
                        cardiovasculaire: [],
                        respiratoire: [],
                        digestive: [],
                        urinaire: [],
                        gynecologique: [],
                        dermatologique: [],
                        musculosquelettique: [],
                        psychiatrique: []
                    },
                    antecedentsMedicaux: [],
                    medicaments: [],
                    comorbidites: [],
                    antecedentsFamiliaux: [],
                    habitudes: {
                        tabac: [],
                        alcool: [],
                        cage: [],
                        drogue: [],
                        autre: []
                    },
                    contextePsychoSocial: [],
                    simulation: [],
                    drapeauxRouges: [],
                    informationsSupplementaires: []
                },
                theoriePratique: {
                    titre: '',
                    sections: [],
                    rappelsTherapeutiques: [],
                    examensComplementaires: [],
                    diagnosticDifferentiel: [],
                    priseEnCharge: [],
                    protocoles: [],
                    guidePratique: []
                }
            }
        };
        
        const oldAnnexes = json.annexes || {};
        
        // Migrate informationsExpert
        const ie = oldAnnexes.informationsExpert || {};
        newStructure.annexes.informationsExpert.titre = convertValue(ie.titre, 'string');
        newStructure.annexes.informationsExpert.dossierMedical = convertValue(ie.dossierMedical, 'array');
        newStructure.annexes.informationsExpert.interventionsQuestions = mergeArrays(
            ie.interventionsQuestions,
            ie.rolesInterventions,
            ie.questions
        );
        newStructure.annexes.informationsExpert.pointsCles = mergeArrays(ie.pointsCles, ie.pointsImportants);
        newStructure.annexes.informationsExpert.pieges = mergeArrays(ie.pieges, ie.pitfalls);
        newStructure.annexes.informationsExpert.defis = mergeArrays(ie.defis, ie.defisSpecifiques, ie.challenges);
        newStructure.annexes.informationsExpert.objectifsApprentissage = mergeArrays(
            ie.objectifsApprentissage,
            ie.objectifsPedagogiques,
            ie.objectifsCommunication
        );
        newStructure.annexes.informationsExpert.diagnosticDifferentiel = mergeArrays(
            ie.diagnosticDifferentiel,
            ie.dd
        );
        newStructure.annexes.informationsExpert.urgences = mergeArrays(
            ie.urgences,
            ie.urgencesMedicales,
            ie.urgencesObstetricales
        );
        newStructure.annexes.informationsExpert.signesAlarme = mergeArrays(
            ie.signesAlarme,
            ie.symptomesAlarme,
            ie.drapeauxRouges
        );
        newStructure.annexes.informationsExpert.facteursRisques = mergeArrays(
            ie.facteursRisques,
            ie.facteurs
        );
        newStructure.annexes.informationsExpert.priseEnCharge = mergeArrays(
            ie.priseEnCharge,
            ie.management,
            ie.bonnesPratiques
        );
        
        // Handle resultatsLaboratoire
        const rl = ie.resultatsLaboratoire || {};
        const labValues = [];
        if (typeof rl === 'object' && !Array.isArray(rl)) {
            Object.entries(rl).forEach(([key, value]) => {
                if (value && value !== '') {
                    labValues.push(`${key}: ${value}`);
                }
            });
        } else if (Array.isArray(rl)) {
            labValues.push(...rl);
        }
        newStructure.annexes.informationsExpert.resultatsLaboratoire = labValues;
        
        // Collect any other fields
        const autre = [];
        Object.entries(ie).forEach(([key, value]) => {
            const knownFields = [
                'titre', 'dossierMedical', 'interventionsQuestions', 'rolesInterventions',
                'questions', 'pointsCles', 'pointsImportants', 'pieges', 'pitfalls',
                'defis', 'defisSpecifiques', 'challenges', 'objectifsApprentissage',
                'objectifsPedagogiques', 'objectifsCommunication', 'diagnosticDifferentiel',
                'dd', 'urgences', 'urgencesMedicales', 'urgencesObstetricales',
                'signesAlarme', 'symptomesAlarme', 'drapeauxRouges', 'facteursRisques',
                'facteurs', 'priseEnCharge', 'management', 'bonnesPratiques', 'resultatsLaboratoire'
            ];
            if (!knownFields.includes(key) && value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    autre.push(...value);
                } else {
                    autre.push(value);
                }
            }
        });
        newStructure.annexes.informationsExpert.autre = autre;
        
        // Migrate scenarioPatienteStandardisee
        const sps = oldAnnexes.scenarioPatienteStandardisee || {};
        newStructure.annexes.scenarioPatienteStandardisee.titre = convertValue(sps.titre, 'string');
        newStructure.annexes.scenarioPatienteStandardisee.nom = convertValue(sps.nom, 'string');
        newStructure.annexes.scenarioPatienteStandardisee.age = convertValue(sps.age, 'string');
        newStructure.annexes.scenarioPatienteStandardisee.contexte = convertValue(sps.contexte, 'array');
        
        // Motif consultation - now arrays
        const mc = sps.motifConsultation || {};
        newStructure.annexes.scenarioPatienteStandardisee.motifConsultation.plaintePrincipale = 
            convertValue(mc.plaintePrincipale || mc.motifPrincipal || [], 'array');
        newStructure.annexes.scenarioPatienteStandardisee.motifConsultation.autreChose = 
            convertValue(mc.autreChose || mc.autre || [], 'array');
        
        // Arrays
        newStructure.annexes.scenarioPatienteStandardisee.consignes = mergeArrays(
            sps.consignes,
            sps.instructions
        );
        
        // Complex sections
        newStructure.annexes.scenarioPatienteStandardisee.histoire = migrateHistoire(oldAnnexes, sps);
        newStructure.annexes.scenarioPatienteStandardisee.symptomesAssocies = migrateSymptomesAssocies(oldAnnexes, sps);
        
        // Antécédents et habitudes
        newStructure.annexes.scenarioPatienteStandardisee.antecedentsMedicaux = collectFieldValues(
            sps,
            ['antecedentsMedicaux', 'antecedents', 'maladies', 'pathologies', 'hospitalisations', 
             'chirurgies', 'traumatismes', 'allergies']
        );
        
        newStructure.annexes.scenarioPatienteStandardisee.medicaments = collectFieldValues(
            sps,
            ['medicaments', 'traitementsActuels', 'traitements', 'actuels', 'supplements']
        );
        
        // Add comorbidites
        newStructure.annexes.scenarioPatienteStandardisee.comorbidites = collectFieldValues(
            sps,
            ['comorbidites', 'comorbidite', 'pathologiesAssociees', 'maladiesAssociees']
        );
        
        newStructure.annexes.scenarioPatienteStandardisee.antecedentsFamiliaux = collectFieldValues(
            sps,
            ['antecedentsFamiliaux', 'familiaux', 'mere', 'pere', 'fratrie', 'descendance']
        );
        
        // Use the dedicated habitudes migration function
        newStructure.annexes.scenarioPatienteStandardisee.habitudes = migrateHabitudes(oldAnnexes, sps);
        
        newStructure.annexes.scenarioPatienteStandardisee.contextePsychoSocial = collectFieldValues(
            sps,
            ['contextePsychoSocial', 'contexteSocial', 'profession', 'habitat', 'famille', 
             'economique', 'social', 'autonomie', 'culturel']
        );
        
        // Simulation
        const sim = sps.simulation || {};
        newStructure.annexes.scenarioPatienteStandardisee.simulation = mergeArrays(
            sim.comportement,
            sim.reponses,
            sim.defis,
            sim.nonVerbal,
            sim.attitude,
            sim.durantExamen,
            sim.durantEntretien,
            sim.durantConsultation,
            sim.reponsesTitypiques,
            sim.examenPhysique,
            sim.cooperationMedicale
        );
        
        newStructure.annexes.scenarioPatienteStandardisee.drapeauxRouges = mergeArrays(
            sps.drapeauxRouges,
            sps.signesAlarme
        );
        
        newStructure.annexes.scenarioPatienteStandardisee.informationsSupplementaires = mergeArrays(
            sps.informationsSupplementaires,
            sps.infosSupp,
            sps.personnalite
        );
        
        // Migrate theoriePratique
        const tp = oldAnnexes.theoriePratique || {};
        newStructure.annexes.theoriePratique.titre = convertValue(tp.titre, 'string');
        
        // Convert sections
        if (tp.sections && Array.isArray(tp.sections)) {
            newStructure.annexes.theoriePratique.sections = tp.sections.map(section => ({
                titre: convertValue(section.titre || section.title || '', 'string'),
                contenu: convertValue(section.contenu || section.content || [], 'array'),
                points: Array.isArray(section.points) ? section.points : []
            }));
        }
        
        // Arrays
        newStructure.annexes.theoriePratique.rappelsTherapeutiques = mergeArrays(
            tp.rappelsTherapeutiques,
            tp.therapeutique
        );
        newStructure.annexes.theoriePratique.examensComplementaires = mergeArrays(
            tp.examensComplementaires,
            tp.examens,
            tp.bilanDiagnostique
        );
        newStructure.annexes.theoriePratique.diagnosticDifferentiel = mergeArrays(
            tp.diagnosticDifferentiel,
            tp.dd
        );
        newStructure.annexes.theoriePratique.priseEnCharge = mergeArrays(
            tp.priseEnCharge,
            tp.management
        );
        newStructure.annexes.theoriePratique.protocoles = mergeArrays(
            tp.protocoles,
            tp.protocol
        );
        newStructure.annexes.theoriePratique.guidePratique = mergeArrays(
            tp.guidePratique,
            tp.guide,
            tp.ressources
        );
        
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
        const backupPath = inputPath.replace('.json', '_backup_v3_mixte.json');
        fs.copyFileSync(inputPath, backupPath);
        
        // Migrate
        const migrated = migrateToV3Mixte(inputPath);
        
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
module.exports = { processFiles, migrateToV3Mixte };

// Get files from command line or use test set
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        processFiles(args);
    } else {
        // Test with one file
        const testFile = 'USMLE Triage 1 - Perte de Vision.json';
        const result = migrateToV3Mixte(path.join(__dirname, 'json_files', testFile));
        console.log(JSON.stringify(result.annexes, null, 2));
    }
}