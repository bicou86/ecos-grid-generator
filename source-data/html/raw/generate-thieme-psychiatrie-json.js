const fs = require('fs');
const path = require('path');

// Les 6 cas Thieme Psychiatrie (cas 39 à 44)
const cases = [
  {
    number: 39,
    title: "Douleur thoracique avec anxiété",
    patient: {
      name: "Mme Carol Roberts",
      age: 35,
      gender: "Femme",
      complaint: "douleur thoracique"
    },
    vitals: {
      fc: "86 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Épisodes douleur thoracique intense depuis 3-4 semaines, partie centrale thorax. Durent 30 secondes. Oppression, difficultés respiratoires, palpitations, transpiration. Surviennent dans endroits bondés, impression de mourir.",
      additional: "Conflits conjugaux concernant avenir enfants. Difficultés endormissement (2h). Consultations multiples sans diagnostic. DDR il y a 2 semaines, frottis il y a 2 ans normal.",
      social: "Assistante médicale. Café 3-4 tasses/jour. Fume 1 pqt/j × 10 ans. Boit socialement. Sexuellement active avec mari. SCI et vessie hyperactive sous oxybutynine."
    },
    differentials: ["Trouble panique", "Anxiété généralisée", "Syndrome coronarien aigu (à exclure)"],
    exams: ["ECG", "Troponines", "NFS", "TSH", "Toxicologie si indiquée"]
  },
  {
    number: 40,
    title: "Tristesse post-traumatique",
    patient: {
      name: "Mlle Dana Weiss",
      age: 30,
      gender: "Femme",
      complaint: "se sent triste"
    },
    vitals: {
      fc: "84 bpm",
      ta: "110/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Témoin noyade amie il y a 3 semaines lors randonnée. Tentative sauvetage infructueuse. Tristesse, fatigue, concentration diminuée, moins intérêt activités. Flashbacks et cauchemars.",
      additional: "Difficultés endormissement, appétit diminué. Performance travail affectée (comptable). DDR il y a 2 semaines, frottis il y a 2 ans normal.",
      social: "Sexuellement active multiples partenaires masculins, préservatifs occasionnels. 2 IST l'année dernière. 2 bières/jour. Jamais testée VIH."
    },
    differentials: ["Trouble de stress aigu", "Trouble de stress post-traumatique", "Infection VIH (à exclure)"],
    exams: ["Examen pelvien", "NFS, TSH", "Charge virale VIH, CD4"]
  },
  {
    number: 41,
    title: "Violence conjugale",
    patient: {
      name: "Mme Sabrina Armstrong",
      age: 35,
      gender: "Femme",
      complaint: "se sent triste"
    },
    vitals: {
      fc: "84 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Mari violent depuis 6 mois, alcoolique. Battue il y a 2 semaines, multiples ecchymoses. Partie avec 2 enfants à l'hôtel, plus moyens financiers.",
      additional: "Tristesse, dépression, culpabilité. 2 tentatives suicide, pense aux enfants. Insomnie, somnifères OTC. DDR il y a 2 semaines, contraceptifs oraux, frottis il y a 3 ans normal.",
      social: "Conductrice bus. Non-fumeuse, boit socialement. Monogame avec mari. Mère a hypothyroïdie et dépression. N'a informé personne (famille, amis, police)."
    },
    differentials: ["Violence conjugale", "Dépression majeure", "Trouble de stress post-traumatique"],
    exams: ["NFS", "Documentation photographique ecchymoses", "Évaluation risque suicidaire"]
  },
  {
    number: 42,
    title: "Dépression du deuil",
    patient: {
      name: "Mlle Alana Murphy",
      age: 60,
      gender: "Femme",
      complaint: "ne se sent pas bien"
    },
    vitals: {
      fc: "84 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Très triste et déprimée depuis décès mari il y a 3 mois. Désespoir, vie ne vaut plus la peine. Culpabilité (trop occupée travail pour l'aider). Tentative suicide il y a quelques semaines (arme à feu à maison).",
      additional: "Appétit diminué mais prise poids 3.6 kg/3 mois. Fatigue, concentration et mémoire diminuées. Intolérance froid, constipation. Mari malade dernière année.",
      social: "Vit seule. Mère a Alzheimer. Diabète sous insuline, hypothyroïdie sous L-thyroxine."
    },
    differentials: ["Trouble dépressif majeur", "Hypothyroïdie", "Deuil pathologique"],
    exams: ["NFS", "TSH", "Glycémie", "Évaluation psychiatrique urgente"]
  },
  {
    number: 43,
    title: "Anxiété d'adaptation",
    patient: {
      name: "Mlle Pat Johnson",
      age: 20,
      gender: "Femme",
      complaint: "se sent nerveuse et irritable"
    },
    vitals: {
      fc: "84 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Nerveuse et irritable depuis 2 semaines, depuis déménagement nouvelle université et départ parents. Difficultés sommeil (1h30 pour s'endormir). Palpitations, transpiration excessive.",
      additional: "Selles molles fréquentes. Se sent reposée le matin. Performance cours bonne. Vessie hyperactive connue.",
      social: "Étudiante. Fume 2 pqt/j. Boit socialement. Marijuana au lycée. Un seul petit ami. Somnifères OTC et oxybutynine. ATCD amygdalectomie."
    },
    differentials: ["Trouble de l'adaptation", "Trouble anxieux généralisé", "Hyperthyroïdie (à exclure)"],
    exams: ["TSH", "Dépistage toxicologique", "ECG si palpitations persistantes"]
  },
  {
    number: 44,
    title: "Psychose aiguë",
    patient: {
      name: "M. David Mark",
      age: 25,
      gender: "Homme",
      complaint: "discours désorganisé"
    },
    vitals: {
      fc: "84 bpm",
      ta: "100/70 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Amené par proches, comportement anormal et discours désorganisé. Hallucinations auditives 2-3×/jour (voix disant que Terre en danger). Délire persécution (ami veut lui faire mal).",
      additional: "N'est pas allé au travail depuis quelques semaines. Insomnie (quelques heures/nuit). Refuse tests (peur dispositifs surveillance).",
      social: "Travaille épicerie. Fume 1 pqt/j × 10 ans. 3 bières/jour, CAGE 2/4. Consomme crack/cocaïne."
    },
    differentials: ["Trouble psychotique bref", "Psychose induite par substances", "Schizophrénie débutante"],
    exams: ["Examen physique complet", "Dépistage toxicologique urinaire", "NFS avec formule", "CT cérébral si indiqué"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Psychiatrie ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Psychiatrie",
    subcategory: caseData.title,
    context: {
      setting: caseData.number === 39 ? "Service d'urgences" : "Cabinet de médecine générale",
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
          text: "Analyse de la plainte principale",
          details: getMainComplaintAnalysis(caseData)
        },
        {
          id: "a3",
          text: "Symptômes psychiatriques (SIG E CAPS)",
          details: getPsychiatricSymptoms(caseData.number)
        },
        {
          id: "a4",
          text: "Facteurs déclenchants et stresseurs",
          details: getTriggerFactors(caseData)
        },
        {
          id: "a5",
          text: "Évaluation du risque suicidaire/homicide",
          details: getRiskAssessment(caseData.number)
        },
        {
          id: "a6",
          text: "Antécédents psychiatriques et médicaux",
          details: getPsychiatricHistory(caseData)
        },
        {
          id: "a7",
          text: "Histoire sociale et toxiques",
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
          text: "Examen de l'état mental (Mini-Mental State)",
          details: getMentalStatusExam(caseData.number)
        },
        {
          id: "e3",
          text: "Affect et humeur",
          details: getAffectMoodExam(caseData.number)
        },
        {
          id: "e4",
          text: "Examen neurologique ciblé",
          details: ["Pupilles (PERRLA)", "Réflexes", "Force musculaire", "Sensibilité", "Tremblements"]
        },
        {
          id: "e5",
          text: "Examen physique général",
          details: getPhysicalExam(caseData.number)
        }
      ]
    },
    management: {
      weight: 0.25,
      criteria: [
        {
          id: "m1",
          text: "Diagnostics différentiels psychiatriques",
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
          text: "Examens complémentaires pertinents",
          details: caseData.exams
        },
        {
          id: "m3",
          text: "Plan de prise en charge Bio-Psycho-Social",
          details: getBioPsychoSocialPlan(caseData.number)
        },
        {
          id: "m4",
          text: "Critères d'hospitalisation",
          details: getHospitalizationCriteria(caseData.number)
        }
      ]
    }
  };

  // Ajouter section clôture avec counseling
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
        text: "Counseling et soutien psychologique",
        content: getCounselingAdvice(caseData.number)
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
        facteursDeclenchants: getTriggerFactors(caseData),
        contextePsychosocial: caseData.history.social.split('.').filter(s => s.trim())
      },
      simulation: {
        attitude: getPatientAttitude(caseData.number),
        durantEntretien: getInterviewInstructions(caseData.number),
        comportementNonVerbal: getNonVerbalBehavior(caseData.number)
      },
      inquietudes: {
        principales: getPatientQuestions(caseData.number)
      }
    },
    informationsExpert: {
      titre: "Informations pour l'expert",
      pointsCles: [
        `Cas psychiatrique: ${caseData.title}`,
        `Patient: ${caseData.patient.gender} de ${caseData.patient.age} ans`,
        "Évaluation psychiatrique complète",
        "Évaluation du risque suicidaire",
        "Plan bio-psycho-social"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter approche spécifique pour violence conjugale
  if (caseData.number === 41) {
    json.annexes.theoriePratique = {
      titre: "Approche de la violence conjugale",
      sections: [
        {
          titre: "Questions clés (AIDES)",
          points: [
            "Agression: Quand? Où? Comment?",
            "Il (agresseur): Alcool? Drogues? Armes?",
            "Danger: Enfants? Plan de sécurité?",
            "Elle (victime): Support? Police informée?",
            "Sécurité: Refuge? Resources disponibles?"
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
    titre: `Thieme Psychiatrie ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.number === 39 ? "Service d'urgences" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  json.taches = [
    "Obtenir une anamnèse ciblée",
    "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectaux, pelviens, génito-urinaires, de hernie inguinale, des seins ou cornéens)",
    "Discuter de votre impression diagnostique initiale et de votre plan de prise en charge avec le patient",
    "Compléter la note patient après la consultation"
  ];

  return json;
}

// Fonctions auxiliaires
function getMainComplaintAnalysis(caseData) {
  const analyses = {
    39: [
      "Durée et fréquence [3-4 semaines, épisodes de 30 secondes]",
      "Localisation [partie centrale thorax]",
      "Symptômes associés [oppression, dyspnée, palpitations, transpiration]",
      "Facteurs déclenchants [endroits bondés]",
      "Impression de mort imminente"
    ],
    40: [
      "Événement traumatique [noyade amie il y a 3 semaines]",
      "Tristesse et fatigue",
      "Flashbacks et cauchemars",
      "Impact fonctionnel [travail affecté]",
      "Troubles sommeil et appétit"
    ],
    41: [
      "Violence physique [battue il y a 2 semaines]",
      "Multiples ecchymoses",
      "Contexte [mari alcoolique, problèmes financiers]",
      "Fuite avec enfants",
      "Sentiment culpabilité"
    ],
    42: [
      "Deuil récent [mari décédé il y a 3 mois]",
      "Désespoir et anhédonie",
      "Culpabilité pathologique",
      "Tentative suicide récente",
      "Symptômes somatiques [prise poids, constipation]"
    ],
    43: [
      "Changement majeur [déménagement université]",
      "Séparation parents",
      "Symptômes anxieux [nervosité, irritabilité]",
      "Troubles sommeil",
      "Symptômes physiques [palpitations, transpiration]"
    ],
    44: [
      "Hallucinations auditives [voix 2-3×/jour]",
      "Délire persécution",
      "Désorganisation comportementale",
      "Absentéisme travail",
      "Insomnie sévère"
    ]
  };
  return analyses[caseData.number] || [];
}

function getPsychiatricSymptoms(caseNumber) {
  const symptoms = {
    39: ["Sommeil perturbé [2h pour s'endormir]", "Intérêt maintenu", "Pas de culpabilité", "Énergie conservée", "Concentration variable", "Appétit normal", "Pas d'idées suicidaires"],
    40: ["Sommeil perturbé", "Intérêt diminué", "Pas de culpabilité", "Fatigue", "Concentration diminuée", "Appétit diminué", "Pas d'idées suicidaires"],
    41: ["Insomnie", "Intérêt diminué", "Culpabilité ++", "Fatigue", "Concentration altérée", "Appétit conservé", "2 tentatives suicide"],
    42: ["Sommeil perturbé", "Anhédonie", "Culpabilité ++", "Fatigue", "Concentration et mémoire diminuées", "Appétit diminué", "Tentative suicide"],
    43: ["Insomnie initiale [1h30]", "Intérêt maintenu", "Pas de culpabilité", "Énergie conservée", "Concentration correcte", "Appétit normal", "Pas d'idées suicidaires"],
    44: ["Insomnie sévère", "Désintérêt travail", "Pas de culpabilité", "Énergie variable", "Concentration altérée", "Appétit normal", "Pas d'idées suicidaires exprimées"]
  };
  return symptoms[caseNumber] || [];
}

function getTriggerFactors(caseData) {
  const triggers = {
    39: ["Conflits conjugaux prolongés", "Stress concernant avenir enfants", "Endroits bondés"],
    40: ["Événement traumatique (noyade amie)", "Échec tentative sauvetage", "Culpabilité survivant"],
    41: ["Violence conjugale répétée", "Mari alcoolique", "Licenciement mari", "Problèmes financiers"],
    42: ["Décès mari il y a 3 mois", "Mari malade dernière année", "Culpabilité soins insuffisants"],
    43: ["Déménagement université", "Séparation parents", "Nouveau environnement", "Stress adaptation"],
    44: ["Consommation substances (crack)", "Stress travail", "Isolement social"]
  };
  return triggers[caseData.number] || [];
}

function getRiskAssessment(caseNumber) {
  const risks = {
    39: ["Pas d'idées suicidaires", "Pas d'idées homicides", "Pas de plan", "Support social présent"],
    40: ["Pas d'idées suicidaires actuelles", "Pas d'idées homicides", "Facteurs protecteurs présents"],
    41: ["2 tentatives suicide antérieures", "Pense aux enfants (facteur protecteur)", "Pas d'idées homicides", "Risque élevé - surveillance"],
    42: ["Tentative suicide récente", "Arme à feu accessible", "Idéation suicidaire active", "RISQUE ÉLEVÉ - hospitalisation"],
    43: ["Pas d'idées suicidaires", "Pas d'idées homicides", "Bon fonctionnement global"],
    44: ["Évaluation difficile (psychose)", "Délire persécution", "Risque imprévisible", "Surveillance nécessaire"]
  };
  return risks[caseNumber] || [];
}

function getPsychiatricHistory(caseData) {
  const history = [];
  
  if (caseData.number === 39) {
    history.push("SCI et vessie hyperactive", "Consultations multiples sans diagnostic");
  } else if (caseData.number === 40) {
    history.push("2 IST année dernière", "Pas d'ATCD psychiatriques");
  } else if (caseData.number === 41) {
    history.push("Mère: hypothyroïdie et dépression", "Pas d'ATCD psychiatriques personnels");
  } else if (caseData.number === 42) {
    history.push("Diabète insulino-dépendant", "Hypothyroïdie sous L-thyroxine", "Mère: Alzheimer");
  } else if (caseData.number === 43) {
    history.push("Vessie hyperactive", "ATCD amygdalectomie", "Marijuana au lycée");
  } else if (caseData.number === 44) {
    history.push("Pas d'ATCD psychiatriques connus", "Consommation crack/cocaïne");
  }
  
  return history;
}

function getMentalStatusExam(caseNumber) {
  const exams = {
    39: ["Alerte et orientée ×3", "Discours normal", "Pensée organisée", "Pas d'hallucinations", "Jugement intact"],
    40: ["Alerte et orientée ×3", "Discours ralenti", "Pensée cohérente", "Flashbacks intrusifs", "Jugement conservé"],
    41: ["Alerte et orientée ×3", "Discours lent", "Pensée organisée", "Pas d'hallucinations", "Jugement altéré (reste avec agresseur)"],
    42: ["Alerte et orientée ×3", "Discours très lent", "Pensée ralentie", "Pas d'hallucinations", "Jugement altéré (tentative suicide)"],
    43: ["Alerte et orientée ×3", "Discours normal mais pressé", "Pensée organisée", "Pas d'hallucinations", "Jugement intact"],
    44: ["Alerte, orientation variable", "Discours désorganisé", "Pensée incohérente", "Hallucinations auditives", "Jugement altéré", "Délire persécution"]
  };
  return exams[caseNumber] || [];
}

function getAffectMoodExam(caseNumber) {
  const affects = {
    39: ["Humeur anxieuse", "Affect tendu", "Congruent avec humeur"],
    40: ["Humeur triste", "Affect déprimé", "Congruent avec humeur"],
    41: ["Humeur dépressive", "Affect émoussé", "Parle lentement"],
    42: ["Humeur très dépressive", "Affect émoussé", "Ralentissement psychomoteur"],
    43: ["Humeur anxieuse", "Affect irritable", "Hypervigilance"],
    44: ["Humeur exaltée", "Affect agité", "Incongruent", "Méfiance"]
  };
  return affects[caseNumber] || [];
}

function getPhysicalExam(caseNumber) {
  const exams = {
    39: ["Examen cardio-pulmonaire normal", "Pas de signes thyroïdiens", "Examen abdominal normal"],
    40: ["Examen général normal", "Pas de signes infection", "État nutritionnel normal"],
    41: ["Multiples ecchymoses visibles", "Sensibilité zones contusions", "Documentation photographique nécessaire"],
    42: ["Possible signes hypothyroïdie", "Prise poids notée", "Ralentissement général"],
    43: ["Tachycardie légère possible", "Transpiration excessive", "Agitation psychomotrice"],
    44: ["Examen limité (refuse coopération)", "Apparence négligée", "Possible intoxication"]
  };
  return exams[caseNumber] || [];
}

function getBioPsychoSocialPlan(caseNumber) {
  const plans = {
    39: ["Bio: Anxiolytiques si besoin, ISRS à considérer", "Psycho: TCC pour trouble panique", "Social: Thérapie couple", "Suivi ambulatoire"],
    40: ["Bio: Pas de médication immédiate", "Psycho: Thérapie trauma (EMDR/TCC)", "Social: Groupe de soutien", "Dépistage VIH urgent"],
    41: ["Bio: Antidépresseurs si dépression confirmée", "Psycho: Thérapie individuelle", "Social: Refuge femmes, aide juridique", "Protection enfants"],
    42: ["Bio: Antidépresseurs urgents, ajuster L-thyroxine", "Psycho: Thérapie deuil", "Social: Retrait armes, support famille", "HOSPITALISATION URGENTE"],
    43: ["Bio: Pas de médication d'emblée", "Psycho: Thérapie adaptation", "Social: Support universitaire", "Techniques relaxation"],
    44: ["Bio: Antipsychotiques urgents", "Psycho: Stabilisation avant thérapie", "Social: Évaluation environnement", "HOSPITALISATION si dangerosité"]
  };
  return plans[caseNumber] || [];
}

function getHospitalizationCriteria(caseNumber) {
  const criteria = {
    39: ["Pas d'indication hospitalisation", "Suivi ambulatoire suffisant", "Réseau support présent"],
    40: ["Pas d'hospitalisation nécessaire", "Pas de risque suicidaire actuel", "Suivi rapproché ambulatoire"],
    41: ["Hospitalisation à considérer", "Risque suicidaire (2 tentatives)", "Évaluation environnement sécuritaire", "Protection enfants prioritaire"],
    42: ["HOSPITALISATION URGENTE", "Tentative suicide récente", "Arme accessible", "Idéation suicidaire active"],
    43: ["Pas d'hospitalisation", "Bon fonctionnement", "Support disponible"],
    44: ["Hospitalisation probable", "Psychose active", "Évaluation dangerosité", "Désorganisation sévère"]
  };
  return criteria[caseNumber] || [];
}

function getPatientQuestions(caseNumber) {
  const questions = {
    39: ["[Ai-je un problème cardiaque?]"],
    40: ["[Suis-je dépressive?]"],
    41: ["[J'ai besoin d'un appartement pour moi et mes enfants]"],
    42: ["[Comment faire pour qu'il me pardonne?]", "[C'est difficile de vivre seule]"],
    43: [],
    44: ["[Je ne veux pas de tests, pas de dispositifs de surveillance]"]
  };
  return questions[caseNumber] || [];
}

function getCounselingAdvice(caseNumber) {
  const counseling = {
    39: "Rassurer sur absence pathologie cardiaque après bilan. Expliquer trouble panique. Techniques respiration. Importance suivi.",
    40: "Valider trauma vécu. Normaliser réaction. Pas sa faute. Importance thérapie trauma. Dépistage VIH nécessaire.",
    41: "Ce n'est pas votre faute. Violence empire sans intervention. Sécurité prioritaire. Resources disponibles. Support social crucial.",
    42: "Culpabilité fait partie dépression. Hospitalisation pour sécurité. Traitement efficace disponible. Espoir guérison.",
    43: "Adaptation normale mais difficile. Stratégies coping. Resources universitaires. Techniques gestion stress.",
    44: "Comprendre inquiétudes. Pas de dispositifs surveillance. Traitement pour aider. Importance coopération."
  };
  return counseling[caseNumber] || "";
}

function getPatientAttitude(caseNumber) {
  const attitudes = {
    39: ["Anxieuse", "Préoccupée par symptômes physiques", "Coopérative mais tendue"],
    40: ["Triste", "Affect déprimé", "Parle de trauma", "Culpabilité survivant"],
    41: ["Très triste", "Parle lentement", "Maquillage ecchymoses", "Pleure pendant entretien"],
    42: ["Extrêmement déprimée", "Ralentissement psychomoteur", "Pleure", "Expression désespoir"],
    43: ["Nerveuse", "Irritable", "Agitée", "Parle rapidement"],
    44: ["Comportement bizarre", "Regarde murs", "Méfiant", "Refuse coopération", "Vêtements civils"]
  };
  return attitudes[caseNumber] || ["Patient coopératif"];
}

function getInterviewInstructions(caseNumber) {
  const instructions = {
    39: ["Exprimer inquiétude symptômes cardiaques", "Mentionner conflits conjugaux si questionné", "Décrire sensation mort imminente"],
    40: ["Dire 'Je suis si triste, je n'ai pas pu sauver mon amie'", "Décrire flashbacks", "Mentionner impact travail"],
    41: ["Révéler violence progressivement", "Montrer ecchymoses si examiné", "Exprimer besoin aide concrète"],
    42: ["Pleurer en parlant mari", "Exprimer culpabilité", "Mentionner arme à maison"],
    43: ["Montrer nervosité", "Parler rapidement", "Mentionner stress université"],
    44: ["Parler au mur initialement", "Décrire voix entendues", "Refuser tests (peur surveillance)"]
  };
  return instructions[caseNumber] || [];
}

function getNonVerbalBehavior(caseNumber) {
  const behaviors = {
    39: ["Position tendue", "Respiration superficielle", "Mains moites"],
    40: ["Contact visuel diminué", "Posture affaissée", "Mouvements lents"],
    41: ["Évite contact visuel", "Position protectrice", "Sursaute facilement"],
    42: ["Très ralentie", "Peu de gestes", "Voix monotone"],
    43: ["Agitation motrice", "Jambes tremblantes", "Changements position fréquents"],
    44: ["Comportement désorganisé", "Regards furtifs", "Méfiance évidente"]
  };
  return behaviors[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Trouble panique": "Épisodes courts, symptômes physiques intenses, peur de mourir, endroits bondés",
    "Anxiété généralisée": "Inquiétudes multiples, tension chronique, troubles sommeil, symptômes physiques",
    "Syndrome coronarien aigu (à exclure)": "Douleur thoracique, facteurs risque (tabac), âge",
    "Trouble de stress aigu": "Événement traumatique récent (<1 mois), flashbacks, évitement, hypervigilance",
    "Trouble de stress post-traumatique": "Trauma majeur, re-expérience, évitement, altération cognitive/humeur",
    "Infection VIH (à exclure)": "Comportement à risque, IST multiples, fatigue inexpliquée",
    "Violence conjugale": "Ecchymoses multiples, histoire cohérente, isolement social, peur",
    "Dépression majeure": "Critères DSM-5 présents, durée >2 semaines, impact fonctionnel",
    "Trouble de stress post-traumatique": "Violence répétée, hypervigilance, évitement, détresse clinique",
    "Hypothyroïdie": "Fatigue, prise poids, constipation, intolérance froid, ATCD thyroïde",
    "Deuil pathologique": "Deuil récent, intensité excessive, idéation suicidaire, dysfonction",
    "Trouble de l'adaptation": "Stresseur identifiable, symptômes <6 mois, réaction excessive",
    "Trouble anxieux généralisé": "Anxiété excessive, inquiétudes multiples, tension musculaire, insomnie",
    "Hyperthyroïdie (à exclure)": "Palpitations, transpiration, nervosité, troubles transit",
    "Trouble psychotique bref": "Symptômes <1 mois, hallucinations, délire, désorganisation",
    "Psychose induite par substances": "Consommation crack/cocaïne, symptômes psychotiques, temporalité",
    "Schizophrénie débutante": "Âge début typique, symptômes positifs et négatifs, détérioration"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Trouble panique": "ECG, TSH, toxicologie si indiquée",
    "Anxiété généralisée": "TSH, NFS, bilan métabolique",
    "Syndrome coronarien aigu (à exclure)": "ECG, troponines, radiographie thorax",
    "Trouble de stress aigu": "Évaluation clinique, échelles spécifiques",
    "Trouble de stress post-traumatique": "Évaluation trauma, PCL-5",
    "Infection VIH (à exclure)": "Sérologie VIH, CD4, charge virale",
    "Violence conjugale": "Documentation lésions, photos, certificat médical",
    "Dépression majeure": "TSH, NFS, vitamine B12, échelle dépression",
    "Hypothyroïdie": "TSH, T3, T4 libre",
    "Deuil pathologique": "Évaluation psychiatrique complète",
    "Trouble de l'adaptation": "Évaluation psychosociale",
    "Trouble anxieux généralisé": "TSH, ECG si palpitations",
    "Hyperthyroïdie (à exclure)": "TSH, T3, T4 libre",
    "Trouble psychotique bref": "CT cérébral, toxicologie, bilan infectieux",
    "Psychose induite par substances": "Toxicologie urinaire complète",
    "Schizophrénie débutante": "IRM cérébrale, bilan complet"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    39: ["Ne pas exclure cause organique", "Minimiser impact trouble panique", "Oublier facteurs psychosociaux"],
    40: ["Manquer risque VIH", "Minimiser impact trauma", "Ne pas dépister dépression"],
    41: ["Ne pas assurer sécurité", "Culpabiliser victime", "Oublier enfants", "Ne pas documenter"],
    42: ["Ne pas hospitaliser", "Minimiser risque suicidaire", "Manquer hypothyroïdie"],
    43: ["Sur-médicaliser", "Manquer trouble adaptation", "Ne pas explorer stresseurs"],
    44: ["Confronter délire", "Ne pas sécuriser", "Manquer intoxication", "Approche coercitive"]
  };
  return pieges[caseNumber] || ["Évaluation incomplète", "Manquer risque suicidaire"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-psychiatrie');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-psychiatrie');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Psychiatrie...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Psychiatrie-${caseData.number} - ${caseData.title.replace(/[()]/g, '').replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
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