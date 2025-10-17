#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
from pathlib import Path
from collections import defaultdict
import html

def extract_case_info(file_path):
    """Extraire les informations d'un cas depuis son nom de fichier"""
    filename = os.path.basename(file_path)
    
    # Nettoyer le nom du fichier
    filename = filename.replace(' - Grille ECOS.html', '')
    
    # Déterminer la catégorie
    parent_dir = os.path.basename(os.path.dirname(file_path))
    
    # Catégories spécifiques à inclure
    allowed_categories = ['USMLE', 'AMBOSS', 'AMBOSS-ChatGPT', 'German', 'RESCOS', 'Thieme', 'USMLE Triage', 'Vignettes']
    
    # Extraire le titre et les détails
    if parent_dir in allowed_categories:
        category = parent_dir
        title = filename
    elif 'v2' in parent_dir or 'v3' in parent_dir:
        category = 'SSP'
        title = filename.replace('_v2', '').replace('_v3', '')
    else:
        category = 'Autres'
        title = filename
    
    return {
        'path': file_path,
        'filename': os.path.basename(file_path),
        'title': title,
        'category': category
    }

def generate_html_platform(cases_by_category):
    """Générer le HTML de la plateforme complète"""
    
    total_cases = sum(len(cases) for cases in cases_by_category.values())
    
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
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            align-items: center;
        }}
        
        .search-box {{
            flex: 1;
            min-width: 250px;
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
        
        @media (max-width: 768px) {{
            .cases-grid {{
                grid-template-columns: 1fr;
            }}
            
            h1 {{
                font-size: 1.8em;
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
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" placeholder="Rechercher un cas clinique..." onkeyup="filterCases()">
            </div>
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
                        <span class="category-count">{len(cases)} cas</span>
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
            
            html_content += f'''                    <div class="case-card" onclick="openCase('{escaped_path}', this)" data-title="{escaped_title.lower()}">
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
        // Gestion de la progression
        let completedCases = new Set(JSON.parse(localStorage.getItem('completedCases') || '[]'));
        
        function updateProgress() {
            const total = ''' + str(total_cases) + ''';
            const completed = completedCases.size;
            const percent = Math.round((completed / total) * 100);
            
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('progressPercent').textContent = percent + '%';
            document.getElementById('progressBar').style.width = percent + '%';
            
            // Marquer les cartes complétées
            document.querySelectorAll('.case-card').forEach(card => {
                const path = card.getAttribute('onclick').match(/'([^']+)'/)[1];
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
        
        function filterCases() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            document.querySelectorAll('.case-card').forEach(card => {
                const title = card.getAttribute('data-title');
                if (title.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        function filterByCategory(category) {
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
        });
    </script>
</body>
</html>'''
    
    return html_content

def main():
    # Dossiers spécifiques à inclure
    target_folders = ['AMBOSS', 'AMBOSS-ChatGPT', 'German', 'RESCOS', 'Thieme', 'USMLE', 'USMLE Triage', 'Vignettes']
    
    # Trouver tous les fichiers HTML de grilles dans les dossiers spécifiés
    base_path = Path('grilles_generees/html')
    html_files = []
    
    for folder in target_folders:
        folder_path = base_path / folder
        if folder_path.exists():
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    if file.endswith('.html') and 'Grille ECOS' in file:
                        full_path = os.path.join(root, file)
                        # Créer le chemin relatif depuis le fichier HTML de la plateforme
                        relative_path = os.path.relpath(full_path, '.')
                        html_files.append(relative_path)
        else:
            print(f"⚠️  Dossier {folder} non trouvé")
    
    print(f"Trouvé {len(html_files)} fichiers de grilles ECOS dans les dossiers spécifiés")
    print(f"Dossiers traités: {', '.join(target_folders)}")
    
    # Organiser les cas par catégorie (exclure les "Autres")
    cases_by_category = defaultdict(list)
    
    for file_path in html_files:
        case_info = extract_case_info(file_path)
        # Ne conserver que les catégories spécifiées
        if case_info['category'] != 'Autres':
            cases_by_category[case_info['category']].append(case_info)
    
    # Vérifier que nous avons bien les 8 catégories attendues
    expected_categories = ['AMBOSS', 'AMBOSS-ChatGPT', 'German', 'RESCOS', 'Thieme', 'USMLE', 'USMLE Triage', 'Vignettes']
    missing_categories = set(expected_categories) - set(cases_by_category.keys())
    if missing_categories:
        print(f"⚠️  Catégories manquantes: {', '.join(missing_categories)}")
    
    # Afficher le résumé
    print("\nRésumé par catégorie:")
    for category in sorted(cases_by_category.keys()):
        print(f"  {category}: {len(cases_by_category[category])} cas")
    
    # Générer le HTML de la plateforme
    html_content = generate_html_platform(cases_by_category)
    
    # Écrire le fichier
    output_file = 'ECOS_Revisions_Complete.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n✅ Plateforme générée avec succès: {output_file}")
    print(f"   Total: {len(html_files)} cas cliniques intégrés")

if __name__ == "__main__":
    main()