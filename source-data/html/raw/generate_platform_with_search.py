#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import json
from pathlib import Path
from collections import defaultdict
import html
from bs4 import BeautifulSoup

def extract_case_content(file_path):
    """Extraire le contenu textuel d'un fichier HTML de cas"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Extraire le titre
            title_elem = soup.find('h1') or soup.find('h2')
            title = title_elem.get_text(strip=True) if title_elem else ""
            
            # Extraire le contexte
            context = ""
            context_elem = soup.find('div', class_='context-info')
            if context_elem:
                context = context_elem.get_text(' ', strip=True)
            
            # Extraire les critères d'évaluation
            criteria = []
            for criterion in soup.find_all(['div', 'td'], class_=re.compile('criterion|criteria')):
                text = criterion.get_text(' ', strip=True)
                if text and len(text) > 3:
                    criteria.append(text)
            
            # Extraire tout le texte pour la recherche full-text
            # Retirer les scripts et styles
            for script in soup(['script', 'style']):
                script.decompose()
            
            full_text = soup.get_text(' ', strip=True)
            
            # Extraire des mots-clés
            keywords = set()
            
            # Mots-clés médicaux courants
            medical_terms = [
                'douleur', 'thoracique', 'abdominale', 'céphalée', 'fièvre', 'toux',
                'dyspnée', 'fatigue', 'nausée', 'vomissement', 'diarrhée', 'constipation',
                'palpitations', 'syncope', 'vertiges', 'éruption', 'prurit', 'oedème',
                'hématurie', 'dysurie', 'lombalgie', 'diabète', 'hypertension',
                'asthme', 'pneumonie', 'infarctus', 'AVC', 'épilepsie', 'migraine',
                'anxiété', 'dépression', 'grossesse', 'pédiatrie', 'urgence',
                'ECG', 'scanner', 'IRM', 'radiographie', 'échographie', 'biologie'
            ]
            
            # Chercher les termes médicaux dans le texte
            text_lower = full_text.lower()
            for term in medical_terms:
                if term in text_lower:
                    keywords.add(term)
            
            # Extraire l'âge et le sexe
            age_match = re.search(r'(\d+)\s*ans', title + ' ' + context)
            if age_match:
                keywords.add(f"{age_match.group(1)} ans")
                age = int(age_match.group(1))
                if age < 18:
                    keywords.add('pédiatrie')
                elif age > 65:
                    keywords.add('gériatrie')
            
            if 'homme' in text_lower:
                keywords.add('homme')
            if 'femme' in text_lower:
                keywords.add('femme')
            if 'enfant' in text_lower or 'garçon' in text_lower or 'fille' in text_lower:
                keywords.add('pédiatrie')
            
            return {
                'title': title,
                'context': context,
                'criteria': ' '.join(criteria),
                'full_text': full_text[:5000],  # Limiter pour ne pas surcharger
                'keywords': list(keywords)
            }
    except Exception as e:
        print(f"Erreur lors de l'extraction de {file_path}: {e}")
        return {
            'title': os.path.basename(file_path).replace('.html', ''),
            'context': '',
            'criteria': '',
            'full_text': '',
            'keywords': []
        }

def extract_case_info(file_path):
    """Extraire les informations d'un cas depuis son nom de fichier"""
    filename = os.path.basename(file_path)
    
    # Nettoyer le nom du fichier
    filename = filename.replace(' - Grille ECOS.html', '')
    
    # Déterminer la catégorie
    parent_dir = os.path.basename(os.path.dirname(file_path))
    
    # Mapping des catégories
    category = parent_dir
    title = filename
    
    return {
        'path': file_path,
        'filename': os.path.basename(file_path),
        'title': title,
        'category': category
    }

def generate_html_platform(cases_by_category, search_data):
    """Générer le HTML de la plateforme complète avec recherche avancée"""
    
    total_cases = sum(len(cases) for cases in cases_by_category.values())
    
    # Créer le JSON des données de recherche
    search_json = json.dumps(search_data, ensure_ascii=False)
    
    html_content = '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📚 ECOS - Plateforme de Révisions Complète ({} cas)</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        :root {{
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1600px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        header {{
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--card-shadow);
        }}
        
        .header-content {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }}
        
        h1 {{
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5em;
            font-weight: 800;
        }}
        
        .stats-container {{
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }}
        
        .stat-item {{
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        
        .stat-value {{
            font-size: 2em;
            font-weight: bold;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .stat-label {{
            color: #7f8c8d;
            font-size: 0.9em;
        }}
        
        .controls {{
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: var(--card-shadow);
        }}
        
        .search-container {{
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            align-items: center;
        }}
        
        .search-box {{
            flex: 1;
            position: relative;
        }}
        
        .search-box input {{
            width: 100%;
            padding: 12px 20px 12px 45px;
            border: 2px solid #e0e0e0;
            border-radius: 30px;
            font-size: 16px;
            transition: all 0.3s;
        }}
        
        .search-box input:focus {{
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }}
        
        .search-icon {{
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }}
        
        .search-options {{
            display: flex;
            gap: 15px;
            align-items: center;
        }}
        
        .search-mode {{
            display: flex;
            gap: 10px;
            align-items: center;
            background: #f8f9fa;
            padding: 8px 15px;
            border-radius: 20px;
        }}
        
        .search-mode label {{
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.9em;
        }}
        
        .search-mode input[type="radio"] {{
            cursor: pointer;
        }}
        
        .search-results-info {{
            padding: 10px 15px;
            background: #f0f4ff;
            border-radius: 10px;
            color: #667eea;
            font-size: 0.9em;
            margin-bottom: 15px;
            display: none;
        }}
        
        .search-results-info.active {{
            display: block;
        }}
        
        .filter-buttons {{
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }}
        
        .filter-btn {{
            padding: 10px 20px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }}
        
        .filter-btn:hover {{
            border-color: #667eea;
            color: #667eea;
        }}
        
        .filter-btn.active {{
            background: var(--primary-gradient);
            color: white;
            border-color: transparent;
        }}
        
        .categories-grid {{
            display: grid;
            gap: 30px;
        }}
        
        .category-section {{
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: var(--card-shadow);
        }}
        
        .category-section.hidden {{
            display: none;
        }}
        
        .category-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }}
        
        .category-title {{
            font-size: 1.5em;
            font-weight: 700;
            color: #2c3e50;
        }}
        
        .category-count {{
            background: var(--primary-gradient);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: 600;
        }}
        
        .cases-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
        }}
        
        .case-card {{
            background: #f8f9fa;
            border-radius: 12px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
        }}
        
        .case-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-color: #667eea;
        }}
        
        .case-card.completed {{
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border-color: #4caf50;
        }}
        
        .case-card.completed::after {{
            content: '✓';
            position: absolute;
            top: 10px;
            right: 10px;
            background: #4caf50;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }}
        
        .case-card.hidden {{
            display: none;
        }}
        
        .case-card.search-match {{
            border-color: #ffd700;
            background: linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%);
        }}
        
        .case-title {{
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 0.95em;
            line-height: 1.4;
        }}
        
        .case-meta {{
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }}
        
        .case-tag {{
            font-size: 0.75em;
            padding: 3px 8px;
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border-radius: 5px;
        }}
        
        .toggle-all {{
            padding: 8px 16px;
            background: var(--secondary-gradient);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
        }}
        
        .toggle-all:hover {{
            transform: scale(1.05);
        }}
        
        .progress-bar {{
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 20px;
        }}
        
        .progress-fill {{
            height: 100%;
            background: var(--success-gradient);
            transition: width 0.5s ease;
        }}
        
        .footer {{
            text-align: center;
            padding: 40px 20px;
            color: white;
            margin-top: 50px;
        }}
        
        .highlight {{
            background-color: #ffeb3b;
            padding: 2px 4px;
            border-radius: 3px;
        }}
        
        @media (max-width: 768px) {{
            .cases-grid {{
                grid-template-columns: 1fr;
            }}
            
            h1 {{
                font-size: 1.8em;
            }}
            
            .search-container {{
                flex-direction: column;
            }}
            
            .search-options {{
                width: 100%;
                justify-content: space-between;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <div>
                    <h1>📚 Plateforme ECOS - Révisions</h1>
                    <p style="color: #7f8c8d; margin-top: 10px;">Système complet de préparation aux examens cliniques</p>
                </div>
                <div class="stats-container">
                    <div class="stat-item">
                        <div class="stat-value">{}</div>
                        <div class="stat-label">Cas disponibles</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="completedCount">0</div>
                        <div class="stat-label">Cas complétés</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="progressPercent">0%</div>
                        <div class="stat-label">Progression</div>
                    </div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressBar" style="width: 0%"></div>
            </div>
        </header>
        
        <div class="controls">
            <div class="search-container">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="searchInput" placeholder="Rechercher (ex: douleur thoracique, ECG, pédiatrie...)" onkeyup="performSearch()">
                </div>
                <div class="search-options">
                    <div class="search-mode">
                        <label>
                            <input type="radio" name="searchMode" value="full" checked onchange="performSearch()">
                            <span>Recherche complète</span>
                        </label>
                        <label>
                            <input type="radio" name="searchMode" value="title" onchange="performSearch()">
                            <span>Titres uniquement</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="search-results-info" id="searchResultsInfo"></div>
            
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterByCategory('all')">Tous</button>
'''.format(total_cases, total_cases)
    
    # Ajouter les boutons de filtre pour chaque catégorie
    for category in sorted(cases_by_category.keys()):
        count = len(cases_by_category[category])
        html_content += f'                <button class="filter-btn" onclick="filterByCategory(\'{category}\')">{category} ({count})</button>\n'
    
    html_content += '''            </div>
        </div>
        
        <div class="categories-grid" id="categoriesGrid">
'''
    
    # Ajouter les sections pour chaque catégorie
    for category in sorted(cases_by_category.keys()):
        cases = cases_by_category[category]
        html_content += f'''            <div class="category-section" data-category="{category}">
                <div class="category-header">
                    <h2 class="category-title">{category}</h2>
                    <div>
                        <span class="category-count" data-original="{len(cases)}">{len(cases)} cas</span>
                        <button class="toggle-all" onclick="toggleCategory('{category}')">▼</button>
                    </div>
                </div>
                <div class="cases-grid" id="{category}-cases">
'''
        
        for case in sorted(cases, key=lambda x: x['title']):
            escaped_title = html.escape(case['title'])
            escaped_path = html.escape(case['path'])
            
            # Extraire des tags du titre
            tags = []
            if 'Homme' in case['title'] or 'Femme' in case['title']:
                if match := re.search(r'(\d+)\s*ans', case['title']):
                    tags.append(f"{match.group(1)} ans")
            if 'Pédiatrie' in case['title']:
                tags.append('Pédiatrie')
            
            html_content += f'''                    <div class="case-card" onclick="openCase('{escaped_path}', this)" data-path="{escaped_path}" data-title="{escaped_title.lower()}" data-category="{category}">
                        <div class="case-title">{escaped_title}</div>
'''
            if tags:
                html_content += '                        <div class="case-meta">\n'
                for tag in tags:
                    html_content += f'                            <span class="case-tag">{tag}</span>\n'
                html_content += '                        </div>\n'
            
            html_content += '                    </div>\n'
        
        html_content += '''                </div>
            </div>
'''
    
    html_content += '''        </div>
    </div>
    
    <div class="footer">
        <p>© 2025 ECOS Platform - Tous droits réservés</p>
        <p style="margin-top: 10px; opacity: 0.8;">Développé pour la préparation aux examens cliniques suisses</p>
    </div>
    
    <script>
        // Données de recherche
        const searchData = ''' + search_json + ''';
        
        // Gestion de la progression
        let completedCases = new Set(JSON.parse(localStorage.getItem('completedCases') || '[]'));
        let currentFilter = 'all';
        
        function updateProgress() {
            const total = ''' + str(total_cases) + ''';
            const completed = completedCases.size;
            const percent = Math.round((completed / total) * 100);
            
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('progressPercent').textContent = percent + '%';
            document.getElementById('progressBar').style.width = percent + '%';
            
            // Marquer les cartes complétées
            document.querySelectorAll('.case-card').forEach(card => {
                const path = card.getAttribute('data-path');
                if (completedCases.has(path)) {
                    card.classList.add('completed');
                } else {
                    card.classList.remove('completed');
                }
            });
        }
        
        function openCase(path, element) {
            // Ouvrir le cas dans un nouvel onglet
            window.open(path, '_blank');
            
            // Marquer comme complété
            completedCases.add(path);
            localStorage.setItem('completedCases', JSON.stringify(Array.from(completedCases)));
            
            // Mettre à jour l'affichage
            element.classList.add('completed');
            updateProgress();
        }
        
        function performSearch() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            const searchMode = document.querySelector('input[name="searchMode"]:checked').value;
            const resultsInfo = document.getElementById('searchResultsInfo');
            
            if (!searchTerm) {
                // Réinitialiser l'affichage
                document.querySelectorAll('.case-card').forEach(card => {
                    card.classList.remove('hidden', 'search-match');
                });
                document.querySelectorAll('.category-section').forEach(section => {
                    section.classList.remove('hidden');
                    updateCategoryCount(section);
                });
                resultsInfo.classList.remove('active');
                return;
            }
            
            let matchCount = 0;
            const matchedCategories = new Set();
            
            // Rechercher dans les cas
            document.querySelectorAll('.case-card').forEach(card => {
                const path = card.getAttribute('data-path');
                const caseData = searchData[path];
                let isMatch = false;
                
                if (searchMode === 'title') {
                    // Recherche dans le titre uniquement
                    isMatch = caseData && caseData.title && caseData.title.toLowerCase().includes(searchTerm);
                } else {
                    // Recherche complète
                    if (caseData) {
                        // Recherche dans le titre
                        if (caseData.title && caseData.title.toLowerCase().includes(searchTerm)) {
                            isMatch = true;
                        }
                        // Recherche dans le contexte
                        else if (caseData.context && caseData.context.toLowerCase().includes(searchTerm)) {
                            isMatch = true;
                        }
                        // Recherche dans les mots-clés
                        else if (caseData.keywords && caseData.keywords.some(kw => kw.toLowerCase().includes(searchTerm))) {
                            isMatch = true;
                        }
                        // Recherche dans les critères
                        else if (caseData.criteria && caseData.criteria.toLowerCase().includes(searchTerm)) {
                            isMatch = true;
                        }
                        // Recherche dans le texte complet
                        else if (caseData.full_text && caseData.full_text.toLowerCase().includes(searchTerm)) {
                            isMatch = true;
                        }
                    }
                }
                
                if (isMatch) {
                    card.classList.remove('hidden');
                    card.classList.add('search-match');
                    matchCount++;
                    matchedCategories.add(card.getAttribute('data-category'));
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('search-match');
                }
            });
            
            // Mettre à jour l'affichage des catégories
            document.querySelectorAll('.category-section').forEach(section => {
                const category = section.getAttribute('data-category');
                if (matchedCategories.has(category)) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
                updateCategoryCount(section);
            });
            
            // Afficher les résultats
            if (matchCount > 0) {
                resultsInfo.innerHTML = `✨ <strong>${matchCount}</strong> cas trouvé${matchCount > 1 ? 's' : ''} pour "<strong>${searchTerm}</strong>" (${searchMode === 'title' ? 'titres uniquement' : 'recherche complète'})`;
                resultsInfo.classList.add('active');
            } else {
                resultsInfo.innerHTML = `❌ Aucun cas trouvé pour "<strong>${searchTerm}</strong>"`;
                resultsInfo.classList.add('active');
            }
        }
        
        function updateCategoryCount(section) {
            const visibleCards = section.querySelectorAll('.case-card:not(.hidden)').length;
            const originalCount = section.querySelector('.category-count').getAttribute('data-original');
            const countElement = section.querySelector('.category-count');
            
            if (visibleCards < originalCount) {
                countElement.textContent = `${visibleCards}/${originalCount} cas`;
            } else {
                countElement.textContent = `${originalCount} cas`;
            }
        }
        
        function filterByCategory(category) {
            currentFilter = category;
            
            // Mettre à jour les boutons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Filtrer les sections
            document.querySelectorAll('.category-section').forEach(section => {
                if (category === 'all' || section.getAttribute('data-category') === category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Réinitialiser la recherche
            document.getElementById('searchInput').value = '';
            performSearch();
        }
        
        function toggleCategory(category) {
            const casesDiv = document.getElementById(category + '-cases');
            const button = event.target;
            
            if (casesDiv.style.display === 'none') {
                casesDiv.style.display = 'grid';
                button.textContent = '▼';
            } else {
                casesDiv.style.display = 'none';
                button.textContent = '▶';
            }
        }
        
        // Initialiser la progression au chargement
        updateProgress();
        
        // Raccourcis clavier
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            
            // Échap pour effacer la recherche
            if (e.key === 'Escape') {
                document.getElementById('searchInput').value = '';
                performSearch();
            }
        });
        
        // Focus automatique sur la recherche au chargement
        window.addEventListener('load', function() {
            document.getElementById('searchInput').focus();
        });
    </script>
</body>
</html>'''
    
    return html_content

def main():
    # Dossiers spécifiques à traiter
    target_folders = [
        'grilles_generees/html/AMBOSS',
        'grilles_generees/html/AMBOSS-ChatGPT',
        'grilles_generees/html/German',
        'grilles_generees/html/RESCOS',
        'grilles_generees/html/Thieme',
        'grilles_generees/html/USMLE',
        'grilles_generees/html/USMLE Triage',
        'grilles_generees/html/Vignettes'
    ]
    
    html_files = []
    search_data = {}
    
    # Parcourir uniquement les dossiers spécifiés
    for folder in target_folders:
        if os.path.exists(folder):
            for file in os.listdir(folder):
                if file.endswith('.html') and 'Grille ECOS' in file:
                    full_path = os.path.join(folder, file)
                    relative_path = full_path
                    html_files.append(relative_path)
                    
                    # Extraire le contenu pour la recherche
                    print(f"Extraction du contenu de: {file}")
                    content = extract_case_content(full_path)
                    search_data[relative_path] = content
    
    print(f"\n✅ Trouvé {len(html_files)} fichiers de grilles ECOS")
    print(f"✅ Extrait le contenu de {len(search_data)} cas pour la recherche")
    
    # Organiser les cas par catégorie
    cases_by_category = defaultdict(list)
    
    for file_path in html_files:
        case_info = extract_case_info(file_path)
        cases_by_category[case_info['category']].append(case_info)
    
    # Afficher le résumé
    print("\nRésumé par catégorie:")
    for category in sorted(cases_by_category.keys()):
        print(f"  {category}: {len(cases_by_category[category])} cas")
    
    # Générer le HTML de la plateforme
    html_content = generate_html_platform(cases_by_category, search_data)
    
    # Écrire le fichier
    output_file = 'ECOS_Revisions_Complete.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n✅ Plateforme générée avec succès: {output_file}")
    print(f"   Total: {len(html_files)} cas cliniques intégrés")
    print(f"   Recherche avancée activée avec {len(search_data)} cas indexés")

if __name__ == "__main__":
    main()