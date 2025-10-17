#!/usr/bin/env python3
"""
Script pour tester le générateur avec RESCOS-3 qui contient des propriétés spéciales
"""

import json
import os

# Lire le fichier JSON de test
json_path = 'json_files/RESCOS/RESCOS-3 - Amaurose.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"✓ Fichier JSON chargé : {json_path}")

# Vérifier la structure des questions dans presentationPatient
if 'annexes' in data and 'presentationPatient' in data['annexes']:
    presentation = data['annexes']['presentationPatient']
    print(f"✓ Section presentationPatient trouvée : {presentation.get('titre', 'Sans titre')}")
    
    # Parcourir les sections pour trouver les questions avec propriétés spéciales
    if 'sections' in presentation:
        for section in presentation['sections']:
            if 'subsections' in section:
                for subsection in section['subsections']:
                    if 'questions' in subsection:
                        print(f"\n  Sous-section : {subsection.get('titre', 'Sans titre')}")
                        for q in subsection['questions']:
                            question = q.get('question', 'Sans question')
                            print(f"    Q: {question}")
                            
                            # Vérifier le type de réponse
                            if 'reponse' in q:
                                reponse = q['reponse']
                                if isinstance(reponse, dict):
                                    if 'immediat' in reponse:
                                        print(f"      → Contient 'immediat' avec {len(reponse['immediat'])} éléments")
                                    if 'pour' in reponse:
                                        print(f"      → Contient 'pour' avec {len(reponse['pour'])} arguments")
                                    if 'contre' in reponse:
                                        print(f"      → Contient 'contre' avec {len(reponse['contre'])} arguments")
                                elif isinstance(reponse, list):
                                    print(f"      → Réponse liste avec {len(reponse)} éléments")
                                else:
                                    print(f"      → Réponse texte")
                            
                            if 'astuce' in q:
                                print(f"      ✓ Contient une astuce")
                            
                            if 'analyse' in q:
                                print(f"      ✓ Contient une analyse")

print("\n✓ Structure vérifiée. Le générateur devrait afficher correctement :")
print("  - Les réponses avec propriété 'immediat' (⚡ Traitement immédiat)")
print("  - Les astuces dans des boîtes vertes avec icône 💡")
print("  - Les analyses dans des boîtes jaunes")

# Créer un fichier de test
with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
    generator_html = f.read()

# Injecter le JSON directement
json_str = json.dumps(data, ensure_ascii=False, indent=2)

test_html = generator_html.replace(
    '</head>',
    '''<script>
    window.addEventListener('DOMContentLoaded', function() {
        // Pré-remplir le textarea avec le JSON
        document.getElementById('jsonInput').value = ''' + json.dumps(json_str) + ''';
        // Auto-générer la grille après un court délai
        setTimeout(function() {
            if (typeof generateGrid === 'function') {
                generateGrid();
            } else {
                console.error('generateGrid function not found');
            }
        }, 100);
    });
    </script>
    </head>'''
)

# Sauvegarder le fichier de test
output_path = 'grilles_generees/html/TEST_RESCOS3_Amaurose - Grille ECOS.html'
os.makedirs('grilles_generees/html', exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(test_html)

print(f"\n✓ Fichier de test généré : {output_path}")
print(f"\nPour visualiser : open '{output_path}'")