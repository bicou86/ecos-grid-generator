const fs = require('fs');
const path = require('path');

// Les 8 cas Thieme Neurologie (cas 45 à 52)
const cases = [
  {
    number: 45,
    title: "Céphalée sévère avec irritation méningée",
    patient: {
      name: "M. Charles Roberts",
      age: 35,
      gender: "Homme",
      complaint: "céphalée sévère"
    },
    vitals: {
      fc: "98 bpm",
      ta: "140/100 mmHg",
      fr: "20/min",
      temperature: "37°C"
    },
    history: {
      main: "Céphalée sévère apparue hier soir pendant visite petite amie. Douleur occipitale aiguë 9/10, constante, s'aggrave. Impression tête va exploser, pire céphalée de sa vie. Photophobie.",
      additional: "Travaille à la gare. Consommation cocaïne hier. Père décédé insuffisance rénale (kystes rénaux). CAGE 2/4.",
      social: "Fume 1 pqt/j. Boit 2+ bières/j, parfois matin. Agacé par critiques alcool. Cocaïne hier. Sexuellement actif multiples partenaires, préservatifs occasionnels."
    },
    differentials: ["Hémorragie sous-arachnoïdienne (induite cocaïne)", "Hémorragie sous-arachnoïdienne (rupture anévrisme)", "Méningite"],
    exams: ["NFS avec formule", "CT cérébral", "Ponction lombaire si CT négatif", "Angio-CT cérébral"]
  },
  {
    number: 46,
    title: "Céphalée migraineuse récurrente",
    patient: {
      name: "Mlle Jasmine Lee",
      age: 30,
      gender: "Femme",
      complaint: "céphalée"
    },
    vitals: {
      fc: "86 bpm",
      ta: "120/80 mmHg",
      fr: "16/min",
      temperature: "37°C"
    },
    history: {
      main: "Céphalée sévère il y a 1h, côté droit tête. Précédée lumières clignotantes. Douleur aiguë 7/10 constante. Aggravée lumière, soulagée obscurité et ibuprofène.",
      additional: "Céphalées similaires depuis années. Mère a migraines. Dernière céphalée il y a 2 mois. Aggravation menstruations et stress. Rhinite allergique, Claritin. Sinusite aiguë récente.",
      social: "Père décédé tumeur cérébrale. Mère souffre migraines."
    },
    differentials: ["Céphalée migraineuse", "Sinusite", "Céphalée de tension"],
    exams: ["NFS avec formule", "CT sinus si suspicion sinusite"]
  },
  {
    number: 47,
    title: "Syncope chez jeune athlète",
    patient: {
      name: "M. Randal Ross",
      age: 24,
      gender: "Homme",
      complaint: "s'est évanoui hier"
    },
    vitals: {
      fc: "98 bpm",
      ta: "140/100 mmHg",
      fr: "20/min",
      temperature: "37°C"
    },
    history: {
      main: "Évanouissement hier en jouant basketball. Inconscient <1 min. Cœur battait rapidement, légère douleur thoracique. Pas de mouvements secousse, pas mordu langue.",
      additional: "Rhinite allergique, Claritin. Frère aîné décédé subitement à 28 ans (problèmes cardiaques découverts autopsie).",
      social: "Joueur basketball professionnel. Sexuellement actif, monogame avec femme."
    },
    differentials: ["Cardiomyopathie hypertrophique", "Arythmie cardiaque/valvulopathie", "Malaise vagal"],
    exams: ["NFS et électrolytes", "ECG", "Échocardiographie", "Holter 24h"]
  },
  {
    number: 48,
    title: "Syncope chez patient âgé",
    patient: {
      name: "M. Mark Thompson",
      age: 65,
      gender: "Homme",
      complaint: "syncope"
    },
    vitals: {
      fc: "98 bpm",
      ta: "140/100 mmHg",
      fr: "20/min",
      temperature: "37°C"
    },
    history: {
      main: "Évanouissement hier après courses. Durée 30 sec. Avant: cœur s'emballait, légère douleur thoracique gauche, étourdissements. Arrêt après 4-5 pâtés maisons pour reprendre souffle.",
      additional: "Angiographie il y a quelques années: rétrécissement coronaires. AVC il y a 3 ans, faiblesse résiduelle bras/jambe droits.",
      social: "Père décédé crise cardiaque. Mère dépression. Retraité. Arrêt tabac il y a 10 ans."
    },
    differentials: ["Accident ischémique transitoire", "Arythmie cardiaque", "Hypotension orthostatique"],
    exams: ["NFS et électrolytes", "CT cérébral", "ECG et Holter", "Échocardiographie", "Doppler carotidien"]
  },
  {
    number: 49,
    title: "Vertiges positionnels",
    patient: {
      name: "Mme Kim Miller",
      age: 55,
      gender: "Femme",
      complaint: "vertiges"
    },
    vitals: {
      fc: "98 bpm",
      ta: "140/100 mmHg",
      fr: "20/min",
      temperature: "37°C"
    },
    history: {
      main: "Vertiges depuis 1 mois, maintenant 2-3×/jour, dernier ce matin. Durent 20-30 sec. Augmentent en se levant soudainement. Impression pièce tourne.",
      additional: "Commencé avec nouvelle prescription HCTZ. Infection thoracique il y a quelques semaines. HTA, prend HCTZ et lisinopril. Appendicectomie il y a 30 ans.",
      social: "Ne fume pas. Boit 2-3 bières/semaine."
    },
    differentials: ["Vertige positionnel paroxystique bénin", "Névrite vestibulaire", "Effet secondaire médicamenteux (diurétique)"],
    exams: ["Manœuvre Dix-Hallpike", "Audiométrie", "IRM cérébrale si persistent"]
  },
  {
    number: 50,
    title: "Insomnie avec anxiété",
    patient: {
      name: "Mme Mary Wilson",
      age: 24,
      gender: "Femme",
      complaint: "difficultés à dormir"
    },
    vitals: {
      fc: "98 bpm",
      ta: "140/100 mmHg",
      fr: "20/min",
      temperature: "37°C"
    },
    history: {
      main: "Difficultés endormissement depuis 2 semaines, aggravation avec approche examens finaux. Se couche 22h, s'endort minuit. Pas reposée matin. Sieste journée. Transpiration, cœur s'emballe.",
      additional: "DDR il y a 2 semaines. Perte poids ressentie. Épisode similaire année dernière même période. Asthme, albutérol. Somnifères OTC. Allergie pénicilline et pollen.",
      social: "Étudiante. Fume 2 pqt/j × 5 ans. Boit rarement semaine, plus week-ends. Sexuellement active avec petit ami."
    },
    differentials: ["Anxiété", "Trouble de l'adaptation", "Hyperthyroïdie"],
    exams: ["TSH", "Dépistage toxicologique urinaire", "NFS avec formule"]
  },
  {
    number: 51,
    title: "Troubles de la mémoire",
    patient: {
      name: "Mme Freddi Miller",
      age: 65,
      gender: "Femme",
      complaint: "troubles de la mémoire"
    },
    vitals: {
      fc: "98 bpm",
      ta: "140/100 mmHg",
      fr: "20/min",
      temperature: "37°C"
    },
    history: {
      main: "Depuis mort mari, vit avec fille. Problèmes mémoire: dates, numéros téléphone, RDV. Impact vie quotidienne: oublie feu allumé, robinet ouvert. Perdue en rentrant épicerie semaine dernière.",
      additional: "Ne peut plus vivre indépendamment. HTA. AVC côté droit (ne se souvient pas quand). Angiographie cardiaque (date oubliée). Ménopausée depuis 15 ans.",
      social: "Mère avait Alzheimer. Boit socialement. Vit avec fille."
    },
    differentials: ["Maladie d'Alzheimer", "Démence vasculaire", "Hypothyroïdie"],
    exams: ["NFS et électrolytes", "Vitamine B12 sérique", "TSH", "IRM cérébrale"]
  },
  {
    number: 52,
    title: "Accident vasculaire cérébral aigu",
    patient: {
      name: "Mme Debbie Pascal",
      age: 65,
      gender: "Femme",
      complaint: "faiblesse bras et jambe droits"
    },
    vitals: {
      fc: "104 bpm",
      ta: "160/110 mmHg",
      fr: "22/min",
      temperature: "37°C"
    },
    history: {
      main: "Faiblesse bras/jambe droits apparue soudainement il y a 1h. Picotements et engourdissements côté droit. Incapacité lever bras/jambe.",
      additional: "IM il y a 5 ans, chirurgie cœur ouvert il y a 2 ans. HTA depuis 15 ans, hypercholestérolémie. Ménopausée depuis 15 ans.",
      social: "Mère décédée maladie cardiaque, père AVC. Vit seule depuis mort mari. Arrêt tabac il y a 5 ans (2 pqt/j × 35 ans)."
    },
    differentials: ["Accident vasculaire cérébral", "Accident ischémique transitoire", "Trouble de conversion"],
    exams: ["Électrolytes de base", "CT cérébral", "ECG", "Doppler carotidien"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Neurologie ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    category: "Thieme Neurologie",
    subcategory: caseData.title,
    context: {
      setting: caseData.number === 45 || caseData.number === 52 ? "Service d'urgences" : "Cabinet de médecine générale",
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
          details: getComplaintAnalysis(caseData)
        },
        {
          id: "a3",
          text: "Recherche de signes neurologiques",
          details: getNeurologicalSymptoms(caseData.number)
        },
        {
          id: "a4",
          text: "Recherche de facteurs de risque",
          details: getRiskFactors(caseData)
        },
        {
          id: "a5",
          text: "Antécédents médicaux et familiaux",
          details: getMedicalHistory(caseData)
        },
        {
          id: "a6",
          text: "Habitudes et mode de vie",
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
          text: "Examen HEENT (tête, yeux, oreilles, nez, gorge)",
          details: getHEENTExam(caseData.number)
        },
        {
          id: "e3",
          text: "Examen neurologique complet",
          details: getNeurologicalExam(caseData.number)
        },
        {
          id: "e4",
          text: "Tests spéciaux neurologiques",
          details: getSpecialTests(caseData.number)
        },
        {
          id: "e5",
          text: "Examen cardiovasculaire",
          details: ["Auscultation cardiaque", "Souffle carotidien", "Pouls périphériques"]
        },
        {
          id: "e6",
          text: "Évaluation de l'état mental (MMSE si indiqué)",
          details: getMMSE(caseData.number)
        }
      ]
    },
    management: {
      weight: 0.25,
      criteria: [
        {
          id: "m1",
          text: "Diagnostics différentiels neurologiques",
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
          text: "Plan de prise en charge neurologique",
          details: getManagementPlan(caseData)
        },
        {
          id: "m4",
          text: "Conseils et prévention",
          details: getPreventionAdvice(caseData.number)
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
        `Cas neurologique: ${caseData.title}`,
        `Patient: ${caseData.patient.gender} de ${caseData.patient.age} ans`,
        "Anamnèse neurologique complète",
        "Examen neurologique systématique",
        "Tests spéciaux appropriés"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter informations théoriques spécifiques
  if (caseData.number === 45) { // Céphalée avec HSA
    json.annexes.theoriePratique = {
      titre: "Diagnostic différentiel des céphalées",
      sections: [
        {
          titre: "Drapeaux rouges des céphalées",
          points: [
            "Céphalée en coup de tonnerre (HSA)",
            "Pire céphalée de la vie",
            "Céphalée avec fièvre et raideur nuque (méningite)",
            "Céphalée avec déficit neurologique focal",
            "Céphalée après traumatisme",
            "Céphalée nouvelle après 50 ans"
          ]
        },
        {
          titre: "Signes d'irritation méningée",
          points: [
            "Raideur de nuque",
            "Signe de Brudzinski (flexion hanches à flexion nuque)",
            "Signe de Kernig (douleur extension genou avec hanche fléchie)",
            "Photophobie"
          ]
        }
      ]
    };
  } else if (caseData.number === 52) { // AVC
    json.annexes.theoriePratique = {
      titre: "Prise en charge AVC aigu",
      sections: [
        {
          titre: "Fenêtre thérapeutique",
          points: [
            "Thrombolyse IV < 4.5h",
            "Thrombectomie < 6h (jusqu'à 24h si pénombre)",
            "CT cérébral urgent",
            "Glycémie capillaire immédiate"
          ]
        },
        {
          titre: "Échelle NIHSS simplifiée",
          points: [
            "Niveau conscience",
            "Regard et champs visuels",
            "Paralysie faciale",
            "Déficit moteur membres",
            "Ataxie",
            "Sensibilité",
            "Langage (aphasie, dysarthrie)",
            "Négligence"
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
    titre: `Thieme Neurologie ${caseData.number} - ${caseData.title} - ${caseData.patient.gender} de ${caseData.patient.age} ans`,
    contexte: caseData.number === 45 || caseData.number === 52 ? "Service d'urgences" : "Cabinet de médecine générale",
    description: `${caseData.patient.name}, ${caseData.patient.age} ans, ${caseData.patient.complaint}`
  };

  if (caseData.vitals) {
    json.signesVitaux = caseData.vitals;
  }

  json.taches = [
    "Obtenir une anamnèse ciblée",
    "Effectuer un examen physique pertinent (ne pas effectuer d'examens rectal, pelvien, génito-urinaire, hernie inguinale, sein féminin ou cornéen)",
    "Discuter de votre impression diagnostique initiale et de votre plan de prise en charge avec le patient",
    "Compléter la note patient après la consultation"
  ];

  return json;
}

// Fonctions auxiliaires
function getComplaintAnalysis(caseData) {
  const details = [];
  const main = caseData.history.main;
  
  switch(caseData.number) {
    case 45: // Céphalée HSA
      return [
        "Localisation et caractère [occipitale, aiguë]",
        "Intensité [9/10, pire céphalée de sa vie]",
        "Début et évolution [hier soir, s'aggrave]",
        "Facteurs déclenchants [pendant visite, après cocaïne]",
        "Symptômes associés [photophobie]"
      ];
    case 46: // Migraine
      return [
        "Aura visuelle [lumières clignotantes]",
        "Localisation [côté droit]",
        "Intensité [7/10]",
        "Facteurs aggravants [lumière]",
        "Facteurs soulageants [obscurité, ibuprofène]"
      ];
    case 47: // Syncope jeune
    case 48: // Syncope âgé
      return [
        "Circonstances [pendant sport/après courses]",
        "Durée perte conscience [<1 min/30 sec]",
        "Prodromes [palpitations, douleur thoracique]",
        "Récupération [rapide, complète]",
        "Mouvements anormaux [absents]"
      ];
    case 49: // Vertiges
      return [
        "Type de vertige [rotatoire]",
        "Durée épisodes [20-30 sec]",
        "Facteurs déclenchants [changement position]",
        "Fréquence [2-3×/jour]",
        "Symptômes associés [aucun]"
      ];
    case 50: // Insomnie
      return [
        "Latence endormissement [2h]",
        "Réveils nocturnes",
        "Sommeil non réparateur",
        "Symptômes diurnes [fatigue, siestes]",
        "Facteurs stress [examens]"
      ];
    case 51: // Troubles mémoire
      return [
        "Types d'oublis [dates, numéros, RDV]",
        "Impact fonctionnel [vie quotidienne affectée]",
        "Évolution [progressive]",
        "Autonomie [perte indépendance]",
        "Sécurité [oublis dangereux]"
      ];
    case 52: // AVC
      return [
        "Début [soudain, il y a 1h]",
        "Déficit moteur [bras et jambe droits]",
        "Déficit sensitif [picotements, engourdissements]",
        "Évolution [stable/aggravation]",
        "Signes associés [céphalée]"
      ];
    default:
      return main.split('.').filter(s => s.trim()).slice(0, 5);
  }
}

function getNeurologicalSymptoms(caseNumber) {
  const symptoms = {
    45: ["Raideur nuque", "Photophobie", "Pas de fièvre", "Pas déficit focal", "Pas trauma"],
    46: ["Aura visuelle", "Pattern récurrent", "Histoire familiale", "Pas déficit focal"],
    47: ["Pas convulsions", "Pas morsure langue", "Pas incontinence", "Récupération rapide"],
    48: ["Faiblesse résiduelle droite", "Dyspnée effort", "Pas convulsions"],
    49: ["Pas perte audition", "Pas acouphènes", "Pas déficit focal", "Pas céphalée"],
    50: ["Tremblements fins", "Transpiration", "Palpitations", "Anxiété"],
    51: ["Désorientation", "Apraxie", "Agnosie", "Troubles jugement"],
    52: ["Hémiparésie droite", "Hémihypoesthésie droite", "Pas aphasie", "Pas négligence"]
  };
  return symptoms[caseNumber] || [];
}

function getRiskFactors(caseData) {
  const factors = [];
  const text = caseData.history.main + " " + caseData.history.additional + " " + caseData.history.social;
  
  if (text.includes("cocaïne")) factors.push("Consommation cocaïne récente");
  if (text.includes("HTA") || text.includes("hypertension")) factors.push("Hypertension artérielle");
  if (text.includes("tabac") || text.includes("fume")) factors.push("Tabagisme");
  if (text.includes("alcool") || text.includes("bière")) factors.push("Consommation alcool");
  if (text.includes("diabète")) factors.push("Diabète");
  if (text.includes("cholestérol")) factors.push("Hypercholestérolémie");
  if (text.includes("cardiaque") || text.includes("cœur")) factors.push("Maladie cardiovasculaire");
  if (text.includes("AVC")) factors.push("Antécédent AVC");
  
  return factors.length > 0 ? factors : ["Évaluation facteurs risque cardiovasculaire"];
}

function getMedicalHistory(caseData) {
  const history = [];
  const addInfo = caseData.history.additional;
  
  if (addInfo.includes("ATCD") || addInfo.includes("antécédent")) {
    const parts = addInfo.split('.').filter(s => s.trim());
    parts.forEach(part => {
      if (part.includes("ATCD") || part.includes("chirurgie") || part.includes("il y a")) {
        history.push(part.trim());
      }
    });
  }
  
  // Ajouter histoire familiale
  if (caseData.history.social.includes("père") || caseData.history.social.includes("mère")) {
    const family = caseData.history.social.match(/[Pp]ère[^.]+\.|[Mm]ère[^.]+\./g);
    if (family) history.push(...family.map(f => f.trim()));
  }
  
  return history.length > 0 ? history : ["Pas d'antécédents significatifs"];
}

function getHEENTExam(caseNumber) {
  const exams = {
    45: ["PERRLA", "Pas papillœdème", "Nuque raide", "Photophobie"],
    46: ["PERRLA", "Pas papillœdème", "Sensibilité sinus", "Nuque souple"],
    47: ["PERRLA", "MOM intacts", "Nuque souple", "Pas souffle carotidien"],
    48: ["PERRLA", "MOM intacts", "Souffle carotidien?", "DVJ?"],
    49: ["Membranes tympaniques claires", "Test Rinne/Weber", "Pas nystagmus"],
    50: ["PERRLA", "Thyroïde normale", "Pas exophtalmie"],
    51: ["PERRLA", "Réflexe rouge intact", "Pas souffle carotidien"],
    52: ["PERRLA", "Déviation regard?", "Paralysie faciale?", "Aphasie?"]
  };
  return exams[caseNumber] || ["PERRLA", "MOM intacts", "Nuque souple"];
}

function getNeurologicalExam(caseNumber) {
  const exams = {
    45: ["Nerfs crâniens II-XII intacts", "Force 5/5", "Sensation intacte", "ROT 2+", "Brudzinski positif", "Kernig positif"],
    46: ["Nerfs crâniens II-XII intacts", "Force 5/5", "Sensation intacte", "ROT 2+", "Pas déficit focal"],
    47: ["Nerfs crâniens II-XII intacts", "Force 5/5", "Sensation intacte", "ROT 2+", "Démarche normale"],
    48: ["Force 3/5 côté droit", "Sensation altérée droite", "ROT 1+ droite, 2+ gauche", "Démarche hémiparétique"],
    49: ["Nerfs crâniens II-XII intacts", "Force 5/5", "Sensation intacte", "ROT 2+", "Démarche normale"],
    50: ["Tremblements fins mains", "Force 5/5", "Sensation intacte", "ROT 2+", "Hyperréflexie?"],
    51: ["Force 3/5 côté droit", "Sensation intacte", "ROT 1+ droite", "Démarche prudente"],
    52: ["Force 3/5 côté droit", "Sensation altérée droite", "ROT 3+ droite", "Babinski positif droit"]
  };
  return exams[caseNumber] || ["Examen neurologique complet"];
}

function getSpecialTests(caseNumber) {
  const tests = {
    45: ["Brudzinski", "Kernig", "Photophobie", "Raideur nuque"],
    46: ["Recherche triggers migraine", "Palpation points gâchettes"],
    47: ["Test Romberg", "Test orthostatique", "Manœuvre Valsalva"],
    48: ["Test Romberg", "Test orthostatique", "Évaluation déficit résiduel"],
    49: ["Test Romberg", "Dix-Hallpike", "Test tête impulse", "Test marche"],
    50: ["Observation tremblements", "Test anxiété"],
    51: ["MMSE complet", "Test horloge", "Test 3 mots", "Évaluation praxies"],
    52: ["Échelle NIHSS", "Babinski", "Évaluation aphasie", "Test négligence"]
  };
  return tests[caseNumber] || ["Tests selon orientation"];
}

function getMMSE(caseNumber) {
  if (caseNumber === 51) {
    return [
      "Orientation temporo-spatiale",
      "Rappel 3 mots",
      "Calcul sériel (100-7)",
      "Langage et répétition",
      "Praxies constructives"
    ];
  } else if (caseNumber === 52) {
    return ["Évaluation conscience", "Orientation", "Langage", "Négligence"];
  }
  return ["État mental normal"];
}

function getManagementPlan(caseData) {
  const plans = {
    45: [
      "CT cérébral urgent",
      "Ponction lombaire si CT négatif",
      "Antalgie IV",
      "Surveillance neurologique",
      "Neurochirurgie si anévrisme"
    ],
    46: [
      "Triptans si migraine confirmée",
      "Prophylaxie si fréquent",
      "Éviter triggers",
      "Journal céphalées"
    ],
    47: [
      "Restriction activité sportive",
      "Référence cardiologie urgente",
      "Dépistage famille (CMH)",
      "Conseil génétique"
    ],
    48: [
      "Optimisation facteurs risque",
      "Antiagrégants",
      "Statines",
      "Surveillance AIT/AVC"
    ],
    49: [
      "Manœuvres repositionnement",
      "Révision médication",
      "Exercices vestibulaires",
      "Antivertigineux si besoin"
    ],
    50: [
      "Hygiène sommeil",
      "Gestion stress",
      "TCC insomnie",
      "Éviter hypnotiques"
    ],
    51: [
      "Évaluation gériatrique",
      "Support social",
      "Sécurité domicile",
      "Anticholinestérasiques si Alzheimer"
    ],
    52: [
      "Code AVC activé",
      "Thrombolyse si éligible",
      "Unité neurovasculaire",
      "Prévention secondaire",
      "Réadaptation précoce"
    ]
  };
  return plans[caseData.number] || ["Plan adapté au diagnostic"];
}

function getPreventionAdvice(caseNumber) {
  const advice = {
    45: ["Arrêt cocaïne urgent", "Contrôle TA", "Surveillance récidive", "Éviter efforts"],
    46: ["Identifier triggers", "Journal migraine", "Gestion stress", "Sommeil régulier"],
    47: ["Arrêt sport immédiat", "Dépistage famille", "Port défibrillateur?", "Suivi cardio"],
    48: ["Contrôle facteurs risque", "Observance traitement", "Signes alerte AVC", "Activité adaptée"],
    49: ["Précautions chutes", "Lever progressif", "Révision médications", "Hydratation"],
    50: ["Hygiène sommeil", "Arrêt tabac", "Limiter caféine", "Gestion anxiété"],
    51: ["Supervision continue", "Aide-mémoire", "Sécurité domicile", "Support aidants"],
    52: ["Urgence 144", "FAST (Face-Arms-Speech-Time)", "Rééducation intensive", "Prévention récidive"]
  };
  return advice[caseNumber] || ["Conseils préventifs adaptés"];
}

function getPatientQuestions(caseNumber) {
  const questions = {
    45: [
      "[J'ai l'impression que ma tête va exploser. Est-ce que je vais mourir?]",
      "[Est-ce à cause de la cocaïne?]"
    ],
    46: [
      "[Est-il possible que j'aie des migraines parce que ma mère en a?]",
      "[Les migraines sont-elles héréditaires?]"
    ],
    47: [
      "[Docteur, est-ce qu'il pourrait y avoir quelque chose qui ne va pas avec mon cœur comme pour mon frère?]",
      "[Nous avons un match important demain. Mon équipe a vraiment besoin de moi. Puis-je jouer?]"
    ],
    48: [],
    49: [
      "[Docteur, que pensez-vous de l'arrêt de ces nouveaux comprimés?]"
    ],
    50: [
      "[Docteur, je suis inquiète de ne pas réussir mon examen. Je me sens vraiment stressée.]",
      "[Docteur, parfois mon cœur bat aussi vite qu'un cheval de course. Pensez-vous qu'il y a quelque chose qui ne va pas avec mon cœur?]",
      "[Pourriez-vous me prescrire des somnifères plus puissants?]"
    ],
    51: [
      "[Est-il possible que j'aie la maladie d'Alzheimer?]",
      "[Pensez-vous que je devrais m'abstenir d'avoir des relations sexuelles?]"
    ],
    52: [
      "[Est-ce que je fais un accident vasculaire cérébral?]",
      "[Docteur, pensez-vous que je retrouverai l'usage de mon bras et de ma jambe?]"
    ]
  };
  return questions[caseNumber] || [];
}

function getSpecificAdvice(caseNumber) {
  const advice = {
    45: "Urgence neurochirurgicale. Arrêt immédiat cocaïne. Surveillance unité soins intensifs.",
    46: "Migraine typique avec aura. Traitement aigu et prophylactique. Éviter déclencheurs.",
    47: "Interdiction sport jusqu'à bilan cardiaque complet. Risque mort subite. Dépistage familial urgent.",
    48: "Haut risque AVC. Optimisation traitement. Surveillance étroite.",
    49: "VPPB probable. Manœuvres repositionnement. Réviser médication HTA.",
    50: "Anxiété examens. Hygiène sommeil. Éviter hypnotiques. TCC si persistent.",
    51: "Démence probable (Alzheimer vs vasculaire). Support famille. Sécurité prioritaire.",
    52: "AVC aigu. Fenêtre thrombolyse. Admission USI neurovasculaire. Pronostic réservé."
  };
  return advice[caseNumber] || "";
}

function getPatientAttitude(caseNumber) {
  const attitudes = {
    45: ["Allongé, mains sur yeux", "Photophobie sévère", "Douleur extrême", "Anxieux"],
    46: ["Inconfort lumière", "Antécédents migraines", "Inquiète récurrence"],
    47: ["Sportif inquiet", "Minimise symptômes", "Veut jouer match"],
    48: ["Inquiet AVC", "Antécédents multiples", "Coopératif"],
    49: ["Frustrée vertiges", "Inquiète médication", "Coopérative"],
    50: ["Anxieuse examens", "Agitée", "Tremblements visibles"],
    51: ["Confuse", "Désorientée", "Accompagnée fille", "Ne se souvient pas"],
    52: ["Allongée lit", "Paniquée", "Ne peut bouger côté droit", "Pleure"]
  };
  return attitudes[caseNumber] || ["Patient coopératif"];
}

function getExamInstructions(caseNumber) {
  const instructions = {
    45: ["Raideur nuque++", "Brudzinski: fléchir jambes si flexion nuque", "Kernig: douleur extension genou", "Photophobie marquée"],
    46: ["Sensibilité pression sinus", "Pas de raideur nuque", "Photophobie légère"],
    47: ["Aucun signe anormal", "Examen cardiaque normal", "Pas déficit neurologique"],
    48: ["Faiblesse côté droit", "ROT diminués droite", "Sensation altérée droite"],
    49: ["Pas de nystagmus spontané", "Romberg négatif", "Audition normale"],
    50: ["Tremblements fins doigts étendus", "Anxiété visible", "Tachycardie"],
    51: ["Ne rappelle pas 3 mots", "Faiblesse légère droite", "ROT diminués droite"],
    52: ["Hémiparésie droite complète", "Hémihypoesthésie droite", "ROT vifs droite", "Babinski positif droit"]
  };
  return instructions[caseNumber] || [];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const args = {
    "Hémorragie sous-arachnoïdienne (induite cocaïne)": "Céphalée brutale, pire de sa vie, cocaïne récente, photophobie, raideur nuque",
    "Hémorragie sous-arachnoïdienne (rupture anévrisme)": "Céphalée brutale, père PKR (anévrisme baie), signes méningés",
    "Méningite": "Céphalée, raideur nuque, Brudzinski/Kernig positifs, photophobie",
    "Céphalée migraineuse": "Aura visuelle, unilatérale, ATCD familiaux, récurrente, photophobie",
    "Sinusite": "Céphalée, sinusite récente, sensibilité sinus, rhinite allergique",
    "Céphalée de tension": "Stress, pattern tension, pas aura, amélioration repos",
    "Cardiomyopathie hypertrophique": "Jeune athlète, syncope effort, ATCD familial mort subite, asymptomatique repos",
    "Arythmie cardiaque/valvulopathie": "Syncope, palpitations, douleur thoracique, récupération rapide",
    "Malaise vagal": "Syncope brève, récupération complète, contexte effort",
    "Accident ischémique transitoire": "Déficit neurologique transitoire, ATCD AVC, facteurs risque multiples",
    "Vertige positionnel paroxystique bénin": "Vertiges brefs, positionnels, rotatoires, pas déficit auditif",
    "Névrite vestibulaire": "Vertiges, infection récente VRS, pas perte audition",
    "Effet secondaire médicamenteux (diurétique)": "Début avec HCTZ, vertiges positionnels, HTA",
    "Anxiété": "Stress examens, insomnie, palpitations, tremblements, épisode similaire",
    "Trouble de l'adaptation": "Stress aigu, symptômes récents, contexte examens",
    "Hyperthyroïdie": "Insomnie, palpitations, tremblements, perte poids",
    "Maladie d'Alzheimer": "Troubles mémoire progressifs, désorientation, perte autonomie, ATCD familial",
    "Démence vasculaire": "Troubles mémoire, ATCD AVC, déficit neurologique focal",
    "Hypothyroïdie": "Troubles mémoire, ralentissement psychomoteur",
    "Accident vasculaire cérébral": "Déficit brutal, hémiparésie, facteurs risque multiples, HTA",
    "Trouble de conversion": "Contexte stress (veuvage), déficit non systématisé"
  };
  return args[diagnosis] || "Selon présentation clinique";
}

function getSuggestedTest(diagnosis) {
  const tests = {
    "Hémorragie sous-arachnoïdienne (induite cocaïne)": "CT cérébral urgent, PL si CT négatif, angio-CT",
    "Hémorragie sous-arachnoïdienne (rupture anévrisme)": "CT cérébral, angiographie cérébrale, PL",
    "Méningite": "PL urgente, hémocultures, CT avant PL si signes focaux",
    "Céphalée migraineuse": "Diagnostic clinique, IRM si atypique",
    "Sinusite": "CT sinus si chronique, radiographie sinus",
    "Céphalée de tension": "Diagnostic clinique, exclusion autres causes",
    "Cardiomyopathie hypertrophique": "ECG, échocardiographie, IRM cardiaque, test génétique",
    "Arythmie cardiaque/valvulopathie": "ECG, Holter 24h, échocardiographie",
    "Malaise vagal": "Test table basculante, ECG",
    "Accident ischémique transitoire": "CT/IRM cérébral, Doppler carotidien, ECG",
    "Vertige positionnel paroxystique bénin": "Manœuvre Dix-Hallpike, test repositionnement",
    "Névrite vestibulaire": "Test calorique, audiométrie, IRM si doute",
    "Effet secondaire médicamenteux (diurétique)": "Ionogramme, test orthostatique",
    "Anxiété": "TSH, dépistage toxicologique, échelle anxiété",
    "Trouble de l'adaptation": "Évaluation psychiatrique, TSH",
    "Hyperthyroïdie": "TSH, T3/T4 libres, anticorps thyroïdiens",
    "Maladie d'Alzheimer": "MMSE, IRM cérébrale, PET-scan, biomarqueurs LCR",
    "Démence vasculaire": "IRM cérébrale, bilan vasculaire complet",
    "Hypothyroïdie": "TSH, T4 libre",
    "Accident vasculaire cérébral": "CT cérébral urgent, IRM diffusion, ECG, échocardiographie",
    "Trouble de conversion": "Exclusion organique, évaluation psychiatrique"
  };
  return tests[diagnosis] || "Selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    45: ["Ne pas reconnaître HSA", "Oublier consommation cocaïne", "Ne pas faire PL si CT négatif"],
    46: ["Confondre avec céphalée secondaire", "Ne pas rechercher triggers", "Sur-investigation"],
    47: ["Autoriser reprise sport", "Manquer CMH", "Ne pas dépister famille"],
    48: ["Minimiser risque AVC", "Ne pas optimiser traitement", "Manquer déficit résiduel"],
    49: ["Ne pas faire Dix-Hallpike", "Manquer effet médicamenteux", "Sur-investiguer"],
    50: ["Prescrire hypnotiques", "Manquer hyperthyroïdie", "Ne pas évaluer anxiété"],
    51: ["Ne pas faire MMSE", "Manquer démence réversible", "Ne pas évaluer sécurité"],
    52: ["Retarder thrombolyse", "Ne pas activer code AVC", "Manquer fenêtre thérapeutique"]
  };
  return pieges[caseNumber] || ["Examen incomplet", "Manquer urgence"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'thieme-neurologie');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'thieme-neurologie');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Neurologie...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const fileName = `Thieme-Neurologie-${caseData.number} - ${caseData.title.replace(/[()]/g, '').replace(/\//g, '-')} - ${caseData.patient.gender} de ${caseData.patient.age} ans`;
  
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