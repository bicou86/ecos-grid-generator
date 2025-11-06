#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tableau de bord interactif pour l'exploration et l'utilisation pédagogique des cas ECOS
Génère un fichier HTML interactif avec filtres et recherche
"""

import pandas as pd
import json
from datetime import datetime

# Configuration
INPUT_FILE = '/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/ECOSAnciens_cas_2011-2025_HARMONISE.xlsx'
OUTPUT_FILE = '/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/tableau_bord_ecos.html'

def load_data():
    """Charge les données harmonisées"""
    try:
        df = pd.read_excel(INPUT_FILE, sheet_name='Données harmonisées')
        print(f"✅ Données chargées : {len(df)} cas")
        return df
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return None

def prepare_data_for_json(df):
    """Prépare les données pour l'export JSON"""
    # Colonnes à inclure dans le tableau de bord
    columns_to_keep = [
        'Année', 'Catégorie', 'SSP',
        'Suspicion diagnostic principale',
        'Suspicion diagnostic principale_standardise',
        'Suspicion diagnostic principale_categorie',
        'Diagnstic principal générique',
        'Diagnostics différentiels',
        'Description',
        'Anamnèse',
        'Diagnostics_additionnels'
    ]

    # Garder seulement les colonnes existantes
    columns_to_keep = [col for col in columns_to_keep if col in df.columns]
    df_export = df[columns_to_keep].copy()

    # Remplacer NaN par des chaînes vides pour JSON
    df_export = df_export.fillna('')

    # Ajouter un ID unique
    df_export['id'] = range(1, len(df_export) + 1)

    # Convertir en dictionnaire pour JSON
    data = df_export.to_dict('records')

    return data

def create_dashboard_html(data):
    """Crée le tableau de bord HTML interactif"""

    html_template = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de Bord ECOS - Cas Harmonisés (2011-2025)</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #2d3748;
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .emoji {
            font-size: 1.2em;
        }

        .subtitle {
            color: #718096;
            font-size: 1.1em;
            margin-bottom: 20px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .filters {
            background: white;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .filter-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
        }

        .filter-group label {
            color: #4a5568;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .filter-group input,
        .filter-group select {
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1em;
            transition: all 0.3s;
        }

        .filter-group input:focus,
        .filter-group select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .btn-export {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .results {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }

        .results-count {
            color: #4a5568;
            font-size: 1.1em;
        }

        .results-count strong {
            color: #667eea;
            font-size: 1.2em;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            color: #2d3748;
        }

        tr:hover {
            background: #f7fafc;
        }

        .case-details {
            display: none;
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .case-details.active {
            display: block;
        }

        .detail-row {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 15px;
            margin-bottom: 10px;
        }

        .detail-label {
            font-weight: 600;
            color: #4a5568;
        }

        .detail-value {
            color: #2d3748;
        }

        .category-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .category-cardiovasculaire { background: #fed7d7; color: #742a2a; }
        .category-neurologie { background: #feebc8; color: #744210; }
        .category-pneumologie { background: #e6fffa; color: #234e52; }
        .category-psychiatrie { background: #e9d8fd; color: #44337a; }
        .category-infectiologie { background: #fed7e2; color: #702459; }
        .category-gastro { background: #fef5e7; color: #783f04; }
        .category-rhumatologie { background: #d6f5d6; color: #22543d; }
        .category-endocrinologie { background: #bee3f8; color: #2c5282; }
        .category-dermatologie { background: #fbb6ce; color: #702459; }
        .category-autres { background: #e2e8f0; color: #4a5568; }

        .clickable {
            cursor: pointer;
            transition: all 0.3s;
        }

        .clickable:hover {
            background: #edf2f7;
        }

        .empty-description {
            color: #a0aec0;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .filter-row {
                grid-template-columns: 1fr;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            table {
                font-size: 0.9em;
            }

            th, td {
                padding: 10px;
            }
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #718096;
        }

        .no-results {
            text-align: center;
            padding: 60px;
            color: #718096;
        }

        .no-results .emoji {
            font-size: 3em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">🏥</span> Tableau de Bord ECOS</h1>
            <p class="subtitle">Exploration et analyse des cas cliniques harmonisés (2011-2025)</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="totalCases">0</div>
                    <div class="stat-label">Cas totaux</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="totalCategories">0</div>
                    <div class="stat-label">Catégories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="totalYears">0</div>
                    <div class="stat-label">Années couvertes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="avgPerYear">0</div>
                    <div class="stat-label">Moyenne par année</div>
                </div>
            </div>
        </div>

        <div class="filters">
            <h2 style="color: #2d3748; margin-bottom: 20px;">🔍 Filtres de recherche</h2>

            <div class="filter-row">
                <div class="filter-group">
                    <label for="searchInput">Recherche textuelle</label>
                    <input type="text" id="searchInput" placeholder="Rechercher dans tous les champs...">
                </div>

                <div class="filter-group">
                    <label for="yearFilter">Année</label>
                    <select id="yearFilter">
                        <option value="">Toutes les années</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="categoryFilter">Catégorie diagnostique</label>
                    <select id="categoryFilter">
                        <option value="">Toutes les catégories</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="diagnosticFilter">Diagnostic principal</label>
                    <select id="diagnosticFilter">
                        <option value="">Tous les diagnostics</option>
                    </select>
                </div>
            </div>

            <div class="button-group">
                <button class="btn-primary" onclick="applyFilters()">🔎 Appliquer les filtres</button>
                <button class="btn-secondary" onclick="resetFilters()">↻ Réinitialiser</button>
                <button class="btn-export" onclick="exportResults()">📥 Exporter les résultats (CSV)</button>
            </div>
        </div>

        <div class="results">
            <div class="results-header">
                <h2 style="color: #2d3748;">📋 Résultats</h2>
                <div class="results-count">
                    <strong id="resultsCount">0</strong> cas trouvés
                </div>
            </div>

            <div id="resultsContainer">
                <div class="loading">⏳ Chargement des données...</div>
            </div>
        </div>
    </div>

    <script>
        // Données des cas ECOS
        const casesData = """ + json.dumps(data, ensure_ascii=False) + """;

        let filteredData = [...casesData];

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            initializeFilters();
            updateStatistics();
            displayResults(casesData);
        });

        function initializeFilters() {
            // Années
            const years = [...new Set(casesData.map(c => c['Année']))].sort();
            const yearSelect = document.getElementById('yearFilter');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            // Catégories
            const categories = [...new Set(casesData.map(c => c['Suspicion diagnostic principale_categorie']))].filter(c => c).sort();
            const categorySelect = document.getElementById('categoryFilter');
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });

            // Diagnostics
            const diagnostics = [...new Set(casesData.map(c => c['Suspicion diagnostic principale_standardise'] || c['Suspicion diagnostic principale']))].filter(d => d).sort();
            const diagnosticSelect = document.getElementById('diagnosticFilter');
            diagnostics.forEach(diag => {
                const option = document.createElement('option');
                option.value = diag;
                option.textContent = diag;
                diagnosticSelect.appendChild(option);
            });
        }

        function updateStatistics() {
            document.getElementById('totalCases').textContent = casesData.length;

            const categories = [...new Set(casesData.map(c => c['Suspicion diagnostic principale_categorie']))].filter(c => c);
            document.getElementById('totalCategories').textContent = categories.length;

            const years = [...new Set(casesData.map(c => c['Année']))];
            document.getElementById('totalYears').textContent = years.length;

            document.getElementById('avgPerYear').textContent = Math.round(casesData.length / years.length);
        }

        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const yearFilter = document.getElementById('yearFilter').value;
            const categoryFilter = document.getElementById('categoryFilter').value;
            const diagnosticFilter = document.getElementById('diagnosticFilter').value;

            filteredData = casesData.filter(cas => {
                // Filtre de recherche textuelle
                if (searchTerm) {
                    const searchableText = Object.values(cas).join(' ').toLowerCase();
                    if (!searchableText.includes(searchTerm)) return false;
                }

                // Filtre année
                if (yearFilter && cas['Année'] != yearFilter) return false;

                // Filtre catégorie
                if (categoryFilter && cas['Suspicion diagnostic principale_categorie'] !== categoryFilter) return false;

                // Filtre diagnostic
                if (diagnosticFilter) {
                    const diag = cas['Suspicion diagnostic principale_standardise'] || cas['Suspicion diagnostic principale'];
                    if (diag !== diagnosticFilter) return false;
                }

                return true;
            });

            displayResults(filteredData);
        }

        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('yearFilter').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('diagnosticFilter').value = '';

            filteredData = [...casesData];
            displayResults(casesData);
        }

        function displayResults(data) {
            const container = document.getElementById('resultsContainer');
            document.getElementById('resultsCount').textContent = data.length;

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="no-results">
                        <div class="emoji">🔍</div>
                        <h3>Aucun résultat trouvé</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                `;
                return;
            }

            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Année</th>
                            <th>Catégorie</th>
                            <th>Diagnostic principal</th>
                            <th>SSP</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(cas => {
                const category = cas['Suspicion diagnostic principale_categorie'] || 'Autres';
                const categoryClass = 'category-' + category.toLowerCase().replace(/[^a-z]/g, '');
                const diagnostic = cas['Suspicion diagnostic principale_standardise'] || cas['Suspicion diagnostic principale'] || '';
                const description = cas['Description'] || '<span class="empty-description">Pas de description</span>';

                html += `
                    <tr class="clickable" onclick="toggleDetails(${cas.id})">
                        <td>${cas.id}</td>
                        <td>${cas['Année']}</td>
                        <td><span class="category-badge ${categoryClass}">${category}</span></td>
                        <td><strong>${diagnostic}</strong></td>
                        <td>${cas['SSP'] || '-'}</td>
                        <td>${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</td>
                    </tr>
                    <tr>
                        <td colspan="6" style="padding: 0;">
                            <div id="details-${cas.id}" class="case-details">
                                <div class="detail-row">
                                    <div class="detail-label">Diagnostic générique:</div>
                                    <div class="detail-value">${cas['Diagnstic principal générique'] || '-'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Diagnostics différentiels:</div>
                                    <div class="detail-value">${cas['Diagnostics différentiels'] || '-'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Diagnostics additionnels:</div>
                                    <div class="detail-value">${cas['Diagnostics_additionnels'] || '-'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Description complète:</div>
                                    <div class="detail-value">${cas['Description'] || '-'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Anamnèse:</div>
                                    <div class="detail-value">${cas['Anamnèse'] || '-'}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            container.innerHTML = html;
        }

        function toggleDetails(id) {
            const details = document.getElementById(`details-${id}`);
            if (details) {
                details.classList.toggle('active');
            }
        }

        function exportResults() {
            let csv = 'ID,Année,Catégorie,Diagnostic principal,SSP,Description,Anamnèse\\n';

            filteredData.forEach(cas => {
                const row = [
                    cas.id,
                    cas['Année'],
                    cas['Suspicion diagnostic principale_categorie'] || '',
                    (cas['Suspicion diagnostic principale_standardise'] || cas['Suspicion diagnostic principale'] || '').replace(/"/g, '""'),
                    (cas['SSP'] || '').replace(/"/g, '""'),
                    (cas['Description'] || '').replace(/"/g, '""'),
                    (cas['Anamnèse'] || '').replace(/"/g, '""')
                ].map(field => `"${field}"`).join(',');

                csv += row + '\\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `ecos_cases_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Permettre la recherche en temps réel
        document.getElementById('searchInput')?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    </script>
</body>
</html>"""

    return html_template

def main():
    """Fonction principale"""
    print("\n📊 CRÉATION DU TABLEAU DE BORD INTERACTIF")
    print("="*60)

    # Charger les données
    df = load_data()
    if df is None:
        return

    # Préparer les données pour JSON
    print("  📦 Préparation des données...")
    data = prepare_data_for_json(df)

    # Créer le HTML
    print("  🎨 Génération du tableau de bord...")
    html_content = create_dashboard_html(data)

    # Sauvegarder
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"\n  ✅ Tableau de bord créé : {OUTPUT_FILE}")
    print("\n" + "="*60)
    print("✨ TABLEAU DE BORD PRÊT À L'UTILISATION!")
    print("   Ouvrez le fichier dans votre navigateur pour l'explorer")
    print("="*60)

if __name__ == "__main__":
    main()