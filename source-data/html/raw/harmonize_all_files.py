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
            r'\b(URGENT|Urgence|urgence|ATTENTION|Attention|Immédiat|immédiat|Rapidement|rapidement|Critique|critique|Vital|vital|Prioritaire|prioritaire|<1h|<4h30|<6h|<24h|<120 min|<90 min|Précoce|précoce)\b',
            'urgent'
        ],
        # Warnings et précautions (rouge)
        'warning': [
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère|Léthal|léthal)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Marbrures|marbrures|Oligurie|oligurie|Nystagmus|nystagmus|Paralysie|paralysie|Convulsion|convulsion|Coma|coma|Ictère|ictère|Déshydratation|déshydratation|Tachycardie|tachycardie|Hypotension|hypotension|Hypertension|hypertension|Déficit|déficit|Troubles?\s+(?:conscience|neuro)|Haleine cétonique|Kussmaul|Myorelaxation|Hypotonie|Apnée|apnée|Cyanose|cyanose|Détresse|détresse|Tirage|tirage|Polypnée|polypnée|Stridor|stridor|Wheezing|wheezing|Râles|râles|Sibilants|sibilants|Crépitants|crépitants|Score APGAR|APGAR|Fontanelle|fontanelle|Hypotonie|hypotonie|Hypertonie|hypertonie|Réflexe|réflexe)\b',
            'clinical-sign'
        ],
        # Points positifs (vert)
        'positive': [
            r'\b(Bénéfique|bénéfique|Favorable|favorable|Bon pronostic|bon pronostic|Efficace|efficace|Succès|succès|Amélioration|amélioration|Guérison|guérison|Résolution|résolution|Normal|normal|Stable|stable|Bénin|bénin)\b',
            'positive'
        ],
        # Dosages médicamenteux (vert clair)
        'dosage': [
            r'\b(\d+\s*(?:mg|g|mcg|µg|UI|U|mL|L|mmol|mEq|ml|kg|gouttes?)(?:/(?:kg|jour|j|h|min|L|dose|prise))?)\b|\b(Posologie|posologie|Dose|dose|IV|PO|IM|SC|Per os|Intraveineux|intramusculaire|sous-cutané|Inhalation|inhalation|Nébulisation|nébulisation)\b',
            'dosage'
        ],
        # Examens prioritaires (bleu clair)
        'exam': [
            r'\b(ECG|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Échographie|échographie|US|ETF|EEG|Biopsie|biopsie|Hémoculture|hémoculture|Gazométrie|gazométrie|Bilan|bilan|Troponine|troponine|Lactate|lactate|Glycémie|glycémie|Natrémie|natrémie|Kaliémie|kaliémie|Calcémie|calcémie|ECBU|PL|Ponction lombaire|ponction lombaire|PCR|Test rapide|test rapide|Guthrie|guthrie|Bilirubine|bilirubine|CRP|NFS|VS|Coombs|coombs|Mantoux|mantoux|IGRA|Audiogramme|audiogramme|Vision|vision|Potentiels évoqués|potentiels évoqués|Ionogramme|ionogramme|Carboxyhémoglobine|COHb|Alcoolémie|alcoolémie|Toxicologie|toxicologie|Osmolarité|osmolarité|NIHSS)\b',
            'exam'
        ],
        # Traitements spécifiques
        'treatment': [
            r'\b(Thrombolyse|thrombolyse|Thrombectomie|thrombectomie|Angioplastie|angioplastie|Dialyse|dialyse|Caisson hyperbare|Réhydratation|réhydratation|Remplissage|remplissage|Insuline|insuline|Aspirine|aspirine|Héparine|héparine|Noradrénaline|noradrénaline|Benzodiazépine|benzodiazépine|Diazépam|diazépam|Flumazénil|flumazénil|Bicarbonate|bicarbonate|Bisphosphonate|bisphosphonate|N-acétylcystéine|NAC|Glucagon|glucagon|Glucose|glucose|NaCl|Calcium|calcium|Potassium|potassium|Vitamine B1|Vit B1|ATB|Antibiotique|antibiotique|Antiépileptique|antiépileptique|Oxygénothérapie|Coronarographie|coronarographie|Phénytoïne|phénytoïne|Valproate|valproate|Levetiracetam|levetiracetam|Midazolam|midazolam|Zolédronate|zolédronate|Calcitonine|calcitonine|Antibiotique|antibiotique|ATB|Amoxicilline|amoxicilline|Céfotaxime|céfotaxime|Gentamicine|gentamicine|Pénicilline|pénicilline|Macrolide|macrolide|Azithromycine|azithromycine|Paracétamol|paracétamol|Ibuprofène|ibuprofène|Corticoïde|corticoïde|Prednisolone|prednisolone|Salbutamol|salbutamol|Ventoline|ventoline|Adrénaline|adrénaline|Antipyrétique|antipyrétique|SRO|Photothérapie|photothérapie|Exsanguino-transfusion|exsanguino-transfusion|Vaccination|vaccination|Vaccin|vaccin|DTP|ROR|BCG|Hépatite|hépatite|Pneumocoque|pneumocoque|Méningocoque|méningocoque|Rotavirus|rotavirus|Varicelle|varicelle|HPV|Vitamine D|vitamine D|Vitamine K|vitamine K|Fer|fer|Supplémentation|supplémentation|Kinésithérapie|kinésithérapie|Orthophonie|orthophonie|Psychomotricité|psychomotricité)\b',
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

def read_template():
    """Lit le fichier template (Chirurgie) pour récupérer la structure complète"""
    template_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Chirurgie_revisions.html')
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire les parties importantes
    head_end = content.find('<div class="content">')
    script_start = content.find('<script>')
    
    template_head = content[:head_end]
    template_script = content[script_start:]
    
    return template_head, template_script

def generate_harmonized_html(json_file, output_file, title, icon):
    """Génère un fichier HTML harmonisé à partir d'un fichier JSON"""
    
    # Lire le fichier JSON
    json_path = Path(f'/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/{json_file}')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Compter le nombre total de pathologies
    total_pathologies = sum(len(section.get('data', [])) for section in data['sections'])
    
    # Récupérer le template
    template_head, template_script = read_template()
    
    # Remplacer le titre et l'icône
    html_content = template_head
    html_content = html_content.replace('Guide Chirurgie ECOS', f'Guide {title} ECOS')
    html_content = html_content.replace('🔪 Guide Chirurgie ECOS', f'{icon} Guide {title} ECOS')
    html_content = html_content.replace('<span class="pathology-count">37 pathologies</span>', f'<span class="pathology-count">{total_pathologies} pathologies</span>')
    
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
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', '<4h30', 'vital', 'grave', 'sévère', 'précoce', 'rapidement']):
                tags.append('urgent')
            if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué', 'mortel', 'léthal']):
                tags.append('warning')
            if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'iv', 'po', '/kg', 'gouttes']):
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
    html_content += script_with_count
    
    # Sauvegarder le fichier
    output_path = Path(f'/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/{output_file}')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return total_pathologies, len(data['sections'])

def main():
    """Harmonise tous les fichiers HTML"""
    
    files_to_harmonize = [
        ('pediatrie_ecos.json', '_ECOS_Pédiatrie_revisions.html', 'Pédiatrie', '👶'),
        ('medecine_generale_ecos.json', '_ECOS_Médecine_Générale_revisions.html', 'Médecine Générale', '📚')
    ]
    
    for json_file, output_file, title, icon in files_to_harmonize:
        print(f"🔄 Traitement de {title}...")
        total_pathologies, total_sections = generate_harmonized_html(json_file, output_file, title, icon)
        print(f"   ✅ {output_file} créé")
        print(f"      {total_pathologies} pathologies dans {total_sections} sections")
    
    print("-" * 50)
    print("✨ Harmonisation terminée!")
    print("   Tous les fichiers ont maintenant la même structure que Chirurgie")

if __name__ == "__main__":
    print("🎨 Harmonisation des fichiers HTML avec la structure de Chirurgie...")
    print("-" * 50)
    main()