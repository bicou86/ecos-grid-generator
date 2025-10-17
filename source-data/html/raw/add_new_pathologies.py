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
            r'\b(URGENT|Urgence|urgence|ATTENTION|Attention|Immédiat|immédiat|Rapidement|rapidement|Critique|critique|Vital|vital|Prioritaire|prioritaire|<1h|<4h30|<6h|<24h)\b',
            'urgent'
        ],
        # Warnings et précautions (rouge)
        'warning': [
            r'\b(Warning|warning|Précaution|précaution|Danger|danger|Risque|risque|Attention|attention|Contre-indiqué|contre-indiqué|Ne pas|Éviter|éviter|Jamais|jamais|Fatal|fatal|Mortel|mortel|Grave|grave|Sévère|sévère)\b',
            'warning'
        ],
        # Signes cliniques (bleu)
        'clinical-sign': [
            r'\b(Signe de|signe de|Symptôme|symptôme|Clinique|clinique|Syndrome|syndrome|Triade|triade|Marbrures|marbrures|Oligurie|oligurie|Nystagmus|nystagmus|Paralysie|paralysie|Convulsion|convulsion|Coma|coma|Ictère|ictère|Déshydratation|déshydratation|Tachycardie|tachycardie|Hypotension|hypotension|Hypertension|hypertension|Déficit|déficit|Troubles?\s+(?:conscience|neuro)|Haleine cétonique|Kussmaul)\b',
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
            r'\b(ECG|IRM|Scanner|scanner|TDM|CT|Radiographie|radiographie|Rx|Échographie|échographie|US|Biopsie|biopsie|Hémoculture|hémoculture|Gazométrie|gazométrie|Bilan|bilan|Troponine|troponine|Lactate|lactate|Glycémie|glycémie|Natrémie|natrémie|Kaliémie|kaliémie|Calcémie|calcémie|NIHSS|COHb|Alcoolémie|alcoolémie|Toxicologie|toxicologie|Osmolarité|osmolarité)\b',
            'exam'
        ],
        # Traitements spécifiques
        'treatment': [
            r'\b(Thrombolyse|thrombolyse|Thrombectomie|thrombectomie|Angioplastie|angioplastie|Dialyse|dialyse|Caisson hyperbare|Réhydratation|réhydratation|Remplissage|remplissage|Insuline|insuline|Aspirine|aspirine|Héparine|héparine|Noradrénaline|noradrénaline|Benzodiazépine|benzodiazépine|Diazépam|diazépam|Flumazénil|flumazénil|Bicarbonate|bicarbonate|Bisphosphonate|bisphosphonate|N-acétylcystéine|NAC|Glucagon|glucagon|Glucose|glucose|NaCl|Calcium|calcium|Potassium|potassium|Vitamine B1|Vit B1|ATB|Antibiotique|antibiotique|Antiépileptique|antiépileptique)\b',
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

def add_pathologies_to_html():
    """Ajoute les nouvelles pathologies au fichier HTML"""
    
    # Lire le fichier JSON pour obtenir les nouvelles pathologies
    json_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/medecine_generale_ecos.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extraire la nouvelle section
    new_section = None
    for section in data['sections']:
        if section['title'] == "Médecine interne et urgences transversales":
            new_section = section
            break
    
    if not new_section:
        print("❌ Section 'Médecine interne et urgences transversales' non trouvée")
        return
    
    # Lire le fichier HTML existant
    html_path = Path('/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Médecine_Générale_revisions.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Créer le HTML pour la nouvelle section
    section_html = f'''
            <div class="section" id="section-15">
                <h2 class="section-title" onclick="toggleSection(this.parentElement)">
                    15. Médecine interne et urgences transversales
                    <span class="section-count">{len(new_section["data"])} pathologies</span>
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
    
    # Ajouter chaque pathologie
    for pathology in new_section['data']:
        # Déterminer les tags
        tags = []
        text_lower = ' '.join(str(v) for v in pathology.values()).lower()
        if any(word in text_lower for word in ['urgent', 'immédiat', '<1h', 'vital', 'grave', 'sévère']):
            tags.append('urgent')
        if any(word in text_lower for word in ['warning', 'attention', 'danger', 'risque', 'contre-indiqué']):
            tags.append('warning')
        if any(word in text_lower for word in ['mg', 'ml', 'posologie', 'dose', 'iv', 'po']):
            tags.append('dosage')
        if 'osce' in text_lower:
            tags.append('osce')
        
        tags_str = ' '.join(tags) if tags else ''
        
        section_html += f'''
                            <tr class="pathology-row" data-tags="{tags_str}" data-section="section-15">
                                <td class="pathology">{apply_highlights_to_text(pathology.get("Pathologie", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Anamnèse", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Examen Physique", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Procédures/Examens", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Thérapie", ""))}</td>
                                <td>{apply_highlights_to_text(pathology.get("Commentaires", ""))}</td>
                            </tr>'''
    
    section_html += '''
                        </tbody>
                    </table>
                </div>
            </div>'''
    
    # Trouver où insérer la nouvelle section (après la dernière section existante)
    # Chercher la fin de la dernière section 14
    last_section_pattern = r'(</div>\s*</div>\s*</div>\s*<script>)'
    match = re.search(last_section_pattern, html_content)
    
    if match:
        # Insérer la nouvelle section avant le script
        html_content = html_content[:match.start()] + section_html + '\n        </div>\n    </div>\n    \n    <script>' + html_content[match.end():]
        
        # Mettre à jour le compteur total de pathologies
        # D'abord compter toutes les pathologies
        total_count = 77 + 14  # 77 existantes + 14 nouvelles
        html_content = re.sub(
            r'<h1>.*?</h1>',
            f'<h1>📚 Révisions ECOS - Médecine Générale ({total_count} pathologies)</h1>',
            html_content
        )
        
        # Sauvegarder le fichier modifié
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ {len(new_section['data'])} nouvelles pathologies ajoutées à _ECOS_Médecine_Générale_revisions.html")
        print(f"   Section: Médecine interne et urgences transversales")
    else:
        print("❌ Impossible de trouver l'endroit où insérer la nouvelle section")

if __name__ == "__main__":
    print("🎨 Ajout des nouvelles pathologies avec highlights colorés...")
    print("-" * 50)
    add_pathologies_to_html()
    print("-" * 50)
    print("✨ Traitement terminé!")