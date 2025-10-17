#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
from pathlib import Path

def fix_duplicate_script():
    """Corrige la duplication du script dans le fichier HTML"""
    
    # Lire le fichier
    file_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Pédiatrie_revisions.html')
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Trouver la première balise script et tout son contenu
    first_script_start = content.find('<script>')
    if first_script_start == -1:
        print("❌ Pas de balise <script> trouvée")
        return
    
    first_script_end = content.find('</script>', first_script_start)
    if first_script_end == -1:
        print("❌ Pas de balise </script> trouvée")
        return
    
    # Trouver la deuxième balise script
    second_script_start = content.find('<script>', first_script_end)
    if second_script_start == -1:
        print("✅ Pas de duplication détectée")
        return
    
    # Supprimer tout après la première balise </script> et avant </body>
    body_end = content.find('</body>')
    if body_end == -1:
        print("❌ Pas de balise </body> trouvée")
        return
    
    # Reconstruire le contenu
    new_content = content[:first_script_end + 9]  # +9 pour inclure </script>
    new_content += '\n</body>\n</html>'
    
    # Corriger aussi le nombre total de pathologies dans le script
    # Compter le nombre réel de pathologies
    pathology_count = new_content.count('class="pathology-row"')
    new_content = re.sub(
        r'let totalPathologies = \d+;',
        f'let totalPathologies = {pathology_count};',
        new_content
    )
    
    # Sauvegarder le fichier corrigé
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Fichier corrigé avec succès")
    print(f"   Script dupliqué supprimé")
    print(f"   Nombre de pathologies corrigé : {pathology_count}")

if __name__ == "__main__":
    print("🔧 Correction du fichier HTML Pédiatrie...")
    print("-" * 50)
    fix_duplicate_script()
    print("-" * 50)
    print("✨ Correction terminée!")