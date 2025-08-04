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
            // Si c'est un objet, on le convertit en array
            result.push(value);
        }
    });
    return result.length > 0 ? result : [];
}

// Fonction pour obtenir la première valeur non vide
function firstNonEmpty(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '' && 
            (!Array.isArray(value) || value.length > 0)) {
            return value;
        }
    }
    return "";
}

// Fonction principale de migration
function migrateAnnexes(oldAnnexes) {
    const newAnnexes = {
        informationsExpert: {},
        scenarioPatienteStandardisee: {},
        theoriePratique: {}
    };

    // 1. Migrer informationsExpert (simplifiée)
    if (oldAnnexes.informationsExpert) {
        const oldInfo = oldAnnexes.informationsExpert;
        const newInfo = newAnnexes.informationsExpert;

        newInfo.titre = oldInfo.titre || "";
        newInfo.dossierMedical = oldInfo.dossierMedical || "";
        
        // Fusionner rolesInterventions et questionsExpert
        newInfo.interventionsQuestions = mergeValues(
            oldInfo.rolesInterventions,
            oldInfo.questionsExpert
        );
        
        newInfo.pointsCles = oldInfo.pointsCles || [];
        newInfo.pieges = oldInfo.pieges || [];
        
        // Fusionner tous les défis
        newInfo.defis = mergeValues(
            oldInfo.defisSpecifiques,
            oldInfo.defis
        );
        
        // Fusionner tous les objectifs
        newInfo.objectifsApprentissage = mergeValues(
            oldInfo.objectifsPedagogiques,
            oldInfo.objectifsApprentissage,
            oldInfo.objetifsApprentissage, // typo courante
            oldInfo.objectifsCommunication
        );
        
        newInfo.diagnosticDifferentiel = oldInfo.diagnosticDifferentiel || [];
        
        // Fusionner toutes les urgences
        newInfo.urgences = mergeValues(
            oldInfo.urgencesMedicales,
            oldInfo.urgencesObstetricales,
            oldInfo.urgences
        );
        
        // Fusionner tous les signes d'alarme
        newInfo.signesAlarme = mergeValues(
            oldInfo.signesAlarme,
            oldInfo.signesAlarmes, // avec 's'
            oldInfo.symptomesAlarme
        );
        
        // Fusionner facteurs de risque
        newInfo.facteursRisques = mergeValues(
            oldInfo.facteursRisques,
            oldInfo.factrisques // typo courante
        );
        
        // Fusionner toutes les techniques
        newInfo.techniques = mergeValues(
            oldInfo.techniquesGestion,
            oldInfo.techniquesEvaluation,
            oldInfo.techniques
        );
        
        // Fusionner prise en charge
        newInfo.priseEnCharge = mergeValues(
            oldInfo.priseEnCharge,
            oldInfo.prisEnCharge // typo courante
        );
        
        newInfo.bonnesPratiques = oldInfo.bonnesPratiques || [];
        
        // Résultats laboratoire
        if (oldInfo.resultatsLaboratoire) {
            newInfo.resultatsLaboratoire = oldInfo.resultatsLaboratoire;
        }
        
        // Gérer agentCaustique si présent
        if (oldInfo.agentCaustique && oldInfo.agentCaustique.length > 0) {
            newInfo.defis = [...(newInfo.defis || []), ...oldInfo.agentCaustique];
        }
    }

    // 2. Migrer scenarioPatienteStandardisee (simplifiée)
    const oldScenario = oldAnnexes.scenarioPatienteStandardisee || {};
    const newScenario = newAnnexes.scenarioPatienteStandardisee;

    newScenario.titre = oldScenario.titre || "";
    
    // Identité simplifiée
    newScenario.identite = {
        nom: oldScenario.nom || "",
        age: oldScenario.age || "",
        sexe: "",
        origine: getNestedProperty(oldScenario, 'informationsPersonnelles.origine') || "",
        profession: getNestedProperty(oldScenario, 'informationsPersonnelles.profession') || 
                    getNestedProperty(oldAnnexes, 'contexteSocial.profession') || "",
        etatCivil: getNestedProperty(oldScenario, 'informationsPersonnelles.etatCivil') || "",
        enfants: oldScenario.enfant || getNestedProperty(oldScenario, 'informationsPersonnelles.enfants') || ""
    };

    newScenario.contexte = oldScenario.contexte || "";
    
    // Motif de consultation simplifié
    if (oldScenario.motifConsultation) {
        const mc = oldScenario.motifConsultation;
        newScenario.motifConsultation = {
            plaintePrincipale: mc.plaintePrincipale || "",
            urgence: mc.urgence || "",
            inquietudes: mergeValues(mc.inquietude, mc.inquietudes, mc.inquietudeMere),
            demandes: mergeValues(mc.demande, mc.demandes),
            attentes: mergeValues(mc.orientation, mc.autreChose, mc.strategieManipulation, mc.frustrationMedicale)
        };
    }

    newScenario.consignes = oldScenario.consignes || [];

    // Histoire simplifiée (fusion de histoireMaladie et caracteristiquesSymptomePrincipal)
    if (oldScenario.histoireActuelle) {
        const ha = oldScenario.histoireActuelle;
        const mc = oldScenario.motifConsultation || {};
        
        newScenario.histoire = {
            debut: firstNonEmpty(ha.debut, ha.debutSymptomes, ha.debutDouleur, ha.debutPlainte, ha.evenementPrincipal),
            evolution: mergeValues(ha.evolution, ha.evolutionDouleur, ha.evolutionTemporelle),
            contexte: ha.contexte || "",
            facteursDeclenchants: mergeValues(ha.facteursDeclenchants, ha.evenementDeclenchant, ha.declencheurs),
            caracteristiques: {
                localisation: mergeValues(ha.localisation, ha.douleur),
                irradiation: ha.irradiation || [],
                type: ha.type || ha.caractereDouleur || "",
                qualite: ha.qualite || ha.caracteristiques || "",
                intensite: ha.intensite || ha.quantificationDouleur || "",
                frequence: ha.frequence || "",
                duree: mc.duree || ha.duree || ha.dureeEtCaractere || ""
            },
            facteursModulateurs: {
                ameliorants: mergeValues(ha.facteursAmeliorants, ha.amelioration, ha.soulagement),
                aggravants: mergeValues(ha.facteursAggravants, ha.aggravation, ha.facteurs)
            },
            traitements: {
                essayes: mergeValues(ha.traitementEssaye, ha.tentativesTraitement, ha.traitements, ha.interventionsEssayees),
                efficacite: ha.efficacite || ha.reponseTraitement || "",
                actuels: mergeValues(ha.traitementActuel, ha.gestionActuelle)
            }
        };

        // Caractéristiques de douleur supplémentaires
        if (oldScenario.caracteristiquesDouleur) {
            Object.assign(newScenario.histoire.caracteristiques, oldScenario.caracteristiquesDouleur);
        }
        if (oldScenario.douleurCaracteristiques) {
            Object.assign(newScenario.histoire.caracteristiques, oldScenario.douleurCaracteristiques);
        }
        if (oldScenario.douleurActuelle) {
            if (oldScenario.douleurActuelle.intensite) {
                newScenario.histoire.caracteristiques.intensite = oldScenario.douleurActuelle.intensite;
            }
            if (oldScenario.douleurActuelle.localisation) {
                newScenario.histoire.caracteristiques.localisation.push(oldScenario.douleurActuelle.localisation);
            }
        }
    }

    // Symptômes associés simplifiés
    newScenario.symptomesAssocies = {
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
    migrateSymptomesAssocies(oldAnnexes, oldScenario, newScenario.symptomesAssocies);

    // Anamnèse systémique
    newScenario.anamnèseSystemique = {
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
    };
    
    if (oldScenario.anamneseSystemes) {
        Object.keys(oldScenario.anamneseSystemes).forEach(key => {
            const normalizedKey = key.replace('genitourinaire', 'urinaire')
                                    .replace('osteoarticulaire', 'musculosquelettique')
                                    .replace('osteoArticulaire', 'musculosquelettique')
                                    .replace('pulmonaire', 'respiratoire');
            if (newScenario.anamnèseSystemique[normalizedKey] !== undefined) {
                newScenario.anamnèseSystemique[normalizedKey] = oldScenario.anamneseSystemes[key];
            }
        });
    }

    // Antécédents médicaux simplifiés
    newScenario.antecedentsMedicaux = {
        maladies: [],
        hospitalisations: [],
        chirurgies: [],
        traumatismes: [],
        allergies: [],
        vaccinations: ""
    };
    migrateAntecedentsMedicaux(oldAnnexes, oldScenario, newScenario.antecedentsMedicaux);

    // Médicaments
    newScenario.medicaments = {
        actuels: [],
        observance: "",
        effetsSecondaires: []
    };
    migrateMedicaments(oldAnnexes, oldScenario, newScenario.medicaments);

    // Antécédents gynécologiques
    if (oldScenario.antecedentsGynecologiques || oldScenario.histoireGynecologique) {
        const ag = oldScenario.antecedentsGynecologiques || oldScenario.histoireGynecologique;
        newScenario.antecedentsGynecologiques = {
            menarche: ag.menarche || "",
            cycles: ag.cycles || ag.cyclesMenstruels || ag.cycleMenstruel || "",
            dernieresRegles: firstNonEmpty(ag.dernieresRegles, getNestedProperty(oldScenario, 'histoireActuelle.dernieresRegles')),
            contraception: mergeValues(ag.contraception, getNestedProperty(oldScenario, 'historieSexuelle.contraception')),
            grossesses: ag.grossesses || ag.gestite || ag.obstetrique || "",
            ist: mergeValues(ag.ist, ag.mst, getNestedProperty(oldScenario, 'historieSexuelle.ist'))
        };
    }

    // Antécédents familiaux
    if (oldScenario.antecedentsFamiliaux || getNestedProperty(oldAnnexes, 'antecedents.familiaux')) {
        const af = oldScenario.antecedentsFamiliaux || {};
        newScenario.antecedentsFamiliaux = {
            mere: af.mere || "",
            pere: af.pere || "",
            fratrie: af.fratrie || af.frere || "",
            maladies: mergeValues(
                af.cardiovasculaire,
                af.cancers,
                af.metabolique,
                af.psychiatriques,
                af.mortsSubites
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
                sim.attitude,
                sim.attitudePatient,
                sim.personnalite,
                sim.durantEntretien,
                sim.durantConsultation
            ),
            reponses: mergeValues(
                sim.reponses,
                sim.reponsesTitypiques,
                sim.reponseAuxQuestions,
                sim.questionsAPoser
            ),
            defis: mergeValues(
                sim.defi,
                sim.phasesCritiques,
                sim.testsSpecifiques,
                sim.escaladeDesaccord
            ),
            nonVerbal: mergeValues(
                sim.examenPhysique,
                sim.durantExamen,
                sim.durantStatus,
                sim.signesAlerte
            )
        };
    }

    // Drapeaux rouges
    newScenario.drapeauxRouges = mergeValues(
        oldScenario.drapeauxRouges,
        oldScenario.signesAlerte,
        getNestedProperty(oldAnnexes, 'signesAlerte.contenu')
    );

    // Informations supplémentaires
    newScenario.informationsSupplementaires = mergeValues(
        oldScenario.informationADonner,
        oldScenario.notePatient,
        oldAnnexes.challenges,
        getNestedProperty(oldAnnexes, 'defi.description'),
        getNestedProperty(oldAnnexes, 'questionsEtReponses.challenges')
    );

    // 3. Migrer theoriePratique (simplifiée)
    if (oldAnnexes.theoriePratique) {
        const tp = oldAnnexes.theoriePratique;
        newAnnexes.theoriePratique = {
            titre: tp.titre || "",
            sections: tp.sections || [],
            rappelsTherapeutiques: tp.rappelsTherapeutiques || [],
            examensComplementaires: tp.examensComplementaires || [],
            diagnosticDifferentiel: mergeValues(
                tp.diagnosticDifferentiel,
                tp.examensDifferentiels,
                getNestedProperty(oldAnnexes, 'ddSection.categories')
            ),
            priseEnCharge: mergeValues(
                tp.priseEnCharge,
                getNestedProperty(oldAnnexes, 'therapySection.categories')
            ),
            protocoles: mergeValues(
                oldAnnexes.protocoleMedical,
                oldAnnexes.protocoleUrgence,
                oldAnnexes.guideCommunication
            ),
            guidePratique: mergeValues(
                getNestedProperty(oldAnnexes, 'techniquesSpeciales.contenu'),
                tp.guidePratique
            ),
            ressources: tp.ressources || []
        };
    }

    // Ajouter le tableau clinique et autres sections comme sections
    if (oldAnnexes.tableauClinique) {
        if (!newAnnexes.theoriePratique.sections) {
            newAnnexes.theoriePratique.sections = [];
        }
        newAnnexes.theoriePratique.sections.push({
            titre: oldAnnexes.tableauClinique.titre || "Tableau clinique",
            contenu: JSON.stringify(oldAnnexes.tableauClinique.contenu || []),
            points: []
        });
    }

    // 4. Nettoyer les objets vides
    cleanEmptyObjects(newAnnexes);

    return newAnnexes;
}

// Fonctions auxiliaires

function migrateSymptomesAssocies(oldAnnexes, oldScenario, symptomesAssocies) {
    // Map pour regrouper tous les symptômes par catégorie
    const symptomesMap = {
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

    // Collecter depuis histoireActuelle
    if (oldScenario.histoireActuelle) {
        const ha = oldScenario.histoireActuelle;
        
        // Généraux
        if (ha.fievre) symptomesMap.generaux.push(ha.fievre);
        if (ha.fatigue) symptomesMap.generaux.push(ha.fatigue);
        if (ha.perteDePoids) symptomesMap.generaux.push('Perte de poids: ' + ha.perteDePoids);
        if (ha.priseDePoids) symptomesMap.generaux.push('Prise de poids: ' + ha.priseDePoids);
        if (ha.symptomesConstitutionnels) symptomesMap.generaux.push(ha.symptomesConstitutionnels);
        if (ha.symptomesSystemiques) symptomesMap.generaux.push(ha.symptomesSystemiques);
        
        // Neurologiques
        if (ha.cephalees) symptomesMap.neurologiques.push(ha.cephalees);
        if (ha.vertiges) symptomesMap.neurologiques.push(ha.vertiges);
        if (ha.syncope) symptomesMap.neurologiques.push(ha.syncope);
        if (ha.convulsion || ha.convulsions) symptomesMap.neurologiques.push(ha.convulsion || ha.convulsions);
        if (ha.troublesMemoire || ha.troublesMnesiques) symptomesMap.neurologiques.push(ha.troublesMemoire || ha.troublesMnesiques);
        if (ha.troublesMarche) symptomesMap.neurologiques.push(ha.troublesMarche);
        
        // Cardiovasculaires
        if (ha.douleurThoracique) symptomesMap.cardiovasculaires.push(ha.douleurThoracique);
        if (ha.dyspnee || ha.dyspneeEffort) symptomesMap.cardiovasculaires.push(ha.dyspnee || ha.dyspneeEffort);
        if (ha.orthopnee) symptomesMap.cardiovasculaires.push(ha.orthopnee);
        if (ha.oedemes) symptomesMap.cardiovasculaires.push(ha.oedemes);
        
        // Respiratoires
        if (ha.toux) symptomesMap.respiratoires.push(ha.toux);
        if (ha.expectorations) symptomesMap.respiratoires.push(ha.expectorations);
        if (ha.essoufflement) symptomesMap.respiratoires.push(ha.essoufflement);
        
        // Digestifs
        if (ha.vomissements) symptomesMap.digestifs.push('Vomissements: ' + ha.vomissements);
        if (ha.diarrhee) symptomesMap.digestifs.push('Diarrhée: ' + ha.diarrhee);
        if (ha.douleurAbdominale) symptomesMap.digestifs.push(ha.douleurAbdominale);
        if (ha.sangDansLesSelles) symptomesMap.digestifs.push('Sang dans les selles: ' + ha.sangDansLesSelles);
        
        // Urinaires
        if (ha.symptomesUrinaires) symptomesMap.urinaires.push(ha.symptomesUrinaires);
        if (ha.dysurie) symptomesMap.urinaires.push('Dysurie: ' + ha.dysurie);
        if (ha.polyuriePolydipsie) symptomesMap.urinaires.push('Polyurie/polydipsie: ' + ha.polyuriePolydipsie);
        
        // Gynécologiques
        if (ha.troublesMenstruels) symptomesMap.gynecologiques.push(ha.troublesMenstruels);
        
        // Dermatologiques
        if (ha.eruption) symptomesMap.dermatologiques.push(ha.eruption);
        if (ha.ecchymoses) symptomesMap.dermatologiques.push(ha.ecchymoses);
        
        // Psychiatriques
        if (ha.anxiete) symptomesMap.psychiatriques.push('Anxiété: ' + ha.anxiete);
        if (ha.humeur) symptomesMap.psychiatriques.push('Humeur: ' + ha.humeur);
        if (ha.troublesSommeil) symptomesMap.psychiatriques.push(ha.troublesSommeil);
        
        // ORL
        if (ha.symptomesORL) symptomesMap.ORL.push(ha.symptomesORL);
        if (ha.perteAuditive) symptomesMap.ORL.push(ha.perteAuditive);
    }

    // Collecter depuis symptomesAssocies (scenario et racine)
    [oldScenario.symptomesAssocies, oldAnnexes.symptomesAssocies, oldAnnexes.symptomesGynecologiques].forEach(source => {
        if (!source) return;
        
        Object.keys(source).forEach(key => {
            const value = source[key];
            if (!value) return;
            
            // Mapper les clés vers les bonnes catégories
            let category = key;
            if (key === 'general' || key === 'generaux') category = 'generaux';
            else if (key === 'temperature') category = 'generaux';
            else if (key === 'digestif') category = 'digestifs';
            else if (key === 'urinaire') category = 'urinaires';
            else if (key === 'pertes' || key === 'saignements' || key === 'contractions') category = 'gynecologiques';
            
            if (symptomesMap[category]) {
                if (Array.isArray(value)) {
                    symptomesMap[category].push(...value);
                } else {
                    symptomesMap[category].push(value);
                }
            }
        });
    });

    // Assigner les valeurs finales
    Object.keys(symptomesMap).forEach(key => {
        symptomesAssocies[key] = symptomesMap[key];
    });
}

function migrateAntecedentsMedicaux(oldAnnexes, oldScenario, antecedentsMedicaux) {
    const maladies = [];
    const hospitalisations = [];
    const chirurgies = [];
    const traumatismes = [];
    const allergies = [];
    
    // Sources multiples
    const sources = [
        oldScenario.antecedentsMedicaux,
        oldScenario.antecedents,
        oldScenario.antecedentsPersonnels,
        oldAnnexes.antecedentsMedicaux,
        oldAnnexes.antecedents
    ];

    sources.forEach(source => {
        if (!source) return;
        
        // Collecter toutes les maladies
        ['cardiovasculaires', 'respiratoires', 'metaboliques', 'psychiatriques', 
         'digestifs', 'pathologies', 'medicaux', 'diabete', 'hta', 'bpco', 
         'dyslipidemie', 'sopk', 'depression', 'anxiete'].forEach(key => {
            if (source[key]) {
                if (Array.isArray(source[key])) {
                    maladies.push(...source[key]);
                } else {
                    maladies.push(source[key]);
                }
            }
        });
        
        // Hospitalisations
        if (source.hospitalisations) hospitalisations.push(...(Array.isArray(source.hospitalisations) ? source.hospitalisations : [source.hospitalisations]));
        
        // Chirurgies
        if (source.chirurgies || source.chirurgicaux) {
            const chir = source.chirurgies || source.chirurgicaux;
            if (Array.isArray(chir)) chirurgies.push(...chir);
            else if (chir) chirurgies.push(chir);
        }
        
        // Traumatismes
        if (source.traumatismes || source.traumatiques) {
            const trauma = source.traumatismes || source.traumatiques;
            if (Array.isArray(trauma)) traumatismes.push(...trauma);
            else if (trauma) traumatismes.push(trauma);
        }
        
        // Allergies
        if (source.allergies) {
            if (Array.isArray(source.allergies)) {
                allergies.push(...source.allergies);
            } else if (typeof source.allergies === 'string') {
                allergies.push(source.allergies);
            } else if (source.allergies.medicamenteuses) {
                allergies.push(...(Array.isArray(source.allergies.medicamenteuses) ? source.allergies.medicamenteuses : [source.allergies.medicamenteuses]));
            }
        }
    });

    antecedentsMedicaux.maladies = maladies;
    antecedentsMedicaux.hospitalisations = hospitalisations;
    antecedentsMedicaux.chirurgies = chirurgies;
    antecedentsMedicaux.traumatismes = traumatismes;
    antecedentsMedicaux.allergies = allergies;
    antecedentsMedicaux.vaccinations = getNestedProperty(oldScenario, 'antecedents.vaccinations') || "";
}

function migrateMedicaments(oldAnnexes, oldScenario, medicaments) {
    const actuels = [];
    const effetsSecondaires = [];
    
    // Sources multiples
    const sources = [
        oldScenario.medicaments,
        oldAnnexes.medicaments,
        oldAnnexes.traitements,
        oldAnnexes.medicamentsSupplements
    ];

    sources.forEach(source => {
        if (!source) return;
        
        // Médicaments actuels
        if (source.actuels) actuels.push(...(Array.isArray(source.actuels) ? source.actuels : [source.actuels]));
        if (source.chroniques) actuels.push(...(Array.isArray(source.chroniques) ? source.chroniques : [source.chroniques]));
        if (source.ponctuels) actuels.push(...(Array.isArray(source.ponctuels) ? source.ponctuels : [source.ponctuels]));
        if (source.supplements) actuels.push(...(Array.isArray(source.supplements) ? source.supplements : [source.supplements]));
        
        // Observance
        if (source.observance) medicaments.observance = source.observance;
        if (source.adherence) medicaments.observance = source.adherence;
        
        // Effets secondaires
        if (source.effetsSecondaires) effetsSecondaires.push(...(Array.isArray(source.effetsSecondaires) ? source.effetsSecondaires : [source.effetsSecondaires]));
    });

    medicaments.actuels = actuels;
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
        if (source.cage || source.cageResponses) habitudes.alcool += ` CAGE: ${source.cage || source.cageResponses}`;
        
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
    if (oldScenario.historieSexuelle) {
        const hs = oldScenario.historieSexuelle;
        const sexInfo = [];
        if (hs.orientation) sexInfo.push(`Orientation: ${hs.orientation}`);
        if (hs.partenaires) sexInfo.push(`Partenaires: ${hs.partenaires}`);
        if (hs.protection) sexInfo.push(`Protection: ${hs.protection}`);
        if (sexInfo.length > 0) {
            habitudes.sexualite = (habitudes.sexualite ? habitudes.sexualite + '; ' : '') + sexInfo.join(', ');
        }
    }
}

function migrateContextePsychoSocial(oldAnnexes, oldScenario, contextePsychoSocial) {
    // Profession
    contextePsychoSocial.profession = firstNonEmpty(
        getNestedProperty(oldScenario, 'informationsPersonnelles.profession'),
        getNestedProperty(oldAnnexes, 'contexteSocial.profession'),
        getNestedProperty(oldScenario, 'contextePsychosocial.profession')
    );
    
    // Habitat
    contextePsychoSocial.habitat = firstNonEmpty(
        getNestedProperty(oldAnnexes, 'contexteSocial.logement'),
        getNestedProperty(oldScenario, 'environnementSocial.logement')
    );
    
    // Famille
    const familleInfo = [];
    if (oldScenario.contexteFamilial) familleInfo.push(JSON.stringify(oldScenario.contexteFamilial));
    if (oldScenario.situationFamiliale) familleInfo.push(JSON.stringify(oldScenario.situationFamiliale));
    if (oldAnnexes.contexteFamilial) familleInfo.push(JSON.stringify(oldAnnexes.contexteFamilial));
    contextePsychoSocial.famille = familleInfo.join('; ');
    
    // Économique
    contextePsychoSocial.economique = firstNonEmpty(
        getNestedProperty(oldScenario, 'informationsPersonnelles.situationSocioEconomique'),
        getNestedProperty(oldAnnexes, 'contexteSocial.situation')
    );
    
    // Social
    contextePsychoSocial.social = firstNonEmpty(
        getNestedProperty(oldAnnexes, 'contexteSocial.isolement'),
        getNestedProperty(oldScenario, 'environnementSocial.activites')
    );
    
    // Autonomie
    contextePsychoSocial.autonomie = firstNonEmpty(
        getNestedProperty(oldScenario, 'autonomieFonctionnelle'),
        getNestedProperty(oldAnnexes, 'contexteSocial.autonomie')
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
console.log('🚀 Début de la migration des annexes vers la structure v3 simplifiée...\n');

const jsonDir = path.join(__dirname, 'json_files');
const files = fs.readdirSync(jsonDir).filter(file => {
    return file.startsWith('USMLE Triage') && file.endsWith('.json');
});

let successCount = 0;
let errorCount = 0;
const errors = [];

files.forEach(file => {
    try {
        const filePath = path.join(jsonDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`📄 Migration de ${file}...`);
        
        if (data.annexes) {
            // Créer une sauvegarde
            const backupPath = filePath.replace('.json', '_backup_v1_to_v3_simplified.json');
            if (!fs.existsSync(backupPath)) {
                fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
                console.log(`  📁 Sauvegarde créée: ${path.basename(backupPath)}`);
            }
            
            // Migrer les annexes
            const oldAnnexesKeys = Object.keys(data.annexes);
            data.annexes = migrateAnnexes(data.annexes);
            const newAnnexesKeys = Object.keys(data.annexes);
            
            // Afficher un résumé
            console.log(`  📊 Migration: ${oldAnnexesKeys.length} sections → ${newAnnexesKeys.length} sections`);
            console.log(`  ✅ Sections finales: ${newAnnexesKeys.join(', ')}`);
            
            // Sauvegarder le fichier mis à jour
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`  ✅ Migration réussie\n`);
            successCount++;
        } else {
            console.log(`  ⏭️  Pas d'annexes à migrer\n`);
        }
    } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}`);
        console.error(`     Stack: ${error.stack}\n`);
        errors.push({ file, error: error.message });
        errorCount++;
    }
});

console.log('\n📊 Résumé de la migration v1 → v3 simplifiée:');
console.log(`  ✅ ${successCount} fichiers migrés avec succès`);
console.log(`  ❌ ${errorCount} erreurs`);
console.log(`  📁 ${files.length} fichiers traités au total`);

if (errors.length > 0) {
    console.log('\n❌ Détail des erreurs:');
    errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
    });
}

console.log('\n✨ Migration v1 → v3 simplifiée terminée!');
console.log('💡 Les sauvegardes ont été créées avec le suffixe "_backup_v1_to_v3_simplified.json"');