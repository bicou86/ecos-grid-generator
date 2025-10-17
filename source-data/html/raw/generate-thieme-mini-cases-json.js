const fs = require('fs');
const path = require('path');

// Les 18 mini-cas Thieme (cas 59 à 76)
const cases = [
  {
    number: 59,
    title: "Visite médicale d'embauche",
    patient: {
      name: "Patient standardisé",
      age: 35,
      gender: "Homme",
      complaint: "examen médical d'embauche"
    },
    context: "Examen de routine sans plainte spécifique",
    focus: ["Examen général", "Dépistage diabète/TB", "Aptitude au travail"],
    differentials: ["Diabète méconnu", "Tuberculose latente", "Hypertension non diagnostiquée"],
    exams: ["NFS", "Glycémie à jeun", "Radiographie thoracique", "Analyse d'urine"]
  },
  {
    number: 60,
    title: "Douleur de la main - Syndrome du canal carpien",
    patient: {
      name: "Patient standardisé",
      age: 45,
      gender: "Femme",
      complaint: "douleur et engourdissement de la main"
    },
    context: "Compression du nerf médian au niveau du poignet",
    focus: ["Test de Phalen", "Signe de Tinel", "Distribution nerf médian"],
    differentials: ["Syndrome du canal carpien", "Radiculopathie cervicale", "Polyneuropathie"],
    exams: ["Radiographie de la main", "EMG", "Étude de conduction nerveuse"]
  },
  {
    number: 61,
    title: "Douleur du coude",
    patient: {
      name: "Patient standardisé",
      age: 40,
      gender: "Homme",
      complaint: "douleur du coude"
    },
    context: "Épicondylite latérale ou médiale",
    focus: ["Test de Cozen", "Palpation épicondyles", "Tennis vs Golfer's elbow"],
    differentials: ["Épicondylite latérale (tennis elbow)", "Épicondylite médiale (golfer's elbow)", "Arthrite du coude"],
    exams: ["Radiographie du coude", "IRM du coude si persistance"]
  },
  {
    number: 62,
    title: "Douleur du pied",
    patient: {
      name: "Patient standardisé",
      age: 50,
      gender: "Femme",
      complaint: "douleur au talon et à la plante du pied"
    },
    context: "Fasciite plantaire ou tendinite d'Achille",
    focus: ["Palpation fascia plantaire", "Tendon d'Achille", "Recherche corps étranger"],
    differentials: ["Fasciite plantaire", "Tendinite d'Achille", "Corps étranger"],
    exams: ["Radiographie du pied", "IRM de la cheville si nécessaire"]
  },
  {
    number: 63,
    title: "Douleur du mollet",
    patient: {
      name: "Patient standardisé",
      age: 55,
      gender: "Homme",
      complaint: "douleur du mollet"
    },
    context: "Diagnostic différentiel entre causes musculaires et vasculaires",
    focus: ["Signe de Homans", "Recherche TVP", "Signes inflammatoires"],
    differentials: ["Thrombose veineuse profonde", "Lésion musculaire", "Cellulite/myosite", "Rupture kyste de Baker"],
    exams: ["Échographie Doppler membres inférieurs", "D-dimères", "IRM si kyste suspecté"]
  },
  {
    number: 64,
    title: "Éruption cutanée",
    patient: {
      name: "Patient standardisé",
      age: 30,
      gender: "Femme",
      complaint: "éruption cutanée"
    },
    context: "Éruption d'étiologie à déterminer",
    focus: ["Circonstances apparition", "Caractéristiques éruption", "Symptômes associés"],
    differentials: ["Réaction allergique", "Infection cutanée", "Maladie auto-immune (LES, PR)", "Photodermatite"],
    exams: ["NFS", "VS, CRP", "Anticorps anti-nucléaires si suspicion auto-immune"]
  },
  {
    number: 65,
    title: "Tremblements",
    patient: {
      name: "Patient standardisé",
      age: 65,
      gender: "Homme",
      complaint: "tremblements des mains"
    },
    context: "Tremblements à caractériser",
    focus: ["Type de tremblement", "Circonstances apparition", "Antécédents familiaux"],
    differentials: ["Tremblement essentiel", "Maladie de Parkinson", "Tremblement cérébelleux", "Effet secondaire médicamenteux"],
    exams: ["Bilan thyroïdien", "IRM cérébrale si indiquée", "Revue médicaments"]
  },
  {
    number: 66,
    title: "Problèmes oculaires/visuels",
    patient: {
      name: "Patient standardisé",
      age: 70,
      gender: "Femme",
      complaint: "troubles visuels"
    },
    context: "Perte progressive ou soudaine de vision",
    focus: ["Caractère progressif/soudain", "Uni/bilatéral", "Douleur associée"],
    differentials: ["Glaucome", "Cataracte", "Dégénérescence maculaire", "Rétinopathie diabétique/hypertensive"],
    exams: ["Glycémie, HbA1c", "Examen lampe à fente", "Tonométrie", "CT cérébral si HIC suspectée"]
  },
  {
    number: 67,
    title: "Malabsorption",
    patient: {
      name: "Patient standardisé",
      age: 35,
      gender: "Femme",
      complaint: "douleur abdominale, ballonnements et diarrhée"
    },
    context: "Syndrome de malabsorption",
    focus: ["Aliments déclencheurs", "Perte de poids", "Caractéristiques selles"],
    differentials: ["Maladie cœliaque", "Intolérance au lactose", "Pancréatite chronique", "Fibrose kystique"],
    exams: ["NFS", "Anticorps anti-transglutaminase", "Analyse des selles", "Test respiratoire lactose"]
  },
  {
    number: 68,
    title: "Dysphagie",
    patient: {
      name: "Patient standardisé",
      age: 60,
      gender: "Homme",
      complaint: "difficulté à avaler"
    },
    context: "Dysphagie progressive",
    focus: ["Solides vs liquides", "Progression", "Perte de poids"],
    differentials: ["Achalasie", "Cancer de l'œsophage", "Syndrome CREST", "Sténose œsophagienne"],
    exams: ["Transit baryté", "Manométrie œsophagienne", "Endoscopie digestive haute"]
  },
  {
    number: 69,
    title: "Retard de passage du méconium",
    patient: {
      name: "Nouveau-né",
      age: 2,
      ageUnit: "jours",
      gender: "Garçon",
      complaint: "pas de selles depuis la naissance",
      parent: "Parents"
    },
    context: "Nouveau-né avec retard d'émission méconiale",
    focus: ["Distension abdominale", "Vomissements", "Alimentation"],
    differentials: ["Iléus méconial", "Maladie de Hirschsprung", "Anus imperforé", "Atrésie intestinale"],
    exams: ["Toucher rectal", "Radiographie abdominale", "Lavement opaque"]
  },
  {
    number: 70,
    title: "Épistaxis",
    patient: {
      name: "Patient standardisé",
      age: 55,
      gender: "Homme",
      complaint: "saignements de nez répétés"
    },
    context: "Épistaxis récurrentes",
    focus: ["Fréquence", "Traumatisme", "Médicaments anticoagulants"],
    differentials: ["HTA non contrôlée", "Troubles de coagulation", "Traumatisme nasal", "Rhinite allergique"],
    exams: ["Mesure TA", "NFS, TP/TCA", "Examen ORL"]
  },
  {
    number: 71,
    title: "Syndrome de Sheehan",
    patient: {
      name: "Femme standardisée",
      age: 35,
      gender: "Femme",
      complaint: "fatigue extrême et absence de lactation"
    },
    context: "Post-partum avec hémorragie",
    focus: ["ATCD hémorragie post-partum", "Absence lactation", "Aménorrhée"],
    differentials: ["Syndrome de Sheehan", "Hypothyroïdie post-partum", "Dépression post-partum"],
    exams: ["TSH, T3, T4", "Prolactine", "FSH, LH", "IRM hypophysaire"]
  },
  {
    number: 72,
    title: "Écoulement génital",
    patient: {
      name: "Patient standardisé",
      age: 28,
      gender: "Homme",
      complaint: "écoulement génital"
    },
    context: "IST probable",
    focus: ["Caractéristiques écoulement", "Dysurie", "Partenaires sexuels"],
    differentials: ["Gonorrhée", "Chlamydia", "Candidose", "Trichomonas"],
    exams: ["Prélèvement pour culture", "PCR gonocoque/chlamydia", "Test VIH", "Sérologie syphilis"]
  },
  {
    number: 73,
    title: "Dyspareunie",
    patient: {
      name: "Femme standardisée",
      age: 32,
      gender: "Femme",
      complaint: "douleur pendant les rapports sexuels"
    },
    context: "Rapports sexuels douloureux",
    focus: ["Localisation douleur", "Lubrification", "Facteurs psychologiques"],
    differentials: ["Vaginisme", "Endométriose", "Infection pelvienne", "Sécheresse vaginale"],
    exams: ["Examen gynécologique", "Échographie pelvienne", "Prélèvements si infection"]
  },
  {
    number: 74,
    title: "Ictère",
    patient: {
      name: "Patient standardisé",
      age: 45,
      gender: "Homme",
      complaint: "jaunisse"
    },
    context: "Ictère à explorer",
    focus: ["Couleur urines/selles", "Douleur abdominale", "Voyage récent"],
    differentials: ["Hépatite virale", "Obstruction biliaire", "Cirrhose", "Hémolyse"],
    exams: ["Bilan hépatique complet", "Bilirubine directe/indirecte", "Sérologie hépatites", "Échographie abdominale"]
  },
  {
    number: 75,
    title: "Thorax bruyant/sifflant chez l'enfant",
    patient: {
      name: "Enfant",
      age: 3,
      ageUnit: "ans",
      gender: "Garçon",
      complaint: "respiration bruyante",
      parent: "Parent"
    },
    context: "Stridor ou wheezing chez l'enfant",
    focus: ["Début brutal/progressif", "Fièvre", "Contexte de jeu"],
    differentials: ["Corps étranger", "Croup", "Épiglottite", "Asthme"],
    exams: ["Radiographie thoracique", "Laryngoscopie si corps étranger", "NFS si infection"]
  },
  {
    number: 76,
    title: "Asthme bronchique",
    patient: {
      name: "Patient standardisé",
      age: 25,
      gender: "Homme",
      complaint: "sifflements respiratoires et essoufflement"
    },
    context: "Crise d'asthme",
    focus: ["Facteurs déclenchants", "Traitement actuel", "Hospitalisations antérieures"],
    differentials: ["Asthme bronchique", "BPCO débutante", "Insuffisance cardiaque", "Anxiété"],
    exams: ["Spirométrie", "Radiographie thoracique", "Gaz du sang si sévère", "Test allergique"]
  }
];

// Fonction pour créer le JSON principal
function createMainJSON(caseData) {
  const json = {
    title: `Thieme Mini-Cas ${caseData.number} - ${caseData.title} - ${caseData.patient.gender}${caseData.patient.age ? ` de ${caseData.patient.age} ${caseData.patient.ageUnit || 'ans'}` : ''}`,
    category: "Thieme Mini-Cas",
    subcategory: caseData.title,
    context: {
      setting: "Cabinet de médecine générale",
      patient: formatPatientDescription(caseData)
    }
  };

  // Créer les sections adaptées aux mini-cas
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
          text: "Analyse ciblée de la plainte",
          details: getTargetedQuestions(caseData)
        },
        {
          id: "a3",
          text: "Recherche des éléments clés",
          details: caseData.focus
        },
        {
          id: "a4",
          text: "Antécédents pertinents",
          details: getRelevantHistory(caseData.number)
        },
        {
          id: "a5",
          text: "Revue des systèmes ciblée",
          details: getSystemsReview(caseData.number)
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
          text: "Examens complémentaires",
          details: caseData.exams
        },
        {
          id: "m3",
          text: "Plan de prise en charge",
          details: getManagementPlan(caseData.number)
        },
        {
          id: "m4",
          text: "Conseils au patient",
          details: getPatientAdvice(caseData.number)
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
        text: "Explications au patient",
        content: getPatientExplanation(caseData.number)
      },
      {
        id: "c2",
        text: "Questions du patient",
        content: getPatientQuestions(caseData.number).join('\n')
      }
    ]
  };

  // Ajouter les annexes
  json.annexes = {
    scenarioPatienteStandardisee: {
      titre: "Instructions pour le patient standardisé",
      nom: caseData.patient.name,
      age: `${caseData.patient.age || ''} ${caseData.patient.ageUnit || 'ans'}`.trim(),
      contexte: json.context.setting,
      motifConsultation: {
        plaintePrincipale: caseData.patient.complaint,
        contexte: caseData.context
      },
      simulation: {
        attitude: getPatientAttitude(caseData.number),
        signesPhysiques: getPhysicalSigns(caseData.number),
        durantConsultation: getConsultationBehavior(caseData.number)
      }
    },
    informationsExpert: {
      titre: "Informations pour l'expert",
      pointsCles: [
        `Mini-cas clinique: ${caseData.title}`,
        `Focus: ${caseData.focus.join(', ')}`,
        "Consultation ciblée de 10 minutes",
        "Évaluation de l'approche diagnostique"
      ],
      pieges: getPieges(caseData.number)
    }
  };

  // Ajouter informations spécifiques selon le cas
  if (caseData.number === 60) { // Canal carpien
    json.annexes.theoriePratique = {
      titre: "Tests spécifiques",
      sections: [
        {
          titre: "Test de Phalen",
          contenu: "Maintenir le dos des deux mains ensemble en flexion aiguë pendant 30 secondes. Positif si engourdissement/picotements dans territoire du nerf médian."
        },
        {
          titre: "Signe de Tinel",
          contenu: "Percuter le trajet du nerf médian dans le canal carpien. Positif si engourdissement/picotements."
        }
      ]
    };
  }

  if (caseData.number === 61) { // Coude
    json.annexes.theoriePratique = {
      titre: "Test de Cozen",
      sections: [
        {
          titre: "Technique",
          contenu: "Patient fléchit le poignet, coude en extension. Demander extension du poignet contre résistance. Douleur à l'épicondyle latéral = test positif pour tennis elbow."
        }
      ]
    };
  }

  return json;
}

// Fonction pour créer le JSON feuille-porte
function createDoorSheetJSON(caseData) {
  const json = {
    titre: `Thieme Mini-Cas ${caseData.number} - ${caseData.title} - ${caseData.patient.gender}${caseData.patient.age ? ` de ${caseData.patient.age} ${caseData.patient.ageUnit || 'ans'}` : ''}`,
    contexte: "Cabinet de médecine générale",
    description: formatPatientDescription(caseData) + ` - Consultation ciblée: ${caseData.patient.complaint}`
  };

  json.taches = [
    "Obtenir une anamnèse ciblée sur la plainte principale",
    "Réaliser un examen physique pertinent",
    "Expliquer votre impression clinique et le plan d'examens complémentaires au patient"
  ];

  return json;
}

// Fonctions auxiliaires
function formatPatientDescription(caseData) {
  if (caseData.patient.parent) {
    return `${caseData.patient.parent} consulte pour ${caseData.patient.name}, ${caseData.patient.age} ${caseData.patient.ageUnit}, qui présente: ${caseData.patient.complaint}`;
  }
  
  if (caseData.patient.age) {
    return `${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit || 'ans'}, ${caseData.patient.name}, consulte pour ${caseData.patient.complaint}`;
  }
  
  return `${caseData.patient.name} consulte pour ${caseData.patient.complaint}`;
}

function getTargetedQuestions(caseData) {
  const questions = {
    59: ["Symptômes actuels", "Antécédents médicaux", "Médicaments", "Aptitude physique"],
    60: ["Localisation engourdissement", "Activités répétitives", "Symptômes nocturnes", "Faiblesse main"],
    61: ["Activités sportives", "Mouvements répétitifs", "Localisation précise douleur"],
    62: ["Douleur matinale", "Activité physique", "Chaussures", "Traumatisme"],
    63: ["Début brutal/progressif", "Voyage récent", "Immobilisation", "Traumatisme"],
    64: ["Exposition récente", "Nouveaux médicaments", "Contact malades", "Allergènes"],
    65: ["Repos vs action", "Médicaments", "Café/alcool", "Histoire familiale"],
    66: ["Progressif vs soudain", "Uni/bilatéral", "Douleur", "Céphalées"],
    67: ["Aliments déclencheurs", "Perte poids", "Caractéristiques selles"],
    68: ["Solides vs liquides", "Régurgitation", "Perte poids", "Brûlures estomac"],
    69: ["Vomissements", "Distension", "Alimentation", "Grossesse/accouchement"],
    70: ["Fréquence", "Durée", "Quantité", "Traumatisme"],
    71: ["Hémorragie post-partum", "Lactation", "Règles", "Fatigue"],
    72: ["Couleur/odeur", "Quantité", "Dysurie", "Partenaires"],
    73: ["Début/profondeur douleur", "Lubrification", "Stress", "ATCD abus"],
    74: ["Couleur urines/selles", "Douleur", "Voyage", "Médicaments"],
    75: ["Début", "Jeu/activité", "Fièvre", "Toux"],
    76: ["Déclencheurs", "Traitement actuel", "Hospitalisations", "Allergies"]
  };
  return questions[caseData.number] || ["Questions adaptées au cas"];
}

function getRelevantHistory(caseNumber) {
  const history = {
    59: ["Maladies chroniques", "Chirurgies", "Hospitalisations", "Vaccinations"],
    60: ["Diabète", "Hypothyroïdie", "Polyarthrite rhumatoïde", "Grossesse"],
    61: ["Activités professionnelles", "Sports pratiqués", "Traumatismes antérieurs"],
    62: ["Obésité", "Diabète", "Activité physique habituelle"],
    63: ["Chirurgie récente", "Plâtre", "Voyage prolongé", "Cancer"],
    64: ["Allergies connues", "Maladies auto-immunes", "Médicaments récents"],
    65: ["Parkinson famille", "Médicaments", "Hyperthyroïdie", "Alcool"],
    66: ["Diabète", "HTA", "Glaucome famille", "Chirurgie oculaire"],
    67: ["Voyages", "Antibiotiques récents", "Chirurgies digestives"],
    68: ["Reflux", "Chirurgies", "Radiothérapie thoracique"],
    69: ["Prématurité", "Médicaments maternels", "Complications accouchement"],
    70: ["HTA", "Anticoagulants", "Troubles coagulation", "Traumatismes"],
    71: ["Accouchements", "Hémorragies", "Transfusions"],
    72: ["IST antérieures", "Nombre partenaires", "Contraception"],
    73: ["Accouchements", "Chirurgies pelviennes", "Abus sexuels"],
    74: ["Transfusions", "Voyages", "Alcool", "Médicaments hépatotoxiques"],
    75: ["Asthme", "Allergies", "Hospitalisations", "Vaccinations"],
    76: ["Asthme enfance", "Allergies", "Hospitalisations", "Intubations"]
  };
  return history[caseNumber] || ["Antécédents pertinents"];
}

function getSystemsReview(caseNumber) {
  const reviews = {
    59: ["Cardio-vasculaire", "Respiratoire", "Digestif", "Neurologique"],
    60: ["Neurologique", "Musculo-squelettique", "Endocrinien"],
    61: ["Musculo-squelettique", "Neurologique"],
    62: ["Musculo-squelettique", "Vasculaire", "Neurologique"],
    63: ["Vasculaire", "Musculo-squelettique", "Hématologique"],
    64: ["Dermatologique", "Immunologique", "Infectieux"],
    65: ["Neurologique", "Endocrinien", "Psychiatrique"],
    66: ["Ophtalmologique", "Neurologique", "Vasculaire"],
    67: ["Digestif", "Endocrinien", "Nutritionnel"],
    68: ["Digestif", "ORL", "Oncologique"],
    69: ["Digestif", "Génito-urinaire"],
    70: ["ORL", "Hématologique", "Cardiovasculaire"],
    71: ["Endocrinien", "Gynécologique", "Neurologique"],
    72: ["Génito-urinaire", "Infectieux", "Gynécologique"],
    73: ["Gynécologique", "Psychiatrique", "Endocrinien"],
    74: ["Hépatique", "Hématologique", "Digestif"],
    75: ["Respiratoire", "ORL", "Infectieux"],
    76: ["Respiratoire", "Allergique", "Cardiaque"]
  };
  return reviews[caseNumber] || ["Revue adaptée"];
}

function getExamCriteria(caseData) {
  const examsByCase = {
    59: [
      { id: "e1", text: "Signes vitaux et état général", binaryOnly: true },
      { id: "e2", text: "Examen cardio-pulmonaire" },
      { id: "e3", text: "Examen abdominal" },
      { id: "e4", text: "Examen neurologique de dépistage" }
    ],
    60: [
      { id: "e1", text: "Inspection main et poignet", binaryOnly: true },
      { id: "e2", text: "Test de Phalen [positif si symptômes en 30 sec]" },
      { id: "e3", text: "Signe de Tinel [positif si paresthésies]" },
      { id: "e4", text: "Évaluation sensitive territoire médian" }
    ],
    61: [
      { id: "e1", text: "Inspection coude", binaryOnly: true },
      { id: "e2", text: "Palpation épicondyles [douleur latérale ou médiale]" },
      { id: "e3", text: "Test de Cozen [positif si douleur]" },
      { id: "e4", text: "Mobilité coude et force" }
    ],
    62: [
      { id: "e1", text: "Inspection pied et cheville", binaryOnly: true },
      { id: "e2", text: "Palpation fascia plantaire [sensibilité]" },
      { id: "e3", text: "Palpation tendon Achille [douleur/œdème]" },
      { id: "e4", text: "Recherche corps étranger" }
    ],
    63: [
      { id: "e1", text: "Inspection mollet [œdème, rougeur]", binaryOnly: true },
      { id: "e2", text: "Signe de Homans [positif si TVP]" },
      { id: "e3", text: "Mesure circonférence mollets" },
      { id: "e4", text: "Palpation pouls périphériques" }
    ],
    64: [
      { id: "e1", text: "Inspection cutanée complète", binaryOnly: true },
      { id: "e2", text: "Description éruption [morphologie, distribution]" },
      { id: "e3", text: "Recherche adénopathies" },
      { id: "e4", text: "Signes systémiques" }
    ],
    65: [
      { id: "e1", text: "Observation tremblement [repos/action]", binaryOnly: true },
      { id: "e2", text: "Examen neurologique", details: ["Tonus", "Rigidité", "Bradykinésie"] },
      { id: "e3", text: "Test doigt-nez" },
      { id: "e4", text: "Écriture et spirale" }
    ],
    66: [
      { id: "e1", text: "Acuité visuelle", binaryOnly: true },
      { id: "e2", text: "Champs visuels" },
      { id: "e3", text: "Fond d'œil si possible" },
      { id: "e4", text: "Réflexes pupillaires" }
    ],
    67: [
      { id: "e1", text: "État nutritionnel", binaryOnly: true },
      { id: "e2", text: "Examen abdominal", details: ["Distension", "Sensibilité", "Bruits intestinaux"] },
      { id: "e3", text: "Recherche signes carences" },
      { id: "e4", text: "Examen cutané" }
    ],
    68: [
      { id: "e1", text: "État général et nutritionnel", binaryOnly: true },
      { id: "e2", text: "Examen ORL et cou" },
      { id: "e3", text: "Recherche adénopathies" },
      { id: "e4", text: "Examen abdominal" }
    ],
    69: [
      { id: "e1", text: "Inspection abdominale [distension]", binaryOnly: true },
      { id: "e2", text: "Palpation abdominale douce" },
      { id: "e3", text: "Toucher rectal (avec consentement)" },
      { id: "e4", text: "Auscultation bruits intestinaux" }
    ],
    70: [
      { id: "e1", text: "Mesure tension artérielle", binaryOnly: true },
      { id: "e2", text: "Examen nasal antérieur" },
      { id: "e3", text: "Recherche signes trauma" },
      { id: "e4", text: "Évaluation coagulation (pétéchies, ecchymoses)" }
    ],
    71: [
      { id: "e1", text: "Signes vitaux", binaryOnly: true },
      { id: "e2", text: "Examen thyroïdien" },
      { id: "e3", text: "Examen mammaire [absence lactation]" },
      { id: "e4", text: "Signes hypopituitarisme" }
    ],
    72: [
      { id: "e1", text: "Examen génital externe", binaryOnly: true },
      { id: "e2", text: "Caractérisation écoulement" },
      { id: "e3", text: "Palpation ganglions inguinaux" },
      { id: "e4", text: "Examen pelvien si femme (avec consentement)" }
    ],
    73: [
      { id: "e1", text: "Examen gynécologique externe", binaryOnly: true },
      { id: "e2", text: "Évaluation lubrification" },
      { id: "e3", text: "Recherche vaginisme" },
      { id: "e4", text: "Examen pelvien avec consentement" }
    ],
    74: [
      { id: "e1", text: "Ictère conjonctival et cutané", binaryOnly: true },
      { id: "e2", text: "Examen abdominal", details: ["Hépatomégalie", "Splénomégalie", "Ascite"] },
      { id: "e3", text: "Signes insuffisance hépatique" },
      { id: "e4", text: "Recherche adénopathies" }
    ],
    75: [
      { id: "e1", text: "Signes vitaux et saturation", binaryOnly: true },
      { id: "e2", text: "Auscultation pulmonaire [stridor/wheezing]" },
      { id: "e3", text: "Examen ORL" },
      { id: "e4", text: "Signes de détresse respiratoire" }
    ],
    76: [
      { id: "e1", text: "Signes vitaux et peak flow", binaryOnly: true },
      { id: "e2", text: "Auscultation pulmonaire [sibilants]" },
      { id: "e3", text: "Signes de détresse" },
      { id: "e4", text: "Évaluation sévérité crise" }
    ]
  };
  
  return examsByCase[caseData.number] || [
    { id: "e1", text: "Examen général", binaryOnly: true },
    { id: "e2", text: "Examen ciblé système concerné" },
    { id: "e3", text: "Recherche complications" },
    { id: "e4", text: "Évaluation globale" }
  ];
}

function getManagementPlan(caseNumber) {
  const plans = {
    59: ["Aptitude au travail", "Dépistage maladies", "Certificat médical", "Conseils prévention"],
    60: ["Repos poignet", "Attelle nocturne", "Anti-inflammatoires", "Référence si échec"],
    61: ["Repos", "Glace", "AINS", "Physiothérapie", "Infiltration si échec"],
    62: ["Repos", "Étirements", "Orthèses plantaires", "AINS", "Physiothérapie"],
    63: ["Si TVP: anticoagulation urgente", "Si musculaire: repos, glace", "Surveillance"],
    64: ["Identifier/éviter déclencheur", "Traitement symptomatique", "Antihistaminiques si allergie"],
    65: ["Selon type tremblement", "Référence neurologie", "Révision médicaments"],
    66: ["Référence ophtalmologie urgente", "Contrôle diabète/HTA", "Protection oculaire"],
    67: ["Régime sans gluten si cœliaque", "Éviction lactose", "Suppléments nutritionnels"],
    68: ["Référence gastro-entérologie", "Modification alimentation", "IPP si RGO"],
    69: ["Référence chirurgie pédiatrique urgente", "Nil per os", "Hydratation IV"],
    70: ["Compression nasale", "Contrôle TA", "Cautérisation si récurrent"],
    71: ["Hormonothérapie substitutive", "Référence endocrinologie", "Support psychologique"],
    72: ["Traitement IST", "Dépistage partenaires", "Conseils prévention", "Suivi sérologique"],
    73: ["Lubrifiants", "Thérapie couple", "Traitement cause", "Référence si besoin"],
    74: ["Traitement étiologique", "Surveillance bilirubine", "Éviter hépatotoxiques"],
    75: ["Si corps étranger: extraction urgente", "Si croup: corticoïdes", "Hospitalisation si sévère"],
    76: ["Bronchodilatateurs", "Corticoïdes si sévère", "Plan action asthme", "Éducation"]
  };
  return plans[caseNumber] || ["Plan adapté au diagnostic"];
}

function getPatientAdvice(caseNumber) {
  const advice = {
    59: ["Maintenir activité physique", "Alimentation équilibrée", "Éviter tabac/alcool"],
    60: ["Éviter mouvements répétitifs", "Port attelle nuit", "Exercices étirement"],
    61: ["Repos relatif", "Application glace", "Éviter surcharge"],
    62: ["Chaussures adaptées", "Perte poids si surpoids", "Étirements quotidiens"],
    63: ["Mobilisation précoce", "Bas contention si TVP", "Hydratation"],
    64: ["Journal déclencheurs", "Éviter irritants", "Hygiène douce"],
    65: ["Éviter stress", "Limiter caféine", "Exercices relaxation"],
    66: ["Protection solaire", "Contrôles réguliers", "Signaler changements vision"],
    67: ["Tenir journal alimentaire", "Éviter aliments déclencheurs", "Suppléments si carences"],
    68: ["Manger lentement", "Petits repas", "Éviter coucher après repas"],
    69: ["Surveillance étroite", "Signes alerte", "Suivi post-opératoire"],
    70: ["Éviter grattage nez", "Humidifier air", "Contrôle TA"],
    71: ["Importance observance traitement", "Suivi régulier", "Grossesse future prudence"],
    72: ["Protection rapports", "Notification partenaires", "Abstinence jusqu'à guérison"],
    73: ["Communication couple", "Patience", "Lubrification adéquate"],
    74: ["Éviter alcool", "Régime adapté", "Surveillance couleur"],
    75: ["Éviter petits objets", "Surveillance respiratoire", "Urgence si aggravation"],
    76: ["Éviter déclencheurs", "Technique inhalation", "Plan urgence"]
  };
  return advice[caseNumber] || ["Conseils adaptés"];
}

function getPatientExplanation(caseNumber) {
  const explanations = {
    59: "Examen de routine pour vérifier votre aptitude au travail. Les examens permettront de dépister d'éventuels problèmes.",
    60: "Compression probable du nerf médian au poignet. Les tests confirmeront le diagnostic du syndrome du canal carpien.",
    61: "Inflammation des tendons du coude, fréquente avec les mouvements répétitifs. Repos et traitement anti-inflammatoire.",
    62: "Inflammation du fascia plantaire ou du tendon d'Achille. Le repos et les étirements sont essentiels.",
    63: "Plusieurs causes possibles, de la simple contracture à la thrombose. Les examens détermineront la cause.",
    64: "L'éruption peut avoir plusieurs origines. Identifier le déclencheur est essentiel pour le traitement.",
    65: "Différents types de tremblements existent. L'examen neurologique orientera le diagnostic.",
    66: "Problème visuel nécessitant une évaluation rapide pour préserver la vision.",
    67: "Malabsorption intestinale probable. Les tests identifieront l'aliment responsable.",
    68: "Trouble de la déglutition nécessitant des examens pour exclure une cause grave.",
    69: "Obstruction intestinale probable nécessitant une prise en charge chirurgicale urgente.",
    70: "Saignement nasal pouvant être lié à l'hypertension ou un trouble de coagulation.",
    71: "Déficit hormonal post-accouchement nécessitant un traitement substitutif.",
    72: "Infection génitale probable nécessitant traitement et dépistage des partenaires.",
    73: "Douleur aux rapports ayant des causes physiques ou psychologiques à explorer.",
    74: "Jaunisse nécessitant bilan pour déterminer origine hépatique, obstructive ou hémolytique.",
    75: "Respiration bruyante chez l'enfant pouvant indiquer obstruction ou infection.",
    76: "Crise d'asthme nécessitant traitement bronchodilatateur et plan de gestion."
  };
  return explanations[caseNumber] || "";
}

function getPatientQuestions(caseNumber) {
  const questions = {
    59: ["[Suis-je apte au travail?]", "[Faut-il des examens supplémentaires?]"],
    60: ["[Vais-je devoir être opéré?]", "[Puis-je continuer mon travail?]"],
    61: ["[Combien de temps pour guérir?]", "[Puis-je faire du sport?]"],
    62: ["[Pourquoi ai-je si mal aux pieds?]", "[Les semelles vont-elles aider?]"],
    63: ["[Est-ce grave?]", "[Puis-je marcher?]", "[Est-ce un caillot?]"],
    64: ["[C'est contagieux?]", "[C'est allergique?]", "[Ça va partir?]"],
    65: ["[C'est Parkinson?]", "[C'est héréditaire?]", "[Ça va empirer?]"],
    66: ["[Vais-je devenir aveugle?]", "[C'est la cataracte?]", "[Faut-il opérer?]"],
    67: ["[Qu'est-ce que je ne peux plus manger?]", "[C'est à vie?]"],
    68: ["[C'est un cancer?]", "[Pourquoi je n'arrive plus à avaler?]"],
    69: ["[Mon bébé va bien?]", "[Faut-il opérer?]"],
    70: ["[Pourquoi je saigne du nez?]", "[C'est ma tension?]"],
    71: ["[Pourquoi je n'ai pas de lait?]", "[C'est définitif?]"],
    72: ["[C'est une MST?]", "[Mon/ma partenaire doit-il/elle se traiter?]"],
    73: ["[C'est psychologique?]", "[Ça peut s'arranger?]"],
    74: ["[C'est une hépatite?]", "[C'est grave?]", "[Je suis contagieux?]"],
    75: ["[Mon enfant a avalé quelque chose?]", "[C'est grave?]"],
    76: ["[C'est de l'asthme?]", "[J'aurai ça toute ma vie?]"]
  };
  return questions[caseNumber] || ["[Qu'est-ce que j'ai?]", "[C'est grave?]"];
}

function getPatientAttitude(caseNumber) {
  const attitudes = {
    59: ["Coopératif", "Veut être déclaré apte"],
    60: ["Inquiet pour son travail", "Douleur++"],
    61: ["Sportif frustré", "Veut reprendre rapidement"],
    62: ["Gêné dans activités quotidiennes", "Recherche soulagement"],
    63: ["Très inquiet", "Peur de la thrombose"],
    64: ["Gêné esthétiquement", "Prurit+++"],
    65: ["Anxieux", "Peur de Parkinson"],
    66: ["Très inquiet pour sa vision", "Peur cécité"],
    67: ["Frustré par restrictions alimentaires", "Fatigue++"],
    68: ["Peur du cancer", "Amaigri"],
    69: ["Parents très inquiets", "Urgence"],
    70: ["Inquiet saignements répétés", "Gêné socialement"],
    71: ["Épuisée", "Culpabilité de ne pas allaiter"],
    72: ["Gêné", "Inquiet pour partenaire"],
    73: ["Gênée d'en parler", "Impact sur couple"],
    74: ["Inquiet coloration", "Peur cirrhose"],
    75: ["Parent paniqué", "Urgence respiratoire"],
    76: ["Essoufflé", "Habitué aux crises"]
  };
  return attitudes[caseNumber] || ["Patient coopératif"];
}

function getPhysicalSigns(caseNumber) {
  const signs = {
    60: ["Test Phalen positif", "Tinel positif"],
    61: ["Douleur palpation épicondyle", "Test Cozen positif"],
    62: ["Douleur palpation talon", "Tension tendon Achille"],
    63: ["Œdème unilatéral possible", "Homans positif si TVP"],
    64: ["Éruption visible", "Prurit"],
    65: ["Tremblement visible", "Selon type"],
    66: ["Baisse acuité visuelle", "Anomalie pupillaire possible"],
    67: ["Distension abdominale", "Borborygmes++"],
    68: ["Amaigrissement", "Halitose possible"],
    69: ["Distension abdominale", "Absence selles"],
    70: ["Épistaxis active ou croûtes", "TA élevée possible"],
    71: ["Pâleur", "Absence lactation"],
    72: ["Écoulement visible", "Inflammation locale"],
    73: ["Vaginisme possible", "Sécheresse"],
    74: ["Ictère conjonctival", "Hépatomégalie possible"],
    75: ["Stridor ou wheezing", "Tirage possible"],
    76: ["Sibilants diffus", "Expiration prolongée"]
  };
  return signs[caseNumber] || [];
}

function getConsultationBehavior(caseNumber) {
  const behaviors = {
    59: ["Répondre aux questions de dépistage", "Mentionner symptômes mineurs"],
    60: ["Montrer positions aggravantes", "Demander arrêt travail"],
    61: ["Démontrer mouvements douloureux", "Insister sur reprise sport"],
    62: ["Boiterie", "Évitement appui"],
    63: ["Anxiété marquée", "Demander examens urgents"],
    64: ["Montrer éruption", "Grattage fréquent"],
    65: ["Montrer tremblement", "Cacher mains parfois"],
    66: ["Difficultés visuelles évidentes", "Anxiété++"],
    67: ["Parler symptômes digestifs", "Liste aliments problématiques"],
    68: ["Difficultés déglutition démontrées", "Inquiétude cancer"],
    69: ["Urgence", "Parents affolés"],
    70: ["Tamponnement nasal possible", "Inquiet récurrence"],
    71: ["Fatigue évidente", "Tristesse"],
    72: ["Gêne discussion", "Questions protection"],
    73: ["Difficile d'aborder", "Évitement détails"],
    74: ["Montrer coloration", "Questions pronostic"],
    75: ["Bruit respiratoire audible", "Parent inquiet"],
    76: ["Utilisation muscles accessoires", "Parle par phrases courtes"]
  };
  return behaviors[caseNumber] || ["Comportement adapté au cas"];
}

function getArgumentsForDiagnosis(caseData, diagnosis) {
  const argumentsMap = {
    // Cas 59 - Visite médicale
    "Diabète méconnu": "Dépistage systématique, facteurs risque possibles",
    "Tuberculose latente": "Dépistage professionnel, exposition possible",
    "Hypertension non diagnostiquée": "Asymptomatique fréquent, dépistage important",
    
    // Cas 60 - Canal carpien
    "Syndrome du canal carpien": "Engourdissement territoire médian, tests positifs, symptômes nocturnes",
    "Radiculopathie cervicale": "Irradiation possible, symptômes proximaux",
    "Polyneuropathie": "Atteinte bilatérale possible, diabète/carence",
    
    // Cas 61 - Coude
    "Épicondylite latérale (tennis elbow)": "Douleur latérale, mouvements répétitifs, test Cozen positif",
    "Épicondylite médiale (golfer's elbow)": "Douleur médiale, flexion poignet douloureuse",
    "Arthrite du coude": "Raideur, inflammation, limitation mouvement",
    
    // Cas 62 - Pied
    "Fasciite plantaire": "Douleur talon matin, station debout prolongée, obésité",
    "Tendinite d'Achille": "Douleur postérieure, activité sportive, œdème",
    "Corps étranger": "Douleur localisée, notion traumatisme, marche pieds nus",
    
    // Cas 63 - Mollet
    "Thrombose veineuse profonde": "Œdème, Homans+, facteurs risque (immobilisation)",
    "Lésion musculaire": "Effort sportif, douleur contraction, pas œdème",
    "Cellulite/myosite": "Signes inflammatoires, fièvre, rougeur",
    "Rupture kyste de Baker": "Douleur brutale, œdème descendant, arthrose genou",
    
    // Cas 64 - Éruption
    "Réaction allergique": "Prurit, exposition allergène, urticaire",
    "Infection cutanée": "Fièvre, pustules, évolution progressive",
    "Maladie auto-immune (LES, PR)": "Éruption malaire, arthralgies, photosensibilité",
    "Photodermatite": "Exposition solaire, zones photo-exposées",
    
    // Cas 65 - Tremblements
    "Tremblement essentiel": "Tremblement action, familial, amélioration alcool",
    "Maladie de Parkinson": "Repos, unilatéral début, bradykinésie",
    "Tremblement cérébelleux": "Intentionnel, ataxie, dysarthrie",
    "Effet secondaire médicamenteux": "Médicaments inducteurs, réversible",
    
    // Cas 66 - Vision
    "Glaucome": "Céphalées, halos, perte champ périphérique",
    "Cataracte": "Progressif, indolore, éblouissement",
    "Dégénérescence maculaire": "Âge, vision centrale, métamorphopsies",
    "Rétinopathie diabétique/hypertensive": "Diabète/HTA connus, microangiopathie",
    
    // Cas 67 - Malabsorption
    "Maladie cœliaque": "Gluten déclencheur, diarrhée, carences",
    "Intolérance au lactose": "Produits laitiers, ballonnements, gaz",
    "Pancréatite chronique": "Stéatorrhée, douleur, alcool",
    "Fibrose kystique": "Jeune âge, infections respiratoires",
    
    // Cas 68 - Dysphagie
    "Achalasie": "Jeune, liquides et solides, régurgitation",
    "Cancer de l'œsophage": "Âge, progressif, perte poids, solides d'abord",
    "Syndrome CREST": "Raynaud, sclérodermie, reflux",
    "Sténose œsophagienne": "ATCD RGO, progressif, solides",
    
    // Cas 69 - Méconium
    "Iléus méconial": "Fibrose kystique, obstruction, distension",
    "Maladie de Hirschsprung": "Absence ganglions, constipation, distension",
    "Anus imperforé": "Malformation visible, absence orifice",
    "Atrésie intestinale": "Vomissements bilieux, polyhydramnios",
    
    // Cas 70 - Épistaxis
    "HTA non contrôlée": "TA élevée, récurrent, bilatéral",
    "Troubles de coagulation": "Ecchymoses, anticoagulants, saignements multiples",
    "Traumatisme nasal": "Notion trauma, unilatéral, croûtes",
    "Rhinite allergique": "Prurit nasal, éternuements, saisonnier",
    
    // Cas 71 - Sheehan
    "Syndrome de Sheehan": "HPP, absence lactation, aménorrhée, fatigue",
    "Hypothyroïdie post-partum": "Fatigue, frilosité, prise poids",
    "Dépression post-partum": "Humeur, pleurs, anxiété, insomnie",
    
    // Cas 72 - Écoulement
    "Gonorrhée": "Écoulement purulent, dysurie franche, abondant",
    "Chlamydia": "Écoulement clair, peu abondant, asymptomatique possible",
    "Candidose": "Prurit, leucorrhées blanches, fromage cottage",
    "Trichomonas": "Écoulement mousseux, verdâtre, malodorant",
    
    // Cas 73 - Dyspareunie
    "Vaginisme": "Spasmes, peur pénétration, psychologique",
    "Endométriose": "Douleur profonde, dysménorrhée, infertilité",
    "Infection pelvienne": "Fièvre, leucorrhées, douleur mobilisation",
    "Sécheresse vaginale": "Ménopause, médicaments, préliminaires insuffisants",
    
    // Cas 74 - Ictère
    "Hépatite virale": "Voyage, contact, transaminases élevées",
    "Obstruction biliaire": "Douleur, selles décolorées, urines foncées",
    "Cirrhose": "Alcool, virus, signes IHC",
    "Hémolyse": "Anémie, splénomégalie, bilirubine libre",
    
    // Cas 75 - Thorax bruyant enfant
    "Corps étranger": "Début brutal, jeu, toux inefficace",
    "Croup": "Viral, toux aboyante, stridor inspiratoire",
    "Épiglottite": "Fièvre haute, dysphagie, position tripode",
    "Asthme": "Sifflements, ATCD, réversible",
    
    // Cas 76 - Asthme
    "Asthme bronchique": "Sifflements, réversible, déclencheurs, ATCD",
    "BPCO débutante": "Tabac, irréversible partiel, âge",
    "Insuffisance cardiaque": "Orthopnée, œdèmes, crépitants",
    "Anxiété": "Contexte stress, hyperventilation, paresthésies"
  };
  
  return argumentsMap[diagnosis] || "Présentation clinique compatible";
}

function getSuggestedTest(diagnosis) {
  const testsMap = {
    // Généraux
    "Diabète méconnu": "Glycémie à jeun, HbA1c",
    "Tuberculose latente": "IDR, Quantiféron, Radiographie thoracique",
    "Hypertension non diagnostiquée": "MAPA, ECG, bilan rénal",
    
    // Neurologie périphérique
    "Syndrome du canal carpien": "EMG, vitesse conduction nerveuse",
    "Radiculopathie cervicale": "IRM cervicale, EMG",
    "Polyneuropathie": "EMG, glycémie, vitamine B12",
    
    // Rhumatologie
    "Épicondylite latérale (tennis elbow)": "Échographie, IRM si échec traitement",
    "Épicondylite médiale (golfer's elbow)": "Échographie, radiographie",
    "Arthrite du coude": "Radiographie, VS/CRP, facteur rhumatoïde",
    "Fasciite plantaire": "Radiographie (épine calcanéenne), échographie",
    "Tendinite d'Achille": "Échographie, IRM",
    
    // Vasculaire
    "Thrombose veineuse profonde": "D-dimères, écho-Doppler veineux",
    "Lésion musculaire": "Échographie musculaire, CPK",
    "Rupture kyste de Baker": "Échographie, IRM genou",
    
    // Dermatologie
    "Réaction allergique": "IgE, tests cutanés",
    "Infection cutanée": "Prélèvement bactério, NFS",
    "Maladie auto-immune (LES, PR)": "AAN, anti-DNA, facteur rhumatoïde",
    
    // Neurologie centrale
    "Tremblement essentiel": "Diagnostic clinique, test thérapeutique",
    "Maladie de Parkinson": "DATscan si doute, IRM cérébrale",
    "Tremblement cérébelleux": "IRM cérébrale, bilan étiologique",
    
    // Ophtalmologie
    "Glaucome": "Tonométrie, champ visuel, OCT",
    "Cataracte": "Examen lampe à fente, acuité visuelle",
    "Dégénérescence maculaire": "OCT, angiographie rétinienne",
    "Rétinopathie diabétique/hypertensive": "Fond d'œil, angiographie",
    
    // Gastro-entérologie
    "Maladie cœliaque": "Anti-transglutaminase, biopsie duodénale",
    "Intolérance au lactose": "Test respiratoire H2, test éviction",
    "Achalasie": "Manométrie œsophagienne, transit baryté",
    "Cancer de l'œsophage": "Endoscopie avec biopsie, scanner TAP",
    
    // Pédiatrie
    "Iléus méconial": "Test sueur (mucoviscidose), radiographie",
    "Maladie de Hirschsprung": "Biopsie rectale, manométrie",
    "Corps étranger": "Radiographie, bronchoscopie",
    "Croup": "Diagnostic clinique, radiographie cou si doute",
    
    // Endocrinologie
    "Syndrome de Sheehan": "Bilan hypophysaire complet, IRM",
    "Hypothyroïdie post-partum": "TSH, T4 libre, anti-TPO",
    
    // Infectiologie/IST
    "Gonorrhée": "PCR, culture sur gélose chocolat",
    "Chlamydia": "PCR urinaire ou prélèvement",
    "Candidose": "Examen direct, culture",
    "Trichomonas": "Examen à frais, culture",
    
    // Hépatologie
    "Hépatite virale": "Sérologies VHA, VHB, VHC",
    "Obstruction biliaire": "Échographie, bili-IRM",
    "Cirrhose": "Fibroscan, biopsie hépatique",
    "Hémolyse": "Haptoglobine, LDH, bilirubine libre",
    
    // Pneumologie
    "Asthme bronchique": "Spirométrie, test réversibilité",
    "BPCO débutante": "Spirométrie, radiographie thoracique",
    "Insuffisance cardiaque": "BNP, échocardiographie, ECG"
  };
  
  return testsMap[diagnosis] || "Examens selon orientation clinique";
}

function getPieges(caseNumber) {
  const pieges = {
    59: ["Ne pas faire dépistage systématique", "Oublier aptitude travail"],
    60: ["Oublier tests spécifiques", "Ne pas évaluer gravité"],
    61: ["Confondre épicondylite latérale/médiale", "Prescrire repos total"],
    62: ["Méconnaître fasciite plantaire", "Négliger facteurs favorisants"],
    63: ["Manquer TVP", "Ne pas mesurer mollets", "Banaliser symptômes"],
    64: ["Ne pas chercher cause systémique", "Oublier médicaments"],
    65: ["Ne pas caractériser type tremblement", "Alarmer patient"],
    66: ["Retarder référence ophtalmologie", "Manquer urgence"],
    67: ["Ne pas identifier aliment causal", "Oublier carences"],
    68: ["Minimiser si cancer possible", "Ne pas référer"],
    69: ["Retarder chirurgie", "Ne pas reconnaître urgence"],
    70: ["Négliger HTA", "Ne pas vérifier coagulation"],
    71: ["Méconnaître syndrome", "Confondre avec dépression"],
    72: ["Oublier dépistage partenaires", "Ne pas tester VIH"],
    73: ["Négliger aspect psychologique", "Examen brutal"],
    74: ["Ne pas distinguer types ictère", "Oublier hépatites"],
    75: ["Manquer corps étranger", "Sous-estimer gravité"],
    76: ["Sous-traiter crise", "Ne pas évaluer sévérité"]
  };
  return pieges[caseNumber] || ["Anamnèse incomplète", "Examen insuffisant"];
}

// Créer les dossiers
const mainDir = path.join(__dirname, 'json_files', 'USMLE-Mini');
const doorDir = path.join(__dirname, 'json_files', 'json_feuille-porte', 'USMLE-Mini');

if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}
if (!fs.existsSync(doorDir)) {
  fs.mkdirSync(doorDir, { recursive: true });
}

// Générer les fichiers
console.log('Génération des fichiers JSON Thieme Mini-Cas...\n');

cases.forEach(caseData => {
  const mainJSON = createMainJSON(caseData);
  const doorJSON = createDoorSheetJSON(caseData);
  
  const baseFileName = `Thieme-Mini-${caseData.number} - ${caseData.title.replace(/[/']/g, '-').replace(/[\/:*?"<>|]/g, '-')}`;
  const genderAge = caseData.patient.age ? `${caseData.patient.gender} de ${caseData.patient.age} ${caseData.patient.ageUnit || 'ans'}` : caseData.patient.gender;
  const fileName = `${baseFileName} - ${genderAge.replace(/[\/]/g, '-')}`;
  
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