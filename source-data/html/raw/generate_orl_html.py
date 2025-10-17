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
            r'\b(URGENT|Urgence|urgence|ATTENTION|Attention|Immédiat|immédiat|Rapidement|rapidement|Critique|critique|Vital|vital|Prioritaire|prioritaire|<1h|<4h30|<6h|<24h|<120 min|<90 min|Précoce|précoce|brutal|brutale|brutalement|Hospitalisation|hospitalisation)\b',
            'urgent'
        ],
        # Warnings et précautions (rouge)
        'warning': [
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère|Léthal|léthal|Surdité|surdité|Asphyxie|asphyxie|Étouffement|étouffement|Dyspnée|dyspnée|Stridor|stridor|Rupture rate|rupture rate)\b',
            'warning'
        ],
        # Signes cliniques ORL (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Odynophagie|odynophagie|Dysphagie|dysphagie|Dysphonie|dysphonie|Otalgie|otalgie|Otorrhée|otorrhée|Rhinorrhée|rhinorrhée|Épistaxis|épistaxis|Vertiges|vertiges|Acouphènes|acouphènes|Hypoacousie|hypoacousie|Surdité|surdité|Anosmie|anosmie|Hyposmie|hyposmie|Trismus|trismus|Tuméfaction|tuméfaction|Adénopathie|adénopathie|Ganglion|ganglion|Fièvre|fièvre|Frissons|frissons|Asthénie|asthénie|Toux|toux|Ronflement|ronflement|Apnée|apnée|Hypersialorrhée|hypersialorrhée|Écoulement|écoulement|Obstruction nasale|obstruction nasale|Prurit|prurit|Érythème|érythème|Œdème|œdème|Oedème|oedème|Exsudat|exsudat|Enduit|enduit|Vésicule|vésicule|Ulcération|ulcération|Nystagmus|nystagmus|Romberg|romberg|Weber|weber|Rinne|rinne|Dix-Hallpike|dix-hallpike)\b',
            'clinical-sign'
        ],
        # Points positifs (vert)
        'positive': [
            r'\b(Bénéfique|bénéfique|Favorable|favorable|Bon pronostic|bon pronostic|Efficace|efficace|Succès|succès|Amélioration|amélioration|Guérison|guérison|Résolution|résolution|Normal|normal|Stable|stable|Bénin|bénin|Récupération|récupération)\b',
            'positive'
        ],
        # Dosages médicamenteux (vert clair)
        'dosage': [
            r'\b(\d+\s*(?:mg|g|mcg|µg|UI|U|mL|L|mmol|mEq|ml|kg|gouttes?|j|jours|semaines|mois|%)(?:/(?:kg|jour|j|h|min|L|dose|prise))?)\b|\b(Posologie|posologie|Dose|dose|IV|PO|IM|SC|Per os|Intraveineux|intramusculaire|sous-cutané|Spray|spray|Gouttes|gouttes|Inhalation|inhalation|Gargarisme|gargarisme|Bain de bouche|bain de bouche)\b',
            'dosage'
        ],
        # Examens ORL (bleu clair)
        'exam': [
            r'\b(Otoscopie|otoscopie|Rhinoscopie|rhinoscopie|Pharyngoscopie|pharyngoscopie|Laryngoscopie|laryngoscopie|Fibroscopie|fibroscopie|Endoscopie|endoscopie|Audiométrie|audiométrie|Tympanométrie|tympanométrie|Impédancemétrie|impédancemétrie|PEA|Potentiels évoqués auditifs|Test de Weber|Weber|Test de Rinne|Rinne|Test de Dix-Hallpike|Dix-Hallpike|Manœuvre d\'Epley|Epley|Test de Fukuda|Fukuda|Test de Romberg|Romberg|TDR|Test diagnostic rapide|NFS|CRP|VS|Sérologie|sérologie|Prélèvement|prélèvement|Culture|culture|Antibiogramme|antibiogramme|Scanner|scanner|TDM|CT|IRM|Radiographie|radiographie|Rx|Échographie|échographie|US|Scintigraphie|scintigraphie|pH-métrie|pH-métrie|Manométrie|manométrie|Polysomnographie|polysomnographie|EBV|IgM|IgG)\b',
            'exam'
        ],
        # Traitements ORL
        'treatment': [
            r'\b(Antibiotique|antibiotique|ATB|Amoxicilline|amoxicilline|Augmentin|augmentin|Pénicilline|pénicilline|Macrolide|macrolide|Azithromycine|azithromycine|Clarithromycine|clarithromycine|Céphalosporine|céphalosporine|Céfuroxime|céfuroxime|Fluoroquinolone|fluoroquinolone|Ciprofloxacine|ciprofloxacine|Ofloxacine|ofloxacine|Corticoïde|corticoïde|Corticostéroïde|corticostéroïde|Prednisolone|prednisolone|Prednisone|prednisone|Dexaméthasone|dexaméthasone|Bétaméthasone|bétaméthasone|Antihistaminique|antihistaminique|Cétirizine|cétirizine|Loratadine|loratadine|Desloratadine|desloratadine|Décongestionnant|décongestionnant|Vasoconstricteur|vasoconstricteur|Oxymétazoline|oxymétazoline|Xylométazoline|xylométazoline|AINS|Anti-inflammatoire|anti-inflammatoire|Ibuprofène|ibuprofène|Paracétamol|paracétamol|Antalgique|antalgique|Anesthésique|anesthésique|Lidocaïne|lidocaïne|Antifongique|antifongique|Fluconazole|fluconazole|Miconazole|miconazole|Amphotéricine B|amphotéricine B|Antiviral|antiviral|Aciclovir|aciclovir|Valaciclovir|valaciclovir|Antivertigineux|antivertigineux|Bétahistine|bétahistine|Méclizine|méclizine|Anticholinergique|anticholinergique|Scopolamine|scopolamine|Mucolytique|mucolytique|Acétylcystéine|acétylcystéine|Carbocistéine|carbocistéine|Sérum physiologique|sérum physiologique|Lavage nasal|lavage nasal|Drainage|drainage|Chirurgie|chirurgie|Amygdalectomie|amygdalectomie|Adénoïdectomie|adénoïdectomie|Paracentèse|paracentèse|Myringotomie|myringotomie|Aérateur transtympanique|aérateur transtympanique|Diabolo|diabolo|Septoplastie|septoplastie|Turbinectomie|turbinectomie|Polypectomie|polypectomie|FESS|Chirurgie endoscopique|Trachéotomie|trachéotomie|Thyroïdectomie|thyroïdectomie|Radiothérapie|radiothérapie|Chimiothérapie|chimiothérapie)\b',
            'treatment'
        ],
        # Structures anatomiques ORL
        'anatomy': [
            r'\b(Oreille|oreille|Tympan|tympan|Membrane tympanique|membrane tympanique|Conduit auditif|conduit auditif|Pavillon|pavillon|Oreille moyenne|oreille moyenne|Oreille interne|oreille interne|Cochlée|cochlée|Vestibule|vestibule|Canaux semi-circulaires|canaux semi-circulaires|Trompe d\'Eustache|trompe d\'Eustache|Mastoïde|mastoïde|Osselets|osselets|Marteau|marteau|Enclume|enclume|Étrier|étrier|Fenêtre ovale|fenêtre ovale|Fenêtre ronde|fenêtre ronde|Nez|nez|Fosses nasales|fosses nasales|Sinus|sinus|Sinus maxillaire|sinus maxillaire|Sinus frontal|sinus frontal|Sinus ethmoïdal|sinus ethmoïdal|Sinus sphénoïdal|sinus sphénoïdal|Cornets|cornets|Cloison nasale|cloison nasale|Septum|septum|Choanes|choanes|Pharynx|pharynx|Nasopharynx|nasopharynx|Oropharynx|oropharynx|Hypopharynx|hypopharynx|Amygdales|amygdales|Amygdale palatine|amygdale palatine|Amygdale pharyngée|amygdale pharyngée|Végétations|végétations|Adénoïdes|adénoïdes|Uvule|uvule|Luette|luette|Voile du palais|voile du palais|Palais|palais|Langue|langue|Base de langue|base de langue|Épiglotte|épiglotte|Larynx|larynx|Cordes vocales|cordes vocales|Glotte|glotte|Sous-glotte|sous-glotte|Cartilage thyroïde|cartilage thyroïde|Cartilage cricoïde|cartilage cricoïde|Cartilage aryténoïde|cartilage aryténoïde|Trachée|trachée|Œsophage|œsophage|Glandes salivaires|glandes salivaires|Parotide|parotide|Sous-maxillaire|sous-maxillaire|Sublinguale|sublinguale|Thyroïde|thyroïde|Parathyroïde|parathyroïde|Ganglions lymphatiques|ganglions lymphatiques|Cou|cou)\b',
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

def generate_orl_html():
    """Génère le fichier HTML ORL à partir du JSON"""
    
    # Lire le fichier JSON
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/orl_ecos.json')
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
    html_content = html_content.replace('Guide Chirurgie ECOS', 'Guide ORL ECOS')
    html_content = html_content.replace('🔪 Guide Chirurgie ECOS', '👂 Guide ORL ECOS')
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
    
    # Ajouter le style pour l'anatomie ORL
    anatomy_style = '''
        .anatomy {
            background: linear-gradient(45deg, #16a085, #1abc9c);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
            box-shadow: 0 2px 5px rgba(22, 160, 133, 0.3);
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
            if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', '<4h30', 'vital', 'grave', 'sévère', 'précoce', 'rapidement', 'brutal', 'hospitalisation']):
                tags.append('urgent')
            if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué', 'mortel', 'léthal', 'surdité', 'asphyxie', 'étouffement', 'dyspnée', 'rupture rate']):
                tags.append('warning')
            if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'spray', 'gouttes', 'gargarisme', 'bain de bouche', 'j', 'jours', 'semaines', '%']):
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
    output_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_ORL_revisions.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return total_pathologies, len(data['sections'])

if __name__ == "__main__":
    print("🎨 Génération du fichier HTML ORL avec highlights colorés...")
    print("-" * 50)
    total_pathologies, total_sections = generate_orl_html()
    print(f"✅ _ECOS_ORL_revisions.html créé avec succès")
    print(f"   {total_pathologies} pathologies dans {total_sections} sections")
    print("-" * 50)
    print("✨ Génération terminée!")