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
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère|Léthal|léthal|Hémorragie|hémorragie|Éclampsie|éclampsie|HELLP|GEU|Torsion|torsion)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Métrorragie|métrorragie|Ménorragie|ménorragie|Aménorrhée|aménorrhée|Dysménorrhée|dysménorrhée|Leucorrhée|leucorrhée|Dyspareunie|dyspareunie|Contractions|contractions|Col dilaté|col dilaté|Effacement|effacement|Présentation|présentation|BCF|Bruits du cœur fœtal|Mouvements fœtaux|mouvements fœtaux|Phosphènes|phosphènes|Céphalées|céphalées|Œdème|œdème|Protéinurie|protéinurie|HTA|hypertension|Ascite|ascite|Galactorrhée|galactorrhée|Hirsutisme|hirsutisme|Acanthosis nigricans|Bouffées de chaleur|bouffées de chaleur)\b',
            'clinical-sign'
        ],
        # Points positifs (vert)
        'positive': [
            r'\b(Bénéfique|bénéfique|Favorable|favorable|Bon pronostic|bon pronostic|Efficace|efficace|Succès|succès|Amélioration|amélioration|Guérison|guérison|Résolution|résolution|Normal|normal|Stable|stable|Bénin|bénin|Conservée|conservée|Claire|claire)\b',
            'positive'
        ],
        # Dosages médicamenteux (vert clair)
        'dosage': [
            r'\b(\d+\s*(?:mg|g|mcg|µg|UI|U|mL|L|mmol|mEq|ml|kg|SA|%)(?:/(?:kg|jour|j|h|min|L|dose|prise))?)|\b(Posologie|posologie|Dose|dose|IV|PO|IM|SC|Per os|Intraveineux|intramusculaire|sous-cutané|Mifépristone|mifépristone|Misoprostol|misoprostol|Ocytocine|ocytocine|Clomifène|clomifène|Metformine|metformine|Progestérone|progestérone|Estrogène|estrogène|Contraceptif|contraceptif|Pilule|pilule|DIU|Stérilet|stérilet|Implant|implant)\b',
            'dosage'
        ],
        # Examens prioritaires (bleu clair)
        'exam': [
            r'\b(β-hCG|hCG|Test grossesse|Échographie|échographie|US|Doppler|doppler|Monitoring fœtal|monitoring|CTG|Tocographie|tocographie|Hystéroscopie|hystéroscopie|Colposcopie|colposcopie|Hystérosalpingographie|HSG|Frottis|frottis|PAP|HPV|CA-125|CA125|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Mammographie|mammographie|Biopsie|biopsie|Laparoscopie|laparoscopie|Cœlioscopie|cœlioscopie|TV|Toucher vaginal|Spéculum|spéculum|Manœuvres de Léopold|HGPO|DMO|Caryotype|caryotype|FSH|LH|Prolactine|prolactine|TSH|Estradiol|estradiol|Progestérone|Testostérone|testostérone|AMH)\b',
            'exam'
        ],
        # Traitements spécifiques gynécologie-obstétrique
        'treatment': [
            r'\b(Césarienne|césarienne|Accouchement|accouchement|Episiotomie|épisiotomie|Forceps|forceps|Ventouse|ventouse|Curetage|curetage|Aspiration|aspiration|Conisation|conisation|Hystérectomie|hystérectomie|Annexectomie|annexectomie|Salpingectomie|salpingectomie|Myomectomie|myomectomie|Cœlioscopie|cœlioscopie|Laparoscopie|laparoscopie|Vulvectomie|vulvectomie|Mastectomie|mastectomie|Tumorectomie|tumorectomie|Radio-chimiothérapie|Radiothérapie|radiothérapie|Chimiothérapie|chimiothérapie|Hormonothérapie|hormonothérapie|Tocolyse|tocolyse|Corticothérapie anténatale|Sulfate de magnésium|Antibioprophylaxie|antibioprophylaxie|Prophylaxie anti-D|Anti-D|Acide folique|acide folique|Fer|fer|Calcium|calcium|Vitamine D|vitamine D)\b',
            'treatment'
        ],
        # Structures anatomiques gynéco-obstétricales
        'anatomy': [
            r'\b(Utérus|utérus|Col|col|Corps utérin|corps utérin|Endomètre|endomètre|Myomètre|myomètre|Paramètres|paramètres|Ovaires|ovaires|Trompes|trompes|Annexes|annexes|Vagin|vagin|Vulve|vulve|Périnée|périnée|Sein|sein|Mamelon|mamelon|Aréole|aréole|Glande mammaire|glande mammaire|Placenta|placenta|Cordon ombilical|cordon|Liquide amniotique|LA|Membranes|membranes|Fœtus|fœtus|Pelvis|pelvis|Détroit supérieur|détroit supérieur|Détroit moyen|détroit moyen|Détroit inférieur|détroit inférieur|Cul-de-sac de Douglas|Douglas|Ligaments utérins|ligaments|Artères utérines|artères utérines|Bartholinite|Glandes de Bartholin|Bartholin)\b',
            'anatomy'
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

def generate_gynecologie_html():
    """Génère le fichier HTML Gynécologie à partir du JSON"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/gynecologie_ecos.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Compter le nombre total de pathologies
    total_pathologies = sum(len(section.get('data', [])) for section in data['sections'])
    
    # Lire le template
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
    html_content = html_content.replace('Guide Chirurgie ECOS', 'Guide Gynécologie-Obstétrique ECOS')
    html_content = html_content.replace('🔪 Guide Chirurgie ECOS', '🤰 Guide Gynécologie-Obstétrique ECOS')
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
    
    # Ajouter le style pour l'anatomie
    anatomy_style = '''
        .anatomy {
            background: linear-gradient(45deg, #e91e63, #ec407a);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
            box-shadow: 0 2px 5px rgba(233, 30, 99, 0.3);
        }
    '''
    
    # Insérer le style avant </style>
    style_close_pos = html_content.rfind('</style>')
    if style_close_pos != -1:
        html_content = html_content[:style_close_pos] + anatomy_style + '\n    ' + html_content[style_close_pos:]
    
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
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', '<4h30', 'vital', 'grave', 'sévère', 'précoce', 'rapidement', 'brutal', 'geu', 'éclampsie', 'hellp']):
                tags.append('urgent')
            if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué', 'mortel', 'léthal', 'hémorragie', 'torsion']):
                tags.append('warning')
            if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'sa', 'pilule', 'diu', 'stérilet', '%']):
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
    output_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Gynécologie_revisions.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return total_pathologies, len(data['sections'])

if __name__ == "__main__":
    print("🎨 Génération du fichier HTML Gynécologie avec highlights colorés...")
    print("-" * 50)
    total_pathologies, total_sections = generate_gynecologie_html()
    print(f"✅ _ECOS_Gynécologie_revisions.html créé avec succès")
    print(f"   {total_pathologies} pathologies dans {total_sections} sections")
    print("-" * 50)
    print("✨ Génération terminée!")