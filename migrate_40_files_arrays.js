const { processFiles } = require('./migrate_annexes_to_v3_arrays.js');

const files = [
    "USMLE Triage 1 - Perte de Vision.json",
    "USMLE Triage 2 - Douleur à l'Épaule.json",
    "USMLE Triage 3 - Dysphagie chez Bébé.json",
    "USMLE Triage 4 - Cas Téléphonique - Douleur Thoracique.json",
    "USMLE Triage 5 - Douleur Dorsale (Lombaire).json",
    "USMLE Triage 6 - Perte de Mémoire.json",
    "USMLE Triage 7 - Céphalée.json",
    "USMLE Triage 8 - Douleur à la Miction.json",
    "USMLE Triage 9 - Brûlures d'Estomac.json",
    "USMLE Triage 10 - Chute de Personne Âgée.json",
    "USMLE Triage 11 - Évanouissement (Syncope).json",
    "USMLE Triage 12 - Anxiété-Stress.json",
    "USMLE Triage 13 - Fatigue.json",
    "USMLE Triage 14 - Fatigue.json",
    "USMLE Triage 15 - Infarctus du Myocarde.json",
    "USMLE Triage 16 - Douleurs Lombaires (Accident du Travail).json",
    "USMLE Triage 17 - Choc Anaphylactique.json",
    "USMLE Triage 18 - Douleur Abdominale.json",
    "USMLE Triage 19 - Douleur Abdomino-Pelvienne et Vomissements.json",
    "USMLE Triage 20 - Toux avec Dyspnée.json",
    "USMLE Triage 21 - Infection de Plaie Post-Opératoire.json",
    "USMLE Triage 22 - Douleurs Articulaires.json",
    "USMLE Triage 23 - Palpitations.json",
    "USMLE Triage 24 - Douleur Musculaire - Jambe.json",
    "USMLE Triage 25 - Examen de Prévention et Bien-être.json",
    "USMLE Triage 26 - Diarrhée.json",
    "USMLE Triage 27 - Cas Téléphonique - Pleurs de Bébé.json",
    "USMLE Triage 28 - Nausées, Vomissements et Diarrhée.json",
    "USMLE Triage 29 - Éruption Cutanée sur Tout le Corps (Varicelle).json",
    "USMLE Triage 30 - Contrôle de Routine Post-Partum.json",
    "USMLE Triage 31 - Toux et Fièvre.json",
    "USMLE Triage 32 - Rhume avec Douleur Faciale.json",
    "USMLE Triage 33 - Cas Téléphonique - Diarrhée.json",
    "USMLE Triage 34 - Nausées et Vomissements de Grossesse.json",
    "USMLE Triage 35 - Examen de Dépistage (Annuel).json",
    "USMLE Triage 36 - Demande de Statut Clinique.json",
    "USMLE Triage 37 - Diarrhée du Voyageur et Sang dans les Selles.json",
    "USMLE Triage 38 - Grossesse - Contrôle Prénatal.json",
    "USMLE Triage 39 - Fatigue et Somnolence.json",
    "USMLE Triage 40 - Cas téléphonique - Intoxication.json"
];

// Export the processFiles function if it's not already exported
module.exports = { processFiles };

// Run the migration
if (require.main === module) {
    processFiles(files);
}