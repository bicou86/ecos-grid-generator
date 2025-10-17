// Patch pour ajouter les sections manquantes au générateur HTML
// À insérer dans la fonction qui génère les annexes

// === SECTIONS À AJOUTER DANS histoireActuelle ===

// Dans la section où les titres sont définis pour histoireActuelle, ajouter :
const nouveauxTitresHistoireActuelle = {
    'contactMalade': 'Contact avec personne malade',
    'contexteMaladie': 'Contexte de la maladie',
    'environnement': 'Environnement',
    'perteDePoids': 'Perte de poids',
    'priseDePoids': 'Prise de poids',
    'habitudesAlimentaires': 'Habitudes alimentaires',
    'troublesMenstruels': 'Troubles menstruels',
    'humeur': 'Humeur',
    'anxiete': 'Anxiété',
    'tremblements': 'Tremblements',
    'fonctionCognitive': 'Fonction cognitive',
    'expositionProfessionnelle': 'Exposition professionnelle',
    'toxicomanie': 'Toxicomanie',
    'sangDansLesSelles': 'Sang dans les selles',
    'dureeEtCaractere': 'Durée et caractère',
    'symptomesConstitutionnels': 'Symptômes constitutionnels',
    'autresSymptomes': 'Autres symptômes',
    'troubleMemoire': 'Trouble de mémoire',
    'violenceConjugale': 'Violence conjugale',
    'infectionRecente': 'Infection récente',
    'perteAuditive': 'Perte auditive',
    'questions': 'Questions',
    'facteursModulateurs': 'Facteurs modulateurs',
    'diagnostic': 'Diagnostic',
    'gestionActuelle': 'Gestion actuelle',
    'inquietudes': 'Inquiétudes',
    'defi': 'Défi',
    'repercussions': 'Répercussions'
};

// === SECTIONS À AJOUTER DANS scenarioPatienteStandardisee (niveau racine) ===

// Après la section motifConsultation, ajouter :
function generateConsignes(scenario) {
    let html = '';
    if (scenario.consignes && scenario.consignes.length > 0) {
        html += '        <div class="scenario-section">\n';
        html += '            <h4>Consignes pour le patient standardisé</h4>\n';
        html += '            <ul>\n';
        scenario.consignes.forEach(consigne => {
            html += '                <li>' + consigne + '</li>\n';
        });
        html += '            </ul>\n';
        html += '        </div>\n';
    }
    return html;
}

// Section informationsPersonnelles
function generateInformationsPersonnelles(scenario) {
    let html = '';
    if (scenario.informationsPersonnelles && typeof scenario.informationsPersonnelles === 'object') {
        html += '        <div class="scenario-section">\n';
        html += '            <h4>Informations personnelles</h4>\n';
        
        const labels = {
            'profession': 'Profession',
            'hobbies': 'Hobbies',
            'poids': 'Poids',
            'taille': 'Taille',
            'imc': 'IMC',
            'orientationSexuelle': 'Orientation sexuelle',
            'etatCivil': 'État civil',
            'enfants': 'Enfants',
            'situationSocioEconomique': 'Situation socio-économique',
            'origine': 'Origine',
            'contexteFamilial': 'Contexte familial',
            'vaccination': 'Vaccination',
            'inquietudes': 'Inquiétudes',
            'etatEsprit': 'État d\'esprit'
        };
        
        Object.keys(scenario.informationsPersonnelles).forEach(key => {
            if (scenario.informationsPersonnelles[key]) {
                html += '            <p><strong>' + (labels[key] || key) + ' :</strong> ' + scenario.informationsPersonnelles[key] + '</p>\n';
            }
        });
        
        html += '        </div>\n';
    }
    return html;
}

// Section grossesseActuelle
function generateGrossesseActuelle(scenario) {
    let html = '';
    if (scenario.grossesseActuelle && typeof scenario.grossesseActuelle === 'object') {
        html += '        <div class="scenario-section">\n';
        html += '            <h4>Grossesse actuelle</h4>\n';
        
        if (scenario.grossesseActuelle.terme) {
            html += '            <p><strong>Terme :</strong> ' + scenario.grossesseActuelle.terme + '</p>\n';
        }
        if (scenario.grossesseActuelle.suivi) {
            html += '            <p><strong>Suivi :</strong> ' + scenario.grossesseActuelle.suivi + '</p>\n';
        }
        if (scenario.grossesseActuelle.examens) {
            html += '            <p><strong>Examens :</strong> ' + scenario.grossesseActuelle.examens + '</p>\n';
        }
        if (scenario.grossesseActuelle.complications) {
            html += '            <p><strong>Complications :</strong> ' + scenario.grossesseActuelle.complications + '</p>\n';
        }
        
        html += '        </div>\n';
    }
    return html;
}

// === SECTIONS À AJOUTER AU NIVEAU ANNEXES ===

// Section antecedentsEnfant
function generateAntecedentsEnfant(annexes) {
    let html = '';
    if (annexes.antecedentsEnfant && typeof annexes.antecedentsEnfant === 'object') {
        html += '<div class="annexe-item annexe-antecedents-enfant">\n';
        html += '    <div class="annexe-title">Antécédents de l\'enfant</div>\n';
        html += '    <div class="annexe-content">\n';
        
        const sections = {
            'naissance': 'Naissance',
            'medical': 'Antécédents médicaux',
            'medicaux': 'Antécédents médicaux',
            'familiaux': 'Antécédents familiaux',
            'croissance': 'Croissance et développement'
        };
        
        Object.keys(annexes.antecedentsEnfant).forEach(key => {
            const section = annexes.antecedentsEnfant[key];
            if (section && section.length > 0) {
                html += '        <h5>' + (sections[key] || key) + '</h5>\n';
                html += '        <ul>\n';
                section.forEach(item => {
                    html += '            <li>' + item + '</li>\n';
                });
                html += '        </ul>\n';
            }
        });
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section traitements
function generateTraitements(annexes) {
    let html = '';
    if (annexes.traitements && typeof annexes.traitements === 'object') {
        html += '<div class="annexe-item annexe-traitements">\n';
        html += '    <div class="annexe-title">Traitements</div>\n';
        html += '    <div class="annexe-content">\n';
        
        if (annexes.traitements.actuels && annexes.traitements.actuels.length > 0) {
            html += '        <h5>Traitements actuels</h5>\n';
            html += '        <ul>\n';
            annexes.traitements.actuels.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        if (annexes.traitements.anterieurs && annexes.traitements.anterieurs.length > 0) {
            html += '        <h5>Traitements antérieurs</h5>\n';
            html += '        <ul>\n';
            annexes.traitements.anterieurs.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        if (annexes.traitements.observance) {
            html += '        <p><strong>Observance :</strong> ' + annexes.traitements.observance + '</p>\n';
        }
        
        if (annexes.traitements.allergies && annexes.traitements.allergies.length > 0) {
            html += '        <h5>Allergies médicamenteuses</h5>\n';
            html += '        <ul>\n';
            annexes.traitements.allergies.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        if (annexes.traitements.psychiatriques) {
            html += '        <p><strong>Traitements psychiatriques :</strong> ' + annexes.traitements.psychiatriques + '</p>\n';
        }
        
        if (annexes.traitements.effetsSecondaires) {
            html += '        <p><strong>Effets secondaires :</strong> ' + annexes.traitements.effetsSecondaires + '</p>\n';
        }
        
        if (annexes.traitements.iatrogenes) {
            html += '        <p><strong>Effets iatrogènes :</strong> ' + annexes.traitements.iatrogenes + '</p>\n';
        }
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section histoireSexuelle
function generateHistoireSexuelle(annexes) {
    let html = '';
    if (annexes.histoireSexuelle && typeof annexes.histoireSexuelle === 'object') {
        html += '<div class="annexe-item annexe-histoire-sexuelle">\n';
        html += '    <div class="annexe-title">Histoire sexuelle</div>\n';
        html += '    <div class="annexe-content">\n';
        
        const labels = {
            'orientation': 'Orientation sexuelle',
            'partenaires': 'Partenaires',
            'protection': 'Protection',
            'actuelle': 'Activité sexuelle actuelle',
            'pratiques': 'Pratiques'
        };
        
        Object.keys(annexes.histoireSexuelle).forEach(key => {
            if (annexes.histoireSexuelle[key]) {
                html += '        <p><strong>' + (labels[key] || key) + ' :</strong> ' + annexes.histoireSexuelle[key] + '</p>\n';
            }
        });
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section habitudesVie
function generateHabitudesVie(annexes) {
    let html = '';
    if (annexes.habitudesVie && typeof annexes.habitudesVie === 'object') {
        html += '<div class="annexe-item annexe-habitudes-vie">\n';
        html += '    <div class="annexe-title">Habitudes de vie</div>\n';
        html += '    <div class="annexe-content">\n';
        
        const labels = {
            'profession': 'Profession',
            'alcool': 'Consommation d\'alcool',
            'tabac': 'Tabagisme',
            'drogues': 'Drogues',
            'etudes': 'Études',
            'activites': 'Activités',
            'exercice': 'Exercice physique',
            'sommeil': 'Sommeil',
            'alimentation': 'Alimentation',
            'vieSociale': 'Vie sociale',
            'activiteSexuelle': 'Activité sexuelle'
        };
        
        Object.keys(annexes.habitudesVie).forEach(key => {
            const value = annexes.habitudesVie[key];
            if (value) {
                if (Array.isArray(value)) {
                    html += '        <h5>' + (labels[key] || key) + '</h5>\n';
                    html += '        <ul>\n';
                    value.forEach(item => {
                        html += '            <li>' + item + '</li>\n';
                    });
                    html += '        </ul>\n';
                } else {
                    html += '        <p><strong>' + (labels[key] || key) + ' :</strong> ' + value + '</p>\n';
                }
            }
        });
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section medicaments (niveau annexes)
function generateMedicamentsAnnexe(annexes) {
    let html = '';
    if (annexes.medicaments && typeof annexes.medicaments === 'object') {
        html += '<div class="annexe-item annexe-medicaments">\n';
        html += '    <div class="annexe-title">Médicaments</div>\n';
        html += '    <div class="annexe-content">\n';
        
        if (annexes.medicaments.actuels && annexes.medicaments.actuels.length > 0) {
            html += '        <h5>Médicaments actuels</h5>\n';
            html += '        <ul>\n';
            annexes.medicaments.actuels.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        if (annexes.medicaments.allergies && annexes.medicaments.allergies.length > 0) {
            html += '        <h5>Allergies médicamenteuses</h5>\n';
            html += '        <ul>\n';
            annexes.medicaments.allergies.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section symptomesAssocies (niveau annexes)
function generateSymptomesAssociesAnnexe(annexes) {
    let html = '';
    if (annexes.symptomesAssocies && typeof annexes.symptomesAssocies === 'object') {
        html += '<div class="annexe-item annexe-symptomes-associes">\n';
        html += '    <div class="annexe-title">Symptômes associés</div>\n';
        html += '    <div class="annexe-content">\n';
        
        const sections = {
            'urinaires': 'Symptômes urinaires',
            'generaux': 'Symptômes généraux',
            'sommeil': 'Troubles du sommeil'
        };
        
        Object.keys(annexes.symptomesAssocies).forEach(key => {
            const symptomes = annexes.symptomesAssocies[key];
            if (symptomes && symptomes.length > 0) {
                html += '        <h5>' + (sections[key] || key) + '</h5>\n';
                html += '        <ul>\n';
                symptomes.forEach(item => {
                    html += '            <li>' + item + '</li>\n';
                });
                html += '        </ul>\n';
            }
        });
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section inquietudes (niveau annexes)
function generateInquietudesAnnexe(annexes) {
    let html = '';
    if (annexes.inquietudes && typeof annexes.inquietudes === 'object') {
        html += '<div class="annexe-item annexe-inquietudes">\n';
        html += '    <div class="annexe-title">Inquiétudes du patient</div>\n';
        html += '    <div class="annexe-content">\n';
        
        if (annexes.inquietudes.principales && annexes.inquietudes.principales.length > 0) {
            html += '        <h5>Inquiétudes principales</h5>\n';
            html += '        <ul>\n';
            annexes.inquietudes.principales.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        if (annexes.inquietudes.questions && annexes.inquietudes.questions.length > 0) {
            html += '        <h5>Questions du patient</h5>\n';
            html += '        <ul>\n';
            annexes.inquietudes.questions.forEach(item => {
                html += '            <li>' + item + '</li>\n';
            });
            html += '        </ul>\n';
        }
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section questionsEtReponses
function generateQuestionsEtReponses(annexes) {
    let html = '';
    if (annexes.questionsEtReponses && annexes.questionsEtReponses.challenges && annexes.questionsEtReponses.challenges.length > 0) {
        html += '<div class="annexe-item annexe-questions-reponses">\n';
        html += '    <div class="annexe-title">Questions et réponses (Défis)</div>\n';
        html += '    <div class="annexe-content">\n';
        
        annexes.questionsEtReponses.challenges.forEach(challenge => {
            html += '        <div class="challenge-item" data-challenge-id="' + (challenge.id || '') + '">\n';
            html += '            <p><strong>Question :</strong> ' + challenge.text + '</p>\n';
            if (challenge.content) {
                html += '            <p><strong>Réponse type :</strong> ' + challenge.content + '</p>\n';
            }
            html += '        </div>\n';
        });
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Section ddSection (niveau annexes)
function generateDdSectionAnnexe(annexes) {
    let html = '';
    if (annexes.ddSection && annexes.ddSection.categories && annexes.ddSection.categories.length > 0) {
        html += '<div class="annexe-item annexe-dd-section">\n';
        html += '    <div class="annexe-title">' + (annexes.ddSection.title || 'Diagnostics différentiels') + '</div>\n';
        html += '    <div class="annexe-content">\n';
        
        annexes.ddSection.categories.forEach(category => {
            html += '        <div class="dd-category">\n';
            html += '            <h5>' + category.name + '</h5>\n';
            
            if (category.items && category.items.length > 0) {
                category.items.forEach(item => {
                    html += '            <div class="dd-item">\n';
                    html += '                <strong class="dd-text">' + item.text + '</strong>\n';
                    if (item.cause) {
                        html += '                <div class="dd-cause">' + formatDdContent(item.cause) + '</div>\n';
                    }
                    if (item.test) {
                        html += '                <div class="dd-test">' + item.test + '</div>\n';
                    }
                    html += '            </div>\n';
                });
            }
            
            html += '        </div>\n';
        });
        
        html += '    </div>\n';
        html += '</div>\n';
    }
    return html;
}

// Fonction utilitaire pour formater le contenu DD
function formatDdContent(text) {
    return text
        .replace(/Arguments POUR:/g, '<span style="color: #52692e;">Arguments POUR:</span>')
        .replace(/Arguments CONTRE:/g, '<span style="color: #a92217;">Arguments CONTRE:</span>')
        .replace(/\n/g, '<br>')
        .replace(/\t□/g, '&nbsp;&nbsp;&nbsp;&nbsp;□');
}

// === ORDRE D'APPEL DES NOUVELLES FONCTIONS ===
// Dans la génération des annexes, ajouter après les sections existantes :

/*
// Après scenarioPatienteStandardisee existant
html += generateAntecedentsEnfant(annexes);
html += generateTraitements(annexes);
html += generateHistoireSexuelle(annexes);
html += generateHabitudesVie(annexes);
html += generateMedicamentsAnnexe(annexes);
html += generateSymptomesAssociesAnnexe(annexes);
html += generateInquietudesAnnexe(annexes);
html += generateQuestionsEtReponses(annexes);
html += generateDdSectionAnnexe(annexes);

// Dans scenarioPatienteStandardisee, ajouter après motifConsultation :
html += generateConsignes(scenario);
html += generateInformationsPersonnelles(scenario);
html += generateGrossesseActuelle(scenario);
*/