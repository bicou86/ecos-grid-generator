const fs = require('fs');
const path = require('path');

// Les 6 cas Thieme Musculosquelettique (cas 33 à 38)
const cases = [
  {
    number: 33,
    title: "Douleur à l'épaule droite",
    patient: {
      name: "M. Jerry Roberts",
      age: 20,
      gender: "Homme",
      complaint: "douleur à l'épaule droite"
    },
    vitals: {
      fc: "64 bpm",
      ta: "110/70 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Douleur épaule droite depuis 3 jours, apparue en nageant. Chaleur, gonflement léger. Douleur sourde continue 5/10, aggravée en levant bras (devient sévère). Soulagée par ibuprofène.",
      additional: "Inconfort extrême pour mettre t-shirt et se coiffer. ATCD déchirure coiffe rotateurs il y a 2 ans.",
      social: "Équipe natation université. Boit socialement. Sexuellement actif avec petite amie exclusive."
    },
    differentials: ["Déchirure de la coiffe des rotateurs", "Luxation de l'épaule", "Fracture clavicule/scapula/humérus"],
    exams: ["Radiographie épaule droite (AP et latérale)", "Radiographie des deux épaules", "IRM épaule droite"]
  },
  {
    number: 34,
    title: "Douleur au genou gauche post-traumatique",
    patient: {
      name: "M. George Clark",
      age: 65,
      gender: "Homme",
      complaint: "douleur au genou gauche"
    },
    vitals: {
      fc: "64 bpm",
      ta: "110/70 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Torsion genou gauche il y a 1 semaine en courant. Douleur sévère initiale, arrêt course. Genou était chaud, rouge, gonflé, sensible. Symptômes progressivement diminués.",
      additional: "Douleur légère persistante côté interne genou, constante, localisée, 4/10. Aggravée par marche/course, soulagée par repos. Ibuprofène efficace.",
      social: "Retraité. Ex-fumeur depuis 15 ans (1 pqt/j × 10 ans). Boit socialement. Pas de partenaires sexuels."
    },
    differentials: ["Déchirure du ménisque médial", "Lésion du ligament collatéral médial"],
    exams: ["Radiographie genou gauche (AP et latérale)", "Radiographie des deux genoux", "IRM genou gauche"]
  },
  {
    number: 35,
    title: "Douleur à la cheville post-traumatique",
    patient: {
      name: "Mme Luisa Landro",
      age: 27,
      gender: "Femme",
      complaint: "douleur à la cheville"
    },
    vitals: {
      fc: "64 bpm",
      ta: "110/70 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Torsion cheville droite il y a 2h en patinant. Douleur continue, agonisante 9/10, localisée. Ne peut pas mettre poids sur pied, ne peut pas marcher.",
      additional: "Cheville rouge et gonflée. Amenée aux urgences par amis. DDR il y a 2 semaines.",
      social: "Ingénieure électricienne. Boit socialement."
    },
    differentials: ["Entorse de la cheville", "Fracture de Pott", "Fracture du calcanéum"],
    exams: ["Radiographie cheville droite (AP et latérale)", "Radiographie des deux chevilles", "CT ou IRM cheville droite"]
  },
  {
    number: 36,
    title: "Douleurs articulaires avec fièvre",
    patient: {
      name: "Mme Nancy Chuck",
      age: 50,
      gender: "Femme",
      complaint: "douleurs articulaires"
    },
    vitals: {
      fc: "84 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "38°C"
    },
    history: {
      main: "Douleurs articulaires mains et genoux depuis 3 mois. Début progressif, non traumatique. Raideur matinale 30 min, amélioration avec mouvement.",
      additional: "Douleur sourde 4/10. Ulcères langue récents. Perte 8 lb/6 mois. G1P1 césarienne.",
      social: "Fume 10 cigarettes/jour. Boit socialement. Sexuellement active avec mari. Mère a PR."
    },
    differentials: ["Polyarthrite rhumatoïde", "Lupus érythémateux systémique"],
    exams: ["NFS avec formule, VS, CRP", "Facteur rhumatoïde, AAN, anti-ADN, anti-CCP", "Radiographie mains (AP et latérale)", "IRM genoux", "Aspiration articulaire pour analyse liquide synovial"]
  },
  {
    number: 37,
    title: "Douleur lombaire aiguë",
    patient: {
      name: "M. Smith",
      age: 50,
      gender: "Homme",
      complaint: "douleurs lombaires"
    },
    vitals: {
      fc: "84 bpm",
      ta: "110/70 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Douleur lombaire sévère depuis quelques heures après avoir soulevé boîte lourde au travail. Irradiation jambe gauche comme choc électrique, constante 4/10, aggravée par mouvement (8/10).",
      additional: "Jambe gauche parfois engourdie et faible. AINS soulagent. Pas de troubles sphinctériens. Perte 6 lb/mois. Jet urinaire faible. ATCD cancer prostate sous radiothérapie il y a 4 ans.",
      social: "Fume 1 pqt/j × 25 ans. Pas sexuellement actif."
    },
    differentials: ["Hernie discale lombaire", "Métastases cancer prostate (fracture pathologique)", "Entorse muscles du dos"],
    exams: ["Examen pelvien et rectal", "PSA", "Radiographie colonne lombo-sacrée (AP et latérale)", "IRM", "Scintigraphie osseuse"]
  },
  {
    number: 38,
    title: "Douleur cervicale chronique",
    patient: {
      name: "M. Jerry Roberts",
      age: 30,
      gender: "Homme",
      complaint: "douleur au cou"
    },
    vitals: {
      fc: "64 bpm",
      ta: "110/70 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Douleur cervicale depuis 3 mois, début progressif. Irradiation bras gauche comme choc électrique 6/10. Soulagée par ibuprofène.",
      additional: "Picotements et engourdissement bras gauche, faiblesse préhension main. ATCD chute de cheval avec fracture cervicale mineure.",
      social: "Retraité précoce. Ne fume pas. Boit socialement. Mère a arthrose."
    },
    differentials: ["Hernie discale cervicale", "Fracture colonne cervicale"],
    exams: ["Radiographie colonne cervicale (AP et latérale)", "IRM colonne cervicale"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme MSQ ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Musculosquelettique",
    subcategory: caseData.title,
    context: {
      setting: caseData.number === 35 || caseData.number === 37 ? "Service d'urgences" : "Cabinet de médecine générale",
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
          text: "Analyse de la douleur (ABCDE)",
          details: getPainAnalysisDetails(caseData)
        },
        {
          id: "a3",
          text: "Mécanisme de survenue et contexte",
          details: getMechanismDetails(caseData)
        },
        {
          id: "a4",
          text: "Signes inflammatoires et symptômes associés",
          details: getAssociatedSymptoms(caseData)
        },
        {
          id: "a5",
          text: "Antécédents musculosquelettiques",
          details: getMSQHistory(caseData)
        },
        {
          id: "a6",
          text: "Histoire sociale et facteurs de risque",
          details: caseData.history.social.split('.').filter(s => s.trim()).map(s => s.trim())
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
          text: "Inspection de la zone affectée",
          details: getInspectionDetails(caseData.number)
        },
        {
          id: "e3",
          text: "Palpation et recherche de sensibilité",
          details: getPalpationDetails(caseData.number)
        },
        {
          id: "e4",
          text: "Évaluation vasculo-nerveuse",
          details: getNeuroVascularExam(caseData.number)
        },
        {
          id: "e5",
          text: "Amplitude de mouvement et force musculaire",
          details: getRangeOfMotion(caseData.number)
        },
        {
          id: "e6",
          text: "Tests spéciaux orthopédiques",
          details: getSpecialTests(caseData.number)
        }
      ]
    },
    management: {
      weight: 0.25,
      criteria: [
        {
          id: "m1",
          text: "Diagnostics différentiels musculosquelettiques",
          ddSection: {
            title: "Hypothèses diagnostiques à considérer",
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
          text: "Examens d'imagerie appropriés",
          details: caseData.exams
        },
        {
          id: "m3",
          text: "Plan de prise en charge orthopédique",
          details: getManagementPlan(caseData)
        },
        {
          id: "m4",
          text: "Conseils et restrictions d'activité",
          details: getActivityRestrictions(caseData.number)
        }
      ]
    }
  };

  // Ajouter section clôture
  json.sections.cloture = {
    weight: 0,
    criteria: [
      {
        id: "c1",
        text: "Questions du patient",
        content: getPatientQuestions(caseData.number).join('\n')
      },
      {
        id: "c2",
        text: "Conseils spécifiques",
        content: getSpecificAdvice(caseData.number)
      }
    ]
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
        antecedents: caseData.history.additional.split('.').filter(s => s.trim()),
        contexteSocial: caseData.history.social.split('.').filter(s => s.trim())
      },
      simulation: {
        attitude: getPatientAttitude(caseData.number),
        durantExamen: getExamInstructions(caseData.number)
      },
      inquietudes: {
        principales: getPatientQuestions(caseData.number)
      }
    },
    informationsExpert: {
      titre: "Informations pour l'expert",
      pointsCles: [
        `Cas musculosquelettique: ${caseData.title}`,
        `Patient: ${caseData.patient.gender} de ${caseData.patient.age} ans`,
        "Anamnèse complète de la douleur",
        "Examen orthopédique systématique",
        "Tests spéciaux appropriés"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter informations théoriques pour cas spécifiques
  if (caseData.number === 36) { // Douleurs articulaires rhumatismales
    json.annexes.theoriePratique = {
      titre: "Douleur articulaire rhumatismale",
      sections: [
        {
          titre: "Distinction douleur mécanique vs inflammatoire",
          points: [
            "Mécanique: aggravée mouvement, soulagée repos (arthrose)",
            "Inflammatoire: pire matin, amélioration avec mouvement (PR, LES)"
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
    titre: `Thieme MSQ ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.number === 35 || caseData.number === 37 ? "Service d'urgences" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  json.taches = [
    "Obtenir une anamnèse ciblée",
    "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectal, pelvien, génito-urinaire, hernie inguinale, sein féminin ou réflexe cornéen)",
    "Discuter de votre impression diagnostique initiale et de votre plan d'investigation avec le patient",
    "Compléter la note patient après la consultation"
  ];

  return json;
}

// Fonctions auxiliaires
function getPainAnalysisDetails(caseData) {
  const details = [];
  const main = caseData.history.main;
  
  if (main.includes('depuis')) {
    details.push("Début et durée [" + main.match(/depuis [^.]+/)?.[0] + "]");
  }
  if (main.includes('/10')) {
    details.push("Intensité [" + main.match(/\d+\/10/)?.[0] + "]");
  }
  details.push("Localisation et irradiation");
  details.push("Caractère de la douleur");
  details.push("Facteurs aggravants et soulageants");
  
  return details;
}

function getMechanismDetails(caseData) {
  const mechanisms = {
    33: ["Survenue en nageant", "Pas de traumatisme direct", "Antécédent déchirure coiffe"],
    34: ["Torsion en courant", "Douleur immédiate sévère", "Arrêt activité sportive"],
    35: ["Torsion en patinant il y a 2h", "Incapacité de marcher", "Transport par amis"],
    36: ["Début progressif non traumatique", "Évolution sur 3 mois", "Pattern inflammatoire"],
    37: ["Soulèvement charge lourde", "Douleur immédiate", "Au travail"],
    38: ["Début progressif", "Pas de traumatisme récent", "ATCD chute cheval"]
  };
  return mechanisms[caseData.number] || [];
}

function getAssociatedSymptoms(caseData) {
  const symptoms = {
    33: ["Chaleur locale", "Gonflement léger", "Difficulté activités quotidiennes"],
    34: ["Chaleur initiale", "Rougeur", "Gonflement progressivement résolu"],
    35: ["Rougeur", "Gonflement important", "Impossibilité mise en charge"],
    36: ["Raideur matinale 30 min", "Ulcères buccaux", "Perte poids 8 lb/6 mois", "Fièvre"],
    37: ["Irradiation jambe gauche", "Engourdissement", "Faiblesse", "Pas troubles sphinctériens"],
    38: ["Irradiation bras gauche", "Picotements", "Engourdissement", "Faiblesse préhension"]
  };
  return symptoms[caseData.number] || [];
}

function getMSQHistory(caseData) {
  const history = [];
  const addInfo = caseData.history.additional;
  
  if (addInfo.includes('ATCD')) {
    const atcd = addInfo.match(/ATCD[^.]+/)?.[0];
    if (atcd) history.push(atcd);
  }
  if (addInfo.includes('il y a')) {
    const past = addInfo.match(/il y a[^.]+/g);
    if (past) history.push(...past);
  }
  
  return history.length > 0 ? history : ["Pas d'antécédents significatifs"];
}

function getInspectionDetails(caseNumber) {
  const inspections = {
    33: ["Érythème épaule droite", "Léger gonflement", "Pas de déformation"],
    34: ["Pas d'érythème actuel", "Pas de gonflement visible", "Pas de déformation"],
    35: ["Érythème cheville droite", "Gonflement important", "Position antalgique"],
    36: ["Érythème genoux bilatéral", "Pas de gonflement articulaire", "Pas de déformations"],
    37: ["Pas de déformation visible", "Position antalgique", "Patient allongé"],
    38: ["Pas d'érythème", "Pas de gonflement", "Port de tête antalgique"]
  };
  return inspections[caseNumber] || [];
}

function getPalpationDetails(caseNumber) {
  const palpations = {
    33: ["Sensibilité diffuse épaule droite", "Chaleur locale", "Coiffe rotateurs douloureuse"],
    34: ["Sensibilité côté médial genou", "Pas de chaleur", "Ligaments testables"],
    35: ["Sensibilité diffuse cheville", "Chaleur locale", "Œdème palpable"],
    36: ["Sensibilité genoux bilatérale", "Articulations mains raides", "Pas d'épanchement"],
    37: ["Sensibilité lombaire sévère", "Contracture paravertébrale", "Point trigger"],
    38: ["Sensibilité cervicale", "Contracture paravertébrale", "Processus épineux douloureux"]
  };
  return palpations[caseNumber] || [];
}

function getNeuroVascularExam(caseNumber) {
  const exams = {
    33: ["Pouls brachial et radial présents", "Sensation intacte", "Force 4/5", "ROT 2+"],
    34: ["Pouls poplité et tibial présents", "Sensation intacte", "Force 5/5", "ROT 2+"],
    35: ["Pouls tibial et pédieux présents", "Sensation normale", "Force 5/5", "ROT 2+"],
    36: ["Circulation périphérique normale", "Pas de phénomène Raynaud", "Sensation intacte"],
    37: ["Déficit sensitif jambe gauche", "Force 4/5 jambe gauche", "ROT 2+", "Babinski négatif"],
    38: ["Déficit sensitif bras gauche", "Force 3/5 préhension", "ROT intacts"]
  };
  return exams[caseNumber] || [];
}

function getRangeOfMotion(caseNumber) {
  const rom = {
    33: ["Flexion/extension intactes", "Abduction limitée douloureuse", "Rotation externe limitée"],
    34: ["Flexion/extension complètes", "Douleur en charge", "Stabilité préservée"],
    35: ["Flexion dorsale/plantaire impossibles", "Éversion/inversion limitées", "Non testable en charge"],
    36: ["Amplitude mains limitée", "Genoux amplitude complète mais douloureuse", "Raideur matinale"],
    37: ["Flexion lombaire très limitée", "Extension douloureuse", "Latéroflexion restreinte"],
    38: ["Rotation cervicale limitée", "Flexion/extension douloureuses", "Latéroflexion gauche limitée"]
  };
  return rom[caseNumber] || [];
}

function getSpecialTests(caseNumber) {
  const tests = {
    33: ["Test de Dugas positif", "Test du bras tombant positif", "Test conflit sous-acromial"],
    34: ["Test McMurray positif (ménisque médial)", "Test stress valgus positif", "Tiroir antérieur négatif"],
    35: ["Test tiroir antérieur cheville", "Test stress varus/valgus", "Test Thompson négatif"],
    36: ["Pas de tests spéciaux articulaires", "Recherche points trigger", "Évaluation pattern inflammatoire"],
    37: ["Test Lasègue positif gauche à 30°", "Test neurologique complet", "Pas de queue de cheval"],
    38: ["Test Spurling positif", "Test compression/distraction", "Évaluation neurologique membre supérieur"]
  };
  return tests[caseNumber] || [];
}

function getManagementPlan(caseData) {
  const plans = {
    33: ["Repos relatif", "AINS", "Glace 20 min 3-4×/jour", "Physiothérapie", "Éviter natation temporairement"],
    34: ["RICE (repos, glace, compression, élévation)", "AINS", "Attelle genou", "Physiothérapie progressive"],
    35: ["Immobilisation urgente", "Radiographie urgente", "AINS/antalgiques", "Béquilles", "Plâtre si fracture"],
    36: ["AINS réguliers", "Référence rhumatologie", "Physiothérapie", "Éducation patient", "Suivi serré"],
    37: ["Analgésie urgente", "Repos strict initial", "Référence neurochirurgie si déficit", "Physiothérapie après phase aiguë"],
    38: ["AINS", "Collier cervical souple", "Physiothérapie", "Ergonomie poste travail", "IRM si pas amélioration"]
  };
  return plans[caseData.number] || ["Plan adapté au diagnostic"];
}

function getActivityRestrictions(caseNumber) {
  const restrictions = {
    33: ["Pas de natation 2-4 semaines", "Éviter mouvements au-dessus tête", "Port charges limité", "Retour progressif sport"],
    34: ["Marche avec appui selon tolérance", "Pas de course 4-6 semaines", "Renforcement quadriceps", "Proprioception"],
    35: ["Aucun appui initial", "Béquilles obligatoires", "Surélévation membre", "Mobilisation selon évolution"],
    36: ["Activité selon tolérance", "Exercices amplitude douce", "Éviter surmenage", "Repos si poussée"],
    37: ["Repos lit 24-48h si sévère", "Pas de port charges", "Mobilisation progressive", "École du dos"],
    38: ["Éviter positions prolongées", "Ergonomie travail", "Exercices cervicaux doux", "Pas de sports contact"]
  };
  return restrictions[caseNumber] || [];
}

function getPatientQuestions(caseNumber) {
  const questions = {
    33: ["[Pensez-vous que c'est une autre déchirure de ma coiffe des rotateurs?]", "[Puis-je participer à la compétition de natation demain?]"],
    34: [],
    35: ["[Pensez-vous que c'est une fracture?]", "[Que pensez-vous de faire une IRM pour ma cheville?]", "[Est-ce que cela nécessitera une chirurgie?]"],
    36: [],
    37: ["[Pourriez-vous me prescrire des analgésiques tout de suite?]", "[Pourquoi ma jambe fait-elle mal?]"],
    38: ["[Ai-je la même fracture?]"]
  };
  return questions[caseNumber] || [];
}

function getSpecificAdvice(caseNumber) {
  const advice = {
    33: "Repos sportif obligatoire. Rééducation progressive. Consultation si aggravation.",
    34: "Protection articulaire. Renforcement musculaire. Retour sport progressif.",
    35: "Immobilisation stricte. Radiographie urgente. Chirurgie selon résultats.",
    36: "Suivi rhumatologique. Observance traitement. Activité physique adaptée.",
    37: "Urgence si déficit neurologique. École du dos. Perte poids si surcharge.",
    38: "Ergonomie cervicale. Physiothérapie régulière. IRM si persistance."
  };
  return advice[caseNumber] || "";
}

function getPatientAttitude(caseNumber) {
  const attitudes = {
    33: ["Sportif inquiet pour compétition", "Douleur modérée mais gênante"],
    34: ["Patient coopératif", "Inquiet pour reprise sport"],
    35: ["Très douloureuse", "Anxieuse", "Ne peut pas marcher"],
    36: ["Fatiguée par symptômes chroniques", "Coopérative"],
    37: ["Douleur extrême", "Demande analgésiques urgents", "Position antalgique"],
    38: ["Inquiet récidive fracture", "Gêné dans activités quotidiennes"]
  };
  return attitudes[caseNumber] || ["Patient coopératif"];
}

function getExamInstructions(caseNumber) {
  const instructions = {
    33: ["Exprimer douleur sévère à l'abduction", "Laisser tomber bras si test bras tombant", "Rouge sur épaule pour érythème"],
    34: ["Sensibilité côté médial genou", "Douleur aux tests ligamentaires", "Coopératif pour manœuvres"],
    35: ["Sensibilité extrême cheville", "Impossibilité mobilisation", "Rouge sur cheville pour érythème"],
    36: ["Sensibilité genoux", "Raideur doigts", "Rouge sur genoux pour érythème"],
    37: ["Douleur lombaire extrême", "Lasègue positif à 30-40°", "Faiblesse jambe gauche"],
    38: ["Sensibilité cervicale", "Spurling provoque douleur irradiée", "Sensation diminuée bras gauche"]
  };
  return instructions[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Déchirure de la coiffe des rotateurs": "ATCD déchirure, douleur abduction, test bras tombant positif, nageur",
    "Luxation de l'épaule": "Douleur sévère, limitation mouvement, test Dugas positif",
    "Fracture clavicule/scapula/humérus": "Traumatisme, douleur sévère, impotence fonctionnelle",
    "Déchirure du ménisque médial": "Torsion genou, douleur médiale, McMurray positif, blocage",
    "Lésion du ligament collatéral médial": "Torsion genou, douleur médiale, stress valgus positif",
    "Entorse de la cheville": "Torsion cheville, œdème, douleur, impotence fonctionnelle",
    "Fracture de Pott": "Traumatisme torsion, douleur sévère, impossibilité appui",
    "Fracture du calcanéum": "Chute hauteur, douleur talon, œdème important",
    "Polyarthrite rhumatoïde": "Raideur matinale, pattern symétrique, ATCD familial, fièvre",
    "Lupus érythémateux systémique": "Ulcères buccaux, perte poids, fièvre, atteinte multi-systémique",
    "Hernie discale lombaire": "Effort déclenchant, irradiation, Lasègue positif, déficit neurologique",
    "Métastases cancer prostate": "ATCD cancer prostate, perte poids, douleur osseuse",
    "Entorse muscles du dos": "Effort, douleur musculaire, pas de déficit neurologique",
    "Hernie discale cervicale": "Irradiation membre supérieur, déficit neurologique, Spurling positif",
    "Fracture colonne cervicale": "ATCD fracture, douleur osseuse, déficit neurologique"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Déchirure de la coiffe des rotateurs": "IRM épaule, arthro-IRM si doute",
    "Luxation de l'épaule": "Radiographie épaule face et profil",
    "Fracture clavicule/scapula/humérus": "Radiographie épaule, CT si complexe",
    "Déchirure du ménisque médial": "IRM genou, arthroscopie diagnostique",
    "Lésion du ligament collatéral médial": "IRM genou, radiographie stress",
    "Entorse de la cheville": "Radiographie cheville (critères Ottawa)",
    "Fracture de Pott": "Radiographie cheville face/profil/mortaise",
    "Fracture du calcanéum": "Radiographie pied, CT pour bilan",
    "Polyarthrite rhumatoïde": "FR, anti-CCP, radiographies mains",
    "Lupus érythémateux systémique": "AAN, anti-ADN, complément, biopsie rénale",
    "Hernie discale lombaire": "IRM lombaire, EMG si doute",
    "Métastases cancer prostate": "PSA, scintigraphie osseuse, IRM",
    "Entorse muscles du dos": "Radiographie si trauma, sinon clinique",
    "Hernie discale cervicale": "IRM cervicale, EMG membre supérieur",
    "Fracture colonne cervicale": "Radiographie, CT cervical, IRM si déficit"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    33: ["Ne pas tester nerf axillaire", "Oublier ATCD déchirure", "Autoriser sport trop tôt"],
    34: ["Confondre ménisque et ligament", "Manquer lésion associée", "Mauvaise technique tests"],
    35: ["Ne pas appliquer critères Ottawa", "Oublier examen neurovasculaire", "Mobilisation excessive"],
    36: ["Manquer pattern inflammatoire", "Ne pas évoquer connectivite", "Oublier bilan auto-immun"],
    37: ["Manquer syndrome queue cheval", "Ne pas évoquer métastases", "Analgésie insuffisante"],
    38: ["Manquer déficit neurologique", "Oublier ATCD fracture", "Ne pas tester Spurling"]
  };
  return pieges[caseNumber] || ["Examen incomplet", "Manquer red flags"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-msq');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-msq');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Musculosquelettique...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-MSQ-${caseData.number} - ${caseData.title.replace(/[()]/g, '').replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
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