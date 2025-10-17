#!/usr/bin/env python3
"""
Script pour standardiser la terminologie dans le fichier JSON ECOS
"""

import json
import re
from collections import defaultdict

# Charger le fichier JSON
with open('Stat/ECOS-Anciens_cas_complet.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cas_cliniques = data['cas_cliniques']

# ========== ANALYSE DES VARIATIONS ==========
print("=" * 80)
print("ANALYSE DES VARIATIONS DE TERMINOLOGIE")
print("=" * 80)

# 1. Analyser les variations dans les sujets
sujets = defaultdict(int)
for cas in cas_cliniques:
    sujet = cas.get('Sujet', '')
    if sujet:
        sujets[sujet] += 1

print("\n📚 Sujets/Spécialités trouvés:")
for sujet, count in sorted(sujets.items()):
    print(f"  - {sujet}: {count} cas")

# 2. Analyser les variations dans les urgences
urgences = defaultdict(int)
for cas in cas_cliniques:
    urgence = cas.get('Urgence', '')
    if urgence:
        urgences[urgence] += 1

print("\n🚨 Valeurs d'urgence trouvées:")
for urgence, count in sorted(urgences.items()):
    print(f"  - {urgence}: {count} cas")

# ========== DÉFINITION DE LA STANDARDISATION ==========

# Dictionnaire de standardisation des sujets/spécialités
standardisation_sujets = {
    # Cardiologie
    'Cardio': 'Cardiologie',
    
    # Dermatologie
    'Dermato': 'Dermatologie',
    'Der': 'Dermatologie',
    
    # Gastro-entérologie
    'Gastro': 'Gastro-entérologie',
    
    # Gynécologie
    'Gynéco': 'Gynécologie',
    'Gyni': 'Gynécologie',
    
    # Infectiologie
    'Infectio': 'Infectiologie',
    
    # Médecine interne
    'Endocrino': 'Endocrinologie',
    
    # Musculo-squelettique
    'MSQ': 'Musculo-squelettique',
    
    # Neurologie
    'Neuro': 'Neurologie',
    
    # Ophtalmologie
    'Ophtalmo': 'Ophtalmologie',
    'OPH': 'Ophtalmologie',
    
    # ORL
    'ORL': 'ORL',
    
    # Pédiatrie
    'Péd': 'Pédiatrie',
    'Pédiatrie': 'Pédiatrie',
    
    # Pneumologie
    'Pneumo': 'Pneumologie',
    
    # Psychiatrie
    'Psy': 'Psychiatrie',
    
    # Rhumatologie
    'Rhumato': 'Rhumatologie',
    
    # Urologie
    'Uro': 'Urologie',
    
    # Autres
    'EM': 'Entretien motivationnel',
    'MPR': 'Médecine physique',
    'Soins Pal': 'Soins palliatifs',
    'Vasculaire': 'Chirurgie vasculaire',
    'Onco': 'Oncologie',
    'HAM': 'Médecine générale',
    'Path': 'Pathologie'
}

# Dictionnaire de standardisation des diagnostics
standardisation_diagnostics = {
    # Standardiser les abréviations courantes
    r'\bBPCO\b': 'BPCO',
    r'\bMICI\b': 'MICI',
    r'\bAIT\b': 'AIT',
    r'\bAVC\b': 'AVC',
    r'\bIDM\b': 'Infarctus du myocarde',
    r'\bIRC\b': 'Insuffisance rénale chronique',
    r'\bHTA\b': 'Hypertension artérielle',
    r'\bDMLA\b': 'DMLA',
    r'\bSAOS\b': 'Syndrome d\'apnées du sommeil',
    r'\bTB\b': 'Tuberculose',
    r'\bTBC\b': 'Tuberculose',
    r'\bVIH\b': 'VIH',
    r'\bHIV\b': 'VIH',
    r'\bSEP\b': 'Sclérose en plaques',
    r'\bTDAH\b': 'TDAH',
    r'\bTCA\b': 'Trouble du comportement alimentaire',
    r'\bECA\b': 'État confusionnel aigu',
    r'\bAOMI\b': 'Artériopathie oblitérante des membres inférieurs',
    r'\bpAVK\b': 'Artériopathie oblitérante des membres inférieurs',
    r'\bHBP\b': 'Hypertrophie bénigne de la prostate',
    r'\bHPPB\b': 'Hypertrophie bénigne de la prostate',
    r'\bBAV\b': 'Bloc auriculo-ventriculaire',
    r'\bFA\b': 'Fibrillation auriculaire',
    r'\bEP\b': 'Embolie pulmonaire',
    r'\bOMA\b': 'Otite moyenne aiguë',
    r'\bNNH\b': 'Sinusite',
    r'\bRCUH\b': 'Rectocolite hémorragique',
    r'\bCU\b': 'Colite ulcéreuse',
    r'\bMC\b': 'Maladie de Crohn',
    r'\bRGO\b': 'Reflux gastro-œsophagien',
    r'\bGERD\b': 'Reflux gastro-œsophagien',
    
    # Standardiser les variations de termes
    r'Hyperthyroidie': 'Hyperthyroïdie',
    r'Hypothyroidie': 'Hypothyroïdie',
    r'Cephalée': 'Céphalée',
    r'Hepatite': 'Hépatite',
    r'Pyelonephrite': 'Pyélonéphrite',
    r'Preeclampsie': 'Prééclampsie',
    r'Pré-éclampsie': 'Prééclampsie',
    r'Pre-eclampsie': 'Prééclampsie',
    r'Enuresie': 'Énurésie',
    r'Epilepsie': 'Épilepsie',
    r'Eclampsie': 'Éclampsie',
    r'Erysipèle': 'Érysipèle',
    r'Erythème': 'Érythème',
    r'Eczema': 'Eczéma',
    r'Oesophage': 'Œsophage',
    r'Coeliakie': 'Maladie cœliaque',
    r'Meningite': 'Méningite',
    r'Pneumonie': 'Pneumonie',
    r'Diabete': 'Diabète',
    r'Anemie': 'Anémie',
    r'Dermatite': 'Dermite',
    r'Bronchiolite': 'Bronchiolite',
    r'Adenopathie': 'Adénopathie',
    r'Hematurie': 'Hématurie',
    r'Hemoptysie': 'Hémoptysie',
    r'Hematemese': 'Hématémèse',
    r'Dyspnee': 'Dyspnée',
    r'Ictere': 'Ictère',
    r'Oedeme': 'Œdème',
    r'Meniere': 'Ménière',
    r'Alzheimer': 'Maladie d\'Alzheimer',
    r'Parkinson': 'Maladie de Parkinson',
    r'Crohn': 'Maladie de Crohn',
    r'Hodgkin': 'Lymphome de Hodgkin',
    r'Kaposi': 'Sarcome de Kaposi',
    r'Guillain-Barre': 'Syndrome de Guillain-Barré',
    r'Schonlein-Henoch': 'Purpura de Schönlein-Henoch',
    
    # Harmoniser les terminaisons
    r'Mononucleose': 'Mononucléose infectieuse',
    r'Mononucléose': 'Mononucléose infectieuse',
    r'Cancer du sein': 'Néoplasie mammaire',
    r'Cancer bronchique': 'Néoplasie bronchique',
    r'Cancer du poumon': 'Néoplasie pulmonaire',
    r'Tumeur': 'Néoplasie',
    
    # Supprimer les points finaux
    r'\.$': '',
    
    # Harmoniser None/vide
    r'^None$': '',
    r'^N/A$': ''
}

# Dictionnaire pour les plaintes
standardisation_plaintes = {
    r'Douleur abdo': 'Douleur abdominale',
    r'Douleur abdominal': 'Douleur abdominale',
    r'Sz abdominale': 'Douleur abdominale',
    r'Cephalée': 'Céphalée',
    r'Céphalees': 'Céphalée',
    r'Mal de tête': 'Céphalée',
    r'Dyspnee': 'Dyspnée',
    r'Essoufflement': 'Dyspnée',
    r'Difficultés respiratoires': 'Dyspnée',
    r'Douleur thx': 'Douleur thoracique',
    r'Douleur thorax': 'Douleur thoracique',
    r'Douleur poitrine': 'Douleur thoracique',
    r'Douleur dorsale': 'Dorsalgie',
    r'Mal de dos': 'Dorsalgie',
    r'Lombalgie': 'Lombalgie',
    r'Douleur lombaire': 'Lombalgie',
    r'Fievre': 'Fièvre',
    r'Temperature': 'Fièvre',
    r'Ictere': 'Ictère',
    r'Jaunisse': 'Ictère',
    r'Eruption': 'Éruption cutanée',
    r'Rash': 'Éruption cutanée',
    r'Exanthème': 'Éruption cutanée',
    r'Hematurie': 'Hématurie',
    r'Sang dans les urines': 'Hématurie',
    r'Hemoptysie': 'Hémoptysie',
    r'Crachats sanglants': 'Hémoptysie',
    r'Vertige': 'Vertiges',
    r'Etourdissement': 'Vertiges',
    r'Trouble vision': 'Trouble de la vision',
    r'Perte vision': 'Trouble de la vision',
    r'Baisse acuité visuelle': 'Trouble de la vision',
    r'Trouble mémoire': 'Troubles de la mémoire',
    r'Perte mémoire': 'Troubles de la mémoire',
    r'Oublis': 'Troubles de la mémoire'
}

# ========== APPLICATION DE LA STANDARDISATION ==========

def standardiser_texte(texte, dict_standardisation):
    """Applique les remplacements de standardisation à un texte"""
    if not texte or texte == 'None':
        return None
    
    texte_std = str(texte).strip()
    
    for pattern, remplacement in dict_standardisation.items():
        if pattern.startswith('r\''):
            # C'est une regex
            pattern_regex = pattern[2:-1]  # Enlever r' et '
            texte_std = re.sub(pattern_regex, remplacement, texte_std, flags=re.IGNORECASE)
        else:
            # Remplacement simple
            if texte_std == pattern:
                texte_std = remplacement
    
    # Capitaliser la première lettre
    if texte_std:
        texte_std = texte_std[0].upper() + texte_std[1:] if len(texte_std) > 1 else texte_std.upper()
    
    return texte_std if texte_std else None

# Appliquer la standardisation
changements = 0

for cas in cas_cliniques:
    # Standardiser le sujet
    if cas.get('Sujet'):
        nouveau_sujet = standardisation_sujets.get(cas['Sujet'], cas['Sujet'])
        if nouveau_sujet != cas['Sujet']:
            cas['Sujet'] = nouveau_sujet
            changements += 1
    
    # Standardiser le diagnostic principal
    if cas.get('Suspicion diagnostic principale'):
        ancien = cas['Suspicion diagnostic principale']
        nouveau = standardiser_texte(ancien, standardisation_diagnostics)
        if nouveau != ancien:
            cas['Suspicion diagnostic principale'] = nouveau
            changements += 1
    
    # Standardiser la plainte
    if cas.get('Plainte'):
        ancien = cas['Plainte']
        nouveau = standardiser_texte(ancien, standardisation_plaintes)
        if nouveau != ancien:
            cas['Plainte'] = nouveau
            changements += 1
    
    # Nettoyer les champs vides
    for key in ['Description', 'Anamnèse', 'Status', 'Management', 'Station', 'Diagnostics différentiels']:
        if cas.get(key) in ['None', 'N/A', '']:
            cas[key] = None
            changements += 1

print(f"\n✅ {changements} modifications appliquées")

# ========== STATISTIQUES FINALES ==========

print("\n" + "=" * 80)
print("RÉSULTAT DE LA STANDARDISATION")
print("=" * 80)

# Réanalyser les sujets après standardisation
sujets_apres = defaultdict(int)
for cas in cas_cliniques:
    sujet = cas.get('Sujet', '')
    if sujet:
        sujets_apres[sujet] += 1

print("\n📚 Sujets standardisés (après):")
for sujet, count in sorted(sujets_apres.items(), key=lambda x: x[1], reverse=True):
    print(f"  - {sujet}: {count} cas")

# Exemples de diagnostics standardisés
print("\n🔄 Exemples de diagnostics standardisés:")
exemples = [
    "Hypertension artérielle",
    "BPCO",
    "Sclérose en plaques", 
    "Pyélonéphrite",
    "Prééclampsie",
    "Mononucléose infectieuse",
    "Artériopathie oblitérante des membres inférieurs"
]

for diag in exemples:
    count = sum(1 for cas in cas_cliniques if cas.get('Suspicion diagnostic principale') == diag)
    if count > 0:
        print(f"  - {diag}: {count} cas")

# Sauvegarder le fichier standardisé
with open('Stat/ECOS-Anciens_cas_complet.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n📁 Fichier standardisé sauvegardé: Stat/ECOS-Anciens_cas_complet.json")