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
            r'\b(URGENT|Urgence|urgence|ATTENTION|Attention|Immédiat|immédiat|Rapidement|rapidement|Critique|critique|Vital|vital|Prioritaire|prioritaire|<1h|<4h30|<6h|<24h|<120 min|<90 min)\b',
            'urgent'
        ],
        # Warnings et précautions (rouge)
        'warning': [
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Marbrures|marbrures|Oligurie|oligurie|Nystagmus|nystagmus|Paralysie|paralysie|Convulsion|convulsion|Coma|coma|Ictère|ictère|Déshydratation|déshydratation|Tachycardie|tachycardie|Hypotension|hypotension|Hypertension|hypertension|Déficit|déficit|Troubles?\s+(?:conscience|neuro)|Haleine cétonique|Kussmaul|Myorelaxation|Hypotonie)\b',
            'clinical-sign'
        ],
        # Points positifs (vert)
        'positive': [
            r'\b(Bénéfique|bénéfique|Favorable|favorable|Bon pronostic|bon pronostic|Efficace|efficace|Succès|succès|Amélioration|amélioration|Guérison|guérison|Résolution|résolution|Normal|normal|Stable|stable)\b',
            'positive'
        ],
        # Dosages médicamenteux (vert clair)
        'dosage': [
            r'\b(\d+\s*(?:mg|g|mcg|µg|UI|U|mL|L|mmol|mEq)(?:/(?:kg|jour|j|h|min|L))?)\b|\b(Posologie|posologie|Dose|dose|IV|PO|IM|SC|Per os|Intraveineux|intramusculaire|sous-cutané)\b',
            'dosage'
        ],
        # Examens prioritaires (bleu clair)
        'exam': [
            r'\b(ECG|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Échographie|échographie|US|Biopsie|biopsie|Hémoculture|hémoculture|Gazométrie|gazométrie|Bilan|bilan|Troponine|troponine|Lactate|lactate|Glycémie|glycémie|Natrémie|natrémie|Kaliémie|kaliémie|Calcémie|calcémie|NIHSS|COHb|Alcoolémie|alcoolémie|Toxicologie|toxicologie|Osmolarité|osmolarité|Carboxyhémoglobine|Ionogramme|ionogramme)\b',
            'exam'
        ],
        # Traitements spécifiques
        'treatment': [
            r'\b(Thrombolyse|thrombolyse|Thrombectomie|thrombectomie|Angioplastie|angioplastie|Dialyse|dialyse|Caisson hyperbare|Réhydratation|réhydratation|Remplissage|remplissage|Insuline|insuline|Aspirine|aspirine|Héparine|héparine|Noradrénaline|noradrénaline|Benzodiazépine|benzodiazépine|Diazépam|diazépam|Flumazénil|flumazénil|Bicarbonate|bicarbonate|Bisphosphonate|bisphosphonate|N-acétylcystéine|NAC|Glucagon|glucagon|Glucose|glucose|NaCl|Calcium|calcium|Potassium|potassium|Vitamine B1|Vit B1|ATB|Antibiotique|antibiotique|Antiépileptique|antiépileptique|Oxygénothérapie|Coronarographie|coronarographie|Phénytoïne|phénytoïne|Valproate|valproate|Levetiracetam|levetiracetam|Midazolam|midazolam|Zolédronate|zolédronate|Calcitonine|calcitonine)\b',
            'treatment'
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

def regenerate_html_from_json():
    """Régénère le fichier HTML à partir du JSON mis à jour"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/medecine_generale_ecos.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Lire le fichier HTML existant
    html_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Médecine_Générale_revisions.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # D'abord, supprimer la section 15 si elle existe
    section_15_pattern = r'<div class="section" id="section-15">.*?</div>\s*</div>\s*(?=<div class="section"|</div>\s*</div>\s*<script>)'
    html_content = re.sub(section_15_pattern, '', html_content, flags=re.DOTALL)
    
    # Compter le nombre total de pathologies
    total_pathologies = sum(len(section.get('data', [])) for section in data['sections'])
    
    # Mettre à jour le titre avec le nouveau total
    html_content = re.sub(
        r'<h1>.*?</h1>',
        f'<h1>📚 Révisions ECOS - Médecine Générale ({total_pathologies} pathologies)</h1>',
        html_content
    )
    
    # Générer le nouveau contenu des sections
    sections_html = ""
    for i, section in enumerate(data['sections'], 1):
        section_title = section['title']
        section_data = section.get('data', [])
        
        # Retirer le numéro du titre s'il existe déjà
        clean_title = re.sub(r'^\d+\.\s*', '', section_title)
        
        sections_html += f'''
            <div class="section" id="section-{i}">
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
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', '<4h30', 'vital', 'grave', 'sévère']):
                tags.append('urgent')
            if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué']):
                tags.append('warning')
            if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'iv', 'po']):
                tags.append('dosage')
            if 'osce' in text_lower:
                tags.append('osce')
            
            tags_str = ' '.join(tags) if tags else ''
            
            sections_html += f'''
                            <tr class="pathology-row" data-tags="{tags_str}" data-section="section-{i}">
                                <td class="pathology">{apply_highlights_to_text(pathology.get("Pathologie", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Anamnèse", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Examen Physique", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Procédures/Examens", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Thérapie", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Commentaires", ""))}</td>
                            </tr>'''
        
        sections_html += '''
                        </tbody>
                    </table>
                </div>
            </div>'''
    
    # Remplacer tout le contenu des sections
    # Trouver le début et la fin du contenu des sections
    sections_start = html_content.find('<div class="sections-container">')
    if sections_start == -1:
        sections_start = html_content.find('<div class="content-wrapper">') + len('<div class="content-wrapper">')
    else:
        sections_start = sections_start + len('<div class="sections-container">')
    
    sections_end = html_content.find('</div>\n    </div>\n    \n    <script>')
    if sections_end == -1:
        sections_end = html_content.find('</div>\n    </div>\n    <script>')
    
    # Reconstruire le HTML
    html_content = html_content[:sections_start] + '\n' + sections_html + '\n        ' + html_content[sections_end:]
    
    # Sauvegarder le fichier mis à jour
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Fichier HTML mis à jour avec {total_pathologies} pathologies")
    print(f"   Réorganisées dans {len(data['sections'])} sections")

if __name__ == "__main__":
    print("🔄 Mise à jour du fichier HTML depuis le JSON...")
    print("-" * 50)
    regenerate_html_from_json()
    print("-" * 50)
    print("✨ Mise à jour terminée!")