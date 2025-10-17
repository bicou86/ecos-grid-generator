#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

def create_harmonized_html(specialty_name, json_file, sections_count, pathologies_count, icon="🩺"):
    """
    Crée un fichier HTML harmonisé avec la structure complète incluant toutes les fonctionnalités
    """
    
    # Charger les données JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Template HTML avec structure complète
    html_content = f"""<!DOCTYPE html>
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
        
        .controls {{
            padding: 25px;
            background: linear-gradient(to right, #f8f9fa, #e9ecef);
            border-bottom: 1px solid #dee2e6;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
            min-width: 150px;
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
        
        .section {{
            margin-bottom: 30px;
            animation: fadeIn 0.8s ease-out;
            animation-fill-mode: both;
        }}
        
        .section:nth-child(1) {{ animation-delay: 0.1s; }}
        .section:nth-child(2) {{ animation-delay: 0.2s; }}
        .section:nth-child(3) {{ animation-delay: 0.3s; }}
        .section:nth-child(4) {{ animation-delay: 0.4s; }}
        .section:nth-child(5) {{ animation-delay: 0.5s; }}
        
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
            padding: 20px 30px;
            margin: 0;
            font-size: 1.8em;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }}
        
        .section-title::after {{
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            animation: shimmer 2s infinite;
        }}
        
        @keyframes shimmer {{
            0% {{ transform: translateX(-100%); }}
            100% {{ transform: translateX(100%); }}
        }}
        
        .section-count {{
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
            backdrop-filter: blur(10px);
        }}
        
        .content {{
            padding: 30px;
            background: white;
        }}
        
        .table-wrapper {{
            overflow-x: auto;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            margin-bottom: 25px;
            animation: slideUp 0.6s ease-out;
        }}
        
        @keyframes slideUp {{
            from {{
                opacity: 0;
                transform: translateY(30px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
        }}
        
        th {{
            background: linear-gradient(135deg, #f5f7fa 0%, #e3e7ee 100%);
            padding: 15px;
            text-align: left;
            font-weight: 700;
            color: #495057;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 3px solid #667eea;
            position: sticky;
            top: 0;
            z-index: 10;
        }}
        
        th:first-child {{
            border-radius: 12px 0 0 0;
            width: 15%;
        }}
        
        th:last-child {{
            border-radius: 0 12px 0 0;
        }}
        
        td {{
            padding: 15px;
            border-bottom: 1px solid #f1f3f5;
            vertical-align: top;
            transition: all 0.3s ease;
        }}
        
        tr {{
            transition: all 0.3s ease;
            position: relative;
        }}
        
        tr::before {{
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: height 0.3s ease;
        }}
        
        tr:hover::before {{
            height: 100%;
        }}
        
        tr:hover {{
            background: linear-gradient(to right, rgba(102, 126, 234, 0.05), transparent);
            transform: translateX(4px);
        }}
        
        tr:hover td {{
            color: #2c3e50;
        }}
        
        .pathology {{
            font-weight: 700;
            color: #667eea;
            font-size: 1.1em;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            position: relative;
            padding-left: 25px;
        }}
        
        .pathology::before {{
            content: '{icon}';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
        }}
        
        .highlight {{
            background: linear-gradient(135deg, #fff3cd, #ffecb5);
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: 600;
            color: #856404;
            display: inline-block;
            margin: 2px 0;
            box-shadow: 0 2px 5px rgba(255, 193, 7, 0.2);
            animation: highlightPulse 2s ease-in-out infinite;
        }}
        
        @keyframes highlightPulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.02); }}
        }}
        
        .key-point {{
            color: #28a745;
            font-weight: 700;
            padding: 2px 6px;
            background: rgba(40, 167, 69, 0.1);
            border-radius: 4px;
            display: inline-block;
            margin: 1px 0;
        }}
        
        .warning {{
            color: #dc3545;
            font-weight: 700;
            background: rgba(220, 53, 69, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            margin: 1px 0;
        }}
        
        .urgent {{
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 700;
            display: inline-block;
            margin: 3px 0;
            border-left: 4px solid #dc3545;
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
            animation: urgentBlink 1.5s ease-in-out infinite;
        }}
        
        @keyframes urgentBlink {{
            0%, 100% {{ opacity: 1; }}
            50% {{ opacity: 0.8; }}
        }}
        
        .dosage {{
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            padding: 3px 8px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-weight: 600;
            display: inline-block;
            margin: 2px 0;
            font-size: 0.95em;
            box-shadow: 0 2px 5px rgba(40, 167, 69, 0.2);
        }}
        
        .exam-priority {{
            background: linear-gradient(135deg, #cfe2ff, #b6d4fe);
            color: #084298;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 700;
            display: inline-block;
            margin: 3px 0;
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
        }}
        
        .clinical-sign {{
            color: #6610f2;
            font-weight: 600;
            font-style: italic;
            background: rgba(102, 16, 242, 0.05);
            padding: 2px 5px;
            border-radius: 3px;
        }}
        
        .osce-tip {{
            background: linear-gradient(135deg, #e7f3ff, #cce5ff);
            border-left: 5px solid #0066cc;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 5px;
            font-weight: 600;
            color: #004085;
            position: relative;
            overflow: hidden;
        }}
        
        .osce-tip::before {{
            content: '💡 OSCE';
            position: absolute;
            top: 5px;
            right: 10px;
            font-size: 12px;
            opacity: 0.6;
            font-weight: 700;
        }}
        
        .differential {{
            background: rgba(102, 126, 234, 0.1);
            padding: 8px;
            border-radius: 5px;
            margin: 5px 0;
            border: 1px dashed #667eea;
        }}
        
        .score-criteria {{
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 8px 12px;
            border-radius: 5px;
            margin: 5px 0;
            font-weight: 600;
            position: relative;
            padding-left: 30px;
        }}
        
        .score-criteria::before {{
            content: '✓';
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #28a745;
            font-weight: bold;
        }}
        
        .treatment-line {{
            display: block;
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }}
        
        .treatment-line::before {{
            content: '▸';
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }}
        
        footer {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px;
            margin-top: 50px;
            position: relative;
            overflow: hidden;
        }}
        
        footer::before {{
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: footerShimmer 3s infinite;
        }}
        
        @keyframes footerShimmer {{
            0% {{ left: -100%; }}
            100% {{ left: 100%; }}
        }}
        
        .footer-text {{
            position: relative;
            font-size: 1.1em;
            font-weight: 300;
        }}
        
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: linear-gradient(to bottom, #f8f9fa, white);
        }}
        
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border-top: 4px solid #667eea;
        }}
        
        .stat-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }}
        
        .stat-number {{
            font-size: 2.5em;
            font-weight: 700;
            color: #667eea;
            display: block;
            margin-bottom: 5px;
        }}
        
        .stat-label {{
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        
        @media (max-width: 768px) {{
            h1 {{
                font-size: 2em;
            }}
            
            .controls {{
                flex-direction: column;
                gap: 10px;
            }}
            
            .search-container {{
                width: 100%;
            }}
            
            button {{
                width: 100%;
            }}
            
            .table-wrapper {{
                border-radius: 0;
            }}
            
            th, td {{
                padding: 10px;
                font-size: 14px;
            }}
            
            .stats {{
                grid-template-columns: 1fr;
            }}
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .container {{
                box-shadow: none;
                border-radius: 0;
            }}
            
            .controls, footer, .stats {{
                display: none;
            }}
            
            header {{
                background: none;
                color: black;
                padding: 20px 0;
            }}
            
            h1, .subtitle {{
                color: black;
                text-shadow: none;
            }}
            
            .section-title {{
                background: none;
                color: black;
                border-bottom: 2px solid black;
                page-break-after: avoid;
            }}
            
            tr {{
                page-break-inside: avoid;
            }}
            
            .highlight, .urgent, .exam-priority, .osce-tip {{
                border: 1px solid black;
                box-shadow: none;
            }}
        }}
        
        /* Loading animation */
        .loading {{
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
            vertical-align: middle;
        }}
        
        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
        
        /* Tooltip */
        .tooltip {{
            position: relative;
            display: inline-block;
            cursor: help;
            border-bottom: 1px dotted #667eea;
        }}
        
        .tooltip .tooltiptext {{
            visibility: hidden;
            width: 250px;
            background-color: #555;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 10px;
            position: absolute;
            z-index: 1000;
            bottom: 125%;
            left: 50%;
            margin-left: -125px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 14px;
            font-weight: normal;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }}
        
        .tooltip:hover .tooltiptext {{
            visibility: visible;
            opacity: 1;
        }}
        
        /* Badge styles */
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            font-size: 12px;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 10px;
            margin: 0 3px;
        }}
        
        .badge-primary {{
            background-color: #667eea;
            color: white;
        }}
        
        .badge-danger {{
            background-color: #dc3545;
            color: white;
        }}
        
        .badge-success {{
            background-color: #28a745;
            color: white;
        }}
        
        .badge-warning {{
            background-color: #ffc107;
            color: #212529;
        }}
        
        /* Progress bar */
        .progress-container {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background-color: rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }}
        
        .progress-bar {{
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0;
            transition: width 0.3s ease;
            box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
        }}
    </style>
</head>
<body>
    <div class="progress-container">
        <div class="progress-bar" id="progressBar"></div>
    </div>
    
    <div class="container">
        <header>
            <h1>{icon} Guide {specialty_name} ECOS</h1>
            <p class="subtitle">Terminologie Française - Guide de Révision Complet</p>
        </header>
        
        <div class="stats">
            <div class="stat-card">
                <span class="stat-number">{sections_count}</span>
                <span class="stat-label">Sections</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">{pathologies_count}</span>
                <span class="stat-label">Pathologies</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">100%</span>
                <span class="stat-label">Couverture ECOS</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">2025</span>
                <span class="stat-label">Version</span>
            </div>
        </div>
        
        <div class="controls">
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" placeholder="Rechercher une pathologie, un symptôme, un traitement...">
            </div>
            <button onclick="window.print()">📄 Imprimer</button>
            <button onclick="expandAll()">📖 Tout déplier</button>
            <button onclick="collapseAll()">📕 Tout replier</button>
            <div class="counter">
                <span id="visibleCount">{pathologies_count}</span> / {pathologies_count} pathologies
            </div>
        </div>
        
        <div class="content">
"""
    
    # Générer le contenu des sections
    for idx, section in enumerate(data['sections'], 1):
        html_content += f"""
            <div class="section">
                <h2 class="section-title">
                    {idx}. {section['title']}
                    <span class="section-count">{len(section['data'])} pathologies</span>
                </h2>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
"""
        
        # Headers
        headers = data.get('headers', ['Pathologie', 'Anamnèse', 'Examen Physique', 'Procédures/Examens', 'Thérapie', 'Commentaires'])
        for header in headers:
            html_content += f"                                <th>{header}</th>\n"
        
        html_content += """                            </tr>
                        </thead>
                        <tbody>
"""
        
        # Données pour chaque pathologie
        for pathology in section['data']:
            html_content += """                            <tr>
"""
            for header in headers:
                content = pathology.get(header, '')
                if header == 'Pathologie':
                    html_content += f'                                <td class="pathology">{content}</td>\n'
                else:
                    # Formater le contenu avec highlights
                    formatted_content = format_content_with_highlights(content)
                    html_content += f'                                <td>{formatted_content}</td>\n'
            
            html_content += """                            </tr>
"""
        
        html_content += """                        </tbody>
                    </table>
                </div>
            </div>
"""
    
    # Footer et scripts
    html_content += f"""
        </div>
        
        <footer>
            <p class="footer-text">
                Guide {specialty_name} ECOS - Version 2025<br>
                Document de révision pour l'examen fédéral suisse<br>
                <small>© 2025 - Tous droits réservés</small>
            </p>
        </footer>
    </div>

    <script>
        // Fonction de recherche
        document.getElementById('searchInput').addEventListener('input', function(e) {{
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            let visibleCount = 0;
            
            rows.forEach(row => {{
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {{
                    row.style.display = '';
                    visibleCount++;
                }} else {{
                    row.style.display = 'none';
                }}
            }});
            
            document.getElementById('visibleCount').textContent = visibleCount;
            
            // Animation de la barre de progression
            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = (visibleCount / rows.length * 100) + '%';
        }});

        // Fonction pour déplier tout
        function expandAll() {{
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {{
                section.style.display = 'block';
            }});
        }}

        // Fonction pour replier tout
        function collapseAll() {{
            const sections = document.querySelectorAll('.section');
            sections.forEach((section, index) => {{
                if (index > 0) {{
                    section.style.display = 'none';
                }}
            }});
        }}

        // Animation au scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {{
            const st = window.pageYOffset || document.documentElement.scrollTop;
            const progressBar = document.getElementById('progressBar');
            
            if (st > lastScrollTop) {{
                // Scrolling down
                progressBar.style.opacity = '0.3';
            }} else {{
                // Scrolling up
                progressBar.style.opacity = '1';
            }}
            lastScrollTop = st <= 0 ? 0 : st;
        }});

        // Smooth scroll pour les ancres
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
            anchor.addEventListener('click', function (e) {{
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {{
                    target.scrollIntoView({{
                        behavior: 'smooth',
                        block: 'start'
                    }});
                }}
            }});
        }});

        // Animation de chargement initial
        window.addEventListener('load', function() {{
            document.body.classList.add('loaded');
            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = '100%';
            setTimeout(() => {{
                progressBar.style.width = '0%';
            }}, 1000);
        }});
    </script>
</body>
</html>"""
    
    return html_content

def format_content_with_highlights(content):
    """
    Formate le contenu avec des highlights HTML appropriés
    """
    if not content:
        return ""
    
    # Remplacer les retours à la ligne par des <br>
    formatted = content.replace('\n', '<br>')
    
    # Ajouter des puces pour les listes
    lines = formatted.split('<br>')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if line.startswith('- ') or line.startswith('• '):
            line = '• ' + line[2:]
        
        # Ajouter des highlights pour certains mots-clés
        if any(word in line.lower() for word in ['urgent', 'urgence', 'immédiat']):
            line = f'<span class="urgent">{line}</span>'
        elif any(word in line.lower() for word in ['important', 'essentiel', 'clé']):
            line = f'<span class="highlight">{line}</span>'
        elif any(word in line.lower() for word in ['attention', 'précaution', 'risque']):
            line = f'<span class="warning">{line}</span>'
        elif 'OSCE' in line:
            line = f'<div class="osce-tip">{line}</div>'
        
        formatted_lines.append(line)
    
    return '<br>'.join(formatted_lines)

# Configuration des spécialités
specialties = [
    {
        'name': 'Gynécologie',
        'json_file': '/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/gynecologie_ecos.json',
        'sections': 10,
        'pathologies': 35,
        'icon': '🤰',
        'output_file': '/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Gynecologie_revisions.html'
    },
    {
        'name': 'Chirurgie',
        'json_file': '/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/chirurgie_ecos.json',
        'sections': 14,
        'pathologies': 37,
        'icon': '🔪',
        'output_file': '/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Chirurgie_revisions.html'
    },
    {
        'name': 'Dermatologie',
        'json_file': '/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/json_files/dermatologie_ecos.json',
        'sections': 10,
        'pathologies': 28,
        'icon': '🔬',
        'output_file': '/Users/damienfulliquet/Documents/-Medecine/-EXAMEN_FEDERAL/-ECOS_2025/-SSP/Cas cliniques traduits/Traduits/HTML/_ECOS_Dermatologie_revisions.html'
    }
]

# Générer les fichiers harmonisés
for spec in specialties:
    print(f"Génération du fichier {spec['name']}...")
    html_content = create_harmonized_html(
        spec['name'],
        spec['json_file'],
        spec['sections'],
        spec['pathologies'],
        spec['icon']
    )
    
    with open(spec['output_file'], 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Fichier {spec['name']} généré avec succès!")

print("\n✨ Harmonisation terminée avec succès!")