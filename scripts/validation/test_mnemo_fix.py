#!/usr/bin/env python3
"""
Test rapide pour vérifier que les mnémos s'affichent correctement
"""

import json
import os

# Créer un JSON de test minimal avec un mnémo dans la réponse
test_json = {
    "title": "Test Mnémo",
    "context": {
        "setting": "Test",
        "patient": "Test patient"
    },
    "sections": {},
    "annexes": {
        "presentationPatient": {
            "titre": "Test Présentation",
            "sections": [{
                "titre": "Section Test",
                "subsections": [{
                    "titre": "Questions Test",
                    "questions": [
                        {
                            "question": "Question avec mnémo simple (chaîne) ?",
                            "reponse": {
                                "mesuresGenerales": ["Test 1", "Test 2"],
                                "mnemo": "💡 MONA modifié : Morphine, Oxygène, Nitrés, Aspirine — mais 🚫 bêta-bloquants si cocaïne"
                            }
                        },
                        {
                            "question": "Question avec mnémo objet ?",
                            "reponse": {
                                "immediat": ["Action urgente 1", "Action urgente 2"],
                                "mnemo": {
                                    "titre": "Mnémo ABC",
                                    "items": [
                                        "A : Airway",
                                        "B : Breathing",
                                        "C : Circulation"
                                    ]
                                }
                            }
                        }
                    ]
                }]
            }]
        }
    }
}

# Sauvegarder le JSON de test
with open('json_files/TEST_MNEMO.json', 'w', encoding='utf-8') as f:
    json.dump(test_json, f, ensure_ascii=False, indent=2)

print("✓ Fichier de test créé : json_files/TEST_MNEMO.json")

# Générer le HTML
with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
    generator_html = f.read()

json_str = json.dumps(test_json, ensure_ascii=False, indent=2)

test_html = generator_html.replace(
    '</head>',
    '''<script>
    window.addEventListener('DOMContentLoaded', function() {
        document.getElementById('jsonInput').value = ''' + json.dumps(json_str) + ''';
        setTimeout(function() {
            if (typeof generateGrid === 'function') {
                generateGrid();
                console.log('✓ Grille générée');
                
                // Vérifier les mnémos
                setTimeout(function() {
                    var mnemoBoxes = document.querySelectorAll('.mnemo-box');
                    console.log('Nombre de boîtes mnémo trouvées : ' + mnemoBoxes.length);
                    
                    mnemoBoxes.forEach(function(box, index) {
                        console.log('Mnémo ' + (index + 1) + ':');
                        var content = box.querySelector('.mnemo-content');
                        var title = box.querySelector('.mnemo-title');
                        var items = box.querySelector('.mnemo-items');
                        
                        if (content) {
                            console.log('  - Type: Chaîne simple');
                            console.log('  - Contenu: ' + content.textContent.substring(0, 50) + '...');
                        } else if (title && items) {
                            console.log('  - Type: Objet avec items');
                            console.log('  - Titre: ' + title.textContent);
                            console.log('  - Nombre d\'items: ' + items.children.length);
                        }
                    });
                }, 500);
            }
        }, 100);
    });
    </script>
    </head>'''
)

# Sauvegarder
os.makedirs('grilles_generees/html', exist_ok=True)
with open('grilles_generees/html/TEST_MNEMO_Fix.html', 'w', encoding='utf-8') as f:
    f.write(test_html)

print("✓ Fichier HTML de test généré : grilles_generees/html/TEST_MNEMO_Fix.html")
print("\nOuvrez ce fichier dans votre navigateur et vérifiez :")
print("  1. Deux boîtes mnémo vertes doivent apparaître")
print("  2. La première avec le texte MONA en blanc")
print("  3. La seconde avec les items ABC et lettres cerclées")
print("\nOuvrez la console du navigateur pour voir les logs de vérification")