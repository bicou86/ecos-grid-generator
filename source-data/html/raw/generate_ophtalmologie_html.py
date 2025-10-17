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
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère|Léthal|léthal|Cécité|cécité|Irréversible|irréversible)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Photophobie|photophobie|Phosphènes|phosphènes|Scotome|scotome|Diplopie|diplopie|Métamorphopsies|métamorphopsies|Myodésopsies|myodésopsies|Halos|halos|Larmoiement|larmoiement|Prurit|prurit|Exophtalmie|exophtalmie|Énophtalmie|énophtalmie|Ptosis|ptosis|Mydriase|mydriase|Myosis|myosis|Anisocorie|anisocorie|RAPD|Marcus Gunn|Chemosis|chemosis|Hypopion|hypopion|Hypéma|hypéma|Tyndall|tyndall|Flare|flare|Papille|papille|Excavation|excavation|Hémorragie|hémorragie|Exsudat|exsudat|Drusen|drusen|Néovaisseaux|néovaisseaux|Oedème|oedème|Œdème|œdème)\b',
            'clinical-sign'
        ],
        # Points positifs (vert)
        'positive': [
            r'\b(Bénéfique|bénéfique|Favorable|favorable|Bon pronostic|bon pronostic|Efficace|efficace|Succès|succès|Amélioration|amélioration|Guérison|guérison|Résolution|résolution|Normal|normal|Stable|stable|Bénin|bénin|Conservée|conservée|Claire|claire)\b',
            'positive'
        ],
        # Dosages médicamenteux (vert clair)
        'dosage': [
            r'\b(\d+\s*(?:mg|g|mcg|µg|UI|U|mL|L|mmol|mEq|ml|kg|gouttes?|%)(?:/(?:kg|jour|j|h|min|L|dose|prise))?)\b|\b(Posologie|posologie|Dose|dose|IV|PO|IM|SC|Per os|Intraveineux|intramusculaire|sous-cutané|Collyre|collyre|Pommade|pommade|Gel|gel|Topique|topique|Local|local|Instillation|instillation)\b',
            'dosage'
        ],
        # Examens prioritaires (bleu clair)
        'exam': [
            r'\b(Acuité visuelle|AV|Champ visuel|CV|Fond d\'œil|FO|Lampe à fente|LAF|Biomicroscopie|Tonométrie|tonométrie|PIO|OCT|Angiographie|angiographie|Fluorescéine|fluorescéine|ERG|PEV|Échographie|échographie|US|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Biométrie|biométrie|Kératométrie|kératométrie|Pachymétrie|pachymétrie|Gonioscopie|gonioscopie|Test de Schirmer|Schirmer|BUT|Break-up time|Test de Hess|Hess|Lancaster|Test d\'Amsler|Amsler|Vision des couleurs|Ishihara|Prélèvement|prélèvement|Culture|culture)\b',
            'exam'
        ],
        # Traitements spécifiques ophtalmologie
        'treatment': [
            r'\b(Collyre|collyre|Pommade|pommade|Gel|gel|Larmes artificielles|larmes artificielles|Antibiotique|antibiotique|ATB|Corticoïde|corticoïde|Corticostéroïde|corticostéroïde|Anti-VEGF|anti-VEGF|Bêtabloquant|bêtabloquant|Timolol|timolol|Prostaglandine|prostaglandine|Latanoprost|latanoprost|Inhibiteur anhydrase carbonique|Dorzolamide|dorzolamide|Acétazolamide|acétazolamide|Diamox|diamox|Pilocarpine|pilocarpine|Atropine|atropine|Cyclopentolate|cyclopentolate|Tropicamide|tropicamide|Fluoroquinolone|fluoroquinolone|Aminoside|aminoside|Tobramycine|tobramycine|Gentamicine|gentamicine|Ofloxacine|ofloxacine|Ciprofloxacine|ciprofloxacine|Azithromycine|azithromycine|Aciclovir|aciclovir|Ganciclovir|ganciclovir|Antihistaminique|antihistaminique|Cromoglycate|cromoglycate|Lubrifiant|lubrifiant|Ciclosporine|ciclosporine|Tacrolimus|tacrolimus|Bevacizumab|bevacizumab|Ranibizumab|ranibizumab|Aflibercept|aflibercept|Laser|laser|Photocoagulation|photocoagulation|Vitrectomie|vitrectomie|Phacoémulsification|phacoémulsification|Trabéculectomie|trabéculectomie|Sclérectomie|sclérectomie|Iridotomie|iridotomie|Capsulotomie|capsulotomie|Injection intravitréenne|injection intravitréenne|IVT)\b',
            'treatment'
        ],
        # Structures anatomiques oculaires
        'anatomy': [
            r'\b(Cornée|cornée|Conjonctive|conjonctive|Sclère|sclère|Iris|iris|Pupille|pupille|Cristallin|cristallin|Vitré|vitré|Rétine|rétine|Macula|macula|Fovéa|fovéa|Papille|papille|Nerf optique|nerf optique|Choroïde|choroïde|Corps ciliaire|corps ciliaire|Angle iridocornéen|angle iridocornéen|Trabéculum|trabéculum|Canal de Schlemm|Schlemm|Chambre antérieure|chambre antérieure|Chambre postérieure|chambre postérieure|Zonule|zonule|Ora serrata|ora serrata|Épithélium pigmentaire|EPR|Membrane de Bowman|Bowman|Membrane de Descemet|Descemet|Endothélium|endothélium|Limbe|limbe|Paupière|paupière|Cils|cils|Glande de Meibomius|Meibomius|Glande lacrymale|glande lacrymale|Voies lacrymales|voies lacrymales|Orbite|orbite)\b',
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

def generate_ophtalmologie_html():
    """Génère le fichier HTML Ophtalmologie à partir du JSON"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/ophtalmologie_ecos.json')
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
    html_content = html_content.replace('Guide Chirurgie ECOS', 'Guide Ophtalmologie ECOS')
    html_content = html_content.replace('🔪 Guide Chirurgie ECOS', '👁️ Guide Ophtalmologie ECOS')
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
            background: linear-gradient(45deg, #8e44ad, #9b59b6);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
            box-shadow: 0 2px 5px rgba(142, 68, 173, 0.3);
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
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', '<4h30', 'vital', 'grave', 'sévère', 'précoce', 'rapidement', 'brutal']):
                tags.append('urgent')
            if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué', 'mortel', 'léthal', 'cécité', 'irréversible']):
                tags.append('warning')
            if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'collyre', 'pommade', 'gel', 'gouttes', '%']):
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
    output_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Ophtalmologie_revisions.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return total_pathologies, len(data['sections'])

if __name__ == "__main__":
    print("🎨 Génération du fichier HTML Ophtalmologie avec highlights colorés...")
    print("-" * 50)
    total_pathologies, total_sections = generate_ophtalmologie_html()
    print(f"✅ _ECOS_Ophtalmologie_revisions.html créé avec succès")
    print(f"   {total_pathologies} pathologies dans {total_sections} sections")
    print("-" * 50)
    print("✨ Génération terminée!")