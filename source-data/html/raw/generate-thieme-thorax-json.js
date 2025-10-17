const fs = require('fs');
const path = require('path');

// Les 8 cas Thieme Thorax
const cases = [
  {
    number: 1,
    title: "Mal de gorge",
    patient: {
      name: "M. Donald Mavic",
      age: 35,
      gender: "Homme",
      complaint: "mal de gorge"
    },
    vitals: {
      temperature: "38.3°C",
      fc: "84 bpm",
      ta: "120/80 mmHg",
      fr: "16/min"
    },
    history: {
      main: "Mal de gorge et difficultés à avaler depuis 2 semaines. Fièvre à 101°F. Douleur abdominale légère 3/10 au QSG.",
      additional: "Fatigue, appétit diminué. Colocataire malade. Appendicectomie il y a 20 ans. Allergie pénicilline. Écoulement urétral traité il y a 6 mois.",
      social: "Professeur de tennis. Fume 1 pqt/j × 10 ans. Alcool modéré. Partenaires sexuels multiples (H/F), utilisation occasionnelle du préservatif."
    },
    differentials: ["Pharyngite virale", "Mononucléose infectieuse", "Infection VIH"],
    exams: ["Test rapide streptocoque", "Test monospot", "Charge virale VIH", "Numération CD4", "US abdominale"]
  },
  {
    number: 2,
    title: "Consultation téléphonique - Difficultés respiratoires",
    patient: {
      name: "Père de Mlle Baldwin",
      age: 60,
      gender: "Homme",
      complaint: "difficultés respiratoires"
    },
    vitals: null, // Consultation téléphonique
    history: {
      main: "Essoufflement aigu il y a 15 minutes, progressif. Douleur thoracique sévère 8/10 côté droit. Palpitations.",
      additional: "Alité depuis prothèse totale de hanche il y a 2 semaines. Sorti de l'hôpital il y a 3 jours. Épisode similaire l'année dernière (EP).",
      social: "Ex-fumeur (2 pqt/j × 25 ans). Vit avec sa fille."
    },
    differentials: ["Embolie pulmonaire", "Infarctus du myocarde aigu"],
    exams: ["GSA", "D-dimères", "Enzymes cardiaques", "Angioscanner", "ECG"]
  },
  {
    number: 3,
    title: "Toux",
    patient: {
      name: "M. Richard Davis",
      age: 35,
      gender: "Homme",
      complaint: "toux"
    },
    vitals: {
      temperature: "38°C",
      fc: "94 bpm",
      ta: "120/80 mmHg",
      fr: "16/min"
    },
    history: {
      main: "Toux depuis 3 jours, d'abord sèche puis productive (mucus blanc-jaune). Rhume avec rhinorrhée la semaine dernière.",
      additional: "Mal de gorge léger, écoulement post-nasal, céphalée légère. Douleur thoracique 4/10 augmentant à l'inspiration profonde.",
      social: "Fume 1/2 pqt/j × 10 ans. Asthme bronchique. Sinusite récurrente (2×/an). Allergies (pollen, animaux)."
    },
    differentials: ["Bronchite aiguë", "Sinusite aiguë", "Pleurésie"],
    exams: ["Culture d'expectoration", "Radiographie thoracique"]
  },
  {
    number: 4,
    title: "Cœur qui bat rapidement",
    patient: {
      name: "Mme Anna Rodriguez",
      age: 20,
      gender: "Femme",
      complaint: "cœur qui bat rapidement"
    },
    vitals: {
      temperature: "37°C",
      fc: "84 bpm",
      ta: "110/70 mmHg",
      fr: "20/min"
    },
    history: {
      main: "Palpitations depuis 3 semaines, par épisodes durant quelques minutes. Douleur thoracique légère 4/10 côté gauche.",
      additional: "Insomnie (1-2h pour s'endormir). Épisode similaire l'année dernière avant examens. Stress actuel pour examens.",
      social: "Étudiante. 4 tasses café/jour. Fume 2 pqt/j × 5 ans. Sexuellement active, monogame."
    },
    differentials: ["Trouble anxieux", "Arythmie cardiaque", "Palpitations induites par la caféine"],
    exams: ["NFS", "TSH", "VMA urinaire", "Échocardiographie", "ECG"]
  },
  {
    number: 5,
    title: "Douleur thoracique (I) - Attaque de panique",
    patient: {
      name: "Mme Jessica Andrews",
      age: 30,
      gender: "Femme",
      complaint: "douleur thoracique"
    },
    vitals: {
      temperature: "37°C",
      fc: "84 bpm",
      ta: "110/70 mmHg",
      fr: "16/min"
    },
    history: {
      main: "Douleur thoracique par épisodes 2-3×/semaine depuis 2 mois, durant 30-45 min. Dyspnée, palpitations, transpiration.",
      additional: "Sensation d'étouffement et mort imminente. Pire dans endroits bondés. Conflits conjugaux. Insomnie.",
      social: "Assistante médicale. 4 tasses café/jour. Fume 1 pqt/j × 10 ans. Syndrome côlon irritable. Vessie hyperactive."
    },
    differentials: ["Attaque de panique", "Hypochondrie"],
    exams: ["NFS", "TSH"]
  },
  {
    number: 6,
    title: "Douleur thoracique (II) - Syndrome coronarien aigu",
    patient: {
      name: "M. Carlini",
      age: 60,
      gender: "Homme",
      complaint: "douleur thoracique"
    },
    vitals: {
      temperature: "37°C",
      fc: "104 bpm",
      ta: "160/110 mmHg",
      fr: "24/min"
    },
    history: {
      main: "Douleur thoracique aiguë depuis 1h, écrasante 9/10, irradiant vers bras gauche. Dyspnée, palpitations, diaphorèse.",
      additional: "Dyspnée d'effort chronique (4-5 blocs). Épisode similaire il y a 1 mois soulagé par O2 et nitrates.",
      social: "HTA 20 ans. Hypercholestérolémie 10 ans. Père décédé d'IM à 65 ans. Fume 1 pqt/j × 30 ans."
    },
    differentials: ["Infarctus du myocarde aigu", "Angor instable"],
    exams: ["Enzymes cardiaques", "GSA", "Électrolytes", "Radiographie thoracique", "Échocardiographie", "Angiographie coronaire", "ECG"]
  },
  {
    number: 7,
    title: "Douleur thoracique (III) - Costochondrite",
    patient: {
      name: "M. Adams",
      age: 28,
      gender: "Homme",
      complaint: "douleur thoracique"
    },
    vitals: {
      temperature: "37°C",
      fc: "84 bpm",
      ta: "110/70 mmHg",
      fr: "16/min"
    },
    history: {
      main: "Douleur thoracique depuis 2 semaines, début pendant match de lutte. Côté droit, 3/10, sourde.",
      additional: "Augmente avec mouvement bras droit et inspiration profonde. Diminue au repos et massage. Grippe la semaine dernière.",
      social: "Fume 1 pqt/j × 10 ans. Père décédé cancer poumon. Sexuellement actif avec préservatifs."
    },
    differentials: ["Costochondrite", "Pleurésie"],
    exams: ["Enzymes cardiaques", "ECG", "Radiographie thoracique"]
  },
  {
    number: 8,
    title: "Hémoptysie",
    patient: {
      name: "M. Kenneth King",
      age: 65,
      gender: "Homme",
      complaint: "crache du sang"
    },
    vitals: {
      temperature: "37°C",
      fc: "90 bpm",
      ta: "120/80 mmHg",
      fr: "16/min"
    },
    history: {
      main: "Expectorations couleur rouille depuis 3 mois. Hier, craché 1/2 tasse sang rouge vif.",
      additional: "Dyspnée chronique. Toux productive jaune-vert. Douleur thoracique droite 4/10. Orthopnée (2 oreillers). Perte 10 lb/6 mois.",
      social: "Ex-fumeur (2 pqt/j × 25 ans, arrêt il y a 5 ans). Retraité industrie sidérurgique. Père décédé cancer poumon."
    },
    differentials: ["BPCO", "Cancer du poumon"],
    exams: ["NFS", "Culture expectoration", "BAAR", "Test tuberculinique", "Radiographie thoracique", "CT thoracique"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Thorax ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Thorax",
    subcategory: caseData.title,
    context: {
      setting: caseData.number === 2 ? "Consultation téléphonique" : "Cabinet de médecine générale",
      patient: `${caseData.patient.gender} de ${caseData.patient.age} ans, ${caseData.patient.name}, consultant pour ${caseData.patient.complaint}`
    }
  };

  // Ajouter les signes vitaux s'ils existent
  if (caseData.vitals) {
    json.context.vitals = caseData.vitals;
  }

  // Créer les sections
  json.sections = {
    anamnese: {
      weight: 0.25,
      criteria: [
        {
          id: "a1",
          text: "Motif principal de consultation",
          binaryOnly: true,
          patientComment: caseData.patient.complaint
        },
        {
          id: "a2",
          text: "Analyse de la plainte principale",
          details: [
            `Début et évolution [${caseData.history.main.split('.')[0]}]`,
            "Localisation et irradiation de la douleur",
            "Caractéristiques et intensité",
            "Facteurs aggravants et soulageants",
            "Symptômes associés"
          ]
        },
        {
          id: "a3",
          text: "Antécédents médicaux et chirurgicaux",
          details: caseData.history.additional.split('.').filter(s => s.trim()).map(s => s.trim())
        },
        {
          id: "a4",
          text: "Histoire sociale et habitudes de vie",
          details: caseData.history.social.split('.').filter(s => s.trim()).map(s => s.trim())
        }
      ]
    },
    examen: {
      weight: 0.25,
      criteria: [
        {
          id: "e1",
          text: "Signes vitaux",
          binaryOnly: true
        },
        {
          id: "e2",
          text: "Examen de la tête et du cou",
          details: [
            "PERRLA",
            "Examen ORL complet",
            "Palpation thyroïde",
            "Recherche ganglions lymphatiques"
          ]
        },
        {
          id: "e3",
          text: "Examen cardio-pulmonaire",
          details: [
            "Auscultation cardiaque [S1 et S2 normaux]",
            "Recherche de souffles ou galop",
            "Auscultation pulmonaire bilatérale",
            "Recherche de râles ou sibilances"
          ]
        },
        {
          id: "e4",
          text: "Examen abdominal si pertinent",
          details: caseData.number === 1 ? ["Palpation QSG [sensibilité]"] : []
        }
      ]
    },
    management: {
      weight: 0.25,
      criteria: [
        {
          id: "m1",
          text: "Diagnostics différentiels à évoquer",
          ddSection: {
            title: "Hypothèses diagnostiques",
            categories: [
              {
                name: "Diagnostics principaux",
                items: caseData.differentials.map(diag => ({
                  text: diag,
                  cause: "Arguments POUR:\n\t□ " + getArgumentsForDiagnosis(caseData, diag),
                  test: "→ " + getSuggestedTest(diag)
                }))
              }
            ]
          }
        },
        {
          id: "m2",
          text: "Examens complémentaires pertinents",
          details: caseData.exams
        },
        {
          id: "m3",
          text: "Plan de prise en charge",
          details: [
            caseData.number === 2 ? "Urgence - Appel 911 immédiat" : "Investigations ambulatoires",
            "Traitement symptomatique si approprié",
            "Suivi après résultats"
          ]
        }
      ]
    }
  };

  // Ajouter les annexes
  json.annexes = {
    scenarioPatienteStandardisee: {
      titre: "Instructions pour le patient standardisé",
      nom: caseData.patient.name,
      age: caseData.patient.age + " ans",
      contexte: json.context.setting,
      motifConsultation: {
        plaintePrincipale: caseData.patient.complaint,
        autreChose: caseData.history.main
      },
      histoireActuelle: {
        symptomesPrincipaux: caseData.history.main.split('.').filter(s => s.trim()),
        contextePsychosocial: caseData.history.social.split('.').filter(s => s.trim())
      },
      simulation: {
        attitude: getAttitudeInstructions(caseData.number),
        durantExamen: getExamInstructions(caseData.number)
      },
      inquietudes: {
        principales: getPatientQuestions(caseData.number)
      }
    },
    informationsExpert: {
      titre: "Informations pour l'expert",
      pointsCles: [
        `Cas de ${caseData.title}`,
        `Patient: ${caseData.patient.gender} de ${caseData.patient.age} ans`,
        "Évaluation de l'anamnèse ciblée",
        "Examen physique pertinent",
        "Diagnostic différentiel approprié"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  return json;
}

// Fonction pour créer le JSON feuille-porte
function createDoorSheetJSON(caseData) {
  const json = {
    titre: `Thieme Thorax ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.number === 2 ? "Consultation téléphonique" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  json.taches = [
    "Obtenir une anamnèse ciblée",
    caseData.number === 2 ? 
      "Évaluer l'urgence et orienter vers les soins appropriés" :
      "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectal, pelvien, génito-urinaire, hernie inguinale, sein féminin ou réflexe cornéen)",
    "Discuter du diagnostic initial et du plan d'investigation avec le patient",
    caseData.number !== 2 ? "Compléter la note patient après la consultation" : "Conseiller l'appel au 911"
  ];

  return json;
}

// Fonctions auxiliaires
function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Pharyngite virale": "Mal de gorge, fièvre, contact avec personne malade",
    "Mononucléose infectieuse": "Mal de gorge, fatigue, douleur QSG, contact malade",
    "Infection VIH": "Partenaires multiples, pratiques à risque, symptômes constitutionnels",
    "Embolie pulmonaire": "Dyspnée aiguë, alitement prolongé, chirurgie récente, ATCD EP",
    "Infarctus du myocarde aigu": "Douleur thoracique écrasante, irradiation, facteurs de risque CV",
    "Bronchite aiguë": "Toux productive, fièvre, ATCD rhume",
    "Sinusite aiguë": "Céphalée, écoulement post-nasal, sensibilité sinus",
    "Pleurésie": "Douleur à l'inspiration profonde, ATCD infection respiratoire",
    "Trouble anxieux": "Stress, insomnie, consommation caféine, contexte psychosocial",
    "Arythmie cardiaque": "Palpitations, douleur thoracique",
    "Palpitations induites par la caféine": "Consommation excessive café, timing des symptômes",
    "Attaque de panique": "Symptômes paroxystiques, contexte stress, sensation mort imminente",
    "Hypochondrie": "Consultations multiples, pas de diagnostic établi",
    "Angor instable": "Douleur thoracique typique, facteurs risque, ATCD angor",
    "Costochondrite": "Traumatisme, douleur reproductible, sensibilité locale",
    "BPCO": "Tabagisme lourd, dyspnée chronique, toux productive",
    "Cancer du poumon": "Hémoptysie, perte poids, tabagisme, ATCD familial"
  };
  return args[diagnosis] || "Selon anamnèse et examen clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Pharyngite virale": "Test rapide streptocoque",
    "Mononucléose infectieuse": "Test monospot, NFS",
    "Infection VIH": "Test VIH, charge virale",
    "Embolie pulmonaire": "D-dimères, angioscanner",
    "Infarctus du myocarde aigu": "ECG, troponines",
    "Bronchite aiguë": "Radiographie thoracique si doute",
    "Sinusite aiguë": "CT sinus si complications",
    "Pleurésie": "Radiographie thoracique",
    "Trouble anxieux": "TSH pour éliminer hyperthyroïdie",
    "Arythmie cardiaque": "ECG, Holter",
    "Palpitations induites par la caféine": "ECG de base",
    "Attaque de panique": "Bilan de base pour éliminer organique",
    "Hypochondrie": "Évaluation psychiatrique",
    "Angor instable": "ECG, enzymes cardiaques",
    "Costochondrite": "Radiographie thoracique si doute",
    "BPCO": "Spirométrie, radiographie thoracique",
    "Cancer du poumon": "CT thoracique, bronchoscopie"
  };
  return tests[diagnosis] || "Selon présentation clinique";
}

function getAttitudeInstructions(caseNumber) {
  const attitudes = {
    1: ["Paraître fatigué", "Montrer de l'inquiétude"],
    2: ["Très inquiète pour votre père", "Urgence dans la voix"],
    3: ["Toux occasionnelle pendant l'entretien"],
    4: ["Nerveuse", "Inquiète pour les examens"],
    5: ["Anxieuse", "Nerveuse"],
    6: ["Douleur sévère", "Main sur la poitrine", "Respiration rapide"],
    7: ["Sportif", "Minimiser les symptômes"],
    8: ["Inquiet", "Fatigué"]
  };
  return attitudes[caseNumber] || [];
}

function getExamInstructions(caseNumber) {
  const instructions = {
    1: ["Sensibilité QSG à la palpation"],
    3: ["Sensibilité des sinus"],
    6: ["Exprimer douleur thoracique sévère"],
    7: ["Sensibilité côté droit poitrine"],
    8: ["Sensibilité côté droit poitrine"]
  };
  return instructions[caseNumber] || [];
}

function getPatientQuestions(caseNumber) {
  const questions = {
    1: ["Les symptômes sont-ils indicatifs du VIH?", "Puis-je participer au tournoi de tennis?"],
    2: ["Pourrait-ce être un autre caillot de sang?", "Pouvez-vous prescrire des médicaments?"],
    3: ["Pouvez-vous me prescrire des antibiotiques?", "Ai-je attrapé la grippe de mon fils?"],
    4: ["Vais-je réussir mes examens?", "Pourquoi mon cœur bat-il vite quand je suis nerveuse?"],
    5: ["Ces symptômes sont-ils liés à ma nervosité?", "Est-ce une crise cardiaque?"],
    6: ["Est-ce que je fais une crise cardiaque?", "Pouvez-vous me donner un analgésique?"],
    7: ["Puis-je participer au match de lutte?", "Dois-je utiliser une pommade?"],
    8: ["Ai-je un cancer du poumon comme mon père?"]
  };
  return questions[caseNumber] || [];
}

function getPieges(caseNumber) {
  const pieges = {
    1: ["Ne pas explorer les pratiques sexuelles à risque", "Oublier la mononucléose"],
    2: ["Ne pas reconnaître l'urgence", "Ne pas insister sur le 911"],
    3: ["Prescrire antibiotiques sans preuve infection bactérienne"],
    4: ["Ne pas explorer la consommation de caféine"],
    5: ["Ne pas reconnaître l'attaque de panique"],
    6: ["Retarder la prise en charge urgente"],
    7: ["Sur-investiguer une costochondrite simple"],
    8: ["Ne pas évoquer le cancer devant hémoptysie et tabagisme"]
  };
  return pieges[caseNumber] || ["Ne pas faire d'anamnèse complète", "Oublier des diagnostics importants"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-thorax');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-thorax');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Thorax...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Thorax-${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
  // Sauvegarder JSON principal
  const mainPath = path.join(mainDir, `${fileName}.json`);
  fs.writeFileSync(mainPath, JSON.stringify(mainJSON, null, 2), 'utf-8');
  
  // Sauvegarder JSON feuille-porte
  const doorPath = path.join(doorDir, `${fileName}.json`);
  fs.writeFileSync(doorPath, JSON.stringify(doorJSON, null, 2), 'utf-8');
  
  console.log(`✓ Cas ${caseData.number}: ${caseData.title}`);
});

console.log('\n✅ Génération terminée !');
console.log(`📁 JSON principaux: ${mainDir}`);
console.log(`📁 JSON feuille-porte: ${doorDir}`);