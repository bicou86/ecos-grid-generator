#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour restaurer les therapySection au format original avec "content"
et les restructurer correctement par pathologie
"""

import json
import re
from pathlib import Path

# Structure originale des therapySection pour chaque fichier AMBOSS
original_therapy_structures = {
    "AMBOSS-32 - Lésion génitale - Femme 17 ans.json": [
        {
            "title": "Si infection VPH (condylomes) confirmée",
            "content": "• Imiquimod 5% crème × 3/semaine × 16 sem\n• Ou podophyllotoxine 0.5% × 2/j × 3j\n• Cryothérapie azote liquide hebdomadaire\n• Surveillance régulière (récidives fréquentes)\n• Compléter vaccination VPH (doses 2 et 3)"
        },
        {
            "title": "Si infection Chlamydia confirmée",
            "content": "• Azithromycine 1 g dose unique PO\n• Ou doxycycline 100 mg × 2/j × 7j\n• Traitement partenaires obligatoire\n• Test de guérison à 3-4 semaines"
        },
        {
            "title": "Si gonorrhée associée",
            "content": "• Ceftriaxone 500 mg IM dose unique\n• PLUS azithromycine 1 g PO\n• Déclaration obligatoire"
        },
        {
            "title": "Si syphilis primaire",
            "content": "• Benzathine pénicilline G 2.4 MU IM dose unique\n• Si allergie : doxycycline 100 mg × 2/j × 14j\n• Suivi sérologique à 3, 6, 12 mois"
        },
        {
            "title": "Mesures générales",
            "content": "• Abstinence sexuelle jusqu'à guérison\n• Dépistage et traitement tous partenaires récents\n• Préservatifs sans latex systématiques\n• Dépistage IST complet (VIH, hépatites)\n• Suivi gynécologique régulier"
        }
    ],
    "AMBOSS-6 - Douleurs pelviennes - Femme 30 ans.json": [
        {
            "title": "Traitement des léiomyomes utérins (fibromes)",
            "content": "• AINS : ibuprofène 400-600mg x3/j pour dysménorrhée\n• Contraceptifs hormonaux : CO ou DIU-LNG (Mirena)\n• Agonistes GnRH : leuprolide pour réduction pré-op (max 6 mois)\n• Myomectomie conservatrice si désir fertilité\n• Embolisation des artères utérines (EAU) : alternative chirurgie\n• Supplémentation fer si anémie par ménorragie"
        },
        {
            "title": "Traitement de l'endométriose",
            "content": "• AINS : naproxène ou ibuprofène pour dysménorrhée cyclique\n• Contraceptifs en continu : suppression menstruelle\n• Progestatifs : dienogest 2mg/j ou désogestrel 75μg/j\n• Agonistes GnRH + add-back thérapy (oestrogènes/progestatifs)\n• Excision laparoscopique des lésions + adhésiolyse\n• FIV si infertilité persistante après traitement"
        },
        {
            "title": "Prise en charge de l'infertilité associée",
            "content": "• Bilan couple complet : spermogramme, réserve ovarienne (AMH)\n• Hystérosalpingographie : perméabilité tubaire\n• Myomectomie si fibromes sous-muqueux ou > 4cm\n• Stimulation ovarienne : clomifène ou gonadotrophines\n• FIV si échec traitement conservateur après 6-12 mois\n• Support psychologique : counseling fertilité, groupes soutien"
        }
    ],
    "AMBOSS-1 - Douleurs abdominales - Femme 47 ans.json": [
        {
            "title": "Prise en charge immédiate de la cholécystite aiguë",
            "content": "• NPO (nil per os)\n• Réhydratation IV : NaCl 0.9% ou Ringer lactate\n• Analgésie : paracétamol IV, AINS si pas de CI\n• Antispasmodiques : phloroglucinol (Spasfon®) 80 mg × 3/j\n• Antiémétiques si nausées : métoclopramide"
        },
        {
            "title": "Antibiothérapie si signes infectieux",
            "content": "• 1ère ligne : amoxicilline-acide clavulanique 1g × 3/j IV\n• Si allergie : ciprofloxacine + métronidazole\n• Durée : 5-7 jours\n• Adapter selon antibiogramme si hémocultures positives"
        },
        {
            "title": "Traitement chirurgical",
            "content": "• Cholécystectomie laparoscopique : gold standard\n• Timing optimal : dans les 72h (cholécystectomie précoce)\n• Réduction durée hospitalisation et complications\n• Préparation : bilan préopératoire, arrêt anticoagulants si besoin\n• Alternative si CI chirurgie : drainage percutané cholécystostomie"
        },
        {
            "title": "Mesures préventives post-opératoires",
            "content": "• Régime pauvre en graisses temporairement\n• Éviter aliments déclencheurs : fritures, œufs, chocolat\n• Supplémentation enzymes digestives si maldigestion\n• Dépistage lithiase résiduelle voie biliaire principale\n• Suivi hépatique si anomalies biologiques persistantes"
        }
    ]
}

def restore_file_therapy(filepath, categories_structure):
    """Restaure la therapySection d'un fichier avec la structure originale"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Trouver et remplacer la therapySection
    if 'sections' in data and 'management' in data['sections']:
        for criterion in data['sections']['management']['criteria']:
            if 'therapySection' in criterion:
                # Créer la nouvelle structure avec categories contenant title et content
                criterion['therapySection'] = {
                    'categories': categories_structure
                }
                
                # Sauvegarder
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                return True
    
    return False

def main():
    print("Restauration des therapySection au format original avec 'content'...")
    print("=" * 70)
    
    restored_count = 0
    
    # Restaurer les fichiers spécifiés
    for filename, categories in original_therapy_structures.items():
        filepath = Path(f"json_files/AMBOSS/{filename}")
        
        if filepath.exists():
            if restore_file_therapy(filepath, categories):
                restored_count += 1
                print(f"✅ {filename} restauré")
                print(f"   {len(categories)} catégories avec format 'content'")
                for cat in categories:
                    lines_count = len(cat['content'].split('\n'))
                    print(f"   • {cat['title']}: {lines_count} lignes")
            else:
                print(f"⚠️  {filename} - therapySection non trouvée")
        else:
            print(f"❌ {filename} - fichier non trouvé")
    
    print("\n" + "=" * 70)
    print(f"✅ {restored_count} fichiers restaurés avec succès !")
    print("\nLe format 'content' permet un affichage plus compact avec bullets dans le générateur HTML.")

if __name__ == "__main__":
    main()