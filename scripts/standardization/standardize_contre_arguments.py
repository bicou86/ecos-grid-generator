#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import re

def format_contre_arguments(text):
    """
    Transforme les arguments 'Contre :' en format standardisé avec puces
    """
    # Chercher les patterns "Contre :" ou "Cependant :"
    patterns = [
        ('\\nContre : ', True),
        ('Contre : ', False),  # Sans \n avant
        ('\\nCependant : ', True),
        ('Cependant : ', False)
    ]
    
    result = text
    for pattern, has_newline in patterns:
        if pattern in result:
            # Diviser au premier match
            parts = result.split(pattern, 1)
            if len(parts) == 2:
                before = parts[0]
                after = parts[1]
                
                # Traiter les arguments après "Contre :" ou "Cependant :"
                # Prendre jusqu'à la fin de la chaîne (pas de split sur \n)
                contre_text = after.strip()
                
                # Séparer les arguments (par virgule intelligente)
                # Ne pas séparer les virgules dans les parenthèses
                arguments = []
                current = ""
                paren_depth = 0
                
                for char in contre_text:
                    if char == '(':
                        paren_depth += 1
                        current += char
                    elif char == ')':
                        paren_depth -= 1
                        current += char
                    elif char == ',' and paren_depth == 0:
                        if current.strip():
                            arguments.append(current.strip())
                        current = ""
                    else:
                        current += char
                
                # Ajouter le dernier argument
                if current.strip():
                    arguments.append(current.strip())
                
                # Formater les arguments avec majuscule
                formatted_args = []
                for arg in arguments:
                    # Mettre la première lettre en majuscule
                    arg = arg.strip()
                    if arg and arg[0].islower():
                        arg = arg[0].upper() + arg[1:]
                    if arg:
                        formatted_args.append('\\t□ ' + arg)
                
                # Reconstruire le texte
                if formatted_args:
                    # Assurer qu'il y a un \n avant Arguments CONTRE
                    if before and not before.endswith('\\n'):
                        before += '\\n'
                    result = before + 'Arguments CONTRE:\\n' + '\\n'.join(formatted_args)
                    return result  # Retourner après le premier remplacement
    
    return result

def process_json_file(filepath):
    """
    Traite un fichier JSON pour standardiser les arguments CONTRE
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    
    # Parcourir toutes les sections
    for section_name, section_content in data.get('sections', {}).items():
        for criterion in section_content.get('criteria', []):
            if 'ddSection' in criterion:
                dd_section = criterion['ddSection']
                for category in dd_section.get('categories', []):
                    for item in category.get('items', []):
                        if 'cause' in item:
                            original = item['cause']
                            formatted = format_contre_arguments(original)
                            if original != formatted:
                                item['cause'] = formatted
                                modified = True
    
    return data, modified

def main():
    # Liste des fichiers à traiter
    amboss_dir = 'json_files/AMBOSS'
    files_with_contre = [
        'AMBOSS-4 - Saignements vaginaux - Femme 50 ans.json',
        'AMBOSS-5 - Nausées - Femme 19 ans.json',
        'AMBOSS-6 - Douleurs pelviennes - Femme 30 ans.json',
        'AMBOSS-7 - Toux et fièvre - Fillette 2 ans.json',
        'AMBOSS-8 - Troubles du transit - Homme 32 ans.json',
        'AMBOSS-9 - Douleurs dorsales - Homme 71 ans.json',
        'AMBOSS-10 - Douleurs dorsales et raideur - Homme 26 ans.json',
        'AMBOSS-11 - Selles noires - Homme 65 ans.json',
        'AMBOSS-12 - Douleur thoracique - Femme 35 ans.json',
        'AMBOSS-13 - Douleur thoracique - Homme 35 ans.json',
        'AMBOSS-14 - Douleur thoracique - Homme 45 ans.json',
        'AMBOSS-15 - Douleur abdominale chronique - Garçon 6 ans.json',
        'AMBOSS-16 - Troubles du sommeil - Femme 32 ans.json',
        'AMBOSS-17 - Troubles de mémoire - Femme 70 ans.json',
        'AMBOSS-18 - Toux chronique - Femme 21 ans.json',
        'AMBOSS-19 - Toux chronique - Femme 53 ans.json',
        'AMBOSS-20 - Diminution de sensation dans les extrémités - Homme 42 ans.json',
        'AMBOSS-21 - Hématurie - Homme 23 ans.json',
        'AMBOSS-22 - Dysphagie - Femme 60 ans.json',
        'AMBOSS-23 - Perte auditive - Homme 65 ans.json',
        'AMBOSS-24 - Évaluation après chute - Femme 30 ans.json',
        'AMBOSS-25 - Douleur au genou - Femme 47 ans.json',
        'AMBOSS-26 - Céphalée - Homme 29 ans.json',
        'AMBOSS-27 - Fatigue - Femme 28 ans.json',
        'AMBOSS-28 - Prise de poids - Homme 45 ans.json',
        'AMBOSS-29 - Fatigue - Femme 18 ans.json',
        'AMBOSS-30 - Mal de gorge - Homme 19 ans.json',
        'AMBOSS-31 - Toux - Homme 58 ans.json',
        'AMBOSS-32 - Lésion génitale - Femme 17 ans.json',
        'AMBOSS-33 - Céphalée - Femme 55 ans.json',
        'AMBOSS-34 - Perte de vision - Homme 66 ans.json',
        'AMBOSS-35 - Brûlures d\'estomac - Femme 54 ans.json',
        'AMBOSS-36 - Fatigue - Homme 54 ans.json',
        'AMBOSS-37 - Changements cutanés - Nouveau-née 4 jours.json',
        'AMBOSS-38 - Douleur à la cheville - Femme 28 ans.json',
        'AMBOSS-39 - Douleur à l\'épaule - Homme 52 ans.json',
        'AMBOSS-40 - Vertiges - Homme 25 ans.json'
    ]
    
    modified_count = 0
    
    for filename in files_with_contre:
        filepath = os.path.join(amboss_dir, filename)
        if os.path.exists(filepath):
            try:
                data, modified = process_json_file(filepath)
                if modified:
                    # Sauvegarder le fichier
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    print(f'✅ Modifié : {filename}')
                    modified_count += 1
                else:
                    print(f'⏭️  Déjà OK : {filename}')
            except Exception as e:
                print(f'❌ Erreur avec {filename}: {e}')
        else:
            print(f'⚠️  Fichier non trouvé : {filename}')
    
    print(f'\n📊 Résumé : {modified_count} fichiers modifiés sur {len(files_with_contre)}')

if __name__ == '__main__':
    main()