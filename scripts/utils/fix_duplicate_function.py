#!/usr/bin/env python3
"""
Script pour supprimer uniquement la première fonction generatePresentationPatientSection dupliquée
"""

# Lire le fichier
with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Trouver les lignes avec la fonction
function_starts = []
for i, line in enumerate(lines):
    if 'function generatePresentationPatientSection(presentation) {' in line:
        function_starts.append(i)
        print(f"Trouvé fonction à la ligne {i+1}")

if len(function_starts) == 2:
    # Trouver la fin de la première fonction
    # On cherche le prochain "}\n\nfunction" après le début de la première fonction
    first_start = function_starts[0]
    
    # Chercher la fin de la première fonction (juste avant la deuxième fonction ou une autre fonction)
    brace_count = 0
    function_end = None
    in_function = False
    
    for i in range(first_start, len(lines)):
        line = lines[i]
        
        if i == first_start:
            in_function = True
            brace_count = 1  # On commence avec une accolade ouvrante
            continue
            
        if in_function:
            # Compter les accolades
            brace_count += line.count('{') - line.count('}')
            
            # Si on atteint 0, c'est la fin de la fonction
            if brace_count == 0:
                function_end = i
                print(f"Fin de la première fonction trouvée à la ligne {i+1}")
                break
    
    if function_end:
        # Créer le nouveau contenu en supprimant la première fonction
        new_lines = []
        new_lines.extend(lines[:first_start])
        new_lines.append("// Première version de generatePresentationPatientSection supprimée - voir version améliorée plus bas\n")
        new_lines.extend(lines[function_end+1:])
        
        # Sauvegarder
        with open('Chablon/Generateur_de_Grilles_ECOS.html', 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print(f"✓ Première fonction supprimée (lignes {first_start+1} à {function_end+1})")
        print(f"✓ Deuxième fonction conservée (ligne {function_starts[1]+1})")
    else:
        print("✗ Impossible de trouver la fin de la première fonction")
else:
    print(f"✗ Trouvé {len(function_starts)} fonctions au lieu de 2")

# Vérifier que les autres fonctions sont toujours présentes
print("\n✓ Vérification des fonctions importantes...")
with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
    content = f.read()
    
functions_to_check = [
    'generateImagesSection',
    'generateDocumentsSection',
    'generateScenarioPatienteStandardiseeSection',
    'generateInformationsExpertSection',
    'generateTheoriePratiqueSection',
    'generateResume',
    'formatHighlightedText',
    'generateMnemoSection'
]

for func in functions_to_check:
    if f'function {func}(' in content:
        print(f"  ✓ {func} présente")
    else:
        print(f"  ✗ {func} MANQUANTE!")