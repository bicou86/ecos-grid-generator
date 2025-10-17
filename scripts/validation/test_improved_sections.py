#!/usr/bin/env python3
"""
Script pour tester la génération d'une grille ECOS avec les sections améliorées
"""

import json
import os
import subprocess

def generate_test_grid():
    # Lire le fichier JSON de test (RESCOS-10 qui contient les nouvelles sections)
    json_path = 'json_files/RESCOS/RESCOS-10 - Céphalée.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Vérifier que les sections resume et presentationPatient existent
    has_resume = 'resume' in data
    has_presentation = 'presentationPatient' in data
    
    print(f"✓ Fichier JSON chargé : {json_path}")
    print(f"  - Section 'resume' présente : {'✓' if has_resume else '✗'}")
    print(f"  - Section 'presentationPatient' présente : {'✓' if has_presentation else '✗'}")
    
    if has_resume:
        print(f"  - Titre resume : {data['resume'].get('titre', 'Non défini')}")
        print(f"  - Nombre de sections : {len(data['resume'].get('sections', []))}")
    
    if has_presentation:
        print(f"  - Titre presentation : {data['presentationPatient'].get('titre', 'Non défini')}")
        print(f"  - Nombre de sections : {len(data['presentationPatient'].get('sections', []))}")
    
    # Créer un fichier HTML de test avec le générateur et le JSON intégré
    with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
        generator_html = f.read()
    
    # Injecter le JSON directement dans le textarea
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    
    # Créer une version du générateur avec le JSON pré-rempli et auto-génération
    test_html = generator_html.replace(
        '</head>',
        '''<script>
        window.addEventListener('DOMContentLoaded', function() {
            // Pré-remplir le textarea avec le JSON
            document.getElementById('jsonInput').value = ''' + json.dumps(json_str) + ''';
            // Auto-générer la grille après un court délai
            setTimeout(function() {
                generateGrid();
            }, 100);
        });
        </script>
        </head>'''
    )
    
    # Sauvegarder le fichier de test
    output_path = 'grilles_generees/html/TEST_Céphalée_Améliorée - Grille ECOS.html'
    os.makedirs('grilles_generees/html', exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(test_html)
    
    print(f"\n✓ Fichier de test généré : {output_path}")
    print("\nPour visualiser le résultat :")
    print(f"  open '{output_path}'")
    
    # Ouvrir automatiquement dans le navigateur
    try:
        subprocess.run(['open', output_path], check=True)
        print("\n✓ Ouverture dans le navigateur...")
    except:
        print("\n⚠ Impossible d'ouvrir automatiquement le fichier")

if __name__ == '__main__':
    generate_test_grid()