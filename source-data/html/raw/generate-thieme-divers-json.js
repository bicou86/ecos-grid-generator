const fs = require('fs');
const path = require('path');

// Les 6 cas Thieme Divers (cas 53 à 58)
const cases = [
  {
    number: 53,
    title: "Contrôle du diabète mal équilibré",
    patient: {
      name: "M. Douglas Jackson",
      age: 45,
      gender: "Homme",
      complaint: "contrôle du diabète"
    },
    vitals: {
      fc: "80 bpm",
      ta: "140/100 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Diabète depuis 10 ans, pas de contrôle depuis 1 an (problèmes assurance). Glycémie 250 mg/dl (habituel <150). Polyurie, polydipsie, polyphagie, perte 5kg/6mois. Sensation diminuée jambes.",
      additional: "Douleurs abdominales hautes 7/10, distension, ballonnement, aggravées repas. Sommeil perturbé par nycturie 1-2×/nuit. Épisode hypoglycémie après insuline sans repas.",
      social: "Entreprise. Fume 1 pqt/j × 20 ans. Boit socialement. Pas sexuellement actif. Vit seul, frère attend appel chaque matin."
    },
    differentials: ["Gastropathie diabétique", "Neuropathie périphérique diabétique", "Diabète mal contrôlé"],
    exams: ["Glycémie à jeun", "HbA1c", "Analyse d'urine", "Créatinine sérique", "NFS avec formule", "Profil lipidique"],
    isPhoneConsult: false
  },
  {
    number: 54,
    title: "Renouvellement médicaments HTA (téléphonique)",
    patient: {
      name: "M. Paul Black",
      age: 50,
      gender: "Homme",
      complaint: "renouvellement médicaments HTA"
    },
    vitals: null,
    history: {
      main: "Appel pour renouvellement lisinopril 10mg. HTA depuis 5 ans. TA à domicile 140-160/80-100. Doit dormir 2 oreillers (orthopnée). Crampes jambes après 3-4 pâtés maisons.",
      additional: "Toux sèche légère. Père décédé AVC. Prend Zocor pour cholestérol.",
      social: "Industrie alimentaire. Pas exercice régulier. Fume 1 pqt/j × 30 ans. Boit 2-3 verres vin aux fêtes. Sexuellement actif avec femme."
    },
    differentials: ["HTA essentielle", "Insuffisance cardiaque", "Toux induite par lisinopril"],
    exams: ["Analyse urine", "NFS", "Profil lipidique", "ALT/AST", "Échocardiographie", "Radiographie thoracique", "ECG"],
    isPhoneConsult: true
  },
  {
    number: 55,
    title: "Renouvellement médicaments asthme",
    patient: {
      name: "Mme Erena Johnson",
      age: 40,
      gender: "Femme",
      complaint: "renouvellement médicaments asthme"
    },
    vitals: {
      fc: "80 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Asthme depuis années, bien contrôlé. Retour Canada (froid), rhume amélio médicaments OTC. Reste petite toux sèche. Médicaments épuisés pendant voyage.",
      additional: "Difficultés respiratoires et sifflements semaine dernière quelques fois. Albutérol MDI et béclométhasone régulièrement. Hospitalisée 2× seulement pour exacerbation asthme.",
      social: "Jardinière paysagiste. Ex-fumeuse il y a 10 ans (10 cig/5 ans). Sexuellement active monogame avec mari. Allergie animaux, pollens, poussière."
    },
    differentials: ["Asthme bronchique", "Exacerbation asthme"],
    exams: ["Radiographie thoracique", "Oxymétrie pouls", "Tests fonction pulmonaire", "Débit pointe"]
  },
  {
    number: 56,
    title: "Perte auditive bilatérale",
    patient: {
      name: "Mlle Ruth Evans",
      age: 55,
      gender: "Femme",
      complaint: "perte auditive"
    },
    vitals: {
      fc: "90 bpm",
      ta: "100/60 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Perte auditive bilatérale progressive depuis 5 ans, s'aggrave. Difficile entendre collègues et téléphone. Pas acouphènes ni problèmes équilibre.",
      additional: "Travaille épicerie calme. HTA depuis 15 ans, prend HCTZ. Frère 60 ans même problème.",
      social: "Ne fume pas. Boit socialement. Pas sexuellement active."
    },
    differentials: ["Presbyacousie", "Surdité induite par médicaments (HCTZ)"],
    exams: ["Audiométrie", "IRM cérébrale"]
  },
  {
    number: 57,
    title: "Fatigue avec facteurs de risque VIH",
    patient: {
      name: "M. Peter Smith",
      age: 30,
      gender: "Homme",
      complaint: "ne se sent pas bien"
    },
    vitals: {
      fc: "80 bpm",
      ta: "120/80 mmHg",
      fr: "18/min",
      temperature: "37°C"
    },
    history: {
      main: "Ne se sent pas bien depuis 3 mois, progressif, s'aggrave. Affecte performances professionnelles. Fatigue, épuisé, manque concentration. Perte 5-7kg/6mois.",
      additional: "Comptable. Herpès génital il y a 1 an. Jamais testé VIH.",
      social: "Fume 1 pqt × 10 ans. Boit 1-2 verres vin/jour, plus aux fêtes. Marijuana depuis université. Sexuellement actif hommes et femmes, préservatifs occasionnels."
    },
    differentials: ["Infection VIH", "Toxicomanie", "Syndrome fatigue chronique"],
    exams: ["Examen génital et rectal", "NFS avec formule", "Charge virale VIH", "CD4", "Dépistage toxicologique", "Radiographie thoracique", "Test tuberculine"]
  },
  {
    number: 58,
    title: "Fatigue avec suspicion cancer",
    patient: {
      name: "M. Ivy Mitchell",
      age: 58,
      gender: "Homme",
      complaint: "fatigue"
    },
    vitals: {
      fc: "75 bpm",
      ta: "145/95 mmHg",
      fr: "15/min",
      temperature: "37°C"
    },
    history: {
      main: "Fatigue et mal depuis 2 mois. Appétit diminué, satiété précoce. Nausées, vomissements parfois. Douleur abdominale sourde haute 5/10, irradiation dos. Perte 7kg/3mois.",
      additional: "Femme décédée il y a 5 mois. Difficultés sommeil, triste, déprimé, vie ne vaut pas peine. HTA 5 ans, prend propranolol.",
      social: "Père décédé cancer pancréas. Fume 1 pqt/j × 20 ans. Boit 3 bières/j × 15 ans."
    },
    differentials: ["Malignité gastro-intestinale", "Trouble dépressif majeur", "Pancréatite chronique"],
    exams: ["Examen rectal", "Recherche sang occulte selles", "NFS avec formule", "TSH et T4", "CT abdominal avec contraste", "Endoscopie haute"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Divers ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Divers",
    subcategory: caseData.title,
    context: {
      setting: caseData.isPhoneConsult ? "Consultation téléphonique" : "Cabinet de médecine générale",
      patient: `${caseData.patient.gender} de ${caseData.patient.age} ans, ${caseData.patient.name}, consultant pour ${caseData.patient.complaint}`
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
          details: getComplaintAnalysis(caseData)
        },
        {
          id: "a3",
          text: "Recherche de complications",
          details: getComplications(caseData.number)
        },
        {
          id: "a4",
          text: "Revue des systèmes",
          details: getSystemsReview(caseData.number)
        },
        {
          id: "a5",
          text: "Antécédents médicaux et traitements",
          details: getMedicalHistory(caseData)
        },
        {
          id: "a6",
          text: "Histoire sociale et habitudes",
          details: caseData.history.social.split('.').filter(s => s.trim()).map(s => s.trim())
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
          text: "Diagnostics différentiels",
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
          text: "Examens complémentaires appropriés",
          details: caseData.exams
        },
        {
          id: "m3",
          text: "Plan de prise en charge",
          details: getManagementPlan(caseData)
        },
        {
          id: "m4",
          text: "Conseils et éducation patient",
          details: getPatientEducation(caseData.number)
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
        complications: caseData.history.additional.split('.').filter(s => s.trim()),
        contexteSocial: caseData.history.social.split('.').filter(s => s.trim())
      },
      simulation: {
        attitude: getPatientAttitude(caseData.number),
        durantExamen: getExamInstructions(caseData.number),
        durantConsultation: caseData.isPhoneConsult ? ["Au téléphone uniquement"] : []
      },
      inquietudes: {
        principales: getPatientQuestions(caseData.number)
      }
    },
    informationsExpert: {
      titre: "Informations pour l'expert",
      pointsCles: [
        `Cas: ${caseData.title}`,
        `Patient: ${caseData.patient.gender} de ${caseData.patient.age} ans`,
        caseData.isPhoneConsult ? "Consultation téléphonique - pas d'examen physique" : "Anamnèse et examen complets",
        "Évaluation des complications",
        "Conseils et éducation thérapeutique"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter informations théoriques spécifiques
  if (caseData.number === 53) { // Diabète
    json.annexes.theoriePratique = {
      titre: "Complications du diabète",
      sections: [
        {
          titre: "Complications microvasculaires",
          points: [
            "Rétinopathie diabétique",
            "Néphropathie diabétique",
            "Neuropathie périphérique"
          ]
        },
        {
          titre: "Complications macrovasculaires",
          points: [
            "Maladie coronarienne",
            "AVC",
            "Artériopathie périphérique"
          ]
        },
        {
          titre: "Soins des pieds diabétiques",
          points: [
            "Inspection quotidienne",
            "Séchage complet après lavage",
            "Port chaussettes systématique",
            "Coupe ongles régulière",
            "Consultation podologique"
          ]
        }
      ]
    };
  } else if (caseData.number === 55) { // Asthme
    json.annexes.theoriePratique = {
      titre: "Gestion de l'asthme",
      sections: [
        {
          titre: "Éviction des allergènes",
          points: [
            "Identifier triggers personnels",
            "Éviter exposition pollens",
            "Contrôle environnement domestique",
            "Précautions professionnelles"
          ]
        },
        {
          titre: "Technique inhalation",
          points: [
            "Expirer complètement",
            "Déclencher et inspirer profondément",
            "Retenir 10 secondes",
            "Rincer bouche après corticoïdes"
          ]
        }
      ]
    };
  } else if (caseData.number === 57) { // VIH
    json.annexes.theoriePratique = {
      titre: "Prévention et counseling VIH",
      sections: [
        {
          titre: "Prévention transmission",
          points: [
            "Rapports protégés systématiques",
            "Notification partenaires",
            "Dépistage régulier IST",
            "PrEP pour partenaires séronégatifs"
          ]
        },
        {
          titre: "Suivi VIH",
          points: [
            "CD4 et charge virale réguliers",
            "Observance thérapeutique",
            "Vaccinations à jour",
            "Dépistage infections opportunistes"
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
    titre: `Thieme Divers ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.isPhoneConsult ? "Consultation téléphonique" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  if (caseData.isPhoneConsult) {
    json.taches = [
      "Obtenir une anamnèse ciblée par téléphone",
      "Expliquer votre impression clinique et votre plan de prise en charge",
      "Décider si une consultation en présentiel est nécessaire",
      "Rédiger la note patient après l'appel"
    ];
  } else {
    json.taches = [
      "Obtenir une anamnèse ciblée",
      "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectal, pelvien, génito-urinaire, hernie inguinale, sein féminin ou cornéen)",
      "Discuter de votre impression diagnostique initiale et de votre plan de bilan avec le patient",
      "Compléter la note patient après la consultation"
    ];
  }

  return json;
}

// Fonctions auxiliaires
function getComplaintAnalysis(caseData) {
  switch(caseData.number) {
    case 53: // Diabète
      return [
        "Contrôle glycémique [250 mg/dl vs <150 habituel]",
        "Signes cardinaux diabète [polyurie, polydipsie, polyphagie]",
        "Perte pondérale [5kg/6mois malgré polyphagie]",
        "Complications [neuropathie, gastropathie]",
        "Observance thérapeutique"
      ];
    case 54: // HTA téléphone
      return [
        "Valeurs TA domicile [140-160/80-100]",
        "Symptômes insuffisance cardiaque [orthopnée]",
        "Claudication intermittente [3-4 pâtés maisons]",
        "Effets secondaires [toux sèche - IEC]",
        "Observance traitement"
      ];
    case 55: // Asthme
      return [
        "Contrôle habituel [bien contrôlé]",
        "Facteurs déclenchants [froid, rhume]",
        "Rupture traitement [médicaments épuisés]",
        "Fréquence symptômes [quelques fois/semaine]",
        "Hospitalisations [2× seulement]"
      ];
    case 56: // Surdité
      return [
        "Évolution [progressive 5 ans]",
        "Bilatéralité [égale]",
        "Impact fonctionnel [téléphone, collègues]",
        "Absence vertiges/acouphènes",
        "Facteur médicamenteux [HCTZ]"
      ];
    case 57: // Fatigue VIH
      return [
        "Durée et évolution [3 mois, progressif]",
        "Impact professionnel [performances affectées]",
        "Symptômes associés [concentration, fatigue]",
        "Perte pondérale [5-7kg/6mois]",
        "Facteurs risque [HSH, multiples partenaires]"
      ];
    case 58: // Fatigue cancer
      return [
        "Syndrome constitutionnel [fatigue, anorexie, amaigrissement]",
        "Symptômes digestifs [satiété, nausées, douleur]",
        "Contexte dépressif [deuil récent]",
        "Antécédent familial [père cancer pancréas]",
        "Facteurs risque [tabac, alcool]"
      ];
    default:
      return [];
  }
}

function getComplications(caseNumber) {
  const complications = {
    53: ["Rétinopathie [vision floue?]", "Néphropathie [protéinurie?]", "Neuropathie [sensation diminuée jambes]", "Gastropathie [douleurs, ballonnement]", "Pied diabétique [plaies, infections?]"],
    54: ["Insuffisance cardiaque [orthopnée]", "Maladie vasculaire périphérique [claudication]", "AVC [ATCD père]", "Néphropathie hypertensive", "Rétinopathie hypertensive"],
    55: ["Exacerbations fréquentes", "Candidose orale [corticoïdes inhalés]", "Remodelage bronchique", "Limitation activités", "Hospitalisations"],
    56: ["Impact social", "Isolement", "Difficultés professionnelles", "Sécurité (alarmes non entendues)", "Dépression secondaire"],
    57: ["Infections opportunistes", "Sarcome Kaposi", "Lymphome", "Neuropathie VIH", "Démence VIH"],
    58: ["Cachexie cancéreuse", "Thrombose veineuse", "Syndrome paranéoplasique", "Dépression", "Douleur chronique"]
  };
  return complications[caseNumber] || [];
}

function getSystemsReview(caseNumber) {
  const reviews = {
    53: ["Cardiovasculaire", "Neurologique", "Ophtalmologique", "Rénal", "Vasculaire périphérique"],
    54: ["Cardiovasculaire complet", "Respiratoire", "Rénal", "Neurologique"],
    55: ["Respiratoire complet", "ORL", "Allergologique"],
    56: ["ORL complet", "Neurologique", "Endocrinien"],
    57: ["Général (B symptômes)", "Infectieux", "Dermatologique", "Neurologique", "Digestif"],
    58: ["Digestif complet", "Constitutionnel", "Psychiatrique", "Endocrinien"]
  };
  return reviews[caseNumber] || ["Revue systèmes complète"];
}

function getMedicalHistory(caseData) {
  const history = [];
  const text = caseData.history.main + " " + caseData.history.additional;
  
  // Extraire médicaments
  if (text.includes("metformine")) history.push("Metformine 500mg 1×/j depuis 5 ans");
  if (text.includes("insuline") || text.includes("Humulin")) history.push("Insuline (Humulin N/R) depuis 2 ans");
  if (text.includes("lisinopril")) history.push("Lisinopril 10mg pour HTA");
  if (text.includes("lovastatine") || text.includes("Zocor")) history.push("Statine pour dyslipidémie");
  if (text.includes("propranolol")) history.push("Propranolol pour HTA");
  if (text.includes("HCTZ")) history.push("Hydrochlorothiazide depuis 15 ans");
  if (text.includes("albutérol")) history.push("Albutérol MDI");
  if (text.includes("béclométhasone")) history.push("Béclométhasone inhalateur");
  
  // Ajouter ATCD
  if (text.includes("HTA")) history.push("HTA depuis " + (text.match(/HTA depuis (\d+) ans/) || ["", "plusieurs"])[1] + " ans");
  if (text.includes("diabète") || text.includes("Diabète")) history.push("Diabète depuis 10 ans");
  
  return history.length > 0 ? history : ["Voir anamnèse détaillée"];
}

function getExamCriteria(caseData) {
  if (caseData.isPhoneConsult) {
    return [
      {
        id: "e1",
        text: "Examen physique non réalisé (consultation téléphonique)",
        binaryOnly: true,
        patientComment: "Évaluation basée sur anamnèse téléphonique uniquement"
      }
    ];
  }
  
  switch(caseData.number) {
    case 53: // Diabète
      return [
        {
          id: "e1",
          text: "Signes vitaux et apparence générale",
          binaryOnly: true
        },
        {
          id: "e2",
          text: "Examen ophtalmologique",
          details: ["Acuité visuelle", "Fond d'œil", "Réflexe rouge"]
        },
        {
          id: "e3",
          text: "Examen cardiovasculaire",
          details: ["Souffle carotidien", "Auscultation cardiaque", "Pouls périphériques"]
        },
        {
          id: "e4",
          text: "Examen neurologique périphérique",
          details: ["Sensation tactile", "Sens vibratoire", "ROT rotulien et achilléen", "Test monofilament"]
        },
        {
          id: "e5",
          text: "Examen des pieds diabétiques",
          details: ["Inspection orteils", "Recherche plaies/ulcères", "Pouls pédieux et tibial postérieur", "Température cutanée"]
        },
        {
          id: "e6",
          text: "Examen abdominal",
          details: ["Sensibilité épigastrique", "Organomégalie", "Bruits intestinaux"]
        }
      ];
    case 55: // Asthme
      return [
        {
          id: "e1",
          text: "Signes vitaux et apparence générale",
          binaryOnly: true
        },
        {
          id: "e2",
          text: "Examen ORL",
          details: ["Rhinorrhée", "Érythème pharyngé", "Sensibilité sinus"]
        },
        {
          id: "e3",
          text: "Examen thoracique",
          details: ["Inspection (déformations)", "Palpation (FVT)", "Percussion", "Auscultation (sifflements, crépitants)"]
        },
        {
          id: "e4",
          text: "Signes de détresse respiratoire",
          details: ["Cyanose", "Tirage", "Battement ailes nez", "Utilisation muscles accessoires"]
        },
        {
          id: "e5",
          text: "Examen cardiovasculaire",
          details: ["Auscultation cardiaque", "Recherche signes droits"]
        }
      ];
    case 56: // Surdité
      return [
        {
          id: "e1",
          text: "Signes vitaux et apparence générale",
          binaryOnly: true
        },
        {
          id: "e2",
          text: "Examen otoscopique",
          details: ["Conduit auditif externe", "Cérumen", "Membrane tympanique", "Réflexe lumineux"]
        },
        {
          id: "e3",
          text: "Tests auditifs",
          details: ["Test de Rinne", "Test de Weber", "Test voix chuchotée"]
        },
        {
          id: "e4",
          text: "Examen neurologique",
          details: ["Nerfs crâniens", "Équilibre", "Test Romberg", "Démarche"]
        }
      ];
    case 57: // Fatigue VIH
    case 58: // Fatigue cancer
      return [
        {
          id: "e1",
          text: "Signes vitaux et apparence générale",
          binaryOnly: true
        },
        {
          id: "e2",
          text: "Recherche signes généraux",
          details: ["Pâleur", "Ictère", "Cyanose", "Œdèmes"]
        },
        {
          id: "e3",
          text: "Examen ganglionnaire",
          details: ["Chaînes cervicales", "Axillaires", "Inguinales", "Splénomégalie"]
        },
        {
          id: "e4",
          text: "Examen abdominal",
          details: ["Hépatomégalie", "Masses", "Ascite", "Sensibilité"]
        },
        {
          id: "e5",
          text: "Examen cutané",
          details: caseData.number === 57 ? ["Sarcome Kaposi", "Zona", "Candidose"] : ["Ictère", "Pâleur", "Purpura"]
        }
      ];
    default:
      return [
        {
          id: "e1",
          text: "Examen physique complet",
          binaryOnly: true
        }
      ];
  }
}

function getManagementPlan(caseData) {
  const plans = {
    53: [
      "Optimisation insulinothérapie",
      "Éducation thérapeutique diabète",
      "Consultation ophtalmologie annuelle",
      "Podologue si nécessaire",
      "Suivi HbA1c trimestriel",
      "Vaccination grippe/pneumocoque"
    ],
    54: [
      "Consultation présentielle urgente",
      "Changement IEC (toux)",
      "Optimisation traitement ICC",
      "Échocardiographie",
      "Bilan complications HTA",
      "Modifications hygiéno-diététiques"
    ],
    55: [
      "Renouvellement traitement de fond",
      "Plan action écrit",
      "Technique inhalation",
      "Éviction allergènes",
      "Spirométrie contrôle",
      "Vaccination grippe"
    ],
    56: [
      "Audiométrie complète",
      "Révision médication (HCTZ)",
      "Référence ORL",
      "Évaluation appareillage",
      "Support psychosocial"
    ],
    57: [
      "Dépistage VIH urgent",
      "CD4 et charge virale si positif",
      "Dépistage IST complet",
      "Counseling prévention",
      "Notification partenaires",
      "Support psychosocial"
    ],
    58: [
      "Imagerie abdominale urgente",
      "Marqueurs tumoraux",
      "Endoscopie haute",
      "Référence oncologie si cancer",
      "Support deuil",
      "Antidépresseurs si indiqué"
    ]
  };
  return plans[caseData.number] || ["Plan adapté au diagnostic"];
}

function getPatientEducation(caseNumber) {
  const education = {
    53: ["Surveillance glycémie", "Soins pieds quotidiens", "Signes hypoglycémie", "Alimentation équilibrée", "Activité physique régulière"],
    54: ["Surveillance TA domicile", "Restriction sodée", "Perte poids", "Arrêt tabac urgent", "Activité physique adaptée"],
    55: ["Éviction triggers", "Plan action crise", "Technique inhalation", "Rinçage bouche après corticoïdes", "Consultation si aggravation"],
    56: ["Protection auditive", "Stratégies communication", "Sécurité domicile", "Appareillage si indiqué", "Support famille"],
    57: ["Rapports protégés", "Notification partenaires", "Arrêt drogues", "Observance future traitement", "Groupes support"],
    58: ["Signes alarme", "Nutrition adaptée", "Gestion douleur", "Support psychologique", "Aide domicile si besoin"]
  };
  return education[caseNumber] || ["Éducation adaptée"];
}

function getPatientQuestions(caseNumber) {
  const questions = {
    53: ["[L'engourdissement et les picotements que je ressens dans mes jambes sont-ils liés au diabète?]"],
    54: ["[Docteur, je suis tellement inquiet. La TA de mon père n'était pas contrôlée, et il a eu un AVC.]"],
    55: [],
    56: ["[Ai-je le même problème que mon frère?]", "[Qu'en est-il des appareils auditifs pour moi?]"],
    57: ["[J'ai entendu dire que le traitement du VIH est cher, et je n'ai pas assez d'assurance.]"],
    58: ["[Ai-je un cancer, comme mon père?]"]
  };
  return questions[caseNumber] || [];
}

function getSpecificAdvice(caseNumber) {
  const advice = {
    53: "Neuropathie diabétique confirmée. Optimisation glycémique urgente. Soins pieds essentiels. Consultation ophtalmo annuelle.",
    54: "HTA mal contrôlée avec signes ICC. Consultation présentielle urgente. Ne pas renouveler par téléphone. Changement IEC nécessaire.",
    55: "Exacerbation asthme post-virale. Reprise traitement de fond. Éviction allergènes professionnels difficile mais essentielle.",
    56: "Presbyacousie probable vs ototoxicité HCTZ. Audiométrie nécessaire. Discussion changement diurétique avec médecin traitant.",
    57: "Haut risque VIH. Dépistage urgent. Counseling prévention. Support psychosocial. Accès programmes aide financière.",
    58: "Suspicion cancer vs dépression majeure. Investigations urgentes. Support deuil. Évaluation risque suicidaire."
  };
  return advice[caseNumber] || "";
}

function getPatientAttitude(caseNumber) {
  const attitudes = {
    53: ["Inquiet glycémie élevée", "Frustré problèmes assurance", "Coopératif"],
    54: ["Attente longue téléphone", "Inquiet AVC comme père", "Veut renouvellement rapide"],
    55: ["Soulagée retour Canada", "Inquiète manque médicaments", "Coopérative"],
    56: ["Parle fort", "Difficultés comprendre", "Demande répéter", "Frustrée"],
    57: ["Mal à l'aise", "Inquiet coût traitement", "Révélation progressive orientation"],
    58: ["Triste", "Déprimé", "Inquiet cancer père", "Affect émoussé"]
  };
  return attitudes[caseNumber] || ["Patient coopératif"];
}

function getExamInstructions(caseNumber) {
  const instructions = {
    53: ["Sensation diminuée jambes vs bras", "Sensibilité épigastrique légère"],
    54: ["Consultation téléphonique uniquement"],
    55: ["Pas de sifflements audibles actuellement", "Examen normal"],
    56: ["Test Rinne: conduction aérienne > osseuse", "Test Weber: pas latéralisation"],
    57: ["Pas signes physiques évidents", "Perte poids visible"],
    58: ["Sensibilité abdominale haute", "Affect dépressif visible"]
  };
  return instructions[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Gastropathie diabétique": "Diabète 10 ans, mal contrôlé, douleurs hautes, ballonnement post-prandial",
    "Neuropathie périphérique diabétique": "Diabète 10 ans, sensation diminuée jambes, dysautonomie (gastropathie)",
    "Diabète mal contrôlé": "Glycémie 250, polyurie/polydipsie/polyphagie, perte poids, complications multiples",
    "HTA essentielle": "HTA connue 5 ans, valeurs élevées domicile, ATCD familial AVC",
    "Insuffisance cardiaque": "HTA, orthopnée, œdème membres, dyspnée effort",
    "Toux induite par lisinopril": "Sous IEC, toux sèche caractéristique, pas autre cause",
    "Asthme bronchique": "ATCD asthme, traitement de fond, allergies multiples",
    "Exacerbation asthme": "Exposition froid, infection virale, arrêt traitement, symptômes aigus",
    "Presbyacousie": "Âge 55 ans, bilatéral symétrique, progressif, ATCD familial",
    "Surdité induite par médicaments (HCTZ)": "HCTZ 15 ans, surdité perception, réversible potentiel",
    "Infection VIH": "HSH, multiples partenaires, protection inconstante, ATCD IST, fatigue/amaigrissement",
    "Toxicomanie": "Marijuana chronique, alcool quotidien, fatigue, amaigrissement",
    "Syndrome fatigue chronique": "Fatigue 3 mois, concentration altérée, pas autre cause",
    "Malignité gastro-intestinale": "Syndrome constitutionnel, satiété précoce, ATCD familial cancer pancréas, tabac/alcool",
    "Trouble dépressif majeur": "Deuil récent, tristesse, anhédonie, insomnie, idées noires",
    "Pancréatite chronique": "Alcool chronique, douleur épigastrique irradiation dos, amaigrissement"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Gastropathie diabétique": "Vidange gastrique, endoscopie haute",
    "Neuropathie périphérique diabétique": "EMG/VCN, test monofilament",
    "Diabète mal contrôlé": "HbA1c, bilan complications (fond œil, microalbuminurie)",
    "HTA essentielle": "MAPA, bilan cible organes (ECG, écho, créatinine)",
    "Insuffisance cardiaque": "BNP/NT-proBNP, échocardiographie, radiographie thorax",
    "Toux induite par lisinopril": "Arrêt IEC test thérapeutique, spirométrie si doute",
    "Asthme bronchique": "Spirométrie avec test réversibilité, FeNO",
    "Exacerbation asthme": "Peak flow, gazométrie si sévère, radiographie thorax",
    "Presbyacousie": "Audiométrie tonale et vocale, tympanométrie",
    "Surdité induite par médicaments (HCTZ)": "Audiométrie, arrêt HCTZ test",
    "Infection VIH": "Test VIH 4e génération, CD4/charge virale si positif",
    "Toxicomanie": "Dépistage toxicologique urinaire complet",
    "Syndrome fatigue chronique": "Diagnostic exclusion, bilan complet",
    "Malignité gastro-intestinale": "CT abdo/pelvis, CA 19-9, endoscopie haute/basse",
    "Trouble dépressif majeur": "Échelle dépression, TSH, bilan standard",
    "Pancréatite chronique": "Lipase, CT abdomen, IRM pancréatique"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    53: ["Ne pas examiner pieds", "Oublier complications silencieuses", "Ne pas éduquer patient", "Manquer hypoglycémies"],
    54: ["Renouveler par téléphone", "Manquer signes ICC", "Ne pas changer IEC si toux", "Négliger observance"],
    55: ["Négliger triggers professionnels", "Ne pas vérifier technique", "Oublier rinçage bouche", "Sous-estimer gravité"],
    56: ["Attribuer à l'âge seul", "Ne pas tester audition", "Oublier médicaments ototoxiques", "Communication inadaptée"],
    57: ["Jugement sur orientation", "Ne pas proposer dépistage", "Oublier counseling", "Confidentialité"],
    58: ["Manquer cancer si dépression", "Ne pas évaluer suicide", "Retarder investigations", "Négliger support"]
  };
  return pieges[caseNumber] || ["Anamnèse incomplète", "Manquer complications"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-divers');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-divers');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Divers...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Divers-${caseData.number} - ${caseData.title.replace(/[()]/g, '').replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
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