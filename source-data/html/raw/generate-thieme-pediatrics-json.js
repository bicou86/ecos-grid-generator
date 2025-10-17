const fs = require('fs');
const path = require('path');

// Les 5 cas Thieme Pédiatrie (cas 28 à 32)
const cases = [
  {
    number: 28,
    title: "Fièvre chez nourrisson (consultation téléphonique)",
    patient: {
      name: "Rose David",
      age: 1,
      ageUnit: "an",
      gender: "Fille",
      complaint: "fièvre",
      parent: "Mme Morny David"
    },
    vitals: {
      temperature: "38.3°C"
    },
    history: {
      main: "Fièvre depuis 5 jours avec rhume banal, rhinorrhée, toux sèche légère. Fièvre augmentée depuis hier (101°F), peu de réponse au Tylenol. Tire sur oreille, difficultés allaitement, troubles sommeil.",
      additional: "Épisode similaire il y a 3 mois guéri. Va à la garderie. Développement: dit 'maman' et 'papa', s'assoit sans soutien. Dernière visite contrôle il y a 1 mois normale.",
      social: "Vit avec ses deux parents. Mère a asthme bronchique. Grossesse à terme, accouchement naturel. Vaccinations à jour."
    },
    differentials: ["Otite moyenne", "Infection voies respiratoires inférieures", "Asthme bronchique"],
    exams: ["Examen physique et otoscopie", "NFS avec différentiel", "Radiographie thoracique", "Envisager nébuliseur si sifflements"],
    isPhoneConsult: true
  },
  {
    number: 29,
    title: "Fièvre et diarrhée chez nourrisson",
    patient: {
      name: "Tom Smith",
      age: 6,
      ageUnit: "mois",
      gender: "Garçon",
      complaint: "fièvre et diarrhée",
      parent: "Mme Lora Smith"
    },
    vitals: {
      temperature: "38°C"
    },
    history: {
      main: "Diarrhée depuis 2 jours, 6-8 selles/jour aqueuses jaunâtres sans sang. Déshydratation: bouche sèche, soif, oligurie. Vomissements ce matin (eau et mucus). Faible et somnolent.",
      additional: "Contact avec cousin malade il y a quelques jours. Allaite normalement, introduction jus cette semaine. Développement: s'assoit avec soutien, transfère objets, anxiété étrangers.",
      social: "Vit avec parents. Grossesse normale, césarienne à terme. Dernière visite contrôle il y a 3 mois normale. Vaccinations à jour."
    },
    differentials: ["Diarrhée virale/bactérienne", "Malabsorption"],
    exams: ["Examen physique", "Électrolytes", "NFS"]
  },
  {
    number: 30,
    title: "Énurésie nocturne",
    patient: {
      name: "Kelci Miller",
      age: 5,
      ageUnit: "ans",
      gender: "Fille",
      complaint: "mouille le lit",
      parent: "Mme Fisher Miller"
    },
    vitals: null,
    history: {
      main: "Mouille le lit 1-2×/nuit, 2-3 nuits/semaine. Draps trempés. Propre à 2.5 ans mais jamais continente longtemps. Continente jour, pas dysurie.",
      additional: "Restrictions liquides et miction avant coucher aident parfois. Dort chez grand-mère quelques nuits/semaine (mère travaille nuit). Gênée, évite dormir avec fratrie.",
      social: "Parents compréhensifs. Père mouillait lit jusqu'à 9 ans. Constipation occasionnelle, régime pauvre fibres, mange beaucoup fromage. Dernière visite il y a 2 mois normale."
    },
    differentials: ["Énurésie nocturne primaire"],
    exams: ["Examen physique", "Analyse d'urine"]
  },
  {
    number: 31,
    title: "Ictère néonatal (consultation téléphonique)",
    patient: {
      name: "Matthew Steve",
      age: 4,
      ageUnit: "jours",
      gender: "Garçon",
      complaint: "yeux et peau jaunâtres",
      parent: "Mme Susan Steve"
    },
    vitals: null,
    history: {
      main: "Ictère apparu J2, aggravé depuis. Yeux et peau jaunes, selles plus foncées. Tète bien, pas faible, pas fièvre. Né par césarienne en bonne santé.",
      additional: "Mère A-, bébé A+, père A+. Injection post-partum car Rh-. Grossesse normale jusqu'aux derniers mois (HTA → césarienne à 8 mois). G2P2, première fille 4 ans en santé.",
      social: "Vit avec parents. Père a ulcères peptiques. Maison sans fumée."
    },
    differentials: ["Ictère physiologique", "Incompatibilité Rh"],
    exams: ["NFS et groupage sanguin", "Bilirubine totale et indirecte", "Bilan hépatique complet"],
    isPhoneConsult: true
  },
  {
    number: 32,
    title: "Perte de poids chez enfant",
    patient: {
      name: "Scott Christopher",
      age: 8,
      ageUnit: "ans",
      gender: "Garçon",
      complaint: "perte de poids",
      parent: "M. Williams Christopher"
    },
    vitals: null,
    history: {
      main: "Perte 5 lb en 3 mois malgré polyphagie. Polydipsie, polyurie, nycturie 1-2×/nuit. Courbe croissance montre déclin.",
      additional: "Parents divorcés il y a 1 an, mère partie. Père occupé, peu de temps pour s'occuper de l'enfant. Dernière visite il y a 6 mois normale.",
      social: "Vit avec père seul. Mère diabétique depuis 10 ans, hypothyroïdie, fumeuse. Né à 8 mois par césarienne, séjour USIN. Retard marche (3 ans) et propreté (3.5 ans)."
    },
    differentials: ["Diabète sucré type 1", "Négligence envers l'enfant"],
    exams: ["Examen physique", "Glycémie à jeun et HbA1c", "Analyse d'urine et NFS"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Pédiatrie ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit}`,
    category: "Thieme Pédiatrie",
    subcategory: caseData.title,
    context: {
      setting: caseData.isPhoneConsult ? "Consultation téléphonique" : "Cabinet de médecine générale",
      patient: `${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit}, ${caseData.patient.name}, ${caseData.patient.parent} consulte pour ${caseData.patient.complaint}`
    }
  };

  // Ajouter les signes vitaux si disponibles
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
          details: getAnamnesisDetails(caseData)
        },
        {
          id: "a3",
          text: "Recherche diagnostique différentielle",
          details: getDifferentialQuestions(caseData.number)
        },
        {
          id: "a4",
          text: "Antécédents et développement de l'enfant",
          details: getDevelopmentHistory(caseData)
        },
        {
          id: "a5",
          text: "Histoire sociale et familiale",
          details: caseData.history.social.split('.').filter(s => s.trim()).map(s => s.trim())
        },
        {
          id: "a6",
          text: "Revue des systèmes pédiatriques",
          details: getPediatricSystemsReview(caseData.number)
        }
      ]
    },
    examen: {
      weight: 0.25,
      criteria: getExamCriteria(caseData)
    },
    management: {
      weight: 0.25,
      criteria: [
        {
          id: "m1",
          text: "Diagnostics différentiels pédiatriques",
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
          text: "Examens complémentaires appropriés à l'âge",
          details: caseData.exams
        },
        {
          id: "m3",
          text: "Plan de prise en charge pédiatrique",
          details: getManagementPlan(caseData)
        },
        {
          id: "m4",
          text: "Conseils aux parents",
          details: getParentalAdvice(caseData.number)
        }
      ]
    }
  };

  // Ajouter section clôture avec questions des parents
  json.sections.cloture = {
    weight: 0,
    criteria: [
      {
        id: "c1",
        text: "Questions des parents",
        content: getParentQuestions(caseData.number).join('\n')
      },
      {
        id: "c2",
        text: "Conseils spécifiques et éducation",
        content: getSpecificAdvice(caseData.number)
      }
    ]
  };

  // Ajouter les annexes
  json.annexes = {
    scenarioPatienteStandardisee: {
      titre: "Instructions pour le parent standardisé",
      nom: caseData.patient.parent,
      enfant: `${caseData.patient.name}, ${caseData.patient.age} ${caseData.patient.ageUnit}`,
      contexte: json.context.setting,
      motifConsultation: {
        plaintePrincipale: caseData.patient.complaint,
        autreChose: caseData.history.main
      },
      histoireActuelle: {
        symptomesPrincipaux: caseData.history.main.split('.').filter(s => s.trim()),
        développement: caseData.history.additional.split('.').filter(s => s.trim()),
        contexteSocial: caseData.history.social.split('.').filter(s => s.trim())
      },
      simulation: {
        attitude: getParentAttitude(caseData.number),
        durantConsultation: getConsultationInstructions(caseData.number)
      },
      inquietudes: {
        principales: getParentQuestions(caseData.number)
      }
    },
    informationsExpert: {
      titre: "Informations pour l'expert",
      pointsCles: [
        `Cas pédiatrique: ${caseData.title}`,
        `Enfant: ${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit}`,
        "Anamnèse adaptée à l'âge",
        caseData.isPhoneConsult ? "Consultation téléphonique - pas d'examen physique" : "Examen physique pédiatrique",
        "Communication avec le parent"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter conseils spécifiques selon le cas
  if (caseData.number === 30) { // Énurésie
    json.annexes.theoriePratique = {
      titre: "Traitement de l'énurésie nocturne",
      sections: [
        {
          titre: "Approches non pharmaceutiques",
          points: [
            "Surveiller l'apport liquidien",
            "Éviter chocolat, cola, thé, café",
            "Liquides minimaux 3h avant coucher",
            "Miction avant coucher",
            "Alarme d'énurésie",
            "Renforcement positif (tableau étoiles)",
            "Traiter constipation (fibres++)"
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
    titre: `Thieme Pédiatrie ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit}`,
    contexte: caseData.isPhoneConsult ? "Consultation téléphonique" : "Cabinet de médecine générale",
    description: `${caseData.patient.parent} consulte pour ${caseData.patient.name}, ${caseData.patient.age} ${caseData.patient.ageUnit}, qui présente: ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  if (caseData.isPhoneConsult) {
    json.taches = [
      "Obtenir une anamnèse ciblée par téléphone",
      "Expliquer votre impression clinique et votre plan de prise en charge au parent",
      "Rédiger la note patient après l'appel"
    ];
  } else {
    json.taches = [
      "Obtenir une anamnèse ciblée",
      "Expliquer votre impression clinique et votre plan de prise en charge au parent",
      "Rédiger la note patient après la consultation"
    ];
  }

  return json;
}

// Fonctions auxiliaires
function getAnamnesisDetails(caseData) {
  const baseDetails = caseData.history.main.split('.').filter(s => s.trim()).slice(0, 3);
  
  switch(caseData.number) {
    case 28:
      return [
        "Durée et évolution [5 jours, aggravée hier]",
        "Température mesurée [101°F/38.3°C]",
        "Réponse aux antipyrétiques [peu de réponse au Tylenol]",
        "Tire sur l'oreille [oui]",
        "Difficultés alimentaires et sommeil"
      ];
    case 29:
      return [
        "Caractéristiques diarrhée [6-8 selles/jour, aqueuses, jaunâtres]",
        "Signes déshydratation [bouche sèche, soif, oligurie]",
        "Vomissements associés [ce matin, eau et mucus]",
        "Contact malade récent [cousin malade]",
        "Introduction nouveaux aliments [jus cette semaine]"
      ];
    case 30:
      return [
        "Fréquence énurésie [1-2×/nuit, 2-3 nuits/semaine]",
        "Continence diurne [oui]",
        "Stratégies essayées [restriction liquides, miction avant coucher]",
        "Impact psychologique [gênée, évite fratrie]",
        "Changements récents [dort chez grand-mère]"
      ];
    case 31:
      return [
        "Apparition ictère [J2 de vie]",
        "Progression [aggravation progressive]",
        "Coloration [yeux et peau jaunes, selles foncées]",
        "État général [tète bien, pas faible]",
        "Groupes sanguins [mère A-, bébé A+]"
      ];
    case 32:
      return [
        "Perte pondérale [5 lb en 3 mois]",
        "Signes cardinaux diabète [polyphagie, polydipsie, polyurie]",
        "Nycturie [1-2×/nuit]",
        "Contexte psychosocial [divorce parents]",
        "Courbe croissance [déclin noté]"
      ];
    default:
      return baseDetails;
  }
}

function getDifferentialQuestions(caseNumber) {
  const questions = {
    28: [
      "Symptômes ORL (oreille, nez, gorge)",
      "Symptômes respiratoires bas",
      "Signes méningés",
      "Contact avec malades",
      "Vaccinations à jour"
    ],
    29: [
      "Symptômes gastro-intestinaux",
      "Évaluation déshydratation",
      "Symptômes respiratoires",
      "Alimentation récente",
      "Contacts malades"
    ],
    30: [
      "Symptômes urinaires diurnes",
      "Constipation",
      "Apnée du sommeil",
      "Stress psychosocial",
      "Antécédents familiaux"
    ],
    31: [
      "Alimentation (tète bien?)",
      "Signes infection",
      "Incompatibilité sanguine",
      "Prématurité",
      "Médicaments maternels"
    ],
    32: [
      "Symptômes diabète",
      "Alimentation",
      "Symptômes digestifs",
      "Infections récurrentes",
      "Situation familiale"
    ]
  };
  return questions[caseNumber] || [];
}

function getDevelopmentHistory(caseData) {
  const history = [];
  const addInfo = caseData.history.additional.split('.').filter(s => s.trim());
  
  addInfo.forEach(info => {
    if (info.includes('développement') || info.includes('marche') || 
        info.includes('propreté') || info.includes('vaccin') ||
        info.includes('dit') || info.includes('s\'assoit')) {
      history.push(info.trim());
    }
  });
  
  return history.length > 0 ? history : ["Développement approprié pour l'âge"];
}

function getPediatricSystemsReview(caseNumber) {
  const reviews = {
    28: ["Système respiratoire", "Système ORL", "État général"],
    29: ["Système digestif", "État hydratation", "État général"],
    30: ["Système urinaire", "Système digestif", "Sommeil"],
    31: ["Système hépatique", "État général", "Alimentation"],
    32: ["Système endocrinien", "Système digestif", "État nutritionnel"]
  };
  return reviews[caseNumber] || ["Revue des systèmes adaptée"];
}

function getExamCriteria(caseData) {
  if (caseData.isPhoneConsult) {
    return [
      {
        id: "e1",
        text: "Examen physique non réalisé (consultation téléphonique)",
        binaryOnly: true,
        patientComment: "Recommandation de consultation en présentiel si nécessaire"
      }
    ];
  }
  
  return [
    {
      id: "e1",
      text: "Signes vitaux et apparence générale",
      binaryOnly: true
    },
    {
      id: "e2",
      text: "Examen ORL pédiatrique",
      details: [
        "Otoscopie bilatérale",
        "Examen pharyngé",
        "Palpation ganglions"
      ]
    },
    {
      id: "e3",
      text: "Examen cardio-pulmonaire",
      details: [
        "Auscultation cardiaque",
        "Auscultation pulmonaire",
        "Recherche sifflements"
      ]
    },
    {
      id: "e4",
      text: "Examen abdominal pédiatrique",
      details: getAbdominalExam(caseData.number)
    },
    {
      id: "e5",
      text: "Examen neurologique et développement",
      details: ["Tonus", "Réflexes", "Développement psychomoteur"]
    }
  ];
}

function getAbdominalExam(caseNumber) {
  const exams = {
    29: ["Inspection (distension)", "Palpation douce", "Recherche déshydratation", "Turgor cutané"],
    30: ["Palpation vessie", "Recherche globe vésical", "Palpation fosses lombaires"],
    32: ["Palpation hépatosplénomégalie", "Recherche masses", "État nutritionnel"]
  };
  return exams[caseNumber] || ["Inspection", "Auscultation", "Palpation douce"];
}

function getManagementPlan(caseData) {
  const plans = {
    28: [
      "Consultation présentielle recommandée",
      "Antibiothérapie si otite confirmée (éviter amoxicilline - allergie)",
      "Antipyrétiques adaptés",
      "Surveillance respiratoire"
    ],
    29: [
      "Réhydratation orale ou IV selon sévérité",
      "Arrêt temporaire du jus",
      "Surveillance déshydratation",
      "Éducation signes d'alerte"
    ],
    30: [
      "Journal mictionnel",
      "Miction programmée (toutes 3-4h)",
      "Alarme énurésie",
      "Traitement constipation",
      "Support psychologique"
    ],
    31: [
      "Surveillance bilirubine",
      "Photothérapie si nécessaire",
      "Maintien allaitement",
      "Suivi rapproché"
    ],
    32: [
      "Urgence diabétologique",
      "Insulinothérapie si diabète confirmé",
      "Éducation thérapeutique",
      "Support psychosocial famille"
    ]
  };
  return plans[caseData.number] || ["Plan adapté au diagnostic"];
}

function getParentalAdvice(caseNumber) {
  const advice = {
    28: ["Surveillance température", "Hydratation++", "Retour si aggravation", "Éviter garderie si fièvre"],
    29: ["Solution réhydratation orale", "Éviter jus fruits", "Lavage mains++", "Signes déshydratation"],
    30: ["Patience et compréhension", "Pas de punition", "Renforcement positif", "Régime riche fibres"],
    31: ["Rassurer sur ictère physiologique", "Maintenir allaitement", "Exposition lumière jour", "Surveillance coloration"],
    32: ["Urgence si diabète", "Surveillance symptômes", "Support familial", "Éducation diabète"]
  };
  return advice[caseNumber] || ["Conseils adaptés"];
}

function getParentQuestions(caseNumber) {
  const questions = {
    28: [
      "[Pourquoi ma fille tire-t-elle sur son oreille?]",
      "[Puis-je lui donner les antibiotiques de son frère?]",
      "[Est-ce que Rose va bien aller?]"
    ],
    29: [
      "[Tom pourrait-il avoir attrapé cela de son cousin?]",
      "[J'ai des antibiotiques à la maison. Puis-je les donner à Tom?]"
    ],
    30: [
      "[Le fait qu'elle dorme chez sa grand-mère pourrait aggraver le problème?]",
      "[Devrais-je acheter une alarme pour l'énurésie?]",
      "[Pourrait-elle avoir hérité ce problème de son père?]"
    ],
    31: [
      "[Combien de temps cette coloration va-t-elle durer?]",
      "[Pourquoi ses selles sont-elles si foncées?]"
    ],
    32: [
      "[Y a-t-il quelque chose qui ne va pas avec son estomac?]",
      "[Est-ce que Scott va bien aller?]"
    ]
  };
  return questions[caseNumber] || [];
}

function getSpecificAdvice(caseNumber) {
  const advice = {
    28: "Otite probable après infection virale. Consultation présentielle nécessaire. Transport urgent si pas possible.",
    29: "Gastro-entérite virale probable. Réhydratation prioritaire. Pas d'antibiotiques sauf si bactérien confirmé.",
    30: "Énurésie primaire avec composante héréditaire. Approche comportementale d'abord. Alarme efficace.",
    31: "Ictère physiologique probable. Pic J3-5, résolution J14. Surveillance bilirubine importante.",
    32: "Diabète type 1 probable. Prise en charge urgente. Support psychologique famille monoparentale."
  };
  return advice[caseNumber] || "";
}

function getParentAttitude(caseNumber) {
  const attitudes = {
    28: ["Mère inquiète", "Difficultés transport si consultation demandée"],
    29: ["Mère très inquiète", "Coopérative"],
    30: ["Mère compréhensive", "Changements horaires travail"],
    31: ["Parents inquiets", "Première expérience ictère"],
    32: ["Père débordé", "Difficultés parent isolé", "Émotionnel (divorce récent)"]
  };
  return attitudes[caseNumber] || ["Parent coopératif"];
}

function getConsultationInstructions(caseNumber) {
  const instructions = {
    28: ["Mentionner difficultés transport", "Insister sur inquiétudes"],
    29: ["Demander sur antibiotiques maison", "Mentionner cousin malade"],
    30: ["Parler situation grand-mère", "Questions sur alarme énurésie"],
    31: ["Questions sur durée ictère", "Inquiétude selles foncées"],
    32: ["Exprimer difficultés parent seul", "Montrer courbe croissance"]
  };
  return instructions[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Otite moyenne": "Fièvre, tire oreille, ATCD otite, post-infection virale",
    "Infection voies respiratoires inférieures": "Fièvre, toux, difficultés respiratoires, ATCD asthme mère",
    "Asthme bronchique": "Toux nocturne, ATCD familial asthme, symptômes récurrents",
    "Diarrhée virale/bactérienne": "Diarrhée aqueuse, fièvre, contact malade, déshydratation",
    "Malabsorption": "Diarrhée après introduction jus, symptômes digestifs",
    "Énurésie nocturne primaire": "Jamais continente longtemps, ATCD père, âge 5 ans",
    "Ictère physiologique": "Apparition J2, prématurité, pas autres symptômes",
    "Incompatibilité Rh": "Mère Rh-, bébé Rh+, ictère précoce",
    "Diabète sucré type 1": "Polyurie, polydipsie, polyphagie, perte poids",
    "Négligence envers l'enfant": "Divorce récent, père débordé, supervision limitée"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Otite moyenne": "Otoscopie, tympanométrie si disponible",
    "Infection voies respiratoires inférieures": "Radiographie thoracique, NFS",
    "Asthme bronchique": "Spirométrie (si âge approprié), test bronchodilatateur",
    "Diarrhée virale/bactérienne": "Coproculture, recherche virus, ionogramme",
    "Malabsorption": "Test intolérance lactose/fructose",
    "Énurésie nocturne primaire": "Analyse urine, échographie rénale si indiquée",
    "Ictère physiologique": "Bilirubine transcutanée/sérique",
    "Incompatibilité Rh": "Test Coombs, bilirubine sériée",
    "Diabète sucré type 1": "Glycémie, HbA1c, corps cétoniques",
    "Négligence envers l'enfant": "Évaluation sociale, signalement si nécessaire"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    28: ["Ne pas reconnaître urgence otite", "Oublier allergie amoxicilline", "Ne pas proposer consultation présentielle"],
    29: ["Sous-estimer déshydratation", "Prescrire antibiotiques d'emblée", "Ne pas arrêter jus"],
    30: ["Culpabiliser parents", "Médicaments trop tôt", "Négliger constipation"],
    31: ["Alarmer inutilement", "Arrêter allaitement", "Ne pas surveiller bilirubine"],
    32: ["Manquer diabète", "Négliger contexte psychosocial", "Ne pas référer urgence"]
  };
  return pieges[caseNumber] || ["Anamnèse incomplète", "Communication inadaptée"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-pediatrics');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-pediatrics');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Pédiatrie...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Pediatrie-${caseData.number} - ${caseData.title.replace(/[()]/g, '').replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit}`;
  
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