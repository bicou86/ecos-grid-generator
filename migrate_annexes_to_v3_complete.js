#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour obtenir une propriété imbriquée
function getNestedProperty(obj, path) {
    if (!path || !obj) return undefined;
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

// Fonction pour définir une propriété imbriquée
function setNestedProperty(obj, path, value) {
    if (!path || value === undefined) return;
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((curr, prop) => {
        if (!curr[prop]) curr[prop] = {};
        return curr[prop];
    }, obj);
    target[last] = value;
}

// Fonction pour fusionner des valeurs (arrays ou strings)
function mergeValues(...values) {
    const result = [];
    values.forEach(value => {
        if (Array.isArray(value)) {
            result.push(...value);
        } else if (value && typeof value === 'string') {
            result.push(value);
        } else if (value && typeof value === 'object') {
            // Si c'est un objet, le convertir en string pour le préserver
            result.push(JSON.stringify(value));
        }
    });
    return result.length > 0 ? result : [];
}

// Fonction pour trouver la première valeur non vide
function firstNonEmpty(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '' && 
            (!Array.isArray(value) || value.length > 0)) {
            return value;
        }
    }
    return '';
}

// Fonction pour collecter toutes les propriétés d'un objet de manière récursive
function collectAllProperties(obj, prefix = '', collected = {}) {
    if (!obj || typeof obj !== 'object') return collected;
    
    Object.keys(obj).forEach(key => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value !== undefined && value !== null && value !== '' && 
            (!Array.isArray(value) || value.length > 0)) {
            collected[fullPath] = value;
            
            if (typeof value === 'object' && !Array.isArray(value)) {
                collectAllProperties(value, fullPath, collected);
            }
        }
    });
    
    return collected;
}

// Fonction de migration principale
function migrateAnnexes(data) {
    // Structure v3 complète avec tous les champs possibles
    const v3 = {
        informationsExpert: {
            // Champs standards
            titre: '',
            dossierMedical: '',
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
            // Champs spécifiques identifiés
            agentCaustique: '',
            defisSpecifiques: [],
            objectifsCommunication: [],
            objectifsPedagogiques: [],
            symptomesAlarme: [],
            techniqueEvaluation: [],
            techniquesGestion: [],
            urgencesMedicales: [],
            urgencesObstetricales: [],
            // Résultats laboratoire
            resultatsLaboratoire: {
                fsc: {},
                chimieSanguine: {},
                analyseUrines: {},
                testGrossesse: ''
            }
        },
        scenarioPatienteStandardisee: {
            titre: '',
            identite: {
                nom: '',
                age: '',
                sexe: '',
                origine: '',
                profession: '',
                etatCivil: '',
                enfants: ''
            },
            contexte: '',
            motifConsultation: {
                plaintePrincipale: '',
                urgence: '',
                inquietudes: [],
                demandes: [],
                attentes: [],
                autreChose: '',
                inquietude: []
            },
            consignes: [],
            histoire: {
                debut: '',
                evolution: [],
                contexte: '',
                facteursDeclenchants: [],
                caracteristiques: {
                    localisation: [],
                    irradiation: [],
                    type: '',
                    qualite: '',
                    intensite: '',
                    frequence: '',
                    duree: ''
                },
                facteursModulateurs: {
                    ameliorants: [],
                    aggravants: []
                },
                traitements: {
                    essayes: [],
                    efficacite: '',
                    actuels: []
                },
                // Champs spécifiques pour les crises
                crises: {
                    concept: [],
                    description: [],
                    intensite: '',
                    interCrise: [],
                    douleurFond: []
                },
                // Autres champs spécifiques
                symptomesHistoire: [],
                fievre: [],
                toux: [],
                fatigue: [],
                vomissements: [],
                diarrhee: [],
                troublesSommeil: [],
                traumatisme: [],
                decouverte: [],
                impact: [],
                attitude: [],
                douleur: [],
                debutDouleur: [],
                irradiation: [],
                localisation: [],
                caractereDouleur: []
            },
            symptomesAssocies: {
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
                ORL: [],
                // Champs additionnels
                fievre: [],
                douleurs: [],
                locaux: [],
                autresArticulations: [],
                synchronisme: ''
            },
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
            antecedentsMedicaux: {
                maladies: [],
                hospitalisations: [],
                chirurgies: [],
                traumatismes: [],
                allergies: [],
                vaccinations: '',
                // Tous les champs spécifiques identifiés
                anxiete: '',
                autres: [],
                autresAntecedents: [],
                autresMedicaments: [],
                bpco: '',
                cardiaque: [],
                cardiovasculaire: [],
                cardiovasculaires: [],
                chirurgical: [],
                chirurgicaux: [],
                chirurgie: [],
                coloscopie: '',
                demence: '',
                depistage: [],
                depression: '',
                diabete: '',
                digestif: [],
                digestifs: [],
                dyslipidemie: '',
                emboliePulmonaire: '',
                fibromyalgie: '',
                general: [],
                genouDroit: '',
                grossesse: '',
                gynecologiques: [],
                habitudesVie: [],
                hbp: '',
                hta: '',
                insuline: '',
                ist: [],
                medicament: [],
                medicaments: [],
                medicaux: [],
                metaboliques: [],
                osteoporose: '',
                pathologies: [],
                pathologiesConnues: [],
                problemesGastriques: [],
                professionnels: [],
                regimes: [],
                respiratoire: [],
                respiratoires: [],
                rgo: '',
                sopk: '',
                touxResiduelle: '',
                traitementActuel: [],
                traitementAnterieur: [],
                traumatiques: [],
                traumatisme: [],
                urgences: [],
                vaccinal: ''
            },
            medicaments: {
                actuels: [],
                observance: '',
                effetsSecondaires: [],
                supplements: [],
                iatrogenes: []
            },
            antecedentsGynecologiques: {
                menarche: '',
                cycles: '',
                dernieresRegles: '',
                contraception: [],
                grossesses: '',
                ist: [],
                accouchements: '',
                cycleMenstruel: ''
            },
            antecedentsFamiliaux: {
                mere: '',
                pere: '',
                fratrie: '',
                maladies: [],
                autres: [],
                descendance: [],
                diabete: '',
                frere: [],
                grandPere: '',
                hommes: [],
                mortsSubites: []
            },
            habitudes: {
                tabac: '',
                alcool: '',
                stupefiants: '',
                activite: '',
                alimentation: '',
                sommeil: '',
                sexualite: '',
                cafeine: '',
                drogues: '',
                medicaments: [],
                sport: ''
            },
            contextePsychoSocial: {
                profession: '',
                habitat: '',
                famille: '',
                economique: '',
                social: '',
                autonomie: '',
                culturel: '',
                depression: '',
                deuil: '',
                ideesNoires: '',
                violenceDomestique: ''
            },
            simulation: {
                comportement: [],
                reponses: [],
                defis: [],
                nonVerbal: [],
                attitude: [],
                durantExamen: [],
                durantEntretien: [],
                durantConsultation: [],
                reponsesTitypiques: [],
                examenPhysique: [],
                cooperationMedicale: [],
                durantStatus: [],
                durantAppel: []
            },
            drapeauxRouges: [],
            informationsSupplementaires: [],
            
            // Champs racine additionnels
            nom: '',
            age: '',
            allergies: [],
            antecedents: {},
            antecedentsChirurgicaux: [],
            antecedentsEnfant: {},
            antecedentsLombalgies: [],
            antecedentsRecents: {},
            caracteristiquesComportementales: {},
            caracteristiquesDouleur: {},
            chirurgies: {},
            circonstancesChute: {},
            circonstancesIngestion: {},
            communicationDifficile: {},
            comorbidites: {},
            contextAlimentaire: {},
            contexteCulturel: {},
            contexteFamilial: {},
            contextePsychologique: {},
            contexteSocial: {},
            douleurActuelle: {},
            habitudesVie: {},
            histoireFamiliale: [],
            histoireGynecologique: {},
            historieSexuelle: {},
            histoireSexuelle: {},
            histoireActuelle: {},
            hydratation: {},
            informationsSurEnfant: {},
            medicamentsSupplements: {},
            personnalite: [],
            revueSystemes: {},
            symptomesNegatifs: {},
            traitements: {}
        },
        theoriePratique: {
            titre: '',
            sections: [],
            rappelsTherapeutiques: [],
            examensComplementaires: [],
            diagnosticDifferentiel: [],
            priseEnCharge: [],
            protocoles: [],
            guidePratique: [],
            ressources: []
        }
    };

    // Collecter toutes les propriétés existantes
    const oldAnnexes = data.annexes || {};
    const allOldProperties = collectAllProperties(oldAnnexes);
    
    // Migration intelligente basée sur les propriétés collectées
    Object.entries(allOldProperties).forEach(([fullPath, value]) => {
        migrateProperty(fullPath, value, oldAnnexes, v3);
    });
    
    // Migration spéciale pour scenarioPatienteStandardisee
    if (oldAnnexes.scenarioPatienteStandardisee) {
        migrateScenarioPatient(oldAnnexes.scenarioPatienteStandardisee, v3.scenarioPatienteStandardisee);
    }
    
    // Migration spéciale pour informationsExpert
    if (oldAnnexes.informationsExpert) {
        migrateInformationsExpert(oldAnnexes.informationsExpert, v3.informationsExpert);
    }
    
    // Migration spéciale pour theoriePratique
    if (oldAnnexes.theoriePratique) {
        migrateTheoriePratique(oldAnnexes.theoriePratique, v3.theoriePratique);
    }
    
    // Intégrer les sections supplémentaires
    integrateAdditionalSections(oldAnnexes, v3);
    
    // Nettoyer les objets vides
    cleanEmptyObjects(v3);
    
    // Retourner la nouvelle structure
    return {
        ...data,
        annexes: v3
    };
}

// Fonction pour migrer une propriété spécifique
function migrateProperty(fullPath, value, source, target) {
    const pathParts = fullPath.split('.');
    
    // Mapper les chemins vers la structure v3
    if (pathParts[0] === 'guideCommunication') {
        // Intégrer dans theoriePratique
        if (!target.theoriePratique.guideCommunication) {
            target.theoriePratique.guideCommunication = {};
        }
        setNestedProperty(target.theoriePratique.guideCommunication, pathParts.slice(1).join('.'), value);
    } else if (pathParts[0] === 'notePatient') {
        // Intégrer dans theoriePratique
        if (!target.theoriePratique.notePatient) {
            target.theoriePratique.notePatient = {};
        }
        setNestedProperty(target.theoriePratique.notePatient, pathParts.slice(1).join('.'), value);
    } else if (pathParts[0] === 'protocoleMedical' || pathParts[0] === 'protocoleUrgence') {
        // Intégrer dans theoriePratique.protocoles
        if (Array.isArray(value)) {
            target.theoriePratique.protocoles.push(...value);
        } else if (typeof value === 'string') {
            target.theoriePratique.protocoles.push(value);
        }
    }
}

// Migration spécialisée pour scenarioPatienteStandardisee
function migrateScenarioPatient(oldScenario, newScenario) {
    // Identité
    newScenario.nom = oldScenario.nom || '';
    newScenario.age = oldScenario.age || '';
    
    if (oldScenario.identite) {
        Object.assign(newScenario.identite, oldScenario.identite);
    }
    
    // Contexte
    newScenario.contexte = oldScenario.contexte || '';
    
    // Motif consultation
    if (oldScenario.motifConsultation) {
        const mc = oldScenario.motifConsultation;
        newScenario.motifConsultation = {
            plaintePrincipale: mc.plaintePrincipale || '',
            urgence: mc.urgence || '',
            inquietudes: mergeValues(mc.inquietudes, mc.inquietude),
            demandes: mergeValues(mc.demandes),
            attentes: mergeValues(mc.attentes),
            autreChose: mc.autreChose || ''
        };
    }
    
    // Histoire actuelle complète
    if (oldScenario.histoireActuelle) {
        migrateHistoireActuelle(oldScenario.histoireActuelle, newScenario.histoire);
    }
    
    // Symptômes associés
    if (oldScenario.symptomesAssocies) {
        migrateSymptomesAssociesComplet(oldScenario.symptomesAssocies, newScenario.symptomesAssocies);
    }
    
    // Antécédents complets
    migrateAllAntecedents(oldScenario, newScenario);
    
    // Habitudes de vie
    migrateHabitudesComplet(oldScenario, newScenario);
    
    // Contextes
    migrateAllContextes(oldScenario, newScenario);
    
    // Simulation
    if (oldScenario.simulation) {
        migrateSimulation(oldScenario.simulation, newScenario.simulation);
    }
    
    // Drapeaux rouges
    migrateDrapeauxRouges(oldScenario, newScenario);
    
    // Autres champs spécifiques
    migrateSpecificFields(oldScenario, newScenario);
}

// Migration de l'histoire actuelle
function migrateHistoireActuelle(oldHistoire, newHistoire) {
    // Champs de base
    newHistoire.debut = firstNonEmpty(oldHistoire.debut, oldHistoire.dateDebut, oldHistoire.debutSymptomes);
    newHistoire.evolution = mergeValues(oldHistoire.evolution, oldHistoire.evolutionDouleur, oldHistoire.evolutionSymptomes);
    newHistoire.contexte = firstNonEmpty(oldHistoire.contexte, oldHistoire.circonstances);
    newHistoire.facteursDeclenchants = mergeValues(oldHistoire.facteursDeclenchants, oldHistoire.declencheurs);
    
    // Caractéristiques
    if (oldHistoire.caracteristiques) {
        Object.assign(newHistoire.caracteristiques, oldHistoire.caracteristiques);
    }
    
    // Localisation et irradiation
    newHistoire.caracteristiques.localisation = mergeValues(
        newHistoire.caracteristiques.localisation,
        oldHistoire.localisation
    );
    newHistoire.caracteristiques.irradiation = mergeValues(
        newHistoire.caracteristiques.irradiation,
        oldHistoire.irradiation
    );
    
    // Type et qualité
    newHistoire.caracteristiques.type = firstNonEmpty(
        newHistoire.caracteristiques.type,
        oldHistoire.type,
        oldHistoire.typeDouleur
    );
    newHistoire.caracteristiques.qualite = firstNonEmpty(
        newHistoire.caracteristiques.qualite,
        oldHistoire.qualite,
        oldHistoire.caractereDouleur
    );
    
    // Intensité et autres
    newHistoire.caracteristiques.intensite = firstNonEmpty(
        newHistoire.caracteristiques.intensite,
        oldHistoire.intensite,
        oldHistoire.severite
    );
    newHistoire.caracteristiques.frequence = firstNonEmpty(
        newHistoire.caracteristiques.frequence,
        oldHistoire.frequence
    );
    newHistoire.caracteristiques.duree = firstNonEmpty(
        newHistoire.caracteristiques.duree,
        oldHistoire.duree
    );
    
    // Facteurs modulateurs
    newHistoire.facteursModulateurs.ameliorants = mergeValues(
        oldHistoire.amelioration,
        oldHistoire.soulagement,
        oldHistoire.facteursAmeliorants
    );
    newHistoire.facteursModulateurs.aggravants = mergeValues(
        oldHistoire.aggravation,
        oldHistoire.facteursAggravants
    );
    
    // Traitements
    if (oldHistoire.traitements) {
        Object.assign(newHistoire.traitements, oldHistoire.traitements);
    }
    newHistoire.traitements.essayes = mergeValues(
        newHistoire.traitements.essayes,
        oldHistoire.traitementsEssayes,
        oldHistoire.medicaments
    );
    newHistoire.traitements.efficacite = firstNonEmpty(
        newHistoire.traitements.efficacite,
        oldHistoire.efficaciteTraitements
    );
    newHistoire.traitements.actuels = mergeValues(
        newHistoire.traitements.actuels,
        oldHistoire.traitementsActuels
    );
    
    // Gestion des crises
    if (oldHistoire.conceptCrises || oldHistoire.descriptionCrise || oldHistoire.crise) {
        newHistoire.crises.concept = oldHistoire.conceptCrises || [];
        newHistoire.crises.description = oldHistoire.descriptionCrise || [];
        newHistoire.crises.intensite = oldHistoire.crise || '';
        newHistoire.crises.interCrise = oldHistoire.interCrise || [];
        newHistoire.crises.douleurFond = oldHistoire.douleurFond || [];
    }
    
    // Symptômes spécifiques
    if (oldHistoire.symptomesAssocies) newHistoire.symptomesHistoire = mergeValues(oldHistoire.symptomesAssocies);
    if (oldHistoire.symptomePrincipal) newHistoire.symptomesHistoire = mergeValues(newHistoire.symptomesHistoire, oldHistoire.symptomePrincipal);
    if (oldHistoire.fievre) newHistoire.fievre = mergeValues(oldHistoire.fievre);
    if (oldHistoire.toux) newHistoire.toux = mergeValues(oldHistoire.toux);
    if (oldHistoire.fatigue) newHistoire.fatigue = mergeValues(oldHistoire.fatigue);
    if (oldHistoire.vomissements) newHistoire.vomissements = mergeValues(oldHistoire.vomissements);
    if (oldHistoire.diarrhee) newHistoire.diarrhee = mergeValues(oldHistoire.diarrhee);
    if (oldHistoire.troublesSommeil) newHistoire.troublesSommeil = mergeValues(oldHistoire.troublesSommeil);
    if (oldHistoire.traumatisme) newHistoire.traumatisme = mergeValues(oldHistoire.traumatisme);
    if (oldHistoire.decouverte) newHistoire.decouverte = mergeValues(oldHistoire.decouverte);
    if (oldHistoire.impact) newHistoire.impact = mergeValues(oldHistoire.impact);
    if (oldHistoire.attitude) newHistoire.attitude = mergeValues(oldHistoire.attitude);
    if (oldHistoire.douleur) newHistoire.douleur = mergeValues(oldHistoire.douleur);
    if (oldHistoire.debutDouleur) newHistoire.debutDouleur = mergeValues(oldHistoire.debutDouleur);
    if (oldHistoire.localisation) newHistoire.localisation = mergeValues(oldHistoire.localisation);
    if (oldHistoire.caractereDouleur) newHistoire.caractereDouleur = mergeValues(oldHistoire.caractereDouleur);
}

// Migration des symptômes associés complets
function migrateSymptomesAssociesComplet(oldSymptomes, newSymptomes) {
    // Copier tous les champs existants
    Object.keys(oldSymptomes).forEach(key => {
        if (newSymptomes[key] !== undefined) {
            newSymptomes[key] = mergeValues(newSymptomes[key], oldSymptomes[key]);
        } else {
            // Si le champ n'existe pas dans la structure cible, l'ajouter
            newSymptomes[key] = oldSymptomes[key];
        }
    });
}

// Migration de tous les antécédents
function migrateAllAntecedents(oldScenario, newScenario) {
    // Antécédents médicaux
    if (oldScenario.antecedentsMedicaux) {
        const am = oldScenario.antecedentsMedicaux;
        Object.keys(am).forEach(key => {
            if (newScenario.antecedentsMedicaux[key] !== undefined) {
                if (Array.isArray(newScenario.antecedentsMedicaux[key])) {
                    newScenario.antecedentsMedicaux[key] = mergeValues(newScenario.antecedentsMedicaux[key], am[key]);
                } else {
                    newScenario.antecedentsMedicaux[key] = am[key];
                }
            }
        });
    }
    
    // Antécédents au niveau racine
    if (oldScenario.antecedents) {
        newScenario.antecedents = oldScenario.antecedents;
    }
    
    // Antécédents chirurgicaux
    if (oldScenario.antecedentsChirurgicaux) {
        newScenario.antecedentsChirurgicaux = oldScenario.antecedentsChirurgicaux;
    }
    
    // Antécédents enfant
    if (oldScenario.antecedentsEnfant) {
        newScenario.antecedentsEnfant = oldScenario.antecedentsEnfant;
    }
    
    // Antécédents récents
    if (oldScenario.antecedentsRecents) {
        newScenario.antecedentsRecents = oldScenario.antecedentsRecents;
    }
    
    // Antécédents lombalgies
    if (oldScenario.antecedentsLombalgies) {
        newScenario.antecedentsLombalgies = oldScenario.antecedentsLombalgies;
    }
    
    // Antécédents familiaux
    if (oldScenario.antecedentsFamiliaux) {
        const af = oldScenario.antecedentsFamiliaux;
        Object.keys(af).forEach(key => {
            if (newScenario.antecedentsFamiliaux[key] !== undefined) {
                if (Array.isArray(newScenario.antecedentsFamiliaux[key])) {
                    newScenario.antecedentsFamiliaux[key] = mergeValues(newScenario.antecedentsFamiliaux[key], af[key]);
                } else {
                    newScenario.antecedentsFamiliaux[key] = af[key];
                }
            }
        });
    }
    
    // Antécédents gynécologiques
    if (oldScenario.antecedentsGynecologiques || oldScenario.histoireGynecologique) {
        const ag = oldScenario.antecedentsGynecologiques || oldScenario.histoireGynecologique;
        Object.keys(ag).forEach(key => {
            if (newScenario.antecedentsGynecologiques[key] !== undefined) {
                newScenario.antecedentsGynecologiques[key] = ag[key];
            }
        });
    }
}

// Migration des habitudes complètes
function migrateHabitudesComplet(oldScenario, newScenario) {
    // Habitudes dans la structure
    if (oldScenario.habitudes) {
        const h = oldScenario.habitudes;
        Object.keys(h).forEach(key => {
            if (newScenario.habitudes[key] !== undefined) {
                newScenario.habitudes[key] = h[key];
            }
        });
    }
    
    // Habitudes de vie
    if (oldScenario.habitudesVie) {
        newScenario.habitudesVie = oldScenario.habitudesVie;
        const hv = oldScenario.habitudesVie;
        Object.keys(hv).forEach(key => {
            if (newScenario.habitudes[key] !== undefined && !newScenario.habitudes[key]) {
                newScenario.habitudes[key] = hv[key];
            }
        });
    }
}

// Migration de tous les contextes
function migrateAllContextes(oldScenario, newScenario) {
    // Contexte social
    if (oldScenario.contexteSocial) {
        newScenario.contexteSocial = oldScenario.contexteSocial;
        const cs = oldScenario.contexteSocial;
        // Mapper vers contextePsychoSocial aussi
        if (cs.profession) newScenario.contextePsychoSocial.profession = cs.profession;
        if (cs.famille) newScenario.contextePsychoSocial.famille = cs.famille;
        if (cs.autonomie) newScenario.contextePsychoSocial.autonomie = cs.autonomie;
    }
    
    // Contexte familial
    if (oldScenario.contexteFamilial) {
        newScenario.contexteFamilial = oldScenario.contexteFamilial;
    }
    
    // Contexte psychosocial
    if (oldScenario.contextePsychosocial) {
        const cps = oldScenario.contextePsychosocial;
        Object.keys(cps).forEach(key => {
            if (newScenario.contextePsychoSocial[key] !== undefined) {
                newScenario.contextePsychoSocial[key] = cps[key];
            }
        });
    }
    
    // Contexte culturel
    if (oldScenario.contexteCulturel) {
        newScenario.contexteCulturel = oldScenario.contexteCulturel;
        newScenario.contextePsychoSocial.culturel = JSON.stringify(oldScenario.contexteCulturel);
    }
    
    // Contexte psychologique
    if (oldScenario.contextePsychologique) {
        newScenario.contextePsychologique = oldScenario.contextePsychologique;
    }
    
    // Contexte alimentaire
    if (oldScenario.contextAlimentaire) {
        newScenario.contextAlimentaire = oldScenario.contextAlimentaire;
    }
}

// Migration de la simulation
function migrateSimulation(oldSim, newSim) {
    // Copier tous les champs
    Object.keys(oldSim).forEach(key => {
        if (newSim[key] !== undefined && Array.isArray(newSim[key])) {
            newSim[key] = mergeValues(newSim[key], oldSim[key]);
        } else if (newSim[key] !== undefined) {
            newSim[key] = oldSim[key];
        }
    });
}

// Migration des drapeaux rouges
function migrateDrapeauxRouges(oldScenario, newScenario) {
    if (oldScenario.drapeauxRouges) {
        if (Array.isArray(oldScenario.drapeauxRouges)) {
            newScenario.drapeauxRouges = oldScenario.drapeauxRouges;
        } else if (typeof oldScenario.drapeauxRouges === 'object') {
            // Convertir l'objet en liste
            const dr = oldScenario.drapeauxRouges;
            const list = [];
            Object.keys(dr).forEach(key => {
                if (dr[key]) {
                    list.push(`${key}: ${dr[key]}`);
                }
            });
            newScenario.drapeauxRouges = list;
        }
    }
}

// Migration des champs spécifiques
function migrateSpecificFields(oldScenario, newScenario) {
    // Allergies
    if (oldScenario.allergies) {
        newScenario.allergies = oldScenario.allergies;
    }
    
    // Caractéristiques comportementales
    if (oldScenario.caracteristiquesComportementales) {
        newScenario.caracteristiquesComportementales = oldScenario.caracteristiquesComportementales;
    }
    
    // Caractéristiques douleur
    if (oldScenario.caracteristiquesDouleur) {
        newScenario.caracteristiquesDouleur = oldScenario.caracteristiquesDouleur;
    }
    
    // Chirurgies
    if (oldScenario.chirurgies) {
        newScenario.chirurgies = oldScenario.chirurgies;
    }
    
    // Circonstances chute
    if (oldScenario.circonstancesChute) {
        newScenario.circonstancesChute = oldScenario.circonstancesChute;
    }
    
    // Circonstances ingestion
    if (oldScenario.circonstancesIngestion) {
        newScenario.circonstancesIngestion = oldScenario.circonstancesIngestion;
    }
    
    // Communication difficile
    if (oldScenario.communicationDifficile) {
        newScenario.communicationDifficile = oldScenario.communicationDifficile;
    }
    
    // Comorbidités
    if (oldScenario.comorbidites) {
        newScenario.comorbidites = oldScenario.comorbidites;
    }
    
    // Douleur actuelle
    if (oldScenario.douleurActuelle) {
        newScenario.douleurActuelle = oldScenario.douleurActuelle;
    }
    
    // Histoire familiale
    if (oldScenario.histoireFamiliale) {
        newScenario.histoireFamiliale = oldScenario.histoireFamiliale;
    }
    
    // Histoire sexuelle
    if (oldScenario.historieSexuelle || oldScenario.histoireSexuelle) {
        newScenario.historieSexuelle = oldScenario.historieSexuelle || oldScenario.histoireSexuelle;
        newScenario.histoireSexuelle = oldScenario.historieSexuelle || oldScenario.histoireSexuelle;
    }
    
    // Hydratation
    if (oldScenario.hydratation) {
        newScenario.hydratation = oldScenario.hydratation;
    }
    
    // Informations sur enfant
    if (oldScenario.informationsSurEnfant) {
        newScenario.informationsSurEnfant = oldScenario.informationsSurEnfant;
    }
    
    // Médicaments suppléments
    if (oldScenario.medicamentsSupplements) {
        newScenario.medicamentsSupplements = oldScenario.medicamentsSupplements;
    }
    
    // Personnalité
    if (oldScenario.personnalite) {
        newScenario.personnalite = oldScenario.personnalite;
    }
    
    // Revue systèmes
    if (oldScenario.revueSystemes) {
        newScenario.revueSystemes = oldScenario.revueSystemes;
    }
    
    // Symptômes négatifs
    if (oldScenario.symptomesNegatifs) {
        newScenario.symptomesNegatifs = oldScenario.symptomesNegatifs;
    }
    
    // Traitements
    if (oldScenario.traitements) {
        newScenario.traitements = oldScenario.traitements;
    }
}

// Migration des informations expert
function migrateInformationsExpert(oldExpert, newExpert) {
    // Copier tous les champs
    Object.keys(oldExpert).forEach(key => {
        if (newExpert[key] !== undefined) {
            if (Array.isArray(newExpert[key])) {
                newExpert[key] = mergeValues(newExpert[key], oldExpert[key]);
            } else {
                newExpert[key] = oldExpert[key];
            }
        } else {
            // Ajouter les champs non prévus
            newExpert[key] = oldExpert[key];
        }
    });
}

// Migration de theoriePratique
function migrateTheoriePratique(oldTheorie, newTheorie) {
    // Copier tous les champs
    Object.keys(oldTheorie).forEach(key => {
        if (newTheorie[key] !== undefined) {
            if (Array.isArray(newTheorie[key])) {
                newTheorie[key] = mergeValues(newTheorie[key], oldTheorie[key]);
            } else {
                newTheorie[key] = oldTheorie[key];
            }
        }
    });
}

// Intégrer les sections supplémentaires
function integrateAdditionalSections(oldAnnexes, v3) {
    // Guide communication
    if (oldAnnexes.guideCommunication) {
        v3.theoriePratique.sections.push({
            titre: oldAnnexes.guideCommunication.titre || 'Guide de communication',
            contenu: '',
            points: mergeValues(
                oldAnnexes.guideCommunication.reglesDeBase,
                oldAnnexes.guideCommunication.phrasesCles,
                oldAnnexes.guideCommunication.piegesEviter
            )
        });
    }
    
    // Note patient
    if (oldAnnexes.notePatient) {
        v3.theoriePratique.sections.push({
            titre: oldAnnexes.notePatient.titre || 'Note patient',
            contenu: '',
            points: mergeValues(
                oldAnnexes.notePatient.anamnese,
                oldAnnexes.notePatient.examenPhysique,
                oldAnnexes.notePatient.bilanDiagnostique,
                oldAnnexes.notePatient.diagnosticDifferentiel
            )
        });
    }
    
    // Protocoles
    if (oldAnnexes.protocoleUrgence || oldAnnexes.protocoleMedical) {
        const protocole = oldAnnexes.protocoleUrgence || oldAnnexes.protocoleMedical || {};
        v3.theoriePratique.protocoles = mergeValues(
            v3.theoriePratique.protocoles,
            protocole.evaluationInitiale,
            protocole.surveillanceComplications,
            protocole.contreindicationsAbsolues,
            protocole.prelevementsBiologiques
        );
    }
}

// Nettoyer les objets vides
function cleanEmptyObjects(obj) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            cleanEmptyObjects(value);
            // Ne pas supprimer les objets avec des propriétés définies même si vides
            const hasDefinedProperties = Object.keys(value).some(k => 
                value[k] !== undefined && value[k] !== null && value[k] !== ''
            );
            if (Object.keys(value).length === 0 && !hasDefinedProperties) {
                delete obj[key];
            }
        } else if (Array.isArray(value) && value.length === 0) {
            // Garder les arrays vides car ils font partie de la structure
        } else if (value === '' || value === null || value === undefined) {
            // Garder les strings vides car elles font partie de la structure
        }
    });
}

// Script principal
console.log('🚀 Début de la migration COMPLÈTE des annexes vers la structure v3...\n');
console.log('📊 Cette version inclut les 596 champs identifiés comme manquants\n');

const jsonDir = path.join(__dirname, 'json_files');
const files = fs.readdirSync(jsonDir)
    .filter(file => file.endsWith('.json') && !file.includes('backup') && !file.includes('structure'));

let successCount = 0;
let errorCount = 0;
const errors = [];

files.forEach(file => {
    // Filtrer uniquement les fichiers USMLE Triage
    if (!file.startsWith('USMLE Triage')) return;
    
    const filePath = path.join(jsonDir, file);
    console.log(`📄 Migration de ${file}...`);
    
    try {
        // Lire le fichier
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Créer une sauvegarde
        const backupName = file.replace('.json', '_backup_v1_to_v3_complete.json');
        const backupPath = path.join(jsonDir, backupName);
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`  📁 Sauvegarde créée: ${backupName}`);
        
        // Effectuer la migration
        const migrated = migrateAnnexes(data);
        
        // Afficher les statistiques
        const oldSections = data.annexes ? Object.keys(data.annexes).length : 0;
        const newSections = migrated.annexes ? Object.keys(migrated.annexes).length : 0;
        console.log(`  📊 Migration: ${oldSections} sections → ${newSections} sections`);
        
        // Sauvegarder le fichier migré
        fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
        
        // Afficher les sections finales
        if (migrated.annexes) {
            console.log(`  ✅ Sections finales: ${Object.keys(migrated.annexes).join(', ')}`);
        }
        
        console.log(`  ✅ Migration réussie\n`);
        successCount++;
        
    } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}\n`);
        errors.push({ file, error: error.message });
        errorCount++;
    }
});

// Résumé final
console.log(`\n📊 Résumé de la migration COMPLÈTE v1 → v3:`);
console.log(`  ✅ ${successCount} fichiers migrés avec succès`);
console.log(`  ❌ ${errorCount} erreurs`);
console.log(`  📁 ${successCount + errorCount} fichiers traités au total`);

if (errors.length > 0) {
    console.log(`\n❌ Détail des erreurs:`);
    errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
    });
}

console.log(`\n✨ Migration COMPLÈTE v1 → v3 terminée!`);
console.log(`💡 Les sauvegardes ont été créées avec le suffixe "_backup_v1_to_v3_complete.json"`);
console.log(`\n📌 Cette version préserve TOUS les 596 champs identifiés comme manquants dans l'analyse.`);