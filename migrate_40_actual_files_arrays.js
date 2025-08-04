const { processFiles } = require('./migrate_annexes_to_v3_arrays.js');

const files = [
    "USMLE Triage 1 - Perte de Vision.json",
    "USMLE Triage 2 - Œil Rouge.json",
    "USMLE Triage 3 - Troubles de Mémoire.json",
    "USMLE Triage 4 - Vertiges.json",
    "USMLE Triage 5 - Céphalées.json",
    "USMLE Triage 6 - Troubles du Sommeil.json",
    "USMLE Triage 7 - Céphalées.json",
    "USMLE Triage 8 - Syncope.json",
    "USMLE Triage 9 - Coup de Chaleur.json",
    "USMLE Triage 10 - Masse Mammaire.json",
    "USMLE Triage 11 - Douleur Thoracique.json",
    "USMLE Triage 12 - Toux Chronique.json",
    "USMLE Triage 13 - Dyspnée.json",
    "USMLE Triage 14 - Perte de poids et Fatigue.json",
    "USMLE Triage 15 - Symptômes Respiratoires.json",
    "USMLE Triage 16 - Douleur Abdominale Masculine.json",
    "USMLE Triage 17 - Nausées et Vomissements.json",
    "USMLE Triage 18 - Nausées et Vomissements.json",
    "USMLE Triage 19 - Douleur Abdominale Feminine.json",
    "USMLE Triage 20 - Douleur Antérieure du Genou.json",
    "USMLE Triage 21 - Douleur au Poignet.json",
    "USMLE Triage 22 - Douleurs Articulaires.json",
    "USMLE Triage 23 - Lombalgie.json",
    "USMLE Triage 24 - Lombalgie.json",
    "USMLE Triage 25 - Douleur à l'épaule.json",
    "USMLE Triage 26 - Douleur du membre inférieur.json",
    "USMLE Triage 27 - Fatigue et Ecchymoses.json",
    "USMLE Triage 28 - Fièvre pendant la grossesse.json",
    "USMLE Triage 29 - Hématurie.json",
    "USMLE Triage 30 - Masse Testiculaire.json",
    "USMLE Triage 31 - Règles irrégulières.json",
    "USMLE Triage 32 - Fièvre chez l'enfant.json",
    "USMLE Triage 33 - Patient Difficile - Fibromyalgie.json",
    "USMLE Triage 34 - Patient Difficile - Recherche de Médicaments.json",
    "USMLE Triage 35 - Patient Difficile - Non Anglophone.json",
    "USMLE Triage 36 - Cas téléphonique - Douleur abdominale.json",
    "USMLE Triage 37 - Cas téléphonique - Chute d'une personne âgée.json",
    "USMLE Triage 38 - Cas téléphonique - Fin de grossesse.json",
    "USMLE Triage 39 - Cas téléphonique - Suspicion de maltraitance.json",
    "USMLE Triage 40 - Cas téléphonique - Intoxication.json"
];

// Run the migration
if (require.main === module) {
    processFiles(files);
}