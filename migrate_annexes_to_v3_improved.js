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

// Fonction de migration principale
function migrateAnnexes(data) {
    // Structure v3 initiale
    const v3 = {
        informationsExpert: {},
        scenarioPatienteStandardisee: {
            identite: {},
            motifConsultation: {},
            histoire: {
                caracteristiques: {},
                facteursModulateurs: {
                    ameliorants: [],
                    aggravants: []
                },
                traitements: {}
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
                ORL: []
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
                vaccinations: ''
            },
            medicaments: {
                actuels: [],
                observance: '',
                effetsSecondaires: []
            },
            antecedentsGynecologiques: {},
            antecedentsFamiliaux: {},
            habitudes: {},
            contextePsychoSocial: {},
            simulation: {
                comportement: [],
                reponses: [],
                defis: [],
                nonVerbal: []
            }
        },
        theoriePratique: {
            sections: []
        }
    };

    // Sources annexes
    const oldAnnexes = data.annexes || {};
    const oldScenario = oldAnnexes.scenarioPatienteStandardisee || {};
    
    // === INFORMATIONS EXPERT ===
    const oldExpert = oldAnnexes.informationsExpert || {};
    Object.assign(v3.informationsExpert, {
        titre: oldExpert.titre || '',
        dossierMedical: oldExpert.dossierMedical || '',
        interventionsQuestions: mergeValues(
            oldExpert.interventionsQuestions,
            oldExpert.rolesInterventions
        ),
        pointsCles: mergeValues(
            oldExpert.pointsCles,
            oldExpert.pointsClés
        ),
        pieges: mergeValues(
            oldExpert.pieges,
            oldExpert.pièges
        ),
        defis: mergeValues(
            oldExpert.defis,
            oldExpert.défis,
            oldExpert.defisSpecifiques
        ),
        objectifsApprentissage: mergeValues(
            oldExpert.objectifsApprentissage,
            oldExpert.objetifsApprentissage,
            oldExpert.objectifsPedagogiques
        ),
        diagnosticDifferentiel: oldExpert.diagnosticDifferentiel || [],
        urgences: mergeValues(
            oldExpert.urgences,
            oldExpert.urgencesMedicales,
            oldExpert.urgencesObstetricales
        ),
        signesAlarme: mergeValues(
            oldExpert.signesAlarme,
            oldExpert.symptomesAlarme
        ),
        facteursRisques: mergeValues(
            oldExpert.facteursRisques,
            oldExpert.factrisques
        ),
        techniques: mergeValues(
            oldExpert.techniques,
            oldExpert.techniqueEvaluation,
            oldExpert.techniquesGestion
        ),
        priseEnCharge: mergeValues(
            oldExpert.priseEnCharge,
            oldExpert.prisEnCharge
        ),
        bonnesPratiques: oldExpert.bonnesPratiques || []
    });

    // Résultats laboratoire
    if (oldExpert.resultatsLaboratoire) {
        v3.informationsExpert.resultatsLaboratoire = oldExpert.resultatsLaboratoire;
    }

    // === SCENARIO PATIENT STANDARDISE ===
    const newScenario = v3.scenarioPatienteStandardisee;
    
    // Titre
    newScenario.titre = oldScenario.titre || '';
    
    // Identité
    newScenario.identite = {
        nom: oldScenario.nom || '',
        age: oldScenario.age || '',
        sexe: oldScenario.sexe || '',
        origine: oldScenario.origine || '',
        profession: getNestedProperty(oldScenario, 'informationsPersonnelles.profession') || '',
        etatCivil: getNestedProperty(oldScenario, 'informationsPersonnelles.etatCivil') || '',
        enfants: getNestedProperty(oldScenario, 'informationsPersonnelles.enfants') || ''
    };

    // Contexte
    newScenario.contexte = oldScenario.contexte || '';

    // Motif consultation
    newScenario.motifConsultation = {
        plaintePrincipale: getNestedProperty(oldScenario, 'motifConsultation.plaintePrincipale') || '',
        urgence: getNestedProperty(oldScenario, 'motifConsultation.urgence') || '',
        inquietudes: mergeValues(
            getNestedProperty(oldScenario, 'motifConsultation.inquietudes'),
            getNestedProperty(oldScenario, 'motifConsultation.inquietude'),
            getNestedProperty(oldScenario, 'inquietudes.principales')
        ),
        demandes: mergeValues(
            getNestedProperty(oldScenario, 'motifConsultation.demandes'),
            getNestedProperty(oldScenario, 'motifConsultation.autreChose')
        ),
        attentes: getNestedProperty(oldScenario, 'motifConsultation.attentes') || []
    };

    // Consignes
    newScenario.consignes = oldScenario.consignes || [];

    // Histoire - Migration améliorée
    if (oldScenario.histoireActuelle) {
        const ha = oldScenario.histoireActuelle;
        
        newScenario.histoire.debut = firstNonEmpty(
            ha.debut,
            ha.dateDebut,
            ha.debutSymptomes
        );
        
        newScenario.histoire.evolution = mergeValues(
            ha.evolution,
            ha.evolutionDouleur,
            ha.evolutionSymptomes
        );
        
        newScenario.histoire.contexte = firstNonEmpty(
            ha.contexte,
            ha.circonstances
        );
        
        newScenario.histoire.facteursDeclenchants = mergeValues(
            ha.facteursDeclenchants,
            ha.declencheurs
        );
        
        // Caractéristiques complètes
        newScenario.histoire.caracteristiques = {
            localisation: mergeValues(ha.localisation),
            irradiation: mergeValues(ha.irradiation),
            type: firstNonEmpty(ha.type, ha.typeDouleur),
            qualite: firstNonEmpty(ha.qualite, ha.caractereDouleur),
            intensite: firstNonEmpty(ha.intensite, ha.severite),
            frequence: firstNonEmpty(ha.frequence),
            duree: firstNonEmpty(ha.duree)
        };
        
        // Facteurs modulateurs
        newScenario.histoire.facteursModulateurs.ameliorants = mergeValues(
            ha.amelioration,
            ha.soulagement,
            ha.facteursAmeliorants
        );
        
        newScenario.histoire.facteursModulateurs.aggravants = mergeValues(
            ha.aggravation,
            ha.facteursAggravants
        );
        
        // Traitements
        newScenario.histoire.traitements = {
            essayes: mergeValues(ha.traitementsEssayes, ha.medicaments),
            efficacite: firstNonEmpty(ha.efficaciteTraitements),
            actuels: mergeValues(ha.traitementsActuels)
        };
        
        // NOUVEAUX CHAMPS AJOUTÉS
        // Gestion des crises (cas arthrite/goutte)
        if (ha.conceptCrises || ha.descriptionCrise || ha.crise) {
            newScenario.histoire.crises = {
                concept: ha.conceptCrises || [],
                description: ha.descriptionCrise || [],
                intensite: ha.crise || '',
                interCrise: ha.interCrise || [],
                douleurFond: ha.douleurFond || []
            };
        }
        
        // Symptômes associés de l'histoire actuelle
        if (ha.symptomesAssocies || ha.symptomePrincipal) {
            newScenario.histoire.symptomesHistoire = mergeValues(
                ha.symptomesAssocies,
                ha.symptomePrincipal
            );
        }
        
        // Autres éléments spécifiques
        if (ha.fievre) newScenario.histoire.fievre = ha.fievre;
        if (ha.toux) newScenario.histoire.toux = ha.toux;
        if (ha.fatigue) newScenario.histoire.fatigue = ha.fatigue;
        if (ha.vomissements) newScenario.histoire.vomissements = ha.vomissements;
        if (ha.diarrhee) newScenario.histoire.diarrhee = ha.diarrhee;
        if (ha.troublesSommeil) newScenario.histoire.troublesSommeil = ha.troublesSommeil;
        if (ha.traumatisme) newScenario.histoire.traumatisme = ha.traumatisme;
        if (ha.decouverte) newScenario.histoire.decouverte = ha.decouverte;
        if (ha.impact) newScenario.histoire.impact = ha.impact;
        if (ha.attitude) newScenario.histoire.attitude = ha.attitude;
    }

    // Migration des symptômes associés
    migrateSymptomesAssocies(oldAnnexes, oldScenario, newScenario.symptomesAssocies);
    
    // Migration de l'anamnèse systématique
    migrateAnamneseSystemique(oldAnnexes, oldScenario, newScenario.anamnèseSystemique);
    
    // Migration des antécédents médicaux
    migrateAntecedentsMedicaux(oldAnnexes, oldScenario, newScenario.antecedentsMedicaux);
    
    // Migration des médicaments
    migrateMedicaments(oldAnnexes, oldScenario, newScenario.medicaments);

    // Antécédents gynécologiques
    if (oldScenario.histoireGynecologique || oldScenario.antecedentsGynecologiques) {
        const gyneco = oldScenario.histoireGynecologique || oldScenario.antecedentsGynecologiques || {};
        newScenario.antecedentsGynecologiques = {
            menarche: gyneco.menarche || '',
            cycles: gyneco.cycles || gyneco.cycleMenstruel || '',
            dernieresRegles: gyneco.dernieresRegles || '',
            contraception: mergeValues(gyneco.contraception),
            grossesses: gyneco.grossesses || gyneco.accouchements || '',
            ist: mergeValues(gyneco.ist, gyneco.infections)
        };
    }

    // Antécédents familiaux
    const af = oldScenario.antecedentsFamiliaux || {};
    if (Object.keys(af).length > 0) {
        newScenario.antecedentsFamiliaux = {
            mere: af.mere || '',
            pere: af.pere || '',
            fratrie: mergeValues(af.fratrie, af.freres, af.soeurs, af.frere).join(', '),
            maladies: mergeValues(
                af.cardiovasculaire,
                af.cancers,
                af.metabolique,
                af.psychiatriques,
                af.mortsSubites,
                af.diabete,
                af.autres
            )
        };
    }

    // Habitudes simplifiées
    newScenario.habitudes = {};
    migrateHabitudes(oldAnnexes, oldScenario, newScenario.habitudes);

    // Contexte psychosocial
    newScenario.contextePsychoSocial = {};
    migrateContextePsychoSocial(oldAnnexes, oldScenario, newScenario.contextePsychoSocial);

    // Simulation simplifiée
    if (oldScenario.simulation) {
        const sim = oldScenario.simulation;
        newScenario.simulation = {
            comportement: mergeValues(
                sim.comportement,
                sim.attitude,
                sim.personnalite,
                sim.communicationNonVerbale
            ),
            reponses: mergeValues(
                sim.reponses,
                sim.reponsesTitypiques,
                sim.reponsesTypiques
            ),
            defis: mergeValues(
                sim.defis,
                sim.difficultesSimulation,
                sim.communicationDifficile
            ),
            nonVerbal: mergeValues(
                sim.nonVerbal,
                sim.signesPhysiques,
                sim.examenPhysique,
                sim.durantExamen,
                sim.durantEntretien,
                sim.durantConsultation
            )
        };
        
        // Ajouter la coopération médicale si présente
        if (sim.cooperationMedicale) {
            newScenario.simulation.reponses.push(...sim.cooperationMedicale);
        }
    }

    // Drapeaux rouges
    newScenario.drapeauxRouges = mergeValues(
        oldScenario.drapeauxRouges,
        oldScenario.signesAlarme
    );
    
    // Si drapeauxRouges est un objet avec propriétés
    if (oldScenario.drapeauxRouges && typeof oldScenario.drapeauxRouges === 'object' && !Array.isArray(oldScenario.drapeauxRouges)) {
        const dr = oldScenario.drapeauxRouges;
        const drapeauxList = [];
        if (dr.vessie) drapeauxList.push(`Vessie: ${dr.vessie}`);
        if (dr.intestins) drapeauxList.push(`Intestins: ${dr.intestins}`);
        if (dr.oedeme) drapeauxList.push(`Œdème: ${dr.oedeme}`);
        if (dr.fievre) drapeauxList.push(`Fièvre: ${dr.fievre}`);
        if (dr.poidsPerte) drapeauxList.push(`Perte de poids: ${dr.poidsPerte}`);
        if (dr.sensibilite) drapeauxList.push(`Sensibilité: ${dr.sensibilite}`);
        newScenario.drapeauxRouges = drapeauxList;
    }

    // Informations supplémentaires
    newScenario.informationsSupplementaires = mergeValues(
        oldScenario.informationsSupplementaires,
        oldScenario.notesSupplementaires
    );

    // === THEORIE PRATIQUE ===
    const oldTheorie = oldAnnexes.theoriePratique || {};
    Object.assign(v3.theoriePratique, {
        titre: oldTheorie.titre || '',
        sections: oldTheorie.sections || [],
        rappelsTherapeutiques: oldTheorie.rappelsTherapeutiques || [],
        examensComplementaires: oldTheorie.examensComplementaires || [],
        diagnosticDifferentiel: oldTheorie.diagnosticDifferentiel || [],
        priseEnCharge: oldTheorie.priseEnCharge || [],
        protocoles: oldTheorie.protocoles || [],
        guidePratique: oldTheorie.guidePratique || [],
        ressources: oldTheorie.ressources || []
    });

    // Intégrer les sections supplémentaires dans theoriePratique
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

    if (oldAnnexes.notePatient) {
        v3.theoriePratique.sections.push({
            titre: oldAnnexes.notePatient.titre || 'Note patient',
            contenu: '',
            points: mergeValues(
                oldAnnexes.notePatient.anamnese,
                oldAnnexes.notePatient.examenPhysique,
                oldAnnexes.notePatient.bilanDiagnostique
            )
        });
    }

    if (oldAnnexes.protocoleUrgence || oldAnnexes.protocoleMedical) {
        const protocole = oldAnnexes.protocoleUrgence || oldAnnexes.protocoleMedical || {};
        v3.theoriePratique.protocoles = mergeValues(
            v3.theoriePratique.protocoles,
            protocole.evaluationInitiale,
            protocole.surveillanceComplications,
            protocole.contreindicationsAbsolues
        );
    }

    // Nettoyer les objets vides
    cleanEmptyObjects(v3);

    // Retourner la nouvelle structure
    return {
        ...data,
        annexes: v3
    };
}

// Fonctions de migration spécialisées
function migrateSymptomesAssocies(oldAnnexes, oldScenario, symptomesAssocies) {
    const sources = [
        oldScenario.symptomesAssocies,
        oldScenario.revueSystemes,
        oldScenario.symptomesNegatifs
    ];

    sources.forEach(source => {
        if (!source) return;
        
        // Mapper les symptômes vers les bonnes catégories
        if (source.generaux || source.general || source.systemiques) {
            symptomesAssocies.generaux.push(...mergeValues(source.generaux, source.general, source.systemiques));
        }
        if (source.neurologiques || source.neurologique) {
            symptomesAssocies.neurologiques.push(...mergeValues(source.neurologiques, source.neurologique));
        }
        if (source.cardiovasculaires || source.cardiovasculaire) {
            symptomesAssocies.cardiovasculaires.push(...mergeValues(source.cardiovasculaires, source.cardiovasculaire));
        }
        if (source.respiratoires || source.respiratoire) {
            symptomesAssocies.respiratoires.push(...mergeValues(source.respiratoires, source.respiratoire));
        }
        if (source.digestifs || source.digestif) {
            symptomesAssocies.digestifs.push(...mergeValues(source.digestifs, source.digestif));
        }
        if (source.urinaires || source.urinaire || source.genitourinaire) {
            symptomesAssocies.urinaires.push(...mergeValues(source.urinaires, source.urinaire, source.genitourinaire));
        }
        if (source.gynecologiques || source.gynecologique) {
            symptomesAssocies.gynecologiques.push(...mergeValues(source.gynecologiques, source.gynecologique));
        }
        if (source.musculosquelettiques || source.osteoArticulaire || source.musculosquelettique) {
            symptomesAssocies.musculosquelettiques.push(...mergeValues(source.musculosquelettiques, source.osteoArticulaire, source.musculosquelettique));
        }
        if (source.dermatologiques || source.cutanes) {
            symptomesAssocies.dermatologiques.push(...mergeValues(source.dermatologiques, source.cutanes));
        }
        if (source.psychiatriques || source.psychiatrique) {
            symptomesAssocies.psychiatriques.push(...mergeValues(source.psychiatriques, source.psychiatrique));
        }
        if (source.ORL || source.orl) {
            symptomesAssocies.ORL.push(...mergeValues(source.ORL, source.orl));
        }
        
        // Ajouter les symptômes spécifiques
        if (source.fievre) symptomesAssocies.generaux.push(`Fièvre: ${source.fievre}`);
        if (source.douleurs) symptomesAssocies.musculosquelettiques.push(...mergeValues(source.douleurs));
        if (source.locaux) symptomesAssocies.musculosquelettiques.push(...mergeValues(source.locaux));
        if (source.autresArticulations) symptomesAssocies.musculosquelettiques.push(...mergeValues(source.autresArticulations));
        if (source.synchronisme) symptomesAssocies.musculosquelettiques.push(`Synchronisme: ${source.synchronisme}`);
    });
}

function migrateAnamneseSystemique(oldAnnexes, oldScenario, anamneseSystemique) {
    const sources = [
        getNestedProperty(oldScenario, 'anamneseSystemes'),
        getNestedProperty(oldScenario, 'revueSystemes'),
        getNestedProperty(oldScenario, 'anamneseSystemique')
    ];

    sources.forEach(source => {
        if (!source) return;
        
        if (source.generale) anamneseSystemique.generale.push(...mergeValues(source.generale));
        if (source.neurologique) anamneseSystemique.neurologique.push(...mergeValues(source.neurologique));
        if (source.cardiovasculaire) anamneseSystemique.cardiovasculaire.push(...mergeValues(source.cardiovasculaire));
        if (source.respiratoire || source.pulmonaire) {
            anamneseSystemique.respiratoire.push(...mergeValues(source.respiratoire, source.pulmonaire));
        }
        if (source.digestive) anamneseSystemique.digestive.push(...mergeValues(source.digestive));
        if (source.urinaire || source.genitourinaire) {
            anamneseSystemique.urinaire.push(...mergeValues(source.urinaire, source.genitourinaire));
        }
        if (source.gynecologique) anamneseSystemique.gynecologique.push(...mergeValues(source.gynecologique));
        if (source.dermatologique) anamneseSystemique.dermatologique.push(...mergeValues(source.dermatologique));
        if (source.musculosquelettique || source.osteoArticulaire) {
            anamneseSystemique.musculosquelettique.push(...mergeValues(source.musculosquelettique, source.osteoArticulaire));
        }
        if (source.psychiatrique) anamneseSystemique.psychiatrique.push(...mergeValues(source.psychiatrique));
    });
}

function migrateAntecedentsMedicaux(oldAnnexes, oldScenario, antecedentsMedicaux) {
    // Collecter toutes les sources d'antécédents
    const sources = [
        oldScenario.antecedents,
        oldScenario.antecedentsMedicaux,
        oldScenario.antecedentsEnfant
    ];
    
    const maladies = [];
    const hospitalisations = [];
    const chirurgies = [];
    const traumatismes = [];
    const allergies = [];
    
    sources.forEach(source => {
        if (!source) return;
        
        // Maladies
        if (source.medicaux) maladies.push(...mergeValues(source.medicaux));
        if (source.medical) maladies.push(...mergeValues(source.medical));
        if (source.maladies) maladies.push(...mergeValues(source.maladies));
        if (source.pathologies) maladies.push(...mergeValues(source.pathologies));
        
        // Conditions spécifiques
        if (source.hta) maladies.push('HTA');
        if (source.diabete) maladies.push('Diabète');
        if (source.dyslipidemie) maladies.push('Dyslipidémie');
        if (source.bpco) maladies.push('BPCO');
        if (source.depression) maladies.push('Dépression');
        if (source.anxiete) maladies.push('Anxiété');
        if (source.fibromyalgie) maladies.push('Fibromyalgie');
        if (source.demence) maladies.push('Démence');
        if (source.goutte) maladies.push('Goutte');
        if (source.cardiovasculaire || source.cardiovasculaires || source.cardiaque) {
            maladies.push(...mergeValues(source.cardiovasculaire, source.cardiovasculaires, source.cardiaque));
        }
        if (source.respiratoire) maladies.push(...mergeValues(source.respiratoire));
        if (source.digestif || source.digestifs) maladies.push(...mergeValues(source.digestif, source.digestifs));
        if (source.gynecologiques) maladies.push(...mergeValues(source.gynecologiques));
        
        // Chirurgies
        if (source.chirurgicaux) chirurgies.push(...mergeValues(source.chirurgicaux));
        if (source.chirurgie) chirurgies.push(...mergeValues(source.chirurgie));
        if (source.chirurgical) chirurgies.push(...mergeValues(source.chirurgical));
        if (source.Procédures) chirurgies.push(...mergeValues(source.Procédures));
        
        // Hospitalisations
        if (source.hospitalisations) hospitalisations.push(...mergeValues(source.hospitalisations));
        if (source.Consultations) hospitalisations.push(...mergeValues(source.Consultations));
        
        // Traumatismes
        if (source.traumatiques) traumatismes.push(...mergeValues(source.traumatiques));
        if (source.traumatismes) traumatismes.push(...mergeValues(source.traumatismes));
        
        // Allergies
        if (source.allergies) allergies.push(...mergeValues(source.allergies));
        if (source.medicamenteuses) allergies.push(...mergeValues(source.medicamenteuses));
    });
    
    // Ajouter les allergies du niveau racine
    if (oldScenario.allergies) {
        if (typeof oldScenario.allergies === 'object') {
            if (oldScenario.allergies.medicamenteuses) {
                allergies.push(...mergeValues(oldScenario.allergies.medicamenteuses));
            }
        } else {
            allergies.push(...mergeValues(oldScenario.allergies));
        }
    }
    
    // Assigner les valeurs finales
    antecedentsMedicaux.maladies = [...new Set(maladies)]; // Enlever les doublons
    antecedentsMedicaux.hospitalisations = hospitalisations;
    antecedentsMedicaux.chirurgies = chirurgies;
    antecedentsMedicaux.traumatismes = traumatismes;
    antecedentsMedicaux.allergies = allergies;
    
    // Vaccinations
    const vaccinations = firstNonEmpty(
        getNestedProperty(oldScenario, 'antecedents.vaccinations'),
        getNestedProperty(oldScenario, 'antecedentsMedicaux.vaccinations')
    );
    antecedentsMedicaux.vaccinations = vaccinations;
}

function migrateMedicaments(oldAnnexes, oldScenario, medicaments) {
    const actuels = [];
    const effetsSecondaires = [];
    
    // Sources de médicaments
    const sources = [
        oldScenario.traitements,
        oldScenario.medicaments,
        oldScenario.medicamentsSupplements,
        getNestedProperty(oldScenario, 'antecedents.medicaments'),
        getNestedProperty(oldScenario, 'antecedentsMedicaux.medicaments'),
        getNestedProperty(oldScenario, 'habitudes.medicaments')
    ];
    
    sources.forEach(source => {
        if (!source) return;
        
        if (source.actuels) actuels.push(...mergeValues(source.actuels));
        if (source.medicaments) actuels.push(...mergeValues(source.medicaments));
        if (source.supplements) actuels.push(...mergeValues(source.supplements));
        if (source.insuline) actuels.push('Insuline');
        if (source.autresMedicaments) actuels.push(...mergeValues(source.autresMedicaments));
        
        if (source.effetsSecondaires) effetsSecondaires.push(...mergeValues(source.effetsSecondaires));
        if (source.iatrogenes) effetsSecondaires.push(...mergeValues(source.iatrogenes));
    });
    
    // Si c'est juste un array ou string
    if (Array.isArray(oldScenario.medicaments)) {
        actuels.push(...oldScenario.medicaments);
    } else if (typeof oldScenario.medicaments === 'string') {
        actuels.push(oldScenario.medicaments);
    }
    
    medicaments.actuels = actuels;
    medicaments.observance = firstNonEmpty(
        getNestedProperty(oldScenario, 'traitements.observance'),
        getNestedProperty(oldScenario, 'medicaments.observance')
    );
    medicaments.effetsSecondaires = effetsSecondaires;
}

function migrateHabitudes(oldAnnexes, oldScenario, habitudes) {
    // Sources multiples
    const sources = [
        oldScenario.habitudes,
        oldScenario.habitudesVie,
        oldAnnexes.habitudesVie
    ];

    sources.forEach(source => {
        if (!source) return;
        
        // Tabac
        if (source.tabac) habitudes.tabac = typeof source.tabac === 'string' ? source.tabac : JSON.stringify(source.tabac);
        if (source.tabagisme) habitudes.tabac = JSON.stringify(source.tabagisme);
        
        // Alcool
        if (source.alcool) habitudes.alcool = typeof source.alcool === 'string' ? source.alcool : JSON.stringify(source.alcool);
        if (source.cage || source.cageResponses) {
            const cageInfo = source.cage || source.cageResponses;
            if (habitudes.alcool) {
                habitudes.alcool += ` CAGE: ${typeof cageInfo === 'string' ? cageInfo : JSON.stringify(cageInfo)}`;
            } else {
                habitudes.alcool = `CAGE: ${typeof cageInfo === 'string' ? cageInfo : JSON.stringify(cageInfo)}`;
            }
        }
        
        // Stupéfiants
        if (source.drogues || source.stupefiants || source.toxiques) {
            habitudes.stupefiants = source.drogues || source.stupefiants || JSON.stringify(source.toxiques);
        }
        
        // Activité
        if (source.activite || source.activitePhysique || source.exercice || source.sport) {
            habitudes.activite = source.activite || source.activitePhysique || source.exercice || source.sport;
        }
        
        // Alimentation
        if (source.alimentation) habitudes.alimentation = typeof source.alimentation === 'string' ? source.alimentation : JSON.stringify(source.alimentation);
        
        // Sommeil
        if (source.sommeil) habitudes.sommeil = typeof source.sommeil === 'string' ? source.sommeil : JSON.stringify(source.sommeil);
        
        // Sexualité
        if (source.sexualite || source.activite_sexuelle || source.sexuels || source.activiteSexuelle) {
            habitudes.sexualite = source.sexualite || source.activite_sexuelle || source.sexuels || source.activiteSexuelle;
        }
        
        // Caféine
        if (source.cafe || source.cafeine) habitudes.cafeine = source.cafe || source.cafeine;
    });
    
    // Intégrer l'histoire sexuelle
    if (oldScenario.historieSexuelle || oldScenario.histoireSexuelle) {
        const hs = oldScenario.historieSexuelle || oldScenario.histoireSexuelle;
        if (hs.activite) habitudes.sexualite = hs.activite;
        if (hs.contraception) habitudes.sexualite = (habitudes.sexualite || '') + ` Contraception: ${hs.contraception}`;
        if (hs.statut || hs.relation) {
            habitudes.sexualite = (habitudes.sexualite || '') + ` Statut: ${hs.statut || hs.relation}`;
        }
    }
}

function migrateContextePsychoSocial(oldAnnexes, oldScenario, contextePsychoSocial) {
    // Profession
    contextePsychoSocial.profession = firstNonEmpty(
        getNestedProperty(oldScenario, 'informationsPersonnelles.profession'),
        getNestedProperty(oldScenario, 'contexteSocial.profession'),
        getNestedProperty(oldScenario, 'contexteFamilial.profession')
    );
    
    // Habitat
    contextePsychoSocial.habitat = firstNonEmpty(
        getNestedProperty(oldScenario, 'contexteSocial.logement'),
        getNestedProperty(oldScenario, 'contexteSocial.habitat')
    );
    
    // Famille
    contextePsychoSocial.famille = firstNonEmpty(
        getNestedProperty(oldScenario, 'contexteSocial.famille'),
        getNestedProperty(oldScenario, 'contexteFamilial.famille'),
        getNestedProperty(oldScenario, 'contexteSocial.enfants')
    );
    
    // Économique
    contextePsychoSocial.economique = firstNonEmpty(
        getNestedProperty(oldScenario, 'informationsPersonnelles.situationSocioEconomique'),
        getNestedProperty(oldAnnexes, 'contexteSocial.situation')
    );
    
    // Social
    contextePsychoSocial.social = firstNonEmpty(
        getNestedProperty(oldAnnexes, 'contexteSocial.isolement'),
        getNestedProperty(oldScenario, 'environnementSocial.activites'),
        getNestedProperty(oldScenario, 'contexteSocial.statut')
    );
    
    // Autonomie
    contextePsychoSocial.autonomie = firstNonEmpty(
        getNestedProperty(oldScenario, 'autonomieFonctionnelle'),
        getNestedProperty(oldScenario, 'contexteSocial.autonomie')
    );
    if (typeof contextePsychoSocial.autonomie === 'object') {
        contextePsychoSocial.autonomie = JSON.stringify(contextePsychoSocial.autonomie);
    }
    
    // Culturel
    contextePsychoSocial.culturel = firstNonEmpty(
        getNestedProperty(oldScenario, 'contexteCulturel'),
        getNestedProperty(oldScenario, 'informationsPersonnelles.origine')
    );
    if (typeof contextePsychoSocial.culturel === 'object') {
        contextePsychoSocial.culturel = JSON.stringify(contextePsychoSocial.culturel);
    }
    
    // Intégrer les éléments du contextePsychosocial
    if (oldScenario.contextePsychosocial) {
        const cps = oldScenario.contextePsychosocial;
        if (cps.deuil) contextePsychoSocial.social = (contextePsychoSocial.social || '') + ` Deuil: ${cps.deuil}`;
    }
}

// Nettoyer les objets vides
function cleanEmptyObjects(obj) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            cleanEmptyObjects(value);
            if (Object.keys(value).length === 0) {
                delete obj[key];
            }
        }
    });
}

// Script principal
console.log('🚀 Début de la migration améliorée des annexes vers la structure v3...\n');

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
        const backupName = file.replace('.json', '_backup_v1_to_v3_improved.json');
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
console.log(`\n📊 Résumé de la migration améliorée v1 → v3:`);
console.log(`  ✅ ${successCount} fichiers migrés avec succès`);
console.log(`  ❌ ${errorCount} erreurs`);
console.log(`  📁 ${successCount + errorCount} fichiers traités au total`);

if (errors.length > 0) {
    console.log(`\n❌ Détail des erreurs:`);
    errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
    });
}

console.log(`\n✨ Migration améliorée v1 → v3 terminée!`);
console.log(`💡 Les sauvegardes ont été créées avec le suffixe "_backup_v1_to_v3_improved.json"`);