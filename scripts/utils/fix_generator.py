#!/usr/bin/env python3
"""
Script pour corriger les fonctions dupliquées et erreurs dans le générateur
"""

# Lire le fichier
with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver les positions des deux fonctions generatePresentationPatientSection
import re

# Pattern pour trouver les fonctions
pattern = r'function generatePresentationPatientSection\(presentation\) \{'

matches = list(re.finditer(pattern, content))
print(f"Trouvé {len(matches)} occurrences de generatePresentationPatientSection")

if len(matches) == 2:
    # Positions des deux fonctions
    first_start = matches[0].start()
    second_start = matches[1].start()
    
    # Trouver la fin de la première fonction (juste avant la deuxième)
    # On cherche le dernier "return html;" avant la deuxième fonction
    before_second = content[first_start:second_start]
    
    # Trouver la fin de la première fonction
    last_return = before_second.rfind('return html;\n}')
    if last_return != -1:
        first_end = first_start + last_return + len('return html;\n}')
        
        # Supprimer la première fonction (la remplacer par un commentaire)
        new_content = (
            content[:first_start] + 
            "// Fonction supprimée - voir la version améliorée plus bas\n" +
            content[first_end:]
        )
        
        # Sauvegarder le fichier corrigé
        with open('Chablon/Generateur_de_Grilles_ECOS_fixed.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✓ Fichier corrigé créé : Chablon/Generateur_de_Grilles_ECOS_fixed.html")
        print(f"  - Première fonction supprimée (position {first_start}-{first_end})")
        print(f"  - Deuxième fonction conservée (position {second_start})")
    else:
        print("✗ Impossible de trouver la fin de la première fonction")
else:
    print(f"✗ Attendu 2 fonctions, trouvé {len(matches)}")

# Vérifier aussi s'il y a des problèmes avec les fonctions ajoutées
print("\nVérification des nouvelles fonctions...")
if 'function formatHighlightedText(' in content:
    print("✓ formatHighlightedText trouvée")
else:
    print("✗ formatHighlightedText non trouvée")

if 'function generateMnemoSection(' in content:
    print("✓ generateMnemoSection trouvée")
else:
    print("✗ generateMnemoSection non trouvée")