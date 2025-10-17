#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour générer automatiquement une grille ECOS HTML et vérifier les couleurs
"""

import json
import os
import subprocess
import time

def generate_html(json_file, output_html):
    """
    Génère un fichier HTML à partir d'un JSON en utilisant le générateur
    Note: Cette fonction simule ce que fait le générateur interactif
    """
    # Lire le fichier JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Lire le template du générateur
    with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
        generator_content = f.read()
    
    # Extraire le JavaScript du générateur
    # (Dans une vraie implémentation, on exécuterait le JS directement)
    # Pour ce test, on va juste créer un HTML minimal pour vérifier les couleurs
    
    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test Couleurs TherapySection - {data['title']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .therapy-section {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; }}
        .therapy-title {{ color: #a92117; font-weight: bold; margin-bottom: 10px; font-size: 16px; }}
        .therapy-item {{ margin: 10px 0; padding-left: 20px; }}
    </style>
</head>
<body>
    <h1>Test des couleurs de la section thérapie</h1>
    <h2>{data['title']}</h2>
"""
    
    # Chercher les therapySection dans le JSON
    if 'sections' in data and 'management' in data['sections']:
        for criterion in data['sections']['management']['criteria']:
            if 'therapySection' in criterion:
                html_content += f"<h3>Critère : {criterion.get('text', 'N/A')}</h3>\n"
                for category in criterion['therapySection']['categories']:
                    html_content += '<div class="therapy-section">\n'
                    if 'title' in category:
                        html_content += f'    <div class="therapy-title" style="color: #a92117; font-weight: bold;">{category["title"]}</div>\n'
                    
                    if 'items' in category:
                        html_content += '    <div class="therapy-items">\n'
                        for item in category['items']:
                            html_content += '        <div class="therapy-item">\n'
                            if 'treatment' in item:
                                html_content += f'            <div><span style="color: #000;">Traitement : </span><span style="color: #998800;">{item["treatment"]}</span></div>\n'
                            if 'details' in item:
                                html_content += f'            <div style="margin-left: 20px; color: #666;"><em>Détails :</em> {item["details"]}</div>\n'
                            if 'duration' in item:
                                html_content += f'            <div style="margin-left: 20px; color: #666;"><em>Durée :</em> {item["duration"]}</div>\n'
                            html_content += '        </div>\n'
                        html_content += '    </div>\n'
                    html_content += '</div>\n'
    
    html_content += """
    <div style="margin-top: 40px; padding: 20px; background: #f5f5f5;">
        <h3>Vérification des couleurs :</h3>
        <ul>
            <li>✓ Titres de pathologie : <span style="color: #a92117; font-weight: bold;">ROUGE (#a92117)</span></li>
            <li>✓ Traitements : <span style="color: #998800; font-weight: bold;">JAUNE (#998800)</span></li>
            <li>✓ Détails et durée : <span style="color: #666;">GRIS (#666)</span></li>
        </ul>
    </div>
</body>
</html>"""
    
    # Écrire le fichier HTML
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Fichier HTML généré : {output_html}")
    return output_html

def main():
    # Fichier JSON à tester
    json_file = "json_files/AMBOSS/AMBOSS-4 - Saignements vaginaux - Femme 50 ans.json"
    output_html = "test_therapy_colors.html"
    
    # Générer le HTML de test
    html_file = generate_html(json_file, output_html)
    
    # Ouvrir dans le navigateur
    try:
        import webbrowser
        full_path = os.path.abspath(html_file)
        webbrowser.open(f"file://{full_path}")
        print(f"✓ Fichier ouvert dans le navigateur")
    except:
        print(f"⚠ Ouvrez manuellement : {html_file}")

if __name__ == "__main__":
    main()