#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
from pathlib import Path

def apply_highlights_to_text(text):
    """Applique les highlights colorés au texte"""
    if not text:
        return text
    
    # Patterns de mise en évidence
    highlights = {
        # Points urgents et importants (jaune)
        'urgent': [
            r'\b(URGENT|Urgence|urgence|ATTENTION|Attention|Immédiat|immédiat|Rapidement|rapidement|Critique|critique|Vital|vital|Prioritaire|prioritaire|<1h|<4h30|<6h|<24h|<120 min|<90 min|Précoce|précoce|brutal|brutale|brutalement)\b',
            'urgent'
        ],
        # Warnings et précautions (rouge)
        'warning': [
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère|Léthal|léthal)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Douleur|douleur|Fièvre|fièvre|Frissons|frissons|Sueurs|sueurs|Asthénie|asthénie|Anorexie|anorexie|Amaigrissement|amaigrissement|Prurit|prurit|Éruption|éruption|Adénopathie|adénopathie|Hépatomégalie|hépatomégalie|Splénomégalie|splénomégalie|Ictère|ictère|Ascite|ascite|Œdème|œdème|Dyspnée|dyspnée|Toux|toux|Hémoptysie|hémoptysie|Douleur thoracique|Palpitations|palpitations|Malaise|malaise|Vertige|vertige|Céphalée|céphalée|Paralysie|paralysie|Paresthésie|paresthésie|Nausée|nausée|Vomissement|vomissement|Diarrhée|diarrhée|Constipation|constipation|Rectorragie|rectorragie|Méléna|méléna|Hématurie|hématurie|Dysurie|dysurie|Pollakiurie|pollakiurie|Défense|défense|Contracture|contracture|Murphy|Rovsing|Psoas|Obturateur|Guarding|Rebond|rebond)\b',
            'clinical-sign'
        ],
        # Points positifs (vert)
        'positive': [
            r'\b(Bénéfique|bénéfique|Favorable|favorable|Bon pronostic|bon pronostic|Efficace|efficace|Succès|succès|Amélioration|amélioration|Guérison|guérison|Résolution|résolution|Normal|normal|Stable|stable|Bénin|bénin|Conservée|conservée|Claire|claire)\b',
            'positive'
        ],
        # Dosages médicamenteux (vert clair)
        'dosage': [
            r'\b(\d+\s*(?:mg|g|mcg|µg|UI|U|mL|L|mmol|mEq|ml|kg|%)(?:/(?:kg|jour|j|h|min|L|dose|prise))?)|\b(Posologie|posologie|Dose|dose|IV|PO|IM|SC|Per os|Intraveineux|intramusculaire|sous-cutané)\b',
            'dosage'
        ],
        # Examens prioritaires (bleu clair)
        'exam': [
            r'\b(ECG|Échographie|échographie|US|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Endoscopie|endoscopie|Coloscopie|coloscopie|Gastroscopie|gastroscopie|FOGD|Laparoscopie|laparoscopie|Cœlioscopie|cœlioscopie|Arthroscopie|arthroscopie|CPRE|ERCP|Cholangiographie|cholangiographie|Angiographie|angiographie|Artériographie|artériographie|Coronarographie|coronarographie|Biologie|biologie|NFS|CRP|VS|TSH|Glycémie|glycémie|HbA1c|Bilan hépatique|Bilan rénal|Ionogramme|ionogramme|Gazométrie|gazométrie|Hémoculture|hémoculture|ECBU|Sérologie|sérologie|PCR|Prélèvement|prélèvement|Culture|culture|Antibiogramme|antibiogramme|D-dimères|Troponine|troponine|BNP|NT-proBNP|CPK|LDH|Ferritine|ferritine|B12|Folates|folates|PTH|Vitamine D|PSA|AFP|ACE|CA 19-9|Calcitonine|calcitonine|Amylase|amylase|Lipase|lipase)\b',
            'exam'
        ],
        # Procédures chirurgicales
        'surgery': [
            r'\b(Chirurgie|chirurgie|Intervention|intervention|Opération|opération|Incision|incision|Suture|suture|Drainage|drainage|Résection|résection|Ablation|ablation|Exérèse|exérèse|Anastomose|anastomose|Plastie|plastie|Greffe|greffe|Transplantation|transplantation|Laparotomie|laparotomie|Laparoscopie|laparoscopie|Cœlioscopie|cœlioscopie|Thoracotomie|thoracotomie|Thoracoscopie|thoracoscopie|Arthroscopie|arthroscopie|Endoscopie|endoscopie|Cholécystectomie|cholécystectomie|Appendicectomie|appendicectomie|Hémicolectomie|hémicolectomie|Colectomie|colectomie|Gastrectomie|gastrectomie|Pancréatectomie|pancréatectomie|Hépatectomie|hépatectomie|Thyroïdectomie|thyroïdectomie|Parathyroïdectomie|parathyroïdectomie|Surrénalectomie|surrénalectomie|Néphrectomie|néphrectomie|Prostatectomie|prostatectomie|Cystectomie|cystectomie|Hystérectomie|hystérectomie|Mastectomie|mastectomie|Amputation|amputation|Pontage|pontage|Stent|stent|Angioplastie|angioplastie|Embolisation|embolisation|Ligature|ligature|Ostéosynthèse|ostéosynthèse|Prothèse|prothèse|Arthrodèse|arthrodèse|Laminectomie|laminectomie|Cure|cure|Hernioplastie|hernioplastie|Herniorraphie|herniorraphie)\b',
            'surgery'
        ]
    }
    
    # Appliquer les highlights
    for key, (pattern, class_name) in highlights.items():
        text = re.sub(pattern, lambda m: f'<span class="{class_name}">{m.group()}</span>', text, flags=re.IGNORECASE)
    
    # OSCE tips en encadré
    text = re.sub(
        r'(OSCE\s*:\s*[^<\.]+\.?)',
        r'<div class="osce-tip"><span class="osce-icon">💡</span>\1</div>',
        text
    )
    
    return text

def regenerate_chirurgie_html():
    """Régénère le fichier HTML Chirurgie complet à partir du JSON mis à jour"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/chirurgie_ecos.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Compter le nombre total de pathologies
    total_pathologies = sum(len(section.get('data', [])) for section in data['sections'])
    
    # Lire le fichier HTML actuel pour récupérer le template de base
    html_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Chirurgie_revisions.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        current_html = f.read()
    
    # Extraire les parties importantes
    head_end = current_html.find('<div class="content">')
    script_start = current_html.find('<script>')
    
    template_head = current_html[:head_end]
    template_script = current_html[script_start:]
    
    # Mettre à jour le nombre de pathologies dans le header
    html_content = template_head
    html_content = re.sub(
        r'<span class="pathology-count">\d+ pathologies</span>',
        f'<span class="pathology-count">{total_pathologies} pathologies</span>',
        html_content
    )
    
    # Mettre à jour le sélecteur de sections
    section_options = ''
    for i, section in enumerate(data['sections'], 1):
        clean_title = re.sub(r'^\d+\.\s*', '', section['title'])
        section_options += f'\n                        <option value="section-{i}">{i}. {clean_title}</option>'
    
    # Remplacer les options de sections
    html_content = re.sub(
        r'<option value="section-1">.*?</select>',
        f'<option value="">Toutes les sections</option>{section_options}\n                    </select>',
        html_content,
        flags=re.DOTALL
    )
    
    # Ajouter le style pour la chirurgie si pas déjà présent
    if '.surgery {' not in html_content:
        surgery_style = '''
        .surgery {
            background: linear-gradient(45deg, #d35400, #e67e22);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
            box-shadow: 0 2px 5px rgba(211, 84, 0, 0.3);
        }
    '''
        style_close_pos = html_content.rfind('</style>')
        if style_close_pos != -1:
            html_content = html_content[:style_close_pos] + surgery_style + '\n    ' + html_content[style_close_pos:]
    
    # Mettre à jour les statistiques
    html_content = re.sub(
        r'<div class="stat-number">\d+</div>\s*<div class="stat-label">Sections</div>',
        f'<div class="stat-number">{len(data["sections"])}</div>\n                <div class="stat-label">Sections</div>',
        html_content
    )
    html_content = re.sub(
        r'<div class="stat-number">\d+</div>\s*<div class="stat-label">Pathologies</div>',
        f'<div class="stat-number">{total_pathologies}</div>\n                <div class="stat-label">Pathologies</div>',
        html_content
    )
    html_content = re.sub(
        r'<div class="stat-number" id="remainingCount">\d+</div>',
        f'<div class="stat-number" id="remainingCount">{total_pathologies}</div>',
        html_content
    )
    
    # Ajouter le début du contenu
    html_content += '<div class="content">\n'
    
    # Générer les sections
    for i, section in enumerate(data['sections'], 1):
        section_title = section['title']
        section_data = section.get('data', [])
        
        # Retirer le numéro du titre s'il existe déjà
        clean_title = re.sub(r'^\d+\.\s*', '', section_title)
        
        # Commentaire de section
        html_content += f'\n            <!-- Section {i}: {clean_title} -->\n'
        
        html_content += f'''            <div class="section" id="section-{i}">
                <h2 class="section-title" onclick="toggleSection(this.parentElement)">
                    {i}. {clean_title}
                    <span class="section-count">{len(section_data)} pathologies</span>
                </h2>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Pathologie</th>
                                <th>Anamnèse</th>
                                <th>Examen Physique</th>
                                <th>Procédures/Examens</th>
                                <th>Thérapie</th>
                                <th>Commentaires</th>
                            </tr>
                        </thead>
                        <tbody>'''
        
        for pathology in section_data:
            # Déterminer les tags
            tags = []
            text_lower = ' '.join(str(v) for v in pathology.values()).lower()
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', '<4h30', 'vital', 'grave', 'sévère', 'précoce', 'rapidement', 'brutal']):
                tags.append('urgent')
            if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué', 'mortel', 'léthal']):
                tags.append('warning')
            if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'iv', 'po', 'im', 'sc', '%']):
                tags.append('dosage')
            if 'osce' in text_lower:
                tags.append('osce')
            
            tags_str = ' '.join(tags) if tags else ''
            
            html_content += f'''
                            <tr class="pathology-row" data-tags="{tags_str}" data-section="section-{i}">
                                <td class="pathology">{apply_highlights_to_text(pathology.get("Pathologie", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Anamnèse", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Examen Physique", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Procédures/Examens", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Thérapie", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Commentaires", ""))}</td>
                            </tr>'''
        
        html_content += '''
                        </tbody>
                    </table>
                </div>
            </div>
'''
    
    # Fermer le contenu
    html_content += '        </div>\n    </div>\n    \n'
    
    # Ajouter le script (avec le bon nombre de pathologies)
    script_with_count = template_script.replace(
        'let totalPathologies = 37;',
        f'let totalPathologies = {total_pathologies};'
    )
    # Mettre à jour aussi les autres occurrences possibles
    script_with_count = re.sub(
        r'let totalPathologies = \d+;',
        f'let totalPathologies = {total_pathologies};',
        script_with_count
    )
    
    html_content += script_with_count
    
    # Sauvegarder le fichier
    output_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Chirurgie_revisions.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return total_pathologies, len(data['sections'])

if __name__ == "__main__":
    print("🎨 Mise à jour du fichier HTML Chirurgie avec les nouvelles pathologies de traumatologie...")
    print("-" * 50)
    total_pathologies, total_sections = regenerate_chirurgie_html()
    print(f"✅ _ECOS_Chirurgie_revisions.html mis à jour avec succès")
    print(f"   {total_pathologies} pathologies dans {total_sections} sections")
    print("-" * 50)
    print("✨ Mise à jour terminée!")