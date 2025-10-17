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
            r'\b(URGENT|Urgence|urgence|ATTENTION|Attention|Immédiat|immédiat|Rapidement|rapidement|Critique|critique|Vital|vital|Prioritaire|prioritaire|<1h|<4h30|<6h|<24h|Précoce|précoce)\b',
            'urgent'
        ],
        # Warnings et précautions (rouge)
        'warning': [
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère|Léthal|léthal)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Marbrures|marbrures|Oligurie|oligurie|Nystagmus|nystagmus|Paralysie|paralysie|Convulsion|convulsion|Coma|coma|Ictère|ictère|Déshydratation|déshydratation|Tachycardie|tachycardie|Hypotension|hypotension|Hypertension|hypertension|Déficit|déficit|Troubles?\s+(?:conscience|neuro)|Apnée|apnée|Cyanose|cyanose|Détresse|détresse|Tirage|tirage|Polypnée|polypnée|Stridor|stridor|Wheezing|wheezing|Râles|râles|Sibilants|sibilants|Crépitants|crépitants|Score APGAR|APGAR|Fontanelle|fontanelle|Hypotonie|hypotonie|Hypertonie|hypertonie|Réflexe|réflexe)\b',
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
            r'\b(ECG|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Échographie|échographie|US|ETF|EEG|Biopsie|biopsie|Hémoculture|hémoculture|Gazométrie|gazométrie|Bilan|bilan|Troponine|troponine|Lactate|lactate|Glycémie|glycémie|Natrémie|natrémie|Kaliémie|kaliémie|Calcémie|calcémie|ECBU|PL|Ponction lombaire|ponction lombaire|PCR|Test rapide|test rapide|Guthrie|guthrie|Bilirubine|bilirubine|CRP|NFS|VS|Coombs|coombs|Mantoux|mantoux|IGRA|Audiogramme|audiogramme|Vision|vision|Potentiels évoqués|potentiels évoqués)\b',
            'exam'
        ],
        # Traitements spécifiques
        'treatment': [
            r'\b(Antibiotique|antibiotique|ATB|Amoxicilline|amoxicilline|Céfotaxime|céfotaxime|Gentamicine|gentamicine|Pénicilline|pénicilline|Macrolide|macrolide|Azithromycine|azithromycine|Paracétamol|paracétamol|Ibuprofène|ibuprofène|Corticoïde|corticoïde|Prednisolone|prednisolone|Salbutamol|salbutamol|Ventoline|ventoline|Adrénaline|adrénaline|Antipyrétique|antipyrétique|Réhydratation|réhydratation|SRO|Photothérapie|photothérapie|Exsanguino-transfusion|exsanguino-transfusion|Vaccination|vaccination|Vaccin|vaccin|DTP|ROR|BCG|Hépatite|hépatite|Pneumocoque|pneumocoque|Méningocoque|méningocoque|Rotavirus|rotavirus|Varicelle|varicelle|HPV|Vitamine D|vitamine D|Vitamine K|vitamine K|Fer|fer|Supplémentation|supplémentation|Kinésithérapie|kinésithérapie|Orthophonie|orthophonie|Psychomotricité|psychomotricité)\b',
            'treatment'
        ],
        # Ages et développement
        'age': [
            r'\b(\d+\s*(?:mois|ans|semaines|jours|heures))\b|\b(Nouveau-né|nouveau-né|Nourrisson|nourrisson|Enfant|enfant|Adolescent|adolescent|Prématuré|prématuré|À terme|à terme)\b',
            'age-dev'
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

def generate_pediatrie_html():
    """Génère le fichier HTML Pédiatrie à partir du JSON"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/pediatrie_ecos.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Compter le nombre total de pathologies
    total_pathologies = sum(len(section.get('data', [])) for section in data['sections'])
    
    # Lire le template de Médecine Générale pour avoir la même structure
    template_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Médecine_Générale_revisions.html')
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    # Extraire la structure HTML (header, styles, scripts)
    header_end = template_content.find('<div class="content-wrapper">')
    if header_end == -1:
        header_end = template_content.find('<div class="sections-container">')
    
    script_start = template_content.rfind('<script>')
    
    # Construire le HTML
    html_content = template_content[:header_end]
    
    # Remplacer le titre
    html_content = html_content.replace(
        '📚 Révisions ECOS - Médecine Générale',
        '👶 Révisions ECOS - Pédiatrie'
    )
    
    # Ajouter le contenu principal
    html_content += f'''<div class="content-wrapper">
        <h1>👶 Révisions ECOS - Pédiatrie ({total_pathologies} pathologies)</h1>
        
        <!-- Filtres -->
        <div class="filters-container">
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="🔍 Rechercher une pathologie...">
            </div>
            <div class="tags-container">
                <button class="tag-filter" data-tag="urgent">🔥 Urgent</button>
                <button class="tag-filter" data-tag="warning">⚠️ Alertes</button>
                <button class="tag-filter" data-tag="dosage">💊 Dosages</button>
                <button class="tag-filter" data-tag="osce">💡 Tips OSCE</button>
            </div>
            <div class="controls-container">
                <button onclick="expandAll()">📖 Tout déplier</button>
                <button onclick="collapseAll()">📕 Tout replier</button>
                <select id="sectionSelector">
                    <option value="">Toutes les sections</option>'''
    
    # Ajouter les options du sélecteur de sections
    for i, section in enumerate(data['sections'], 1):
        clean_title = re.sub(r'^\d+\.\s*', '', section['title'])
        html_content += f'\n                    <option value="section-{i}">{i}. {clean_title}</option>'
    
    html_content += '''
                </select>
                <button onclick="resetFilters()">🔄 Réinitialiser</button>
            </div>
        </div>
        
        <div class="sections-container">'''
    
    # Générer les sections
    for i, section in enumerate(data['sections'], 1):
        section_title = section['title']
        section_data = section.get('data', [])
        
        # Retirer le numéro du titre s'il existe déjà
        clean_title = re.sub(r'^\d+\.\s*', '', section_title)
        
        html_content += f'''
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
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', 'vital', 'grave', 'sévère', 'précoce', 'rapidement']):
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
            </div>'''
    
    html_content += '''
        </div>
    </div>
    '''
    
    # Ajouter les scripts
    html_content += template_content[script_start:]
    
    # Ajouter le style pour les ages/développement
    age_style = '''
        .age-dev {
            background: linear-gradient(135deg, #f5a623 0%, #f8b84e 100%);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            display: inline-block;
            margin: 0 2px;
        }
    '''
    
    # Insérer le style avant la fermeture de </style>
    style_close_pos = html_content.rfind('</style>')
    if style_close_pos != -1:
        html_content = html_content[:style_close_pos] + age_style + '\n    ' + html_content[style_close_pos:]
    
    # Sauvegarder le fichier
    output_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Pédiatrie_revisions.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Fichier _ECOS_Pédiatrie_revisions.html créé avec succès")
    print(f"   {total_pathologies} pathologies dans {len(data['sections'])} sections")

if __name__ == "__main__":
    print("🎨 Génération du fichier HTML Pédiatrie avec highlights colorés...")
    print("-" * 50)
    generate_pediatrie_html()
    print("-" * 50)
    print("✨ Génération terminée!")