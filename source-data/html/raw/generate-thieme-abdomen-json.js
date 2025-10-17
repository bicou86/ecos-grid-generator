const fs = require('fs');
const path = require('path');

// Les 13 cas Thieme Abdomen (cas 9 à 21)
const cases = [
  {
    number: 9,
    title: "Douleur abdominale supérieure (patient jeune)",
    patient: {
      name: "Mme Donna Martin",
      age: 32,
      gender: "Femme",
      complaint: "douleurs abdominales supérieures"
    },
    vitals: {
      temperature: "37°C",
      ta: "100/70 mmHg",
      fc: "84 bpm",
      fr: "16/min"  // Corrigé : valeur originale "100/min" était une erreur typographique
    },
    history: {
      main: "Douleurs abdominales supérieures depuis 1 an, aggravées depuis 3 mois. Remontées acides avec goût aigre. Brûlures d'estomac sous le sternum.",
      additional: "3-5 fois/semaine. Aggravée par gros repas et position allongée. Soulagée par antiacides et oméprazole.",
      social: "Enseignante. Fume 1 pqt/j × 10 ans. 1-2 tasses café/jour. CAGE 2/4. Mère avec ulcères peptiques."
    },
    differentials: ["Reflux gastro-œsophagien", "Maladie ulcéreuse peptique", "Gastrite"],
    exams: ["NFS", "Amylase", "Anticorps anti-Helicobacter pylori", "Endoscopie digestive haute"]
  },
  {
    number: 10,
    title: "Douleur abdominale supérieure (âge avancé)",
    patient: {
      name: "M. Bill Brown",
      age: 60,
      gender: "Homme",
      complaint: "douleurs abdominales supérieures"
    },
    vitals: {
      temperature: "37°C",
      fc: "84 bpm",
      fr: "16/min",
      ta: "120/80 mmHg"
    },
    history: {
      main: "Douleurs abdominales supérieures chroniques, aggravées depuis 3 mois (5/10). Vomissements striés de sang, selles noires.",
      additional: "Perte >10 lb/3 mois. Fatigue, étourdissements. Polyarthrite rhumatoïde, prend ibuprofène 600mg/j.",
      social: "Fume 2 pqt/j × 25 ans. 3 verres alcool/j. CAGE 2/4. Père décédé cancer estomac."
    },
    differentials: ["Maladie ulcéreuse peptique", "Cancer de l'estomac", "Gastrite"],
    exams: ["Toucher rectal", "Recherche sang occulte", "NFS", "Endoscopie digestive haute"]
  },
  {
    number: 11,
    title: "Douleur abdominale droite supérieure",
    patient: {
      name: "Mme Linda Thomas",
      age: 50,
      gender: "Femme",
      complaint: "douleur abdominale droite supérieure"
    },
    vitals: {
      temperature: "38°C",
      ta: "130/90 mmHg",
      fc: "100 bpm",
      fr: "16/min"
    },
    history: {
      main: "Douleur QSD depuis 1 mois, irradiant vers épaule droite. Fièvre, nausées. Aggravée par aliments gras.",
      additional: "Perte de poids. Antécédents de calculs biliaires. Hystérectomie il y a 5 ans.",
      social: "Employée de bureau. Ex-fumeuse. Alcool social. Monogame avec mari."
    },
    differentials: ["Cholécystite aiguë", "Colique biliaire"],
    exams: ["NFS", "Tests hépatiques", "Lipase/Amylase", "US abdominale", "CT abdomen"]
  },
  {
    number: 12,
    title: "Douleur abdominale du côté droit",
    patient: {
      name: "Mme Sharon Thompson",
      age: 30,
      gender: "Femme",
      complaint: "douleur abdominale"
    },
    vitals: {
      temperature: "38.3°C",
      ta: "120/80 mmHg",
      fc: "100 bpm",
      fr: "20/min"
    },
    history: {
      main: "Douleur péri-ombilicale depuis 12h, migrée vers QID. Fièvre, nausées, vomissements.",
      additional: "Perte d'appétit. DDR il y a 1 semaine. Pas de pertes vaginales anormales.",
      social: "Architecte. Fume 1 pqt/j × 10 ans. Célibataire, sexuellement active (3 partenaires dernière année)."
    },
    differentials: ["Appendicite aiguë", "Maladie inflammatoire pelvienne"],
    exams: ["Examen pelvien", "NFS", "ECBU", "Prélèvement vaginal", "US pelvienne", "CT abdomen"]
  },
  {
    number: 13,
    title: "Douleur abdominale du côté gauche (urgences)",
    patient: {
      name: "Mme Dana Miller",
      age: 35,
      gender: "Femme",
      complaint: "douleur abdominale gauche"
    },
    vitals: {
      temperature: "38.3°C",
      ta: "120/80 mmHg",
      fc: "100 bpm",
      fr: "20/min"
    },
    history: {
      main: "Douleur abdominale gauche depuis 2 jours. Fièvre, frissons. Dysurie, pollakiurie, urines troubles.",
      additional: "Nausées, vomissements. Antécédents infections urinaires récurrentes. DDR il y a 2 semaines.",
      social: "Enseignante. Ne fume pas. Alcool social. Monogame avec mari depuis 10 ans."
    },
    differentials: ["Pyélonéphrite aiguë", "Maladie inflammatoire pelvienne"],
    exams: ["Examen pelvien", "ECBU avec culture", "Test grossesse", "CT abdominal"]
  },
  {
    number: 14,
    title: "Douleur abdominale du côté gauche",
    patient: {
      name: "M. Kenneth Smith",
      age: 35,
      gender: "Homme",
      complaint: "douleur abdominale gauche"
    },
    vitals: {
      temperature: "38°C",
      ta: "110/70 mmHg",
      fc: "90 bpm",
      fr: "16/min"
    },
    history: {
      main: "Douleur QIG depuis 3 mois, crampes. Diarrhée sanglante 3-4×/jour. Fièvre intermittente.",
      additional: "Perte 15 lb/3 mois. Fatigue. Urgences et ténesme. Pas d'ATCD chirurgicaux.",
      social: "Consultant. Fume 1/2 pqt/j × 10 ans. Alcool occasionnel. Célibataire."
    },
    differentials: ["Maladie inflammatoire intestinale", "Infection urinaire"],
    exams: ["Examens pelvien et rectal", "ECBU", "NFS", "US abdominale", "Coloscopie"]
  },
  {
    number: 15,
    title: "Saignements rectaux/selles noires",
    patient: {
      name: "M. Kevin Brown",
      age: 65,
      gender: "Homme",
      complaint: "saignements rectaux"
    },
    vitals: {
      temperature: "37°C",
      ta: "120/80 mmHg",
      fc: "90 bpm",
      fr: "16/min"
    },
    history: {
      main: "Sang rouge vif dans selles depuis 2 mois. Selles noires occasionnelles. Constipation progressive.",
      additional: "Changement calibre selles. Perte 20 lb/6 mois. Fatigue. Père décédé cancer côlon.",
      social: "Retraité. Ex-fumeur. Alcool modéré. Vit avec épouse."
    },
    differentials: ["Cancer du côlon", "Diverticulose"],
    exams: ["Toucher rectal", "Recherche sang occulte", "NFS", "CT abdomen", "Coloscopie"]
  },
  {
    number: 16,
    title: "Vomissements de sang",
    patient: {
      name: "M. Kevin Brown",
      age: 65,
      gender: "Homme",
      complaint: "vomissements de sang"
    },
    vitals: {
      temperature: "37°C",
      ta: "100/60 mmHg",
      fc: "100 bpm",
      fr: "18/min"
    },
    history: {
      main: "Hématémèse × 2 aujourd'hui (1 tasse sang rouge). Douleur épigastrique depuis 1 mois.",
      additional: "Selles noires. Perte 15 lb/2 mois. Utilisation chronique AINS pour arthrose.",
      social: "Retraité. Fume 2 pqt/j × 40 ans. Alcool 4 verres/j. CAGE 3/4."
    },
    differentials: ["Saignement d'ulcère peptique", "Cancer de l'estomac", "Gastrite aiguë"],
    exams: ["Toucher rectal", "Recherche sang occulte", "NFS", "US abdominale", "Endoscopie urgente"]
  },
  {
    number: 17,
    title: "Vomissements et diarrhée",
    patient: {
      name: "M. Hal Smith",
      age: 25,
      gender: "Homme",
      complaint: "vomissements et diarrhée"
    },
    vitals: {
      temperature: "36.7°C",
      ta: "110/70 mmHg",
      fc: "90 bpm",
      fr: "16/min"
    },
    history: {
      main: "Nausées, vomissements × 10, diarrhée aqueuse × 8 depuis hier. Début 4h après repas restaurant.",
      additional: "Crampes abdominales. Pas de sang dans selles. Collègues malades après même repas.",
      social: "Étudiant. Ne fume pas. Alcool occasionnel. Célibataire."
    },
    differentials: ["Gastro-entérite virale", "Gastro-entérite bactérienne", "Colite pseudomembraneuse"],
    exams: ["NFS", "Électrolytes sériques"]
  },
  {
    number: 18,
    title: "Constipation",
    patient: {
      name: "Mme Nancy King",
      age: 35,
      gender: "Femme",
      complaint: "constipation"
    },
    vitals: {
      temperature: "37°C",
      ta: "120/80 mmHg",
      fc: "84 bpm",
      fr: "16/min"
    },
    history: {
      main: "Constipation depuis 3 mois (1 selle/3-4 jours). Selles dures, effort important.",
      additional: "Intolérance au froid, peau sèche, prise de poids. Thyroïdectomie il y a 2 ans pour goitre.",
      social: "Secrétaire. Ne fume pas. Pas d'alcool. Mariée, 2 enfants."
    },
    differentials: ["Hypothyroïdie", "Constipation médicamenteuse", "Constipation alimentaire"],
    exams: ["Toucher rectal", "TSH, T3, T4", "NFS", "Coloscopie de dépistage"]
  },
  {
    number: 19,
    title: "Fuites urinaires",
    patient: {
      name: "Mme Gloria Peter",
      age: 55,
      gender: "Femme",
      complaint: "fuites urinaires"
    },
    vitals: {
      temperature: "37°C",
      ta: "110/70 mmHg",
      fc: "96 bpm",
      fr: "16/min"
    },
    history: {
      main: "Incontinence urinaire depuis 1 an, aggravée. Fuites lors toux, éternuements, exercice.",
      additional: "4 grossesses, 4 accouchements vaginaux. Ménopause il y a 5 ans. Pas d'HTS.",
      social: "Femme au foyer. Ne fume pas. Pas d'alcool. Mariée."
    },
    differentials: ["Incontinence urinaire d'effort", "Incontinence urinaire d'urgence", "Incontinence urinaire mixte"],
    exams: ["Examen pelvien", "Test d'effort", "ECBU avec culture", "Cystogramme"]
  },
  {
    number: 20,
    title: "Dysfonction érectile",
    patient: {
      name: "M. Richard",
      age: 62,
      gender: "Homme",
      complaint: "érection pénienne faible"
    },
    vitals: {
      temperature: "37°C",
      ta: "170/110 mmHg",
      fc: "96 bpm",
      fr: "16/min"
    },
    history: {
      main: "Dysfonction érectile progressive depuis 2 ans. Érections partielles, perte pendant rapport.",
      additional: "HTA et diabète depuis 20 ans. Prend métoprolol, metformine. Pas d'érections matinales.",
      social: "Comptable. Ex-fumeur. Alcool modéré. Marié depuis 30 ans."
    },
    differentials: ["Dysfonction érectile organique (vasculaire/neurogène)", "DE induite par les médicaments"],
    exams: ["Examen pelvien et pénien", "Glycémie, HbA1c", "Tumescence pénienne nocturne", "Doppler pénien"]
  },
  {
    number: 21,
    title: "Urine foncée",
    patient: {
      name: "M. Adam Smith",
      age: 60,
      gender: "Homme",
      complaint: "urine foncée"
    },
    vitals: {
      temperature: "37°C",
      ta: "110/70 mmHg",
      fc: "90 bpm",
      fr: "18/min"
    },
    history: {
      main: "Hématurie intermittente depuis 3 mois. Jet faible, nycturie, urgences mictionnelles.",
      additional: "Pas de douleur. Perte 10 lb/3 mois. Ex-fumeur (30 paquets-années).",
      social: "Ingénieur retraité. Arrêt tabac il y a 5 ans. Alcool social. Marié."
    },
    differentials: ["Hyperplasie bénigne de la prostate", "Cancer de la prostate", "Cancer de la vessie"],
    exams: ["Toucher rectal", "Examen génital", "ECBU, PSA", "US rénale et vésicale", "CT abdomen", "Cystoscopie"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Abdomen ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Abdomen",
    subcategory: caseData.title,
    context: {
      setting: caseData.number === 13 ? "Service d'urgences" : "Cabinet de médecine générale",
      patient: `${caseData.patient.gender} de ${caseData.patient.age} ans, ${caseData.patient.name}, consultant pour ${caseData.patient.complaint}`
    }
  };

  // Ajouter les signes vitaux
  if (caseData.vitals) {
    // Corriger FR si anormale
    if (caseData.vitals.fr === "100/min" && caseData.number === 9) {
      caseData.vitals.fr = "16/min"; // Correction probable d'une erreur typographique
    }
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
          details: [
            `Apparition et durée [${caseData.history.main.split('.')[0]}]`,
            "Bilan (localisation, irradiation)",
            "Caractère et qualité de la douleur",
            "Degré d'intensité (échelle 1-10)",
            "Éléments associés et facteurs modifiants"
          ]
        },
        {
          id: "a3",
          text: "Symptômes associés et antécédents",
          details: caseData.history.additional.split('.').filter(s => s.trim()).map(s => s.trim())
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
            "Recherche pâleur, ictère",
            "Examen ORL avec abaisse-langue",
            "Palpation ganglions lymphatiques",
            "Examen thyroïde"
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
            title: "Hypothèses diagnostiques",
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
          text: "Plan de prise en charge immédiate",
          details: getManagementPlan(caseData.number)
        }
      ]
    }
  };

  // Ajouter section clôture si pertinente
  if (shouldAddClosure(caseData.number)) {
    json.sections.cloture = {
      weight: 0,
      criteria: [
        {
          id: "c1",
          text: "Questions difficiles du patient",
          content: getPatientQuestions(caseData.number).join('\n')
        }
      ]
    };
  }

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
        "Anamnèse complète avec ABCDE",
        "Examen abdominal détaillé",
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
    titre: `Thieme Abdomen ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.number === 13 ? "Service d'urgences" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    // Corriger FR si nécessaire
    if (caseData.vitals.fr === "100/min" && caseData.number === 9) {
      caseData.vitals.fr = "16/min";
    }
    json.signesVitaux = caseData.vitals;
  }

  json.taches = [
    "Obtenir une anamnèse ciblée",
    "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectal, pelvien, génito-urinaire, hernie inguinale, sein féminin ou réflexe cornéen)",
    "Discuter du diagnostic initial et du plan d'investigation avec le patient",
    "Compléter la note patient après la consultation"
  ];

  return json;
}

// Fonctions auxiliaires
function getSystemsReview(caseNumber) {
  const reviews = {
    9: ["Système gastro-intestinal", "Système urinaire", "Système gynécologique"],
    10: ["Système gastro-intestinal", "Symptômes constitutionnels"],
    11: ["Système gastro-intestinal", "Système hépatobiliaire"],
    12: ["Système gastro-intestinal", "Système gynécologique"],
    13: ["Système urinaire", "Système gynécologique"],
    14: ["Système gastro-intestinal", "Système urinaire"],
    15: ["Système gastro-intestinal", "Symptômes constitutionnels"],
    16: ["Système gastro-intestinal", "Système cardiovasculaire"],
    17: ["Système gastro-intestinal"],
    18: ["Système gastro-intestinal", "Système endocrinien"],
    19: ["Système urinaire", "Système gynécologique"],
    20: ["Système cardiovasculaire", "Système endocrinien", "Système neurologique"],
    21: ["Système urinaire", "Symptômes constitutionnels"]
  };
  return reviews[caseNumber] || ["Système gastro-intestinal"];
}

function getAbdominalExam(caseNumber) {
  const base = [
    "Inspection (cicatrices, distension)",
    "Auscultation (bruits intestinaux)",
    "Percussion (matité, tympanisme)",
    "Palpation superficielle et profonde"
  ];
  
  if ([9, 10, 11].includes(caseNumber)) {
    base.push("Recherche défense et signe de Murphy [sensibilité épigastrique]");
  } else if (caseNumber === 12) {
    base.push("Recherche défense et rebond [sensibilité QID]");
  }
  
  return base;
}

function getSpecificExams(caseNumber) {
  const exams = {
    10: ["Toucher rectal programmé"],
    12: ["Examen pelvien programmé"],
    13: ["Examen pelvien", "Recherche douleur angle costo-vertébral"],
    14: ["Toucher rectal programmé"],
    15: ["Toucher rectal avec recherche sang"],
    16: ["Toucher rectal"],
    18: ["Toucher rectal"],
    19: ["Examen pelvien avec test d'effort"],
    20: ["Examen génital et pénien"],
    21: ["Toucher rectal", "Examen génital"]
  };
  return exams[caseNumber] || [];
}

function getManagementPlan(caseNumber) {
  const plans = {
    13: ["Voie veineuse et réhydratation", "Antibiothérapie IV si pyélonéphrite", "Analgésie"],
    16: ["Stabilisation hémodynamique", "Voie veineuse grand calibre", "Endoscopie urgente"],
    17: ["Réhydratation orale ou IV", "Antiémétiques si besoin", "Repos digestif"],
    default: ["Investigations ambulatoires", "Traitement symptomatique", "Suivi après résultats"]
  };
  return plans[caseNumber] || plans.default;
}

function shouldAddClosure(caseNumber) {
  return [9, 10, 11, 12, 15, 19, 20].includes(caseNumber);
}

function getPatientQuestions(caseNumber) {
  const questions = {
    9: ["Ai-je des ulcères d'estomac comme ma mère?", "Qu'est-ce qu'une endoscopie?"],
    10: ["Recommandez-vous une endoscopie?", "Qu'est-ce qu'une biopsie?"],
    11: ["Vais-je avoir besoin d'une chirurgie?"],
    12: ["Est-ce l'appendicite?"],
    15: ["Est-ce un cancer comme mon père?"],
    19: ["Y a-t-il des exercices pour améliorer cela?"],
    20: ["Les médicaments peuvent-ils causer ce problème?"]
  };
  return questions[caseNumber] || [];
}

function getAttitudeInstructions(caseNumber) {
  const attitudes = {
    9: ["Inquiète pour sa santé"],
    10: ["Fatigué", "Inquiet"],
    11: ["Douleur importante"],
    12: ["Douleur sévère QID", "Anxieuse"],
    13: ["Douleur et fièvre", "Urgence"],
    16: ["Faible", "Anxieux"],
    17: ["Déshydraté", "Fatigué"],
    19: ["Gênée par le problème"],
    20: ["Embarrassé", "Préoccupé"]
  };
  return attitudes[caseNumber] || ["Coopératif"];
}

function getExamInstructions(caseNumber) {
  const instructions = {
    9: ["Sensibilité épigastrique à la palpation"],
    10: ["Sensibilité épigastrique"],
    11: ["Sensibilité QSD, signe de Murphy positif"],
    12: ["Sensibilité QID avec défense"],
    13: ["Sensibilité flanc gauche"],
    15: ["Toucher rectal sensible"],
    16: ["Pâleur", "Hypotension"]
  };
  return instructions[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Reflux gastro-œsophagien": "Brûlures rétrosternales, remontées acides, aggravé position allongée",
    "Maladie ulcéreuse peptique": "Douleur épigastrique, AINS, H. pylori possible",
    "Gastrite": "Douleur épigastrique, utilisation AINS, alcool",
    "Cancer de l'estomac": "Âge, perte poids, méléna, ATCD familiaux",
    "Cholécystite aiguë": "Douleur QSD, fièvre, Murphy positif, ATCD calculs",
    "Colique biliaire": "Douleur QSD post-prandiale, irradiation épaule",
    "Appendicite aiguë": "Migration douleur vers QID, fièvre, défense",
    "Maladie inflammatoire pelvienne": "Femme jeune, sexuellement active, fièvre",
    "Pyélonéphrite aiguë": "Fièvre, douleur flanc, symptômes urinaires",
    "Maladie inflammatoire intestinale": "Diarrhée sanglante, perte poids, âge jeune",
    "Cancer du côlon": "Âge, rectorragies, changement transit, perte poids",
    "Diverticulose": "Âge, saignements, constipation",
    "Saignement d'ulcère peptique": "Hématémèse, AINS, alcool",
    "Gastro-entérite virale": "Début aigu, contexte épidémique",
    "Gastro-entérite bactérienne": "Repas suspect, symptômes collectifs",
    "Hypothyroïdie": "Constipation, intolérance froid, ATCD thyroïde",
    "Incontinence urinaire d'effort": "Fuites à l'effort, multiparité, ménopause",
    "Dysfonction érectile organique": "Diabète, HTA, absence érections matinales",
    "Hyperplasie bénigne de la prostate": "Symptômes obstructifs, âge",
    "Cancer de la vessie": "Hématurie, tabagisme, âge"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Reflux gastro-œsophagien": "pH-métrie, endoscopie si alarme",
    "Maladie ulcéreuse peptique": "Endoscopie, test H. pylori",
    "Gastrite": "Endoscopie avec biopsies",
    "Cancer de l'estomac": "Endoscopie avec biopsies",
    "Cholécystite aiguë": "US abdominale, NFS, CRP",
    "Appendicite aiguë": "CT abdomen, NFS",
    "Pyélonéphrite aiguë": "ECBU, hémocultures, US rénale",
    "Maladie inflammatoire intestinale": "Coloscopie avec biopsies",
    "Cancer du côlon": "Coloscopie, CT TAP",
    "Incontinence urinaire d'effort": "Test d'effort, urodynamique",
    "Dysfonction érectile organique": "Glycémie, testostérone, Doppler",
    "Cancer de la vessie": "Cystoscopie, cytologie urinaire"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    9: ["Ne pas reconnaître le RGO typique", "Oublier impact psychosocial"],
    10: ["Manquer les signes d'alarme (perte poids, méléna)", "Ne pas évoquer cancer"],
    11: ["Confondre avec colique biliaire simple", "Oublier complications"],
    12: ["Ne pas faire examen pelvien chez femme jeune", "Manquer MIP"],
    13: ["Confondre cystite et pyélonéphrite", "Oublier test grossesse"],
    14: ["Ne pas évoquer MICI devant diarrhée sanglante", "Manquer examens"],
    15: ["Minimiser rectorragies chez sujet âgé", "Ne pas faire coloscopie"],
    16: ["Ne pas reconnaître urgence hémorragique", "Retarder endoscopie"],
    17: ["Sur-investiguer gastro-entérite simple", "Ne pas réhydrater"],
    18: ["Manquer hypothyroïdie post-thyroïdectomie"],
    19: ["Ne pas examiner prolapsus", "Oublier test d'effort"],
    20: ["Ne pas explorer causes organiques", "Oublier impact couple"],
    21: ["Minimiser hématurie", "Ne pas faire cystoscopie"]
  };
  return pieges[caseNumber] || ["Anamnèse incomplète", "Examen insuffisant"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-abdomen');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-abdomen');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Abdomen...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Abdomen-${caseData.number} - ${caseData.title.replace(/[()]/g, '').replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
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