#!/usr/bin/env python3
"""
Script pour tester le générateur avec des propriétés complexes dans presentationPatient
"""

import json
import os
import time

# Fichiers à tester
test_files = [
    'json_files/USMLE/USMLE-1 - Douleur thoracique - Homme de 46 ans 2.json',
    'json_files/RESCOS/RESCOS-3 - Amaurose.json'
]

for json_path in test_files:
    if not os.path.exists(json_path):
        print(f"⚠️ Fichier non trouvé : {json_path}")
        continue
    
    # Lire le fichier JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    base_name = os.path.basename(json_path).replace('.json', '')
    print(f"\n📄 Test avec : {base_name}")
    
    # Analyser la structure
    if 'annexes' in data and 'presentationPatient' in data['annexes']:
        presentation = data['annexes']['presentationPatient']
        print(f"✓ Section presentationPatient trouvée")
        
        # Compter les propriétés complexes
        complex_props_found = set()
        
        if 'sections' in presentation:
            for section in presentation['sections']:
                if 'subsections' in section:
                    for subsection in section['subsections']:
                        if 'questions' in subsection:
                            for q in subsection['questions']:
                                if 'reponse' in q and isinstance(q['reponse'], dict):
                                    for key in q['reponse'].keys():
                                        complex_props_found.add(key)
        
        if complex_props_found:
            print(f"  Propriétés complexes trouvées : {', '.join(sorted(complex_props_found))}")
            
            # Générer le HTML pour tester
            output_name = base_name.replace(' ', '_')
            output_path = f'grilles_generees/html/TEST_{output_name}_Complex.html'
            
            # Lire le générateur
            with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
                generator_html = f.read()
            
            # Injecter le JSON et générer automatiquement
            json_str = json.dumps(data, ensure_ascii=False, indent=2)
            
            test_html = generator_html.replace(
                '</head>',
                '''<script>
                window.addEventListener('DOMContentLoaded', function() {
                    // Injecter le JSON
                    document.getElementById('jsonInput').value = ''' + json.dumps(json_str) + ''';
                    // Générer automatiquement après un délai
                    setTimeout(function() {
                        if (typeof generateGrid === 'function') {
                            generateGrid();
                            console.log('✓ Grille générée avec succès');
                            
                            // Vérifier que les propriétés complexes sont bien affichées
                            setTimeout(function() {
                                var responseSections = document.querySelectorAll('.reponse-section');
                                console.log('  Nombre de sections de réponse trouvées : ' + responseSections.length);
                                
                                responseSections.forEach(function(section) {
                                    var title = section.querySelector('strong');
                                    if (title) {
                                        console.log('    - ' + title.textContent);
                                    }
                                });
                            }, 500);
                        } else {
                            console.error('✗ Fonction generateGrid non trouvée');
                        }
                    }, 100);
                });
                </script>
                </head>'''
            )
            
            # Créer le dossier si nécessaire
            os.makedirs('grilles_generees/html', exist_ok=True)
            
            # Sauvegarder le fichier de test
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(test_html)
            
            print(f"✓ Fichier de test généré : {output_path}")
            
            # Afficher les propriétés qui devraient être formatées
            print("\n  Vérifications à effectuer dans le HTML généré :")
            if 'immediat' in complex_props_found:
                print("    ⚡ 'Traitement immédiat' en orange (#ff5722)")
            if 'mesuresGenerales' in complex_props_found:
                print("    🏥 'Mesures générales' en vert (#4CAF50)")
            if 'traitementMedicamenteux' in complex_props_found:
                print("    💊 'Traitement médicamenteux' en violet (#9C27B0)")
            if 'strategieReperfusion' in complex_props_found:
                print("    🔄 'Stratégie de reperfusion' en rouge (#F44336)")
            if 'complicationsImmediates' in complex_props_found:
                print("    ⚠️ 'Complications immédiates' en orange vif")
            if 'surveillance' in complex_props_found:
                print("    👁️ 'Surveillance' en gris-bleu (#607D8B)")
            if 'suiviLongTerme' in complex_props_found:
                print("    📅 'Suivi à long terme' en bleu (#2196F3)")
            if 'mnemo' in complex_props_found:
                print("    💡 Mnémo dans boîte verte avec lettres cerclées")
        else:
            print("  Aucune propriété complexe trouvée")
    else:
        print("  Pas de section presentationPatient")

print("\n" + "="*60)
print("✅ Tests terminés. Vérifiez les fichiers HTML générés :")
print("   - Les propriétés complexes doivent avoir leurs icônes et couleurs")
print("   - Les mnémos doivent être dans des boîtes vertes")
print("   - Les listes doivent être correctement formatées")
print("   - Les objets imbriqués doivent être indentés")