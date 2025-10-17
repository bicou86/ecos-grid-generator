const fs = require('fs');
const path = require('path');

// Les 6 cas Thieme Gynécologie-Obstétrique (cas 22 à 27)
const cases = [
  {
    number: 22,
    title: "Douleur abdominale basse avec saignements vaginaux",
    patient: {
      name: "Mme Sharon Evans",
      age: 25,
      gender: "Femme",
      complaint: "douleurs abdominales basses"
    },
    vitals: {
      temperature: "36.7°C",
      fc: "108 bpm",
      fr: "20/min",
      ta: "90/60 mmHg"
    },
    history: {
      main: "Douleur abdominale aiguë sévère depuis 1h, soudaine, 9/10 au QIG. Constante, aggravée par la toux. Saignements vaginaux sang rouge vif.",
      additional: "DDR il y a 7 semaines, règles manquées depuis 3 semaines. Nausées matinales et seins sensibles. G1P0, fausse couche il y a 2 ans à 3 mois.",
      social: "Travaille dans restaurant. Fume 1 pqt/j × 5 ans. Bière/jour, plus le week-end. Sexuellement active, multiples partenaires, préservatifs occasionnels."
    },
    differentials: ["Grossesse extra-utérine", "Avortement spontané"],
    exams: ["Examen pelvien et vaginal", "Test grossesse et βhCG quantitative", "US pelvienne", "Laparoscopie si urgence"]
  },
  {
    number: 23,
    title: "Douleur abdominale basse avec fièvre",
    patient: {
      name: "Mme Linda Brown",
      age: 30,
      gender: "Femme",
      complaint: "douleur abdominale basse sévère"
    },
    vitals: {
      temperature: "38.3°C",
      fc: "104 bpm",
      fr: "20/min",
      ta: "100/60 mmHg"
    },
    history: {
      main: "Douleur abdominale brûlante sévère depuis quelques heures, 8/10 au QIG, irradiant vers pelvis. Constante, aggravée par toux et mouvement.",
      additional: "Dysurie avec sensation brûlure, pollakiurie. Pertes vaginales malodorantes blanc-verdâtre. Un épisode vomissement clair. DDR il y a 5 jours.",
      social: "Enseignante. Ne fume pas. Alcool social. Sexuellement active, multiples partenaires, pas de préservatifs. Contraceptifs oraux. Gonorrhée il y a 6 mois."
    },
    differentials: ["Maladie inflammatoire pelvienne", "Infection urinaire (pyélonéphrite)"],
    exams: ["Examen pelvien", "NFS, ECBU, culture urine", "Frottis, prélèvement vaginal", "Test grossesse", "US abdomen et pelvis", "CT abdomen et pelvis"]
  },
  {
    number: 24,
    title: "Aménorrhée avec test de grossesse positif",
    patient: {
      name: "Mme Sally Smith",
      age: 24,
      gender: "Femme",
      complaint: "test de grossesse positif à domicile"
    },
    vitals: {
      temperature: "36.7°C",
      fc: "90 bpm",
      fr: "16/min",
      ta: "110/70 mmHg"
    },
    history: {
      main: "DDR il y a 5 semaines, règles manquées. Test grossesse domicile positif. Nausées matinales, seins sensibles, mictions fréquentes depuis quelques jours.",
      additional: "Ménarche à 12 ans, règles régulières 28/5. G1P1, accouchement naturel il y a 5 ans. Dernier frottis il y a 2 ans normal.",
      social: "Technicienne laboratoire médical. Mariée depuis 6 ans. Fume 5 cigarettes/jour × 5 ans. Alcool social. Monogame avec mari, arrêt préservatifs récent."
    },
    differentials: ["Grossesse normale"],
    exams: ["Examen pelvien", "Test grossesse", "NFS, facteur Rh", "ECBU, culture urine", "Sérologie (rougeole, varicelle, VDRL)"]
  },
  {
    number: 25,
    title: "Bouffées de chaleur",
    patient: {
      name: "Mme Carolina Williams",
      age: 52,
      gender: "Femme",
      complaint: "bouffées de chaleur"
    },
    vitals: {
      temperature: "36.7°C",
      fc: "90 bpm",
      fr: "16/min",
      ta: "120/80 mmHg"
    },
    history: {
      main: "Bouffées de chaleur depuis 3 mois, 4-5×/jour, sans avertissement. Durent quelques minutes avec palpitations et transpiration. Perturbent sommeil.",
      additional: "Dyspareunie récente. DDR il y a 3 mois, règles moins fréquentes depuis 6 mois. Ménarche à 13 ans. G2P2, accouchements normaux.",
      social: "HTA sous propranolol 10mg/j. Cholécystectomie laparoscopique. Mère décédée cancer sein. Fume 5 cigarettes/jour. Alcool social. Monogame avec mari."
    },
    differentials: ["Ménopause"],
    exams: ["Examen vaginal", "TSH, T3, FSH", "Mammographie dépistage", "US pelvienne"]
  },
  {
    number: 26,
    title: "Saignements vaginaux chez femme jeune",
    patient: {
      name: "Mme Donna Mitchell",
      age: 25,
      gender: "Femme",
      complaint: "saignements vaginaux"
    },
    vitals: {
      temperature: "37°C",
      fc: "100 bpm",
      fr: "16/min",
      ta: "90/50 mmHg"
    },
    history: {
      main: "Saignements vaginaux depuis hier, aggravés ce matin. 4 serviettes utilisées. Sang rouge vif, pas de caillots. Douleur abdominale basse en crampes 6/10.",
      additional: "DDR il y a 7 semaines, règles manquées. Test grossesse domicile positif. Nausées matinales et seins sensibles. G1P1, césarienne il y a 2 ans.",
      social: "Travaille restaurant. Fume 1 pqt/j × 5 ans. Alcool social, plus le week-end. Sexuellement active, monogame avec mari, pas de contraception."
    },
    differentials: ["Avortement spontané", "Grossesse extra-utérine"],
    exams: ["Examen pelvien et vaginal", "Test grossesse et hCG quantitative", "NFS, ECBU", "US pelvienne"]
  },
  {
    number: 27,
    title: "Saignements vaginaux post-ménopausiques",
    patient: {
      name: "Mme Marian Brown",
      age: 60,
      gender: "Femme",
      complaint: "saignements vaginaux"
    },
    vitals: {
      temperature: "37°C",
      fc: "90 bpm",
      fr: "16/min",
      ta: "120/80 mmHg"
    },
    history: {
      main: "Saignements vaginaux depuis 1 mois, comme retour des règles. 5-6 serviettes/jour. Sang rouge foncé avec caillots. Étourdissements au lever.",
      additional: "Pertes post-coïtales il y a 2 semaines. Perte 6 lb/3 mois. Ménopause il y a 5 ans. Ménarche à 11 ans. G2P0 (2 fausses couches). Jamais de frottis.",
      social: "HTA sous propranolol. Travaille hôpital. Fume 1 pqt/j × 20 ans. 2 bières/jour. CAGE 3/4. Antérieurement multiples partenaires. Mère décédée cancer utérus."
    },
    differentials: ["Carcinome de l'endomètre", "Hyperplasie de l'endomètre", "Cancer du col de l'utérus", "Vaginite sénile"],
    exams: ["Examen pelvien et vaginal", "NFS", "US et CT abdomen/pelvis", "Biopsie endomètre"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Gynéco ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Gynécologie-Obstétrique",
    subcategory: caseData.title,
    context: {
      setting: caseData.number === 23 ? "Service d'urgences" : "Cabinet de médecine générale",
      patient: `${caseData.patient.gender} de ${caseData.patient.age} ans, ${caseData.patient.name}, consultant pour ${caseData.patient.complaint}`
    }
  };

  // Ajouter les signes vitaux
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
          text: "Analyse de la plainte principale (ABCDE)",
          details: getAnamnesisDetails(caseData.number)
        },
        {
          id: "a3",
          text: "Antécédents gynécologiques et obstétricaux",
          details: getGynecologicalHistory(caseData)
        },
        {
          id: "a4",
          text: "Histoire sociale et habitudes de vie",
          details: caseData.history.social.split('.').filter(s => s.trim()).map(s => s.trim())
        },
        {
          id: "a5",
          text: "Revue des systèmes",
          details: getSystemsReview(caseData.number)
        }
      ]
    },
    examen: {
      weight: 0.25,
      criteria: [
        {
          id: "e1",
          text: "Signes vitaux et apparence générale",
          binaryOnly: true
        },
        {
          id: "e2",
          text: "Examen de la tête et du cou",
          details: [
            "PERRLA",
            "Recherche pâleur ou cyanose",
            "Examen gorge",
            "Palpation thyroïde et ganglions"
          ]
        },
        {
          id: "e3",
          text: "Examen cardio-pulmonaire",
          details: [
            "Auscultation cardiaque [S1 et S2 normaux]",
            "Auscultation pulmonaire bilatérale"
          ]
        },
        {
          id: "e4",
          text: "Examen abdominal complet",
          details: getAbdominalExam(caseData.number)
        },
        {
          id: "e5",
          text: "Examens spécifiques selon le cas",
          details: getSpecificExams(caseData.number)
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
            title: "Hypothèses diagnostiques gynécologiques",
            categories: [
              {
                name: "Diagnostics prioritaires",
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
          details: getManagementPlan(caseData.number)
        }
      ]
    }
  };

  // Ajouter section clôture
  if (shouldAddClosure(caseData.number)) {
    json.sections.cloture = {
      weight: 0,
      criteria: [
        {
          id: "c1",
          text: "Questions difficiles de la patiente",
          content: getPatientQuestions(caseData.number).join('\n')
        },
        {
          id: "c2",
          text: "Conseils spécifiques",
          content: getSpecificAdvice(caseData.number)
        }
      ]
    };
  }

  // Ajouter les annexes
  json.annexes = {
    scenarioPatienteStandardisee: {
      titre: "Instructions pour la patiente standardisée",
      nom: caseData.patient.name,
      age: caseData.patient.age + " ans",
      contexte: json.context.setting,
      motifConsultation: {
        plaintePrincipale: caseData.patient.complaint,
        autreChose: caseData.history.main
      },
      histoireActuelle: {
        symptomesPrincipaux: caseData.history.main.split('.').filter(s => s.trim()),
        antecedentsGynecologiques: caseData.history.additional.split('.').filter(s => s.trim()),
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
        `Patiente: ${caseData.patient.gender} de ${caseData.patient.age} ans`,
        "Anamnèse gynécologique complète",
        "Examen abdominal et pelvien appropriés",
        "Diagnostic différentiel ciblé"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter conseils grossesse pour cas 24
  if (caseData.number === 24) {
    json.annexes.theoriePratique = {
      titre: "Conseils pour la grossesse",
      sections: [
        {
          titre: "Recommandations initiales",
          points: [
            "Arrêt tabac et alcool",
            "Exercice modéré régulier",
            "Alimentation équilibrée",
            "Suppléments acide folique",
            "Suivi prénatal régulier"
          ]
        }
      ]
    };
  }

  return json;
}

// Fonction pour créer le JSON feuille-porte
function createDoorSheetJSON(caseData) {
  const json = {
    titre: `Thieme Gynéco ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.number === 23 ? "Service d'urgences" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  json.taches = [
    "Obtenir une anamnèse ciblée",
    "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectal, pelvien, génito-urinaire, hernie inguinale, sein féminin ou réflexe cornéen)",
    "Discuter du diagnostic initial et du plan d'investigation avec la patiente",
    "Compléter la note patient après la consultation"
  ];

  return json;
}

// Fonctions auxiliaires
function getAnamnesisDetails(caseNumber) {
  const details = {
    22: [
      "Apparition et durée [Douleur soudaine il y a 1h]",
      "Localisation [QIG] et irradiation",
      "Intensité [9/10] et caractère",
      "Facteurs aggravants [toux]",
      "Saignements vaginaux associés [sang rouge vif]"
    ],
    23: [
      "Apparition [Il y a quelques heures]",
      "Localisation [QIG] et irradiation [pelvis]",
      "Intensité [8/10] et caractère [brûlant]",
      "Facteurs aggravants [toux, mouvement]",
      "Symptômes urinaires et pertes vaginales"
    ],
    24: [
      "Règles manquées [DDR il y a 5 semaines]",
      "Test de grossesse positif",
      "Nausées matinales",
      "Sensibilité des seins",
      "Mictions fréquentes"
    ],
    25: [
      "Fréquence [4-5×/jour]",
      "Durée [quelques minutes]",
      "Symptômes associés [palpitations, transpiration]",
      "Impact sur sommeil",
      "Dyspareunie"
    ],
    26: [
      "Début [hier] et progression",
      "Quantité [4 serviettes]",
      "Caractéristiques [sang rouge vif]",
      "Douleur abdominale [crampes 6/10]",
      "Contexte de grossesse possible"
    ],
    27: [
      "Durée [1 mois]",
      "Quantité [5-6 serviettes/jour]",
      "Caractéristiques [sang rouge foncé avec caillots]",
      "Pertes post-coïtales",
      "Perte de poids [6 lb/3 mois]"
    ]
  };
  return details[caseNumber] || [];
}

function getGynecologicalHistory(caseData) {
  const base = [];
  const addInfo = caseData.history.additional.split('.').filter(s => s.trim());
  
  // Extraire les infos gynéco pertinentes
  addInfo.forEach(info => {
    if (info.includes('DDR') || info.includes('règles') || info.includes('ménarche') || 
        info.includes('G') || info.includes('P') || info.includes('frottis') ||
        info.includes('grossesse') || info.includes('ménopause')) {
      base.push(info.trim());
    }
  });
  
  return base;
}

function getSystemsReview(caseNumber) {
  const reviews = {
    22: ["Système gynécologique", "Symptômes de grossesse"],
    23: ["Système urinaire", "Système gynécologique"],
    24: ["Symptômes de grossesse précoce", "Signes d'alerte"],
    25: ["Symptômes de ménopause", "Système ostéo-articulaire"],
    26: ["Système gynécologique", "Symptômes de grossesse"],
    27: ["Système gynécologique", "Symptômes constitutionnels"]
  };
  return reviews[caseNumber] || ["Système gynécologique"];
}

function getAbdominalExam(caseNumber) {
  const base = [
    "Inspection (cicatrices, distension)",
    "Auscultation (bruits intestinaux)",
    "Palpation superficielle et profonde"
  ];
  
  if ([22, 23, 26].includes(caseNumber)) {
    base.push("Recherche défense [sensibilité QIG]");
  } else if (caseNumber === 27) {
    base.push("Sensibilité suprapubienne légère");
  }
  
  return base;
}

function getSpecificExams(caseNumber) {
  const exams = {
    22: ["Demander examen pelvien", "Documenter dans note patient"],
    23: ["Demander examen pelvien", "Sensibilité angle costo-vertébral"],
    24: ["Examen général rapide"],
    25: ["Examen neurologique bref"],
    26: ["Demander examen pelvien et vaginal"],
    27: ["Demander examen pelvien et vaginal"]
  };
  return exams[caseNumber] || [];
}

function getManagementPlan(caseNumber) {
  const plans = {
    22: ["Hospitalisation urgente", "Voie veineuse", "Surveillance signes vitaux", "Préparation chirurgie si nécessaire"],
    23: ["Hospitalisation", "Antibiothérapie IV", "Analgésie"],
    24: ["Suivi prénatal régulier", "Conseils hygiéno-diététiques", "Suppléments vitaminiques"],
    25: ["Options thérapeutiques (THS)", "Calcium et vitamine D", "Exercice régulier"],
    26: ["Hospitalisation", "Surveillance saignements", "Support psychologique"],
    27: ["Investigation urgente", "Biopsie endomètre", "Référence gynéco-oncologie"]
  };
  return plans[caseNumber] || ["Investigation ambulatoire", "Suivi après résultats"];
}

function shouldAddClosure(caseNumber) {
  return true; // Tous les cas gynéco ont des questions
}

function getPatientQuestions(caseNumber) {
  const questions = {
    22: ["Est-ce que je fais une fausse couche?"],
    23: ["Je ne peux pas manquer le travail. Donnez-moi juste des antalgiques."],
    24: ["Puis-je faire de l'exercice?", "Comment savoir s'il y a un problème avec ma grossesse?"],
    25: ["Qu'est-ce que le traitement hormonal substitutif (THS)?"],
    26: ["Est-ce que je fais une fausse couche?"],
    27: ["Est-il nécessaire de faire un examen pelvien?", "Pouvez-vous me prescrire le THS pour l'ostéoporose?"]
  };
  return questions[caseNumber] || [];
}

function getSpecificAdvice(caseNumber) {
  const advice = {
    22: "Précautions rapports sexuels protégés. Support psychologique si fausse couche.",
    23: "Précautions rapports sexuels protégés. Importance du traitement complet.",
    24: "Arrêt tabac et alcool. Exercice modéré autorisé. Signes d'alerte: saignements, douleurs sévères.",
    25: "Arrêt tabac. Exercice régulier. Calcium et vitamine D. Mammographie.",
    26: "Support psychologique. Arrêt tabac et alcool.",
    27: "Arrêt tabac et alcool. THS contre-indiqué avec saignements."
  };
  return advice[caseNumber] || "";
}

function getAttitudeInstructions(caseNumber) {
  const attitudes = {
    22: ["Allongée avec douleur sévère", "Très inquiète"],
    23: ["Douleur sévère QIG", "Résistante à l'hospitalisation"],
    24: ["Heureuse et souriante", "Excitée par la grossesse"],
    25: ["Fatiguée", "Préoccupée par symptômes"],
    26: ["Anxieuse", "Douleur abdominale"],
    27: ["Gênée", "Inquiète"]
  };
  return attitudes[caseNumber] || ["Coopérative"];
}

function getExamInstructions(caseNumber) {
  const instructions = {
    22: ["Sensibilité sévère QIG", "Défense positive"],
    23: ["Sensibilité QIG avec défense", "Sensibilité angle costo-vertébral gauche"],
    24: ["Examen normal"],
    25: ["Examen normal"],
    26: ["Sensibilité abdomen inférieur"],
    27: ["Légère sensibilité suprapubienne"]
  };
  return instructions[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Grossesse extra-utérine": "DDR manquées, douleur aiguë QIG, saignement vaginal, hypotension",
    "Avortement spontané": "DDR manquées, saignements vaginaux, douleur crampes, test grossesse positif",
    "Maladie inflammatoire pelvienne": "Douleur QIG, fièvre, pertes vaginales, multiples partenaires, ATCD IST",
    "Infection urinaire (pyélonéphrite)": "Douleur flanc, fièvre, dysurie, sensibilité ACV",
    "Grossesse normale": "DDR manquées, test positif, nausées matinales, seins sensibles",
    "Ménopause": "Âge 52 ans, DDR il y a 3 mois, bouffées chaleur, dyspareunie",
    "Carcinome de l'endomètre": "Saignement post-ménopausique, perte poids, ATCD familial",
    "Hyperplasie de l'endomètre": "Saignement post-ménopausique, âge avancé",
    "Cancer du col de l'utérus": "Saignement post-coïtal, multiples partenaires, pas de frottis",
    "Vaginite sénile": "Saignement post-coïtal, post-ménopause"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Grossesse extra-utérine": "βhCG quantitative, US pelvienne, laparoscopie",
    "Avortement spontané": "βhCG sériée, US pelvienne",
    "Maladie inflammatoire pelvienne": "Prélèvements, US pelvienne, CT si complications",
    "Infection urinaire (pyélonéphrite)": "ECBU, hémocultures, US rénale",
    "Grossesse normale": "βhCG, US obstétricale, sérologies",
    "Ménopause": "FSH, TSH, densitométrie osseuse",
    "Carcinome de l'endomètre": "Biopsie endomètre, CT TAP",
    "Hyperplasie de l'endomètre": "Biopsie endomètre, US pelvienne",
    "Cancer du col de l'utérus": "Frottis, colposcopie, biopsie",
    "Vaginite sénile": "Examen pelvien, frottis"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    22: ["Ne pas reconnaître l'urgence chirurgicale", "Oublier support psychologique"],
    23: ["Manquer la MIP", "Ne pas insister sur hospitalisation"],
    24: ["Ne pas donner conseils grossesse", "Oublier suppléments"],
    25: ["Prescrire THS sans bilan complet", "Oublier ATCD cancer sein"],
    26: ["Ne pas hospitaliser", "Minimiser détresse psychologique"],
    27: ["Ne pas évoquer cancer", "Prescrire THS avec saignements"]
  };
  return pieges[caseNumber] || ["Anamnèse incomplète", "Manquer diagnostic grave"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-gyneco');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-gyneco');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Gynécologie-Obstétrique...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Gyneco-${caseData.number} - ${caseData.title.replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
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