#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger les fonctions expand/collapse et ajouter des filtres logiques
aux fichiers HTML de révision ECOS.
"""

import json
import re
from pathlib import Path

def create_enhanced_html(json_data, specialty_name):
    """Crée un HTML enrichi avec fonctions expand/collapse corrigées et filtres logiques."""
    
    # Extraire les statistiques
    total_sections = len(json_data.get('sections', []))
    total_pathologies = sum(len(section.get('pathologies', [])) for section in json_data.get('sections', []))
    
    # Collecter tous les tags uniques pour les filtres
    all_tags = set()
    for section in json_data.get('sections', []):
        for pathology in section.get('pathologies', []):
            # Extraire les tags depuis le contenu
            if 'urgent' in str(pathology).lower():
                all_tags.add('urgent')
            if 'warning' in str(pathology).lower():
                all_tags.add('warning')
            if 'dosage' in str(pathology).lower():
                all_tags.add('dosage')
            if 'osce' in str(pathology).lower():
                all_tags.add('osce')
    
    html_content = f'''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guide {specialty_name} ECOS - Révisions</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }}
        
        header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}
        
        header::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }}
        
        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); opacity: 1; }}
            50% {{ transform: scale(1.1); opacity: 0.7; }}
        }}
        
        h1 {{
            font-size: 2.8em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
            animation: slideInFromTop 0.8s ease-out;
        }}
        
        @keyframes slideInFromTop {{
            from {{
                opacity: 0;
                transform: translateY(-30px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .subtitle {{
            font-size: 1.3em;
            opacity: 0.95;
            font-weight: 300;
            position: relative;
            animation: slideInFromBottom 0.8s ease-out;
        }}
        
        @keyframes slideInFromBottom {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        /* Barre de progression */
        .progress-container {{
            padding: 20px;
            background: white;
            border-bottom: 1px solid #dee2e6;
        }}
        
        .progress-bar {{
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }}
        
        .progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 15px;
            width: 0%;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }}
        
        /* Cartes de statistiques */
        .stats-container {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
            background: #f8f9fa;
        }}
        
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }}
        
        .stat-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }}
        
        .stat-number {{
            font-size: 2.5em;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .stat-label {{
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
        }}
        
        /* Contrôles avec filtres améliorés */
        .controls {{
            padding: 25px;
            background: linear-gradient(to right, #f8f9fa, #e9ecef);
            border-bottom: 1px solid #dee2e6;
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        
        .controls-row {{
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }}
        
        .search-container {{
            flex: 1;
            min-width: 300px;
            position: relative;
        }}
        
        .search-icon {{
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            font-size: 18px;
        }}
        
        input[type="text"] {{
            width: 100%;
            padding: 12px 15px 12px 45px;
            border: 2px solid #dee2e6;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
        }}
        
        input[type="text"]:focus {{
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }}
        
        /* Filtres par tags */
        .filter-tags {{
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }}
        
        .filter-tag {{
            padding: 8px 16px;
            border-radius: 20px;
            border: 2px solid #dee2e6;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        }}
        
        .filter-tag:hover {{
            border-color: #667eea;
            transform: translateY(-2px);
        }}
        
        .filter-tag.active {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }}
        
        .filter-tag.urgent {{ border-color: #e74c3c; }}
        .filter-tag.urgent.active {{ background: #e74c3c; }}
        
        .filter-tag.warning {{ border-color: #f39c12; }}
        .filter-tag.warning.active {{ background: #f39c12; }}
        
        .filter-tag.dosage {{ border-color: #3498db; }}
        .filter-tag.dosage.active {{ background: #3498db; }}
        
        .filter-tag.osce {{ border-color: #27ae60; }}
        .filter-tag.osce.active {{ background: #27ae60; }}
        
        /* Sélecteur de sections */
        .section-selector {{
            display: flex;
            gap: 10px;
            align-items: center;
        }}
        
        select {{
            padding: 10px 15px;
            border: 2px solid #dee2e6;
            border-radius: 10px;
            background: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }}
        
        select:hover {{
            border-color: #667eea;
        }}
        
        select:focus {{
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }}
        
        button {{
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }}
        
        button::before {{
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }}
        
        button:hover::before {{
            width: 300px;
            height: 300px;
        }}
        
        button:hover {{
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }}
        
        button:active {{
            transform: translateY(-1px);
        }}
        
        .counter {{
            padding: 12px 20px;
            background: white;
            border-radius: 10px;
            font-weight: 600;
            color: #495057;
            border: 2px solid #dee2e6;
            min-width: 200px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            animation: slideIn 0.5s ease-out;
        }}
        
        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateX(-20px);
            }}
            to {{
                opacity: 1;
                transform: translateX(0);
            }}
        }}
        
        .content {{
            padding: 30px;
        }}
        
        .section {{
            margin-bottom: 40px;
            animation: fadeIn 0.6s ease-out;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }}
        
        .section.collapsed {{
            margin-bottom: 20px;
        }}
        
        .section.collapsed .table-wrapper {{
            display: none;
        }}
        
        @keyframes fadeIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .section-title {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            font-size: 1.5em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }}
        
        .section-title:hover {{
            padding-left: 30px;
        }}
        
        .section-title::before {{
            content: '▼';
            position: absolute;
            left: 20px;
            transition: transform 0.3s ease;
        }}
        
        .section.collapsed .section-title::before {{
            transform: rotate(-90deg);
        }}
        
        .section-count {{
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: normal;
        }}
        
        .table-wrapper {{
            overflow-x: auto;
            padding: 20px;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
        }}
        
        th {{
            background: #f8f9fa;
            color: #495057;
            font-weight: 600;
            text-align: left;
            padding: 15px;
            border-bottom: 2px solid #dee2e6;
            position: sticky;
            top: 0;
            z-index: 10;
        }}
        
        td {{
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
        }}
        
        tr {{
            transition: all 0.3s ease;
        }}
        
        tr:hover {{
            background: #f8f9fa;
            transform: scale(1.01);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }}
        
        .pathology {{
            font-weight: 700;
            color: #667eea;
            font-size: 1.1em;
            position: relative;
            padding-left: 25px;
        }}
        
        .pathology::before {{
            content: '🔬';
            position: absolute;
            left: 0;
            font-size: 1.2em;
        }}
        
        /* Styles pour les highlights */
        .urgent {{
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
            animation: pulse-urgent 2s infinite;
        }}
        
        @keyframes pulse-urgent {{
            0%, 100% {{ box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }}
            50% {{ box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }}
        }}
        
        .warning {{
            background: linear-gradient(45deg, #f39c12, #e67e22);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .highlight {{
            background: linear-gradient(45deg, #f39c12, #f1c40f);
            color: #2c3e50;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .key-point {{
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .clinical-sign {{
            background: linear-gradient(45deg, #9b59b6, #8e44ad);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .dosage {{
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .exam-priority {{
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .treatment-line {{
            background: linear-gradient(45deg, #27ae60, #229954);
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 2px 0;
        }}
        
        .osce-tip {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            margin-top: 10px;
            font-weight: 500;
            box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
        }}
        
        .osce-tip::before {{
            content: '💡';
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 1.5em;
            opacity: 0.3;
        }}
        
        /* Responsive */
        @media (max-width: 768px) {{
            .container {{
                border-radius: 0;
            }}
            
            h1 {{
                font-size: 2em;
            }}
            
            .controls-row {{
                flex-direction: column;
            }}
            
            .search-container {{
                min-width: 100%;
            }}
            
            table {{
                font-size: 0.9em;
            }}
            
            th, td {{
                padding: 10px;
            }}
            
            .stats-container {{
                grid-template-columns: 1fr;
            }}
        }}
        
        /* Print styles */
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .container {{
                box-shadow: none;
                border-radius: 0;
            }}
            
            .controls, .progress-container, .stats-container {{
                display: none;
            }}
            
            .section {{
                page-break-inside: avoid;
                box-shadow: none;
            }}
            
            .section-title {{
                background: #667eea !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }}
            
            tr:hover {{
                transform: none;
                box-shadow: none;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🏥 Guide {specialty_name} ECOS</h1>
            <p class="subtitle">Fiches de révision complètes pour l'examen clinique</p>
        </header>
        
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill">0%</div>
            </div>
        </div>
        
        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-number">{total_sections}</div>
                <div class="stat-label">Sections</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{total_pathologies}</div>
                <div class="stat-label">Pathologies</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="viewedCount">0</div>
                <div class="stat-label">Consultées</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="remainingCount">{total_pathologies}</div>
                <div class="stat-label">Restantes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="progressPercent">0%</div>
                <div class="stat-label">Progression</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="timeSpent">0m</div>
                <div class="stat-label">Temps passé</div>
            </div>
        </div>
        
        <div class="controls">
            <div class="controls-row">
                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="searchInput" placeholder="Rechercher une pathologie, symptôme, traitement...">
                </div>
                <button onclick="expandAll()">📖 Tout déplier</button>
                <button onclick="collapseAll()">📚 Tout replier</button>
                <button onclick="resetFilters()">🔄 Réinitialiser</button>
            </div>
            
            <div class="controls-row">
                <div class="filter-tags">
                    <span style="margin-right: 10px; font-weight: 600;">Filtres:</span>
                    <div class="filter-tag urgent" data-tag="urgent" onclick="toggleFilter(this)">🚨 Urgences</div>
                    <div class="filter-tag warning" data-tag="warning" onclick="toggleFilter(this)">⚠️ Alertes</div>
                    <div class="filter-tag dosage" data-tag="dosage" onclick="toggleFilter(this)">💊 Dosages</div>
                    <div class="filter-tag osce" data-tag="osce" onclick="toggleFilter(this)">💡 Tips OSCE</div>
                </div>
                
                <div class="section-selector">
                    <label for="sectionSelect" style="font-weight: 600;">Section:</label>
                    <select id="sectionSelect" onchange="filterBySection()">
                        <option value="">Toutes les sections</option>
'''
    
    # Ajouter les options de sections
    for i, section in enumerate(json_data.get('sections', []), 1):
        section_name = section.get('name', f'Section {i}')
        html_content += f'                        <option value="section-{i}">{i}. {section_name}</option>\n'
    
    html_content += '''                    </select>
                </div>
            </div>
            
            <div class="counter" id="counter">
                <span id="visibleCount">{}</span> / {} pathologies affichées
            </div>
        </div>
        
        <div class="content">
'''.format(total_pathologies, total_pathologies)
    
    # Générer le contenu des sections
    for section_idx, section in enumerate(json_data.get('sections', []), 1):
        section_name = section.get('name', f'Section {section_idx}')
        pathologies = section.get('pathologies', [])
        pathology_count = len(pathologies)
        
        html_content += f'''
            <!-- Section {section_idx}: {section_name} -->
            <div class="section" id="section-{section_idx}">
                <h2 class="section-title" onclick="toggleSection(this.parentElement)">
                    {section_idx}. {section_name}
                    <span class="section-count">{pathology_count} pathologies</span>
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
                        <tbody>
'''
        
        for pathology in pathologies:
            pathology_name = pathology.get('name', '')
            anamnese = format_field_with_highlights(pathology.get('anamnese', ''))
            examen = format_field_with_highlights(pathology.get('examen_physique', ''))
            procedures = format_field_with_highlights(pathology.get('procedures_examens', ''))
            therapie = format_field_with_highlights(pathology.get('therapie', ''))
            commentaires = format_field_with_highlights(pathology.get('commentaires', ''))
            
            # Ajouter les tags de données pour le filtrage
            data_tags = []
            if 'urgent' in str(pathology).lower():
                data_tags.append('urgent')
            if 'warning' in str(pathology).lower() or 'attention' in str(pathology).lower():
                data_tags.append('warning')
            if 'dosage' in str(pathology).lower() or 'mg' in str(pathology).lower():
                data_tags.append('dosage')
            if 'osce' in str(pathology).lower() or 'tip' in commentaires.lower():
                data_tags.append('osce')
            
            data_tags_str = ' '.join(data_tags)
            
            html_content += f'''                            <tr class="pathology-row" data-tags="{data_tags_str}" data-section="section-{section_idx}">
                                <td class="pathology">{pathology_name}</td>
                                <td>{anamnese}</td>
                                <td>{examen}</td>
                                <td>{procedures}</td>
                                <td>{therapie}</td>
                                <td>{commentaires}</td>
                            </tr>
'''
        
        html_content += '''                        </tbody>
                    </table>
                </div>
            </div>
'''
    
    # Ajouter le JavaScript amélioré
    html_content += '''        </div>
    </div>
    
    <script>
        // Variables globales
        let viewedPathologies = new Set();
        let activeFilters = new Set();
        let startTime = Date.now();
        let totalPathologies = ''' + str(total_pathologies) + ''';
        
        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            updateCounter();
            updateProgress();
            
            // Mise à jour du temps passé
            setInterval(updateTimeSpent, 60000);
            
            // Observer pour marquer les pathologies comme vues
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const row = entry.target;
                        if (row.classList.contains('pathology-row')) {
                            viewedPathologies.add(row);
                            updateProgress();
                        }
                    }
                });
            }, { threshold: 0.5 });
            
            document.querySelectorAll('.pathology-row').forEach(row => {
                observer.observe(row);
            });
        });
        
        // Fonction de recherche améliorée
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const sections = document.querySelectorAll('.section');
            let visibleCount = 0;
            
            sections.forEach(section => {
                const rows = section.querySelectorAll('.pathology-row');
                let sectionHasVisible = false;
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    const matchesSearch = searchTerm === '' || text.includes(searchTerm);
                    const matchesFilters = activeFilters.size === 0 || 
                        Array.from(activeFilters).some(filter => row.dataset.tags.includes(filter));
                    
                    if (matchesSearch && matchesFilters) {
                        row.style.display = '';
                        sectionHasVisible = true;
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                // Masquer la section si aucune pathologie visible
                section.style.display = sectionHasVisible ? '' : 'none';
            });
            
            updateCounter(visibleCount);
        });
        
        // Toggle section (expand/collapse)
        function toggleSection(section) {
            section.classList.toggle('collapsed');
        }
        
        // Fonction pour tout déplier - CORRIGÉE
        function expandAll() {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.classList.remove('collapsed');
            });
        }
        
        // Fonction pour tout replier - CORRIGÉE
        function collapseAll() {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.classList.add('collapsed');
            });
        }
        
        // Toggle filter
        function toggleFilter(filterElement) {
            const tag = filterElement.dataset.tag;
            filterElement.classList.toggle('active');
            
            if (activeFilters.has(tag)) {
                activeFilters.delete(tag);
            } else {
                activeFilters.add(tag);
            }
            
            applyFilters();
        }
        
        // Appliquer les filtres
        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const sectionFilter = document.getElementById('sectionSelect').value;
            const rows = document.querySelectorAll('.pathology-row');
            let visibleCount = 0;
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const matchesSearch = searchTerm === '' || text.includes(searchTerm);
                const matchesSection = sectionFilter === '' || row.dataset.section === sectionFilter;
                const matchesTags = activeFilters.size === 0 || 
                    Array.from(activeFilters).some(filter => row.dataset.tags.includes(filter));
                
                if (matchesSearch && matchesSection && matchesTags) {
                    row.style.display = '';
                    row.closest('.section').style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Masquer les sections vides
            document.querySelectorAll('.section').forEach(section => {
                const visibleRows = section.querySelectorAll('.pathology-row:not([style*="display: none"])');
                if (visibleRows.length === 0) {
                    section.style.display = 'none';
                }
            });
            
            updateCounter(visibleCount);
        }
        
        // Filtrer par section
        function filterBySection() {
            applyFilters();
        }
        
        // Réinitialiser les filtres
        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('sectionSelect').value = '';
            document.querySelectorAll('.filter-tag').forEach(tag => {
                tag.classList.remove('active');
            });
            activeFilters.clear();
            
            // Afficher toutes les sections et pathologies
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = '';
                section.classList.remove('collapsed');
            });
            document.querySelectorAll('.pathology-row').forEach(row => {
                row.style.display = '';
            });
            
            updateCounter(totalPathologies);
        }
        
        // Mettre à jour le compteur
        function updateCounter(count = null) {
            if (count === null) {
                count = document.querySelectorAll('.pathology-row:not([style*="display: none"])').length;
            }
            document.getElementById('visibleCount').textContent = count;
        }
        
        // Mettre à jour la progression
        function updateProgress() {
            const viewed = viewedPathologies.size;
            const remaining = totalPathologies - viewed;
            const percent = Math.round((viewed / totalPathologies) * 100);
            
            document.getElementById('viewedCount').textContent = viewed;
            document.getElementById('remainingCount').textContent = remaining;
            document.getElementById('progressPercent').textContent = percent + '%';
            document.getElementById('progressFill').style.width = percent + '%';
            document.getElementById('progressFill').textContent = percent + '%';
        }
        
        // Mettre à jour le temps passé
        function updateTimeSpent() {
            const minutes = Math.floor((Date.now() - startTime) / 60000);
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            document.getElementById('timeSpent').textContent = timeStr;
        }
        
        // Raccourcis clavier
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + F pour focus sur recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            
            // Escape pour réinitialiser les filtres
            if (e.key === 'Escape') {
                resetFilters();
            }
            
            // Alt + E pour tout déplier
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                expandAll();
            }
            
            // Alt + C pour tout replier
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                collapseAll();
            }
        });
    </script>
</body>
</html>'''
    
    return html_content

def format_field_with_highlights(text):
    """Applique les highlights et le formatage au texte."""
    if not text:
        return ''
    
    # Remplacer les patterns de highlight
    text = re.sub(r'\*\*(URGENT[^*]*)\*\*', r'<span class="urgent">\1</span>', text)
    text = re.sub(r'\*\*(Urgence[^*]*)\*\*', r'<span class="urgent">\1</span>', text)
    text = re.sub(r'\*\*(ATTENTION[^*]*)\*\*', r'<span class="warning">\1</span>', text)
    text = re.sub(r'\*\*(Warning[^*]*)\*\*', r'<span class="warning">\1</span>', text)
    text = re.sub(r'\*\*([0-9]+\s*mg[^*]*)\*\*', r'<span class="dosage">\1</span>', text)
    text = re.sub(r'\*\*([0-9]+\s*UI[^*]*)\*\*', r'<span class="dosage">\1</span>', text)
    text = re.sub(r'\*\*(Tip OSCE[^*]*)\*\*', r'<div class="osce-tip">\1</div>', text)
    text = re.sub(r'\*\*(Point clé[^*]*)\*\*', r'<span class="key-point">\1</span>', text)
    text = re.sub(r'\*\*(Signe clinique[^*]*)\*\*', r'<span class="clinical-sign">\1</span>', text)
    text = re.sub(r'\*\*(Examen prioritaire[^*]*)\*\*', r'<span class="exam-priority">\1</span>', text)
    text = re.sub(r'\*\*(Traitement[^*]*)\*\*', r'<span class="treatment-line">\1</span>', text)
    
    # Remplacer les retours à la ligne
    text = text.replace('\n', '<br>')
    
    return text

def process_files():
    """Traite tous les fichiers HTML de révision."""
    files_to_process = [
        ('gynecologie_ecos.json', 'Gynécologie'),
        ('medecine_generale_ecos.json', 'Médecine Générale'),
        ('chirurgie_ecos.json', 'Chirurgie'),
        ('dermatologie_ecos.json', 'Dermatologie')
    ]
    
    for json_file, specialty in files_to_process:
        json_path = Path(f'json_files/{json_file}')
        
        if json_path.exists():
            print(f"Traitement de {specialty}...")
            
            # Lire le JSON
            with open(json_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            # Créer le HTML amélioré
            html_content = create_enhanced_html(json_data, specialty)
            
            # Sauvegarder le fichier HTML
            output_file = f'_ECOS_{specialty.replace(" ", "_")}_revisions.html'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"✅ {output_file} créé avec succès")
        else:
            print(f"⚠️ Fichier {json_file} non trouvé")

if __name__ == "__main__":
    print("🔧 Correction des fonctions et ajout des filtres logiques...")
    print("-" * 50)
    process_files()
    print("-" * 50)
    print("✨ Traitement terminé!")