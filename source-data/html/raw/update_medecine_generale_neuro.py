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
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Douleur|douleur|Fièvre|fièvre|Frissons|frissons|Sueurs|sueurs|Asthénie|asthénie|Anorexie|anorexie|Amaigrissement|amaigrissement|Prurit|prurit|Éruption|éruption|Adénopathie|adénopathie|Hépatomégalie|hépatomégalie|Splénomégalie|splénomégalie|Ictère|ictère|Ascite|ascite|Œdème|œdème|Dyspnée|dyspnée|Toux|toux|Hémoptysie|hémoptysie|Douleur thoracique|Palpitations|palpitations|Malaise|malaise|Vertige|vertige|Céphalée|céphalée|Paralysie|paralysie|Paresthésie|paresthésie|Nausée|nausée|Vomissement|vomissement|Diarrhée|diarrhée|Constipation|constipation|Rectorragie|rectorragie|Méléna|méléna|Hématurie|hématurie|Dysurie|dysurie|Pollakiurie|pollakiurie)\b',
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
            r'\b(ECG|Échographie|échographie|US|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Endoscopie|endoscopie|Coloscopie|coloscopie|Gastroscopie|gastroscopie|FOGD|Biologie|biologie|NFS|CRP|VS|TSH|Glycémie|glycémie|HbA1c|Bilan hépatique|Bilan rénal|Ionogramme|ionogramme|Gazométrie|gazométrie|Hémoculture|hémoculture|ECBU|Sérologie|sérologie|PCR|Prélèvement|prélèvement|Culture|culture|Antibiogramme|antibiogramme|D-dimères|Troponine|troponine|BNP|NT-proBNP|CPK|LDH|Ferritine|ferritine|B12|Folates|folates|PTH|Vitamine D|PSA|Frottis|frottis|Mammographie|mammographie|DMO|EEG|EMG|PL|Ponction lombaire)\b',
            'exam'
        ],
        # Traitements et médicaments
        'treatment': [
            r'\b(Antibiotique|antibiotique|ATB|Amoxicilline|amoxicilline|Augmentin|augmentin|Céphalosporine|céphalosporine|Quinolone|quinolone|Macrolide|macrolide|Pénicilline|pénicilline|Métronidazole|métronidazole|Antiviral|antiviral|Antifongique|antifongique|Corticoïde|corticoïde|Corticostéroïde|corticostéroïde|Prednisone|prednisone|Prednisolone|prednisolone|AINS|Anti-inflammatoire|anti-inflammatoire|Ibuprofène|ibuprofène|Diclofénac|diclofénac|Paracétamol|paracétamol|Doliprane|Dafalgan|Morphine|morphine|Tramadol|tramadol|Codéine|codéine|Antalgique|antalgique|Analgésique|analgésique|Antiémétique|antiémétique|IPP|Oméprazole|oméprazole|Ésoméprazole|ésoméprazole|Lansoprazole|lansoprazole|Anti-H2|Ranitidine|ranitidine|Métoclopramide|métoclopramide|Dompéridone|dompéridone|Laxatif|laxatif|Antispasmodique|antispasmodique|Phloroglucinol|phloroglucinol|Antihistaminique|antihistaminique|Cétirizine|cétirizine|Loratadine|loratadine|Bronchodilatateur|bronchodilatateur|Salbutamol|salbutamol|Ventoline|ventoline|Corticoïde inhalé|Béclométasone|béclométasone|Budésonide|budésonide|Antihypertenseur|antihypertenseur|IEC|ARA2|ARA-2|Bêtabloquant|bêtabloquant|Inhibiteur calcique|Diurétique|diurétique|Furosémide|furosémide|Spironolactone|spironolactone|Hydrochlorothiazide|Antidiabétique|antidiabétique|Metformine|metformine|Insuline|insuline|Sulfamide|sulfamide|DPP-4|GLP-1|SGLT-2|Statine|statine|Simvastatine|simvastatine|Atorvastatine|atorvastatine|Rosuvastatine|rosuvastatine|Fibrate|fibrate|Antiagrégant|antiagrégant|Aspirine|aspirine|Clopidogrel|clopidogrel|Anticoagulant|anticoagulant|AVK|Warfarine|warfarine|AOD|NACO|Rivaroxaban|rivaroxaban|Apixaban|apixaban|Dabigatran|dabigatran|HBPM|Héparine|héparine|Énoxaparine|énoxaparine|Anxiolytique|anxiolytique|Benzodiazépine|benzodiazépine|Alprazolam|alprazolam|Lorazépam|lorazépam|Antidépresseur|antidépresseur|ISRS|IRSN|Sertraline|sertraline|Escitalopram|escitalopram|Venlafaxine|venlafaxine|Neuroleptique|neuroleptique|Antipsychotique|antipsychotique|Rispéridone|rispéridone|Olanzapine|olanzapine|Antiépileptique|antiépileptique|Valproate|valproate|Lamotrigine|lamotrigine|Lévétiracétam|lévétiracétam|Carbamazépine|carbamazépine)\b',
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

def regenerate_medecine_generale_html():
    """Régénère le fichier HTML Médecine Générale complet à partir du JSON mis à jour"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/medecine_generale_ecos.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Compter le nombre total de pathologies
    total_pathologies = sum(len(section.get('data', [])) for section in data['sections'])
    
    # Lire le template Chirurgie
    template_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Chirurgie_revisions.html')
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    # Extraire les parties importantes
    head_end = template_content.find('<div class="content">')
    script_start = template_content.find('<script>')
    
    template_head = template_content[:head_end]
    template_script = template_content[script_start:]
    
    # Remplacer le titre et l'icône
    html_content = template_head
    html_content = html_content.replace('Guide Chirurgie ECOS', 'Guide Médecine Générale ECOS')
    html_content = html_content.replace('🔪 Guide Chirurgie ECOS', '👨‍⚕️ Guide Médecine Générale ECOS')
    html_content = html_content.replace('<span class="pathology-count">37 pathologies</span>', f'<span class="pathology-count">{total_pathologies} pathologies</span>')
    
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
    
    # Mettre à jour les statistiques
    html_content = re.sub(
        r'<div class="stat-number">14</div>\s*<div class="stat-label">Sections</div>',
        f'<div class="stat-number">{len(data["sections"])}</div>\n                <div class="stat-label">Sections</div>',
        html_content
    )
    html_content = re.sub(
        r'<div class="stat-number">37</div>\s*<div class="stat-label">Pathologies</div>',
        f'<div class="stat-number">{total_pathologies}</div>\n                <div class="stat-label">Pathologies</div>',
        html_content
    )
    html_content = re.sub(
        r'<div class="stat-number" id="remainingCount">37</div>',
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
    html_content += script_with_count
    
    # Sauvegarder le fichier
    output_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Médecine_Générale_revisions.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return total_pathologies, len(data['sections'])

if __name__ == "__main__":
    print("🎨 Mise à jour du fichier HTML Médecine Générale avec les nouvelles pathologies neurologiques...")
    print("-" * 50)
    total_pathologies, total_sections = regenerate_medecine_generale_html()
    print(f"✅ _ECOS_Médecine_Générale_revisions.html mis à jour avec succès")
    print(f"   {total_pathologies} pathologies dans {total_sections} sections")
    print("-" * 50)
    print("✨ Mise à jour terminée!")