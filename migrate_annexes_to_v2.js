#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lire le mapping
const mappingPath = path.join(__dirname, 'json_files', 'mapping_annexes_v1_vers_v2.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Liste des fichiers USMLE à migrer
const usmleFiles = [];
for (let i = 1; i <= 40; i++) {
    usmleFiles.push(`USMLE Triage ${i} - `);
}

// Fonction pour migrer une propriété selon le mapping
function migrateProperty(source, target, sourcePath, targetPath) {
    const sourceValue = getNestedProperty(source, sourcePath);
    if (sourceValue !== undefined) {
        setNestedProperty(target, targetPath, sourceValue);
    }
}

// Fonction pour obtenir une propriété imbriquée
function getNestedProperty(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

// Fonction pour définir une propriété imbriquée
function setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((curr, prop) => {
        if (!curr[prop]) curr[prop] = {};
        return curr[prop];
    }, obj);
    target[last] = value;
}

// Fonction principale de migration
function migrateAnnexes(oldAnnexes) {
    const newAnnexes = {
        scenarioPatienteStandardisee: {},
        informationsExpert: {},
        theoriePratique: {}
    };

    // Copier les sections techniques si présentes
    if (oldAnnexes.images) {
        newAnnexes.images = oldAnnexes.images;
    }
    if (oldAnnexes.defi) {
        newAnnexes.defi = oldAnnexes.defi;
    }
    if (oldAnnexes.questionsEtReponses) {
        newAnnexes.questionsEtReponses = oldAnnexes.questionsEtReponses;
    }

    // Migrer scenarioPatienteStandardisee
    if (oldAnnexes.scenarioPatienteStandardisee) {
        const oldScenario = oldAnnexes.scenarioPatienteStandardisee;
        const newScenario = newAnnexes.scenarioPatienteStandardisee;

        // Propriétés de base
        ['titre', 'nom', 'age', 'contexte'].forEach(prop => {
            if (oldScenario[prop]) newScenario[prop] = oldScenario[prop];
        });

        // Motif de consultation
        if (oldScenario.motifConsultation) {
            newScenario.motifConsultation = oldScenario.motifConsultation;
        }

        // Regrouper histoireActuelle et variantes dans anamnèseActuelle
        newScenario.anamnèseActuelle = {};
        ['histoireActuelle', 'douleurActuelle', 'symptomePrincipal', 'symptomesPrincipaux'].forEach(prop => {
            if (oldScenario[prop]) {
                if (typeof oldScenario[prop] === 'object' && !Array.isArray(oldScenario[prop])) {
                    Object.assign(newScenario.anamnèseActuelle, oldScenario[prop]);
                } else {
                    newScenario.anamnèseActuelle[prop] = oldScenario[prop];
                }
            }
        });

        // Caractérisation de la plainte
        newScenario.caracterisationPlainte = {};
        ['quantificationDouleur', 'douleurCaracteristiques', 'evolutionTemporelle'].forEach(prop => {
            if (oldScenario[prop]) {
                newScenario.caracterisationPlainte[prop] = oldScenario[prop];
            }
        });

        // Symptômes associés
        if (oldScenario.symptomesAssocies) {
            newScenario.symptomesAssocies = oldScenario.symptomesAssocies;
        }

        // Signes de gravité (red flags)
        if (oldScenario.signesAssocies) {
            newScenario.signesGravite = oldScenario.signesAssocies;
        }

        // Anamnèse systémique
        if (oldScenario.anamneseSystemes) {
            newScenario.anamnèseSystemique = oldScenario.anamneseSystemes;
        }

        // Facteurs de risque
        newScenario.facteursRisques = {};
        ['facteursModulants', 'comorbidites', 'expositions'].forEach(prop => {
            if (oldScenario[prop]) {
                if (typeof oldScenario[prop] === 'object') {
                    Object.assign(newScenario.facteursRisques, oldScenario[prop]);
                } else {
                    newScenario.facteursRisques[prop] = oldScenario[prop];
                }
            }
        });

        // Contexte médical
        newScenario.contexteMedical = {};
        if (oldScenario.medicaments) {
            newScenario.contexteMedical.medicaments = oldScenario.medicaments;
        }
        if (oldScenario.traitements) {
            if (typeof oldScenario.traitements === 'object' && !Array.isArray(oldScenario.traitements)) {
                Object.assign(newScenario.contexteMedical, oldScenario.traitements);
            } else {
                newScenario.contexteMedical.traitements = oldScenario.traitements;
            }
        }
        if (oldScenario.histoireGynecologique) {
            Object.assign(newScenario.contexteMedical, oldScenario.histoireGynecologique);
        }

        // Antécédents médicaux
        newScenario.antecedentsMedicaux = {};
        if (oldScenario.antecedents) {
            Object.assign(newScenario.antecedentsMedicaux, oldScenario.antecedents);
        }
        if (oldScenario.antecedentsMedicaux) {
            Object.assign(newScenario.antecedentsMedicaux, oldScenario.antecedentsMedicaux);
        }
        if (oldScenario.antecedentsPriseCharge) {
            newScenario.antecedentsMedicaux.priseEnCharge = oldScenario.antecedentsPriseCharge;
        }

        // Antécédents familiaux
        if (oldScenario.antecedentsFamiliaux) {
            newScenario.antecedentsFamiliaux = oldScenario.antecedentsFamiliaux;
        }

        // Habitudes
        newScenario.habitudes = {};
        if (oldScenario.habitudes) {
            Object.assign(newScenario.habitudes, oldScenario.habitudes);
        }
        if (oldScenario.habitudesVie) {
            Object.assign(newScenario.habitudes, oldScenario.habitudesVie);
        }
        if (oldScenario.histoireSexuelle) {
            newScenario.habitudes.sexuels = oldScenario.histoireSexuelle;
        }

        // Contexte psychosocial
        newScenario.contextePsychoSocial = {};
        if (oldScenario.contexteSocial) {
            Object.assign(newScenario.contextePsychoSocial, oldScenario.contexteSocial);
        }
        if (oldScenario.contextePsychosocial) {
            Object.assign(newScenario.contextePsychoSocial, oldScenario.contextePsychosocial);
        }
        if (oldScenario.informationsPersonnelles) {
            Object.assign(newScenario.contextePsychoSocial, oldScenario.informationsPersonnelles);
        }

        // Simulation et inquiétudes
        if (oldScenario.simulation) {
            newScenario.simulation = oldScenario.simulation;
        }
        if (oldScenario.inquietudes) {
            newScenario.inquietudes = oldScenario.inquietudes;
        }

        // Copier les propriétés restantes non mappées
        Object.keys(oldScenario).forEach(key => {
            if (!isPropertyMapped(key, newScenario)) {
                console.log(`  ⚠️  Propriété non mappée dans scenarioPatienteStandardisee: ${key}`);
                newScenario[key] = oldScenario[key];
            }
        });
    }

    // Migrer informationsExpert
    if (oldAnnexes.informationsExpert) {
        Object.assign(newAnnexes.informationsExpert, oldAnnexes.informationsExpert);
    }

    // Migrer theoriePratique
    if (oldAnnexes.theoriePratique) {
        Object.assign(newAnnexes.theoriePratique, oldAnnexes.theoriePratique);
    }

    // Nettoyer les objets vides
    cleanEmptyObjects(newAnnexes);

    return newAnnexes;
}

// Vérifier si une propriété a été mappée
function isPropertyMapped(prop, obj) {
    const mappedProps = [
        'titre', 'nom', 'age', 'contexte', 'motifConsultation',
        'histoireActuelle', 'douleurActuelle', 'symptomePrincipal', 'symptomesPrincipaux',
        'quantificationDouleur', 'douleurCaracteristiques', 'evolutionTemporelle',
        'symptomesAssocies', 'signesAssocies', 'anamneseSystemes',
        'facteursModulants', 'comorbidites', 'expositions',
        'medicaments', 'traitements', 'histoireGynecologique',
        'antecedents', 'antecedentsMedicaux', 'antecedentsPriseCharge',
        'antecedentsFamiliaux', 'habitudes', 'habitudesVie', 'histoireSexuelle',
        'contexteSocial', 'contextePsychosocial', 'informationsPersonnelles',
        'simulation', 'inquietudes'
    ];
    return mappedProps.includes(prop);
}

// Nettoyer les objets vides récursivement
function cleanEmptyObjects(obj) {
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            cleanEmptyObjects(obj[key]);
            if (Object.keys(obj[key]).length === 0) {
                delete obj[key];
            }
        }
    });
}

// Traiter tous les fichiers
console.log('🚀 Début de la migration des annexes vers la structure v2...\n');

const jsonDir = path.join(__dirname, 'json_files');
const files = fs.readdirSync(jsonDir).filter(file => {
    return file.startsWith('USMLE Triage') && file.endsWith('.json');
});

let successCount = 0;
let errorCount = 0;

files.forEach(file => {
    try {
        const filePath = path.join(jsonDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`📄 Migration de ${file}...`);
        
        if (data.annexes) {
            // Créer une sauvegarde
            const backupPath = filePath.replace('.json', '_backup_v1.json');
            if (!fs.existsSync(backupPath)) {
                fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
            }
            
            // Migrer les annexes
            data.annexes = migrateAnnexes(data.annexes);
            
            // Sauvegarder le fichier mis à jour
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`  ✅ Migration réussie\n`);
            successCount++;
        } else {
            console.log(`  ⏭️  Pas d'annexes à migrer\n`);
        }
    } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}\n`);
        errorCount++;
    }
});

console.log('\n📊 Résumé de la migration:');
console.log(`  ✅ ${successCount} fichiers migrés avec succès`);
console.log(`  ❌ ${errorCount} erreurs`);
console.log(`  📁 ${files.length} fichiers traités au total`);
console.log('\n✨ Migration terminée!');